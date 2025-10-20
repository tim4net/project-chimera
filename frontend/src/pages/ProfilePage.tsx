import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import CharacterManager from '../components/CharacterManager';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

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

  const handleCharacterSelect = (characterId: string) => {
    // Navigate to dashboard with selected character
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg flex items-center justify-center">
        <div className="bg-nuaibria-surface border-2 border-nuaibria-danger rounded-lg p-8 max-w-md text-center">
          <p className="text-nuaibria-text-primary">You are not logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg">
      {/* Header */}
      <header className="bg-nuaibria-surface/80 backdrop-blur-sm border-b-2 border-nuaibria-gold/30 shadow-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-display font-bold text-nuaibria-gold drop-shadow-lg">
                Nuaibria
              </h1>
              <span className="text-nuaibria-border">|</span>
              <span className="text-nuaibria-text-primary font-semibold">Profile</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-nuaibria-arcane hover:bg-nuaibria-arcane/80 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Back to Game
              </button>
              <button
                onClick={handleLogout}
                className="bg-nuaibria-danger hover:bg-nuaibria-danger/80 text-white font-semibold py-2 px-4 rounded-lg transition-all hover:shadow-glow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Account Info */}
          <div className="bg-nuaibria-surface border-2 border-nuaibria-arcane/20 rounded-lg p-6">
            <h2 className="text-xl font-display font-bold text-nuaibria-arcane mb-4">Account Information</h2>
            <div className="space-y-2 text-nuaibria-text-secondary">
              <p><span className="font-semibold">Email:</span> {user.email}</p>
              <p><span className="font-semibold">User ID:</span> <span className="font-mono text-xs text-nuaibria-text-muted">{user.id}</span></p>
            </div>
          </div>

          {/* Character Manager */}
          <CharacterManager
            currentCharacterId={undefined}
            onCharacterSelect={handleCharacterSelect}
          />

          {/* Future: Settings, preferences, etc. */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
