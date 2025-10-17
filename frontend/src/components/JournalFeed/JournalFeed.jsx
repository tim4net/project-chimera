import React from 'react';

const journalEntries = [
  { id: 1, text: 'You have entered the dark forest.' },
  { id: 2, text: 'A goblin jumps out from behind a tree!' },
  { id: 3, text: 'You have defeated the goblin.' },
];

const JournalFeed = () => {
  return (
    <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid black' }}>
      {journalEntries.map((entry) => (
        <div key={entry.id} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          {entry.text}
        </div>
      ))}
    </div>
  );
};

export default JournalFeed;
