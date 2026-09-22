const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  suffix: { type: String, default: '+' },
  label: { type: String, required: true },
  desc: { type: String, required: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.models.Stat || mongoose.model('Stat', statSchema);
