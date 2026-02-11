import React, { useState } from 'react';
import { X } from 'lucide-react';
import SimulationViewer from './SimulationViewer';
import '../../styles/simulation-modal.css';

/**
 * SimulationModal - Modal component to display simulation with full-screen viewer
 * Connects alerts/predictions to simulation visualization
 */
const SimulationModal = ({ predictionId, location, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="sim-modal-overlay" onClick={onClose}>
            <div className="sim-modal-container" onClick={(e) => e.stopPropagation()}>
                <SimulationViewer
                    predictionId={predictionId}
                    location={location}
                    onClose={onClose}
                />
            </div>
        </div>
    );
};

export default SimulationModal;
