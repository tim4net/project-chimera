const startingEquipment = {
  Fighter: [{ name: 'Longsword' }, { name: 'Chain Mail' }],
  Wizard: [{ name: 'Quarterstaff' }, { name: 'Spellbook' }],
  Rogue: [{ name: 'Dagger', quantity: 2 }, { name: 'Leather Armor' }],
  // Add other classes here
};

function getStartingEquipment(characterClass) {
  return startingEquipment[characterClass] || [];
}

module.exports = {
  getStartingEquipment,
};
