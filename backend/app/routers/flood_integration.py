"""
Backend Integration with Pipeline
Connects the flood prediction pipeline with FastAPI backend
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

try:
    from data_bridge import DataBridge
    from config import Config
except ImportError:
    # Fallback if pipeline not available
    DataBridge = None
    Config = None

router = APIRouter(prefix="/api/flood", tags=["flood"])

# ============================================================================
# Pydantic Models
# ============================================================================

class RunInfo(BaseModel):
    run_id: str
    status: str
    start_time: str
    end_time: Optional[str] = None

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

# ============================================================================
# Pipeline Execution
# ============================================================================

@router.post("/pipeline/run")
async def trigger_pipeline_run(
    background_tasks: BackgroundTasks,
    suffix: str = "TRIGGERED"
):
    """Trigger a new pipeline execution"""
    if not Config:
        raise HTTPException(status_code=503, detail="Pipeline not available")
    
    try:
        run_id = Config.get_run_id(suffix)
        background_tasks.add_task(run_pipeline_subprocess, run_id=run_id)
        
        return {
            "message": "Pipeline triggered successfully",
            "run_id": run_id,
            "status": "queued"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Pipeline Results
# ============================================================================

@router.get("/predictions/latest")
async def get_latest_predictions():
    """Get predictions from the most recent pipeline run"""
    if not DataBridge:
        raise HTTPException(status_code=503, detail="Pipeline not available")
    
    try:
        latest_data = DataBridge.get_latest_run_data()
        predictions = latest_data.get("predictions", {}).get("risk_summary")
        
        if not predictions:
            raise HTTPException(status_code=404, detail="No predictions found")
        
        return predictions
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/runs/list")
async def list_all_runs():
    """List all available pipeline runs"""
    if not DataBridge:
        raise HTTPException(status_code=503, detail="Pipeline not available")
    
    try:
        runs = DataBridge.list_all_runs()
        return runs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def pipeline_health():
    """Check pipeline health"""
    if not Config or not DataBridge:
        return {
            "status": "unavailable",
            "message": "Pipeline modules not found"
        }
    
    try:
        if not Config.DATA_STORE_DIR.exists():
            return {
                "status": "degraded",
                "message": "data_store directory not found"
            }
        
        runs = DataBridge.list_all_runs() if DataBridge else []
        return {
            "status": "healthy",
            "message": "Pipeline operational",
            "total_runs": len(runs)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# ============================================================================
# Helper Functions
# ============================================================================

def run_pipeline_subprocess(run_id: str):
    """Execute pipeline in subprocess"""
    try:
        pipeline_dir = Path(__file__).parent.parent.parent.parent / "pipeline"
        
        if Config:
            Config.ensure_run_structure(run_id)
        
        result = subprocess.run(
            ["python", str(pipeline_dir / "orchestrator.py"), "--run-id", run_id],
            cwd=str(pipeline_dir),
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Pipeline execution failed for {run_id}")
            print(f"STDERR: {result.stderr}")
        else:
            print(f"Pipeline execution completed for {run_id}")
    
    except Exception as e:
        print(f"Error running pipeline: {str(e)}")