// Cinematic intro orchestrator.
// Drives the shader's progress 0 → 1 via a GSAP timeline, dispatches
// `intro-complete` for downstream reveal logic, then disposes.

import gsap from 'gsap';
import { createIntroRenderer } from './canvas.js';

// Timeline: shader progress runs 0 → 1 over INTRO_DURATION. Around the
// HANDOFF_AT point the scene is at its peak — we fire `intro-complete` there
// so the hero starts revealing while the canvas is still visible. The canvas
// then crossfades to 0 across the hero's blur-to-sharp window, so the liquid
// physically dissolves into the hero rather than cutting to a gap.
const INTRO_DURATION = 2.6;
const HANDOFF_AT     = 0.50;  // % of timeline where hero reveal starts
const FADE_OUT_DUR   = 1.10;  // canvas opacity 1 → 0 (overlaps hero reveal)

function emit() {
  document.dispatchEvent(new CustomEvent('intro-complete'));
}

export function runIntro() {
  // Guard against re-entry (HMR, double script load) — one intro per page
  if (window.__introStarted) return Promise.resolve();
  window.__introStarted = true;

  const canvas = document.getElementById('introCanvas');
  if (!canvas) { emit(); return Promise.resolve(); }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    document.documentElement.classList.remove('intro-active');
    emit();
    return Promise.resolve();
  }

  document.documentElement.classList.add('intro-active');

  const renderer = createIntroRenderer(canvas);
  if (!renderer.ok) {
    canvas.remove();
    document.documentElement.classList.remove('intro-active');
    emit();
    return Promise.resolve();
  }

  renderer.start();

  return new Promise((resolve) => {
    let handoffFired = false;

    const tl = gsap.timeline({
      onComplete: () => {
        renderer.stop();
        renderer.dispose();
        canvas.style.display = 'none';
        document.documentElement.classList.remove('intro-active');
        resolve();
      },
    });

    // Drive shader progress 0 → 1
    const proxy = { p: 0 };
    tl.to(proxy, {
      p: 1,
      duration: INTRO_DURATION,
      ease: 'power1.inOut',
      onUpdate: () => {
        renderer.setProgress(proxy.p);
        if (!handoffFired && proxy.p >= HANDOFF_AT) {
          handoffFired = true;
          // Hero starts revealing NOW; intro keeps rendering + crossfades out
          emit();
          // Allow page interactions immediately so hero feels live
          document.documentElement.classList.remove('intro-active');
        }
      },
    });

    // Canvas opacity crossfade — begins at handoff, lasts FADE_OUT_DUR
    tl.to(canvas, {
      opacity: 0,
      duration: FADE_OUT_DUR,
      ease: 'power2.inOut',
    }, INTRO_DURATION * HANDOFF_AT);
  });
}
