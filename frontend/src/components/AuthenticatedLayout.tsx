import React from 'react';
import NavigationBar from './NavigationBar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for authenticated pages
 * Includes navigation bar at the top
 */
const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-chimera-bg">
      <NavigationBar />
      <main>{children}</main>
    </div>
  );
};

export default AuthenticatedLayout;
