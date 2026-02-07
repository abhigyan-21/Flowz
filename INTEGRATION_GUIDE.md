# Project Setup Guide - Integrated Flood Prediction System

## ✅ Integration Complete

The flood-prediction-system backend and frontend have been successfully integrated with your existing project. Here's what was consolidated:

### Changes Made

1. **Backend Location**: FastAPI backend moved to `/backend/` at root level
2. **Frontend**: Only one frontend at root `/src/` (consolidated)
3. **API Connection**: Updated all services to connect to `http://localhost:8000/api`
4. **Mock Services Removed**: Mock data replaced with real FastAPI endpoints
5. **Configuration Files**: Added `.env` and `docker-compose.yml` at root

### Project Structure (After Integration)

```
Flowz/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── routers/           # API endpoints (alerts, predictions, etc.)
│   │   ├── schemas/           # Data models
│   │   ├── services/          # Business logic
│   │   └── config.py          # Configuration
│   ├── database/              # Database schemas
│   ├── Dockerfile             # Backend Docker image
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt       # Python dependencies
│   └── .env                  # Backend configuration
│
├── src/                        # React Frontend (Only one frontend)
│   ├── components/            # React components
│   ├── pages/                 # Page components
│   ├── services/              # API clients (connected to FastAPI)
│   │   ├── apiClient.js      # Axios instance (points to http://localhost:8000/api)
│   │   ├── alertService.js   # Alert API calls
│   │   ├── forecastService.js # Forecast API calls
│   │   └── evacuationService.js # Evacuation API calls
│   ├── styles/                # CSS files
│   └── main.jsx              # React entry point
│
├── public/                     # Static assets
├── package.json               # Frontend dependencies
├── vite.config.js            # Vite configuration
├── Dockerfile.frontend        # Frontend Docker image
├── docker-compose.yml         # Docker setup (backend + frontend + postgres)
├── .env                      # Frontend environment variables
└── README.md                 # Project documentation
```

## 🚀 Quick Start

### Option 1: Local Development (Without Docker)

#### Start Backend:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
Backend runs at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

#### Start Frontend (in new terminal):
```bash
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Option 2: Docker Compose (Full Stack)

```bash
docker-compose up -d
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

## 📋 API Endpoints

All endpoints are documented at `http://localhost:8000/docs` when backend is running.

### Key Endpoints:
- `GET /api/predictions/current` - Get flood predictions
- `GET /api/alerts/generate` - Get active alerts
- `GET /api/timeseries/{id}/hydrograph` - Get time series data
- `GET /api/config/severity-levels` - Get severity configuration
- `GET /api/history/{id}` - Get historical data

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (backend/.env)
```
PORT=8000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173
MOCK_MODE=true
DATABASE_URL=postgresql://user:password@localhost:5432/flood_prediction
```

## 📦 Connected Services

| Service | Import | Endpoint |
|---------|--------|----------|
| Alerts | `alertService` | `GET /api/alerts/generate` |
| Evacuation | `evacuationService` | `POST /api/evacuation/plan` |
| Forecasts | `forecastService` | `GET /api/timeseries/{id}/hydrograph` |
| Location | `locationService` | Uses OpenStreetMap Nominatim |

## ✨ Key Features

- ✅ FastAPI backend with mock data (ready for real ML models)
- ✅ React + Vite + Cesium frontend
- ✅ PostgreSQL + PostGIS support
- ✅ Docker Compose setup
- ✅ Real API connections (no more mock services)
- ✅ CORS configured for both localhost:5173 and localhost:3000

## 🛠️ Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Backend
python main.py       # Start backend
```

## 📝 Notes

- All existing component designs are preserved
- Mock API services are replaced with real FastAPI endpoints
- Frontend configuration points to `http://localhost:8000/api`
- Ready for integration with actual ML models and database
- Docker setup includes PostgreSQL for future production use

## 🔗 Configuration Reference

**Frontend API Configuration** ([src/services/apiClient.js](src/services/apiClient.js)):
- Base URL: Uses `VITE_API_BASE_URL` environment variable
- Defaults to: `http://localhost:8000/api`

**Backend CORS** ([backend/main.py](backend/main.py)):
- Allows: `http://localhost:5173` (Vite dev server)
- Allows: `http://localhost:3000` (alternative)

---

**Ready to go!** Start the backend and frontend, and your application will be fully connected to the FastAPI services.
