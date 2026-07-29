"use client";

/**
 * Scene 04 — Featured Work.
 * Pinned "FEATURED WORK" header; sticky card stack where each incoming
 * card slides over the previous while the outgoing card scales down and
 * dims. Cards: tag, headline, description, meta/stat rows, CTA, visual.
 */
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { projects, moreWork, type Project } from "@/content/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SceneIndex } from "@/components/ui/SceneIndex";

function Stat({ value, label }: { value: string; label: string }) {
  const isDir = value === "up" || value === "down";
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-sans text-2xl font-medium text-ink">
        {isDir ? (value === "up" ? "↑" : "↓") : value}
      </span>
      <span className="mono-label !text-[0.58rem]">{label}</span>
    </div>
  );
}

function WorkCard({ project, index }: { project: Project; index: number }) {
  return (
    <article
      data-card
      className="work-card sticky top-[13vh] mb-[6vh] grid min-h-[74vh] grid-cols-1 gap-8 overflow-hidden rounded-2xl border border-line bg-surface p-7 will-change-transform md:grid-cols-[5fr_6fr] md:gap-12 md:p-12"
      aria-labelledby={`work-${project.id}`}
    >
      <div className="flex flex-col">
        <p className="mono-label mb-5">{project.tag}</p>
        <h3
          id={`work-${project.id}`}
          className="font-sans text-[clamp(1.7rem,3.2vw,2.7rem)] leading-tight font-medium text-ink"
        >
          {project.title}
        </h3>
        <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink-dim">
          {project.description}
        </p>

        {/* Meta rows */}
        <dl className="mt-8 flex flex-col gap-2 border-t border-line pt-5">
          {project.meta.map((m) => (
            <div key={m.key} className="flex justify-between gap-6">
              <dt className="mono-label !text-[0.58rem]">{m.key}</dt>
              <dd className="mono-label !text-[0.58rem] !text-ink text-right">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Stats (only where factual) */}
        {project.stats && (
          <div className="mt-7 flex gap-10">
            {project.stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        )}

        <a
          href={project.href ?? "#contact"}
          className="mono-link mt-auto pt-8"
          aria-label={`${project.title} — case study coming soon`}
        >
          VIEW CASE STUDY <span className="arrow">→</span>
        </a>
      </div>

      {/* Visual — placeholder frame (swap files in /public/placeholders) */}
      <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-line bg-canvas-2 md:min-h-0">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(max-width: 768px) 92vw, 48vw"
          className="object-cover"
          priority={index === 0}
        />
      </div>
    </article>
  );
}

export function Work() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      // Outgoing card recedes as the next one arrives over it
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.94,
          autoAlpha: 0.45,
          filter: "blur(2px)",
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top 90%",
            end: "top 15%",
            scrub: true,
          },
        });
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="work"
      aria-label="Featured work"
      className="relative px-[4vw] py-[14vh]"
    >
      <SceneIndex index="04" className="mb-10" />
      <div className="mb-[8vh]">
        <SectionHeading solid="FEATURED" outline="WORK" />
      </div>

      <div className="relative">
        {projects.map((p, i) => (
          <WorkCard key={p.id} project={p} index={i} />
        ))}
      </div>

      {/* More work — compact table rows */}
      <div className="mt-[10vh]">
        <p className="mono-label mb-6">MORE WORK</p>
        {moreWork.map((w) => (
          <div
            key={w.title}
            className="row-invert flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-6"
          >
            <h3 className="display text-[clamp(1.2rem,3vw,2rem)]">{w.title}</h3>
            <p className="mono-label">{w.sector}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
