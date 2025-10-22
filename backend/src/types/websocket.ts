/**
 * WebSocket Type Definitions for Nuaibria
 *
 * Defines all Socket.io event types, message payloads, and contracts
 * for real-time communication between client and server.
 */

// ============================================================================
// Event Name Constants (Type-Safe Event Names)
// ============================================================================

export enum ClientEvents {
  // Connection Events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Authentication
  AUTHENTICATE = 'auth:authenticate',

  // Game Actions
  GAME_ACTION = 'game:action',

  // Chat/DM
  CHAT_MESSAGE = 'chat:message',

  // Active Phase
  ACTIVE_TURN_ACTION = 'active:turn_action',
  ACTIVE_JOIN_COMBAT = 'active:join_combat',

  // Idle Tasks
  IDLE_TASK_START = 'idle:task_start',

  // Subscriptions
  SUBSCRIBE_CHARACTER = 'subscribe:character',
  UNSUBSCRIBE_CHARACTER = 'unsubscribe:character',
}

export enum ServerEvents {
  // Connection Events
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  AUTH_ERROR = 'auth:error',

  // Game State Updates
  GAME_STATE_UPDATE = 'game:state_update',
  CHARACTER_UPDATE = 'character:update',

  // Chat/DM
  DM_MESSAGE = 'dm:message',
  CHAT_HISTORY = 'chat:history',

  // Active Phase
  ACTIVE_TURN_START = 'active:turn_start',
  ACTIVE_COMBAT_UPDATE = 'active:combat_update',
  ACTIVE_COMBAT_END = 'active:combat_end',

  // Idle Tasks
  IDLE_TASK_COMPLETE = 'idle:task_complete',
  IDLE_TASK_UPDATE = 'idle:task_update',

  // World Events
  WORLD_EVENT = 'world:event',
  TENSION_UPDATE = 'tension:update',

  // Travel Events
  TRAVEL_SESSION_START = 'travel:session_start',
  TRAVEL_EVENT = 'travel:event',
  TRAVEL_EVENT_RESOLVED = 'travel:event_resolved',
  TRAVEL_PROGRESS = 'travel:progress',

