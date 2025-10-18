import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

interface LogoutButtonProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

/**
 * Reusable logout button component
 * Handles sign out and redirects to login page
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({ variant = 'default', className = '' }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('[LogoutButton] Sign out failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-chimera-text-secondary hover:text-chimera-ember transition-colors duration-200 ${className}`}
        title="Sign Out"
      >
        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`px-4 py-2 bg-chimera-surface border border-chimera-border hover:border-chimera-ember
                  text-chimera-text-secondary hover:text-chimera-ember rounded-lg
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoggingOut ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing out...
        </span>
      ) : (
        'Sign Out'
      )}
    </button>
  );
};

export default LogoutButton;
