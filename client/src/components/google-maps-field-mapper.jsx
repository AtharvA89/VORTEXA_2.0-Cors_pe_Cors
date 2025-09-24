import React, { useEffect, useRef, useState, useCallback } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Trash2, 
  RotateCcw, 
  Download,
  AlertCircle,
  Info
} from "lucide-react"

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyA3vUl0jnyrAi_awYheUAYjFNDKCUaDpeU"

export function GoogleMapsFieldMapper({ 
  onPolygonChange, 
  initialCenter = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  className,
  disabled = false 
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const drawingManagerRef = useRef(null)
  const currentPolygonRef = useRef(null)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [polygonData, setPolygonData] = useState(null)
  const [polygonArea, setPolygonArea] = useState(0)

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["drawing", "geometry"]
        })

        const google = await loader.load()
        
        if (!mapRef.current) return

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        mapInstanceRef.current = map

        // Create drawing manager
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON,
              google.maps.drawing.OverlayType.MARKER
            ]
          },
          polygonOptions: {
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#16a34a',
            clickable: true,
            editable: true,
            zIndex: 1
          },
          markerOptions: {
            draggable: true,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#16a34a"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 30),
              anchor: new google.maps.Point(15, 30)
            }
          }
        })

        drawingManager.setMap(map)
        drawingManagerRef.current = drawingManager

        // Handle polygon completion
        google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
          if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            // Remove previous polygon
            if (currentPolygonRef.current) {
              currentPolygonRef.current.setMap(null)
            }

            const polygon = event.overlay
            currentPolygonRef.current = polygon

            // Calculate and update polygon data
            updatePolygonData(polygon, google)

            // Add listeners for polygon editing
            google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
              updatePolygonData(polygon, google)
            })

            google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
              updatePolygonData(polygon, google)
            })

            // Stop drawing mode after completing polygon
            drawingManager.setDrawingMode(null)
          }
        })

        setIsLoaded(true)
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading Google Maps:", err)
        setError("Failed to load Google Maps. Please check your API key.")
        setIsLoading(false)
      }
    }

    initMap()
  }, [initialCenter])

  // Update polygon data and calculate area
  const updatePolygonData = useCallback((polygon, google) => {
    const path = polygon.getPath()
    const coordinates = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i)
      coordinates.push([point.lng(), point.lat()])
    }
    
    // Close the polygon by adding the first point at the end
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0])
    }

    // Calculate area in square meters
    const area = google.maps.geometry.spherical.computeArea(path)
    setPolygonArea(area)

    // Create GeoJSON
    const geoJson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates]
      },
      properties: {
        area: area,
        areaHectares: area / 10000,
        areaAcres: area * 0.000247105,
        createdAt: new Date().toISOString()
      }
    }

    setPolygonData(geoJson)
    onPolygonChange(geoJson)
  }, [onPolygonChange])

  // Clear current polygon
  const clearPolygon = () => {
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null)
      currentPolygonRef.current = null
      setPolygonData(null)
      setPolygonArea(0)
      onPolygonChange(null)
    }
  }

  // Reset drawing mode
  const resetDrawingMode = () => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(window.google?.maps?.drawing?.OverlayType?.POLYGON || null)
    }
  }

  // Download GeoJSON
  const downloadGeoJSON = () => {
    if (!polygonData) return
    
    const dataStr = JSON.stringify(polygonData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `field-boundary-${new Date().getTime()}.geojson`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Format area display
  const formatArea = (areaInMeters) => {
    const hectares = areaInMeters / 10000
    const acres = areaInMeters * 0.000247105
    
    if (hectares >= 1) {
      return `${hectares.toFixed(2)} hectares (${acres.toFixed(2)} acres)`
    } else {
      return `${areaInMeters.toFixed(0)} m² (${acres.toFixed(3)} acres)`
    }
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error loading maps</span>
          </div>
          <p className="text-sm text-red-600 mt-2">{error}</p>
          <p className="text-xs text-red-500 mt-2">
            Make sure to set REACT_APP_GOOGLE_MAPS_API_KEY in your environment
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Field Boundary Mapping</Label>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetDrawingMode}
            disabled={disabled || isLoading}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Draw
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearPolygon}
            disabled={disabled || !polygonData}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          {polygonData && (
            <Button
              size="sm"
              variant="outline"
              onClick={downloadGeoJSON}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border bg-gray-100"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">How to map your field:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Click the polygon tool in the map toolbar</li>
                <li>Click on the map to create boundary points</li>
                <li>Complete the polygon by clicking the first point</li>
                <li>Drag points to adjust the boundary</li>
                <li>Use markers to mark important locations</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Polygon Information */}
      {polygonData && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">
              Field Boundary Created
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600">Area</span>
                <Badge variant="secondary" className="text-xs">
                  {formatArea(polygonArea)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600">Points</span>
                <Badge variant="secondary" className="text-xs">
                  {polygonData.geometry.coordinates[0].length - 1} vertices
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                GeoJSON data ready for backend processing
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}