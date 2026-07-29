/**
 * Capabilities grid content (scene 05).
 */

export interface SkillGroup {
  title: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: "DESIGN CRAFT",
    items: [
      "UX/UI Design",
      "Interaction Design",
      "Product Design",
      "Motion Design",
      "Visual Branding",
      "Corporate Identity",
    ],
  },
  {
    title: "DOMAIN EXPERTISE",
    items: [
      "ERP / SaaS / CRM",
      "Automotive Interfaces",
      "Cinematography",
      "AI-Augmented Workflows",
    ],
  },
  {
    title: "TOOLS",
    items: [
      "Figma",
      "Adobe Suite",
      "ProtoPie",
      "Spline & Unity",
      "Claude Code",
      "Google AI Studio",
    ],
  },
];
