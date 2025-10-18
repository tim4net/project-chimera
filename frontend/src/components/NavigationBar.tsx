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
    <nav className="sticky top-0 z-50 border-b border-chimera-border bg-chimera-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Left: Brand/Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chimera-gold via-chimera-ember to-chimera-gold p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-chimera-bg">
              <span className="font-display text-lg font-bold text-chimera-gold">N</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-tight text-chimera-gold group-hover:text-chimera-ember transition-colors">
              Nuaibria
            </span>
            <span className="text-xs text-chimera-text-muted">Project Chimera</span>
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
                    ? 'bg-chimera-elevated text-chimera-gold font-semibold'
                    : 'text-chimera-text-secondary hover:text-chimera-text-primary hover:bg-chimera-elevated/50'
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
            <span className="text-sm text-chimera-text-primary font-medium">
              {user?.email?.split('@')[0] || 'Adventurer'}
            </span>
            <span className="text-xs text-chimera-text-muted">Level 1</span>
          </div>
          <LogoutButton variant="minimal" />
        </div>
      </div>

      {/* Mobile Navigation (shown on small screens) */}
      <div className="flex md:hidden border-t border-chimera-border bg-chimera-bg/50 px-4 py-2 gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-chimera-elevated text-chimera-gold font-semibold'
                  : 'text-chimera-text-secondary hover:text-chimera-text-primary hover:bg-chimera-elevated/50'
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
