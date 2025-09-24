// API endpoint configuration

// Base API URL - would typically come from environment variables
const BASE_URL = 'http://localhost:5000/api';

export const API_URLS = {
  // Auth endpoints
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  
  // User endpoints
  USER_PROFILE: `${BASE_URL}/users/profile`,
  
  // Field management endpoints
  FIELDS: `${BASE_URL}/fields`,
  FIELD_BY_ID: (id) => `${BASE_URL}/fields/${id}`,
  
  // Crop management endpoints
  CROPS: `${BASE_URL}/crops`,
  CROP_BY_ID: (id) => `${BASE_URL}/crops/${id}`,
  
  // Weather data endpoints
  WEATHER: `${BASE_URL}/weather`,
  WEATHER_FORECAST: `${BASE_URL}/weather/forecast`,
  
  // Analytics endpoints
  ANALYTICS: `${BASE_URL}/analytics`,
  YIELD_PREDICTIONS: `${BASE_URL}/analytics/yield`,
};