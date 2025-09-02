'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { useUser } from '@/hooks/useUser';
import { FULL_MENU_ITEMS, LIMITED_MENU_ITEMS } from '@/constants/navigation';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();

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

  const hasTeams = user?.teams && user.teams.length > 0;
  const menuItems = hasTeams ? FULL_MENU_ITEMS : LIMITED_MENU_ITEMS;

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
          {userLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : user ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              {user.teams && user.teams.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Teams ({user.teams.length})
                  </p>
                  <div className="space-y-1">
                    {user.teams.slice(0, 2).map((team) => (
                      <div key={team.id} className="flex items-center text-xs">
                        <span className="w-2 h-2 bg-hop-gold rounded-full mr-2"></span>
                        <span className="text-gray-600 dark:text-gray-300 truncate">
                          {team.name}
                        </span>
                      </div>
                    ))}
                    {user.teams.length > 2 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                        +{user.teams.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <SignOutButton>
                <button className="inline-flex items-center text-xs hover:text-red-700 dark:hover:text-red-300 transition-colors">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-hop-gold hover:text-hop-gold/80 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}