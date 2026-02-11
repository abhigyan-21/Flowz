import apiClient from './apiClient';

// Analytics service with pipeline integration
const analyticsService = {
    // Get DL predictions summary for dashboard
    getDLPredictionsSummary: async () => {
        try {
            return await apiClient.get('/predictions/dl/summary');
        } catch (err) {
            console.warn('analyticsService: failed to fetch DL API, trying pipeline API', err?.message || err);
            
            // Try pipeline API as fallback
            try {
                const pipelineData = await apiClient.get('/flood/predictions/latest');
                // Convert pipeline format to DL format
                return {
                    total_predictions: 1,
                    predictions: [{
                        prediction_id: pipelineData.id,
                        region: pipelineData.location,
                        basin: 'Pipeline Basin',
                        severity: pipelineData.severityLevel,
                        risk_score: Math.round(pipelineData.riskScore * 100),
                        peak_depth: pipelineData.waterLevel,
                        affected_area_km2: 25.0,
                        inference_timestamp: pipelineData.timestamp,
                        forecast_cycle: pipelineData.timestamp
                    }]
                };
            } catch (pipelineErr) {
                console.warn('analyticsService: pipeline API also failed, returning mock data');
                
                // Minimal mock summary to allow frontend development without backend
                const now = new Date();
                const mockPreds = Array.from({ length: 6 }).map((_, i) => ({
                    prediction_id: `mock-${i+1}`,
                    region: `Region ${i+1}`,
                    basin: `Basin-${i+1}`,
                    severity: ['LOW','MEDIUM','HIGH'][i % 3],
                    risk_score: Math.round(Math.random() * 100),
                    peak_depth: parseFloat((Math.random() * 2).toFixed(2)),
                    affected_area_km2: parseFloat((Math.random() * 50).toFixed(1)),
                    inference_timestamp: now.toISOString(),
                    forecast_cycle: '2026-02-09T00:00:00Z'
                }));

                return { total_predictions: mockPreds.length, predictions: mockPreds };
            }
        }
    },

    // Get pipeline runs list
    getPipelineRuns: async () => {
        try {
            return await apiClient.get('/flood/runs/list');
        } catch (err) {
            console.warn('analyticsService: failed to fetch pipeline runs', err?.message || err);
            return [];
        }
    },

    // Trigger new pipeline run
    triggerPipelineRun: async (suffix = 'MANUAL') => {
        try {
            return await apiClient.post(`/flood/pipeline/run?suffix=${suffix}`);
        } catch (err) {
            console.error('analyticsService: failed to trigger pipeline run', err?.message || err);
            throw err;
        }
    },

    // Get pipeline health
    getPipelineHealth: async () => {
        try {
            return await apiClient.get('/flood/health');
        } catch (err) {
            console.warn('analyticsService: failed to get pipeline health', err?.message || err);
            return { status: 'unavailable', message: 'Pipeline not accessible' };
        }
    }
};

export default analyticsService;
