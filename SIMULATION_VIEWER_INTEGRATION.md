# Simulation Viewer Integration Guide

## Overview

The Flowz flood prediction system now includes a complete **SimulationViewer** component with **ArcGIS API integration** for visualizing flood simulations with animation, GIS rendering, and data export capabilities.

## Architecture

```
Backend (FastAPI)
├── /api/simulations/{id}              ← Simulation frames (existing)
├── /api/arcgis/simulations/{id}/frame ← ArcGIS rendered frames (NEW)
├── /api/arcgis/elevation              ← Elevation data (NEW)
├── /api/arcgis/flood-extent/{id}      ← Flood extent GeoJSON (NEW)
├── /api/arcgis/export/{id}            ← Export to GIS formats (NEW)
└── /api/arcgis/analytics/{id}         ← Simulation analytics (NEW)

Frontend (React)
├── SimulationViewer                   ← Main viewer component
├── SimulationModal                    ← Modal wrapper
├── AlertCardEnhanced                  ← Alert with simulation trigger
├── simulationService                  ← API client
└── MapComponent                       ← Integration point
```

## Components

### 1. **SimulationViewer** (`src/components/dashboard/SimulationViewer.jsx`)

Main component for displaying simulation animations with full controls.

**Features:**
- Frame-by-frame animation with play/pause/reset controls
- Adjustable playback speed (1x, 2x, 4x)
- Timeline scrubber with thumbnail strip
- Real-time statistics (depth, affected area, water level, peak depth)
- Depth scale legend
- Simulation metadata viewer
- Export capabilities

**Usage:**
```jsx
import SimulationViewer from './components/dashboard/SimulationViewer';

<SimulationViewer 
  predictionId="pred_ganges_kolkata_001"
  location={{ name: "Kolkata", basin: "Ganges" }}
  onClose={handleClose}
/>
```

### 2. **SimulationModal** (`src/components/dashboard/SimulationModal.jsx`)

Modal wrapper for full-screen viewing of simulations.

**Usage:**
```jsx
import SimulationModal from './components/dashboard/SimulationModal';

const [showSim, setShowSim] = useState(false);

<SimulationModal
  isOpen={showSim}
  predictionId="pred_ganges_kolkata_001"
  location={{ name: "Kolkata" }}
  onClose={() => setShowSim(false)}
/>
```

### 3. **AlertCardEnhanced** (`src/components/dashboard/AlertCardEnhanced.jsx`)

Enhanced alert card with integrated "View Simulation" button.

**Features:**
- Alert severity visualization
- Risk score display
- Location information
- One-click simulation viewer access
- Automatic modal management

**Usage:**
```jsx
import AlertCardEnhanced from './components/dashboard/AlertCardEnhanced';

<AlertCardEnhanced
  predictionId="pred_ganges_kolkata_001"
  severity="high"
  title="Ganges River - Murshidabad"
  content="High flood risk expected"
  location="Murshidabad District"
  riskScore={72}
  onSimulationClick={(data) => {
    // Handle simulation view
    console.log('Opening simulation:', data);
  }}
/>
```

### 4. **simulationService** (`src/services/simulationService.js`)

API client for simulation data with ArcGIS integration.

**Available Methods:**

```javascript
import simulationService from './services/simulationService';

// Get full simulation frames
const sim = await simulationService.getSimulationFrames(predictionId);

// Get ArcGIS-rendered frame
const frame = await simulationService.getArcGISFrame(predictionId, timeOffset);

// Get elevation profile
const elevation = await simulationService.getElevationProfile(lat, lon);

// Get simulation analytics
const analytics = await simulationService.getSimulationAnalytics(predictionId);

// Export as GeoJSON
const geojson = await simulationService.exportAsGISLayer(predictionId, 'geojson');
```

## Backend API Endpoints

### Simulation Endpoints

#### Get Simulation Frames
```
GET /api/simulations/{prediction_id}
```
Returns simulation frames with timing, water depth, and affected areas.

#### Get ArcGIS Rendered Frame
```
GET /api/arcgis/simulations/{prediction_id}/frame
Query Parameters:
- time_offset: int (0-48, default: 0)
- width: int (256-2048, default: 1024)
- height: int (192-1536, default: 768)
- format: string (png|jpeg, default: png)
```
Returns a PNG/JPEG image of the flood simulation with ArcGIS styling.

