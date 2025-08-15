'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/teams', label: 'Team Standings', icon: '📊' },
    { href: '/awards', label: 'Awards', icon: '🏆' }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="hamburger-button"
        aria-label="Navigation menu"
        aria-expanded={isOpen}
      >
        <div className={`hamburger-line ${isOpen ? 'hamburger-line-top-open' : ''}`}></div>
        <div className={`hamburger-line ${isOpen ? 'hamburger-line-middle-open' : ''}`}></div>
        <div className={`hamburger-line ${isOpen ? 'hamburger-line-bottom-open' : ''}`}></div>
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div className="hamburger-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Menu Content */}
      <div className={`hamburger-menu ${isOpen ? 'hamburger-menu-open' : ''}`}>
        <div className="hamburger-menu-header">
          <h3 className="hamburger-menu-title">🍺 Navigation</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="hamburger-close-button"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="hamburger-menu-nav">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hamburger-menu-item ${pathname === item.href ? 'hamburger-menu-item-active' : ''}`}
            >
              <span className="hamburger-menu-icon">{item.icon}</span>
              <span className="hamburger-menu-label">{item.label}</span>
              {pathname === item.href && (
                <span className="hamburger-menu-indicator">●</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hamburger-menu-footer">
          <p className="text-xs text-theme-secondary-text">
            Bine to Shrine Fantasy League
          </p>
        </div>
      </div>
    </div>
  );
}