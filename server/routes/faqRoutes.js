const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const FAQ = require('../models/FAQ');

// GET /api/faqs
router.get('/', async (req, res) => {
  try {
    if (isConnectedToMongo()) {
      const data = await FAQ.find().sort({ order: 1 });
      return res.json({ success: true, data });
    }
    const store = getStore();
    res.json({ success: true, data: store.faqs || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching FAQs', error: err.message });
  }
});

// POST /api/faqs (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    const newFaq = {
      _id: 'faq_' + Date.now(),
      question,
      answer,
      order: Number(order) || 99
    };

    if (isConnectedToMongo()) {
      const created = await FAQ.create(newFaq);
      return res.status(201).json({ success: true, data: created });
    }

    const store = getStore();
    store.faqs.push(newFaq);
    saveJsonDb();
    res.status(201).json({ success: true, data: newFaq });
  } catch (err) {
    res.status(500).json({ message: 'Error creating FAQ', error: err.message });
  }
});

// PUT /api/faqs/:id (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnectedToMongo()) {
      const updated = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
      return res.json({ success: true, data: updated });
    }
    const store = getStore();
    const idx = store.faqs.findIndex(f => f._id === id);
    if (idx === -1) return res.status(404).json({ message: 'FAQ not found' });
    store.faqs[idx] = { ...store.faqs[idx], ...req.body };
    saveJsonDb();
    res.json({ success: true, data: store.faqs[idx] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating FAQ', error: err.message });
  }
});

// DELETE /api/faqs/:id (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnectedToMongo()) {
      await FAQ.findByIdAndDelete(id);
      return res.json({ success: true, message: 'FAQ deleted' });
    }
    const store = getStore();
    store.faqs = store.faqs.filter(f => f._id !== id);
    saveJsonDb();
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting FAQ', error: err.message });
  }
});

module.exports = router;
