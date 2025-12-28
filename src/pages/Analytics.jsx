import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend
} from 'recharts';
import '../styles/analytics.css';

const data2024 = [
    { name: 'Jan', incidents: 2, level: 4.5, rain: 120 },
    { name: 'Feb', incidents: 3, level: 5.2, rain: 150 },
    { name: 'Mar', incidents: 5, level: 6.8, rain: 180 },
    { name: 'Apr', incidents: 8, level: 7.5, rain: 220 },
    { name: 'May', incidents: 6, level: 6.2, rain: 190 },
    { name: 'Jun', incidents: 4, level: 5.5, rain: 160 },
    { name: 'Jul', incidents: 7, level: 8.2, rain: 250 },
    { name: 'Aug', incidents: 9, level: 9.1, rain: 280 },
    { name: 'Sep', incidents: 6, level: 7.0, rain: 200 },
];

const Analytics = () => {
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2>Historical Data & Analytics</h2>
            </div>

            <div className="stats-row">
                <div className="stats-card">
                    <div className="stats-label">Total Incidents (5yr)</div>
                    <div className="stats-value">244</div>
                    <div className="stats-sub">+12% vs prev 5yr</div>
                </div>
                <div className="stats-card">
                    <div className="stats-label">Peak Level Recorded</div>
                    <div className="stats-value">10.1m</div>
                    <div className="stats-sub">August 2024</div>
                </div>
                <div className="stats-card">
                    <div className="stats-label">Avg Annual Incidents</div>
                    <div className="stats-value">48.8</div>
                    <div className="stats-sub">Last 5 years</div>
                </div>
            </div>

            <div className="chart-tabs">
                <button className={`tab-btn ${viewMode === 'monthly' ? 'active' : ''}`} onClick={() => setViewMode('monthly')}>Monthly Trends</button>
                <button className={`tab-btn ${viewMode === 'yearly' ? 'active' : ''}`} onClick={() => setViewMode('yearly')}>Yearly Analysis</button>
            </div>

            <div className="chart-section">
                <h3>Flood Incidents & Water Levels (2024)</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data2024}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                            <Legend verticalAlign="bottom" height={36} />
                            <Line yAxisId="left" type="monotone" dataKey="incidents" name="Flood Incidents" stroke="#5C9CE6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="level" name="Avg Water Level (m)" stroke="#E6A545" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-section">
                <h3>Monthly Rainfall (mm)</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data2024}>
                            <defs>
                                <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#eee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="rain" stroke="#8884d8" fillOpacity={1} fill="url(#colorRain)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
