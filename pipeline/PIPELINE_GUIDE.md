# Pipeline & Data Store Integration Guide

## Overview

This folder contains the **Flood Prediction Pipeline** that processes flood data through multiple stages and stores results in the **data_store** folder.

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         FLOOD PREDICTION PIPELINE ORCHESTRATOR              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Stage 1: DATA INGESTION                                    │
│  └─ Load raw data from various sources                      │
│                                                               │
│  Stage 2: LISFLOOD-OS (1D Hydrodynamic)                     │
│  └─ Simulate river flood propagation                        │
│                                                               │
│  Stage 3: LISFLOOD-FP (2D Floodplain)                       │
│  └─ Simulate 2D floodplain inundation                       │
│                                                               │
│  Stage 4: AI MODEL INFERENCE                                │
│  └─ Generate risk predictions and severity assessment       │
│                                                               │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│           DATA STORE (Workflow Results)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  data_store/runs/                                           │
│  ├── run_2026_02_10_1114_FIXED/                            │
│  │   ├── 01_ingestion/                                     │
│  │   ├── 02_lisflood_os/                                   │
│  │   ├── 03_lisflood_fp/                                   │
│  │   ├── 04_predictions/                                   │
│  │   │   ├── final_map.tif                                 │
│  │   │   ├── risk_summary.json                             │
│  │   └── pipeline_report.json                              │
│  │                                                           │
│  ├── run_2026_02_10_1150_MANUAL/                           │
│  │   └── [similar structure]                               │
│  │                                                           │
│  └── [more runs...]                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
pipeline/
├── config.py                    # Configuration & path management
├── orchestrator.py              # Main pipeline orchestrator
├── data_bridge.py               # Bridge between pipeline and backend API
│
├── 01_ingestion/
│   ├── __init__.py
│   └── ingestion.py             # Stage 1: Data loading
│
├── 02_lisflood_os/
│   ├── __init__.py
│   └── lisflood_os.py           # Stage 2: 1D hydrodynamic simulation
│
├── 03_lisflood_fp/
│   ├── __init__.py
│   └── lisflood_fp.py           # Stage 3: 2D floodplain simulation
│
└── 04_ai_model/
    ├── __init__.py
    ├── inference.py             # Stage 4: AI predictions
    └── import rasterio.py
```

## Key Components

### 1. **config.py** - Configuration Management

Manages all paths and settings:

```python
from config import Config

# Get paths
Config.BASE_DIR          # /path/to/Flowz
Config.DATA_STORE_DIR    # /path/to/Flowz/data_store
Config.RUNS_DIR          # /path/to/Flowz/data_store/runs

# Generate run ID
run_id = Config.get_run_id("MANUAL")  # run_2026_02_10_1500_MANUAL

# Create run structure
Config.ensure_run_structure(run_id)
```

### 2. **orchestrator.py** - Pipeline Orchestrator

Executes the complete workflow:

```bash
# Run the pipeline with auto-generated ID
python orchestrator.py

# Run with custom suffix
python orchestrator.py --suffix CUSTOM_NAME

# Use specific run ID
python orchestrator.py --run-id run_2026_02_10_1500_CUSTOM

# List all runs
python orchestrator.py --list

# Get summary of specific run
python orchestrator.py --summary run_2026_02_10_1114_FIXED
```

### 3. **data_bridge.py** - Data Access Bridge

Connect pipeline data with your backend API:

```python
from data_bridge import DataBridge

# Get all data from a run
run_data = DataBridge.get_run_data("run_2026_02_10_1114_FIXED")

# Get latest run data
latest = DataBridge.get_latest_run_data()

# List all runs
all_runs = DataBridge.list_all_runs()

# Export as GeoJSON
geojson = DataBridge.export_run_as_geojson("run_2026_02_10_1114_FIXED")
```

## Usage Examples

### Example 1: Run the Complete Pipeline

```bash
cd pipeline
python orchestrator.py --suffix MY_EXPERIMENT
```

**Output:**
- Creates `data_store/runs/run_2026_02_10_XXXX_MY_EXPERIMENT/`
- Stages 1-4 execute sequentially
- Results saved to respective stage directories
- `pipeline_report.json` created with execution details

### Example 2: Access Pipeline Results from Backend

```python
# In your backend (backend/app/services/flood_service.py)
import sys
from pathlib import Path

# Add pipeline to path
pipeline_path = Path(__file__).parent.parent.parent / "pipeline"
sys.path.insert(0, str(pipeline_path))

from data_bridge import DataBridge

