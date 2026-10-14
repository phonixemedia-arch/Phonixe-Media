import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PhoenixArtwork from './PhoenixArtwork';
import PhoenixParticles from './PhoenixParticles';
import { phoenixConfig } from './phoenixConfig';

gsap.registerPlugin(ScrollTrigger);

/**
 * PhoenixGuide
 * 
 * The cinematic visual storyteller of Phonixe Media.
 * Exactly ONE instance exists on the page.
 * 
 * States: INTRO -> HERO -> GLIDING -> PERCHED -> TAKEOFF
 */
export default function PhoenixGuide({ onIntroComplete }) {
  const containerRef = useRef(null);
  const birdRef = useRef(null);
  const introOverlayRef = useRef(null);

  // Interaction & Motion States
  const [currentState, setCurrentState] = useState('INTRO');
  const [wingAngle, setWingAngle] = useState(0);
  const [wingFolded, setWingFolded] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [perfLow, setPerfLow] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);

  // Refs for animation loop & quickTo
  const quickX = useRef(null);
  const quickY = useRef(null);
  const quickRot = useRef(null);
  const quickScale = useRef(null);
  const quickOpacity = useRef(null);
  const idleTimerRef = useRef(null);
  const lastScrollY = useRef(0);
  const perchedElementRef = useRef(null);
  const fpsHistoryRef = useRef([]);

  // Check reduced motion & mobile
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 1. INTRO SEQUENCE (First visit per session, skippable)
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenIntro = sessionStorage.getItem('phonixe_intro_seen');

    if (isReduced || hasSeenIntro) {
      setIntroDismissed(true);
      setCurrentState('HERO');
      if (onIntroComplete) onIntroComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('phonixe_intro_seen', 'true');
        setIntroDismissed(true);
        setCurrentState('HERO');
        if (onIntroComplete) onIntroComplete();
      }
    });

    const overlay = introOverlayRef.current;
    const bird = birdRef.current;
    if (!overlay || !bird) return;

    // Initial positioning in center screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    gsap.set(bird, {
      x: cx - 80,
      y: cy - 70,
      scale: 0.65,
      opacity: 0,
      rotation: 0
    });

    tl.to(bird, {
      opacity: 1,
      scale: 1,
      duration: 1.0,
      ease: 'power2.out'
    })
    .to('.intro-brand-title', {
      opacity: 1,
      letterSpacing: '0.22em',
      duration: 0.85,
      ease: 'power3.out'
    }, '-=0.5')
    .to(bird, {
      y: cy - 130,
      duration: 0.8,
      ease: 'power2.inOut',
      onStart: () => setWingAngle(22)
    })
    .to(overlay, {
      opacity: 0,
      duration: 0.65,
      ease: 'power2.out',
      pointerEvents: 'none'
    });

    return () => {
      tl.kill();
    };
  }, [onIntroComplete]);

  // Skip Intro Handler (Tap/Click)
  const handleSkipIntro = useCallback(() => {
    if (introDismissed) return;
    sessionStorage.setItem('phonixe_intro_seen', 'true');
    setIntroDismissed(true);
    setCurrentState('HERO');
    gsap.to(introOverlayRef.current, { opacity: 0, duration: 0.35, pointerEvents: 'none' });
    if (onIntroComplete) onIntroComplete();
  }, [introDismissed, onIntroComplete]);

  // 2. SETUP GSAP QUICKTO ACCESSORS FOR SMOOTH 60FPS TRANSFORMS
  useEffect(() => {
    if (!birdRef.current) return;
    quickX.current = gsap.quickTo(birdRef.current, 'x', { duration: 0.8, ease: 'power2.out' });
    quickY.current = gsap.quickTo(birdRef.current, 'y', { duration: 0.8, ease: 'power2.out' });
    quickRot.current = gsap.quickTo(birdRef.current, 'rotation', { duration: 0.6, ease: 'power2.out' });
    quickScale.current = gsap.quickTo(birdRef.current, 'scale', { duration: 0.7, ease: 'power2.out' });
    quickOpacity.current = gsap.quickTo(birdRef.current, 'opacity', { duration: 0.5, ease: 'power2.out' });
  }, []);

  // 3. SCROLL-SYNCED GLIDE & PERCHING ENGINE
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      if (birdRef.current) gsap.set(birdRef.current, { opacity: 0 });
      return;
    }

    let isUserScrolling = false;
    let scrollTimeout = null;

    // Helper: Compute Target Coordinates based on current scroll progress
    const updateGlidePosition = () => {
      if (currentState === 'PERCHED') return;

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scrollY = window.scrollY;

      // Calculate scroll progress through sections
      const sections = [
        { id: 'hero', side: 'right' },
        { id: 'founder', side: 'portrait' },
        { id: 'results', side: 'left' },
        { id: 'who-we-serve', side: 'center' },
        { id: 'services', side: 'right' },
        { id: 'process', side: 'step' },
        { id: 'why', side: 'left' },
        { id: 'work', side: 'right' },
        { id: 'testimonials', side: 'center' },
        { id: 'faq', side: 'right' },
        { id: 'contact', side: 'center' }
      ];

      // Find active section
      let activeIdx = 0;
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= vh * 0.45 && rect.bottom >= vh * 0.15) {
            activeIdx = i;
            break;
          }
        }
      }

      const activeSec = sections[activeIdx];
      let targetX = vw * 0.8;
      let targetY = vh * 0.35;
      let targetScale = isMobile ? 0.7 : 0.95;
      let targetRot = 0;
      let targetOpacity = isMobile ? 0.75 : 0.95;

      if (isMobile) {
        // Mobile docked toward right edge, vertical-only glide
        targetX = vw - (phoenixConfig.sizes.mobile.width + 12);
        targetY = Math.min(Math.max(vh * 0.28, 120), vh * 0.72);
      } else {
        // Desktop diagonal glide path based on section
        switch (activeSec.side) {
          case 'left':
            targetX = vw * 0.12;
            targetY = vh * 0.38;
            targetRot = -5;
            break;
          case 'right':
            targetX = vw * 0.82;
            targetY = vh * 0.36;
            targetRot = 5;
            break;
          case 'portrait':
            const portrait = document.querySelector('.founder-photo-card');
            if (portrait) {
              const rect = portrait.getBoundingClientRect();
              targetX = rect.right - 40;
              targetY = rect.top - 20;
            } else {
              targetX = vw * 0.25;
              targetY = vh * 0.4;
            }
            break;
          case 'step':
            const step = document.querySelector('.process-step.active, .process-step:first-child');
            if (step) {
              const rect = step.getBoundingClientRect();
              targetX = rect.left + rect.width * 0.5;
              targetY = rect.top - 24;
            } else {
              targetX = vw * 0.5;
              targetY = vh * 0.4;
            }
            break;
          case 'center':
          default:
            targetX = vw * 0.5 - (isMobile ? 32 : 80);
            targetY = vh * 0.32;
            targetRot = 0;
            break;
        }
      }

      // Tilt slightly with scroll delta (max ±8°)
      const deltaY = scrollY - lastScrollY.current;
      const velocityTilt = Math.min(Math.max(deltaY * 0.25, -8), 8);
      lastScrollY.current = scrollY;

      if (quickX.current) quickX.current(targetX);
      if (quickY.current) quickY.current(targetY);
      if (quickRot.current) quickRot.current(targetRot + velocityTilt);
      if (quickScale.current) quickScale.current(targetScale);
      if (quickOpacity.current) quickOpacity.current(targetOpacity);

      setPos({ x: targetX, y: targetY });
    };

    // Scroll Listener
    const onScroll = () => {
      setIsMoving(true);
      if (currentState === 'PERCHED') {
        // Takeoff when scrolling resumes
        if (perchedElementRef.current) {
          perchedElementRef.current.classList.remove('card-perched-glow');
          perchedElementRef.current = null;
        }
        setWingFolded(false);
        setCurrentState('GLIDING');
      }

      updateGlidePosition();

      // Clear existing idle timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      // Detect Scroll Idle (≥450ms desktop / 600ms mobile)
      const idleDelay = isMobile
        ? phoenixConfig.timings.perchScrollIdleMobile
        : phoenixConfig.timings.perchScrollIdleDesktop;

      idleTimerRef.current = setTimeout(() => {
        setIsMoving(false);
        attemptPerch();
      }, idleDelay);
    };

    // Attempt to Perch on Nearest [data-perch] within central 60% viewport
    const attemptPerch = () => {
      const vh = window.innerHeight;
      const centralTop = vh * 0.2;
      const centralBottom = vh * 0.8;

      const perchTargets = document.querySelectorAll('[data-perch]');
      let nearestTarget = null;
      let closestDist = Infinity;
      const centerY = vh / 2;

      perchTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Check if within central 60% of viewport
        if (rect.top >= centralTop && rect.bottom <= centralBottom) {
          const elCenterY = rect.top + rect.height / 2;
          const dist = Math.abs(elCenterY - centerY);
          if (dist < closestDist) {
            closestDist = dist;
            nearestTarget = el;
          }
        }
      });

      if (!nearestTarget) return;

      // Calculate Perch Zone (top-right corner offset, never covering content)
      const rect = nearestTarget.getBoundingClientRect();
      const zone = isMobile
        ? phoenixConfig.perchZone.mobile
        : phoenixConfig.perchZone.desktop;

      const perchX = rect.right - zone.width + zone.offsetX;
      const perchY = rect.top + zone.offsetY;

      setCurrentState('PERCHED');
      perchedElementRef.current = nearestTarget;
      nearestTarget.classList.add('card-perched-glow');

      // Smooth flight arc into perch zone
      if (birdRef.current) {
        gsap.to(birdRef.current, {
          x: perchX,
          y: perchY,
          rotation: 3,
          scale: isMobile ? 0.65 : 0.85,
          duration: phoenixConfig.timings.perchFlightDuration,
          ease: 'power3.out',
          onComplete: () => {
            setWingFolded(true);
            setPos({ x: perchX, y: perchY });
          }
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateGlidePosition();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [currentState, isMobile]);

  // 4. DESKTOP MOUSE PARALLAX (±12px, pointer: fine only)
  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer || isMobile || perfLow) return;

    let ticking = false;
    const onMouseMove = (e) => {
      if (ticking || currentState === 'PERCHED') return;
      ticking = true;
      requestAnimationFrame(() => {
        const xOffset = ((e.clientX / window.innerWidth) - 0.5) * 24;
        const yOffset = ((e.clientY / window.innerHeight) - 0.5) * 24;
        if (birdRef.current) {
          gsap.to(birdRef.current, {
            x: `+=${xOffset * 0.08}`,
            y: `+=${yOffset * 0.08}`,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
        ticking = false;
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [isMobile, perfLow, currentState]);

  return (
    <>
      {/* 1. First-Visit Intro Splash Overlay */}
      {!introDismissed && (
        <div
          ref={introOverlayRef}
          className="phoenix-intro-overlay"
          onClick={handleSkipIntro}
          title="Click to enter"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            background: '#0A0908',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'opacity 0.65s ease'
          }}
        >
          <div className="intro-content text-center">
            <h2
              className="intro-brand-title"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                opacity: 0,
                marginTop: '160px'
              }}
            >
              PHONIXE MEDIA
            </h2>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--gold-text)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '12px'
              }}
            >
              Born From Rising High • Tap to Enter
            </p>
          </div>
        </div>
      )}

      {/* 2. Fixed Golden Motes Particle Canvas */}
      <PhoenixParticles
        phoenixX={pos.x}
        phoenixY={pos.y}
        isMoving={isMoving}
        isMobile={isMobile}
        disabled={perfLow || introDismissed === false}
      />

      {/* 3. The One Fixed Phoenix Guide */}
      <aside
        ref={containerRef}
        className="phoenix-guide-container"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 40,
          overflow: 'hidden'
        }}
        aria-hidden="true"
      >
        <div
          ref={birdRef}
          className={`phoenix-bird-actor state-${currentState.toLowerCase()}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: isMobile ? phoenixConfig.sizes.mobile.width : phoenixConfig.sizes.desktop.width,
            height: isMobile ? phoenixConfig.sizes.mobile.height : phoenixConfig.sizes.desktop.height,
            willChange: 'transform, opacity',
            filter: 'drop-shadow(0 0 24px rgba(227, 169, 43, 0.4))'
          }}
        >
          <PhoenixArtwork
            wingAngle={wingAngle}
            wingFolded={wingFolded}
            glowActive={true}
          />
        </div>
      </aside>
    </>
  );
}
