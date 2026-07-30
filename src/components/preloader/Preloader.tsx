"use client";

/**
 * Boot sequence — an instrument-cluster HUD coming online.
 *
 * Staged so the interface assembles itself rather than appearing:
 *
 *   01 wake        ambience rises out of black
 *   02 construct   chevron corners trace, then edges, then inner strokes
 *   03 initialize  ticks, brackets and gauges activate in sequence
 *   04 diagnostics light sweeps run the edges
 *   05 core        the counter and boot messages take the centre
 *   06 sync        gauge segments and frame brightness track the counter
 *   07 confirm     everything peaks, holds, then dissolves into the hero
 *
 * The rest of the site waits on `markReady()`, which fires as the dissolve
 * begins so the hero's own reveal overlaps the HUD's exit rather than
 * following it — the loader hands over instead of ending.
 *
 * Repeat visits in the same session get an abbreviated run; nobody wants
 * the full boot on every navigation back to the homepage.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { BOOT, PRELOADER, Z } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { bootMessages, bootWelcome, bootGauges, bootStatus } from "@/content/boot";
import { HudFrame } from "./HudFrame";

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
  if (siteReady) return;
  siteReady = true;
  document.dispatchEvent(new CustomEvent(SITE_READY_EVENT));
}

const SEEN_KEY = "sd:boot-seen";

export function Preloader() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pctRef = useRef<HTMLSpanElement | null>(null);
  const msgRef = useRef<HTMLSpanElement | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Reduced motion: no boot theatre at all.
    if (prefersReducedMotion()) {
      markReady();
      setDone(true);
      return;
    }

    const replay =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(SEEN_KEY) === "1";
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode — just play the full sequence */
    }
    // Abbreviated re-runs keep the same choreography, only faster.
    const k = replay ? BOOT.replayScale : 1;

    document.documentElement.classList.add("lenis-stopped");

    const q = gsap.utils.selector(root);
    const apex = q("[data-apex]");
    const edges = q("[data-edge]");
    const inner = q("[data-inner]");
    const micro = q("[data-micro]");
    const sweeps = q("[data-sweep]");
    const bars = q("[data-bar]");

    // Pre-state: geometry undrawn, instruments dark.
    gsap.set([...apex, ...edges, ...inner], {
      strokeDasharray: 1,
      strokeDashoffset: 1,
    });
    gsap.set([...micro, ...bars], { opacity: 0 });
    gsap.set(sweeps, { opacity: 0, strokeDasharray: "0.12 0.88", strokeDashoffset: 1 });
    gsap.set(q(".hud-core"), { opacity: 0 });
    gsap.set(q(".hud-status"), { opacity: 0 });
    gsap.set(q(".hud-gauge-label"), { opacity: 0 });

    const counter = { v: 0 };
    let messageIndex = -1;

    /** Swap the boot message, letting CSS handle the fade. */
    const showMessage = (label: string) => {
      const el = msgRef.current;
      if (!el || el.textContent === label) return;
      el.classList.remove("is-in");
      // next frame, so the transition restarts from the faded state
      requestAnimationFrame(() => {
        el.textContent = label;
        el.classList.add("is-in");
      });
    };

    const renderCounter = () => {
      const v = counter.v;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(v)}`;

      // Boot message takes over at its threshold, crossfading in.
      let next = 0;
      for (let i = 0; i < bootMessages.length; i++) {
        if (v >= bootMessages[i].at) next = i;
      }
      if (next !== messageIndex) {
        messageIndex = next;
        // Crossfade via CSS rather than a tween spawned inside onUpdate:
        // nested tweens don't render when the parent timeline is seeked or
        // paused, and this runs on every frame of the counter.
        showMessage(bootMessages[next].label);
      }

      // Stage 06 — instruments track the counter.
      const lit = Math.round((v / 100) * bars.length);
      bars.forEach((bar, i) => {
        bar.style.opacity = i < lit ? "1" : "0.12";
      });
      root.style.setProperty("--hud-lift", String(0.55 + (v / 100) * 0.45));
    };

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove("lenis-stopped");
        setDone(true);
      },
    });

    /* 01 — wake */
    tl.to(q(".hud-ambience"), { opacity: 1, duration: BOOT.wake * k });

    /* 02 — construct: corners, then edges, then the inner trace */
    tl.to(
      apex,
      {
        strokeDashoffset: 0,
        duration: BOOT.apex * k,
        stagger: BOOT.apexStagger * k,
        ease: "power2.inOut",
      },
      `-=${0.2 * k}`
    );
    tl.to(
      edges,
      {
        strokeDashoffset: 0,
        duration: BOOT.edge * k,
        stagger: BOOT.edgeStagger * k,
        ease: "power2.out",
      },
      `-=${0.28 * k}`
    );
    tl.to(
      inner,
      {
        strokeDashoffset: 0,
        duration: BOOT.inner * k,
        stagger: BOOT.innerStagger * k,
        ease: "power2.out",
      },
      `-=${0.34 * k}`
    );

    /* 03 — instruments activate one after another */
    tl.to(
      micro,
      {
        opacity: 1,
        duration: BOOT.micro * k,
        stagger: BOOT.microStagger * k,
        ease: "none",
      },
      `-=${0.3 * k}`
    );
    tl.to(
      q(".hud-gauge-label"),
      { opacity: 1, duration: 0.3 * k, stagger: 0.06 * k },
      "<"
    );

    /* 04 — diagnostics: sweeps run the edges */
    tl.to(sweeps, { opacity: 1, duration: 0.2 * k }, `-=${0.2 * k}`);
    tl.to(
      sweeps,
      {
        strokeDashoffset: -1,
        duration: 1.1 * k,
        ease: "power1.inOut",
        stagger: 0.12 * k,
      },
      "<"
    );

    /* 05 — core: counter + boot messages, overlapping the diagnostics so the
       cluster is still settling as the count begins */
    tl.to(q(".hud-core"), { opacity: 1, duration: 0.4 * k }, `-=${1.0 * k}`);
    tl.to(q(".hud-status"), { opacity: 1, duration: 0.4 * k }, "<");
    tl.to(
      counter,
      {
        v: 100,
        duration: BOOT.counter * k,
        ease: "power2.inOut",
        onUpdate: renderCounter,
      },
      `-=${0.25 * k}`
    );

    /* 07 — confirm: peak, swap to WELCOME, hold, dissolve */
    tl.to(root, {
      "--hud-peak": 1,
      duration: BOOT.flash * k,
      ease: "power2.out",
    });
    tl.call(() => showMessage(bootWelcome));
    tl.to(root, { "--hud-peak": 0, duration: 0.4 * k }, ">");
    tl.to({}, { duration: BOOT.hold * k });

    // Hand over: the hero begins revealing as the HUD dissolves.
    tl.to(root, {
      opacity: 0,
      filter: "blur(6px)",
      duration: BOOT.dissolve * k,
      ease: "power2.inOut",
      onStart: markReady,
    });

    /**
     * Dev-only inspection. A boot sequence is only a few seconds long and
     * can't be paused from outside, which makes reviewing any single stage
     * a race. `?boot=slow` stretches it; `?boot=hold&at=0.45` freezes it at
     * a progress point. Neither ships to production.
     */
    if (process.env.NODE_ENV !== "production") {
      const mode = new URLSearchParams(window.location.search).get("boot");
      if (mode === "slow") tl.timeScale(0.25);
      if (mode === "hold") {
        const at = Number(
          new URLSearchParams(window.location.search).get("at") ?? 0.5
        );
        // progress(v, false) renders WITH callbacks — pause(time) suppresses
        // them, which would leave the counter and messages unrendered.
        tl.progress(Math.max(0, Math.min(1, at)), false);
        tl.pause();
        return () => {
          tl.kill();
          document.documentElement.classList.remove("lenis-stopped");
        };
      }
    }

    /**
     * Safety net. The whole site waits on the readiness signal this timeline
     * emits, and rAF stops in background tabs — a visitor who opens the site
     * in one could otherwise return to a HUD that never lifts.
     *
     * Derived from the timeline rather than fixed: the sequence is assembled
     * from staged, overlapping tweens, so hard-coding a ceiling means any
     * pacing change can silently start truncating the boot.
     */
    const failsafe = window.setTimeout(
      () => {
        if (tl.progress() < 1) {
          tl.kill();
          document.documentElement.classList.remove("lenis-stopped");
          markReady();
          setDone(true);
        }
      },
      tl.duration() * 1000 + PRELOADER.failsafeMargin
    );

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
      className="hud-root"
      style={{ zIndex: Z.preloader }}
      role="status"
      aria-label="Loading"
    >
      {/* 01 — ambience: scanlines, grain, bloom */}
      <div className="hud-ambience" aria-hidden="true">
        <div className="hud-scanlines" />
        <div className="hud-grain" />
        <div className="hud-bloom" />
      </div>

      <HudFrame />

      {/* gauge units, as on a cluster */}
      <span className="hud-gauge-label hud-gauge-label--left" aria-hidden="true">
        {bootGauges.left}
      </span>
      <span className="hud-gauge-label hud-gauge-label--right" aria-hidden="true">
        {bootGauges.right}
      </span>

      {/* 05 — central core */}
      <div className="hud-core" aria-hidden="true">
        <div className="hud-readout">
          <span ref={pctRef} className="hud-pct">
            0
          </span>
          <span className="hud-pct-unit">%</span>
        </div>
        <span ref={msgRef} className="hud-message" />
      </div>

      {/* bottom status strip */}
      <div className="hud-status" aria-hidden="true">
        <span>{bootStatus.left}</span>
        <span className="hud-status-centre">
          <em>{bootStatus.centreLabel}</em> {bootStatus.centreValue}
        </span>
        <span>{bootStatus.right}</span>
      </div>
    </div>
  );
}
