"use client";

/**
 * Scene 03 — Worked With.
 * Mono-labeled two-column table; giant row names rise in with stagger;
 * rows invert (off-white flash) on hover.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { partners } from "@/content/partners";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SceneIndex } from "@/components/ui/SceneIndex";

export function Partners() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rootRef.current) return;
      gsap.fromTo(
        rootRef.current.querySelectorAll("[data-row]"),
        { autoAlpha: 0, y: 42 },
        {
          autoAlpha: 1,
          y: 0,
          duration: DUR.md,
          ease: EASE.out,
          stagger: STAGGER.rows,
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      aria-label="Brands worked with"
      className="relative px-[4vw] py-[18vh]"
    >
      <SceneIndex index="03" className="mb-10" />

      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading solid="WORKED" outline="WITH" />
        <p className="mono-label">AUTOMOTIVE · ENTERPRISE · CONSUMER</p>
      </div>

      <table className="w-full border-collapse" role="table">
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="mono-label pb-4 text-left font-normal">
              PARTNER
            </th>
            <th scope="col" className="mono-label pb-4 text-right font-normal">
              SECTOR
            </th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr
              key={p.name}
              data-row
              className="row-invert border-b border-line"
            >
              <td className="display py-6 text-[clamp(1.6rem,5vw,3.8rem)] md:py-8">
                {p.name}
              </td>
              <td className="mono-label text-right">{p.sector}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
