/**
 * TypeScript type definitions for Nuaibria CLI
 */

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpToNextLevel: number;
  position: { x: number; y: number };
  abilities: Abilities;
  skills: Skills;
  inventory: InventoryItem[];
}

export interface Abilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Skills {
  [key: string]: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  equipped: boolean;
}

export interface WorldMap {
  width: number;
  height: number;
  tiles: MapTile[][];
  playerPosition: { x: number; y: number };
}

export interface MapTile {
  x: number;
  y: number;
  biome: string;
  discovered: boolean;
  poi?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'chronicler' | 'player' | 'system';
  content: string;
  timestamp: number;
}

export interface GameState {
  character: Character | null;
  worldMap: WorldMap | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
}
