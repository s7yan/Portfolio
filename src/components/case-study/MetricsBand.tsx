"use client";

/**
 * Inverted results band. Each metric rises into place on scroll; numeric
 * values count up from zero, directional ones (↑/↓) simply appear.
 */
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import type { ProjectStat } from "@/content/projects";

/** Arrow glyphs for directional metrics. */
const ARROW: Record<string, string> = { up: "↑", down: "↓" };

function Metric({ stat, index }: { stat: ProjectStat; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLDivElement | null>(null);

  const raw = ARROW[stat.value] ?? stat.value;
  const isNumeric = /\d/.test(raw);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) return;

      gsap.set(el, { opacity: 0, y: 30 });

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.6, delay: index * 0.1 });

          if (!isNumeric) return;
          // Count the numeric portion up, preserving any prefix/suffix.
          const match = raw.match(/[\d.]+/);
          const target = match ? parseFloat(match[0]) : 0;
          const prefix = raw.match(/^[^\d]*/)?.[0] ?? "";
          const suffix = raw.match(/[^\d]*$/)?.[0] ?? "";
          if (target <= 0) return;

          const counter = { val: 0 };
          gsap.to(counter, {
            val: target,
            duration: 1.5,
            delay: index * 0.1 + 0.3,
            ease: "power2.out",
            onUpdate: () => {
              const shown = raw.includes(".")
                ? counter.val.toFixed(1)
                : Math.round(counter.val);
              if (numRef.current) {
                numRef.current.textContent = `${prefix}${shown}${suffix}`;
              }
            },
          });
        },
      });

      return () => trigger.kill();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={`metric ${isNumeric ? "" : "metric--text"}`}>
      <div className="metric-num-wrap">
        <div ref={numRef} className="metric-num">
          {raw}
        </div>
      </div>
      <div className="metric-label">{stat.label}</div>
    </div>
  );
}

export function MetricsBand({ metrics }: { metrics: ProjectStat[] }) {
  return (
    <div className="metrics-band">
      <div className="metrics-inner">
        {metrics.map((m, i) => (
          <Metric key={m.label} stat={m} index={i} />
        ))}
      </div>
    </div>
  );
}
