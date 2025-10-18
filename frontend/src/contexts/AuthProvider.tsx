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

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (error) {
          console.error('[AuthProvider] Initial user fetch failed:', error);
          setUser(null);
        } else {
          console.log('[AuthProvider] Initial user fetch:', data.user?.email ?? 'No user');
          setUser(data.user ?? null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('[AuthProvider] Initial user fetch threw:', error);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[AuthProvider] Auth state changed:', event, 'User:', session?.user?.email ?? 'No user');
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error) {
            console.error('[AuthProvider] Auth state refresh failed:', error);
            setUser(null);
            return;
          }
          setUser(data.user ?? null);
        } catch (error) {
          console.error('[AuthProvider] Auth state handler threw:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
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
