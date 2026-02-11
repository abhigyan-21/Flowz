# Pipeline & Data Store Integration Summary

## ✅ What Has Been Connected

You now have a **complete flood prediction pipeline** that:

1. **Executes a 4-stage workflow** (Ingestion → LISFLOOD-OS → LISFLOOD-FP → AI Model)
2. **Stores all results** in organized run directories in `data_store/`
3. **Provides easy access** to predictions via Python utilities and API endpoints
4. **Integrates seamlessly** with your backend and frontend

---

## 📁 Folder Structure (Updated)

```
Flowz/
├── pipeline/                          ← Pipeline code
│   ├── config.py                      ✅ Configuration & path management
│   ├── orchestrator.py                ✅ Main pipeline executor
│   ├── data_bridge.py                 ✅ Data access utilities
│   ├── PIPELINE_GUIDE.md              ✅ Detailed documentation
│   │
│   ├── 01_ingestion/
│   │   ├── __init__.py
│   │   └── ingestion.py               ✅ Stage 1: Data loading
│   │
│   ├── 02_lisflood_os/
│   │   ├── __init__.py
│   │   └── lisflood_os.py             ✅ Stage 2: 1D simulation
│   │
│   ├── 03_lisflood_fp/
│   │   ├── __init__.py
│   │   └── lisflood_fp.py             ✅ Stage 3: 2D simulation
│   │
│   └── 04_ai_model/
│       ├── __init__.py
│       └── inference.py               ✅ Stage 4: AI predictions (FIXED)
│
├── data_store/                        ← Pipeline execution results
│   └── runs/
│       ├── run_2026_02_10_1114_FIXED/
│       │   ├── 01_ingestion/
│       │   ├── 02_lisflood_os/
│       │   ├── 03_lisflood_fp/
│       │   ├── 04_predictions/        ✅ Contains final_map.tif & risk_summary.json
│       │   └── pipeline_report.json
│       │
│       └── run_2026_02_10_1150_MANUAL/
│           └── [same structure]
│
├── PIPELINE_INTEGRATION_EXAMPLE.py    ✅ Backend API integration example
│
├── backend/                           ← Your FastAPI backend
│   └── app/
│       └── routers/
│           └── [Add flood_integration.py here - see example]
│
├── src/                               ← Your React frontend
│   └── [Components receive data from API]
│
└── [Other existing files]
```

---

## 🚀 Quick Start

### 1. Run the Pipeline

```bash
cd Flowz/pipeline
python orchestrator.py --suffix MY_TEST
```

**Output**: Creates `data_store/runs/run_2026_02_10_XXXX_MY_TEST/` with all predictions

### 2. Access Results in Python

```python
from pipeline.data_bridge import DataBridge

# Get latest predictions
data = DataBridge.get_latest_run_data()
risk_score = data['predictions']['risk_summary']['riskScore']
print(f"Risk Score: {risk_score}")
```

### 3. Integrate with Backend API

```python
# In backend/app/routers/flood_integration.py (copy from PIPELINE_INTEGRATION_EXAMPLE.py)
@router.get("/api/flood/predictions/latest")
async def get_predictions():
    data = DataBridge.get_latest_run_data()
    return data['predictions']['risk_summary']
```

### 4. Display in Frontend

```javascript
// In your React component
const [forecast, setForecast] = useState(null);

useEffect(() => {
    fetch('/api/flood/predictions/latest')
        .then(r => r.json())
        .then(data => setForecast(data));
}, []);

return <div>Risk Level: {forecast?.severityLevel}</div>;
```

---

## 🔄 Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     USER / SCHEDULER                           │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  PIPELINE ORCHESTRATOR (orchestrator.py)                       │
│  ├─ Validates configuration                                     │
│  ├─ Creates run directory structure                             │
│  └─ Calls each stage sequentially                              │
└──────────┬──────────────┬──────────────┬──────────────┬─────────┘
           │              │              │              │
    ┌──────▼─┐    ┌──────▼──┐   ┌──────▼──┐   ┌──────▼──┐
    │ Stage  │    │ Stage   │   │ Stage  │   │ Stage  │
    │   01   │    │   02    │   │   03   │   │   04   │
    │Ingst.  │───▶│ LISF-OS │──▶│LISF-FP │──▶│   AI   │
    └────────┘    └─────────┘   └────────┘   └───┬────┘
                                                   │
                           ┌───────────────────────▼──────────┐
                           │    DATA STORE (RESULTS)          │
                           │  data_store/runs/run_XXXX_YYYY/  │
                           │  ├─ 01_ingestion/                │
                           │  ├─ 02_lisflood_os/              │
                           │  ├─ 03_lisflood_fp/              │
                           │  ├─ 04_predictions/              │
                           │  │  ├─ final_map.tif             │
                           │  │  ├─ risk_summary.json         │
                           │  └─ pipeline_report.json         │
                           │                                   │
                           └───────────────┬──────────────────┘
                                          │
                           ┌──────────────▼─────────────┐
                           │    DATA BRIDGE             │
                           │  (data_bridge.py)          │
                           │  - Load run data           │
                           │  - List runs               │
                           │  - Export formats          │
                           └──────────────┬─────────────┘
                                          │
                           ┌──────────────▼──────────────┐
                           │  BACKEND API               │
                           │  (flood_integration.py)    │
                           │  - /api/flood/predictions  │
                           │  - /api/flood/runs/list    │
                           │  - /api/flood/pipeline/run │
                           └──────────────┬──────────────┘
                                          │
                           ┌──────────────▼──────────────┐
                           │  FRONTEND (React)          │
                           │  - Display forecasts       │
                           │  - Show flood maps         │
                           │  - List historical runs    │
                           └───────────────────────────┘
