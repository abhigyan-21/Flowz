import React from 'react';
import '../styles/dashboard.css'; // Reusing dashboard alerts style for consistency

const AlertsHistory = () => {
    const historyData = [
        { id: 1, title: 'Flood Alert - Zone A', time: '2 hours ago', severity: 'high', message: 'Immediate evacuation required.' },
        { id: 2, title: 'Heavy Rainfall Warning', time: '5 hours ago', severity: 'moderate', message: 'Water levels rising in River X.' },
        { id: 3, title: 'Safe Route Update', time: '8 hours ago', severity: 'info', message: 'Route 66 is clear.' },
        { id: 4, title: 'Forecast Update', time: '12 hours ago', severity: 'info', message: 'Rain expected to reduce by tomorrow.' },
        { id: 5, title: 'System Maintenance', time: '20 hours ago', severity: 'info', message: 'Scheduled maintenance completed.' },
    ];

    return (
        <div style={{ padding: '20px', paddingTop: '80px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', fontWeight: '600', color: '#333' }}>Alerts History (Last 24h)</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {historyData.map(item => (
                    <div key={item.id} className={`alert-card ${item.severity}`} style={{ cursor: 'default' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{item.title}</h3>
                            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{item.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>{item.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsHistory;
