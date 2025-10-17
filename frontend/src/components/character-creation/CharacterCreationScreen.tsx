/**
 * @file CharacterCreationScreen.tsx
 * @description Enhanced character creation with backgrounds, skills, backstory, and AI portraits
 * Designed by Gemini Pro with BG3 dark fantasy aesthetic
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useImageGeneration } from '../../hooks/useAssetGeneration';

// --- TYPE DEFINITIONS ---

type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
type AbilityScores = Record<Ability, number>;
type Backstory = { ideal: string; bond: string; flaw: string; };

// --- GAME RULES & CONSTANTS ---

const ABILITIES: readonly Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

const RACES = ["Aasimar", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling"] as const;
const CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"] as const;
const ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"] as const;

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
    Fighter: [
        { name: "Chain Mail & Shield", items: ["Chain Mail", "Longsword", "Shield", "Light Crossbow"] },
        { name: "Leather & Greatsword", items: ["Leather Armor", "Greatsword", "Two Handaxes"] },
    ],
    Rogue: [
        { name: "Rapier & Shortbow", items: ["Leather Armor", "Rapier", "Shortbow", "Dagger"] },
        { name: "Shortsword & Daggers", items: ["Leather Armor", "Shortsword", "Two Daggers"] },
    ],
    Wizard: [
        { name: "Dagger & Spellbook", items: ["Robes", "Dagger", "Arcane Focus", "Spellbook"] },
        { name: "Quarterstaff & Spellbook", items: ["Robes", "Quarterstaff", "Component Pouch", "Spellbook"] },
    ],
    Barbarian: [], Bard: [], Cleric: [], Druid: [], Monk: [], Paladin: [], Ranger: [], Sorcerer: [], Warlock: [],
};

// Descriptions
const raceDescriptions: Record<string, string> = { Aasimar: "Celestial-touched humanoids.", Dragonborn: "Draconic ancestry, elemental breath.", Dwarf: "Stout, resilient crafters.", Elf: "Graceful, long-lived, magical.", Gnome: "Inventive, mischievous tinkerers.", Goliath: "Towering mountain warriors.", Halfling: "Small, nimble, lucky.", Human: "Adaptable and ambitious.", Orc: "Fierce honorable warriors.", Tiefling: "Infernal heritage, arcane power." };
const classDescriptions: Record<string, string> = { Barbarian: "Primal warrior channeling rage.", Bard: "Charismatic performer with magic.", Cleric: "Divine healer and protector.", Druid: "Nature shapeshifter.", Fighter: "Master of weapons and combat.", Monk: "Disciplined ki warrior.", Paladin: "Holy warrior with oaths.", Ranger: "Wilderness hunter and tracker.", Rogue: "Stealth and precision master.", Sorcerer: "Innate magical power.", Warlock: "Pact-bound spellcaster.", Wizard: "Arcane scholar." };
const abilityScoreDescriptions: Record<string, string> = { STR: "Physical power and melee.", DEX: "Agility and ranged attacks.", CON: "Health and stamina.", INT: "Knowledge and arcane magic.", WIS: "Perception and divine magic.", CHA: "Personality and influence." };
const pointBuySystemDescription = "Customize abilities by spending points. Higher scores cost more.";

const POINT_BUY_CONFIG = { initialPoints: 27, minScore: 8, maxScore: 15, scoreCost: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } as Record<number, number> };
const INITIAL_SCORES: AbilityScores = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 };

// --- HELPER ICONS ---
const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MinusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const ChevronDownIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>);
const InfoIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>);
const CharacterPlaceholderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-chimera-gold/20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const CheckCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-2.99"/></svg>);

// --- UI COMPONENTS ---
const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string; }> = ({ title, children, className = '' }) => (
  <div className={`bg-chimera-surface border border-chimera-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in ${className}`}>
    <h2 className="font-display text-2xl text-chimera-gold mb-6 tracking-wider">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; }> = ({ label, ...props }) => (
    <div>
        <label className="block font-body text-sm text-chimera-text-secondary font-semibold mb-2">{label}</label>
        <input {...props} className="w-full bg-chimera-bg border-2 border-chimera-border rounded-lg px-4 py-3 font-body text-chimera-text-primary focus:outline-none focus:border-chimera-gold/50 focus:shadow-glow transition-all shadow-inner-dark" />
    </div>
);

const StyledTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; }> = ({ label, ...props }) => (
    <div>
        <label className="block font-body text-sm text-chimera-text-secondary font-semibold mb-2">{label}</label>
        <textarea {...props} rows={3} className="w-full bg-chimera-bg border-2 border-chimera-border rounded-lg px-4 py-3 font-body text-chimera-text-primary focus:outline-none focus:border-chimera-gold/50 focus:shadow-glow transition-all shadow-inner-dark custom-scrollbar" />
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
            <label className="block font-body text-sm text-chimera-text-secondary font-semibold mb-2">{label}</label>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center bg-chimera-bg border-2 border-chimera-border rounded-lg px-4 py-3 font-body text-chimera-text-primary focus:outline-none focus:border-chimera-gold/50 focus:shadow-glow transition-all shadow-inner-dark">
                <span>{value || `Select ${label}`}</span><ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-chimera-elevated border-2 border-chimera-gold/50 rounded-lg shadow-glow-lg max-h-96 overflow-auto custom-scrollbar">
                    {options.map((option) => (
                        <div key={option} onClick={() => handleSelect(option)} className="px-4 py-3 hover:bg-chimera-gold/10 cursor-pointer transition-all first:rounded-t-lg last:rounded-b-lg border-b border-chimera-border last:border-b-0">
                            <div className="text-chimera-text-primary font-semibold hover:text-chimera-gold transition-colors">{option}</div>
                            {descriptions && descriptions[option] && (<p className="text-chimera-text-muted text-xs mt-1 leading-relaxed">{descriptions[option]}</p>)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AbilityScoreRow: React.FC<{ ability: Ability; score: number; onScoreChange: (ability: Ability, delta: 1 | -1) => void; canIncrease: boolean; canDecrease: boolean; }> = ({ ability, score, onScoreChange, canIncrease, canDecrease }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
    <div className="flex items-center justify-between bg-chimera-elevated/50 rounded-lg p-4 border border-chimera-border hover:border-chimera-gold/30 transition-all group">
        <div className="flex items-center gap-2 flex-1">
            <span className="font-body text-lg text-chimera-text-secondary font-semibold w-16">{ability}</span>
            <div className="relative">
                <button type="button" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className="text-chimera-gold/50 hover:text-chimera-gold transition-colors"><InfoIcon /></button>
                {showTooltip && (<div className="absolute left-0 bottom-full mb-2 w-72 bg-chimera-bg border-2 border-chimera-gold/30 rounded-lg p-3 shadow-glow-lg z-20 animate-fade-in"><p className="text-chimera-text-primary text-xs leading-relaxed">{abilityScoreDescriptions[ability]}</p></div>)}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button type="button" onClick={() => onScoreChange(ability, -1)} disabled={!canDecrease} className="p-2 rounded-full border-2 border-chimera-gold/30 text-chimera-gold transition-all hover:enabled:bg-chimera-gold/20 hover:enabled:border-chimera-gold hover:enabled:shadow-glow disabled:text-chimera-text-muted disabled:border-chimera-border disabled:cursor-not-allowed"><MinusIcon /></button>
            <span className="font-mono text-3xl text-chimera-gold font-bold w-12 text-center">{score}</span>
            <button type="button" onClick={() => onScoreChange(ability, 1)} disabled={!canIncrease} className="p-2 rounded-full border-2 border-chimera-gold/30 text-chimera-gold transition-all hover:enabled:bg-chimera-gold/20 hover:enabled:border-chimera-gold hover:enabled:shadow-glow disabled:text-chimera-text-muted disabled:border-chimera-border disabled:cursor-not-allowed"><PlusIcon /></button>
        </div>
    </div>
)};

// --- MAIN COMPONENT ---

export const CharacterCreationScreen: React.FC = () => {
    const [name, setName] = useState('');
    const [race, setRace] = useState(RACES[0]);
    const [characterClass, setCharacterClass] = useState(CLASSES[0]);
    const [background, setBackground] = useState<Background>(Object.keys(BACKGROUNDS)[0] as Background);
    const [alignment, setAlignment] = useState(ALIGNMENTS[4]);
    const [abilityScores, setAbilityScores] = useState<AbilityScores>(INITIAL_SCORES);
    const [backstory, setBackstory] = useState<Backstory>({ ideal: '', bond: '', flaw: '' });
    const [selectedClassSkills, setSelectedClassSkills] = useState<Set<Skill>>(new Set());
    const [equipmentChoice, setEquipmentChoice] = useState(0);
    const [portraitPrompt, setPortraitPrompt] = useState('');
    const [selectedPortrait, setSelectedPortrait] = useState<string | null>(null);
    const [imageGenParams, setImageGenParams] = useState<Parameters<typeof useImageGeneration>[0]>(null);

    const { imageUrls: generatedPortraits, loading: portraitsLoading } = useImageGeneration(imageGenParams);

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

    const handleSkillToggle = useCallback((skill: Skill) => {
        if (backgroundProficiencies.has(skill)) return;
        const newSelection = new Set(selectedClassSkills);
        if (newSelection.has(skill)) newSelection.delete(skill);
        else if (newSelection.size < classSkillInfo.choices) newSelection.add(skill);
        setSelectedClassSkills(newSelection);
    }, [selectedClassSkills, classSkillInfo.choices, backgroundProficiencies]);

    const handleGeneratePortraits = () => {
        if (!race || !characterClass) return;
        const fullPrompt = `${name || 'heroic adventurer'}, ${race}, ${characterClass}, ${portraitPrompt}. Dark fantasy portrait, cinematic lighting, detailed.`;
        setImageGenParams({ prompt: fullPrompt, dimensions: { width: 512, height: 512 }, contextType: 'character_portrait', count: 4 });
    };

    const isFormValid = name.trim() !== '' && selectedClassSkills.size === classSkillInfo.choices;

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isFormValid) { alert("Please complete all sections."); return; }
        const characterData = { name, race, characterClass, background, alignment, abilityScores, backstory, proficiencies: Array.from(totalProficiencies), equipment: EQUIPMENT_CHOICES[characterClass]?.[equipmentChoice], portraitUrl: selectedPortrait };
        console.log("CHARACTER CREATED:", characterData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-chimera-bg via-chimera-surface to-chimera-bg text-white p-4 sm:p-8 font-body">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 lg:sticky lg:top-8 self-start">
                    <div className="bg-chimera-surface/50 border-2 border-chimera-gold/20 rounded-lg p-6 shadow-card-hover min-h-[400px] flex flex-col items-center justify-center">
                        <div className="w-64 h-64 rounded-lg bg-chimera-bg border-2 border-chimera-border flex items-center justify-center overflow-hidden mb-6">
                            {selectedPortrait ? <img src={selectedPortrait} alt="Portrait" className="w-full h-full object-cover" /> : <CharacterPlaceholderIcon />}
                        </div>
                        <h3 className="font-display text-3xl text-chimera-gold tracking-wider text-center">{name || "Nameless Hero"}</h3>
                        <p className="text-chimera-text-accent font-semibold mt-2">{race} {characterClass}</p>
                        <p className="text-chimera-text-secondary mt-1 text-sm">{background} / {alignment}</p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <header className="text-center lg:text-left">
                        <h1 className="font-display text-5xl text-chimera-gold tracking-widest drop-shadow-lg">Create Your Hero</h1>
                        <p className="text-chimera-text-secondary mt-3 text-lg">Forge your legend in Nuaibria.</p>
                    </header>

                    <Panel title="Identity">
                        <StyledInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your character's name" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StyledSelect label="Race" options={RACES} value={race} onChange={(val) => setRace(val as typeof RACES[number])} descriptions={raceDescriptions} />
                            <StyledSelect label="Class" options={CLASSES} value={characterClass} onChange={(val) => setCharacterClass(val as typeof CLASSES[number])} descriptions={classDescriptions} />
                            <StyledSelect label="Background" options={Object.keys(BACKGROUNDS)} value={background} onChange={(val) => setBackground(val as Background)} descriptions={Object.fromEntries(Object.entries(BACKGROUNDS).map(([k, v]) => [k, v.description]))} />
                            <StyledSelect label="Alignment" options={ALIGNMENTS} value={alignment} onChange={(val) => setAlignment(val as typeof ALIGNMENTS[number])} />
                        </div>
                    </Panel>

                    <Panel title="Ability Scores">
                        <div className="bg-chimera-bg/50 border border-chimera-gold/20 rounded-lg p-4 mb-6"><p className="text-chimera-text-secondary text-sm leading-relaxed">{pointBuySystemDescription}</p></div>
                        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-chimera-gold/20">
                            <h3 className="font-body text-lg text-chimera-text-secondary font-semibold">Allocate Points</h3>
                            <div className="text-right"><span className="font-mono text-4xl text-chimera-gold font-bold">{pointsRemaining}</span><p className="text-sm text-chimera-text-accent">Remaining</p></div>
                        </div>
                        <div className="space-y-3">{ABILITIES.map(ability => {
                            const score = abilityScores[ability];
                            const canIncrease = score < POINT_BUY_CONFIG.maxScore && pointsRemaining >= (POINT_BUY_CONFIG.scoreCost[score + 1] - POINT_BUY_CONFIG.scoreCost[score]);
                            const canDecrease = score > POINT_BUY_CONFIG.minScore;
                            return <AbilityScoreRow key={ability} ability={ability} score={score} onScoreChange={handleScoreChange} canIncrease={canIncrease} canDecrease={canDecrease} />;
                        })}</div>
                    </Panel>

                    <Panel title="Skills & Proficiencies">
                        <div className="bg-chimera-bg/50 border border-chimera-gold/20 rounded-lg p-4">
                            <p className="text-chimera-text-secondary text-sm">Background grants: <strong className="text-chimera-gold">{BACKGROUNDS[background].skillProficiencies.join(', ')}</strong>. Choose <strong className="text-chimera-gold">{classSkillInfo.choices}</strong> more.</p>
                            <p className="text-chimera-text-accent text-sm mt-2 font-semibold">Remaining: {classSkillInfo.choices - selectedClassSkills.size}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {SKILLS.map(skill => {
                                const isFromBg = backgroundProficiencies.has(skill);
                                const isSelected = selectedClassSkills.has(skill);
                                const canSelect = classSkillInfo.options.includes(skill) && !isFromBg;
                                return (
                                    <div key={skill} onClick={() => canSelect && handleSkillToggle(skill)} className={`flex items-center gap-3 p-3 rounded-md transition-all ${canSelect ? 'cursor-pointer hover:bg-chimera-gold/10' : 'opacity-60'}`}>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected || isFromBg ? 'bg-chimera-gold border-chimera-gold' : 'border-chimera-border'}`}>
                                            {(isSelected || isFromBg) && <CheckCircleIcon />}
                                        </div>
                                        <span className={`font-semibold ${isSelected || isFromBg ? 'text-chimera-gold' : 'text-chimera-text-primary'}`}>{skill}</span>
                                        {isFromBg && <span className="text-xs bg-chimera-gold/20 text-chimera-gold px-2 py-0.5 rounded-full ml-auto">BG</span>}
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
                                    <div key={index} onClick={() => setEquipmentChoice(index)} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${equipmentChoice === index ? 'border-chimera-gold shadow-glow' : 'border-chimera-border hover:border-chimera-gold/50'}`}>
                                        <h4 className="font-semibold text-lg text-chimera-text-primary">{choice.name}</h4>
                                        <ul className="list-disc list-inside mt-2 text-chimera-text-secondary text-sm space-y-1">
                                            {choice.items.map(item => <li key={item}>{item}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    )}

                    <Panel title="Appearance">
                        <StyledInput label="Describe appearance" value={portraitPrompt} onChange={e => setPortraitPrompt(e.target.value)} placeholder="e.g., Braided red hair, stoic, scar" />
                        <button type="button" onClick={handleGeneratePortraits} disabled={portraitsLoading} className="font-display bg-chimera-gold/80 text-white px-8 py-3 rounded-lg hover:bg-chimera-gold hover:shadow-glow-lg transition-all disabled:bg-chimera-text-muted">
                            {portraitsLoading ? 'Generating...' : 'Generate Portrait'}
                        </button>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            {generatedPortraits?.map((url, i) => (
                                <div key={i} onClick={() => setSelectedPortrait(url)} className={`rounded-lg overflow-hidden border-4 cursor-pointer transition-all ${selectedPortrait === url ? 'border-chimera-gold shadow-glow' : 'border-transparent hover:border-chimera-gold/50'}`}>
                                    <img src={url} alt={`Option ${i+1}`} className="aspect-square object-cover" />
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <div className="flex justify-end pt-6">
                        <button type="submit" onClick={handleSubmit} disabled={!isFormValid} className="font-display text-xl bg-gradient-to-r from-chimera-gold to-chimera-ember text-white px-12 py-4 rounded-lg hover:from-chimera-gold/90 hover:to-chimera-ember/90 hover:shadow-glow-lg transition-all hover:-translate-y-0.5 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed">
                            Embark on Your Journey
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreationScreen;
