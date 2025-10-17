import React from 'react';

const CharacterSheet = ({ character }) => {
  if (!character) {
    return <div>No character selected</div>;
  }

  return (
    <div>
      <h2>{character.name}</h2>
      <p>
        {character.race} {character.class} - Level {character.level}
      </p>
      <hr />
      <h3>Ability Scores</h3>
      <ul>
        <li>Strength: {character.strength}</li>
        <li>Dexterity: {character.dexterity}</li>
        <li>Constitution: {character.constitution}</li>
        <li>Intelligence: {character.intelligence}</li>
        <li>Wisdom: {character.wisdom}</li>
        <li>Charisma: {character.charisma}</li>
      </ul>
      <hr />
      <h3>Stats</h3>
      <ul>
        <li>HP: {character.hp_current} / {character.hp_max}</li>
        <li>XP: {character.xp}</li>
      </ul>
    </div>
  );
};

export default CharacterSheet;
