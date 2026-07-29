"use client";

/**
 * Scene 05 — Capabilities + about teaser.
 * Centered display statement (solid/outline), two support lines,
 * then the skills grid in three mono-labeled columns.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { skillGroups } from "@/content/skills";
import { aboutTeaser } from "@/content/experience";
import { SceneIndex } from "@/components/ui/SceneIndex";

export function Capabilities() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.fromTo(
        root.querySelectorAll(".mask-inner"),
        { yPercent: 115, rotate: 0.6 },
        {
          yPercent: 0,
          rotate: 0,
          duration: DUR.lg,
          ease: EASE.out,
          stagger: STAGGER.lines,
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        }
      );

      gsap.fromTo(
        root.querySelectorAll("[data-skill]"),
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: DUR.md,
          ease: EASE.out,
          stagger: STAGGER.items,
          scrollTrigger: {
            trigger: root.querySelector("[data-grid]"),
            start: "top 78%",
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
      id="capabilities"
      aria-label="Capabilities"
      className="relative px-[4vw] py-[18vh] text-center"
    >
      <SceneIndex index="05" className="mx-auto mb-12" />

      <h2 className="display mx-auto max-w-5xl text-[clamp(2.4rem,7.5vw,6rem)] text-ink">
        <span className="mask">
          <span className="mask-inner">{aboutTeaser.headingSolid}</span>
        </span>
        <span className="mask">
          <span className="mask-inner display-outline">
            {aboutTeaser.headingOutline}
          </span>
        </span>
      </h2>

      <div className="mx-auto mt-8 max-w-xl">
        {aboutTeaser.lines.map((line) => (
          <p key={line} className="mask text-[1.02rem] leading-relaxed text-ink-dim">
            <span className="mask-inner">{line}</span>
          </p>
        ))}
      </div>

      {/* Skills grid */}
      <div
        data-grid
        className="mx-auto mt-[10vh] grid max-w-5xl grid-cols-1 gap-12 text-left sm:grid-cols-3"
      >
        {skillGroups.map((group) => (
          <div key={group.title} data-skill>
            <h3 className="mono-label border-b border-line pb-3 !text-violet-soft">
              {group.title}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {group.items.map((item) => (
                <li key={item} className="font-sans text-[0.98rem] text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