  // Notifications
  NOTIFICATION = 'notification',
  ERROR = 'error',
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthenticatePayload {
  token: string; // Supabase JWT
  characterId?: string; // Optional: auto-subscribe to character updates
}

export interface AuthenticatedResponse {
  userId: string;
  characterId?: string;
  timestamp: number;
}

export interface AuthErrorResponse {
  error: string;
  code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'NO_TOKEN' | 'UNKNOWN';
}

// ============================================================================
// Game Action Types
// ============================================================================

export interface GameActionPayload {
  characterId: string;
  actionType: string; // e.g., 'ATTACK', 'MOVE', 'USE_ITEM', 'CAST_SPELL'
  target?: string; // target ID (enemy, location, item)
  metadata?: Record<string, unknown>; // action-specific data
}

export interface GameStateUpdate {
  characterId: string;
  state: {
    hp?: number;
    position?: { x: number; y: number };
    conditions?: string[];
    inventory?: unknown[];
    [key: string]: unknown;
  };
  timestamp: number;
}

// ============================================================================
// Chat/DM Types
// ============================================================================

export interface ChatMessagePayload {
  characterId: string;
  message: string;
  context?: {
    location?: { x: number; y: number };
    currentAction?: string;
  };
}

export interface DMMessageResponse {
  characterId: string;
  message: string; // AI-generated narrative
  actionResults?: {
    type: string;
    success: boolean;
    rolls?: Array<{
      type: string;
      result: number;
      details: string;
    }>;
  };
  stateChanges?: Partial<GameStateUpdate['state']>;
  timestamp: number;
}

export interface ChatHistoryResponse {
  messages: DMMessageResponse[];
  characterId: string;
}

// ============================================================================
// Active Phase (Combat) Types
// ============================================================================

export interface ActiveTurnActionPayload {
  encounterId: string;
  characterId: string;
  actionType: 'ATTACK' | 'CAST_SPELL' | 'USE_ITEM' | 'MOVE' | 'DODGE' | 'HELP' | 'HIDE';
  targetId?: string;
  spellId?: string;
  itemId?: string;
  position?: { x: number; y: number };
}

export interface ActiveTurnStartEvent {
  encounterId: string;
  characterId: string; // whose turn it is
  turnNumber: number;
  timeLimit: number; // seconds
  availableActions: string[];
}

export interface ActiveCombatUpdate {
  encounterId: string;
  combatLog: string; // narrative description
  combatants: Array<{
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    conditions: string[];
    initiative: number;
  }>;
  currentTurn: string; // current character ID
  round: number;
}

export interface ActiveCombatEndEvent {
  encounterId: string;
  result: 'VICTORY' | 'DEFEAT' | 'FLED' | 'DRAW';
  rewards?: {
    xp: number;
    loot: unknown[];
  };
  casualties?: string[]; // character IDs
}

// ============================================================================
// Idle Task Types
// ============================================================================

export interface IdleTaskStartPayload {
  characterId: string;
  taskType: 'TRAVEL' | 'SCOUT' | 'CRAFT' | 'REST' | 'QUEST';
  taskData: {
    destination?: { x: number; y: number };
    duration?: number; // seconds
    [key: string]: unknown;
  };
}

export interface IdleTaskCompleteEvent {
  characterId: string;
  taskType: string;
  result: {
    success: boolean;
    narrative: string;
    rewards?: {
      xp?: number;
      items?: unknown[];
      discoveries?: string[];
    };
    stateChanges?: Partial<GameStateUpdate['state']>;
  };
  timestamp: number;
}

export interface IdleTaskUpdateEvent {
  characterId: string;
  taskType: string;
  progress: number; // 0-100
  estimatedCompletion: number; // timestamp
}

// ============================================================================
// World Event Types
// ============================================================================

export interface WorldEventPayload {
  eventType: 'EPOCH' | 'FACTION_SHIFT' | 'POI_DISCOVERED' | 'QUEST_AVAILABLE';
  data: {
    title: string;
    description: string;
    affectedCharacters?: string[];
    [key: string]: unknown;
  };
  timestamp: number;
}

export interface TensionUpdateEvent {
  characterId: string;
  tensionLevel: number; // 0-100
  vague_warning?: string; // narrative hint (no mechanics)
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface SubscribeCharacterPayload {
  characterId: string;
}

export interface UnsubscribeCharacterPayload {
  characterId: string;
}

// ============================================================================
// Travel Event Types
// ============================================================================

export interface TravelSessionStartEvent {
  sessionId: string;
  destination: string;
  milesTotal: number;
  dangerLevel: number;
  timestamp: number;
}

export interface TravelEventEvent {
  eventId: string;
  type: string;
  description: string;
  choices?: Array<{
    label: string;
    consequence: string;
    dc?: number;
    skill?: string;
  }>;
  timestamp: number;
}

export interface TravelEventResolvedEvent {
  sessionId: string;
  eventId: string;
  choice: string;
  consequence: string;
  timestamp: number;
}

export interface TravelProgressEvent {
  sessionId: string;
  milesTraveled: number;
  milesTotal: number;
  percentage: number;
  estimatedArrival?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationPayload {
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  message: string;
  title?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface ErrorPayload {
  error: string;
  code?: string;
  details?: unknown;
  timestamp: number;
}

// ============================================================================
// Socket Data (attached to socket instance)
// ============================================================================

export interface SocketData {
  userId: string;
  characterId?: string;
  authenticated: boolean;
  connectedAt: number;
  subscribedCharacters: Set<string>;
}

// ============================================================================
// Type Guard Helpers
// ============================================================================

export function isAuthenticatePayload(data: unknown): data is AuthenticatePayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof (data as AuthenticatePayload).token === 'string'
  );
}

export function isGameActionPayload(data: unknown): data is GameActionPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'characterId' in data &&
    'actionType' in data &&
    typeof (data as GameActionPayload).characterId === 'string' &&
    typeof (data as GameActionPayload).actionType === 'string'
  );
}

export function isChatMessagePayload(data: unknown): data is ChatMessagePayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'characterId' in data &&
    'message' in data &&
    typeof (data as ChatMessagePayload).characterId === 'string' &&
    typeof (data as ChatMessagePayload).message === 'string'
  );
}
