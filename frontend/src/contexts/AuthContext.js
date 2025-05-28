// src/contexts/AuthContext.js
// Authentication Context for SportsChatPlus
// Replaces your existing API authentication with Firebase
// ======================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase-config';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create user profile in Firestore (replaces your API user creation)
  const createUserProfile = async (user, additionalData = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        const { displayName, email, photoURL } = user;
        
        await setDoc(userRef, {
          displayName: displayName || '',
          email,
          photoURL: photoURL || '',
          username: additionalData.username || displayName || email.split('@')[0],
          role: 'user',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          isActive: true,
          preferences: {
            theme: 'light',
            notifications: true,
            favoriteTeams: []
          },
          ...additionalData
        });
      } else {
        // Update last login time
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp()
        });
      }

      // Fetch and set user profile
      const updatedSnapshot = await getDoc(userRef);
      setUserProfile(updatedSnapshot.data());
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Sign up (replaces your signup API call)
  const signup = async (email, password, username = '') => {
    try {
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if username provided
      if (username) {
        await updateProfile(result.user, {
          displayName: username
        });
      }
      
      // Create user profile in Firestore
      await createUserProfile(result.user, { username });
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in (replaces your login API call)
  const signin = async (email, password) => {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google (new feature!)
  const signInWithGoogle = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign out (replaces your logout API call)
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      // Clear localStorage (like your current logout)
      localStorage.removeItem("user");
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password (enhances your ForgotPasswordPage)
  const resetPassword = async (email) => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setError('');
      if (!user) throw new Error('No user logged in');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Auth state listener (replaces your localStorage checks)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          // Fetch user profile from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userRef);
          
          if (userSnapshot.exists()) {
            setUserProfile(userSnapshot.data());
            // Keep localStorage for compatibility with your existing code
            localStorage.setItem("user", JSON.stringify({
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                username: userSnapshot.data().username
              }
            }));
          } else {
            // Create profile if it doesn't exist
            await createUserProfile(user);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    error,
    signup,
    signin,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    clearError: () => setError('')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};