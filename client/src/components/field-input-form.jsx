import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  RefreshCw, 
  MapPin, 
  Calendar,
  Crop,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react"

import { CropTypeSelect } from "@/components/crop-type-select"
import { PlantingDatePicker } from "@/components/date-picker"
import { LocationInputSection } from "@/components/location-input"
import { GoogleMapsFieldMapper } from "@/components/google-maps-field-mapper"
import { 
  createCropFieldGeoJSON, 
  updateFieldGeoJSON, 
  validateGeoJSONPolygon,
  getFieldSummary,
  formatForBackend
} from "@/lib/geojson-utils"

const initialFormData = {
  fieldName: "",
  cropType: "",
  plantingDate: null,
  expectedHarvestDate: null,
  latitude: null,
  longitude: null,
  soilType: "",
  irrigationType: "",
  previousCrop: "",
  notes: ""
}

export function FieldInputForm({ 
  onSubmit, 
  onSave, 
  initialData = null,
  className = "",
  disabled = false 
}) {
  const [formData, setFormData] = useState(initialData || initialFormData)
  const [polygonData, setPolygonData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setIsDirty(true)
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  // Handle coordinate changes
  const handleCoordinateChange = useCallback((lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }))
    setIsDirty(true)
  }, [])

  // Handle polygon changes from Google Maps
  const handlePolygonChange = useCallback((geoJson) => {
    setPolygonData(geoJson)
    setIsDirty(true)
    
    if (geoJson && geoJson.properties.centroid) {
      const { lat, lng } = geoJson.properties.centroid
      handleCoordinateChange(lat, lng)
    }
  }, [handleCoordinateChange])

  // Validate form data
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fieldName.trim()) {
      newErrors.fieldName = "Field name is required"
    }

    if (!formData.cropType) {
      newErrors.cropType = "Crop type is required"
    }

    if (!formData.plantingDate) {
      newErrors.plantingDate = "Planting date is required"
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Field location is required"
    }

    if (!polygonData) {
      newErrors.polygon = "Field boundary polygon is required"
    } else {
      const validation = validateGeoJSONPolygon(polygonData)
      if (!validation.isValid) {
        newErrors.polygon = validation.errors.join(", ")
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Calculate expected harvest date (rough estimation)
  const calculateHarvestDate = (plantingDate, cropType) => {
    if (!plantingDate || !cropType) return null

    const growingDays = {
      wheat: 120,
      maize: 100,
      rice: 150,
      tomato: 80,
      potato: 90,
      cotton: 180,
      soybean: 110,
      barley: 100
    }

    const days = growingDays[cropType] || 100
    const harvestDate = new Date(plantingDate)
    harvestDate.setDate(harvestDate.getDate() + days)
    return harvestDate
  }

  // Auto-calculate harvest date when planting date or crop type changes
  React.useEffect(() => {
    if (formData.plantingDate && formData.cropType) {
      const expectedHarvest = calculateHarvestDate(formData.plantingDate, formData.cropType)
      setFormData(prev => ({
        ...prev,
        expectedHarvestDate: expectedHarvest
      }))
    }
  }, [formData.plantingDate, formData.cropType])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create complete GeoJSON with all field data
      const completeGeoJSON = updateFieldGeoJSON(polygonData, {
        fieldName: formData.fieldName,
        cropType: formData.cropType,
        plantingDate: formData.plantingDate?.toISOString(),
        expectedHarvestDate: formData.expectedHarvestDate?.toISOString(),
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        previousCrop: formData.previousCrop,
        notes: formData.notes,
        centroid: { lat: formData.latitude, lng: formData.longitude }
      })

      // Format for backend
      const backendData = formatForBackend(completeGeoJSON)

      // Call submission handler
      if (onSubmit) {
        await onSubmit({
          formData,
          geoJson: completeGeoJSON,
          backendData
        })
      }

      setIsDirty(false)
    } catch (error) {
      console.error("Form submission error:", error)
      setErrors({ submit: "Failed to submit form. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle save (draft)
  const handleSave = async () => {
    if (onSave) {
      const draftData = {
        formData,
        polygonData,
        isDraft: true,
        savedAt: new Date().toISOString()
      }
      await onSave(draftData)
      setIsDirty(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData(initialData || initialFormData)
    setPolygonData(null)
    setErrors({})
    setIsDirty(false)
  }

  const fieldSummary = polygonData ? getFieldSummary(polygonData) : null

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crop className="h-5 w-5" />
            <span>New Field Registration</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete the form below to register a new agricultural field for crop management.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Field Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Field Name *</Label>
                  <Input
                    id="fieldName"
                    placeholder="e.g., North Field, Plot A1"
                    value={formData.fieldName}
                    onChange={(e) => handleFieldChange("fieldName", e.target.value)}
                    disabled={disabled}
                    className={errors.fieldName ? "border-red-500" : ""}
                  />
                  {errors.fieldName && (
                    <p className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.fieldName}
                    </p>
                  )}
                </div>

                <CropTypeSelect
                  value={formData.cropType}
                  onValueChange={(value) => handleFieldChange("cropType", value)}
                  disabled={disabled}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlantingDatePicker
                  date={formData.plantingDate}
                  onDateChange={(date) => handleFieldChange("plantingDate", date)}
                  disabled={disabled}
                />

                {formData.expectedHarvestDate && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Expected Harvest Date</Label>
                    <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        {formData.expectedHarvestDate.toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Auto-calculated
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Location Information */}
            <LocationInputSection
              latitude={formData.latitude}
              longitude={formData.longitude}
              onCoordinateChange={handleCoordinateChange}
              disabled={disabled}
            />
            {errors.location && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.location}
              </p>
            )}

            <Separator />

            {/* Google Maps Field Boundary */}
            <GoogleMapsFieldMapper
              onPolygonChange={handlePolygonChange}
              initialCenter={
                formData.latitude && formData.longitude
                  ? { lat: formData.latitude, lng: formData.longitude }
                  : undefined
              }
              disabled={disabled}
            />
            {errors.polygon && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.polygon}
              </p>
            )}

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Input
                    id="soilType"
                    placeholder="e.g., Clay, Loam, Sandy"
                    value={formData.soilType}
                    onChange={(e) => handleFieldChange("soilType", e.target.value)}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="irrigationType">Irrigation Type</Label>
                  <Input
                    id="irrigationType"
                    placeholder="e.g., Drip, Sprinkler, Rain-fed"
                    value={formData.irrigationType}
                    onChange={(e) => handleFieldChange("irrigationType", e.target.value)}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousCrop">Previous Crop</Label>
                  <Input
                    id="previousCrop"
                    placeholder="e.g., Wheat, Fallow"
                    value={formData.previousCrop}
                    onChange={(e) => handleFieldChange("previousCrop", e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the field..."
                  value={formData.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            {/* Field Summary */}
            {fieldSummary && (
              <>
                <Separator />
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-700 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Field Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Area</span>
                        <p className="text-blue-800">{fieldSummary.area.display}</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Points</span>
                        <p className="text-blue-800">{fieldSummary.coordinates} vertices</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Crop</span>
                        <p className="text-blue-800">{formData.cropType || "Not selected"}</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Location</span>
                        <p className="text-blue-800">
                          {formData.latitude && formData.longitude
                            ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                            : "Not set"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Error Display */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={disabled || isSubmitting || !isDirty}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Registering Field...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Register Field
                  </>
                )}
              </Button>

              {onSave && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={disabled || !isDirty}
                  className="flex-1 sm:flex-initial"
                >
                  Save Draft
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={disabled || !isDirty}
                className="flex-1 sm:flex-initial"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}