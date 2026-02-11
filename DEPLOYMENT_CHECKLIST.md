# Pipeline Integration Deployment Checklist

**Date Created**: 2026-02-10  
**Status**: ✅ Ready for Deployment

---

## ✅ PHASE 1: Pipeline Setup (COMPLETE ✓)

- [x] Created `pipeline/config.py` - Configuration management
- [x] Updated `pipeline/orchestrator.py` - 4-stage pipeline orchestrator
- [x] Fixed `pipeline/04_ai_model/inference.py` - Removed hardcoded paths
- [x] Created `pipeline/01_ingestion/ingestion.py` - Data ingestion stage
- [x] Created `pipeline/02_lisflood_os/lisflood_os.py` - LISFLOOD-OS stage
- [x] Created `pipeline/03_lisflood_fp/lisflood_fp.py` - LISFLOOD-FP stage
- [x] Created `pipeline/data_bridge.py` - Data access utilities
- [x] Verified `data_store/runs/` directory structure

**What This Means**: Your pipeline can now run end-to-end and save results to the data_store.

---

## ⏳ PHASE 2: Backend Integration (YOUR TURN)

### Step 1: Copy Integration File
```bash
# Copy the API integration example to your backend
cp PIPELINE_INTEGRATION_EXAMPLE.py backend/app/routers/flood_integration.py
```
- [ ] File copied to backend

### Step 2: Update Backend Main File
Edit `backend/app/main.py` (or `backend/app/__init__.py`):

```python
# Add these imports at the top
from app.routers import flood_integration

# Add this line where you include other routers
app.include_router(flood_integration.router)
```
- [ ] Imports added
- [ ] Router included

### Step 3: Test Backend
```bash
cd backend
python main.py
```
- [ ] Backend starts without errors
- [ ] No import errors

### Step 4: Test API Endpoints
```bash
# In a new terminal
curl http://localhost:8000/api/flood/health
```

**Expected Response**:
```json
{
  "status": "ready",
  "message": "No runs yet, but pipeline is ready",
  "first_run_needed": true
}
```
- [ ] Health check passes

---

## ⏳ PHASE 3: Test Pipeline Execution (YOUR TURN)

### Step 1: Run Pipeline
```bash
cd Flowz/pipeline
python orchestrator.py --suffix INITIAL_TEST
```
- [ ] Pipeline runs without errors
- [ ] All 4 stages complete
- [ ] Output shows "✅ PIPELINE COMPLETED SUCCESSFULLY"

### Step 2: Verify Data Created
```bash
# Check that data was saved
dir data_store\runs
```
- [ ] New `run_2026_02_10_XXXX_INITIAL_TEST` directory exists

### Step 3: Test API with Real Data
```bash
curl http://localhost:8000/api/flood/predictions/latest
```

**Expected Response**:
```json
{
  "id": "run_2026_02_10_XXXX_INITIAL_TEST",
  "location": "Kolkata Region",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "riskScore": 0.95,
  "severityLevel": "CRITICAL",
  "waterLevel": 3.2,
  "status": "ACTIVE"
}
```
- [ ] API returns latest predictions
- [ ] Data matches pipeline output

---

## ⏳ PHASE 4: Frontend Integration (YOUR TURN)

### Step 1: Create React Hook
In `src/hooks/useFloodData.js`:

```javascript
import { useEffect, useState } from 'react';

export function useFloodData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetch('/api/flood/predictions/latest')
            .then(r => {
                if (!r.ok) throw new Error('API error');
                return r.json();
            })
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);
    
    return { data, loading, error };
}
```
- [ ] Hook created
- [ ] Fetches from API endpoint

### Step 2: Create Flood Forecast Component
In `src/components/FloodForecast.jsx`:

```javascript
import { useFloodData } from '../hooks/useFloodData';

export function FloodForecast() {
    const { data, loading, error } = useFloodData();
    
    if (loading) return <div>Loading forecast...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No forecast data available</div>;
    
    const severity_class = {
        'LOW': 'severity-low',
        'MODERATE': 'severity-moderate',
        'HIGH': 'severity-high',
        'CRITICAL': 'severity-critical'
    };
    
    return (
        <div className="flood-forecast">
            <h2>{data.location}</h2>
            <div className={`severity-badge ${severity_class[data.severityLevel]}`}>
                {data.severityLevel}
            </div>
            <div className="metrics">
                <div className="metric">
                    <label>Risk Score</label>
                    <div className="value">{(data.riskScore * 100).toFixed(1)}%</div>
                </div>
                <div className="metric">
                    <label>Water Level</label>
                    <div className="value">{data.waterLevel}m</div>
                </div>
                <div className="metric">
                    <label>Status</label>
                    <div className="value">{data.status}</div>
                </div>
                <div className="metric">
                    <label>Updated</label>
                    <div className="value">{new Date(data.timestamp).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
}
```
- [ ] Component created
- [ ] Displays forecast data
- [ ] Uses CSS classes for styling

### Step 3: Add Component to Dashboard
In `src/pages/Dashboard.jsx` (or your main page):

```javascript
import { FloodForecast } from '../components/FloodForecast';

export function Dashboard() {
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <FloodForecast />
            {/* Other dashboard components */}
        </div>
    );
}
```
- [ ] Component imported
- [ ] Component added to page

