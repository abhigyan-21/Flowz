# SimulationViewer + ArcGIS Integration Setup

## ✅ What's Been Created

### Frontend Components
- ✅ `SimulationViewer.jsx` - Main animation player with controls
- ✅ `SimulationModal.jsx` - Modal wrapper for full-screen viewing
- ✅ `AlertCardEnhanced.jsx` - Enhanced alert with simulation trigger
- ✅ `simulationService.js` - API client with ArcGIS endpoints

### Styling
- ✅ `simulation.css` - Viewer component styles (dark theme)
- ✅ `simulation-modal.css` - Modal overlay styles
- ✅ `alert-card-enhanced.css` - Enhanced alert card styles

### Backend Services
- ✅ `arcgis_service.py` - ArcGIS service with image generation
- ✅ `arcgis.py` - ArcGIS API router with 7 endpoints
- ✅ Updated `main.py` - Registered ArcGIS router
- ✅ Updated `requirements.txt` - Added Pillow dependency

### Documentation
- ✅ `SIMULATION_VIEWER_INTEGRATION.md` - Complete integration guide

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt  # Installs Pillow 10.1.0

# Frontend (already installed)
npm install
```

### Step 2: Run Backend
```bash
cd backend
python main.py
# Server will start at http://localhost:8000
# Visit http://localhost:8000/docs to see ArcGIS endpoints
```

### Step 3: Use in Your Components

#### Option A: Quick Alert Integration (Already Done)
The `OverlayPanel` now uses `AlertCardEnhanced` automatically.
Each alert has a "View Simulation" button that opens the modal.

#### Option B: Add to Any Component
```jsx
import SimulationModal from './components/dashboard/SimulationModal';
import { useState } from 'react';

const MyComponent = () => {
  const [showSim, setShowSim] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <>
      <button onClick={() => {
        setSelectedId('pred_ganges_kolkata_001');
        setShowSim(true);
      }}>
        View Simulation
      </button>

      <SimulationModal
        isOpen={showSim}
        predictionId={selectedId}
        onClose={() => setShowSim(false)}
      />
    </>
  );
};
```

---

## 📊 API Endpoints Available

```
POST /api/arcgis/compare
GET  /api/arcgis/simulations/{prediction_id}/frame?time_offset=0&width=1024&height=768&format=png
GET  /api/arcgis/elevation?lat=22.5&lon=88.3&radius=0.05
GET  /api/arcgis/flood-extent/{prediction_id}
GET  /api/arcgis/export/{prediction_id}?format=geojson
GET  /api/arcgis/analytics/{prediction_id}
GET  /api/arcgis/tiles/{z}/{x}/{y}
```

---

## 🎮 SimulationViewer Features

### Controls
- **Play/Pause** - Start/stop animation
- **Reset** - Go back to frame 0
- **Speed** - 1x, 2x, 4x playback speed
- **Export** - Download as GeoJSON
- **Timeline** - Drag to scrub through frames
- **Thumbnails** - Click to jump to specific frame

### Display Info
- Water depth (meters)
- Affected area (km²)  
- Water level percentage
- Peak depth
- Color-coded legend
- Simulation metadata

---

## 📋 Integration Checklist

- [x] SimulationViewer component created
- [x] ArcGIS backend service created
- [x] API endpoints created
- [x] Enhanced alert cards with simulation button
- [x] SimulationModal for full-screen viewing
- [x] Image generation with PIL/Pillow
- [x] GeoJSON export capability
- [x] Responsive CSS styling
- [x] Alert→Simulation integration
- [x] Elevation profile support
- [x] Analytics endpoints
- [x] Mock data fallback
- [ ] Connect to real Cesium globe (optional)
- [ ] Add to Home page (optional)

---

## 🔍 File Locations

### Frontend
```
src/
├── components/dashboard/
│   ├── SimulationViewer.jsx
│   ├── SimulationModal.jsx
│   └── AlertCardEnhanced.jsx
├── services/
│   └── simulationService.js
└── styles/
    ├── simulation.css
    ├── simulation-modal.css
    └── alert-card-enhanced.css
```

### Backend
```
backend/
├── app/
│   ├── routers/
│   │   └── arcgis.py
│   └── services/
│       └── arcgis_service.py
├── main.py (updated)
└── requirements.txt (updated)
```

---

## 🎨 Color Scheme

### Flood Depth Scale
- **0m**: Transparent `#FFFFFF00`
- **0.5m**: Light Blue `#B3E5FC`
- **1m**: Sky Blue `#4FC3F7`
- **2m**: Blue `#0288D1`
- **3m**: Navy Blue `#01579B`
- **5m+**: Dark Navy `#1A237E`

### Severity Colors (Alerts)
- **Critical**: Red `#D32F2F`
- **High**: Orange-Red `#FF5722`
- **Moderate**: Orange `#FF9800`
- **Low**: Green `#4CAF50`
- **Info**: Light Blue `#0288D1`

