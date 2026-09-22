const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  niche: { type: String, required: true },
  startingPoint: { type: String, required: true },
  strategy: { type: String, required: true },
  reach: { type: String, required: true },
  leads: { type: String, required: true },
  growth: { type: String, required: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.models.CaseStudy || mongoose.model('CaseStudy', caseStudySchema);
