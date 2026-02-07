from fastapi import APIRouter, HTTPException
from app.schemas.models import SeverityLevelsResponse
from app.services.mock_data import mock_service

router = APIRouter()

@router.get("/config/severity-levels", response_model=SeverityLevelsResponse)
async def get_severity_levels():
    """
    Get severity level configuration for color coding and risk thresholds.
    
    Defines LOW, MODERATE, HIGH, CRITICAL severity levels with colors and opacity.
    """
    try:
        data = mock_service.get_severity_levels()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
