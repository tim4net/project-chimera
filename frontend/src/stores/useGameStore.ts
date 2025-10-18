/**
 * @file useGameStore.ts
 * @description Zustand store for global game state
 */

import { create } from 'zustand';

interface GameState {
  // Active character
  activeCharacterId: string | null;
  setActiveCharacterId: (id: string | null) => void;

  // UI state
  isCharacterSheetOpen: boolean;
  toggleCharacterSheet: () => void;

  isJournalOpen: boolean;
  toggleJournal: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Active character
  activeCharacterId: null,
  setActiveCharacterId: (id) => set({ activeCharacterId: id }),

  // UI state
  isCharacterSheetOpen: true,
  toggleCharacterSheet: () => set((state) => ({ isCharacterSheetOpen: !state.isCharacterSheetOpen })),

  isJournalOpen: true,
  toggleJournal: () => set((state) => ({ isJournalOpen: !state.isJournalOpen })),
}));
