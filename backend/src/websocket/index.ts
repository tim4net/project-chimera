/**
 * WebSocket Server Implementation for Nuaibria
 *
 * Implements Socket.io server with authentication, event handling,
 * and real-time game state updates.
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { supabaseServiceClient as supabase } from '../services/supabaseClient';
import {
  ClientEvents,
  ServerEvents,
  SocketData,
  AuthenticatePayload,
  AuthenticatedResponse,
  AuthErrorResponse,
  isAuthenticatePayload,
  isChatMessagePayload,
  isGameActionPayload,
} from '../types/websocket';

// ============================================================================
// WebSocket Server Instance
// ============================================================================

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server with HTTP server instance
 */
export function initializeWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    console.log('[WebSocket] Server already initialized');
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  console.log('[WebSocket] Server initialized');

  // Connection handler
  io.on('connection', handleConnection);

  return io;
}

/**
 * Get the Socket.io server instance
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Shutdown WebSocket server gracefully
 */
export async function shutdownWebSocketServer(): Promise<void> {
  if (!io) return;

  console.log('[WebSocket] Shutting down server...');

  return new Promise((resolve) => {
    io!.close(() => {
      console.log('[WebSocket] Server closed');
      io = null;
      resolve();
    });
  });
}

// ============================================================================
// Connection Handler
// ============================================================================

function handleConnection(socket: Socket): void {
  const socketId = socket.id;
  console.log(`[WebSocket] Client connected: ${socketId}`);

  // Initialize socket data
  const socketData: SocketData = {
    userId: '',
    characterId: undefined,
    authenticated: false,
    connectedAt: Date.now(),
    subscribedCharacters: new Set(),
  };

  // Store data on socket
  (socket as any).userData = socketData;

  // Send connection acknowledgment
  socket.emit(ServerEvents.CONNECTED, {
    message: 'Connected to Nuaibria WebSocket server',
    timestamp: Date.now(),
  });

  // Register event handlers
  socket.on(ClientEvents.AUTHENTICATE, (data: unknown) =>
    handleAuthentication(socket, data)
  );

  socket.on(ClientEvents.CHAT_MESSAGE, (data: unknown) =>
    handleChatMessage(socket, data)
  );

  socket.on(ClientEvents.GAME_ACTION, (data: unknown) =>
    handleGameAction(socket, data)
  );

  socket.on(ClientEvents.SUBSCRIBE_CHARACTER, (data: unknown) =>
    handleSubscribeCharacter(socket, data)
  );

  socket.on(ClientEvents.UNSUBSCRIBE_CHARACTER, (data: unknown) =>
    handleUnsubscribeCharacter(socket, data)
  );

  socket.on(ClientEvents.DISCONNECT, () =>
    handleDisconnection(socket)
  );

  // Error handler
  socket.on('error', (error: Error) => {
    console.error(`[WebSocket] Socket error for ${socketId}:`, error);
    emitError(socket, 'Socket error occurred', 'SOCKET_ERROR');
  });
}

// ============================================================================
// Authentication Handler
// ============================================================================

async function handleAuthentication(
  socket: Socket,
  data: unknown
): Promise<void> {
  const socketData = getSocketData(socket);

  if (!isAuthenticatePayload(data)) {
    const error: AuthErrorResponse = {
      error: 'Invalid authentication payload',
      code: 'NO_TOKEN',
    };
    socket.emit(ServerEvents.AUTH_ERROR, error);
    return;
  }

  try {
    const { token, characterId } = data;

    // Verify JWT token with Supabase
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData?.user) {
      const authError: AuthErrorResponse = {
        error: 'Invalid or expired token',
        code: error?.message.includes('expired') ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN',
      };
      socket.emit(ServerEvents.AUTH_ERROR, authError);
      return;
    }

    // Update socket data
    socketData.userId = userData.user.id;
    socketData.authenticated = true;

    if (characterId) {
      socketData.characterId = characterId;
      socketData.subscribedCharacters.add(characterId);
      socket.join(`character:${characterId}`); // Join room for character updates
    }

    // Join user room
    socket.join(`user:${userData.user.id}`);

    console.log(`[WebSocket] User authenticated: ${userData.user.id} (${socket.id})`);

    // Send success response
    const response: AuthenticatedResponse = {
      userId: userData.user.id,
      characterId,
      timestamp: Date.now(),
    };
    socket.emit(ServerEvents.AUTHENTICATED, response);
  } catch (error) {
    console.error('[WebSocket] Authentication error:', error);
    const authError: AuthErrorResponse = {
      error: 'Authentication failed',
      code: 'UNKNOWN',
    };
    socket.emit(ServerEvents.AUTH_ERROR, authError);
  }
}

