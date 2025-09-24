from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import sys
import joblib
from datetime import datetime, timedelta
import traceback

app = Flask(__name__)
CORS(app)

# ML Model Functions
def load_models(models_dir='x:\\vortexa\\VORTEXA_2.0-Cors_pe_Cors\\models\\trained_models'):
    try:
        if not os.path.exists(models_dir):
            print(f"ERROR: Models directory not found at {models_dir}")
            return None, None, None
            
        duration_files = [f for f in os.listdir(models_dir) if f.startswith('duration_')]
        stages = [f.split('_')[1] for f in duration_files]
        
        # Load duration models
        duration_models = {}
        for stage in stages:
            model_path = f"{models_dir}/duration_{stage}_model.pkl"
            duration_models[stage] = joblib.load(model_path)
        
        # Load irrigation models
        irrigation_models = {}
        for stage in stages:
            model_path = f"{models_dir}/irrigation_{stage}_model.pkl"
            irrigation_models[stage] = joblib.load(model_path)
        
        # Load feature columns
        feature_path = f"{models_dir}/feature_columns.pkl"
        feature_columns = joblib.load(feature_path)
        
        return duration_models, irrigation_models, feature_columns
    
    except Exception as e:
        print(f"Error loading models: {e}")
        traceback.print_exc()
        return None, None, None

def predict_crop_timeline_and_irrigation(crop_type, sow_date_str, weather_data, soil_data, 
                                         all_feature_cols, duration_models, irrigation_models):
    
    stages = list(duration_models.keys())
    sow_date = datetime.strptime(sow_date_str, '%Y-%m-%d')
    
    # Create the base input dictionary
    input_data = {
        'Year': sow_date.year,
        'Sow_Month': sow_date.month,
        'Temp_C': weather_data['temperature'],
        'Rainfall_mm': weather_data['rainfall'],
        'Humidity_%': weather_data['humidity'],
        'SoilMoist_%': soil_data['moisture']
    }
    
    new_input_df = pd.DataFrame([input_data])
    for col in all_feature_cols:
        if col not in new_input_df.columns:
             new_input_df[col] = 0
             
    # Set the specific crop column to 1
    crop_col_name = f'Crop_{crop_type}'
    if crop_col_name not in all_feature_cols:
        available_crops = [col.split('_')[1] for col in all_feature_cols if col.startswith('Crop_')]
        raise ValueError(f"Crop type '{crop_type}' not found. Available crops: {available_crops}")
        
    new_input_df[crop_col_name] = 1
    new_input_df = new_input_df[all_feature_cols]

    pred_durs = {
        stage: max(1, int(duration_models[stage].predict(new_input_df)[0])) 
        for stage in stages
    }
    
    pred_irrigation = {
        stage: max(0.1, float(irrigation_models[stage].predict(new_input_df)[0]))
        for stage in stages
    }

    # Timeline
    timeline = []
    current = sow_date
    for stage in stages:
        dur = pred_durs[stage]
        end = current + timedelta(days=dur)
        timeline.append({
            'Stage': stage,
            'Duration_Days': dur,
            'Start': current.strftime('%Y-%m-%d'),
            'End': end.strftime('%Y-%m-%d'),
            'Irrigation_Need': f"{pred_irrigation[stage]:.2f} lphw"
        })
        current = end

    total_days = sum(pred_durs.values())
    harvest_date = sow_date + timedelta(days=total_days)
    
    # Create irrigation schedule
    irrigation_schedule = []
    current = sow_date
    for stage in stages:
        stage_duration = pred_durs[stage]
        stage_end = current + timedelta(days=stage_duration)
        stage_irrigation = pred_irrigation[stage]
        
        week_start = current
        while week_start < stage_end:
            week_end = min(week_start + timedelta(days=7), stage_end)
            days_in_week = (week_end - week_start).days
            
            weekly_irrigation = stage_irrigation * min(7, days_in_week) / 7
            
            irrigation_schedule.append({
                'Week_Start': week_start.strftime('%Y-%m-%d'),
                'Week_End': week_end.strftime('%Y-%m-%d'),
                'Stage': stage,
                'Irrigation_Need': f"{weekly_irrigation:.2f} lphw"
            })
            
            week_start = week_end

    return {
        'crop': crop_type,
        'sow_date': sow_date.strftime('%Y-%m-%d'),
        'harvest_date': harvest_date.strftime('%Y-%m-%d'),
        'total_duration': total_days,
        'timeline': timeline,
        'irrigation_schedule': irrigation_schedule
    }

def generate_weather_data(sow_date_str):
    """Generate realistic weather data based on sowing date and season"""
    sow_date = datetime.strptime(sow_date_str, '%Y-%m-%d')
    month = sow_date.month
    
    # Seasonal weather patterns
    if month in [12, 1, 2]:  # Winter
        temp_base = 20
        rainfall_base = 50
        humidity_base = 60
    elif month in [3, 4, 5]:  # Spring
        temp_base = 25
        rainfall_base = 80
        humidity_base = 65
    elif month in [6, 7, 8]:  # Summer
        temp_base = 32
        rainfall_base = 120
        humidity_base = 75
    else:  # Autumn [9, 10, 11]
        temp_base = 28
        rainfall_base = 70
        humidity_base = 70
    
    # Add some randomness
    return {
        'temperature': temp_base + np.random.uniform(-3, 3),
        'rainfall': max(10, rainfall_base + np.random.uniform(-30, 50)),
        'humidity': max(40, min(90, humidity_base + np.random.uniform(-10, 15)))
    }

