# Interaction Specification — Portfolio v2

Derived from studying the reference experience (andrewreff.com) as an
interaction blueprint. Everything below is described as *pattern vocabulary*
and implemented with original code and Sayan's own content/brand.

## Concept

**The design-tool canvas.** The whole site behaves like a live design file:

- Dot-grid canvas background (Figma-style artboard)
- Elements wear *inspector annotations* (layer chips like `h1 / Display`,
  live property readouts like `dx: 0, dy: 0`)
- The visitor's cursor carries a **"You"** name tag (multiplayer metaphor)
- A fake collaborator cursor (labeled with the owner's name) drifts in and
  "edits" content in scroll-driven scenes
- The hero name sits in a dashed selection frame labeled **DRAG TO MOVE**
  and is genuinely draggable with inertia

## Page flow (single page)

| # | Scene | Pattern |
|---|-------|---------|
| 00 | Preloader | Big percentage counter bottom-right, thin accent rule, wipe reveal into hero |
| 01 | Hero canvas | Dot grid, eyebrow mono line, 2-line display name (solid / outline), draggable with selection box, tagline at fold, live local clock in header |
| 02 | Statements | Pinned scene; 3 manifesto lines type on scrub with caret; emphasis words resolve to violet italic serif; layer chip + collaborator cursor; mono scene counter |
| 03 | Worked With | Mono-labeled 2-col table (PARTNER / SECTOR), giant row names, row inversion on hover |
| 04 | Featured Work | Pinned section header; sticky card stack — outgoing card scales/dims under incoming; card = tag, headline, body, meta/stat rows, CTA link, framed visual |
| 05 | Capabilities + About teaser | Centered display statement (solid/outline), support lines, skills grid in mono columns |
| 06 | Experience | Table-language rows: period / role / company / summary |
| 07 | Footer | "LET'S TALK." display line + single mono link row |

Persistent chrome: header (wordmark + clock), **Ask me anything ⌘K** pill
(AI concierge overlay), custom cursor layer.

## Motion character

- **Easing**: expo/quart outs for entrances; power1 for scrubbed motion
- **Text reveals**: masked line rises (y: 110% → 0) with slight rotate;
  80–110ms stagger; blur-to-sharp on hero pieces
- **Scrub scenes**: pinned with `scrub: true`; typewriter driven by progress
- **Hover**: row inversion (bg/off-white flip), link arrow slides, image
  scale 1.04 with 600ms quart, cursor morph + label swap
- **Cursor physics**: dot lerps ~0.35, ring/tag lerps ~0.18 (lag), scales on
  interactive targets, hides over iframes/inputs
- **Section counters**: small mono teal indices (01–07) fade/slide per scene
- **Reduced motion**: pinning/scrub disabled, typewriter renders complete,
  reveals become opacity-only, draggable becomes static

## Type system (Sayan's brand, reference rhythm)

- Display: Space Grotesk 700, tight tracking, uppercase for names/headers;
  outline variant via `-webkit-text-stroke`
- Body: Space Grotesk 300–400
- Mono UI: Space Mono — chips, tables, eyebrows, stats, footer links
- Serif italic accent: Libre Baskerville Italic for emphasized statement words

## Color

- Canvas: near-black `#0A0A0B`; ink: `#EDEDEF`
- Brand accent (preserved): violet `#7B5BFF` family for chips/selection/
  collaborator cursor
- Secondary: mint `#7EF0C6` used sparingly (scene counters, success accents)
- Surfaces: elevated card `#121214`, hairlines `rgba(237,237,239,0.14)`

## AI concierge

Full-screen overlay (⌘K / pill): time-of-day greeting, suggestion chips,
large input. Backed by `/api/chat` — answers as "Sayan's assistant" grounded
in `src/content/*`; graceful offline message without an API key.
