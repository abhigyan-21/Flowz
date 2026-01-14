
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronDown, Crosshair, Printer } from 'lucide-react';
import locationService from '../../services/locationService';
import { useMap } from '../../context/MapContext';
import logo from '../../assets/logo_rms.png';

const Header = () => {
    const { flyTo } = useMap();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const lastSelectedQuery = useRef(null); // Track last selected query to prevent auto-reopen
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load Recents
    useEffect(() => {
        try {
            const saved = localStorage.getItem('flowz_recent_searches');
            if (saved) setRecentSearches(JSON.parse(saved));
        } catch (e) {
            console.error(e);
        }
    }, []);

    const addToRecents = (city) => {
        const newRecents = [city, ...recentSearches.filter(r => r.id !== city.id)].slice(0, 4);
        setRecentSearches(newRecents);
        localStorage.setItem('flowz_recent_searches', JSON.stringify(newRecents));
    };

    const handleSelectCity = (city) => {
        lastSelectedQuery.current = city.name;
        setSearchQuery(city.name);
        setIsSearching(false);
        addToRecents(city);

        flyTo({
            lat: city.lat,
            lng: city.lng,
            altitude: 50000
        });
    };

    // Debounce search
    useEffect(() => {
        // If the current query matches what we just selected, don't trigger a new search
        if (searchQuery === lastSelectedQuery.current) {
            return;
        }

        const fetchLocations = async () => {
            if (searchQuery.length > 2) {
                try {
                    const results = await locationService.getLocations({ q: searchQuery });
                    setSearchResults(results.data || []);
                    setIsSearching(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        };
        const timer = setTimeout(fetchLocations, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);
    const handleMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                flyTo({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    altitude: 20000 // Close zoom
                });
            }, (error) => {
                console.error("Location access denied or error:", error);
                alert("Could not access your location. Please check permissions.");
            });
        }
    };



    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
        };

        if (isSearching) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearching]);

    return (
        <header className="app-header">
            <div className="header-left">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="logo-wrapper">
                        <img src={logo} alt="Flowz Logo" className="logo-img" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '2px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
                        GIRDHAR
                    </span>
                </Link>
            </div>

            <div className="header-center">
                <div className="search-wrapper" ref={searchRef}>
                    <MapPin className="search-icon-left" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search city (e.g. Mumbai)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearching(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchResults.length > 0) {
                                handleSelectCity(searchResults[0]);
                            }
                        }}
                    />
                    <button
                        className="search-toggle-btn"
                        onClick={async () => {
                            if (!isSearching) {
                                // Show list (fetch defaults if empty)
                                try {
                                    const results = await locationService.getLocations({ q: searchQuery });
                                    setSearchResults(results.data || []);
                                    setIsSearching(true);
                                } catch (e) {
                                    console.error(e);
                                }
                            } else {
                                setIsSearching(false);
                            }
                        }}
                    >
                        <ChevronDown size={16} />
                    </button>

                    {/* Search Results Dropdown */}
                    {isSearching && (
                        <div className="search-dropdown">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && !searchQuery && (
                                <>
                                    <div style={{
                                        padding: '8px 12px',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontWeight: '600',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Recent
                                    </div>
                                    {recentSearches.map(city => (
                                        <div key={city.id} className="search-item" onClick={() => handleSelectCity(city)}>
                                            <span style={{ opacity: 0.7, marginRight: '8px' }}>⏱️</span> {city.name}
                                        </div>
                                    ))}
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                                </>
                            )}

                            {/* Search Results / Suggestions */}
                            {searchResults.map(city => (
                                <div key={city.id} className="search-item" onClick={() => handleSelectCity(city)}>
                                    {city.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button className="btn-my-location" title="Use my current location" onClick={handleMyLocation}>
                    <Crosshair size={20} />
                </button>
            </div>

            <div className="header-right">
                <button
                    className="btn-more"
                    style={{ width: '40px', padding: 0, justifyContent: 'center' }}
                    onClick={() => window.print()}
                    title="Print View"
                >
                    <Printer size={20} />
                </button>
                <div className="dropdown-container" ref={dropdownRef}>
                    <button
                        className="btn-more"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        More <ChevronDown size={14} style={{ marginLeft: '4px' }} />
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/analytics" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Analytics</Link>
                            <Link to="/forecast" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Predictions</Link>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                            <Link to="/emergency" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Emergency Contacts</Link>
                            <Link to="/about" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>About Us</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
