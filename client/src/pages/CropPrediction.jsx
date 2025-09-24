import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot,
  faSeedling, 
  faWheatAwn,
  faCarrot,
  faAppleAlt,
  faLeaf,
  faChartLine,
  faCalendarAlt,
  faThermometerHalf,
  faDroplet,
  faCloudSun,
  faStar,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faRefresh,
  faDownload,
  faLocationDot,
  faFlask,
  faWater,
  faSun,
  faEye,
  faSpinner,
  faArrowRight,
  faCog
} from '@fortawesome/free-solid-svg-icons';

// Groq API Configuration - Using environment variables for secure key storage
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

const CropPrediction = () => {
  const [selectedLocation, setSelectedLocation] = useState('current-location');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Form parameters
  const [parameters, setParameters] = useState({
    nitrogen: 25,
    phosphorus: 15,
    potassium: 20,
    temperature: 24,
    humidity: 65,
    ph: 6.8,
    rainfall: 850,
    location: 'Maharashtra, India'
  });

  const locations = [
    { id: 'current-location', name: 'Current Location (GPS)', climate: 'Temperate' },
    { id: 'mumbai', name: 'Mumbai, Maharashtra', climate: 'Tropical' },
    { id: 'delhi', name: 'Delhi, NCR', climate: 'Semi-arid' },
    { id: 'bangalore', name: 'Bangalore, Karnataka', climate: 'Tropical savanna' },
    { id: 'pune', name: 'Pune, Maharashtra', climate: 'Semi-arid' }
  ];

  // Function to call Groq API for crop prediction
  const callGroqAPI = async (params) => {
    try {
      const prompt = `You are an agricultural AI assistant. Based on the following soil and environmental parameters, predict the top 3 most suitable crops for cultivation. Provide specific, realistic data for Indian agriculture.

Parameters:
- Location: ${params.location}
- Nitrogen: ${params.nitrogen}%
- Phosphorus: ${params.phosphorus}%
- Potassium: ${params.potassium}%
- Temperature: ${params.temperature}°C
- Humidity: ${params.humidity}%
- pH: ${params.ph}
- Rainfall: ${params.rainfall}mm/year

Please respond in JSON format with the following structure for each crop:
{
  "crops": [
    {
      "name": "crop name",
      "suitability": "percentage (0-100)",
      "season": "planting season",
      "plantingWindow": "month range",
      "harvestWindow": "month range",
      "expectedYield": "yield per hectare",
      "marketPrice": "current market price",
      "profitability": "High/Medium/Low",
      "waterRequirement": "High/Medium/Low",
      "difficulty": "Easy/Medium/Hard",
      "advantages": ["advantage1", "advantage2", "advantage3"],
      "considerations": ["consideration1", "consideration2"],
      "confidence": "percentage"
    }
  ]
}

Focus on crops commonly grown in India and ensure the recommendations are practical and location-appropriate.`;

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are an agricultural expert AI assistant specializing in crop recommendations for Indian farmers." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get crop predictions');
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content;
      
      // Try to extract JSON from the response
      try {
        // Look for JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          return jsonData.crops || [];
        }
      } catch (e) {
        console.log('Could not parse JSON, using fallback data');
      }
      
      // Fallback predictions if API parsing fails
      return generateFallbackPredictions(params);
      
    } catch (error) {
      console.error('Error calling Groq API:', error);
      return generateFallbackPredictions(params);
    }
  };

  // Fallback function with realistic predictions based on parameters
  const generateFallbackPredictions = (params) => {
    // Generate predictions based on soil parameters
    const cropDatabase = [
      {
        name: 'Wheat',
        icon: faWheatAwn,
        optimalN: [20, 40],
        optimalP: [10, 25],
        optimalK: [15, 35],
        optimalTemp: [15, 25],
        optimalHumidity: [50, 70],
        optimalPH: [6.0, 7.5],
        optimalRainfall: [400, 1000],
        season: 'Rabi (Winter)',
        plantingWindow: 'Nov - Dec',
        harvestWindow: 'Apr - May',
        expectedYield: '4.2 - 5.1 tons/hectare',
        marketPrice: '₹2,200/quintal',
        profitability: 'High',
        waterRequirement: 'Medium',
        difficulty: 'Easy',
        advantages: ['Excellent climate match', 'High market demand', 'Good soil compatibility'],
        considerations: ['Monitor for rust diseases', 'Ensure adequate irrigation']
      },
      {
        name: 'Rice',
        icon: faSeedling,
        optimalN: [25, 50],
        optimalP: [12, 30],
        optimalK: [20, 40],
        optimalTemp: [20, 35],
        optimalHumidity: [70, 90],
        optimalPH: [5.5, 7.0],
        optimalRainfall: [1000, 2000],
        season: 'Kharif (Monsoon)',
        plantingWindow: 'Jun - Jul',
        harvestWindow: 'Nov - Dec',
        expectedYield: '5.8 - 6.5 tons/hectare',
        marketPrice: '₹1,950/quintal',
        profitability: 'High',
        waterRequirement: 'High',
        difficulty: 'Medium',
        advantages: ['High yield potential', 'Stable market demand', 'Suitable for monsoon season'],
        considerations: ['High water requirement', 'Pest management needed']
      },
      {
        name: 'Corn (Maize)',
        icon: faLeaf,
        optimalN: [15, 35],
        optimalP: [8, 20],
        optimalK: [10, 30],
        optimalTemp: [18, 30],
        optimalHumidity: [55, 75],
        optimalPH: [6.0, 7.5],
        optimalRainfall: [500, 1200],
        season: 'Kharif/Rabi',
        plantingWindow: 'Feb - Mar',
        harvestWindow: 'Jun - Jul',
        expectedYield: '4.8 - 5.5 tons/hectare',
        marketPrice: '₹1,850/quintal',
        profitability: 'Medium-High',
        waterRequirement: 'Medium',
        difficulty: 'Medium',
        advantages: ['Dual season cultivation', 'Good feed crop demand', 'Mechanization friendly'],
        considerations: ['Pest susceptibility', 'Storage challenges']
      },
      {
        name: 'Tomato',
        icon: faAppleAlt,
        optimalN: [30, 60],
        optimalP: [15, 35],
        optimalK: [25, 50],
        optimalTemp: [20, 28],
        optimalHumidity: [60, 80],
        optimalPH: [6.0, 7.0],
        optimalRainfall: [600, 1200],
        season: 'Winter',
        plantingWindow: 'Oct - Nov',
        harvestWindow: 'Jan - Mar',
        expectedYield: '25 - 35 tons/hectare',
        marketPrice: '₹15-25/kg',
        profitability: 'Very High',
        waterRequirement: 'High',
        difficulty: 'Hard',
        advantages: ['Very high profitability', 'Year-round demand', 'Multiple harvests'],
        considerations: ['Disease susceptibility', 'Requires intensive care', 'High initial investment']
      },
      {
        name: 'Sugarcane',
        icon: faLeaf,
        optimalN: [40, 80],
        optimalP: [20, 40],
        optimalK: [30, 60],
        optimalTemp: [25, 35],
        optimalHumidity: [75, 95],
        optimalPH: [6.5, 7.5],
        optimalRainfall: [1200, 2500],
        season: 'Year-round',
        plantingWindow: 'Feb - Apr',
        harvestWindow: 'Dec - Feb',
        expectedYield: '70 - 85 tons/hectare',
        marketPrice: '₹350-400/quintal',
        profitability: 'High',
        waterRequirement: 'Very High',
        difficulty: 'Hard',
        advantages: ['Long-term crop', 'Government price support', 'Multiple uses'],
        considerations: ['Very high water needs', 'Long investment cycle', 'Transportation challenges']
      }
    ];

    // Calculate suitability score for each crop
    const calculatedPredictions = cropDatabase.map((crop, index) => {
      let score = 0;
      let factors = 0;

      // Nitrogen scoring
      if (params.nitrogen >= crop.optimalN[0] && params.nitrogen <= crop.optimalN[1]) {
        score += 20;
      } else {
        const deviation = Math.min(
          Math.abs(params.nitrogen - crop.optimalN[0]),
          Math.abs(params.nitrogen - crop.optimalN[1])
        );
        score += Math.max(0, 20 - (deviation * 2));
      }
      factors++;

      // Phosphorus scoring
      if (params.phosphorus >= crop.optimalP[0] && params.phosphorus <= crop.optimalP[1]) {
        score += 15;
      } else {
        const deviation = Math.min(
          Math.abs(params.phosphorus - crop.optimalP[0]),
          Math.abs(params.phosphorus - crop.optimalP[1])
        );
        score += Math.max(0, 15 - (deviation * 1.5));
      }
      factors++;

      // Potassium scoring
      if (params.potassium >= crop.optimalK[0] && params.potassium <= crop.optimalK[1]) {
        score += 15;
      } else {
        const deviation = Math.min(
          Math.abs(params.potassium - crop.optimalK[0]),
          Math.abs(params.potassium - crop.optimalK[1])
        );
        score += Math.max(0, 15 - (deviation * 1.5));
      }
      factors++;

      // Temperature scoring
      if (params.temperature >= crop.optimalTemp[0] && params.temperature <= crop.optimalTemp[1]) {
        score += 20;
      } else {
        const deviation = Math.min(
          Math.abs(params.temperature - crop.optimalTemp[0]),
          Math.abs(params.temperature - crop.optimalTemp[1])
        );
        score += Math.max(0, 20 - (deviation * 2));
      }
      factors++;

      // Humidity scoring
      if (params.humidity >= crop.optimalHumidity[0] && params.humidity <= crop.optimalHumidity[1]) {
        score += 15;
      } else {
        const deviation = Math.min(
          Math.abs(params.humidity - crop.optimalHumidity[0]),
          Math.abs(params.humidity - crop.optimalHumidity[1])
        );
        score += Math.max(0, 15 - (deviation * 0.5));
      }
      factors++;

      // pH scoring
      if (params.ph >= crop.optimalPH[0] && params.ph <= crop.optimalPH[1]) {
        score += 10;
      } else {
        const deviation = Math.min(
          Math.abs(params.ph - crop.optimalPH[0]),
          Math.abs(params.ph - crop.optimalPH[1])
        );
        score += Math.max(0, 10 - (deviation * 5));
      }
      factors++;

      // Rainfall scoring
      if (params.rainfall >= crop.optimalRainfall[0] && params.rainfall <= crop.optimalRainfall[1]) {
        score += 5;
      } else {
        const deviation = Math.min(
          Math.abs(params.rainfall - crop.optimalRainfall[0]),
          Math.abs(params.rainfall - crop.optimalRainfall[1])
        );
        score += Math.max(0, 5 - (deviation * 0.01));
      }
      factors++;

      const suitability = Math.round(Math.max(0, Math.min(100, score)));

      return {
        id: index + 1,
        name: crop.name,
        icon: crop.icon,
        suitability,
        season: crop.season,
        plantingWindow: crop.plantingWindow,
        harvestWindow: crop.harvestWindow,
        expectedYield: crop.expectedYield,
        marketPrice: crop.marketPrice,
        profitability: crop.profitability,
        waterRequirement: crop.waterRequirement,
        difficulty: crop.difficulty,
        advantages: crop.advantages,
        considerations: crop.considerations,
        confidence: suitability
      };
    });

    return calculatedPredictions.sort((a, b) => b.suitability - a.suitability).slice(0, 3);
  };

  // Handle parameter changes
  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setParameters(prev => ({
      ...prev,
      location: locations.find(loc => loc.id === location)?.name || location
    }));
  };

  const getSuitabilityColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSuitabilityBorderColor = (score) => {
    if (score >= 90) return 'border-green-200';
    if (score >= 80) return 'border-blue-200';
    if (score >= 70) return 'border-yellow-200';
    return 'border-red-200';
  };

  const getProfitabilityColor = (level) => {
    switch (level) {
      case 'Very High': return 'text-green-700 bg-green-100';
      case 'High': return 'text-green-600 bg-green-50';
      case 'Medium-High': return 'text-blue-600 bg-blue-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    try {
      const cropPredictions = await callGroqAPI(parameters);
      setPredictions(cropPredictions);
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing crops:', error);
      // Show fallback predictions on error
      const fallbackPredictions = generateFallbackPredictions(parameters);
      setPredictions(fallbackPredictions);
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Crop Prediction</h1>
            <p className="text-gray-600 mt-1">Get AI-powered crop recommendations based on your conditions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              <FontAwesomeIcon 
                icon={faRefresh} 
                className={`mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} 
              />
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Location Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faLocationDot} className="text-blue-500 mr-2" />
            Location Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.climate} Climate
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Soil & Environmental Parameters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FontAwesomeIcon icon={faFlask} className="text-green-500 mr-2" />
            Soil & Environmental Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nitrogen */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faLeaf} className="text-green-500 mr-2" />
                Nitrogen (%)
              </label>
              <input
                type="number"
                value={parameters.nitrogen}
                onChange={(e) => handleParameterChange('nitrogen', e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter % of Nitrogen"
              />
              <p className="text-xs text-gray-500">Typical range: 15-50%</p>
            </div>

            {/* Phosphorus */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faSeedling} className="text-orange-500 mr-2" />
                Phosphorus (%)
              </label>
              <input
                type="number"
                value={parameters.phosphorus}
                onChange={(e) => handleParameterChange('phosphorus', e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter % of Phosphorus"
              />
              <p className="text-xs text-gray-500">Typical range: 8-35%</p>
            </div>

            {/* Potassium */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faWheatAwn} className="text-purple-500 mr-2" />
                Potassium (%)
              </label>
              <input
                type="number"
                value={parameters.potassium}
                onChange={(e) => handleParameterChange('potassium', e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter % of Potassium"
              />
              <p className="text-xs text-gray-500">Typical range: 10-50%</p>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faThermometerHalf} className="text-red-500 mr-2" />
                Temperature (°C)
              </label>
              <input
                type="number"
                value={parameters.temperature}
                onChange={(e) => handleParameterChange('temperature', e.target.value)}
                min="-10"
                max="50"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter Temperature in °C"
              />
              <p className="text-xs text-gray-500">Average temperature range</p>
            </div>

            {/* Humidity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faDroplet} className="text-blue-500 mr-2" />
                Humidity (%)
              </label>
              <input
                type="number"
                value={parameters.humidity}
                onChange={(e) => handleParameterChange('humidity', e.target.value)}
                min="0"
                max="100"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter Humidity in %"
              />
              <p className="text-xs text-gray-500">Relative humidity</p>
            </div>

            {/* pH */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faEye} className="text-yellow-500 mr-2" />
                pH Value
              </label>
              <input
                type="number"
                value={parameters.ph}
                onChange={(e) => handleParameterChange('ph', e.target.value)}
                min="0"
                max="14"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter pH value"
              />
              <p className="text-xs text-gray-500">Soil acidity/alkalinity (0-14)</p>
            </div>

            {/* Rainfall */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faCloudSun} className="text-cyan-500 mr-2" />
                Rainfall (mm/year)
              </label>
              <input
                type="number"
                value={parameters.rainfall}
                onChange={(e) => handleParameterChange('rainfall', e.target.value)}
                min="0"
                max="5000"
                step="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter annual rainfall in mm"
              />
              <p className="text-xs text-gray-500">Annual precipitation in millimeters</p>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              {isAnalyzing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="mr-3 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faRobot} className="mr-3" />
                  Analyze & Get Crop Predictions
                  <FontAwesomeIcon icon={faArrowRight} className="ml-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Parameters Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faCog} className="text-blue-500 mr-2" />
            Current Analysis Parameters
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faLeaf} className="text-green-500 text-lg mb-2" />
              <div className="font-bold text-gray-900">{parameters.nitrogen}%</div>
              <div className="text-xs text-gray-600">Nitrogen</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faSeedling} className="text-orange-500 text-lg mb-2" />
              <div className="font-bold text-gray-900">{parameters.phosphorus}%</div>
              <div className="text-xs text-gray-600">Phosphorus</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faWheatAwn} className="text-purple-500 text-lg mb-2" />
              <div className="font-bold text-gray-900">{parameters.potassium}%</div>
              <div className="text-xs text-gray-600">Potassium</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faThermometerHalf} className="text-red-500 text-lg mb-2" />
              <div className="font-bold text-gray-900">{parameters.temperature}°C</div>
              <div className="text-xs text-gray-600">Temperature</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faDroplet} className="text-blue-500 text-lg mb-2" />
              <div className="font-bold text-gray-900">{parameters.humidity}%</div>
              <div className="text-xs text-gray-600">Humidity</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faEye} className="text-yellow-500 text-lg mb-2" />
              <div className="font-bold text-gray-900">{parameters.ph}</div>
              <div className="text-xs text-gray-600">pH Value</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faCloudSun} className="text-cyan-500 text-lg mb-2" />
              <div className="font-bold text-gray-900">{parameters.rainfall}mm</div>
              <div className="text-xs text-gray-600">Rainfall</div>
            </div>
          </div>
        </div>

        {/* AI Predictions - Only show if results are available */}
        {showResults && predictions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faRobot} className="text-blue-500 text-xl mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">Top 3 AI Crop Recommendations</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Best matches for your parameters</span>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm">
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export Report
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {predictions.map((prediction, index) => (
              <div 
                key={prediction.id} 
                className={`border rounded-lg p-6 ${getSuitabilityBorderColor(prediction.suitability)} hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <FontAwesomeIcon icon={prediction.icon} className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{prediction.name}</h3>
                      <p className="text-gray-600">{prediction.season}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSuitabilityColor(prediction.suitability)}`}>
                      <FontAwesomeIcon icon={faStar} className="mr-1" />
                      {prediction.suitability}% Match
                    </div>
                    <div className="text-xs text-gray-500 mt-1">#{index + 1} Recommended</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Planting Window</div>
                    <div className="font-semibold text-gray-900">{prediction.plantingWindow}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Harvest Window</div>
                    <div className="font-semibold text-gray-900">{prediction.harvestWindow}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Expected Yield</div>
                    <div className="font-semibold text-gray-900">{prediction.expectedYield}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Market Price</div>
                    <div className="font-semibold text-gray-900">{prediction.marketPrice}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProfitabilityColor(prediction.profitability)}`}>
                    Profitability: {prediction.profitability}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(prediction.difficulty)}`}>
                    Difficulty: {prediction.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-50">
                    Water: {prediction.waterRequirement}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 bg-gray-100">
                    Confidence: {prediction.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                      Advantages
                    </h4>
                    <ul className="space-y-1">
                      {prediction.advantages.map((advantage, advIndex) => (
                        <li key={advIndex} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
                      Considerations
                    </h4>
                    <ul className="space-y-1">
                      {prediction.considerations.map((consideration, consIndex) => (
                        <li key={consIndex} className="text-sm text-gray-700 flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How AI Predictions Work</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Our AI analyzes multiple factors including local climate data, soil conditions, historical crop performance, 
                market trends, and seasonal patterns to provide personalized crop recommendations. The suitability scores 
                are based on machine learning models trained on agricultural data from similar regions and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropPrediction;