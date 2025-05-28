// src/contexts/ThemeContext.js
// Theme Context for SportsChatPlus
// Adds dark/light mode support to your existing design
// ====================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sportschatplus-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }
  }, []);

  // Apply theme to document (works with your existing CSS)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sportschatplus-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#f0f0f0';
    } else {
      // Create meta tag if it doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#1a1a1a' : '#f0f0f0';
      document.head.appendChild(meta);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const savedTheme = localStorage.getItem('sportschatplus-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } 
    // Legacy browser support
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};