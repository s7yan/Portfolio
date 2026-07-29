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

/** Cursor physics — lerp factors per frame (0–1). */
export const CURSOR = {
  dotLerp: 0.35,
  tagLerp: 0.16,
  scaleHover: 2.6,
  scaleDown: 0.72,
} as const;

/** Lenis smooth-scroll configuration. */
export const LENIS = {
  duration: 1.15,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
} as const;

/** Preloader timing. */
export const PRELOADER = {
  minDuration: 1.4,
  exitDuration: 0.9,
} as const;

/** Named z-layers so stacking stays sane. */
export const Z = {
  canvas: 0,
  content: 10,
  header: 40,
  askPill: 45,
  menu: 50,
  askPanel: 60,
  preloader: 80,
  cursor: 100,
} as const;
