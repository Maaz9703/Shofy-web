import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const lightTheme = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  border: '#e5e5e5',
  error: '#ef4444',
  success: '#22c55e',
};

const darkTheme = {
  background: '#0f0f1a',
  card: '#1a1a2e',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  primary: '#818cf8',
  primaryDark: '#6366f1',
  border: '#2d2d44',
  error: '#f87171',
  success: '#4ade80',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => setIsDark((prev) => !prev);

  const value = {
    theme,
    isDark,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
