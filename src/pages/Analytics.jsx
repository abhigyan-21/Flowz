import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend
} from 'recharts';
import '../styles/analytics.css';
import analyticsService from '../services/analyticsService';
import PipelineControl from '../components/dashboard/PipelineControl';

// Placeholder until API data loads
const initialChartData = [];

const Analytics = () => {
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({ total_predictions: 0, predictions: [] });
    const [chartData, setChartData] = useState(initialChartData);

    useEffect(() => {
        let mounted = true;

        async function loadSummary() {
            setLoading(true);
            setError(null);
            try {
                const res = await analyticsService.getDLPredictionsSummary();
                if (!mounted) return;
                setSummary(res || { total_predictions: 0, predictions: [] });

                // Prepare simple chart data: top 12 predictions by inference time
                const preds = (res && res.predictions) ? res.predictions.slice(0, 12) : [];
                const chart = preds.map((p, i) => ({
                    name: `${p.region || p.basin || 'R'}-${i+1}`,
                    risk_score: p.risk_score || 0,
                    peak_depth: p.peak_depth || 0
                }));
                setChartData(chart);
            } catch (err) {
                console.error('Failed to load analytics:', err);
                if (!mounted) return;
                setError(err.message || 'Failed to fetch analytics');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadSummary();

        return () => { mounted = false; };
    }, []);

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2>Historical Data & Analytics</h2>
            </div>

            <div className="stats-row">
                <div className="stats-card">
                    <div className="stats-label">Total Predictions</div>
                    <div className="stats-value">{loading ? 'Loading…' : summary.total_predictions}</div>
                    <div className="stats-sub">Deep learning predictions ingested</div>
                </div>
                <div className="stats-card">
                    <div className="stats-label">Highest Risk Score</div>
                    <div className="stats-value">{loading ? '—' : (summary.predictions[0]?.risk_score ?? '—')}</div>
                    <div className="stats-sub">Top prediction by risk</div>
                </div>
                <div className="stats-card">
                    <div className="stats-label">Avg Peak Depth (m)</div>
                    <div className="stats-value">{loading ? '—' : (
                        summary.predictions.length ? (
                            (summary.predictions.reduce((s,p)=>s+(p.peak_depth||0),0)/summary.predictions.length).toFixed(2)
                        ) : '—'
                    )}</div>
                    <div className="stats-sub">Across recent predictions</div>
                </div>
            </div>

            <PipelineControl />

            {error && <div className="no-data">Error loading analytics: {error}</div>}

            <div className="chart-tabs">
                <button className={`tab-btn ${viewMode === 'monthly' ? 'active' : ''}`} onClick={() => setViewMode('monthly')}>Monthly Trends</button>
                <button className={`tab-btn ${viewMode === 'yearly' ? 'active' : ''}`} onClick={() => setViewMode('yearly')}>Yearly Analysis</button>
            </div>

            <div className="chart-section">
                <h3>Recent Predictions — Risk Score & Peak Depth</h3>
                <div className="chart-wrapper">
                    {loading ? (
                        <div className="no-data">Loading analytics…</div>
                    ) : chartData.length === 0 ? (
                        <div className="no-data">No analytics data available.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#eee" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Line yAxisId="left" type="monotone" dataKey="risk_score" name="Risk Score" stroke="#e04848" strokeWidth={2} dot={{ r: 3 }} />
                                <Line yAxisId="right" type="monotone" dataKey="peak_depth" name="Peak Depth (m)" stroke="#4a90e2" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="chart-section">
                <h3>Monthly Rainfall (mm)</h3>
                <div className="chart-wrapper">
                    {chartData.length === 0 ? (
                        <div className="no-data">No rainfall data available.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
