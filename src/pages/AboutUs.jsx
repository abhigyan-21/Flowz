import React from 'react';
import { Droplets, Globe, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    const containerStyle = {
        padding: '100px 20px 20px',
        minHeight: '100vh',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
    };

    const heroSection = {
        textAlign: 'center',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    };

    const gradientText = {
        background: 'linear-gradient(135deg, #38BDF8 0%, #3B82F6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '3rem',
        fontWeight: 'bold'
    };

    const cardStyle = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        border: 'var(--glass-border)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '1000px',
        boxShadow: 'var(--glass-shadow)',
    };

    const featureGrid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '32px'
    };

    const featureCard = {
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    };

    return (
        <div style={containerStyle}>
            <div style={heroSection}>
                <h1 style={gradientText}>GIRIDHAR</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Empowering communities with real-time flood monitoring, AI-driven predictions, and effective disaster response coordination.
                </p>
            </div>

            <div style={cardStyle}>
                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Our Mission</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                    To mitigate the impact of floods through advanced technology. Flowz integrates satellite imagery,
                    ground sensor data, and predictive analytics to provide actionable insights for governments,
                    NGOs, and citizens, ensuring safety and minimizing loss.
                </p>

                <div style={featureGrid}>
                    <div style={featureCard}>
                        <Globe size={40} color="#38BDF8" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Real-Time Monitoring</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Live visualization of water levels, rainfall, and flood risks across the globe using Cesium 3D maps.
                        </p>
                    </div>

                    <div style={featureCard}>
                        <Droplets size={40} color="#F59E0B" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>AI Predictions</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Advanced forecasting models to predict flood events up to 72 hours in advance.
                        </p>
                    </div>

                    <div style={featureCard}>
                        <Users size={40} color="#10B981" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Community Response</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Coordinated evacuation plans, shelter information, and emergency alerts for affected areas.
                        </p>
                    </div>
                </div>
            </div>

            <Link to="/" style={{ textDecoration: 'none' }}>
                <button style={{
                    padding: '16px 32px',
                    borderRadius: '50px',
                    border: 'none',
                    background: 'var(--gradient-primary, linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%))',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                }}>
                    Explore the Map <ArrowRight size={20} />
                </button>
            </Link>
        </div>
    );
};

export default AboutUs;
