/**
 * @fileoverview Character Creation Wizard V2 - Main Orchestrator
 * 5-step wizard with routing, validation, and progress tracking
 */

import React, { useState, useEffect } from 'react';
import { CharacterDraftProvider, useCharacterDraft } from '../../context/CharacterDraftContextV2';
import Step1HeroConcept from './steps/Step1HeroConcept/Step1HeroConcept';
import Step2CoreIdentity from './steps/Step2CoreIdentity/Step2CoreIdentity';
import { Step3AbilitiesSkills } from './steps/Step3AbilitiesSkills/Step3AbilitiesSkills';
import { Step4Loadout } from './steps/Step4Loadout/Step4Loadout';
import Step5Review from './steps/Step5Review/Step5Review';
import './CharacterCreationWizardV2.css';

type StepNumber = 1 | 2 | 3 | 4 | 5;

interface StepConfig {
  number: StepNumber;
  title: string;
  component: React.ComponentType<any>;
  testId: string;
}

const STEPS: StepConfig[] = [
  {
    number: 1,
    title: 'Create Your Hero',
    component: Step1HeroConcept,
    testId: 'step1-hero-concept',
  },
  {
    number: 2,
    title: 'Your Identity',
    component: Step2CoreIdentity,
    testId: 'step2-core-identity',
  },
  {
    number: 3,
    title: 'Abilities & Skills',
    component: Step3AbilitiesSkills,
    testId: 'step3-abilities-skills',
  },
  {
    number: 4,
    title: 'Gear & Appearance',
    component: Step4Loadout,
    testId: 'step4-loadout',
  },
  {
    number: 5,
    title: 'Review Character',
    component: Step5Review,
    testId: 'step5-review',
  },
];

/**
 * Internal wizard component (uses context)
 */
const WizardContent: React.FC = () => {
  const { draft, updateDraft, validateStep1, validateStep2, validateStep3, validateStep4, getValidationErrors } = useCharacterDraft();
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [validationError, setValidationError] = useState<string>('');

  // Load current step from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('currentWizardStep');
    if (stored) {
      const stepNum = parseInt(stored);
      if (stepNum >= 1 && stepNum <= 5) {
        setCurrentStep(stepNum as StepNumber);
      }
    }
  }, []);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('currentWizardStep', currentStep.toString());
  }, [currentStep]);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      case 5:
        return true; // No validation on review page
      default:
        return false;
    }
  };

  const handleNext = () => {
    const isValid = validateCurrentStep();

    if (!isValid) {
      const errors = getValidationErrors();
      setValidationError(errors[0] || 'Please complete all required fields');
      return;
    }

    setValidationError('');

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as StepNumber);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as StepNumber);
      setValidationError('');
    }
  };

  const handleStepClick = (stepNumber: StepNumber) => {
    // Can only navigate to steps that have been completed
    // Check if all previous steps are valid
    let canNavigate = true;

    for (let i = 1; i < stepNumber; i++) {
      switch (i) {
        case 1:
          if (!validateStep1()) canNavigate = false;
          break;
        case 2:
          if (!validateStep2()) canNavigate = false;
          break;
        case 3:
          if (!validateStep3()) canNavigate = false;
          break;
        case 4:
          if (!validateStep4()) canNavigate = false;
          break;
      }
    }

    if (canNavigate) {
      setCurrentStep(stepNumber);
      setValidationError('');
    }
  };

  const currentStepConfig = STEPS[currentStep - 1];
  const CurrentStepComponent = currentStepConfig.component;

  const isNextDisabled = !validateCurrentStep();

  return (
    <div className="wizard-container" data-testid="wizard-container">
      {/* Progress Indicator */}
      <div className="progress-indicator" data-testid="progress-indicator">
        <div className="progress-text">Step {currentStep} of 5</div>
        <div
          className="progress-bar"
          data-testid="progress-bar"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={5}
        >
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
        <div className="step-indicators">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`step-indicator ${step.number === currentStep ? 'active' : ''} ${
                step.number < currentStep ? 'completed' : ''
              }`}
              data-testid={`step-indicator-${step.number}`}
              onClick={() => handleStepClick(step.number)}
              role="button"
              tabIndex={0}
            >
              {step.number}
            </div>
          ))}
        </div>
      </div>

      {/* Page Title */}
      <h1 className="page-title" role="heading" aria-level={1}>
        {currentStepConfig.title}
      </h1>

      {/* Current Step Content */}
      <div className="step-content" data-testid={currentStepConfig.testId}>
        {currentStep === 5 ? (
          <CurrentStepComponent />
        ) : (
          <CurrentStepComponent
            draft={draft}
            updateDraft={updateDraft}
            errors={validationError ? [validationError] : []}
          />
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="validation-error" role="alert">
          {validationError}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            type="button"
            className="nav-button prev-button"
            aria-label="Previous"
          >
            Previous
          </button>
        )}

        {currentStep < 5 && (
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            type="button"
            className="nav-button next-button"
            aria-label="Next"
            title={isNextDisabled ? 'Complete all required fields' : ''}
            onMouseOver={(e) => {
              if (isNextDisabled && e.currentTarget.title) {
                // Create tooltip element
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = 'Complete all required fields';
                tooltip.setAttribute('role', 'tooltip');
                document.body.appendChild(tooltip);

                const rect = e.currentTarget.getBoundingClientRect();
                tooltip.style.position = 'absolute';
                tooltip.style.top = `${rect.top - 30}px`;
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%)';

                // Remove tooltip on mouse leave
                e.currentTarget.addEventListener('mouseleave', () => {
                  tooltip.remove();
                }, { once: true });
              }
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Main wizard component with provider
 */
const CharacterCreationWizardV2: React.FC = () => {
  return (
    <CharacterDraftProvider>
      <WizardContent />
    </CharacterDraftProvider>
  );
};

export default CharacterCreationWizardV2;
