import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MapPin, ChevronDown, Crosshair } from 'lucide-react';
import logo from '../../assets/logo.png';

const Header = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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
                    <input type="text" className="search-input" placeholder="Mumbai, India" />
                    <ChevronDown className="search-icon-right" size={16} />
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
