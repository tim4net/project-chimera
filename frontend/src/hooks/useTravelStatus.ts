import { useState, useEffect, useCallback, useRef } from 'react';

// Travel session state types
export interface TravelEvent {
  id: string;
  description: string;
  timestamp: Date;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  choices?: TravelChoice[];
}

export interface TravelChoice {
  label: string;
  description?: string;
}

export interface TravelSession {
  id: string;
  characterId: string;
  destinationId: string;
  destinationName: string;
  milesTraveled: number;
  milesTotal: number;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  status: 'in_progress' | 'paused' | 'completed' | 'cancelled';
  travelMode: 'smart' | 'active' | 'quiet';
  startedAt: Date;
  estimatedArrival?: Date;
}

export interface TravelStatusState {
  currentSession: TravelSession | null;
  events: TravelEvent[];
  currentEvent: TravelEvent | null;
  loading: boolean;
  error: string | null;
}

// Note: WebSocket has been replaced with HTTP polling for better compatibility and reliability

interface UseTravelStatusReturn extends TravelStatusState {
  startTravel: (destinationId: string, travelMode?: 'smart' | 'active' | 'quiet') => Promise<void>;
  chooseOption: (label: string) => Promise<void>;
  cancelTravel: () => Promise<void>;
  getCurrentStatus: () => Promise<void>;
}

/**
 * Hook for managing travel status with HTTP polling
 *
 * This hook:
 * - Polls travel status every 2 seconds via GET /api/travel/status?characterId=...
 * - Uses exponential backoff on errors (max 10 seconds between polls)
 * - Manages local state: currentSession, events, currentEvent, loading, error
 * - Exposes functions: startTravel, chooseOption, getCurrentStatus
 * - Auto-refreshes status on mount and cleans up polling on unmount
 *
 * @param characterId - The character ID to track travel for
 */
export function useTravelStatus(characterId: string): UseTravelStatusReturn {
  const [state, setState] = useState<TravelStatusState>({
    currentSession: null,
    events: [],
    currentEvent: null,
    loading: true,
    error: null,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  const lastSuccessfulPollRef = useRef(Date.now());

  // Get current travel status (defined here for polling to reference)
  const getCurrentStatus = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/travel/status?characterId=${characterId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch travel status');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        currentSession: data.session ? {
          ...data.session,
          startedAt: new Date(data.session.startedAt),
          estimatedArrival: data.session.estimatedArrival
            ? new Date(data.session.estimatedArrival)
            : undefined,
        } : null,
        events: data.events?.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        })) || [],
        currentEvent: data.currentEvent ? {
          ...data.currentEvent,
          timestamp: new Date(data.currentEvent.timestamp),
        } : null,
        loading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch travel status';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, [characterId]);

  // HTTP polling with exponential backoff
  const startPolling = useCallback(async () => {
    // Poll every 2 seconds initially, back off to 5 seconds if errors occur
    const timeSinceSuccess = Date.now() - lastSuccessfulPollRef.current;
    const pollInterval = timeSinceSuccess > 30000 ? 5000 : 2000; // 5s if no success in 30s, else 2s

    try {
      await getCurrentStatus();
      lastSuccessfulPollRef.current = Date.now();
      pollCountRef.current = 0;

      // Schedule next poll
      pollingIntervalRef.current = setTimeout(() => startPolling(), pollInterval);
    } catch (err) {
      console.error('[useTravelStatus] Polling error:', err);
      pollCountRef.current += 1;

      // Exponential backoff: max out at 10 seconds
      const backoffInterval = Math.min(1000 * Math.pow(1.5, pollCountRef.current), 10000);
      pollingIntervalRef.current = setTimeout(() => startPolling(), backoffInterval);
    }
  }, [getCurrentStatus]);

  // Start a new travel session
  const startTravel = useCallback(async (
    destinationId: string,
    travelMode: 'smart' | 'active' | 'quiet' = 'smart'
  ): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/travel/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, destinationId, travelMode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start travel');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        currentSession: {
          ...data.session,
          startedAt: new Date(data.session.startedAt),
          estimatedArrival: data.session.estimatedArrival
            ? new Date(data.session.estimatedArrival)
            : undefined,
        },
        events: [],
        currentEvent: null,
        loading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start travel';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, [characterId]);

  // Choose an option during an event
  const chooseOption = useCallback(async (label: string): Promise<void> => {
    if (!state.currentSession || !state.currentEvent) {
      throw new Error('No active travel session or event');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/travel/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          sessionId: state.currentSession.id,
          eventId: state.currentEvent.id,
          choice: label
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process choice');
      }

      // Clear current event after choice is made
      setState(prev => ({ ...prev, currentEvent: null, loading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process choice';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, [characterId, state.currentSession, state.currentEvent]);

  // Cancel current travel session
  const cancelTravel = useCallback(async (): Promise<void> => {
    if (!state.currentSession) {
      throw new Error('No active travel session');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/travel/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, sessionId: state.currentSession.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel travel');
      }

      setState(prev => ({
        ...prev,
        currentSession: null,
        currentEvent: null,
        events: [],
        loading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel travel';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, [characterId, state.currentSession]);

  // Initialize polling on mount and auto-refresh status
  useEffect(() => {
    // Fetch initial status immediately
    getCurrentStatus().catch(err => {
      console.error('[useTravelStatus] Failed to fetch initial status:', err);
    });

    // Start polling for updates
    startPolling().catch(err => {
      console.error('[useTravelStatus] Failed to start polling:', err);
    });

    return () => {
      // Cleanup on unmount: cancel polling
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
      }
    };
  }, [startPolling, getCurrentStatus]);

  return {
    ...state,
    startTravel,
    chooseOption,
    cancelTravel,
    getCurrentStatus,
  };
}
