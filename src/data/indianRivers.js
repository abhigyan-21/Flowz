export const INDIAN_RIVERS = {
    type: "FeatureCollection",
    features: [
        // ================= NORTHERN RIVERS (INDUS SYSTEM) =================
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [81.0, 31.5], [79.5, 32.5], [78.0, 33.5], [76.0, 34.5], [74.0, 35.5], [72.5, 35.0], [71.5, 33.0], [70.5, 29.0], [68.0, 24.0]
                ]
            },
            properties: { name: "Indus", color: "#64b5f6" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [75.5, 34.0], [74.5, 33.5], [73.5, 33.0], [72.0, 32.0]
                ]
            },
            properties: { name: "Jhelum", color: "#90caf9" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [77.0, 32.5], [76.0, 32.5], [75.0, 32.0], [72.5, 30.0]
                ]
            },
            properties: { name: "Chenab", color: "#42a5f5" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [76.8, 32.2], [75.8, 32.0], [74.8, 31.5], [73.0, 30.5]
                ]
            },
            properties: { name: "Ravi", color: "#2196f3" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [81.0, 31.0], [78.5, 31.5], [76.5, 31.3], [75.0, 31.0], [73.0, 29.5]
                ]
            },
            properties: { name: "Sutlej", color: "#1e88e5" }
        },

        // ================= GANGA SYSTEM =================
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [79.1, 30.9], [79.5, 30.0], [80.0, 29.0], [81.0, 28.0], [83.0, 27.0], [85.0, 26.5], [87.5, 25.8], [88.1, 24.0], [88.36, 22.57], [88.3, 21.6]
                ]
            },
            properties: { name: "Ganga", color: "#4FC3F7" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [78.5, 31.0], [77.2, 29.0], [77.5, 28.5], [78.0, 27.5], [80.0, 26.0], [81.8, 25.5]
                ]
            },
            properties: { name: "Yamuna", color: "#81D4FA" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [75.5, 22.5], [76.5, 24.5], [78.5, 26.5], [79.2, 26.8]
                ]
            },
            properties: { name: "Chambal", color: "#B3E5FC" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [80.3, 28.5], [81.5, 27.0], [83.0, 26.0]
                ]
            },
            properties: { name: "Ghaghara", color: "#E1F5FE" }
        },

        // ================= BRAHMAPUTRA SYSTEM =================
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [82.0, 30.5], [85.0, 29.5], [90.0, 29.5], [94.0, 29.8], [95.5, 29.5], [95.0, 28.0], [93.0, 27.0], [90.0, 26.0], [89.8, 25.5]
                ]
            },
            properties: { name: "Brahmaputra", color: "#29B6F6" }
        },

        // ================= PENINSULAR RIVERS (WEST FLOWING) =================
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [81.8, 22.7], [80.0, 23.0], [77.5, 22.5], [75.0, 22.0], [73.5, 21.8], [72.6, 21.6]
                ]
            },
            properties: { name: "Narmada", color: "#03A9F4" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [78.2, 21.8], [76.0, 21.3], [74.0, 21.2], [72.8, 21.1]
                ]
            },
            properties: { name: "Tapti", color: "#039BE5" }
        },

        // ================= PENINSULAR RIVERS (EAST FLOWING) =================
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [73.5, 20.0], [75.0, 19.5], [77.0, 19.0], [79.0, 18.5], [80.5, 17.5], [81.5, 17.0], [82.2, 16.7]
                ]
            },
            properties: { name: "Godavari", color: "#0288D1" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [73.7, 18.0], [74.5, 17.0], [76.0, 16.5], [78.0, 16.0], [80.0, 16.5], [81.0, 15.8]
                ]
            },
            properties: { name: "Krishna", color: "#0277BD" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [75.5, 12.5], [76.5, 12.0], [77.5, 11.5], [78.5, 11.0], [79.8, 11.0]
                ]
            },
            properties: { name: "Kaveri", color: "#01579B" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [81.5, 20.2], [82.5, 21.0], [84.0, 21.0], [85.5, 20.5], [86.7, 20.3]
                ]
            },
            properties: { name: "Mahanadi", color: "#00BCD4" }
        },

        // ================= WEST BENGAL RIVERS (MERGED) =================
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [88.6, 27.1], [88.7, 26.6], [88.8, 26.3], [89.0, 25.9], [89.3, 25.6]
                ]
            },
            properties: { name: "Teesta", color: "#81D4FA" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [84.9, 23.6], [85.5, 23.5], [87.0, 23.3], [87.9, 22.6], [88.1, 22.4]
                ]
            },
            properties: { name: "Damodar", color: "#4DD0E1" }
        },
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [88.0, 27.2], [88.3, 26.4], [88.3, 25.9], [88.1, 25.4]
                ]
            },
            properties: { name: "Mahananda", color: "#80DEEA" }
        }
    ]
};
