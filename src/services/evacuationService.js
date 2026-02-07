import apiClient from './apiClient';

const evacuationService = {
    // Calculate evacuation plan
    getEvacuationPlan: async (currentLocation) => {
        return apiClient.post('/evacuation/plan', { currentLocation });
    },

    // Get shelters for a location
    getShelters: async (locationId) => {
        return apiClient.get(`/evacuation/shelters/${locationId}`);
    }
};

export default evacuationService;
