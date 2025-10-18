const rollDice = (diceString) => {
  const [numDice, rest] = diceString.split('d');
  const [sides, modifier] = rest.split('+');

  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }

  if (modifier) {
    total += parseInt(modifier, 10);
  }

  return total;
};

module.exports = { rollDice };
