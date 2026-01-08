import React, { useEffect, useRef, useState } from 'react';
import { useMap } from '../../context/MapContext';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Token provided by user
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YWJlZGNhNC0yYjgwLTQxODMtYTJkZC1mNGMxN2I1YzI5MTUiLCJpZCI6Mzc0NDk5LCJpYXQiOjE3Njc0MTc5NDR9.JlBw7CT4ZHFSCUFkgzr1Y5hnDajNjw1NaG4_bqNuqVI';

const CesiumGlobe = ({ center = { lat: 22.5937, lng: 78.9629, altitude: 7000000 }, onObjectClick, alerts = [] }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const { viewTarget } = useMap();

    // --- Date Control Logic ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEditingDate, setIsEditingDate] = useState(false);

    const [dateInput, setDateInput] = useState("");

    const spinGlobe = (direction) => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        let totalRotation = 0;
        // Spin 2 times (720 degrees) to simulate passage of time, landing back at start
        const targetRotation = Cesium.Math.TWO_PI * 2;

        const animate = () => {
            if (!viewerRef.current) return;

            // Ease out logic: Speed decreases as we get closer to target
            const remaining = targetRotation - totalRotation;
            // Base speed proportional to remaining, clamped to min/max
            // Min speed ensures we don't slow down forever (Zeno's paradox)
            // Max speed caps the start
            let step = Math.max(Cesium.Math.toRadians(1), Math.min(Cesium.Math.toRadians(15), remaining * 0.08));

            if (remaining <= step) {
                // Last step
                viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, -direction * remaining);
                // Immediately fly back to India smoothly
                resetView();
            } else {
                viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, -direction * step);
                totalRotation += step;
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    const handleDateChange = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);

        // Validation: +/- 7 days range
        const today = new Date();
        const diffTime = Math.abs(newDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            setCurrentDate(newDate);
            spinGlobe(days > 0 ? 1 : -1);
        }
    };

    const handleInputSubmit = (e) => {
        if (e.key === 'Enter') {
            const parsedDate = new Date(dateInput);
            if (!isNaN(parsedDate)) {
                // Check range
                const today = new Date();
                const diffTime = Math.abs(parsedDate - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 7) {
                    const diff = parsedDate - currentDate;
                    setCurrentDate(parsedDate);
                    spinGlobe(diff > 0 ? 1 : -1);
                    setIsEditingDate(false);
                } else {
                    alert("Date must be within ±7 days of today.");
                }
            } else {
                alert("Invalid Date Format. Try YYYY-MM-DD");
            }
        }
    };

    const formatDateDisplay = (date) => {
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return "Present Day";
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Viewer
        const viewer = new Cesium.Viewer(containerRef.current, {
            // Use default imagery (Bing Maps Aerial) for best realism
            baseLayerPicker: false,
            geocoder: false,
            homeButton: true,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            animation: false,
            fullscreenButton: false,
            creditContainer: document.createElement("div"),
        });

        viewerRef.current = viewer;

        // Optimize interactions
        const controller = viewer.scene.screenSpaceCameraController;
        controller.enableZoom = true;
        controller.enableTranslate = true;
        controller.enableTilt = true;
        controller.enableRotate = true;
        controller.enableCollisionDetection = true; // Prevent going underground
        controller.minimumZoomDistance = 1000; // 1km min zoom
        controller.maximumZoomDistance = 20000000; // 20,000km max zoom

        // Load Terrain Synchronously (Cesium 1.136+)
        try {
            if (viewer.scene.setTerrain) {
                viewer.scene.setTerrain(Cesium.Terrain.fromWorldTerrain());
            }
        } catch (e) {
            console.error("Failed to initialize terrain", e);
        }

        // Set initial view focusing on India
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(center.lng, center.lat, center.altitude),
            orientation: {
                heading: 0.0,
                pitch: -Cesium.Math.PI_OVER_TWO, // Top-down view
                roll: 0.0
            }
        });

        // Add Atmosphere & Fog
        viewer.scene.globe.enableLighting = true;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0001;
        viewer.scene.skyAtmosphere.show = true;

        // --- Animated River Flow (using Stripe Material Offset) ---
        let startTime = Date.now();

        const riverCoordinates = [
            79.0, 30.0, 78.0, 29.0, 77.5, 28.5, 80.0, 26.0, 82.0, 25.5,
            85.0, 25.5, 87.0, 25.0, 88.0, 24.0, 90.0, 23.0
        ];

        viewer.entities.add({
            name: "Ganga River Flow",
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(riverCoordinates),
                width: 5,
                material: new Cesium.StripeMaterialProperty({
                    evenColor: Cesium.Color.fromCssColorString('#0EA5E9'), // River Blue
                    oddColor: Cesium.Color.fromCssColorString('#0EA5E9').withAlpha(0.2), // Transparent gap
                    repeat: 20,
                    offset: new Cesium.CallbackProperty(() => {
                        return (Date.now() - startTime) * 0.0002; // Slower animation speed
                    }, false),
                    orientation: Cesium.StripeOrientation.VERTICAL
                }),
                clampToGround: true
            }
        });


        // --- Cursor Interaction (Grab/Grabbing) ---
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

        // Input: Change cursor on drag
        handler.setInputAction(() => {
            if (containerRef.current) containerRef.current.style.cursor = "grabbing";
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction(() => {
            if (containerRef.current) containerRef.current.style.cursor = "grab";
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // Input: Click on Alert
        handler.setInputAction((click) => {
            const pickedObject = viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.alertData) {
                if (onObjectClick) onObjectClick(pickedObject.id.alertData);

                // Smooth fly to alert location
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        pickedObject.id.alertData.lng,
                        pickedObject.id.alertData.lat,
                        100000 // Zoom to 100km altitude (manageable for zoom out)
                    ),
                    duration: 1.5,
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Initial cursor style
        if (containerRef.current) containerRef.current.style.cursor = "grab";

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, []); // Run once on mount

    // --- Listen for MapContext FlyTo Events ---
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || !viewTarget) return;

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                viewTarget.lng,
                viewTarget.lat,
                viewTarget.altitude || 100000
            ),
            duration: 1.5,
            easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
        });
    }, [viewTarget]);

    // Update Alerts
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        // Clean up old alerts (keep rivers)
        const entities = viewer.entities.values;
        for (let i = entities.length - 1; i >= 0; i--) {
            if (entities[i].alertData) {
                viewer.entities.remove(entities[i]);
            }
        }

        alerts.forEach(alert => {
            const color = alert.severity.toLowerCase() === 'high'
                ? Cesium.Color.RED
                : (alert.severity.toLowerCase() === 'moderate' ? Cesium.Color.ORANGE : Cesium.Color.GREEN);

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat),
                point: {
                    pixelSize: 20,
                    color: color,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2
                },
                label: {
                    text: alert.name,
                    font: '14pt sans-serif',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -25),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000000.0)
                },
                alertData: alert
            });

            if (alert.severity.toLowerCase() === 'high') {
                viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat),
                    ellipse: {
                        semiMinorAxis: 80000.0,
                        semiMajorAxis: 80000.0,
                        material: new Cesium.ColorMaterialProperty(Cesium.Color.RED.withAlpha(0.3)),
                        outline: true,
                        outlineColor: Cesium.Color.RED
                    },
                    alertData: alert // Tag for cleanup
                });
            }
        });

    }, [alerts]);

    const resetView = () => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(center.lng, center.lat, center.altitude),
            orientation: {
                heading: 0.0,
                pitch: -Cesium.Math.PI_OVER_TWO,
                roll: 0.0
            },
            duration: 1.5
        });
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab', position: 'relative' }}>
            {/* Top Right Date Control */}
            <div className="date-control-panel" style={{
                position: 'absolute',
                top: '90px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--glass-bg)', // Dark Slate with opacity
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                borderRadius: '50px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: 'var(--glass-border)'
            }}>
                <button
                    onClick={() => handleDateChange(-1)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#E2E8F0' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                {isEditingDate ? (
                    <input
                        type="date"
                        value={dateInput}
                        min={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        onChange={(e) => setDateInput(e.target.value)}
                        onKeyDown={handleInputSubmit}
                        onBlur={() => setIsEditingDate(false)}
                        autoFocus
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: '#F8FAFC',
                            outline: 'none',
                            width: '130px',
                            colorScheme: 'dark' // Ensure calendar popup matches dark theme
                        }}
                    />
                ) : (
                    <span
                        onClick={() => {
                            setIsEditingDate(true);
                            setDateInput(currentDate.toISOString().split('T')[0]);
                        }}
                        style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#F8FAFC',
                            cursor: 'pointer',
                            minWidth: '120px',
                            textAlign: 'center',
                            userSelect: 'none'
                        }}
                    >
                        {formatDateDisplay(currentDate)}
                    </span>
                )}

                <button
                    onClick={() => handleDateChange(1)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#E2E8F0' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>
            <button
                onClick={resetView}
                style={{
                    position: 'absolute',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 1000,
                    padding: '10px 16px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    fontWeight: '600',
                    color: '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span>Reset View</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </svg>
            </button>
        </div>
    );
};

export default CesiumGlobe;
