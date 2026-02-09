# 🌊 Flowz - Flood Prediction System

> A complete, production-ready flood prediction and response management system with real-time monitoring, ML-powered predictions, and interactive visualization.

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

Flowz is a comprehensive flood prediction and response management system designed for West Bengal. It combines:

- **FastAPI Backend**: RESTful API with realistic mock data, ready for ML model integration
- **React Frontend**: Interactive 3D globe visualization with real-time alerts and analytics
- **Database Layer**: PostgreSQL + PostGIS schema for geospatial data
- **Docker Support**: Complete containerization for easy deployment

The system provides flood monitoring, predictive analytics, evacuation planning, and alert management for disaster response teams.

---

## **Latest Project Updates (2026-02-09)**

- Backend replaced and extended with Deep Learning ingestion endpoints (`/api/predictions/ingest`, `/api/predictions/dl/summary`, `/api/predictions/dl/{id}`, etc.). See `backend/app/routers/dl_predictions.py`.
- Model post-processing pipeline integrated into the repo at `backend/model_pipeline/` (NetCDF/GeoTIFF/preview generation, S3/CRF upload hooks).
- Both database schemas are present: `backend/database/schema.sql` (original) and `backend/database/schema_dl.sql` (DL tables). `docker-compose.yml` maps both into the DB init folder.
- Frontend Analytics page now fetches live DL summary from `/api/predictions/dl/summary` and falls back to local mock data when the backend is unreachable. See `src/services/analyticsService.js` and `src/pages/Analytics.jsx`.
- Loader and layout UX: `src/components/ui/WaterLoader.jsx` accepts `durationMs` and `src/components/layout/MainLayout.jsx` renders content behind the loader to avoid a white flash while the globe initializes.
- If you hit a backend install error on Windows related to `pydantic-core`, see the Quick Start troubleshooting notes below.


## ✨ Features

### 🌍 Interactive 3D Globe
- Real-time CesiumJS visualization of West Bengal
- High-fidelity terrain rendering with satellite imagery
- Color-coded severity indicators for flood zones
- Smooth camera controls and zoom capabilities
- Fallback to 2D WebGL globe if 3D context unavailable

### 📊 Real-Time Monitoring
- Active flood alerts with severity levels (Critical/High/Moderate/Low)
- Current predictions for 10+ West Bengal locations
- Live status indicators and update timestamps
- Responsive alert panel with filtering capabilities

### 🔮 Predictive Analytics
- 7-day and 24-hour flood risk forecasts
- Water level predictions with confidence intervals
- Hydrograph data visualization
- Risk assessment by location and severity

### 🚨 Evacuation Planning
- Safe and cautious evacuation routes
- Shelter location and capacity information
- Real-time route optimization
- Contact information for emergency services

### 📈 Historical Analytics
- Flood incident trends and statistics
- Rainfall pattern analysis
- Water level trends over time
- Interactive charts and data visualization

