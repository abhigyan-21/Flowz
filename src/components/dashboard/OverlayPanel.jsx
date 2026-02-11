import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/dashboard.css';
import AlertCardEnhanced from './AlertCardEnhanced';
import alertService from '../../services/alertService';
import evacuationService from '../../services/evacuationService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OverlayPanel = ({ onAlertClick }) => {
    const [mainTab, setMainTab] = useState('alert'); // 'alert' | 'evacuation'
    const [alertSubTab, setAlertSubTab] = useState('foryou'); // 'foryou' | 'country'
    const [evacSubTab, setEvacSubTab] = useState('routes'); // 'routes' | 'shelters'

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [evacData, setEvacData] = useState({ routes: [], shelters: [] });

    // Collapsible State
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Alerts
                const alertsRes = await alertService.getAlerts();
                setAlerts(alertsRes.data || []);

                // Fetch Evacuation Data (Mocking parallel fetch)
                try {
                    const [routesRes, sheltersRes] = await Promise.all([
                        evacuationService.getEvacuationPlan(),
                        evacuationService.getShelters()
                    ]);
                    setEvacData({
                        routes: routesRes.data.routes || [],
                        shelters: sheltersRes.data || []
                    });
                } catch (evacError) {
                    console.warn("Evacuation data not available, using fallback:", evacError);
                    // Use fallback data for evacuation
                    setEvacData({
                        routes: [],
                        shelters: []
                    });
                }

            } catch (error) {
                console.error("Failed to fetch alerts data", error);
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter alerts for 'For You' vs 'Country' (Mock logic)
    const displayAlerts = alertSubTab === 'foryou' ? alerts.slice(0, 3) : alerts;

    return (
        <div
            className={`overlay-panel ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => isCollapsed && setIsCollapsed(false)}
        >

            {/* Collapse Toggle Button */}
            <div
                className="collapse-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(!isCollapsed);
                }}
                title={isCollapsed ? "Expand" : "Collapse"}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </div>

            {/* Content Wrapper for Scroll/Animation */}
            <div className="panel-content-wrapper">
                {/* Main Toggle */}
                <div className="toggle-container main-toggle">
                    <button
                        className={`toggle-btn ${mainTab === 'alert' ? 'active' : ''}`}
                        onClick={() => setMainTab('alert')}
                    >
                        Alert
                    </button>
                    <button
                        className={`toggle-btn ${mainTab === 'evacuation' ? 'active' : ''}`}
                        onClick={() => setMainTab('evacuation')}
                    >
                        Evacuation
                    </button>
                </div>

                {/* Sub Tabs */}
                <div className="toggle-container sub-toggle">
                    {mainTab === 'alert' ? (
                        <>
                            <button
                                className={`toggle-btn ${alertSubTab === 'foryou' ? 'active' : ''}`}
                                onClick={() => setAlertSubTab('foryou')}
                            >
                                For You
                            </button>
                            <button
                                className={`toggle-btn ${alertSubTab === 'country' ? 'active' : ''}`}
                                onClick={() => setAlertSubTab('country')}
                            >
                                Country wide
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className={`toggle-btn ${evacSubTab === 'routes' ? 'active' : ''}`}
                                onClick={() => setEvacSubTab('routes')}
                            >
                                Routes
                            </button>
                            <button
                                className={`toggle-btn ${evacSubTab === 'shelters' ? 'active' : ''}`}
                                onClick={() => setEvacSubTab('shelters')}
                            >
                                Shelters
                            </button>
                        </>
                    )}
                </div>

                <div className="panel-scroll-content">
                    {mainTab === 'alert' ? (
                        <div className="alert-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loading ? (
                                <div className="alert-placeholder">Loading alerts...</div>
                            ) : (
                                displayAlerts.map(alert => (
                                    <AlertCardEnhanced
                                        key={alert.id}
                                        id={alert.id}
                                        predictionId={alert.predictionId}
                                        severity={alert.severity.toLowerCase()}
                                        title={alert.title || alert.name}
                                        content={alert.description || `Type: ${alert.type}`}
                                        location={alert.affectedRegions?.[0] || alert.location}
                                        riskScore={alert.riskScore}
                                        onClick={() => {
                                            if (onAlertClick) {
                                                onAlertClick(alert);
                                            }
                                        }}
                                    />
                                ))
                            )}
                            {!loading && displayAlerts.length === 0 && (
                                <div className="alert-placeholder">No active alerts.</div>
                            )}
                        </div>
                    ) : (
                        <div className="evac-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loading && <div className="alert-placeholder">Loading...</div>}

                            {!loading && evacSubTab === 'routes' && (
                                evacData.routes.length > 0 ? (
                                    evacData.routes.map(route => (
                                        <AlertCard
                                            key={route.id}
                                            severity={route.status === 'safe' ? 'info' : 'warning'}
                                            type={route.status === 'safe' ? 'recommended' : ''}
                                            title={route.name}
                                            content={route.details}
                                        />
                                    ))
                                ) : <div className="alert-placeholder">No routes found</div>
                            )}

                            {!loading && evacSubTab === 'shelters' && (
                                evacData.shelters.length > 0 ? (
                                    evacData.shelters.map(shelter => (
                                        <AlertCard
                                            key={shelter.id}
                                            severity="info"
                                            title={shelter.name}
                                            content={`Capacity: ${shelter.capacity}. ${shelter.facilities}`}
                                        />
                                    ))
                                ) : <div className="alert-placeholder">No shelters found</div>
                            )}
                        </div>
                    )}
                </div>

                <Link to="/alerts" style={{ width: '100%' }}>
                    <button className="btn-view-all">View All Alerts</button>
                </Link>
            </div>
        </div>
    );
};

export default OverlayPanel;
