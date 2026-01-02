import apiClient from './apiClient';

// Mock data for development
const MOCK_ALERTS = [
    { id: 1, lat: 19.0760, lng: 72.8777, name: 'Mumbai - Heavy Rain', severity: 'High', type: 'rainfall' },
    { id: 2, lat: 28.7041, lng: 77.1025, name: 'Delhi - Heatwave', severity: 'Moderate', type: 'heat' },
    { id: 3, lat: 13.0827, lng: 80.2707, name: 'Chennai - Cyclone', severity: 'High', type: 'cyclone' },
    { id: 4, lat: 22.5726, lng: 88.3639, name: 'Kolkata - Normal', severity: 'Low', type: 'normal' },
    { id: 5, lat: 25.5, lng: 85.0, name: 'Bihar - Flood Risk', severity: 'High', type: 'flood' }
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
