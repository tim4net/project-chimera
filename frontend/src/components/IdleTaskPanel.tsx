import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface IdleTaskPanelProps {
  characterId: string;
  onTaskComplete?: () => void;
  travelDestination?: { x: number; y: number } | null;
  currentPosition: { x: number; y: number };
}

interface IdleTaskStatus {
  hasTask: boolean;
  isComplete: boolean;
  task?: {
    type: string;
    duration: number;
    startedAt: string;
    parameters?: any;
  };
  remainingMinutes?: number;
}

const TASK_TYPES = [
  { id: 'travel', name: 'Travel', icon: '🚶', description: 'Move across the map' },
  { id: 'scout', name: 'Scout', icon: '🔍', description: 'Explore nearby area' },
  { id: 'rest', name: 'Rest', icon: '😴', description: 'Recover HP' },
] as const;

export default function IdleTaskPanel({ characterId, onTaskComplete, travelDestination, currentPosition }: IdleTaskPanelProps) {
  const [status, setStatus] = useState<IdleTaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [message, setMessage] = useState('');
  const [wasComplete, setWasComplete] = useState(false);

  // Poll for task status every 10 seconds
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`/api/idle/${characterId}/status`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (response.ok) {
          const data = await response.json();

          // Notify when task completes
          if (data.hasTask && data.isComplete && !wasComplete) {
            setMessage('✨ Task complete! Click to see results.');
            setWasComplete(true);
          }

          setStatus(data);
        }
      } catch (error) {
        console.error('[IdleTaskPanel] Error checking status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [characterId]);

  const startTask = async () => {
    if (!selectedTask) return;

    setIsStarting(true);
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const parameters = selectedTask === 'travel' && travelDestination
        ? {
            destination: travelDestination,
            distance: Math.sqrt(
              Math.pow(travelDestination.x - currentPosition.x, 2) +
              Math.pow(travelDestination.y - currentPosition.y, 2)
            )
          }
        : {};

      const response = await fetch(`/api/idle/${characterId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ taskType: selectedTask, parameters }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start task');
      }

      setMessage(`✓ ${data.message}`);
      setSelectedTask('');

      // Refresh status
      setTimeout(async () => {
        const statusResponse = await fetch(`/api/idle/${characterId}/status`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (statusResponse.ok) {
          setStatus(await statusResponse.json());
        }
      }, 1000);
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStarting(false);
    }
  };

  const resolveTask = async () => {
    setIsResolving(true);
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/idle/${characterId}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve task');
      }

      setMessage(`✓ ${data.narrative} (+${data.xpGained || 0} XP)`);
      setStatus(null);
      setWasComplete(false);
      onTaskComplete?.();
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsResolving(false);
    }
  };

  const cancelTask = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/api/idle/${characterId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      setStatus(null);
      setMessage('Task cancelled');
    } catch (error) {
      console.error('[IdleTaskPanel] Error cancelling:', error);
    }
  };

  if (status?.hasTask) {
    const task = status.task!;
    const progress = status.remainingMinutes
      ? Math.max(0, 100 - (status.remainingMinutes / task.duration) * 100)
      : 100;

    return (
      <div style={styles.panel}>
        <h3 style={styles.header}>⏳ Active Task</h3>
        <div style={styles.taskInfo}>
          <div style={styles.taskType}>
            {TASK_TYPES.find(t => t.id === task.type)?.icon} {task.type.toUpperCase()}
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          {status.isComplete ? (
            <button onClick={resolveTask} disabled={isResolving} style={styles.btnPrimary}>
              {isResolving ? 'Completing...' : 'Complete Task'}
            </button>
          ) : (
            <div style={styles.taskStatus}>
              <span>{Math.ceil(status.remainingMinutes!)} min remaining</span>
              <button onClick={cancelTask} style={styles.btnCancel}>Cancel</button>
            </div>
          )}
        </div>
        {message && <div style={styles.message}>{message}</div>}
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <h3 style={styles.header}>⏱️ Idle Tasks</h3>
      <p style={styles.description}>Start a background task while AFK</p>

      <div style={styles.taskSelector}>
        {TASK_TYPES.map(task => (
          <button
            key={task.id}
            onClick={() => setSelectedTask(task.id)}
            style={{
              ...styles.taskOption,
              ...(selectedTask === task.id ? styles.taskOptionSelected : {}),
            }}
          >
            <span style={styles.taskIcon}>{task.icon}</span>
            <div>
              <div style={styles.taskName}>{task.name}</div>
              <div style={styles.taskDesc}>{task.description}</div>
            </div>
          </button>
        ))}
      </div>

      {selectedTask && (
        <button onClick={startTask} disabled={isStarting} style={styles.btnPrimary}>
          {isStarting ? 'Starting...' : `Start ${selectedTask}`}
        </button>
      )}

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
    margin: '0 0 0.5rem 0',
    color: '#d4af37',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  description: {
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: '1rem',
  } as React.CSSProperties,
  taskSelector: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  taskOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(40, 40, 50, 0.8)',
    border: '1px solid #555',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
  },
  taskOptionSelected: {
    background: 'rgba(80, 60, 40, 0.9)',
    borderColor: '#d4af37',
  } as React.CSSProperties,
  taskIcon: {
    fontSize: '1.5rem',
  } as React.CSSProperties,
  taskName: {
    fontWeight: 'bold',
    color: '#fff',
  } as React.CSSProperties,
  taskDesc: {
    fontSize: '0.85rem',
    color: '#aaa',
  } as React.CSSProperties,
  progressBar: {
    width: '100%',
    height: '20px',
    background: 'rgba(40, 40, 50, 0.8)',
    borderRadius: '10px',
    overflow: 'hidden',
    margin: '0.5rem 0',
  } as React.CSSProperties,
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #d4af37, #f4cf67)',
    transition: 'width 0.3s',
  } as React.CSSProperties,
  taskInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  taskType: {
    fontWeight: 'bold',
    color: '#d4af37',
  } as React.CSSProperties,
  taskStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#aaa',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  message: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(60, 60, 70, 0.8)',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#fff',
  } as React.CSSProperties,
  btnPrimary: {
    width: '100%',
    padding: '0.75rem',
    background: '#d4af37',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
  } as React.CSSProperties,
  btnCancel: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(80, 40, 40, 0.8)',
    color: '#fff',
    border: '1px solid #a44',
    borderRadius: '3px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  } as React.CSSProperties,
};
