import React from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaShieldAlt, FaRobot, FaSearch, FaLock, FaGlobe } from 'react-icons/fa';
import './Features.css';

const Features = () => {
    const features = [
        {
            icon: <FaBolt />,
            title: 'Real-time Analysis',
            description: 'Get verification results in milliseconds. Our distributed edge network ensures zero latency while you browse.'
        },
        {
            icon: <FaShieldAlt />,
            title: 'Bias Detection',
            description: 'Automatically identify political, commercial, or ideological bias in news articles with our advanced NLP models.'
        },
        {
            icon: <FaRobot />,
            title: 'AI-Powered Core',
            description: 'State-of-the-art machine learning algorithms that adapt to new misinformation patterns daily.'
        },
        {
            icon: <FaSearch />,
            title: 'Source Verification',
            description: 'Deep background checks on publishers and authors to ensure credibility and track record transparency.'
        },
        {
            icon: <FaLock />,
            title: 'Privacy First',
            description: 'Your browsing history never leaves your device. All analysis happens locally or with anonymized tokens.'
        },
        {
            icon: <FaGlobe />,
            title: 'Cross-Platform',
            description: 'Works seamlessly across all major browsers and devices, protecting you wherever you read news.'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section className="features-section" id="features">
            <div className="container">
                <div className="section-header">
                    <h2>Why Choose TruthShield?</h2>
                    <p>Advanced technology designed to protect the integrity of information.</p>
                </div>

                <motion.div
                    className="features-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div className="feature-card glass-panel" key={index} variants={itemVariants}>
                            <div className="feature-icon-wrapper">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