---

## 🧪 Testing

### Test Prediction IDs (from mock data)
```
pred_ganges_kolkata_001        - Kolkata (HIGH risk)
pred_teesta_jalpaiguri_002     - Jalpaiguri (CRITICAL)
pred_damodar_asansol_003       - Asansol (MODERATE)
pred_hooghly_howrah_004        - Howrah (HIGH)
pred_torsa_coochbehar_005      - Cooch Behar (MODERATE)
pred_bhagirathi_murshidabad_006 - Murshidabad (LOW)
pred_sundarbans_southday24_007  - Sundarbans (CRITICAL)
pred_mahananda_malda_008        - Malda (MODERATE)
pred_damodar_bankura_009        - Bankura (LOW)
pred_rupnarayan_westmidnapore_010 - West Midnapore (MODERATE)
```

### Test in Console
```javascript
// Fetch simulation frames
fetch('http://localhost:8000/api/simulations/pred_ganges_kolkata_001')
  .then(r => r.json())
  .then(data => console.log(data));

// Get ArcGIS frame
fetch('http://localhost:8000/api/arcgis/simulations/pred_ganges_kolkata_001/frame?time_offset=18')
  .then(r => r.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    console.log('Frame URL:', url);
  });
```

---

## 🐛 Troubleshooting

### Issue: "Module not found: simulationService"
**Solution**: Ensure `src/services/simulationService.js` exists

### Issue: "Pillow not found" 
**Solution**: 
```bash
pip install Pillow==10.1.0
```

### Issue: Images not displaying
**Solution**: Check:
1. Backend is running (`python main.py`)
2. CORS is enabled (it is, configured for localhost:5173)
3. Network tab shows 200 status
4. PNG is valid (check in browser Image tab)

### Issue: Modal not opening
**Solution**: Ensure:
1. `SimulationModal` is imported correctly
2. `predictionId` is passed and valid
3. `isOpen` state is true
4. Check browser console for errors

### Issue: No data in OverlayPanel
**Solution**:
1. Check alerts API: `GET http://localhost:8000/api/alerts`
2. Verify alert data includes `predictionId` field
3. Check network tab for 200 responses

---

## 📱 Responsive Breakpoints

- **Desktop**: Full-width viewer, 4-column legend
- **Tablet (1024px)**: Adjusted layout, 2-column stats
- **Mobile (768px)**: Modal slides up from bottom
- **Small Mobile (480px)**: Single-column, compact controls

---

## 🔮 Next Steps (Optional)

1. **Connect to Cesium Globe**
   - Add overlay layer to CesiumGlobe
   - Animate flood extent on 3D map
   - Click location → open simulation

2. **Real ArcGIS Integration**
   - Use `@arcgis/core` npm package
   - Query actual ArcGIS imagery
   - Real elevation data from WorldElevation service

3. **Video Export**
   - Generate MP4 from frames
   - Use ffmpeg or canvas recording
   - Download animation

4. **Advanced Analytics**
   - Compare multiple predictions
   - Statistical analysis
   - Risk scoring improvements

5. **Mobile App**
   - React Native port
   - Offline support
   - Push notifications

---

## 📚 Documentation

Full details available in: `SIMULATION_VIEWER_INTEGRATION.md`

Key sections:
- Architecture overview
- Component API reference
- Backend endpoints
- Usage examples
- Data flow diagrams
- Performance optimization
- Troubleshooting guide

---

## ✨ Key Features Implemented

✅ **Animation Player**
- Frame-by-frame playback with controls
- Speed adjustment (1x, 2x, 4x)
- Timeline scrubbing with preview thumbnails

✅ **Real-time Statistics**
- Water depth (meters)
- Affected area (km²)
- Water level percentage
- Peak depth display

✅ **GIS Integration**
- ArcGIS image generation (PIL)
- Elevation profile queries
- GeoJSON export
- Flood extent polygons

✅ **Alert Integration**
- Enhanced alert cards with simulation button
- One-click simulation viewing
- Risk score display
- Location information

✅ **Responsive Design**
- Mobile-friendly controls
- Adaptive layout
- Touch-friendly buttons
- Landscape/portrait support

---

## 🎓 Quick API Usage

```javascript
// In your component
import simulationService from './services/simulationService';

// Get simulation data
const data = await simulationService.getSimulationFrames('pred_ganges_kolkata_001');

// Get ArcGIS rendered frame
const frame = await simulationService.getArcGISFrame('pred_ganges_kolkata_001', 18);

// Export as GeoJSON
const geojson = await simulationService.exportAsGISLayer('pred_ganges_kolkata_001', 'geojson');
```

---

**Ready to use! Start the backend and frontend to see the SimulationViewer in action.** 🚀
