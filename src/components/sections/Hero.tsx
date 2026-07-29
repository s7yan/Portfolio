"use client";

/**
 * Scene 01 — Hero canvas.
 * - Interactive dot-field artboard
 * - Two-line display name: solid + outline, inside a dashed selection
 *   frame that is genuinely draggable (inertia + live dx/dy readout)
 * - Inspector chips, drifting collaborator cursor
 * - Intro choreography fires on the preloader's `site:ready` event
 */
import { useEffect, useRef, useState } from "react";
import { gsap, Draggable, useGSAP } from "@/lib/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { site } from "@/content/site";
import { SITE_READY_EVENT } from "@/components/preloader/Preloader";
import { DotField } from "@/components/canvas/DotField";
import { CollabCursor } from "@/components/ui/CollabCursor";

export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<HTMLDivElement | null>(null);
  const collabRef = useRef<HTMLDivElement | null>(null);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  /* ── Intro choreography ─────────────────────────────────────────── */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduced = prefersReducedMotion();
      const pieces = root.querySelectorAll("[data-hero-rise] .mask-inner");
      const chips = root.querySelectorAll("[data-hero-chip]");

      if (reduced) return; // everything is visible by default

      gsap.set(pieces, { yPercent: 115, rotate: 0.6 });
      gsap.set(chips, { autoAlpha: 0, y: 8 });

      const intro = () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        tl.to(pieces, {
          yPercent: 0,
          rotate: 0,
          duration: DUR.lg,
          stagger: STAGGER.lines,
        });
        tl.to(
          chips,
          { autoAlpha: 1, y: 0, duration: DUR.md, stagger: STAGGER.items },
          "-=0.55"
        );
      };

      // Fire with the preloader wipe (or immediately if it already passed)
      document.addEventListener(SITE_READY_EVENT, intro, { once: true });
      return () => document.removeEventListener(SITE_READY_EVENT, intro);
    },
    { scope: rootRef }
  );

  /* ── Draggable name with inertia + live readout ─────────────────── */
  useEffect(() => {
    const el = dragRef.current;
    if (!el || prefersReducedMotion()) return;

    const drag = Draggable.create(el, {
      type: "x,y",
      inertia: true,
      edgeResistance: 0.72,
      bounds: rootRef.current ?? undefined,
      onPress: () => setDragging(true),
      onRelease: () => setDragging(false),
      onDrag() {
        setDelta({ x: Math.round(this.x), y: Math.round(this.y) });
      },
      onThrowUpdate() {
        setDelta({ x: Math.round(this.x), y: Math.round(this.y) });
      },
    })[0];

    return () => {
      drag?.kill();
    };
  }, []);

  /* ── Collaborator cursor drift ──────────────────────────────────── */
  useGSAP(
    () => {
      const el = collabRef.current;
      if (!el || prefersReducedMotion()) return;
      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: 2.2 });
      tl.fromTo(
        el,
        { x: 0, y: 0 },
        { x: -46, y: 30, duration: 3.4, ease: "sine.inOut" }
      ).to(el, { x: 24, y: -14, duration: 4.1, ease: "sine.inOut" });
      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      <DotField />

      {/* Eyebrow */}
      <div className="relative z-10 mx-auto mt-[26vh] flex flex-col items-center px-[4vw] text-center md:mt-[24vh]">
        <p
          data-hero-rise
          className="mask mono-label !text-[0.58rem] !tracking-[0.2em] text-ink-dim md:!text-[0.72rem] md:!tracking-[0.34em]"
        >
          <span className="mask-inner">{site.hero.eyebrow}</span>
        </p>

        {/* Draggable name block */}
        <div
          ref={dragRef}
          className="relative mt-7 touch-none select-none will-change-transform"
          data-cursor-label="Drag"
        >
          {/* DRAG TO MOVE chip */}
          <span
            data-hero-chip
            className="chip chip--ink absolute -top-4 left-1/2 z-10 -translate-x-1/2"
          >
            DRAG TO MOVE
          </span>

          <div className="selection-frame px-[4vw] py-[1.5vw] md:px-14">
            <span className="handle" aria-hidden="true" />
            <h1 className="display text-[clamp(4.5rem,17vw,15rem)] leading-[0.88] text-ink">
              <span data-hero-rise className="mask">
                <span className="mask-inner">{site.firstName}</span>
              </span>
              <span data-hero-rise className="mask">
                <span className="mask-inner display-outline">{site.lastName}</span>
              </span>
            </h1>
          </div>

          {/* Live inspector readout while dragging */}
          <span
            className="chip chip--ghost absolute -bottom-9 left-1/2 -translate-x-1/2 transition-opacity duration-200"
            style={{ opacity: dragging ? 1 : 0 }}
            aria-hidden="true"
          >
            dx: {delta.x}, dy: {delta.y}
          </span>

          {/* Drifting collaborator */}
          <CollabCursor
            ref={collabRef}
            name={site.name}
            className="top-[68%] right-[-8%] hidden md:block"
          />
        </div>

        {/* Badge chip */}
        <span data-hero-chip className="chip chip--violet mt-16 md:mt-20">
          ✦ {site.hero.badge}
        </span>
      </div>

      {/* Tagline at the fold (clears the Ask pill) */}
      <div className="relative z-10 mt-auto px-[4vw] pb-32 md:pb-28">
        <p
          data-hero-rise
          className="mask mx-auto max-w-4xl text-center font-sans text-[clamp(1.2rem,2.6vw,2.1rem)] font-light text-ink-dim"
        >
          <span className="mask-inner">{site.hero.tagline}</span>
        </p>
      </div>
    </section>
  );
}