```

---

## 📊 Key Features

### Configuration Management (`config.py`)
- ✅ Automatic path resolution (works on any system)
- ✅ Runs directory structure creation
- ✅ Environment-agnostic configuration

### Pipeline Execution (`orchestrator.py`)
- ✅ Sequential 4-stage execution
- ✅ Isolated run directories (no conflicts)
- ✅ Execution logging and reporting
- ✅ Error handling with reports

### Data Access (`data_bridge.py`)
- ✅ Load full run data in one call
- ✅ List all historical runs
- ✅ Export as GeoJSON for mapping
- ✅ Get latest predictions instantly

### Backend Integration (`PIPELINE_INTEGRATION_EXAMPLE.py`)
- ✅ 9 REST API endpoints
- ✅ Background pipeline execution
- ✅ Health checks
- ✅ Multiple data export formats

---

## 🔧 How to Complete Integration

### Step 1: Backend Integration (5 minutes)

```bash
# Copy the integration example
cp PIPELINE_INTEGRATION_EXAMPLE.py backend/app/routers/flood_integration.py

# Edit backend/app/main.py, add:
from app.routers import flood_integration
app.include_router(flood_integration.router)
```

### Step 2: Test the API

```bash
# Start your backend
python backend/main.py

# Test API
curl http://localhost:8000/api/flood/health
curl http://localhost:8000/api/flood/runs/list
```

### Step 3: Frontend Integration

```javascript
// In your React components
import { useEffect, useState } from 'react';

export function FloodForecast() {
    const [predictions, setPredictions] = useState(null);
    
    useEffect(() => {
        fetch('/api/flood/predictions/latest')
            .then(r => r.json())
            .then(setPredictions);
    }, []);
    
    if (!predictions) return <div>Loading...</div>;
    
    return (
        <div className="forecast">
            <h2>{predictions.location}</h2>
            <p>Risk Score: {predictions.riskScore}</p>
            <p>Severity: {predictions.severityLevel}</p>
            <p>Water Level: {predictions.waterLevel}m</p>
        </div>
    );
}
```

### Step 4: Automate Pipeline Runs (Optional)

```python
# Use APScheduler or Celery
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('cron', hour='*/6')  # Every 6 hours
def run_flood_pipeline():
    from pipeline.orchestrator import run_pipeline
    from pipeline.config import Config
    
    run_id = Config.get_run_id("SCHEDULED")
    run_pipeline(run_id=run_id)

scheduler.start()
```

---

## 📋 Run Lifecycle

### Creating a New Run

```
trigger orchestrator.py
    ↓
Config.ensure_run_structure(run_id)
    ↓
├─ 01_ingestion/ ✓
├─ 02_lisflood_os/ ✓
├─ 03_lisflood_fp/ ✓
├─ 04_predictions/ ✓
└─ pipeline_report.json ✓
    ↓
All stages execute
    ↓
Results written to respective directories
    ↓
DataBridge can load and access the data
```

### Accessing Run Data

```
DataBridge.get_run_data("run_2026_02_10_1114_FIXED")
    ↓
Loads from:
├─ 01_ingestion/ingestion_metadata.json
├─ 02_lisflood_os/lisflood_os_results.json
├─ 03_lisflood_fp/lisflood_fp_results.json
├─ 04_predictions/risk_summary.json
└─ pipeline_report.json
    ↓
Returns structured dictionary with all data
```

---

## 🎯 What's Ready Now

| Feature | Status | Location |
|---------|--------|----------|
| Pipeline configuration | ✅ Done | `pipeline/config.py` |
| 4-stage pipeline | ✅ Done | `pipeline/orchestrator.py` + stages |
| Data storage structure | ✅ Done | `data_store/runs/` |
| Fixed hardcoded paths | ✅ Done | `pipeline/04_ai_model/inference.py` |
| Data access utilities | ✅ Done | `pipeline/data_bridge.py` |
| API integration example | ✅ Done | `PIPELINE_INTEGRATION_EXAMPLE.py` |
| Documentation | ✅ Done | `pipeline/PIPELINE_GUIDE.md` |
| Backend integration | ⏳ Your turn | Copy integration example to backend |
| Frontend visualization | ⏳ Your turn | Use API endpoints in React |

---

## 📝 Next Steps for You

1. **Copy integration example** to your backend
2. **Add API routes** to expose pipeline data
3. **Update frontend** to fetch from `/api/flood/` endpoints
4. **Test end-to-end** by running pipeline and viewing results
5. **Customize** pipeline stages with your actual models

---

## 🆘 Troubleshooting

### "ModuleNotFoundError: No module named 'config'"
```bash
# Solution: Run from pipeline directory
cd Flowz/pipeline
python orchestrator.py
```

### "ValueError: Run not found"
```bash
# Solution: Check run ID format
python orchestrator.py --list  # Lists all available runs
```

### Data appearing in wrong location
```bash
# Solution: Verify configuration
python -c "from config import Config; print(Config.DATA_STORE_DIR)"
```

---

## 📞 Support Resources

- **Pipeline Guide**: [pipeline/PIPELINE_GUIDE.md](pipeline/PIPELINE_GUIDE.md)
- **Integration Example**: [PIPELINE_INTEGRATION_EXAMPLE.py](PIPELINE_INTEGRATION_EXAMPLE.py)
- **API Documentation**: Built-in FastAPI /docs endpoint

---

**Status**: ✅ Pipeline fully connected and ready to use!  
**Created**: 2026-02-10  
**Last Updated**: 2026-02-10
