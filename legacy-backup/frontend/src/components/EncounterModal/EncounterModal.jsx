import React from 'react';

const EncounterModal = ({ encounter, onChoice }) => {
  if (!encounter) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '5px',
        }}
      >
        <h2>{encounter}</h2>
        <button onClick={() => onChoice('attack')}>Attack</button>
        <button onClick={() => onChoice('flee')}>Flee</button>
      </div>
    </div>
  );
};

export default EncounterModal;
