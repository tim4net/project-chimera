import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CombatOverlayProps {
  characterId: string;
  onCombatEnd: () => void;
}

interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
}

interface CombatEncounter {
  id: string;
  combatState: {
    enemies: Enemy[];
    roundNumber: number;
    turnOrder: string[];
  };
}

export default function CombatOverlay({ characterId, onCombatEnd }: CombatOverlayProps) {
  const [encounter, setEncounter] = useState<CombatEncounter | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    checkForActiveEncounter();
  }, [characterId]);

  const checkForActiveEncounter = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/active-events/${characterId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasActiveEvent) {
          setEncounter(data.encounter);
        }
      }
    } catch (error) {
      console.error('[CombatOverlay] Error checking encounter:', error);
    }
  };

  const executeAction = async (actionType: string, targetId?: string) => {
    if (!encounter) return;

    setIsExecuting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/active-events/${encounter.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: { type: actionType, targetId },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCombatLog(prev => [...prev, ...result.combatLog]);

        if (result.combatEnded) {
          await endCombat(result.outcome);
        }
      }
    } catch (error) {
      console.error('[CombatOverlay] Error executing action:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const endCombat = async (outcome: string) => {
    if (!encounter) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/api/active-events/${encounter.id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ outcome }),
      });

      setEncounter(null);
      onCombatEnd();
    } catch (error) {
      console.error('[CombatOverlay] Error ending combat:', error);
    }
  };

  if (!encounter) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚔️ Combat!</h2>
          <div style={styles.roundInfo}>Round {encounter.combatState.roundNumber}</div>
        </div>

        {/* Enemies */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Enemies</h3>
          <div style={styles.enemyList}>
            {encounter.combatState.enemies.map(enemy => (
              <div key={enemy.id} style={styles.enemy}>
                <div style={styles.enemyName}>{enemy.name}</div>
                <div style={styles.hpBar}>
                  <div
                    style={{
                      ...styles.hpFill,
                      width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                    }}
                  />
                </div>
                <div style={styles.stats}>
                  HP: {enemy.hp}/{enemy.maxHp} | AC: {enemy.ac}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isPlayerTurn && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Your Turn</h3>
            <div style={styles.actions}>
              <button
                onClick={() => executeAction('attack', encounter.combatState.enemies[0]?.id)}
                disabled={isExecuting}
                style={styles.actionButton}
              >
                ⚔️ Attack
              </button>
              <button
                onClick={() => executeAction('cast_spell')}
                disabled={isExecuting}
                style={styles.actionButton}
              >
                ✨ Cast Spell
              </button>
              <button
                onClick={() => executeAction('dodge')}
                disabled={isExecuting}
                style={styles.actionButton}
              >
                🛡️ Dodge
              </button>
            </div>
          </div>
        )}

        {/* Combat Log */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Combat Log</h3>
          <div style={styles.combatLog}>
            {combatLog.map((log, i) => (
              <div key={i} style={styles.logEntry}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a1a2e',
    border: '2px solid #d4af37',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #d4af37',
  },
  title: {
    margin: 0,
    color: '#d4af37',
    fontSize: '1.8rem',
    fontWeight: 'bold' as const,
  },
  roundInfo: {
    color: '#999',
    fontSize: '0.9rem',
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    color: '#d4af37',
    fontSize: '1.1rem',
    marginBottom: '0.75rem',
  },
  enemyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  enemy: {
    background: 'rgba(60, 30, 30, 0.6)',
    border: '1px solid #a44',
    borderRadius: '6px',
    padding: '0.75rem',
  },
  enemyName: {
    color: '#fff',
    fontWeight: 'bold' as const,
    marginBottom: '0.5rem',
  },
  hpBar: {
    width: '100%',
    height: '12px',
    background: 'rgba(40, 40, 50, 0.8)',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  hpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #c44, #e66)',
    transition: 'width 0.3s',
  },
  stats: {
    fontSize: '0.85rem',
    color: '#aaa',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  actionButton: {
    padding: '0.75rem',
    background: '#d4af37',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  combatLog: {
    background: 'rgba(20, 20, 30, 0.8)',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '0.75rem',
    maxHeight: '200px',
    overflow: 'auto',
  },
  logEntry: {
    fontSize: '0.85rem',
    color: '#ccc',
    marginBottom: '0.25rem',
    lineHeight: '1.4',
  },
};
