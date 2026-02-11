import apiClient from './apiClient';

const simulationService = {
    /**
     * Fetch simulation frames for a prediction
     * @param {string} predictionId - The prediction ID
     * @returns {Promise} Simulation frames with images and metadata
     */
    getSimulationFrames: async (predictionId) => {
        try {
            const response = await apiClient.get(`/simulations/${predictionId}`);
            return response;
        } catch (error) {
            console.warn(`Failed to fetch simulation for ${predictionId}:`, error?.message);
            // Fallback to mock data
            return simulationService._generateMockFrames(predictionId);
        }
    },

    /**
     * Get ArcGIS rendered simulation frame
     * @param {string} predictionId - The prediction ID
     * @param {number} timeOffset - Time offset in hours
     * @returns {Promise} ArcGIS map image URL
     */
    getArcGISFrame: async (predictionId, timeOffset) => {
        try {
            const response = await apiClient.get(`/simulations/arcgis/${predictionId}`, {
                params: { timeOffset, format: 'png', width: 1024, height: 768 }
            });
            return response;
        } catch (error) {
            console.error('Failed to fetch ArcGIS frame:', error);
            throw error;
        }
    },

    /**
     * Get elevation profile for simulation area
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise} Elevation data
     */
    getElevationProfile: async (lat, lon) => {
        try {
            const response = await apiClient.get(`/simulations/elevation`, {
                params: { lat, lon }
            });
            return response;
        } catch (error) {
            console.warn('Failed to fetch elevation profile:', error);
            return null;
        }
    },

    /**
     * Get analytics for a simulation
     * @param {string} predictionId - The prediction ID
     * @returns {Promise} Simulation analytics
     */
    getSimulationAnalytics: async (predictionId) => {
        try {
            const response = await apiClient.get(`/simulations/${predictionId}/analytics`);
            return response;
        } catch (error) {
            console.warn('Failed to fetch simulation analytics:', error);
            return null;
        }
    },

    /**
     * Export simulation as GIS layer
     * @param {string} predictionId - The prediction ID
     * @param {string} format - Export format (geojson, shp, kmz)
     * @returns {Promise} Download URL or blob
     */
    exportAsGISLayer: async (predictionId, format = 'geojson') => {
        try {
            const response = await apiClient.get(`/simulations/${predictionId}/export`, {
                params: { format },
                responseType: format === 'geojson' ? 'json' : 'blob'
            });
            return response;
        } catch (error) {
            console.error('Failed to export simulation:', error);
            throw error;
        }
    },

    /**
     * Generate mock simulation frames (fallback)
     * @param {string} predictionId - The prediction ID
     * @private
     */
    _generateMockFrames: (predictionId) => {
        const timePoints = [0, 6, 12, 18, 24, 36, 48];
        const frames = timePoints.map((time, i) => {
            const phase = time / 48;
            const depth = phase <= 0.375 ? phase * 1.33 * 6 : Math.max(0, (1 - phase) * 1.67 * 6);
            
            return {
                timeOffset: time,
                timeLabel: time === 0 ? 'T+0h (Now)' : time === 18 ? `T+${time}h (Peak)` : `T+${time}h`,
                timestamp: new Date(Date.now() + time * 3600000).toISOString(),
                waterLevel: phase <= 0.375 ? phase * 1.33 : Math.max(0, (1 - phase) * 1.67),
                depth: parseFloat(depth.toFixed(1)),
                affectedArea: Math.round(depth * 250),
                imageUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1024' height='768'%3E%3Crect fill='%23${Math.round(phase * 255).toString(16).padStart(2, '0')}4466' width='1024' height='768'/%3E%3Ctext x='50' y='50' fill='white' font-size='24'%3ET${Math.round(time)}h - Depth: ${depth.toFixed(1)}m%3C/text%3E%3C/svg%3E`,
                thumbnailUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23${Math.round(phase * 255).toString(16).padStart(2, '0')}4466' width='200' height='150'/%3E%3C/svg%3E`,
                isPeak: time === 18
            };
        });

        return {
            predictionId,
            location: { name: 'Simulation Location', basin: 'River Basin' },
            simulation: {
                source: `LISFLOOD_v4.2_${predictionId}`,
                resolution: '500m',
                totalDuration: 48,
                frameCount: frames.length,
                recommendedFPS: 1
            },
            bounds: { west: 88.1, south: 21.5, east: 89.2, north: 22.6 },
            frames,
            legend: {
                depthScale: [
                    { depth: 0.0, color: '#FFFFFF00', label: 'No flood' },
                    { depth: 0.5, color: '#B3E5FC', label: '0.5m' },
                    { depth: 1.0, color: '#4FC3F7', label: '1m' },
                    { depth: 2.0, color: '#0288D1', label: '2m' },
                    { depth: 3.0, color: '#01579B', label: '3m' },
                    { depth: 5.0, color: '#1A237E', label: '5m+' }
                ]
            },
            metadata: {
                peakFrame: 3,
                peakDepth: 6.0,
                peakArea: 1500,
                recessionTime: 30
            }
        };
    }
};

export default simulationService;
