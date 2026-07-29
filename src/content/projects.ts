/**
 * Featured work — card stack on the home page (scene 04) and the source of
 * every `/work/[slug]` case study.
 *
 * IMAGERY: everything under /public/placeholders is a PLACEHOLDER — swap in
 * real artwork (same paths, or update `image` / `heroImage` here).
 *
 * BODY COPY: `sections` are drafted from the project facts Sayan already
 * published (roles, clients, scope). They read as finished prose so the page
 * can be reviewed properly, but they are HIS to confirm — see `draftCopy`.
 * Metrics are deliberately directional (↑/↓) except where a hard number is
 * already on record, so nothing invented is presented as measured.
 */

export interface ProjectStat {
  /** Numeric/em value ("1 MO") or a direction arrow ("up" | "down"). */
  value: string | "up" | "down";
  label: string;
}

/**
 * Attribution for third-party imagery. Required by share-alike/attribution
 * licences (CC BY, CC BY-SA) — rendered visibly on the case study.
 */
export interface ImageCredit {
  /** Photographer or source name. */
  author: string;
  /** Link to the original file/source page. */
  href: string;
  /** Licence short name, e.g. "CC BY-SA 4.0". */
  license: string;
  licenseHref: string;
}

/** One `h3 + prose` block in the editorial column. */
export interface CaseSection {
  heading: string;
  /** Paragraphs, rendered in order. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  highlights?: string[];
}

export interface Project {
  id: string;
  /** URL segment: /work/[slug] */
  slug: string;
  tag: string;
  title: string;
  description: string;
  meta: { key: string; value: string }[];
  stats?: ProjectStat[];
  image: string;
  imageAlt: string;

  /* ── Case study ── */
  /** Full-bleed hero image behind the title. */
  heroImage: string;
  heroImageAlt: string;
  /** Set when the imagery is third-party and needs visible credit. */
  imageCredit?: ImageCredit;
  /** Sidebar facts: role / team / duration / company. */
  sidebar: { label: string; value: string }[];
  sections: CaseSection[];
  /** Inverted band near the foot of the case study. */
  metrics: ProjectStat[];
  /** True while the narrative copy still needs Sayan's sign-off. */
  draftCopy?: boolean;
}

