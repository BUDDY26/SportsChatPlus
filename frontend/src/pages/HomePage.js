// src/pages/HomePage.js
// SportsChatPlus Landing Page - Complete Rebuild
// Your exact styling + Firebase integration + branding
// ===================================================

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
      <div className="home-page" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>🏀</div>
          <h2 style={{
            color: '#1a73e8',
            margin: '0 0 10px 0'
          }}>Loading SportsChatPlus...</h2>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1a73e8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="content-box">
        {/* Main SportsChatPlus Branding */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            margin: '0 0 10px 0',
            background: 'linear-gradient(45deg, #007bff, #1a73e8, #e63946)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
          }}>
            🏀 SportsChatPlus
          </h1>
          
          <h2 style={{ 
            fontSize: '24px', 
            color: '#1a73e8',
            margin: '0 0 20px 0',
            fontWeight: '600'
          }}>
            Your Ultimate March Madness Experience
          </h2>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          margin: '30px 0'
        }}>
          <div style={{ textAlign: 'center', padding: '15px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎯</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: '16px' }}>Live Games</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Real-time scores and updates
            </p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>💬</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: '16px' }}>Live Chat</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Chat with fans in real-time
            </p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: '16px' }}>Brackets</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Track tournament progress
            </p>
          </div>
        </div>

        {/* Main Description */}
        <div style={{ 
          textAlign: 'center', 
          margin: '30px 0',
          padding: '20px',
          background: 'rgba(26, 115, 232, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(26, 115, 232, 0.2)'
        }}>
          <p style={{ 
            fontSize: '18px', 
            margin: '0 0 15px 0',
            fontWeight: '500',
            color: '#1a73e8'
          }}>
            🔥 Join the conversation and never miss a moment of March Madness!
          </p>
          <p style={{ 
            fontSize: '15px', 
            margin: 0,
            lineHeight: '1.5',
            color: '#333'
          }}>
            Connect with fellow sports fans, follow live games, chat in real-time, 
            and track your favorite teams throughout the tournament.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <Link to="/login">
          <button className="primary-button" style={{
            fontSize: '18px',
            padding: '12px 0',
            background: 'linear-gradient(45deg, #007bff, #1a73e8)',
            transform: 'scale(1)',
            transition: 'transform 0.2s ease, background-color 0.3s ease'
          }}>
            🚀 Get Started - Login
          </button>
        </Link>
        
        <Link to="/signup">
          <button className="primary-button" style={{
            fontSize: '16px',
            padding: '10px 0',
            background: 'rgba(26, 115, 232, 0.8)',
            marginBottom: '20px'
          }}>
            ⭐ New Here? Sign Up Free
          </button>
        </Link>

        {/* Quick March Madness Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          margin: '25px 0 20px 0',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#007bff', fontSize: '18px' }}>68</div>
            <div style={{ fontSize: '12px' }}>Teams</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#007bff', fontSize: '18px' }}>67</div>
            <div style={{ fontSize: '12px' }}>Games</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#e63946', fontSize: '18px' }}>Live</div>
            <div style={{ fontSize: '12px' }}>Updates</div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="link-row">
          <p style={{ margin: '20px 0 10px 0', fontSize: '14px' }}>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
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
          <div style={{ marginTop: "10px" }}>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;