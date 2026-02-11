"""
Example: Backend Integration with Pipeline
Shows how to connect the flood prediction pipeline with your FastAPI backend

Add this file to: backend/app/routers/flood_integration.py
Then import in backend/app/__init__.py or main.py
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
import sys
from pathlib import Path
import subprocess

# Import the data bridge from pipeline
pipeline_path = Path(__file__).parent.parent.parent.parent / "pipeline"
sys.path.insert(0, str(pipeline_path))

from data_bridge import DataBridge
from config import Config

router = APIRouter(prefix="/api/flood", tags=["flood"])

# ============================================================================
# Pydantic Models for Request/Response
# ============================================================================

class RunInfo(BaseModel):
    run_id: str
    status: str
    start_time: str
    end_time: str

class PredictionData(BaseModel):
    id: str
    location: str
    latitude: float
    longitude: float
    riskScore: float
    severityLevel: str
    waterLevel: float
    status: str
    timestamp: str

class RunData(BaseModel):
    run_id: str
    predictions: Optional[dict] = None
    simulations: Optional[dict] = None
    metadata: Optional[dict] = None

# ============================================================================
# Endpoints: Pipeline Execution
# ============================================================================

@router.post("/pipeline/run")
async def trigger_pipeline_run(
    background_tasks: BackgroundTasks,
    suffix: str = "TRIGGERED"
):
    """
    Trigger a new pipeline execution in the background
    
    Args:
        suffix: Custom suffix for run ID (e.g., "MANUAL", "TRIGGERED", "SCHEDULED")
    
    Returns:
        {
            "message": "Pipeline triggered",
            "run_id": "run_2026_02_10_1500_TRIGGERED"
        }
    """
    try:
        # Generate run ID
        run_id = Config.get_run_id(suffix)
        
        # Add pipeline execution to background tasks
        background_tasks.add_task(
            run_pipeline_subprocess, 
            run_id=run_id
        )
        
        return {
            "message": "Pipeline triggered successfully",
            "run_id": run_id,
            "status": "queued"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Endpoints: Pipeline Results
# ============================================================================

@router.get("/predictions/latest")
async def get_latest_predictions() -> PredictionData:
    """
    Get predictions from the most recent completed pipeline run
    
    Returns:
        Latest risk assessment data
    
    Raises:
        HTTPException 404: No runs found
    """
    try:
        latest_data = DataBridge.get_latest_run_data()
        predictions = latest_data.get("predictions", {}).get("risk_summary")
        
        if not predictions:
            raise HTTPException(
                status_code=404,
                detail="No predictions found in latest run"
            )
        
        return predictions
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions/run/{run_id}")
async def get_run_predictions(run_id: str) -> PredictionData:
    """
    Get predictions for a specific run
    
    Args:
        run_id: Run identifier (e.g., "run_2026_02_10_1114_FIXED")
    
    Returns:
        Flood predictions and risk assessment
    """
    try:
        run_data = DataBridge.get_run_data(run_id)
        predictions = run_data.get("predictions", {}).get("risk_summary")
        
        if not predictions:
            raise HTTPException(
                status_code=404,
                detail=f"No predictions found for run {run_id}"
            )
        
        return predictions
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/run/{run_id}")
async def get_run_data(run_id: str) -> RunData:
    """
    Get complete data from a specific run (all stages)
    
    Returns:
        Full run data including metadata, simulations, and predictions
    """
    try:
        data = DataBridge.get_run_data(run_id)
        return data
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Endpoints: Run Management
# ============================================================================

@router.get("/runs/list")
async def list_all_runs() -> List[RunInfo]:
    """
    List all available pipeline runs
    
    Returns:
        List of run information with status and timestamps
    """
    try:
        runs = DataBridge.list_all_runs()
        return runs
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/runs/count")
async def get_run_count() -> dict:
    """Get total number of runs"""
    try:
        runs = DataBridge.list_all_runs()
        return {"total_runs": len(runs)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/runs/latest-id")
async def get_latest_run_id() -> dict:
    """Get the ID of the most recent run"""
    try:
        runs = DataBridge.list_all_runs()
        if not runs:
            raise HTTPException(status_code=404, detail="No runs found")
        
        return {"latest_run_id": runs[0]["run_id"]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Endpoints: Data Export
# ============================================================================

@router.get("/export/geojson/{run_id}")
async def export_as_geojson(run_id: str):
    """
    Export run data as GeoJSON format
    Useful for mapping and visualization
    
    Returns:
        GeoJSON FeatureCollection with predictions as spatial features
    """
    try:
        geojson = DataBridge.export_run_as_geojson(run_id)
        return geojson
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Helper Functions
# ============================================================================

def run_pipeline_subprocess(run_id: str):
    """
    Execute the pipeline in a subprocess
    This allows the API to return immediately while pipeline runs
    """
    try:
        pipeline_dir = Path(__file__).parent.parent.parent.parent / "pipeline"
        
        # Ensure run structure
        Config.ensure_run_structure(run_id)
        
        # Run orchestrator with specific run ID
        result = subprocess.run(
            [
                "python",
                str(pipeline_dir / "orchestrator.py"),
                "--run-id", run_id
            ],
            cwd=str(pipeline_dir),
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Pipeline execution failed for {run_id}:")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
        else:
            print(f"Pipeline execution completed for {run_id}")
    
    except Exception as e:
        print(f"Error running pipeline: {str(e)}")

# ============================================================================
# Health & Status Endpoints
# ============================================================================

@router.get("/health")
async def pipeline_health():
    """Check if pipeline and data_store are accessible"""
    try:
        # Check if data_store exists
        if not Config.DATA_STORE_DIR.exists():
            return {
                "status": "degraded",
                "message": "data_store directory not found",
                "directory": str(Config.DATA_STORE_DIR)
            }
        
        # Check if runs directory exists
        if not Config.RUNS_DIR.exists():
            return {
                "status": "ready",
                "message": "No runs yet, but pipeline is ready",
                "first_run_needed": True
            }
        
        # Check run count
        runs = DataBridge.list_all_runs()
        return {
            "status": "healthy",
            "message": "Pipeline operational",
            "total_runs": len(runs),
            "base_dir": str(Config.BASE_DIR),
            "data_store": str(Config.DATA_STORE_DIR)
        }
    
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# ============================================================================
# Import Instructions
# ============================================================================
"""
To use this integration:

1. Copy this file to: backend/app/routers/flood_integration.py

2. In backend/app/main.py or backend/app/__init__.py, add:
   
   from app.routers import flood_integration
   app.include_router(flood_integration.router)

3. Your API endpoints will be available at:
   
   POST   /api/flood/pipeline/run           - Trigger new pipeline run
   GET    /api/flood/predictions/latest     - Get latest predictions
   GET    /api/flood/predictions/run/{id}   - Get predictions for specific run
   GET    /api/flood/data/run/{id}          - Get complete run data
   GET    /api/flood/runs/list              - List all runs
   GET    /api/flood/runs/count             - Count of runs
   GET    /api/flood/runs/latest-id         - Latest run ID
   GET    /api/flood/export/geojson/{id}    - Export as GeoJSON
   GET    /api/flood/health                 - Health check

4. Test the integration:
   
   curl http://localhost:8000/api/flood/health
   curl http://localhost:8000/api/flood/runs/list
   curl -X POST http://localhost:8000/api/flood/pipeline/run?suffix=TEST
"""
