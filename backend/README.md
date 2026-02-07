# West Bengal Flood Prediction API - Backend

FastAPI backend with mock data for ML-driven flood prediction system.

## Features

- ✅ Complete REST API with all endpoints
- ✅ Realistic mock data for 10 West Bengal locations
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configured for frontend
- ✅ Ready for ML model integration
- ✅ PostgreSQL + PostGIS schema ready

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for development)
```

### 3. Run Server

```bash
python main.py
```

Server will start at: `http://localhost:8000`

### 4. View API Documentation

Open in browser: `http://localhost:8000/docs`

## API Endpoints

### Predictions
- `GET /api/predictions/current` - Get all current predictions
- Returns 10 locations across West Bengal with risk scores, severity, and forecasts

### Simulation
- `GET /api/simulation/{prediction_id}` - Get flood animation frames
- Returns pre-rendered image URLs and metadata for visualization

### Alerts
- `GET /api/alerts/generate` - Get human-readable alerts
- Returns HIGH and CRITICAL severity alerts with safety actions

### Time Series
- `GET /api/timeseries/{prediction_id}/hydrograph` - Get discharge data
- Returns forecast and observed discharge for charts

### Configuration
- `GET /api/config/severity-levels` - Get severity level config
- Returns color codes and thresholds for UI

### History (Placeholder)
- `GET /api/history/{prediction_id}` - Get validation data
- `GET /api/history/timeline` - Get prediction timeline
- Will be populated when actual events occur

## Mock Data Locations

1. **Kolkata Metropolitan Area** (HIGH) - Ganges-Hooghly basin
2. **Jalpaiguri District** (CRITICAL) - Teesta basin
3. **Asansol-Durgapur** (MODERATE) - Damodar basin
4. **Howrah District** (HIGH) - Ganges-Hooghly basin
5. **Cooch Behar** (MODERATE) - Torsa basin
6. **Murshidabad** (LOW) - Bhagirathi basin
7. **South 24 Parganas/Sundarbans** (CRITICAL) - Coastal
8. **Malda** (MODERATE) - Mahananda basin
9. **Bankura** (LOW) - Damodar basin
10. **West Midnapore** (MODERATE) - Rupnarayan basin

## Integrating Your ML Model

When your LISFLOOD-trained model is ready:

### 1. Replace Mock Service

Edit `app/services/mock_data.py` or create `app/services/ml_prediction.py`:

```python
class MLPredictionService:
    def __init__(self, model_path: str):
        # Load your trained model
        self.model = load_model(model_path)
    
    def get_current_predictions(self):
        # Get real-time weather/gauge data
        weather_data = fetch_imd_forecast()
        gauge_data = fetch_gauge_readings()
        
        # Run ML inference
        predictions = self.model.predict(weather_data, gauge_data)
        
        # Format as API response
        return format_predictions(predictions)
```

### 2. Update Router

In `app/routers/predictions.py`:

```python
from app.services.ml_prediction import ml_service  # Instead of mock_service

@router.get("/predictions/current")
async def get_current_predictions():
    return ml_service.get_current_predictions()
```

### 3. Add Real Simulation Images

Update image URLs in simulation frames to point to your LISFLOOD outputs:

```python
# In ml_prediction.py
frame["imageUrl"] = f"{settings.CDN_BASE_URL}/simulations/{prediction_id}/frame_{i}.png"
```

Upload LISFLOOD PNG outputs to your CDN/storage.

## Database Setup (Production)

### PostgreSQL + PostGIS

```bash
# Install PostgreSQL and PostGIS
sudo apt-get install postgresql postgis

# Create database
sudo -u postgres psql
CREATE DATABASE flood_prediction;
\c flood_prediction
CREATE EXTENSION postgis;
```

### Run Migrations

```bash
# Schema is in database/schema.sql
psql -U postgres -d flood_prediction -f database/schema.sql
```

### Update .env

```
DATABASE_URL=postgresql://user:password@localhost:5432/flood_prediction
MOCK_MODE=false
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── app/
│   ├── config.py          # Settings
│   ├── routers/           # API endpoints
│   │   ├── predictions.py
│   │   ├── simulation.py
│   │   ├── alerts.py
│   │   ├── timeseries.py
│   │   ├── history.py
│   │   └── config.py
│   ├── schemas/           # Pydantic models
│   │   └── models.py
│   └── services/          # Business logic
│       └── mock_data.py   # Mock data generator
└── database/              # SQL schemas
    └── schema.sql
```

## Testing

```bash
# Run with auto-reload for development
python main.py

# Test endpoints
curl http://localhost:8000/api/predictions/current
curl http://localhost:8000/api/simulation/pred_ganges_kolkata_001
```

## Deployment

### Docker (Recommended)

```bash
docker build -t flood-api .
docker run -p 8000:8000 flood-api
```

### Production Server

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Next Steps

1. ✅ Backend is ready with mock data
2. 📊 Connect frontend (see frontend/README.md)
3. 🤖 Train ML model with LISFLOOD data
4. 🔌 Replace mock service with ML predictions
5. 🗄️ Set up production database
6. 🚀 Deploy to cloud (AWS/Azure/GCP)

## Support

For questions or issues, refer to:
- API Docs: http://localhost:8000/docs
- FastAPI Documentation: https://fastapi.tiangolo.com/
- PostGIS Documentation: https://postgis.net/
