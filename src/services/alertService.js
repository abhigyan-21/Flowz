import apiClient from './apiClient';

const alertService = {
    // Get all active alerts
    getAlerts: async (params) => {
        return apiClient.get('/alerts/generate', { params });
    },

    // Get details of a specific alert
    getAlertById: async (id) => {
        return apiClient.get(`/alerts/${id}`);
    }
};

export default alertService;
