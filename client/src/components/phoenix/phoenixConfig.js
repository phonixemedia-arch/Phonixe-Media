/**
 * Centralized Configuration for the Golden Phoenix System
 * 
 * Drives all sizes, pivot points, offsets, timings, and anchor points.
 * When real layered transparent PNGs or final vectors are placed in /assets/phoenix/,
 * they integrate directly with these exact coordinates.
 */
export const phoenixConfig = {
  // Asset Paths (if external layered assets exist)
  assets: {
    basePath: "/assets/phoenix/",
    body: "/assets/phoenix/body.png",
    leftWing: "/assets/phoenix/left-wing.png",
    rightWing: "/assets/phoenix/right-wing.png",
    tail: "/assets/phoenix/tail.png"
  },

  // Dimensions & Scale
  sizes: {
    desktop: {
      width: 160,
      height: 160,
      scale: 1.0,
      mouseParallaxMax: 12
    },
    mobile: {
      width: 64,
      height: 64,
      scale: 0.85,
      mouseParallaxMax: 0,
      dockedOpacity: 0.75
    }
  },

  // Wing Joint Pivots (percentages within the artwork viewBox)
  pivots: {
    leftWing: "38% 46%",
    rightWing: "62% 46%",
    tail: "50% 75%",
    head: "50% 25%"
  },

  // Timing & Animation Dynamics
  timings: {
    introMaxDuration: 3.5,
    glideScrubSmoothing: 0.9,
    perchScrollIdleDesktop: 450, // ms
    perchScrollIdleMobile: 600,   // ms
    perchFlightDuration: 1.1,     // seconds
    takeoffDuration: 0.65,        // seconds
    wingFlapDuration: 0.35,       // seconds per flap cycle
    wingFoldDuration: 0.55        // seconds to rest
  },

  // Perch Zone Safety (reserved top-right area to NEVER cover content)
  perchZone: {
    desktop: { width: 72, height: 56, offsetX: 16, offsetY: -28 },
    mobile: { width: 56, height: 44, offsetX: 8, offsetY: -20 }
  },

  // Particle System Limits
  particles: {
    desktopMax: 38,
    mobileMax: 12,
    color: "#E3B94F",
    colorHighlight: "#F2D58A",
    colorEmber: "#D4A843"
  },

  // Performance Guard
  perf: {
    fpsSampleWindow: 2000, // 2 seconds
    minFpsThreshold: 45
  }
};
