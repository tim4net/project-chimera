/**
 * @file Travel Service Tests
 *
 * Comprehensive test suite for travel service business logic:
 * - Severity calculation across all danger levels
 * - Event generation from correct pools
 * - Auto-resolution for trivial events
 * - Edge cases and error handling
 */

// Mock uuid to avoid ESM issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

import {
  calculateSeverity,
  generateTravelEvent,
  autoResolveEvent,
  generateTravelEventWithResolution,
  ENCOUNTER_POOLS,
} from '../travelService';
import type {
  TravelSession,
  RegionContext,
  TravelEvent,
  Severity,
} from '../../types/travel';

/**
 * Mock travel session for testing
 */
const mockSession: TravelSession = {
  id: 'session-123',
  character_id: 'char-456',
  destination_x: 10,
  destination_y: 10,
  miles_total: 50,
  miles_traveled: 25,
  travel_mode: 'normal',
  status: 'active',
  created_at: '2025-01-20T12:00:00Z',
};

/**
 * Mock region contexts for different danger levels
 */
const mockRegions: Record<number, RegionContext> = {
  1: { biome: 'plains', danger_level: 1, x: 5, y: 5, explored: true },
  2: { biome: 'forest', danger_level: 2, x: 7, y: 7, explored: false },
  3: { biome: 'hills', danger_level: 3, x: 8, y: 8, explored: false },
  4: { biome: 'mountains', danger_level: 4, x: 9, y: 9, explored: false },
  5: { biome: 'volcano', danger_level: 5, x: 10, y: 10, explored: false },
};

