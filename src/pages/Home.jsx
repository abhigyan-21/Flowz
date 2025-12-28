import React from 'react';
import MapComponent from '../components/map/MapComponent';
import OverlayPanel from '../components/dashboard/OverlayPanel';

const Home = () => {
    return (
        <>
            <MapComponent />
            <div className="content-overlay">
                <OverlayPanel />
            </div>
        </>
    );
};

export default Home;
