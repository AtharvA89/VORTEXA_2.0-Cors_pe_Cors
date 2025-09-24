import React, { useEffect, useRef, useState } from 'react';
import { IconMap, IconDeviceFloppy, IconEraser, IconAlertTriangle, IconPlant2 } from '@tabler/icons-react';
import { API_URLS } from '../config';
import googleMapsLoader from '../utils/googleMapsLoader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import './FieldMapper.css';

const FieldMapper = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldLocation, setFieldLocation] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [coordinates, setCoordinates] = useState([]);
  const [message, setMessage] = useState({ show: false, text: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  
  // List of major crops grown in India
  const cropOptions = [
    'Rice', 'Wheat', 'Maize', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)', 
    'Cotton', 'Sugarcane', 'Pulses', 'Groundnut', 'Mustard', 
    'Soybean', 'Sunflower', 'Jute', 'Coffee', 'Tea', 
    'Rubber', 'Tobacco', 'Onion', 'Potato', 'Tomato'
  ];

  // Initialize the Google Maps and drawing tools
  useEffect(() => {
    const loadMaps = async () => {
      try {
        await googleMapsLoader.loadGoogleMaps(['drawing', 'geometry']);
        initMap();
      } catch (error) {
        setMessage({
          show: true,
          text: "Failed to load Google Maps. Please check your internet connection.",
          type: 'error'
        });
      }
    };

    loadMaps();
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    
    // Check if Google Maps API is properly loaded
    if (!window.google || !window.google.maps) {
      setMessage({
        show: true,
        text: "Google Maps API not loaded properly. Please refresh the page.",
        type: 'error'
      });
      return;
    }
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 }, // Center on India
      zoom: 5,
      mapTypeId: 'hybrid',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    // Check if drawing library is loaded
    if (!window.google.maps.drawing || !window.google.maps.drawing.DrawingManager) {
      setMessage({
        show: true,
        text: "Google Maps Drawing library not loaded. Please refresh the page.",
        type: 'error'
      });
      return;
    }
    
    const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon']
      },
      polygonOptions: {
        strokeColor: '#16a34a',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#16a34a',
        fillOpacity: 0.35,
        editable: true
      }
    });
    
    drawingManagerInstance.setMap(mapInstance);
    
    window.google.maps.event.addListener(
      drawingManagerInstance, 
      'polygoncomplete', 
      (polygon) => handlePolygonComplete(polygon)
    );
    
    setMap(mapInstance);
    setDrawingManager(drawingManagerInstance);
  };

  const handlePolygonComplete = (polygon) => {
    // Remove previous polygon if it exists
    if (currentPolygon) {
      currentPolygon.setMap(null);
    }
    
    setCurrentPolygon(polygon);
    
    // Turn off drawing mode
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
    
    // Get coordinates from polygon
    const coords = getPolygonCoordinates(polygon);
    setCoordinates(coords);
    
    // Add listener for path changes
    window.google.maps.event.addListener(
      polygon.getPath(), 
      'set_at', 
      () => setCoordinates(getPolygonCoordinates(polygon))
    );
    
    window.google.maps.event.addListener(
      polygon.getPath(), 
      'insert_at', 
      () => setCoordinates(getPolygonCoordinates(polygon))
    );
  };

  const getPolygonCoordinates = (polygon) => {
    if (!polygon) return [];
    
    const path = polygon.getPath();
    const coords = [];
    
    path.forEach(latLng => {
      coords.push({ lat: latLng.lat(), lng: latLng.lng() });
    });
    
    return coords;
  };

  const handleClearAll = () => {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }
    
    setCoordinates([]);
    setFieldName('');
    setFieldLocation('');
    setSelectedCrop('');
    
    if (drawingManager) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
    
    setMessage({
      show: true,
      text: "Map cleared. You can draw a new field.",
      type: 'info'
    });
    
    // Auto-hide message after 3 seconds
    setTimeout(() => setMessage({ show: false, text: '', type: 'info' }), 3000);
  };

  const handleSaveField = async () => {
    // Validate input
    if (!fieldName.trim()) {
      setMessage({
        show: true,
        text: "Please enter a field name.",
        type: 'error'
      });
      return;
    }
    
    if (!fieldLocation.trim()) {
      setMessage({
        show: true,
        text: "Please enter a field location.",
        type: 'error'
      });
      return;
    }
    
    if (!selectedCrop) {
      setMessage({
        show: true,
        text: "Please select a crop for this field.",
        type: 'error'
      });
      return;
    }
    
    if (!coordinates || coordinates.length < 3) {
      setMessage({
        show: true,
        text: "Please draw a polygon with at least 3 points.",
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate a unique ID using timestamp + random
      const fieldId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Create field data object
      const fieldData = {
        id: fieldId,
        name: fieldName,
        location: fieldLocation,
        crop: selectedCrop,
        coordinates: coordinates,
        createdAt: new Date().toISOString()
      };
      
      console.log('Field data to save:', fieldData);
      
      // In a real application, this would send to your backend API
      // For now, we'll simulate a successful save
      setTimeout(() => {
        setMessage({
          show: true,
          text: `Field "${fieldName}" saved successfully!`,
          type: 'success'
        });
        
        // Clear form after successful save
        handleClearAll();
        setLoading(false);
      }, 1000);
      
      /* 
      // Uncomment this for real API integration
      const response = await fetch(API_URLS.FIELDS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save field data');
      }
      
      const result = await response.json();
      
      setMessage({
        show: true,
        text: `Field "${fieldName}" saved successfully!`,
        type: 'success'
      });
      
      // Clear form after successful save
      handleClearAll();
      */
      
    } catch (error) {
      console.error('Error saving field:', error);
      setMessage({
        show: true,
        text: `Error: ${error.message}. Please try again.`,
        type: 'error'
      });
      setLoading(false);
    }
  };

  const messageClasses = {
    info: "bg-blue-50 border-blue-300 text-blue-800",
    success: "bg-green-50 border-green-300 text-green-800",
    error: "bg-red-50 border-red-300 text-red-800"
  };

  return (
    <Card className="field-mapper">
      <CardHeader>
        <div className="flex items-center">
          <IconMap className="mr-2 text-green-600 h-6 w-6" />
          <CardTitle>Field Mapper</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Draw a polygon on the map to mark a new field and save it with crop information.
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-7">
            <div 
              ref={mapRef} 
              className="h-[500px] w-full rounded-md border border-border"
            ></div>
          </div>
          
          {/* Field Details Form */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Field Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Field Name</Label>
                  <Input
                    id="fieldName"
                    placeholder="Enter field name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fieldLocation">Location</Label>
                  <Input
                    id="fieldLocation"
                    placeholder="Field location or village"
                    value={fieldLocation}
                    onChange={(e) => setFieldLocation(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cropType" className="flex items-center">
                    <IconPlant2 className="mr-2 text-green-600 h-4 w-4" />
                    Crop Type
                  </Label>
                  <select
                    id="cropType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select Crop --</option>
                    {cropOptions.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Select the crop you plan to grow in this field
                  </p>
                </div>
                
                {coordinates.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Coordinates</Label>
                    <div className="rounded-md border border-border overflow-x-auto max-h-40">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">Point</th>
                            <th className="px-4 py-2 text-left font-medium">Latitude</th>
                            <th className="px-4 py-2 text-left font-medium">Longitude</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coordinates.map((point, index) => (
                            <tr key={index} className="border-t border-border">
                              <td className="px-4 py-2">{index + 1}</td>
                              <td className="px-4 py-2">{point.lat.toFixed(6)}</td>
                              <td className="px-4 py-2">{point.lng.toFixed(6)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {coordinates.length} points drawn on map
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleSaveField}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Field'}
                  </Button>
                  
                  <Button 
                    onClick={handleClearAll}
                    disabled={loading}
                    variant="outline"
                  >
                    <IconEraser className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {message.show && (
          <div className={`mt-4 p-4 rounded-md border flex items-center justify-between ${messageClasses[message.type]}`}>
            {message.type === 'error' && (
              <IconAlertTriangle className="mr-2 h-4 w-4" />
            )}
            <span>{message.text}</span>
            <button 
              className="bg-transparent text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setMessage({ show: false, text: '', type: 'info' })}
            >
              &times;
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FieldMapper;