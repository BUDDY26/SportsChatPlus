// src/pages/HomePage.js
// Clean Professional SportsChat+ Landing Page
// Simplified design with Logo.png background
// ==========================================

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import "./style.css";

const HomePage = () => {
  console.log("SportsChatPlus Homepage Loaded!");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Redirect logged-in users to dashboard - but only after loading is complete
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="home-page loading-state">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <h2>Loading SportsChatPlus...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="content-box homepage-content">
        {/* Clean Main Branding */}
        <div className="main-branding">
          <h1 className="main-title">SportsChat+</h1>
          <p className="main-subtitle">Your Ultimate Sports Experience</p>
        </div>

        {/* Simple Feature Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏀</div>
            <h3>Live Games</h3>
            <p>Real-time scores and updates</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Live Chat</h3>
            <p>Chat with fans in real-time</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Brackets</h3>
            <p>Track tournament progress</p>
          </div>
        </div>

        {/* Main Call to Action */}
        <div className="cta-section">
          <p className="cta-text">
            Join the conversation and connect with fellow sports fans!
          </p>
          <p className="cta-description">
            Follow live games, chat in real-time, and track your favorite teams 
            throughout the tournament.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/login" className="button-link">
            <button className="primary-button cta-button">
              Get Started - Login
            </button>
          </Link>
          
          <Link to="/signup" className="button-link">
            <button className="secondary-button signup-button">
              New Here? Sign Up Free
            </button>
          </Link>
        </div>

        {/* Simple Stats */}
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-number">68</span>
            <span className="stat-label">Teams</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">67</span>
            <span className="stat-label">Games</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Live</span>
            <span className="stat-label">Updates</span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="link-row">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
        
        <div className="disclaimer">
          <p>
            SportsChatPlus.com is not affiliated with the National Collegiate
            Athletic Association (NCAA®) or March Madness Athletic Association,
            neither of which has supplied, reviewed, approved, or endorsed the
            material on this site. SportsChatPlus.com is solely responsible for
            this site but makes no guarantee about the accuracy or completeness
            of the information herein.
          </p>
          <div className="disclaimer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;