### 🎨 Modern UI/UX
- Glassmorphism design with translucent panels
- Fully responsive layout (mobile, tablet, desktop)
- Smooth animations and micro-interactions
- Dark/light theme support
- Accessibility-first design principles

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite)                           │  │
│  │  - 3D CesiumJS Globe                             │  │
│  │  - Dashboard Components                          │  │
│  │  - Alert & Analytics Pages                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP/REST
                  (http://localhost:8000/api)
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                      │
│                    (Port 8000)                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes                                      │  │
│  │  ├── /api/predictions/current                    │  │
│  │  ├── /api/alerts/generate                        │  │
│  │  ├── /api/simulation/{id}                        │  │
│  │  ├── /api/timeseries/{id}/hydrograph            │  │
│  │  ├── /api/history/{id}                          │  │
│  │  └── /api/config/severity-levels                │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↕                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Mock Data Service                               │  │
│  │  - 10 West Bengal Locations                      │  │
│  │  - Realistic Predictions                         │  │
│  │  - Simulation Frames                             │  │
│  │  - Hydrograph Data                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↕ SQL
┌─────────────────────────────────────────────────────────┐
│     PostgreSQL + PostGIS (Optional - Future Use)        │
│     - Geospatial data storage                           │
│     - Time series data (TimescaleDB)                    │
│     - Historical flood records                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.104.1 | REST API framework |
| Server | Uvicorn | 0.24.0 | ASGI server |
| Data Validation | Pydantic | 2.5.0 | Schema validation |
| ORM | SQLAlchemy | 2.0.23 | Database ORM |
| Geo | GeoAlchemy2 | 0.14.2 | PostGIS support |
| DB Driver | psycopg2 | 2.9.9 | PostgreSQL driver |
| Config | Pydantic Settings | 2.1.0 | Environment config |
| Environment | python-dotenv | 1.0.0 | .env file support |

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19.2.0 | UI framework |
| Build Tool | Vite | 7.2.4 | Build & dev server |
| Styling | Vanilla CSS | - | Modular CSS modules |
| 3D Maps | CesiumJS | 1.136.0 | 3D globe visualization |
| Fallback Maps | react-globe.gl | 2.37.0 | 2D globe fallback |
| HTTP Client | axios | 1.13.2 | API requests |
| Routing | react-router-dom | 7.11.0 | Client-side routing |
| Charts | recharts | 3.6.0 | Data visualization |
| Icons | lucide-react | 0.562.0 | Icon library |
| 3D Graphics | Three.js | 0.182.0 | 3D rendering |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Container | Docker | Application containerization |
| Orchestration | Docker Compose | Multi-container setup |
| Database | PostgreSQL 15 | Primary data store |
| Spatial DB | PostGIS 3.3 | Geospatial queries |
| Version Control | Git | Source code management |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 16+** & **npm 8+** (for frontend)
- **Docker & Docker Compose** (optional, for containerized setup)

### Option 1: Local Development (Recommended)

#### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start backend server
python main.py
```

Notes & Windows troubleshooting:

- On Windows, `pydantic-core` may attempt to build native wheels and require the Rust toolchain. If you see errors like "Cargo/Rust not found" or "pydantic-core metadata generation failed", either:
  - Install Rust (recommended):
    ```powershell
    curl https://sh.rustup.rs -sSf | sh
    ```
    then re-open the terminal and run `pip install -r requirements.txt`.
  - Or use WSL (Ubuntu) and install dependencies there, which often avoids native build issues.
  - Alternatively, upgrade `pip` so binary wheels are preferred: `python -m pip install --upgrade pip` and retry.

If installing native build toolchains is not possible, you can continue frontend development: the Analytics page uses a mock fallback so charts render without a running backend.

Quick-test: ingest a sample DL prediction (once backend is running) to populate summaries:

```bash
curl -X POST http://localhost:8000/api/predictions/ingest \
  -H "Content-Type: application/json" \
  -d '{"prediction_id":"test-001","location":{"region":"Test Region","basin":"TestBasin","bounds":{}},"grid_shape":{"timesteps":3,"rows":10,"cols":10},"raster_data":{"netcdf_crf_url":"https://example.com/netcdf","geotiff_urls":[],"preview_urls":[]},"aggregated_metrics":{"peak_depth_max":1.2,"affected_area_km2":12},"risk_assessment":{"severity_class":"MEDIUM","risk_score":45},"inference_timestamp":"2026-02-09T00:00:00Z","forecast_cycle":"2026-02-09T00:00:00Z"}'
```


Backend will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

#### Step 2: Frontend Setup (new terminal)

```bash
# From project root
npm install

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### Option 2: Docker Compose (Full Stack)

```bash
# From project root
docker-compose up -d
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

To stop services:
```bash
docker-compose down
```

---

## 📁 Project Structure

```
Flowz/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                 # Configuration & Settings
│   │   ├── routers/                  # API endpoint definitions
│   │   │   ├── alerts.py             # Alert generation endpoints
│   │   │   ├── predictions.py        # Prediction endpoints
│   │   │   ├── simulation.py         # Simulation frame endpoints
│   │   │   ├── timeseries.py         # Hydrograph data endpoints
│   │   │   ├── history.py            # Historical data endpoints
│   │   │   └── config.py             # Configuration endpoints
│   │   ├── schemas/                  # Pydantic models
│   │   │   └── models.py             # API response schemas
│   │   └── services/                 # Business logic
│   │       └── mock_data.py          # Mock data service
│   ├── database/
│   │   └── schema.sql                # PostgreSQL + PostGIS schema
│   ├── .env                          # Backend environment variables
│   ├── .env.example                  # Example environment file
│   ├── Dockerfile                    # Backend container image
│   ├── main.py                       # FastAPI application entry point
│   ├── requirements.txt              # Python dependencies
│   └── venv/                         # Virtual environment (git-ignored)
│
├── src/                              # React Frontend
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AlertCard.jsx         # Individual alert card
│   │   │   └── OverlayPanel.jsx      # Alert/Evacuation overlay
│   │   ├── layout/
│   │   │   ├── Header.jsx            # App header with title
│   │   │   └── MainLayout.jsx        # Main layout wrapper
│   │   ├── map/
│   │   │   ├── CesiumGlobe.jsx       # CesiumJS globe component
│   │   │   ├── Globe3D.jsx           # 3D globe wrapper
│   │   │   └── MapComponent.jsx      # Map integration component
│   │   └── ui/
│   │       └── WaterLoader.jsx       # Loading animation
│   ├── pages/
│   │   ├── Home.jsx                  # Main page with globe
│   │   ├── Analytics.jsx             # Analytics dashboard
│   │   ├── Forecast.jsx              # Flood predictions
│   │   ├── AlertsHistory.jsx         # Alert history log
│   │   ├── AboutUs.jsx               # About page
│   │   └── EmergencyContacts.jsx     # Emergency contacts
│   ├── services/
│   │   ├── apiClient.js              # Axios HTTP client
│   │   ├── alertService.js           # Alert API calls
│   │   ├── forecastService.js        # Forecast API calls
│   │   ├── evacuationService.js      # Evacuation API calls
│   │   └── locationService.js        # Location API calls
│   ├── context/
│   │   └── MapContext.jsx            # React Context for map state
│   ├── data/
│   │   ├── indianRivers.js           # GeoJSON river data
│   │   └── indiaOutline.js           # GeoJSON India outline
│   ├── styles/
│   │   ├── main.css                  # Global styles
│   │   ├── map.css                   # Map component styles
│   │   ├── dashboard.css             # Dashboard styles
│   │   ├── analytics.css             # Analytics page styles
│   │   ├── forecast.css              # Forecast page styles
│   │   └── loader.css                # Loader animation styles
│   ├── assets/                       # Images and static files
│   ├── App.jsx                       # Main App component
│   ├── main.jsx                      # React entry point
│   └── index.css                     # CSS imports

├── public/                           # Static assets served as-is
├── .env                              # Frontend environment variables
├── .env.example                      # Example .env file
├── .gitignore                        # Git ignore rules
├── docker-compose.yml                # Docker Compose configuration
├── Dockerfile.frontend               # Frontend container image
├── eslint.config.js                  # ESLint configuration
├── package.json                      # NPM dependencies and scripts
├── package-lock.json                 # Locked dependency versions
├── vite.config.js                    # Vite build configuration
├── index.html                        # HTML entry point
└── README.md                         # This file
```

### Key Directories Explained

**Backend** (`/backend`)
- REST API server with FastAPI framework
- Mock data service with 10 West Bengal locations
- Ready for ML model integration
- PostgreSQL + PostGIS schema included

**Frontend** (`/src`)
- React components for UI/UX
- 3D globe visualization with CesiumJS
- Multiple pages: Home, Analytics, Forecast, Alerts History
- Service layer for API communication

**Services** (`/src/services`)
- `apiClient.js` - Base Axios instance configured for http://localhost:8000/api
- `alertService.js` - Fetches current alerts
- `forecastService.js` - Gets flood forecasts
- `evacuationService.js` - Evacuation route and shelter data
- `locationService.js` - Location search and geocoding

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

All API endpoints are prefixed with `/api`

### Health Check
```http
GET /health
```
Returns system health status and current mode (mock/production)

### Response Format
```json
{
  "status": "healthy",
  "mode": "mock"
}
```

### Predictions Endpoints

#### Get Current Predictions
```http
GET /api/predictions/current
```

Returns all current flood predictions across West Bengal locations.

**Response:**
```json
{
  "predictions": [
    {
      "id": "pred_001",
      "location": "Kolkata",
      "latitude": 22.5726,
      "longitude": 88.3639,
      "riskScore": 0.87,
      "severityLevel": "HIGH",
      "waterLevel": 1.25,
      "description": "High water levels in Kolkata region",
      "status": "ACTIVE"
    }
  ],
  "metadata": {
    "totalLocations": 10,
    "lastUpdated": "2026-02-07T08:30:00Z",
    "modelVersion": "1.0.0"
  }
}
```

### Alerts Endpoints

#### Get Generated Alerts
```http
GET /api/alerts/generate
```

Returns actionable alerts for high-risk areas.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "level": "CRITICAL",
      "message": "Flood alert for Jalpaiguri region",
      "affectedAreas": ["Jalpaiguri", "Darjeeling"],
      "recommendedAction": "Immediate evacuation recommended",
      "generatedAt": "2026-02-07T08:30:00Z"
    }
  ]
}
```

### Simulation Endpoints

#### Get Simulation Frames
```http
GET /api/simulation/{predictionId}
```

Returns animation frames for flood simulation.

### Time Series Endpoints

#### Get Hydrograph Data
```http
GET /api/timeseries/{predictionId}/hydrograph
```

Returns time series data for water level predictions.

### History Endpoints

#### Get Historical Data
```http
GET /api/history/{predictionId}
```

Returns historical flood data for a location.

### Configuration Endpoints

#### Get Severity Levels
```http
GET /api/config/severity-levels
```

Returns risk severity level definitions.

### Interactive API Documentation

Visit **http://localhost:8000/docs** (Swagger UI) for interactive API testing

---

## 🔧 Development

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Backend Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start development server (auto-reload enabled)
python main.py

# Access API documentation
# Open http://localhost:8000/docs in browser
```

### Adding New API Endpoints

1. Create route file in `/backend/app/routers/`
2. Define Pydantic schema in `/backend/app/schemas/models.py`
3. Implement business logic in `/backend/app/services/`
4. Register router in `/backend/main.py`

Example:
```python
# /backend/app/routers/new_feature.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/new-endpoint")
async def get_new_data():
    return {"data": "value"}
```

### Adding New Frontend Pages

1. Create page component in `/src/pages/`
2. Add route in `/src/App.jsx`
3. Create page-specific CSS in `/src/styles/`
4. Add navigation link in `/src/components/layout/Header.jsx`

---

## 🐳 Deployment

### Docker Compose Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up -d --build
```

### Production Deployment Checklist

- [ ] Update environment variables (`.env` files)
- [ ] Set `MOCK_MODE=false` and configure real database
- [ ] Enable HTTPS/SSL
- [ ] Configure logging and monitoring
- [ ] Set up database backups
- [ ] Configure CI/CD pipeline
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Enable authentication/authorization
- [ ] Set up API versioning

### Environment Variables

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**Backend** (`backend/.env`):
```env
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
MOCK_MODE=true
DATABASE_URL=postgresql://user:password@localhost:5432/flood_prediction
CDN_BASE_URL=https://cdn.yourapp.com
AUTO_REFRESH=false
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make changes** with clear commit messages
4. **Write/update tests**
5. **Update documentation**
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open Pull Request**

### Code Standards

- **Backend**: Follow PEP 8 (Python)
- **Frontend**: Follow Airbnb JavaScript style guide
- **Commits**: Use conventional commits format
- **Documentation**: Keep README and code comments updated

### Bug Reports

Please include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- System information (OS, browser, versions)

---

## 📊 Mock Data Locations

The system includes realistic data for these West Bengal locations:

| Location | Latitude | Longitude | Risk Level | Status |
|----------|----------|-----------|-----------|--------|
| Kolkata | 22.5726 | 88.3639 | HIGH | Active |
| Jalpaiguri | 26.5230 | 88.7255 | CRITICAL | Active |
| Sundarbans | 21.9497 | 89.1833 | CRITICAL | Active |
| Siliguri | 26.5271 | 88.3953 | MODERATE | Monitored |
| Darjeeling | 27.0410 | 88.2663 | HIGH | Active |
| Digha | 21.6266 | 87.5074 | MODERATE | Monitored |
| Hooghly | 22.3039 | 88.3957 | HIGH | Active |
| Medinipur | 22.7745 | 87.3041 | MODERATE | Monitored |
| Birbhum | 24.0948 | 87.3469 | LOW | Monitored |
| Purulia | 23.3338 | 85.2662 | LOW | Monitored |

---

## 🔗 External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [CesiumJS Guide](https://cesium.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Docker Documentation](https://docs.docker.com/)

---

## 📝 License

This project is open source under the MIT License.

---

## 👥 Support

For issues, questions, or suggestions:

1. Check existing documentation
2. Search for similar issues
3. Create a detailed issue report
4. Contact the maintainers

---

## 🎉 Acknowledgments

Built with:
- **FastAPI** for backend excellence
- **React + Vite** for modern frontend
- **CesiumJS** for 3D visualization
- **PostGIS** for geospatial capabilities

---

## 📈 Future Enhancements

- [ ] Integration with real ML models (LISFLOOD)
- [ ] Real-time database connectivity
- [ ] WebSocket support for live updates
- [ ] Mobile app (React Native)
- [ ] Advanced user authentication
- [ ] Multi-language support
- [ ] Offline functionality
- [ ] Advanced analytics and reporting
- [ ] Integration with IoT sensors
- [ ] Blockchain for alert records

---

**Last Updated**: February 7, 2026  
**Status**: ✅ Production Ready (Mock Data)
