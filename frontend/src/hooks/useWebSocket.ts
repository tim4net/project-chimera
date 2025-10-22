/**
 * useWebSocket Hook - WebSocket Connection Manager for Nuaibria
 *
 * Provides a React hook for managing Socket.io connection,
 * authentication, and real-time event handling.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// ============================================================================
// Types (shared with backend)
// ============================================================================

export enum ClientEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'auth:authenticate',
  GAME_ACTION = 'game:action',
  CHAT_MESSAGE = 'chat:message',
  ACTIVE_TURN_ACTION = 'active:turn_action',
  ACTIVE_JOIN_COMBAT = 'active:join_combat',
  IDLE_TASK_START = 'idle:task_start',
  SUBSCRIBE_CHARACTER = 'subscribe:character',
  UNSUBSCRIBE_CHARACTER = 'unsubscribe:character',
}

export enum ServerEvents {
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  AUTH_ERROR = 'auth:error',
  GAME_STATE_UPDATE = 'game:state_update',
  CHARACTER_UPDATE = 'character:update',
  DM_MESSAGE = 'dm:message',
  CHAT_HISTORY = 'chat:history',
  ACTIVE_TURN_START = 'active:turn_start',
  ACTIVE_COMBAT_UPDATE = 'active:combat_update',
  ACTIVE_COMBAT_END = 'active:combat_end',
  IDLE_TASK_COMPLETE = 'idle:task_complete',
  IDLE_TASK_UPDATE = 'idle:task_update',
  WORLD_EVENT = 'world:event',
  TENSION_UPDATE = 'tension:update',
  NOTIFICATION = 'notification',
  ERROR = 'error',
}

export interface WebSocketMessage<T = unknown> {
  event: ServerEvents;
  data: T;
  timestamp: number;
}

export type WebSocketEventHandler<T = unknown> = (data: T) => void;

// ============================================================================
// Connection Status
// ============================================================================

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
}

// ============================================================================
// Hook Configuration
// ============================================================================

export interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  autoAuthenticate?: boolean;
  token?: string;
  characterId?: string;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onAuthenticated?: (userId: string) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseWebSocketReturn {
  // Connection state
  socket: Socket | null;
  status: ConnectionStatus;
  isConnected: boolean;
  isAuthenticated: boolean;

  // Connection control
  connect: () => void;
  disconnect: () => void;
  authenticate: (token: string, characterId?: string) => void;

  // Event handling
  on: <T = unknown>(event: ServerEvents, handler: WebSocketEventHandler<T>) => void;
  off: <T = unknown>(event: ServerEvents, handler: WebSocketEventHandler<T>) => void;
  emit: <T = unknown>(event: ClientEvents, data: T) => void;

  // Character subscription
  subscribeToCharacter: (characterId: string) => void;
  unsubscribeFromCharacter: (characterId: string) => void;

  // Convenience methods
  sendChatMessage: (characterId: string, message: string) => void;
  sendGameAction: (characterId: string, actionType: string, target?: string) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
    autoConnect = true,
    autoAuthenticate = false,
    token,
    characterId,
    onConnect,
    onDisconnect,
    onAuthenticated,
    onError,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<ServerEvents, Set<WebSocketEventHandler>>>(new Map());

  // ========================================================================
  // Connection Management
  // ========================================================================

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log(`[WebSocket] Connecting to ${url}...`);
    setStatus(ConnectionStatus.CONNECTING);

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[WebSocket] Connected', socket.id);
      setStatus(ConnectionStatus.CONNECTED);
      onConnect?.();

      // Auto-authenticate if token provided
      if (autoAuthenticate && token) {
        authenticate(token, characterId);
      }
    });

    socket.on('disconnect', (reason: string) => {
      console.log('[WebSocket] Disconnected:', reason);
      setStatus(ConnectionStatus.DISCONNECTED);
      onDisconnect?.(reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error);
      setStatus(ConnectionStatus.ERROR);
      onError?.(error.message);
    });

    // Authentication handlers
    socket.on(ServerEvents.AUTHENTICATED, (data: { userId: string }) => {
      console.log('[WebSocket] Authenticated:', data.userId);
      setStatus(ConnectionStatus.AUTHENTICATED);
      onAuthenticated?.(data.userId);
    });

    socket.on(ServerEvents.AUTH_ERROR, (data: { error: string }) => {
      console.error('[WebSocket] Authentication error:', data.error);
      setStatus(ConnectionStatus.CONNECTED);
      onError?.(data.error);
    });

    // Register custom event handlers
    handlersRef.current.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        socket.on(event, handler);
      });
    });
  }, [url, autoAuthenticate, token, characterId, onConnect, onDisconnect, onAuthenticated, onError]);

  const disconnect = useCallback(() => {
    if (!socketRef.current) return;

    console.log('[WebSocket] Disconnecting...');
    socketRef.current.disconnect();
    socketRef.current = null;
    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  const authenticate = useCallback((authToken: string, charId?: string) => {
    if (!socketRef.current?.connected) {
      console.warn('[WebSocket] Cannot authenticate: not connected');
      return;
    }

    console.log('[WebSocket] Authenticating...');
    socketRef.current.emit(ClientEvents.AUTHENTICATE, {
      token: authToken,
      characterId: charId,
    });
  }, []);

  // ========================================================================
  // Event Handling
  // ========================================================================

  const on = useCallback(<T = unknown>(
    event: ServerEvents,
    handler: WebSocketEventHandler<T>
  ) => {
    // Store handler for re-registration on reconnect
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler as WebSocketEventHandler);

    // Register with socket if connected
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback(<T = unknown>(
    event: ServerEvents,
    handler: WebSocketEventHandler<T>
  ) => {
    // Remove from stored handlers
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.delete(handler as WebSocketEventHandler);
      if (handlers.size === 0) {
        handlersRef.current.delete(event);
      }
    }

    // Remove from socket if connected
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  const emit = useCallback(<T = unknown>(event: ClientEvents, data: T) => {
    if (!socketRef.current?.connected) {
      console.warn(`[WebSocket] Cannot emit ${event}: not connected`);
      return;
    }

    socketRef.current.emit(event, data);
  }, []);

  // ========================================================================
  // Character Subscription
  // ========================================================================

  const subscribeToCharacter = useCallback((charId: string) => {
    emit(ClientEvents.SUBSCRIBE_CHARACTER, { characterId: charId });
  }, [emit]);

  const unsubscribeFromCharacter = useCallback((charId: string) => {
    emit(ClientEvents.UNSUBSCRIBE_CHARACTER, { characterId: charId });
  }, [emit]);

  // ========================================================================
  // Convenience Methods
  // ========================================================================

  const sendChatMessage = useCallback((charId: string, message: string) => {
    emit(ClientEvents.CHAT_MESSAGE, {
      characterId: charId,
      message,
      context: {},
    });
  }, [emit]);

  const sendGameAction = useCallback((
    charId: string,
    actionType: string,
    target?: string
  ) => {
    emit(ClientEvents.GAME_ACTION, {
      characterId: charId,
      actionType,
      target,
    });
  }, [emit]);

  // ========================================================================
  // Lifecycle
  // ========================================================================

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // ========================================================================
  // Return Hook API
  // ========================================================================

  return {
    // Connection state
    socket: socketRef.current,
    status,
    isConnected: status === ConnectionStatus.CONNECTED || status === ConnectionStatus.AUTHENTICATED,
    isAuthenticated: status === ConnectionStatus.AUTHENTICATED,

    // Connection control
    connect,
    disconnect,
    authenticate,

    // Event handling
    on,
    off,
    emit,

    // Character subscription
    subscribeToCharacter,
    unsubscribeFromCharacter,

    // Convenience methods
    sendChatMessage,
    sendGameAction,
  };
}
