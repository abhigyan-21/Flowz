import os
from pathlib import Path
from datetime import datetime

# Get the base directory of the Flowz project
FLOWZ_BASE = Path(__file__).parent.parent.absolute()
PIPELINE_DIR = FLOWZ_BASE / "pipeline"
DATA_STORE_DIR = FLOWZ_BASE / "data_store"
RUNS_DIR = DATA_STORE_DIR / "runs"

# Configuration Settings
class Config:
    # Directories
    BASE_DIR = FLOWZ_BASE
    PIPELINE_DIR = PIPELINE_DIR
    DATA_STORE_DIR = DATA_STORE_DIR
    RUNS_DIR = RUNS_DIR
    
    # Default location for flood predictions (Kolkata Region)
    LAT_CENTER = 22.5726
    LON_CENTER = 88.3639
    LOCATION_NAME = "Kolkata Region"
    
    # Data dimensions
    FLOOD_MAP_WIDTH = 100
    FLOOD_MAP_HEIGHT = 100
    PIXEL_SIZE = 0.01  # degrees
    
    @staticmethod
    def get_run_id(custom_suffix=None):
        """Generate a unique run ID based on timestamp"""
        timestamp = datetime.now().strftime('%Y_%m_%d_%H%M')
        suffix = custom_suffix if custom_suffix else "AUTO"
        return f"run_{timestamp}_{suffix}"
    
    @staticmethod
    def get_run_dir(run_id):
        """Get the directory for a specific run"""
        run_path = RUNS_DIR / run_id
        return run_path
    
    @staticmethod
    def get_stage_dir(run_id, stage_number):
        """Get the directory for a specific pipeline stage within a run"""
        stage_dir = Config.get_run_dir(run_id) / f"{stage_number:02d}_{'ingestion' if stage_number == 1 else 'lisflood_os' if stage_number == 2 else 'lisflood_fp' if stage_number == 3 else 'predictions'}"
        return stage_dir
    
    @staticmethod
    def ensure_run_structure(run_id):
        """Create the directory structure for a run"""
        run_dir = Config.get_run_dir(run_id)
        run_dir.mkdir(parents=True, exist_ok=True)
        
        # Create stage directories
        for stage in range(1, 5):
            stage_dir = Config.get_stage_dir(run_id, stage)
            stage_dir.mkdir(parents=True, exist_ok=True)
        
        return run_dir

if __name__ == "__main__":
    # Test configuration
    print(f"Base Directory: {Config.BASE_DIR}")
    print(f"Pipeline Directory: {Config.PIPELINE_DIR}")
    print(f"Data Store Directory: {Config.DATA_STORE_DIR}")
    print(f"Runs Directory: {Config.RUNS_DIR}")
    print(f"Sample Run ID: {Config.get_run_id('TEST')}")
