import React from 'react';
import { phoenixConfig } from './phoenixConfig';

/**
 * PhoenixArtwork
 * 
 * An elegant, sharp, metallic golden phoenix with isolated wing joints
 * designed for dynamic CSS / GSAP transform flapping.
 * 
 * Wing pivots and anchors are driven by phoenixConfig.js.
 */
export default function PhoenixArtwork({
  wingAngle = 0,
  wingFolded = false,
  glowActive = true,
  className = ''
}) {
  const { pivots } = phoenixConfig;

  return (
    <div 
      className={`phoenix-artwork-wrap ${glowActive ? 'has-glow' : ''} ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="phoenix-svg"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          filter: glowActive 
            ? 'drop-shadow(0 0 16px rgba(227, 169, 43, 0.45)) drop-shadow(0 0 32px rgba(212, 168, 67, 0.22))' 
            : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))'
        }}
      >
        <defs>
          {/* Metallic Gold Primary Gradient (135deg) */}
          <linearGradient id="phGoldPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2D58A" />
            <stop offset="45%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#A87B1E" />
          </linearGradient>

          {/* Highlight Gradient for Upper Feathers */}
          <linearGradient id="phGoldHighlight" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#FFF2CC" />
            <stop offset="50%" stopColor="#F2D58A" />
            <stop offset="100%" stopColor="#D4A843" />
          </linearGradient>

          {/* Shadow Gold for Inner Body Depths */}
          <linearGradient id="phGoldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A843" />
            <stop offset="60%" stopColor="#8A6314" />
            <stop offset="100%" stopColor="#4A3408" />
          </linearGradient>

          {/* Core Ember Glow Radial */}
          <radialGradient id="phEmberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(242, 213, 138, 0.85)" />
            <stop offset="60%" stopColor="rgba(212, 168, 67, 0.35)" />
            <stop offset="100%" stopColor="rgba(168, 123, 30, 0)" />
          </radialGradient>
        </defs>

        {/* Ambient Ember Glow Core */}
        <circle cx="100" cy="95" r="50" fill="url(#phEmberGlow)" opacity="0.65" />

        {/* 1. TAIL FEATHERS (Layer 1 - Behind Body) */}
        <g id="phoenix-tail" className="phoenix-tail-group" style={{ transformOrigin: pivots.tail }}>
          {/* Long sweeping central tail plume */}
          <path
            d="M97 122 C92 142 85 168 76 188 C88 174 98 152 101 125 C103 152 113 174 125 188 C116 168 109 142 104 122 Z"
            fill="url(#phGoldPrimary)"
            stroke="#F2D58A"
            strokeWidth="0.8"
          />
          {/* Outer tail wisps */}
          <path
            d="M94 126 C84 144 72 162 58 172 C72 158 84 140 92 125 Z"
            fill="url(#phGoldHighlight)"
            opacity="0.9"
          />
          <path
            d="M107 126 C117 144 129 162 143 172 C129 158 117 140 109 125 Z"
            fill="url(#phGoldShadow)"
            opacity="0.9"
          />
        </g>

        {/* 2. LEFT WING (Layer 2 - Left Flapping Joint) */}
        <g
          id="phoenix-wing-left"
          className="phoenix-wing-left"
          style={{
            transformOrigin: pivots.leftWing,
            transform: wingFolded
              ? 'rotate(32deg) scaleX(0.72) scaleY(0.92)'
              : `rotate(${wingAngle}deg)`,
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Primary High Wing Blade */}
          <path
            d="M80 88 C62 64 36 42 12 30 C30 46 48 70 64 92 C52 74 34 60 18 52 C32 68 46 88 58 102 C46 90 32 82 22 78 C34 94 48 108 68 114 C74 104 78 94 80 88 Z"
            fill="url(#phGoldHighlight)"
            stroke="#FFF2CC"
            strokeWidth="0.75"
          />
          {/* Secondary Feather Tier */}
          <path
            d="M74 96 C58 80 42 66 26 56 C38 72 52 90 66 106 Z"
            fill="url(#phGoldPrimary)"
            opacity="0.85"
          />
          {/* Base Joint Scapular */}
          <path
            d="M78 88 C70 94 65 102 70 110 C76 112 82 104 84 96 Z"
            fill="url(#phGoldShadow)"
          />
        </g>

        {/* 3. RIGHT WING (Layer 3 - Right Flapping Joint) */}
        <g
          id="phoenix-wing-right"
          className="phoenix-wing-right"
          style={{
            transformOrigin: pivots.rightWing,
            transform: wingFolded
              ? 'rotate(-32deg) scaleX(0.72) scaleY(0.92)'
              : `rotate(${-wingAngle}deg)`,
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Primary High Wing Blade */}
          <path
            d="M120 88 C138 64 164 42 188 30 C170 46 152 70 136 92 C148 74 166 60 182 52 C168 68 154 88 142 102 C154 90 168 82 178 78 C166 94 152 108 132 114 C126 104 122 94 120 88 Z"
            fill="url(#phGoldPrimary)"
            stroke="#F2D58A"
            strokeWidth="0.75"
          />
          {/* Secondary Feather Tier */}
          <path
            d="M126 96 C142 80 158 66 174 56 C162 72 148 90 134 106 Z"
            fill="url(#phGoldHighlight)"
            opacity="0.85"
          />
          {/* Base Joint Scapular */}
          <path
            d="M122 88 C130 94 135 102 130 110 C124 112 118 104 116 96 Z"
            fill="url(#phGoldShadow)"
          />
        </g>

        {/* 4. MAIN TORSO & HEAD (Layer 4 - Foreground Focus) */}
        <g id="phoenix-body">
          {/* Crown Crest Feathers */}
          <path
            d="M100 38 C97 26 90 18 80 12 C90 22 94 30 96 42 Z"
            fill="url(#phGoldHighlight)"
          />
          <path
            d="M100 38 C100 24 104 14 114 8 C108 20 106 28 102 42 Z"
            fill="url(#phGoldHighlight)"
          />
          <path
            d="M100 38 C104 28 112 22 122 18 C112 28 106 34 102 44 Z"
            fill="url(#phGoldPrimary)"
          />

          {/* Head & Elegant Sharp Beak */}
          <path
            d="M94 48 C94 40 98 36 103 36 C108 36 112 40 111 48 C115 48 124 49 128 51 C121 53 113 55 109 55 C107 60 102 65 98 64 C95 62 94 56 94 48 Z"
            fill="url(#phGoldPrimary)"
            stroke="#FFF2CC"
            strokeWidth="0.75"
          />

          {/* Sharp Beak Tip */}
          <path
            d="M111 48 L127 51 L110 54 Z"
            fill="#FFF2CC"
          />

          {/* Golden Eye */}
          <circle cx="103" cy="46" r="1.75" fill="#FFF" />
          <circle cx="103" cy="46" r="0.9" fill="#0A0908" />

          {/* Aerodynamic Neck & Chest */}
          <path
            d="M96 56 C94 68 90 82 88 98 C86 112 92 124 100 127 C108 124 114 112 112 98 C110 82 106 68 104 56 C100 60 98 60 96 56 Z"
            fill="url(#phGoldHighlight)"
            stroke="#F2D58A"
            strokeWidth="0.75"
          />

          {/* Chest Shield Plates */}
          <path
            d="M93 74 C97 80 103 80 107 74 C104 88 96 88 93 74 Z"
            fill="url(#phGoldShadow)"
            opacity="0.85"
          />
          <path
            d="M91 88 C96 95 104 95 109 88 C106 104 94 104 91 88 Z"
            fill="url(#phGoldShadow)"
            opacity="0.8"
          />

          {/* Talons (Resting at Bottom of Torso) */}
          <path
            d="M94 124 L91 130 M97 125 L96 132 M100 125 L101 132 M103 125 L105 131"
            stroke="#F2D58A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
