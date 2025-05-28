// src/App.js
// SportsChatPlus - Simplified Routing (Only Working Routes)
// =========================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';           // ← Uncomment when ready
// import SignupPage from './pages/SignupPage';         // ← Uncomment when ready  
// import DashboardPage from './pages/DashboardPage';   // ← Uncomment when ready
// import ForgotPasswordPage from './pages/ForgotPasswordPage'; // ← Uncomment when ready
import './App.css';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Working Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              
              {/* Temporary placeholders for missing pages */}
              <Route path="/login" element={
                <div style={{padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '8px'}}>
                    <h2>🏀 Login Page</h2>
                    <p>Coming soon...</p>
                    <a href="/" style={{color: '#007bff', textDecoration: 'none', fontSize: '16px'}}>← Back to Home</a>
                  </div>
                </div>
              } />
              
              <Route path="/signup" element={
                <div style={{padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '8px'}}>
                    <h2>🏀 Sign Up Page</h2>
                    <p>Coming soon...</p>
                    <a href="/" style={{color: '#007bff', textDecoration: 'none', fontSize: '16px'}}>← Back to Home</a>
                  </div>
                </div>
              } />
              
              <Route path="/dashboard" element={
                <div style={{padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '8px'}}>
                    <h2>🏀 Dashboard</h2>
                    <p>Coming soon...</p>
                    <a href="/" style={{color: '#007bff', textDecoration: 'none', fontSize: '16px'}}>← Back to Home</a>
                  </div>
                </div>
              } />
              
              {/* Simple placeholder routes */}
              <Route path="/terms" element={
                <div style={{padding: '20px', textAlign: 'center'}}>
                  <h2>Terms of Service</h2>
                  <p>Coming soon...</p>
                  <a href="/">← Back to Home</a>
                </div>
              } />
              
              <Route path="/privacy" element={
                <div style={{padding: '20px', textAlign: 'center'}}>
                  <h2>Privacy Policy</h2>
                  <p>Coming soon...</p>
                  <a href="/">← Back to Home</a>
                </div>
              } />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;