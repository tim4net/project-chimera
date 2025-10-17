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
      // Check if user is authenticated
      if (!user) {
        navigate('/login');
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
            // No character found
            setError('No character found. Please create a character.');
            setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header/Navigation */}
      <header className="bg-gray-900 border-b-2 border-amber-600 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-amber-500">Project Chimera</h1>
              <span className="text-gray-400">|</span>
              <span className="text-amber-100 font-semibold">{character.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Level {character.level}</p>
                <p className="text-xs text-gray-500">{character.class}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded transition"
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
            <div className="bg-gray-800 border-2 border-amber-700 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-3">
                <h2 className="text-xl font-bold text-white">Character</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">HP</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-red-600 h-4 rounded-full transition-all"
                        style={{ width: `${(character.hp_current / character.hp_max) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-amber-100 font-semibold text-sm">
                      {character.hp_current}/{character.hp_max}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">XP</span>
                  <span className="text-amber-100 font-semibold">{character.xp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Position</span>
                  <span className="text-amber-100 font-mono text-sm">
                    ({character.position_x}, {character.position_y})
                  </span>
                </div>
              </div>
            </div>

            {/* Idle Tasks Card */}
            <div className="bg-gray-800 border-2 border-amber-700 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-3">
                <h2 className="text-xl font-bold text-white">Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                {character.idle_task ? (
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-amber-100 font-semibold mb-1">Current Task</p>
                    <p className="text-gray-300 text-sm">{character.idle_task}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Started: {new Date(character.idle_task_started_at).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <>
                    <button className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded transition">
                      Travel
                    </button>
                    <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded transition">
                      Scout Area
                    </button>
                    <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 px-4 rounded transition">
                      Rest
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Map */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border-2 border-amber-700 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-3">
                <h2 className="text-xl font-bold text-white">World Map</h2>
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
            <div className="bg-gray-800 border-2 border-amber-700 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-3">
                <h2 className="text-xl font-bold text-white">Journal</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {journalEntries.length > 0 ? (
                    journalEntries.map((entry: any) => (
                      <div key={entry.id} className="bg-gray-700 rounded p-3 border-l-4 border-amber-600">
                        <p className="text-amber-100 text-sm font-semibold mb-1">
                          {entry.entry_type}
                        </p>
                        <p className="text-gray-300 text-sm">{entry.content}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-700 rounded p-4 text-center">
                      <p className="text-gray-400 italic">Your adventure begins...</p>
                      <p className="text-gray-500 text-sm mt-2">
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
