const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername, updatePassword, renameUser } = require('../models/userModel');

async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await createUser(username, hashed);

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await getUserByUsername(req.user.username);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await updatePassword(req.user.username, hashed);
    return res.json({ ok: true });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ error: 'Could not change password' });
  }
}

async function changeUsername(req, res) {
  try {
    const { newUsername, currentPassword } = req.body;
    if (!newUsername || !currentPassword) {
      return res.status(400).json({ error: 'newUsername and currentPassword are required' });
    }

    const user = await getUserByUsername(req.user.username);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const existing = await getUserByUsername(newUsername);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    await renameUser(req.user.username, newUsername, user.password);

    // Issue a fresh token with the new username
    const token = jwt.sign({ username: newUsername }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ ok: true, token });
  } catch (err) {
    console.error('changeUsername error:', err);
    return res.status(500).json({ error: 'Could not change username' });
  }
}

module.exports = { register, login, changePassword, changeUsername };
