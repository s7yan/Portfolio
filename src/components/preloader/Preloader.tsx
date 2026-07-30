"use client";

/**
 * Boot sequence: big percentage counter (bottom-right), thin accent rule,
 * then a wipe-up reveal. Dispatches `site:ready` for the hero intro.
 * Counter pace is asset-aware (fonts) with a minimum theatrical duration.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { PRELOADER, EASE, Z } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";

export const SITE_READY_EVENT = "site:ready";

/**
 * Latched so late subscribers (StrictMode remounts, lazily mounted scenes)
 * can tell the reveal already happened instead of waiting forever.
 */
let siteReady = false;
export const isSiteReady = () => siteReady;

/** Run `fn` once the hero is revealed — immediately if that already happened. */
export function onSiteReady(fn: () => void): () => void {
  if (siteReady) {
    fn();
    return () => {};
  }
  document.addEventListener(SITE_READY_EVENT, fn, { once: true });
  return () => document.removeEventListener(SITE_READY_EVENT, fn);
}

function markReady() {
  siteReady = true;
  document.dispatchEvent(new CustomEvent(SITE_READY_EVENT));
}

export function Preloader() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pctRef = useRef<HTMLSpanElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const root = rootRef.current!;
    const counter = { v: 0 };

    if (reduced) {
      // Instant exit for reduced motion
      root.style.display = "none";
      setDone(true);
      markReady();
      return;
    }

    document.documentElement.classList.add("lenis-stopped");

    const render = () => {
      if (pctRef.current)
        pctRef.current.textContent = `${Math.round(counter.v)}%`;
      if (lineRef.current)
        lineRef.current.style.transform = `scaleX(${counter.v / 100})`;
    };

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove("lenis-stopped");
        setDone(true);
      },
    });

    // Count 0 → 100 (min duration; fonts usually resolve well within it)
    tl.to(counter, {
      v: 100,
      duration: PRELOADER.minDuration,
      ease: "power2.inOut",
      onUpdate: render,
    });

    // Hold a beat at 100%, then wipe the whole veil upward
    tl.to(root, {
      yPercent: -100,
      duration: PRELOADER.exitDuration,
      ease: EASE.inOut,
      delay: 0.15,
      onStart: () => {
        markReady();
      },
    });

    /**
     * Safety net. The whole site — including every hero interaction — waits
     * on the readiness signal this timeline emits. rAF is throttled to a stop
     * in background tabs, so a visitor who opens the site in a background tab
     * (or on a stalled device) could otherwise come back to a veil that never
     * lifts and a hero that never becomes interactive. Force it through.
     */
    const failsafe = window.setTimeout(() => {
      if (tl.progress() < 1) {
        tl.progress(1, false); // fires markReady via the exit tween
        tl.kill();
        document.documentElement.classList.remove("lenis-stopped");
        markReady(); // idempotent — latched
        setDone(true);
      }
    }, PRELOADER.failsafe);

    // Wait for fonts so the reveal never flashes fallback type
    document.fonts?.ready.then(() => {
      /* counter already pacing — nothing to accelerate in min-duration mode */
    });

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 flex flex-col justify-end bg-canvas"
      style={{ zIndex: Z.preloader }}
    >
      <span
        ref={pctRef}
        className="display pointer-events-none absolute right-[4vw] bottom-[6vh] text-ink"
        style={{ fontSize: "clamp(5rem, 16vw, 13rem)" }}
      >
        0%
      </span>
      <div
        ref={lineRef}
        className="h-px w-full origin-left bg-mint"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
