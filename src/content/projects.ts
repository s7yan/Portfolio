/**
 * Featured work — card-stack scene (04) + compact "more work" rows.
 *
 * `image` files under /public/placeholders are PLACEHOLDERS —
 * swap with real project artwork (same filenames, or update paths here).
 */

export interface ProjectStat {
  /** Numeric/em value ("1 MO") or a direction arrow ("up" | "down"). */
  value: string | "up" | "down";
  label: string;
}

export interface Project {
  id: string;
  tag: string;
  title: string;
  description: string;
  /** Meta rows (honest, non-invented facts). */
  meta: { key: string; value: string }[];
  /** Optional stat highlights (only where factual). */
  stats?: ProjectStat[];
  image: string;
  imageAlt: string;
  /** PLACEHOLDER link — case studies pending. */
  href?: string;
}

export const projects: Project[] = [
  {
    id: "tata-sierra-ev",
    tag: "AUTOMOTIVE · FEATURE EXPERIENCE",
    title: "Tata Sierra EV",
    description:
      "Interactive feature exploration for India's most anticipated EV revival — translating a legend's return into a motion-led digital story.",
    meta: [
      { key: "CLIENT", value: "TATA MOTORS" },
      { key: "ROLE", value: "LEAD PRODUCT DESIGNER" },
      { key: "SCOPE", value: "FEATURE STORYTELLING · INTERACTION" },
    ],
    image: "/placeholders/project-sierra.svg",
    imageAlt:
      "Placeholder cover for the Tata Sierra EV interactive feature experience",
  },
  {
    id: "mg-vs-hector",
    tag: "AUTOMOTIVE · LANDING EXPERIENCE",
    title: "MG VS & Hector Facelift",
    description:
      "Premium digital presence for MG Motor's flagship launches — pace, polish and product clarity for a high-stakes reveal window.",
    meta: [
      { key: "CLIENT", value: "MG MOTOR" },
      { key: "ROLE", value: "LEAD PRODUCT DESIGNER" },
      { key: "SCOPE", value: "LAUNCH PAGES · VISUAL SYSTEM" },
    ],
    image: "/placeholders/project-mg.svg",
    imageAlt: "Placeholder cover for the MG VS and Hector facelift launch pages",
  },
  {
    id: "autoedge",
    tag: "ENTERPRISE · DEALERSHIP PLATFORM",
    title: "AutoEdge Platform",
    description:
      "End-to-end dealership management reimagined for modern showrooms — dense operational workflows made legible and fast.",
    meta: [
      { key: "CLIENT", value: "ECCENTRIC" },
      { key: "ROLE", value: "SOLE SENIOR DESIGNER" },
      { key: "SCOPE", value: "END-TO-END PLATFORM UX" },
    ],
    stats: [
      { value: "down", label: "TIME TO COMPLETE DEALER TASKS" },
      { value: "up", label: "OPERATIONAL VISIBILITY" },
    ],
    image: "/placeholders/project-autoedge.svg",
    imageAlt: "Placeholder cover for the AutoEdge dealership platform",
  },
  {
    id: "zippee-rider",
    tag: "CONSUMER · RIDER APP",
    title: "Zippee Rider",
    description:
      "Solo-designed rider app for quick-commerce deliveries — concept to shipped product in a single month.",
    meta: [
      { key: "CLIENT", value: "ZIPPEE" },
      { key: "ROLE", value: "SOLO DESIGNER" },
    ],
    stats: [
      { value: "1 MO", label: "CONCEPT TO SHIP" },
      { value: "2", label: "APP STORES LIVE" },
    ],
    image: "/placeholders/project-zippee.svg",
    imageAlt: "Placeholder cover for the Zippee rider app",
  },
];

/** Compact table rows under the stack — kept from the full project list. */
export const moreWork = [
  {
    title: "ERP SUITES",
    sector: "OIL & GAS · WAREHOUSE · QUICK COMMERCE",
  },
  {
    title: "BRAND COLLATERALS",
    sector: "CAMPAIGNS ACROSS AUTOMOTIVE CLIENTS",
  },
];
