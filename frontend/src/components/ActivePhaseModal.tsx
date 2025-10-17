import React from 'react';

const ActivePhaseModal = ({ event, onChoose }) => {
  if (!event) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{event.title}</h2>
        <p>{event.narrative}</p>
        <div className="choices">
          {event.choices.map((choice) => (
            <button key={choice.id} onClick={() => onChoose(choice.id)}>
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivePhaseModal;
