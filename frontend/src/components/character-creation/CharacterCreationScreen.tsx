/**
 * @file CharacterCreationScreen.tsx
 * @description Enhanced character creation with backgrounds, skills, backstory, and AI portraits
 * Designed by Gemini Pro with BG3 dark fantasy aesthetic
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useImageGeneration } from '../../hooks/useAssetGeneration';
import { supabase } from '../../lib/supabase';
import SubclassSelectionModal from '../SubclassSelectionModal';
import { generateRandomName } from '../../utils/nameGenerator';

// --- TYPE DEFINITIONS ---

type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
type AbilityScores = Record<Ability, number>;
type Backstory = { ideal: string; bond: string; flaw: string; };

// --- GAME RULES & CONSTANTS ---

const ABILITIES: readonly Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

const RACES = ["Aasimar", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling"] as const;
const CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"] as const;
const ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"] as const;
const GENDERS = ["Male", "Female", "Non-binary", "Other"] as const;

const SKILLS = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'] as const;
type Skill = typeof SKILLS[number];

const BACKGROUNDS = {
  "Acolyte": { description: "You have spent your life in service of a temple, learning rites and lore.", skillProficiencies: ['Insight', 'Religion'] as Skill[], feature: { name: "Shelter of the Faithful", description: "You can receive healing and care at temples of your faith." } },
  "Criminal": { description: "An experienced criminal with a history of breaking the law.", skillProficiencies: ['Deception', 'Stealth'] as Skill[], feature: { name: "Criminal Contact", description: "You have a reliable contact in the criminal underworld." } },
  "Folk Hero": { description: "You come from humble origins but are destined for greatness.", skillProficiencies: ['Animal Handling', 'Survival'] as Skill[], feature: { name: "Rustic Hospitality", description: "Common folk will help you hide or rest." } },
  "Noble": { description: "You understand wealth, power, and privilege through your noble birth.", skillProficiencies: ['History', 'Persuasion'] as Skill[], feature: { name: "Position of Privilege", description: "People are inclined to think the best of you." } },
  "Sage": { description: "You spent years learning the lore of the multiverse.", skillProficiencies: ['Arcana', 'History'] as Skill[], feature: { name: "Researcher", description: "You know where to find information you don't possess." } },
  "Soldier": { description: "War has been your life. You are a veteran of conflict.", skillProficiencies: ['Athletics', 'Intimidation'] as Skill[], feature: { name: "Military Rank", description: "Soldiers recognize your authority and rank." } },
};
type Background = keyof typeof BACKGROUNDS;

const CLASS_SKILLS: Record<typeof CLASSES[number], { choices: number, options: Skill[] }> = {
    Barbarian: { choices: 2, options: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
    Bard: { choices: 3, options: [...SKILLS] },
    Cleric: { choices: 2, options: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
    Druid: { choices: 2, options: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
    Fighter: { choices: 2, options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
    Monk: { choices: 2, options: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
    Paladin: { choices: 2, options: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
    Ranger: { choices: 3, options: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
    Rogue: { choices: 4, options: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
    Sorcerer: { choices: 2, options: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
    Warlock: { choices: 2, options: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
    Wizard: { choices: 2, options: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
};

const EQUIPMENT_CHOICES: Record<typeof CLASSES[number], { name: string, items: string[] }[]> = {
    Barbarian: [
        { name: "Greataxe & Javelins", items: ["Greataxe", "Two Handaxes", "Four Javelins", "Explorer's Pack"] },
        { name: "Martial Weapon & Handaxes", items: ["Greatsword", "Two Handaxes", "Four Javelins", "Explorer's Pack"] },
    ],
    Bard: [
        { name: "Rapier & Lute", items: ["Leather Armor", "Rapier", "Lute", "Dagger", "Entertainer's Pack"] },
        { name: "Longsword & Lyre", items: ["Leather Armor", "Longsword", "Lyre", "Dagger", "Entertainer's Pack"] },
    ],
    Cleric: [
        { name: "Mace & Shield", items: ["Chain Mail", "Mace", "Shield", "Holy Symbol", "Light Crossbow", "Priest's Pack"] },
        { name: "Warhammer & Chain", items: ["Chain Mail", "Warhammer", "Shield", "Holy Symbol", "Five Javelins", "Priest's Pack"] },
    ],
    Druid: [
        { name: "Wooden Shield & Scimitar", items: ["Leather Armor", "Wooden Shield", "Scimitar", "Druidic Focus", "Explorer's Pack"] },
        { name: "Wooden Shield & Spear", items: ["Leather Armor", "Wooden Shield", "Spear", "Druidic Focus", "Explorer's Pack"] },
    ],
    Fighter: [
        { name: "Chain Mail & Shield", items: ["Chain Mail", "Longsword", "Shield", "Light Crossbow", "Dungeoneer's Pack"] },
        { name: "Leather & Greatsword", items: ["Leather Armor", "Greatsword", "Two Handaxes", "Dungeoneer's Pack"] },
    ],
    Monk: [
        { name: "Shortsword & Darts", items: ["Shortsword", "Ten Darts", "Dungeoneer's Pack"] },
        { name: "Spear & Darts", items: ["Spear", "Ten Darts", "Explorer's Pack"] },
    ],
    Paladin: [
        { name: "Martial & Shield", items: ["Chain Mail", "Longsword", "Shield", "Five Javelins", "Holy Symbol", "Priest's Pack"] },
        { name: "Greatsword & Chain", items: ["Chain Mail", "Greatsword", "Two Handaxes", "Holy Symbol", "Priest's Pack"] },
    ],
    Ranger: [
        { name: "Scale Mail & Shortswords", items: ["Scale Mail", "Two Shortswords", "Longbow", "Twenty Arrows", "Dungeoneer's Pack"] },
        { name: "Leather & Longsword", items: ["Leather Armor", "Longsword", "Shield", "Longbow", "Twenty Arrows", "Explorer's Pack"] },
    ],
    Rogue: [
        { name: "Rapier & Shortbow", items: ["Leather Armor", "Rapier", "Shortbow", "Twenty Arrows", "Dagger", "Burglar's Pack"] },
        { name: "Shortsword & Daggers", items: ["Leather Armor", "Shortsword", "Two Daggers", "Burglar's Pack"] },
    ],
    Sorcerer: [
        { name: "Light Crossbow & Daggers", items: ["Light Crossbow", "Twenty Bolts", "Two Daggers", "Arcane Focus", "Dungeoneer's Pack"] },
        { name: "Quarterstaff & Focus", items: ["Quarterstaff", "Two Daggers", "Component Pouch", "Explorer's Pack"] },
    ],
    Warlock: [
        { name: "Light Crossbow & Focus", items: ["Leather Armor", "Light Crossbow", "Twenty Bolts", "Two Daggers", "Arcane Focus", "Scholar's Pack"] },
        { name: "Dagger & Component Pouch", items: ["Leather Armor", "Dagger", "Two Daggers", "Component Pouch", "Dungeoneer's Pack"] },
    ],
    Wizard: [
        { name: "Dagger & Spellbook", items: ["Robes", "Dagger", "Arcane Focus", "Spellbook", "Scholar's Pack"] },
        { name: "Quarterstaff & Spellbook", items: ["Robes", "Quarterstaff", "Component Pouch", "Spellbook", "Explorer's Pack"] },
    ],
};

// Descriptions
const raceDescriptions: Record<string, string> = { Aasimar: "Celestial-touched humanoids.", Dragonborn: "Draconic ancestry, elemental breath.", Dwarf: "Stout, resilient crafters.", Elf: "Graceful, long-lived, magical.", Gnome: "Inventive, mischievous tinkerers.", Goliath: "Towering mountain warriors.", Halfling: "Small, nimble, lucky.", Human: "Adaptable and ambitious.", Orc: "Fierce honorable warriors.", Tiefling: "Infernal heritage, arcane power." };
const classDescriptions: Record<string, string> = { Barbarian: "Primal warrior channeling rage.", Bard: "Charismatic performer with magic.", Cleric: "Divine healer and protector.", Druid: "Nature shapeshifter.", Fighter: "Master of weapons and combat.", Monk: "Disciplined ki warrior.", Paladin: "Holy warrior with oaths.", Ranger: "Wilderness hunter and tracker.", Rogue: "Stealth and precision master.", Sorcerer: "Innate magical power.", Warlock: "Pact-bound spellcaster.", Wizard: "Arcane scholar." };
const abilityScoreDescriptions: Record<string, string> = { STR: "Physical power and melee.", DEX: "Agility and ranged attacks.", CON: "Health and stamina.", INT: "Knowledge and arcane magic.", WIS: "Perception and divine magic.", CHA: "Personality and influence." };
const pointBuySystemDescription = "Customize abilities by spending points. Higher scores cost more.";

const POINT_BUY_CONFIG = { initialPoints: 27, minScore: 8, maxScore: 15, scoreCost: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } as Record<number, number> };
const INITIAL_SCORES: AbilityScores = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 };

// Recommended ability score arrays optimized for each class (27 point buy)
const RECOMMENDED_STATS: Record<string, AbilityScores> = {
  Barbarian: { STR: 15, DEX: 13, CON: 14, INT: 8, WIS: 10, CHA: 12 },
  Bard: { STR: 8, DEX: 14, CON: 12, INT: 10, WIS: 13, CHA: 15 },
  Cleric: { STR: 14, DEX: 8, CON: 13, INT: 10, WIS: 15, CHA: 12 },
  Druid: { STR: 8, DEX: 12, CON: 14, INT: 13, WIS: 15, CHA: 10 },
  Fighter: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 10, CHA: 12 },
  Monk: { STR: 12, DEX: 15, CON: 13, INT: 8, WIS: 14, CHA: 10 },
  Paladin: { STR: 15, DEX: 10, CON: 13, INT: 8, WIS: 12, CHA: 14 },
  Ranger: { STR: 12, DEX: 15, CON: 13, INT: 8, WIS: 14, CHA: 10 },
  Rogue: { STR: 8, DEX: 15, CON: 12, INT: 14, WIS: 13, CHA: 10 },
  Sorcerer: { STR: 8, DEX: 13, CON: 14, INT: 10, WIS: 12, CHA: 15 },
  Warlock: { STR: 8, DEX: 13, CON: 14, INT: 10, WIS: 12, CHA: 15 },
  Wizard: { STR: 8, DEX: 14, CON: 13, INT: 15, WIS: 12, CHA: 10 },
};

// --- HELPER ICONS ---
const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MinusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const ChevronDownIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>);
const InfoIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>);
const CharacterPlaceholderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-nuaibria-gold/20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const CheckCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-2.99"/></svg>);

// Animated loading spinner
const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- UI COMPONENTS ---
const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string; }> = ({ title, children, className = '' }) => (
  <div className={`bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in ${className}`}>
    <h2 className="font-display text-2xl text-nuaibria-gold mb-6 tracking-wider">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; }> = ({ label, ...props }) => (
    <div>
        <label className="block font-body text-sm text-nuaibria-text-secondary font-semibold mb-2">{label}</label>
        <input {...props} className="w-full bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg px-4 py-3 font-body text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark" />
    </div>
);

const StyledTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; }> = ({ label, ...props }) => (
    <div>
        <label className="block font-body text-sm text-nuaibria-text-secondary font-semibold mb-2">{label}</label>
        <textarea {...props} rows={3} className="w-full bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg px-4 py-3 font-body text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark custom-scrollbar" />
    </div>
);

const StyledSelect: React.FC<{ label: string; options: readonly string[]; value: string; onChange: (value: string) => void; descriptions?: Record<string, string>; }> = ({ label, options, value, onChange, descriptions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleSelect = (option: string) => { onChange(option); setIsOpen(false); };
    return (
        <div className="relative" ref={ref}>
            <label className="block font-body text-sm text-nuaibria-text-secondary font-semibold mb-2">{label}</label>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg px-4 py-3 font-body text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark">
                <span>{value || `Select ${label}`}</span><ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-nuaibria-elevated border-2 border-nuaibria-gold/50 rounded-lg shadow-glow-lg max-h-96 overflow-auto custom-scrollbar">
                    {options.map((option) => (
                        <div key={option} onClick={() => handleSelect(option)} className="px-4 py-3 hover:bg-nuaibria-gold/10 cursor-pointer transition-all first:rounded-t-lg last:rounded-b-lg border-b border-nuaibria-border last:border-b-0">
                            <div className="text-nuaibria-text-primary font-semibold hover:text-nuaibria-gold transition-colors">{option}</div>
                            {descriptions && descriptions[option] && (<p className="text-nuaibria-text-muted text-xs mt-1 leading-relaxed">{descriptions[option]}</p>)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Racial ability bonuses (D&D 5e SRD)
const RACIAL_BONUSES: Record<string, Partial<AbilityScores>> = {
    Dwarf: { CON: 2 },
    Elf: { DEX: 2 },
    Halfling: { DEX: 2 },
    Human: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    Dragonborn: { STR: 2, CHA: 1 },
    Gnome: { INT: 2 },
    Tiefling: { CHA: 2, INT: 1 },
    Aasimar: { CHA: 2, WIS: 1 },
    Goliath: { STR: 2, CON: 1 },
    Orc: { STR: 2, CON: 1 },
};

const AbilityScoreRow: React.FC<{ ability: Ability; score: number; race: string; onScoreChange: (ability: Ability, delta: 1 | -1) => void; canIncrease: boolean; canDecrease: boolean; }> = ({ ability, score, race, onScoreChange, canIncrease, canDecrease }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const racialBonus = RACIAL_BONUSES[race]?.[ability] || 0;
    const finalScore = score + racialBonus;
    const modifier = Math.floor((finalScore - 10) / 2);

    return (
    <div className="flex items-center justify-between bg-nuaibria-elevated/50 rounded-lg p-4 border border-nuaibria-border hover:border-nuaibria-gold/30 transition-all group">
        <div className="flex items-center gap-2 flex-1">
            <span className="font-body text-lg text-nuaibria-text-secondary font-semibold w-16">{ability}</span>
            <div className="relative">
                <button type="button" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className="text-nuaibria-gold/50 hover:text-nuaibria-gold transition-colors"><InfoIcon /></button>
                {showTooltip && (<div className="absolute left-0 bottom-full mb-2 w-72 bg-nuaibria-bg border-2 border-nuaibria-gold/30 rounded-lg p-3 shadow-glow-lg z-20 animate-fade-in"><p className="text-nuaibria-text-primary text-xs leading-relaxed">{abilityScoreDescriptions[ability]}</p></div>)}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button type="button" onClick={() => onScoreChange(ability, -1)} disabled={!canDecrease} className="p-2 rounded-full border-2 border-nuaibria-gold/30 text-nuaibria-gold transition-all hover:enabled:bg-nuaibria-gold/20 hover:enabled:border-nuaibria-gold hover:enabled:shadow-glow disabled:text-nuaibria-text-muted disabled:border-nuaibria-border disabled:cursor-not-allowed"><MinusIcon /></button>
            <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-3xl text-nuaibria-gold font-bold w-12 text-center">{score}</span>
                {racialBonus > 0 && (
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-nuaibria-ember">+{racialBonus}</span>
                        <span className="text-xs text-nuaibria-text-muted">→</span>
                        <span className="text-sm font-bold text-nuaibria-health">{finalScore}</span>
                        <span className="text-xs text-nuaibria-text-muted">({modifier >= 0 ? '+' : ''}{modifier})</span>
                    </div>
                )}
                {racialBonus === 0 && (
                    <span className="text-xs text-nuaibria-text-muted">({modifier >= 0 ? '+' : ''}{modifier})</span>
                )}
            </div>
            <button type="button" onClick={() => onScoreChange(ability, 1)} disabled={!canIncrease} className="p-2 rounded-full border-2 border-nuaibria-gold/30 text-nuaibria-gold transition-all hover:enabled:bg-nuaibria-gold/20 hover:enabled:border-nuaibria-gold hover:enabled:shadow-glow disabled:text-nuaibria-text-muted disabled:border-nuaibria-border disabled:cursor-not-allowed"><PlusIcon /></button>
        </div>
    </div>
)};

// --- MAIN COMPONENT ---

export const CharacterCreationScreen: React.FC = () => {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<typeof GENDERS[number]>(GENDERS[0]);
    const [race, setRace] = useState<typeof RACES[number]>(RACES[0]);
    const [characterClass, setCharacterClass] = useState<typeof CLASSES[number]>(CLASSES[0]);
    const [background, setBackground] = useState<Background>(Object.keys(BACKGROUNDS)[0] as Background);
    const [alignment, setAlignment] = useState<typeof ALIGNMENTS[number]>(ALIGNMENTS[4]);
    const [abilityScores, setAbilityScores] = useState<AbilityScores>(INITIAL_SCORES);
    const [backstory, setBackstory] = useState<Backstory>({ ideal: '', bond: '', flaw: '' });
    const [selectedClassSkills, setSelectedClassSkills] = useState<Set<Skill>>(new Set());
    const [equipmentChoice, setEquipmentChoice] = useState(0);
    const [portraitPrompt, setPortraitPrompt] = useState('');
    const [selectedPortrait, setSelectedPortrait] = useState<string | null>(null);
    const [imageGenParams, setImageGenParams] = useState<Parameters<typeof useImageGeneration>[0]>(null);
    const [showSubclassModal, setShowSubclassModal] = useState(false);
    const [availableSubclasses, setAvailableSubclasses] = useState<any[]>([]);
    const [createdCharacterId, setCreatedCharacterId] = useState<string | null>(null);

    const { imageUrl: generatedPortrait, loading: portraitsLoading } = useImageGeneration(imageGenParams);
    const generatedPortraits = generatedPortrait ? [generatedPortrait] : null;

    const totalCost = useMemo(() => ABILITIES.reduce((cost, ability) => cost + POINT_BUY_CONFIG.scoreCost[abilityScores[ability]], 0), [abilityScores]);
    const pointsRemaining = POINT_BUY_CONFIG.initialPoints - totalCost;

    const backgroundProficiencies = useMemo(() => new Set(BACKGROUNDS[background].skillProficiencies), [background]);
    const classSkillInfo = useMemo(() => CLASS_SKILLS[characterClass], [characterClass]);
    const totalProficiencies = useMemo(() => new Set([...backgroundProficiencies, ...selectedClassSkills]), [backgroundProficiencies, selectedClassSkills]);

    useEffect(() => { setSelectedClassSkills(new Set()); setEquipmentChoice(0); }, [characterClass, background]);

    const handleScoreChange = useCallback((ability: Ability, delta: 1 | -1) => {
        const currentScore = abilityScores[ability];
        const newScore = currentScore + delta;
        if (newScore < POINT_BUY_CONFIG.minScore || newScore > POINT_BUY_CONFIG.maxScore) return;
        const newScores = { ...abilityScores, [ability]: newScore };
        const newCost = ABILITIES.reduce((ab, a) => ab + POINT_BUY_CONFIG.scoreCost[newScores[a]], 0);
        if (newCost <= POINT_BUY_CONFIG.initialPoints) setAbilityScores(newScores);
    }, [abilityScores]);

    const handleUseRecommendedStats = useCallback(() => {
        if (characterClass && RECOMMENDED_STATS[characterClass]) {
            setAbilityScores(RECOMMENDED_STATS[characterClass]);
        }
    }, [characterClass]);

    const handleSkillToggle = useCallback((skill: Skill) => {
        if (backgroundProficiencies.has(skill)) return;
        const newSelection = new Set(selectedClassSkills);
        if (newSelection.has(skill)) newSelection.delete(skill);
        else if (newSelection.size < classSkillInfo.choices) newSelection.add(skill);
        setSelectedClassSkills(newSelection);
    }, [selectedClassSkills, classSkillInfo.choices, backgroundProficiencies]);

    const handleGeneratePortraits = () => {
        if (!race || !characterClass) return;

        // Clear previous portrait to force regeneration
        setSelectedPortrait(null);

        // Build comprehensive character description with ALL details
        const skillsList = Array.from(totalProficiencies).join(', ');

        // Map ability scores to physical/mental traits
        const strDesc = abilityScores.STR >= 14 ? 'muscular and powerful' : abilityScores.STR <= 10 ? 'lean and wiry' : 'average build';
        const dexDesc = abilityScores.DEX >= 14 ? 'agile and graceful' : '';
        const conDesc = abilityScores.CON >= 14 ? 'hardy and vigorous' : abilityScores.CON <= 10 ? 'frail looking' : '';
        const intDesc = abilityScores.INT >= 14 ? 'intelligent gaze' : '';
        const wisDesc = abilityScores.WIS >= 14 ? 'perceptive eyes' : '';
        const chaDesc = abilityScores.CHA >= 14 ? 'charismatic and striking' : abilityScores.CHA <= 10 ? 'plain appearance' : '';

        const physicalTraits = [strDesc, dexDesc, conDesc, chaDesc].filter(Boolean).join(', ');
        const mentalTraits = [intDesc, wisDesc].filter(Boolean).join(', ');

        // Explicit race features that MUST appear
        const raceFeatures: Record<string, string> = {
            'Dragonborn': 'MUST HAVE: dragon head, reptilian scales covering entire body, draconic snout, sharp teeth, horns, NO human face, NO hair',
            'Tiefling': 'MUST HAVE: curved horns on head, red or purple skin, pointed tail, glowing eyes, sharp features',
            'Orc': 'MUST HAVE: green or gray skin, prominent tusks from lower jaw, brutish muscular features',
            'Dwarf': 'MUST HAVE: short stocky stature (4 feet tall), thick beard, broad shoulders, sturdy build',
            'Elf': 'MUST HAVE: long pointed ears, slender graceful features, ethereal beauty',
            'Halfling': 'MUST HAVE: very small stature (3 feet tall), childlike proportions, youthful face',
            'Gnome': 'MUST HAVE: tiny stature (3 feet), large nose, clever expression, tinkerer appearance',
            'Goliath': 'MUST HAVE: over 7 feet tall, massive muscular build, stone-like markings on skin',
            'Aasimar': 'MUST HAVE: otherworldly beauty, faint divine glow, celestial radiance, perfect features',
            'Human': 'standard human features, diverse appearance'
        };

        // Background-based appearance hints (affects clothing, demeanor, and bearing)
        const backgroundHints: Record<string, string> = {
            'Acolyte': 'religious robes, holy symbols, simple but clean attire, spiritual humble bearing',
            'Charlatan': 'flashy yet practical outfit, confidence, disguise elements, clever smirk',
            'Criminal': 'dark practical street clothing, hidden weapons, suspicious alert demeanor',
            'Entertainer': 'colorful performance costume, dramatic flair, eye-catching accessories, charismatic presence',
            'Folk Hero': 'common working clothes, honest determined face, modest heroic bearing, relatable',
            'Guild Artisan': 'practical work clothes with tool marks, professional appearance, skilled craftsman bearing',
            'Hermit': 'worn weathered simple clothing, ascetic bearing, contemplative wisdom, isolated appearance',
            'Noble': 'expensive fine clothing, jewelry, aristocratic regal posture, elegant refined bearing',
            'Outlander': 'rugged wilderness attire, weather-beaten appearance, survival gear, hardy outdoorsman',
            'Sage': 'scholarly robes, reading glasses, book or scroll in hand, intellectual contemplative expression',
            'Sailor': 'practical nautical clothing, weathered by sun and sea, rope accessories, sea-faring bearing',
            'Soldier': 'military uniform or practical armor, disciplined bearing, battle-worn marks, campaign veteran',
            'Urchin': 'patched worn clothing, street-smart scrappy appearance, survival-hardened bearing'
        };

        const genderDesc = gender ? `${gender.toLowerCase()} ` : '';
        const raceDesc = raceFeatures[race] || race.toLowerCase();
        const bgHint = backgroundHints[background] || '';

        // Build comprehensive prompt with STRONG emphasis on class and background
        const classEmphasis: Record<string, string> = {
            Barbarian: 'wielding massive greataxe or greatsword, tribal war paint, barely armored, primal fury',
            Bard: 'holding lute or instrument, performer outfit with flair, charismatic smile, entertainer',
            Cleric: 'holy symbol prominently displayed, plate armor or robes, divine light, blessed aura',
            Druid: 'wooden staff with vines, animal pelts, nature-themed, leaves and flowers in attire',
            Fighter: 'heavily armored warrior, sword and shield clearly visible, battle-ready, martial expert',
            Monk: 'unarmored martial artist, simple robes, meditation pose or fighting stance, disciplined',
            Paladin: 'gleaming plate armor, longsword and shield, holy radiance, righteous knight',
            Ranger: 'leather armor, longbow clearly visible, forest hunter, tracking gear',
            Rogue: 'dark leather, multiple visible daggers, hood or mask, sneaky thief',
            Sorcerer: 'arcane energy crackling from hands, elegant robes, innate magic aura, wild magic',
            Warlock: 'eldritch patron symbols, dark pact magic, otherworldly features, occult runes',
            Wizard: 'pointed hat or scholarly robes, spellbook in hand, arcane focus, studious mage'
        };

        // Alignment-based visual styling
        const alignmentStyle: Record<string, string> = {
            'Lawful Good': 'noble atmosphere, bright golden lighting with warm highlights, confident kind expression with compassionate eyes',
            'Neutral Good': 'warm protective atmosphere, soft natural sunlight, friendly approachable expression',
            'Chaotic Good': 'rebellious hero energy, dynamic dramatic lighting with bold contrasts, mischievous adventurous expression',
            'Lawful Neutral': 'orderly disciplined atmosphere, balanced even lighting, serious composed expression',
            'True Neutral': 'balanced natural atmosphere, realistic lighting, calm observant expression',
            'Chaotic Neutral': 'unpredictable wild atmosphere, erratic sharp lighting, curious free-spirited expression',
            'Lawful Evil': 'cold tyrannical atmosphere, harsh lighting with ominous red-purple tints, cruel calculating expression',
            'Neutral Evil': 'predatory atmosphere, dim murky lighting with sickly tones, selfish cold expression',
            'Chaotic Evil': 'chaotic destructive atmosphere, flickering hellish red-orange lighting, maniacal wild expression'
        };

        // CRITICAL: Put gender FIRST and emphasize it
        const genderEmphasis = gender ? `IMPORTANT: ${gender.toUpperCase()} character, ${gender.toLowerCase()} features, ${gender.toLowerCase()} presentation. ` : '';

        // Add alignment styling if alignment is selected
        const alignmentVisuals = alignment && alignmentStyle[alignment] ? `MOOD AND LIGHTING: ${alignmentStyle[alignment]}. ` : '';

        const fullPrompt = `${genderEmphasis}${genderDesc}${race} ${characterClass} portrait: ${raceDesc}. CLASS FEATURES: ${classEmphasis[characterClass] || characterClass}. BACKGROUND: ${bgHint}. ${alignmentVisuals}Physical build: ${physicalTraits}. ${mentalTraits ? `Personality: ${mentalTraits}.` : ''} ${portraitPrompt ? `Custom: ${portraitPrompt}.` : ''} D&D fantasy RPG character art, dramatic lighting, highly detailed face and equipment, professional digital painting, dark fantasy aesthetic, Baldur's Gate 3 style.`;

        // Include all character context for backend
        const characterContext = {
            name: name || 'heroic adventurer',
            gender,
            race,
            class: characterClass,
            background,
            alignment,
            abilityScores,
            skills: skillsList,
            backstory
        };

        setImageGenParams({
            prompt: fullPrompt,
            dimensions: { width: 512, height: 512 },
            contextType: 'character_portrait',
            context: characterContext
        });
    };

    const isFormValid = name.trim() !== '' && selectedClassSkills.size === classSkillInfo.choices;

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isFormValid) { alert("Please complete all sections."); return; }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("You must be logged in to create a character");
                return;
            }

            const characterData = {
                name,
                race,
                class: characterClass,
                background,
                alignment,
                ability_scores: abilityScores,
                skills: Array.from(totalProficiencies),
                backstory,
                portrait_url: selectedPortrait
            };

            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(characterData)
            });

            if (!response.ok) {
                const errorResponse = await response.json() as { error?: string };
                throw new Error(errorResponse.error || 'Failed to create character');
            }

            const newCharacter = await response.json();
            console.log("CHARACTER CREATED:", newCharacter);

            // Store character ID for modals
            setCreatedCharacterId(newCharacter.id);

            // Check if subclass selection is needed
            if (newCharacter.tutorial_state === 'needs_subclass') {
                console.log('[CharacterCreation] Character needs subclass selection');

                // Fetch available subclasses
                const subclassResponse = await fetch(`/api/subclass/${newCharacter.id}/available-subclasses`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (subclassResponse.ok) {
                    const subclassData = await subclassResponse.json();
                    setAvailableSubclasses(subclassData.subclasses || []);
                    setShowSubclassModal(true);
                } else {
                    console.error('[CharacterCreation] Failed to fetch subclasses');
                    window.location.href = '/dashboard';
                }
            } else {
                // No Session 0, no subclass needed - proceed to dashboard
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error("Failed to create character:", error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to create character: ${message}`);
        }
    };

    const handleSubclassComplete = () => {
        console.log('[CharacterCreation] Subclass selection complete');
        setShowSubclassModal(false);
        window.location.href = '/dashboard';
    };

    const handleSubclassClose = () => {
        console.log('[CharacterCreation] Subclass selection cancelled');
        setShowSubclassModal(false);
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg text-white p-4 sm:p-8 font-body">
            {/* Subclass Selection Modal */}
            {showSubclassModal && createdCharacterId && (
                <SubclassSelectionModal
                    show={showSubclassModal}
                    characterId={createdCharacterId}
                    className={characterClass}
                    availableSubclasses={availableSubclasses}
                    onComplete={handleSubclassComplete}
                    onClose={handleSubclassClose}
                />
            )}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 lg:sticky lg:top-8 self-start">
                    <div className="bg-nuaibria-surface/50 border-2 border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover min-h-[400px] flex flex-col items-center justify-center">
                        <div className="w-64 h-64 rounded-lg bg-nuaibria-bg border-2 border-nuaibria-border flex items-center justify-center overflow-hidden mb-6 relative">
                            {portraitsLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <LoadingSpinner className="w-16 h-16 text-nuaibria-gold" />
                                    <p className="text-nuaibria-text-secondary text-sm animate-pulse">Generating portrait...</p>
                                </div>
                            ) : selectedPortrait ? (
                                <img src={selectedPortrait} alt="Portrait" className="w-full h-full object-cover" />
                            ) : (
                                <CharacterPlaceholderIcon />
                            )}
                        </div>
                        <h3 className="font-display text-3xl text-nuaibria-gold tracking-wider text-center">{name || "Nameless Hero"}</h3>
                        <p className="text-nuaibria-text-accent font-semibold mt-2">{race} {characterClass}</p>
                        <p className="text-nuaibria-text-secondary mt-1 text-sm">{background} / {alignment}</p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <header className="text-center lg:text-left">
                        <h1 className="font-display text-5xl text-nuaibria-gold tracking-widest drop-shadow-lg">Create Your Hero</h1>
                        <p className="text-nuaibria-text-secondary mt-3 text-lg">Forge your legend in Nuaibria.</p>
                    </header>

                    <Panel title="Identity">
                        {/* Name and Gender in one row */}
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <StyledInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your character's name" />
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    const newName = await generateRandomName(race, gender.toLowerCase() as 'male' | 'female' | 'nonbinary');
                                    setName(newName);
                                }}
                                className="px-4 py-3 bg-nuaibria-gold/20 hover:bg-nuaibria-gold/30 text-nuaibria-gold font-semibold rounded-lg border-2 border-nuaibria-gold/40 hover:border-nuaibria-gold transition-all hover:shadow-glow"
                                title="Generate unique fantasy name using AI (falls back to curated list if unavailable)"
                            >
                                ✨ Generate
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setGender('Male')}
                                    className={`px-4 py-3 flex items-center justify-center rounded-lg border-2 transition-all font-semibold ${
                                        gender === 'Male'
                                            ? 'border-nuaibria-gold bg-nuaibria-gold/10 text-nuaibria-gold'
                                            : 'border-nuaibria-border text-nuaibria-text-muted hover:border-nuaibria-gold/50 hover:text-nuaibria-gold'
                                    }`}
                                    title="Male"
                                >
                                    <span className="text-2xl mr-2">♂</span> M
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('Female')}
                                    className={`px-4 py-3 flex items-center justify-center rounded-lg border-2 transition-all font-semibold ${
                                        gender === 'Female'
                                            ? 'border-nuaibria-gold bg-nuaibria-gold/10 text-nuaibria-gold'
                                            : 'border-nuaibria-border text-nuaibria-text-muted hover:border-nuaibria-gold/50 hover:text-nuaibria-gold'
                                    }`}
                                    title="Female"
                                >
                                    <span className="text-2xl mr-2">♀</span> F
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StyledSelect label="Race" options={RACES} value={race} onChange={(val) => setRace(val as typeof RACES[number])} descriptions={raceDescriptions} />
                            <StyledSelect label="Class" options={CLASSES} value={characterClass} onChange={(val) => setCharacterClass(val as typeof CLASSES[number])} descriptions={classDescriptions} />
                            <StyledSelect label="Background" options={Object.keys(BACKGROUNDS)} value={background} onChange={(val) => setBackground(val as Background)} descriptions={Object.fromEntries(Object.entries(BACKGROUNDS).map(([k, v]) => [k, v.description]))} />
                            <StyledSelect label="Alignment" options={ALIGNMENTS} value={alignment} onChange={(val) => setAlignment(val as typeof ALIGNMENTS[number])} />
                        </div>
                    </Panel>

                    <Panel title="Ability Scores">
                        <div className="bg-nuaibria-bg/50 border border-nuaibria-gold/20 rounded-lg p-4 mb-6"><p className="text-nuaibria-text-secondary text-sm leading-relaxed">{pointBuySystemDescription}</p></div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-nuaibria-gold/20">
                            <h3 className="font-body text-lg text-nuaibria-text-secondary font-semibold">Allocate Points</h3>
                            <div className="text-right"><span className="font-mono text-4xl text-nuaibria-gold font-bold">{pointsRemaining}</span><p className="text-sm text-nuaibria-text-accent">Remaining</p></div>
                        </div>
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={handleUseRecommendedStats}
                                className="w-full font-body bg-nuaibria-gold/20 text-nuaibria-gold border-2 border-nuaibria-gold/50 px-6 py-3 rounded-lg hover:bg-nuaibria-gold/30 hover:border-nuaibria-gold hover:shadow-glow transition-all font-semibold"
                            >
                                Use Recommended Stats for {characterClass}
                            </button>
                        </div>
                        <div className="space-y-3">{ABILITIES.map(ability => {
                            const score = abilityScores[ability];
                            const canIncrease = score < POINT_BUY_CONFIG.maxScore && pointsRemaining >= (POINT_BUY_CONFIG.scoreCost[score + 1] - POINT_BUY_CONFIG.scoreCost[score]);
                            const canDecrease = score > POINT_BUY_CONFIG.minScore;
                            return <AbilityScoreRow key={ability} ability={ability} score={score} race={race} onScoreChange={handleScoreChange} canIncrease={canIncrease} canDecrease={canDecrease} />;
                        })}</div>
                    </Panel>

                    <Panel title="Skills & Proficiencies">
                        <div className="bg-nuaibria-bg/50 border border-nuaibria-gold/20 rounded-lg p-4">
                            <p className="text-nuaibria-text-secondary text-sm">Background grants: <strong className="text-nuaibria-gold">{BACKGROUNDS[background].skillProficiencies.join(', ')}</strong>. Choose <strong className="text-nuaibria-gold">{classSkillInfo.choices}</strong> more.</p>
                            <p className="text-nuaibria-text-accent text-sm mt-2 font-semibold">Remaining: {classSkillInfo.choices - selectedClassSkills.size}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {SKILLS.map(skill => {
                                const isFromBg = backgroundProficiencies.has(skill);
                                const isSelected = selectedClassSkills.has(skill);
                                const canSelect = classSkillInfo.options.includes(skill) && !isFromBg;
                                return (
                                    <div key={skill} onClick={() => canSelect && handleSkillToggle(skill)} className={`flex items-center gap-3 p-3 rounded-md transition-all ${canSelect ? 'cursor-pointer hover:bg-nuaibria-gold/10' : 'opacity-60'}`}>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected || isFromBg ? 'bg-nuaibria-gold border-nuaibria-gold' : 'border-nuaibria-border'}`}>
                                            {(isSelected || isFromBg) && <CheckCircleIcon />}
                                        </div>
                                        <span className={`font-semibold ${isSelected || isFromBg ? 'text-nuaibria-gold' : 'text-nuaibria-text-primary'}`}>{skill}</span>
                                        {isFromBg && <span className="text-xs bg-nuaibria-gold/20 text-nuaibria-gold px-2 py-0.5 rounded-full ml-auto">BG</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                    <Panel title="Backstory">
                        <StyledTextArea label="Ideal: What drives you?" value={backstory.ideal} onChange={e => setBackstory(b => ({ ...b, ideal: e.target.value }))} placeholder="e.g., I will protect my homeland." />
                        <StyledTextArea label="Bond: What matters most?" value={backstory.bond} onChange={e => setBackstory(b => ({ ...b, bond: e.target.value }))} placeholder="e.g., My family above all." />
                        <StyledTextArea label="Flaw: Your weakness?" value={backstory.flaw} onChange={e => setBackstory(b => ({ ...b, flaw: e.target.value }))} placeholder="e.g., Quick to anger." />
                    </Panel>

                    {EQUIPMENT_CHOICES[characterClass]?.length > 0 && (
                        <Panel title="Starting Equipment">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {EQUIPMENT_CHOICES[characterClass].map((choice, index) => (
                                    <div key={index} onClick={() => setEquipmentChoice(index)} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${equipmentChoice === index ? 'border-nuaibria-gold shadow-glow' : 'border-nuaibria-border hover:border-nuaibria-gold/50'}`}>
                                        <h4 className="font-semibold text-lg text-nuaibria-text-primary">{choice.name}</h4>
                                        <ul className="list-disc list-inside mt-2 text-nuaibria-text-secondary text-sm space-y-1">
                                            {choice.items.map(item => <li key={item}>{item}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    )}

                    <Panel title="Appearance">
                        <StyledInput label="Describe appearance" value={portraitPrompt} onChange={e => setPortraitPrompt(e.target.value)} placeholder="e.g., Braided red hair, stoic, scar" />
                        <button type="button" onClick={handleGeneratePortraits} disabled={portraitsLoading} className="font-display bg-nuaibria-gold/80 text-white px-8 py-3 rounded-lg hover:bg-nuaibria-gold hover:shadow-glow-lg transition-all disabled:bg-nuaibria-text-muted">
                            {portraitsLoading ? 'Generating...' : 'Generate Portrait'}
                        </button>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            {portraitsLoading ? (
                                // Show loading placeholders while generating
                                Array.from({ length: 1 }).map((_, i) => (
                                    <div key={i} className="aspect-square rounded-lg bg-nuaibria-bg border-2 border-nuaibria-gold/20 flex items-center justify-center">
                                        <LoadingSpinner className="w-12 h-12 text-nuaibria-gold" />
                                    </div>
                                ))
                            ) : (
                                generatedPortraits?.map((url, i) => (
                                    <div key={i} onClick={() => setSelectedPortrait(url)} className={`rounded-lg overflow-hidden border-4 cursor-pointer transition-all ${selectedPortrait === url ? 'border-nuaibria-gold shadow-glow' : 'border-transparent hover:border-nuaibria-gold/50'}`}>
                                        <img src={url} alt={`Option ${i+1}`} className="aspect-square object-cover" />
                                    </div>
                                ))
                            )}
                        </div>
                    </Panel>

                    <div className="flex justify-end pt-6">
                        <button type="submit" onClick={handleSubmit} disabled={!isFormValid} className="font-display text-xl bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember text-white px-12 py-4 rounded-lg hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 hover:shadow-glow-lg transition-all hover:-translate-y-0.5 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed">
                            Embark on Your Journey
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreationScreen;
