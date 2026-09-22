const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const CaseStudy = require('../models/CaseStudy');

// GET /api/case-studies
router.get('/', async (req, res) => {
  try {
    if (isConnectedToMongo()) {
      const data = await CaseStudy.find().sort({ order: 1 });
      return res.json({ success: true, data });
    }
    const store = getStore();
    res.json({ success: true, data: store.caseStudies || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching case studies', error: err.message });
  }
});

// POST /api/case-studies (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { clientName, niche, startingPoint, strategy, reach, leads, growth, order } = req.body;
    const newCase = {
      _id: 'cs_' + Date.now(),
      clientName,
      niche,
      startingPoint,
      strategy,
      reach,
      leads,
      growth,
      order: Number(order) || 99
    };

    if (isConnectedToMongo()) {
      const created = await CaseStudy.create(newCase);
      return res.status(201).json({ success: true, data: created });
    }

    const store = getStore();
    store.caseStudies.push(newCase);
    saveJsonDb();
    res.status(201).json({ success: true, data: newCase });
  } catch (err) {
    res.status(500).json({ message: 'Error creating case study', error: err.message });
  }
});

// PUT /api/case-studies/:id (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnectedToMongo()) {
      const updated = await CaseStudy.findByIdAndUpdate(id, req.body, { new: true });
      return res.json({ success: true, data: updated });
    }
    const store = getStore();
    const idx = store.caseStudies.findIndex(c => c._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Case study not found' });
    store.caseStudies[idx] = { ...store.caseStudies[idx], ...req.body };
    saveJsonDb();
    res.json({ success: true, data: store.caseStudies[idx] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating case study', error: err.message });
  }
});

// DELETE /api/case-studies/:id (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnectedToMongo()) {
      await CaseStudy.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Case study deleted' });
    }
    const store = getStore();
    store.caseStudies = store.caseStudies.filter(c => c._id !== id);
    saveJsonDb();
    res.json({ success: true, message: 'Case study deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting case study', error: err.message });
  }
});

module.exports = router;
