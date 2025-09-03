'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '@/types/common';
type ActualTheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  actualTheme: ActualTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [actualTheme, setActualTheme] = useState<ActualTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Function to get system preference
  const getSystemTheme = (): ActualTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  // Function to determine actual theme based on mode
  const determineActualTheme = (mode: ThemeMode): ActualTheme => {
    if (mode === 'system') {
      return getSystemTheme();
    }
    return mode as ActualTheme;
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    const initialMode = savedMode || 'system';
    
    setThemeModeState(initialMode);
    setActualTheme(determineActualTheme(initialMode));
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (themeMode === 'system') {
        setActualTheme(getSystemTheme());
      }
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode]);

  // Apply actual theme to document
  useEffect(() => {
    if (!mounted) return;
    
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [actualTheme, mounted]);

  // Save theme mode preference
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode, mounted]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setActualTheme(determineActualTheme(mode));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, actualTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}