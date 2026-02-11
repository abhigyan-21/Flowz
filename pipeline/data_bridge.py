"""
Data Bridge Utilities
Connects the pipeline output with the backend API
"""
import json
import os
from pathlib import Path
from config import Config

class DataBridge:
    """Bridge between pipeline outputs and backend API"""
    
    @staticmethod
    def get_run_data(run_id):
        """
        Retrieve all data from a completed run
        Returns: Complete run data including all predictions
        """
        run_dir = Config.get_run_dir(run_id)
        
        if not run_dir.exists():
            raise ValueError(f"Run {run_id} not found")
        
        run_data = {
            "run_id": run_id,
            "metadata": {},
            "predictions": {},
            "simulations": {}
        }
        
        # Load ingestion metadata
        ingestion_file = run_dir / "01_ingestion" / "ingestion_metadata.json"
        if ingestion_file.exists():
            with open(ingestion_file, 'r') as f:
                run_data["metadata"]["ingestion"] = json.load(f)
        
        # Load LISFLOOD-OS results
        os_file = run_dir / "02_lisflood_os" / "lisflood_os_results.json"
        if os_file.exists():
            with open(os_file, 'r') as f:
                run_data["simulations"]["lisflood_os"] = json.load(f)
        
        # Load LISFLOOD-FP results
        fp_file = run_dir / "03_lisflood_fp" / "lisflood_fp_results.json"
        if fp_file.exists():
            with open(fp_file, 'r') as f:
                run_data["simulations"]["lisflood_fp"] = json.load(f)
        
        # Load AI predictions (risk summary)
        risk_summary_file = run_dir / "04_predictions" / "risk_summary.json"
        if risk_summary_file.exists():
            with open(risk_summary_file, 'r') as f:
                risk_data = json.load(f)
                run_data["predictions"]["risk_summary"] = risk_data[0] if isinstance(risk_data, list) else risk_data
        
        # Load pipeline report if available
        report_file = run_dir / "pipeline_report.json"
        if report_file.exists():
            with open(report_file, 'r') as f:
                run_data["pipeline_report"] = json.load(f)
        
        return run_data
    
    @staticmethod
    def get_latest_run_data():
        """Get data from the most recent run"""
        runs = sorted([d.name for d in Config.RUNS_DIR.iterdir() if d.is_dir()], reverse=True)
        if not runs:
            raise ValueError("No runs found in data_store")
        return DataBridge.get_run_data(runs[0])
    
    @staticmethod
    def list_all_runs():
        """List all available runs with their metadata"""
        runs_info = []
        
        if Config.RUNS_DIR.exists():
            for run_dir in sorted(Config.RUNS_DIR.iterdir(), reverse=True):
                if run_dir.is_dir():
                    # Check for pipeline report
                    report_file = run_dir / "pipeline_report.json"
                    if report_file.exists():
                        with open(report_file, 'r') as f:
                            report = json.load(f)
                            runs_info.append({
                                "run_id": run_dir.name,
                                "status": report.get("status", "unknown"),
                                "start_time": report.get("start_time", "unknown"),
                                "end_time": report.get("end_time", "unknown")
                            })
                    else:
                        runs_info.append({
                            "run_id": run_dir.name,
                            "status": "unknown",
                            "start_time": "unknown",
                            "end_time": "unknown"
                        })
        
        return runs_info
    
    @staticmethod
    def export_run_as_geojson(run_id):
        """Export run data as GeoJSON format"""
        run_data = DataBridge.get_run_data(run_id)
        predictions = run_data.get("predictions", {}).get("risk_summary", {})
        
        geojson = {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        predictions.get("longitude", 0),
                        predictions.get("latitude", 0)
                    ]
                },
                "properties": {
                    "run_id": run_id,
                    "location": predictions.get("location", "Unknown"),
                    "riskScore": predictions.get("riskScore", 0),
                    "severityLevel": predictions.get("severityLevel", "UNKNOWN"),
                    "waterLevel": predictions.get("waterLevel", 0),
                    "status": predictions.get("status", "UNKNOWN"),
                    "timestamp": predictions.get("timestamp", "")
                }
            }]
        }
        
        return geojson

if __name__ == "__main__":
    # Test the data bridge
    try:
        print("Available runs:")
        runs = DataBridge.list_all_runs()
        for run in runs:
            print(f"  {run['run_id']} - Status: {run['status']}")
        
        if runs:
            latest = runs[0]
            print(f"\nLoading latest run: {latest['run_id']}")
            data = DataBridge.get_run_data(latest['run_id'])
            print(json.dumps(data, indent=2))
    
    except Exception as e:
        print(f"Error: {e}")
