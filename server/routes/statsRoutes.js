const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const Stat = require('../models/Stat');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    if (isConnectedToMongo()) {
      const stats = await Stat.find().sort({ order: 1 });
      return res.json({ success: true, data: stats });
    }
    const store = getStore();
    res.json({ success: true, data: store.stats || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

// PUT /api/stats (Protected - Batch update or replace stats)
router.put('/', auth, async (req, res) => {
  try {
    const { stats } = req.body;
    if (!Array.isArray(stats)) {
      return res.status(400).json({ message: 'Stats must be an array' });
    }

    if (isConnectedToMongo()) {
      await Stat.deleteMany({});
      const created = await Stat.insertMany(stats);
      return res.json({ success: true, data: created });
    }

    const store = getStore();
    store.stats = stats;
    saveJsonDb();
    res.json({ success: true, data: store.stats });
  } catch (err) {
    res.status(500).json({ message: 'Error updating stats', error: err.message });
  }
});

module.exports = router;
