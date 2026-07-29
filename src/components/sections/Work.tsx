"use client";

/**
 * Scene 04 — Featured Work: the cinema deck.
 *
 * Each project is a sticky, full-viewport wrapper so the cards stack in
 * place. Four scroll effects run per card:
 *
 *   1. Cinema pan — the artwork drifts diagonally *inside* its frame
 *      (x 0→-30%, y 0→-12%) on a lazy scrub, so every card reads like a
 *      slow camera move rather than a static screenshot.
 *   2. Entry tilt — the card rotates up from 2.5° about its top edge.
 *   3. Recede — as the *next* card arrives, the outgoing one scales down,
 *      dims, lifts and blurs.
 *   4. Progress rail — a fixed column of pips tracks the active card.
 *
 * See docs/interaction-spec.md for the extracted values.
 */
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { WORK_DECK } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { projects, moreWork, type Project } from "@/content/projects";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SceneIndex } from "@/components/ui/SceneIndex";

/** Arrow glyphs for directional metrics. */
const ARROW: Record<string, string> = { up: "↑", down: "↓" };

function WorkCard({ project, index }: { project: Project; index: number }) {
  const metrics = project.stats?.slice(0, 2) ?? [];

  return (
    <div className="fw-card-wrapper">
      <section className="fw-card" aria-labelledby={`fw-title-${project.id}`}>
        <div className="fw-card__content">
          <div className="fw-card__top">
            <div className="fw-card__company">
              <span>{project.tag}</span>
            </div>
            <h3 id={`fw-title-${project.id}`} className="fw-card__title">
              {project.title}
            </h3>
            <p className="fw-card__vision">{project.description}</p>
          </div>

          <div className="fw-card__bottom">
            {metrics.length > 0 && (
              <div className="fw-card__metrics">
                {metrics.map((m) => (
                  <div key={m.label} className="fw-metric">
                    <span className="fw-metric__val">
                      {ARROW[m.value] ?? m.value}
                    </span>
                    <span className="fw-metric__lbl">{m.label}</span>
                  </div>
                ))}
              </div>
            )}

            <TransitionLink
              href={`/work/${project.slug}`}
              className="fw-card__cta"
              aria-label={`View case study: ${project.title}`}
            >
              View Case Study
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </TransitionLink>
          </div>
        </div>

        <div className="fw-card__visual">
          <div className="fw-cinema-frame">
            {/* Oversized on purpose — the pan slides it without exposing edges */}
            <div className="fw-cinema-img">
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 900px) 92vw, 58vw"
                priority={index === 0}
              />
            </div>
          </div>
          <div className="fw-cinema-corners" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}

export function Work() {
  const deckRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const pipsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const deck = deckRef.current;
      if (!deck || prefersReducedMotion()) return;

      const wrappers = gsap.utils.toArray<HTMLElement>(".fw-card-wrapper", deck);
      const rail = railRef.current;
      const { pan, tilt, recede } = WORK_DECK;

      // Progress rail only while the deck is on screen
      ScrollTrigger.create({
        trigger: deck,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => rail?.classList.add("fw-progress--visible"),
        onLeave: () => rail?.classList.remove("fw-progress--visible"),
        onEnterBack: () => rail?.classList.add("fw-progress--visible"),
        onLeaveBack: () => rail?.classList.remove("fw-progress--visible"),
      });

      const setActive = (i: number) =>
        pipsRef.current.forEach((pip, p) =>
          pip?.classList.toggle("fw-pip--active", p === i)
        );

      wrappers.forEach((wrapper, i) => {
        const card = wrapper.querySelector<HTMLElement>(".fw-card");
        const img = wrapper.querySelector<HTMLElement>(".fw-cinema-img");
        if (!card) return;

        // 1 — cinema pan inside the frame
        if (img) {
          gsap.fromTo(
            img,
            { x: "0%", y: "0%" },
            {
              x: pan.x,
              y: pan.y,
              ease: "none",
              scrollTrigger: {
                trigger: wrapper,
                start: "top bottom",
                end: "bottom top",
                scrub: pan.scrub,
              },
            }
          );
        }

        // 2 — entry tilt about the card's top edge
        gsap.fromTo(
          card,
          { rotateX: tilt.from, transformOrigin: "top center" },
          {
            rotateX: 0,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "top 30%",
              scrub: true,
            },
          }
        );

        // 3 — active pip
        ScrollTrigger.create({
          trigger: wrapper,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });

        // 4 — recede as the next card arrives
        if (i < wrappers.length - 1) {
          gsap.to(card, {
            scale: recede.scale,
            opacity: recede.opacity,
            y: recede.y,
            filter: `blur(${recede.blur}px)`,
            ease: "none",
            scrollTrigger: {
              trigger: wrappers[i + 1],
              start: "top bottom",
              end: "top 10%",
              scrub: true,
            },
          });
        }
      });
    },
    { scope: deckRef }
  );

  return (
    <>
      <section ref={deckRef} id="work" aria-label="Featured work" className="fw-deck">
        <div className="fw-intro">
          <SceneIndex index="04" className="mb-6" />
          <SectionHeading solid="FEATURED" outline="WORK" />
        </div>

        {projects.map((p, i) => (
          <WorkCard key={p.id} project={p} index={i} />
        ))}
      </section>

      {/* Fixed progress rail */}
      <div ref={railRef} className="fw-progress" aria-hidden="true">
        {projects.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              pipsRef.current[i] = el;
            }}
            className={`fw-pip${i === 0 ? " fw-pip--active" : ""}`}
          />
        ))}
      </div>

      {/* More work — compact table rows */}
      <div className="px-[4vw] pb-[12vh]">
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
    </>
  );
}
