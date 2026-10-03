import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BirdLayer from '../components/BirdLayer';
import { api } from '../services/api';
import { DEFAULT_LANDING_DATA } from '../data/defaultData';

gsap.registerPlugin(ScrollTrigger);

// Helper to cleanly parse and separate metric values and titles without text overlapping
const parseMetric = (str, fallbackTitle) => {
  if (!str) return { value: '-', label: fallbackTitle };
  const trimmed = String(str).trim();
  const match = trimmed.match(/^([+$€₹£]?[0-9]+(?:\.[0-9]+)?(?:[KkMmBxX%+]|\s*\+)?)\s*(.*)$/);
  if (match && match[1]) {
    const val = match[1].trim();
    const rest = match[2] ? match[2].trim() : '';
    return {
      value: val,
      label: rest || fallbackTitle
    };
  }
  return {
    value: trimmed,
    label: fallbackTitle
  };
};

export default function LandingPage({ navigateTo }) {
  const [data, setData] = useState(DEFAULT_LANDING_DATA);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('#');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const lenisRef = useRef(null);
  const progressBarRef = useRef(null);
  const chartPathRef = useRef(null);

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    whatsapp: '',
    instagram: '',
    niche: '',
    goal: 'Generate more high-paying 1-on-1 clients',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // 1. Lenis Smooth Scroll Setup synced with GSAP
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5
    });
    lenisRef.current = lenis;

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth scroll handler for anchor links
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetEl, { offset: -70 });
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 2. Thin Gold Scroll-Progress Line under Navbar
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const progressTrigger = ScrollTrigger.create({
      trigger: '.landing-page-root',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (progressBarRef.current) {
          gsap.set(progressBarRef.current, { scaleX: self.progress });
        }
      }
    });

    return () => progressTrigger.kill();
  }, []);

  // 3. Ambient Glow Parallax (±40px)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.to('.glow-top', {
        y: -40,
        scrollTrigger: {
          trigger: '.landing-page-root',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5
        }
      });
      gsap.to('.glow-middle', {
        y: 40,
        scrollTrigger: {
          trigger: '.landing-page-root',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2
        }
      });
      gsap.to('.glow-bottom', {
        y: -35,
        scrollTrigger: {
          trigger: '.landing-page-root',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5
        }
      });
    });

    return () => ctx.revert();
  }, []);

  // 4. Scroll Reveal Animations with IntersectionObserver & Auto-reveal fallback
  useEffect(() => {
    const rootEl = document.querySelector('.landing-page-root');
    if (rootEl) rootEl.classList.add('js-reveal-active');

    const revealEls = document.querySelectorAll('.reveal');
    
    // Immediate activation for elements in or near viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '120px 0px 120px 0px', threshold: 0.05 });

      revealEls.forEach(el => observer.observe(el));

      // Auto-reveal fallback: ensures all elements become active gracefully
      const timer = setTimeout(() => {
        revealEls.forEach(el => el.classList.add('active'));
        ScrollTrigger.refresh();
      }, 400);

      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    } else {
      revealEls.forEach(el => el.classList.add('active'));
    }
  }, [data]);

  // 5. Hero Chart Path Draw Animation
  useEffect(() => {
    if (chartPathRef.current) {
      setTimeout(() => {
        if (chartPathRef.current) {
          chartPathRef.current.style.strokeDashoffset = '0';
        }
      }, 500);
    }
  }, []);

  // Load Content from Backend API
  useEffect(() => {
    const loadContent = async () => {
      try {
        const bundle = await api.getLandingContent();
        setData(bundle);
      } catch (err) {
        console.warn('Could not connect to backend API, using fallback data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  // Sticky Navbar Scroll Listener
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle Form Submit
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Save lead to backend database
      await api.submitLead(formState);

      // 2. Format prefilled WhatsApp message
      const textMsg = 
`*New Strategy Call Request - Phonixe Media*
---------------------------------------
👤 *Name:* ${formState.name}
📱 *WhatsApp:* ${formState.whatsapp}
📸 *Instagram:* ${formState.instagram}
🔮 *Domain/Niche:* ${formState.niche}
🎯 *Primary Goal:* ${formState.goal}
📝 *Notes/Challenges:* ${formState.message || 'None provided'}
---------------------------------------
_Looking forward to discussing our 360° growth strategy!_`;

      const encoded = encodeURIComponent(textMsg);
      const targetPhone = (data?.content?.whatsappNumber || '+91 8799690069').replace(/[^0-9]/g, '');
      const url = `https://wa.me/${targetPhone}?text=${encoded}`;
      setWhatsappLink(url);
      setModalSuccess(true);

      // Auto redirect to WhatsApp after 800ms
      setTimeout(() => {
        window.open(url, '_blank');
      }, 800);
    } catch (err) {
      alert('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const c = data?.content || {};
  const cleanWa = (c.whatsappNumber || '+91 8799690069').replace(/[^0-9]/g, '');
  const contactEmail = c.email || 'phonixemedia@gmail.com';
  const igHandle = c.instagramHandle || '@phonixe.media';
  const igUrl = c.instagramUrl || 'https://www.instagram.com/phonixe.media/';
  const stats = data?.stats || [];
  const services = data?.services || [];
  const caseStudies = data?.caseStudies || [];
  const testimonials = data?.testimonials || [];
  const faqs = data?.faqs || [];

  return (
    <div className="landing-page-root">
      {/* Scroll Progress Line */}
      <div ref={progressBarRef} className="scroll-progress-line" aria-hidden="true" />

      {/* Cinematic Golden Phoenix Motion Layer */}
      <BirdLayer activeFaq={activeFaq} />

      {/* Ambient Radial Glows */}
      <div className="ambient-glow glow-top" aria-hidden="true"></div>
      <div className="ambient-glow glow-middle" aria-hidden="true"></div>
      <div className="ambient-glow glow-bottom" aria-hidden="true"></div>

      {/* Top Announcement Bar */}
      <div className="top-announcement">
        <div className="container announcement-content">
          <span className="announcement-pill">NOW ACCEPTING CLIENTS</span>
          <p>Transforming Personal Brands for Spiritual, Life & Relationship Coaches with 360° Organic Growth</p>
          <a href="#modal" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="announcement-link">
            Apply For Next Cohort &rarr;
          </a>
        </div>
      </div>

      {/* Navigation Header */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#" className="brand-logo" onClick={(e) => handleNavClick(e, '#hero')} aria-label="Phonixe Media Home">
            <img src="/assets/logo-horizontal.png" alt="Phonixe Media" className="nav-brand-logo" />
          </a>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Services</a></li>
              <li><a href="#niches" onClick={(e) => handleNavClick(e, '#niches')}>Who We Serve</a></li>
              <li><a href="#process" onClick={(e) => handleNavClick(e, '#process')}>Our System</a></li>
              <li><a href="#results" onClick={(e) => handleNavClick(e, '#results')}>Case Studies</a></li>
              <li><a href="#why-us" onClick={(e) => handleNavClick(e, '#why-us')}>Why Phonixe</a></li>
              <li><a href="#faq" onClick={(e) => handleNavClick(e, '#faq')}>FAQ</a></li>
            </ul>
          </nav>

          {/* Nav Actions */}
          <div className="nav-actions">
            <a 
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(c.whatsappPrefillText || "Hi Phonixe Media, I'm interested in scaling my coaching brand.")}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp-header"
              data-bird-hover
            >
              <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
              </svg>
              <span>WhatsApp</span>
            </a>
            <button className="btn btn-gold btn-nav" onClick={() => setIsModalOpen(true)}>
              <span>{c.primaryCtaText || 'Book Strategy Call'}</span>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-links">
            <li><a href="#services" className="mobile-link" onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, '#services'); }}>Services</a></li>
            <li><a href="#niches" className="mobile-link" onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, '#niches'); }}>Who We Serve</a></li>
            <li><a href="#process" className="mobile-link" onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, '#process'); }}>Our System</a></li>
            <li><a href="#results" className="mobile-link" onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, '#results'); }}>Case Studies</a></li>
            <li><a href="#why-us" className="mobile-link" onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, '#why-us'); }}>Why Phonixe</a></li>
            <li><a href="#faq" className="mobile-link" onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, '#faq'); }}>FAQ</a></li>
          </ul>
          <div className="mobile-drawer-cta">
            <button className="btn btn-gold w-full" onClick={() => { setMobileMenuOpen(false); setIsModalOpen(true); }}>
              Book Strategy Call
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section" id="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge-gold">
              <span className="badge-pulse"></span>
              <span>{c.tagline || '360° Social Growth & Personal Branding'}</span>
            </div>

            <h1 className="hero-headline">
              {c.heroHeadlinePrefix || 'Turn Your Expertise Into A Brand'}{' '}
              <span className="gradient-gold-text editorial-italic">{c.heroHeadlineHighlight || 'People Remember.'}</span>
            </h1>

            <p className="hero-subheadline">
              {c.heroSubheadline || 'We help coaches, consultants and personal brands build a powerful social presence that attracts attention, builds trust and generates qualified leads.'}
            </p>

            {/* Targeted Coach Niches */}
            <div className="hero-niche-chips">
              <span className="chip">Numerologists</span>
              <span className="chip">Tarot Readers</span>
              <span className="chip">Vastu Experts</span>
              <span className="chip">Spiritual Healers</span>
              <span className="chip">Relationship Mentors</span>
            </div>

            <div className="hero-cta-group">
              <button className="btn btn-gold btn-large shadow-gold-glow" onClick={() => setIsModalOpen(true)}>
                <span>{c.primaryCtaText || 'Book a Free Strategy Call'}</span>
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <a href="#process" onClick={(e) => handleNavClick(e, '#process')} className="btn btn-outline-glass btn-large">
                <span>{c.secondaryCtaText || 'See How We Work'}</span>
              </a>
            </div>

            <div className="hero-trust-bar">
              <span className="trust-icon" data-bird-hover>✦</span>
              <span>{c.trustLine || 'Strategy • Content • Personal Branding • Growth'}</span>
            </div>

            <div className="hero-micro-proof">
              <div className="avatar-group">
                <span className="avatar-circle" data-bird-hover>🔮</span>
                <span className="avatar-circle" data-bird-hover>🔢</span>
                <span className="avatar-circle" data-bird-hover>🏛️</span>
                <span className="avatar-circle" data-bird-hover>✨</span>
              </div>
              <div className="micro-proof-text">
                <strong>100% Organic Growth</strong> tailored to convert followers into high-ticket clients
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="growth-dashboard-mockup glass-card">
              <div className="mockup-header">
                <div className="user-profile-badge">
                  <div className="profile-pic-container" data-bird-hover>
                    <img src="/assets/phoenix-badge.png" alt="Phonixe Logo Badge" className="mini-gold-phoenix" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Elite Coach Brand</span>
                      <span className="verified-badge">✓</span>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Managed by Phonixe Media</span>
                  </div>
                </div>
                <div className="live-growth-pill">
                  <span className="pulse-green"></span>
                  <span>+384% This Month</span>
                </div>
              </div>

              <div className="mockup-stats-grid">
                <div className="mockup-stat-box">
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Organic Accounts Reached</span>
                  <div className="stat-box-val">284,920</div>
                  <span className="stat-box-trend positive">↑ 412.8% vs last month</span>
                </div>
                <div className="mockup-stat-box">
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Discovery Call DMs</span>
                  <div className="stat-box-val">68 Leads</div>
                  <span className="stat-box-trend positive">↑ High-Intent Inquiries</span>
                </div>
              </div>

              <div className="mockup-chart-container">
                <svg className="growth-chart-svg" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#E5A93C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,105 Q60,95 100,80 T200,60 T300,35 T400,10 L400,120 L0,120 Z" fill="url(#chartGrad)" />
                  <path 
                    ref={chartPathRef}
                    d="M0,105 Q60,95 100,80 T200,60 T300,35 T400,10" 
                    fill="none" 
                    stroke="#FFD700" 
                    strokeWidth="3.5" 
                    style={{ strokeDasharray: 450, strokeDashoffset: 450, transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                  <circle cx="100" cy="80" r="4" fill="#FFD700" />
                  <circle cx="200" cy="60" r="4" fill="#FFD700" />
                  <circle cx="300" cy="35" r="4" fill="#FFD700" />
                  <circle cx="400" cy="10" r="5" fill="#FFF" stroke="#E5A93C" strokeWidth="2" />
                </svg>
              </div>

              <div className="mockup-reel-floating">
                <div className="reel-thumbnail">▶</div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--gold-light)' }}>Viral Coach Script</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>"3 Vastu Shifts To Attract Wealth"</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>👁️ 142.4K Views • 💬 389 Inquiries</div>
                </div>
              </div>

              <div className="floating-conversion-badge">
                <div className="badge-icon-check">✓</div>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', display: 'block' }}>New High-Ticket Discovery Call</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Tarot Mentorship • Booked via Bio Link</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF & STATS SECTION */}
      <section className="stats-section" id="social-proof">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">MEASURABLE IMPACT</span>
            <h2 className="section-title">Your Content Should Do More Than Get Views.</h2>
            <p className="section-lead">It should build unshakeable credibility, establish market authority, and convert attention into qualified discovery calls.</p>
          </div>

          <div className="stats-grid">
            {stats.map((st, idx) => (
              <div className="stat-card glass-card reveal" key={st._id || idx}>
                <div className="stat-icon-wrapper" data-bird-hover>✦</div>
                <div className="stat-number-row">
                  <span>{st.number}</span>
                  <span className="stat-suffix">{st.suffix}</span>
                </div>
                <h3 className="stat-label">{st.label}</h3>
                <p className="stat-desc">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIZED COACHES SPOTLIGHT */}
      <section className="niches-section" id="niches">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">DESIGNED FOR TRANSFORMATIONAL LEADERS</span>
            <h2 className="section-title">We Understand The Nuances Of Your Expertise.</h2>
            <p className="section-lead">Selling spiritual insights, energy healing, mindset shifts, or life counsel requires deep emotional resonance, ethical authority, and authentic storytelling.</p>
          </div>

          <div className="niche-cards-grid">
            <div className="niche-card glass-card reveal">
              <div className="niche-card-icon" data-bird-hover>🔮</div>
              <h3>Tarot Readers & Intuitives</h3>
              <p>Convert general curiosity into deeply engaged 1-on-1 private reading clients through high-trust card explanation reels, predictive insights, and ethical boundaries.</p>
              <div className="niche-focus-tags">
                <span>Reading DMs</span>
                <span>Intuitive Hooks</span>
                <span>Live Streams</span>
              </div>
            </div>

            <div className="niche-card glass-card reveal">
              <div className="niche-card-icon" data-bird-hover>🔢</div>
              <h3>Numerologists & Astro Mentors</h3>
              <p>Break down complex birth date matrixes, destiny numbers, and master numbers into digestible visual carousels and relatable reels that evoke instant realization.</p>
              <div className="niche-focus-tags">
                <span>Destiny Numbers</span>
                <span>Name Correction</span>
                <span>Case Carousels</span>
              </div>
            </div>

            <div className="niche-card glass-card reveal">
              <div className="niche-card-icon" data-bird-hover>🏛️</div>
              <h3>Vastu & Energy Experts</h3>
              <p>Showcase real property transformations, architectural energy remedies, and actionable lifestyle adjustments that position you as the definitive high-ticket consultant.</p>
              <div className="niche-focus-tags">
                <span>Site Inspections</span>
                <span>Commercial Vastu</span>
                <span>High-Ticket Consults</span>
              </div>
            </div>

            <div className="niche-card glass-card reveal">
              <div className="niche-card-icon" data-bird-hover>💫</div>
              <h3>Akashic Record Readers & Healers</h3>
              <p>Demystify soul history, karmic blockages, and ancestral trauma with profound storytelling frameworks that make prospective seekers feel seen, understood, and guided.</p>
              <div className="niche-focus-tags">
                <span>Soul Contracts</span>
                <span>Karmic Healing</span>
                <span>High-Value Discovery</span>
              </div>
            </div>

            <div className="niche-card glass-card reveal">
              <div className="niche-card-icon" data-bird-hover>🤝</div>
              <h3>Relationship & Marriage Mentors</h3>
              <p>Address painful communication breakdowns, attachment triggers, and partnership healing with empathetic video scripts that build immediate emotional safety.</p>
              <div className="niche-focus-tags">
                <span>Emotional Resonance</span>
                <span>Couples Healing</span>
                <span>Private Retainers</span>
              </div>
            </div>

            <div className="niche-card glass-card reveal">
              <div className="niche-card-icon" data-bird-hover>🌿</div>
              <h3>Spiritual, Life & Wellness Mentors</h3>
              <p>Establish sovereign personal authority, articulate your signature methodology, and attract dream coaching clients who value spiritual depth over superficial hacks.</p>
              <div className="niche-focus-tags">
                <span>Signature Program</span>
                <span>Mindset Elevation</span>
                <span>Organic Retainers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="problem-section" id="problem">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">THE HARSH REALITY</span>
            <h2 className="section-title">{c.problemHeadline || 'Posting Consistently Isn’t Enough.'}</h2>
            <p className="section-lead">Why most coaches struggle to get clients despite posting everyday:</p>
          </div>

          <div className="problems-grid">
            <div className="problem-card glass-card reveal">
              <div className="problem-icon" data-bird-hover>❌</div>
              <h3>Random Content Without A Strategy</h3>
              <p>Waking up wondering "what should I record today?" resulting in disjointed topics that confuse the algorithm and leave your audience unclear about what you actually offer.</p>
            </div>
            <div className="problem-card glass-card reveal">
              <div className="problem-icon" data-bird-hover>❌</div>
              <h3>Low Engagement Despite Daily Effort</h3>
              <p>Spending 3 hours filming and editing a video only to see 150 views and 10 likes from close friends. It feels disheartening and completely unsustainable.</p>
            </div>
            <div className="problem-card glass-card reveal">
              <div className="problem-icon" data-bird-hover>❌</div>
              <h3>No Clear Personal Brand Positioning</h3>
              <p>Blending in with thousands of other coaches. Without sharp visual identity, signature frameworks, and distinct voice, visitors scroll right past your profile.</p>
            </div>
            <div className="problem-card glass-card reveal">
              <div className="problem-icon" data-bird-hover>❌</div>
              <h3>Views That Never Turn Into Inquiries</h3>
              <p>A reel hits 50,000 views, yet your calendar has zero consultations booked. Vanity attention without an intentional conversion bridge does not pay your bills.</p>
            </div>
            <div className="problem-card glass-card reveal">
              <div className="problem-icon" data-bird-hover>❌</div>
              <h3>Creative Burnout & Lack Of Consistency</h3>
              <p>Juggling client consultations, life, and content production alone leads to constant stop-and-start cycles that reset your social media momentum every month.</p>
            </div>
            <div className="problem-card glass-card reveal">
              <div className="problem-icon" data-bird-hover>❌</div>
              <h3>No Predictable Content & Shooting System</h3>
              <p>Uncertainty around lighting, camera confidence, vocal inflection, scripting hooks, and video aesthetics keeps you feeling amateur instead of industry-leading.</p>
            </div>
          </div>

          <div className="problem-transition-banner glass-card reveal">
            <img src="/assets/logo-horizontal.png" alt="Phonixe Media" className="transition-logo" />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.45rem', marginBottom: '14px', lineHeight: 1.35, color: 'var(--gold-bright)' }}>
                {c.problemTransitionText || 'That’s where Phonixe Media comes in.'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#DDE2EB', lineHeight: 1.65, margin: 0 }}>
                We eliminate the guesswork. We handle the strategic positioning, scripting, shooting direction, cinematic editing, and conversion systems so you can focus 100% on serving your clients.
              </p>
            </div>
            <button className="btn btn-gold" onClick={() => setIsModalOpen(true)}>
              Fix My Social Strategy
            </button>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services-section" id="services">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">OUR FULL-SPECTRUM SUITE</span>
            <h2 className="section-title">{c.servicesHeadline || 'Everything You Need To Build A Strong Social Brand.'}</h2>
            <p className="section-lead">A comprehensive 360° growth engine designed specifically for coaches and personal brands who demand tangible business outcomes.</p>
          </div>

          <div className="services-grid">
            {services.map((srv, idx) => (
              <div className="service-card glass-card reveal" key={srv._id || idx}>
                <div className="service-badge">{srv.badge}</div>
                <div className="service-icon-box" data-bird-hover>✦</div>
                <h3 className="service-title">{srv.title}</h3>
                <p className="service-desc">{srv.desc}</p>
                <ul className="service-features">
                  {srv.features?.map((f, fi) => (
                    <li key={fi}>{f}</li>
                  ))}
                </ul>
                <div className="service-footer">
                  <button className="btn-text-gold" onClick={() => setIsModalOpen(true)}>
                    Inquire For This &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '50px' }}>
            <button className="btn btn-gold btn-large" onClick={() => setIsModalOpen(true)}>
              Request A Custom Growth Package &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 4-STEP PROCESS SECTION */}
      <section className="process-section" id="process">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">THE BLUEPRINT</span>
            <h2 className="section-title">{c.processHeadline || 'Our Simple 4-Step Growth System'}</h2>
            <p className="section-lead">A seamless, stress-free methodology that takes you from random posting to an automated client attraction machine.</p>
          </div>

          <div className="process-timeline">
            <div className="process-step glass-card reveal">
              <div className="step-number-badge" data-bird-hover>01</div>
              <span className="step-tag">Phase 1 • Assessment</span>
              <h3>Discover</h3>
              <p className="step-desc">
                Understand your business, audience, offer and current social media presence. We uncover what makes your voice uniquely powerful.
              </p>
              <div className="step-deliverables">
                <span>✓ Comprehensive Brand Audit</span>
                <span>✓ Audience Persona Mapping</span>
                <span>✓ Offer Positioning Check</span>
              </div>
            </div>

            <div className="process-step glass-card reveal">
              <div className="step-number-badge" data-bird-hover>02</div>
              <span className="step-tag">Phase 2 • Architecture</span>
              <h3>Strategize</h3>
              <p className="step-desc">
                Build your positioning, content pillars, hooks, formats and growth strategy.
              </p>
              <div className="step-deliverables">
                <span>✓ 30-Day Content Roadmap</span>
                <span>✓ High-Converting Hook Bank</span>
                <span>✓ DM Funnel & CTA Triggers</span>
              </div>
            </div>

            <div className="process-step glass-card reveal">
              <div className="step-number-badge" data-bird-hover>03</div>
              <span className="step-tag">Phase 3 • Execution</span>
              <h3>Create</h3>
              <p className="step-desc">
                Develop high-quality content including reels, carousels, stories and creatives + shooting assistance.
              </p>
              <div className="step-deliverables">
                <span>✓ Effortless 2-Hour Batch Filming</span>
                <span>✓ Cinematic Editing & Audio</span>
                <span>✓ Branded Visual Graphics</span>
              </div>
            </div>

            <div className="process-step glass-card reveal">
              <div className="step-number-badge" data-bird-hover>04</div>
              <span className="step-tag">Phase 4 • Scale</span>
              <h3>Optimize</h3>
              <p className="step-desc">
                Analyze performance, identify what works and continuously improve the strategy.
              </p>
              <div className="step-deliverables">
                <span>✓ Monthly Strategic Growth Review</span>
                <span>✓ Lead Conversion Tracking</span>
                <span>✓ Continuous Creative Evolution</span>
              </div>
            </div>
          </div>

          <div className="process-guarantee-box glass-card text-center reveal">
            <div className="guarantee-icon" data-bird-hover>⚡</div>
            <h4>Spend Just 2–3 Hours Per Month Recording. We Handle The Rest.</h4>
            <p>No more staring at video editing timelines or wrestling with captions at midnight.</p>
            <button className="btn btn-gold" onClick={() => setIsModalOpen(true)}>
              Start Your 4-Step System
            </button>
          </div>
        </div>
      </section>

      {/* CASE STUDIES SECTION */}
      <section className="results-section" id="results">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">PROVEN RESULTS</span>
            <h2 className="section-title">{c.resultsHeadline || 'Strategy. Content. Consistency. Growth.'}</h2>
            <p className="section-lead">Here is how our strategic system transforms coaching businesses:</p>
          </div>

          <div className="case-studies-grid">
            {caseStudies.map((cs, idx) => (
              <div className="case-card glass-card reveal" key={cs._id || idx}>
                <div className="case-top-bar">
                  <span className="case-niche-tag">{cs.niche}</span>
                </div>
                <h3 className="case-client-name">{cs.clientName}</h3>
                <div className="case-comparison-grid">
                  <div className="case-box">
                    <span className="box-tag">Starting Point</span>
                    <p>{cs.startingPoint}</p>
                  </div>
                  <div className="case-box">
                    <span className="box-tag gold">Phonixe Strategy</span>
                    <p>{cs.strategy}</p>
                  </div>
                </div>

                {(() => {
                  const mReach = parseMetric(cs.reach, 'Monthly Reach');
                  const mLeads = parseMetric(cs.leads, 'Qualified Leads');
                  const mGrowth = parseMetric(cs.growth, 'Growth Factor');
                  return (
                    <div className="case-metrics-row">
                      <div className="metric-item">
                        <span className="metric-number">{mReach.value}</span>
                        <span className="metric-title">{mReach.label}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-number">{mLeads.value}</span>
                        <span className="metric-title">{mLeads.label}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-number">{mGrowth.value}</span>
                        <span className="metric-title">{mGrowth.label}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="case-bottom-cta">
                  <button className="btn-text-gold" onClick={() => setIsModalOpen(true)}>
                    Apply Similar Strategy &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">CLIENT EXPERIENCES</span>
            <h2 className="section-title">{c.testimonialsHeadline || 'What Our Clients Say'}</h2>
            <p className="section-lead">Real words from real experts. We never generate fabricated reviews.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div className="testimonial-card glass-card reveal" key={t._id || idx}>
                <div className="stars-row">{'★'.repeat(t.stars || 5)}</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="placeholder-avatar" data-bird-hover>{t.avatarEmoji || '✨'}</div>
                  <div className="author-info">
                    <span className="author-name">{t.authorName}</span>
                    <span className="author-niche">{t.niche}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY PHONIXE MEDIA */}
      <section className="why-us-section" id="why-us">
        <div className="container">
          <div className="why-us-layout">
            <div className="why-us-intro reveal">
              <span className="section-subtitle">THE PHONIXE DIFFERENCE</span>
              <h2 className="section-title">{c.whyUsHeadline || 'Not Just Another Social Media Agency.'}</h2>
              <p className="section-lead">
                Most agencies give you cookie-cutter templates, random dance trends, and vanity metrics that don't convert into paid consultations. We build an enduring personal brand ecosystem.
              </p>

              <div className="why-brand-highlight glass-card">
                <img src="/assets/phoenix-badge.png" alt="Phonixe Logo Badge" className="why-logo-img" data-bird-hover />
                <div className="why-brand-quote">
                  <strong>Born From Rising High:</strong> Like the mythical Phoenix, we take your hidden expertise and elevate it into a radiant authority that commands attention and converts into revenue.
                </div>
              </div>

              <button className="btn btn-gold btn-large" onClick={() => setIsModalOpen(true)}>
                Experience The Difference &rarr;
              </button>
            </div>

            <div className="why-us-points reveal">
              <div className="why-point-item glass-card">
                <div className="why-point-icon" data-bird-hover>01</div>
                <div>
                  <h4>Strategy Before Posting</h4>
                  <p>We never post blindly. Every single piece of content has a precise purpose: to attract, educate, build deep trust, or prompt a discovery call.</p>
                </div>
              </div>
              <div className="why-point-item glass-card">
                <div className="why-point-icon" data-bird-hover>02</div>
                <div>
                  <h4>Content Built Around Business Goals</h4>
                  <p>We don't chase useless viral trends. We target decision-makers and seekers who have the desire and budget to invest in your coaching.</p>
                </div>
              </div>
              <div className="why-point-item glass-card">
                <div className="why-point-icon" data-bird-hover>03</div>
                <div>
                  <h4>Strong Focus On Authentic Personal Branding</h4>
                  <p>We extract your natural charisma, personal story, and unique worldview so that you build loyal clients, not just passive viewers.</p>
                </div>
              </div>
              <div className="why-point-item glass-card">
                <div className="why-point-icon" data-bird-hover>04</div>
                <div>
                  <h4>Consistent & Proactive Communication</h4>
                  <p>No disappearing contacts. You get direct WhatsApp access, dedicated account managers, and scheduled weekly updates.</p>
                </div>
              </div>
              <div className="why-point-item glass-card">
                <div className="why-point-icon" data-bird-hover>05</div>
                <div>
                  <h4>Data-Driven Optimization</h4>
                  <p>We review retention graphs, hook drop-off rates, and lead metrics weekly, constantly calibrating the strategy to maximize your ROI.</p>
                </div>
              </div>
              <div className="why-point-item glass-card">
                <div className="why-point-icon" data-bird-hover>06</div>
                <div>
                  <h4>Customized Content Systems for Coaches</h4>
                  <p>From Vastu remedies to Tarot spreads and spiritual awakenings, we understand your niche deeply and write scripts that sound authentic to your craft.</p>
                </div>
              </div>
              <div className="why-point-item glass-card">
                <div className="why-point-icon" data-bird-hover>07</div>
                <div>
                  <h4>Focus On Both Attention AND Conversion</h4>
                  <p>Attention gets them in the door; our conversion architecture and DM frameworks turn that attention into confirmed clients in your calendar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-subtitle">CLEAR ANSWERS</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-lead">Everything you need to know about working with Phonixe Media and scaling your personal brand.</p>
          </div>

          <div className="faq-accordion-container reveal">
            {faqs.map((f, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div className={`faq-item glass-card ${isOpen ? 'active' : ''}`} key={f._id || idx}>
                  <button className="faq-question" onClick={() => setActiveFaq(isOpen ? null : idx)}>
                    <span>{idx + 1}. {f.question}</span>
                    <span className="faq-toggle-icon" data-bird-hover>+</span>
                  </button>
                  <div className="faq-answer">
                    <p>{f.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="final-cta-section" id="cta">
        <div className="container">
          <div className="cta-banner-wrapper glass-card reveal text-center">
            <img src="/assets/logo-horizontal.png" alt="Phonixe Media Brand Logo" className="cta-center-logo" />
            <div className="cta-heading-container">
              <h2 className="cta-main-headline">
                {c.ctaHeadline || 'Your Brand Has Expertise. Now Give It The Visibility It Deserves.'}
              </h2>
              <p className="cta-subheadline">
                {c.ctaSubheadline || 'Let’s build a social media presence that makes your audience stop, trust and take action.'}
              </p>
            </div>

            <div className="cta-buttons-row">
              <button className="btn btn-gold btn-xl shadow-gold-glow" onClick={() => setIsModalOpen(true)}>
                <span>Book Your Free Strategy Call</span>
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <a 
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(c.whatsappPrefillText || "Hi Phonixe Media, I want to talk about growing my brand.")}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-whatsapp-large"
                data-bird-hover
              >
                <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
                <span>Talk To Phonixe Media</span>
              </a>
            </div>

            <div className="cta-micro-features">
              <span>✦ Free 30-Min Strategy Audit</span>
              <span>✦ Zero-Pressure Consultation</span>
              <span>✦ Customized Growth Roadmap</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-container">
          <div className="footer-brand-col">
            <a href="#" onClick={(e) => handleNavClick(e, '#hero')} className="brand-logo" style={{ marginBottom: '18px' }} aria-label="Phonixe Media Home">
              <img src="/assets/logo-horizontal.png" alt="Phonixe Media" className="footer-brand-logo" />
            </a>
            <p className="footer-tagline">“{c.tagline || '360° Social Media Growth & Personal Branding'}”</p>
            <p className="footer-bio">
              Empowering coaches, consultants, tarot readers, numerologists, and transformational mentors to turn their gifts into thriving, high-converting social media brands.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-menu">
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Services</a></li>
              <li><a href="#niches" onClick={(e) => handleNavClick(e, '#niches')}>Coaching Niches</a></li>
              <li><a href="#process" onClick={(e) => handleNavClick(e, '#process')}>Our 4-Step System</a></li>
              <li><a href="#results" onClick={(e) => handleNavClick(e, '#results')}>Case Studies</a></li>
              <li><a href="#why-us" onClick={(e) => handleNavClick(e, '#why-us')}>Why Phonixe</a></li>
              <li><a href="#faq" onClick={(e) => handleNavClick(e, '#faq')}>FAQ</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-menu">
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Organic Social Marketing</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Shooting & Direction</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Short-Form Reels</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Content Strategy</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Personal Branding</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Lead Generation Funnels</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Connect With Us</h4>
            <ul className="footer-contact-list">
              <li>
                <a href={igUrl} target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                  <span>📸</span>
                  <span>Instagram: {igHandle}</span>
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${cleanWa}?text=Hi%20Phonixe%20Media`} target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                  <svg viewBox="0 0 16 16" width="18" height="18" fill="#25D366" style={{ flexShrink: 0 }}>
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                  <span>WhatsApp: {c.whatsappNumber || '+91 8799690069'}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contactEmail}`} className="footer-contact-item">
                  <span>✉️</span>
                  <span>{contactEmail}</span>
                </a>
              </li>
            </ul>
            <div style={{ marginTop: '24px' }}>
              <button className="btn btn-gold btn-small" onClick={() => setIsModalOpen(true)}>
                Book Strategy Call
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="container footer-bottom-container">
            <p className="copyright-text">
              &copy; {new Date().getFullYear()} {c.agencyName || 'Phonixe Media'}. All rights reserved.
            </p>
            <div className="legal-links">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: All client information and lead data is strictly confidential.'); }}>Privacy Policy</a>
              <span>•</span>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms: Services provided according to mutual agreement.'); }}>Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON (DESKTOP) */}
      <aside className="floating-whatsapp-container">
        <div className="whatsapp-tooltip">Chat with Phonixe Team</div>
        <a 
          href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(c.whatsappPrefillText || "Hi Phonixe Media, I'd like to scale my coaching brand.")}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="floating-whatsapp-btn"
          data-bird-hover
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 16 16" width="30" height="30" fill="#FFF">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
        </a>
      </aside>

      {/* MOBILE STICKY BAR */}
      <div className="mobile-sticky-bar">
        <a 
          href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(c.whatsappPrefillText || "Hi Phonixe Media, I'd like to inquire.")}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="mobile-bar-btn btn-wa-mobile"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          <span>WhatsApp</span>
        </a>
        <button className="mobile-bar-btn btn-call-mobile" onClick={() => setIsModalOpen(true)}>
          Book Strategy Call &rarr;
        </button>
      </div>

      {/* STRATEGY CALL BOOKING MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            
            {!modalSuccess ? (
              <>
                <div className="modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <img src="/assets/logo-horizontal.png" alt="Phonixe Logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
                    <span className="badge-gold" style={{ margin: 0, fontSize: '0.72rem' }}>Limited Strategy Slots</span>
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px' }}>Book Your Free Strategy Audit</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Tell us about your brand. We will review your presence and outline a tailored roadmap to attract qualified leads.
                  </p>
                </div>

                <form onSubmit={handleSubmitLead} className="modal-form">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Priya Sharma"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>WhatsApp Number *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="+91 98765 43210"
                        value={formState.whatsapp}
                        onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Instagram Handle *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="@yourhandle"
                        value={formState.instagram}
                        onChange={(e) => setFormState({ ...formState, instagram: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Your Coaching / Consulting Domain *</label>
                    <select 
                      required
                      value={formState.niche}
                      onChange={(e) => setFormState({ ...formState, niche: e.target.value })}
                    >
                      <option value="" disabled>Select your specialization</option>
                      <option value="Tarot Reader & Intuitive">Tarot Reader & Intuitive</option>
                      <option value="Numerologist & Astro Consultant">Numerologist & Astro Consultant</option>
                      <option value="Vastu & Energy Architect">Vastu & Energy Architect</option>
                      <option value="Relationship & Marriage Coach">Relationship & Marriage Coach</option>
                      <option value="Spiritual & Healing Mentor">Spiritual & Healing Mentor</option>
                      <option value="Akashic Record Reader">Akashic Record Reader</option>
                      <option value="Life & Mindset Coach">Life & Mindset Coach</option>
                      <option value="Fitness & Wellness Expert">Fitness & Wellness Expert</option>
                      <option value="Other Service-Based Brand">Other Service-Based Brand</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>What is your primary goal right now?</label>
                    <select 
                      value={formState.goal}
                      onChange={(e) => setFormState({ ...formState, goal: e.target.value })}
                    >
                      <option value="Generate more high-paying 1-on-1 clients">Generate more high-paying 1-on-1 clients</option>
                      <option value="Build an authoritative, high-growth personal brand">Build an authoritative, high-growth personal brand</option>
                      <option value="Delegate content creation & video editing completely">Delegate content creation & video editing completely</option>
                      <option value="Fix low engagement and random posting">Fix low engagement and random posting</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Any specific questions or current challenges? (Optional)</label>
                    <textarea 
                      rows={2} 
                      placeholder="Tell us what you'd like to achieve..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-gold w-full btn-large" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit & Connect On WhatsApp →'}
                  </button>
                  <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    🔒 100% Confidential. Saved to secure CRM. No spam.
                  </p>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#25D366', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', fontWeight: 800 }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '10px' }}>Application Received!</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Thank you! Your request has been securely recorded. Click below to continue directly on WhatsApp.
                </p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp-large">
                  <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                  <span>Open WhatsApp Now</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
