const request = require('supertest');
const express = require('express');

// Mock Supabase before requiring the routes
jest.mock('@supabase/supabase-js');

const characterRoutes = require('../src/routes/characters');

const app = express();
app.use(express.json());
app.use('/api/characters', characterRoutes);

describe('Character API', () => {
  it('should get all characters', async () => {
    const res = await request(app).get('/api/characters');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new character', async () => {
    const newCharacter = {
      name: 'Test Character',
      class: 'Fighter',
      race: 'Human',
      level: 1,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      hp_current: 10,
      hp_max: 10,
      xp: 0,
      position_x: 0,
      position_y: 0,
      campaign_seed: 'test',
    };
    const res = await request(app)
      .post('/api/characters')
      .send(newCharacter);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
  });
});
