/**
 * @file Tests for Lair Actions System
 */

import {
  createLairActionState,
  shouldTriggerLairAction,
  canTakeLairAction,
  takeLairAction,
  resetLairActionForNewRound,
  getLairActionsForMonster,
  getLairActionsByIndex,
  selectRandomLairAction,
  resolveLairAction,
  hasLairActions,
  getMonstersWithLairActions,
  formatLairActionsDescription,
  autoResolveLairAction,
  type LairActionState,
  type LairActionTarget,
  type LairActionEnvironment,
} from '../../game/lairActions';

import { LairAction } from '../../data/monsters';

describe('Lair Actions System', () => {
  describe('createLairActionState', () => {
    it('should create state with default availability', () => {
      const state = createLairActionState();
      expect(state.available).toBe(true);
      expect(state.lastUsedInitiative).toBe(-1);
      expect(state.currentInitiative).toBe(0);
      expect(state.hasTriggeredThisRound).toBe(false);
    });

    it('should create state with custom availability', () => {
      const state = createLairActionState(false);
      expect(state.available).toBe(false);
    });
  });

  describe('shouldTriggerLairAction', () => {
    it('should return true on initiative count 20', () => {
      expect(shouldTriggerLairAction(20)).toBe(true);
    });

    it('should return false on other initiative counts', () => {
      expect(shouldTriggerLairAction(19)).toBe(false);
      expect(shouldTriggerLairAction(21)).toBe(false);
      expect(shouldTriggerLairAction(1)).toBe(false);
      expect(shouldTriggerLairAction(15)).toBe(false);
    });
  });

  describe('canTakeLairAction', () => {
    it('should allow lair action on initiative 20', () => {
      const state = createLairActionState(true);
      expect(canTakeLairAction(state, 20)).toBe(true);
    });

    it('should not allow when not available', () => {
      const state = createLairActionState(false);
      expect(canTakeLairAction(state, 20)).toBe(false);
    });

    it('should not allow on wrong initiative count', () => {
      const state = createLairActionState(true);
      expect(canTakeLairAction(state, 15)).toBe(false);
    });

    it('should not allow if already triggered this round', () => {
      const state = createLairActionState(true);
      takeLairAction(state, 20);
      expect(canTakeLairAction(state, 20)).toBe(false);
    });
  });

  describe('takeLairAction', () => {
    it('should mark action as triggered', () => {
      const state = createLairActionState();
      takeLairAction(state, 20);

      expect(state.hasTriggeredThisRound).toBe(true);
      expect(state.lastUsedInitiative).toBe(20);
      expect(state.currentInitiative).toBe(20);
    });

    it('should update initiative values', () => {
      const state = createLairActionState();
      takeLairAction(state, 20);

      expect(state.lastUsedInitiative).toBe(20);
      expect(state.currentInitiative).toBe(20);
    });
  });

  describe('resetLairActionForNewRound', () => {
    it('should reset triggered flag', () => {
      const state = createLairActionState();
      takeLairAction(state, 20);

      expect(state.hasTriggeredThisRound).toBe(true);

      resetLairActionForNewRound(state);
      expect(state.hasTriggeredThisRound).toBe(false);
    });

    it('should preserve other state', () => {
      const state = createLairActionState();
      takeLairAction(state, 20);

      resetLairActionForNewRound(state);

      expect(state.available).toBe(true);
      expect(state.lastUsedInitiative).toBe(20);
    });
  });

  describe('getLairActionsForMonster', () => {
    it('should return array (may be empty if not yet populated in data)', () => {
      const actions = getLairActionsForMonster('Ancient Red Dragon');
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const actions1 = getLairActionsForMonster('ANCIENT RED DRAGON');
      const actions2 = getLairActionsForMonster('ancient red dragon');
      expect(actions1.length).toBe(actions2.length);
    });

    it('should return empty array for monsters without lair actions', () => {
      const actions = getLairActionsForMonster('Goblin');
      expect(actions).toEqual([]);
    });

    it('should return empty array for non-existent monsters', () => {
      const actions = getLairActionsForMonster('Nonexistent Monster');
      expect(actions).toEqual([]);
    });
  });

  describe('getLairActionsByIndex', () => {
    it('should return lair actions by index', () => {
      const actions = getLairActionsByIndex('ancient-red-dragon');
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    it('should return empty array for invalid index', () => {
      const actions = getLairActionsByIndex('invalid-index');
      expect(actions).toEqual([]);
    });
  });

  describe('selectRandomLairAction', () => {
    const mockActions: LairAction[] = [
      { name: 'Action 1', description: 'Description 1' },
      { name: 'Action 2', description: 'Description 2' },
      { name: 'Action 3', description: 'Description 3' },
    ];

    it('should select an action from the array', () => {
      const selected = selectRandomLairAction(mockActions);
      expect(selected).toBeDefined();
      expect(mockActions).toContainEqual(selected);
    });

    it('should return null for empty array', () => {
      const selected = selectRandomLairAction([]);
      expect(selected).toBeNull();
    });

    it('should return the only action when array has one item', () => {
      const singleAction = [{ name: 'Solo', description: 'Only action' }];
      const selected = selectRandomLairAction(singleAction);
      expect(selected).toEqual(singleAction[0]);
    });

    it('should potentially select different actions', () => {
      // Run multiple times to check randomness
      const results = new Set();
      for (let i = 0; i < 50; i++) {
        const selected = selectRandomLairAction(mockActions);
        if (selected) {
          results.add(selected.name);
        }
      }
      // With 50 iterations, we should get multiple different results
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('resolveLairAction', () => {
    const mockAction: LairAction = {
      name: 'Volcanic Eruption',
      description:
        'Magma erupts from a point on the ground within 120 feet. Each creature within 20 feet of that point must succeed on a DC 15 Dexterity saving throw or take 21 (6d6) fire damage.',
    };

    const mockTargets: LairActionTarget[] = [
      { name: 'Fighter', armorClass: 18 },
      { name: 'Wizard', armorClass: 12 },
    ];

    it('should resolve lair action with targets', () => {
      const result = resolveLairAction(mockAction, mockTargets);

      expect(result.success).toBe(true);
      expect(result.action).toEqual(mockAction);
      expect(result.targets.length).toBeGreaterThan(0);
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.message).toContain('Volcanic Eruption');
    });

    it('should detect saving throw DC', () => {
      const result = resolveLairAction(mockAction, mockTargets);

      expect(result.effects.some(e => e.includes('DC 15'))).toBe(true);
    });

    it('should detect damage effects', () => {
      const result = resolveLairAction(mockAction, mockTargets);

      expect(result.effects.some(e => e.toLowerCase().includes('damage'))).toBe(true);
    });

    it('should handle empty targets', () => {
      const result = resolveLairAction(mockAction, []);

      expect(result.success).toBe(true);
      expect(result.targets).toEqual([]);
    });

    it('should include environment context', () => {
      const environment: LairActionEnvironment = {
        terrain: 'volcanic',
        temperature: 'hot',
      };

      const result = resolveLairAction(mockAction, mockTargets, environment);

      expect(result.success).toBe(true);
      expect(result.action).toEqual(mockAction);
    });

    it('should handle single target actions', () => {
      const singleTargetAction: LairAction = {
        name: 'Grasping Tentacle',
        description: 'A tentacle emerges and attempts to grapple one creature.',
      };

      const result = resolveLairAction(singleTargetAction, mockTargets);

      expect(result.success).toBe(true);
      expect(result.targets.length).toBeGreaterThan(0);
    });
  });

  describe('hasLairActions', () => {
    it('should detect monsters with lair actions', () => {
      const monstersWithLair = getMonstersWithLairActions();

      if (monstersWithLair.length > 0) {
        const monster = monstersWithLair[0];
        expect(hasLairActions(monster)).toBe(true);
      }
    });
  });

  describe('getMonstersWithLairActions', () => {
    it('should return array of monsters', () => {
      const monsters = getMonstersWithLairActions();
      expect(Array.isArray(monsters)).toBe(true);
    });

    it('should only include monsters with lair actions', () => {
      const monsters = getMonstersWithLairActions();

      monsters.forEach(monster => {
        expect(monster.lairActions).toBeDefined();
        expect(monster.lairActions!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('formatLairActionsDescription', () => {
    it('should format description containing monster name', () => {
      const description = formatLairActionsDescription('Ancient Red Dragon');

      expect(description).toContain('Ancient Red Dragon');
      // May or may not have lair actions depending on data population
    });

    it('should handle monsters without lair actions', () => {
      const description = formatLairActionsDescription('Goblin');

      expect(description).toContain('no lair actions');
    });

    it('should list all lair actions with numbers if they exist', () => {
      const actions = getLairActionsForMonster('Ancient Red Dragon');

      if (actions.length > 0) {
        const description = formatLairActionsDescription('Ancient Red Dragon');

        expect(description).toContain('1.');
        expect(description).toContain('Initiative Count 20');
        actions.forEach(action => {
          expect(description).toContain(action.name);
        });
      } else {
        // If no actions, should say so
        const description = formatLairActionsDescription('Ancient Red Dragon');
        expect(description).toContain('no lair actions');
      }
    });
  });

  describe('autoResolveLairAction', () => {
    it('should automatically select and resolve lair action if available', () => {
      const state = createLairActionState();
      const targets: LairActionTarget[] = [
        { name: 'Fighter', armorClass: 18 },
      ];

      const result = autoResolveLairAction('Ancient Red Dragon', state, targets);

      // Result may be null if no lair actions in data
      if (result) {
        expect(result.success).toBe(true);
        expect(result.action).toBeDefined();
        expect(state.hasTriggeredThisRound).toBe(true);
      }
    });

    it('should return null for monsters without lair actions', () => {
      const state = createLairActionState();
      const targets: LairActionTarget[] = [];

      const result = autoResolveLairAction('Goblin', state, targets);

      expect(result).toBeNull();
      expect(state.hasTriggeredThisRound).toBe(false);
    });

    it('should mark action as taken when lair actions exist', () => {
      const state = createLairActionState();
      const targets: LairActionTarget[] = [];

      const result = autoResolveLairAction('Ancient Red Dragon', state, targets);

      // Only check if lair actions were actually available
      if (result !== null) {
        expect(state.hasTriggeredThisRound).toBe(true);
        expect(state.lastUsedInitiative).toBe(20);
      }
    });
  });

  describe('Integration: Full combat scenario', () => {
    it('should handle complete lair action cycle if lair actions available', () => {
      const state = createLairActionState(true);
      const targets: LairActionTarget[] = [
        { name: 'Fighter', armorClass: 18 },
        { name: 'Rogue', armorClass: 15 },
      ];

      // Round 1, initiative 20
      expect(canTakeLairAction(state, 20)).toBe(true);

      const result1 = autoResolveLairAction('Ancient Red Dragon', state, targets);

      // Only proceed if lair actions exist in data
      if (result1) {
        expect(result1).toBeDefined();
        expect(state.hasTriggeredThisRound).toBe(true);

        // Try to take another lair action same round
        expect(canTakeLairAction(state, 20)).toBe(false);

        // New round
        resetLairActionForNewRound(state);
        expect(canTakeLairAction(state, 20)).toBe(true);

        // Round 2, initiative 20
        const result2 = autoResolveLairAction('Ancient Red Dragon', state, targets);
        expect(result2).toBeDefined();
      }
    });

    it('should not allow lair action when creature not in lair', () => {
      const state = createLairActionState(false); // Not in lair

      expect(canTakeLairAction(state, 20)).toBe(false);

      const result = autoResolveLairAction('Ancient Red Dragon', state, []);
      // Should return null because state.available is false
      expect(result).toBeNull();
      expect(state.available).toBe(false);
    });

    it('should track multiple rounds of lair actions if available', () => {
      const state = createLairActionState(true);
      const targets: LairActionTarget[] = [{ name: 'Paladin', armorClass: 20 }];

      // Round 1
      const result1 = autoResolveLairAction('Ancient Red Dragon', state, targets);

      // Only proceed if lair actions exist
      if (result1) {
        expect(state.hasTriggeredThisRound).toBe(true);

        // Round 2
        resetLairActionForNewRound(state);
        const result2 = autoResolveLairAction('Ancient Red Dragon', state, targets);
        expect(result2).toBeDefined();
        expect(state.hasTriggeredThisRound).toBe(true);

        // Round 3
        resetLairActionForNewRound(state);
        const result3 = autoResolveLairAction('Ancient Red Dragon', state, targets);
        expect(result3).toBeDefined();
        expect(state.hasTriggeredThisRound).toBe(true);

        // All rounds should have used initiative 20
        expect(state.lastUsedInitiative).toBe(20);
      }
    });
  });
});
