# Deep Learning Prediction Models - U-Net + ConvLSTM Integration

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class RasterTimestep(BaseModel):
    """Single timestep in the 168-hour forecast"""
    timestep: int
    time_offset_hours: int
    timestamp: datetime
    depth_url: str
    velocity_x_url: Optional[str] = None
    velocity_y_url: Optional[str] = None

class PreviewTimestep(BaseModel):
    """PNG preview for a timestep"""
    timestep: int
    timestamp: datetime
    png_url: str
    thumbnail_url: str

class RasterData(BaseModel):
    """Storage locations for raster predictions"""
    netcdf_url: str
    netcdf_crf_url: str
    arcgis_service_url: Optional[str] = None
    geotiff_urls: List[RasterTimestep]
    preview_urls: List[PreviewTimestep]

class GridShape(BaseModel):
    """Dimensions of prediction grid"""
    height: int  # e.g., 1024
    width: int   # e.g., 1024
    timesteps: int  # e.g., 168 (7 days hourly)

class LocationBounds(BaseModel):
    """Geographic bounds in EPSG:4326"""
    west: float
    south: float
    east: float
    north: float

class LocationInfo(BaseModel):
    """Geographic location information"""
    basin: str
    region: str
    center: Dict[str, float]  # {lat, lon}
    bounds: LocationBounds
    spatial_reference: str
    ground_resolution_m: float  # meters per pixel

class AggregatedMetrics(BaseModel):
    """Metrics derived from raster analysis"""
    # Peak conditions
    peak_timestep: int
    peak_timestamp: datetime
    peak_depth_max: float
    peak_depth_mean: float
    peak_velocity_max: Optional[float] = None
    
    # Spatial extent
    affected_area_km2: float
    flooded_pixel_count: int
    total_water_volume_m3: float
    
    # Temporal dynamics
    flood_onset_time: int
    flood_duration_hours: int
    recession_time: int
    
    # Hydrological
    estimated_discharge_peak: Optional[float] = None
    estimated_discharge_mean: Optional[float] = None

class RiskAssessment(BaseModel):
    """Risk evaluation from spatial analysis"""
    risk_score: float = Field(..., ge=0.0, le=1.0)
    severity_class: str = Field(..., pattern="^(LOW|MODERATE|HIGH|CRITICAL)$")
    confidence: float = Field(..., ge=0.0, le=1.0)
    uncertainty_std: Optional[float] = None
    
    # Infrastructure impact
    buildings_at_risk: Optional[int] = None
    road_segments_flooded: Optional[int] = None
    population_exposed: Optional[int] = None

class InputFeatures(BaseModel):
    """Input data used for prediction"""
    rainfall_24h_max_mm: float
    rainfall_7day_forecast_mm: float
    upstream_discharge_m3s: float
    soil_saturation_mean: float
    antecedent_moisture_index: Optional[float] = None
    tide_level_m: Optional[float] = None

class ModelInfo(BaseModel):
    """Model execution metadata"""
    architecture: str  # e.g., "UNet-ConvLSTM"
    model_version: str
    training_date: str
    training_rmse_m: Optional[float] = None
    inference_time_seconds: float
    gpu_device: Optional[str] = None
    ensemble_size: Optional[int] = None

class DataSources(BaseModel):
    """Provenance of input data"""
    lisflood_run_id: str
    weather_forecast_source: str
    gauge_data_timestamp: Optional[datetime] = None
    dem_version: Optional[str] = None

class DLPredictionIngest(BaseModel):
    """
    Complete prediction from U-Net + ConvLSTM pipeline.
    
    This is POSTed to /api/predictions/ingest by the post-processing script
    after model inference completes.
    """
    prediction_id: str
    forecast_cycle: str
    model_version: str
    inference_timestamp: datetime
    
    location: LocationInfo
    grid_shape: GridShape
    raster_data: RasterData
    aggregated_metrics: AggregatedMetrics
    risk_assessment: RiskAssessment
    input_features: InputFeatures
    model_info: ModelInfo
    data_sources: DataSources

class DLPredictionResponse(BaseModel):
    """Response from backend after ingestion"""
    status: str
    prediction_id: str
    stored_id: int
    message: str
