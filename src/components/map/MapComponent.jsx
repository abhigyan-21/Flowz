import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import '../../styles/map.css'; // Creating/Updating map styles if needed

const MapComponent = () => {
    const globeEl = useRef();
    const [points, setPoints] = useState([]);

    // Correctly define mock points with useMemo to avoid re-creation on every render
    const mockData = useMemo(() => [
        { lat: 19.0760, lng: 72.8777, size: 0.5, color: '#E57373', name: 'Mumbai - Heavy Rain' }, // Mumbai
        { lat: 28.7041, lng: 77.1025, size: 0.4, color: '#FFB74D', name: 'Delhi - Heatwave' },   // Delhi
        { lat: 13.0827, lng: 80.2707, size: 0.4, color: '#E57373', name: 'Chennai - Cyclone' },   // Chennai
        { lat: 22.5726, lng: 88.3639, size: 0.3, color: 'white', name: 'Kolkata - Normal' }      // Kolkata
    ], []);

    useEffect(() => {
        setPoints(mockData);

        // Auto-rotate disabled, set initial view
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
            globeEl.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2.0 }); // Center on India
        }
    }, [mockData]);

    const handlePointClick = (point) => {
        if (globeEl.current) {
            globeEl.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.5 }, 2000); // 2000m ms duration
        }
    };

    return (
        <div className="map-wrapper" style={{ background: '#000' }}>
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                pointsData={points}
                pointAltitude={0.05}
                pointColor="color"
                pointRadius="size"
                pointLabel="name"
                atmosphereColor="lightskyblue"
                atmosphereAltitude={0.15}
                onPointClick={handlePointClick}
            />
        </div>
    );
};

export default MapComponent;
