from fastapi import APIRouter, HTTPException
from app.schemas.models import PredictionsResponse
from app.services.mock_data import mock_service

router = APIRouter()

@router.get("/predictions/current", response_model=PredictionsResponse)
async def get_current_predictions():
    """
    Get current flood predictions for all locations in West Bengal.
    
    Returns predictions with risk scores, severity levels, and forecasts.
    Updated every 6 hours with IMD forecast cycles.
    """
    try:
        data = mock_service.get_current_predictions()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
