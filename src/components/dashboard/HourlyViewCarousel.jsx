import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import '../../styles/hourly-carousel.css';

const HourlyViewCarousel = ({ locationData, onClose, controlledIndex, onControlledIndexChange }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hourlyImages, setHourlyImages] = useState([]);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const scrollContainerRef = useRef(null);
    const autoPlayIntervalRef = useRef(null);

    // Generate mock hourly data for the location
    useEffect(() => {
        if (!locationData) return;

        // Generate 24 hourly data points with mock image URLs
        const mockImages = Array.from({ length: 24 }, (_, index) => {
            const hour = String(index).padStart(2, '0');
            return {
                hour: `${hour}:00`,
                time: new Date(new Date().setHours(index)).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                }),
                // Generate a gradient-based placeholder image using canvas
                imageUrl: generatePlaceholderImage(locationData, index),
                rainfall: Math.random() * 50,
                waterLevel: 45 + Math.random() * 20,
                temperature: 25 + Math.random() * 10,
                humidity: 60 + Math.random() * 30
            };
        });

        setHourlyImages(mockImages);
    }, [locationData]);

    // Auto-play functionality (like a GIF)
    useEffect(() => {
        if (!isAutoPlay) {
            if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
            return;
        }

        autoPlayIntervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % hourlyImages.length);
        }, 1500); // Change image every 1.5 seconds

        return () => {
            if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
        };
    }, [isAutoPlay, hourlyImages.length]);

    // Sync with controlled index when provided
    useEffect(() => {
        if (typeof controlledIndex === 'number' && controlledIndex !== currentIndex) {
            setCurrentIndex(controlledIndex);
        }
    }, [controlledIndex]);

    // Scroll to current image
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const itemWidth = 140; // Width of each item in carousel
            const scrollPosition = currentIndex * itemWidth - (container.clientWidth / 2) + (itemWidth / 2);
            container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
    }, [currentIndex]);

    const handlePrevious = () => {
        const next = (currentIndex - 1 + hourlyImages.length) % hourlyImages.length;
        if (typeof onControlledIndexChange === 'function') onControlledIndexChange(next);
        else setCurrentIndex(next);
        setIsAutoPlay(false);
    };

    const handleNext = () => {
        const next = (currentIndex + 1) % hourlyImages.length;
        if (typeof onControlledIndexChange === 'function') onControlledIndexChange(next);
        else setCurrentIndex(next);
        setIsAutoPlay(false);
    };

    const handleItemClick = (index) => {
        if (typeof onControlledIndexChange === 'function') onControlledIndexChange(index);
        else setCurrentIndex(index);
        setIsAutoPlay(false);
    };

    const toggleAutoPlay = () => {
        setIsAutoPlay(!isAutoPlay);
    };

    const currentImage = hourlyImages[currentIndex];

    return (
        <div className="hourly-carousel-container">
            {/* Header */}
            <div className="carousel-header">
                <div className="location-info">
                    <h3>{locationData?.name || 'Location'}</h3>
                    <p className="location-basin">{locationData?.basin || 'Basin'}</p>
                </div>
                <button className="close-btn" onClick={onClose} title="Close">
                    <X size={24} />
                </button>
            </div>

            {/* Main Image Display */}
            <div className="main-image-section">
                {currentImage && (
                    <>
                        <img 
                            src={currentImage.imageUrl} 
                            alt={`Hourly view ${currentImage.hour}`}
                            className="main-image"
                        />
                        <div className="image-overlay">
                            <div className="time-label">{currentImage.hour}</div>
                            <div className="stats-label">
                                <span>💧 {currentImage.waterLevel.toFixed(1)}m</span>
                                <span>🌧️ {currentImage.rainfall.toFixed(1)}mm</span>
                                <span>🌡️ {currentImage.temperature.toFixed(1)}°C</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="carousel-wrapper">
                <button className="carousel-nav-btn left" onClick={handlePrevious}>
                    <ChevronLeft size={20} />
                </button>

                <div className="carousel-container" ref={scrollContainerRef}>
                    {hourlyImages.map((image, index) => (
                        <div
                            key={index}
                            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => handleItemClick(index)}
                        >
                            <img 
                                src={image.imageUrl} 
                                alt={`Hour ${image.hour}`}
                                className="carousel-thumbnail"
                            />
                            <div className="carousel-time">{image.hour}</div>
                        </div>
                    ))}
                </div>

                <button className="carousel-nav-btn right" onClick={handleNext}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Controls */}
            <div className="carousel-controls">
                <button 
                    className={`btn-autoplay ${isAutoPlay ? 'active' : ''}`}
                    onClick={toggleAutoPlay}
                    title={isAutoPlay ? "Pause animation" : "Play animation"}
                >
                    {isAutoPlay ? '⏸ Pause' : '▶ Play'}
                </button>
                <span className="time-indicator">
                    {currentIndex + 1} / {hourlyImages.length}
                </span>
            </div>

            {/* Detailed Stats */}
            {currentImage && (
                <div className="detailed-stats">
                    <div className="stat-item">
                        <span className="stat-label">Water Level</span>
                        <span className="stat-value">{currentImage.waterLevel.toFixed(2)}m</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Rainfall</span>
                        <span className="stat-value">{currentImage.rainfall.toFixed(2)}mm</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Temperature</span>
                        <span className="stat-value">{currentImage.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Humidity</span>
                        <span className="stat-value">{currentImage.humidity.toFixed(0)}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to generate placeholder gradient images
function generatePlaceholderImage(location, hourIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Create gradient background based on time of day and random water level
    const baseColor = getTimeBasedColor(hourIndex);
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, baseColor.sky);
    gradient.addColorStop(0.6, baseColor.transition);
    gradient.addColorStop(1, baseColor.water);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    // Add water waves effect
    const waterLevel = 200 + Math.sin(hourIndex / 3) * 30;
    ctx.fillStyle = `rgba(30, 144, 255, 0.4)`;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x < 400; x += 30) {
            const y = waterLevel + i * 15 + Math.sin((x + hourIndex * 10) / 20) * 10;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(400, 300);
        ctx.lineTo(0, 300);
        ctx.closePath();
        ctx.fill();
    }

    // Add location label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(location.name || 'Location', 20, 40);

    // Add risk indicator
    const riskLevel = (Math.sin(hourIndex / 4) + 1) / 2 * 100;
    ctx.fillStyle = riskLevel > 70 ? '#FF6B6B' : riskLevel > 40 ? '#FFA500' : '#4CAF50';
    ctx.fillRect(20, 60, (riskLevel / 100) * 150, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Risk: ${riskLevel.toFixed(0)}%`, 25, 75);

    return canvas.toDataURL('image/png');
}

// Get color scheme based on time of day
function getTimeBasedColor(hourIndex) {
    const colors = {
        night: { sky: '#0a0e27', transition: '#1a2a4a', water: '#162a44' },
        earlyMorning: { sky: '#1a2a4a', transition: '#2a4a6a', water: '#1a3a5a' },
        morning: { sky: '#87CEEB', transition: '#B0E0FF', water: '#4A90E2' },
        afternoon: { sky: '#87CEEB', transition: '#E0F6FF', water: '#1E90FF' },
        evening: { sky: '#FF8C42', transition: '#FFB84D', water: '#FF6B4D' },
        night2: { sky: '#0a0e27', transition: '#1a2a4a', water: '#162a44' }
    };

    if (hourIndex >= 0 && hourIndex < 5) return colors.night;
    if (hourIndex >= 5 && hourIndex < 7) return colors.earlyMorning;
    if (hourIndex >= 7 && hourIndex < 12) return colors.morning;
    if (hourIndex >= 12 && hourIndex < 17) return colors.afternoon;
    if (hourIndex >= 17 && hourIndex < 20) return colors.evening;
    return colors.night2;
}

export default HourlyViewCarousel;
