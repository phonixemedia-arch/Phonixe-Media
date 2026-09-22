const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
