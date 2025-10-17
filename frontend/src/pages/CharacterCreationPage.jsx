import React, { useState } from 'react';

const CharacterCreationPage = () => {
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState({
    name: '',
    class: '',
    stats: {},
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (e) => {
    setCharacter({ ...character, [e.target.name]: e.target.value });
  };

  const handleStatsRoll = () => {
    // For simplicity, we'll just generate random stats for now
    const stats = {
      strength: Math.floor(Math.random() * 18) + 3,
      dexterity: Math.floor(Math.random() * 18) + 3,
      constitution: Math.floor(Math.random() * 18) + 3,
      intelligence: Math.floor(Math.random() * 18) + 3,
      wisdom: Math.floor(Math.random() * 18) + 3,
      charisma: Math.floor(Math.random() * 18) + 3,
    };
    setCharacter({ ...character, stats });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle character creation logic here
    console.log(character);
  };

  switch (step) {
    case 1:
      return (
        <div>
          <h1>Step 1: Name and Class</h1>
          <input
            type="text"
            name="name"
            placeholder="Character Name"
            value={character.name}
            onChange={handleChange}
          />
          <select name="class" value={character.class} onChange={handleChange}>
            <option value="">Select a Class</option>
            <option value="Fighter">Fighter</option>
            <option value="Wizard">Wizard</option>
            <option value="Rogue">Rogue</option>
            <option value="Cleric">Cleric</option>
          </select>
          <button onClick={nextStep}>Next</button>
        </div>
      );
    case 2:
      return (
        <div>
          <h1>Step 2: Stats</h1>
          <button onClick={handleStatsRoll}>Roll for Stats</button>
          <ul>
            {Object.entries(character.stats).map(([stat, value]) => (
              <li key={stat}>
                {stat}: {value}
              </li>
            ))}
          </ul>
          <button onClick={prevStep}>Previous</button>
          <button onClick={nextStep}>Next</button>
        </div>
      );
    case 3:
      return (
        <div>
          <h1>Step 3: Review</h1>
          <p>Name: {character.name}</p>
          <p>Class: {character.class}</p>
          <ul>
            {Object.entries(character.stats).map(([stat, value]) => (
              <li key={stat}>
                {stat}: {value}
              </li>
            ))}
          </ul>
          <button onClick={prevStep}>Previous</button>
          <button onClick={handleSubmit}>Create Character</button>
        </div>
      );
    default:
      return null;
  }
};

export default CharacterCreationPage;
