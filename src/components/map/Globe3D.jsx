import React, { useRef, useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

// Mock GeoJSON for a major indian river (simplified Ganga approximation)
// In a real app, you would fetch this from an API or load a proper .geojson file
const RIVER_GEOJSON = {
    type: "FeatureCollection",
    features: [
        // Ganga / Bhagirathi–Hooghly
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [88.1, 24.0],   // Murshidabad
                    [88.3, 23.5],   // Nadia
                    [88.4, 22.9],   // Hooghly
                    [88.36, 22.57]  // Kolkata
                ]
            },
            properties: { name: "Ganga (Bhagirathi–Hooghly)", color: "#4FC3F7" }
        },

        // Teesta
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [88.6, 27.1],   // Sikkim origin (near)
                    [88.7, 26.6],   // Jalpaiguri
                    [88.8, 26.3]    // Enters Bangladesh
                ]
            },
            properties: { name: "Teesta", color: "#81D4FA" }
        },

        // Damodar
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [85.9, 23.6],   // Jharkhand
                    [87.0, 23.3],   // Bankura
                    [87.9, 22.6]    // Hooghly confluence
                ]
            },
            properties: { name: "Damodar", color: "#4DD0E1" }
        },

        // Rupnarayan
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [86.7, 22.8],   // Medinipur
                    [87.7, 22.3]    // Bay of Bengal
                ]
            },
            properties: { name: "Rupnarayan", color: "#26C6DA" }
        },

        // Subarnarekha
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [86.2, 22.6],   // Jharkhand
                    [87.0, 22.1]    // Bay of Bengal
                ]
            },
            properties: { name: "Subarnarekha", color: "#00BCD4" }
        },

        // Mahananda
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [88.1, 26.9],   // Darjeeling foothills
                    [88.3, 25.9],   // Malda
                    [88.1, 25.4]    // Ganga confluence
                ]
            },
            properties: { name: "Mahananda", color: "#80DEEA" }
        },

        // Ajay
        {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [87.1, 23.9],   // Jharkhand
                    [88.1, 23.6]    // Bhagirathi confluence
                ]
            },
            properties: { name: "Ajay", color: "#B2EBF2" }
        }
    ]
};

// Flood Prediction Polygons (Mock Data)
const FLOOD_PREDICTION_DATA = [
    {
        lat: 25.5,
        lng: 85.0, // Bihar region
        radius: 0.8,
        maxR: 2,
        propagationSpeed: 0.5,
        repeatPeriod: 1000,
        color: 'red'
    }
];

const Globe3D = ({ center = { lat: 20.5937, lng: 78.9629, altitude: 2.0 }, onObjectClick, alerts = [] }) => {
    const globeEl = useRef();
    const [rivers, setRivers] = useState([]);
    const [hasWebGLError, setWebGLError] = useState(false);

    useEffect(() => {
        // Load river data
        setRivers(RIVER_GEOJSON.features);

        // Feature: Set initial view
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
            globeEl.current.pointOfView(center);
        }
    }, [center]);

    // Map alerts to globe markers
    const markerData = useMemo(() => {
        return alerts.map(alert => ({
            lat: alert.lat,
            lng: alert.lng,
            name: alert.name,
            size: alert.severity.toLowerCase() === 'high' ? 0.6 : (alert.severity.toLowerCase() === 'moderate' ? 0.4 : 0.3),
            color: alert.severity.toLowerCase() === 'high' ? 'red' : (alert.severity.toLowerCase() === 'moderate' ? 'orange' : 'green')
        }));
    }, [alerts]);

    if (hasWebGLError) {
        return <div style={{ color: 'white', textAlign: 'center', paddingTop: '20%' }}>3D Globe not supported on this device.</div>;
    }

    try {
        return (
            <Globe
                ref={globeEl}
                // Textures
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                // Rivers (Paths)
                pathsData={rivers}
                pathPoints={d => d.geometry.coordinates}
                pathPointLat={p => p[1]}
                pathPointLng={p => p[0]}
                pathPointAlt={0.01}
                pathColor={() => '#00BFFF'} // Bright Blue for rivers
                pathDashLength={0.1}
                pathDashGap={0.005}
                pathDashAnimateTime={12000} // Animate flow
                pathStroke={2}

                // Markers (Alerts)
                pointsData={markerData}
                pointAltitude={0.05}
                pointColor="color"
                pointRadius="size"
                pointLabel="name"
                onPointClick={(point) => {
                    if (globeEl.current) {
                        globeEl.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.5 }, 1500);
                    }
                    if (onObjectClick) onObjectClick(point);
                }}

                // Flood Rings (Predictions) features
                ringsData={FLOOD_PREDICTION_DATA}
                ringColor={() => 'red'}
                ringMaxRadius="maxR"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"

                // Atmosphere
                atmosphereColor="lightskyblue"
                atmosphereAltitude={0.15}

                // Error boundary for WebGL context loss
                onGlobeReady={() => { }}
                rendererConfig={{ antialias: true, alpha: true }}
            />
        );
    } catch (e) {
        setWebGLError(true);
        return null;
    }
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Globe Crash:", error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export { Globe3D as default, ErrorBoundary };
