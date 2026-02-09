import apiClient from './apiClient';

// Mock hydrograph data for different locations
const generateMockHydrograph = (locationId, scenario = 'average') => {
    const now = new Date();
    const data = [];
    const baseLevel = 45 + Math.random() * 20;
    const scenarios = {
        pessimistic: 1.35,
        average: 1.0,
        optimistic: 0.7
    };
    const multiplier = scenarios[scenario] || 1.0;

    // Generate 48-hour forecast (2 days)
    for (let i = 0; i < 48; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        const variance = Math.sin(i / 8) * 10 + Math.random() * 5;
        const level = baseLevel + variance * multiplier;
        
        data.push({
            timestamp: time.toISOString(),
            waterLevel: Math.max(20, Math.min(80, level)),
            rainfall: Math.max(0, Math.random() * 50 - 10),
            temperature: 25 + Math.random() * 10,
            humidity: 60 + Math.random() * 30
        });
    }

    return data;
};

const forecastService = {
    // Get forecast for a specific location
    getForecast: async (locationId, scenario = 'average') => {
        try {
            return await apiClient.get(`/timeseries/${locationId}/hydrograph`, {
                params: { scenario }
            });
        } catch (error) {
            console.warn(`Forecast backend unavailable for ${locationId}, using mock data:`, error.message);
            // Return mock hydrograph data
            return {
                locationId,
                scenario,
                data: generateMockHydrograph(locationId, scenario),
                message: 'Using mock forecast data (backend unavailable)'
            };
        }
    }
};

export default forecastService;

