import React, { useEffect, useState } from 'react';
import '../../styles/loader.css';

const WaterLoader = ({ onFinish, durationMs = 4500 }) => {
    useEffect(() => {
        // Default duration is now longer (8000ms) to allow heavy renderers to finish.
        const timer = setTimeout(() => {
            if (onFinish) onFinish();
        }, durationMs);

        return () => clearTimeout(timer);
    }, [onFinish, durationMs]);

    return (
        <div className="water-loader-container">
            <div className="loader-text-wrapper">
                <div className="loader-text">GIRIDHAR</div>
                <div className="loader-tagline">AI Driven flood
                    <br />
                    Prediction <b>.</b> Prevention <b>.</b> Rescue System</div>
            </div>

            <div className="water-fill" style={{ animationDuration: `${durationMs}ms` }}>
                {/* 3 Wave Layers - slow them relative to overall loader duration */}
                {(() => {
                    const factor = durationMs / 4000; // base CSS rise animation was 4s
                    return (
                        <>
                            <div className="wave back" style={{ animationDuration: `${15 * factor}s` }}></div>
                            <div className="wave middle" style={{ animationDuration: `${10 * factor}s` }}></div>
                            <div className="wave front" style={{ animationDuration: `${6 * factor}s` }}></div>
                        </>
                    );
                })()}

                {/* Solid water body below waves */}
                <div className="water-body"></div>
            </div>
        </div>
    );
};

export default WaterLoader;
