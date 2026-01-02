import apiClient from './apiClient';

const locationService = {
    // List supported locations/cities
    getLocations: async (query) => {
        // Mock locations
        return new Promise(resolve => {
            setTimeout(() => resolve({
                data: [
                    { id: 'loc_mum', name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
                    { id: 'loc_del', name: 'Delhi, India', lat: 28.7041, lng: 77.1025 },
                    { id: 'loc_che', name: 'Chennai, India', lat: 13.0827, lng: 80.2707 },
                    { id: 'loc_kol', name: 'Kolkata, India', lat: 22.5726, lng: 88.3639 }
                ]
            }), 400);
        });
        // return apiClient.get('/locations', { params: query });
    },

    // Get specific location details
    getLocationById: async (id) => {
        return apiClient.get(`/locations/${id}`);
    }
};

export default locationService;
