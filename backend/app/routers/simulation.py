from fastapi import APIRouter, HTTPException
from app.schemas.models import SimulationResponse
from app.services.mock_data import mock_service

router = APIRouter()

@router.get("/simulation/{prediction_id}", response_model=SimulationResponse)
async def get_simulation_frames(prediction_id: str):
    """
    Get flood simulation animation frames for a specific prediction.
    
    Returns pre-rendered LISFLOOD simulation images with timing and metadata.
    Frames show water depth progression from T+0h to T+48h.
    """
    try:
        data = mock_service.get_simulation_frames(prediction_id)
        if not data:
            raise HTTPException(status_code=404, detail=f"Simulation not found for prediction: {prediction_id}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
