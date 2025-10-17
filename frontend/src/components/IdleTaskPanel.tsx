import React, { useState } from 'react';

const IdleTaskPanel = ({ characterId }) => {
  const [task, setTask] = useState('');

  const handleSetTask = async () => {
    // Call backend to set idle task
  };

  return (
    <div>
      <h3>Idle Task</h3>
      <select value={task} onChange={(e) => setTask(e.target.value)}>
        <option value="">Select a task</option>
        <option value="travel">Travel</option>
        <option value="scout">Scout</option>
      </select>
      <button onClick={handleSetTask}>Set Task</button>
    </div>
  );
};

export default IdleTaskPanel;
