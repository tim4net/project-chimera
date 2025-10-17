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

    const handleCallback = async () => {
      console.log('[AuthCallback] Processing OAuth callback');
      console.log('[AuthCallback] Current URL:', window.location.href);

      try {
        // The auth tokens are in the URL hash fragment
        // Supabase's onAuthStateChange listener should pick this up automatically
        // But we need to explicitly parse the hash for implicit flow

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('[AuthCallback] Tokens found:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        if (accessToken) {
          console.log('[AuthCallback] Calling setSession...');

          // Set the session using the tokens from the URL with timeout
          const sessionPromise = supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          // Add 5 second timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('setSession timeout')), 5000)
          );

          const { data, error: sessionError } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;

          console.log('[AuthCallback] setSession response:', {
            hasData: !!data,
            hasUser: !!data?.user,
            error: sessionError
          });

          if (sessionError) {
            console.error('[AuthCallback] Error setting session:', sessionError);
            setError(sessionError.message);
            setTimeout(() => navigate('/login?error=session_failed'), 2000);
            return;
          }

          if (!data?.user) {
            console.error('[AuthCallback] No user in session data');
            setError('Failed to establish user session');
            setTimeout(() => navigate('/login?error=no_user'), 2000);
            return;
          }

          console.log('[AuthCallback] ✓ Session established for:', data.user.email);

          // Give AuthProvider time to update
          setTimeout(() => {
            console.log('[AuthCallback] Redirecting to dashboard');
            navigate('/', { replace: true });
          }, 500);
        } else {
          console.error('[AuthCallback] No access token in URL');
          setError('No authentication token received');
          setTimeout(() => navigate('/login?error=no_token'), 2000);
        }
      } catch (err: any) {
        console.error('[AuthCallback] Unexpected error:', err);
        setError(err.message);
        setTimeout(() => navigate('/login?error=unexpected'), 2000);
      }
    };

    handleCallback();
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
