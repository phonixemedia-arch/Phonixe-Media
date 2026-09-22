const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const Service = require('../models/Service');

// GET /api/services (Public)
router.get('/', async (req, res) => {
  try {
    if (isConnectedToMongo()) {
      const services = await Service.find().sort({ order: 1 });
      return res.json({ success: true, data: services });
    }
    const store = getStore();
    res.json({ success: true, data: store.services || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching services', error: err.message });
  }
});

// POST /api/services (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, badge, desc, features, iconType, order } = req.body;
    if (!title || !desc) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const newService = {
      _id: 'srv_' + Date.now(),
      title,
      badge: badge || 'Core Engine',
      desc,
      features: Array.isArray(features) ? features : (features ? features.split('\n').filter(Boolean) : []),
      iconType: iconType || 'target',
      order: Number(order) || 99,
      active: true
    };

    if (isConnectedToMongo()) {
      const created = await Service.create(newService);
      return res.status(201).json({ success: true, data: created });
    }

    const store = getStore();
    store.services.push(newService);
    saveJsonDb();
    res.status(201).json({ success: true, data: newService });
  } catch (err) {
    res.status(500).json({ message: 'Error creating service', error: err.message });
  }
});

// PUT /api/services/:id (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (typeof updateData.features === 'string') {
      updateData.features = updateData.features.split('\n').filter(Boolean);
    }

    if (isConnectedToMongo()) {
      const updated = await Service.findByIdAndUpdate(id, updateData, { new: true });
      return res.json({ success: true, data: updated });
    }

    const store = getStore();
    const index = store.services.findIndex(s => s._id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Service not found' });
    }
    store.services[index] = { ...store.services[index], ...updateData };
    saveJsonDb();
    res.json({ success: true, data: store.services[index] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating service', error: err.message });
  }
});

// DELETE /api/services/:id (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo()) {
      await Service.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Service deleted' });
    }

    const store = getStore();
    store.services = store.services.filter(s => s._id !== id);
    saveJsonDb();
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting service', error: err.message });
  }
});

module.exports = router;
