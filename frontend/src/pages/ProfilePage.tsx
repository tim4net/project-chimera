import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import LogoutButton from '../components/LogoutButton';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
        return;
      }
      setUser(data.user ?? null);
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p>You are not logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
        <p className="text-center mb-6">Email: {user.email}</p>
        <div className="flex items-center justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
