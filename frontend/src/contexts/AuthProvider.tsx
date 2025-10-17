import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  signUp: (data: any) => Promise<any>;
  signIn: (data: any) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => {
      // Check if it's OAuth or password sign-in
      if (data.provider) {
        return supabase.auth.signInWithOAuth({
          provider: data.provider,
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });
      }
      return supabase.auth.signInWithPassword(data);
    },
    signOut: () => supabase.auth.signOut(),
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};