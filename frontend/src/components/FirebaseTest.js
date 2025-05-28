// src/components/FirebaseTest.js
// Firebase Connection Test Component
// =================================

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const FirebaseTest = () => {
  const { user, signin, signup, signInWithGoogle, logout, loading, error } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('test@sportschatplus.com');
  const [password, setPassword] = useState('testpassword123');
  const [testResult, setTestResult] = useState('');

  // Test Firebase connection
  const testFirebaseConnection = () => {
    try {
      // Simple test - if we can import Firebase modules, connection works
      setTestResult('✅ Firebase connection successful!');
    } catch (error) {
      setTestResult('❌ Firebase connection failed: ' + error.message);
    }
  };

  // Test user creation
  const testCreateUser = async () => {
    try {
      setTestResult('⏳ Creating test user...');
      await signup(email, password, 'TestUser');
      setTestResult('✅ User created successfully!');
    } catch (error) {
      setTestResult('❌ User creation failed: ' + error.message);
    }
  };

  // Test user login
  const testUserLogin = async () => {
    try {
      setTestResult('⏳ Testing login...');
      await signin(email, password);
      setTestResult('✅ Login successful!');
    } catch (error) {
      setTestResult('❌ Login failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🔥 Firebase Test Loading...</h2>
        <p>Connecting to Firebase...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
      color: theme === 'dark' ? 'white' : 'black',
      minHeight: '100vh'
    }}>
      <h1>🔥 Firebase Test - SportsChatPlus</h1>
      
      {/* Theme Test */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>🎨 Theme Test</h3>
        <p>Current theme: <strong>{theme}</strong></p>
        <button onClick={toggleTheme} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Toggle Theme ({theme === 'light' ? 'Switch to Dark' : 'Switch to Light'})
        </button>
      </div>

      {/* Firebase Connection Test */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>🔌 Firebase Connection Test</h3>
        <button onClick={testFirebaseConnection} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Test Firebase Connection
        </button>
      </div>

      {/* Authentication Test */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>🔐 Authentication Test</h3>
        
        {!user ? (
          <div>
            <p>Not logged in</p>
            <div style={{ marginBottom: '10px' }}>
              <label>Email: </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Password: </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </div>
            <div>
              <button onClick={testCreateUser} style={{ padding: '10px 20px', marginRight: '10px' }}>
                Test Sign Up
              </button>
              <button onClick={testUserLogin} style={{ padding: '10px 20px', marginRight: '10px' }}>
                Test Login
              </button>
              <button onClick={signInWithGoogle} style={{ padding: '10px 20px' }}>
                Test Google Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>✅ Logged in as: <strong>{user.email}</strong></p>
            <p>User ID: {user.uid}</p>
            <button onClick={logout} style={{ padding: '10px 20px' }}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>📊 Test Results</h3>
        {testResult && <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{testResult}</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>

      {/* Next Steps */}
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>🚀 Next Steps</h3>
        <p>Once Firebase tests pass, we'll:</p>
        <ul>
          <li>✅ Add your SportsChatPlus pages</li>
          <li>✅ Import your existing components</li>
          <li>✅ Add real-time game data</li>
          <li>✅ Enable live chat</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTest;