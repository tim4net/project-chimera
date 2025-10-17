const request = require('supertest');
const express = require('express');

// Mock Supabase before requiring the routes
jest.mock('@supabase/supabase-js');

const idleRoutes = require('../src/routes/idle');

const app = express();
app.use(express.json());
app.use('/api/characters', idleRoutes);

describe('Idle Task API', () => {
  it('should set an idle task for a character', async () => {
    const res = await request(app)
      .post('/api/characters/123/idle-task')
      .send({ task: 'scouting' });
    expect(res.statusCode).toEqual(200);
  });

  it('should get the status of an idle task for a character', async () => {
    const res = await request(app).get('/api/characters/123/idle-task/status');
    expect(res.statusCode).toEqual(200);
  });

  it('should resolve an idle task for a character', async () => {
    const res = await request(app).post('/api/characters/123/idle-task/resolve');
    expect(res.statusCode).toEqual(200);
  });
});
