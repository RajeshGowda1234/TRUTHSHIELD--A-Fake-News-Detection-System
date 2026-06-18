import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top when route changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/home');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container container">
                <Link to="/home" className="navbar-logo">
                    <FaShieldAlt className="logo-icon" />
                    <span className="logo-text">Truth<span className="logo-accent">Shield</span></span>
                </Link>

                <div className="navbar-actions">
                    {token ? (
                        <>
                            <span className="nav-link" style={{marginRight: '15px'}}>Hello, {user}</span>
                            <button onClick={handleLogout} className="btn btn-primary btn-sm">Log Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Log In</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
