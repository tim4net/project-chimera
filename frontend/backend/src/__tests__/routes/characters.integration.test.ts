/**
 * Integration tests for POST /api/characters endpoint
 *
 * Test-Driven Development: These tests are written BEFORE implementation.
 * They will initially fail and pass once backend refactor is complete.
 *
 * Coverage:
 * - Happy path (3 tests)
 * - Validation (5 tests)
 * - Database integration (3 tests)
 * - Racial bonuses (2 tests)
 * - Portrait generation (2 tests)
 * - Error handling (1 test)
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

// Mock Supabase client
const mockSupabaseInsert = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseSingle = jest.fn();
const mockSupabaseFrom = jest.fn(() => ({
  insert: mockSupabaseInsert,
  select: mockSupabaseSelect,
  single: mockSupabaseSingle
}));

jest.mock('../../services/supabaseClient', () => ({
  supabaseServiceClient: {
    from: mockSupabaseFrom
  }
}));

// Mock image generation service
const mockGenerateImage = jest.fn();
jest.mock('../../services/imageGeneration', () => ({
  generateImage: mockGenerateImage
}));

// Mock character creation service
const mockCreateCharacter = jest.fn();
jest.mock('../../services/characterCreation', () => ({
  createCharacter: mockCreateCharacter
}));

describe('POST /api/characters - Integration Tests', () => {
  const mockToken = 'mock-jwt-token-12345';
  const mockUserId = 'user-abc-123';

  // Valid character request payload
  const validCharacterPayload = {
    name: 'Aragorn',
    race: 'Human',
    class: 'Ranger',
    background: 'Soldier',
    alignment: 'Lawful Good',
    ability_scores: {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 10,
      WIS: 12,
      CHA: 11
    },
    skills: ['Survival', 'Perception'],
    portrait_url: null
  };

  // Mock character response from database
  const mockCharacterResponse = {
    id: 'char-xyz-789',
    ...validCharacterPayload,
    user_id: mockUserId,
    created_at: '2025-10-26T12:00:00Z',
    starting_position: { x: 0, y: 0, region: 'Starting Area' },
    racial_bonus: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    mockSupabaseInsert.mockReturnThis();
    mockSupabaseSelect.mockReturnThis();
    mockSupabaseSingle.mockResolvedValue({
      data: mockCharacterResponse,
      error: null
    });

    mockGenerateImage.mockResolvedValue({
      imageUrl: 'https://example.com/portrait.png'
    });

    mockCreateCharacter.mockResolvedValue(mockCharacterResponse);

    // Mock environment variables
    process.env.AUTO_GENERATE_PORTRAITS = 'true';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===================================================================
  // SECTION 1: HAPPY PATH TESTS (3 tests)
  // ===================================================================

  describe('Happy Path', () => {
    it('should create character with all required fields', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validCharacterPayload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Aragorn',
        race: 'Human',
        class: 'Ranger',
        background: 'Soldier',
        alignment: 'Lawful Good',
        ability_scores: validCharacterPayload.ability_scores
      });
      expect(response.body.user_id).toBe(mockUserId);
    });

    it('should return 201 Created status', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validCharacterPayload);

      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return character ID and created_at timestamp', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validCharacterPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body.id).toBeTruthy();
      expect(response.body.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ===================================================================
  // SECTION 2: VALIDATION TESTS (5 tests)
  // ===================================================================

  describe('Validation', () => {
    it('should reject missing required field: name', async () => {
      const invalidPayload = { ...validCharacterPayload };
      delete invalidPayload.name;

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/name/i);
    });

    it('should reject invalid ability scores (not 27 point budget)', async () => {
      const invalidPayload = {
        ...validCharacterPayload,
        ability_scores: {
          STR: 18, // Too high for point buy
          DEX: 18,
          CON: 18,
          INT: 18,
          WIS: 18,
          CHA: 18
        }
      };

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/ability scores|point buy|27 points/i);
    });

    it('should reject invalid race/class/background', async () => {
      const invalidPayload = {
        ...validCharacterPayload,
        race: 'InvalidRace',
        class: 'InvalidClass',
        background: 'InvalidBackground'
      };

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/race|class|background/i);
    });

    it('should reject invalid alignment', async () => {
      const invalidPayload = {
        ...validCharacterPayload,
        alignment: 'Chaotic Silly' // Not a valid D&D alignment
      };

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/alignment/i);
    });

    it('should return 400 Bad Request with descriptive error message', async () => {
      const invalidPayload = {
        name: '', // Empty name
        race: 'Human',
        class: 'Ranger'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBeTruthy();
      expect(typeof response.body.error).toBe('string');
      expect(response.body.error.length).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // SECTION 3: DATABASE TESTS (3 tests)
  // ===================================================================

  describe('Database Integration', () => {
    it('should insert character into database', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validCharacterPayload);

      expect(response.status).toBe(201);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('characters');
      expect(mockSupabaseInsert).toHaveBeenCalled();

      // Verify insert was called with character data
      const insertCall = mockSupabaseInsert.mock.calls[0];
      expect(insertCall).toBeDefined();
      expect(insertCall[0]).toMatchObject({
        name: 'Aragorn',
        race: 'Human',
        class: 'Ranger'
      });
    });

    it('should return character with correct user_id', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validCharacterPayload);

      expect(response.status).toBe(201);
      expect(response.body.user_id).toBe(mockUserId);
      expect(response.body.user_id).toBeTruthy();
    });

    it('should set starting position correctly', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validCharacterPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('starting_position');
      expect(response.body.starting_position).toMatchObject({
        x: expect.any(Number),
        y: expect.any(Number),
        region: expect.any(String)
      });
    });
  });

  // ===================================================================
  // SECTION 4: RACIAL BONUS TESTS (2 tests)
  // ===================================================================

  describe('Racial Bonuses', () => {
    it('should apply Dwarf racial bonus (+2 CON) correctly', async () => {
      const dwarfPayload = {
        ...validCharacterPayload,
        race: 'Dwarf',
        ability_scores: {
          STR: 15,
          DEX: 10,
          CON: 13, // Base CON
          INT: 10,
          WIS: 12,
          CHA: 11
        }
      };

      const dwarfResponse = {
        ...mockCharacterResponse,
        race: 'Dwarf',
        ability_scores: dwarfPayload.ability_scores,
        racial_bonus: { STR: 0, DEX: 0, CON: 2, INT: 0, WIS: 0, CHA: 0 }
      };

      mockSupabaseSingle.mockResolvedValueOnce({
        data: dwarfResponse,
        error: null
      });

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(dwarfPayload);

      expect(response.status).toBe(201);
      expect(response.body.racial_bonus).toBeDefined();
      expect(response.body.racial_bonus.CON).toBe(2);

      // Verify final CON is base + bonus
      const finalCon = response.body.ability_scores.CON + response.body.racial_bonus.CON;
      expect(finalCon).toBe(15); // 13 + 2
    });

    it('should apply Human racial bonus (+1 all abilities) correctly', async () => {
      const humanPayload = {
        ...validCharacterPayload,
        race: 'Human'
      };

      const humanResponse = {
        ...mockCharacterResponse,
        race: 'Human',
        racial_bonus: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }
      };

      mockSupabaseSingle.mockResolvedValueOnce({
        data: humanResponse,
        error: null
      });

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(humanPayload);

      expect(response.status).toBe(201);
      expect(response.body.racial_bonus).toBeDefined();
      expect(response.body.racial_bonus).toMatchObject({
        STR: 1,
        DEX: 1,
        CON: 1,
        INT: 1,
        WIS: 1,
        CHA: 1
      });
    });
  });

  // ===================================================================
  // SECTION 5: PORTRAIT GENERATION TESTS (2 tests)
  // ===================================================================

  describe('Portrait Generation', () => {
    it('should generate portrait when AUTO_GENERATE_PORTRAITS=true', async () => {
      process.env.AUTO_GENERATE_PORTRAITS = 'true';

      const payloadWithoutPortrait = {
        ...validCharacterPayload,
        portrait_url: null
      };

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payloadWithoutPortrait);

      expect(response.status).toBe(201);
      expect(mockGenerateImage).toHaveBeenCalled();

      // Verify image generation was called with character details
      const generateCall = mockGenerateImage.mock.calls[0];
      expect(generateCall).toBeDefined();
      expect(generateCall[0]).toMatch(/Aragorn|Human|Ranger/i);
    });

    it('should skip portrait generation when portrait_url already provided', async () => {
      const payloadWithPortrait = {
        ...validCharacterPayload,
        portrait_url: 'https://example.com/custom-portrait.png'
      };

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payloadWithPortrait);

      expect(response.status).toBe(201);
      expect(mockGenerateImage).not.toHaveBeenCalled();
      expect(response.body.portrait_url).toBe('https://example.com/custom-portrait.png');
    });
  });

  // ===================================================================
  // SECTION 6: ERROR HANDLING TEST (1 test)
  // ===================================================================

  describe('Error Handling', () => {
    it('should return 500 with context on database error', async () => {
      // Mock database error
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Database connection failed',
          code: 'PGRST301'
        }
      });

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validCharacterPayload);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/database|failed|error/i);

      // Should include helpful context
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });
});
