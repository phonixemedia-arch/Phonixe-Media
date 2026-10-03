import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/**
 * BIRD ANCHOR CONFIGURATION
 * Easily adjust landing spots, offsets, scales, and rotation for each section.
 * - selector: CSS selector of the anchor element
 * - side: 'top-left' | 'top-right' | 'top' | 'center' | 'right' | 'left'
 * - offsetX / offsetY: pixel adjustments relative to anchor point
 * - scale: scale of the bird at this landing spot (default 0.75 - 0.9)
 * - rotation: landing tilt in degrees
 * - glowPulse: boolean to emit extra golden glow on arrival
 */
export const defaultBirdAnchors = [
  // 1. Hero: perches on the top-left corner of the dashboard card ("Elite Coach Brand")
  {
    id: 'hero-dashboard',
    selector: '.growth-dashboard-mockup',
    side: 'top-left',
    offsetX: -22,
    offsetY: -28,
    scale: 0.88,
    rotation: 8,
    glowPulse: true
  },
  // 2. Measurable Impact: hops across the four stat cards
  {
    id: 'impact-stat-0',
    selector: '.stats-grid .stat-card:nth-child(1)',
    side: 'top',
    offsetX: 0,
    offsetY: -32,
    scale: 0.72,
    rotation: -4
  },
  {
    id: 'impact-stat-1',
    selector: '.stats-grid .stat-card:nth-child(2)',
    side: 'top',
    offsetX: 0,
    offsetY: -32,
    scale: 0.72,
    rotation: 4
  },
  {
    id: 'impact-stat-2',
    selector: '.stats-grid .stat-card:nth-child(3)',
    side: 'top',
    offsetX: 0,
    offsetY: -32,
    scale: 0.72,
    rotation: -3
  },
  {
    id: 'impact-stat-3',
    selector: '.stats-grid .stat-card:nth-child(4)',
    side: 'top',
    offsetX: 0,
    offsetY: -32,
    scale: 0.72,
    rotation: 5
  },
  // 3. Who We Serve: perches on the card closest to viewport center
  {
    id: 'niches-group',
    selector: '.niche-cards-grid',
    side: 'top',
    offsetX: 0,
    offsetY: -30,
    scale: 0.78,
    rotation: 0
  },
  // 4. Harsh Reality: hovers top-right, then dives to transition banner beside logo
  {
    id: 'reality-hover',
    selector: '.problems-grid',
    side: 'top-right',
    offsetX: -30,
    offsetY: -40,
    scale: 0.75,
    rotation: -10
  },
  {
    id: 'reality-banner-dive',
    selector: '.problem-transition-banner',
    side: 'top-left',
    offsetX: 38,
    offsetY: -24,
    scale: 0.82,
    rotation: 6,
    glowPulse: true
  },
  // 5. Services: hops from card to card as you scroll
  {
    id: 'service-0',
    selector: '.services-grid .service-card:nth-child(1)',
    side: 'top-right',
    offsetX: -18,
    offsetY: -28,
    scale: 0.74,
    rotation: -6
  },
  {
    id: 'service-1',
    selector: '.services-grid .service-card:nth-child(2)',
    side: 'top-right',
    offsetX: -18,
    offsetY: -28,
    scale: 0.74,
    rotation: 6
  },
  {
    id: 'service-2',
    selector: '.services-grid .service-card:nth-child(3)',
    side: 'top-right',
    offsetX: -18,
    offsetY: -28,
    scale: 0.74,
    rotation: -4
  },
  {
    id: 'service-3',
    selector: '.services-grid .service-card:nth-child(4)',
    side: 'top-right',
    offsetX: -18,
    offsetY: -28,
    scale: 0.74,
    rotation: 5
  },
  // 6. 4-Step Growth System: hops card to card, then lands on the lightning icon
  {
    id: 'process-step-1',
    selector: '.process-timeline .process-step:nth-child(1)',
    side: 'top-left',
    offsetX: 16,
    offsetY: -24,
    scale: 0.78,
    rotation: -6,
    glowPulse: true
  },
  {
    id: 'process-step-2',
    selector: '.process-timeline .process-step:nth-child(2)',
    side: 'top-left',
    offsetX: 16,
    offsetY: -24,
    scale: 0.78,
    rotation: 6,
    glowPulse: true
  },
  {
    id: 'process-step-3',
    selector: '.process-timeline .process-step:nth-child(3)',
    side: 'top-left',
    offsetX: 16,
    offsetY: -24,
    scale: 0.78,
    rotation: -5,
    glowPulse: true
  },
  {
    id: 'process-step-4',
    selector: '.process-timeline .process-step:nth-child(4)',
    side: 'top-left',
    offsetX: 16,
    offsetY: -24,
    scale: 0.78,
    rotation: 6,
    glowPulse: true
  },
  {
    id: 'process-lightning',
    selector: '.process-guarantee-box .guarantee-icon',
    side: 'center',
    offsetX: 0,
    offsetY: -32,
    scale: 0.72,
    rotation: 0,
    glowPulse: true
  },
  // 7. Proven Results: lands on each case study card
  {
    id: 'case-0',
    selector: '.case-studies-grid .case-card:nth-child(1)',
    side: 'top',
    offsetX: 0,
    offsetY: -30,
    scale: 0.75,
    rotation: -4
  },
  {
    id: 'case-1',
    selector: '.case-studies-grid .case-card:nth-child(2)',
    side: 'top',
    offsetX: 0,
    offsetY: -30,
    scale: 0.75,
    rotation: 4
  },
  {
    id: 'case-2',
    selector: '.case-studies-grid .case-card:nth-child(3)',
    side: 'top',
    offsetX: 0,
    offsetY: -30,
    scale: 0.75,
    rotation: 0
  },
  // 8. Client Experiences: glides to center above heading and idles
  {
    id: 'testimonials-center',
    selector: '#testimonials .section-header',
    side: 'top',
    offsetX: 0,
    offsetY: -42,
    scale: 0.85,
    rotation: 0
  },
  // 9. Phonixe Difference: flies to small emblem box ("Born From Rising High")
  {
    id: 'difference-emblem',
    selector: '.why-brand-highlight',
    side: 'top-left',
    offsetX: 10,
    offsetY: -26,
    scale: 0.8,
    rotation: -6,
    glowPulse: true
  },
  // 10. FAQ: perches at top-right of accordion
  {
    id: 'faq-top-right',
    selector: '.faq-accordion-container',
    side: 'top-right',
    offsetX: -24,
    offsetY: -32,
    scale: 0.75,
    rotation: 8
  },
  // 11. Final CTA + Footer: scales up with soft gold embers, settles & fades
  {
    id: 'cta-banner',
    selector: '.cta-banner-wrapper',
    side: 'top',
    offsetX: 0,
    offsetY: -48,
    scale: 1.15,
    rotation: 0,
    glowPulse: true
  },
  {
    id: 'footer-settle',
    selector: '.site-footer',
    side: 'top',
    offsetX: 0,
    offsetY: 20,
    scale: 0.7,
    rotation: 0,
    fade: true
  }
];

