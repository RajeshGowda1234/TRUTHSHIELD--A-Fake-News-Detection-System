import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaNewspaper, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaChartBar, FaTrash } from 'react-icons/fa';
import './Dashboard.css';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://truthshield-a-fake-news-detection-system.onrender.com";

const Dashboard = () => {
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
                    colorClass: 'result-real',
                    description: 'This content appears to be legitimate and credible news.',
                    emoji: '✅'
                };
            case 'Fake':
                return {
                    icon: <FaTimesCircle />,
                    label: 'FAKE NEWS',
                    colorClass: 'result-fake',
                    description: 'This content shows patterns commonly associated with misinformation.',
                    emoji: '🚫'
                };
            default:
                return {
                    icon: <FaQuestionCircle />,
                    label: 'UNCERTAIN',
                    colorClass: 'result-uncertain',
                    description: 'The AI could not determine with sufficient confidence. Consider checking multiple sources.',
                    emoji: '⚠️'
                };
        }
    };

    return (
        <div className="dashboard-container">
            {/* Background blobs */}
            <div className="dashboard-bg-blob blob-1" />
            <div className="dashboard-bg-blob blob-2" />

            <motion.div
                className="dashboard-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="dashboard-header">
                    <div className="dashboard-icon">
                        <FaNewspaper />
                    </div>
                    <h1 className="dashboard-title">News Analyzer</h1>
                    <p className="dashboard-subtitle">
                        Paste any news article or headline below to detect misinformation using AI
                    </p>
                </div>

                {/* Input Card */}
                <div className="input-card glass-panel">
                    <div className="textarea-header">
                        <span className="textarea-label">
                            <FaSearch /> Enter News Text
                        </span>
                        <span className={`char-count ${charCount > MAX_CHARS * 0.9 ? 'char-warn' : ''}`}>
                            {charCount} / {MAX_CHARS}
                        </span>
                    </div>

                    <textarea
                        className="news-textarea"
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Paste a news article, headline, or any text you want to fact-check here...&#10;&#10;Example: 'Scientists discover new planet in solar system that could support life...' "
                        rows={8}
                    />

                    {error && (
                        <motion.div
                            className="error-banner"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            ⚠️ {error}
                        </motion.div>
                    )}

                    <div className="btn-row">
                        <button
                            className="btn-clear"
                            onClick={handleClear}
                            disabled={loading || (!text && !result)}
                        >
                            <FaTrash /> Clear
                        </button>
                        <button
                            className="btn-analyze"
                            onClick={handleCheck}
                            disabled={loading || !text.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner" />
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

                {/* Result Card */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            className={`result-card glass-panel ${getResultConfig(result.prediction).colorClass}`}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                        >
                            {/* Verdict */}
                            <div className="verdict-section">
                                <div className="verdict-icon">
                                    {getResultConfig(result.prediction).icon}
                                </div>
                                <div className="verdict-emoji">{getResultConfig(result.prediction).emoji}</div>
                                <h2 className="verdict-label">{getResultConfig(result.prediction).label}</h2>
                                <p className="verdict-description">{getResultConfig(result.prediction).description}</p>
                            </div>

                            {/* Confidence Score */}
                            <div className="confidence-section">
                                <div className="confidence-header">
                                    <span><FaChartBar /> Confidence Score</span>
                                    <span className="confidence-pct">
                                        {(result.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="confidence-track">
                                    <motion.div
                                        className="confidence-fill"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                                    />
                                </div>
                                <div className="confidence-labels">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Probability Breakdown */}
                            <div className="prob-section">
                                <h3 className="prob-title">Probability Breakdown</h3>
                                <div className="prob-bars">
                                    {/* Real probability */}
                                    <div className="prob-item">
                                        <div className="prob-label">
                                            <FaCheckCircle className="icon-real" />
                                            <span>Real News</span>
                                            <span className="prob-value">{(result.prob_real * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="prob-track">
                                            <motion.div
                                                className="prob-fill prob-fill-real"
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${(result.prob_real * 100).toFixed(1)}%` }}
                                                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Fake probability */}
                                    <div className="prob-item">
                                        <div className="prob-label">
                                            <FaTimesCircle className="icon-fake" />
                                            <span>Fake News</span>
                                            <span className="prob-value">{(result.prob_fake * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="prob-track">
                                            <motion.div
                                                className="prob-fill prob-fill-fake"
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${(result.prob_fake * 100).toFixed(1)}%` }}
                                                transition={{ duration: 1, ease: 'easeOut', delay: 0.65 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="result-disclaimer">
                                ⓘ Results are based on ML pattern analysis. Always verify with trusted sources.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading skeleton */}
                {loading && (
                    <motion.div
                        className="loading-card glass-panel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="loading-spinner-large" />
                        <p className="loading-text">Analyzing text patterns...</p>
                        <p className="loading-sub">Running through AI model</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
