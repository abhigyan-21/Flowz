// West Bengal State Boundary - Precise coordinates
export const WEST_BENGAL_BOUNDARY = {
    type: "Feature",
    geometry: {
        type: "Polygon",
        coordinates: [[
            // Starting from Northwest corner and going clockwise
            // Latitude range: 23.5 to 27.5, Longitude range: 86.2 to 90.5
            
            // Northern border (Bhutan/Sikkim border)
            [88.0, 27.3],
            [88.2, 27.35],
            [88.5, 27.2],
            [89.0, 27.0],
            [89.5, 26.8],
            [89.8, 26.7],
            
            // Northeast border (Assam border)
            [90.2, 26.5],
            [90.5, 26.0],
            [90.4, 25.5],
            
            // East border (Bangladesh border)
            [90.5, 25.0],
            [90.4, 24.5],
            [90.3, 24.0],
            [90.2, 23.8],
            [90.1, 23.5],
            [89.9, 23.2],
            [89.7, 22.9],
            [89.5, 22.5],
            [89.3, 22.2],
            [89.1, 21.9],
            [88.9, 21.8],
            
            // South border (Bay of Bengal/Sundarbans)
            [88.7, 21.7],
            [88.5, 21.8],
            [88.2, 21.9],
            [87.9, 22.0],
            [87.6, 22.2],
            [87.3, 22.4],
            [87.1, 22.6],
            [86.9, 22.8],
            [86.7, 22.9],
            [86.5, 23.0],
            
            // Southwest border (Odisha/Jharkhand border)
            [86.3, 23.1],
            [86.2, 23.3],
            [86.2, 23.6],
            [86.3, 24.0],
            [86.4, 24.3],
            [86.5, 24.6],
            [86.6, 24.9],
            
            // West border (Jharkhand/Bihar border)
            [86.7, 25.1],
            [86.8, 25.4],
            [86.9, 25.7],
            [87.0, 26.0],
            [87.1, 26.3],
            [87.2, 26.6],
            [87.3, 26.9],
            [87.5, 27.0],
            [87.7, 27.1],
            [88.0, 27.3] // Close the polygon
        ]]
    },
    properties: { name: "West Bengal" }
};

// West Bengal center for focusing camera
export const WEST_BENGAL_CENTER = {
    lat: 24.5, // Center latitude of West Bengal
    lng: 88.5, // Center longitude of West Bengal
    altitude: 800000 // Altitude in meters for optimal view of entire state
};
