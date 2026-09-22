const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStore, saveJsonDb, isConnectedToMongo } = require('../config/db');
const Content = require('../models/Content');
const Stat = require('../models/Stat');
const Service = require('../models/Service');
const CaseStudy = require('../models/CaseStudy');
const Testimonial = require('../models/Testimonial');
const FAQ = require('../models/FAQ');

// GET /api/content - Public full bundle
router.get('/', async (req, res) => {
  try {
    if (isConnectedToMongo()) {
      let content = await Content.findOne();
      if (!content) content = await Content.create({});
      const stats = await Stat.find().sort({ order: 1 });
      const services = await Service.find({ active: true }).sort({ order: 1 });
      const caseStudies = await CaseStudy.find().sort({ order: 1 });
      const testimonials = await Testimonial.find().sort({ order: 1 });
      const faqs = await FAQ.find().sort({ order: 1 });

      return res.json({
        success: true,
        data: { content, stats, services, caseStudies, testimonials, faqs }
      });
    }

    // JSON fallback
    const store = getStore();
    res.json({
      success: true,
      data: {
        content: store.content || {},
        stats: store.stats || [],
        services: (store.services || []).filter(s => s.active !== false),
        caseStudies: store.caseStudies || [],
        testimonials: store.testimonials || [],
        faqs: store.faqs || []
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch content bundle', error: err.message });
  }
});

// PUT /api/content - Protected update general content & settings
router.put('/', auth, async (req, res) => {
  try {
    const updateData = req.body;
    updateData.updatedAt = new Date();

    if (isConnectedToMongo()) {
      let content = await Content.findOne();
      if (!content) {
        content = new Content(updateData);
      } else {
        Object.assign(content, updateData);
      }
      await content.save();
      return res.json({ success: true, message: 'Site content updated successfully', content });
    }

    // JSON fallback
    const store = getStore();
    store.content = { ...store.content, ...updateData };
    saveJsonDb();

    res.json({ success: true, message: 'Site content updated successfully', content: store.content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update content', error: err.message });
  }
});

module.exports = router;