def get_flood_predictions():
    """Fetch latest flood predictions"""
    try:
        latest_data = DataBridge.get_latest_run_data()
        return latest_data.get("predictions", {}).get("risk_summary")
    except Exception as e:
        return None

def get_all_runs():
    """Get all available runs"""
    return DataBridge.list_all_runs()
```

### Example 3: Load Data in Frontend

The frontend can call your backend API to get pipeline data:

```javascript
// Example: frontend/src/components/FloodAnalysis.jsx
async function loadFloodData() {
    const response = await fetch('/api/flood/predictions');
    const data = await response.json();
    
    const predictions = data.predictions.risk_summary;
    console.log(`Risk Score: ${predictions.riskScore}`);
    console.log(`Severity: ${predictions.severityLevel}`);
}
```

## Output Structure

Each run creates the following structure:

```
data_store/runs/run_2026_02_10_XXXX_YYYY/
├── 01_ingestion/
│   └── ingestion_metadata.json         # Data sources & status
│
├── 02_lisflood_os/
│   └── lisflood_os_results.json        # 1D simulation results
│
├── 03_lisflood_fp/
│   └── lisflood_fp_results.json        # 2D simulation results
│
├── 04_predictions/
│   ├── final_map.tif                   # Flood depth map (GeoTIFF)
│   ├── risk_summary.json               # Risk assessment output
│   └── [other outputs]
│
└── pipeline_report.json                # Execution log & metadata
```

### Risk Summary Format

```json
[
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
]
```

## Connection Points

### With Backend API

The backend can integrate with the pipeline through:

1. **Direct File Access**: Read from `data_store/runs/` directory
2. **Data Bridge**: Use `data_bridge.py` utilities
3. **REST Endpoint**: Create FastAPI endpoint that uses `DataBridge`

```python
# In backend/app/routers/flood.py
from fastapi import APIRouter
import sys
from pathlib import Path

router = APIRouter()

# Import data bridge
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "pipeline"))
from data_bridge import DataBridge

@router.get("/api/flood/predictions")
async def get_predictions():
    """Get latest flood predictions"""
    try:
        data = DataBridge.get_latest_run_data()
        return data
    except Exception as e:
        return {"error": str(e)}

@router.get("/api/flood/runs")
async def list_runs():
    """List all available runs"""
    return DataBridge.list_all_runs()
```

### With Frontend

The frontend receives data via the backend API and visualizes it:

```javascript
// Display flood data on map
const predictions = await fetch('/api/flood/predictions').then(r => r.json());
const riskScore = predictions.predictions.risk_summary.riskScore;

// Update map layer with final_map.tif
// Update dashboard with risk metrics
```

## Running Multiple Concurrent Runs

Each run is isolated in its own directory:

```bash
# Terminal 1
python orchestrator.py --suffix EXPERIMENT_A

# Terminal 2 (different window, while first is running)
python orchestrator.py --suffix EXPERIMENT_B

# Both runs proceed independently:
# run_2026_02_10_XXXX_EXPERIMENT_A/
# run_2026_02_10_YYYY_EXPERIMENT_B/
```

## Troubleshooting

### Issue: "Module not found: config"

**Solution**: Ensure you're running from the `pipeline` directory:
```bash
cd path/to/Flowz/pipeline
python orchestrator.py
```

### Issue: "Run not found in data_store"

**Solution**: Check that the run ID matches exactly:
```bash
python orchestrator.py --list
python orchestrator.py --summary run_2026_02_10_1114_FIXED
```

### Issue: Data not appearing in data_store

**Solution**: Verify the pipeline completed successfully:
```bash
# Check pipeline report for errors
cat data_store/runs/run_2026_02_10_XXXX/pipeline_report.json
```

## Next Steps

1. **Add to Backend**: Integrate `data_bridge.py` with your FastAPI routes
2. **Update Frontend**: Create visualization components for flood predictions
3. **Custom Stages**: Extend pipeline stages with real flood models
4. **Database**: Store run results in PostgreSQL for persistence
5. **Scheduling**: Use APScheduler or Celery to run pipeline on schedule

## Configuration Customization

Edit `config.py` to customize:

```python
# Location defaults
LAT_CENTER = 22.5726          # Change to your region
LON_CENTER = 88.3639          # Change to your region
LOCATION_NAME = "Kolkata Region"

# Map dimensions
FLOOD_MAP_WIDTH = 100         # pixels
FLOOD_MAP_HEIGHT = 100        # pixels
PIXEL_SIZE = 0.01             # degrees
```

---

**Pipeline Status**: ✅ Ready to use  
**Last Updated**: 2026-02-10  
**Data Directory**: `data_store/runs/`