export default function BirdLayer({ anchors = defaultBirdAnchors, activeFaq = null }) {
  const birdRef = useRef(null);
  const birdImgRef = useRef(null);
  const embersCanvasRef = useRef(null);

  // Flight state refs
  const isHoveredRef = useRef(false);
  const currentAnchorIndexRef = useRef(0);
  const idleTweenRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const anchorCoordsRef = useRef([]);

  // Quick setters for silky 60fps positioning
  const quickX = useRef(null);
  const quickY = useRef(null);
  const quickScale = useRef(null);
  const quickRotation = useRef(null);
  const quickScaleX = useRef(null);

  // Compute element anchor point in page coordinates
  const computeAnchorPoint = useCallback((anchor) => {
    const el = document.querySelector(anchor.selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let x = rect.left + scrollX;
    let y = rect.top + scrollY;

    if (anchor.side === 'top-left') {
      x += (anchor.offsetX || 0);
      y += (anchor.offsetY || 0);
    } else if (anchor.side === 'top-right') {
      x += rect.width + (anchor.offsetX || 0);
      y += (anchor.offsetY || 0);
    } else if (anchor.side === 'top') {
      x += rect.width / 2 + (anchor.offsetX || 0);
      y += (anchor.offsetY || 0);
    } else if (anchor.side === 'center') {
      x += rect.width / 2 + (anchor.offsetX || 0);
      y += rect.height / 2 + (anchor.offsetY || 0);
    } else if (anchor.side === 'right') {
      x += rect.width + (anchor.offsetX || 0);
      y += rect.height / 2 + (anchor.offsetY || 0);
    } else if (anchor.side === 'left') {
      x += (anchor.offsetX || 0);
      y += rect.height / 2 + (anchor.offsetY || 0);
    } else {
      x += rect.width / 2 + (anchor.offsetX || 0);
      y += (anchor.offsetY || 0);
    }

    return {
      x,
      y,
      scale: anchor.scale || 0.8,
      rotation: anchor.rotation || 0,
      glowPulse: !!anchor.glowPulse,
      fade: !!anchor.fade,
      element: el
    };
  }, []);

  // Cache all anchor page coordinates
  const refreshAnchorCoords = useCallback(() => {
    anchorCoordsRef.current = anchors.map(computeAnchorPoint);
  }, [anchors, computeAnchorPoint]);

  // Gentle idle float while perched
  const startIdleFloat = useCallback(() => {
    if (idleTweenRef.current) idleTweenRef.current.kill();
    if (!birdImgRef.current) return;

    idleTweenRef.current = gsap.to(birdImgRef.current, {
      y: '+=5px',
      rotation: '+=2',
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  const stopIdleFloat = useCallback(() => {
    if (idleTweenRef.current) {
      idleTweenRef.current.kill();
      idleTweenRef.current = null;
    }
    if (birdImgRef.current) {
      gsap.to(birdImgRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, []);

  // Canvas ember particle trail
  useEffect(() => {
    const canvas = embersCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const particles = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const addEmber = (x, y) => {
      if (particles.length > 50) return;
      particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.6,
        alpha: 0.8 + Math.random() * 0.2,
        size: 1.5 + Math.random() * 2.5,
        decay: 0.02 + Math.random() * 0.02
      });
    };

    window.__phonixeEmitEmber = addEmber;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 169, 60, ${p.alpha})`;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      delete window.__phonixeEmitEmber;
    };
  }, []);

  // Main GSAP ScrollTrigger Flight Setup
  useEffect(() => {
    const birdEl = birdRef.current;
    const birdImg = birdImgRef.current;
    if (!birdEl || !birdImg) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    refreshAnchorCoords();

    // Quick setters for smooth responsive positioning
    quickX.current = gsap.quickTo(birdEl, 'x', { duration: 0.5, ease: 'power3.out' });
    quickY.current = gsap.quickTo(birdEl, 'y', { duration: 0.5, ease: 'power3.out' });
    quickScale.current = gsap.quickTo(birdEl, 'scale', { duration: 0.5, ease: 'power3.out' });
    quickRotation.current = gsap.quickTo(birdEl, 'rotation', { duration: 0.5, ease: 'power3.out' });
    quickScaleX.current = gsap.quickTo(birdImg, 'scaleX', { duration: 0.3, ease: 'power2.out' });

    // Initial position on Hero
    const heroAnchor = anchorCoordsRef.current[0];
    if (heroAnchor) {
      const initialViewportX = heroAnchor.x;
      const initialViewportY = heroAnchor.y - window.scrollY;
      gsap.set(birdEl, {
        x: initialViewportX,
        y: initialViewportY,
        scale: isMobile ? heroAnchor.scale * 0.65 : heroAnchor.scale,
        rotation: heroAnchor.rotation,
        opacity: 1
      });
      lastPosRef.current = { x: initialViewportX, y: initialViewportY };
      startIdleFloat();
    }

    if (prefersReducedMotion) {
      // Static bird in hero, no flights or pinning
      return;
    }

    // SCROLL-DRIVEN FLIGHT TIMELINE
    // Scrub bird through anchors as user scrolls the page
    const totalScrollHeight = () => document.documentElement.scrollHeight - window.innerHeight;
    
    // Master flight scroll trigger
    const flightTrigger = ScrollTrigger.create({
      trigger: '.landing-page-root',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        if (isHoveredRef.current) return; // Allow mouse hover to override scroll position temporarily

        const progress = self.progress;
        const totalAnchors = anchors.length;
        if (totalAnchors < 2) return;

        // Determine current pair of anchors based on progress
        const segmentFloat = progress * (totalAnchors - 1);
        const currentIndex = Math.min(Math.floor(segmentFloat), totalAnchors - 2);
        const segmentProgress = segmentFloat - currentIndex;

        currentAnchorIndexRef.current = currentIndex;

        const a1 = anchorCoordsRef.current[currentIndex] || computeAnchorPoint(anchors[currentIndex]);
        const a2 = anchorCoordsRef.current[currentIndex + 1] || computeAnchorPoint(anchors[currentIndex + 1]);

        if (!a1 || !a2) return;

        // Current scroll offset
        const currentScrollY = window.scrollY;

        // Page coordinates to current viewport coordinates
        const v1 = { x: a1.x, y: a1.y - currentScrollY };
        const v2 = { x: a2.x, y: a2.y - currentScrollY };

        // Quadratic curve in viewport space for arched flight
        const t = segmentProgress;
        // Arc peak: lift bird up during flight between sections
        const arcLift = -Math.min(120, Math.abs(v2.x - v1.x) * 0.4 + 40);
        const midX = (v1.x + v2.x) / 2;
        const midY = (v1.y + v2.y) / 2 + arcLift;

        // Bézier interpolation
        const currentX = (1 - t) * (1 - t) * v1.x + 2 * (1 - t) * t * midX + t * t * v2.x;
        const currentY = (1 - t) * (1 - t) * v1.y + 2 * (1 - t) * t * midY + t * t * v2.y;

        // Compute angle of trajectory
        const dx = currentX - lastPosRef.current.x;
        const dy = currentY - lastPosRef.current.y;
        let flightAngle = 0;
        if (Math.hypot(dx, dy) > 1.5) {
          flightAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          // Clamp angle for natural flight
          flightAngle = Math.max(-45, Math.min(45, flightAngle * 0.4));
        }

        // Horizontal flip: face right when moving right (dx >= 0), face left when moving left (dx < 0)
        const facingDirection = dx < -1 ? -1 : dx > 1 ? 1 : (v2.x < v1.x ? -1 : 1);

        // Scale and opacity
        let targetScale = (1 - t) * a1.scale + t * a2.scale;
        if (isMobile) targetScale *= 0.65;

        let targetOpacity = 1;
        if (a2.fade && t > 0.6) {
          targetOpacity = 1 - (t - 0.6) / 0.4;
        }

        // Apply transforms via GSAP
        gsap.set(birdEl, {
          x: currentX,
          y: currentY,
          scale: targetScale,
          rotation: (1 - t) * a1.rotation + t * a2.rotation + flightAngle,
          opacity: targetOpacity
        });

        if (quickScaleX.current) {
          quickScaleX.current(facingDirection);
        }

        // Emit ember particles during flight
        if (window.__phonixeEmitEmber && Math.random() < 0.4) {
          window.__phonixeEmitEmber(currentX + 35, currentY + 30);
        }

        lastPosRef.current = { x: currentX, y: currentY };
      }
    });

    // 4-STEP GROWTH SYSTEM DESKTOP PINNING
    let processPinTrigger = null;
    if (!isMobile && !prefersReducedMotion) {
      const processEl = document.querySelector('#process');
      const processSteps = document.querySelectorAll('.process-step');

      if (processEl && processSteps.length >= 4) {
        processPinTrigger = ScrollTrigger.create({
          trigger: '#process',
          start: 'top top+=80',
          end: '+=1400',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            const stepIdx = Math.min(3, Math.floor(self.progress * 4));
            processSteps.forEach((step, idx) => {
              if (idx <= stepIdx) {
                step.classList.add('bird-perched-glow');
              } else {
                step.classList.remove('bird-perched-glow');
              }
            });
          }
        });
      }
    }

    // Refresh triggers on resize, fonts loaded, orientation changes
    const onResize = () => {
      refreshAnchorCoords();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      flightTrigger.kill();
      if (processPinTrigger) processPinTrigger.kill();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      stopIdleFloat();
    };
  }, [anchors, computeAnchorPoint, refreshAnchorCoords, startIdleFloat, stopIdleFloat]);

  // DESKTOP ICON HOVER INTERACTION
  // Add data-bird-hover to any icon element: bird swoops over, perches at ~0.35 scale, gold ring glows
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) return;

    const birdEl = birdRef.current;
    if (!birdEl) return;

    const handleMouseEnter = (e) => {
      const target = e.target.closest('[data-bird-hover]');
      if (!target) return;

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      isHoveredRef.current = true;
      stopIdleFloat();

      // Add target gold glow ring
      target.classList.add('bird-perched-target');

      const rect = target.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 - 25; // center bird over icon
      const targetY = rect.top - 20; // sit just slightly perched atop icon

      // Direction toward icon
      const dx = targetX - (lastPosRef.current.x || targetX);
      const faceDir = dx < 0 ? -1 : 1;

      // Flight to icon
      gsap.to(birdEl, {
        x: targetX,
        y: targetY,
        scale: 0.35,
        rotation: 0,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => {
          lastPosRef.current = { x: targetX, y: targetY };
          if (window.__phonixeEmitEmber) {
            window.__phonixeEmitEmber(targetX + 15, targetY + 15);
          }
        }
      });

      if (quickScaleX.current) {
        quickScaleX.current(faceDir);
      }
    };

    const handleMouseLeave = (e) => {
      const target = e.target.closest('[data-bird-hover]');
      if (!target) return;

      target.classList.remove('bird-perched-target');

      // 150ms debounce before returning to scroll anchor
      hoverTimeoutRef.current = setTimeout(() => {
        isHoveredRef.current = false;

        // Return to active scroll anchor
        const currentIndex = currentAnchorIndexRef.current || 0;
        const anchor = anchorCoordsRef.current[currentIndex] || computeAnchorPoint(anchors[currentIndex]);

        if (anchor) {
          const returnX = anchor.x;
          const returnY = anchor.y - window.scrollY;

          gsap.to(birdEl, {
            x: returnX,
            y: returnY,
            scale: anchor.scale || 0.8,
            rotation: anchor.rotation || 0,
            duration: 0.55,
            ease: 'power3.out',
            overwrite: 'auto',
            onComplete: () => {
              lastPosRef.current = { x: returnX, y: returnY };
              startIdleFloat();
            }
          });
        }
      }, 150);
    };

    // Attach listeners with event delegation
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [anchors, computeAnchorPoint, startIdleFloat, stopIdleFloat]);

  // Small bounce effect when FAQ item opens
  useEffect(() => {
    if (activeFaq === null) return;
    const birdEl = birdRef.current;
    if (!birdEl) return;

    gsap.fromTo(birdEl, 
      { y: '-=15px' }, 
      { y: '+=15px', duration: 0.45, ease: 'bounce.out' }
    );
  }, [activeFaq]);

  return (
    <>
      {/* Background Ember Particles Canvas */}
      <canvas 
        ref={embersCanvasRef} 
        className="phoenix-embers-canvas" 
        aria-hidden="true" 
      />

      {/* Signature Phoenix Bird Element */}
      <div 
        ref={birdRef} 
        className="phoenix-bird-wrapper" 
        aria-hidden="true"
      >
        <img 
          ref={birdImgRef}
          src="/assets/phoenix-bird.png" 
          alt="" 
          className="phoenix-bird-img" 
          draggable="false"
        />
      </div>
    </>
  );
}
