# Case Study Page + Navigation Transition — extracted spec

Measured from the reference implementation (computed styles + its JS chunk),
then rebuilt with original code and Sayan's content.

## Page transition — "Navigate" selection box

The design-tool metaphor applied to routing: clicking a project draws a
selection box at the click point, expands it to fill the viewport (with a
live `W × H` readout), flashes, navigates, then releases.

Elements injected into a fixed `.sel-transition` layer:
`.sel-blur` (backdrop-filter), `.sel-box` (violet 1.5px border, `.sel-label`,
4 × `.sel-handle`, `.sel-dims`), `.sel-flash`.

Initial: box `50 × 36` centred on the click point, `opacity 0`, `scale .4`;
handles `scale 0`; boxShadow `0 0 0 rgba(167,139,250,0)`.

| # | Target | Tween | Position |
|---|--------|-------|----------|
| 1 | box | `opacity 1, scale 1` · .18 · `back.out(3)` | |
| 2 | handles | `scale 1` · .15 · stagger .03 · `back.out(4)` | `-=0.05` |
| 3 | blur | `blur(6px) brightness(0.7)` · .25 · `power2.out` | `-=0.1` |
| 4 | box | `boxShadow 0 0 30px rgba(167,139,250,.25)` · .2 | `-=0.2` |
| 5 | — | hold .08 | |
| 6 | box | `width vw+4, height vh+4, left -2, top -2` · .5 · `power4.inOut`, onUpdate writes `W × H` into label + dims | |
| 7 | handles | `scale 1.4` · .08 | |
| 8 | handles | `scale 1` · .12 | |
| 9 | flash | `opacity .1` · .06 | |
| 10 | — | **navigate here**; snapshot ScrollTriggers before, kill them after | |
| 11 | flash | `opacity 0` · .3 · `power2.out` | |
| 12 | blur | `blur(0) brightness(1)` · .3 | `-=0.25` |
| 13 | box | `opacity 0`, boxShadow → 0 · .3 · `power2.out` | `-=0.3` |
| 14 | — | `ScrollTrigger.refresh()`, remove nodes, end transition | |

Reduced motion: navigate immediately, refresh, end — no overlay.

## Case study page

```
section.pd-hero            100vh, flex column, justify-end, padding 5vw, overflow hidden
  img.pd-hero__bg          absolute inset -10% 0 0, height 120%, object-fit cover, opacity .5
                           parallax: yPercent 15, ease none, scrub, trigger .pd-hero top top → bottom top
  .pd-hero__content        z 2
    .pd-hero__eye          mono 14px, tracking .08em, uppercase, mint
    h1.pd-hero__title      display 700, clamp ~102px, line-height .95, tracking -.03em, max-width 1100
    p.pd-hero__desc        18px / 1.7, muted, max-width 600
.container > .pd-editorial grid 280px 840px, gap 80, padding 120 / 140
  aside.pd-sidebar         sticky top 120, align-self start
    .pd-sidebar__block ×4  .pd-sidebar__label (mono 12, mint, uppercase) + .pd-sidebar__val (16/600)
  .pd-content              h3 28/700 mb 24 · p 17 / 1.85 muted mb 24 · ul.pd-highlights gap 12, li 16 pl 20
.metrics-band              INVERTED: bg off-white, text near-black, padding 120, margin-bottom 120
  .metrics-inner           flex, space-around
    .metric                set {opacity 0, y 30}; ScrollTrigger top 85% once
                           → {opacity 1, y 0, .6, delay i*.1}
                           numeric values count up: 1.5s power2.out, delay i*.1+.3
    .metric-num            display 700, clamp(2.5rem,5vw,5rem), line-height 1
    .metric-label          display 15/600 uppercase, tracking .04em, opacity .6, mt 14
.pd-next                   padding 100 0 180, centred
    .pd-next__label        mono 14 uppercase muted, mb 28
    .pd-next__name         display 700 clamp(1.5rem,5vw,4rem), colour transition .3s
```

Next project wraps around the list: `projects[(i + 1) % projects.length]`.
No scroll reveals on the editorial body — only metrics animate.
