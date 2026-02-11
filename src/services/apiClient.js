import axios from 'axios';

// Create an Axios instance with default configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request interceptor (Optional: for Auth tokens & ArcGIS API key)
apiClient.interceptors.request.use(
    (config) => {
        // Add ArcGIS API key if available and if it's an ArcGIS endpoint
        const arcgisKey = import.meta.env.VITE_ARCGIS_API_KEY;
        if (arcgisKey && config.url?.includes('arcgis')) {
            config.headers['X-ArcGIS-API-Key'] = arcgisKey;
        }
        
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor (Global error handling)
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
