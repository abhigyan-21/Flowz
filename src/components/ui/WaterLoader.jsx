import React, { useEffect, useState } from 'react';
import '../../styles/loader.css';

const WaterLoader = ({ onFinish }) => {
    useEffect(() => {
        // Animation takes about 3.5s to fill
        // We wait a bit more then unmount
        const timer = setTimeout(() => {
            if (onFinish) onFinish();
        }, 4000); // 4 seconds total

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="water-loader-container">
            <div className="loader-text-wrapper">
                <div className="loader-text">GIRIDHAR</div>
                <div className="loader-tagline">AI Driven flood Prediction <b>.</b> Prevention <b>.</b> Rescue System</div>
            </div>

            <div className="water-fill">
                {/* 3 Wave Layers */}
                <div className="wave back"></div>
                <div className="wave middle"></div>
                <div className="wave front"></div>

                {/* Solid water body below waves */}
                <div className="water-body"></div>
            </div>
        </div>
    );
};

export default WaterLoader;
