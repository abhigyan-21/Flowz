import apiClient from './apiClient';

const forecastService = {
    // Get forecast for a specific location
    getForecast: async (locationId, scenario = 'average') => {
        return apiClient.get(`/timeseries/${locationId}/hydrograph`, {
            params: { scenario }
        });
    }
};

export default forecastService;
