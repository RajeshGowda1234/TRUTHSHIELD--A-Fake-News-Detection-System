import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {

    return (
        <section className="hero">
            <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                New: AI-Powered Verification 2.0
            </motion.div>

            <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <span>TruthShield</span> – A Fake News Detection System
            </motion.h1>

            <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                Instantly detect fake news, bias, and misinformation while you browse.
                TruthShield acts as your digital guardian against deception on the web.
            </motion.p>

            <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('analyzer-section')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="btn btn-primary btn-lg"
                >
                    Analyze News Online <FaArrowRight className="btn-icon-right" />
                </button>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="btn btn-outline btn-lg"
                >
                    How it Works
                </button>
            </motion.div>

            {/* Abstract Background Elements */}
            <div className="hero-glow glow-1"></div>
            <div className="hero-glow glow-2"></div>
        </section>
    );
};

export default Hero;
