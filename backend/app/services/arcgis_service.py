"""
ArcGIS Integration Service for Flood Simulation Visualization
Provides methods to generate simulation frames using ArcGIS APIs
"""
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import json
import io
from PIL import Image, ImageDraw
import math

class ArcGISService:
    """Service to integrate ArcGIS with flood simulation data"""
    
    def __init__(self):
        """Initialize ArcGIS service"""
        self.arcgis_base_url = "https://services.arcgisonline.com/arcgis/rest/services"
        self.elevation_service_url = "https://elevation.arcgisonline.com/arcgis/rest/services/WorldElevation/1/ImageServer"
        self.world_imagery_url = f"{self.arcgis_base_url}/World_Imagery/MapServer"
        
    async def generate_simulation_frame(
        self,
        prediction_id: str,
        time_offset: int,
        lat: float,
        lon: float,
        depth: float,
        bounds: Dict,
        width: int = 1024,
        height: int = 768
    ) -> bytes:
        """
        Generate a simulation frame with flood visualization
        Uses PIL to create visualization, can be replaced with actual ArcGIS rendering
        
        Args:
            prediction_id: Prediction ID
            time_offset: Time offset in hours
            lat: Center latitude
            lon: Center longitude
            depth: Current water depth (meters)
            bounds: {"west": lon, "south": lat, "east": lon, "north": lat}
            width: Image width in pixels
            height: Image height in pixels
            
        Returns:
            PNG image bytes
        """
        try:
            # Create base image with gradient representing terrain
            img = self._create_base_terrain(width, height, depth)
            
            # Add flood overlay
            img = self._add_flood_overlay(img, depth, width, height)
            
            # Add coordinate grid
            img = self._add_grid(img, bounds, width, height)
            
            # Add metadata
            img = self._add_metadata(img, time_offset, depth, lat, lon)
            
            # Convert to PNG bytes
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG', quality=85)
            img_bytes.seek(0)
            
            return img_bytes.getvalue()
            
        except Exception as e:
            print(f"Error generating simulation frame: {e}")
            raise
    
    def _create_base_terrain(self, width: int, height: int, depth: float) -> Image.Image:
        """Create base terrain image"""
        img = Image.new('RGB', (width, height), color='#2D5016')  # Green base
        draw = ImageDraw.Draw(img, 'RGBA')
        
        # Add terrain variation with gradient
        for y in range(height):
            for x in range(width):
                # Create noise-like variation
                variation = (x + y) % 3
                if variation == 0:
                    r, g, b = 45, 80, 22
                elif variation == 1:
                    r, g, b = 54, 96, 26
                else:
                    r, g, b = 35, 70, 18
                
                draw.point([x, y], fill=(r, g, b, 255))
        
        return img
    
    def _add_flood_overlay(self, img: Image.Image, depth: float, width: int, height: int) -> Image.Image:
        """Add flood visualization based on depth"""
        draw = ImageDraw.Draw(img, 'RGBA')
        
        # Color mapping based on depth
        depth_colors = [
            (0.0, (255, 255, 255, 0)),        # 0m: transparent
            (0.5, (179, 229, 252, 100)),      # 0.5m: light blue
            (1.0, (79, 195, 247, 140)),       # 1m: blue
            (2.0, (2, 136, 209, 180)),        # 2m: darker blue
            (3.0, (1, 87, 155, 200)),         # 3m: navy
            (5.0, (26, 35, 126, 220))         # 5m+: dark navy
        ]
        
        # Determine color based on depth
        color = self._interpolate_color(depth, depth_colors)
        
        # Draw flood areas (simulate with concentric semi-circles)
        center_x, center_y = width // 2, height // 2
        
        # Scale determines flood extent
        max_radius = min(width, height) // 2 * (depth / 6.0)
        max_radius = min(max_radius, min(width, height) // 1.5)
        
        for radius in range(0, int(max_radius), 20):
            alpha = int(color[3] * (1 - radius / max_radius))
            overlay_color = (color[0], color[1], color[2], alpha)
            draw.ellipse(
                [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
                fill=overlay_color,
                outline=None
            )
        
        return img
    
    def _add_grid(self, img: Image.Image, bounds: Dict, width: int, height: int) -> Image.Image:
        """Add coordinate grid to image"""
        draw = ImageDraw.Draw(img, 'RGBA')
        
        # Draw grid lines
        grid_step_x = width // 5
        grid_step_y = height // 5
        
        for x in range(0, width, grid_step_x):
            draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 20), width=1)
        
        for y in range(0, height, grid_step_y):
            draw.line([(0, y), (width, y)], fill=(255, 255, 255, 20), width=1)
        
        # Draw bounds indicator
        margin = 10
        draw.rectangle(
            [margin, margin, width - margin, height - margin],
            outline=(100, 200, 200, 100),
            width=2
        )
        
        return img
    
    def _add_metadata(
        self,
        img: Image.Image,
        time_offset: int,
        depth: float,
        lat: float,
        lon: float
    ) -> Image.Image:
        """Add metadata text to image"""
        draw = ImageDraw.Draw(img, 'RGBA')
        
        # Background for text
        text_bg = (0, 0, 0, 180)
        text_color = (255, 255, 255, 255)
        
        # Top-left: Time info
        margin = 10
        draw.rectangle(
            [margin, margin, margin + 200, margin + 60],
            fill=text_bg,
            outline=(79, 195, 247, 255),
            width=2
        )
        
        time_text = f"T+{time_offset}h"
        depth_text = f"Depth: {depth:.1f}m"
        
        draw.text((margin + 10, margin + 10), time_text, fill=text_color)
        draw.text((margin + 10, margin + 35), depth_text, fill=text_color)
        
        # Bottom-right: Coordinates
        coord_text = f"Lat: {lat:.3f}\nLon: {lon:.3f}"
        draw.rectangle(
            [img.width - 200, img.height - 100, img.width - 10, img.height - 10],
            fill=text_bg,
            outline=(79, 195, 247, 255),
            width=2
        )
        draw.text((img.width - 190, img.height - 90), coord_text, fill=text_color)
        
        # Bottom-left: Legend
        legend_text = "Water Depth\n(meters)"
        draw.rectangle(
            [margin, img.height - 80, margin + 150, img.height - 10],
            fill=text_bg,
            outline=(79, 195, 247, 255),
            width=2
        )
        draw.text((margin + 10, img.height - 70), legend_text, fill=text_color, spacing=5)
        
        return img
    
    def _interpolate_color(self, depth: float, color_map: List) -> tuple:
        """Interpolate color based on depth"""
        for i, (threshold, color) in enumerate(color_map):
            if depth <= threshold:
                return color
        return color_map[-1][1]
    
    async def get_elevation_at_point(self, lat: float, lon: float) -> Optional[float]:
        """
        Fetch elevation at a specific point
        In production, this would call ArcGIS World Elevation Service
        """
        try:
            # This is a placeholder; in production use actual ArcGIS service
            # For now, return mock elevation based on coordinates
            
            # West Bengal elevation approximately 0-100m
            base_elevation = 20
            variation = (lat + lon) % 50
            
            return base_elevation + variation
            
        except Exception as e:
            print(f"Error fetching elevation: {e}")
            return None
    
    async def query_flood_extent(
        self,
        location_name: str,
        bounds: Dict
    ) -> Dict:
        """
        Query flood extent using ArcGIS Feature Service
        Returns GeoJSON of affected areas
        """
        try:
            return {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [[
                                [bounds["west"], bounds["south"]],
                                [bounds["east"], bounds["south"]],
                                [bounds["east"], bounds["north"]],
                                [bounds["west"], bounds["north"]],
                                [bounds["west"], bounds["south"]]
                            ]]
                        },
                        "properties": {
                            "location": location_name,
                            "flood_zone": "high_risk"
                        }
                    }
                ]
            }
        except Exception as e:
            print(f"Error querying flood extent: {e}")
            return None
    
    async def export_to_geojson(
        self,
        prediction_id: str,
        frames: List[Dict],
        bounds: Dict,
        location_name: str
    ) -> Dict:
        """
        Export simulation frames as GeoJSON Feature Collection
        Can be used in ArcGIS Online or other GIS platforms
        """
        features = []
        
        for frame in frames:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [bounds["west"], bounds["south"]],
                        [bounds["east"], bounds["south"]],
                        [bounds["east"], bounds["north"]],
                        [bounds["west"], bounds["north"]],
                        [bounds["west"], bounds["south"]]
                    ]]
                },
                "properties": {
                    "prediction_id": prediction_id,
                    "location": location_name,
                    "time_offset": frame["timeOffset"],
                    "time_label": frame["timeLabel"],
                    "water_depth_m": frame["depth"],
                    "affected_area_km2": frame["affectedArea"],
                    "water_level_percent": frame["waterLevel"] * 100,
                    "is_peak": frame.get("isPeak", False),
                    "timestamp": frame["timestamp"]
                }
            }
            features.append(feature)
        
        return {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:EPSG:4326"
                }
            },
            "features": features
        }
    
    async def get_base_map_tile(
        self,
        z: int,
        x: int,
        y: int
    ) -> bytes:
        """
        Get base map tile from ArcGIS World Imagery
        In production, proxy to actual ArcGIS tile service
        """
        try:
            # This would normally fetch from:
            # https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
            
            # For now, return placeholder
            img = Image.new('RGB', (256, 256), color='#2D5016')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            return img_bytes.getvalue()
            
        except Exception as e:
            print(f"Error fetching base map tile: {e}")
            return None


# Singleton instance
arcgis_service = ArcGISService()
