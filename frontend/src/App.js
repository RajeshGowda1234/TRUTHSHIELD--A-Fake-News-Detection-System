import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : "https://truthshield-a-fake-news-detection-system.onrender.com";

function Dashboard() {
  const checkNews = () => {
    let text = document.getElementById("news").value;
    
    fetch(`${API_BASE_URL}/predict`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({text:text})
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById("result").innerText = data.prediction || data.Prediction || "";
    })
    .catch(err => {
      console.error(err);
      document.getElementById("result").innerText = "Error connecting to backend.";
    });
  }

  return (
    <div style={{textAlign:"center", marginTop:"100px", minHeight:"60vh", padding:"20px"}}>
      <h1>TruthShield Fake News Detection</h1>
      <textarea 
        id="news" 
        rows="6" 
        cols="60" 
        placeholder="Enter news text" 
        style={{padding:"15px", borderRadius:"8px", marginTop:"20px", border:"1px solid #ccc", color:"inherit", background:"rgba(255, 255, 255, 0.05)"}}
      ></textarea>
      <br /><br />
      <button onClick={checkNews} className="btn btn-primary">Check News</button>
      <h3 id="result" style={{marginTop:"20px", color:"#4f8eff"}}></h3>
    </div>
  );
}

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