#### Get Elevation Profile
```
GET /api/arcgis/elevation
Query Parameters:
- lat: float (-90 to 90)
- lon: float (-180 to 180)
- radius: float (0 to 1, default: 0.05)
```
Returns elevation data for the simulation area.

#### Get Flood Extent
```
GET /api/arcgis/flood-extent/{prediction_id}
```
Returns flood extent as GeoJSON Feature Collection.

#### Export Simulation
```
GET /api/arcgis/export/{prediction_id}
Query Parameters:
- format: string (geojson|shapefile|kmz, default: geojson)
```
Exports simulation as vector GIS format.

#### Get Simulation Analytics
```
GET /api/arcgis/analytics/{prediction_id}
```
Returns analysis metrics and statistics for the simulation.

#### Compare Simulations
```
POST /api/arcgis/compare
Body: { "prediction_ids": ["id1", "id2", "id3"] }
```
Compares multiple simulations side-by-side.

#### Get Base Map Tile
```
GET /api/arcgis/tiles/{z}/{x}/{y}
```
Proxies ArcGIS World Imagery tiles.

## Integration with Existing Components

### MapComponent Integration

Update `MapComponent.jsx` to launch simulation viewer on location click:

```jsx
const handleLocationClick = (location) => {
  setShowSimulation(true);
  setSelectedPredictionId(location.id);
};

return (
  <>
    <CesiumGlobe
      onObjectClick={handleLocationClick}
      // ... other props
    />
    <SimulationModal
      isOpen={showSimulation}
      predictionId={selectedPredictionId}
      onClose={() => setShowSimulation(false)}
    />
  </>
);
```

### Alert System Integration

The `OverlayPanel` now uses `AlertCardEnhanced` which automatically includes:
- "View Simulation" button on each alert
- Modal management
- Prediction ID mapping
- Risk score display

### Home Page Integration

Add simulation viewer to the home page:

```jsx
import SimulationModal from './components/dashboard/SimulationModal';

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSim, setShowSim] = useState(false);

  const handleViewSimulation = (location) => {
    setSelectedLocation(location);
    setShowSim(true);
  };

  return (
    <>
      <MapComponent onLocationSelect={handleViewSimulation} />
      <SimulationModal
        isOpen={showSim}
        predictionId={selectedLocation?.id}
        location={selectedLocation}
        onClose={() => setShowSim(false)}
      />
    </>
  );
};
```

## ArcGIS Features

### 1. Simulation Rendering
- Real-time flood visualization with water depth color mapping
- Coordinate grid overlay
- Terrain-based background
- Metadata labels (time, depth, coordinates)

### 2. Elevation Integration
- Query elevation at specific coordinates
- Get elevation profiles for regions
- Use in flood depth calculations

### 3. GeoJSON Export
- Export complete simulation as GeoJSON
- Compatible with ArcGIS Online
- Includes all frame data and timestamps
- CRS: EPSG:4326 (WGS84)

### 4. Flood Extent Analysis
- Return flood extent polygons
- Feature properties with depth/area metrics
- Queryable by prediction ID and time

### 5. Analytics
- Peak depth and area calculations
- Time-to-peak analysis
- Progression rate metrics
- Frame-by-frame summaries

## Styling

### Simulation Viewer Styles (`src/styles/simulation.css`)
- Dark theme with blue accents
- Responsive grid layout
- Animation controls styling
- Legend and metadata sections
- Mobile-optimized

### Alert Card Styles (`src/styles/alert-card-enhanced.css`)
- Severity-based color coding
- Hover effects and transitions
- Risk score badges
- Responsive design

### Modal Styles (`src/styles/simulation-modal.css`)
- Full-screen overlay
- Backdrop blur effect
- Slide-up animation
- Responsive positioning

## Usage Example

### Complete Integration in a New Page

```jsx
// pages/SimulationAnalysis.jsx
import React, { useState } from 'react';
import SimulationViewer from '../components/dashboard/SimulationViewer';
import SimulationModal from '../components/dashboard/SimulationModal';

const SimulationAnalysis = () => {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const predictions = [
    'pred_ganges_kolkata_001',
    'pred_teesta_jalpaiguri_002',
    'pred_damodar_asansol_003'
  ];

  const handleViewSimulation = (predictionId) => {
    setSelectedPrediction(predictionId);
    setShowModal(true);
  };

  return (
    <div className="simulation-analysis-page">
      <h1>Flood Simulation Analysis</h1>
      
      <div className="predictions-list">
        {predictions.map((id) => (
          <button
            key={id}
            onClick={() => handleViewSimulation(id)}
            className="prediction-btn"
          >
            View {id}
          </button>
        ))}
      </div>

      <SimulationModal
        isOpen={showModal}
        predictionId={selectedPrediction}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default SimulationAnalysis;
```

