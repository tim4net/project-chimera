import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type {
  AuthChangeEvent,
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
  loading: boolean;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<SignUpResult>;
  signIn: (credentials: SignInWithPasswordCredentials | { provider: Provider }) => Promise<SignInResult>;
  signOut: () => Promise<SignOutResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Aggressive fallback: if still loading after 5 seconds, assume no user and continue
    const emergencyTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('[AuthProvider] Emergency timeout - forcing loading to complete');
        setLoading(false);
        setUser(null);
      }
    }, 5000);

    const fetchUser = async () => {
      try {
        console.log('[AuthProvider] Starting session check...');

        // Use getSession instead of getUser - it's faster and doesn't make network call
        const { data, error } = await supabase.auth.getSession();

        clearTimeout(emergencyTimeout);

        if (!isMounted) return;
        if (error) {
          console.error('[AuthProvider] Initial session check failed:', error);
          setUser(null);
        } else {
          console.log('[AuthProvider] Initial session check success:', data.session?.user?.email ?? 'No user');
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('[AuthProvider] Initial session check threw:', error);
        setUser(null);
      } finally {
        if (isMounted) {
          clearTimeout(emergencyTimeout);
          console.log('[AuthProvider] Setting loading to false');
          setLoading(false);
        }
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('[AuthProvider] Auth state changed:', event, 'User:', session?.user?.email ?? 'No user');
        // Directly use the session user from the event instead of fetching again
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextType['signUp'] = (credentials) => supabase.auth.signUp(credentials);

  const signIn: AuthContextType['signIn'] = (credentials) => {
    if ('provider' in credentials) {
      console.log('[AuthProvider] Starting OAuth flow with provider:', credentials.provider);
      return supabase.auth.signInWithOAuth({
        provider: credentials.provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    }
    return supabase.auth.signInWithPassword(credentials);
  };

  const value: AuthContextType = {
    signUp,
    signIn,
    signOut: () => supabase.auth.signOut(),
    user,
    loading,
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
