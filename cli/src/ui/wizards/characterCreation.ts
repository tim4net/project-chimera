/**
 * Character Creation Wizard
 * Step-by-step character creation flow with spell selection
 */

import blessed from 'blessed';
import type { Character } from '../../types/index.js';

export interface CharacterCreationData {
  name?: string;
  race?: string;
  class?: string;
  subclass?: string;
  background?: string;
  alignment?: string;
  abilityScores?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: string[];
  spells?: string[];
}

type WizardStep =
  | 'welcome'
  | 'name'
  | 'race'
  | 'class'
  | 'abilities'
  | 'background'
  | 'skills'
  | 'spells'
  | 'confirm'
  | 'complete';

export class CharacterCreationWizard {
  private screen: blessed.Widgets.Screen;
  private container: blessed.Widgets.BoxElement;
  private titleBox: blessed.Widgets.BoxElement;
  private contentBox: blessed.Widgets.BoxElement;
  private inputBox: blessed.Widgets.TextboxElement;
  private currentStep: WizardStep = 'welcome';
  private data: CharacterCreationData = {};
  private onComplete: (data: CharacterCreationData) => void;
  private onCancel: () => void;

  constructor(
    screen: blessed.Widgets.Screen,
    onComplete: (data: CharacterCreationData) => void,
    onCancel: () => void
  ) {
    this.screen = screen;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    // Create container
    this.container = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        bg: 'black',
      },
      label: ' Character Creation ',
    });

    // Title
    this.titleBox = blessed.box({
      parent: this.container,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '',
      style: {
        fg: 'yellow',
        bold: true,
      },
      align: 'center',
    });

    // Content area
    this.contentBox = blessed.box({
      parent: this.container,
      top: 3,
      left: 1,
      right: 1,
      bottom: 5,
      scrollable: true,
      keys: true,
      vi: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '█',
        style: { fg: 'cyan' },
      },
      content: '',
      tags: true,
    });

    // Input box
    this.inputBox = blessed.textbox({
      parent: this.container,
      bottom: 1,
      left: 2,
      right: 2,
      height: 3,
      inputOnFocus: true,
      border: { type: 'line' },
      style: {
        border: { fg: 'green' },
        focus: { border: { fg: 'yellow' } },
      },
    });

    // Key handlers
    this.container.key(['escape'], () => {
      this.onCancel();
    });

    this.inputBox.key(['enter'], () => {
      const input = this.inputBox.getValue().trim();
      this.inputBox.clearValue();
      this.handleInput(input);
    });

    this.showStep();
    this.inputBox.focus();
    this.screen.render();
  }

  private showStep(): void {
    switch (this.currentStep) {
      case 'welcome':
        this.showWelcome();
        break;
      case 'name':
        this.showNameStep();
        break;
      case 'race':
        this.showRaceStep();
        break;
      case 'class':
        this.showClassStep();
        break;
      case 'abilities':
        this.showAbilitiesStep();
        break;
      case 'background':
        this.showBackgroundStep();
        break;
      case 'skills':
        this.showSkillsStep();
        break;
      case 'spells':
        this.showSpellsStep();
        break;
      case 'confirm':
        this.showConfirmStep();
        break;
    }
    this.screen.render();
  }

  private showWelcome(): void {
    this.titleBox.setContent('Welcome to Nuaibria!');
    this.contentBox.setContent(`
{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

Welcome, traveler! You are about to embark on an epic journey
through the world of Nuaibria, guided by The Chronicler.

This wizard will help you create your character. You'll choose:
  • Your character's name
  • Your race (with unique abilities)
  • Your class (your adventuring profession)
  • Your ability scores (your natural talents)
  • Your background (your history and skills)
  • Your starting equipment and spells (if applicable)

The world of Nuaibria awaits your legend!

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

{yellow-fg}Press ENTER to begin, or ESC to cancel{/yellow-fg}
    `);
  }

  private showNameStep(): void {
    this.titleBox.setContent('Step 1: Choose Your Name');
    this.contentBox.setContent(`
What is your character's name?

Your name will be known throughout Nuaibria. Choose wisely!

Examples: Aria Stormwind, Thorin Ironforge, Elara Moonwhisper

{yellow-fg}Enter your character's name:{/yellow-fg}
    `);
  }

  private showRaceStep(): void {
    this.titleBox.setContent('Step 2: Choose Your Race');
    this.contentBox.setContent(`
Choose your race:

{cyan-fg}[1]{/cyan-fg} Human     - Versatile and adaptable (+1 to all abilities)
{cyan-fg}[2]{/cyan-fg} Elf       - Graceful and wise (Darkvision, +2 DEX, +1 WIS)
{cyan-fg}[3]{/cyan-fg} Dwarf     - Sturdy and resilient (Darkvision, +2 CON, +2 WIS)
{cyan-fg}[4]{/cyan-fg} Halfling  - Lucky and brave (+2 DEX, +1 CHA)
{cyan-fg}[5]{/cyan-fg} Dragonborn- Powerful and draconic (+2 STR, +1 CHA, Breath Weapon)
{cyan-fg}[6]{/cyan-fg} Gnome     - Clever and curious (Darkvision, +2 INT, +1 CON)
{cyan-fg}[7]{/cyan-fg} Half-Elf  - Charismatic and versatile (+2 CHA, +1 to two others)
{cyan-fg}[8]{/cyan-fg} Half-Orc  - Strong and enduring (+2 STR, +1 CON)
{cyan-fg}[9]{/cyan-fg} Tiefling  - Mysterious and charismatic (Darkvision, +2 CHA, +1 INT)

{yellow-fg}Enter the number of your choice (1-9):{/yellow-fg}
    `);
  }

  private showClassStep(): void {
    this.titleBox.setContent('Step 3: Choose Your Class');
    this.contentBox.setContent(`
Choose your class:

{red-fg}[1]{/red-fg} Fighter   - Master of combat and weapons (d10 HP)
{blue-fg}[2]{/blue-fg} Wizard    - Scholar of arcane magic (d6 HP, Spellcaster)
{yellow-fg}[3]{/yellow-fg} Cleric    - Divine servant and healer (d8 HP, Spellcaster)
{green-fg}[4]{/green-fg} Rogue     - Cunning and stealthy (d8 HP)
{cyan-fg}[5]{/cyan-fg} Ranger    - Wilderness expert and tracker (d10 HP)
{magenta-fg}[6]{/magenta-fg} Bard      - Inspiring performer and jack-of-all-trades (d8 HP, Spellcaster)
{red-fg}[7]{/red-fg} Barbarian - Fierce and primal warrior (d12 HP)
{green-fg}[8]{/green-fg} Druid     - Nature's guardian (d8 HP, Spellcaster)
{yellow-fg}[9]{/yellow-fg} Paladin   - Holy warrior sworn to an oath (d10 HP)
{blue-fg}[10]{/blue-fg} Sorcerer  - Innate magic wielder (d6 HP, Spellcaster)
{magenta-fg}[11]{/magenta-fg} Warlock   - Pact-bound magic user (d8 HP, Spellcaster)
{cyan-fg}[12]{/cyan-fg} Monk      - Martial artist and ascetic (d8 HP)

{yellow-fg}Enter the number of your choice (1-12):{/yellow-fg}
    `);
  }

  private showAbilitiesStep(): void {
    this.titleBox.setContent('Step 4: Roll Ability Scores');
    this.contentBox.setContent(`
Rolling your ability scores...

Method: Roll 4d6, drop the lowest die, for each ability.

{cyan-fg}Your rolls:{/cyan-fg}
  Strength:     ${this.rollAbility()} {gray-fg}(Physical power and melee attacks){/gray-fg}
  Dexterity:    ${this.rollAbility()} {gray-fg}(Agility, reflexes, and AC){/gray-fg}
  Constitution: ${this.rollAbility()} {gray-fg}(Health and endurance){/gray-fg}
  Intelligence: ${this.rollAbility()} {gray-fg}(Reasoning and knowledge){/gray-fg}
  Wisdom:       ${this.rollAbility()} {gray-fg}(Awareness and insight){/gray-fg}
  Charisma:     ${this.rollAbility()} {gray-fg}(Force of personality){/gray-fg}

Racial bonuses will be applied based on your chosen race.

{yellow-fg}Press ENTER to continue...{/yellow-fg}
    `);
  }

  private rollAbility(): number {
    const rolls = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ].sort((a, b) => b - a);

    // Drop lowest, sum the rest
    return rolls[0] + rolls[1] + rolls[2];
  }

  private showBackgroundStep(): void {
    this.titleBox.setContent('Step 5: Choose Your Background');
    this.contentBox.setContent(`
Choose your background:

{cyan-fg}[1]{/cyan-fg} Acolyte     - Servant of a temple (Religion, Insight)
{cyan-fg}[2]{/cyan-fg} Criminal    - Lived outside the law (Deception, Stealth)
{cyan-fg}[3]{/cyan-fg} Folk Hero   - Champion of the common people (Animal Handling, Survival)
{cyan-fg}[4]{/cyan-fg} Noble       - Born to privilege (History, Persuasion)
{cyan-fg}[5]{/cyan-fg} Sage        - Researcher and scholar (Arcana, History)
{cyan-fg}[6]{/cyan-fg} Soldier     - Trained in warfare (Athletics, Intimidation)

{yellow-fg}Enter the number of your choice (1-6):{/yellow-fg}
    `);
  }

  private showSkillsStep(): void {
    this.titleBox.setContent('Step 6: Choose Skills');
    this.contentBox.setContent(`
Your class and background grant you proficiency in certain skills.

{green-fg}Skills will be automatically assigned based on your choices.{/green-fg}

{yellow-fg}Press ENTER to continue...{/yellow-fg}
    `);
  }

  private showSpellsStep(): void {
    const isSpellcaster = ['Wizard', 'Cleric', 'Bard', 'Druid', 'Sorcerer', 'Warlock'].includes(this.data.class || '');

    if (!isSpellcaster) {
      this.currentStep = 'confirm';
      this.showStep();
      return;
    }

    this.titleBox.setContent('Step 7: Choose Starting Spells');
    this.contentBox.setContent(`
As a ${this.data.class}, you can cast spells!

{green-fg}Your starting spells will be assigned through the tutorial system
after character creation.{/green-fg}

The Chronicler will guide you through spell selection when you
first enter the world.

{yellow-fg}Press ENTER to continue...{/yellow-fg}
    `);
  }

  private showConfirmStep(): void {
    this.titleBox.setContent('Confirm Your Character');
    const raceName = this.getRaceName(this.data.race || '');
    const className = this.getClassName(this.data.class || '');
    const backgroundName = this.getBackgroundName(this.data.background || '');

    this.contentBox.setContent(`
{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

{cyan-fg}Name:{/cyan-fg}       ${this.data.name}
{cyan-fg}Race:{/cyan-fg}       ${raceName}
{cyan-fg}Class:{/cyan-fg}      ${className}
{cyan-fg}Background:{/cyan-fg} ${backgroundName}

{cyan-fg}Ability Scores:{/cyan-fg}
  STR: ${this.data.abilityScores?.strength || 10}
  DEX: ${this.data.abilityScores?.dexterity || 10}
  CON: ${this.data.abilityScores?.constitution || 10}
  INT: ${this.data.abilityScores?.intelligence || 10}
  WIS: ${this.data.abilityScores?.wisdom || 10}
  CHA: ${this.data.abilityScores?.charisma || 10}

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

{yellow-fg}Is this correct? (yes/no):{/yellow-fg}
    `);
  }

  private handleInput(input: string): void {
    if (this.currentStep === 'welcome') {
      this.currentStep = 'name';
      this.showStep();
      return;
    }

    if (this.currentStep === 'name') {
      if (input.length < 2) {
        this.contentBox.setContent('Please enter a name with at least 2 characters.');
        this.screen.render();
        return;
      }
      this.data.name = input;
      this.currentStep = 'race';
      this.showStep();
      return;
    }

    if (this.currentStep === 'race') {
      const raceMap: Record<string, string> = {
        '1': 'Human', '2': 'Elf', '3': 'Dwarf', '4': 'Halfling',
        '5': 'Dragonborn', '6': 'Gnome', '7': 'Half-Elf',
        '8': 'Half-Orc', '9': 'Tiefling',
      };
      this.data.race = raceMap[input];
      if (!this.data.race) {
        this.contentBox.setContent('Invalid choice. Please enter 1-9.');
        this.screen.render();
        return;
      }
      this.currentStep = 'class';
      this.showStep();
      return;
    }

    if (this.currentStep === 'class') {
      const classMap: Record<string, string> = {
        '1': 'Fighter', '2': 'Wizard', '3': 'Cleric', '4': 'Rogue',
        '5': 'Ranger', '6': 'Bard', '7': 'Barbarian', '8': 'Druid',
        '9': 'Paladin', '10': 'Sorcerer', '11': 'Warlock', '12': 'Monk',
      };
      this.data.class = classMap[input];
      if (!this.data.class) {
        this.contentBox.setContent('Invalid choice. Please enter 1-12.');
        this.screen.render();
        return;
      }
      this.currentStep = 'abilities';
      this.generateAbilityScores();
      this.showStep();
      return;
    }

    if (this.currentStep === 'abilities') {
      this.currentStep = 'background';
      this.showStep();
      return;
    }

    if (this.currentStep === 'background') {
      const bgMap: Record<string, string> = {
        '1': 'Acolyte', '2': 'Criminal', '3': 'Folk Hero',
        '4': 'Noble', '5': 'Sage', '6': 'Soldier',
      };
      this.data.background = bgMap[input];
      if (!this.data.background) {
        this.contentBox.setContent('Invalid choice. Please enter 1-6.');
        this.screen.render();
        return;
      }
      this.currentStep = 'skills';
      this.showStep();
      return;
    }

    if (this.currentStep === 'skills') {
      this.currentStep = 'spells';
      this.showStep();
      return;
    }

    if (this.currentStep === 'spells') {
      this.currentStep = 'confirm';
      this.showStep();
      return;
    }

    if (this.currentStep === 'confirm') {
      if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
        this.currentStep = 'complete';
        this.complete();
      } else {
        this.currentStep = 'name';
        this.data = {};
        this.showStep();
      }
      return;
    }
  }

  private generateAbilityScores(): void {
    this.data.abilityScores = {
      strength: this.rollAbility(),
      dexterity: this.rollAbility(),
      constitution: this.rollAbility(),
      intelligence: this.rollAbility(),
      wisdom: this.rollAbility(),
      charisma: this.rollAbility(),
    };
  }

  private getRaceName(id: string): string {
    return id || 'Unknown';
  }

  private getClassName(id: string): string {
    return id || 'Unknown';
  }

  private getBackgroundName(id: string): string {
    return id || 'Unknown';
  }

  private complete(): void {
    this.container.destroy();
    this.onComplete(this.data);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
