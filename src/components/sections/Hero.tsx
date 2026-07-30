"use client";

/**
 * Scene 01 — Hero design surface.
 *
 * The name is a two-layer design file: each line is an independently
 * draggable layer wearing design-tool chrome (selection frames, layer
 * chips, a DRAG TO MOVE affordance). A scripted collaborator edits the
 * layers live and reacts when the visitor drags one out of place.
 *
 * All choreography lives in `useHeroChoreography`; this component owns
 * the markup, the intro reveal, and the interactive dot-field.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { HERO, EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { site } from "@/content/site";
import { heroScene } from "@/content/hero";
import { onSiteReady } from "@/components/preloader/Preloader";
import { DotField } from "@/components/canvas/DotField";
import { CollabPointer } from "@/components/hero/CollabPointer";
import { DragReadout } from "@/components/hero/DragReadout";
import { useHeroChoreography } from "@/components/hero/useHeroChoreography";

export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const firstRef = useRef<HTMLDivElement | null>(null);
  const lastRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const leaderRef = useRef<SVGPathElement | null>(null);
  const deltaRef = useRef<HTMLDivElement | null>(null);

  const c = useHeroChoreography({
    root: rootRef,
    first: firstRef,
    last: lastRef,
    subtitle: subtitleRef,
    pointer: pointerRef,
    marquee: marqueeRef,
    leader: leaderRef,
    delta: deltaRef,
  });

  /* ── Intro reveal ── */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      const lines = root.querySelectorAll<HTMLElement>(".layer-text");
      const eyebrow = root.querySelector(".hero-eyebrow");
      const subtitle = root.querySelector(".hero-subtitle");

      gsap.set(lines, { yPercent: 110 });
      gsap.set([eyebrow, subtitle], { autoAlpha: 0 });

      const intro = () => {
        gsap.to(eyebrow, {
          autoAlpha: 1,
          duration: HERO.intro.eyebrowSec,
          delay: HERO.intro.eyebrowDelaySec,
        });
        gsap.to(lines, {
          yPercent: 0,
          duration: HERO.intro.lineSec,
          ease: EASE.out,
          delay: HERO.intro.lineDelaySec,
          stagger: HERO.intro.lineStaggerSec,
          onComplete: () => {
            // Masks must stop clipping once the layers become draggable,
            // otherwise a dragged line gets cut off by its own mask.
            root
              .querySelectorAll<HTMLElement>(".layer-mask")
              .forEach((m) => (m.style.overflow = "visible"));
          },
        });
        gsap.to(subtitle, {
          autoAlpha: 1,
          duration: HERO.intro.subtitleSec,
          delay: HERO.intro.subtitleDelaySec,
        });
      };

      return onSiteReady(intro);
    },
    { scope: rootRef }
  );

  /** Chip text for a layer: the affordance when focused, else its layer name. */
  const chipFor = (which: "first" | "last") =>
    c.states[which] === "focus" ? heroScene.dragLabel : c.labels[which];

  return (
    <section
      ref={rootRef}
      id="hero"
      aria-label="Introduction"
      className="hero relative flex min-h-svh flex-col overflow-hidden"
    >
      <DotField />

      {/* Vertically centred in the artboard, as on the reference */}
      <div className="relative z-10 mx-auto flex h-full flex-col items-center justify-center px-[4vw] text-center">
        <p className="hero-eyebrow">
          {heroScene.eyebrow}
        </p>

        {/* Accessible name — the visual layers below are decorative chrome */}
        <h1 className="sr-only">
          {site.name} — {site.role}
        </h1>

        <div className="hero-layers" aria-hidden="true">
          {(["first", "last"] as const).map((which) => (
            <div
              key={which}
              ref={which === "first" ? firstRef : lastRef}
              className="layer"
              data-state={c.states[which]}
              data-variant={which}
              onPointerDown={c.onLayerPointerDown(which)}
              onPointerEnter={() => c.onLayerEnter(which)}
              onPointerLeave={c.onLayerLeave}
            >
              <span className="layer-chip">{chipFor(which)}</span>
              <span className="layer-mask">
                <span className="layer-text display">
                  {which === "first" ? heroScene.firstName : heroScene.lastName}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Subtitle — retyped live by the collaborator */}
        <div
          className="layer layer--subtitle"
          data-state={c.states.subtitle}
          aria-hidden="true"
        >
          <span className="layer-chip">{c.labels.subtitle}</span>
          <p ref={subtitleRef} className="hero-subtitle">
            {c.subtitleText}
            {c.states.subtitle === "editing" && <span className="ghost-caret" />}
          </p>
        </div>
        {/* Stable copy for assistive tech (the animated one is decorative) */}
        <p className="sr-only">{heroScene.subtitleFinal}</p>
      </div>

      {/* Rubber-band selection sweep */}
      <div ref={marqueeRef} className="hero-marquee" aria-hidden="true" />

      {/* Drag telemetry + collaborator presence */}
      <DragReadout ref={deltaRef} active={c.dragActive} lineRef={leaderRef} />
      <CollabPointer
        ref={pointerRef}
        name={heroScene.collabName}
        visible={c.collabVisible}
        status={c.collabStatus}
        message={c.collabMessage}
        flipped={c.bubbleFlipped}
      />
    </section>
  );
}
