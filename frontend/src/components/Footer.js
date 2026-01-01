import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="logo-accent">Truth</span>Shield
                </div>
                <ul className="footer-links">
                    <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
                    <li><a href="#terms" className="footer-link">Terms of Service</a></li>
                    <li><a href="#contact" className="footer-link">Contact Support</a></li>
                </ul>
                <div className="footer-copyright">
                    © {new Date().getFullYear()} TruthShield Inc.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