## Data Flow

```
User Interaction
  │
  ├─ Click Alert → AlertCardEnhanced triggers modal
  ├─ Click Location on Map → MapComponent triggers modal
  └─ Manual Selection → SimulationModal opens
  │
  ▼
SimulationModal / SimulationViewer
  │
  ├─ Fetch simulation frames: simulationService.getSimulationFrames()
  │  │
  │  └─ Backend: /api/simulations/{id}
  │
  ├─ Display frames with controls
  │  │
  │  └─ Optional: Fetch ArcGIS rendered frames for each frame
  │     └─ Backend: /api/arcgis/simulations/{id}/frame?time_offset=X
  │
  ├─ User controls playback
  │  │
  │  └─ Updates imageUrl based on currentFrameIndex
  │
  └─ Export options
     │
     ├─ Export as GeoJSON: /api/arcgis/export/{id}?format=geojson
     ├─ Query elevation: /api/arcgis/elevation?lat=X&lon=Y
     └─ Get analytics: /api/arcgis/analytics/{id}
```

## Performance Optimization

1. **Image Caching**: Simulation frames are cached with `Cache-Control: max-age=3600`
2. **Lazy Loading**: Frames load on-demand during animation
3. **Thumbnail Scaling**: Small thumbnails for quick preview
4. **Responsive Images**: Different sizes based on viewport
5. **API Fallback**: Mock data if backend unavailable

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires Pillow for image generation)
- Mobile browsers: Responsive design, touch-friendly controls

## Dependencies

**Backend:**
- `Pillow==10.1.0` - Image generation and processing

**Frontend:**
- `axios` - API calls
- `lucide-react` - Icons
- React 19+ - Component framework

## Future Enhancements

1. **Real ArcGIS Integration**: Connect to actual ArcGIS Online/Server
2. **3D Visualization**: Cesium integration for 3D flood visualization
3. **Time-Lapse Video**: Export simulations as MP4 video
4. **Temporal Analysis**: Compare simulations across different forecast cycles
5. **Web Map Services (WMS)**: Support for WMS layer rendering
6. **Real Satellite Imagery**: Overlay simulations on actual satellite data
7. **Mobile App**: Export to mobile-friendly formats
8. **Notification System**: Alert users when peak flooding time approaches

## Troubleshooting

### Images not loading
- Check backend is running: `python main.py`
- Verify Pillow is installed: `pip install Pillow==10.1.0`
- Check browser console for CORS errors

### Simulation not found
- Verify prediction ID exists in mock data
- Check `/api/predictions/current` for valid IDs
- Ensure prediction ID format matches (e.g., `pred_*_001`)

### Slow animation playback
- Reduce image dimensions: `width=768&height=576`
- Increase playback speed: `2x` or `4x`
- Check browser performance tab for bottlenecks

## API Response Examples

### Simulation Frames Response
```json
{
  "predictionId": "pred_ganges_kolkata_001",
  "location": {
    "name": "Kolkata Metropolitan Area",
    "basin": "Ganges-Hooghly"
  },
  "simulation": {
    "source": "LISFLOOD_v4.2_scenario_ganges-hooghly_20260211",
    "resolution": "500m",
    "totalDuration": 48,
    "frameCount": 7,
    "recommendedFPS": 1
  },
  "frames": [
    {
      "timeOffset": 0,
      "timeLabel": "T+0h (Now)",
      "timestamp": "2026-02-11T10:00:00Z",
      "waterLevel": 0.0,
      "depth": 0.0,
      "affectedArea": 0,
      "imageUrl": "...",
      "thumbnailUrl": "...",
      "isPeak": false
    },
    ...
  ],
  "legend": {
    "depthScale": [
      {"depth": 0.0, "color": "#FFFFFF00", "label": "No flood"},
      ...
    ]
  },
  "metadata": {
    "peakFrame": 3,
    "peakDepth": 5.2,
    "peakArea": 1300,
    "recessionTime": 30
  }
}
```

## Support

For issues or feature requests, check:
- Backend logs: `backend/` directory
- Browser console: F12 Developer Tools
- Network tab: Check API response status
