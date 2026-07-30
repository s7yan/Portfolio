"use client";

/**
 * Boot HUD geometry — an instrument-cluster frame in SVG.
 *
 * Two angular chevrons flank the centre, blue on the left and red on the
 * right, drawn as hairline strokes. Every stroke declares `pathLength={1}`
 * so the draw-on can animate `stroke-dashoffset` from 1 → 0 uniformly,
 * regardless of a path's real length.
 *
 * Targets for the timeline, by data attribute:
 *   data-apex   the pointed corner of each chevron  (drawn first)
 *   data-edge   the long horizontal runs            (drawn second)
 *   data-inner  the parallel inner stroke           (drawn third)
 *   data-micro  tick marks, brackets, indicators    (activated in sequence)
 *   data-sweep  a short dash that travels an edge during diagnostics
 *   data-bar    gauge segments that fill with the counter
 */

/** Segment ticks down the inner gauge column, as on a fuel/temp readout. */
const GAUGE_TICKS = [0, 1, 2, 3, 4, 5];

export function HudFrame() {
  return (
    <svg
      className="hud-svg"
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      fill="none"
    >
      {/* ─────────────── LEFT CHEVRON (blue) ─────────────── */}
      <g className="hud-left">
        <path
          data-apex
          pathLength={1}
          d="M300 96 L128 300 L300 504"
          className="hud-stroke hud-stroke--blue"
        />
        <path
          data-edge
          pathLength={1}
          d="M300 96 L604 96"
          className="hud-stroke hud-stroke--blue"
        />
        <path
          data-edge
          pathLength={1}
          d="M300 504 L604 504"
          className="hud-stroke hud-stroke--blue"
        />
        {/* parallel inner trace, dimmer — the cluster's double outline */}
        <path
          data-inner
          pathLength={1}
          d="M604 122 L318 122 L166 300 L318 478 L604 478"
          className="hud-stroke hud-stroke--blue hud-stroke--dim"
        />
        {/* light sweep that runs the top edge during diagnostics */}
        <path
          data-sweep
          pathLength={1}
          d="M300 96 L604 96"
          className="hud-sweep hud-sweep--blue"
        />

        {/* gauge column */}
        <g data-micro className="hud-gauge">
          <line x1="360" y1="250" x2="360" y2="392" className="hud-hair" />
          {GAUGE_TICKS.map((i) => (
            <line
              key={i}
              data-bar
              x1="366"
              y1={392 - i * 28}
              x2="386"
              y2={392 - i * 28}
              className="hud-bar hud-bar--blue"
            />
          ))}
        </g>

        {/* corner brackets */}
        <path data-micro d="M96 128 L96 96 L128 96" className="hud-hair" />
        <path data-micro d="M96 472 L96 504 L128 504" className="hud-hair" />
        {/* calibration ticks along the top run */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={i}
            data-micro
            x1={340 + i * 38}
            y1="96"
            x2={340 + i * 38}
            y2="82"
            className="hud-hair"
          />
        ))}
      </g>

      {/* ─────────────── RIGHT CHEVRON (red) ─────────────── */}
      <g className="hud-right">
        <path
          data-apex
          pathLength={1}
          d="M1140 96 L1312 300 L1140 504"
          className="hud-stroke hud-stroke--red"
        />
        <path
          data-edge
          pathLength={1}
          d="M1140 96 L836 96"
          className="hud-stroke hud-stroke--red"
        />
        <path
          data-edge
          pathLength={1}
          d="M1140 504 L836 504"
          className="hud-stroke hud-stroke--red"
        />
        <path
          data-inner
          pathLength={1}
          d="M836 122 L1122 122 L1274 300 L1122 478 L836 478"
          className="hud-stroke hud-stroke--red hud-stroke--dim"
        />
        <path
          data-sweep
          pathLength={1}
          d="M1140 96 L836 96"
          className="hud-sweep hud-sweep--red"
        />

        <g data-micro className="hud-gauge">
          <line x1="1080" y1="250" x2="1080" y2="392" className="hud-hair" />
          {GAUGE_TICKS.map((i) => (
            <line
              key={i}
              data-bar
              x1="1054"
              y1={392 - i * 28}
              x2="1074"
              y2={392 - i * 28}
              className="hud-bar hud-bar--red"
            />
          ))}
        </g>

        <path data-micro d="M1344 128 L1344 96 L1312 96" className="hud-hair" />
        <path data-micro d="M1344 472 L1344 504 L1312 504" className="hud-hair" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={i}
            data-micro
            x1={1100 - i * 38}
            y1="96"
            x2={1100 - i * 38}
            y2="82"
            className="hud-hair"
          />
        ))}
      </g>

      {/* centre divider ticks, framing the core readout */}
      <g data-micro>
        <line x1="720" y1="150" x2="720" y2="178" className="hud-hair" />
        <line x1="720" y1="422" x2="720" y2="450" className="hud-hair" />
      </g>
    </svg>
  );
}
