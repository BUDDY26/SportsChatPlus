// src/App.js
// SportsChatPlus - Complete App with LoginPage
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';         // ← Now ready    
import DashboardPage from './pages/DashboardPage';   // ← Now ready
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // ← Now ready
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
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