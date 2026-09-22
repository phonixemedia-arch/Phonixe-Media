const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  niche: { type: String, required: true },
  quote: { type: String, required: true },
  stars: { type: Number, default: 5 },
  avatarEmoji: { type: String, default: '✨' },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);
