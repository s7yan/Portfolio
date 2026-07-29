"use client";

/**
 * Scene 06 — Experience.
 * Table-language rows: period / role / company / summary, with the
 * same rise-and-stagger entrance as the partners table.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { experience } from "@/content/experience";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SceneIndex } from "@/components/ui/SceneIndex";

export function Experience() {
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
            start: "top 72%",
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
      id="experience"
      aria-label="Experience"
      className="relative px-[4vw] py-[16vh]"
    >
      <SceneIndex index="06" className="mb-10" />
      <div className="mb-14">
        <SectionHeading solid="THE PATH" outline="SO FAR" />
      </div>

      <ol className="border-t border-line">
        {experience.map((entry) => (
          <li
            key={entry.company}
            data-row
            className="grid grid-cols-1 gap-4 border-b border-line py-10 md:grid-cols-[1fr_2fr_2fr]"
          >
            <p className="mono-label pt-1">{entry.period}</p>
            <div>
              <h3 className="font-sans text-2xl font-medium text-ink">
                {entry.role}
              </h3>
              <p className="mono-label mt-2 !text-violet-soft">{entry.company}</p>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-ink-dim">
              {entry.summary}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
