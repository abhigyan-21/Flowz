
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MapPin, ChevronDown, Crosshair } from 'lucide-react';
import locationService from '../../services/locationService';
import logo from '../../assets/logo.png';

const Header = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search
    useEffect(() => {
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

    return (
        <header className="app-header">
            <div className="header-left">
                <Link to="/">
                    <img src={logo} alt="Flowz Logo" className="logo-img" />
                </Link>
            </div>

            <div className="header-center">
                <div className="search-wrapper">
                    <MapPin className="search-icon-left" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search city (e.g. Mumbai)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <ChevronDown className="search-icon-right" size={16} />

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
                                        setSearchQuery(city.name);
                                        setIsSearching(false);
                                        // Trigger map view update here if we had a global context
                                    }}
                                >
                                    {city.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button className="btn-my-location" title="Use my current location">
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
