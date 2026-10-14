import React, { useEffect, useRef } from 'react';
import { phoenixConfig } from './phoenixConfig';

/**
 * PhoenixParticles
 * 
 * Lightweight canvas rendering golden motes/embers strictly behind the phoenix
 * while in motion. Capped at 40 (desktop) / 12 (mobile) particles.
 */
export default function PhoenixParticles({
  phoenixX = 0,
  phoenixY = 0,
  isMoving = false,
  isMobile = false,
  disabled = false
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastPosRef = useRef({ x: phoenixX, y: phoenixY });

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const maxParticles = isMobile
      ? phoenixConfig.particles.mobileMax
      : phoenixConfig.particles.desktopMax;

    const render = () => {
      // Pause if tab is hidden
      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Emit new particles only while phoenix is actively moving
      if (isMoving && particlesRef.current.length < maxParticles) {
        // Emit 1-2 particles per frame
        const count = isMobile ? 1 : Math.random() > 0.4 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 1.5;
          particlesRef.current.push({
            x: phoenixX + (Math.random() - 0.5) * 30,
            y: phoenixY + (Math.random() - 0.5) * 30 + 10, // slightly behind / lower
            vx: Math.cos(angle) * speed * 0.5,
            vy: Math.sin(angle) * speed * 0.5 + 0.8, // gentle downward drift
            size: 1.2 + Math.random() * (isMobile ? 1.6 : 2.5),
            alpha: 0.85 + Math.random() * 0.15,
            decay: 0.015 + Math.random() * 0.02,
            hue: Math.random() > 0.6 ? '#FFF2CC' : Math.random() > 0.3 ? '#F2D58A' : '#D4A843'
          });
        }
      }

      // Update and draw existing particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.hue;
        ctx.shadowColor = 'rgba(227, 169, 43, 0.6)';
        ctx.shadowBlur = p.size * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phoenixX, phoenixY, isMoving, isMobile, disabled]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="phoenix-particles-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 38,
        width: '100vw',
        height: '100vh'
      }}
      aria-hidden="true"
    />
  );
}
