/**
 * Mock Travel Events - For testing TravelPanel UI without backend
 *
 * This utility provides mock data and functions to simulate WebSocket
 * travel events for testing the TravelPanel component.
 *
 * Usage in dev console:
 * ```
 * import { mockTravelProgress, mockTravelEvent } from './utils/mockTravelEvents';
 * mockTravelProgress(0.5); // 50% progress
 * mockTravelEvent('combat'); // Simulate combat encounter
 * ```
 */

import type { TravelSession, TravelEvent } from '../hooks/useTravelStatus';

// Mock travel session data
export const createMockSession = (progress: number = 0): TravelSession => ({
  id: 'mock-session-1',
  characterId: 'mock-char-1',
  destinationId: 'dest-1',
  destinationName: 'Ancient Ruins of Eldoria',
  milesTraveled: 10 * progress,
  milesTotal: 10,
  dangerLevel: Math.min(5, Math.ceil(progress * 5 + 1)) as 1 | 2 | 3 | 4 | 5,
  status: progress >= 1 ? 'completed' : 'in_progress',
  travelMode: 'smart',
  startedAt: new Date(Date.now() - 1000 * 60 * 30), // Started 30 min ago
  estimatedArrival: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
});

// Mock event templates
const eventTemplates = {
  combat: {
    description: 'A band of goblin raiders emerges from the trees, blocking your path! They brandish crude weapons and eye your supplies greedily.',
    dangerLevel: 3 as const,
    choices: [
      { label: 'Fight', description: 'Draw your weapon and engage in combat' },
      { label: 'Negotiate', description: 'Attempt to bargain with the goblins' },
      { label: 'Flee', description: 'Run away and find another route' },
    ],
  },
  social: {
    description: 'You encounter a traveling merchant on the road. He offers to sell you a mysterious potion that "grants great power".',
    dangerLevel: 1 as const,
    choices: [
      { label: 'Buy', description: 'Purchase the potion for 50 gold' },
      { label: 'Decline', description: 'Politely refuse and continue your journey' },
      { label: 'Inspect', description: 'Use Arcana to identify the potion' },
    ],
  },
  exploration: {
    description: 'You spot an ancient stone marker half-buried in the earth. Strange runes glow faintly on its surface.',
    dangerLevel: 2 as const,
    choices: [
      { label: 'Investigate', description: 'Examine the marker closely' },
      { label: 'Ignore', description: 'Continue on your way' },
    ],
  },
  danger: {
    description: 'Dark storm clouds gather overhead. Lightning strikes a nearby tree, setting it ablaze. The path ahead is treacherous.',
    dangerLevel: 4 as const,
    choices: [
      { label: 'Push Forward', description: 'Press on despite the danger' },
      { label: 'Take Shelter', description: 'Wait out the storm' },
      { label: 'Find Alternate Route', description: 'Search for a safer path' },
    ],
  },
  extreme: {
    description: 'A massive dragon lands in front of you, its scales gleaming like obsidian. It regards you with intelligent, predatory eyes.',
    dangerLevel: 5 as const,
    choices: [
      { label: 'Parley', description: 'Attempt to speak with the dragon' },
      { label: 'Submit', description: 'Offer tribute and hope for mercy' },
      { label: 'Hide', description: 'Use Stealth to slip away unnoticed' },
    ],
  },
};

export const createMockEvent = (
  type: keyof typeof eventTemplates = 'combat'
): TravelEvent => {
  const template = eventTemplates[type];
  return {
    id: `mock-event-${Date.now()}`,
    description: template.description,
    timestamp: new Date(),
    dangerLevel: template.dangerLevel,
    choices: template.choices,
  };
};

// Simulate WebSocket message sending
export const simulateWebSocketMessage = (message: any) => {
  // In a real app, this would send to the WebSocket
  // For testing, we'll just log it
  console.log('[Mock WebSocket] Sending message:', message);

  // You can hook this up to your actual WebSocket in dev mode
  // if needed for integration testing
};

/**
 * Mock travel progress update
 * Simulates a TRAVEL_PROGRESS WebSocket message
 */
export const mockTravelProgress = (progress: number) => {
  const session = createMockSession(progress);
  simulateWebSocketMessage({
    type: 'TRAVEL_PROGRESS',
    payload: { session },
  });
  return session;
};

/**
 * Mock travel event
 * Simulates a TRAVEL_EVENT WebSocket message
 */
export const mockTravelEvent = (type: keyof typeof eventTemplates = 'combat') => {
  const event = createMockEvent(type);
  simulateWebSocketMessage({
    type: 'TRAVEL_EVENT',
    payload: { event },
  });
  return event;
};

/**
 * Mock travel completion
 * Simulates a TRAVEL_COMPLETE WebSocket message
 */
export const mockTravelComplete = () => {
  const session = createMockSession(1);
  simulateWebSocketMessage({
    type: 'TRAVEL_COMPLETE',
    payload: { session },
  });
  return session;
};

/**
 * Run a full mock travel sequence for testing
 * Simulates a complete journey with multiple events
 */
export const runMockTravelSequence = async () => {
  console.log('[Mock Travel] Starting journey...');

  // Start at 0% progress
  mockTravelProgress(0);
  await sleep(2000);

  // 20% - Social encounter
  mockTravelProgress(0.2);
  mockTravelEvent('social');
  await sleep(5000);

  // 40% - Exploration
  mockTravelProgress(0.4);
  mockTravelEvent('exploration');
  await sleep(5000);

  // 60% - Combat
  mockTravelProgress(0.6);
  mockTravelEvent('combat');
  await sleep(5000);

  // 80% - Danger
  mockTravelProgress(0.8);
  mockTravelEvent('danger');
  await sleep(5000);

  // 100% - Complete
  mockTravelComplete();
  console.log('[Mock Travel] Journey complete!');
};

// Helper function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Export for dev console access
if (typeof window !== 'undefined') {
  (window as any).mockTravel = {
    progress: mockTravelProgress,
    event: mockTravelEvent,
    complete: mockTravelComplete,
    runSequence: runMockTravelSequence,
  };

  console.log('[Mock Travel] Test utilities loaded. Use window.mockTravel in dev console.');
}
