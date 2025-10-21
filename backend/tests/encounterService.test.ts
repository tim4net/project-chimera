jest.mock('../src/services/encounterGenerationService', () => ({
  encounterGenerationService: {
    generateEncounter: jest.fn(async () => ({
      id: 'enc-1',
      name: 'Mock Encounter',
      type: 'weather_event',
      subtype: 'desert_storm',
      description: 'A furious gale rips across the dunes.',
      npcMotivations: ['seek shelter'],
      hook: 'Do you hunker down or trudge forward?',
      tone: 'urgent'
    }))
  }
}));

import { encounterGenerationService } from '../src/services/encounterGenerationService';
import { EncounterService, __test__ } from '../src/services/encounterService';
import type { TravelEncounterContext } from '../src/types/encounter-types';

describe('EncounterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prioritizes biome-specific encounters in deserts', async () => {
    const service = new EncounterService();

    const context: TravelEncounterContext = {
      campaignSeed: 'seed-desert',
      characterId: 'char-1',
      position: { x: 100, y: -50 },
      biome: 'desert',
      timeOfDay: 'night',
      distance: 100,
      onRoad: false,
      roadDanger: 'dangerous'
    };

    const selection = __test__.selectEncounterType(context);
    expect(selection.type).toBe('weather_event');
    expect(selection.subtype).toBe('desert_storm');

    const desertService = new EncounterService();
    await desertService.evaluateTravelEncounter(context);
  });

  it('escalates encounters on dangerous roads', async () => {
    (encounterGenerationService.generateEncounter as jest.Mock).mockResolvedValue({
      id: 'enc-2',
      name: 'Bandit Snare',
      type: 'road_hazard',
      subtype: 'bandit_ambush',
      description: 'Bandits spring from the roadside.',
      npcMotivations: ['profit'],
      hook: 'Do you parley or fight?',
      tone: 'urgent'
    });

    const context: TravelEncounterContext = {
      campaignSeed: 'seed-road',
      characterId: 'char-2',
      position: { x: 0, y: 0 },
      biome: 'plains',
      timeOfDay: 'dusk',
      distance: 20,
      onRoad: true,
      roadDanger: 'dangerous'
    };

    const selection = __test__.selectEncounterType(context);
    expect(selection.type).toBe('road_hazard');
    expect(selection.subtype).toBe('bandit_ambush');

    const roadService = new EncounterService();
    await roadService.evaluateTravelEncounter(context);

    expect(encounterGenerationService.generateEncounter).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'road_hazard', subtype: 'bandit_ambush' })
    );
  });
});
jest.mock('../src/services/supabaseClient', () => ({
  supabaseServiceClient: {}
}));
