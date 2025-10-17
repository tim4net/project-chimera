const request = require('supertest');
const express = require('express');
const worldRoutes = require('../src/routes/world');

const app = express();
app.use(express.json());
app.use('/api/world', worldRoutes);

describe('World Generation API', () => {
  it('should get map tiles for a given seed and position', async () => {
    const res = await request(app).get('/api/world/123/map?x=0&y=0');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('tiles');
    expect(Array.isArray(res.body.tiles)).toBe(true);
  });

  it('should get points of interest for a given seed and position', async () => {
    const res = await request(app).get('/api/world/123/poi?x=0&y=0');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
