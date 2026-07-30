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
 * Hero dot field physics.
 * Each dot is a mass on a spring: cursors push it away, the spring pulls it
 * home. The displacement is what reads as a magnifying bubble under the
 * pointer — see components/canvas/DotField.tsx.
 */
export const FIELD = {
  /** Grid spacing and dot size, in CSS pixels. */
  gap: 24,
  dotRadius: 1.5,
  restColor: "rgba(255, 255, 255, 0.06)",
  /** The visitor's cursor. */
  visitor: { radius: 150, strength: 1.5 },
  /** The collaborator pushes harder and tints what it passes. */
  collab: { radius: 200, strength: 2.5, tint: 0.35 },
  /** Pull back toward the home position, then bleed off velocity. */
  spring: 0.1,
  damping: 0.8,
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
    /** Absolute backstop from mount, in case the reveal signal never lands. */
    dragFailsafe: 6000,
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
    /**
     * The collaborator pointer is a spring, not a lerp: velocity accrues
     * toward the target and is damped each frame. A plain lerp decelerates
     * into every target and feels sluggish by comparison.
     */
    accel: 0.06,
    damping: 0.82,
  },
  drag: {
    /** Beat after release before the layer realigns. */
    settleDelay: 800,
    /**
     * The layer snaps home instantly — measured on the reference, where
     * polling every 60ms across the return captures no intermediate frame:
     * it holds at the dragged position for `settleDelay`, then cuts to
     * origin. (Its 1.2s tween is a no-op: the drag writes style.transform
     * directly, so GSAP's cache still reads 0 and animates 0 → 0.) A real
     * glide here reads as lag, which is exactly how it felt.
     */
    snapSec: 0,
    afterSnap: 1300,
    bubbleDelay: 300,
    bubbleCharMin: 25,
    bubbleCharJitter: 40,
    bubbleHold: 2200,
    /** Chat bubble flips left when the pointer is within this of the edge. */
    flipEdge: 280,
    /** Breathing room kept between the comment and the screen edge. */
    bubbleGutter: 28,
    /** Floor for the comment's width, so it never wraps one letter per line. */
    bubbleMinWidth: 104,
  },
} as const;

/**
 * Hero → Statements camera track.
 * Two stacked artboards inside a pinned, perspective-bearing track; scroll
 * flies a 3D camera from one to the other. Tween values live in HeroDeck —
 * these are the scene-level knobs.
 */
export const DECK = {
  scene: {
    /** Pinned scroll length. */
    end: "+=350%",
    scrub: 1,
    /**
     * Progress at which the flip has landed and the statements begin.
     * Matches the timeline: phase1 (1) + phase2 (1.2) of 6.2 total ≈ 0.36.
     */
    statementsFrom: 0.36,
  },
  flip: {
    /** Resting state of the incoming panel before the camera reaches it. */
    nextFrom: {
      scale: 0.5,
      rotateX: 45,
      rotateZ: -10,
      yPercent: 150,
      z: -500,
    },
  },
} as const;

/**
 * Featured Work cinema deck.
 * Sticky full-viewport cards; the artwork pans inside its frame while the
 * outgoing card recedes. Trigger points live in Work.tsx — these are the
 * values those tweens move to.
 */
export const WORK_DECK = {
  /** Diagonal drift of the oversized artwork inside its frame. */
  pan: { x: "-30%", y: "-12%", scrub: 1.5 },
  /** Entry tilt, in degrees, about the card's top edge. */
  tilt: { from: 2.5 },
  /** Resting state of a card once the next one has taken over. */
  recede: { scale: 0.92, opacity: 0.15, y: -30, blur: 6 },
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
  /**
   * Hard ceiling in ms. If the reveal timeline hasn't finished by now
   * (throttled rAF in a background tab, a stalled device), force it — the
   * site's readiness signal depends on it.
   */
  failsafe: 4500,
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
