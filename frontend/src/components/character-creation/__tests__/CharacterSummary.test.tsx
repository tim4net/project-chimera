/**
 * @file CharacterSummary.test.tsx
 * @description Tests for CharacterSummary component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CharacterSummary } from '../components/CharacterSummary';

const mockCharacterDraft = {
  name: 'Thorin Stoneheart',
  race: 'Dwarf',
  class: 'Fighter',
  background: 'Soldier',
  alignment: 'Lawful Good',
  gender: 'Male',
  abilityScores: {
    STR: 16,
    DEX: 12,
    CON: 15,
    INT: 10,
    WIS: 13,
    CHA: 8,
  },
  skills: ['Athletics', 'Intimidation', 'Perception', 'Survival'],
  backstory: {
    ideal: 'I will protect my homeland at all costs.',
    bond: 'My clan and family are everything to me.',
    flaw: 'I am slow to trust outsiders.',
  },
  equipment: ['Chain Mail', 'Longsword', 'Shield', 'Light Crossbow', 'Dungeoneer\'s Pack'],
  gold: 100,
  portraitUrl: 'https://example.com/portrait.jpg',
  appearance: 'A stout dwarf with a long braided beard and battle scars.',
};

describe('CharacterSummary', () => {
  it('renders character identity correctly', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    expect(screen.getByText('Thorin Stoneheart')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Dwarf')).toBeInTheDocument();
    expect(screen.getByText('Fighter')).toBeInTheDocument();
    expect(screen.getByText('Soldier')).toBeInTheDocument();
    expect(screen.getByText('Lawful Good')).toBeInTheDocument();
  });

  it('displays ability scores with correct modifiers', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    // Check STR 16 (+3 modifier) - multiple elements may have +3
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getAllByText('+3').length).toBeGreaterThan(0);

    // Check CHA 8 (-1 modifier) - multiple 8s and -1s may exist
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-1').length).toBeGreaterThan(0);
  });

  it('displays vitals correctly', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    expect(screen.getByText('Vitals')).toBeInTheDocument();
    expect(screen.getByText('30 ft')).toBeInTheDocument(); // Speed
    // Proficiency bonus +2 appears multiple times (skills and vitals)
    expect(screen.getAllByText('+2').length).toBeGreaterThan(0);
  });

  it('highlights proficient skills correctly', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    // Proficient skills should be highlighted
    const athleticsSkill = screen.getByText('Athletics').parentElement;
    expect(athleticsSkill).toHaveClass('bg-nuaibria-gold/10');

    const intimidationSkill = screen.getByText('Intimidation').parentElement;
    expect(intimidationSkill).toHaveClass('bg-nuaibria-gold/10');

    // Non-proficient skills should not be highlighted
    const acrobaticsSkill = screen.getByText('Acrobatics').parentElement;
    expect(acrobaticsSkill).not.toHaveClass('bg-nuaibria-gold/10');
  });

  it('displays equipment and gold', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    expect(screen.getByText('100 gp')).toBeInTheDocument();
    expect(screen.getByText('Chain Mail')).toBeInTheDocument();
    expect(screen.getByText('Longsword')).toBeInTheDocument();
    expect(screen.getByText('Shield')).toBeInTheDocument();
  });

  it('displays backstory fields when provided', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    expect(screen.getByText('I will protect my homeland at all costs.')).toBeInTheDocument();
    expect(screen.getByText('My clan and family are everything to me.')).toBeInTheDocument();
    expect(screen.getByText('I am slow to trust outsiders.')).toBeInTheDocument();
  });

  it('hides backstory section when all fields are empty', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    const draftWithoutBackstory = {
      ...mockCharacterDraft,
      backstory: { ideal: '', bond: '', flaw: '' },
    };

    const { container } = render(
      <CharacterSummary
        character={draftWithoutBackstory}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    // Should not render Backstory section title
    const backstorySection = container.querySelector('h3:contains("Backstory")');
    expect(backstorySection).toBeNull();
  });

  it('displays appearance when provided', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    expect(screen.getByText('A stout dwarf with a long braided beard and battle scars.')).toBeInTheDocument();
  });

  it('hides appearance section when not provided', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    const draftWithoutAppearance = {
      ...mockCharacterDraft,
      appearance: undefined,
    };

    render(
      <CharacterSummary
        character={draftWithoutAppearance}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
  });

  it('calls onEditBasicInfo when Identity edit button is clicked', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    // Find the Identity section and click its Edit button
    const identitySection = screen.getByText('Identity').closest('div');
    const editButton = identitySection?.querySelector('button');

    fireEvent.click(editButton!);
    expect(onEditBasicInfo).toHaveBeenCalledTimes(1);
  });

  it('calls onEditAbilities when Ability Scores edit button is clicked', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    // Find the Ability Scores section and click its Edit button
    const abilityScoresSection = screen.getByText('Ability Scores').closest('div');
    const editButton = abilityScoresSection?.querySelector('button');

    fireEvent.click(editButton!);
    expect(onEditAbilities).toHaveBeenCalledTimes(1);
  });

  it('calculates skill modifiers correctly with proficiency bonus', () => {
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();

    render(
      <CharacterSummary
        character={mockCharacterDraft}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
      />
    );

    // Athletics: STR (16) = +3, with proficiency +2 = +5
    const athleticsElement = screen.getByText('Athletics').parentElement;
    expect(athleticsElement?.textContent).toContain('+5');

    // Acrobatics: DEX (12) = +1, without proficiency = +1
    const acrobaticsElement = screen.getByText('Acrobatics').parentElement;
    expect(acrobaticsElement?.textContent).toContain('+1');
  });
});
