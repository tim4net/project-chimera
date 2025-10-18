import { useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';

type CharacterFormState = {
  name: string;
  race: string;
  class: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

const numericFields = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
type NumericField = typeof numericFields[number];
const isNumericField = (field: string): field is NumericField => (numericFields as readonly string[]).includes(field);

const CharacterCreationWizard = () => {
  const [step, setStep] = useState<number>(1);
  const [character, setCharacter] = useState<CharacterFormState>({
    name: '',
    race: '',
    class: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const nextStep = () => setStep((current) => current + 1);
  const prevStep = () => setStep((current) => current - 1);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCharacter((prev) => {
      if (isNumericField(name)) {
        return { ...prev, [name]: Number(value) } as CharacterFormState;
      }
      return { ...prev, [name]: value } as CharacterFormState;
    });
  };

  const handleCreate = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(character),
      });
      if (response.ok) {
        alert('Character created successfully!');
      } else {
        const errorPayload = (await response.json()) as { error?: string };
        alert(`Error: ${errorPayload.error ?? 'Unknown error'}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      alert(`Error: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Character Creation</h1>
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Name</h2>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="name"
              value={character.name}
              onChange={handleChange}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={nextStep}
            >
              Next
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Race</h2>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="race"
              value={character.race}
              onChange={handleChange}
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 3: Class</h2>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="class"
              value={character.class}
              onChange={handleChange}
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 4: Ability Scores</h2>
            {/* Add ability score assignment UI here */}
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleCreate}
              >
                Create Character
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreationWizard;
