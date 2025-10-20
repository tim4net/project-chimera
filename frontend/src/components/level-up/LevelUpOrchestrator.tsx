/**
 * @file LevelUpOrchestrator - Master controller for level-up workflow
 *
 * Manages the complete level-up experience by orchestrating multiple modals
 * in sequence. Determines which steps are required based on level-up data
 * from the backend and presents them one at a time.
 *
 * Flow: Celebration → ASI → Subclass → Spells → Cantrips → Features
 */

import { useState, useEffect } from 'react';
import LevelUpModal from '../LevelUpModal';
import SubclassSelectionModal from '../SubclassSelectionModal';
import ASISelectionModal from './ASISelectionModal';
import SpellLearningModal from './SpellLearningModal';
import ClassFeaturesModal from './ClassFeaturesModal';

// Types
type Step = 'celebration' | 'asi' | 'subclass' | 'spells' | 'cantrips' | 'features';

interface LevelUpOrchestratorProps {
  show: boolean;
  characterId: string;
  character: any; // Full character record
  newLevel: number;
  levelUpData: any; // Data from backend checkAndProcessLevelUp()
  onComplete: () => void;
}

interface CompletedData {
  asiSelection?: {
    abilityIncreases?: Record<string, number>;
    featSelected?: string;
  };
  subclassSelected?: string;
  spellsLearned?: string[];
  cantripsLearned?: string[];
}

/**
 * Orchestrator component that manages the level-up workflow
 */
const LevelUpOrchestrator = ({
  show,
  characterId,
  character,
  newLevel,
  levelUpData,
  onComplete,
}: LevelUpOrchestratorProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [completedData, setCompletedData] = useState<CompletedData>({});

  // Initialize steps based on levelUpData
  useEffect(() => {
    if (!show || !levelUpData) return;

    const requiredSteps: Step[] = [];

    // Always start with celebration
    requiredSteps.push('celebration');

    // Add ASI if required (levels 4, 8, 12, 16, 19)
    if (levelUpData.requiresASI) {
      requiredSteps.push('asi');
    }

    // Add subclass selection if required (varies by class)
    if (levelUpData.requiresSubclass) {
      requiredSteps.push('subclass');
    }

    // Add spell learning if character learns new spells
    if (levelUpData.learnNewSpells && levelUpData.learnNewSpells > 0) {
      requiredSteps.push('spells');
    }

    // Add cantrip learning if character learns new cantrips
    if (levelUpData.learnNewCantrips && levelUpData.learnNewCantrips > 0) {
      requiredSteps.push('cantrips');
    }

    // Always end with features summary
    requiredSteps.push('features');

    setSteps(requiredSteps);
    setCurrentStepIndex(0);
    setCompletedData({});

    console.log('[LevelUpOrchestrator] Initialized workflow:', {
      newLevel,
      steps: requiredSteps,
      levelUpData,
    });
  }, [show, levelUpData, newLevel]);

  // Handle completion of current step
  const handleStepComplete = (stepData?: any) => {
    const currentStep = steps[currentStepIndex];
    console.log('[LevelUpOrchestrator] Step completed:', currentStep, stepData);

    // Store step-specific data
    if (stepData) {
      setCompletedData(prev => ({
        ...prev,
        ...stepData,
      }));
    }

    // Move to next step or complete
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // All steps complete
      console.log('[LevelUpOrchestrator] Workflow complete:', completedData);
      onComplete();
    }
  };

  // Don't render if not showing
  if (!show || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];

  // Progress indicator
  const ProgressIndicator = () => (
    <div className="flex gap-2 justify-center mb-4">
      {steps.map((step, i) => (
        <div
          key={step}
          className={`w-3 h-3 rounded-full transition-all ${
            i < currentStepIndex
              ? 'bg-green-500'
              : i === currentStepIndex
              ? 'bg-nuaibria-gold animate-pulse'
              : 'bg-nuaibria-border'
          }`}
          title={step}
        />
      ))}
    </div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'celebration':
        return (
          <>
            <ProgressIndicator />
            <LevelUpModal
              show={true}
              newLevel={newLevel}
              hpGained={levelUpData.hpGained || 0}
              oldHP={character.current_hp || 0}
              newHP={(character.current_hp || 0) + (levelUpData.hpGained || 0)}
              proficiencyBonus={levelUpData.newProficiencyBonus || character.proficiency_bonus || 2}
              characterId={characterId}
              className={character.class_name}
              requiresSubclassSelection={false}
              onClose={() => handleStepComplete()}
            />
          </>
        );

      case 'asi':
        return (
          <>
            <ProgressIndicator />
            <ASISelectionModal
              show={true}
              characterId={characterId}
              level={newLevel}
              currentAbilityScores={character.ability_scores || {}}
              onComplete={() => handleStepComplete()}
              onClose={() => handleStepComplete()}
            />
          </>
        );

      case 'subclass':
        return (
          <>
            <ProgressIndicator />
            <SubclassSelectionModal
              show={true}
              characterId={characterId}
              className={character.class_name}
              availableSubclasses={levelUpData.availableSubclasses || []}
              onComplete={() => handleStepComplete({ subclassSelected: true })}
              onClose={() => handleStepComplete()}
            />
          </>
        );

      case 'spells':
        return (
          <>
            <ProgressIndicator />
            <SpellLearningModal
              show={true}
              characterId={characterId}
              characterClass={character.class_name}
              currentLevel={newLevel}
              spellsKnown={character.known_spells?.filter((s: any) => s.level > 0).map((s: any) => s.name) || []}
              cantripsKnown={character.known_spells?.filter((s: any) => s.level === 0).map((s: any) => s.name) || []}
              spellsToLearn={levelUpData.learnNewSpells || 0}
              cantripsToLearn={0}
              maxSpellLevel={Math.ceil(newLevel / 2)}
              canReplaceSpell={['Bard', 'Sorcerer'].includes(character.class_name)}
              onComplete={() => handleStepComplete()}
              onClose={() => handleStepComplete()}
            />
          </>
        );

      case 'cantrips':
        return (
          <>
            <ProgressIndicator />
            <SpellLearningModal
              show={true}
              characterId={characterId}
              characterClass={character.class_name}
              currentLevel={newLevel}
              spellsKnown={[]}
              cantripsKnown={character.known_spells?.filter((s: any) => s.level === 0).map((s: any) => s.name) || []}
              spellsToLearn={0}
              cantripsToLearn={levelUpData.learnNewCantrips || 0}
              maxSpellLevel={0}
              canReplaceSpell={false}
              onComplete={() => handleStepComplete()}
              onClose={() => handleStepComplete()}
            />
          </>
        );

      case 'features':
        return (
          <>
            <ProgressIndicator />
            <ClassFeaturesModal
              show={true}
              newLevel={newLevel}
              className={character.class_name}
              subclassName={character.subclass_name}
              classFeatures={levelUpData.newClassFeatures || []}
              subclassFeatures={levelUpData.newSubclassFeatures || []}
              spellSlots={levelUpData.newSpellSlots}
              cantripsDamageIncrease={levelUpData.cantripsDamageIncrease}
              onComplete={() => handleStepComplete()}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {renderCurrentStep()}
    </div>
  );
};

export default LevelUpOrchestrator;
