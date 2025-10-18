import React, { useState } from 'react';

const IdleTaskForm = () => {
  const [taskType, setTaskType] = useState('');
  const [duration, setDuration] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle idle task creation logic here
    console.log({ taskType, duration });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
        <option value="">Select a Task</option>
        <option value="training">Training</option>
        <option value="gathering">Gathering</option>
        <option value="crafting">Crafting</option>
      </select>
      <input
        type="number"
        min="1"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <button type="submit">Start Task</button>
    </form>
  );
};

export default IdleTaskForm;
