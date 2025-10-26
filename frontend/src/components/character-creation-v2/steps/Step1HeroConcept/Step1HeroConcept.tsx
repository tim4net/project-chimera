import React, { useState, useEffect } from 'react';
import { Step1Draft } from '../../../../test/testUtils';
import RaceCard from './components/RaceCard';
import ClassCard from './components/ClassCard';
import BackgroundCard from './components/BackgroundCard';
import HeroPreview from './components/HeroPreview';
import './Step1HeroConcept.css';

interface Step1HeroConceptProps {
  draft: Step1Draft;
  updateDraft: (updates: Partial<Step1Draft>) => void;
  errors: string[];
}

const RACES = [
  'Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'
];

const CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
];

const BACKGROUNDS = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Sage', 'Soldier', 'Urchin'
];

// Fantasy name generators by race
const NAME_GENERATORS: Record<string, string[]> = {
  Aasimar: ['Ariel', 'Cassiel', 'Seraphina', 'Gabriel', 'Michael', 'Uriel'],
  Dragonborn: ['Balasar', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash'],
  Dwarf: ['Thorin', 'Balin', 'Dwalin', 'Gimli', 'Bruenor', 'Thibbledorf'],
  Elf: ['Legolas', 'Thranduil', 'Galadriel', 'Elrond', 'Arwen', 'Celeborn'],
  Gnome: ['Alston', 'Brocc', 'Dimble', 'Eldon', 'Fonkin', 'Gimble'],
  'Half-Elf': ['Taako', 'Caleb', 'Garion', 'Immeral', 'Jorlan', 'Korinn'],
  'Half-Orc': ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh'],
  Halfling: ['Bilbo', 'Frodo', 'Samwise', 'Pippin', 'Merry', 'Rosie'],
  Human: ['Aragorn', 'Boromir', 'Faramir', 'Eowyn', 'Theoden', 'Eomer'],
  Tiefling: ['Akmenios', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados']
};

const Step1HeroConcept: React.FC<Step1HeroConceptProps> = ({ draft, updateDraft, errors }) => {
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    validateName(draft.name);
  }, [draft.name]);

  const validateName = (name: string): boolean => {
    if (!name) {
      setNameError('');
      return false;
    }

    if (name.length === 1) {
      setNameError('Name must be at least 2 characters');
      return false;
    }

    if (name.length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }

    const validNamePattern = /^[a-zA-Z\s'-]+$/;
    if (!validNamePattern.test(name)) {
      setNameError('Name can only contain letters, spaces, hyphens, and apostrophes');
      return false;
    }

    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    updateDraft({ name: newName });
  };

  const handleGenerateName = () => {
    if (!draft.race || !draft.class || !draft.background) {
      return;
    }

    const raceNames = NAME_GENERATORS[draft.race] || NAME_GENERATORS.Human;
    const randomName = raceNames[Math.floor(Math.random() * raceNames.length)];
    updateDraft({ name: randomName });
  };

  const handleRaceSelect = (race: string) => {
    updateDraft({ race });
  };

  const handleClassSelect = (className: string) => {
    updateDraft({ class: className });
  };

  const handleBackgroundSelect = (background: string) => {
    updateDraft({ background });
  };

  const isGenerateNameEnabled = !!(draft.race && draft.class && draft.background);
  const isNextEnabled = !!(
    draft.name &&
    draft.name.length >= 2 &&
    draft.race &&
    draft.class &&
    draft.background &&
    !nameError
  );

  return (
    <div className="step1-hero-concept">
      <div className="hero-concept-container">
        <div className="hero-preview-section">
          <HeroPreview race={draft.race} className={draft.class} />
        </div>

        <div className="hero-form-section">
          <h2>Step 1: Hero Concept</h2>
          <p className="step-description">
            Define the foundation of your character
          </p>

          {/* Name Input */}
          <div className="form-group">
            <label htmlFor="character-name">Character Name</label>
            <div className="name-input-group">
              <input
                id="character-name"
                type="text"
                value={draft.name}
                onChange={handleNameChange}
                placeholder="Enter your character name"
                className={nameError || errors.length > 0 ? 'input-error' : ''}
              />
              <button
                type="button"
                onClick={handleGenerateName}
                disabled={!isGenerateNameEnabled}
                className="btn-generate-name"
              >
                Generate Name
              </button>
            </div>
            {nameError && <span className="error-message">{nameError}</span>}
            {errors.map((error, index) => (
              <span key={index} className="error-message">{error}</span>
            ))}
          </div>

          {/* Race Selection */}
          <div className="form-group">
            <label>Race</label>
            <div className="card-grid race-grid">
              {RACES.map(race => (
                <RaceCard
                  key={race}
                  race={race}
                  selected={draft.race === race}
                  onSelect={handleRaceSelect}
                />
              ))}
            </div>
          </div>

          {/* Class Selection */}
          <div className="form-group">
            <label>Class</label>
            <div className="card-grid class-grid">
              {CLASSES.map(className => (
                <ClassCard
                  key={className}
                  className={className}
                  selected={draft.class === className}
                  onSelect={handleClassSelect}
                />
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div className="form-group">
            <label>Background</label>
            <div className="card-grid background-grid">
              {BACKGROUNDS.map(background => (
                <BackgroundCard
                  key={background}
                  background={background}
                  selected={draft.background === background}
                  onSelect={handleBackgroundSelect}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="navigation-buttons">
            <button
              type="button"
              disabled={!isNextEnabled}
              className="btn-next"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1HeroConcept;
