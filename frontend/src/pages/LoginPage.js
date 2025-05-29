// src/pages/LoginPage.js
// LoginPage with Firebase Authentication + Your Styling
// ====================================================

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import "./style.css";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartSuggestion, setSmartSuggestion] = useState("");
  
  const navigate = useNavigate();
  const { signin, signInWithGoogle, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Smart email validation and suggestions
  useEffect(() => {
    if (email && email.includes('@')) {
      const domain = email.split('@')[1];
      if (domain && !domain.includes('.')) {
        // Suggest common domains
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const suggestion = commonDomains.find(d => d.startsWith(domain));
        if (suggestion) {
          setSmartSuggestion(`Did you mean ${email.split('@')[0]}@${suggestion}?`);
        }
      } else {
        setSmartSuggestion("");
      }
    } else {
      setSmartSuggestion("");
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Smart validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    try {
      await signin(email, password);
      // Navigation happens automatically via useEffect
    } catch (err) {
      console.error("Login error:", err);
      
      // Smart error handling with helpful suggestions
      const errorMessage = err.message || "Login failed";
      if (errorMessage.includes("user-not-found")) {
        setError("No account found with this email. Would you like to sign up instead?");
      } else if (errorMessage.includes("wrong-password")) {
        setError("Incorrect password. Try again or reset your password.");
      } else if (errorMessage.includes("too-many-requests")) {
        setError("Too many failed attempts. Please wait a moment before trying again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      // Navigation happens automatically via useEffect
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = () => {
    if (smartSuggestion) {
      const suggested = smartSuggestion.split(' ')[3]; // Extract email from suggestion
      setEmail(suggested.replace('?', ''));
      setSmartSuggestion("");
    }
  };

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="login-page">
        <div className="content-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏀</div>
          <h2>Loading...</h2>
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
    <div className="login-page">
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
        {/* Enhanced Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏀</div>
          <h2 className="page-title" style={{
            background: 'linear-gradient(45deg, #007bff, #1a73e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '5px'
          }}>
            Welcome Back!
          </h2>
          <p style={{ 
            margin: '0 0 15px 0', 
            color: '#666',
            fontSize: '14px'
          }}>
            Sign in to continue your March Madness journey
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
            {error.includes("sign up instead") && (
              <div style={{ marginTop: '10px' }}>
                <Link to="/signup" style={{ color: '#007bff', fontWeight: 'bold' }}>
                  Create Account →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Smart Email Suggestion */}
        {smartSuggestion && (
          <div style={{
            background: 'rgba(26, 115, 232, 0.1)',
            color: '#1a73e8',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '14px',
            cursor: 'pointer',
            border: '1px solid rgba(26, 115, 232, 0.2)'
          }} onClick={applySuggestion}>
            💡 {smartSuggestion} <small>(click to apply)</small>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <span 
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </span>
            </div>
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          
          <button 
            type="submit"
            className="primary-button"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <>
                <span style={{ opacity: 0.7 }}>Signing In...</span>
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </>
            ) : (
              "🚀 Sign In"
            )}
          </button>
        </form>

        {/* Google Sign In */}
        <div style={{ 
          margin: '15px 0', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          or
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: isLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '16px' }}>🔍</span>
          Continue with Google
        </button>
        
        <div className="link-row">
          New to SportsChatPlus? <Link to="/signup" style={{ fontWeight: 'bold' }}>Create Account</Link>
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

export default LoginPage;