import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const JournalFeed = ({ characterId }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('character_id', characterId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setEntries(data);
      }
    };
    fetchEntries();

    const subscription = supabase
      .channel('public:journal_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries', filter: `character_id=eq.${characterId}` }, (payload) => {
        setEntries((prevEntries) => [payload.new, ...prevEntries]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
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
