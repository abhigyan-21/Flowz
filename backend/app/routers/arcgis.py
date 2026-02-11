"""
ArcGIS API Router
Provides endpoints for ArcGIS-integrated simulation visualization
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import io
from app.services.arcgis_service import arcgis_service
from app.services.mock_data import mock_service

router = APIRouter(prefix="/arcgis", tags=["arcgis"])

@router.get("/simulations/{prediction_id}/frame")
async def get_arcgis_simulation_frame(
    prediction_id: str,
    time_offset: int = Query(0, ge=0, le=48),
    width: int = Query(1024, ge=256, le=2048),
    height: int = Query(768, ge=192, le=1536),
    format: str = Query("png", regex="^(png|jpeg)$")
):
    """
    Get ArcGIS-rendered simulation frame for a specific time offset.
    
    Args:
        prediction_id: Prediction ID
        time_offset: Time offset in hours (0-48)
        width: Image width in pixels
        height: Image height in pixels
        format: Image format (png or jpeg)
    
    Returns:
        PNG/JPEG image
    """
    try:
        # Get simulation data
        simulation = mock_service.get_simulation_frames(prediction_id)
        if not simulation:
            raise HTTPException(status_code=404, detail=f"Simulation not found: {prediction_id}")
        
        # Find frame matching time offset
        frame = next((f for f in simulation["frames"] if f["timeOffset"] == time_offset), None)
        if not frame:
            raise HTTPException(status_code=404, detail=f"Frame not found for offset: {time_offset}h")
        
        # Get location data
        location = next((l for l in mock_service.LOCATIONS if l["id"] == prediction_id), None)
        if not location:
            raise HTTPException(status_code=404, detail=f"Location not found: {prediction_id}")
        
        # Generate ArcGIS visualization frame
        image_bytes = await arcgis_service.generate_simulation_frame(
            prediction_id=prediction_id,
            time_offset=time_offset,
            lat=location["lat"],
            lon=location["lon"],
            depth=frame["depth"],
            bounds=simulation["bounds"],
            width=width,
            height=height
        )
        
        media_type = f"image/{format}"
        
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type=media_type,
            headers={
                "Content-Disposition": f"inline; filename=simulation_{prediction_id}_t{time_offset:02d}.{format}",
                "Cache-Control": "public, max-age=3600"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/elevation")
async def get_elevation_profile(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius: float = Query(0.05, gt=0, le=1)
):
    """
    Get elevation profile for simulation area.
    
    Args:
        lat: Center latitude
        lon: Center longitude
        radius: Search radius in degrees
    
    Returns:
        Elevation data
    """
    try:
        elevation = await arcgis_service.get_elevation_at_point(lat, lon)
        
        return {
            "center": {"lat": lat, "lon": lon},
            "elevation_m": elevation,
            "radius_degrees": radius,
            "data_points": [
                {"offset": (-radius, -radius), "elevation": elevation - 5},
                {"offset": (0, -radius), "elevation": elevation},
                {"offset": (radius, -radius), "elevation": elevation + 3},
                {"offset": (-radius, 0), "elevation": elevation + 2},
                {"offset": (0, 0), "elevation": elevation},
                {"offset": (radius, 0), "elevation": elevation + 4},
                {"offset": (-radius, radius), "elevation": elevation - 2},
                {"offset": (0, radius), "elevation": elevation - 1},
                {"offset": (radius, radius), "elevation": elevation + 5},
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flood-extent/{prediction_id}")
async def get_flood_extent(prediction_id: str):
    """
    Get flood extent as GeoJSON Feature.
    
    Args:
        prediction_id: Prediction ID
    
    Returns:
        GeoJSON Feature Collection
    """
    try:
        simulation = mock_service.get_simulation_frames(prediction_id)
        if not simulation:
            raise HTTPException(status_code=404, detail=f"Simulation not found: {prediction_id}")
        
        location = simulation["location"]["name"]
        bounds = simulation["bounds"]
        
        geojson = await arcgis_service.query_flood_extent(location, bounds)
        
        return geojson
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/{prediction_id}")
async def export_simulation_as_geojson(
    prediction_id: str,
    format: str = Query("geojson", regex="^(geojson|shapefile|kmz)$")
):
    """
    Export simulation as vector GIS format.
    
    Args:
        prediction_id: Prediction ID
        format: Export format (geojson, shapefile, kmz)
    
    Returns:
        GeoJSON or download stream
    """
    try:
        simulation = mock_service.get_simulation_frames(prediction_id)
        if not simulation:
            raise HTTPException(status_code=404, detail=f"Simulation not found: {prediction_id}")
        
        location_name = simulation["location"]["name"]
        frames = simulation["frames"]
        bounds = simulation["bounds"]
        
        if format == "geojson":
            geojson = await arcgis_service.export_to_geojson(
                prediction_id=prediction_id,
                frames=frames,
                bounds=bounds,
                location_name=location_name
            )
            return geojson
        
        elif format == "shapefile":
            # In production, use fiona or similar to create shapefile
            raise HTTPException(
                status_code=501,
                detail="Shapefile export not yet implemented"
            )
        
        elif format == "kmz":
            # In production, create KML and zip it
            raise HTTPException(
                status_code=501,
                detail="KMZ export not yet implemented"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tiles/{z}/{x}/{y}")
async def get_base_map_tile(z: int, x: int, y: int):
    """
    Get base map tile (ArcGIS World Imagery proxy).
    
    Args:
        z: Zoom level
        x: Tile X coordinate
        y: Tile Y coordinate
    
    Returns:
        PNG tile image
    """
    try:
        tile_bytes = await arcgis_service.get_base_map_tile(z, x, y)
        
        if not tile_bytes:
            raise HTTPException(status_code=404, detail="Tile not found")
        
        return StreamingResponse(
            io.BytesIO(tile_bytes),
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=86400",  # 24 hour cache
                "Content-Type": "image/png"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/{prediction_id}")
async def get_simulation_analytics(prediction_id: str):
    """
    Get analytics for a simulation (GIS-derived metrics).
    
    Args:
        prediction_id: Prediction ID
    
    Returns:
        Simulation analytics
    """
    try:
        simulation = mock_service.get_simulation_frames(prediction_id)
        if not simulation:
            raise HTTPException(status_code=404, detail=f"Simulation not found: {prediction_id}")
        
        frames = simulation["frames"]
        
        # Calculate statistics
        max_depth = max(f["depth"] for f in frames)
        max_area = max(f["affectedArea"] for f in frames)
        peak_frame = next((f for f in frames if f.get("isPeak")), frames[-1])
        
        return {
            "prediction_id": prediction_id,
            "location": simulation["location"],
            "statistics": {
                "max_depth_m": max_depth,
                "max_affected_area_km2": max_area,
                "peak_time_hours": peak_frame["timeOffset"],
                "total_duration_hours": simulation["simulation"]["totalDuration"],
                "frame_count": len(frames),
                "average_progression_rate_m_per_hour": max_depth / peak_frame["timeOffset"] if peak_frame["timeOffset"] > 0 else 0
            },
            "frames_summary": [
                {
                    "time_offset": f["timeOffset"],
                    "depth": f["depth"],
                    "area": f["affectedArea"],
                    "is_peak": f.get("isPeak", False)
                }
                for f in frames
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare")
async def compare_simulations(
    prediction_ids: list[str]
):
    """
    Compare multiple simulations side by side.
    
    Args:
        prediction_ids: List of prediction IDs to compare
    
    Returns:
        Comparison data
    """
    try:
        if len(prediction_ids) < 2:
            raise HTTPException(status_code=400, detail="Provide at least 2 prediction IDs")
        
        if len(prediction_ids) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 simulations can be compared")
        
        comparisons = []
        for pred_id in prediction_ids:
            sim = mock_service.get_simulation_frames(pred_id)
            if sim:
                peak_frame = next((f for f in sim["frames"] if f.get("isPeak")), sim["frames"][-1])
                comparisons.append({
                    "prediction_id": pred_id,
                    "location": sim["location"]["name"],
                    "peak_depth": peak_frame["depth"],
                    "peak_area": peak_frame["affectedArea"],
                    "peak_time": peak_frame["timeOffset"]
                })
        
        return {
            "comparison": comparisons,
            "metrics": {
                "highest_risk": max(comparisons, key=lambda x: x["peak_depth"]) if comparisons else None,
                "largest_area": max(comparisons, key=lambda x: x["peak_area"]) if comparisons else None,
                "earliest_peak": min(comparisons, key=lambda x: x["peak_time"]) if comparisons else None,
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
