"""
Flood Prediction Pipeline Orchestrator
Manages the complete workflow: Ingestion -> LISFLOOD-OS -> LISFLOOD-FP -> AI Model -> Export
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Import configuration and pipeline stages
from config import Config
from 01_ingestion.ingestion import run_ingestion
from 02_lisflood_os.lisflood_os import run_lisflood_os
from 03_lisflood_fp.lisflood_fp import run_lisflood_fp
from 04_ai_model.inference import run_ai_inference

def run_pipeline(run_id=None, custom_suffix="AUTO"):
    """
    Execute the complete flood prediction pipeline
    
    Args:
        run_id (str, optional): Custom run ID. If None, generates from timestamp
        custom_suffix (str): Custom suffix for run ID (default: "AUTO")
    
    Returns:
        dict: Results from all pipeline stages
    """
    
    # Generate run ID if not provided
    if run_id is None:
        run_id = Config.get_run_id(custom_suffix)
    
    print("\n" + "="*70)
    print(f"🌊 FLOOD PREDICTION PIPELINE STARTED")
    print(f"   Run ID: {run_id}")
    print(f"   Run-specific data will be saved to:")
    print(f"   {Config.get_run_dir(run_id)}")
    print("="*70 + "\n")
    
    # Create the directory structure for this run
    Config.ensure_run_structure(run_id)
    
    pipeline_results = {
        "run_id": run_id,
        "start_time": datetime.now().isoformat(),
        "status": "in_progress",
        "stages": {}
    }
    
    try:
        # ====================
        # Stage 1: Ingestion
        # ====================
        print("\n[Stage 1/4] Data Ingestion")
        print("-" * 70)
        stage1_dir = run_ingestion(run_id)
        pipeline_results["stages"]["01_ingestion"] = {
            "status": "completed",
            "output_dir": stage1_dir
        }
        
        # ====================
        # Stage 2: LISFLOOD-OS
        # ====================
        print("\n[Stage 2/4] LISFLOOD-OS (1D Hydrodynamic)")
        print("-" * 70)
        stage2_dir = run_lisflood_os(run_id)
        pipeline_results["stages"]["02_lisflood_os"] = {
            "status": "completed",
            "output_dir": stage2_dir
        }
        
        # ====================
        # Stage 3: LISFLOOD-FP
        # ====================
        print("\n[Stage 3/4] LISFLOOD-FP (2D Floodplain)")
        print("-" * 70)
        stage3_dir = run_lisflood_fp(run_id)
        pipeline_results["stages"]["03_lisflood_fp"] = {
            "status": "completed",
            "output_dir": stage3_dir
        }
        
        # ====================
        # Stage 4: AI Inference
        # ====================
        print("\n[Stage 4/4] AI Model & Risk Assessment")
        print("-" * 70)
        stage4_dir = run_ai_inference(run_id)
        pipeline_results["stages"]["04_ai_model"] = {
            "status": "completed",
            "output_dir": stage4_dir
        }
        
        # ====================
        # Pipeline Complete
        # ====================
        pipeline_results["status"] = "completed"
        pipeline_results["end_time"] = datetime.now().isoformat()
        
        # Save pipeline execution report
        report_path = os.path.join(str(Config.get_run_dir(run_id)), "pipeline_report.json")
        with open(report_path, 'w') as f:
            json.dump(pipeline_results, f, indent=2)
        
        print("\n" + "="*70)
        print(f"✅ PIPELINE COMPLETED SUCCESSFULLY")
        print(f"   Run ID: {run_id}")
        print(f"   Results saved to: {Config.get_run_dir(run_id)}")
        print(f"   Report: {report_path}")
        print("="*70 + "\n")
        
        return pipeline_results
    
    except Exception as e:
        pipeline_results["status"] = "failed"
        pipeline_results["error"] = str(e)
        pipeline_results["end_time"] = datetime.now().isoformat()
        
        # Save error report
        report_path = os.path.join(str(Config.get_run_dir(run_id)), "pipeline_report.json")
        with open(report_path, 'w') as f:
            json.dump(pipeline_results, f, indent=2)
        
        print("\n" + "="*70)
        print(f"❌ PIPELINE FAILED")
        print(f"   Run ID: {run_id}")
        print(f"   Error: {str(e)}")
        print("="*70 + "\n")
        
        raise

def list_runs():
    """List all existing runs in the data_store"""
    if Config.RUNS_DIR.exists():
        runs = sorted([d.name for d in Config.RUNS_DIR.iterdir() if d.is_dir()])
        return runs
    return []

def get_run_summary(run_id):
    """Get summary of a specific run"""
    report_path = Config.get_run_dir(run_id) / "pipeline_report.json"
    if report_path.exists():
        with open(report_path, 'r') as f:
            return json.load(f)
    return None

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Flood Prediction Pipeline Orchestrator')
    parser.add_argument('--list', action='store_true', help='List all existing runs')
    parser.add_argument('--summary', type=str, help='Get summary of a specific run')
    parser.add_argument('--suffix', type=str, default='AUTO', help='Custom suffix for run ID')
    parser.add_argument('--run-id', type=str, default=None, help='Use a specific run ID')
    
    args = parser.parse_args()
    
    if args.list:
        runs = list_runs()
        print("\nExisting Runs:")
        for run in runs:
            print(f"  - {run}")
    
    elif args.summary:
        summary = get_run_summary(args.summary)
        if summary:
            print("\nRun Summary:")
            print(json.dumps(summary, indent=2))
        else:
            print(f"Run {args.summary} not found")
    
    else:
        # Run the pipeline
        run_pipeline(run_id=args.run_id, custom_suffix=args.suffix)
