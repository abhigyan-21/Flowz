import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Globe3D, { ErrorBoundary } from './Globe3D';
import 'leaflet/dist/leaflet.css';
import '../../styles/map.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import alertService from '../../services/alertService';

const LeafletMap = ({ alerts = [] }) => {
    const indiaCenter = [22.5937, 78.9629];
    // Remove static alerts, use props

    return (
        <MapContainer
            center={indiaCenter}
            zoom={5}
            scrollWheelZoom={true}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {alerts.map((alert, index) => (
                <Marker key={index} position={[alert.lat, alert.lng]}>
                    <Popup>
                        <strong>{alert.name}</strong><br />
                        Severity: {alert.severity}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

const MapComponent = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await alertService.getAlerts();
                setAlerts(response.data || []);
            } catch (error) {
                console.error("Failed to load map alerts", error);
            }
        };
        fetchAlerts();
    }, []);

    // We attempt to load the 3D Globe, but if it fails (WebGL error), the ErrorBoundary will show the LeafletMap
    return (
        <div className="map-wrapper" style={{ background: '#000' }}>
            <ErrorBoundary fallback={<LeafletMap alerts={alerts} />}>
                <Globe3D alerts={alerts} />
            </ErrorBoundary>
        </div>
    );
};

export default MapComponent;
