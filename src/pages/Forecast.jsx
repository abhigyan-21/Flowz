import React, { useState } from 'react';
import '../styles/forecast.css';

const Forecast = () => {
    const [timeRange, setTimeRange] = useState('7d'); // '24h' | '7d'

    const forecastData = [
        { day: 'Mon', date: '10.2m', risk: 'High', color: 'red' },
        { day: 'Tue', date: '9.5m', risk: 'High', color: 'red' },
        { day: 'Wed', date: '7.8m', risk: 'Moderate', color: 'orange' }, // Color logic usually css class
        { day: 'Thu', date: '6.2m', risk: 'Low', color: 'green' },
        { day: 'Fri', date: '5.5m', risk: 'Low', color: 'green' },
        { day: 'Sat', date: '5.8m', risk: 'Low', color: 'green' },
        { day: 'Sun', date: '6.1m', risk: 'Moderate', color: 'orange' },
    ];

    return (
        <div className="forecast-container">
            <div className="forecast-header">
                <h2>Flood Predictions & Forecasts</h2>
            </div>

            <div className="toggle-wrapper">
                <div className="forecast-toggle">
                    <button className={`f-btn ${timeRange === '24h' ? 'active' : ''}`} onClick={() => setTimeRange('24h')}>24 Hours</button>
                    <button className={`f-btn ${timeRange === '7d' ? 'active' : ''}`} onClick={() => setTimeRange('7d')}>7 Days</button>
                </div>
            </div>

            <div className="forecast-cards-row">
                {forecastData.map((item, index) => (
                    <div key={index} className="forecast-card">
                        <div className="f-day">{item.day}</div>
                        <div className="f-level">{item.date}</div>
                        <div className={`f-risk ${item.risk.toLowerCase()}`}>
                            {item.risk}
                        </div>
                    </div>
                ))}
            </div>

            <div className="summary-section">
                <div className="summary-row">
                    <span className="sum-label">Peak flood level</span>
                    <span className="sum-value">10.2m on Monday 6PM</span>
                </div>
                <div className="summary-row">
                    <span className="sum-label">Expected to normalize</span>
                    <span className="sum-value">Thursday morning</span>
                </div>
            </div>
        </div>
    );
};

export default Forecast;
