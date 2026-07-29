"use client";

/**
 * Manifesto statements — presentational stage.
 *
 * Owns no ScrollTrigger of its own: the pinned camera-track in HeroDeck
 * drives it, passing a 0→1 progress across the statements portion of the
 * scene. Statements type out in sequence with a caret inside a violet
 * selection box; emphasis substrings resolve to italic serif.
 */
import { useMemo } from "react";
import { statements } from "@/content/statements";
import { site } from "@/content/site";
import { CollabCursor } from "@/components/ui/CollabCursor";
import { SceneIndex } from "@/components/ui/SceneIndex";

/** Render a statement with emphasis substrings wrapped in .em-serif. */
function renderRich(text: string, emphasis: readonly string[]) {
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

export function StatementsStage({
  progress,
  reduced,
}: {
  /** 0→1 across the statements portion of the pinned scene. */
  progress: number;
  /** When true, everything renders complete and static. */
  reduced: boolean;
}) {
  const span = progress * statements.length;
  const active = Math.min(statements.length - 1, Math.max(0, Math.floor(span)));
  const frac = span - active;
  const statement = statements[active];

  const typed = useMemo(() => {
    if (reduced) return statement.text;
    // Type across the first 78% of each statement's slot, then hold.
    const t = Math.min(1, Math.max(0, frac) / 0.78);
    return statement.text.slice(0, Math.round(t * statement.text.length));
  }, [statement, frac, reduced]);

  const complete = typed.length >= statement.text.length;

  return (
    <>
      <SceneIndex
        index={`0${active + 1}`}
        className="absolute top-[18vh] left-1/2 -translate-x-1/2"
      />

      {/* Full text for assistive tech — the typewriter is decorative */}
      <div className="sr-only">
        {statements.map((s) => (
          <p key={s.layer}>{s.text}</p>
        ))}
      </div>

      <div aria-hidden="true" className="relative max-w-6xl px-[6vw]">
        <span className="chip chip--violet absolute -top-8 left-[6vw]">
          {statement.layer}
        </span>

        {/* Full sentence reserves the box invisibly so the frame never
            reflows while the visible copy types over it. */}
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

        <CollabCursor
          name={site.name}
          status="content → editing…"
          className="right-[2%] bottom-[-52px] hidden md:block"
        />
      </div>
    </>
  );
}
