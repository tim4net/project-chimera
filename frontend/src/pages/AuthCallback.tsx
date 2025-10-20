import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * OAuth callback handler - event-driven approach
 * Waits for session to be confirmed before redirecting
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let checkCount = 0;
    const MAX_CHECKS = 50; // 5 seconds max (50 * 100ms)

    const checkSession = async () => {
      if (!isMounted || checkCount >= MAX_CHECKS) {
        if (checkCount >= MAX_CHECKS) {
          console.error('[AuthCallback] Timeout waiting for session');
          setError('Authentication timeout. Please try again.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
        return;
      }

      checkCount++;

      try {
        // Check if session is ready
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        if (session) {
          console.log('[AuthCallback] Session confirmed for:', session.user.email);
          // Session is ready, redirect to dashboard
          if (isMounted) {
            navigate('/', { replace: true });
          }
          return;
        }

        // Session not ready yet, check again
        if (isMounted) {
          setTimeout(checkSession, 100);
        }
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setError('An unexpected error occurred');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    console.log('[AuthCallback] OAuth callback received, waiting for session confirmation');
    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-nuaibria-text-primary font-display text-xl mb-2">
            Authentication Error
          </p>
          <p className="text-nuaibria-text-muted text-sm">
            {error}
          </p>
          <p className="text-nuaibria-text-muted text-xs mt-2">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-nuaibria-gold mx-auto mb-4 shadow-glow"></div>
        <p className="text-nuaibria-text-primary font-display text-xl">
          Completing sign in...
        </p>
        <p className="text-nuaibria-text-muted text-sm mt-2">
          Please wait
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
