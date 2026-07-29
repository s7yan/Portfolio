# Sayan Das — Portfolio v2

Single-page portfolio for **Sayan Das, Senior Product Designer**, built as a
"live design file": dot-grid canvas, draggable hero, inspector chips,
multiplayer-style cursors, scroll-driven typewriter statements, a sticky
case-study stack, and an AI concierge (⌘K).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP
(ScrollTrigger, Draggable, Inertia) · Lenis smooth scroll.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # production build
npm start          # serve production build
npm run typecheck  # tsc --noEmit
```

## Environment

Copy `.env.example` → `.env.local`.

| Var | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables real AI answers in the ⌘K concierge (otherwise a graceful offline reply) |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/sitemap base URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (optional) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible (optional) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` | PostHog (optional, stub) |

## Project structure

```
src/
  app/           layout (fonts/SEO/JSON-LD), page, api/chat, sitemap, robots
  components/
    sections/    Hero · Statements · Partners · Work · Capabilities ·
                 Experience · Footer
    cursor/      Custom multiplayer-style cursor
    preloader/   Percentage counter + wipe reveal
    nav/         Header (wordmark + live IST clock) + mobile menu
    ai/          "Ask me anything" ⌘K overlay
    canvas/      DotField — interactive dot-grid canvas
    ui/          CollabCursor, SceneIndex, SectionHeading
  content/       ALL site copy/data (single source of truth)
  lib/           motion tokens, gsap registration, utils
  hooks/         useClock, useMagnetic, useReducedMotion
  styles/        globals.css — Tailwind v4 theme + design system
docs/            interaction spec
reference/       archived v1 content documents
```

## Editing content

Everything lives in `src/content/*.ts` — no component changes needed:

- `site.ts` — name, role, email, socials, hero copy, location/clock
- `statements.ts` — the three typewriter manifesto lines
- `projects.ts` — featured work cards + "more work" rows
- `partners.ts`, `experience.ts`, `skills.ts`, `ai.ts`

## Placeholders to swap

| Item | Where |
| --- | --- |
| Project covers | `public/placeholders/project-*.svg` (labeled "PLACEHOLDER") |
| Social links | `site.ts` → `socials[].href` (currently `#` + SOON badge) |
| Resume file | add to `public/` and point the `Resume` social at it |
| Case-study links | `projects.ts` → `href` per project |

## Motion system

All timing constants live in `src/lib/motion.ts` (durations, eases,
staggers, cursor physics, Lenis config, z-layers) and as CSS custom
properties in `globals.css`. Components never hardcode animation values.

`prefers-reduced-motion` disables: smooth scroll, pinning/scrub, the
typewriter (statements render complete), draggable inertia, cursor lag,
and all decorative animation.

## Deployment

Any Node host works; zero-config on Vercel:

```bash
npx vercel
```

Set env vars in your host's dashboard. `/` is statically prerendered;
`/api/chat` is a serverless function.
