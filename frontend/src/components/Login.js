import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Auth.css'; // Shared CSS for Auth pages

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("https://truthshield-a-fake-news-detection-system.onrender.com/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email, // Backend checks "username" or "email"
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login Success
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', data.username);
                alert("Login successful!");
                window.location.href = "/home"; // Go to home/dashboard
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Server error. Is the backend running?");
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="auth-box glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to continue to TruthShield</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        <FaSignInAlt /> Sign In
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
