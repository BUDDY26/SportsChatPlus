import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import "./style.css";

export const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Smart validation states
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState([]);
  const [emailSuggestion, setEmailSuggestion] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  
  const navigate = useNavigate();
  const { signup, signInWithGoogle, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Smart password strength analysis
  useEffect(() => {
    if (password) {
      const feedback = [];
      let strength = 0;

      // Length check
      if (password.length >= 8) {
        strength += 2;
      } else if (password.length >= 6) {
        strength += 1;
        feedback.push("Consider using at least 8 characters");
      } else {
        feedback.push("Password too short (minimum 6 characters)");
      }

      // Complexity checks
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        strength += 1;
      } else {
        feedback.push("Mix uppercase and lowercase letters");
      }

      if (/\d/.test(password)) {
        strength += 1;
      } else {
        feedback.push("Add some numbers");
      }

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength += 1;
      } else {
        feedback.push("Add special characters (!@#$...)");
      }

      // Common password check
      const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
      if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        strength = Math.max(0, strength - 2);
        feedback.push("Avoid common passwords");
      }

      setPasswordStrength(Math.min(5, strength));
      setPasswordFeedback(feedback);
    } else {
      setPasswordStrength(0);
      setPasswordFeedback([]);
    }
  }, [password]);

  // Smart email validation and suggestions
  useEffect(() => {
    if (email && email.includes('@')) {
      const domain = email.split('@')[1];
      if (domain && !domain.includes('.')) {
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const suggestion = commonDomains.find(d => d.startsWith(domain));
        if (suggestion) {
          setEmailSuggestion(`${email.split('@')[0]}@${suggestion}`);
        }
      } else {
        setEmailSuggestion("");
      }
    } else {
      setEmailSuggestion("");
    }
  }, [email]);

  // Smart username suggestions based on email
  useEffect(() => {
    if (email && email.includes('@') && !username) {
      const baseUsername = email.split('@')[0];
      const suggestions = [
        baseUsername,
        `${baseUsername}23`,
        `${baseUsername}_fan`,
        `hoops_${baseUsername}`,
        `${baseUsername}_2025`
      ].filter(suggestion => suggestion.length <= 20);
      
      setUsernameSuggestions(suggestions.slice(0, 3));
    } else {
      setUsernameSuggestions([]);
    }
  }, [email, username]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return '#dc3545';
    if (passwordStrength <= 3) return '#ffc107';
    return '#28a745';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Smart validation
    if (!username || !email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6 || password.length > 20) {
      setError("Password must be between 6-20 characters");
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      setIsLoading(false);
      return;
    }
    
    try {
      await signup(email, password, username);
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      
      // Smart error handling
      const errorMessage = err.message || "Signup failed";
      if (errorMessage.includes("email-already-in-use")) {
        setError("An account with this email already exists. Try logging in instead.");
      } else if (errorMessage.includes("weak-password")) {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (errorMessage.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      // Navigation happens automatically via useEffect
    } catch (err) {
      console.error("Google sign-up error:", err);
      setError("Google sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyEmailSuggestion = () => {
    if (emailSuggestion) {
      setEmail(emailSuggestion);
      setEmailSuggestion("");
    }
  };

  const applyUsernameSuggestion = (suggestion) => {
    setUsername(suggestion);
    setUsernameSuggestions([]);
  };

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="sign-up">
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
    <div className="sign-up">
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
            Join SportsChatPlus!
          </h2>
          <p style={{ 
            margin: '0 0 15px 0', 
            color: '#666',
            fontSize: '14px'
          }}>
            Create your account and dive into March Madness
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
            {error.includes("Try logging in instead") && (
              <div style={{ marginTop: '10px' }}>
                <Link to="/login" style={{ color: '#007bff', fontWeight: 'bold' }}>
                  Sign In →
                </Link>
              </div>
            )}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            🎉 Account created successfully! Welcome to SportsChatPlus!
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              Taking you to your dashboard...
            </div>
          </div>
        )}

        {/* Smart Email Suggestion */}
        {emailSuggestion && (
          <div style={{
            background: 'rgba(26, 115, 232, 0.1)',
            color: '#1a73e8',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '14px',
            cursor: 'pointer',
            border: '1px solid rgba(26, 115, 232, 0.2)'
          }} onClick={applyEmailSuggestion}>
            💡 Did you mean {emailSuggestion}? <small>(click to apply)</small>
          </div>
        )}

        {/* Username Suggestions */}
        {usernameSuggestions.length > 0 && (
          <div style={{
            background: 'rgba(40, 167, 69, 0.1)',
            color: '#28a745',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '14px',
            border: '1px solid rgba(40, 167, 69, 0.2)'
          }}>
            💡 Username suggestions:
            <div style={{ marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {usernameSuggestions.map((suggestion, index) => (
                <span
                  key={index}
                  onClick={() => applyUsernameSuggestion(suggestion)}
                  style={{
                    background: 'rgba(40, 167, 69, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Choose a username"
              disabled={isLoading}
              maxLength="20"
            />
          </div>
          
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
                placeholder="Create a strong password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <span 
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </span>
            </div>
            
            {/* Smart Password Strength Indicator */}
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '5px'
                }}>
                  <div style={{
                    flex: 1,
                    height: '4px',
                    background: '#e0e0e0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        height: '100%',
                        background: getPasswordStrengthColor(),
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: getPasswordStrengthColor(),
                    fontWeight: 'bold'
                  }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                
                {passwordFeedback.length > 0 && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    lineHeight: '1.3'
                  }}>
                    {passwordFeedback.slice(0, 2).map((tip, index) => (
                      <div key={index}>• {tip}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            className="primary-button"
            disabled={isLoading || passwordStrength < 2}
            style={{
              opacity: (isLoading || passwordStrength < 2) ? 0.7 : 1,
              cursor: (isLoading || passwordStrength < 2) ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <>
                <span style={{ opacity: 0.7 }}>Creating Account...</span>
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
              "🚀 Create Account"
            )}
          </button>
        </form>

        {/* Google Sign Up */}
        <div style={{ 
          margin: '15px 0', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          or
        </div>

        <button 
          onClick={handleGoogleSignUp}
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
          Sign up with Google
        </button>
        
        <div className="link-row">
          Already have an account? <Link to="/login" style={{ fontWeight: 'bold' }}>Sign In</Link>
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

export default SignupPage;