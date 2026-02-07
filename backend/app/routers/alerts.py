from fastapi import APIRouter, HTTPException
from app.schemas.models import AlertsResponse
from app.services.mock_data import mock_service

router = APIRouter()

@router.get("/alerts/generate", response_model=AlertsResponse)
async def get_alerts():
    """
    Get human-readable flood alerts for UI display.
    
    Generated from high-severity predictions with action recommendations.
    """
    try:
        data = mock_service.get_alerts()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
