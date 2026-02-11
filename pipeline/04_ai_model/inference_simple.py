import os
import json
import sys
import random
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import config
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
from config import Config

def run_ai_inference(run_id):
    """Run simplified AI model inference for integration testing"""
    OUTPUT_DIR = str(Config.get_stage_dir(run_id, 4))
    
    print(f"Running AI Model Inference (Simplified)")
    print(f"   Output Directory: {OUTPUT_DIR}")
    
    # Generate mock prediction data
    risk_summary = {
        "id": f"pred_{run_id}",
        "location": "West Bengal Test Region",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "riskScore": round(random.uniform(0.3, 0.9), 2),
        "severityLevel": random.choice(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
        "waterLevel": round(random.uniform(0.5, 2.5), 2),
        "status": "ACTIVE",
        "timestamp": datetime.now().isoformat(),
        "description": f"AI-generated flood prediction for {run_id}",
        "confidence": round(random.uniform(0.7, 0.95), 2),
        "affectedArea": round(random.uniform(10, 100), 1),
        "peakTime": datetime.now().isoformat()
    }
    
    # Save risk summary
    risk_summary_path = os.path.join(OUTPUT_DIR, "risk_summary.json")
    with open(risk_summary_path, 'w') as f:
        json.dump(risk_summary, f, indent=2)
    
    # Create a simple mock GeoTIFF metadata (without actual rasterio)
    mock_geotiff_info = {
        "filename": "final_map.tif",
        "created": datetime.now().isoformat(),
        "bounds": {
            "west": 88.0,
            "east": 89.0,
            "north": 23.0,
            "south": 22.0
        },
        "resolution": "30m",
        "crs": "EPSG:4326",
        "note": "Mock GeoTIFF for integration testing"
    }
    
    # Save mock GeoTIFF info
    geotiff_info_path = os.path.join(OUTPUT_DIR, "final_map_info.json")
    with open(geotiff_info_path, 'w') as f:
        json.dump(mock_geotiff_info, f, indent=2)
    
    # Create a simple text file as placeholder for the actual GeoTIFF
    mock_tiff_path = os.path.join(OUTPUT_DIR, "final_map.tif")
    with open(mock_tiff_path, 'w') as f:
        f.write("Mock GeoTIFF file for integration testing\n")
        f.write(f"Generated for run: {run_id}\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
    
    print(f"AI Model Inference Complete")
    print(f"   Risk Score: {risk_summary['riskScore']}")
    print(f"   Severity: {risk_summary['severityLevel']}")
    print(f"   Water Level: {risk_summary['waterLevel']}m")
    print(f"   Files saved to: {OUTPUT_DIR}")
    
    return OUTPUT_DIR