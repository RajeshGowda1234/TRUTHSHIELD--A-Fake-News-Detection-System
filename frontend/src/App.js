import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import './App.css';

function Landing() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
        </>
    );
}

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/home" element={<><Landing /><Footer /></>} />
                    <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
                    <Route path="/signup" element={<><Navbar /><Signup /><Footer /></>} />
                    <Route path="/dashboard" element={<><Navbar /><Dashboard /><Footer /></>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;