def generate_soil_data():
    """Generate realistic soil data"""
    return {
        'moisture': np.random.uniform(20, 35),  # Soil moisture percentage
        'nitrogen': np.random.uniform(0.8, 1.5),  # N content
        'phosphorus': np.random.uniform(15, 35),   # P content
        'potassium': np.random.uniform(150, 300),  # K content
        'ph': np.random.uniform(6.0, 7.5)         # pH value
    }

# Load models at startup
print("Loading ML models...")
DURATION_MODELS, IRRIGATION_MODELS, FEATURE_COLUMNS = load_models()

if DURATION_MODELS is None:
    print("WARNING: Could not load ML models. Crop prediction will not work properly.")

# Example static data for demo; replace with real model calls
crop_data_example = {
    "growth_stages": [
        {"stage": "Initial Stage", "duration_days": 15, "Kc": 0.4},
        {"stage": "Development Stage", "duration_days": 25, "Kc": "0.4-1.15"},
        {"stage": "Mid-season Stage", "duration_days": 40, "Kc": 1.15},
        {"stage": "Late-season Stage", "duration_days": 30, "Kc": 0.4},
    ],
    "irrigation_schedule": [
        {"date": "2025-12-13", "amount_mm": 25.0, "note": "Automatic irrigation based on soil water deficit"},
        {"date": "2025-12-18", "amount_mm": 25.0, "note": "Automatic irrigation based on soil water deficit"}
    ],
    "irrigation_total_mm": 400.0,
    "fertilizer_schedule": [
        {"date": "2025-11-15", "nutrient": "N", "amount_kg_per_ha": 60, "application": "basal"},
        {"date": "2025-11-15", "nutrient": "P", "amount_kg_per_ha": 60, "application": "basal"},
        {"date": "2025-12-05", "nutrient": "N", "amount_kg_per_ha": 40, "application": "top_dress"},
    ],
    "fertilizer_totals": {"N": 140, "P": 60, "K": 40},
    "water_balance_summary": {
        "total_precipitation_mm": 194.0,
        "total_irrigation_mm": 400.0,
        "total_ET_mm": 608.2
    }
}

@app.route('/')
def home():
    return jsonify({"message": "Crop Prediction API is running!"})

@app.route('/predict-crop-cycle', methods=['POST'])
def predict_crop_cycle():
    """
    Predicts crop lifecycle based on crop type and sowing date.
    Automatically generates weather and soil data.
    """
    try:
        data = request.json
        crop_type = data.get('crop_type')
        sowing_date = data.get('sowing_date')

        if not crop_type or not sowing_date:
            return jsonify({'error': 'Please provide crop_type and sowing_date'}), 400

        # Check if models are loaded
        if DURATION_MODELS is None or IRRIGATION_MODELS is None or FEATURE_COLUMNS is None:
            return jsonify({'error': 'ML models not available. Please check server logs.'}), 500

        # Generate weather and soil data
        weather_data = generate_weather_data(sowing_date)
        soil_data = generate_soil_data()

        # Make prediction
        result = predict_crop_timeline_and_irrigation(
            crop_type=crop_type,
            sow_date_str=sowing_date,
            weather_data=weather_data,
            soil_data=soil_data,
            all_feature_cols=FEATURE_COLUMNS,
            duration_models=DURATION_MODELS,
            irrigation_models=IRRIGATION_MODELS
        )

        # Add generated data to response
        result['generated_data'] = {
            'weather': weather_data,
            'soil': soil_data
        }

        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error in crop prediction: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error occurred'}), 500

@app.route('/crop-info', methods=['POST'])
def crop_info():
    """
    Accepts JSON input with crop type and planting date,
    runs prediction (placeholder),
    returns crop growth stages, irrigation, fertilizer, and water balance info.
    """
    data = request.json
    crop_type = data.get('crop_type')
    planting_date = data.get('planting_date')

    if not crop_type or not planting_date:
        return jsonify({'error': 'Please provide crop_type and planting_date'}), 400

    # TODO: Replace with real model inference based on input parameters
    # For now, return static example data
    return jsonify(crop_data_example)


@app.route('/growth-stages', methods=['GET'])
def get_growth_stages():
    return jsonify(crop_data_example["growth_stages"])

@app.route('/irrigation-schedule', methods=['GET'])
def get_irrigation_schedule():
    return jsonify({
        "schedule": crop_data_example["irrigation_schedule"],
        "total_irrigation_mm": crop_data_example["irrigation_total_mm"]
    })

@app.route('/fertilizer-schedule', methods=['GET'])
def get_fertilizer_schedule():
    return jsonify({
        "schedule": crop_data_example["fertilizer_schedule"],
        "totals": crop_data_example["fertilizer_totals"]
    })

@app.route('/water-balance-summary', methods=['GET'])
def get_water_balance_summary():
    return jsonify(crop_data_example["water_balance_summary"])

if __name__ == '__main__':
    app.run(debug=True, port=5002)
