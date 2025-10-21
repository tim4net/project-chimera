import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PartyPanelProps {
  characterId: string;
}

interface PartyMember {
  character_id: string;
  role: string;
  characters: {
    name: string;
    level: number;
    class: string;
    hp_current: number;
    hp_max: number;
  };
}

export default function PartyPanel({ characterId }: PartyPanelProps) {
  const [partyId, setPartyId] = useState<string | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkPartyStatus();

    // Subscribe to party member changes (real-time multiplayer)
    let subscription: any = null;

    const setupSubscription = async () => {
      if (!partyId) return;

      subscription = supabase
        .channel(`party:${partyId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'party_members',
            filter: `party_id=eq.${partyId}`,
          },
          () => {
            // Refresh members when changes detected
            const refreshMembers = async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session && partyId) {
                await fetchPartyMembers(partyId, session.access_token);
              }
            };
            refreshMembers();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [characterId, partyId]);

  const checkPartyStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if character is in a party
      const { data: membership, error: memberError } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('character_id', characterId)
        .maybeSingle();

      if (!memberError && membership) {
        setPartyId(membership.party_id);
        await fetchPartyMembers(membership.party_id, session.access_token);
      }
    } catch (error) {
      console.error('[PartyPanel] Error checking status:', error);
    }
  };

  const fetchPartyMembers = async (pId: string, token: string) => {
    try {
      const response = await fetch(`/api/party/${pId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('[PartyPanel] Error fetching members:', error);
    }
  };

  const createParty = async () => {
    if (!partyName.trim()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/party/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ characterId, partyName }),
      });

      const data = await response.json();

      if (response.ok) {
        setPartyId(data.partyId);
        setShowCreateForm(false);
        setMessage('✓ Party created!');
        await checkPartyStatus();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create party');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveParty = async () => {
    if (!partyId || !confirm('Leave party?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/api/party/${partyId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ characterId }),
      });

      setPartyId(null);
      setMembers([]);
      setMessage('Left party');
    } catch (error) {
      console.error('[PartyPanel] Error leaving:', error);
    }
  };

  if (!partyId) {
    return (
      <div style={styles.panel}>
        <h3 style={styles.header}>👥 Party</h3>

        {!showCreateForm ? (
          <button onClick={() => setShowCreateForm(true)} style={styles.btnPrimary}>
            Create Party
          </button>
        ) : (
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Party name..."
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              style={styles.input}
            />
            <div style={styles.buttonRow}>
              <button onClick={createParty} disabled={isLoading} style={styles.btnPrimary}>
                {isLoading ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreateForm(false)} style={styles.btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && <div style={styles.message}>{message}</div>}
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <h3 style={styles.header}>👥 Party ({members.length})</h3>

      <div style={styles.memberList}>
        {members.map((member) => (
          <div key={member.character_id} style={styles.member}>
            <div style={styles.memberName}>
              {member.characters.name}
              {member.role === 'leader' && <span style={styles.leaderBadge}>★</span>}
            </div>
            <div style={styles.memberInfo}>
              Lv{member.characters.level} {member.characters.class}
            </div>
            <div style={styles.memberHP}>
              HP: {member.characters.hp_current}/{member.characters.hp_max}
            </div>
          </div>
        ))}
      </div>

      <button onClick={leaveParty} style={styles.btnDanger}>
        Leave Party
      </button>

      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

const styles = {
  panel: {
    background: 'rgba(20, 20, 30, 0.9)',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  header: {
    margin: '0 0 1rem 0',
    color: '#d4af37',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  input: {
    padding: '0.75rem',
    background: 'rgba(40, 40, 50, 0.8)',
    border: '1px solid #555',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  buttonRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  btnPrimary: {
    flex: 1,
    padding: '0.75rem',
    background: '#d4af37',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSecondary: {
    flex: 1,
    padding: '0.75rem',
    background: 'rgba(60, 60, 70, 0.8)',
    color: '#fff',
    border: '1px solid #666',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  btnDanger: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(80, 40, 40, 0.8)',
    color: '#fff',
    border: '1px solid #a44',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginTop: '0.75rem',
  } as React.CSSProperties,
  memberList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  member: {
    background: 'rgba(40, 40, 50, 0.8)',
    border: '1px solid #555',
    borderRadius: '4px',
    padding: '0.75rem',
  },
  memberName: {
    color: '#fff',
    fontWeight: 'bold' as const,
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  leaderBadge: {
    color: '#d4af37',
    marginLeft: '0.5rem',
  } as React.CSSProperties,
  memberInfo: {
    fontSize: '0.85rem',
    color: '#aaa',
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  memberHP: {
    fontSize: '0.8rem',
    color: '#999',
  } as React.CSSProperties,
  message: {
    marginTop: '0.75rem',
    padding: '0.5rem',
    background: 'rgba(60, 60, 70, 0.8)',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#fff',
  } as React.CSSProperties,
};
