import React, { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CesiumGlobe from './CesiumGlobe';
import Globe3D from './Globe3D'; // Fallback WebGL Globe
import { WEST_BENGAL_CENTER } from '../../data/westBengalBoundary';
import alertService from '../../services/alertService';

const MapComponent = ({ onObjectClick, onLocationSelect, selectedLocation: externalSelectedLocation }) => {
    const [alerts, setAlerts] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [hourlyIndex, setHourlyIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const autoPlayRef = useRef(null);

    // Use external selectedLocation if provided (from parent), otherwise use internal state
    const location = externalSelectedLocation !== undefined ? externalSelectedLocation : selectedLocation;

    // Initial center (West Bengal)
    const center = { lat: WEST_BENGAL_CENTER.lat, lng: WEST_BENGAL_CENTER.lng, altitude: WEST_BENGAL_CENTER.altitude };

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
        // Set the selected location to show the carousel
        setSelectedLocation(data);
        
        // Call parent callback if provided
        if (onLocationSelect) {
            onLocationSelect(data);
        }
        
        if (onObjectClick) {
            onObjectClick(data);
        }
    };

    // Autoplay logic to cycle hourly frames when play is active
    useEffect(() => {
        // Stop autoplay if no location selected
        if (!location) {
            setIsPlaying(false);
        }

        if (isPlaying) {
            autoPlayRef.current = setInterval(() => {
                setHourlyIndex((p) => (p + 1) % 24);
            }, 1500);
        } else {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
            }
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
            }
        };
    }, [isPlaying, location]);

    // Helper to format hour label
    const formatHourLabel = (h) => {
        const hour = h % 24;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        return `${String(h12).padStart(2, '0')}:00 ${ampm}`;
    };

    // Derive per-hour mock/frame values from selected location so UI updates with hourlyIndex
    const frameValues = location ? (() => {
        // Slight oscillation for demo purposes
        const baseWL = Number(location.waterLevel) || 0;
        const baseRain = Number(location.rainfall) || 0;
        const baseTemp = Number(location.temperature) || 0;

        const phase = (hourlyIndex / 24) * Math.PI * 2;
        const wl = Math.max(0, baseWL + Math.sin(phase) * 2.5); // +/-2.5m
        const rain = Math.max(0, baseRain + Math.cos(phase) * 12); // +/-12mm
        const temp = Number((baseTemp + Math.sin(phase) * 1.5).toFixed(1));

        return { waterLevel: wl, rainfall: rain, temperature: temp };
    })() : { waterLevel: 0, rainfall: 0, temperature: 0 };

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
                    hourlyIndex={hourlyIndex}
                />
            </ErrorBoundary>
            
            {/* Selected Location Info Panel - Glassmorphism style (top-right) */}
            {location && (
                <div style={{
                    position: 'absolute',
                    // Place the panel under the date toggle at the top-right
                    top: '84px',
                    right: '24px',
                    width: '380px',
                    zIndex: 1002,
                    background: 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(18px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(226, 232, 240, 0.12)',
                    padding: '18px',
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.45)',
                    transform: 'translateY(0)',
                    opacity: 1,
                    transition: 'transform 260ms ease, opacity 260ms ease',
                    animation: 'slideInFromLeft 0.28s ease'
                }} className="selected-location-panel selected-location-panel--animated">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <h3 style={{
                                margin: '0 0 4px 0',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#F8FAFC'
                            }}>
                                {location.name}
                            </h3>
                            <p style={{
                                margin: '0',
                                fontSize: '12px',
                                color: '#CBD5E1'
                            }}>
                                {location.location}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedLocation(null);
                                if (onLocationSelect) onLocationSelect(null);
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#E2E8F0',
                                cursor: 'pointer',
                                fontSize: '24px',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            background: 'rgba(30, 144, 255, 0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(30, 144, 255, 0.2)'
                        }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '10px', color: '#CBD5E1', textTransform: 'uppercase' }}>Severity</p>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: location.severity.toLowerCase() === 'high' ? '#FF6B6B' : location.severity.toLowerCase() === 'moderate' ? '#FFA500' : '#4CAF50'
                            }}>
                                {location.severity}
                            </p>
                        </div>
                        <div style={{
                            background: 'rgba(30, 144, 255, 0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(30, 144, 255, 0.2)'
                        }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '10px', color: '#CBD5E1', textTransform: 'uppercase' }}>Risk Score</p>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#90CAF9'
                            }}>
                                {location.riskScore}%
                            </p>
                        </div>
                    </div>

                    <div style={{
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid rgba(226, 232, 240, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <p style={{
                                margin: '0',
                                fontSize: '11px',
                                color: '#CBD5E1',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Water Level</p>
                            <div style={{ fontSize: '12px', color: '#CBD5E1' }}>{formatHourLabel(hourlyIndex)}</div>
                        </div>
                        <div style={{
                            position: 'relative',
                            height: '24px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(30, 144, 255, 0.2)'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: '0',
                                top: '0',
                                height: '100%',
                                background: 'linear-gradient(90deg, #1E90FF, #64B5F6)',
                                width: `${(frameValues.waterLevel / (location.waterLevelThreshold || Math.max(frameValues.waterLevel, 1))) * 100}%`,
                                transition: 'width 0.6s linear'
                            }} />
                            <span style={{
                                position: 'relative',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#F8FAFC'
                            }}>
                                {frameValues.waterLevel.toFixed(1)}m
                            </span>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                    }}>
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '8px',
                            borderRadius: '8px',
                            borderLeft: '2px solid #FFA500'
                        }}>
                            <p style={{ margin: '0 0 2px 0', fontSize: '10px', color: '#CBD5E1' }}>Rainfall</p>
                            <p style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#E2E8F0' }}>{frameValues.rainfall.toFixed(1)}mm</p>
                        </div>
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '8px',
                            borderRadius: '8px',
                            borderLeft: '2px solid #FF6B6B'
                        }}>
                            <p style={{ margin: '0 0 2px 0', fontSize: '10px', color: '#CBD5E1' }}>Temp</p>
                            <p style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#E2E8F0' }}>{frameValues.temperature.toFixed(1)}°C</p>
                        </div>
                    </div>
                    {/* Compact bottom hourly carousel (visible scroll dials) */}
                </div>
            )}

            {/* Bottom hour toggle + play/pause (carousel hidden per request) */}
            {location && (
                <>
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1002,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(8px)',
                        padding: '8px 14px',
                        borderRadius: '999px',
                        border: 'var(--glass-border)'
                    }}>
                        <button
                            onClick={() => setHourlyIndex((p) => (p - 1 + 24) % 24)}
                            style={{ background: 'transparent', border: 'none', color: '#E2E8F0', cursor: 'pointer' }}
                            title="Previous hour"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={() => setIsPlaying(p => !p)}
                                style={{ background: 'transparent', border: 'none', color: isPlaying ? '#90CAF9' : '#E2E8F0', cursor: 'pointer' }}
                                title={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 3v18l15-9L5 3z" />
                                    </svg>
                                )}
                            </button>

                            <div style={{ minWidth: '120px', textAlign: 'center', color: '#F8FAFC', fontWeight: 600 }}>
                                Hour: {String(hourlyIndex).padStart(2, '0')}:00
                            </div>
                        </div>

                        <button
                            onClick={() => setHourlyIndex((p) => (p + 1) % 24)}
                            style={{ background: 'transparent', border: 'none', color: '#E2E8F0', cursor: 'pointer' }}
                            title="Next hour"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                    {/* progress bar track below pill */}
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'min(520px, 86%)',
                        height: '6px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                        zIndex: 1001
                    }}>
                        <div style={{
                            height: '100%',
                            background: 'linear-gradient(90deg,#64B5F6,#1E90FF)',
                            width: `${(hourlyIndex / 23) * 100}%`,
                            transition: isPlaying ? 'width 1500ms linear' : 'width 200ms ease'
                        }} />
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideInFromLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideUpFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default MapComponent;
