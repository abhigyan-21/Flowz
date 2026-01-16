import React from 'react';
import { Phone, Ambulance, Shield, HeartPulse } from 'lucide-react';

const EmergencyContacts = () => {
    const containerStyle = {
        padding: '20px 20px 20px', // Adjusted to match global layout
        minHeight: '100vh',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
    };

    const cardStyle = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        border: 'var(--glass-border)',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '800px',
        boxShadow: 'var(--glass-shadow)',
    };

    const sectionTitle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: 'var(--accent-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const contactGrid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
    };

    const contactCard = {
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'transform 0.2s',
        cursor: 'pointer'
    };

    return (
        <div style={containerStyle}>
            <div style={{ ...cardStyle, textAlign: 'center', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Emergency Assistance</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Quick access to emergency services and helplines.</p>
            </div>

            <div style={cardStyle}>
                <h2 style={sectionTitle}>
                    <Shield size={28} /> Emergency Services
                </h2>
                <div style={contactGrid}>
                    <div style={contactCard} className="hover-scale">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '600' }}>National Emergency</span>
                            <Phone size={20} color="#EF4444" />
                        </div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EF4444' }}>112</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>All-in-one Emergency</span>
                    </div>

                    <div style={contactCard} className="hover-scale">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '600' }}>Police Control</span>
                            <Shield size={20} color="#3B82F6" />
                        </div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>100</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Police Assistance</span>
                    </div>

                    <div style={contactCard} className="hover-scale">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '600' }}>Ambulance</span>
                            <Ambulance size={20} color="#10B981" />
                        </div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>102</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Medical Emergency</span>
                    </div>

                    <div style={contactCard} className="hover-scale">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '600' }}>Fire Brigade</span>
                            <HeartPulse size={20} color="#F59E0B" />
                        </div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>101</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Fire Emergency</span>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <h2 style={sectionTitle}>
                    <HeartPulse size={28} /> Nearby Help Centers (Mock)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { name: "City General Hospital", dist: "2.5 km", phone: "+91 22 1234 5678" },
                        { name: "Red Cross Society", dist: "4.1 km", phone: "+91 22 8765 4321" },
                        { name: "Disaster Relief Camp A", dist: "5.0 km", phone: "+91 22 5555 6666" }
                    ].map((center, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{center.name}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Distance: {center.dist}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{
                                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                                    background: 'var(--color-primary)', color: 'white', cursor: 'pointer'
                                }}>Call Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;
