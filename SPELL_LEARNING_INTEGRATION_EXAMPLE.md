# SpellLearningModal Integration Example

## How to Integrate with LevelUpModal

The SpellLearningModal should be triggered from the LevelUpModal when a spellcaster levels up and needs to learn new spells.

### Modified LevelUpModal.tsx Example

```typescript
import { useEffect, useState } from 'react';
import SubclassSelectionModal from './SubclassSelectionModal';
import SpellLearningModal from './level-up/SpellLearningModal';

interface LevelUpModalProps {
  show: boolean;
  newLevel: number;
  hpGained: number;
  oldHP: number;
  newHP: number;
  proficiencyBonus: number;
  characterId?: string;
  className?: string;
  characterClass?: string;
  requiresSubclassSelection?: boolean;
  requiresSpellLearning?: boolean;  // NEW
  spellsToLearn?: number;            // NEW
  cantripsToLearn?: number;          // NEW
  maxSpellLevel?: number;            // NEW
  spellsKnown?: string[];            // NEW
  cantripsKnown?: string[];          // NEW
  canReplaceSpell?: boolean;         // NEW
  availableSubclasses?: any[];
  subclassFeatures?: SubclassFeature[];
  onClose: () => void;
}

const LevelUpModal = ({
  show,
  newLevel,
  hpGained,
  oldHP,
  newHP,
  proficiencyBonus,
  characterId,
  className,
  characterClass,
  requiresSubclassSelection = false,
  requiresSpellLearning = false,
  spellsToLearn = 0,
  cantripsToLearn = 0,
  maxSpellLevel = 1,
  spellsKnown = [],
  cantripsKnown = [],
  canReplaceSpell = false,
  availableSubclasses = [],
  subclassFeatures = [],
  onClose,
}: LevelUpModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSubclassModal, setShowSubclassModal] = useState(false);
  const [showSpellModal, setShowSpellModal] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);

      // Priority chain: Subclass → Spells → Auto-close
      if (requiresSubclassSelection && characterId && className) {
        // Show subclass modal after animation
        const timer = setTimeout(() => {
          setShowSubclassModal(true);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (requiresSpellLearning && characterId && characterClass) {
        // Show spell learning modal after animation
        const timer = setTimeout(() => {
          setShowSpellModal(true);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        // Auto-close after 5 seconds if no further actions needed
        const timer = setTimeout(() => {
          onClose();
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
    }
  }, [show, requiresSubclassSelection, requiresSpellLearning, characterId, className, characterClass, onClose]);

  const handleSubclassComplete = () => {
    setShowSubclassModal(false);
    
    // After subclass selection, check if spell learning is needed
    if (requiresSpellLearning && characterId && characterClass) {
      setTimeout(() => {
        setShowSpellModal(true);
      }, 500);
    } else {
      onClose();
    }
  };

  const handleSpellLearningComplete = () => {
    setShowSpellModal(false);
    onClose();
  };

  const handleSubclassClose = () => {
    setShowSubclassModal(false);
    onClose();
  };

  const handleSpellModalClose = () => {
    setShowSpellModal(false);
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className={`bg-gradient-to-br from-nuaibria-gold/30 via-nuaibria-ember/20 to-nuaibria-arcane/30 border-4 border-nuaibria-gold rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}>
          {/* Title */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-4xl font-display font-bold text-nuaibria-gold drop-shadow-glow mb-2">
              LEVEL UP!
            </h2>
            <div className="text-2xl font-bold text-nuaibria-ember">
              Level {newLevel}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4 mb-6">
            {/* HP Increase */}
            <div className="bg-nuaibria-surface/50 rounded-lg p-4 border border-nuaibria-health/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-nuaibria-text-secondary font-semibold">Hit Points</span>
                <span className="text-nuaibria-health font-bold text-xl">+{hpGained} HP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-nuaibria-text-muted">{oldHP}</span>
                <span className="text-nuaibria-gold">→</span>
                <span className="text-nuaibria-health font-bold">{newHP}</span>
              </div>
            </div>

            {/* Proficiency Bonus */}
            <div className="bg-nuaibria-surface/50 rounded-lg p-4 border border-nuaibria-arcane/30">
              <div className="flex items-center justify-between">
                <span className="text-nuaibria-text-secondary font-semibold">Proficiency Bonus</span>
                <span className="text-nuaibria-arcane font-bold text-xl">+{proficiencyBonus}</span>
              </div>
            </div>

            {/* New subclass features */}
            {subclassFeatures && subclassFeatures.length > 0 && (
              <div className="bg-nuaibria-surface/50 rounded-lg p-4 border border-nuaibria-arcane/30">
                <div className="text-nuaibria-arcane font-bold text-lg mb-2">New Subclass Features!</div>
                <div className="space-y-2">
                  {subclassFeatures.map((feature, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-nuaibria-gold font-semibold">{feature.name}</span>
                      <p className="text-nuaibria-text-muted text-xs mt-1">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor text */}
            <div className="text-center text-nuaibria-text-accent italic text-sm">
              {requiresSubclassSelection
                ? "You stand at a crossroads in your journey. Choose your path wisely..."
                : requiresSpellLearning
                ? "Your magical prowess grows. New spells await to be learned..."
                : "You feel your skills sharpening, your body growing stronger..."}
            </div>
          </div>

          {/* Close button */}
          {!requiresSubclassSelection && !requiresSpellLearning && (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-glow"
            >
              Continue Adventure
            </button>
          )}
          {(requiresSubclassSelection || requiresSpellLearning) && (
            <div className="text-center text-nuaibria-gold font-semibold animate-pulse">
              {requiresSubclassSelection ? "Preparing subclass selection..." : "Preparing spell selection..."}
            </div>
          )}
        </div>
      </div>

      {/* Subclass Selection Modal */}
      {showSubclassModal && characterId && className && (
        <SubclassSelectionModal
          show={showSubclassModal}
          characterId={characterId}
          className={className}
          availableSubclasses={availableSubclasses}
          onComplete={handleSubclassComplete}
          onClose={handleSubclassClose}
        />
      )}

      {/* Spell Learning Modal */}
      {showSpellModal && characterId && characterClass && (
        <SpellLearningModal
          show={showSpellModal}
          characterId={characterId}
          characterClass={characterClass}
          currentLevel={newLevel}
          spellsKnown={spellsKnown}
          cantripsKnown={cantripsKnown}
          spellsToLearn={spellsToLearn}
          cantripsToLearn={cantripsToLearn}
          maxSpellLevel={maxSpellLevel}
          canReplaceSpell={canReplaceSpell}
          onComplete={handleSpellLearningComplete}
          onClose={handleSpellModalClose}
        />
      )}
    </>
  );
};

export default LevelUpModal;
```

## Backend Calculation Example

When a character levels up, the backend should calculate spell learning requirements:

```typescript
// In levelingSystem.ts or similar

interface SpellLearningRequirements {
  requiresSpellLearning: boolean;
  spellsToLearn: number;
  cantripsToLearn: number;
  maxSpellLevel: number;
  canReplaceSpell: boolean;
}

function calculateSpellLearningRequirements(
  characterClass: string,
  oldLevel: number,
  newLevel: number
): SpellLearningRequirements {
  // Full casters (Wizard, Sorcerer, Bard, Cleric, Druid)
  const fullCasters = ['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid'];
  
  // Half casters (Paladin, Ranger)
  const halfCasters = ['Paladin', 'Ranger'];
  
  // Warlock has unique mechanics
  const isWarlock = characterClass === 'Warlock';
  
  if (!fullCasters.includes(characterClass) && !halfCasters.includes(characterClass) && !isWarlock) {
    return {
      requiresSpellLearning: false,
      spellsToLearn: 0,
      cantripsToLearn: 0,
      maxSpellLevel: 0,
      canReplaceSpell: false,
    };
  }

  // Calculate max spell level based on character level
  let maxSpellLevel = 0;
  if (fullCasters.includes(characterClass)) {
    maxSpellLevel = Math.ceil(newLevel / 2);
  } else if (halfCasters.includes(characterClass)) {
    maxSpellLevel = Math.ceil((newLevel - 1) / 4);
  } else if (isWarlock) {
    maxSpellLevel = Math.ceil(newLevel / 2);
  }
  maxSpellLevel = Math.min(maxSpellLevel, 9); // Cap at 9th level

  // Calculate spells to learn
  let spellsToLearn = 0;
  let cantripsToLearn = 0;
  
  if (characterClass === 'Wizard') {
    // Wizards learn 2 spells per level
    spellsToLearn = 2;
  } else if (['Sorcerer', 'Bard', 'Warlock'].includes(characterClass)) {
    // These classes learn 1 spell per level
    spellsToLearn = 1;
  } else if (['Cleric', 'Druid', 'Paladin', 'Ranger'].includes(characterClass)) {
    // These classes prepare spells, don't need spell learning modal
    return {
      requiresSpellLearning: false,
      spellsToLearn: 0,
      cantripsToLearn: 0,
      maxSpellLevel,
      canReplaceSpell: false,
    };
  }

  // Calculate cantrip learning
  const cantripLevels: Record<string, number[]> = {
    'Wizard': [1, 4, 10],
    'Sorcerer': [1, 4, 10],
    'Bard': [1, 4, 10],
    'Warlock': [1, 4, 10],
    'Cleric': [1, 4, 10],
    'Druid': [1, 4, 10],
  };

  if (cantripLevels[characterClass]?.includes(newLevel)) {
    cantripsToLearn = 1;
  }

  // Check if class can replace spells (Bard, Sorcerer, Warlock)
  const canReplaceSpell = ['Bard', 'Sorcerer', 'Warlock'].includes(characterClass);

  return {
    requiresSpellLearning: spellsToLearn > 0 || cantripsToLearn > 0,
    spellsToLearn,
    cantripsToLearn,
    maxSpellLevel,
    canReplaceSpell,
  };
}

// Usage in level up handler
export async function handleLevelUp(characterId: string) {
  const character = await getCharacter(characterId);
  const oldLevel = character.level;
  const newLevel = oldLevel + 1;
  
  // Calculate spell requirements
  const spellRequirements = calculateSpellLearningRequirements(
    character.class,
    oldLevel,
    newLevel
  );
  
  // Update character level
  await updateCharacterLevel(characterId, newLevel);
  
  // Return data for frontend
  return {
    newLevel,
    hpGained: calculateHPGain(character),
    proficiencyBonus: getProficiencyBonus(newLevel),
    ...spellRequirements,
    spellsKnown: character.spells_known || [],
    cantripsKnown: character.cantrips_known || [],
  };
}
```

## Frontend Usage in Dashboard

```typescript
// In DashboardPage.tsx or similar

const [levelUpData, setLevelUpData] = useState<any>(null);

const handleLevelUp = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`/api/characters/${characterId}/level-up`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
    
    const data = await response.json();
    setLevelUpData(data);
  } catch (error) {
    console.error('Level up error:', error);
  }
};

// In render
{levelUpData && (
  <LevelUpModal
    show={true}
    newLevel={levelUpData.newLevel}
    hpGained={levelUpData.hpGained}
    oldHP={character.hp_max}
    newHP={levelUpData.newHP}
    proficiencyBonus={levelUpData.proficiencyBonus}
    characterId={character.id}
    characterClass={character.class}
    requiresSpellLearning={levelUpData.requiresSpellLearning}
    spellsToLearn={levelUpData.spellsToLearn}
    cantripsToLearn={levelUpData.cantripsToLearn}
    maxSpellLevel={levelUpData.maxSpellLevel}
    spellsKnown={levelUpData.spellsKnown}
    cantripsKnown={levelUpData.cantripsKnown}
    canReplaceSpell={levelUpData.canReplaceSpell}
    onClose={() => {
      setLevelUpData(null);
      refreshCharacter();
    }}
  />
)}
```

## API Endpoint Requirements

### GET /api/spells

```typescript
router.get('/spells', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { class: characterClass, maxLevel } = req.query;
  
  try {
    // Import spell data
    import { SPELLS_BY_LEVEL } from '../data/spells';
    
    const availableSpells: Spell[] = [];
    
    // Collect spells up to max level
    for (let level = 0; level <= parseInt(maxLevel as string); level++) {
      const spellsAtLevel = SPELLS_BY_LEVEL[level] || [];
      
      // Filter by class
      const classSpells = spellsAtLevel.filter(spell =>
        spell.classes.includes(characterClass as string)
      );
      
      availableSpells.push(...classSpells);
    }
    
    res.json({ spells: availableSpells });
  } catch (error) {
    console.error('Error fetching spells:', error);
    res.status(500).json({ error: 'Failed to fetch spells' });
  }
});
```

### POST /api/characters/:characterId/learn-spells

```typescript
router.post('/:characterId/learn-spells', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { characterId } = req.params;
  const { spells, cantrips, replaceSpell } = req.body;
  
  try {
    // Verify character ownership
    const character = await getCharacter(characterId);
    if (character.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Get current spells
    const currentSpells = character.spells_known || [];
    const currentCantrips = character.cantrips_known || [];
    
    // Update spell lists
    let newSpells = [...currentSpells, ...spells];
    let newCantrips = [...currentCantrips, ...cantrips];
    
    // Handle spell replacement
    if (replaceSpell) {
      newSpells = newSpells.filter(s => s !== replaceSpell);
    }
    
    // Update character in database
    await updateCharacterSpells(characterId, {
      spells_known: newSpells,
      cantrips_known: newCantrips,
    });
    
    res.json({
      success: true,
      spells_known: newSpells,
      cantrips_known: newCantrips,
    });
  } catch (error) {
    console.error('Error learning spells:', error);
    res.status(500).json({ error: 'Failed to learn spells' });
  }
});
```

## Complete Flow

1. **Character levels up** → Backend calculates spell requirements
2. **LevelUpModal shows** → Displays new level, HP, etc.
3. **After 3 seconds** → SpellLearningModal appears (if needed)
4. **Player selects spells** → Filtered, searchable list with validation
5. **Player confirms** → POST to `/api/characters/:id/learn-spells`
6. **Backend updates** → Character's spell list in database
7. **Modal closes** → Player returns to game

## Notes

- SpellLearningModal is chainable with SubclassSelectionModal
- Both modals can appear in sequence during a single level-up
- The backend determines which modals are needed based on class and level
- All spell data is already available in the backend's data files
