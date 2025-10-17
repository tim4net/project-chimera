const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
  res.send('Project Chimera Backend is running!');
});

describe('GET /', () => {
  it('responds with a message', (done) => {
    request(app)
      .get('/')
      .expect(200, 'Project Chimera Backend is running!', done);
  });
});
