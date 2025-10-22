import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';
import { supabase } from '../lib/supabase';
import ChatInterface, { type ChatInterfaceRef } from '../components/ChatInterface';
import QuestPanel from '../components/QuestPanel';
import TensionBadge from '../components/TensionBadge';
import IdleTaskPanel from '../components/IdleTaskPanel';
import PartyPanel from '../components/PartyPanel';
import StrategicMap from '../components/StrategicMap';
import TownApproachingLoader from '../components/TownApproachingLoader';
import TravelPanel from '../components/TravelPanel';
import type { DmApiResponse } from '../types';

type CharacterRecord = {
  id: string;
  user_id: string;
  name: string;
  class: string;
  subclass?: string | null;
  level: number;
  hp_current: number;
  hp_max: number;
  xp: number;
  position_x: number;
  position_y: number;
  campaign_seed: string | null;
  idle_task: string | null;
  idle_task_started_at: string | null;
};

type MapTile = {
  x: number;
  y: number;
  biome: string;
};

type MapData = {
  tiles: MapTile[];
};

type JournalEntry = {
  id: string;
  entry_type: string;
  content: string;
  created_at: string;
};

const toCharacterRecord = (value: unknown): CharacterRecord | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : null;
  const userId = typeof record.user_id === 'string' ? record.user_id : null;
  const name = typeof record.name === 'string' ? record.name : null;
  const klass = typeof record.class === 'string' ? record.class : null;
  const level = typeof record.level === 'number' ? record.level : null;
  const hpCurrent = typeof record.hp_current === 'number' ? record.hp_current : null;
  const hpMax = typeof record.hp_max === 'number' ? record.hp_max : null;
  const xp = typeof record.xp === 'number' ? record.xp : null;
  const posX = typeof record.position_x === 'number' ? record.position_x : null;
  const posY = typeof record.position_y === 'number' ? record.position_y : null;
  if (
    !id ||
    !userId ||
    name === null ||
    klass === null ||
    level === null ||
    hpCurrent === null ||
    hpMax === null ||
    xp === null ||
    posX === null ||
    posY === null
  ) {
    return null;
  }
  return {
    id,
    user_id: userId,
    name,
    class: klass,
    subclass: typeof record.subclass === 'string' ? record.subclass : null,
    level,
    hp_current: hpCurrent,
    hp_max: hpMax,
    xp,
    position_x: posX,
    position_y: posY,
    campaign_seed: typeof record.campaign_seed === 'string' ? record.campaign_seed : null,
    idle_task: typeof record.idle_task === 'string' ? record.idle_task : null,
    idle_task_started_at: typeof record.idle_task_started_at === 'string' ? record.idle_task_started_at : null,
  };
};

const normalizeJournalEntry = (value: unknown): JournalEntry | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : null;
  const content = typeof record.content === 'string' ? record.content : null;
  const createdAt = typeof record.created_at === 'string' ? record.created_at : null;
  const entryType = typeof record.entry_type === 'string' ? record.entry_type : 'Update';
  if (!id || !content || !createdAt) {
    return null;
  }
  return {
    id,
    content,
    created_at: createdAt,
    entry_type: entryType,
  };
};

