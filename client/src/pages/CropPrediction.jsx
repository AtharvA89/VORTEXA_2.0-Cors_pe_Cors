import { useState } from 'react';
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
  faDownload
} from '@fortawesome/free-solid-svg-icons';

const CropPrediction = () => {
  const [selectedLocation, setSelectedLocation] = useState('current-location');
  const [selectedSoil, setSelectedSoil] = useState('loamy');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const locations = [
    { id: 'current-location', name: 'Current Location (GPS)', climate: 'Temperate' },
    { id: 'mumbai', name: 'Mumbai, Maharashtra', climate: 'Tropical' },
    { id: 'delhi', name: 'Delhi, NCR', climate: 'Semi-arid' },
    { id: 'bangalore', name: 'Bangalore, Karnataka', climate: 'Tropical savanna' },
    { id: 'pune', name: 'Pune, Maharashtra', climate: 'Semi-arid' }
  ];

  const soilTypes = [
    { id: 'loamy', name: 'Loamy Soil', description: 'Well-draining, fertile' },
    { id: 'clayey', name: 'Clayey Soil', description: 'Water-retentive, nutrient-rich' },
    { id: 'sandy', name: 'Sandy Soil', description: 'Fast-draining, low nutrients' },
    { id: 'silty', name: 'Silty Soil', description: 'Moisture-retentive, fertile' },
    { id: 'black', name: 'Black Cotton Soil', description: 'High clay content, moisture-retentive' }
  ];

  const predictions = [
    {
      id: 1,
      crop: 'Wheat',
      icon: faWheatAwn,
      suitability: 95,
      season: 'Rabi (Winter)',
      plantingWindow: 'Nov - Dec 2024',
      harvestWindow: 'Apr - May 2025',
      expectedYield: '4.2 - 5.1 tons/hectare',
      profitability: 'High',
      waterRequirement: 'Medium',
      advantages: [
        'Excellent climate match',
        'High market demand',
        'Good soil compatibility',
        'Proven track record in region'
      ],
      considerations: [
        'Monitor for rust diseases',
        'Ensure adequate irrigation',
        'Market price volatility'
      ],
      confidence: 95,
      marketPrice: '₹2,200/quintal',
      difficulty: 'Easy'
    },
    {
      id: 2,
      crop: 'Rice',
      icon: faSeedling,
      suitability: 88,
      season: 'Kharif (Monsoon)',
      plantingWindow: 'Jun - Jul 2025',
      harvestWindow: 'Nov - Dec 2025',
      expectedYield: '5.8 - 6.5 tons/hectare',
      profitability: 'High',
      waterRequirement: 'High',
      advantages: [
        'High yield potential',
        'Stable market demand',
        'Suitable for monsoon season',
        'Government support schemes'
      ],
      considerations: [
        'High water requirement',
        'Pest management needed',
        'Storage requirements'
      ],
      confidence: 88,
      marketPrice: '₹1,950/quintal',
      difficulty: 'Medium'
    },
    {
      id: 3,
      crop: 'Corn (Maize)',
      icon: faLeaf,
      suitability: 82,
      season: 'Kharif/Rabi',
      plantingWindow: 'Feb - Mar 2025',
      harvestWindow: 'Jun - Jul 2025',
      expectedYield: '4.8 - 5.5 tons/hectare',
      profitability: 'Medium-High',
      waterRequirement: 'Medium',
      advantages: [
        'Dual season cultivation',
        'Good feed crop demand',
        'Mechanization friendly',
        'Value-added processing options'
      ],
      considerations: [
        'Pest susceptibility',
        'Storage challenges',
        'Market price fluctuation'
      ],
      confidence: 82,
      marketPrice: '₹1,850/quintal',
      difficulty: 'Medium'
    },
    {
      id: 4,
      crop: 'Tomato',
      icon: faAppleAlt,
      suitability: 76,
      season: 'Winter',
      plantingWindow: 'Oct - Nov 2024',
      harvestWindow: 'Jan - Mar 2025',
      expectedYield: '25 - 35 tons/hectare',
      profitability: 'Very High',
      waterRequirement: 'High',
      advantages: [
        'Very high profitability',
        'Year-round demand',
        'Multiple harvests',
        'Processing industry demand'
      ],
      considerations: [
        'Disease susceptibility',
        'Requires intensive care',
        'High initial investment',
        'Market price volatility'
      ],
      confidence: 76,
      marketPrice: '₹15-25/kg',
      difficulty: 'Hard'
    },
    {
      id: 5,
      crop: 'Sugarcane',
      icon: faLeaf,
      suitability: 71,
      season: 'Year-round',
      plantingWindow: 'Feb - Apr 2025',
      harvestWindow: 'Dec 2025 - Feb 2026',
      expectedYield: '70 - 85 tons/hectare',
      profitability: 'High',
      waterRequirement: 'Very High',
      advantages: [
        'Long-term crop (12-18 months)',
        'Government price support',
        'Multiple uses (sugar, ethanol)',
        'Ratoon crop possibility'
      ],
      considerations: [
        'Very high water needs',
        'Long investment cycle',
        'Transportation challenges',
        'Processing facility dependency'
      ],
      confidence: 71,
      marketPrice: '₹350-400/quintal',
      difficulty: 'Hard'
    }
  ];

  const currentConditions = {
    temperature: '24°C',
    humidity: '65%',
    rainfall: '850mm/year',
    soilPh: '6.8',
    organicMatter: '2.4%',
    season: 'Post-Monsoon'
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

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
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
        {/* Configuration Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.climate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
              <select
                value={selectedSoil}
                onChange={(e) => setSelectedSoil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {soilTypes.map(soil => (
                  <option key={soil.id} value={soil.id}>
                    {soil.name} - {soil.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Environmental Conditions</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <FontAwesomeIcon icon={faThermometerHalf} className="text-red-500 text-xl mb-2" />
              <div className="font-bold text-gray-900">{currentConditions.temperature}</div>
              <div className="text-xs text-gray-600">Temperature</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <FontAwesomeIcon icon={faDroplet} className="text-blue-500 text-xl mb-2" />
              <div className="font-bold text-gray-900">{currentConditions.humidity}</div>
              <div className="text-xs text-gray-600">Humidity</div>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <FontAwesomeIcon icon={faCloudSun} className="text-cyan-500 text-xl mb-2" />
              <div className="font-bold text-gray-900">{currentConditions.rainfall}</div>
              <div className="text-xs text-gray-600">Annual Rainfall</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <FontAwesomeIcon icon={faLeaf} className="text-yellow-500 text-xl mb-2" />
              <div className="font-bold text-gray-900">{currentConditions.soilPh}</div>
              <div className="text-xs text-gray-600">Soil pH</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <FontAwesomeIcon icon={faSeedling} className="text-green-500 text-xl mb-2" />
              <div className="font-bold text-gray-900">{currentConditions.organicMatter}</div>
              <div className="text-xs text-gray-600">Organic Matter</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500 text-xl mb-2" />
              <div className="font-bold text-gray-900">{currentConditions.season}</div>
              <div className="text-xs text-gray-600">Current Season</div>
            </div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faRobot} className="text-blue-500 text-xl mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">AI Crop Recommendations</h2>
            </div>
            <span className="text-sm text-gray-500">Ranked by suitability score</span>
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
                      <h3 className="text-xl font-bold text-gray-900">{prediction.crop}</h3>
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