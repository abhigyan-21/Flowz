import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CesiumGlobe from './CesiumGlobe';
import Globe3D from './Globe3D'; // Fallback WebGL Globe
import alertService from '../../services/alertService';

const MapComponent = ({ onObjectClick }) => {
    const [alerts, setAlerts] = useState([]);

    // Initial center (India)
    const center = { lat: 22.5937, lng: 78.9629, altitude: 7000000 };

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const response = await alertService.getAlerts();
                setAlerts(response.data || []);
            } catch (error) {
                console.error("Failed to load alerts for map:", error);
            }
        };
        loadAlerts();
    }, []);

    const handleObjectClick = (data) => {
        if (onObjectClick) {
            onObjectClick(data);
        }
    };

    return (
        <div className="map-wrapper" style={{ height: '100%', width: '100%', position: 'relative' }}>
            <ErrorBoundary
                fallback={
                    <Globe3D
                        center={{ ...center, altitude: 2.5 }} // Adjust altitude for react-globe.gl scale
                        alerts={alerts}
                        onObjectClick={handleObjectClick}
                    />
                }
            >
                <CesiumGlobe
                    center={center}
                    alerts={alerts}
                    onObjectClick={handleObjectClick}
                />
            </ErrorBoundary>
        </div>
    );
};

export default MapComponent;
