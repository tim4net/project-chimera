import { useState } from 'react';
import type { ChangeEvent } from 'react';

type IdleTaskPanelProps = {
  characterId: string;
  onTaskAssigned?: (task: string) => void;
};

const IdleTaskPanel = ({ characterId, onTaskAssigned }: IdleTaskPanelProps) => {
  const [task, setTask] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleTaskChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTask(event.target.value);
  };

  const handleSetTask = async () => {
    if (!task) {
      return;
    }
    try {
      setSubmitting(true);
      console.log('Setting idle task', { characterId, task });
      onTaskAssigned?.(task);
      // TODO: integrate backend mutation
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3>Idle Task</h3>
      <select value={task} onChange={handleTaskChange} disabled={submitting}>
        <option value="">Select a task</option>
        <option value="travel">Travel</option>
        <option value="scout">Scout</option>
      </select>
      <button onClick={handleSetTask} disabled={submitting || !task}>
        {submitting ? 'Assigning...' : 'Set Task'}
      </button>
    </div>
  );
};

export default IdleTaskPanel;
