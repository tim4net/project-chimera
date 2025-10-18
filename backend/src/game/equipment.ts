export interface EquipmentItem {
  name: string;
  quantity?: number;
}

const startingEquipment: Record<string, EquipmentItem[]> = {
  Fighter: [{ name: 'Longsword' }, { name: 'Chain Mail' }],
  Wizard: [{ name: 'Quarterstaff' }, { name: 'Spellbook' }],
  Rogue: [{ name: 'Dagger', quantity: 2 }, { name: 'Leather Armor' }]
};

export const getStartingEquipment = (characterClass: string): EquipmentItem[] => {
  return startingEquipment[characterClass] ?? [];
};

export default getStartingEquipment;
