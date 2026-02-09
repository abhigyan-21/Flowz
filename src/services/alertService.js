import apiClient from './apiClient';

// Mock flood prediction data - will be replaced by backend data
const MOCK_FLOOD_PREDICTIONS = [
    {
        id: 'mock_1',
        name: 'Ganges River - Murshidabad',
        location: 'Murshidabad District',
        lat: 24.2,
        lng: 88.3,
        severity: 'High',
        description: 'Moderate flood risk due to heavy rainfall in upstream regions',
        waterLevel: 65.8,
        waterLevelThreshold: 70.0,
        rainfall: 240.5,
        temperature: 28.3,
        riskScore: 72,
        timestamp: new Date().toISOString(),
        basin: 'Ganges Basin'
    },
    {
        id: 'mock_2',
        name: 'Teesta River - Jalpaiguri',
        location: 'Jalpaiguri District',
        lat: 26.5,
        lng: 88.7,
        severity: 'Moderate',
        description: 'Elevated water levels observed. Monitoring ongoing',
        waterLevel: 58.2,
        waterLevelThreshold: 70.0,
        rainfall: 185.3,
        temperature: 26.1,
        riskScore: 58,
        timestamp: new Date().toISOString(),
        basin: 'Teesta Basin'
    },
    {
        id: 'mock_3',
        name: 'Damodar River - Asansol',
        location: 'Bardhaman District',
        lat: 23.68,
        lng: 86.95,
        severity: 'Moderate',
        description: 'Water levels rising due to upstream dam releases',
        waterLevel: 52.4,
        waterLevelThreshold: 70.0,
        rainfall: 156.8,
        temperature: 29.5,
        riskScore: 48,
        timestamp: new Date().toISOString(),
        basin: 'Damodar Basin'
    },
    {
        id: 'mock_4',
        name: 'Hooghly River - Howrah',
        location: 'Howrah District',
        lat: 22.6,
        lng: 88.3,
        severity: 'Low',
        description: 'Water levels stable. No immediate flood risk',
        waterLevel: 42.1,
        waterLevelThreshold: 70.0,
        rainfall: 95.2,
        temperature: 30.2,
        riskScore: 32,
        timestamp: new Date().toISOString(),
        basin: 'Ganges Basin'
    },
    {
        id: 'mock_5',
        name: 'Mahananda River - Siliguri',
        location: 'Darjeeling District',
        lat: 26.8,
        lng: 88.4,
        severity: 'High',
        description: 'High water levels detected. Evacuation advisory issued',
        waterLevel: 68.9,
        waterLevelThreshold: 70.0,
        rainfall: 320.1,
        temperature: 24.8,
        riskScore: 78,
        timestamp: new Date().toISOString(),
        basin: 'Mahananda Basin'
    }
];

const alertService = {
    // Get all active alerts
    getAlerts: async (params) => {
        try {
            return await apiClient.get('/alerts/generate', { params });
        } catch (error) {
            console.warn('Backend unavailable, using mock flood prediction data:', error.message);
            // Return mock data when backend is unavailable
            return {
                data: MOCK_FLOOD_PREDICTIONS,
                message: 'Using mock flood prediction data (backend unavailable)'
            };
        }
    },

    // Get details of a specific alert
    getAlertById: async (id) => {
        try {
            return await apiClient.get(`/alerts/${id}`);
        } catch (error) {
            console.warn('Backend unavailable, searching mock data:', error.message);
            // Search in mock data
            const alert = MOCK_FLOOD_PREDICTIONS.find(a => a.id === id);
            if (alert) {
                return alert;
            }
            return Promise.reject(error);
        }
    }
};

export default alertService;