### Step 4: Add Basic Styling
In `src/styles/flood.css`:

```css
.flood-forecast {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    background: #f9f9f9;
}

.severity-badge {
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: bold;
    display: inline-block;
    margin: 10px 0;
}

.severity-low {
    background: #4ade80;
    color: white;
}

.severity-moderate {
    background: #facc15;
    color: #333;
}

.severity-high {
    background: #f97316;
    color: white;
}

.severity-critical {
    background: #dc2626;
    color: white;
}

.metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.metric {
    background: white;
    padding: 15px;
    border-radius: 4px;
    border-left: 4px solid #3b82f6;
}

.metric label {
    display: block;
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 5px;
}

.metric .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
}
```
- [ ] Styling added
- [ ] Component displays properly

---

## ⏳ PHASE 5: Run Historical Data Visualization (YOUR TURN)

### Step 1: Create Runs List Component
In `src/components/RunsList.jsx`:

```javascript
import { useEffect, useState } from 'react';

export function RunsList() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch('/api/flood/runs/list')
            .then(r => r.json())
            .then(setRuns)
            .finally(() => setLoading(false));
    }, []);
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="runs-list">
            <h3>Forecast History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Run ID</th>
                        <th>Status</th>
                        <th>Start Time</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map(run => (
                        <tr key={run.run_id}>
                            <td>{run.run_id}</td>
                            <td>{run.status}</td>
                            <td>{new Date(run.start_time).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```
- [ ] Component created
- [ ] Displays all runs

---

## ⏳ PHASE 6: Optional - Scheduled Pipeline Runs (YOUR TURN)

### Automatic Daily Runs
Edit `backend/main.py`:

```python
from apscheduler.schedulers.background import BackgroundScheduler
import sys
from pathlib import Path

# Setup scheduler
scheduler = BackgroundScheduler()

@scheduler.scheduled_job('cron', hour=6, minute=0)
def daily_flood_forecast():
    """Run flood prediction every day at 6 AM"""
    try:
        sys.path.insert(0, str(Path(__file__).parent.parent / "pipeline"))
        from orchestrator import run_pipeline
        from config import Config
        
        run_id = Config.get_run_id("DAILY")
        run_pipeline(run_id=run_id)
        print(f"Daily forecast completed: {run_id}")
    except Exception as e:
        print(f"Daily forecast failed: {e}")

# Start scheduler in your app startup
scheduler.start()
```
- [ ] (Optional) Scheduler configured
- [ ] (Optional) Daily runs working

---

## 📊 Testing Checklist

### Basic Tests
- [ ] `python orchestrator.py --list` works
- [ ] `python orchestrator.py --suffix TEST` runs successfully
- [ ] `data_store/runs/run_*` directory created
- [ ] `curl http://localhost:8000/api/flood/health` returns 200

### Integration Tests
- [ ] Frontend loads without errors
- [ ] FloodForecast component displays data
- [ ] Risk score updates when new pipeline run completes
- [ ] RunsList shows historical data

### End-to-End Test
1. [ ] Backend running (`python backend/main.py`)
2. [ ] Frontend running (`npm run dev`)
3. [ ] Run pipeline (`python orchestrator.py --suffix E2E_TEST`)
4. [ ] Check frontend displays latest forecast
5. [ ] Check RunsList shows new run

---

## 🎯 Success Criteria

Your integration is complete when:

- ✅ Pipeline runs successfully: `orchestrator.py` executes all 4 stages
- ✅ Data saved correctly: `data_store/runs/run_*` directories exist
- ✅ API accessible: All `/api/flood/*` endpoints respond correctly
- ✅ Frontend displays data: FloodForecast component shows predictions
- ✅ Historical runs visible: RunsList shows all previous runs
- ✅ End-to-end flow works: Run pipeline → Data appears in UI

---

## 📞 Troubleshooting

### Pipeline not creating output directories
```bash
# Check config paths
python -c "from config import Config; print(Config.DATA_STORE_DIR)"

# Fix: Ensure data_store folder exists
mkdir -p data_store\runs
```

### API endpoints returning 404
```bash
# Ensure backend integration is installed correctly
# Check that flood_integration is imported in main.py
grep "flood_integration" backend/app/main.py
```

### Frontend not fetching data
```javascript
// Check browser console for errors
// Check API is running: http://localhost:8000/api/flood/health
// Check CORS if frontend on different port
```

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md) | Overview of what's connected |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Commands and code snippets |
| [pipeline/PIPELINE_GUIDE.md](pipeline/PIPELINE_GUIDE.md) | Detailed technical guide |
| [PIPELINE_INTEGRATION_EXAMPLE.py](PIPELINE_INTEGRATION_EXAMPLE.py) | Backend API code |

---

## 🎉 Completion

Once all phases are complete:

1. You'll have a **fully operational flood prediction system**
2. Pipeline data flows seamlessly to your **backend API**
3. Predictions display in your **React frontend**
4. System can be **scheduled for automatic runs**
5. **Historical data** is always available

**Estimated Time**: 2-3 hours for complete setup

---

**Version**: 1.0  
**Created**: 2026-02-10  
**Status**: Ready for deployment
