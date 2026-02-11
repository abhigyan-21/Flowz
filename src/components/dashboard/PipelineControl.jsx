import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Activity, AlertCircle } from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const PipelineControl = () => {
    const [health, setHealth] = useState(null);
    const [runs, setRuns] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPipelineData();
    }, []);

    const loadPipelineData = async () => {
        setLoading(true);
        try {
            const [healthData, runsData] = await Promise.all([
                analyticsService.getPipelineHealth(),
                analyticsService.getPipelineRuns()
            ]);
            setHealth(healthData);
            setRuns(runsData);
        } catch (error) {
            console.error('Failed to load pipeline data:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerRun = async () => {
        setIsRunning(true);
        try {
            const result = await analyticsService.triggerPipelineRun('MANUAL');
            console.log('Pipeline triggered:', result);
            // Refresh data after a short delay
            setTimeout(loadPipelineData, 2000);
        } catch (error) {
            console.error('Failed to trigger pipeline:', error);
        } finally {
            setIsRunning(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'text-green-400';
            case 'degraded': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return <Activity className="w-4 h-4" />;
            case 'degraded': return <AlertCircle className="w-4 h-4" />;
            case 'error': return <AlertCircle className="w-4 h-4" />;
            default: return <RefreshCw className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="pipeline-control loading">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading pipeline status...</span>
            </div>
        );
    }

    return (
        <div className="pipeline-control">
            <div className="pipeline-header">
                <h3>Pipeline Control</h3>
                <button 
                    onClick={loadPipelineData}
                    className="refresh-btn"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="pipeline-status">
                <div className={`status-indicator ${getStatusColor(health?.status)}`}>
                    {getStatusIcon(health?.status)}
                    <span>{health?.status || 'unknown'}</span>
                </div>
                <p className="status-message">{health?.message}</p>
            </div>

            <div className="pipeline-actions">
                <button 
                    onClick={triggerRun}
                    disabled={isRunning || health?.status !== 'healthy'}
                    className="trigger-btn"
                >
                    {isRunning ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Run Pipeline
                        </>
                    )}
                </button>
            </div>

            <div className="pipeline-runs">
                <h4>Recent Runs ({runs.length})</h4>
                <div className="runs-list">
                    {runs.slice(0, 3).map((run) => (
                        <div key={run.run_id} className="run-item">
                            <div className="run-id">{run.run_id}</div>
                            <div className={`run-status ${run.status}`}>{run.status}</div>
                        </div>
                    ))}
                    {runs.length === 0 && (
                        <div className="no-runs">No pipeline runs yet</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PipelineControl;