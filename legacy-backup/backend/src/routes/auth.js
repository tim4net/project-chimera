const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ user });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ user });
});

// Get user
router.get('/user', async (req, res) => {
  const { user, error } = await supabase.auth.user();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ user });
});

// Logout
router.post('/logout', async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: 'Logged out' });
});

module.exports = router;
