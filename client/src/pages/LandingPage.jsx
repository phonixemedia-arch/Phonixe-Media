import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Share2,
  UserCheck,
  Target,
  Video,
  TrendingUp,
  Filter,
  Palette,
  Compass,
  Sparkles,
  Binary,
  Flame,
  HeartHandshake,
  SunMedium,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  MessageCircle,
  X
} from 'lucide-react';

import PhoenixGuide from '../components/phoenix/PhoenixGuide';
import { SHOW_PLACEHOLDERS } from '../data/config';
import { founderData } from '../data/founder';
import { resultsData } from '../data/results';
import { nichesData } from '../data/niches';
import { servicesData } from '../data/services';
import { processData } from '../data/process';
import { whyUsData } from '../data/whyUs';
import { caseStudiesData } from '../data/caseStudies';
import { testimonialsData } from '../data/testimonials';
import { faqData } from '../data/faq';
import { legalData } from '../data/legal';
import { api } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

// Lucide Icon Resolver helper
const iconMap = {
  Share2,
  UserCheck,
  Target,
  Video,
  TrendingUp,
  Filter,
  Palette,
  Compass,
  Sparkles,
  Binary,
  Flame,
  HeartHandshake,
  SunMedium
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isPastHero, setIsPastHero] = useState(false);
  const [isContactInView, setIsContactInView] = useState(false);

  // Legal Modal State
  const [legalModalContent, setLegalModalContent] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    whatsapp: '',
    niche: '',
    service: 'Social Media Management',
    instagram: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const lenisRef = useRef(null);
  const nameInputRef = useRef(null);

  const cleanWaNumber = '918799690069';
  const displayWaNumber = '+91 8799690069';
  const agencyEmail = 'phonixemedia@gmail.com';
  const igHandle = '@phonixe.media';
  const igUrl = 'https://www.instagram.com/phonixe.media/';

  // 1. Lenis Smooth Scroll Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5
    });
    lenisRef.current = lenis;

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    const tickerCallback = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth scroll handler
  const scrollTo = useCallback((targetId) => {
    const el = document.querySelector(targetId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -70 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  }, []);

  // Focus Form from CTA
  const handleBookCallClick = useCallback((e) => {
    if (e) e.preventDefault();
    scrollTo('#contact');
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 700);
  }, [scrollTo]);

  // Preselect service and scroll to contact
  const handleEnquireService = useCallback((serviceTitle) => {
    setFormState(prev => ({ ...prev, service: serviceTitle }));
    scrollTo('#contact');
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 700);
  }, [scrollTo]);

  // 2. Scroll Spy & Visibility Tracking
  useEffect(() => {
    const navSections = ['founder', 'results', 'services', 'process', 'why', 'faq', 'contact'];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);

      const heroEl = document.getElementById('hero');
      const heroHeight = heroEl ? heroEl.offsetHeight : 650;
      setIsPastHero(scrollY > heroHeight - 120);

      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const cRect = contactEl.getBoundingClientRect();
        setIsContactInView(cRect.top <= window.innerHeight * 0.85);
      }

      // Active Section Scroll-Spy
      const spyThreshold = window.innerHeight * 0.35;
      for (const id of navSections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= spyThreshold && rect.bottom >= 120) {
            setActiveSection(id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Meet the Founder Staggered Reveal Animations
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const founderEl = document.getElementById('founder');
    if (!founderEl) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#founder',
          start: 'top 80%',
          once: true
        }
      });

      tl.fromTo('.founder-portrait-frame', 
        { opacity: 0, scale: 0.98, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: 'power2.out' }
      )
      .fromTo('.founder-anim-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out' },
        '-=0.5'
      );
    }, founderEl);

    return () => ctx.revert();
  }, []);

  // Form Submit Handler
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Submit lead to API
      await api.submitLead(formState);

      // 2. Prepare prefilled WhatsApp message
      const textMsg = 
