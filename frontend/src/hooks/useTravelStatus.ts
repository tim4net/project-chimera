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

// WebSocket message types
type TravelMessageType = 'TRAVEL_PROGRESS' | 'TRAVEL_EVENT' | 'TRAVEL_COMPLETE' | 'TRAVEL_ERROR';

interface TravelMessage {
  type: TravelMessageType;
  payload: any;
}

interface UseTravelStatusReturn extends TravelStatusState {
  startTravel: (destinationId: string, travelMode?: 'smart' | 'active' | 'quiet') => Promise<void>;
  chooseOption: (label: string) => Promise<void>;
  cancelTravel: () => Promise<void>;
  getCurrentStatus: () => Promise<void>;
}

/**
 * Hook for managing travel status and WebSocket communication
 *
 * This hook:
 * - Initializes WebSocket listener for TRAVEL_EVENT messages
 * - Manages local state: currentSession, events, currentEvent, loading, error
 * - Handles message types: TRAVEL_PROGRESS, TRAVEL_EVENT, TRAVEL_COMPLETE
 * - Exposes functions: startTravel, chooseOption, getCurrentStatus
 * - Auto-refreshes status on mount
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

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (isConnecting.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnecting.current = true;
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Construct WebSocket URL (use environment variable or default to localhost)
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = (import.meta.env as any).VITE_WS_URL || `${window.location.hostname}:3001`;
      const wsUrl = `${wsProtocol}//${wsHost}/ws/travel?characterId=${characterId}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[useTravelStatus] WebSocket connected');
        isConnecting.current = false;
        setState(prev => ({ ...prev, loading: false, error: null }));

        // Request current status on connect
        ws.send(JSON.stringify({ type: 'GET_STATUS' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: TravelMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('[useTravelStatus] Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[useTravelStatus] WebSocket error:', error);
        isConnecting.current = false;
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'WebSocket connection error. Travel updates may be delayed.'
        }));
      };

      ws.onclose = () => {
        console.log('[useTravelStatus] WebSocket closed, will attempt reconnect...');
        isConnecting.current = false;
        wsRef.current = null;

        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[useTravelStatus] Failed to create WebSocket:', err);
      isConnecting.current = false;
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to establish WebSocket connection'
      }));
    }
  }, [characterId]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: TravelMessage) => {
    switch (message.type) {
      case 'TRAVEL_PROGRESS':
        // Update travel progress
        setState(prev => ({
          ...prev,
          currentSession: message.payload.session ? {
            ...message.payload.session,
            startedAt: new Date(message.payload.session.startedAt),
            estimatedArrival: message.payload.session.estimatedArrival
              ? new Date(message.payload.session.estimatedArrival)
              : undefined,
          } : null,
        }));
        break;

      case 'TRAVEL_EVENT':
        // New event occurred during travel
        const newEvent: TravelEvent = {
          ...message.payload.event,
          timestamp: new Date(message.payload.event.timestamp),
        };

        setState(prev => ({
          ...prev,
          currentEvent: newEvent,
          events: [newEvent, ...prev.events],
        }));
        break;

      case 'TRAVEL_COMPLETE':
        // Travel completed
        setState(prev => ({
          ...prev,
          currentSession: message.payload.session ? {
            ...message.payload.session,
            status: 'completed' as const,
            startedAt: new Date(message.payload.session.startedAt),
          } : null,
          currentEvent: null,
        }));
        break;

      case 'TRAVEL_ERROR':
        // Error occurred
        setState(prev => ({
          ...prev,
          error: message.payload.error || 'An error occurred during travel',
        }));
        break;

      default:
        console.warn('[useTravelStatus] Unknown message type:', message.type);
    }
  }, []);

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

  // Get current travel status
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

  // Initialize WebSocket on mount and auto-refresh status
  useEffect(() => {
    connectWebSocket();
    getCurrentStatus().catch(err => {
      console.error('[useTravelStatus] Failed to fetch initial status:', err);
    });

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket, getCurrentStatus]);

  return {
    ...state,
    startTravel,
    chooseOption,
    cancelTravel,
    getCurrentStatus,
  };
}
