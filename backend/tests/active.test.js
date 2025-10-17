const request = require('supertest');
const express = require('express');
const activeRoutes = require('../src/routes/active');

const app = express();
app.use(express.json());
app.use('/api/characters', activeRoutes);

jest.mock('@supabase/supabase-js', () => {
  return { createClient: jest.fn() };
});

describe('Active Event API', () => {
  it('should get the current active event for a character', async () => {
    const res = await request(app).get('/api/characters/123/active-event');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ event: 'You encounter a goblin!' });
  });

  it('should make a choice in an active event for a character', async () => {
    const res = await request(app)
      .post('/api/characters/123/active-event/choose')
      .send({ choice: 'attack' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ outcome: 'You defeated the goblin!' });
  });

  it('should get the history of active events for a character', async () => {
    const res = await request(app).get('/api/characters/123/active-event/history');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([
      { event: 'You encountered a goblin!', outcome: 'You defeated the goblin!' },
    ]);
  });
});