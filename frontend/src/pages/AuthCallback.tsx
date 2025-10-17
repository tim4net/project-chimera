import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * OAuth callback handler
 * Parse OAuth tokens from URL hash and establish session
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    console.log('[AuthCallback] Mounted - waiting for Supabase to process OAuth hash');

    // For implicit flow (hash-based OAuth), Supabase automatically
    // processes the hash and fires onAuthStateChange. We just need to
    // listen for that event and redirect when ready.

    let redirectTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const checkAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('[AuthCallback] ✓ Session found for:', session.user.email);
        console.log('[AuthCallback] Redirecting to dashboard...');
        navigate('/', { replace: true });
      } else {
        console.log('[AuthCallback] No session yet, waiting for auth state change...');
      }
    };

    // Check immediately
    checkAndRedirect();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthCallback] Auth state change:', event);

        if (event === 'SIGNED_IN' && session) {
          console.log('[AuthCallback] ✓ SIGNED_IN event received for:', session.user.email);

          // Clear timeout
          if (timeoutTimer) clearTimeout(timeoutTimer);

          // Redirect after brief delay
          redirectTimer = setTimeout(() => {
            console.log('[AuthCallback] Redirecting to dashboard');
            navigate('/', { replace: true });
          }, 500);
        }
      }
    );

    // Timeout after 10 seconds
    timeoutTimer = setTimeout(() => {
      console.error('[AuthCallback] Timeout - no SIGNED_IN event received');
      setError('Authentication timed out');
      navigate('/login?error=timeout');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      if (redirectTimer) clearTimeout(redirectTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-chimera-bg via-chimera-surface to-chimera-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-chimera-gold mx-auto mb-4 shadow-glow"></div>
        <p className="text-chimera-text-primary font-display text-xl">
          {error ? 'Authentication failed' : 'Completing sign in...'}
        </p>
        <p className="text-chimera-text-muted text-sm mt-2">
          {error || 'Please wait'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
