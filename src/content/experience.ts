/**
 * Work history — table-language rows (scene 06).
 */

export interface ExperienceEntry {
  period: string;
  role: string;
  company: string;
  summary: string;
}

export const experience: ExperienceEntry[] = [
  {
    period: "2022 — PRESENT",
    role: "Senior Product Designer",
    company: "Eccentric, Mumbai",
    summary:
      "Sole designer handling UX/UI across multiple automotive and product clients simultaneously. Led Tata Sierra EV, MG Motor, AutoEdge and Zippee from concept to ship.",
  },
  {
    period: "2020 — 2022",
    role: "Product Designer",
    company: "Infinite Locus",
    summary:
      "First-ever hire without an internship. Built design foundations for enterprise products across Oil & Gas, Warehouse Management and Quick Commerce ERP systems.",
  },
];

export const aboutTeaser = {
  headingSolid: "THE DESIGNER",
  headingOutline: "BEHIND THE WORK.",
  lines: [
    "Masters in Interaction Design. 3+ years shaping products for automotive brands, enterprise systems and fast-moving startups.",
    "Systems that scale. Interactions that feel inevitable.",
  ],
};
