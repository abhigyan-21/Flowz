import React from 'react';
import '../../styles/alert-card-enhanced.css';

/**
 * AlertCardEnhanced - Enhanced alert card
 * Click to focus location on map, use play button in hourly carousel to view simulation
 */
const AlertCardEnhanced = ({ 
    id,
    predictionId,
    severity = 'info',
    title,
    content,
    location,
    riskScore,
    type,
    onClick
}) => {
    const className = `alert-card-enhanced ${severity}`;

    return (
        <div className={className} onClick={onClick} style={{ cursor: 'pointer' }}>
            {type === 'recommended' && (
                <div className="badge-recommended">Recommended</div>
            )}

            <div className="alert-body-enhanced">
                <div className="alert-header-enhanced">
                    <h3>{title}</h3>
                    {riskScore && (
                        <div className="risk-badge" data-severity={severity}>
                            {riskScore}%
                        </div>
                    )}
                </div>

                <p className="alert-description">{content}</p>

                {location && (
                    <p className="alert-location">{location}</p>
                )}
            </div>
        </div>
    );
};

export default AlertCardEnhanced;
