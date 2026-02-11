import React, { useState } from 'react';
import MapComponent from '../components/map/MapComponent';
import OverlayPanel from '../components/dashboard/OverlayPanel';

const Home = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleAlertClick = (alertData) => {
        // Pass the complete alert data to focus on the location
        setSelectedLocation(alertData);
    };

    return (
        <>
            <MapComponent 
                onLocationSelect={setSelectedLocation}
                selectedLocation={selectedLocation}
            />
            {/* Keep the OverlayPanel visible even when a location is selected */}
            <div className="content-overlay">
                <OverlayPanel onAlertClick={handleAlertClick} />
            </div>
        </>
    );
};

export default Home;
