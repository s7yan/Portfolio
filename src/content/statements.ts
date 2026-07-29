/**
 * Manifesto statements for the pinned typewriter scene (02).
 * `emphasis` substrings render in violet italic serif once typed.
 */

export interface Statement {
  /** Layer-chip label, design-tool style. */
  layer: string;
  /** Full sentence that types on scroll. */
  text: string;
  /** Substrings styled as italic serif accent when revealed. */
  emphasis: string[];
}

export const statements: Statement[] = [
  {
    layer: "p / Statement 01",
    text: "I design experiences that live at the edge of complexity.",
    emphasis: ["edge of complexity"],
  },
  {
    layer: "p / Statement 02",
    text: "Craft and systems thinking — held in the same hand.",
    emphasis: ["Craft", "systems thinking"],
  },
  {
    layer: "p / Statement 03",
    text: "From concept to ship, I own every pixel.",
    emphasis: ["every pixel"],
  },
];
