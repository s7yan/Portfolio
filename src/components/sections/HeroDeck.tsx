"use client";

/**
 * Hero → Statements: the camera-track card flip.
 *
 * Hero and the statements scene are two absolutely-stacked artboards inside
 * a pinned, perspective-bearing track. Scrolling flies a 3D camera between
 * them: the hero recedes into a rounded, violet-ringed card while the next
 * panel rises beneath it, then the hero card tumbles up and away as the
 * panel lands flat.
 *
 * One ScrollTrigger owns the whole scene (pin + flip + the statements that
 * type afterwards) — see docs/interaction-spec.md for the extracted table.
 *
 * Reduced motion: no pin, no flip; both panels are laid out in normal flow
 * and the statements render complete.
 */
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DECK } from "@/lib/motion";
import { Hero } from "@/components/sections/Hero";
import { StatementsStage } from "@/components/sections/StatementsStage";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function HeroDeck() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  /** 0→1 across the statements portion of the pinned scene. */
  const [stageProgress, setStageProgress] = useState(0);

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
            // Statements begin once the flip has fully landed.
            const p = self.progress;
            const t =
              p <= scene.statementsFrom
                ? 0
                : (p - scene.statementsFrom) / (1 - scene.statementsFrom);
            setStageProgress(t);
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
      tl.to(
        hero,
        { yPercent: -150, z: 500, opacity: 0, duration: 1.2 },
        "phase2"
      );
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

      // Hold the pin while the statements type.
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
          <StatementsStage progress={1} reduced />
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
        <StatementsStage progress={stageProgress} reduced={false} />
      </div>
    </div>
  );
}
