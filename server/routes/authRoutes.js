const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, JWT_SECRET } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const User = require('../models/User');

// Rate limiting map for login brute-force defense
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5-minute lockout

const checkRateLimit = (key) => {
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };
  if (record.lockoutUntil && Date.now() < record.lockoutUntil) {
    const remainingSec = Math.ceil((record.lockoutUntil - Date.now()) / 1000);
    return { allowed: false, remainingSec };
  }
  if (record.lockoutUntil && Date.now() >= record.lockoutUntil) {
    loginAttempts.delete(key);
    return { allowed: true };
  }
  return { allowed: true };
};

const recordFailedAttempt = (key) => {
  const record = loginAttempts.get(key) || { attempts: 0 };
  record.attempts += 1;
  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = Date.now() + LOCKOUT_MS;
  }
  loginAttempts.set(key, record);
};

const clearAttempts = (key) => {
  loginAttempts.delete(key);
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const rawUsername = req.body.username;
    const { password } = req.body;
    if (!rawUsername || !password) {
      return res.status(400).json({ message: 'Please provide both username and password' });
    }

    const username = String(rawUsername).trim();
    const clientKey = `${req.ip || 'unknown'}_${username.toLowerCase()}`;
    const rateLimit = checkRateLimit(clientKey);

    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        message: `Too many failed login attempts. Temporarily locked for security. Please try again in ${rateLimit.remainingSec}s.` 
      });
    }

    let user;
    if (isConnectedToMongo()) {
      user = await User.findOne({ username });
    } else {
      const store = getStore();
      user = store.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    if (!user) {
      recordFailedAttempt(clientKey);
      return res.status(401).json({ message: 'Invalid Login ID or Password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedAttempt(clientKey);
      return res.status(401).json({ message: 'Invalid Login ID or Password' });
    }

    // Login successful - clear failed attempts counter
    clearAttempts(clientKey);

    // 12-hour session lifetime
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role || 'admin' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || 'Phonixe Admin',
        role: user.role || 'admin'
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// GET /api/auth/me (Protected)
router.get('/me', auth, async (req, res) => {
  try {
    let user;
    if (isConnectedToMongo()) {
      user = await User.findById(req.user.id).select('-password');
    } else {
      const store = getStore();
      const u = store.users.find(u => u._id === req.user.id || u.username === req.user.username);
      if (u) {
        user = { id: u._id, username: u.username, name: u.name, role: u.role };
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// POST /api/auth/change-password (Protected)
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    let user;
    if (isConnectedToMongo()) {
      user = await User.findById(req.user.id);
    } else {
      const store = getStore();
      user = store.users.find(u => u._id === req.user.id || u.username === req.user.username);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    if (isConnectedToMongo()) {
      await user.save();
    } else {
      saveJsonDb();
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password', error: err.message });
  }
});

module.exports = router;
