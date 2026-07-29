/**
 * Interaction sound — synthesised, not sampled.
 *
 * Three short Web Audio cues stand in for the whole sound design; there are
 * no audio files to download, decode or cache. Each cue is one oscillator
 * through one gain envelope, torn down as soon as it finishes.
 *
 * Sound is reserved for things the visitor *caused*. The hero's idle
 * collaborator performance runs silent by design — see `docs/interaction-spec.md`.
 *
 * Autoplay policy: browsers refuse to start an AudioContext until a user
 * gesture, so `arm()` listens for the first one and resumes the context,
 * then removes itself.
 */

type Ctx = AudioContext | null;

const UNLOCK_EVENTS = [
  "mousedown",
  "touchstart",
  "click",
  "pointerdown",
  "keydown",
] as const;

let ctx: Ctx = null;
let ready = false;
let listening = false;
let muted = false;

function AudioCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ??
    null
  );
}

/** Create the context if needed and resume it if the browser suspended it. */
export function resume(): void {
  const Ctor = AudioCtor();
  if (!Ctor) return;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return;
    }
  }
  if (ctx.state === "suspended") {
    void ctx.resume().then(() => {
      ready = true;
    });
  } else if (ctx.state === "running") {
    ready = true;
  }
}

function onFirstGesture() {
  resume();
  if (ctx && ctx.state === "running") disarm();
}

/** Start listening for the first user gesture so audio can be unlocked. */
export function arm(): void {
  if (listening || typeof window === "undefined") return;
  UNLOCK_EVENTS.forEach((e) =>
    window.addEventListener(e, onFirstGesture, { capture: true, passive: true })
  );
  listening = true;
  resume();
}

export function disarm(): void {
  if (!listening || typeof window === "undefined") return;
  UNLOCK_EVENTS.forEach((e) =>
    window.removeEventListener(e, onFirstGesture, true)
  );
  listening = false;
}

/** Global mute, in case a preference toggle is added later. */
export const setMuted = (value: boolean) => {
  muted = value;
};
export const isMuted = () => muted;

/** Shared plumbing: one oscillator, one gain, scheduled and disposed. */
function voice(
  type: OscillatorType,
  build: (osc: OscillatorNode, gain: GainNode, t0: number) => number
): void {
  if (muted || !ctx || !ready) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    const t0 = ctx.currentTime;
    const stopAt = build(osc, gain, t0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(stopAt);
    // Let the node graph go once it has rung out.
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch {
    /* audio is decorative — never let it break an interaction */
  }
}

/** Snap/confirm: a square blip diving 800 → 50 Hz. Selection landed. */
export function select(): void {
  voice("square", (osc, gain, t0) => {
    osc.frequency.setValueAtTime(800, t0);
    osc.frequency.exponentialRampToValueAtTime(50, t0 + 0.05);
    gain.gain.setValueAtTime(0.3, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
    return t0 + 0.05;
  });
}

/** Keystroke: a 30 ms triangle tick, pitch jittered so runs don't buzz. */
export function tick(): void {
  voice("triangle", (osc, gain, t0) => {
    osc.frequency.setValueAtTime(300 + Math.random() * 300, t0);
    gain.gain.setValueAtTime(0.1, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.03);
    return t0 + 0.03;
  });
}

/** Arrival: a sine sweep 300 → 700 Hz. Something opened. */
export function swoop(): void {
  voice("sine", (osc, gain, t0) => {
    osc.frequency.setValueAtTime(300, t0);
    osc.frequency.exponentialRampToValueAtTime(700, t0 + 0.1);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.15, t0 + 0.02);
    gain.gain.linearRampToValueAtTime(0, t0 + 0.1);
    return t0 + 0.1;
  });
}

export const sfx = { arm, disarm, resume, select, tick, swoop, setMuted, isMuted };
