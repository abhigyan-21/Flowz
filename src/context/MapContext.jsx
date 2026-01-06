import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext();

export const MapProvider = ({ children }) => {
    // viewTarget: { lat, lng, altitude, duration }
    const [viewTarget, setViewTarget] = useState(null);

    const flyTo = (location) => {
        // Add timestamp to ensure even identical location updates trigger effects
        setViewTarget({ ...location, timestamp: Date.now() });
    };

    return (
        <MapContext.Provider value={{ viewTarget, flyTo }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => useContext(MapContext);
