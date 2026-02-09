from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.config import settings
from app.routers import predictions, simulation, alerts, history, timeseries, config, dl_predictions, evacuation

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("🚀 Flood Prediction API Starting...")
    print(f"📍 Mode: {'MOCK DATA' if settings.MOCK_MODE else 'PRODUCTION'}")
    yield
    print("👋 Shutting down...")

app = FastAPI(
    title="West Bengal Flood Prediction API",
    description="ML-powered flood prediction system using LISFLOOD simulations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(predictions.router, prefix="/api", tags=["Predictions"])
app.include_router(simulation.router, prefix="/api", tags=["Simulation"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(timeseries.router, prefix="/api", tags=["Time Series"])
app.include_router(config.router, prefix="/api", tags=["Configuration"])
app.include_router(dl_predictions.router, prefix="/api", tags=["Deep Learning Predictions"])
app.include_router(evacuation.router, prefix="/api", tags=["Evacuation"])

@app.get("/")
async def root():
    return {
        "message": "West Bengal Flood Prediction API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "mock" if settings.MOCK_MODE else "production"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
