'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type ThemeMode = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const { themeMode, actualTheme, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (mode: ThemeMode, isButton = false) => {
    const displayMode = isButton ? (themeMode === 'system' ? actualTheme : themeMode) : mode;
    
    if (mode === 'light' || displayMode === 'light') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (mode === 'dark' || displayMode === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    } else {
      // System icon - simple monitor icon
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  const getLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-toggle flex items-center space-x-2"
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        {getIcon(themeMode, true)}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleThemeSelect(mode)}
              className={`theme-dropdown-item ${themeMode === mode ? 'active' : ''}`}
            >
              {getIcon(mode)}
              <span>{getLabel(mode)}</span>
              {mode === 'system' && (
                <span className="system-indicator">
                  ({actualTheme})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}