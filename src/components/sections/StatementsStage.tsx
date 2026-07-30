"use client";

/**
 * Manifesto statements — the panel the camera lands on.
 *
 * Deliberately thin: it renders the scene counter and the statement text,
 * nothing else. The selection frame, collaborator cursor and property
 * readout are shared chrome owned by HeroDeck, which repositions them from
 * the counter to this text as the scene advances — the same single set of
 * annotations the reference reuses across both phases.
 */
import { useMemo } from "react";
import { statements } from "@/content/statements";

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
  typing,
  reduced,
}: {
  /** 0→1 across the typing phase. 0 means nothing has been typed yet. */
  typing: number;
  /** When true, render complete and static. */
  reduced: boolean;
}) {
  const span = Math.max(0, Math.min(0.999, typing)) * statements.length;
  const active = Math.min(statements.length - 1, Math.floor(span));
  const frac = span - active;
  const statement = statements[active];

  const typed = useMemo(() => {
    if (reduced) return statement.text;
    if (typing <= 0) return "";
    // Type across the first 78% of each statement's slot, then hold.
    const t = Math.min(1, Math.max(0, frac) / 0.78);
    return statement.text.slice(0, Math.round(t * statement.text.length));
  }, [statement, frac, typing, reduced]);

  const complete = typed.length >= statement.text.length;
  const started = reduced || typing > 0;

  return (
    <div className="statements-stage">
      {/* The counter the collaborator annotates before anything is typed */}
      <p className="scene-index statements-counter" aria-hidden="true">
        {`0${active + 1}`}
      </p>

      {/* Full text for assistive tech — the typewriter is decorative */}
      <div className="sr-only">
        {statements.map((s) => (
          <p key={s.layer}>{s.text}</p>
        ))}
      </div>

      <p className="statements-text" aria-hidden="true">
        {started &&
          (complete ? renderRich(statement.text, statement.emphasis) : typed)}
        {!reduced && started && !complete && <span className="caret" />}
      </p>
    </div>
  );
}
