import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import "./style.css";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartSuggestion, setSmartSuggestion] = useState("");
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { resetPassword, user, loading } = useAuth();
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
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const suggestion = commonDomains.find(d => d.startsWith(domain));
        if (suggestion) {
          setSmartSuggestion(`${email.split('@')[0]}@${suggestion}`);
        }
      } else {
        setSmartSuggestion("");
      }
    } else {
      setSmartSuggestion("");
    }
  }, [email]);

  // Countdown timer for resend functionality
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Smart validation
    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    try {
      await resetPassword(email);
      setSuccess(true);
      setCountdown(60); // 60 second cooldown before allowing resend
    } catch (err) {
      console.error("Password reset error:", err);
      
      // Smart error handling
      const errorMessage = err.message || "Failed to process your request";
      if (errorMessage.includes("auth/user-not-found")) {
        setError("No account found with this email address. Please check your email or create a new account.");
      } else if (errorMessage.includes("auth/invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (errorMessage.includes("auth/too-many-requests")) {
        setError("Too many password reset attempts. Please wait a few minutes before trying again.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      await resetPassword(email);
      setCountdown(60);
      setError("");
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = () => {
    if (smartSuggestion) {
      setEmail(smartSuggestion);
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
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
          <h2 className="page-title" style={{
            background: 'linear-gradient(45deg, #007bff, #1a73e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '5px'
          }}>
            Reset Password
          </h2>
          <p style={{ 
            margin: '0 0 15px 0', 
            color: '#666',
            fontSize: '14px'
          }}>
            {success 
              ? "Check your email for reset instructions"
              : "Enter your email to receive reset instructions"
            }
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
            {error.includes("create a new account") && (
              <div style={{ marginTop: '10px' }}>
                <Link to="/signup" style={{ color: '#007bff', fontWeight: 'bold' }}>
                  Create Account →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Smart Email Suggestion */}
        {smartSuggestion && !success && (
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
            💡 Did you mean {smartSuggestion}? <small>(click to apply)</small>
          </div>
        )}
        
        {success ? (
          <div className="success-message">
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
            <h3 style={{ margin: '0 0 15px 0', color: '#28a745' }}>
              Reset Instructions Sent!
            </h3>
            <p style={{ lineHeight: '1.5', marginBottom: '20px' }}>
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions within a few minutes.
            </p>
            
            {/* Smart tips */}
            <div style={{
              background: 'rgba(40, 167, 69, 0.1)',
              border: '1px solid rgba(40, 167, 69, 0.2)',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#28a745', fontSize: '14px' }}>
                💡 What to do next:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.4' }}>
                <li>Check your email inbox (including spam/junk folder)</li>
                <li>Click the reset link in the email</li>
                <li>Create a new, strong password</li>
                <li>Sign in with your new password</li>
              </ul>
            </div>

            {/* Resend functionality */}
            <div style={{ marginBottom: '20px' }}>
              {countdown > 0 ? (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Didn't receive the email? You can resend in {countdown} seconds
                </div>
              ) : (
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  style={{
                    background: 'transparent',
                    border: '1px solid #1a73e8',
                    color: '#1a73e8',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Sending...' : '📤 Resend Email'}
                </button>
              )}
            </div>

            <div className="link-row" style={{ marginTop: "20px" }}>
              <Link to="/login" style={{ fontWeight: 'bold' }}>
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ 
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              <strong>🔒 Secure Process:</strong> We'll send reset instructions to your email. 
              The link will expire in 1 hour for security.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  autoComplete="email"
                  style={{
                    borderColor: error && !email ? '#dc3545' : undefined
                  }}
                />
              </div>
              
              <button 
                type="submit"
                className="primary-button"
                disabled={isLoading || !email}
                style={{
                  opacity: (isLoading || !email) ? 0.7 : 1,
                  cursor: (isLoading || !email) ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ opacity: 0.7 }}>Sending Instructions...</span>
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
                  "🚀 Send Reset Instructions"
                )}
              </button>
            </form>
            
            <div className="link-row" style={{ marginTop: '20px' }}>
              <Link to="/login" style={{ fontWeight: 'bold' }}>
                ← Back to Login
              </Link>
            </div>

            {/* Additional help */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: 'rgba(108, 117, 125, 0.1)',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#666'
            }}>
              <strong>Need more help?</strong> If you don't receive the email or continue having issues, 
              make sure you're using the email address associated with your SportsChatPlus account.
            </div>
          </>
        )}
        
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

export default ForgotPasswordPage;