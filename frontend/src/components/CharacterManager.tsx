/**
 * @file Character Manager - Manage multiple characters (create, delete, switch)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hp_current: number;
  hp_max: number;
  xp: number;
  created_at: string;
}

interface CharacterManagerProps {
  currentCharacterId?: string;
  onCharacterSelect: (characterId: string) => void;
}

const CharacterManager = ({ currentCharacterId, onCharacterSelect }: CharacterManagerProps) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('characters')
      .select('id, name, race, class, level, hp_current, hp_max, xp, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching characters:', error);
    } else {
      setCharacters(data as Character[] || []);
    }
    setLoading(false);
  };

  const handleDelete = async (characterId: string, characterName: string) => {
    if (!confirm(`Are you sure you want to delete ${characterName}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(characterId);

    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;

      // Refresh list
      await fetchCharacters();

      // If deleted current character, redirect to character creation
      if (characterId === currentCharacterId) {
        navigate('/create-character');
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      alert('Failed to delete character. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateNew = () => {
    navigate('/create-character');
  };

  if (loading) {
    return (
      <div className="bg-nuaibria-surface border-2 border-nuaibria-gold/20 rounded-lg p-6">
        <p className="text-nuaibria-text-muted">Loading characters...</p>
      </div>
    );
  }

  return (
    <div className="bg-nuaibria-surface border-2 border-nuaibria-gold/20 rounded-lg shadow-card-hover overflow-hidden">
      <div className="bg-gradient-to-r from-nuaibria-gold/20 via-nuaibria-ember/10 to-nuaibria-gold/20 px-6 py-4 border-b border-nuaibria-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-nuaibria-gold">Your Characters</h2>
          <button
            onClick={handleCreateNew}
            className="bg-nuaibria-gold hover:bg-nuaibria-gold/80 text-nuaibria-bg font-semibold py-2 px-4 rounded-lg transition-all hover:shadow-glow text-sm"
          >
            + New Character
          </button>
        </div>
      </div>

      <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {characters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-nuaibria-text-muted mb-4">You don't have any characters yet.</p>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-glow"
            >
              Create Your First Character
            </button>
          </div>
        ) : (
          characters.map((char) => {
            const isCurrent = char.id === currentCharacterId;
            const isDeleting = deleting === char.id;

            return (
              <div
                key={char.id}
                className={`bg-nuaibria-elevated border-2 rounded-lg p-4 transition-all ${
                  isCurrent
                    ? 'border-nuaibria-gold shadow-glow'
                    : 'border-nuaibria-border hover:border-nuaibria-gold/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Character info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold text-nuaibria-gold">{char.name}</h3>
                      {isCurrent && (
                        <span className="bg-nuaibria-gold/20 text-nuaibria-gold text-xs font-semibold px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-nuaibria-text-secondary space-y-1">
                      <p>{char.race} {char.class} - Level {char.level}</p>
                      <div className="flex items-center space-x-4 text-xs text-nuaibria-text-muted">
                        <span>HP: {char.hp_current}/{char.hp_max}</span>
                        <span>XP: {char.xp}</span>
                      </div>
                      <p className="text-xs text-nuaibria-text-muted">
                        Created: {new Date(char.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {!isCurrent && (
                      <button
                        onClick={() => onCharacterSelect(char.id)}
                        className="bg-nuaibria-poison hover:bg-nuaibria-poison/80 text-white font-semibold py-2 px-4 rounded transition-all text-sm whitespace-nowrap"
                      >
                        Switch
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(char.id, char.name)}
                      disabled={isDeleting}
                      className="bg-nuaibria-danger hover:bg-nuaibria-danger/80 text-white font-semibold py-2 px-4 rounded transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CharacterManager;
