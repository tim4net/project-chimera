import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * OAuth callback handler
 * Supabase automatically handles the code exchange for session,
 * we just need to redirect the user after it's complete
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AuthCallback] Processing OAuth callback');

      // Check if we have a session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthCallback] Error getting session:', error);
        navigate('/login?error=auth_failed');
        return;
      }

      if (session) {
        console.log('[AuthCallback] Session established for:', session.user.email);
        // Redirect to dashboard
        navigate('/', { replace: true });
      } else {
        console.log('[AuthCallback] No session found, redirecting to login');
        navigate('/login');
      }
    };

    // Small delay to ensure Supabase has processed the callback
    const timer = setTimeout(handleCallback, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-chimera-bg via-chimera-surface to-chimera-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-chimera-gold mx-auto mb-4 shadow-glow"></div>
        <p className="text-chimera-text-primary font-display text-xl">Completing sign in...</p>
        <p className="text-chimera-text-muted text-sm mt-2">Please wait</p>
      </div>
    </div>
  );
};

export default AuthCallback;
