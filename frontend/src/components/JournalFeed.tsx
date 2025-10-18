import { useState, useEffect } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type JournalEntry = {
  id: string;
  content: string;
  created_at: string;
  entry_type?: string;
};

type JournalFeedProps = {
  characterId: string;
};

const normalizeEntry = (value: unknown): JournalEntry | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : null;
  const content = typeof record.content === 'string' ? record.content : null;
  const createdAt = typeof record.created_at === 'string' ? record.created_at : null;
  if (!id || !content || !createdAt) {
    return null;
  }
  return {
    id,
    content,
    created_at: createdAt,
    entry_type: typeof record.entry_type === 'string' ? record.entry_type : undefined,
  };
};

const JournalFeed = ({ characterId }: JournalFeedProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('character_id', characterId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Failed to load journal entries:', error);
      } else {
        const normalized = (data ?? [])
          .map((entry) => normalizeEntry(entry))
          .filter((entry): entry is JournalEntry => entry !== null);
        setEntries(normalized);
      }
    };
    fetchEntries();

    const subscription = supabase
      .channel('public:journal_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries', filter: `character_id=eq.${characterId}` },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const entry = normalizeEntry(payload.new);
          if (entry) {
            setEntries((prevEntries) => [entry, ...prevEntries]);
          }
        }
      )
      .subscribe();

    return () => {
      void subscription.unsubscribe();
    };
  }, [characterId]);

  return (
    <div>
      <h2>Journal</h2>
      {entries.map((entry) => (
        <div key={entry.id}>
          <p>{entry.content}</p>
          <small>{new Date(entry.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default JournalFeed;
