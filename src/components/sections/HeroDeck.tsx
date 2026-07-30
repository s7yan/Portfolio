"use client";

/**
 * Hero → Statements: the camera-track scene.
 *
 * Hero and the statements panel are two absolutely-stacked artboards inside
 * a pinned, perspective-bearing track. One ScrollTrigger owns the whole
 * sequence, and scroll progress steps through four phases:
 *
 *   0   → .36   the camera flip — hero recedes into a card and tumbles
 *               away as the panel rises and lands flat
 *   .36 → .50   the collaborator annotates the scene counter, cycling
 *               three property edits
 *   .50 → .54   those annotations fade out
 *   .54 → .88   the statement types
 *   .88 → 1     hold
 *
 * The annotation chrome (selection frame, cursor, property readout) is a
 * single set of elements repositioned between phases — from the counter to
 * the statement — and driven straight to the DOM, so scrubbing never costs
 * a React render.
 */
import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DECK } from "@/lib/motion";
import { heroScene } from "@/content/hero";
import { Hero } from "@/components/sections/Hero";
import { StatementsStage } from "@/components/sections/StatementsStage";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function HeroDeck() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  /* Annotation chrome */
  const selRef = useRef<HTMLDivElement | null>(null);
  const selLabelRef = useRef<HTMLSpanElement | null>(null);
  const acRef = useRef<HTMLDivElement | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const toastPropRef = useRef<HTMLSpanElement | null>(null);
  const toastValRef = useRef<HTMLSpanElement | null>(null);

  /** 0→1 across the typing phase only. */
  const [typing, setTyping] = useState(0);

  /** Wrap the frame around an element, in viewport coordinates. */
  const frame = useCallback((el: Element | null, pad: number) => {
    const sel = selRef.current;
    if (!sel || !el) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return false;
    sel.style.transform = `translate3d(${r.left - pad}px, ${r.top - pad}px, 0)`;
    sel.style.width = `${r.width + pad * 2}px`;
    sel.style.height = `${r.height + pad * 2}px`;
    return true;
  }, []);

  const setOpacity = useCallback((value: number) => {
    if (selRef.current) selRef.current.style.opacity = String(value);
    if (acRef.current) acRef.current.style.opacity = String(value);
    if (toastRef.current) toastRef.current.style.opacity = String(value);
  }, []);

  const place = useCallback((el: HTMLElement | null, x: number, y: number) => {
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  useGSAP(
    () => {
      const track = trackRef.current;
      const hero = heroRef.current;
      const next = nextRef.current;
      if (!track || !hero || !next || reduced) return;

      const { flip, scene } = DECK;

      // Incoming panel waits below and behind the camera.
      gsap.set(next, {
        scale: flip.nextFrom.scale,
        rotateX: flip.nextFrom.rotateX,
        rotateZ: flip.nextFrom.rotateZ,
        yPercent: flip.nextFrom.yPercent,
        z: flip.nextFrom.z,
        opacity: 0,
        borderRadius: "32px",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: scene.end,
          scrub: scene.scrub,
          pin: true,
          onUpdate: (self) => {
            const p = self.progress;
            const counter = next.querySelector(".statements-counter");
            const text = next.querySelector(".statements-text");

            /* ── the flip: nothing annotated yet ── */
            if (p < scene.flipEnds) {
              setOpacity(0);
              setTyping(0);
              return;
            }

            /* ── the collaborator marks up the counter ── */
            if (p < scene.annotateEnds) {
              setTyping(0);
              const t = (p - scene.flipEnds) / (scene.annotateEnds - scene.flipEnds);
              const edits = heroScene.counter.edits;
              // Three edits, evenly split across the phase
              const edit = edits[Math.min(edits.length - 1, Math.floor(t * edits.length))];

              if (frame(counter, 6)) setOpacity(1);
              if (selLabelRef.current)
                selLabelRef.current.textContent = heroScene.counter.layer;
              if (toastPropRef.current) toastPropRef.current.textContent = edit.key;
              if (toastValRef.current) toastValRef.current.textContent = edit.value;

              if (counter) {
                const r = counter.getBoundingClientRect();
                place(acRef.current, r.right + 12, r.top - 4);
                place(toastRef.current, r.right + 40, r.top - 36);
              }
              return;
            }

            /* ── annotations fade out ── */
            if (p < scene.typingFrom) {
              setTyping(0);
              const o = 1 - Math.min(1, (p - scene.annotateEnds) / scene.annotateFade);
              setOpacity(o);
              return;
            }

            /* ── the statement types; chrome follows the text ── */
            const t = Math.min(
              1,
              (p - scene.typingFrom) / (scene.typingEnds - scene.typingFrom)
            );
            setTyping(t);

            const mid = t > 0 && p < scene.typingEnds;
            if (mid && frame(text, 6)) {
              setOpacity(1);
              if (selLabelRef.current)
                selLabelRef.current.textContent = heroScene.statementLayer;
              if (toastPropRef.current)
                toastPropRef.current.textContent = heroScene.edits.content.key;
              if (toastValRef.current)
                toastValRef.current.textContent = heroScene.edits.content.value;
              if (text) {
                const r = text.getBoundingClientRect();
                place(acRef.current, r.right - 60, r.bottom + 16);
                place(
                  toastRef.current,
                  Math.min(r.right - 40, window.innerWidth - 220),
                  r.bottom + 12
                );
              }
            } else {
              setOpacity(0);
            }
          },
        },
      });

      // phase 1 — hero becomes a card, incoming panel rises behind it
      tl.to(
        hero,
        {
          scale: 0.6,
          rotateX: 45,
          rotateZ: -10,
          yPercent: -15,
          borderRadius: "32px",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.8), 0 0 0 2px rgba(167, 139, 250, 0.6)",
          duration: 1,
        },
        "phase1"
      );
      tl.to(next, { yPercent: 15, opacity: 0.5, z: -200, duration: 1 }, "phase1");

      // phase 2 — hero flies off, panel settles flat
      tl.to(hero, { yPercent: -150, z: 500, opacity: 0, duration: 1.2 }, "phase2");
      tl.to(
        next,
        {
          scale: 1,
          rotateX: 0,
          rotateZ: 0,
          yPercent: 0,
          z: 0,
          opacity: 1,
          borderRadius: "0px",
          boxShadow: "none",
          duration: 1.2,
          ease: "power3.inOut",
        },
        "phase2"
      );

      // Hold the pin while the counter is annotated and the statement types.
      tl.to({}, { duration: 4 });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: trackRef, dependencies: [reduced] }
  );

  /* Reduced motion: plain stacked sections, no camera, no pin. */
  if (reduced) {
    return (
      <>
        <Hero />
        <section
          aria-label="Design philosophy"
          className="relative flex min-h-svh flex-col items-center justify-center"
        >
          <StatementsStage typing={1} reduced />
        </section>
      </>
    );
  }

  return (
    <div ref={trackRef} className="camera-track">
      <div ref={heroRef} className="artboard hero-artboard">
        <Hero />
      </div>

      <div
        ref={nextRef}
        className="artboard intro-artboard"
        aria-label="Design philosophy"
      >
        <StatementsStage typing={typing} reduced={false} />
      </div>

      {/* Shared annotation chrome — moved between the counter and the text */}
      <div ref={selRef} className="ia-asel" aria-hidden="true">
        <span ref={selLabelRef} className="ia-asel-lbl" />
        <span className="ia-asel-handle tl" />
        <span className="ia-asel-handle tr" />
        <span className="ia-asel-handle bl" />
        <span className="ia-asel-handle br" />
      </div>

      <div ref={acRef} className="ia-ac" aria-hidden="true">
        <svg width="16" height="20" viewBox="0 0 14 18" fill="none">
          <path d="M0.5 0.5L13 10.5H5.5L2.5 17.5L0.5 0.5Z" fill="var(--color-violet-soft)" />
        </svg>
        <span className="ia-ac-tag">{heroScene.collabName}</span>
      </div>

      <div ref={toastRef} className="ia-toast" aria-hidden="true">
        <div className="ia-toast-inner">
          <span ref={toastPropRef} className="ia-toast-prop" />
          <span className="ia-toast-arrow">→</span>
          <span ref={toastValRef} className="ia-toast-val" />
        </div>
      </div>
    </div>
  );
}
