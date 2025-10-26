/**
 * @file characterSubmit.test.ts
 * @description Tests for character submission service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitCharacter, type CharacterDraft } from '../characterSubmit';
import { supabase } from '../../lib/supabase';

// Mock the supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockCharacterDraft: CharacterDraft = {
  name: 'Test Character',
  race: 'Human',
  class: 'Fighter',
  background: 'Soldier',
  alignment: 'Lawful Good',
  gender: 'Male',
  abilityScores: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 10,
    WIS: 12,
    CHA: 8,
  },
  skills: ['Athletics', 'Intimidation'],
  backstory: {
    ideal: 'Protect the innocent',
    bond: 'My squad is my family',
    flaw: 'I follow orders without question',
  },
  equipment: ['Chain Mail', 'Longsword', 'Shield'],
  gold: 100,
  portraitUrl: 'https://example.com/portrait.jpg',
  appearance: 'A weathered soldier with a stern expression',
};

const mockSession = {
  access_token: 'mock-access-token-123',
  refresh_token: 'mock-refresh-token-456',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
};

const mockCreatedCharacter = {
  id: 'char-789',
  user_id: 'user-123',
  name: 'Test Character',
  race: 'Human',
  class: 'Fighter',
  background: 'Soldier',
  alignment: 'Lawful Good',
  level: 1,
  xp: 0,
  gold: 100,
  ability_scores: mockCharacterDraft.abilityScores,
  hp_max: 10,
  hp_current: 10,
  temporary_hp: 0,
  armor_class: 16,
  speed: 30,
  position_x: 500,
  position_y: 500,
  campaign_seed: 'nuaibria-shared-world-v1',
  game_time_minutes: 0,
  world_date_day: 1,
  world_date_month: 1,
  world_date_year: 0,
  spell_slots: {},
  backstory: JSON.stringify(mockCharacterDraft.backstory),
  skills: JSON.stringify(mockCharacterDraft.skills),
  portrait_url: mockCharacterDraft.portraitUrl,
  proficiency_bonus: 2,
};

describe('submitCharacter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully submits character data to the API', async () => {
    // Mock session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    // Mock successful API response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreatedCharacter,
    } as Response);

    const result = await submitCharacter(mockCharacterDraft, 'user-123');

    expect(result).toEqual(mockCreatedCharacter);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/characters',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockSession.access_token}`,
        },
        body: expect.stringContaining('"name":"Test Character"'),
      })
    );
  });

  it('sends correct character data format to API', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreatedCharacter,
    } as Response);

    await submitCharacter(mockCharacterDraft, 'user-123');

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1]?.body as string);

    expect(requestBody).toMatchObject({
      name: 'Test Character',
      race: 'Human',
      class: 'Fighter',
      background: 'Soldier',
      alignment: 'Lawful Good',
      ability_scores: mockCharacterDraft.abilityScores,
      skills: mockCharacterDraft.skills,
      backstory: mockCharacterDraft.backstory,
      portrait_url: mockCharacterDraft.portraitUrl,
    });
  });

  it('throws error when user is not logged in', async () => {
    // Mock no session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow(
      'You must be logged in to create a character'
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('throws error when API returns 400 with JSON error', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Invalid ability scores' }),
    } as Response);

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow(
      'Invalid ability scores'
    );
  });

  it('throws error when API returns 500', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Database error' }),
    } as Response);

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow(
      'Database error'
    );
  });

  it('handles HTML error responses (502 from proxy)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      headers: new Headers({ 'content-type': 'text/html' }),
      json: async () => {
        throw new Error('Not JSON');
      },
    } as Response);

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow(
      'Backend service error (502 Bad Gateway)'
    );
  });

  it('uses default error message when response has no error field', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    } as Response);

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow(
      'Server error (500)'
    );
  });

  it('handles network errors', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow(
      'Network error'
    );
  });

  it('logs successful character creation', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreatedCharacter,
    } as Response);

    await submitCharacter(mockCharacterDraft, 'user-123');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[CharacterSubmit] Character created:'),
      'char-789'
    );

    consoleSpy.mockRestore();
  });

  it('logs errors during submission', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(global.fetch).mockRejectedValue(new Error('Test error'));

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[CharacterSubmit] Submission failed:',
      'Test error'
    );

    consoleErrorSpy.mockRestore();
  });

  it('handles unknown error types', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    // Throw a non-Error object
    vi.mocked(global.fetch).mockRejectedValue('String error');

    await expect(submitCharacter(mockCharacterDraft, 'user-123')).rejects.toThrow(
      'Failed to create character: Unknown error'
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[CharacterSubmit] Unknown error:',
      'String error'
    );

    consoleErrorSpy.mockRestore();
  });
});
