import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Token provided by user
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YWJlZGNhNC0yYjgwLTQxODMtYTJkZC1mNGMxN2I1YzI5MTUiLCJpZCI6Mzc0NDk5LCJpYXQiOjE3Njc0MTc5NDR9.JlBw7CT4ZHFSCUFkgzr1Y5hnDajNjw1NaG4_bqNuqVI';

const CesiumGlobe = ({ center = { lat: 22.5937, lng: 78.9629, altitude: 7000000 }, onObjectClick, alerts = [] }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

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
