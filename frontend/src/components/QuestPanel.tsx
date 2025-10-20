/**
 * @file Quest Panel - Displays active quests and progress
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Quest {
  id: string;
  title: string;
  description: string;
  current_progress: number;
  target_quantity: number;
  xp_reward: number;
  gold_reward: number;
  status: string;
}

interface QuestPanelProps {
  characterId: string;
}

const QuestPanel = ({ characterId }: QuestPanelProps) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      if (!characterId) return;

      const { data, error } = await supabase
        .from('character_quests')
        .select('*')
        .eq('character_id', characterId)
        .eq('status', 'active')
        .order('accepted_at', { ascending: false });

      if (error) {
        console.error('Error fetching quests:', error);
      } else {
        setQuests(data as Quest[] || []);
      }
      setLoading(false);
    };

    fetchQuests();

    // Subscribe to quest updates
    const subscription = supabase
      .channel(`quests_${characterId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'character_quests',
          filter: `character_id=eq.${characterId}`,
        },
        () => {
          fetchQuests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [characterId]);

  if (loading) {
    return (
      <div className="bg-nuaibria-surface border-2 border-nuaibria-arcane/20 rounded-lg p-4">
        <p className="text-nuaibria-text-muted text-sm">Loading quests...</p>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="bg-nuaibria-surface border-2 border-nuaibria-arcane/20 rounded-lg p-4">
        <h3 className="text-lg font-display font-bold text-nuaibria-arcane mb-2">Quests</h3>
        <p className="text-nuaibria-text-muted text-sm italic">
          No active quests. Explore and speak with NPCs to find adventures!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-nuaibria-surface border-2 border-nuaibria-arcane/20 rounded-lg shadow-card-hover overflow-hidden">
      <div className="bg-gradient-to-r from-nuaibria-arcane/20 via-nuaibria-poison/10 to-nuaibria-arcane/20 px-4 py-3 border-b border-nuaibria-border">
        <h3 className="text-lg font-display font-bold text-nuaibria-arcane">
          Active Quests ({quests.length})
        </h3>
      </div>

      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {quests.map((quest) => {
          const progress = Math.min(100, (quest.current_progress / quest.target_quantity) * 100);

          return (
            <div
              key={quest.id}
              className="bg-nuaibria-elevated border border-nuaibria-gold/20 rounded-lg p-3 hover:border-nuaibria-gold/40 transition-all"
            >
              {/* Quest title */}
              <h4 className="font-semibold text-nuaibria-gold text-sm mb-1">
                {quest.title}
              </h4>

              {/* Quest description */}
              <p className="text-nuaibria-text-muted text-xs mb-2 leading-relaxed">
                {quest.description}
              </p>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-nuaibria-text-secondary mb-1">
                  <span>Progress</span>
                  <span className="font-mono">
                    {quest.current_progress}/{quest.target_quantity}
                  </span>
                </div>
                <div className="w-full bg-nuaibria-bg rounded-full h-2 border border-nuaibria-border">
                  <div
                    className="bg-gradient-to-r from-nuaibria-poison to-nuaibria-mana h-2 rounded-full transition-all duration-500 shadow-glow"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-nuaibria-text-accent">
                    ⭐ {quest.xp_reward} XP
                  </span>
                  <span className="text-nuaibria-gold">
                    💰 {quest.gold_reward}g
                  </span>
                </div>
                {progress === 100 && (
                  <span className="text-green-400 font-bold animate-pulse">
                    ✓ Complete!
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestPanel;
