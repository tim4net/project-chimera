import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';
import { supabase } from '../lib/supabase';
import AuthenticatedLayout from './AuthenticatedLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [validating, setValidating] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      if (!user) {
        setValidating(false);
        return;
      }

      try {
        // Verify session is still valid (not expired on server)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[ProtectedRoute] Session validation error:', error);
          setSessionValid(false);
          setValidating(false);
          return;
        }

        if (!session) {
          console.warn('[ProtectedRoute] Session expired, signing out');
          setSessionValid(false);
          await signOut();
        }

        setValidating(false);
      } catch (err) {
        console.error('[ProtectedRoute] Unexpected validation error:', err);
        setSessionValid(false);
        setValidating(false);
      }
    };

    if (!loading) {
      validateSession();
    }
  }, [user, loading, signOut]);

  // Show loading spinner while checking auth state or validating session
  if (loading || validating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-nuaibria-gold mx-auto mb-4 shadow-glow"></div>
          <p className="mt-4 text-nuaibria-text-primary font-display text-xl">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or session invalid
  if (!user || !sessionValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated with valid session, render the protected content
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

export default ProtectedRoute;
