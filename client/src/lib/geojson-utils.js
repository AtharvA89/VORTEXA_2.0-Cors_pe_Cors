// Utility functions for handling GeoJSON data in crop management

/**
 * Validates a GeoJSON polygon structure
 * @param {Object} geoJson - The GeoJSON object to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export function validateGeoJSONPolygon(geoJson) {
  const errors = []
  
  if (!geoJson) {
    errors.push("GeoJSON object is required")
    return { isValid: false, errors }
  }

  if (geoJson.type !== "Feature") {
    errors.push("GeoJSON type must be 'Feature'")
  }

  if (!geoJson.geometry) {
    errors.push("GeoJSON must have a geometry property")
  } else {
    if (geoJson.geometry.type !== "Polygon") {
      errors.push("Geometry type must be 'Polygon'")
    }

    if (!geoJson.geometry.coordinates || !Array.isArray(geoJson.geometry.coordinates)) {
      errors.push("Geometry must have coordinates array")
    } else {
      const coordinates = geoJson.geometry.coordinates[0]
      if (!coordinates || coordinates.length < 4) {
        errors.push("Polygon must have at least 4 coordinate points")
      }

      // Check if polygon is closed (first and last points are the same)
      if (coordinates.length > 0) {
        const first = coordinates[0]
        const last = coordinates[coordinates.length - 1]
        if (first[0] !== last[0] || first[1] !== last[1]) {
          errors.push("Polygon must be closed (first and last points must be the same)")
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculates the centroid (center point) of a polygon
 * @param {Object} geoJson - GeoJSON polygon
 * @returns {Object} - {lat, lng} of the centroid
 */
export function calculatePolygonCentroid(geoJson) {
  if (!validateGeoJSONPolygon(geoJson).isValid) {
    return null
  }

  const coordinates = geoJson.geometry.coordinates[0]
  let sumLat = 0
  let sumLng = 0
  let count = 0

  // Skip the last point as it's the same as the first (closing the polygon)
  for (let i = 0; i < coordinates.length - 1; i++) {
    sumLng += coordinates[i][0]
    sumLat += coordinates[i][1]
    count++
  }

  return {
    lat: sumLat / count,
    lng: sumLng / count
  }
}

/**
 * Converts area from square meters to various units
 * @param {number} areaInSquareMeters - Area in square meters
 * @returns {Object} - Area in different units
 */
export function convertArea(areaInSquareMeters) {
  return {
    squareMeters: areaInSquareMeters,
    hectares: areaInSquareMeters / 10000,
    acres: areaInSquareMeters * 0.000247105,
    squareFeet: areaInSquareMeters * 10.7639,
    squareKilometers: areaInSquareMeters / 1000000
  }
}

/**
 * Creates a formatted GeoJSON for crop field with additional metadata
 * @param {Array} coordinates - Array of [lng, lat] coordinates
 * @param {Object} fieldData - Additional field information
 * @returns {Object} - Complete GeoJSON with crop field metadata
 */
export function createCropFieldGeoJSON(coordinates, fieldData = {}) {
  const geoJson = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coordinates]
    },
    properties: {
      // Field identification
      fieldId: fieldData.fieldId || generateFieldId(),
      fieldName: fieldData.fieldName || "Unnamed Field",
      
      // Crop information
      cropType: fieldData.cropType || null,
      plantingDate: fieldData.plantingDate || null,
      expectedHarvestDate: fieldData.expectedHarvestDate || null,
      
      // Area calculations (will be calculated by Google Maps)
      area: fieldData.area || 0,
      areaHectares: fieldData.areaHectares || 0,
      areaAcres: fieldData.areaAcres || 0,
      
      // Location data
      centroid: fieldData.centroid || null,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Additional metadata
      soilType: fieldData.soilType || null,
      irrigationType: fieldData.irrigationType || null,
      previousCrop: fieldData.previousCrop || null,
      notes: fieldData.notes || "",
      
      // System data
      version: "1.0",
      source: "web-application"
    }
  }

  return geoJson
}

