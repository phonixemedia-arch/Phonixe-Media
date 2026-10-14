# Phonixe Media Design System (DESIGN.md)

This document establishes the official visual language, design tokens, component architecture, and interaction rules for the Phonixe Media website.

---

## 1. Design Philosophy
- **Aesthetic**: Premium, dark, restrained, and cinematic.
- **Role of Gold**: Gold is the **sole accent color**. Used purposefully for visual hierarchy, never as visual clutter.
- **Surface Hierarchy**: Pure dark backdrop (`#0A0908`), subtle card surfaces (`#131110`), and interactive/nested elevations (`#1B1815`).
- **Glow & Glass Discipline**:
  - **Glow is permitted ONLY on**:
    1. The Golden Phoenix guide.
    2. The Founder portrait frame (`#founder`).
    3. Primary CTA hover states.
  - **Glassmorphism is permitted ONLY on**:
    1. The sticky navbar.
    2. The Founder achievement card (`#founder`).
    3. The Results highlight card (`#results`).
  - **All other elements**: Flat dark surfaces with thin golden borders (`rgba(212, 168, 67, 0.16)`). No starfields, no rainbow/neon gradients, no heavy blurred shadows.

---

## 2. Design Tokens

### Color Palette (CSS Variables)
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-main: #0A0908;
  --surface: #131110;
  --surface-2: #1B1815;
  --surface-glass: rgba(19, 17, 16, 0.85);

  /* Borders & Dividers */
  --border-gold: rgba(212, 168, 67, 0.16);
  --border-gold-hover: rgba(212, 168, 67, 0.45);
  --border-subtle: rgba(255, 255, 255, 0.05);

  /* Typography */
  --text-main: #F7F4EE;
  --text-muted: #A8A196;
  --text-dim: #706B63;
  --gold-text: #E3B94F;

  /* Metallic Gold Gradient (135deg) */
  --gold-gradient: linear-gradient(135deg, #F2D58A 0%, #D4A843 50%, #A87B1E 100%);
  --gold-gradient-hover: linear-gradient(135deg, #F9E5A8 0%, #E3B94F 50%, #BD8E29 100%);

  /* Controlled Glow */
  --gold-glow: rgba(227, 169, 43, 0.30);
  --gold-glow-soft: rgba(227, 169, 43, 0.15);

  /* Typography Families */
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif-italic: 'Playfair Display', Georgia, serif;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

---

## 3. Typography & Hierarchy
- **Primary Font**: `Plus Jakarta Sans` for all headings, body, labels, buttons, navigation, and badges.
- **Hero Accent Font**: `Playfair Display` (italic serif) is strictly reserved for the phrase:
  > *"People Remember."*
- **Headings**:
  - Bold display weights (`700` and `800`).
  - Tight line-heights (`1.1` to `1.25`).
- **Section Headers (Standard Pattern)**:
  Every section except Hero and Footer follows the exact 3-element pattern:
  1. **Small Eyebrow**: Uppercase gold text (`--gold-text`), letter-spaced (`0.08em`), font size ~`0.75rem`.
  2. **Headline**: Display size `2rem` to `2.75rem`, bold, color `--text-main`.
  3. **Subtext**: Exactly one line of succinct context, color `--text-muted`.

---

## 4. Flow & Section Blueprint
Each section answers exactly **one visitor question** in this sequential order:
1. `#hero` — *"What is this?"*
2. `#founder` — *"Who is behind it?"* (Directly after Hero)
3. `#results` — *"Does it work?"*
4. `#who-we-serve` — *"Is it for me?"*
5. `#services` — *"What do I get?"*
6. `#process` — *"What happens next?"*
7. `#why` — *"Why them?"*
8. `#work` — *"Show me the work."* (Case Studies)
9. `#testimonials` — *"Do clients vouch for them?"*
10. `#faq` — *"Any doubts?"*
11. `#contact` — *"How do I start?"* (Final CTA + Form)
12. Footer

---

## 5. The Golden Phoenix Storyteller System
- **Layer & Visibility**: Fixed single `PhoenixGuide` container (`pointer-events: none`, `z-index: 40`, below navbar & drawer). Exactly **one** phoenix exists across the whole site.
- **States**:
  - `INTRO`: Page load splash (first visit per session), rises to Hero position.
  - `HERO`: Hovering beside/behind headline (desktop) or above (mobile).
  - `GLIDING`: Scroll-linked glide path along section anchors, opacity fades to ~35% between sections, slight velocity tilt (max ±8°).
  - `PERCHED`: When scroll stops (idle ≥450ms desktop / 600ms mobile), glides to the nearest `[data-perch]` target in the central 60% viewport, landing on the top-right corner with wings folded into a soft idle flutter.
  - `TAKEOFF`: On scroll resume (>8px delta), smoothly launches back into glide path.
- **No-Cover Safety**:
  - Each perch target reserves an empty `72×56px` (desktop) or `56×44px` (mobile) top-right perch zone.
  - Interactive/text elements marked `[data-no-cover]`.
- **Particles**: Fixed background canvas emitting max ~40 golden motes (desktop) / ~12 (mobile) only while the phoenix is moving.
- **Accessibility & Performance Guard**:
  - `prefers-reduced-motion`: Phoenix remains static, all content visible immediately.
  - FPS guard: If FPS < 45 for 2s, particles and parallax are paused automatically.

---

## 6. Content Integrity & Placeholder Rules
- Unverified statistics and fabricated testimonials are strictly forbidden.
- Missing case studies, results metrics, and testimonials are managed in dedicated data modules:
  - `results.js`
  - `caseStudies.js`
  - `testimonials.js`
- Each item has a `published: false` default flag.
- The `SHOW_PLACEHOLDERS` flag controls whether unpublished items display a "Placeholder" badge (for preview/development) or are omitted entirely. If an entire section has 0 published items in production, the section and its nav link are cleanly hidden.
