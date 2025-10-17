require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Project Chimera Backend is running!');
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const characterRoutes = require('./routes/characters');
app.use('/api/characters', characterRoutes);

const worldRoutes = require('./routes/world');
app.use('/api/world', worldRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
