import React, { useState } from 'react';
import MapComponent from '../components/map/MapComponent';
import OverlayPanel from '../components/dashboard/OverlayPanel';

const Home = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);

    return (
        <>
            <MapComponent 
                onLocationSelect={setSelectedLocation}
                selectedLocation={selectedLocation}
            />
            {/* Keep the OverlayPanel visible even when a location is selected */}
            <div className="content-overlay">
                <OverlayPanel />
            </div>
        </>
    );
};

export default Home;
