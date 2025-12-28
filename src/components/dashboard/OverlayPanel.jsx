import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/dashboard.css';
import AlertCard from './AlertCard';

const OverlayPanel = () => {
    const [mainTab, setMainTab] = useState('alert'); // 'alert' | 'evacuation'
    const [alertSubTab, setAlertSubTab] = useState('foryou'); // 'foryou' | 'country'
    const [evacSubTab, setEvacSubTab] = useState('routes'); // 'routes' | 'shelters'

    return (
        <div className="overlay-panel">
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
                    <div className="alert-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alertSubTab === 'foryou' ? (
                            <>
                                <AlertCard severity="info" title="Flood Alert" content="Heavy rain expected in your area." />
                                <AlertCard severity="high" title="Red Alert" content="Immediate evacuation required in Zone A." />
                                <AlertCard severity="moderate" title="Orange Warning" content="Water levels rising in River X." />
                            </>
                        ) : (
                            <>
                                <AlertCard severity="high" title="National Alert" content="Cyclone approaching East Coast." />
                                <AlertCard severity="moderate" title="Regional Warning" content="Landslide risk in hilly areas." />
                            </>
                        )}
                    </div>
                ) : (
                    <div className="evac-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {evacSubTab === 'routes' ? (
                            <>
                                <AlertCard severity="info" type="recommended" title="Route 66 (Safe)" content="Traffic: Low. No water logging." />
                                <AlertCard severity="info" title="Highway 12 (Caution)" content="Traffic: Moderate. Slippery roads." />
                            </>
                        ) : (
                            <>
                                <AlertCard severity="info" title="Central School Shelter" content="Capacity: 80% Full. Medical aid available." />
                                <AlertCard severity="info" title="Community Hall" content="Capacity: 40% Full. Food available." />
                            </>
                        )}
                    </div>
                )}
            </div>

            <Link to="/alerts" style={{ width: '100%' }}>
                <button className="btn-view-all">View All Alerts</button>
            </Link>
        </div>
    );
};

export default OverlayPanel;
