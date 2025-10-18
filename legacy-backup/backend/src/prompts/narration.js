const generateNarrationPrompt = (event) => {
  return `
    You are a dungeon master narrating a story for a player.
    The following event has occurred: ${event}
    Please narrate this event in a creative and engaging way.
  `;
};

module.exports = { generateNarrationPrompt };
