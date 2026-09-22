const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const Testimonial = require('../models/Testimonial');

// GET /api/testimonials
router.get('/', async (req, res) => {
  try {
    if (isConnectedToMongo()) {
      const data = await Testimonial.find().sort({ order: 1 });
      return res.json({ success: true, data });
    }
    const store = getStore();
    res.json({ success: true, data: store.testimonials || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching testimonials', error: err.message });
  }
});

// POST /api/testimonials (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { authorName, niche, quote, stars, avatarEmoji, order } = req.body;
    const newTest = {
      _id: 'test_' + Date.now(),
      authorName,
      niche,
      quote,
      stars: Number(stars) || 5,
      avatarEmoji: avatarEmoji || '✨',
      order: Number(order) || 99
    };

    if (isConnectedToMongo()) {
      const created = await Testimonial.create(newTest);
      return res.status(201).json({ success: true, data: created });
    }

    const store = getStore();
    store.testimonials.push(newTest);
    saveJsonDb();
    res.status(201).json({ success: true, data: newTest });
  } catch (err) {
    res.status(500).json({ message: 'Error creating testimonial', error: err.message });
  }
});

// PUT /api/testimonials/:id (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnectedToMongo()) {
      const updated = await Testimonial.findByIdAndUpdate(id, req.body, { new: true });
      return res.json({ success: true, data: updated });
    }
    const store = getStore();
    const idx = store.testimonials.findIndex(t => t._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Testimonial not found' });
    store.testimonials[idx] = { ...store.testimonials[idx], ...req.body };
    saveJsonDb();
    res.json({ success: true, data: store.testimonials[idx] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating testimonial', error: err.message });
  }
});

// DELETE /api/testimonials/:id (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnectedToMongo()) {
      await Testimonial.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Testimonial deleted' });
    }
    const store = getStore();
    store.testimonials = store.testimonials.filter(t => t._id !== id);
    saveJsonDb();
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting testimonial', error: err.message });
  }
});

module.exports = router;
