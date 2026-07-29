/**
 * Centralized motion tokens.
 * Every duration, ease, stagger and physics constant lives here —
 * components never hardcode animation values.
 */

/** GSAP ease strings. */
export const EASE = {
  /** Primary entrance ease — fast start, long settle. */
  out: "expo.out",
  /** Softer entrance for large blocks. */
  quartOut: "quart.out",
  /** Symmetric ease for morphs/inversions. */
  inOut: "power3.inOut",
  /** Linear-ish ease for scrub-driven motion. */
  scrub: "none",
  /** Small UI feedback. */
  ui: "power2.out",
} as const;

/** CSS cubic-bezier equivalents (for transitions in CSS). */
export const EASE_CSS = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.83, 0, 0.17, 1)",
  ui: "cubic-bezier(0.33, 1, 0.68, 1)",
} as const;

/** Duration scale in seconds. */
export const DUR = {
  xs: 0.2,
  sm: 0.4,
  md: 0.7,
  lg: 1.1,
  xl: 1.6,
} as const;

/** Stagger presets in seconds. */
export const STAGGER = {
  chars: 0.016,
  words: 0.045,
  lines: 0.09,
  items: 0.07,
  rows: 0.1,
} as const;

/* The visitor cursor tracks the pointer 1:1 (see components/cursor/Cursor.tsx)
   — it has no easing, lag or hover scaling, so it needs no motion tokens. */

/** Lenis smooth-scroll configuration. */
export const LENIS = {
  duration: 1.15,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
} as const;

/**
 * Hero design-surface choreography.
 * Timings in ms unless the key says seconds (GSAP tweens use seconds).
 */
export const HERO = {
  intro: {
    gridFadeSec: 2,
    eyebrowSec: 1,
    eyebrowDelaySec: 0.5,
    lineSec: 1.2,
    lineDelaySec: 0.8,
    lineStaggerSec: 0.2,
    subtitleSec: 1,
    subtitleDelaySec: 1.5,
    /** Dragging unlocks once the name has settled (measured from reveal). */
    dragEnabledAt: 2500,
    /** Collaborator arrives after the intro has fully landed. */
    sequenceStart: 3500,
  },
  collab: {
    /** Glide time budget between targets. */
    travel: 1000,
    /** How long a selection is held before moving on. */
    dwell: 1200,
    /** Nudge applied to the first name while "tracking" is edited. */
    nudgePx: 10,
    nudgeSec: 0.3,
    marquee: 1200,
    preEdit: 800,
    deleteChar: 25,
    pauseBetween: 400,
    typeChar: 30,
    afterType: 1000,
    exit: 1000,
    /** Per-frame lerp factor for the pointer glide. */
    lerp: 0.085,
  },
  drag: {
    /** Beat after release before the layer starts realigning. */
    settleDelay: 800,
    snapSec: 1.2,
    afterSnap: 1300,
    bubbleDelay: 300,
    bubbleCharMin: 25,
    bubbleCharJitter: 40,
    bubbleHold: 2200,
    /** Chat bubble flips left when the pointer is within this of the edge. */
    flipEdge: 280,
  },
} as const;

/**
 * Route transition — the "Navigate" selection box.
 * Full timeline lives in components/transition/NavTransition.tsx; these are
 * the values it starts from.
 */
export const NAV_TRANSITION = {
  /** Initial selection-box size, centred on the click point. */
  boxW: 50,
  boxH: 36,
  accent: {
    shadowFrom: "rgba(167,139,250,0)",
    shadowTo: "rgba(167,139,250,0.25)",
  },
} as const;

/** Preloader timing. */
export const PRELOADER = {
  minDuration: 1.4,
  exitDuration: 0.9,
} as const;

/**
 * Named z-layers so stacking stays sane.
 * NOTE: `header` sits ABOVE `menu` — the wordmark and the Close toggle must
 * stay visible and clickable while the mobile menu overlay is open.
 */
export const Z = {
  canvas: 0,
  content: 10,
  askPill: 45,
  menu: 50,
  header: 55,
  askPanel: 60,
  preloader: 80,
  /** Route transition sits above page chrome but below the cursor. */
  transition: 90,
  cursor: 100,
} as const;
