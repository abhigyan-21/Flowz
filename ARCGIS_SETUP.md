# ArcGIS Integration Setup Guide

## Quick Start

### Step 1: Get Your ArcGIS API Key

1. Go to [ArcGIS Developer Portal](https://developers.arcgis.com/)
2. Click **Sign Up** (Choose **Free Plan**)
3. Create your developer account
4. After login, go to **Dashboard** → **API Keys**
5. Click **Create New Key**
6. Fill in details:
   - **Name:** `Flowz Flood Simulation`
   - **Description:** Flood extent and simulation visualization
   - Check: `Maps`, `Visualization`, `Routing`
7. Copy your API Key (e.g., `AAPK1234567890abcdef...`)

### Step 2: Add to Frontend (.env.local)

**File:** `c:/Users/abhig/Desktop/codes/Flowz/.env.local`

```env
# ArcGIS API Configuration
VITE_ARCGIS_API_KEY=AAPK1234567890abcdef_YOUR_KEY_HERE

# Cesium Ion Token (optional, already configured)
VITE_CESIUM_ION_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Base URL
VITE_API_BASE_URL=http://localhost:8000

# Map Configuration
VITE_MAP_CENTER_LAT=22.5937
VITE_MAP_CENTER_LNG=78.9629
VITE_MAP_ZOOM=5
```

### Step 3: Add to Backend (.env)

**File:** `c:/Users/abhig/Desktop/codes/Flowz/backend/.env`

```env
# ArcGIS API Configuration
ARCGIS_API_KEY=AAPK1234567890abcdef_YOUR_KEY_HERE
ENABLE_ARCGIS=true
USE_MOCK_DATA=false
```

Replace `AAPK1234567890abcdef_YOUR_KEY_HERE` with your actual API key from Step 1.

### Step 4: Restart Services

```bash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend  
npm run dev
```

## How It Works

**Frontend Flow:**
1. `CesiumGlobe.jsx` reads API key from `import.meta.env.VITE_ARCGIS_API_KEY`
2. `arcgisVisualizationService.js` calls backend endpoints
3. UI displays flood extent polygons and animated simulation frames

**Backend Flow:**
1. `config.py` reads API key from environment
2. `/api/arcgis/*` endpoints generate simulation imagery
3. Returns PNG frames with flood extent data

## Testing Without Real ArcGIS API

If you don't have an ArcGIS account yet, the app uses **mock data** by default:

1. Keep `USE_MOCK_DATA=true` in backend `.env`
2. Frontend will still work with simulated flood data
3. Once you have real API key, switch to `USE_MOCK_DATA=false`

## Endpoints Reference

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /api/arcgis/simulations/{id}/frame?time_offset=0` | Get simulation frame | Returns PNG image |
| `GET /api/arcgis/flood-extent/{id}` | Get flood boundaries | Returns GeoJSON |
| `GET /api/arcgis/elevation?lat=24.2&lon=88.3` | Get elevation data | Returns elevation(m) |
| `GET /api/arcgis/analytics/{id}` | Get flood statistics | Returns peak depth, area |

## Troubleshooting

### "API key not found"
- ✅ Check `.env` file has correct key
- ✅ Backend must be restarted after changing `.env`
- ✅ Frontend must be restarted after changing `.env.local`

### "Invalid API Key" 
- ✅ Copy exactly from ArcGIS Developer Portal
- ✅ No spaces before/after the key
- ✅ Key should start with `AAPK`

### Still seeing mock data?
- ✅ Check `USE_MOCK_DATA=true` or `false` setting
- ✅ With `false`, real API will be called
- ✅ With `true`, simulated data is used (good for testing)

## Support

- ArcGIS Docs: https://developers.arcgis.com/documentation/
- Cesium.js Docs: https://cesium.com/docs/
- Project Issues: Check GitHub Issues

