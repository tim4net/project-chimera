import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type {
  AuthChangeEvent,
  AuthError,
  Provider,
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User
} from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type PasswordSignInResult = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
type OAuthSignInResult = Awaited<ReturnType<typeof supabase.auth.signInWithOAuth>>;
type SignInResult = PasswordSignInResult | OAuthSignInResult;
type SignUpResult = Awaited<ReturnType<typeof supabase.auth.signUp>>;
type SignOutResult = Awaited<ReturnType<typeof supabase.auth.signOut>>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  clearError: () => void;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<SignUpResult>;
  signIn: (credentials: SignInWithPasswordCredentials | { provider: Provider }) => Promise<SignInResult>;
  signOut: () => Promise<SignOutResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Get initial session from storage (fast, no network call)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          console.error('[AuthProvider] Session check failed:', sessionError);
          setError(sessionError);
        }

        // Session loaded successfully
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error('[AuthProvider] Session check threw:', err);
        if (isMounted) {
          setUser(null);
          setError(err as AuthError);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener (runs once, no re-subscriptions)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;

        // Reduced logging - only errors logged elsewhere
        // Handle different auth events
        if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
          setError(null);
        } else if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
          setError(null);
        } else {
          // Handle any other events
          setUser(session?.user ?? null);
        }

        // Mark as loaded after first auth event
        if (loading) {
          setLoading(false);
        }
      }
    );

    // Initialize authentication
    initAuth();

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array - runs once, no re-subscriptions

  const signUp: AuthContextType['signUp'] = async (credentials) => {
    setError(null);
    try {
      const result = await supabase.auth.signUp(credentials);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const signIn: AuthContextType['signIn'] = async (credentials) => {
    setError(null);
    try {
      if ('provider' in credentials) {
        // Starting OAuth flow
        const result = await supabase.auth.signInWithOAuth({
          provider: credentials.provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            skipBrowserRedirect: false,
          }
        });
        if (result.error) {
          setError(result.error);
        }
        return result;
      }

      const result = await supabase.auth.signInWithPassword(credentials);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const signOut: AuthContextType['signOut'] = async () => {
    setError(null);
    try {
      const result = await supabase.auth.signOut();
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    signUp,
    signIn,
    signOut,
    user,
    session: null, // TODO: Track session state properly
    loading,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
