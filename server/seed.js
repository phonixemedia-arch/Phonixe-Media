const bcrypt = require('bcryptjs');
const { getStore, saveJsonDb, isConnectedToMongo } = require('./config/db');
const User = require('./models/User');
const Content = require('./models/Content');
const Stat = require('./models/Stat');
const Service = require('./models/Service');
const CaseStudy = require('./models/CaseStudy');
const Testimonial = require('./models/Testimonial');
const FAQ = require('./models/FAQ');

const seedData = async () => {
  const hashedPassword = await bcrypt.hash('phonixe@2026', 10);

  const initialUser = {
    _id: 'admin_user_01',
    username: 'admin',
    password: hashedPassword,
    name: 'Phonixe Agency Director',
    role: 'admin',
    createdAt: new Date()
  };

  const initialContent = {
    _id: 'default_content',
    agencyName: 'Phonixe Media',
    tagline: '360° Social Media Growth & Personal Branding',
    heroHeadlinePrefix: 'Turn Your Expertise Into A Brand',
    heroHeadlineHighlight: 'People Remember.',
    heroSubheadline: 'We help coaches, consultants and personal brands build a powerful social presence that attracts attention, builds trust and generates qualified leads.',
    primaryCtaText: 'Book a Free Strategy Call',
    secondaryCtaText: 'See How We Work',
    trustLine: 'Strategy • Content • Personal Branding • Growth',
    whatsappNumber: '+91 98765 43210',
    whatsappPrefillText: "Hi Phonixe Media, I'm interested in scaling my coaching brand.",
    email: 'hello@phonixemedia.com',
    instagramHandle: '@phonixemedia',
    instagramUrl: 'https://instagram.com',
    problemHeadline: 'Posting Consistently Isn’t Enough.',
    problemTransitionText: 'That’s where Phonixe Media comes in.',
    servicesHeadline: 'Everything You Need To Build A Strong Social Brand.',
    processHeadline: 'Our Simple 4-Step Growth System',
    resultsHeadline: 'Strategy. Content. Consistency. Growth.',
    testimonialsHeadline: 'What Our Clients Say',
    whyUsHeadline: 'Not Just Another Social Media Agency.',
    ctaHeadline: 'Your Brand Has Expertise. Now Give It The Visibility It Deserves.',
    ctaSubheadline: 'Let’s build a social media presence that makes your audience stop, trust and take action.'
  };

  const initialStats = [
    { _id: 'stat_1', number: 50, suffix: '+', label: 'Brands Worked With', desc: 'Coaches, consultants & personal brands scaled with strategic positioning.', order: 1 },
    { _id: 'stat_2', number: 100, suffix: 'K+', label: 'Organic Reach Generated', desc: 'High-intent organic impressions without wasting ad spend on vanity metrics.', order: 2 },
    { _id: 'stat_3', number: 500, suffix: '+', label: 'Content Assets Created', desc: 'High-retention reels, carousels, scripts & conversion-engineered stories.', order: 3 },
    { _id: 'stat_4', number: 360, suffix: '°', label: 'Social Media Management', desc: 'End-to-end shooting direction, editing, scheduling & lead workflows.', order: 4 }
  ];

  const initialServices = [
    {
      _id: 'srv_1',
      title: 'Organic Social Media Marketing',
      badge: 'Core Engine',
      desc: 'Strategic distribution and organic community management that expands your presence without expensive, low-trust paid ads.',
      features: [
        'Profile optimization & bio conversion architecture',
        'Algorithm-compliant posting schedule',
        'Community interaction & engagement warm-up',
        'Audience retention & follower nurturing'
      ],
      iconType: 'share',
      order: 1,
      active: true
    },
    {
      _id: 'srv_2',
      title: 'Shooting & Production Direction',
      badge: 'Hands-On',
      desc: 'Never feel awkward on camera again. We provide camera setups, teleprompter scripts, lighting guidance, and shoot workflows.',
      features: [
        'Shot-by-shot remote or on-site shoot guidance',
        'Lighting, audio & frame composition standards',
        'Confidence coaching for speaking on camera',
        'Batch recording system: 1 month of video in 2 hours'
      ],
      iconType: 'video',
      order: 2,
      active: true
    },
    {
      _id: 'srv_3',
      title: 'Content Strategy & Systems',
      badge: 'Strategy',
      desc: 'Create a multi-tiered content ecosystem designed around awareness, unshakeable trust, relationship building, and conversion.',
      features: [
        'Custom content pillars for spiritual & coach niches',
        'High-converting hook formulas & narrative arcs',
        'Audience journey mapping (Stranger → Client)',
        'Competitor gap & differentiation analysis'
      ],
      iconType: 'compass',
      order: 3,
      active: true
    },
    {
      _id: 'srv_4',
      title: 'Reels & Short-Form Content',
      badge: 'High Viral Potential',
      desc: 'Cinematic editing, dynamic captions, sound design, and storytelling hooks engineered specifically for Instagram Reels & YouTube Shorts.',
      features: [
        'Scroll-stopping 3-second hook construction',
        'Premium pacing, b-roll overlays & sound effects',
        'Engaging kinetic typography & caption styling',
        'Platform-native retention optimization'
      ],
      iconType: 'film',
      order: 4,
      active: true
    },
    {
      _id: 'srv_5',
      title: 'Personal Branding',
      badge: 'Authority',
      desc: 'Position your unique gifts, philosophy, and personal story into an undeniable personal brand that commands respect and premium pricing.',
      features: [
        'Origin story articulation & philosophy framing',
        'Signature methodology name & visual packaging',
        'Tone-of-voice and ethical messaging guidelines',
        'Perceived value elevation for high-ticket offers'
      ],
      iconType: 'star',
      order: 5,
      active: true
    },
    {
      _id: 'srv_6',
      title: 'Instagram Growth',
      badge: 'Reach & Fans',
      desc: 'Organic follower acquisition systems that attract genuine seekers, potential students, and qualified clients into your sphere of influence.',
      features: [
        'Strategic keyword & SEO profile tagging',
        'Hashtag & trending audio curation',
        'Collaborative posts & micro-community cross-pollination',
        'Story sales sequences that sell in private'
      ],
      iconType: 'trending-up',
      order: 6,
      active: true
    },
    {
      _id: 'srv_7',
      title: 'Lead Generation Systems',
      badge: 'Conversion',
      desc: 'Turn views and comments into meaningful, high-trust direct message conversations, discovery calls, and WhatsApp consultations.',
      features: [
        'Call-to-Action (CTA) comment trigger automation',
        'Lead magnet & free guide funnel setup',
        'Direct message qualification frameworks',
        'Seamless calendar & WhatsApp booking integration'
      ],
      iconType: 'message-circle',
      order: 7,
      active: true
    },
    {
      _id: 'srv_8',
      title: 'Creative & Social Design',
      badge: 'Aesthetics',
      desc: 'World-class visual aesthetics that elevate your feed. Elegant carousels, custom typography, gold-accented stories, and branded templates.',
      features: [
        'High-save educational multi-slide carousels',
        'Story highlight covers & brand aesthetic kit',
        'Quote graphics with premium typography',
        'Consistent color grading and visual hierarchy'
      ],
      iconType: 'palette',
      order: 8,
      active: true
    }
  ];

  const initialCaseStudies = [
    {
      _id: 'cs_1',
      clientName: '[Client Name: Tarot Mentor]',
      niche: 'Tarot & Intuitive Coach',
      startingPoint: 'Posting daily horoscope screenshots with low reach (<400 views). Struggling to convert viewers into paid 1-on-1 private readings.',
      strategy: 'Engineered interactive "Pick-a-Card" retention reels, debunked popular occult myths, and implemented a keyword DM automation trigger.',
      reach: '180K+ Views',
      leads: '42+ Inquiries',
      growth: '3.4x Revenue',
      order: 1
    },
    {
      _id: 'cs_2',
      clientName: '[Client Name: Vastu Consultant]',
      niche: 'Vastu & Numerology Expert',
      startingPoint: 'Complicated text-heavy posts that people saved but never reached out about. Perceived as academic rather than approachable solution provider.',
      strategy: 'Introduced real-world site inspection mini-vlogs, quick home entrance tips, and an actionable "Vastu Energy Checklist" lead magnet.',
      reach: '95K+ Reach',
      leads: '26+ Consults',
      growth: '4.1x High-Ticket ROI',
      order: 2
    },
    {
      _id: 'cs_3',
      clientName: '[Client Name: Mindset Coach]',
      niche: 'Relationship & Life Mentor',
      startingPoint: 'Sporadic reel posting with zero video editing polish. Uncomfortable talking to camera and suffering from creative fatigue.',
      strategy: '2-hour structured batch shooting system, deep emotional vulnerability hooks, and a story sales sequence converting warm followers to calls.',
      reach: '240K+ Impressions',
      leads: '38+ Calls Booked',
      growth: '5x Time Saved',
      order: 3
    }
  ];

  const initialTestimonials = [
    {
      _id: 'test_1',
      authorName: '[Client Name / Verified Coach]',
      niche: 'Tarot & Spiritual Reader',
      quote: 'Before Phonixe Media, I spent endless hours editing my own reels and barely got any readings booked. Within 45 days of their scripting and shooting system, my profile reach exploded and I booked out my private sessions!',
      stars: 5,
      avatarEmoji: '✨',
      order: 1
    },
    {
      _id: 'test_2',
      authorName: '[Client Name / Consultant]',
      niche: 'Vastu & Energy Architect',
      quote: 'The shooting direction was a total game-changer for me. As a Vastu consultant, explaining energy principles on camera was tough. Phonixe scripted it so clearly that high-net-worth clients started messaging me directly for property audits.',
      stars: 5,
      avatarEmoji: '🏛️',
      order: 2
    },
    {
      _id: 'test_3',
      authorName: '[Client Name / Founder]',
      niche: 'Akashic & Relationship Mentor',
      quote: 'The greatest relief is the consistency. I record for 2 hours once a month and my entire Instagram is handled at a celebrity level. My discovery call calendar has never been this reliably full!',
      stars: 5,
      avatarEmoji: '💫',
      order: 3
    }
  ];

  const initialFaqs = [
    {
      _id: 'faq_1',
      question: 'What type of businesses do you work with?',
      answer: 'We specialize in coaches, consultants, personal brands, creators, and service-based professionals. In particular, we have deep expertise in coaching sectors including Numerologists, Tarot Readers, Vastu Consultants, Relationship & Marriage Mentors, Spiritual Healers, Akashic Record Readers, and Transformation Leaders who want to convert social visibility into high-ticket clients.',
      order: 1
    },
    {
      _id: 'faq_2',
      question: 'Do you work with coaches and personal brands?',
      answer: 'Yes, absolutely! Coaches and personal brands are our primary specialty. We know how to translate your personal wisdom, intuitive gifts, or consulting framework into compelling short-form video scripts, authoritative carousels, and stories that generate trust quickly.',
      order: 2
    },
    {
      _id: 'faq_3',
      question: 'What services are included in social media management?',
      answer: 'Our 360° management covers everything from A to Z: audience research, content strategy, custom hook & video scripting, shooting direction, video editing with captions and sound design, carousel graphic creation, scheduling, caption writing, hashtag & SEO tagging, profile optimization, and lead generation frameworks.',
      order: 3
    },
    {
      _id: 'faq_4',
      question: 'How long does it take to see results?',
      answer: 'Organic social media is an asset that compounds. Most of our clients notice a sharp increase in engagement, video views, and profile visits within the first 30 days. Consistent high-intent lead generation and discovery call bookings typically ramp up between days 45 and 90 as trust and algorithmic authority solidify.',
      order: 4
    },
    {
      _id: 'faq_5',
      question: 'Do you create reels and carousel content?',
      answer: 'Yes. Short-form Reels and authoritative multi-slide Carousels are the primary organic growth drivers today. We provide done-for-you hook ideation, exact scripts, guidance on what to wear and how to frame your shots, followed by cinematic editing, motion graphics, and premium cover design.',
      order: 5
    },
    {
      _id: 'faq_6',
      question: 'Do you provide content strategy?',
      answer: 'Yes, strategy is the foundation of our entire agency. We never create content in a vacuum. Every month begins with a strategic roadmap tailored to your target client demographic, signature program launches, and quarterly business revenue goals.',
      order: 6
    },
    {
      _id: 'faq_7',
      question: 'Do you offer customized packages?',
      answer: 'Yes. While we have proven tier packages for full 360° management, we frequently design customized arrangements depending on whether you require pure video editing, end-to-end management, shooting production assistance, or intensive 1-on-1 brand positioning consulting.',
      order: 7
    },
    {
      _id: 'faq_8',
      question: 'How can I get started?',
      answer: 'Getting started is simple! Click the "Book a Free Strategy Call" button on this page to schedule an audit call, or click the WhatsApp button to message us directly. We’ll review your current profile, outline your custom growth blueprint, and see if we are the right mutual fit.',
      order: 8
    }
  ];

  // Seed JSON fallback store
  const store = getStore();
  if (!store.users || store.users.length === 0) {
    store.users = [initialUser];
  }
  if (!store.content || Object.keys(store.content).length === 0) {
    store.content = initialContent;
  }
  if (!store.stats || store.stats.length === 0) {
    store.stats = initialStats;
  }
  if (!store.services || store.services.length === 0) {
    store.services = initialServices;
  }
  if (!store.caseStudies || store.caseStudies.length === 0) {
    store.caseStudies = initialCaseStudies;
  }
  if (!store.testimonials || store.testimonials.length === 0) {
    store.testimonials = initialTestimonials;
  }
  if (!store.faqs || store.faqs.length === 0) {
    store.faqs = initialFaqs;
  }
  if (!store.leads) {
    store.leads = [];
  }
  saveJsonDb();

  // If MongoDB is connected, seed into MongoDB collections as well
  if (isConnectedToMongo()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) await User.create(initialUser);

      const contentCount = await Content.countDocuments();
      if (contentCount === 0) await Content.create(initialContent);

      const statCount = await Stat.countDocuments();
      if (statCount === 0) await Stat.insertMany(initialStats);

      const serviceCount = await Service.countDocuments();
      if (serviceCount === 0) await Service.insertMany(initialServices);

      const caseStudyCount = await CaseStudy.countDocuments();
      if (caseStudyCount === 0) await CaseStudy.insertMany(initialCaseStudies);

      const testimonialCount = await Testimonial.countDocuments();
      if (testimonialCount === 0) await Testimonial.insertMany(initialTestimonials);

      const faqCount = await FAQ.countDocuments();
      if (faqCount === 0) await FAQ.insertMany(initialFaqs);
    } catch (err) {
      console.warn('MongoDB seeding note:', err.message);
    }
  }

  console.log('✅ Phonixe Media Database Seeded successfully!');
  console.log('🔑 Admin Credentials: ID="admin" Password="phonixe@2026"');
};

module.exports = seedData;
