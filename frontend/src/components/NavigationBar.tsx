import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import LogoutButton from './LogoutButton';

/**
 * Consistent navigation bar for all authenticated pages
 * Shows current page, navigation links, and logout button
 */
const NavigationBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/create-character', label: 'Create Character' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-nuaibria-border bg-nuaibria-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Left: Brand/Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-nuaibria-gold via-nuaibria-ember to-nuaibria-gold p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-nuaibria-bg">
              <span className="font-display text-lg font-bold text-nuaibria-gold">N</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-tight text-nuaibria-gold group-hover:text-nuaibria-ember transition-colors">
              Nuaibria
            </span>
            <span className="text-xs text-nuaibria-text-muted">Nuaibria</span>
          </div>
        </Link>

        {/* Center: Navigation Links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-nuaibria-elevated text-nuaibria-gold font-semibold'
                    : 'text-nuaibria-text-secondary hover:text-nuaibria-text-primary hover:bg-nuaibria-elevated/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-nuaibria-text-primary font-medium">
              {user?.email?.split('@')[0] || 'Adventurer'}
            </span>
            <span className="text-xs text-nuaibria-text-muted">Level 1</span>
          </div>
          <LogoutButton variant="minimal" />
        </div>
      </div>

      {/* Mobile Navigation (shown on small screens) */}
      <div className="flex md:hidden border-t border-nuaibria-border bg-nuaibria-bg/50 px-4 py-2 gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-nuaibria-elevated text-nuaibria-gold font-semibold'
                  : 'text-nuaibria-text-secondary hover:text-nuaibria-text-primary hover:bg-nuaibria-elevated/50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBar;
