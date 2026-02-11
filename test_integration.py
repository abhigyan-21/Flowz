#!/usr/bin/env python3
"""
Integration Test Script
Tests the complete pipeline, backend, and frontend integration
"""

import requests
import json
import time
import sys

def test_integration():
    """Test the complete integration"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Flowz Integration")
    print("=" * 50)
    
    # Test 1: Backend Health
    print("\n1. Testing Backend Health...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Backend is healthy")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False
    
    # Test 2: Pipeline Health
    print("\n2. Testing Pipeline Health...")
    try:
        response = requests.get(f"{base_url}/api/flood/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Pipeline is {health_data['status']}")
            print(f"   Total runs: {health_data.get('total_runs', 0)}")
        else:
            print(f"❌ Pipeline health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Pipeline not accessible: {e}")
        return False
    
    # Test 3: Trigger Pipeline Run
    print("\n3. Triggering Pipeline Run...")
    try:
        response = requests.post(f"{base_url}/api/flood/pipeline/run?suffix=INTEGRATION_VERIFY")
        if response.status_code == 200:
            run_data = response.json()
            print(f"✅ Pipeline triggered successfully")
            print(f"   Run ID: {run_data['run_id']}")
            
            # Wait for pipeline to complete
            print("   Waiting for pipeline to complete...")
            time.sleep(8)
            
        else:
            print(f"❌ Pipeline trigger failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Pipeline trigger error: {e}")
        return False
    
    # Test 4: Get Latest Predictions
    print("\n4. Testing Latest Predictions...")
    try:
        response = requests.get(f"{base_url}/api/flood/predictions/latest")
        if response.status_code == 200:
            predictions = response.json()
            print("✅ Latest predictions retrieved")
            print(f"   Location: {predictions['location']}")
            print(f"   Risk Score: {predictions['riskScore']}")
            print(f"   Severity: {predictions['severityLevel']}")
            print(f"   Water Level: {predictions['waterLevel']}m")
        else:
            print(f"❌ Predictions retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Predictions error: {e}")
        return False
    
    # Test 5: List Pipeline Runs
    print("\n5. Testing Pipeline Runs List...")
    try:
        response = requests.get(f"{base_url}/api/flood/runs/list")
        if response.status_code == 200:
            runs = response.json()
            print(f"✅ Pipeline runs retrieved")
            print(f"   Total runs: {len(runs)}")
            if runs:
                print(f"   Latest run: {runs[0]['run_id']}")
                print(f"   Status: {runs[0]['status']}")
        else:
            print(f"❌ Runs list failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Runs list error: {e}")
        return False
    
    # Test 6: Frontend Accessibility
    print("\n6. Testing Frontend Accessibility...")
    try:
        response = requests.get("http://localhost:5173")
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL INTEGRATION TESTS PASSED!")
    print("\nYour Flowz system is fully integrated and running:")
    print("• Backend API: http://localhost:8000")
    print("• Frontend UI: http://localhost:5173")
    print("• API Docs: http://localhost:8000/docs")
    print("• Pipeline: Fully operational")
    print("\n✨ Ready for production use!")
    
    return True

if __name__ == "__main__":
    success = test_integration()
    sys.exit(0 if success else 1)