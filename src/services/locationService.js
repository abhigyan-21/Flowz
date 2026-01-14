

const locationService = {
    // List supported locations/cities
    getLocations: async (params) => {
        const query = params?.q || '';
        if (!query || query.length < 3) {
            // Default major cities if no query
            return Promise.resolve({
                data: [
                    { id: 'loc_mum', name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
                    { id: 'loc_del', name: 'Delhi, India', lat: 28.7041, lng: 77.1025 },
                    { id: 'loc_che', name: 'Chennai, India', lat: 13.0827, lng: 80.2707 },
                    { id: 'loc_kol', name: 'Kolkata, India', lat: 22.5726, lng: 88.3639 }
                ]
            });
        }

        try {
            // Use OpenStreetMap Nominatim API for geocoding
            // Restricted to India using countrycodes=in
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
            const data = await response.json();

            const results = data.map(item => ({
                id: `loc_${item.place_id}`,
                name: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon)
            }));

            return { data: results };
        } catch (error) {
            console.error("Geocoding failed:", error);
            return { data: [] };
        }
    },
};

export default locationService;
