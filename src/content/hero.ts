/**
 * Hero scene script — every string the design-surface choreography uses.
 *
 * The hero behaves like a live design file being edited by a collaborator:
 * layers get selected, properties get tweaked, copy gets retyped, and if the
 * visitor drags a layer out of place the collaborator complains about it.
 */

import { site } from "./site";

export const heroScene = {
  /** Mono eyebrow above the name. */
  eyebrow: "DESIGNING AT THE SPEED OF THOUGHT.",

  firstName: site.firstName,
  lastName: site.lastName,

  /**
   * The subtitle starts as a placeholder that mirrors the eyebrow, then the
   * collaborator deletes it and types the real tagline — so the visitor
   * watches the copy get "finished" live.
   */
  subtitleInitial: "Designing at the speed of thought",
  subtitleFinal: "Bridging AI, interaction & design.",

  /** Layer-chip labels, design-tool style. */
  layers: {
    first: "h1 / First Name",
    last: "h1 / Last Name",
    subtitle: "p / Subtitle",
    aligning: "Aligning to Grid…",
  },

  /** Affordance chip shown on whichever layer is focused. */
  dragLabel: "DRAG TO MOVE",

  /** Property edits the collaborator performs, shown as `key → value`. */
  edits: {
    tracking: { key: "tracking", value: "-0.05em" },
    /** Mint stroke applied live to the outlined last name. */
    stroke: { key: "stroke", value: "#7EF0C6" },
    content: { key: "content", value: "editing…" },
  },

  /** Name on the collaborator's cursor tag. */
  collabName: site.name,

  /**
   * Before the statement types, the collaborator fiddles with the scene
   * counter — selecting it and cycling three property edits. Layer label is
   * fixed; the toast steps through these in order across the phase.
   */
  counter: {
    layer: "span / Counter",
    edits: [
      { key: "color", value: "#7EF0C6" },
      { key: "alignment", value: "center" },
      { key: "margin-bottom", value: "36px" },
    ],
  },
  /** Layer label while the statement itself is being typed. */
  statementLayer: "p / Statement 01",

  /**
   * Escalating reactions, cycled one per drag-release.
   * Deliberately in Sayan's voice — the mechanic is borrowed, the words are his.
   */
  messages: [
    "Careful — that was aligned.",
    "You're really doing this to my layout?",
    "Again? I just fixed that.",
    "Locking the layer. (Kidding.)",
  ],
} as const;
