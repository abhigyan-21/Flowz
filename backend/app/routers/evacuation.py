from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Shelter(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    capacity: int
    distance_km: float
    contact: str

class EvacuationRoute(BaseModel):
    id: str
    name: str
    description: str
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    distance_km: float
    estimated_time_minutes: int
    traffic_level: str

class EvacuationPlan(BaseModel):
    location_id: str
    location_name: str
    nearest_shelter: Shelter
    alternative_routes: List[EvacuationRoute]
    recommended_actions: List[str]

# Mock shelters for different locations
SHELTERS_MAP = {
    "pred_ganges_kolkata_001": [
        {"id": "shelter_1", "name": "Calcutta High School", "lat": 22.5751, "lon": 88.3639, "capacity": 500, "distance_km": 1.2, "contact": "033-1234-5678"},
        {"id": "shelter_2", "name": "Victoria Memorial Complex", "lat": 22.5443, "lon": 88.3439, "capacity": 800, "distance_km": 3.5, "contact": "033-9876-5432"},
        {"id": "shelter_3", "name": "Rabindra Sarovar Community Center", "lat": 22.5433, "lon": 88.3467, "capacity": 600, "distance_km": 4.2, "contact": "033-2468-1357"},
    ],
    "pred_teesta_jalpaiguri_002": [
        {"id": "shelter_4", "name": "Jalpaiguri Collectorate", "lat": 26.5200, "lon": 88.7200, "capacity": 300, "distance_km": 2.1, "contact": "0353-123-456"},
        {"id": "shelter_5", "name": "Government School Complex", "lat": 26.5150, "lon": 88.7180, "capacity": 400, "distance_km": 3.5, "contact": "0353-234-567"},
    ],
    "pred_damodar_asansol_003": [
        {"id": "shelter_6", "name": "Asansol Municipality Hall", "lat": 23.6750, "lon": 86.9530, "capacity": 350, "distance_km": 1.8, "contact": "0341-256-789"},
        {"id": "shelter_7", "name": "Community Sports Center", "lat": 23.6800, "lon": 86.9500, "capacity": 500, "distance_km": 2.5, "contact": "0341-345-678"},
    ],
    "pred_hooghly_howrah_004": [
        {"id": "shelter_8", "name": "Howrah Town Hall", "lat": 22.5980, "lon": 88.2650, "capacity": 450, "distance_km": 1.5, "contact": "033-4567-891"},
        {"id": "shelter_9", "name": "Educational Institute Campus", "lat": 22.6050, "lon": 88.2700, "capacity": 600, "distance_km": 2.8, "contact": "033-5678-902"},
    ],
}

EVACUATION_ROUTES = [
    {"id": "route_1", "name": "Route to Higher Ground (North)", "description": "Evacuation to elevated areas in North Kolkata", "start_lat": 22.5726, "start_lon": 88.3639, "end_lat": 22.7000, "end_lon": 88.3800, "distance_km": 15, "estimated_time_minutes": 25, "traffic_level": "moderate"},
    {"id": "route_2", "name": "Route to Shelter Belt (East)", "description": "Evacuation to established shelter areas on Eastern outskirts", "start_lat": 22.5726, "start_lon": 88.3639, "end_lat": 22.5800, "end_lon": 88.5000, "distance_km": 12, "estimated_time_minutes": 20, "traffic_level": "low"},
    {"id": "route_3", "name": "Route to Higher Ground (West)", "description": "Evacuation via Western bypass to elevated terrain", "start_lat": 22.5726, "start_lon": 88.3639, "end_lat": 22.5600, "end_lon": 88.1500, "distance_km": 18, "estimated_time_minutes": 30, "traffic_level": "moderate"},
]

RECOMMENDED_ACTIONS = [
    "Immediately contact local authorities",
    "Gather important documents and valuables",
    "Prepare emergency supplies (water, food, first aid)",
    "Evacuate to nearest shelter immediately",
    "Follow official evacuation routes",
    "Monitor emergency broadcasts",
]

@router.post("/evacuation/plan", response_model=EvacuationPlan)
async def get_evacuation_plan(location: Optional[dict] = None):
    """
    Get evacuation plan for a location.
    
    Returns nearest shelter and recommended evacuation routes.
    """
    try:
        # Use first location as default if not provided
        location_id = location.get("location_id", "pred_ganges_kolkata_001") if location else "pred_ganges_kolkata_001"
        
        shelters = SHELTERS_MAP.get(location_id, SHELTERS_MAP["pred_ganges_kolkata_001"])
        nearest_shelter = shelters[0]
        
        return {
            "location_id": location_id,
            "location_name": "West Bengal District",
            "nearest_shelter": nearest_shelter,
            "alternative_routes": EVACUATION_ROUTES,
            "recommended_actions": RECOMMENDED_ACTIONS
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evacuation/shelters/{location_id}", response_model=List[Shelter])
async def get_shelters(location_id: str):
    """
    Get list of shelters for a specific location.
    
    Returns all available shelters with capacity and contact information.
    """
    try:
        shelters = SHELTERS_MAP.get(location_id, SHELTERS_MAP["pred_ganges_kolkata_001"])
        return shelters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evacuation/routes/{location_id}", response_model=List[EvacuationRoute])
async def get_evacuation_routes(location_id: str):
    """
    Get recommended evacuation routes for a location.
    """
    try:
        return EVACUATION_ROUTES
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
