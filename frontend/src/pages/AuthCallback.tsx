import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * OAuth callback handler
 * Just redirect to dashboard - Supabase handles session automatically
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[AuthCallback] OAuth callback received, redirecting to dashboard');

    // Supabase automatically processes the OAuth hash and sets up the session
    // The AuthProvider's onAuthStateChange will pick it up
    // Just redirect to dashboard immediately
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-chimera-bg via-chimera-surface to-chimera-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-chimera-gold mx-auto mb-4 shadow-glow"></div>
        <p className="text-chimera-text-primary font-display text-xl">
          Completing sign in...
        </p>
        <p className="text-chimera-text-muted text-sm mt-2">
          Please wait
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
