const { generateMap } = require('../src/game/map');

describe('generateMap', () => {
  it('should generate a map of the correct size', () => {
    const width = 10;
    const height = 10;
    const map = generateMap(width, height);
    expect(map.length).toEqual(height);
    expect(map[0].length).toEqual(width);
  });
});
