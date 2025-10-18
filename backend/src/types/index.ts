export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface CharacterPosition {
  x: number;
  y: number;
}

export type HitDicePool = Record<string, number>;

export interface EquipmentItem {
  name: string;
  quantity?: number;
}

export interface CharacterRecord {
  id: string;
  user_id: string;
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  ability_scores: AbilityScores;
  hp_max: number;
  hp_current: number;
  temporary_hp: number;
  armor_class: number;
  speed: number;
  hit_dice: HitDicePool;
  position: CharacterPosition;
  campaign_seed: string;
  spell_slots: Record<string, number>;
  backstory: string | null;
  skills: string | null;
  portrait_url: string | null;
  proficiency_bonus: number;
  equipment: EquipmentItem[];
  created_at?: string;
  updated_at?: string;
}

export type NewCharacterRecord = Omit<CharacterRecord, 'id' | 'created_at' | 'updated_at'>;

export interface CombatStats {
  health: number;
  damage: string;
  armorClass: number;
}

export interface Combatant {
  name: string;
  stats: CombatStats;
}

export type CombatOutcome = 'win' | 'draw' | 'error';

export interface CombatResult {
  winner: Combatant | null;
  combatLog: string[];
  outcome: CombatOutcome;
}

export interface MapTile {
  x: number;
  y: number;
  biome: string;
  elevation: number;
  traversable: boolean;
  explored?: boolean;
}

export interface PointOfInterest {
  x: number;
  y: number;
  type: string;
  name: string;
  biome: string;
  description: string;
  dangerLevel: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export type ImageContextType =
  | 'character_portrait'
  | 'location_banner'
  | 'item_icon'
  | 'biome_tile'
  | 'ui_element';

export interface ImageGenerationParams {
  prompt: string;
  dimensions: ImageDimensions;
  contextType: ImageContextType;
  context?: Record<string, unknown>;
}

export interface ImageGenerationResult {
  imageUrl: string;
  cached: boolean;
  metadata: Record<string, unknown>;
}

export type TextType =
  | 'narration'
  | 'description'
  | 'dialogue'
  | 'quest_text'
  | 'flavor';

export interface TextGenerationParams {
  contextKey: string;
  textType: TextType;
  prompt: string;
  context?: Record<string, unknown>;
  useGemini?: boolean;
}

export interface TextGenerationResult {
  content: string;
  cached: boolean;
  llmUsed: 'gemini_pro' | 'local_llm';
  metadata: Record<string, unknown>;
}

export interface ImageStyleConfig {
  basePrompt: string;
  characterStyle?: string;
  environmentStyle?: string;
  itemStyle?: string;
  biomeStyles?: Record<string, string>;
  negativePrompt?: string;
}

export interface TextStyleConfig {
  defaultTone?: string;
  narrativeGuidelines?: string[];
}

export interface StyleConfig {
  imageStyle: ImageStyleConfig;
  textStyle?: TextStyleConfig;
}

export interface LootItem {
  name: string;
  type: string;
  description: string;
  properties: Record<string, unknown>;
  quantity: number;
  equipped: boolean;
}

export interface LootRollResult {
  gold: number;
  items: LootItem[];
}
