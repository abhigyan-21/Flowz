import React from 'react';

const AlertCard = ({ severity, title, content, type }) => {
    // severity: 'high' | 'moderate' | 'info' -> maps to colors
    // type: 'recommended' | 'normal' -> layout tweaks if any

    let className = `alert-card ${severity}`;

    return (
        <div className={className}>
            {/* If recommended, showing a badge */}
            {type === 'recommended' && (
                <div className="badge-recommended">Recommended</div>
            )}

            <div className="alert-body">
                {title && <h3>{title}</h3>}
                {content && <p>{content}</p>}
            </div>
        </div>
    );
};

export default AlertCard;
