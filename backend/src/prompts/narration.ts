export const generateNarrationPrompt = (event: string): string => {
  return `
    You are a dungeon master narrating a story for a player.
    The following event has occurred: ${event}
    Please narrate this event in a creative and engaging way.
  `.trim();
};

export default generateNarrationPrompt;
