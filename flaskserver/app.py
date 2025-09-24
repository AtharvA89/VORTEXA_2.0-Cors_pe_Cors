from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
