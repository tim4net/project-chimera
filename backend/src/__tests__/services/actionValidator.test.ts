import { validateAction } from '../../services/actionValidator';
import type { CharacterRecord } from '../../types';
import type { ConversationAction } from '../../types/actions';

jest.mock('../../services/gemini', () => ({
  generateText: jest.fn()
}));

jest.mock('../../services/supabaseClient', () => ({
  supabaseServiceClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

const { generateText } = require('../../services/gemini') as { generateText: jest.Mock };

const buildCharacter = (): CharacterRecord => ({
  id: 'char-1',
  user_id: 'user-1',
  name: 'Test Rogue',
  race: 'Human',
  class: 'Rogue',
  background: 'Urchin',
  alignment: 'Neutral',
  level: 1,
  xp: 0,
  gold: 0,
  ability_scores: { STR: 10, DEX: 14, CON: 12, INT: 11, WIS: 10, CHA: 13 },
  hp_max: 10,
  hp_current: 10,
  temporary_hp: 0,
  armor_class: 12,
  speed: 30,
  hit_dice: { d8: 1 },
  position: { x: 0, y: 0 },
  campaign_seed: 'seed',
  spell_slots: {},
  backstory: null,
  skills: null,
  portrait_url: null,
  proficiency_bonus: 2
});

const buildConversationAction = (): ConversationAction => ({
  type: 'CONVERSATION',
  actionId: 'action-1',
  actorId: 'char-1',
  timestamp: Date.now()
});

describe('ActionValidator fallbacks', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('uses local LLM when available', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isValid: true,
                reason: 'Local ok'
              })
            }
          }
        ]
      })
    } as any);

    const result = await validateAction(buildConversationAction(), buildCharacter(), "let's go to millhaven");

    expect(result.isValid).toBe(true);
    expect(result.reason).toBe('Local ok');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(generateText).not.toHaveBeenCalled();
  });

  it('falls back to Gemini when local LLM fails', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));
    generateText.mockResolvedValue('{"isValid":true,"reason":"Gemini ok","suggestion":"Try town"}');

    const result = await validateAction(buildConversationAction(), buildCharacter(), "let's go to millhaven");

    expect(result.isValid).toBe(true);
    expect(result.reason).toBe('Gemini ok');
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it('returns failure message when both local and Gemini fail', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));
    generateText.mockRejectedValue(new Error('Gemini down'));

    const result = await validateAction(buildConversationAction(), buildCharacter(), "let's go to millhaven");

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("I'm having trouble validating that action right now.");
    expect(generateText).toHaveBeenCalledTimes(1);
  });
});
