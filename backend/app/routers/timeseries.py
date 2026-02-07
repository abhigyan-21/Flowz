from fastapi import APIRouter, HTTPException
from app.schemas.models import HydrographResponse
from app.services.mock_data import mock_service

router = APIRouter()

@router.get("/timeseries/{prediction_id}/hydrograph", response_model=HydrographResponse)
async def get_hydrograph(prediction_id: str):
    """
    Get discharge hydrograph time series data for a prediction.
    
    Includes forecast and observed discharge values with warning levels.
    Useful for detailed charts and analysis.
    """
    try:
        data = mock_service.get_hydrograph(prediction_id)
        if not data:
            raise HTTPException(status_code=404, detail=f"Hydrograph not found for prediction: {prediction_id}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
