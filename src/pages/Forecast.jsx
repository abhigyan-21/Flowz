import React, { useState, useEffect } from 'react';
import '../styles/forecast.css';
import forecastService from '../services/forecastService';

const Forecast = () => {
    const [timeRange, setTimeRange] = useState('7d'); // '24h' | '7d'
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            setLoading(true);
            try {
                // In real app, pass locationId from context or url
                const response = await forecastService.getForecast('loc_mum', 'average');
                setForecastData(response.data || []);
            } catch (error) {
                console.error("Failed to load forecast", error);
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, [timeRange]);

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
                {loading ? (
                    <div style={{ color: 'white', padding: '20px' }}>Loading forecast data...</div>
                ) : (
                    forecastData.map((item, index) => (
                        <div key={index} className="forecast-card">
                            <div className="f-day">{item.day}</div>
                            <div className="f-level">{item.level}</div>
                            <div className={`f-risk ${item.risk.toLowerCase()}`}>
                                {item.risk}
                            </div>
                        </div>
                    ))
                )}
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
