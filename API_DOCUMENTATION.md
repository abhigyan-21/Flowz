# Flowz Project - Complete API Documentation

**Version:** 1.0.0  
**Project:** West Bengal Flood Prediction & Visualization System  
**Base URL:** `http://localhost:8000/api`  
**Frontend Base URL:** `http://localhost:5173`

---

## Table of Contents

1. [Backend REST APIs](#backend-rest-apis)
   - [Predictions](#predictions)
   - [Simulation](#simulation)
   - [Alerts](#alerts)
   - [ArcGIS Integration](#arcgis-integration)
   - [Evacuation](#evacuation)
   - [Time Series & Hydrograph](#time-series--hydrograph)
   - [History](#history)
   - [Configuration](#configuration)
   - [Deep Learning Predictions](#deep-learning-predictions)
2. [Frontend Services](#frontend-services)
3. [Authentication & Headers](#authentication--headers)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

---

# Backend REST APIs

## Predictions

### Get Current Predictions
**Endpoint:** `GET /predictions/current`

**Description:** Retrieve all current flood predictions

**Parameters:** None

**Response:**
```json
{
  "predictions": [
    {
      "id": "pred_001",
      "location": "Ganges River - Murshidabad",
      "lat": 24.2,
      "lon": 88.3,
      "severity": "High",
      "waterLevel": 65.8,
      "waterLevelThreshold": 70.0,
      "rainfall": 240.5,
      "temperature": 28.3,
      "riskScore": 72,
      "timestamp": "2026-02-11T10:30:00Z"
    }
  ],
  "count": 3,
  "lastUpdated": "2026-02-11T10:30:00Z"
}
```

**Status Codes:** `200 OK`, `500 Server Error`

**Example:**
```javascript
const response = await fetch('http://localhost:8000/api/predictions/current');
const data = await response.json();
```

---

## Simulation

### Get Simulation Data
**Endpoint:** `GET /simulation/{prediction_id}`

**Description:** Get simulation frames and metadata for a specific prediction

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prediction_id` | string | Yes | ID of the prediction |

**Response:**
```json
{
  "predictionId": "pred_001",
  "frames": [
    {
      "frameId": "frame_001",
      "timeOffset": 0,
      "depth": 2.5,
      "timestamp": "2026-02-11T10:30:00Z",
      "url": "/api/arcgis/simulations/pred_001/frame?time_offset=0"
    }
  ],
  "bounds": {
    "north": 24.5,
    "south": 24.0,
    "east": 88.8,
    "west": 88.0
  },
  "totalFrames": 24,
  "duration": 24
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

## Alerts

### Get All Alerts
**Endpoint:** `GET /alerts`

**Description:** Retrieve all active flood alerts

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `severity` | string | No | Filter by severity (High, Moderate, Low) |
| `basin` | string | No | Filter by river basin |

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "predictionId": "pred_001",
      "title": "Ganges River - Murshidabad",
      "description": "Moderate flood risk due to heavy rainfall",
      "severity": "High",
      "type": "Water Level",
      "location": "Murshidabad District",
      "affectedRegions": ["Murshidabad", "Malda"],
      "riskScore": 72,
      "waterLevel": 65.8,
      "rainfall": 240.5,
      "temperature": 28.3,
      "timestamp": "2026-02-11T10:30:00Z"
    }
  ],
  "count": 3
}
```

**Status Codes:** `200 OK`, `500 Server Error`

---

## ArcGIS Integration

### Get Simulation Frame
**Endpoint:** `GET /arcgis/simulations/{prediction_id}/frame`

**Description:** Get a rendered simulation frame as PNG/JPEG image

**Parameters:**
| Name | Type | Range | Default | Description |
|------|------|-------|---------|-------------|
| `prediction_id` | string | - | - | Prediction ID |
| `time_offset` | int | 0-48 | 0 | Time offset in hours |
| `width` | int | 256-2048 | 1024 | Image width in pixels |
| `height` | int | 192-1536 | 768 | Image height in pixels |
| `format` | string | png, jpeg | png | Image format |

**Response:** PNG/JPEG binary image

**Example URL:**
```
GET /api/arcgis/simulations/pred_001/frame?time_offset=5&width=1024&height=768&format=png
```

**Status Codes:** `200 OK`, `404 Not Found`, `400 Bad Request`, `500 Server Error`

---

### Get Elevation Profile
**Endpoint:** `GET /arcgis/elevation`

**Description:** Get elevation data for a location

**Parameters:**
| Name | Type | Required | Range | Description |
|------|------|----------|-------|-------------|
| `lat` | float | Yes | -90 to 90 | Latitude |
| `lon` | float | Yes | -180 to 180 | Longitude |
| `radius` | float | No | 0.01-1.0 | Search radius in degrees |

**Response:**
```json
{
  "center": {"lat": 24.2, "lon": 88.3},
  "elevation": 45.5,
  "unit": "meters",
  "terrain": "Valley",
  "slope": 2.5
}
```

**Example:**
```
GET /api/arcgis/elevation?lat=24.2&lon=88.3&radius=0.05
```

**Status Codes:** `200 OK`, `400 Bad Request`, `500 Server Error`

---

### Get Flood Extent
**Endpoint:** `GET /arcgis/flood-extent/{prediction_id}`

**Description:** Get flood extent boundaries as GeoJSON

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prediction_id` | string | Yes | Prediction ID |

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "depth": 2.5,
        "timestamp": "2026-02-11T10:30:00Z"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[88.2, 24.2], [88.3, 24.2], [88.3, 24.1], [88.2, 24.1], [88.2, 24.2]]]
      }
    }
  ]
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

### Export Simulation as GeoJSON
**Endpoint:** `GET /arcgis/export/{prediction_id}`

**Description:** Download simulation data as GeoJSON file

**Parameters:**
| Name | Type | Required | Default | Values |
|------|------|----------|---------|--------|
| `prediction_id` | string | Yes | - | - |
| `format` | string | No | geojson | geojson, kml, shapefile |

**Response:** GeoJSON file (Content-Type: application/geo+json)

**Example:**
```
GET /api/arcgis/export/pred_001?format=geojson
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

### Get Simulation Analytics
**Endpoint:** `GET /arcgis/analytics/{prediction_id}`

**Description:** Get flood simulation statistics and metrics

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prediction_id` | string | Yes | Prediction ID |

**Response:**
```json
{
  "predictionId": "pred_001",
  "peakDepth": 5.2,
  "peakTimeOffset": 12,
  "floodedArea": 2450.5,
  "areaUnit": "km²",
  "maxWaterLevel": 72.3,
  "avgVelocity": 0.85,
  "duration": 24,
  "affectedPopulation": 125000,
  "riskLevel": "High"
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

### Compare Multiple Simulations
**Endpoint:** `POST /arcgis/compare`

**Description:** Compare multiple flood simulations

**Request Body:**
```json
{
  "predictionIds": ["pred_001", "pred_002"],
  "metrics": ["peakDepth", "floodedArea", "duration"]
}
```

**Response:**
```json
{
  "comparisons": [
    {
      "predictionId": "pred_001",
      "peakDepth": 5.2,
      "floodedArea": 2450.5,
      "duration": 24
    },
    {
      "predictionId": "pred_002",
      "peakDepth": 3.8,
      "floodedArea": 1850.3,
      "duration": 18
    }
  ]
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `500 Server Error`

---

### Get Map Tiles
**Endpoint:** `GET /arcgis/tiles/{z}/{x}/{y}`

**Description:** Get map tile for a specific zoom level and position

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `z` | int | Yes | Zoom level (0-20) |
| `x` | int | Yes | Tile X coordinate |
| `y` | int | Yes | Tile Y coordinate |

**Response:** PNG tile image

**Example:**
```
GET /api/arcgis/tiles/10/524/347
```

**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`

---

## Evacuation

### Get Evacuation Plan
**Endpoint:** `POST /evacuation/plan`

**Description:** Generate an evacuation plan for a location

**Request Body:**
```json
{
  "currentLocation": "Murshidabad District",
  "populationClass": "urban"
}
```

**Response:**
```json
{
  "locationId": "loc_001",
  "priorityLevel": 1,
  "estimatedTime": "2 hours",
  "recommendedRoutes": [
    {
      "routeId": "route_001",
      "destination": "Kolkata Shelter",
      "distance": 180,
      "timeEstimate": "3.5 hours",
      "safetyRating": "High"
    }
  ],
  "nearestShelters": 3,
  "capacity": 5000
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `500 Server Error`

---

### Get Shelters
**Endpoint:** `GET /evacuation/shelters/{location_id}`

**Description:** Get available shelters for a location

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `location_id` | string | Yes | Location ID |

**Response:**
```json
[
  {
    "id": "shelter_001",
    "name": "Government School, Murshidabad",
    "lat": 24.15,
    "lon": 88.25,
    "capacity": 500,
    "currentOccupancy": 120,
    "availableBeds": 380,
    "distanceKm": 5.2,
    "amenities": ["Water", "Medical", "Sanitation"]
  }
]
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

### Get Evacuation Routes
**Endpoint:** `GET /evacuation/routes/{location_id}`

**Description:** Get safe evacuation routes from a location

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `location_id` | string | Yes | Location ID |

**Response:**
```json
[
  {
    "routeId": "route_001",
    "name": "Route to Kolkata (Safe)",
    "distance": 180,
    "timeEstimate": "3.5 hours",
    "safetyLevel": "High",
    "pathCoordinates": [[24.2, 88.3], [24.1, 88.4], [23.5, 88.5]],
    "hazardsAhead": []
  }
]
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

## Time Series & Hydrograph

### Get Hydrograph Data
**Endpoint:** `GET /timeseries/{prediction_id}/hydrograph`

**Description:** Get water level time series data for plotting hydrograph

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prediction_id` | string | Yes | Prediction ID |

**Response:**
```json
{
  "location": "Ganges River - Murshidabad",
  "timeUnits": "hours",
  "dataPoints": [
    {
      "time": 0,
      "waterLevel": 60.2,
      "discharge": 10500,
      "rainfall": 12.5,
      "temperature": 28.3
    },
    {
      "time": 1,
      "waterLevel": 61.5,
      "discharge": 11200,
      "rainfall": 15.3,
      "temperature": 28.1
    }
  ],
  "peak": {
    "time": 12,
    "waterLevel": 72.3,
    "discharge": 18500
  }
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

## History

### Get Prediction History
**Endpoint:** `GET /history/{prediction_id}`

**Description:** Get historical record of a prediction

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prediction_id` | string | Yes | Prediction ID |

**Response:**
```json
{
  "predictionId": "pred_001",
  "createdAt": "2026-02-11T08:00:00Z",
  "updatedAt": "2026-02-11T10:30:00Z",
  "revisions": [
    {
      "version": 1,
      "timestamp": "2026-02-11T08:00:00Z",
      "severity": "Moderate",
      "waterLevel": 62.5,
      "prediction": "Initial forecast"
    },
    {
      "version": 2,
      "timestamp": "2026-02-11T10:30:00Z",
      "severity": "High",
      "waterLevel": 65.8,
      "prediction": "Updated with new rainfall data"
    }
  ]
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

### Get Timeline
**Endpoint:** `GET /history/timeline`

**Description:** Get timeline of all events

**Response:**
```json
{
  "events": [
    {
      "timestamp": "2026-02-11T10:30:00Z",
      "type": "prediction_update",
      "severity": "High",
      "location": "Ganges River - Murshidabad",
      "message": "Water level exceeded threshold"
    }
  ],
  "count": 15
}
```

**Status Codes:** `200 OK`, `500 Server Error`

---

## Configuration

### Get Severity Levels
**Endpoint:** `GET /config/severity-levels`

**Description:** Get severity classification thresholds

**Response:**
```json
{
  "levels": [
    {
      "name": "Low",
      "minWaterLevel": 0,
      "maxWaterLevel": 50,
      "color": "#4CAF50",
      "riskScore": 0
    },
    {
      "name": "Moderate",
      "minWaterLevel": 50,
      "maxWaterLevel": 65,
      "color": "#FFC107",
      "riskScore": 50
    },
    {
      "name": "High",
      "minWaterLevel": 65,
      "maxWaterLevel": 80,
      "color": "#FF5722",
      "riskScore": 75
    }
  ]
}
```

**Status Codes:** `200 OK`, `500 Server Error`

---

## Deep Learning Predictions

### Ingest DL Prediction
**Endpoint:** `POST /predictions/ingest`

**Description:** Ingest a new prediction from deep learning model

**Request Body:**
```json
{
  "modelVersion": "LISFLOOD_v2.0",
  "basin": "Ganges",
  "scenario": "average",
  "timestamp": "2026-02-11T10:00:00Z",
  "frames": [
    {
      "timeOffset": 0,
      "maxDepth": 2.5,
      "area": 2450.5
    }
  ]
}
```

**Response:**
```json
{
  "predictionId": "pred_002",
  "ingestionTime": "2026-02-11T10:30:00Z",
  "status": "processed",
  "message": "Prediction ingested successfully"
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `500 Server Error`

---

### Get Latest DL Prediction
**Endpoint:** `GET /predictions/dl/latest/{basin}`

**Description:** Get latest prediction for a basin

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `basin` | string | Yes | River basin name (Ganges, Brahmaputra, etc.) |

**Response:**
```json
{
  "predictionId": "pred_001",
  "basin": "Ganges",
  "timestamp": "2026-02-11T10:00:00Z",
  "scenario": "average",
  "frames": 24,
  "url": "/api/predictions/dl/pred_001"
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

### Get DL Prediction
**Endpoint:** `GET /predictions/dl/{prediction_id}`

**Description:** Get detailed DL prediction data

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prediction_id` | string | Yes | Prediction ID |

**Response:**
```json
{
  "predictionId": "pred_001",
  "modelVersion": "LISFLOOD_v2.0",
  "basin": "Ganges",
  "scenario": "average",
  "timestamp": "2026-02-11T10:00:00Z",
  "frames": [...]
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `500 Server Error`

---

# Frontend Services

## Alert Service (`src/services/alertService.js`)

### Get Alerts
```javascript
alertService.getAlerts()
```
Returns all active alerts from backend

---

## Simulation Service (`src/services/simulationService.js`)

### Get Simulation Frames
```javascript
simulationService.getSimulationFrames(predictionId)
```
Fetches 24 animation frames with timing data

### Get ArcGIS Frame
```javascript
simulationService.getArcGISFrame(predictionId, timeOffset)
```
Gets rendered PNG image from backend

### Get Elevation Profile
```javascript
simulationService.getElevationProfile(lat, lon)
```
Queries elevation data for a location

### Get Simulation Analytics
```javascript
simulationService.getSimulationAnalytics(predictionId)
```
Gets peak depth, area, timing stats

### Export as GIS Layer
```javascript
simulationService.exportAsGISLayer(predictionId, format)
```
Downloads GeoJSON file

---

## ArcGIS Visualization Service (`src/services/arcgisVisualizationService.js`)

### Add Flood Extent Layer
```javascript
arcgisVisualizationService.addFloodExtentLayer(viewer, predictionId)
```
Adds GeoJSON flood extent as polygon layer on Cesium globe

### Add Simulation Overlay
```javascript
arcgisVisualizationService.addSimulationOverlay(viewer, predictionId, location, onFrameUpdate)
```
Creates animation frame layers on the map

### Get Elevation Profile
```javascript
arcgisVisualizationService.getElevationProfile(lat, lon)
```
Gets elevation data for location

### Get Simulation Analytics
```javascript
arcgisVisualizationService.getSimulationAnalytics(predictionId)
```
Gets flood statistics

### Get Simulation Frame
```javascript
arcgisVisualizationService.getSimulationFrame(predictionId, timeOffset)
```
Fetches individual simulation frame as blob

---

## Evacuation Service (`src/services/evacuationService.js`)

### Get Evacuation Plan
```javascript
evacuationService.getEvacuationPlan(currentLocation)
```
Generates evacuation plan for location

---

## Forecast Service (`src/services/forecastService.js`)

### Get Forecast
```javascript
forecastService.getForecast(locationId, scenario)
```
Gets water level forecast data (hydrograph)

---

# Authentication & Headers

## API Key Header
For ArcGIS requests, the following header is automatically added:
```
X-ArcGIS-API-Key: <VITE_ARCGIS_API_KEY>
```

## CORS Headers
All requests are subject to CORS policy. Allowed origins:
- `http://localhost:5173` (Frontend dev)
- `http://localhost:3000` (Alternative dev port)
- `http://localhost:8000` (Backend)

---

# Error Handling

## Standard Error Response
```json
{
  "detail": "Description of error",
  "status": 400,
  "timestamp": "2026-02-11T10:30:00Z"
}
```

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request successful |
| 400 | Bad request (invalid parameters) |
| 404 | Resource not found |
| 500 | Server error |

## Frontend Error Handling
```javascript
try {
  const data = await apiClient.get('/predictions/current');
} catch (error) {
  console.error('API Error:', error.response?.status, error.message);
  // Handle error appropriately
}
```

---

# Examples

## Complete Flow: Get Flood Data and Visualize

### 1. Get Current Predictions
```bash
curl http://localhost:8000/api/predictions/current
```

### 2. Get Flood Extent
```bash
curl http://localhost:8000/api/arcgis/flood-extent/{prediction_id}
```

### 3. Get Simulation Frame
```bash
curl http://localhost:8000/api/arcgis/simulations/{prediction_id}/frame?time_offset=0
```

### 4. Get Analytics
```bash
curl http://localhost:8000/api/arcgis/analytics/{prediction_id}
```

---

## Frontend Usage Example

```javascript
import arcgisVisualizationService from './services/arcgisVisualizationService';

// Load flood extent on map
const dataSource = await arcgisVisualizationService.addFloodExtentLayer(
  cesiumViewer, 
  'pred_001'
);

// Get simulation analytics
const analytics = await arcgisVisualizationService.getSimulationAnalytics('pred_001');
console.log(`Peak flood depth: ${analytics.peakDepth}m`);
console.log(`Flooded area: ${analytics.floodedArea} km²`);
```

---

## Environment Variables

### Frontend (.env.local)
```
VITE_ARCGIS_API_KEY=YOUR_API_KEY
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (.env)
```
ARCGIS_API_KEY=YOUR_API_KEY
PORT=8000
FRONTEND_URL=http://localhost:5173
```

---

**Last Updated:** February 11, 2026  
**Maintainer:** Flood Prediction Team  
**Support:** Check GitHub Issues or contact the development team

