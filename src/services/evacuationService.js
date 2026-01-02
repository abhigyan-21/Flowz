import apiClient from './apiClient';

const evacuationService = {
    // Calculate evacuation plan
    getEvacuationPlan: async (currentLocation) => {
        // Mock Routes
        return new Promise(resolve => setTimeout(() => resolve({
            data: {
                routes: [
                    { id: 'r1', name: 'Route 66 (Safe)', status: 'safe', details: 'Traffic: Low. No water logging.' },
                    { id: 'r2', name: 'Highway 12 (Caution)', status: 'caution', details: 'Traffic: Moderate. Slippery roads.' }
                ]
            }
        }), 700));
        // return apiClient.post('/evacuation/plan', { currentLocation });
    },

    // Get shelters for a location
    getShelters: async (locationId) => {
        // Mock Shelters
        return new Promise(resolve => setTimeout(() => resolve({
            data: [
                { id: 's1', name: 'Central School Shelter', capacity: '80%', facilities: 'Medical aid available.' },
                { id: 's2', name: 'Community Hall', capacity: '40%', facilities: 'Food available.' }
            ]
        }), 600));
        // return apiClient.get(`/evacuation/shelters/${locationId}`);
    }
};

export default evacuationService;