export const projects: Project[] = [
  {
    id: "tata-sierra-ev",
    slug: "tata-sierra-ev",
    tag: "AUTOMOTIVE · FEATURE EXPERIENCE",
    title: "Tata Sierra EV",
    description:
      "Interactive feature exploration for India's most anticipated EV revival — translating a legend's return into a motion-led digital story.",
    meta: [
      { key: "CLIENT", value: "TATA MOTORS" },
      { key: "ROLE", value: "LEAD PRODUCT DESIGNER" },
      { key: "SCOPE", value: "FEATURE STORYTELLING · INTERACTION" },
    ],
    image: "/projects/tata-sierra-card.jpg",
    imageAlt:
      "A Tata Sierra parked outdoors, three-quarter front view — the original SUV the EV revives",
    heroImage: "/projects/tata-sierra-hero.jpg",
    heroImageAlt:
      "A Tata Sierra in profile, the distinctive wraparound rear glass visible",
    /* NOTE: these are photographs of the original 1990s Sierra, not the EV —
       freely licensed, unlike current press imagery. Swap for Sayan's own
       project artwork when it's cleared for publication. */
    imageCredit: {
      author: "Raisahabone",
      href: "https://commons.wikimedia.org/wiki/Category:Tata_Sierra",
      license: "CC BY-SA 4.0",
      licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    sidebar: [
      { label: "Role", value: "Lead Product Designer" },
      { label: "Team", value: "Design + Engineering" },
      { label: "Duration", value: "3 months" },
      { label: "Company", value: "Eccentric" },
    ],
    sections: [
      {
        heading: "Customer Problem",
        body: [
          "The Sierra name carries three decades of memory in India. Reviving it as an EV meant the launch experience had to satisfy two audiences at once: enthusiasts who already had a relationship with the badge, and a new buyer evaluating an electric SUV on its merits.",
          "A conventional spec sheet would have served neither. Features needed to be felt before they were read.",
        ],
      },
      {
        heading: "Before",
        body: [
          "Feature communication for launches in this category defaults to static galleries and dense specification tables. Users scroll past them. The emotional weight of the product — the thing that actually drives consideration — gets lost between bullet points.",
        ],
      },
      {
        heading: "What I Did",
        body: [
          "I built the page as a sequence of feature moments rather than a catalogue. Each capability got its own scroll-driven scene where the interaction demonstrates the feature instead of describing it, with motion carrying the user between beats.",
        ],
        highlights: [
          "Mapped the feature set into a narrative order rather than a spec order",
          "Designed scroll-driven scenes so each feature demonstrates itself",
          "Built a motion language that reads as premium without slowing comprehension",
          "Balanced enthusiast nostalgia against first-time-buyer clarity",
          "Specified interaction and timing directly with engineering",
        ],
      },
      {
        heading: "After",
        body: [
          "The launch experience moves as a single continuous story. Users arrive at the specification detail already understanding what the vehicle is for, because the interaction has shown them.",
        ],
      },
      {
        heading: "Business Value",
        body: [
          "The experience gave the launch a distinct digital identity in a segment where competitors ship near-identical templates — a differentiator at exactly the moment consideration is formed.",
        ],
      },
      {
        heading: "Future State",
        body: [
          "The scene-based pattern established here is reusable across future vehicle launches, giving the brand a consistent motion vocabulary rather than a new bespoke build each time.",
        ],
      },
    ],
    metrics: [
      { value: "up", label: "Feature comprehension" },
      { value: "up", label: "Time on experience" },
      { value: "down", label: "Reliance on spec tables" },
      { value: "up", label: "Launch differentiation" },
    ],
    draftCopy: true,
  },

  {
    id: "mg-vs-hector",
    slug: "mg-vs-hector",
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
    heroImage: "/placeholders/case-mg-hero.svg",
    heroImageAlt: "Placeholder hero artwork for the MG Motor case study",
    sidebar: [
      { label: "Role", value: "Lead Product Designer" },
      { label: "Team", value: "Design + Engineering" },
      { label: "Duration", value: "2 months" },
      { label: "Company", value: "Eccentric" },
    ],
    sections: [
      {
        heading: "Customer Problem",
        body: [
          "Two flagship launches shared a compressed reveal window. Each needed a landing experience that felt premium and distinct, while remaining unmistakably MG — and both had to ship against a fixed launch date that would not move.",
        ],
      },
      {
        heading: "Before",
        body: [
          "Launch pages were being assembled per-vehicle with no shared system. Every build re-solved the same problems — hero treatment, feature blocks, variant comparison — and consistency drifted between them.",
        ],
      },
      {
        heading: "What I Did",
        body: [
          "Rather than design two pages, I designed one system with two expressions: a shared structural and motion foundation, with per-vehicle art direction layered on top.",
        ],
        highlights: [
          "Built a shared page architecture both launches could inherit",
          "Art-directed each vehicle distinctly within the common structure",
          "Designed feature and variant modules that survive content changes",
          "Tuned motion for premium feel without harming load or clarity",
          "Delivered against a fixed, non-negotiable launch date",
        ],
      },
      {
        heading: "After",
        body: [
          "Both launches shipped on schedule with a consistent quality bar. The shared foundation meant late content changes landed as content edits rather than redesigns.",
        ],
      },
      {
        heading: "Business Value",
        body: [
          "Designing the system once and expressing it twice absorbed the compressed timeline — and left reusable structure behind instead of two disposable pages.",
        ],
      },
      {
        heading: "Future State",
        body: [
          "The module set continues to serve subsequent launches, so future vehicles start from a validated foundation.",
        ],
      },
    ],
    metrics: [
      { value: "2", label: "Flagship launches shipped" },
      { value: "up", label: "Cross-launch consistency" },
      { value: "down", label: "Rebuild effort per launch" },
      { value: "up", label: "Perceived brand quality" },
    ],
    draftCopy: true,
  },

  {
    id: "autoedge",
    slug: "autoedge",
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
    heroImage: "/placeholders/case-autoedge-hero.svg",
    heroImageAlt: "Placeholder hero artwork for the AutoEdge case study",
    sidebar: [
      { label: "Role", value: "Sole Senior Designer" },
      { label: "Team", value: "Product + Engineering" },
      { label: "Duration", value: "Ongoing" },
      { label: "Company", value: "Eccentric" },
    ],
    sections: [
      {
        heading: "Customer Problem",
        body: [
          "Dealership operations span inventory, leads, test drives, documentation and delivery — usually across disconnected tools. Staff compensate by memorising workarounds, and that knowledge leaves when they do.",
          "The platform had to hold genuinely dense operational data without becoming the kind of enterprise interface people route around.",
        ],
      },
      {
        heading: "Before",
        body: [
          "Existing tooling exposed the database rather than the job. Frequent tasks took the same number of clicks as rare ones, and nothing surfaced what actually needed attention today.",
        ],
      },
      {
        heading: "What I Did",
        body: [
          "I designed around the daily loop rather than the data model — starting from what a showroom actually does between opening and closing, then shaping the interface to make those paths short.",
        ],
        highlights: [
          "Mapped the real daily workflow before touching interface design",
          "Prioritised frequent actions into short, obvious paths",
          "Designed dense data views that stay scannable under real volume",
          "Built a component system consistent across every module",
          "Owned the work end-to-end as the sole designer on the platform",
        ],
      },
      {
        heading: "After",
        body: [
          "The platform leads with what needs attention now, and routine work is reachable without hunting. Density is retained where professionals want it and removed where it was only exposing structure.",
        ],
      },
      {
        heading: "Business Value",
        body: [
          "Shorter task paths compound across every seat, every day. Consistency across modules also cut the training burden for new showroom staff.",
        ],
      },
      {
        heading: "Future State",
        body: [
          "The component system underpins continued module development, so new capability arrives consistent by default rather than by review.",
        ],
      },
    ],
    metrics: [
      { value: "down", label: "Time to complete dealer tasks" },
      { value: "up", label: "Operational visibility" },
      { value: "1", label: "Unified platform system" },
      { value: "down", label: "Training burden" },
    ],
    draftCopy: true,
  },

  {
    id: "zippee-rider",
    slug: "zippee-rider",
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
    heroImage: "/placeholders/case-zippee-hero.svg",
    heroImageAlt: "Placeholder hero artwork for the Zippee rider case study",
    sidebar: [
      { label: "Role", value: "Solo Designer" },
      { label: "Team", value: "Design of one + Engineering" },
      { label: "Duration", value: "1 month" },
      { label: "Company", value: "Eccentric" },
    ],
    sections: [
      {
        heading: "Customer Problem",
        body: [
          "Delivery riders use their phone one-handed, outdoors, in traffic, under time pressure. An interface that tests well at a desk can fail completely on a bike in the sun.",
          "The product needed to ship to both app stores in a month, with a single designer covering the entire surface.",
        ],
      },
      {
        heading: "Before",
        body: [
          "Rider tooling in this category frequently borrows consumer-app patterns — small targets, low-contrast states, flows that assume full attention. None of that survives contact with the actual job.",
        ],
      },
      {
        heading: "What I Did",
        body: [
          "I designed for the worst realistic case and let the easy case follow: large targets, unambiguous state, and the next action always the most prominent thing on screen.",
        ],
        highlights: [
          "Designed for one-handed use in motion and bright sunlight",
          "Made the next action the most prominent element on every screen",
          "Kept order state unambiguous at a glance",
          "Scoped ruthlessly to protect a one-month delivery",
          "Covered the entire product surface as the only designer",
        ],
      },
      {
        heading: "After",
        body: [
          "The app shipped to both iOS and Play Store within the month, with a rider flow that holds up in real conditions rather than only in review.",
        ],
      },
      {
        heading: "Business Value",
        body: [
          "A one-month concept-to-store timeline let the operation validate its rider experience in the market instead of in a prototype.",
        ],
      },
      {
        heading: "Future State",
        body: [
          "The shipped flow gives the team a real baseline to iterate against, informed by live rider behaviour.",
        ],
      },
    ],
    metrics: [
      { value: "1", label: "Month concept to ship" },
      { value: "2", label: "App stores live" },
      { value: "up", label: "One-handed usability" },
      { value: "down", label: "Steps per delivery" },
    ],
    draftCopy: true,
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

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

/** Next project in the list, wrapping around — mirrors the reference. */
export const getNextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return projects[0];
  return projects[(i + 1) % projects.length];
};
