import apiClient from './apiClient';

const forecastService = {
    // Get forecast for a specific location
    getForecast: async (locationId, scenario = 'average') => {
        // Mock Data
        const mockForecast = [
            { day: 'Mon', level: '1.2m', risk: 'Low', color: '#81C784' },
            { day: 'Tue', level: '2.1m', risk: 'Moderate', color: '#FFB74D' },
            { day: 'Wed', level: '3.5m', risk: 'High', color: '#E57373' },
            { day: 'Thu', level: '2.8m', risk: 'Moderate', color: '#FFB74D' },
            { day: 'Fri', level: '1.5m', risk: 'Low', color: '#81C784' },
            { day: 'Sat', level: '1.1m', risk: 'Low', color: '#81C784' },
            { day: 'Sun', level: '0.9m', risk: 'Low', color: '#81C784' },
        ];

        return new Promise((resolve) => setTimeout(() => resolve({ data: mockForecast }), 600));

        /* return apiClient.get(`/forecasts/${locationId}`, {
            params: { scenario }
        }); */
    }
};

export default forecastService;