describe('TravelService', () => {
  describe('ENCOUNTER_POOLS', () => {
    it('should have exactly 5 severity pools', () => {
      const severities: Severity[] = ['trivial', 'minor', 'moderate', 'dangerous', 'deadly'];
      severities.forEach(severity => {
        expect(ENCOUNTER_POOLS[severity]).toBeDefined();
        expect(Array.isArray(ENCOUNTER_POOLS[severity])).toBe(true);
      });
    });

    it('should have 3-5 events in each pool', () => {
      Object.entries(ENCOUNTER_POOLS).forEach(([severity, pool]) => {
        expect(pool.length).toBeGreaterThanOrEqual(3);
        expect(pool.length).toBeLessThanOrEqual(5);
      });
    });

    it('should have properly structured event templates', () => {
      Object.entries(ENCOUNTER_POOLS).forEach(([severity, pool]) => {
        pool.forEach(template => {
          expect(template.type).toBeDefined();
          expect(template.severity).toBe(severity);
          expect(template.description).toBeDefined();
          expect(typeof template.requires_response).toBe('boolean');
        });
      });
    });

    it('trivial events should not require response', () => {
      ENCOUNTER_POOLS.trivial.forEach(template => {
        expect(template.requires_response).toBe(false);
      });
    });

    it('deadly events should always require response', () => {
      ENCOUNTER_POOLS.deadly.forEach(template => {
        expect(template.requires_response).toBe(true);
      });
    });
  });

  describe('calculateSeverity', () => {
    describe('Danger Level 1 - Safe regions', () => {
      it('should return mostly trivial (70%)', () => {
        expect(calculateSeverity(1, 0)).toBe('trivial');
        expect(calculateSeverity(1, 35)).toBe('trivial');
        expect(calculateSeverity(1, 69)).toBe('trivial');
      });

      it('should return some minor (25%)', () => {
        expect(calculateSeverity(1, 70)).toBe('minor');
        expect(calculateSeverity(1, 85)).toBe('minor');
        expect(calculateSeverity(1, 94)).toBe('minor');
      });

      it('should return rare moderate (5%)', () => {
        expect(calculateSeverity(1, 95)).toBe('moderate');
        expect(calculateSeverity(1, 99)).toBe('moderate');
      });

      it('should never return dangerous or deadly', () => {
        for (let roll = 0; roll < 100; roll++) {
          const result = calculateSeverity(1, roll);
          expect(result).not.toBe('dangerous');
          expect(result).not.toBe('deadly');
        }
      });
    });

    describe('Danger Level 2 - Low danger regions', () => {
      it('should return mix of trivial (40%)', () => {
        expect(calculateSeverity(2, 0)).toBe('trivial');
        expect(calculateSeverity(2, 20)).toBe('trivial');
        expect(calculateSeverity(2, 39)).toBe('trivial');
      });

      it('should return mix of minor (40%)', () => {
        expect(calculateSeverity(2, 40)).toBe('minor');
        expect(calculateSeverity(2, 60)).toBe('minor');
        expect(calculateSeverity(2, 79)).toBe('minor');
      });

      it('should return moderate (15%)', () => {
        expect(calculateSeverity(2, 80)).toBe('moderate');
        expect(calculateSeverity(2, 90)).toBe('moderate');
        expect(calculateSeverity(2, 94)).toBe('moderate');
      });

      it('should return rare dangerous (5%)', () => {
        expect(calculateSeverity(2, 95)).toBe('dangerous');
        expect(calculateSeverity(2, 99)).toBe('dangerous');
      });

      it('should never return deadly', () => {
        for (let roll = 0; roll < 100; roll++) {
          expect(calculateSeverity(2, roll)).not.toBe('deadly');
        }
      });
    });

    describe('Danger Level 3 - Balanced regions', () => {
      it('should distribute evenly (20% each)', () => {
        expect(calculateSeverity(3, 10)).toBe('trivial'); // 0-19
        expect(calculateSeverity(3, 30)).toBe('minor'); // 20-39
        expect(calculateSeverity(3, 50)).toBe('moderate'); // 40-59
        expect(calculateSeverity(3, 70)).toBe('dangerous'); // 60-79
        expect(calculateSeverity(3, 90)).toBe('deadly'); // 80-99
      });

      it('should have all severity levels possible', () => {
        const results = new Set<Severity>();
        for (let roll = 0; roll < 100; roll++) {
          results.add(calculateSeverity(3, roll));
        }
        expect(results.size).toBe(5);
        expect(results.has('trivial')).toBe(true);
        expect(results.has('minor')).toBe(true);
        expect(results.has('moderate')).toBe(true);
        expect(results.has('dangerous')).toBe(true);
        expect(results.has('deadly')).toBe(true);
      });
    });

    describe('Danger Level 4 - High danger regions', () => {
      it('should skew toward dangerous/deadly', () => {
        expect(calculateSeverity(4, 5)).toBe('trivial'); // 10%
        expect(calculateSeverity(4, 15)).toBe('minor'); // 15%
        expect(calculateSeverity(4, 35)).toBe('moderate'); // 25%
        expect(calculateSeverity(4, 60)).toBe('dangerous'); // 35%
        expect(calculateSeverity(4, 90)).toBe('deadly'); // 15%
      });

      it('should rarely return trivial', () => {
        let trivialCount = 0;
        for (let roll = 0; roll < 100; roll++) {
          if (calculateSeverity(4, roll) === 'trivial') {
            trivialCount++;
          }
        }
        expect(trivialCount).toBe(10);
      });
    });

    describe('Danger Level 5 - Extreme danger regions', () => {
      it('should be mostly dangerous/deadly', () => {
        expect(calculateSeverity(5, 5)).toBe('trivial'); // 10%
        expect(calculateSeverity(5, 15)).toBe('minor'); // 10%
        expect(calculateSeverity(5, 25)).toBe('moderate'); // 15%
        expect(calculateSeverity(5, 45)).toBe('dangerous'); // 30%
        expect(calculateSeverity(5, 75)).toBe('deadly'); // 35%
      });

      it('should return deadly most frequently', () => {
        let deadlyCount = 0;
        for (let roll = 0; roll < 100; roll++) {
          if (calculateSeverity(5, roll) === 'deadly') {
            deadlyCount++;
          }
        }
        expect(deadlyCount).toBe(35);
      });
    });

    describe('Edge cases', () => {
      it('should clamp danger level below 1 to 1', () => {
        expect(calculateSeverity(0, 50)).toBe(calculateSeverity(1, 50));
        expect(calculateSeverity(-5, 50)).toBe(calculateSeverity(1, 50));
      });

      it('should clamp danger level above 5 to 5', () => {
        expect(calculateSeverity(6, 50)).toBe(calculateSeverity(5, 50));
        expect(calculateSeverity(10, 50)).toBe(calculateSeverity(5, 50));
      });

      it('should handle boundary rolls correctly', () => {
        expect(calculateSeverity(3, 0)).toBe('trivial');
        expect(calculateSeverity(3, 19)).toBe('trivial');
        expect(calculateSeverity(3, 20)).toBe('minor');
        expect(calculateSeverity(3, 99)).toBe('deadly');
      });
    });
  });

  describe('generateTravelEvent', () => {
    it('should generate event with correct session_id', () => {
      const event = generateTravelEvent(mockSession, mockRegions[1]);
      expect(event.session_id).toBe(mockSession.id);
    });

    it('should generate event with valid ID', () => {
      const event = generateTravelEvent(mockSession, mockRegions[1]);
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('string');
      expect(event.id.length).toBeGreaterThan(0);
    });

    it('should generate event with timestamp', () => {
      const event = generateTravelEvent(mockSession, mockRegions[1]);
      expect(event.created_at).toBeDefined();
      expect(new Date(event.created_at!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should generate events from correct severity pool', () => {
      const severities: Severity[] = ['trivial', 'minor', 'moderate', 'dangerous', 'deadly'];

      severities.forEach(severity => {
        const event = generateTravelEvent(mockSession, mockRegions[3], severity);
        expect(event.severity).toBe(severity);

        // Verify event exists in the corresponding pool
        const templateExists = ENCOUNTER_POOLS[severity].some(
          template =>
            template.type === event.type &&
            template.severity === event.severity
        );
        expect(templateExists).toBe(true);
      });
    });

    it('should calculate severity from danger level when not specified', () => {
      // Test with danger level 1 - should mostly generate trivial
      const events: TravelEvent[] = [];
      for (let i = 0; i < 100; i++) {
        events.push(generateTravelEvent(mockSession, mockRegions[1]));
      }

      const trivialCount = events.filter(e => e.severity === 'trivial').length;
      const minorCount = events.filter(e => e.severity === 'minor').length;

      // Should be mostly trivial (expect ~70 but allow variance)
      expect(trivialCount).toBeGreaterThan(50);
      // Should have some minor (expect ~25 but allow variance)
      expect(minorCount).toBeGreaterThan(10);
    });

    it('should set requires_response correctly based on template', () => {
      const trivialEvent = generateTravelEvent(mockSession, mockRegions[1], 'trivial');
      expect(trivialEvent.requires_response).toBe(false);

      const deadlyEvent = generateTravelEvent(mockSession, mockRegions[5], 'deadly');
      expect(deadlyEvent.requires_response).toBe(true);
    });

    it('should include choices when template has them', () => {
      const moderateEvent = generateTravelEvent(mockSession, mockRegions[3], 'moderate');

      // Some moderate events have choices
      if (moderateEvent.choices) {
        expect(Array.isArray(moderateEvent.choices)).toBe(true);
        expect(moderateEvent.choices.length).toBeGreaterThan(0);

        moderateEvent.choices.forEach(choice => {
          expect(choice.label).toBeDefined();
          expect(choice.consequence).toBeDefined();
        });
      }
    });

    it('should mark event as unresolved initially', () => {
      const event = generateTravelEvent(mockSession, mockRegions[2]);
      expect(event.resolved).toBe(false);
    });
  });

  describe('autoResolveEvent', () => {
    it('should generate narration for trivial events', () => {
      const trivialEvent = generateTravelEvent(mockSession, mockRegions[1], 'trivial');
      const narration = autoResolveEvent(trivialEvent);

      expect(narration).toBeDefined();
      expect(typeof narration).toBe('string');
      expect(narration.length).toBeGreaterThan(0);
    });

    it('should throw error for non-trivial events', () => {
      const minorEvent = generateTravelEvent(mockSession, mockRegions[2], 'minor');
      expect(() => autoResolveEvent(minorEvent)).toThrow();

      const moderateEvent = generateTravelEvent(mockSession, mockRegions[3], 'moderate');
      expect(() => autoResolveEvent(moderateEvent)).toThrow();

      const dangerousEvent = generateTravelEvent(mockSession, mockRegions[4], 'dangerous');
      expect(() => autoResolveEvent(dangerousEvent)).toThrow();

      const deadlyEvent = generateTravelEvent(mockSession, mockRegions[5], 'deadly');
      expect(() => autoResolveEvent(deadlyEvent)).toThrow();
    });

    it('should generate contextual narration based on event type', () => {
      const eventTypes = ['merchant', 'landmark', 'weather', 'traveler'];

      eventTypes.forEach(type => {
        // Find a trivial event of this type
        const template = ENCOUNTER_POOLS.trivial.find(t => t.type === type);
        if (template) {
          const event: TravelEvent = {
            id: 'test-id',
            session_id: mockSession.id,
            type: template.type,
            severity: 'trivial',
            description: template.description,
            requires_response: false,
            resolved: false,
          };

          const narration = autoResolveEvent(event);
          expect(narration).toBeDefined();
          expect(narration.length).toBeGreaterThan(10);
        }
      });
    });

    it('should handle unknown event types gracefully', () => {
      const unknownEvent: TravelEvent = {
        id: 'test-id',
        session_id: mockSession.id,
        type: 'encounter' as any, // Use an event type not in trivial pool
        severity: 'trivial',
        description: 'Unknown event',
        requires_response: false,
        resolved: false,
      };

      const narration = autoResolveEvent(unknownEvent);
      expect(narration).toBeDefined();
      expect(typeof narration).toBe('string');
    });
  });

  describe('generateTravelEventWithResolution', () => {
    it('should auto-resolve trivial events', () => {
      const result = generateTravelEventWithResolution(mockSession, mockRegions[1], 'trivial');

      expect(result.auto_resolved).toBe(true);
      expect(result.event.resolved).toBe(true);
      expect(result.event.resolution).toBeDefined();
      expect(result.narration).toBeDefined();
      expect(result.narration).toBe(result.event.resolution);
    });

    it('should not auto-resolve events that require response', () => {
      const severities: Severity[] = ['minor', 'moderate', 'dangerous', 'deadly'];

      severities.forEach(severity => {
        const result = generateTravelEventWithResolution(mockSession, mockRegions[3], severity);

        if (result.event.requires_response) {
          expect(result.auto_resolved).toBe(false);
          expect(result.event.resolved).toBe(false);
          expect(result.narration).toBeUndefined();
        }
      });
    });

    it('should return complete result structure', () => {
      const result = generateTravelEventWithResolution(mockSession, mockRegions[2]);

      expect(result).toHaveProperty('event');
      expect(result).toHaveProperty('auto_resolved');
      expect(result.event).toHaveProperty('id');
      expect(result.event).toHaveProperty('session_id');
      expect(result.event).toHaveProperty('type');
      expect(result.event).toHaveProperty('severity');
      expect(result.event).toHaveProperty('description');
      expect(result.event).toHaveProperty('requires_response');
    });
  });

  describe('Integration tests', () => {
    it('should generate different events from same pool', () => {
      const events = new Set<string>();

      // Generate 50 events and verify we get variety
      for (let i = 0; i < 50; i++) {
        const event = generateTravelEvent(mockSession, mockRegions[3], 'moderate');
        events.add(`${event.type}-${event.description.substring(0, 20)}`);
      }

      // Should have at least 2 different event types (with 4 templates, very likely)
      expect(events.size).toBeGreaterThanOrEqual(2);
    });

    it('should handle full workflow from generation to resolution', () => {
      // Generate event
      const event = generateTravelEvent(mockSession, mockRegions[1], 'trivial');

      // Verify structure
      expect(event.id).toBeDefined();
      expect(event.severity).toBe('trivial');
      expect(event.resolved).toBe(false);

      // Auto-resolve
      const narration = autoResolveEvent(event);

      // Verify resolution
      expect(narration).toBeDefined();
      expect(typeof narration).toBe('string');
    });

    it('should respect danger level distributions over large sample', () => {
      const sampleSize = 1000;
      const severityCounts: Record<Severity, number> = {
        trivial: 0,
        minor: 0,
        moderate: 0,
        dangerous: 0,
        deadly: 0,
      };

      // Generate many events for danger level 3
      for (let i = 0; i < sampleSize; i++) {
        const event = generateTravelEvent(mockSession, mockRegions[3]);
        severityCounts[event.severity]++;
      }

      // For danger level 3, expect roughly 20% each (allow 15-25% range for variance)
      Object.values(severityCounts).forEach(count => {
        const percentage = (count / sampleSize) * 100;
        expect(percentage).toBeGreaterThan(15);
        expect(percentage).toBeLessThan(25);
      });
    });
  });
});
