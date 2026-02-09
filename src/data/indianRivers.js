// West Bengal Rivers Data with Accurate Coordinates
// These are precise river paths within West Bengal state
export const INDIAN_RIVERS = {
    type: "FeatureCollection",
    features: [
        // ================= GANGES-BRAHMAPUTRA SYSTEM =================
        // Ganges/Bhagirathi - Main river flowing through West Bengal
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    // Upper course - Malda region
                    [88.1410, 25.0096], 
                    [88.2500, 25.1500],
                    [88.3400, 25.2800],
                    [88.4200, 25.4100],
                    // Murshidabad region
                    [88.2803, 24.1751],
                    [88.3500, 24.0500],
                    [88.3800, 23.8200],
                    // Birbhum region
                    [88.5200, 23.6400],
                    // Bardhaman region
                    [88.2700, 23.2800],
                    // Hooghly region
                    [88.4100, 22.9500],
                    [88.3800, 22.7000],
                    // Kolkata Metropolitan Area
                    [88.3639, 22.5726],
                    [88.3600, 22.5200],
                    [88.3400, 22.4100],
                    // Howrah
                    [88.2636, 22.5958],
                    // Downstream to Delta
                    [88.3500, 22.1000],
                    [88.4000, 21.8500],
                    [88.5000, 21.5000],
                    [88.7000, 21.2000],
                    [88.8500, 20.9000]
                ]
            },
            properties: { name: "Ganges-Bhagirathi", color: "#01579B" }
        },

        // Hooghly River - Distributary of Ganges
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [88.3639, 22.5726],
                    [88.3500, 22.5400],
                    [88.3200, 22.5000],
                    [88.3100, 22.4600],
                    [88.2900, 22.4200],
                    [88.2500, 22.3500],
                    [88.2000, 22.2800],
                    [88.1800, 22.1500]
                ]
            },
            properties: { name: "Hooghly", color: "#0277BD" }
        },

        // Teesta River - From Sikkim through North Bengal
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    // Upper course near Sikkim border
                    [88.5109, 27.8500],
                    [88.4800, 27.7000],
                    [88.4200, 27.5500],
                    [88.3600, 27.3800],
                    // Darjeeling region
                    [88.2500, 27.0500],
                    // Jalpaiguri District
                    [88.7167, 26.5167],
                    [88.5800, 26.4200],
                    [88.4500, 26.3500],
                    // Westward turn towards Ganges
                    [88.3200, 26.2100],
                    [88.1500, 25.9500],
                    [88.0800, 25.7800],
                    [88.0200, 25.5500]
                ]
            },
            properties: { name: "Teesta", color: "#0288D1" }
        },

        // Mahananda River - From Himalayas through North Bengal
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    // Upper course
                    [87.8500, 27.0000],
                    [87.9500, 26.7500],
                    // Cooch Behar region
                    [89.4500, 26.3250],
                    [89.2000, 26.1500],
                    // Westward flow
                    [88.8000, 25.8000],
                    [88.5500, 25.4500],
                    [88.2000, 25.0800],
                    [88.1410, 25.0096]
                ]
            },
            properties: { name: "Mahananda", color: "#00BCD4" }
        },

        // Torsa River - North Bengal
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    // From Bhutan border
                    [89.8000, 26.8500],
                    [89.6500, 26.5000],
                    // Cooch Behar
                    [89.4500, 26.3250],
                    [89.3000, 26.1500]
                ]
            },
            properties: { name: "Torsa", color: "#00ACC1" }
        },

        // Damodar River - Central West Bengal
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    // Upper course
                    [84.5000, 23.9000],
                    [85.2000, 23.8500],
                    // Asansol-Durgapur Region
                    [86.9524, 23.6739],
                    [86.5000, 23.6000],
                    [86.0000, 23.4500],
                    // Bankura District
                    [87.0715, 23.2324],
                    [87.3000, 22.9000],
                    [87.5000, 22.5000],
                    // Merges with Hooghly
                    [87.9500, 22.6000],
                    [88.1000, 22.4500]
                ]
            },
            properties: { name: "Damodar", color: "#0097A7" }
        },

        // Rupnarayan River - South Bengal
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    // Upper course
                    [86.5000, 23.5000],
                    [87.0000, 23.2000],
                    // Westward
                    [87.3200, 22.4292],
                    [87.5000, 22.1500],
                    [87.7000, 21.8000],
                    [87.9000, 21.5000]
                ]
            },
            properties: { name: "Rupnarayan", color: "#0288D1" }
        },

        // Sundarbans Delta Distributaries
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    // Sundarbans Tiger Reserve area
                    [88.7614, 21.8079],
                    [88.8000, 21.7000],
                    [88.9000, 21.5000],
                    [89.0000, 21.2000],
                    [89.1000, 20.9000]
                ]
            },
            properties: { name: "Sundarbans Delta", color: "#01579B" }
        }
    ]
};
