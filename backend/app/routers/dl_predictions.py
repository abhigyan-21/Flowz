"""
Deep Learning Predictions Router

Handles ingestion of U-Net + ConvLSTM predictions and serves them to frontend.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
from app.schemas.dl_models import DLPredictionIngest, DLPredictionResponse

router = APIRouter()

# In-memory storage for demo (replace with database in production)
dl_predictions_store = {}

@router.post("/predictions/ingest", response_model=DLPredictionResponse)
async def ingest_dl_prediction(
    prediction: DLPredictionIngest,
    background_tasks: BackgroundTasks
):
    """
    Ingest prediction from U-Net + ConvLSTM model pipeline.
    
    Called by post-processing script after model inference.
    Stores metadata and triggers downstream actions.
    
    **Process:**
    1. Validate prediction data
    2. Store in database (currently in-memory for demo)
    3. If HIGH/CRITICAL, trigger alert notifications
    4. Return confirmation
    """
    try:
        # Store prediction (in production, use database)
        dl_predictions_store[prediction.prediction_id] = prediction.dict()
        stored_id = len(dl_predictions_store)
        
        # Log ingestion
        print(f"✅ Ingested prediction: {prediction.prediction_id}")
        print(f"   Region: {prediction.location.region}")
        print(f"   Severity: {prediction.risk_assessment.severity_class}")
        print(f"   Risk Score: {prediction.risk_assessment.risk_score}")
        print(f"   Peak Depth: {prediction.aggregated_metrics.peak_depth_max}m")
        print(f"   Timesteps: {prediction.grid_shape.timesteps}")
        
        # If high-risk, trigger alert (async background task)
        if prediction.risk_assessment.severity_class in ["HIGH", "CRITICAL"]:
            background_tasks.add_task(
                send_alert_notification,
                prediction_id=prediction.prediction_id,
                severity=prediction.risk_assessment.severity_class,
                location=prediction.location.region
            )
        
        return DLPredictionResponse(
            status="success",
            prediction_id=prediction.prediction_id,
            stored_id=stored_id,
            message=f"Prediction ingested for {prediction.location.region}"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions/dl/latest/{basin}")
async def get_latest_dl_prediction(basin: str):
    """
    Get latest deep learning prediction for a specific basin.
    
    Returns full prediction metadata including raster URLs.
    """
    # Find most recent prediction for basin
    matching = [
        p for p in dl_predictions_store.values()
        if p['location']['basin'].lower() == basin.lower()
    ]
    
    if not matching:
        raise HTTPException(status_code=404, detail=f"No predictions found for basin: {basin}")
    
    # Sort by inference timestamp and get latest
    latest = sorted(matching, key=lambda x: x['inference_timestamp'], reverse=True)[0]
    
    return latest


@router.get("/predictions/dl/{prediction_id}")
async def get_dl_prediction_by_id(prediction_id: str):
    """
    Get specific deep learning prediction by ID.
    
    Returns complete prediction data including all raster URLs.
    """
    if prediction_id not in dl_predictions_store:
        raise HTTPException(status_code=404, detail=f"Prediction not found: {prediction_id}")
    
    return dl_predictions_store[prediction_id]


@router.get("/predictions/dl/timeseries/{prediction_id}")
async def get_dl_timeseries_urls(
    prediction_id: str,
    variables: str = "depth,velocity"
):
    """
    Get time series raster URLs for ArcGIS time slider.
    
    **Parameters:**
    - prediction_id: Unique prediction identifier
    - variables: Comma-separated list (depth, velocity_x, velocity_y)
    
    **Returns:**
    - NetCDF CRF URL for ArcGIS ImageServer
    - Individual timestep GeoTIFF URLs
    - Preview PNG URLs for frontend
    """
    if prediction_id not in dl_predictions_store:
        raise HTTPException(status_code=404, detail=f"Prediction not found: {prediction_id}")
    
    prediction = dl_predictions_store[prediction_id]
    requested_vars = [v.strip() for v in variables.split(',')]
    
    return {
        "prediction_id": prediction_id,
        "netcdf_crf_url": prediction['raster_data']['netcdf_crf_url'],
        "arcgis_service_url": prediction['raster_data']['arcgis_service_url'],
        "timesteps": prediction['raster_data']['geotiff_urls'],
        "previews": prediction['raster_data']['preview_urls'],
        "requested_variables": requested_vars,
        "grid_shape": prediction['grid_shape'],
        "bounds": prediction['location']['bounds']
    }


@router.get("/predictions/dl/summary")
async def get_all_dl_predictions_summary():
    """
    Get summary of all deep learning predictions.
    
    Returns lightweight metadata for dashboard overview.
    """
    summaries = []
    
    for pred_id, pred in dl_predictions_store.items():
        summaries.append({
            "prediction_id": pred_id,
            "region": pred['location']['region'],
            "basin": pred['location']['basin'],
            "severity": pred['risk_assessment']['severity_class'],
            "risk_score": pred['risk_assessment']['risk_score'],
            "peak_depth": pred['aggregated_metrics']['peak_depth_max'],
            "affected_area_km2": pred['aggregated_metrics']['affected_area_km2'],
            "inference_timestamp": pred['inference_timestamp'],
            "forecast_cycle": pred['forecast_cycle']
        })
    
    # Sort by risk score descending
    summaries.sort(key=lambda x: x['risk_score'], reverse=True)
    
    return {
        "total_predictions": len(summaries),
        "predictions": summaries
    }


# Background task functions
async def send_alert_notification(prediction_id: str, severity: str, location: str):
    """
    Send alert notification for high-risk predictions.
    
    In production, this would:
    - Send email/SMS alerts
    - Post to emergency management systems
    - Trigger automated warnings
    """
    print(f"🚨 ALERT: {severity} flood risk in {location}")
    print(f"   Prediction ID: {prediction_id}")
    # TODO: Implement actual notification system
