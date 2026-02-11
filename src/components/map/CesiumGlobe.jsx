import React, { useEffect, useRef, useState } from 'react';
import { useMap } from '../../context/MapContext';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { INDIAN_RIVERS } from '../../data/indianRivers';
import { INDIA_OUTLINE } from '../../data/indiaOutline';
import arcgisVisualizationService from '../../services/arcgisVisualizationService';

// Load Cesium Ion token from environment or use default
const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YWJlZGNhNC0yYjgwLTQxODMtYTJkZC1mNGMxN2I1YzI5MTUiLCJpZCI6Mzc0NDk5LCJpYXQiOjE3Njc0MTc5NDR9.JlBw7CT4ZHFSCUFkgzr1Y5hnDajNjw1NaG4_bqNuqVI';
Cesium.Ion.defaultAccessToken = cesiumToken;

// Load ArcGIS API key from environment
const arcgisApiKey = import.meta.env.VITE_ARCGIS_API_KEY;

const CesiumGlobe = ({ 
    center = { lat: 22.5937, lng: 78.9629, altitude: 7000000 }, 
    onObjectClick, 
    alerts = [], 
    hourlyIndex = 0, 
    hourlyImageUrlTemplate, 
    focusLocation = null,
    isSimulationActive = false,
    simulationFrame = 0,
    predictionId = null
}) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const hourlyLayerRef = useRef(null);
    const fadeAnimRef = useRef(null);
    const simulationLayersRef = useRef([]);
    const floodExtentDataSourceRef = useRef(null);
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
            homeButton: false, // Disabled default home button
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
        // Enable unrestricted rotation (360 degrees in all directions)
        controller.inertia = 0.95;
        controller.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG, Cesium.CameraEventType.PINCH];

        // Load Terrain (Async nature handled)
        try {
            if (viewer.scene.setTerrain) {
                // Ensure we handle the promise if fromWorldTerrain returns one
                Promise.resolve(Cesium.Terrain.fromWorldTerrain())
                    .then(terrainProvider => {
                        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                            viewerRef.current.scene.setTerrain(terrainProvider);
                        }
                    })
                    .catch(e => console.error("Failed to load terrain", e));
            }
        } catch (e) {
            console.error("Failed to initialize terrain", e);
        }

        // Set initial view focusing on West Bengal
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

        // Create initial hourly overlay imagery. If a template is provided (env or prop) we'll use it, otherwise generate a demo canvas.
        try {
            const template = hourlyImageUrlTemplate || import.meta.env.VITE_HOURLY_IMAGE_TEMPLATE || null;

            const makeUrlForHour = (hour) => {
                if (template) {
                    // Replace common tokens {hour} or {h}
                    return template.replace(/\{hour\}|\{h\}/g, String(hour).padStart(2, '0'));
                }

                // Fallback: generate a demo canvas data URL
                const w = 1024;
                const h = 512;
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                // Use a cool blue palette for hourly overlays to avoid brown tint
                const hue = Math.round((hour / 24) * 360);
                const g = ctx.createLinearGradient(0, 0, w, h);
                // Shift hue into blue range and use slightly higher lightness for better contrast
                const baseHue = (hue + 200) % 360;
                g.addColorStop(0, `hsl(${baseHue}, 65%, 18%)`);
                g.addColorStop(1, `hsl(${(baseHue + 40) % 360}, 65%, 36%)`);
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
                for (let i = 0; i < 60; i++) {
                    ctx.globalAlpha = 0.02 + Math.random() * 0.04;
                    ctx.fillStyle = `rgba(255,255,255,0.4)`;
                    const rx = Math.random() * w;
                    const ry = Math.random() * h;
                    const r = 80 + Math.random() * 160;
                    ctx.beginPath();
                    ctx.ellipse(rx, ry, r, r * 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 0.95;
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = '48px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(`${String(hour).padStart(2, '0')}:00`, w - 24, h - 28);
                return canvas.toDataURL('image/png');
            };

            const initialUrl = makeUrlForHour(hourlyIndex || 0);

            let provider;
            if (template && (/\{x\}|\{y\}|\{z\}/i.test(template))) {
                // Tile template provider (tiles served by backend)
                provider = new Cesium.UrlTemplateImageryProvider({ url: initialUrl });
            } else {
                provider = new Cesium.SingleTileImageryProvider({ url: initialUrl });
            }

            const layer = viewer.imageryLayers.addImageryProvider(provider);
            layer.alpha = 0.0; // start invisible; main frame will fade in via crossfade
            hourlyLayerRef.current = layer;
            // Fade-in initial layer
            layer.alpha = 0.55;
        } catch (e) {
            console.warn('Hourly overlay initialization failed', e);
        }

        // --- Animated River Flow (using Stripe Material Offset) ---
        // (Removed: animated river flow - now using solid colors)

        // --- Indian Rivers Data ---
        // Use the imported data directly
        const RIVER_DATA = INDIAN_RIVERS;

        const riverEntities = [];

        // Helper to smooth coordinates using Catmull-Rom Spline
        const getSmoothPath = (coordinates) => {
            if (coordinates.length < 2) return Cesium.Cartesian3.fromDegreesArray(coordinates.flat());

            const positions = coordinates.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1]));

            // Catmull-Rom Spline needs at least 2 points.
            const spline = new Cesium.CatmullRomSpline({
                times: Array.from({ length: positions.length }, (_, i) => i / (positions.length - 1)),
                points: positions
            });

            const smoothedPositions = [];
            // Increase samples for smoothness (more samples = smoother curve)
            const samples = positions.length * 20;
            for (let i = 0; i <= samples; i++) {
                smoothedPositions.push(spline.evaluate(i / samples));
            }
            return smoothedPositions;
        };

        RIVER_DATA.features.forEach(feature => {
            const smoothedPositions = getSmoothPath(feature.geometry.coordinates);

            // Draw River Line - Solid color, no dashing
            const entity = viewer.entities.add({
                name: feature.properties.name,
                polyline: {
                    positions: smoothedPositions,
                    width: 3,
                    material: Cesium.Color.fromCssColorString(feature.properties.color).withAlpha(0.8),
                    clampToGround: true
                }
            });
            riverEntities.push(entity);

            // Add River Label
            const coords = feature.geometry.coordinates;
            const midPointIndex = Math.floor(coords.length / 2);
            const midPoint = coords[midPointIndex];

            const labelEntity = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(midPoint[0], midPoint[1]),
                label: {
                    text: feature.properties.name,
                    font: '12px sans-serif', // Smaller font
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 3,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -8),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 3000000.0),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
            riverEntities.push(labelEntity);
        });

        // Draw India Border
        INDIA_OUTLINE.features.forEach(feature => {
            if (feature.geometry.type === "Polygon") {
                const coordinates = feature.geometry.coordinates[0]; // Outer ring
                const positions = coordinates.flat();

                viewer.entities.add({
                    name: "India Border",
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray(positions),
                        width: 2, // Thinner line
                        material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.6)), // 60% opacity
                        clampToGround: true,
                        zIndex: 100
                    }
                });
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

    // Update Alerts with Ripple Animation
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        // Clean up old alerts (keep rivers)
        const entities = viewer.entities.values;
        for (let i = entities.length - 1; i >= 0; i--) {
            if (entities[i].alertData || entities[i].isRipple) {
                viewer.entities.remove(entities[i]);
            }
        }

        alerts.forEach(alert => {
            const baseColor = alert.severity.toLowerCase() === 'high'
                ? Cesium.Color.RED
                : (alert.severity.toLowerCase() === 'moderate' ? Cesium.Color.ORANGE : Cesium.Color.GREEN);

            // Create center point (slow blinking)
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat),
                point: {
                    pixelSize: new Cesium.CallbackProperty(() => {
                        // Slower blinking - 2 second cycle
                        const time = Date.now() % 2000;
                        const blink = Math.sin(time / 1000 * Math.PI) * 0.5 + 0.5; // 0-1
                        const distance = Cesium.Cartesian3.distance(
                            viewer.camera.position,
                            Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat)
                        );
                        // Base size 8-12px, scales with zoom, blinks
                        const baseSize = Math.max(5, Math.min(15, 400000 / distance));
                        return baseSize * (0.6 + blink * 0.4); // Blink between 60-100% of base
                    }, false),
                    color: baseColor,
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

            // Create ripple circles (3 concentric expanding circles)
            for (let rippleIndex = 0; rippleIndex < 3; rippleIndex++) {
                const semiMinorAxisCallback = new Cesium.CallbackProperty(() => {
                    const time = Date.now() % 2000; // 2 second cycle per ripple
                    const phase = (time / 2000 + rippleIndex * 0.33) % 1; // Stagger ripples
                    const distance = Cesium.Cartesian3.distance(
                        viewer.camera.position,
                        Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat)
                    );
                    // Base radius grows from 5km to 50km
                    const baseRadius = 5000 + phase * 45000;
                    const scaledRadius = Math.max(5000, Math.min(50000, distance * 0.2 + baseRadius * 0.5));
                    return scaledRadius;
                }, false);

                const semiMajorAxisCallback = new Cesium.CallbackProperty(() => {
                    const time = Date.now() % 2000;
                    const phase = (time / 2000 + rippleIndex * 0.33) % 1;
                    const distance = Cesium.Cartesian3.distance(
                        viewer.camera.position,
                        Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat)
                    );
                    const baseRadius = 5000 + phase * 45000;
                    const scaledRadius = Math.max(5000, Math.min(50000, distance * 0.2 + baseRadius * 0.5));
                    // Ensure semiMajorAxis is always >= semiMinorAxis
                    return Math.max(scaledRadius, scaledRadius * 1.001);
                }, false);

                viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat),
                    ellipse: {
                        semiMinorAxis: semiMinorAxisCallback,
                        semiMajorAxis: semiMajorAxisCallback,
                        material: new Cesium.ColorMaterialProperty(
                            new Cesium.CallbackProperty(() => {
                                const time = Date.now() % 2000;
                                const phase = (time / 2000 + rippleIndex * 0.33) % 1;
                                // Increased transparency so 3 layers are visible (0.3 instead of 0.15)
                                const alpha = Math.max(0, (1 - phase) * 0.3);
                                return baseColor.withAlpha(alpha);
                            }, false)
                        ),
                        outline: true,
                        outlineColor: new Cesium.CallbackProperty(() => {
                            const time = Date.now() % 2000;
                            const phase = (time / 2000 + rippleIndex * 0.33) % 1;
                            // Increased outline transparency (0.45 instead of 0.25)
                            const alpha = Math.max(0, (1 - phase) * 0.45);
                            return baseColor.withAlpha(alpha);
                        }, false),
                        outlineWidth: 2
                    },
                    isRipple: true,
                    alertData: alert
                });
            }
        });

    }, [alerts]);

    // Update hourly overlay when hourlyIndex changes — crossfade between frames
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        // Cancel any running fade animation
        if (fadeAnimRef.current) {
            cancelAnimationFrame(fadeAnimRef.current);
            fadeAnimRef.current = null;
        }

        try {
            const template = hourlyImageUrlTemplate || import.meta.env.VITE_HOURLY_IMAGE_TEMPLATE || null;
            const makeUrlForHour = (hour) => {
                if (template) return template.replace(/\{hour\}|\{h\}/g, String(hour).padStart(2, '0'));

                // fallback generated canvas if no template
                const w = 1024; const h = 512;
                const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                // Use a cool blue palette for hourly overlays to avoid brown tint
                const hue = Math.round((hour / 24) * 360);
                const g = ctx.createLinearGradient(0, 0, w, h);
                const baseHue = (hue + 200) % 360;
                g.addColorStop(0, `hsl(${baseHue}, 65%, 18%)`);
                g.addColorStop(1, `hsl(${(baseHue + 40) % 360}, 65%, 36%)`);
                ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
                for (let i = 0; i < 60; i++) { ctx.globalAlpha = 0.02 + Math.random() * 0.04; ctx.fillStyle = `rgba(255,255,255,0.4)`; const rx = Math.random() * w; const ry = Math.random() * h; const r = 80 + Math.random() * 160; ctx.beginPath(); ctx.ellipse(rx, ry, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); }
                ctx.globalAlpha = 0.95; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '48px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(`${String(hour).padStart(2, '0')}:00`, w - 24, h - 28);
                return canvas.toDataURL('image/png');
            };

            const url = makeUrlForHour(hourlyIndex || 0);
            let provider;
            if (template && (/\{x\}|\{y\}|\{z\}/i.test(template))) {
                provider = new Cesium.UrlTemplateImageryProvider({ url });
            } else {
                provider = new Cesium.SingleTileImageryProvider({ url });
            }

            const newLayer = viewer.imageryLayers.addImageryProvider(provider);
            newLayer.alpha = 0.0;

            const oldLayer = hourlyLayerRef.current;
            hourlyLayerRef.current = newLayer;

            // Crossfade
            const duration = 800;
            const start = performance.now();
            const step = (now) => {
                const t = Math.min(1, (now - start) / duration);
                newLayer.alpha = 0.55 * t;
                if (oldLayer) oldLayer.alpha = 0.55 * (1 - t);
                if (t < 1) {
                    fadeAnimRef.current = requestAnimationFrame(step);
                } else {
                    if (oldLayer && viewer.imageryLayers.contains(oldLayer)) {
                        try { viewer.imageryLayers.remove(oldLayer, false); } catch (e) { }
                    }
                    if (newLayer) newLayer.alpha = 0.55;
                    fadeAnimRef.current = null;
                }
            };

            fadeAnimRef.current = requestAnimationFrame(step);
        } catch (e) {
            console.warn('Failed to update hourly overlay', e);
        }

        return () => {
            if (fadeAnimRef.current) {
                cancelAnimationFrame(fadeAnimRef.current);
                fadeAnimRef.current = null;
            }
        };
    }, [hourlyIndex, hourlyImageUrlTemplate]);

    // Zoom to focused location when alert is clicked
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || !focusLocation) return;

        const lat = focusLocation.lat || focusLocation.latitude;
        const lng = focusLocation.lng || focusLocation.longitude;

        if (!lat || !lng) return;

        // Zoom in to flood location: ~50km altitude for regional zoom
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lng, lat, 50000),
            orientation: {
                heading: 0.0,
                pitch: -Cesium.Math.PI_OVER_TWO,
                roll: 0.0
            },
            duration: 2.0,
            easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
        });
    }, [focusLocation]);

    // Load flood extent GeoJSON when simulation becomes active
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || !isSimulationActive || !predictionId) return;

        const loadFloodExtent = async () => {
            try {
                const dataSource = await arcgisVisualizationService.addFloodExtentLayer(viewer, predictionId);
                floodExtentDataSourceRef.current = dataSource;
            } catch (error) {
                console.error('Failed to load flood extent:', error);
            }
        };

        loadFloodExtent();

        return () => {
            if (floodExtentDataSourceRef.current) {
                viewer.dataSources.remove(floodExtentDataSourceRef.current);
                floodExtentDataSourceRef.current = null;
            }
        };
    }, [isSimulationActive, predictionId]);

    // Animate simulation frames on the map
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || !isSimulationActive || !predictionId) return;

        const updateSimulationFrame = async () => {
            try {
                // Get the image for current frame
                const frameUrl = `/api/arcgis/simulations/${predictionId}/frame?time_offset=${simulationFrame}`;
                
                // Show/hide simulation layers based on current frame
                simulationLayersRef.current.forEach((layer, index) => {
                    layer.show = index === simulationFrame;
                });
            } catch (error) {
                console.error('Failed to update simulation frame:', error);
            }
        };

        updateSimulationFrame();
    }, [isSimulationActive, simulationFrame, predictionId]);

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
                top: '24px',
                right: '24px',
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
                className="btn-reset-view"
                onClick={resetView}
                style={{
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
