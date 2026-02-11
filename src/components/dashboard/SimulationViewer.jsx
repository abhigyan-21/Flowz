import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, X } from 'lucide-react';
import simulationService from '../../services/simulationService';
import '../../styles/simulation.css';

const SimulationViewer = ({ predictionId, location, onClose = null }) => {
    const [simulation, setSimulation] = useState(null);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
    const playIntervalRef = useRef(null);
    const containerRef = useRef(null);

    // Load simulation data
    useEffect(() => {
        const fetchSimulation = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await simulationService.getSimulationFrames(predictionId);
                setSimulation(data);
                setCurrentFrameIndex(0);
            } catch (err) {
                console.error('Failed to load simulation:', err);
                setError(err.message || 'Failed to load simulation data');
            } finally {
                setLoading(false);
            }
        };

        if (predictionId) {
            fetchSimulation();
        }
    }, [predictionId]);

    // Auto-play logic
    useEffect(() => {
        if (!isPlaying || !simulation) return;

        const frameDelay = 1000 / (simulation.simulation.recommendedFPS * speed);
        
        playIntervalRef.current = setInterval(() => {
            setCurrentFrameIndex((prev) => {
                if (prev >= simulation.frames.length - 1) {
                    setIsPlaying(false);
                    return 0; // Loop back to start
                }
                return prev + 1;
            });
        }, frameDelay);

        return () => {
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        };
    }, [isPlaying, simulation, speed]);

    if (loading) {
        return (
            <div className="simulation-loader">
                <div className="spinner"></div>
                <p>Loading simulation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="simulation-error">
                <p>Error: {error}</p>
                {onClose && <button onClick={onClose}>Close</button>}
            </div>
        );
    }

    if (!simulation) {
        return (
            <div className="simulation-error">
                <p>No simulation data available</p>
                {onClose && <button onClick={onClose}>Close</button>}
            </div>
        );
    }

    const currentFrame = simulation.frames[currentFrameIndex];
    const progress = ((currentFrameIndex + 1) / simulation.frames.length) * 100;

    const handlePlayToggle = () => {
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentFrameIndex(0);
    };

    const handleFrameChange = (index) => {
        setCurrentFrameIndex(Math.max(0, Math.min(index, simulation.frames.length - 1)));
    };

    const handleExport = async () => {
        try {
            const data = await simulationService.exportAsGISLayer(predictionId, 'geojson');
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${predictionId}_simulation.geojson`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export simulation');
        }
    };

    return (
        <div className="simulation-viewer" ref={containerRef}>
            {/* Header */}
            <div className="sim-header">
                <div className="sim-title">
                    <h3>{simulation.location.name}</h3>
                    <span className="sim-basin">{simulation.location.basin}</span>
                </div>
                {onClose && (
                    <button className="sim-close-btn" onClick={onClose} title="Close">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="sim-content">
                {/* Image Frame */}
                <div className="sim-frame-container">
                    <img
                        src={currentFrame.imageUrl}
                        alt={currentFrame.timeLabel}
                        className="sim-frame-image"
                    />
                    <div className="sim-frame-overlay">
                        <div className="sim-time-label">{currentFrame.timeLabel}</div>
                        {currentFrame.isPeak && <div className="sim-peak-badge">PEAK</div>}
                    </div>
                </div>

                {/* Statistics Panel */}
                <div className="sim-stats-panel">
                    <div className="sim-stat">
                        <span className="sim-stat-label">Water Depth</span>
                        <span className="sim-stat-value">{currentFrame.depth.toFixed(1)}m</span>
                    </div>
                    <div className="sim-stat">
                        <span className="sim-stat-label">Affected Area</span>
                        <span className="sim-stat-value">{currentFrame.affectedArea} km²</span>
                    </div>
                    <div className="sim-stat">
                        <span className="sim-stat-label">Water Level</span>
                        <span className="sim-stat-value">{(currentFrame.waterLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="sim-stat">
                        <span className="sim-stat-label">Peak Depth</span>
                        <span className="sim-stat-value">{simulation.metadata.peakDepth.toFixed(1)}m</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="sim-controls">
                <div className="sim-player-controls">
                    <button
                        className="sim-btn sim-btn-reset"
                        onClick={handleReset}
                        title="Reset to start"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        className="sim-btn sim-btn-play"
                        onClick={handlePlayToggle}
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <div className="sim-speed-control">
                        <select
                            className="sim-speed-select"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                        >
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={4}>4x</option>
                        </select>
                    </div>

                    <button
                        className="sim-btn sim-btn-export"
                        onClick={handleExport}
                        title="Export as GeoJSON"
                    >
                        <Download size={18} />
                    </button>
                </div>

                {/* Timeline Scrubber */}
                <div className="sim-timeline">
                    <div className="sim-timeline-track">
                        <div
                            className="sim-timeline-progress"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <input
                            type="range"
                            min="0"
                            max={simulation.frames.length - 1}
                            value={currentFrameIndex}
                            onChange={(e) => handleFrameChange(Number(e.target.value))}
                            className="sim-timeline-scrubber"
                        />
                    </div>
                    <div className="sim-frame-info">
                        Frame {currentFrameIndex + 1} of {simulation.frames.length}
                    </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="sim-thumbnail-strip">
                    {simulation.frames.map((frame, idx) => (
                        <div
                            key={idx}
                            className={`sim-thumbnail ${idx === currentFrameIndex ? 'active' : ''}`}
                            onClick={() => handleFrameChange(idx)}
                            title={frame.timeLabel}
                        >
                            <img src={frame.thumbnailUrl} alt={frame.timeLabel} />
                            <span className="sim-thumb-time">{frame.timeLabel}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="sim-legend">
                <h4>Water Depth Scale</h4>
                <div className="sim-legend-items">
                    {simulation.legend.depthScale.map((item, idx) => (
                        <div key={idx} className="sim-legend-item">
                            <div
                                className="sim-legend-color"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="sim-legend-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Simulation Info */}
            <div className="sim-info">
                <details>
                    <summary>Simulation Details</summary>
                    <div className="sim-info-content">
                        <p><strong>Source:</strong> {simulation.simulation.source}</p>
                        <p><strong>Resolution:</strong> {simulation.simulation.resolution}</p>
                        <p><strong>Duration:</strong> {simulation.simulation.totalDuration} hours</p>
                        <p><strong>Peak Time:</strong> T+{simulation.frames[simulation.metadata.peakFrame]?.timeOffset || 18}h</p>
                        <p><strong>Peak Depth:</strong> {simulation.metadata.peakDepth.toFixed(1)}m</p>
                        <p><strong>Recession Time:</strong> {simulation.metadata.recessionTime} hours</p>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default SimulationViewer;
