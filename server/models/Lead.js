const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  whatsapp: { type: String, required: true },
  instagram: { type: String, required: true },
  niche: { type: String, required: true },
  goal: { type: String, default: 'Client Growth' },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'closed'],
    default: 'new'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