/**
 * Generates a unique field ID
 * @returns {string} - Unique field identifier
 */
function generateFieldId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `field_${timestamp}_${random}`
}

/**
 * Formats GeoJSON for backend API consumption
 * @param {Object} geoJson - GeoJSON object
 * @returns {Object} - Formatted object for API
 */
export function formatForBackend(geoJson) {
  if (!validateGeoJSONPolygon(geoJson).isValid) {
    throw new Error("Invalid GeoJSON polygon")
  }

  return {
    field: {
      geometry: geoJson.geometry,
      properties: geoJson.properties
    },
    coordinates: geoJson.geometry.coordinates[0],
    metadata: {
      area: geoJson.properties.area,
      centroid: geoJson.properties.centroid,
      createdAt: geoJson.properties.createdAt
    }
  }
}

/**
 * Merges field data with existing GeoJSON
 * @param {Object} existingGeoJson - Existing GeoJSON
 * @param {Object} newFieldData - New field data to merge
 * @returns {Object} - Updated GeoJSON
 */
export function updateFieldGeoJSON(existingGeoJson, newFieldData) {
  if (!existingGeoJson) {
    return createCropFieldGeoJSON([], newFieldData)
  }

  return {
    ...existingGeoJson,
    properties: {
      ...existingGeoJson.properties,
      ...newFieldData,
      updatedAt: new Date().toISOString()
    }
  }
}

/**
 * Extracts summary information from GeoJSON
 * @param {Object} geoJson - GeoJSON object
 * @returns {Object} - Summary information
 */
export function getFieldSummary(geoJson) {
  if (!geoJson || !validateGeoJSONPolygon(geoJson).isValid) {
    return null
  }

  const props = geoJson.properties
  const areaData = convertArea(props.area || 0)

  return {
    fieldId: props.fieldId,
    fieldName: props.fieldName,
    cropType: props.cropType,
    plantingDate: props.plantingDate,
    area: {
      display: areaData.hectares >= 1 
        ? `${areaData.hectares.toFixed(2)} ha` 
        : `${areaData.squareMeters.toFixed(0)} m²`,
      hectares: areaData.hectares,
      acres: areaData.acres
    },
    coordinates: geoJson.geometry.coordinates[0].length - 1,
    centroid: props.centroid,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt
  }
}

/**
 * Converts GeoJSON to KML format (basic conversion)
 * @param {Object} geoJson - GeoJSON object
 * @returns {string} - KML string
 */
export function geoJsonToKML(geoJson) {
  if (!validateGeoJSONPolygon(geoJson).isValid) {
    throw new Error("Invalid GeoJSON polygon")
  }

  const coordinates = geoJson.geometry.coordinates[0]
  const coordString = coordinates
    .map(coord => `${coord[0]},${coord[1]},0`)
    .join(' ')

  const props = geoJson.properties
  const name = props.fieldName || props.fieldId || "Field"
  const description = `Crop: ${props.cropType || 'Unknown'}, Area: ${(props.areaHectares || 0).toFixed(2)} ha`

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <Placemark>
      <name>${name}</name>
      <description>${description}</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordString}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`
}

/**
 * Sample GeoJSON data for testing/demo purposes
 */
export const sampleFieldGeoJSON = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[
      [-74.0059, 40.7128],
      [-74.0059, 40.7138],
      [-74.0049, 40.7138],
      [-74.0049, 40.7128],
      [-74.0059, 40.7128]
    ]]
  },
  properties: {
    fieldId: "sample_field_001",
    fieldName: "Demo Field",
    cropType: "wheat",
    plantingDate: "2024-03-15",
    area: 10000,
    areaHectares: 1.0,
    areaAcres: 2.47,
    centroid: { lat: 40.7133, lng: -74.0054 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    soilType: "loam",
    irrigationType: "drip",
    notes: "Sample field for demonstration purposes"
  }
}