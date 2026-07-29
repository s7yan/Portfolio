"use client";

/**
 * Custom multiplayer-style cursor.
 *
 * - Arrow + "You" name tag follow the pointer with layered lag
 * - Morphs on interactive targets:
 *     [data-cursor="label"]  + data-cursor-label="View"  → tag swaps text
 *     [data-cursor="press"]  → arrow scales down (press affordance)
 *     a, button              → subtle scale up
 * - Blend-mode ring for imagery via [data-cursor="invert"]
 * - Fine pointers only; reduced-motion drops the lag easing
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { CURSOR, Z } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";

export function Cursor() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState("You");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const reduced = prefersReducedMotion();
    const arrow = arrowRef.current!;
    const tag = tagRef.current!;

    const arrowX = gsap.quickTo(arrow, "x", {
      duration: reduced ? 0 : 1 - CURSOR.dotLerp,
      ease: "power3.out",
    });
    const arrowY = gsap.quickTo(arrow, "y", {
      duration: reduced ? 0 : 1 - CURSOR.dotLerp,
      ease: "power3.out",
    });
    const tagX = gsap.quickTo(tag, "x", {
      duration: reduced ? 0 : 1 - CURSOR.tagLerp,
      ease: "power3.out",
    });
    const tagY = gsap.quickTo(tag, "y", {
      duration: reduced ? 0 : 1 - CURSOR.tagLerp,
      ease: "power3.out",
    });

    let visible = false;

    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to(rootRef.current, { autoAlpha: 1, duration: 0.25 });
      }
      arrowX(e.clientX);
      arrowY(e.clientY);
      tagX(e.clientX + 14);
      tagY(e.clientY + 18);

      // Target interrogation — closest annotated interactive element
      const t = e.target as HTMLElement;
      const annotated = t.closest<HTMLElement>("[data-cursor-label]");
      setLabel(annotated?.dataset.cursorLabel || "You");

      const interactive = t.closest("a, button, [role='button'], [data-cursor]");
      gsap.to(arrow, {
        scale: interactive ? 0.8 : 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      visible = false;
      gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () =>
      gsap.to(arrow, { scale: CURSOR.scaleDown, duration: 0.15, ease: "power2.out" });
    const onUp = () =>
      gsap.to(arrow, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.6)" });

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!enabled) {
    // Server render + touch devices: nothing (native cursor remains)
    return null;
  }

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 opacity-0"
      style={{ zIndex: Z.cursor }}
    >
      {/* Arrow */}
      <div ref={arrowRef} className="absolute -ml-[2px] -mt-[2px] will-change-transform">
        <svg width="17" height="19" viewBox="0 0 17 19" fill="none">
          <path
            d="M1 1l5.2 15.6 2.7-6.2 6.6-1.9L1 1z"
            fill="#EDEDEF"
            stroke="#0A0A0B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Name tag (lags behind the arrow) */}
      <div ref={tagRef} className="absolute will-change-transform">
        <span className="chip chip--ink shadow-lg">{label}</span>
      </div>
    </div>
  );
}
