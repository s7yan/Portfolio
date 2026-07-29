"use client";

/**
 * Scene 02 — Manifesto statements.
 * Pinned viewport scene: three statements type on scroll-scrub with a
 * caret inside a violet selection box; emphasis substrings resolve to
 * italic serif violet. A collaborator cursor "edits" beside the box and
 * a mono counter tracks 01→03.
 *
 * Reduced motion: no pin, statements render complete and fade in.
 */
import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { statements } from "@/content/statements";
import { site } from "@/content/site";
import { CollabCursor } from "@/components/ui/CollabCursor";
import { SceneIndex } from "@/components/ui/SceneIndex";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Render a statement with emphasis substrings wrapped in .em-serif. */
function renderRich(text: string, emphasis: string[]) {
  let parts: (string | { em: string })[] = [text];
  for (const em of emphasis) {
    parts = parts.flatMap((p) => {
      if (typeof p !== "string" || !p.includes(em)) return [p];
      const [before, ...rest] = p.split(em);
      return [before, { em }, rest.join(em)];
    });
  }
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <em key={i} className="em-serif">
        {p.em}
      </em>
    )
  );
}

export function Statements() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  // progress: 0..statements.length (fractional part = chars typed)
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return;
      const st = gsap.to(
        { p: 0 },
        {
          p: statements.length,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: `+=${statements.length * 120}%`,
            pin: true,
            scrub: 0.4,
            onUpdate(self) {
              setProgress(self.progress * statements.length);
            },
          },
        }
      );
      return () => st.scrollTrigger?.kill();
    },
    { scope: rootRef, dependencies: [reduced] }
  );

  const active = Math.min(statements.length - 1, Math.floor(progress));
  const frac = progress - active;
  const statement = statements[active];

  const typed = useMemo(() => {
    if (reduced) return statement.text;
    // Type across first 78% of each statement's window, hold the rest
    const t = Math.min(1, frac / 0.78);
    const count = Math.round(t * statement.text.length);
    return statement.text.slice(0, count);
  }, [statement, frac, reduced]);

  const complete = typed.length >= statement.text.length;

  return (
    <section
      ref={rootRef}
      aria-label="Design philosophy"
      className="relative flex min-h-svh items-center justify-center overflow-hidden px-[6vw]"
    >
      <SceneIndex
        index={`0${active + 1}`}
        className="absolute top-[18vh] left-1/2 -translate-x-1/2"
      />

      {/* Accessible full text (screen readers skip the typewriter) */}
      <div className="sr-only">
        {statements.map((s) => (
          <p key={s.layer}>{s.text}</p>
        ))}
      </div>

      <div aria-hidden="true" className="relative max-w-6xl">
        {/* Layer chip */}
        <span className="chip chip--violet absolute -top-8 left-0">
          {statement.layer}
        </span>

        {/* Selection box — full sentence reserves the box size invisibly,
            typed text overlays it, so the frame never reflows mid-type */}
        <div
          className="relative border px-6 py-5 md:px-10 md:py-7"
          style={{ borderColor: "rgba(123,91,255,0.55)" }}
        >
          <p className="invisible font-sans text-[clamp(1.6rem,4.6vw,3.6rem)] leading-[1.25] font-normal">
            {statement.text}
          </p>
          <p className="absolute inset-0 px-6 py-5 font-sans text-[clamp(1.6rem,4.6vw,3.6rem)] leading-[1.25] font-normal text-ink md:px-10 md:py-7">
            {complete ? renderRich(statement.text, statement.emphasis) : typed}
            {!reduced && !complete && <span className="caret" />}
          </p>
        </div>

        {/* Collaborator "editing" presence */}
        <CollabCursor
          name={site.name}
          status="content → editing…"
          className="right-[-2%] bottom-[-52px] hidden md:block"
        />
      </div>
    </section>
  );
}
