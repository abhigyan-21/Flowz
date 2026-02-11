import * as Cesium from 'cesium';
import apiClient from './apiClient';

/**
 * Service for integrating ArcGIS flood simulation visualization on Cesium globe
 */
const arcgisVisualizationService = {
    /**
     * Add GeoJSON flood extent as a polygon layer on the map
     */
    async addFloodExtentLayer(viewer, predictionId) {
        try {
            const response = await apiClient.get(`/api/arcgis/flood-extent/${predictionId}`);
            const floodData = response.data;

            if (!floodData || !floodData.features) {
                console.warn('No flood extent data available');
                return null;
            }

            // Create DataSource for GeoJSON
            const dataSource = new Cesium.GeoJsonDataSource();
            await dataSource.load(floodData);

            viewer.dataSources.add(dataSource);

            // Style the flood features
            dataSource.entities.values.forEach(entity => {
                if (entity.polygon) {
                    entity.polygon.material = Cesium.Color.fromCssColorString('rgba(0, 150, 255, 0.4)');
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLUE;
                    entity.polygon.outlineWidth = 2;
                }
            });

            return dataSource;
        } catch (error) {
            console.error('Failed to load flood extent:', error);
            return null;
        }
    },

    /**
     * Add flood simulation frame as imagery layer and animate through frames
     */
    async addSimulationOverlay(viewer, predictionId, location, onFrameUpdate) {
        try {
            const simulationLayers = [];

            // Create imagery provider for simulation frames
            const createFrameImagery = async (timeOffset) => {
                try {
                    const response = await apiClient.get(`/api/arcgis/simulations/${predictionId}/frame`, {
                        params: { time_offset: timeOffset }
                    });

                    // The response should contain the image URL or base64 encoded image
                    const imageUrl = response.data.image_url || response.data.url || `data:image/png;base64,${response.data.image}`;
                    
                    // Create a simple imagery provider from the image
                    const provider = await Cesium.UrlTemplateImageryProvider.fromUrl(imageUrl);
                    return provider;
                } catch (error) {
                    console.error(`Failed to load frame for offset ${timeOffset}:`, error);
                    return null;
                }
            };

            // Load first frame to initialize
            for (let i = 0; i < 24; i++) {
                try {
                    const frameUrl = `/api/arcgis/simulations/${predictionId}/frame?time_offset=${i}`;
                    const layer = await Cesium.ImageryLayer.fromProviderAsync(
                        new Cesium.UrlTemplateImageryProvider({ url: frameUrl }),
                        {
                            show: i === 0
                        }
                    );
                    layer.alpha = 0.6;
                    viewer.imageryLayers.add(layer);
                    simulationLayers.push(layer);
                } catch (error) {
                    console.warn(`Could not load simulation frame ${i}:`, error);
                }
            }

            return simulationLayers;
        } catch (error) {
            console.error('Failed to add simulation overlay:', error);
            return [];
        }
    },

    /**
     * Get elevation profile for a location
     */
    async getElevationProfile(lat, lon) {
        try {
            const response = await apiClient.get('/api/arcgis/elevation', {
                params: { lat, lon }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to get elevation profile:', error);
            return null;
        }
    },

    /**
     * Get analytics/statistics for a simulation
     */
    async getSimulationAnalytics(predictionId) {
        try {
            const response = await apiClient.get(`/api/arcgis/analytics/${predictionId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get simulation analytics:', error);
            return null;
        }
    },

    /**
     * Fetch and render a single simulation frame
     */
    async getSimulationFrame(predictionId, timeOffset) {
        try {
            const response = await apiClient.get(`/api/arcgis/simulations/${predictionId}/frame`, {
                params: { time_offset: timeOffset },
                responseType: 'blob'
            });
            
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error(`Failed to fetch frame:`, error);
            return null;
        }
    }
};

export default arcgisVisualizationService;
