# Pipeline Quick Reference Guide

## 🚀 Running the Pipeline

### Basic Execution
```bash
cd Flowz/pipeline
python orchestrator.py
```
Creates: `data_store/runs/run_2026_02_10_1500_AUTO/`

### Custom Run Suffix
```bash
python orchestrator.py --suffix MY_EXPERIMENT
```
Creates: `data_store/runs/run_2026_02_10_1500_MY_EXPERIMENT/`

### Use Specific Run ID
```bash
python orchestrator.py --run-id run_2026_02_10_1114_FIXED
```

### List All Runs
```bash
python orchestrator.py --list
```

### Get Run Summary
```bash
python orchestrator.py --summary run_2026_02_10_1114_FIXED
```

---

## 📊 Accessing Predictions in Python

### Get Latest Predictions
```python
from pipeline.data_bridge import DataBridge

latest = DataBridge.get_latest_run_data()
predictions = latest['predictions']['risk_summary']
print(f"Risk Score: {predictions['riskScore']}")
print(f"Severity: {predictions['severityLevel']}")
```

### Get Specific Run Data
```python
from pipeline.data_bridge import DataBridge

run_data = DataBridge.get_run_data("run_2026_02_10_1114_FIXED")
print(f"Location: {run_data['predictions']['risk_summary']['location']}")
```

### List All Runs
```python
from pipeline.data_bridge import DataBridge

all_runs = DataBridge.list_all_runs()
for run in all_runs:
    print(f"{run['run_id']} - Status: {run['status']}")
```

### Export as GeoJSON
```python
from pipeline.data_bridge import DataBridge

geojson = DataBridge.export_run_as_geojson("run_2026_02_10_1114_FIXED")
# Use with mapping libraries (Leaflet, Mapbox, etc.)
```

---

## 🔌 Backend API Endpoints

Once you add `PIPELINE_INTEGRATION_EXAMPLE.py` to your backend:

### Trigger Pipeline Run
```bash
curl -X POST http://localhost:8000/api/flood/pipeline/run?suffix=MANUAL
```

### Get Latest Predictions
```bash
curl http://localhost:8000/api/flood/predictions/latest
```

### Get Specific Run Predictions
```bash
curl http://localhost:8000/api/flood/predictions/run/run_2026_02_10_1114_FIXED
```

### Get Complete Run Data
```bash
curl http://localhost:8000/api/flood/data/run/run_2026_02_10_1114_FIXED
```

### List All Runs
```bash
curl http://localhost:8000/api/flood/runs/list
```

### Get Run Count
```bash
curl http://localhost:8000/api/flood/runs/count
```

### Get Latest Run ID
```bash
curl http://localhost:8000/api/flood/runs/latest-id
```

### Export as GeoJSON
```bash
curl http://localhost:8000/api/flood/export/geojson/run_2026_02_10_1114_FIXED
```

### Check Pipeline Health
```bash
curl http://localhost:8000/api/flood/health
```

---

## 💻 Common Code Snippets

### Backend: FastAPI Route (Copy from PIPELINE_INTEGRATION_EXAMPLE.py)
```python
from fastapi import APIRouter
import sys
from pathlib import Path

router = APIRouter()
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "pipeline"))
from data_bridge import DataBridge

@router.get("/api/flood/predictions/latest")
async def get_latest_predictions():
    try:
        data = DataBridge.get_latest_run_data()
        return data['predictions']['risk_summary']
    except Exception as e:
        return {"error": str(e)}
```

### Frontend: React Hook
```javascript
import { useEffect, useState } from 'react';

export function useFloodData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetch('/api/flood/predictions/latest')
            .then(r => r.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, []);
    
    return { data, loading, error };
}

// Usage in component:
export function Dashboard() {
    const { data, loading } = useFloodData();
    
    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;
    
    return (
        <div>
            <h2>{data.location}</h2>
            <p>Risk: {data.riskScore}</p>
            <p>Severity: {data.severityLevel}</p>
        </div>
    );
}
```