const DashboardPageInner = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const chatRef = useRef<ChatInterfaceRef>(null);

  const [character, setCharacter] = useState<CharacterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [travelDestination, setTravelDestination] = useState<{ x: number; y: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [travelMode, setTravelMode] = useState<'smart' | 'active' | 'quiet'>('smart');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  // Keep journal entries state for future journal modal/panel feature

  // Define fetchJournalEntries first (before useEffect)
  const fetchJournalEntries = useCallback(async (characterId: string): Promise<void> => {
    try {
      const { data, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('character_id', characterId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (journalError) throw journalError;
      const normalizedEntries = (data ?? [])
        .map((entry) => normalizeJournalEntry(entry))
        .filter((entry): entry is JournalEntry => entry !== null);
      setJournalEntries(normalizedEntries);
    } catch (err) {
      console.error('Error fetching journal:', err);
    }
  }, []);

  // Fetch character data on mount
  useEffect(() => {
    const fetchCharacter = async (): Promise<void> => {
      // ProtectedRoute already handles auth redirect, just wait for user
      if (!user) {
        setLoading(true);
        return;
      }

      try {
        const { data, error: characterError } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (characterError) {
          if (characterError.code === 'PGRST116') {
            // No character found - redirect to character creation
            console.log('No character found for user, redirecting to creation');
            navigate('/create-character');
            return;
          }
          throw characterError;
        }

        const typedCharacter = toCharacterRecord(data);
        if (!typedCharacter) {
          throw new Error('Received character data in an unexpected format');
        }
        setCharacter(typedCharacter);

        // Fetch journal entries
        void fetchJournalEntries(typedCharacter.id);
      } catch (err) {
        console.error('Error fetching character:', err);
        const message = err instanceof Error ? err.message : 'Failed to load character';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [user, navigate, fetchJournalEntries]);

  const handleLogout = async () => {
    const { error: signOutError } = await signOut();
    if (signOutError) {
      console.error('Error during sign out:', signOutError);
      return;
    }
    navigate('/login');
  };

  const handleStateChange = (changes: DmApiResponse['stateChanges']) => {
    if (!changes || !Array.isArray(changes)) return;

    // Process StateChange[] array from new secure backend
    setCharacter(prev => {
      if (!prev) return null;

      const updates: Partial<CharacterRecord> = {};
      let newPosition: { x: number; y: number } | null = null as { x: number; y: number } | null;

      // Process each state change
      changes.forEach(change => {
        if (change.entityId !== prev.id) return; // Only apply changes to this character

        switch (change.field) {
          case 'position_x':
            updates.position_x = change.newValue as number;
            newPosition = { x: change.newValue as number, y: newPosition?.y ?? prev.position_y };
            break;
          case 'position_y':
            updates.position_y = change.newValue as number;
            newPosition = { x: newPosition?.x ?? prev.position_x, y: change.newValue as number };
            break;
          case 'hp_current':
            updates.hp_current = Math.max(0, Math.min(prev.hp_max, change.newValue as number));
            break;
          case 'xp':
            updates.xp = change.newValue as number;
            break;
        }
      });

      // Strategic map will auto-refresh via props change
      return { ...prev, ...updates };
    });
  };

  // Quick action shortcuts - send pre-written messages to chat
  const handleQuickAction = (message: string) => {
    chatRef.current?.sendMessage(message);
  };

  if (loading) {
    return (
      <TownApproachingLoader
        characterName={character?.name || 'Adventurer'}
        townName={character?.campaign_seed ? 'the Unknown Town' : undefined}
      />
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
    <div className="min-h-screen bg-gradient-to-b from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg">
      {/* Header/Navigation */}
      <header className="bg-nuaibria-surface/80 backdrop-blur-sm border-b-2 border-nuaibria-gold/30 shadow-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-display font-bold text-nuaibria-gold drop-shadow-lg">
                Nuaibria
              </h1>
              <span className="text-nuaibria-border">|</span>
              <span className="text-nuaibria-text-primary font-semibold">{character.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-nuaibria-text-accent font-semibold">Level {character.level}</p>
                <p className="text-xs text-nuaibria-text-muted">
                  {character.class}
                  {character.subclass && <span className="text-nuaibria-gold"> ({character.subclass})</span>}
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="bg-nuaibria-arcane hover:bg-nuaibria-arcane/80 text-white font-semibold py-2 px-4 rounded-lg transition-all hover:shadow-glow"
              >
                Profile
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
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column - Character Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Character Stats Card */}
            <div className="bg-nuaibria-surface border-2 border-nuaibria-gold/20 rounded-lg shadow-card-hover overflow-hidden hover:border-nuaibria-gold/40 transition-all">
              <div className="bg-gradient-to-r from-nuaibria-gold/20 via-nuaibria-ember/10 to-nuaibria-gold/20 px-6 py-4 border-b border-nuaibria-border">
                <h2 className="text-xl font-display font-bold text-nuaibria-gold">Character</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-nuaibria-text-secondary font-semibold">Class</span>
                  <div className="text-right">
                    <span className="text-nuaibria-text-primary font-semibold text-sm">{character.class}</span>
                    {character.subclass && (
                      <p className="text-xs text-nuaibria-gold mt-1">{character.subclass}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-nuaibria-text-secondary font-semibold">HP</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-nuaibria-bg rounded-full h-4 shadow-inner-dark border border-nuaibria-border">
                      <div
                        className="bg-gradient-to-r from-nuaibria-health to-nuaibria-ember h-4 rounded-full transition-all shadow-glow"
                        style={{ width: `${(character.hp_current / character.hp_max) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-nuaibria-text-primary font-mono font-bold text-sm min-w-[60px]">
                      {character.hp_current}/{character.hp_max}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-nuaibria-text-secondary font-semibold">XP</span>
                  <span className="text-nuaibria-text-accent font-bold font-mono">{character.xp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-nuaibria-text-secondary font-semibold">Position</span>
                  <span className="text-nuaibria-arcane font-mono text-sm font-semibold">
                    ({character.position_x}, {character.position_y})
                  </span>
                </div>
              </div>
            </div>

            {/* Tension Warning */}
            <TensionBadge characterId={character.id} />

            {/* Active Quests */}
            <QuestPanel characterId={character.id} />

            {/* Party System - Multiplayer */}
            <PartyPanel characterId={character.id} />

            {/* Idle Tasks Card - Background tasks while AFK */}
            <IdleTaskPanel
              characterId={character.id}
              onTaskComplete={() => window.location.reload()}
              currentPosition={{ x: character.position_x, y: character.position_y }}
              travelDestination={travelDestination}
            />
          </div>

          {/* Center Column - Chat with The Chronicler (PRIMARY INTERFACE) */}
          <div className="lg:col-span-7">
            <ChatInterface
              ref={chatRef}
              characterId={character.id}
              onStateChange={handleStateChange}
              onNewJournalEntry={() => fetchJournalEntries(character.id)}
            />
          </div>

          {/* Right Column - Strategic World Map & Travel Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* World Map */}
            <div className="bg-nuaibria-surface border-2 border-nuaibria-ember/20 rounded-lg shadow-card-hover overflow-hidden hover:border-nuaibria-ember/40 transition-all">
              <div className="bg-gradient-to-r from-nuaibria-ember/20 via-nuaibria-gold/10 to-nuaibria-ember/20 px-4 py-3 border-b border-nuaibria-border flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-nuaibria-ember">World Map</h2>
                <button
                  onClick={() => setIsFullscreenMap(true)}
                  className="px-3 py-1 bg-nuaibria-gold/20 hover:bg-nuaibria-gold/30 text-nuaibria-gold text-xs font-semibold rounded transition-colors"
                  title="Expand Map"
                >
                  ⊞ Expand
                </button>
              </div>
              <div className="p-0" style={{ height: '400px' }}>
                {character?.campaign_seed && !isFullscreenMap ? (
                  <StrategicMap
                    characterId={character.id}
                    campaignSeed={character.campaign_seed}
                    isFullscreen={false}
                    onTileClick={setTravelDestination}
                  />
                ) : (
                  <div className="bg-gray-900 rounded p-4 text-center h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">
                      {isFullscreenMap ? 'Map expanded' : 'Loading world map...'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Panel - Shows active travel session with real-time updates */}
            <TravelPanel
              characterId={character.id}
              onTravelModeChange={setTravelMode}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isFullscreenMap && character?.campaign_seed && (
        <div className="fixed inset-0 z-50 bg-black/95">
          {/* Close button */}
          <button
            onClick={() => setIsFullscreenMap(false)}
            className="absolute top-4 right-4 z-[60] px-6 py-3 bg-nuaibria-gold hover:bg-nuaibria-gold/80 text-black font-bold rounded-lg shadow-lg transition-colors text-lg"
          >
            ✕ Close Map
          </button>

          {/* Fullscreen map */}
          <div className="w-full h-full">
            <StrategicMap
              characterId={character.id}
              campaignSeed={character.campaign_seed}
              isFullscreen={true}
              onTileClick={setTravelDestination}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPageInner;
