/**
 * Global site identity + contact content.
 * Single source of truth — every component reads from here.
 */

export const site = {
  name: "Sayan Das",
  firstName: "SAYAN",
  lastName: "DAS",
  role: "Senior Product Designer",
  title: "Sayan Das — Senior Product Designer",
  description:
    "Portfolio of Sayan Das — Senior Product Designer bridging AI, interaction and design. Designing at the speed of thought.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sayandas.design",

  /** Shown beside the wordmark and used for the live header clock. */
  location: {
    city: "Mumbai",
    country: "IN",
    timeZone: "Asia/Kolkata",
    tzLabel: "IST",
  },

  hero: {
    eyebrow: "DESIGNING AT THE SPEED OF THOUGHT.",
    badge: "AI-First Designer",
    tagline: "Bridging AI, interaction & design to craft products people feel.",
  },

  email: "hello@sayandas.design",

  /**
   * PLACEHOLDER: real profile URLs pending — swap `href` values.
   * `placeholder: true` renders them with a subtle "soon" treatment.
   */
  socials: [
    { label: "LinkedIn", href: "#", placeholder: true },
    { label: "Behance", href: "#", placeholder: true },
    { label: "Dribbble", href: "#", placeholder: true },
    { label: "Resume", href: "#", placeholder: true },
  ],

  copyright: `© ${new Date().getFullYear()} Sayan Das. All rights reserved.`,
} as const;

export type Site = typeof site;
