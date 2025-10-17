import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';
import { supabase } from '../lib/supabase';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapData, setMapData] = useState<any>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);

  // Fetch character data
  useEffect(() => {
    const fetchCharacter = async () => {
      // ProtectedRoute already handles auth redirect, just wait for user
      if (!user) {
        setLoading(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No character found - redirect to character creation
            console.log('No character found for user, redirecting to creation');
            navigate('/create-character');
            return;
          }
          throw error;
        }

        setCharacter(data);

        // Fetch map data around character position
        if (data.campaign_seed) {
          fetchMapData(data.position_x, data.position_y, data.campaign_seed);
        }

        // Fetch journal entries
        fetchJournalEntries(data.id);
      } catch (err: any) {
        console.error('Error fetching character:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [user, navigate]);

  const fetchMapData = async (x: number, y: number, seed: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/world/${seed}/map?x=${x}&y=${y}&radius=5`
      );
      const data = await response.json();
      setMapData(data);
    } catch (err) {
      console.error('Error fetching map:', err);
    }
  };

  const fetchJournalEntries = async (characterId: string) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('character_id', characterId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (err) {
      console.error('Error fetching journal:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-100 text-xl">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 border-2 border-red-600 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-100 mb-4">Error</h2>
          <p className="text-red-200">{error}</p>
          <button
            onClick={() => navigate('/create-character')}
            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Character
          </button>
        </div>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-chimera-bg via-chimera-surface to-chimera-bg">
      {/* Header/Navigation */}
      <header className="bg-chimera-surface/80 backdrop-blur-sm border-b-2 border-chimera-gold/30 shadow-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-display font-bold text-chimera-gold drop-shadow-lg">
                Project Chimera
              </h1>
              <span className="text-chimera-border">|</span>
              <span className="text-chimera-text-primary font-semibold">{character.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-chimera-text-accent font-semibold">Level {character.level}</p>
                <p className="text-xs text-chimera-text-muted">{character.class}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-chimera-danger hover:bg-chimera-danger/80 text-white font-semibold py-2 px-4 rounded-lg transition-all hover:shadow-glow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Character Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Character Stats Card */}
            <div className="bg-chimera-surface border-2 border-chimera-gold/20 rounded-lg shadow-card-hover overflow-hidden hover:border-chimera-gold/40 transition-all">
              <div className="bg-gradient-to-r from-chimera-gold/20 via-chimera-ember/10 to-chimera-gold/20 px-6 py-4 border-b border-chimera-border">
                <h2 className="text-xl font-display font-bold text-chimera-gold">Character</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-chimera-text-secondary font-semibold">HP</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-chimera-bg rounded-full h-4 shadow-inner-dark border border-chimera-border">
                      <div
                        className="bg-gradient-to-r from-chimera-health to-chimera-ember h-4 rounded-full transition-all shadow-glow"
                        style={{ width: `${(character.hp_current / character.hp_max) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-chimera-text-primary font-mono font-bold text-sm min-w-[60px]">
                      {character.hp_current}/{character.hp_max}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-chimera-text-secondary font-semibold">XP</span>
                  <span className="text-chimera-text-accent font-bold font-mono">{character.xp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-chimera-text-secondary font-semibold">Position</span>
                  <span className="text-chimera-arcane font-mono text-sm font-semibold">
                    ({character.position_x}, {character.position_y})
                  </span>
                </div>
              </div>
            </div>

            {/* Idle Tasks Card */}
            <div className="bg-chimera-surface border-2 border-chimera-arcane/20 rounded-lg shadow-card-hover overflow-hidden hover:border-chimera-arcane/40 transition-all">
              <div className="bg-gradient-to-r from-chimera-arcane/20 via-chimera-poison/10 to-chimera-arcane/20 px-6 py-4 border-b border-chimera-border">
                <h2 className="text-xl font-display font-bold text-chimera-arcane">Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                {character.idle_task ? (
                  <div className="bg-chimera-elevated rounded-lg p-4 border border-chimera-gold/20 shadow-inner-dark">
                    <p className="text-chimera-gold font-semibold mb-2 font-display">Current Task</p>
                    <p className="text-chimera-text-primary text-sm leading-relaxed">{character.idle_task}</p>
                    <p className="text-chimera-text-muted text-xs mt-3 font-mono">
                      Started: {new Date(character.idle_task_started_at).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <>
                    <button className="w-full bg-gradient-to-r from-chimera-poison to-chimera-poison/80 hover:from-chimera-poison/90 hover:to-chimera-poison/70 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-glow hover:-translate-y-0.5">
                      Travel
                    </button>
                    <button className="w-full bg-gradient-to-r from-chimera-mana to-chimera-ice hover:from-chimera-mana/90 hover:to-chimera-ice/90 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-glow hover:-translate-y-0.5">
                      Scout Area
                    </button>
                    <button className="w-full bg-gradient-to-r from-chimera-arcane to-chimera-arcane/80 hover:from-chimera-arcane/90 hover:to-chimera-arcane/70 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-glow hover:-translate-y-0.5">
                      Rest
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Map */}
          <div className="lg:col-span-1">
            <div className="bg-chimera-surface border-2 border-chimera-ember/20 rounded-lg shadow-card-hover overflow-hidden hover:border-chimera-ember/40 transition-all">
              <div className="bg-gradient-to-r from-chimera-ember/20 via-chimera-gold/10 to-chimera-ember/20 px-6 py-4 border-b border-chimera-border">
                <h2 className="text-xl font-display font-bold text-chimera-ember">World Map</h2>
              </div>
              <div className="p-4">
                {mapData ? (
                  <div className="bg-gray-900 rounded p-4">
                    <div className="grid grid-cols-11 gap-1">
                      {mapData.tiles.map((tile: any, index: number) => {
                        const isPlayerTile = tile.x === character.position_x && tile.y === character.position_y;
                        const biomeColors: any = {
                          water: 'bg-blue-600',
                          plains: 'bg-green-600',
                          forest: 'bg-green-800',
                          mountains: 'bg-gray-600',
                          desert: 'bg-yellow-700'
                        };
                        return (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded ${biomeColors[tile.biome] || 'bg-gray-700'} ${
                              isPlayerTile ? 'ring-4 ring-amber-500' : ''
                            }`}
                            title={`${tile.biome} (${tile.x}, ${tile.y})`}
                          >
                            {isPlayerTile && (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                ●
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        <span className="text-gray-400">Water</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-600 rounded"></div>
                        <span className="text-gray-400">Plains</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-800 rounded"></div>
                        <span className="text-gray-400">Forest</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-600 rounded"></div>
                        <span className="text-gray-400">Mountain</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-700 rounded"></div>
                        <span className="text-gray-400">Desert</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded p-8 text-center">
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Journal */}
          <div className="lg:col-span-1">
            <div className="bg-chimera-surface border-2 border-chimera-gold/20 rounded-lg shadow-card-hover overflow-hidden hover:border-chimera-gold/40 transition-all">
              <div className="bg-gradient-to-r from-chimera-gold/20 via-chimera-ember/10 to-chimera-gold/20 px-6 py-4 border-b border-chimera-border">
                <h2 className="text-xl font-display font-bold text-chimera-gold">Journal</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {journalEntries.length > 0 ? (
                    journalEntries.map((entry: any) => (
                      <div key={entry.id} className="bg-chimera-elevated rounded-lg p-4 border-l-4 border-chimera-gold shadow-inner-dark hover:bg-chimera-elevated/80 transition-all animate-fade-in">
                        <p className="text-chimera-text-accent text-sm font-display font-semibold mb-2">
                          {entry.entry_type}
                        </p>
                        <p className="text-chimera-text-primary text-sm leading-relaxed">{entry.content}</p>
                        <p className="text-chimera-text-muted text-xs mt-3 font-mono">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-chimera-elevated rounded-lg p-8 text-center border border-chimera-border shadow-inner-dark">
                      <p className="text-chimera-text-secondary italic font-display text-lg mb-3">Your adventure begins...</p>
                      <p className="text-chimera-text-muted text-sm leading-relaxed">
                        Start by choosing an action to create your first journal entry.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
