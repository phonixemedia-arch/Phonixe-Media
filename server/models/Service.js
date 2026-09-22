const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  badge: { type: String, default: 'Strategic' },
  desc: { type: String, required: true },
  features: [{ type: String }],
  iconType: { type: String, default: 'target' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);
