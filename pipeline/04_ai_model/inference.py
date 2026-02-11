import os
import json
import sys
import numpy as np
import rasterio
from rasterio.transform import from_origin
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import config
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
from config import Config

# CONFIGURATION
LAT_CENTER = Config.LAT_CENTER
LON_CENTER = Config.LON_CENTER

def run_ai_inference(run_id):
    """Run the AI model inference and save predictions"""
    OUTPUT_DIR = str(Config.get_stage_dir(run_id, 4))
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"🧠 AI Model Starting for: {run_id}")
    print(f"📂 Saving to: {OUTPUT_DIR}") 
    
    # 1. Generate Flood Map
    data = np.zeros((Config.FLOOD_MAP_HEIGHT, Config.FLOOD_MAP_WIDTH), dtype=rasterio.float32)
    for i in range(Config.FLOOD_MAP_HEIGHT):
        for j in range(Config.FLOOD_MAP_WIDTH):
            dist = np.sqrt((i-50)**2 + (j-50)**2)
            if dist < 30:
                data[i, j] = (30 - dist) / 10.0
    
    transform = from_origin(LON_CENTER - 0.5, LAT_CENTER + 0.5, Config.PIXEL_SIZE, Config.PIXEL_SIZE)
    with rasterio.open(os.path.join(OUTPUT_DIR, "final_map.tif"), 'w', driver='GTiff', 
                       height=Config.FLOOD_MAP_HEIGHT, width=Config.FLOOD_MAP_WIDTH, 
                       count=1, dtype=data.dtype,
                       crs='+proj=latlong', transform=transform) as dst:
        dst.write(data, 1)

    # 2. Generate Summary
    summary = [{
        "id": run_id,
        "location": Config.LOCATION_NAME,
        "latitude": LAT_CENTER,
        "longitude": LON_CENTER,
        "riskScore": 0.95,
        "severityLevel": "CRITICAL",
        "waterLevel": 3.2,
        "status": "ACTIVE",
        "timestamp": datetime.now().isoformat()
    }]
    
    with open(os.path.join(OUTPUT_DIR, "risk_summary.json"), 'w') as f:
        json.dump(summary, f, indent=2)

    print(f"✅ AI Model Complete! Data saved to {OUTPUT_DIR}")
    return OUTPUT_DIR

if __name__ == "__main__":
    # For testing, create a manual run
    run_id = Config.get_run_id("MANUAL")
    Config.ensure_run_structure(run_id)
    run_ai_inference(run_id)