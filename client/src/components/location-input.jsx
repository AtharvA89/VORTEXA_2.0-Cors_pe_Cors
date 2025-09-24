import React, { useState, useEffect } from "react"
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CoordinateInput({ 
  latitude, 
  longitude, 
  onCoordinateChange, 
  className, 
  disabled = false 
}) {
  const [latInput, setLatInput] = useState(latitude || "")
  const [lngInput, setLngInput] = useState(longitude || "")
  const [errors, setErrors] = useState({ lat: "", lng: "" })

  const validateCoordinate = (value, type) => {
    const num = parseFloat(value)
    if (isNaN(num)) return `Invalid ${type}`
    
    if (type === "latitude" && (num < -90 || num > 90)) {
      return "Latitude must be between -90 and 90"
    }
    if (type === "longitude" && (num < -180 || num > 180)) {
      return "Longitude must be between -180 and 180"
    }
    return ""
  }

  const handleLatChange = (value) => {
    setLatInput(value)
    const error = validateCoordinate(value, "latitude")
    setErrors(prev => ({ ...prev, lat: error }))
    
    if (!error && value) {
      onCoordinateChange(parseFloat(value), longitude)
    }
  }

  const handleLngChange = (value) => {
    setLngInput(value)
    const error = validateCoordinate(value, "longitude")
    setErrors(prev => ({ ...prev, lng: error }))
    
    if (!error && value) {
      onCoordinateChange(latitude, parseFloat(value))
    }
  }

  useEffect(() => {
    setLatInput(latitude || "")
    setLngInput(longitude || "")
  }, [latitude, longitude])

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Manual Coordinates</Label>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude" className="text-xs">
            Latitude *
          </Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="e.g., 37.7749"
            value={latInput}
            onChange={(e) => handleLatChange(e.target.value)}
            disabled={disabled}
            className={errors.lat ? "border-red-500" : ""}
          />
          {errors.lat && (
            <p className="text-xs text-red-500 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.lat}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="longitude" className="text-xs">
            Longitude *
          </Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="e.g., -122.4194"
            value={lngInput}
            onChange={(e) => handleLngChange(e.target.value)}
            disabled={disabled}
            className={errors.lng ? "border-red-500" : ""}
          />
          {errors.lng && (
            <p className="text-xs text-red-500 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.lng}
            </p>
          )}
        </div>
      </div>
      
      {latitude && longitude && !errors.lat && !errors.lng && (
        <div className="text-xs text-muted-foreground">
          Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </div>
      )}
    </div>
  )
}

export function GPSLocationDetector({ 
  onLocationDetected, 
  className, 
  disabled = false 
}) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState("")
  const [lastLocation, setLastLocation] = useState(null)

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setIsDetecting(true)
    setError("")

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const location = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date()
        }
        
        setLastLocation(location)
        onLocationDetected(latitude, longitude, accuracy)
        setIsDetecting(false)
      },
      (error) => {
        let errorMessage = "Failed to detect location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        setError(errorMessage)
        setIsDetecting(false)
      },
      options
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Navigation className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">GPS Auto-Location</Label>
      </div>
      
      <Button
        onClick={detectLocation}
        disabled={disabled || isDetecting}
        variant="outline"
        className="w-full"
      >
        {isDetecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Detecting Location...
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4 mr-2" />
            Get Current Location
          </>
        )}
      </Button>
      
      {error && (
        <div className="text-xs text-red-500 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {error}
        </div>
      )}
      
      {lastLocation && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700">
                  Location Detected
                </span>
                <Badge variant="secondary" className="text-xs">
                  ±{Math.round(lastLocation.accuracy)}m
                </Badge>
              </div>
              <div className="text-xs text-green-600">
                {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
              </div>
              <div className="text-xs text-muted-foreground">
                {lastLocation.timestamp.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function LocationInputSection({ 
  latitude, 
  longitude, 
  onCoordinateChange, 
  className,
  disabled = false 
}) {
  const handleGPSDetection = (lat, lng, accuracy) => {
    onCoordinateChange(lat, lng)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Field Location</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CoordinateInput
            latitude={latitude}
            longitude={longitude}
            onCoordinateChange={onCoordinateChange}
            disabled={disabled}
          />
          
          <GPSLocationDetector
            onLocationDetected={handleGPSDetection}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}