### Frontend: Display Predictions
```javascript
function FloodAlert({ run_id }) {
    const [predictions, setPredictions] = useState(null);
    
    useEffect(() => {
        fetch(`/api/flood/predictions/run/${run_id}`)
            .then(r => r.json())
            .then(setPredictions);
    }, [run_id]);
    
    if (!predictions) return null;
    
    const severity_colors = {
        'LOW': '#green',
        'MODERATE': '#yellow',
        'HIGH': '#orange',
        'CRITICAL': '#red'
    };
    
    return (
        <div style={{
            padding: '20px',
            backgroundColor: severity_colors[predictions.severityLevel],
            borderRadius: '8px'
        }}>
            <h3>{predictions.location}</h3>
            <p>Water Level: {predictions.waterLevel}m</p>
            <p>Risk Score: {(predictions.riskScore * 100).toFixed(1)}%</p>
        </div>
    );
}
```

### Scheduled Pipeline Execution
```python
# In backend main file
from apscheduler.schedulers.background import BackgroundScheduler
from pipeline.orchestrator import run_pipeline
from pipeline.config import Config

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('cron', hour='*/6')
def scheduled_flood_forecast():
    """Run flood prediction every 6 hours"""
    try:
        run_id = Config.get_run_id("SCHEDULED")
        run_pipeline(run_id=run_id)
        print(f"Scheduled run completed: {run_id}")
    except Exception as e:
        print(f"Scheduled run failed: {e}")

scheduler.start()
```

---

## 📂 Complete Run Output Structure

After running pipeline, you'll have:

```
data_store/runs/run_2026_02_10_1500_AUTO/
├── 01_ingestion/
│   └── ingestion_metadata.json
│       └── Contains: data sources, status
│
├── 02_lisflood_os/
│   └── lisflood_os_results.json
│       └── Contains: 1D simulation parameters & results
│
├── 03_lisflood_fp/
│   └── lisflood_fp_results.json
│       └── Contains: 2D simulation parameters & results
│
├── 04_predictions/
│   ├── final_map.tif
│   │   └── GeoTIFF flood depth map
│   ├── risk_summary.json
│   │   └── Contains: risk_score, severity_level, water_level, etc.
│   └── [other outputs]
│
└── pipeline_report.json
    └── Contains: execution timeline, status, stage details
```

---

## 🔍 Data Formats

### Risk Summary JSON
```json
{
  "id": "run_2026_02_10_1114_FIXED",
  "location": "Kolkata Region",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "riskScore": 0.95,
  "severityLevel": "CRITICAL",
  "waterLevel": 3.2,
  "status": "ACTIVE",
  "timestamp": "2026-02-10T11:14:14.826311"
}
```

### GeoJSON Output
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [88.3639, 22.5726]
      },
      "properties": {
        "run_id": "run_2026_02_10_1114_FIXED",
        "location": "Kolkata Region",
        "riskScore": 0.95,
        "severityLevel": "CRITICAL"
      }
    }
  ]
}
```

---

## ✅ Setup Checklist

- [ ] Run pipeline: `python orchestrator.py`
- [ ] Verify data in: `data_store/runs/`
- [ ] Copy `PIPELINE_INTEGRATION_EXAMPLE.py` to backend
- [ ] Add routes to backend main.py
- [ ] Test API endpoints
- [ ] Create frontend components for display
- [ ] Test end-to-end flow
- [ ] Set up scheduled runs (optional)

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "config not found" | Run from `Flowz/pipeline` directory |
| "Run not found" | Check exact run ID with `--list` |
| Files in wrong location | Verify `config.py` paths are correct |
| API returning 404 | Ensure pipeline has been run |
| Frontend not getting data | Check backend integration is installed |

---

## 📖 More Information

- **Detailed Guide**: [pipeline/PIPELINE_GUIDE.md](../pipeline/PIPELINE_GUIDE.md)
- **Integration Example**: [PIPELINE_INTEGRATION_EXAMPLE.py](../PIPELINE_INTEGRATION_EXAMPLE.py)
- **Complete Summary**: [INTEGRATION_COMPLETE.md](../INTEGRATION_COMPLETE.md)

---

**Version**: 1.0  
**Last Updated**: 2026-02-10