`*New Strategy Consultation Request - Phonixe Media*
---------------------------------------
👤 *Name:* ${formState.name}
📱 *WhatsApp:* ${formState.whatsapp}
🔮 *Domain/Niche:* ${formState.niche}
🎯 *Service Interested In:* ${formState.service}
📸 *Instagram:* ${formState.instagram || 'Not provided'}
📝 *Message:* ${formState.message || 'None'}
---------------------------------------
_Looking forward to connecting with Rudra Joshi & the Phonixe Media team!_`;

      const encoded = encodeURIComponent(textMsg);
      const url = `https://wa.me/${cleanWaNumber}?text=${encoded}`;
      setFormSuccess(true);

      setTimeout(() => {
        window.open(url, '_blank');
      }, 750);
    } catch (err) {
      console.warn('Backend unavailable, opening WhatsApp fallback:', err.message);
      const textMsg = `Hi Phonixe Media, I would like to book a strategy call for ${formState.name} (${formState.whatsapp}). Service: ${formState.service}`;
      window.open(`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(textMsg)}`, '_blank');
      setFormSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items by published flag (or SHOW_PLACEHOLDERS)
  const publishedCaseStudies = caseStudiesData.caseStudies.filter(
    item => item.published || SHOW_PLACEHOLDERS
  );
  const publishedTestimonials = testimonialsData.testimonials.filter(
    item => item.published || SHOW_PLACEHOLDERS
  );

  return (
    <div className="landing-page-root">
      {/* 1. Master Golden Phoenix Storyteller Guide */}
      <PhoenixGuide />

      {/* 2. Sticky Glass Navbar (Glassmorphism Permitted) */}
      <header className={`site-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-container">
          <a href="#hero" className="navbar-brand" onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }}>
            <img src="/assets/logo-horizontal.png" alt="Phonixe Media" className="navbar-logo" />
          </a>

          <nav className="nav-links" aria-label="Main Navigation">
            <a 
              href="#founder" 
              className={`nav-link ${activeSection === 'founder' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollTo('#founder'); }}
            >
              Founder
            </a>
            <a 
              href="#results" 
              className={`nav-link ${activeSection === 'results' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollTo('#results'); }}
            >
              Results
            </a>
            <a 
              href="#services" 
              className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollTo('#services'); }}
            >
              Services
            </a>
            <a 
              href="#process" 
              className={`nav-link ${activeSection === 'process' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollTo('#process'); }}
            >
              Process
            </a>
            <a 
              href="#why" 
              className={`nav-link ${activeSection === 'why' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollTo('#why'); }}
            >
              Why Us
            </a>
            {publishedTestimonials.length > 0 && (
              <a 
                href="#testimonials" 
                className={`nav-link ${activeSection === 'testimonials' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollTo('#testimonials'); }}
              >
                Testimonials
              </a>
            )}
            <a 
              href="#faq" 
              className={`nav-link ${activeSection === 'faq' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollTo('#faq'); }}
            >
              FAQ
            </a>
          </nav>

          <div className="nav-actions">
            <button className="btn btn-primary btn-small" onClick={handleBookCallClick}>
              Book a Free Strategy Call
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-links">
            <li><a href="#founder" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollTo('#founder'); }}>Founder</a></li>
            <li><a href="#results" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollTo('#results'); }}>Results</a></li>
            <li><a href="#services" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollTo('#services'); }}>Services</a></li>
            <li><a href="#process" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollTo('#process'); }}>Process</a></li>
            <li><a href="#why" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollTo('#why'); }}>Why Us</a></li>
            {publishedTestimonials.length > 0 && (
              <li><a href="#testimonials" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollTo('#testimonials'); }}>Testimonials</a></li>
            )}
            <li><a href="#faq" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollTo('#faq'); }}>FAQ</a></li>
          </ul>
          <div style={{ marginTop: '32px' }}>
            <button className="btn btn-primary w-full" onClick={handleBookCallClick} style={{ width: '100%' }}>
              Book a Free Strategy Call
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          1. HERO SECTION (#hero) - "What is this?"
          ==================================================================== */}
      <section className="hero-section" id="hero">
        <div className="container hero-layout">
          <div className="hero-content" data-no-cover>
            <h1 className="hero-title">
              Turn Your Expertise Into A Brand{' '}
              <span className="font-serif-italic-gold">People Remember.</span>
            </h1>
            <p className="hero-text">
              We help coaches, consultants, experts and personal brands build a powerful social presence that attracts attention, builds trust and generates qualified leads.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={handleBookCallClick}>
                Book A Free Strategy Call
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => scrollTo('#results')}>
                Explore Our Work
              </button>
            </div>
            <div className="hero-trust-line">
              Strategy • Content • Personal Branding • Growth
            </div>
          </div>

          {/* Desktop Right Anchor for the Golden Phoenix */}
          <div className="hero-phoenix-anchor" aria-hidden="true" />
        </div>
      </section>

      {/* ====================================================================
          2. MEET THE FOUNDER (#founder) - "Who is behind it?"
          Directly after the Hero
          ==================================================================== */}
      <section className="founder-section" id="founder">
        <div className="container">
          <div className="founder-grid">
            {/* Left Column: Portrait Frame with Gold Glow & Perch Marker */}
            <div className="founder-portrait-frame" data-perch aria-label="Founder Portrait">
              <div className="perch-zone-spacer" aria-hidden="true" />
              <img
                src={founderData.portrait}
                alt={founderData.portraitAlt}
                className="founder-portrait-img"
                loading="eager"
                width="480"
                height="640"
              />
            </div>

            {/* Right Column: Founder Information */}
            <div className="founder-info" data-no-cover>
              <div className="founder-anim-item">
                <span className="section-eyebrow">{founderData.eyebrow}</span>
                <h2 className="founder-name">{founderData.name}</h2>
                <p className="founder-subtitle">{founderData.subtitle}</p>
              </div>

              <div className="founder-anim-item">
                <p className="founder-intro">{founderData.intro}</p>
              </div>

              <div className="founder-meta-row founder-anim-item">
                <span className="founder-exp-number">{founderData.experienceValue}</span>
                <span className="founder-exp-label">{founderData.experienceLabel}</span>
              </div>

              <div className="founder-anim-item">
                <p className="founder-education">{founderData.education}</p>
              </div>

              {/* Expertise Chips */}
              <div className="founder-chips founder-anim-item">
                {founderData.expertiseChips.map((chip, idx) => (
                  <span key={idx} className="expertise-chip">{chip}</span>
                ))}
              </div>

              {/* Achievement Card (Glassmorphism Permitted) */}
              <div className="founder-achievement-card glass-permitted founder-anim-item">
                <p className="founder-achievement-text">
                  <span style={{ color: 'var(--gold-text)', fontWeight: 700 }}>✦ Milestone: </span>
                  {founderData.achievement}
                </p>
              </div>

              {/* Subtle CTA */}
              <div className="founder-anim-item">
                <button className="btn btn-primary" onClick={handleBookCallClick}>
                  {founderData.ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. RESULTS (#results) - "Does it work?"
          ==================================================================== */}
      <section className="results-section" id="results">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">{resultsData.eyebrow}</span>
            <h2 className="section-headline">{resultsData.headline}</h2>
          </div>

          {/* Prominent Highlight Card (Glassmorphism Permitted + [data-perch]) */}
          <div className="results-highlight-card glass-permitted" data-perch>
            <div className="perch-zone-spacer" aria-hidden="true" />
            <div className="results-highlight-stat" data-no-cover>
              {resultsData.highlight}
            </div>
            <p className="results-highlight-desc" data-no-cover>
              {resultsData.text}
            </p>
            <p className="results-disclaimer" data-no-cover>
              {resultsData.disclaimer}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="results-metrics-grid">
            {resultsData.metrics
              .filter(m => m.published || SHOW_PLACEHOLDERS)
              .map(m => (
                <div key={m.id} className="metric-card" data-no-cover>
                  {!m.published && SHOW_PLACEHOLDERS && (
                    <span className="placeholder-badge">Placeholder</span>
                  )}
                  <div className="metric-val">{m.value}</div>
                  <div className="metric-lbl">{m.label}</div>
                  <div className="metric-sub">{m.sub}</div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. WHO WE SERVE (#who-we-serve) - "Is it for me?"
          ==================================================================== */}
      <section className="niches-section" id="who-we-serve">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">{nichesData.eyebrow}</span>
            <h2 className="section-headline">{nichesData.headline}</h2>
            <p className="section-subtext">{nichesData.subtext}</p>
          </div>

          <div className="niches-grid">
            {nichesData.niches.map(niche => {
              const IconComp = iconMap[niche.icon] || Sparkles;
              return (
                <div key={niche.id} className="flat-card niche-card" data-no-cover>
                  <div className="niche-icon-box">
                    <IconComp size={24} />
                  </div>
                  <h3>{niche.title}</h3>
                  <p>{niche.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. SERVICES (#services) - "What do I get?"
          ==================================================================== */}
      <section className="services-section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">{servicesData.eyebrow}</span>
            <h2 className="section-headline">{servicesData.headline}</h2>
            <p className="section-subtext">{servicesData.subtext}</p>
          </div>

          <div className="services-grid">
            {servicesData.services.map(service => {
              const IconComp = iconMap[service.icon] || Compass;
              return (
                <div key={service.id} className="flat-card service-card" data-perch>
                  <div className="perch-zone-spacer" aria-hidden="true" />
                  <div data-no-cover>
                    <div className="service-icon">
                      <IconComp size={22} />
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <button
                    className="service-enquire-link"
                    data-no-cover
                    onClick={() => handleEnquireService(service.title)}
                  >
                    <span>Enquire</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. PROCESS (#process) - "What happens next?"
          ==================================================================== */}
      <section className="process-section" id="process">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">{processData.eyebrow}</span>
            <h2 className="section-headline">{processData.headline}</h2>
            <p className="section-subtext">{processData.subtext}</p>
          </div>

          <div className="process-stepper">
            {processData.steps.map(step => (
              <div key={step.step} className="flat-card process-step" data-perch>
                <div className="perch-zone-spacer" aria-hidden="true" />
                <div className="step-num" data-no-cover>{step.step}</div>
                <h3 data-no-cover>{step.name}</h3>
                <div className="step-summary" data-no-cover>{step.summary}</div>
                <p className="step-detail" data-no-cover>{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. WHY PHONIXE (#why) - "Why them?"
          ==================================================================== */}
      <section className="why-section" id="why">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">{whyUsData.eyebrow}</span>
            <h2 className="section-headline">{whyUsData.headline}</h2>
            <p className="section-subtext">{whyUsData.subtext}</p>
          </div>

          <div className="why-list" data-no-cover>
            {whyUsData.points.map(pt => (
              <div key={pt.number} className="why-row">
                <div className="why-number">{pt.number}</div>
                <div className="why-content">
                  <h4>{pt.title}</h4>
                  <p>{pt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. CASE STUDIES (#work) - "Show me the work."
          ==================================================================== */}
      {publishedCaseStudies.length > 0 && (
        <section className="case-studies-section" id="work">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">{caseStudiesData.eyebrow}</span>
              <h2 className="section-headline">{caseStudiesData.headline}</h2>
              <p className="section-subtext">{caseStudiesData.subtext}</p>
            </div>

            <div className="case-studies-grid">
              {publishedCaseStudies.map(cs => (
                <div key={cs.id} className="flat-card case-card" data-perch>
                  <div className="perch-zone-spacer" aria-hidden="true" />
                  {!cs.published && SHOW_PLACEHOLDERS && (
                    <span className="placeholder-badge">Placeholder</span>
                  )}
                  <h3 data-no-cover>{cs.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-text)', fontWeight: 600 }}>
                    {cs.niche}
                  </span>

                  <div className="case-flow" data-no-cover>
                    <div>
                      <span className="case-stage-label">01 Before</span>
                      <p style={{ fontSize: '0.88rem' }}>{cs.before}</p>
                    </div>
                    <div>
                      <span className="case-stage-label">02 Strategy</span>
                      <p style={{ fontSize: '0.88rem' }}>{cs.strategy}</p>
                    </div>
                    <div>
                      <span className="case-stage-label">03 Execution</span>
                      <p style={{ fontSize: '0.88rem' }}>{cs.execution}</p>
                    </div>
                  </div>

                  <div className="case-result-box" data-no-cover>
                    <span className="case-stage-label">04 Result</span>
                    <div className="case-result-val">{cs.result}</div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                      {cs.disclaimer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          9. TESTIMONIALS (#testimonials) - "Do clients vouch for them?"
          ==================================================================== */}
      {publishedTestimonials.length > 0 && (
        <section className="testimonials-section" id="testimonials">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">{testimonialsData.eyebrow}</span>
              <h2 className="section-headline">{testimonialsData.headline}</h2>
              <p className="section-subtext">{testimonialsData.subtext}</p>
            </div>

            <div className="testimonials-grid">
              {publishedTestimonials.map(t => (
                <div key={t.id} className="flat-card testimonial-card" data-no-cover>
                  {!t.published && SHOW_PLACEHOLDERS && (
                    <span className="placeholder-badge">Placeholder</span>
                  )}
                  <div style={{ color: 'var(--gold-text)', marginBottom: '14px', letterSpacing: '2px' }}>
                    ★★★★★
                  </div>
                  <p className="testimonial-quote">"{t.quote}"</p>
                  <div>
                    <div className="testimonial-author-name">{t.name}</div>
                    <div className="testimonial-author-role">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          10. FAQ ACCORDION (#faq) - "Any doubts?"
          ==================================================================== */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">{faqData.eyebrow}</span>
            <h2 className="section-headline">{faqData.headline}</h2>
            <p className="section-subtext">{faqData.subtext}</p>
          </div>

          <div className="faq-accordion" data-no-cover>
            {faqData.faqs.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={item.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <span className="faq-chevron">▾</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. FINAL CTA + CONTACT FORM (#contact) - "How do I start?"
          ==================================================================== */}
      <section className="contact-section" id="contact">
        <div className="container contact-layout">
          <div className="contact-header" data-no-cover>
            <span className="section-eyebrow">START YOUR ELEVATION</span>
            <h2 className="section-headline">Ready To Rise?</h2>
            <p className="section-subtext">
              Your expertise deserves more than random posting. Let's build a social presence that gets noticed, remembered and trusted.
            </p>
          </div>

          <div className="contact-cta-buttons" data-no-cover>
            <button className="btn btn-primary btn-large" onClick={handleBookCallClick}>
              Book Your Free Strategy Call
            </button>
            <a
              href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent("Hi Phonixe Media, I would like to speak with Rudra Joshi regarding my brand growth.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-large"
            >
              <MessageCircle size={18} style={{ color: 'var(--wa-green)' }} />
              <span>Talk To Phonixe Media</span>
            </a>
          </div>

          <div className="booking-form-card" data-no-cover>
            {formSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <CheckCircle2 size={54} color="var(--gold-text)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Strategy Consultation Requested!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Thank you, {formState.name}. We are preparing your WhatsApp consultation window right now.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setFormSuccess(false)}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form className="booking-form" onSubmit={handleSubmitLead}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="form-name">Full Name *</label>
                    <input
                      ref={nameInputRef}
                      id="form-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ayesha Sharma"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="form-whatsapp">WhatsApp Number *</label>
                    <input
                      id="form-whatsapp"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 98765 43210"
                      required
                      value={formState.whatsapp}
                      onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="form-niche">Coaching / Consulting Domain *</label>
                    <input
                      id="form-niche"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Tarot Reader / Numerologist / Coach"
                      required
                      value={formState.niche}
                      onChange={(e) => setFormState({ ...formState, niche: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="form-service">Service Interested In</label>
                    <select
                      id="form-service"
                      className="form-select"
                      value={formState.service}
                      onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                    >
                      {servicesData.services.map(s => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="form-instagram">Instagram Handle (Optional)</label>
                  <input
                    id="form-instagram"
                    type="text"
                    className="form-input"
                    placeholder="e.g. @yourname.coaching"
                    value={formState.instagram}
                    onChange={(e) => setFormState({ ...formState, instagram: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-message">Notes / Specific Goals (Optional)</label>
                  <textarea
                    id="form-message"
                    className="form-textarea"
                    rows={3}
                    placeholder="Tell us about your current followers, target revenue, or content obstacles..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary form-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Connecting...' : 'Request Free Strategy Call →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          12. FOOTER
          ==================================================================== */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h3>PHONIXE MEDIA</h3>
            <p className="footer-tagline">360° Social Media Growth & Personal Branding</p>
            <p className="footer-desc">
              Turning genuine expertise into authoritative digital brands that attract attention, build trust and convert high-ticket clients.
            </p>
          </div>

          <div className="footer-col">
            <h4>Navigation</h4>
            <div className="footer-links">
              <a href="#founder" onClick={(e) => { e.preventDefault(); scrollTo('#founder'); }}>Meet the Founder</a>
              <a href="#results" onClick={(e) => { e.preventDefault(); scrollTo('#results'); }}>Results</a>
              <a href="#services" onClick={(e) => { e.preventDefault(); scrollTo('#services'); }}>Services</a>
              <a href="#process" onClick={(e) => { e.preventDefault(); scrollTo('#process'); }}>4-Step Process</a>
              <a href="#why" onClick={(e) => { e.preventDefault(); scrollTo('#why'); }}>Why Phonixe</a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('#faq'); }}>FAQ</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Connect</h4>
            <div className="footer-links">
              <a href={igUrl} target="_blank" rel="noopener noreferrer">
                Instagram: {igHandle}
              </a>
              <a href={`https://wa.me/${cleanWaNumber}`} target="_blank" rel="noopener noreferrer">
                WhatsApp: {displayWaNumber}
              </a>
              <a href={`mailto:${agencyEmail}`}>
                Email: {agencyEmail}
              </a>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2026 Phonixe Media. All rights reserved.</p>
          <div className="footer-legal-links">
            <button onClick={() => setLegalModalContent(legalData.privacyPolicy)}>
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => setLegalModalContent(legalData.termsAndConditions)}>
              Terms & Conditions
            </button>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          13. MOBILE STICKY BOTTOM BAR (Past Hero, hides at #contact)
          ==================================================================== */}
      <div className={`mobile-sticky-bar ${(!isPastHero || isContactInView) ? 'hidden' : ''}`}>
        <button className="btn btn-primary mobile-sticky-call-btn" onClick={handleBookCallClick}>
          Book a Free Call
        </button>
        <a
          href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent("Hi Phonixe Media, I would like to book a strategy call.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-sticky-wa-btn"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={22} />
        </a>
      </div>

      {/* ====================================================================
          14. DESKTOP FLOATING WHATSAPP BUTTON (Desktop ONLY)
          ==================================================================== */}
      <a
        href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent("Hi Phonixe Media, I would like to speak with Rudra Joshi.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="desktop-floating-wa"
        aria-label="Direct WhatsApp Consultation"
      >
        <MessageCircle className="desktop-wa-icon" />
        <span>Chat With Phonixe Team</span>
      </a>

      {/* ====================================================================
          15. LEGAL MODAL (Privacy Policy / Terms)
          ==================================================================== */}
      {legalModalContent && (
        <div className="legal-modal-backdrop" onClick={() => setLegalModalContent(null)}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="legal-modal-close" onClick={() => setLegalModalContent(null)} aria-label="Close">
              <X size={18} />
            </button>
            <h3>{legalModalContent.title}</h3>
            <p className="legal-modal-updated">Last Updated: {legalModalContent.lastUpdated}</p>
            <div className="legal-modal-body">
              {legalModalContent.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
