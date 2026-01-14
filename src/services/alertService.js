

// Mock data for development
const MOCK_ALERTS = [
    { id: 1, lat: 22.5726, lng: 88.3639, name: 'Kolkata - Heavy Rain', severity: 'High', type: 'rainfall' },
    { id: 2, lat: 27.0410, lng: 88.2663, name: 'Darjeeling - Landslide Risk', severity: 'High', type: 'landslide' },
    { id: 3, lat: 21.8380, lng: 88.8961, name: 'Sundarbans - Flood Warning', severity: 'Moderate', type: 'flood' },
    { id: 4, lat: 21.6266, lng: 87.5074, name: 'Digha - High Tide', severity: 'Moderate', type: 'tide' },
    { id: 5, lat: 26.7271, lng: 88.3953, name: 'Siliguri - Thunderstorm', severity: 'Low', type: 'storm' }
];

const alertService = {
    // Get all active alerts
    getAlerts: async (params) => {
        // Return mock data for demo purposes (simulate API delay)
        return new Promise((resolve) => {
            setTimeout(() => resolve({ data: MOCK_ALERTS }), 500);
        });
        // Real call: return apiClient.get('/alerts', { params });
    },

    // Get details of a specific alert
    getAlertById: async (id) => {
        return new Promise((resolve) => {
            const alert = MOCK_ALERTS.find(a => a.id == id) || MOCK_ALERTS[0];
            setTimeout(() => resolve({ data: alert }), 300);
        });
        // Real call: return apiClient.get(`/alerts/${id}`);
    }
};

export default alertService;
