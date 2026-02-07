from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# Location Models
class LocationCoordinates(BaseModel):
    lat: float
    lon: float

class Location(BaseModel):
    name: str
    basin: str
    center: LocationCoordinates

# Prediction Models
class CurrentPrediction(BaseModel):
    riskScore: float = Field(..., ge=0.0, le=1.0)
    severityClass: str = Field(..., pattern="^(LOW|MODERATE|HIGH|CRITICAL)$")
    influenceRadius: float
    timeToPeak: int
    confidence: float = Field(..., ge=0.0, le=1.0)

class ForecastData(BaseModel):
    peakDischarge: float
    maxWaterDepth: float
    affectedAreaEstimate: float
    floodDuration: int

class TimeHorizon(BaseModel):
    riskScore: float
    severityClass: str
    timeToPeak: int

class DrivingFactors(BaseModel):
    rainfall24h: float
    upstreamDischarge: float
    soilSaturation: float
    tideLevel: Optional[float] = None
    reservoirRelease: Optional[float] = None
    slopeInstability: Optional[bool] = None

class Prediction(BaseModel):
    id: str
    location: Location
    current: CurrentPrediction
    forecast: ForecastData
    timeHorizons: Dict[str, TimeHorizon]
    drivingFactors: DrivingFactors
    simulationAvailable: bool
    hasHistoricalData: bool

class PredictionsMetadata(BaseModel):
    modelVersion: str
    lastUpdated: datetime
    nextUpdate: datetime
    forecastCycle: str
    coverageArea: str
    totalLocations: int

class PredictionsResponse(BaseModel):
    metadata: PredictionsMetadata
    predictions: List[Prediction]

# Simulation Models
class SimulationBounds(BaseModel):
    west: float
    south: float
    east: float
    north: float

class SimulationFrame(BaseModel):
    timeOffset: int
    timeLabel: str
    timestamp: datetime
    waterLevel: float
    depth: float
    affectedArea: float
    imageUrl: str
    thumbnailUrl: str
    isPeak: Optional[bool] = False

class DepthScale(BaseModel):
    depth: float
    color: str
    label: str

class Legend(BaseModel):
    depthScale: List[DepthScale]

class SimulationInfo(BaseModel):
    source: str
    resolution: str
    totalDuration: int
    frameCount: int
    recommendedFPS: int

class SimulationMetadata(BaseModel):
    peakFrame: int
    peakDepth: float
    peakArea: float
    recessionTime: int

class SimulationResponse(BaseModel):
    predictionId: str
    location: Dict[str, str]
    simulation: SimulationInfo
    bounds: SimulationBounds
    frames: List[SimulationFrame]
    legend: Legend
    metadata: SimulationMetadata

# Alert Models
class Alert(BaseModel):
    id: str
    predictionId: str
    type: str
    severity: str
    title: str
    description: str
    issuedAt: datetime
    validUntil: datetime
    affectedRegions: List[str]
    actions: List[str]

class AlertsResponse(BaseModel):
    alerts: List[Alert]

# History Models
class PredictionRecord(BaseModel):
    issuedAt: datetime
    validFor: datetime
    predictedRiskScore: float
    predictedSeverity: str
    predictedPeakDischarge: float
    predictedMaxDepth: float
    predictedTimeToPeak: int

class ObservedRecord(BaseModel):
    recordedAt: datetime
    actualPeakDischarge: float
    actualMaxDepth: float
    actualTimeToPeak: float
    reportedInundation: float
    gaugeStation: str

class ValidationRecord(BaseModel):
    dischargeError: float
    dischargeErrorPercent: float
    depthError: float
    depthErrorPercent: float
    timingError: float
    outcome: str
    notes: str

class ComparisonImages(BaseModel):
    predicted: str
    observed: str

class HistoryResponse(BaseModel):
    predictionId: str
    location: str
    prediction: PredictionRecord
    observed: ObservedRecord
    validation: ValidationRecord
    comparisonImages: ComparisonImages

# Time Series Models
class TimeSeriesPoint(BaseModel):
    timestamp: datetime
    discharge: float

class WarningLevels(BaseModel):
    low: float
    medium: float
    high: float
    critical: float

class HydrographResponse(BaseModel):
    predictionId: str
    gaugeStation: str
    river: str
    forecast: List[TimeSeriesPoint]
    observed: List[TimeSeriesPoint]
    warningLevels: WarningLevels

# Config Models
class SeverityLevel(BaseModel):
    class_: str = Field(..., alias="class")
    color: str
    riskRange: List[float]
    heatmapOpacity: float
    description: str
    
    class Config:
        populate_by_name = True

class SeverityLevelsResponse(BaseModel):
    severityLevels: List[SeverityLevel]