// ============================================================================
// Chat/DM Message Handler
// ============================================================================

async function handleChatMessage(socket: Socket, data: unknown): Promise<void> {
  const socketData = getSocketData(socket);

  if (!socketData.authenticated) {
    emitError(socket, 'Not authenticated', 'AUTH_REQUIRED');
    return;
  }

  if (!isChatMessagePayload(data)) {
    emitError(socket, 'Invalid chat message payload', 'INVALID_PAYLOAD');
    return;
  }

  console.log(`[WebSocket] Chat message from ${socketData.userId}:`, data.message);

  // TODO: Integrate with narratorLLM service
  // For now, echo back a placeholder response
  socket.emit(ServerEvents.DM_MESSAGE, {
    characterId: data.characterId,
    message: `[Echo] You said: ${data.message}`,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Game Action Handler
// ============================================================================

async function handleGameAction(socket: Socket, data: unknown): Promise<void> {
  const socketData = getSocketData(socket);

  if (!socketData.authenticated) {
    emitError(socket, 'Not authenticated', 'AUTH_REQUIRED');
    return;
  }

  if (!isGameActionPayload(data)) {
    emitError(socket, 'Invalid game action payload', 'INVALID_PAYLOAD');
    return;
  }

  console.log(`[WebSocket] Game action from ${socketData.userId}:`, data.actionType);

  // TODO: Integrate with game action processing
  // For now, send placeholder state update
  socket.emit(ServerEvents.GAME_STATE_UPDATE, {
    characterId: data.characterId,
    state: {
      lastAction: data.actionType,
    },
    timestamp: Date.now(),
  });
}

// ============================================================================
// Character Subscription Handlers
// ============================================================================

function handleSubscribeCharacter(socket: Socket, data: unknown): void {
  const socketData = getSocketData(socket);

  if (!socketData.authenticated) {
    emitError(socket, 'Not authenticated', 'AUTH_REQUIRED');
    return;
  }

  if (typeof data !== 'object' || !data || !('characterId' in data)) {
    emitError(socket, 'Invalid subscribe payload', 'INVALID_PAYLOAD');
    return;
  }

  const { characterId } = data as { characterId: string };

  socketData.subscribedCharacters.add(characterId);
  socket.join(`character:${characterId}`);

  console.log(`[WebSocket] User ${socketData.userId} subscribed to character ${characterId}`);
}

function handleUnsubscribeCharacter(socket: Socket, data: unknown): void {
  const socketData = getSocketData(socket);

  if (!socketData.authenticated) {
    return; // Silently ignore for unsubscribe
  }

  if (typeof data !== 'object' || !data || !('characterId' in data)) {
    return;
  }

  const { characterId } = data as { characterId: string };

  socketData.subscribedCharacters.delete(characterId);
  socket.leave(`character:${characterId}`);

  console.log(`[WebSocket] User ${socketData.userId} unsubscribed from character ${characterId}`);
}

// ============================================================================
// Disconnection Handler
// ============================================================================

function handleDisconnection(socket: Socket): void {
  const socketData = getSocketData(socket);
  const duration = Date.now() - socketData.connectedAt;

  console.log(
    `[WebSocket] Client disconnected: ${socket.id} ` +
    `(userId: ${socketData.userId || 'unauthenticated'}, duration: ${duration}ms)`
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function getSocketData(socket: Socket): SocketData {
  return (socket as any).userData as SocketData;
}

function emitError(socket: Socket, error: string, code?: string): void {
  socket.emit(ServerEvents.ERROR, {
    error,
    code,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Broadcast Helpers (for use by other services)
// ============================================================================

/**
 * Broadcast a message to all sockets in a specific room
 */
export function broadcastToRoom(room: string, event: ServerEvents, data: unknown): void {
  if (!io) {
    console.warn('[WebSocket] Cannot broadcast: server not initialized');
    return;
  }

  io.to(room).emit(event, data);
}

/**
 * Broadcast to all sockets subscribed to a character
 */
export function broadcastToCharacter(characterId: string, event: ServerEvents, data: unknown): void {
  broadcastToRoom(`character:${characterId}`, event, data);
}

/**
 * Broadcast to a specific user (all their connected sockets)
 */
export function broadcastToUser(userId: string, event: ServerEvents, data: unknown): void {
  broadcastToRoom(`user:${userId}`, event, data);
}

/**
 * Broadcast to all connected clients
 */
export function broadcastToAll(event: ServerEvents, data: unknown): void {
  if (!io) {
    console.warn('[WebSocket] Cannot broadcast: server not initialized');
    return;
  }

  io.emit(event, data);
}
