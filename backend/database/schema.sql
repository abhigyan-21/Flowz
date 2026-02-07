-- West Bengal Flood Prediction Database Schema
-- PostgreSQL + PostGIS + TimescaleDB

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Predictions table
CREATE TABLE predictions (
    id VARCHAR(50) PRIMARY KEY,
    location_name VARCHAR(200) NOT NULL,
    basin VARCHAR(100) NOT NULL,
    center GEOGRAPHY(POINT, 4326) NOT NULL,
    risk_score FLOAT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
    severity_class VARCHAR(20) NOT NULL CHECK (severity_class IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    influence_radius FLOAT NOT NULL,
    time_to_peak INTEGER NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    peak_discharge FLOAT,
    max_water_depth FLOAT,
    affected_area_estimate FLOAT,
    flood_duration INTEGER,
    simulation_available BOOLEAN DEFAULT TRUE,
    has_historical_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    forecast_cycle VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    
    -- Indexes
    CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 1),
    CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- Spatial index on location
CREATE INDEX idx_predictions_center ON predictions USING GIST (center);

-- Index on severity for filtering alerts
CREATE INDEX idx_predictions_severity ON predictions (severity_class);

-- Index on forecast cycle for querying latest predictions
CREATE INDEX idx_predictions_forecast_cycle ON predictions (forecast_cycle);


-- Simulation frames table (image metadata)
CREATE TABLE simulation_frames (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(50) NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    time_offset INTEGER NOT NULL,
    time_label VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    water_level FLOAT NOT NULL CHECK (water_level >= 0 AND water_level <= 1),
    depth FLOAT NOT NULL,
    affected_area FLOAT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    is_peak BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Store bounds as JSON for flexibility
    bounds JSONB NOT NULL,
    
    -- Ensure unique frames per prediction
    UNIQUE (prediction_id, time_offset)
);

-- Index for querying frames by prediction
CREATE INDEX idx_frames_prediction ON simulation_frames (prediction_id);


-- Flood polygons table (optional - for vector overlays)
CREATE TABLE flood_polygons (
    id SERIAL PRIMARY KEY,
    frame_id INTEGER NOT NULL REFERENCES simulation_frames(id) ON DELETE CASCADE,
    geometry GEOGRAPHY(POLYGON, 4326) NOT NULL,
    depth FLOAT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spatial index on flood polygons
CREATE INDEX idx_polygons_geometry ON flood_polygons USING GIST (geometry);


-- Historical validation table
CREATE TABLE prediction_validation (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(50) NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    issued_at TIMESTAMP NOT NULL,
    valid_for TIMESTAMP NOT NULL,
    
    -- Predicted values
    predicted_risk_score FLOAT NOT NULL,
    predicted_severity VARCHAR(20) NOT NULL,
    predicted_peak_discharge FLOAT,
    predicted_max_depth FLOAT,
    predicted_time_to_peak INTEGER,
    
    -- Actual observed values
    actual_peak_discharge FLOAT,
    actual_max_depth FLOAT,
    actual_time_to_peak FLOAT,
    reported_inundation FLOAT,
    gauge_station VARCHAR(100),
    
    -- Validation metrics
    discharge_error FLOAT,
    discharge_error_percent FLOAT,
    depth_error FLOAT,
    depth_error_percent FLOAT,
    timing_error FLOAT,
    outcome VARCHAR(20) CHECK (outcome IN ('HIT', 'MISS', 'PENDING', 'PARTIAL')),
    accuracy_score FLOAT CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
    
    notes TEXT,
    recorded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying validation by prediction
CREATE INDEX idx_validation_prediction ON prediction_validation (prediction_id);

-- Index for outcome statistics
CREATE INDEX idx_validation_outcome ON prediction_validation (outcome);


-- Hydrograph data table (time series)
-- Use TimescaleDB extension for efficient time-series storage
-- To enable: CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE hydrograph_data (
    timestamp TIMESTAMPTZ NOT NULL,
    prediction_id VARCHAR(50) NOT NULL,
    gauge_station VARCHAR(100) NOT NULL,
    river VARCHAR(100),
    discharge FLOAT NOT NULL,
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('forecast', 'observed')),
    
    -- Additional metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (timestamp, prediction_id, data_type)
);

-- If TimescaleDB is available, convert to hypertable:
-- SELECT create_hypertable('hydrograph_data', 'timestamp');

-- Index for querying by prediction
CREATE INDEX idx_hydrograph_prediction ON hydrograph_data (prediction_id, timestamp DESC);

-- Index for querying by gauge
CREATE INDEX idx_hydrograph_gauge ON hydrograph_data (gauge_station, timestamp DESC);


-- Alerts table (generated from high-severity predictions)
CREATE TABLE alerts (
    id VARCHAR(50) PRIMARY KEY,
    prediction_id VARCHAR(50) NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    affected_regions JSONB,
    safety_actions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for active alerts
CREATE INDEX idx_alerts_active ON alerts (is_active, severity);

-- Index for time-based queries
CREATE INDEX idx_alerts_time ON alerts (issued_at DESC);


-- Basins metadata table
CREATE TABLE basins (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bounds GEOGRAPHY(POLYGON, 4326) NOT NULL,
    major_rivers JSONB,
    monitoring_points INTEGER DEFAULT 0,
    model_confidence VARCHAR(20) CHECK (model_confidence IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spatial index on basin bounds
CREATE INDEX idx_basins_bounds ON basins USING GIST (bounds);


-- Model execution log (for tracking ML runs)
CREATE TABLE model_executions (
    id SERIAL PRIMARY KEY,
    model_version VARCHAR(20) NOT NULL,
    forecast_cycle VARCHAR(50) NOT NULL,
    execution_time TIMESTAMP NOT NULL,
    input_sources JSONB,
    predictions_generated INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('running', 'completed', 'failed')),
    error_message TEXT,
    duration_seconds FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying execution history
CREATE INDEX idx_executions_time ON model_executions (execution_time DESC);


-- Driving factors table (stores input data for each prediction)
CREATE TABLE driving_factors (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(50) NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    rainfall_24h FLOAT,
    upstream_discharge FLOAT,
    soil_saturation FLOAT CHECK (soil_saturation >= 0 AND soil_saturation <= 1),
    tide_level FLOAT,
    reservoir_release FLOAT,
    slope_instability BOOLEAN,
    additional_factors JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE (prediction_id)
);

-- Index for querying factors by prediction
CREATE INDEX idx_factors_prediction ON driving_factors (prediction_id);


-- Views for common queries

-- Active high-severity predictions
CREATE VIEW active_critical_predictions AS
SELECT 
    p.id,
    p.location_name,
    p.basin,
    ST_AsGeoJSON(p.center) as center_geojson,
    p.risk_score,
    p.severity_class,
    p.influence_radius,
    p.time_to_peak,
    p.forecast_cycle,
    p.created_at
FROM predictions p
WHERE p.severity_class IN ('HIGH', 'CRITICAL')
ORDER BY p.risk_score DESC, p.time_to_peak ASC;


-- Latest predictions per location
CREATE VIEW latest_predictions AS
SELECT DISTINCT ON (p.location_name)
    p.*,
    ST_AsGeoJSON(p.center) as center_geojson
FROM predictions p
ORDER BY p.location_name, p.created_at DESC;


-- Validation statistics
CREATE VIEW validation_statistics AS
SELECT 
    COUNT(*) as total_validations,
    COUNT(CASE WHEN outcome = 'HIT' THEN 1 END) as hits,
    COUNT(CASE WHEN outcome = 'MISS' THEN 1 END) as misses,
    COUNT(CASE WHEN outcome = 'PENDING' THEN 1 END) as pending,
    AVG(CASE WHEN outcome IN ('HIT', 'MISS') THEN accuracy_score END) as avg_accuracy,
    AVG(discharge_error_percent) as avg_discharge_error_pct,
    AVG(depth_error_percent) as avg_depth_error_pct
FROM prediction_validation;


-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for predictions table
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Function to automatically generate alerts for high-severity predictions
CREATE OR REPLACE FUNCTION generate_alert_for_prediction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.severity_class IN ('HIGH', 'CRITICAL') THEN
        INSERT INTO alerts (
            id,
            prediction_id,
            alert_type,
            severity,
            title,
            description,
            issued_at,
            valid_until,
            is_active
        ) VALUES (
            'alert_' || NEW.id,
            NEW.id,
            'FLOOD_WARNING',
            NEW.severity_class,
            NEW.location_name || ' - Flood Warning',
            'Flood prediction generated for ' || NEW.location_name,
            NOW(),
            NOW() + INTERVAL '48 hours',
            TRUE
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            severity = EXCLUDED.severity,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            issued_at = EXCLUDED.issued_at,
            valid_until = EXCLUDED.valid_until;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate alerts
CREATE TRIGGER auto_generate_alerts AFTER INSERT OR UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION generate_alert_for_prediction();


-- Sample data insert (for testing)
-- Uncomment to insert sample prediction

/*
INSERT INTO predictions (
    id, location_name, basin, center, risk_score, severity_class,
    influence_radius, time_to_peak, confidence, peak_discharge,
    max_water_depth, affected_area_estimate, flood_duration,
    forecast_cycle, model_version
) VALUES (
    'pred_test_001',
    'Test Location',
    'Test Basin',
    ST_GeogFromText('POINT(88.3639 22.5726)'),
    0.85,
    'HIGH',
    5000,
    12,
    0.92,
    35000,
    2.5,
    85.5,
    24,
    'TEST_20260207_06',
    'v2.3.1'
);
*/

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
