// Google Maps API loader utility

// The API key should ideally come from environment variables
const API_KEY = "AIzaSyA3vUl0jnyrAi_awYheUAYjFNDKCUaDpeU";

/**
 * Loads the Google Maps API with specified libraries
 * @param {Array} libraries - Array of Google Maps libraries to load (e.g., ['places', 'drawing'])
 * @returns {Promise} - Resolves when the API is loaded
 */
const loadGoogleMaps = (libraries = []) => {
  return new Promise((resolve, reject) => {
    // If Google Maps is already loaded, resolve immediately
    if (window.google && window.google.maps) {
      return resolve(window.google.maps);
    }

    // Create a script element to load the Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=${libraries.join(',')}`;
    script.async = true;
    script.defer = true;
    
    // Handle script load event
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps API failed to load'));
      }
    };
    
    // Handle script error event
    script.onerror = (error) => {
      reject(new Error('Google Maps API failed to load: ' + error));
    };
    
    // Append the script to the document head
    document.head.appendChild(script);
  });
};

const googleMapsLoader = {
  loadGoogleMaps
};

export default googleMapsLoader;