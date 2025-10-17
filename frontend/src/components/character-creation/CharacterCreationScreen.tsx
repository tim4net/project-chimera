/**
 * @file CharacterCreationScreen.tsx
 * @description A unified, single-screen character creation interface for the game "Nuaibria".
 * Inspired by the dark fantasy aesthetic of Baldur's Gate 3.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- TYPE DEFINITIONS ---

type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

const ABILITIES: readonly Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

type AbilityScores = Record<Ability, number>;

// --- GAME RULES & CONSTANTS ---

// 2024 D&D 5e Races (Player's Handbook 2024)
const RACES = [
  "Aasimar",
  "Dragonborn",
  "Dwarf",
  "Elf",
  "Gnome",
  "Goliath",
  "Halfling",
  "Human",
  "Orc",
  "Tiefling"
];

// 2024 D&D 5e Classes (Player's Handbook 2024)
const CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard"
];

// Race Descriptions
const raceDescriptions: { [key: string]: string } = {
  Aasimar: "Celestial-touched humanoids, often serving as beacons of hope or justice, blessed with divine heritage and a glimmer of the heavens.",
  Dragonborn: "Proud humanoids with draconic ancestry, capable of breathing elemental energy and wielding fierce might in battle.",
  Dwarf: "Stout, resilient folk with a deep connection to stone, renowned for their craftsmanship, unwavering resolve, and love of mountains.",
  Elf: "Graceful and long-lived beings, often attuned to ancient magic and the whispers of nature, dwelling in serene forests and hidden realms.",
  Gnome: "Small, inventive folk with a mischievous streak, fascinated by illusions, tinkering, and the hidden secrets of the world.",
  Goliath: "Towering, stone-skinned humanoids from high mountain peaks, known for their immense strength, endurance, and tribal honor.",
  Halfling: "Small, nimble, and cheerful, valuing community, comfort, and the simple joys of life above all else, often surprisingly lucky.",
  Human: "Adaptable and ambitious, found in every corner of the world, capable of great good or profound evil, and quick to innovate.",
  Orc: "Fierce and strong warriors, often misunderstood, seeking honor and power through battle and the strength of their tribal bonds.",
  Tiefling: "Bearing the unmistakable mark of infernal ancestry, often facing prejudice but possessing inner strength and innate arcane potential.",
};

// Class Descriptions
const classDescriptions: { [key: string]: string } = {
  Barbarian: "A primal warrior who channels inner rage to unleash devastating attacks and shrug off blows, embracing wild ferocity in combat.",
  Bard: "A charismatic performer who weaves magic through music and words, inspiring allies, charming foes, and telling epic tales of adventure.",
  Cleric: "A devout servant of a deity, wielding divine magic to heal wounds, protect the faithful, and smite unholy threats with sacred power.",
  Druid: "A protector of nature, able to shapeshift into powerful animals and command the raw forces of the wild and primal spirits.",
  Fighter: "A master of weapons and combat, capable of adapting to any battlefield with unmatched skill, discipline, and martial prowess.",
  Monk: "A disciplined warrior who uses ki energy for swift, unarmed strikes, mystical abilities, and unparalleled physical feats through inner focus.",
  Paladin: "A holy warrior bound by sacred oaths, combining formidable martial skill with divine magic to protect the innocent and smite evil.",
  Ranger: "A skilled hunter and tracker, at home in the wilderness, striking foes with precision and utilizing nature's aid in combat and exploration.",
  Rogue: "A master of stealth, deception, and precision, striking from the shadows, disarming traps, picking locks, and finding hidden paths.",
  Sorcerer: "Born with innate magical power, they cast spells through sheer force of will and raw talent, their magic flowing from within their very being.",
  Warlock: "A spellcaster who gains power through a pact with a mysterious, otherworldly entity, wielding forbidden and potent magic at a cost.",
  Wizard: "A scholar of arcane lore, mastering complex spells through rigorous study of ancient texts and the fundamental forces of magic.",
};

// Ability Score Descriptions
const abilityScoreDescriptions: { [key: string]: string } = {
  STR: "Strength measures physical power, how hard you can hit in melee, and your capacity to lift or carry heavy objects.",
  DEX: "Dexterity governs agility, reflexes, balance, and precision in movement, ranged attacks, and stealth.",
  CON: "Constitution represents your health, stamina, and ability to endure hardship, resist poisons, or withstand magical effects.",
  INT: "Intelligence reflects your knowledge, reasoning, memory, and ability to solve puzzles or cast complex arcane spells.",
  WIS: "Wisdom determines your perception, intuition, common sense, and connection to the world around you, often used for divine magic.",
  CHA: "Charisma represents your force of personality, leadership, charm, and ability to influence others through words or presence.",
};

// Point Buy System Description
const pointBuySystemDescription: string =
  "The Point Buy system allows you to customize your character's core abilities by spending a limited pool of points. Higher scores cost more points, encouraging strategic choices for your hero's strengths.";

const POINT_BUY_CONFIG = {
  initialPoints: 27,
  minScore: 8,
  maxScore: 15,
  // The total cost to reach a given score from the base of 8.
  scoreCost: {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
  } as Record<number, number>,
};

const INITIAL_SCORES: AbilityScores = {
  STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8,
};

// --- HELPER ICONS ---

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const CharacterPlaceholderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-chimera-gold/20">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);


// --- UI SUB-COMPONENTS ---

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Panel: React.FC<PanelProps> = ({ title, children, className = '' }) => (
  <div className={`bg-chimera-surface border border-chimera-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in ${className}`}>
    <h2 className="font-display text-2xl text-chimera-gold mb-6 tracking-wider">{title}</h2>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const StyledInput: React.FC<StyledInputProps> = ({ label, ...props }) => (
    <div>
        <label className="block font-body text-sm text-chimera-text-secondary font-semibold mb-2">{label}</label>
        <input
            {...props}
            className="w-full bg-chimera-bg border-2 border-chimera-border rounded-lg px-4 py-3 font-body text-chimera-text-primary
                       focus:outline-none focus:border-chimera-gold/50 focus:shadow-glow transition-all shadow-inner-dark"
        />
    </div>
);

interface StyledSelectProps {
    label: string;
    options: readonly string[];
    value: string;
    onChange: (value: string) => void;
    descriptions?: { [key: string]: string };
}

const StyledSelect: React.FC<StyledSelectProps> = ({ label, options, value, onChange, descriptions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <label className="block font-body text-sm text-chimera-text-secondary font-semibold mb-2">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-chimera-bg border-2 border-chimera-border rounded-lg px-4 py-3 font-body text-chimera-text-primary
                           focus:outline-none focus:border-chimera-gold/50 focus:shadow-glow transition-all shadow-inner-dark"
            >
                <span>{value}</span>
                <ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-chimera-elevated border-2 border-chimera-gold/50 rounded-lg shadow-glow-lg max-h-96 overflow-auto custom-scrollbar">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-3 hover:bg-chimera-gold/10 cursor-pointer transition-all first:rounded-t-lg last:rounded-b-lg border-b border-chimera-border last:border-b-0"
                        >
                            <div className="text-chimera-text-primary font-semibold hover:text-chimera-gold transition-colors">
                                {option}
                            </div>
                            {descriptions && descriptions[option] && (
                                <p className="text-chimera-text-muted text-xs mt-1 leading-relaxed">
                                    {descriptions[option]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface AbilityScoreRowProps {
    ability: Ability;
    score: number;
    onScoreChange: (ability: Ability, delta: 1 | -1) => void;
    canIncrease: boolean;
    canDecrease: boolean;
}

const AbilityScoreRow: React.FC<AbilityScoreRowProps> = ({ ability, score, onScoreChange, canIncrease, canDecrease }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
    <div className="flex items-center justify-between bg-chimera-elevated/50 rounded-lg p-4 border border-chimera-border hover:border-chimera-gold/30 transition-all group">
        <div className="flex items-center gap-2 flex-1">
            <span className="font-body text-lg text-chimera-text-secondary font-semibold w-16">{ability}</span>
            <div className="relative">
                <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="text-chimera-gold/50 hover:text-chimera-gold transition-colors"
                >
                    <InfoIcon />
                </button>
                {showTooltip && (
                    <div className="absolute left-0 bottom-full mb-2 w-72 bg-chimera-bg border-2 border-chimera-gold/30 rounded-lg p-3 shadow-glow-lg z-20 animate-fade-in">
                        <p className="text-chimera-text-primary text-xs leading-relaxed">
                            {abilityScoreDescriptions[ability]}
                        </p>
                    </div>
                )}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={() => onScoreChange(ability, -1)}
                disabled={!canDecrease}
                className="p-2 rounded-full border-2 border-chimera-gold/30 text-chimera-gold transition-all
                           hover:enabled:bg-chimera-gold/20 hover:enabled:border-chimera-gold hover:enabled:shadow-glow
                           disabled:text-chimera-text-muted disabled:border-chimera-border disabled:cursor-not-allowed"
            >
                <MinusIcon />
            </button>
            <span className="font-mono text-3xl text-chimera-gold font-bold w-12 text-center">{score}</span>
            <button
                type="button"
                onClick={() => onScoreChange(ability, 1)}
                disabled={!canIncrease}
                className="p-2 rounded-full border-2 border-chimera-gold/30 text-chimera-gold transition-all
                           hover:enabled:bg-chimera-gold/20 hover:enabled:border-chimera-gold hover:enabled:shadow-glow
                           disabled:text-chimera-text-muted disabled:border-chimera-border disabled:cursor-not-allowed"
            >
                <PlusIcon />
            </button>
        </div>
    </div>
)};



// --- MAIN COMPONENT ---

export const CharacterCreationScreen: React.FC = () => {
    const [name, setName] = useState('');
    const [race, setRace] = useState(RACES[0]);
    const [characterClass, setCharacterClass] = useState(CLASSES[0]);
    const [abilityScores, setAbilityScores] = useState<AbilityScores>(INITIAL_SCORES);

    const totalCost = useMemo(() => {
        return ABILITIES.reduce((cost, ability) => {
            return cost + POINT_BUY_CONFIG.scoreCost[abilityScores[ability]];
        }, 0);
    }, [abilityScores]);

    const pointsRemaining = POINT_BUY_CONFIG.initialPoints - totalCost;

    const handleScoreChange = (ability: Ability, delta: 1 | -1) => {
        const currentScore = abilityScores[ability];
        const newScore = currentScore + delta;

        if (newScore < POINT_BUY_CONFIG.minScore || newScore > POINT_BUY_CONFIG.maxScore) {
            return;
        }

        const newScores = { ...abilityScores, [ability]: newScore };
        const newCost = ABILITIES.reduce((ab, a) => ab + POINT_BUY_CONFIG.scoreCost[newScores[a]], 0);

        if (newCost <= POINT_BUY_CONFIG.initialPoints) {
            setAbilityScores(newScores);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-chimera-bg via-chimera-surface to-chimera-bg text-white p-8 font-body">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Panel: Character Preview */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center bg-chimera-surface/50 border-2 border-chimera-gold/20 rounded-lg p-8 shadow-card-hover min-h-[400px] lg:min-h-0">
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                        <CharacterPlaceholderIcon />
                        <h3 className="mt-6 font-display text-3xl text-chimera-gold tracking-wider">{name || "Nameless Hero"}</h3>
                        <p className="text-chimera-text-accent font-semibold mt-2">{race} {characterClass}</p>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="lg:col-span-2">
                    <header className="mb-8 text-center lg:text-left">
                        <h1 className="font-display text-5xl text-chimera-gold tracking-widest drop-shadow-lg">Create Your Hero</h1>
                        <p className="text-chimera-text-secondary mt-3 text-lg">Forge the legend of a hero for the world of Nuaibria.</p>
                    </header>

                    <form className="space-y-6">
                        <Panel title="Identity">
                            <StyledInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your character's name" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StyledSelect label="Race" options={RACES} value={race} onChange={setRace} descriptions={raceDescriptions} />
                                <StyledSelect label="Class" options={CLASSES} value={characterClass} onChange={setCharacterClass} descriptions={classDescriptions} />
                            </div>
                        </Panel>

                        <Panel title="Ability Scores">
                            <div className="bg-chimera-bg/50 border border-chimera-gold/20 rounded-lg p-4 mb-6">
                                <p className="text-chimera-text-secondary text-sm leading-relaxed">
                                    {pointBuySystemDescription}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-chimera-gold/20">
                                <h3 className="font-body text-lg text-chimera-text-secondary font-semibold">Allocate Your Points</h3>
                                <div className="text-right">
                                    <span className="font-mono text-4xl text-chimera-gold font-bold">{pointsRemaining}</span>
                                    <p className="text-sm text-chimera-text-accent">Points Remaining</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {ABILITIES.map(ability => {
                                    const score = abilityScores[ability];
                                    const canIncrease = score < POINT_BUY_CONFIG.maxScore && pointsRemaining >= (POINT_BUY_CONFIG.scoreCost[score + 1] - POINT_BUY_CONFIG.scoreCost[score]);
                                    const canDecrease = score > POINT_BUY_CONFIG.minScore;
                                    return (
                                        <AbilityScoreRow
                                            key={ability}
                                            ability={ability}
                                            score={score}
                                            onScoreChange={handleScoreChange}
                                            canIncrease={canIncrease}
                                            canDecrease={canDecrease}
                                        />
                                    );
                                })}
                            </div>
                        </Panel>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                className="font-display text-xl bg-gradient-to-r from-chimera-gold to-chimera-ember text-white px-12 py-4 rounded-lg tracking-wider
                                           hover:from-chimera-gold/90 hover:to-chimera-ember/90 hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-0.5"
                                onClick={(e) => e.preventDefault()}
                            >
                                Begin Your Journey
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreationScreen;
