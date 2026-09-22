const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  agencyName: { type: String, default: 'Phonixe Media' },
  tagline: { type: String, default: '360° Social Media Growth & Personal Branding' },
  heroHeadlinePrefix: { type: String, default: 'Turn Your Expertise Into A Brand' },
  heroHeadlineHighlight: { type: String, default: 'People Remember.' },
  heroSubheadline: { 
    type: String, 
    default: 'We help coaches, consultants and personal brands build a powerful social presence that attracts attention, builds trust and generates qualified leads.' 
  },
  primaryCtaText: { type: String, default: 'Book a Free Strategy Call' },
  secondaryCtaText: { type: String, default: 'See How We Work' },
  trustLine: { type: String, default: 'Strategy • Content • Personal Branding • Growth' },
  
  // Contact details
  whatsappNumber: { type: String, default: '+91 98765 43210' },
  whatsappPrefillText: { type: String, default: "Hi Phonixe Media, I'm interested in scaling my coaching brand." },
  email: { type: String, default: 'hello@phonixemedia.com' },
  instagramHandle: { type: String, default: '@phonixemedia' },
  instagramUrl: { type: String, default: 'https://instagram.com' },

  // Sections config
  problemHeadline: { type: String, default: 'Posting Consistently Isn’t Enough.' },
  problemTransitionText: { type: String, default: 'That’s where Phonixe Media comes in.' },
  servicesHeadline: { type: String, default: 'Everything You Need To Build A Strong Social Brand.' },
  processHeadline: { type: String, default: 'Our Simple 4-Step Growth System' },
  resultsHeadline: { type: String, default: 'Strategy. Content. Consistency. Growth.' },
  testimonialsHeadline: { type: String, default: 'What Our Clients Say' },
  whyUsHeadline: { type: String, default: 'Not Just Another Social Media Agency.' },
  ctaHeadline: { type: String, default: 'Your Brand Has Expertise. Now Give It The Visibility It Deserves.' },
  ctaSubheadline: { type: String, default: 'Let’s build a social media presence that makes your audience stop, trust and take action.' },
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Content || mongoose.model('Content', contentSchema);
