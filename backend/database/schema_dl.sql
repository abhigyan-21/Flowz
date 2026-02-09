-- Deep Learning Predictions Database Schema
-- PostgreSQL + PostGIS for U-Net + ConvLSTM outputs

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- DEEP LEARNING PREDICTIONS TABLE
-- ============================================================================
-- Stores metadata for each 168-hour forecast from U-Net + ConvLSTM

CREATE TABLE dl_predictions (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(100) UNIQUE NOT NULL,
    forecast_cycle VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    inference_timestamp TIMESTAMP NOT NULL,
    
    -- Location Information
    basin VARCHAR(100) NOT NULL,
    region VARCHAR(200) NOT NULL,
    center GEOGRAPHY(POINT, 4326) NOT NULL,
    bounds GEOGRAPHY(POLYGON, 4326) NOT NULL,
    spatial_reference VARCHAR(20) DEFAULT 'EPSG:4326',
    ground_resolution_m FLOAT NOT NULL,
    
    -- Grid Dimensions
    grid_height INTEGER NOT NULL CHECK (grid_height > 0),
    grid_width INTEGER NOT NULL CHECK (grid_width > 0),
    grid_timesteps INTEGER NOT NULL CHECK (grid_timesteps > 0),
    
    -- Risk Assessment
    risk_score FLOAT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
    severity_class VARCHAR(20) NOT NULL CHECK (severity_class IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    uncertainty_std FLOAT,
    
    -- Aggregated Metrics
    peak_timestep INTEGER,
    peak_timestamp TIMESTAMP,
    peak_depth_max FLOAT,
    peak_depth_mean FLOAT,
    peak_velocity_max FLOAT,
    affected_area_km2 FLOAT,
    flooded_pixel_count INTEGER,
    total_water_volume_m3 FLOAT,
    flood_onset_time INTEGER,
    flood_duration_hours INTEGER,
    recession_time INTEGER,
    estimated_discharge_peak FLOAT,
    estimated_discharge_mean FLOAT,
    
    -- Infrastructure Impact
    buildings_at_risk INTEGER,
    road_segments_flooded INTEGER,
    population_exposed INTEGER,
    
    -- Model Metadata
    architecture VARCHAR(50) DEFAULT 'UNet-ConvLSTM',
    inference_time_seconds FLOAT,
    training_rmse_m FLOAT,
    training_date DATE,
    gpu_device VARCHAR(50),
    ensemble_size INTEGER,
    
    -- Storage URLs
    netcdf_url TEXT NOT NULL,
    netcdf_crf_url TEXT NOT NULL,
    arcgis_service_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_dl_pred_basin ON dl_predictions (basin);
CREATE INDEX idx_dl_pred_region ON dl_predictions (region);
CREATE INDEX idx_dl_pred_severity ON dl_predictions (severity_class);
CREATE INDEX idx_dl_pred_risk_score ON dl_predictions (risk_score DESC);
CREATE INDEX idx_dl_pred_inference_time ON dl_predictions (inference_timestamp DESC);
CREATE INDEX idx_dl_pred_forecast_cycle ON dl_predictions (forecast_cycle);

-- Spatial indexes
CREATE INDEX idx_dl_pred_center ON dl_predictions USING GIST (center);
CREATE INDEX idx_dl_pred_bounds ON dl_predictions USING GIST (bounds);

-- Composite index for common queries
CREATE INDEX idx_dl_pred_basin_time ON dl_predictions (basin, inference_timestamp DESC);


-- ============================================================================
-- RASTER TIMESTEPS TABLE
-- ============================================================================
-- Stores URLs and metadata for each timestep in the 168-hour forecast

CREATE TABLE dl_raster_timesteps (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(100) NOT NULL,
    timestep INTEGER NOT NULL,
    time_offset_hours INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    
    -- Raster URLs (GeoTIFF for analysis)
    depth_geotiff_url TEXT NOT NULL,
    velocity_x_geotiff_url TEXT,
    velocity_y_geotiff_url TEXT,
    
    -- Preview URLs (PNG for visualization)
    preview_png_url TEXT,
    thumbnail_url TEXT,
    
    -- Metrics for this specific timestep
    max_depth_m FLOAT,
    mean_depth_m FLOAT,
    max_velocity_ms FLOAT,
    flooded_pixels INTEGER,
    flooded_area_km2 FLOAT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_prediction
        FOREIGN KEY (prediction_id)
        REFERENCES dl_predictions(prediction_id)
        ON DELETE CASCADE,
    
    -- Ensure unique timestep per prediction
    UNIQUE (prediction_id, timestep)
);

-- Indexes
CREATE INDEX idx_raster_ts_prediction ON dl_raster_timesteps (prediction_id);
CREATE INDEX idx_raster_ts_timestep ON dl_raster_timesteps (prediction_id, timestep);
CREATE INDEX idx_raster_ts_timestamp ON dl_raster_timesteps (timestamp);


-- ============================================================================
-- INPUT FEATURES TABLE
-- ============================================================================
-- Stores input data used for each prediction

CREATE TABLE dl_input_features (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(100) NOT NULL,
    
    -- Meteorological inputs
    rainfall_24h_max_mm FLOAT,
    rainfall_7day_forecast_mm FLOAT,
    
    -- Hydrological inputs
    upstream_discharge_m3s FLOAT,
    soil_saturation_mean FLOAT CHECK (soil_saturation_mean >= 0 AND soil_saturation_mean <= 1),
    antecedent_moisture_index FLOAT,
    
    -- Coastal inputs
    tide_level_m FLOAT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_prediction_features
        FOREIGN KEY (prediction_id)
        REFERENCES dl_predictions(prediction_id)
        ON DELETE CASCADE,
    
    -- One feature set per prediction
    UNIQUE (prediction_id)
);

CREATE INDEX idx_input_features_prediction ON dl_input_features (prediction_id);


-- ============================================================================
-- DATA SOURCES TABLE
-- ============================================================================
-- Tracks provenance of input data

CREATE TABLE dl_data_sources (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(100) NOT NULL,
    
    -- Source identifiers
    lisflood_run_id VARCHAR(100),
    weather_forecast_source VARCHAR(100),
    gauge_data_timestamp TIMESTAMP,
    dem_version VARCHAR(50),
    
    -- Additional metadata
    additional_sources JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_prediction_sources
        FOREIGN KEY (prediction_id)
        REFERENCES dl_predictions(prediction_id)
        ON DELETE CASCADE,
    
    UNIQUE (prediction_id)
);

CREATE INDEX idx_data_sources_prediction ON dl_data_sources (prediction_id);
CREATE INDEX idx_data_sources_lisflood ON dl_data_sources (lisflood_run_id);


-- ============================================================================
-- MODEL EXECUTIONS LOG
-- ============================================================================
-- Tracks all model runs for monitoring and debugging

CREATE TABLE dl_model_executions (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(100),
    
    -- Execution metadata
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_seconds FLOAT,
    status VARCHAR(20) CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    
    -- Resource usage
    gpu_device VARCHAR(50),
    gpu_memory_gb FLOAT,
    cpu_count INTEGER,
    
    -- Model configuration
    model_version VARCHAR(20),
    ensemble_size INTEGER,
    input_timesteps INTEGER,
    output_timesteps INTEGER,
    
    -- Error tracking
    error_message TEXT,
    error_traceback TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key (nullable because execution might fail before prediction is created)
    CONSTRAINT fk_prediction_execution
        FOREIGN KEY (prediction_id)
        REFERENCES dl_predictions(prediction_id)
        ON DELETE SET NULL
);

CREATE INDEX idx_executions_status ON dl_model_executions (status);
CREATE INDEX idx_executions_time ON dl_model_executions (started_at DESC);
CREATE INDEX idx_executions_prediction ON dl_model_executions (prediction_id);


-- ============================================================================
-- VALIDATION RESULTS TABLE
-- ============================================================================
-- Stores comparison between predicted and observed flooding

CREATE TABLE dl_validation_results (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(100) NOT NULL,
    
    -- Validation timestamp
    validated_at TIMESTAMP NOT NULL,
    
    -- Observed data
    observed_peak_depth_m FLOAT,
    observed_peak_timestamp TIMESTAMP,
    observed_flooded_area_km2 FLOAT,
    observed_duration_hours INTEGER,
    
    -- Error metrics
    depth_rmse_m FLOAT,
    depth_mae_m FLOAT,
    area_error_percent FLOAT,
    timing_error_hours FLOAT,
    
    -- Spatial accuracy (if available)
    iou_score FLOAT CHECK (iou_score >= 0 AND iou_score <= 1),  -- Intersection over Union
    f1_score FLOAT CHECK (f1_score >= 0 AND f1_score <= 1),
    
    -- Overall assessment
    validation_score FLOAT CHECK (validation_score >= 0 AND validation_score <= 1),
    outcome VARCHAR(20) CHECK (outcome IN ('HIT', 'MISS', 'PARTIAL', 'PENDING')),
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_prediction_validation
        FOREIGN KEY (prediction_id)
        REFERENCES dl_predictions(prediction_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_validation_prediction ON dl_validation_results (prediction_id);
CREATE INDEX idx_validation_outcome ON dl_validation_results (outcome);
CREATE INDEX idx_validation_score ON dl_validation_results (validation_score DESC);


-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active high-risk predictions
CREATE VIEW v_active_critical_predictions AS
SELECT 
    p.id,
    p.prediction_id,
    p.region,
    p.basin,
    ST_AsGeoJSON(p.center) as center_geojson,
    ST_AsGeoJSON(p.bounds) as bounds_geojson,
    p.risk_score,
    p.severity_class,
    p.peak_depth_max,
    p.affected_area_km2,
    p.peak_timestamp,
    p.inference_timestamp,
    p.netcdf_crf_url,
    p.arcgis_service_url
FROM dl_predictions p
WHERE p.severity_class IN ('HIGH', 'CRITICAL')
    AND p.peak_timestamp > NOW()  -- Future peak
ORDER BY p.risk_score DESC, p.peak_timestamp ASC;


-- Latest prediction per basin
CREATE VIEW v_latest_predictions_by_basin AS
SELECT DISTINCT ON (p.basin)
    p.prediction_id,
    p.basin,
    p.region,
    p.severity_class,
    p.risk_score,
    p.peak_depth_max,
    p.inference_timestamp,
    p.netcdf_crf_url
FROM dl_predictions p
ORDER BY p.basin, p.inference_timestamp DESC;


-- Model performance summary
CREATE VIEW v_model_performance_summary AS
SELECT 
    v.outcome,
    COUNT(*) as count,
    AVG(v.depth_rmse_m) as avg_depth_rmse,
    AVG(v.timing_error_hours) as avg_timing_error,
    AVG(v.validation_score) as avg_validation_score,
    AVG(v.iou_score) as avg_iou,
    AVG(v.f1_score) as avg_f1
FROM dl_validation_results v
WHERE v.outcome IN ('HIT', 'MISS', 'PARTIAL')
GROUP BY v.outcome;


-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dl_predictions_updated_at 
    BEFORE UPDATE ON dl_predictions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- Function to calculate influence radius for heatmap visualization
CREATE OR REPLACE FUNCTION calculate_influence_radius(p_risk_score FLOAT)
RETURNS FLOAT AS $$
BEGIN
    -- Radius scales with risk score: 3-13 km range
    RETURN 3000 + (p_risk_score * 10000);
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SAMPLE DATA
-- ============================================================================
-- Uncomment to insert a sample DL prediction for testing

/*
INSERT INTO dl_predictions (
    prediction_id,
    forecast_cycle,
    model_version,
    inference_timestamp,
    basin,
    region,
    center,
    bounds,
    ground_resolution_m,
    grid_height,
    grid_width,
    grid_timesteps,
    risk_score,
    severity_class,
    confidence,
    peak_timestep,
    peak_timestamp,
    peak_depth_max,
    affected_area_km2,
    netcdf_url,
    netcdf_crf_url
) VALUES (
    'pred_kolkata_dl_20260208_0600',
    'IMD_20260208_06',
    'v2.3.1',
    '2026-02-08 06:00:00',
    'Ganges-Hooghly',
    'Kolkata Metropolitan Area',
    ST_GeogFromText('POINT(88.3639 22.5726)'),
    ST_GeogFromText('POLYGON((88.25 22.45, 88.50 22.45, 88.50 22.70, 88.25 22.70, 88.25 22.45))'),
    10.0,
    1024,
    1024,
    168,
    0.87,
    'HIGH',
    0.92,
    18,
    '2026-02-09 00:00:00',
    3.24,
    125.5,
    's3://flood-predictions/kolkata/20260208_0600/forecast.nc',
    'https://arcgis-cdn.com/crf/kolkata/20260208_0600/forecast.crf'
);
*/


-- ============================================================================
-- PERMISSIONS (adjust for your database user)
-- ============================================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flood_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flood_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO flood_user;
