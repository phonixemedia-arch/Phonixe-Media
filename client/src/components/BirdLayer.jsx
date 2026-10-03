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

  // Quick setters for silky 60fps positioning
  const quickX = useRef(null);
  const quickY = useRef(null);
  const quickScale = useRef(null);
  const quickRotation = useRef(null);
  const quickScaleX = useRef(null);

  // Anchor milestones ref
  const anchorDataRef = useRef([]);

  // Compute live element positions relative to viewport
  const getAnchorPos = useCallback((item) => {
    if (!item || !item.element) return null;
    const rect = item.element.getBoundingClientRect();
    let x = rect.left;
    let y = rect.top;

    if (item.side === 'top-left') {
      x += (item.offsetX || 0);
      y += (item.offsetY || 0);
    } else if (item.side === 'top-right') {
      x += rect.width + (item.offsetX || 0);
      y += (item.offsetY || 0);
    } else if (item.side === 'center') {
      x += rect.width / 2 + (item.offsetX || 0);
      y += rect.height / 2 + (item.offsetY || 0);
    } else if (item.side === 'right') {
      x += rect.width + (item.offsetX || 0);
      y += rect.height / 2 + (item.offsetY || 0);
    } else if (item.side === 'left') {
      x += (item.offsetX || 0);
      y += rect.height / 2 + (item.offsetY || 0);
    } else {
      x += rect.width / 2 + (item.offsetX || 0);
      y += (item.offsetY || 0);
    }

    return {
      x,
      y,
      scale: item.scale || 0.8,
      rotation: item.rotation || 0,
      fade: !!item.fade
    };
  }, []);

  // Compute scroll target milestones for each anchor in page order
  const computeMilestones = useCallback(() => {
    const viewportH = window.innerHeight;
    const scrollY = window.scrollY;

    const list = [];
    anchors.forEach((anchor) => {
      const el = document.querySelector(anchor.selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pageTop = rect.top + scrollY;

      // Desired scroll position where this element is centered comfortably
      let targetScroll = pageTop - viewportH * 0.35 + (anchor.offsetY || 0);
      if (targetScroll < 0) targetScroll = 0;

      list.push({
        ...anchor,
        element: el,
        pageTop,
        targetScroll
      });
    });

    list.sort((a, b) => a.pageTop - b.pageTop);

    // Enforce smooth spacing between consecutive milestones
    for (let i = 1; i < list.length; i++) {
      if (list[i].targetScroll <= list[i - 1].targetScroll + 60) {
        list[i].targetScroll = list[i - 1].targetScroll + 120;
      }
    }

    anchorDataRef.current = list;
    return list;
  }, [anchors]);

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

  // Update bird position based on exact scroll offset
  const updateBirdOnScroll = useCallback((currentScroll) => {
    if (isHoveredRef.current) return;
    const birdEl = birdRef.current;
    const birdImg = birdImgRef.current;
    if (!birdEl || !birdImg) return;

    // Ensure valid numerical scroll
    const scrollVal = (typeof currentScroll === 'number' && !isNaN(currentScroll)) ? currentScroll : window.scrollY;

    let list = anchorDataRef.current;
    if (!list || list.length === 0) {
      list = computeMilestones();
    }
    if (!list || list.length === 0) return;

    const isMobile = window.innerWidth < 768;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Find which anchor segment corresponds to current scroll
    let i = 0;
    while (i < list.length - 1 && scrollVal >= list[i + 1].targetScroll) {
      i++;
    }

    currentAnchorIndexRef.current = i;

    const a1 = list[i];
    const a2 = list[Math.min(i + 1, list.length - 1)];

    let t = 0;
    if (i < list.length - 1) {
      const range = a2.targetScroll - a1.targetScroll;
      t = range > 0 ? (scrollVal - a1.targetScroll) / range : 0;
      t = Math.max(0, Math.min(1, t));
    }

    const p1 = getAnchorPos(a1);
    const p2 = getAnchorPos(a2);
    if (!p1 || !p2) return;

    // Clamp anchor targets into viewport frame so they never start/end off-screen
    const p1Clamped = {
      x: Math.max(25, Math.min(viewportW - 85, p1.x)),
      y: Math.max(76, Math.min(viewportH - 85, p1.y))
    };
    const p2Clamped = {
      x: Math.max(25, Math.min(viewportW - 85, p2.x)),
      y: Math.max(76, Math.min(viewportH - 85, p2.y))
    };

    let currentX, currentY;
    let flightT = 0;

    if (t <= 0.15) {
      // Perched on Anchor 1
      flightT = 0;
      currentX = p1Clamped.x;
      currentY = p1Clamped.y;
    } else if (t >= 0.85) {
      // Perched on Anchor 2
      flightT = 1;
      currentX = p2Clamped.x;
      currentY = p2Clamped.y;
    } else {
      // In flight along arched Bézier curve
      flightT = (t - 0.15) / 0.7;
      const midX = (p1Clamped.x + p2Clamped.x) / 2;
      const midY = Math.max(85, (p1Clamped.y + p2Clamped.y) / 2 - 60);

      currentX = (1 - flightT) * (1 - flightT) * p1Clamped.x + 2 * (1 - flightT) * flightT * midX + flightT * flightT * p2Clamped.x;
      currentY = (1 - flightT) * (1 - flightT) * p1Clamped.y + 2 * (1 - flightT) * flightT * midY + flightT * flightT * p2Clamped.y;
    }

    // Bulletproof viewport clamping: bird is ALWAYS visible on screen
    currentX = Math.max(25, Math.min(viewportW - 85, currentX));
    currentY = Math.max(76, Math.min(viewportH - 85, currentY));

    // Direction and flight trajectory angle
    const dx = currentX - (lastPosRef.current.x || currentX);
    const dy = currentY - (lastPosRef.current.y || currentY);

    let flightAngle = 0;
    if (Math.hypot(dx, dy) > 1.5) {
      flightAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      flightAngle = Math.max(-35, Math.min(35, flightAngle * 0.35));
    }

    const facingDirection = dx < -1.5 ? -1 : dx > 1.5 ? 1 : (p2Clamped.x < p1Clamped.x ? -1 : 1);

    // Scale and opacity
    let targetScale = (1 - flightT) * p1.scale + flightT * p2.scale;
    if (isMobile) targetScale *= 0.65;

    let targetOpacity = 1;
    if (p2.fade && flightT > 0.6) {
      targetOpacity = 1 - (flightT - 0.6) / 0.4;
    }

    gsap.set(birdEl, {
      x: currentX,
      y: currentY,
      scale: targetScale,
      rotation: (1 - flightT) * p1.rotation + flightT * p2.rotation + flightAngle,
      opacity: targetOpacity
    });

    if (quickScaleX.current) {
      quickScaleX.current(facingDirection);
    }

    // Emit ember particles
    if (window.__phonixeEmitEmber && Math.hypot(dx, dy) > 3 && Math.random() < 0.45) {
      window.__phonixeEmitEmber(currentX + 35, currentY + 30);
    }

    lastPosRef.current = { x: currentX, y: currentY };
  }, [computeMilestones, getAnchorPos]);

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

    const isMobile = window.innerWidth < 768;

    // Quick setters for smooth responsive positioning
    quickX.current = gsap.quickTo(birdEl, 'x', { duration: 0.5, ease: 'power3.out' });
    quickY.current = gsap.quickTo(birdEl, 'y', { duration: 0.5, ease: 'power3.out' });
    quickScale.current = gsap.quickTo(birdEl, 'scale', { duration: 0.5, ease: 'power3.out' });
    quickRotation.current = gsap.quickTo(birdEl, 'rotation', { duration: 0.5, ease: 'power3.out' });
    quickScaleX.current = gsap.quickTo(birdImg, 'scaleX', { duration: 0.3, ease: 'power2.out' });

    // Initialize milestones and position
    computeMilestones();
    updateBirdOnScroll(window.scrollY);
    startIdleFloat();

    // SCROLL-DRIVEN FLIGHT LISTENER
    const handleScroll = () => {
      updateBirdOnScroll(window.scrollY);
    };

    window.__phonixeScrollCallback = (scrollY) => {
      updateBirdOnScroll(scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const flightTrigger = ScrollTrigger.create({
      trigger: '.landing-page-root',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: () => {
        updateBirdOnScroll(window.scrollY);
      }
    });

    // 4-STEP GROWTH SYSTEM DESKTOP PINNING (Pins timeline cleanly for 450px)
    let processPinTrigger = null;
    if (!isMobile) {
      const timelineEl = document.querySelector('.process-timeline');
      const processSteps = document.querySelectorAll('.process-step');

      if (timelineEl && processSteps.length >= 4) {
        processPinTrigger = ScrollTrigger.create({
          trigger: timelineEl,
          start: 'top 20%',
          end: '+=450',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
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

    // Refresh milestones on resize or orientation change
    const onResize = () => {
      computeMilestones();
      updateBirdOnScroll(window.scrollY);
      ScrollTrigger.refresh();
    };

    const initTimer = setTimeout(() => {
      computeMilestones();
      updateBirdOnScroll(window.scrollY);
      ScrollTrigger.refresh();
    }, 250);

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('scroll', handleScroll);
      delete window.__phonixeScrollCallback;
      flightTrigger.kill();
      if (processPinTrigger) processPinTrigger.kill();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      stopIdleFloat();
    };
  }, [computeMilestones, updateBirdOnScroll, startIdleFloat, stopIdleFloat]);

  // DESKTOP ICON HOVER INTERACTION
  // Add data-bird-hover to any icon element: bird swoops over, perches at ~0.35 scale, gold ring glows
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

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

      target.classList.add('bird-perched-target');

      const rect = target.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 - 25;
      const targetY = rect.top - 20;

      const dx = targetX - (lastPosRef.current.x || targetX);
      const faceDir = dx < 0 ? -1 : 1;

      gsap.to(birdEl, {
        x: targetX,
        y: targetY,
        scale: 0.35,
        rotation: 0,
        duration: 0.45,
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

      hoverTimeoutRef.current = setTimeout(() => {
        isHoveredRef.current = false;
        updateBirdOnScroll(window.scrollY);
        startIdleFloat();
      }, 150);
    };

    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [updateBirdOnScroll, startIdleFloat, stopIdleFloat]);

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
