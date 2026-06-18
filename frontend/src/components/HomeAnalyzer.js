import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTrash, FaLock, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaChartBar } from 'react-icons/fa';
import './HomeAnalyzer.css';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://truthshield-a-fake-news-detection-system.onrender.com";

const HomeAnalyzer = () => {
    const token = localStorage.getItem('token');

    // Analyzer States
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [charCount, setCharCount] = useState(0);

    const MAX_CHARS = 5000;

    const handleTextChange = (e) => {
        const val = e.target.value;
        if (val.length <= MAX_CHARS) {
            setText(val);
            setCharCount(val.length);
        }
    };

    const handleClear = () => {
        setText('');
        setCharCount(0);
        setResult(null);
        setError('');
    };

    const handleCheck = async () => {
        if (!text.trim()) {
            setError('Please enter some news text to analyze.');
            return;
        }
        if (text.trim().length < 50) {
            setError('Text too short. Please enter at least 50 characters for accurate analysis.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Server error. Please try again.');
                setLoading(false);
                return;
            }

            setResult({
                prediction: data.prediction,
                confidence: data.confidence,
                prob_fake: data.prob_fake,
                prob_real: data.prob_real,
            });
        } catch (err) {
            setError('Could not connect to the analysis server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getResultConfig = (prediction) => {
        switch (prediction) {
            case 'Real':
                return {
                    icon: <FaCheckCircle />,
                    label: 'REAL NEWS',
                    colorClass: 'real',
                    description: 'This content appears to be legitimate and credible news.',
                    emoji: '✅'
                };
            case 'Fake':
                return {
                    icon: <FaTimesCircle />,
                    label: 'FAKE NEWS',
                    colorClass: 'fake',
                    description: 'This content shows patterns commonly associated with misinformation.',
                    emoji: '🚫'
                };
            default:
                return {
                    icon: <FaQuestionCircle />,
                    label: 'UNCERTAIN',
                    colorClass: 'uncertain',
                    description: 'The AI could not determine with sufficient confidence. Consider checking multiple sources.',
                    emoji: '⚠️'
                };
        }
    };

    return (
        <section className="home-analyzer-section" id="analyzer-section">
            <div className="home-analyzer-wrapper container">
                <div className="analyzer-header">
                    <h2>AI News Analyzer</h2>
                    <p>Verify headlines and article text using our fine-tuned natural language model.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!token ? (
                        /* Guest State - Teaser Card */
                        <motion.div
                            key="guest-teaser"
                            className="analyzer-teaser-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="teaser-glow" />
                            <div className="lock-icon-wrapper">
                                <FaLock />
                            </div>
                            <h3 className="teaser-title">Unlock AI News Analyzer</h3>
                            <p className="teaser-description">
                                Create an account or sign in to scan articles, check bias metrics, and determine credibility with real-time accuracy scores.
                            </p>
                            <div className="teaser-actions">
                                <Link to="/login" className="btn btn-outline">Sign In</Link>
                                <Link to="/signup" className="btn btn-primary">Create Account</Link>
                            </div>
                        </motion.div>
                    ) : (
                        /* Logged In State - Analyzer Form */
                        <motion.div
                            key="active-analyzer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="analyzer-card">
                                <div className="input-container">
                                    <div className="input-meta">
                                        <div className="input-meta-label">
                                            <FaSearch /> Paste News Text
                                        </div>
                                        <div className={`char-limit ${charCount > MAX_CHARS * 0.9 ? 'warn' : ''}`}>
                                            {charCount} / {MAX_CHARS}
                                        </div>
                                    </div>

                                    <textarea
                                        className="analyzer-textarea"
                                        value={text}
                                        onChange={handleTextChange}
                                        placeholder="Paste a news article, headline, or text snippet here to analyze..."
                                        rows={8}
                                        disabled={loading}
                                    />

                                    {error && (
                                        <motion.div
                                            className="error-msg"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            ⚠️ {error}
                                        </motion.div>
                                    )}

                                    <div className="action-row">
                                        <button
                                            className="btn-reset"
                                            onClick={handleClear}
                                            disabled={loading || (!text && !result)}
                                        >
                                            <FaTrash /> Clear
                                        </button>
                                        <button
                                            className="btn-verify"
                                            onClick={handleCheck}
                                            disabled={loading || !text.trim()}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSearch /> Analyze News
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Show Result Card below if prediction exists */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        className={`home-result-card ${getResultConfig(result.prediction).colorClass}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                                        style={{ marginTop: '2rem' }}
                                    >
                                        {/* Verdict */}
                                        <div className="verdict-header">
                                            <div className="verdict-header-icon">
                                                {getResultConfig(result.prediction).icon}
                                            </div>
                                            <div className="verdict-header-label">
                                                {getResultConfig(result.prediction).label}
                                            </div>
                                            <p className="verdict-header-desc">
                                                {getResultConfig(result.prediction).description}
                                            </p>
                                        </div>

                                        {/* Confidence bar */}
                                        <div className="conf-container">
                                            <div className="conf-meta">
                                                <span><FaChartBar /> Confidence Score</span>
                                                <span className="conf-meta-value">
                                                    {(result.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="conf-bar-track">
                                                <motion.div
                                                    className="conf-bar-fill"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                                />
                                            </div>
                                            <div className="conf-bar-labels">
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>

                                        {/* Probability breakdown */}
                                        <div className="breakdown-box">
                                            <h3 className="breakdown-title">Probability Breakdown</h3>
                                            <div className="breakdown-bars">
                                                {/* Real bar */}
                                                <div className="breakdown-bar-item">
                                                    <div className="breakdown-bar-info">
                                                        <span>Likely Real</span>
                                                        <span className="value">{(result.prob_real * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <motion.div
                                                            className="breakdown-bar-fill real"
                                                            initial={{ width: '0%' }}
                                                            animate={{ width: `${(result.prob_real * 100).toFixed(1)}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Fake bar */}
                                                <div className="breakdown-bar-item">
                                                    <div className="breakdown-bar-info">
                                                        <span>Likely Fake</span>
                                                        <span className="value">{(result.prob_fake * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <motion.div
                                                            className="breakdown-bar-fill fake"
                                                            initial={{ width: '0%' }}
                                                            animate={{ width: `${(result.prob_fake * 100).toFixed(1)}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.35 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="disclaimer">
                                            ⓘ Results are generated by machine learning models. Please cross-reference claims.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Background elements */}
            <div className="analyzer-blob analyzer-blob-1" />
            <div className="analyzer-blob analyzer-blob-2" />
        </section>
    );
};

export default HomeAnalyzer;
