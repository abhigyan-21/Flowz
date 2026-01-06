
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MapPin, ChevronDown, Crosshair } from 'lucide-react';
import locationService from '../../services/locationService';
import { useMap } from '../../context/MapContext';
import logo from '../../assets/logo.png';

const Header = () => {
    const location = useLocation();
    const { flyTo } = useMap();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const lastSelectedQuery = useRef(null); // Track last selected query to prevent auto-reopen
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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
                <Link to="/">
                    <img src={logo} alt="Flowz Logo" className="logo-img" />
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
                    />
                    <button
                        className="search-toggle-btn"
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#64748B', // Slate 500
                            zIndex: 1
                        }}
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
                    {isSearching && searchResults.length > 0 && (
                        <div className="search-dropdown" style={{
                            position: 'absolute', top: '100%', left: 0, width: '100%',
                            background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            marginTop: '4px', zIndex: 1002
                        }}>
                            {searchResults.map(city => (
                                <div key={city.id} className="search-item" style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onClick={() => {
                                        lastSelectedQuery.current = city.name; // Prevent useEffect from re-opening
                                        setSearchQuery(city.name);
                                        setIsSearching(false);
                                        // Fly to city location
                                        flyTo({
                                            lat: city.lat,
                                            lng: city.lng,
                                            altitude: 50000
                                        });
                                    }}
                                >
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
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
