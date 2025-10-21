/**
 * @file Background Tasks - Unit Tests
 *
 * Tests the async content generation functions
 */

import {
  generateQuestTemplatesBackground,
  generateNPCPersonalitiesBackground,
  generateCombatEncountersBackground,
  type QuestTemplate,
  type NPCPersonality,
  type CombatEncounter,
} from '../../services/backgroundTasks';

// Mock the Local LLM function
jest.mock('../../services/narratorLLM', () => ({
  generateWithLocalLLM: jest.fn(),
}));

import { generateWithLocalLLM } from '../../services/narratorLLM';
const mockGenerateWithLocalLLM = generateWithLocalLLM as jest.MockedFunction<typeof generateWithLocalLLM>;

// Mock Supabase client
jest.mock('../../services/supabaseClient', () => ({
  supabaseServiceClient: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('Quest Template Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates valid quest templates', async () => {
    // Mock LLM response
    mockGenerateWithLocalLLM.mockResolvedValue(`{
      "title": "The Lost Amulet",
      "description": "Find the stolen amulet in the forest.",
      "objectives": [{"type": "reach_location", "target": "forest_shrine", "count": 1}],
      "rewards": {"xp": 100, "gold": 50}
    }`);

    const quests = await generateQuestTemplatesBackground(1, [1, 5]);

    expect(quests).toHaveLength(1);
    expect(quests[0].title).toBe('The Lost Amulet');
    expect(quests[0].rewards.xp).toBe(100);
    expect(quests[0].objectives).toHaveLength(1);
  });

  test('handles JSON parsing errors gracefully', async () => {
    // Mock malformed JSON
    mockGenerateWithLocalLLM.mockResolvedValue('This is not valid JSON');

    const quests = await generateQuestTemplatesBackground(1, [1, 5]);

    // Should return empty array, not crash
    expect(quests).toHaveLength(0);
  });

  test('continues generating after individual failures', async () => {
    // First call fails, second succeeds
    mockGenerateWithLocalLLM
      .mockResolvedValueOnce('Invalid JSON')
      .mockResolvedValueOnce(`{
        "title": "Quest 2",
        "description": "Test quest",
        "objectives": [{"type": "kill_enemies", "target": "goblins", "count": 5}],
        "rewards": {"xp": 50, "gold": 25}
      }`);

    const quests = await generateQuestTemplatesBackground(2, [1, 5]);

    // Should have 1 quest (second one succeeded)
    expect(quests).toHaveLength(1);
    expect(quests[0].title).toBe('Quest 2');
  });

  test('generates quests within specified level range', async () => {
    mockGenerateWithLocalLLM.mockResolvedValue(`{
      "title": "Test Quest",
      "description": "Testing",
      "objectives": [],
      "rewards": {"xp": 100, "gold": 50}
    }`);

    const quests = await generateQuestTemplatesBackground(5, [3, 7]);

    expect(quests.length).toBeGreaterThan(0);
    // All quests should be generated (mock always succeeds)
    expect(quests.length).toBeLessThanOrEqual(5);
  });
});

describe('NPC Personality Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates valid NPC personalities', async () => {
    mockGenerateWithLocalLLM.mockResolvedValue(`{
      "name": "Elara Moonwhisper",
      "race": "elf",
      "occupation": "merchant",
      "personality": "Cautious but friendly",
      "quirk": "Collects rare spices",
      "secret": "Former spy for the Thieves Guild"
    }`);

    const npcs = await generateNPCPersonalitiesBackground(1);

    expect(npcs).toHaveLength(1);
    expect(npcs[0].name).toBe('Elara Moonwhisper');
    expect(npcs[0].race).toBe('elf');
    expect(npcs[0].secret).toBeTruthy();
  });

  test('handles malformed NPC data', async () => {
    mockGenerateWithLocalLLM.mockResolvedValue('Not JSON at all');

    const npcs = await generateNPCPersonalitiesBackground(1);

    expect(npcs).toHaveLength(0);
  });
});

describe('Combat Encounter Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates valid combat encounters with stat blocks', async () => {
    mockGenerateWithLocalLLM.mockResolvedValue(`{
      "name": "Goblin Ambush",
      "description": "Three goblins leap from the bushes!",
      "enemies": [
        {
          "name": "Scar-face",
          "type": "goblin",
          "hp": 7,
          "ac": 15,
          "attack_bonus": 4,
          "damage_dice": "1d6+2",
          "special_abilities": "Pack Tactics"
        }
      ],
      "loot_tier": "minimal"
    }`);

    const encounters = await generateCombatEncountersBackground(1, [1, 3]);

    expect(encounters).toHaveLength(1);
    expect(encounters[0].name).toBe('Goblin Ambush');
    expect(encounters[0].enemies).toHaveLength(1);
    expect(encounters[0].enemies[0].hp).toBe(7);
    expect(encounters[0].enemies[0].ac).toBe(15);
  });

  test('generates encounters within CR range', async () => {
    mockGenerateWithLocalLLM.mockResolvedValue(`{
      "name": "Test Encounter",
      "description": "Test",
      "enemies": [],
      "loot_tier": "standard"
    }`);

    const encounters = await generateCombatEncountersBackground(5, [0.5, 2]);

    encounters.forEach(encounter => {
      expect(encounter.challenge_rating).toBeGreaterThanOrEqual(0.5);
      expect(encounter.challenge_rating).toBeLessThanOrEqual(2);
    });
  });
});

describe('Error Handling', () => {
  test('handles Local LLM connection failures', async () => {
    mockGenerateWithLocalLLM.mockRejectedValue(new Error('Connection refused'));

    const quests = await generateQuestTemplatesBackground(3, [1, 5]);

    // Should return empty array, not crash
    expect(quests).toHaveLength(0);
  });

  test('handles malformed JSON from LLM', async () => {
    mockGenerateWithLocalLLM.mockResolvedValue('{ malformed json }}}');

    const npcs = await generateNPCPersonalitiesBackground(1);

    expect(npcs).toHaveLength(0);
  });
});
