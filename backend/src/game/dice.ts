export const rollDice = (diceString: string): number => {
  const [numDicePart, rest] = diceString.split('d');
  const [sidesPart, modifierPart] = rest.split('+');

  const numDice = Number.parseInt(numDicePart, 10);
  const sides = Number.parseInt(sidesPart, 10);

  if (Number.isNaN(numDice) || Number.isNaN(sides)) {
    throw new Error(`Invalid dice string: ${diceString}`);
  }

  let total = 0;
  for (let i = 0; i < numDice; i += 1) {
    total += Math.floor(Math.random() * sides) + 1;
  }

  if (modifierPart) {
    const modifier = Number.parseInt(modifierPart, 10);
    if (!Number.isNaN(modifier)) {
      total += modifier;
    }
  }

  return total;
};

export default rollDice;
