const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const Lead = require('../models/Lead');

// POST /api/leads (Public - Inbound lead submission)
router.post('/', async (req, res) => {
  try {
    const { name, whatsapp, instagram, niche, goal, message } = req.body;
    if (!name || !whatsapp || !instagram || !niche) {
      return res.status(400).json({ message: 'Name, WhatsApp, Instagram, and Niche are required' });
    }

    const newLead = {
      _id: 'lead_' + Date.now(),
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      niche: niche.trim(),
      goal: goal || 'Client Growth',
      message: message ? message.trim() : '',
      status: 'new',
      createdAt: new Date()
    };

    if (isConnectedToMongo()) {
      const created = await Lead.create(newLead);
      return res.status(201).json({ success: true, message: 'Inquiry received successfully', data: created });
    }

    const store = getStore();
    if (!store.leads) store.leads = [];
    store.leads.unshift(newLead);
    saveJsonDb();

    res.status(201).json({ success: true, message: 'Inquiry received successfully', data: newLead });
  } catch (err) {
    res.status(500).json({ message: 'Failed to record lead', error: err.message });
  }
});

// GET /api/leads (Protected - Admin list)
router.get('/', auth, async (req, res) => {
  try {
    if (isConnectedToMongo()) {
      const leads = await Lead.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: leads });
    }

    const store = getStore();
    const sorted = (store.leads || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leads', error: err.message });
  }
});

// PATCH /api/leads/:id/status (Protected - Update status)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (isConnectedToMongo()) {
      const updated = await Lead.findByIdAndUpdate(id, { status }, { new: true });
      return res.json({ success: true, data: updated });
    }

    const store = getStore();
    const lead = (store.leads || []).find(l => l._id === id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.status = status;
    saveJsonDb();
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ message: 'Error updating lead status', error: err.message });
  }
});

// DELETE /api/leads/:id (Protected - Delete lead)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo()) {
      await Lead.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Lead deleted' });
    }

    const store = getStore();
    store.leads = (store.leads || []).filter(l => l._id !== id);
    saveJsonDb();
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting lead', error: err.message });
  }
});

module.exports = router;
