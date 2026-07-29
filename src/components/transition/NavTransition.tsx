"use client";

/**
 * "Navigate" selection-box route transition.
 *
 * The design-tool metaphor extended to routing: clicking draws a small
 * selection box at the pointer, snaps its handles in, blurs the page behind
 * it, then expands the box to the full viewport — reporting live `W × H`
 * dimensions as it grows — flashes, swaps the route, and releases.
 *
 * Timings/eases mirror the reference implementation exactly; see
 * docs/case-study-spec.md for the extracted table.
 */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { NAV_TRANSITION, Z } from "@/lib/motion";
import { useTransition } from "./TransitionProvider";

export function NavTransition() {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const { isTransitioning, clickPosition, executeCallback, endTransition } =
    useTransition();

  useEffect(() => {
    const layer = layerRef.current;
    if (!isTransitioning || !layer) return;

    // Reduced motion: swap the route immediately, no theatre.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      executeCallback();
      ScrollTrigger.refresh();
      endTransition();
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { boxW, boxH, accent } = NAV_TRANSITION;

    // Build the transient chrome.
    const blur = document.createElement("div");
    blur.className = "sel-blur";

    const box = document.createElement("div");
    box.className = "sel-box";
    box.innerHTML = `
      <div class="sel-label">Navigate</div>
      <div class="sel-handle tl"></div>
      <div class="sel-handle tr"></div>
      <div class="sel-handle bl"></div>
      <div class="sel-handle br"></div>
      <div class="sel-dims"></div>
    `;

    const flash = document.createElement("div");
    flash.className = "sel-flash";

    layer.append(blur, box, flash);

    const handles = box.querySelectorAll(".sel-handle");
    const dims = box.querySelector(".sel-dims") as HTMLElement;
    const label = box.querySelector(".sel-label") as HTMLElement;

    gsap.set(box, {
      width: boxW,
      height: boxH,
      left: clickPosition.x - boxW / 2,
      top: clickPosition.y - boxH / 2,
      opacity: 0,
      scale: 0.4,
    });
    gsap.set(handles, { scale: 0 });
    gsap.set(dims, { opacity: 1 });
    box.style.boxShadow = `0 0 0px ${accent.shadowFrom}`;

    const tl = gsap.timeline();

    tl.to(box, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(3)" })
      .to(
        handles,
        { scale: 1, duration: 0.15, stagger: 0.03, ease: "back.out(4)" },
        "-=0.05"
      )
      .to(
        blur,
        {
          backdropFilter: "blur(6px) brightness(0.7)",
          webkitBackdropFilter: "blur(6px) brightness(0.7)",
          duration: 0.25,
          ease: "power2.out",
        },
        "-=0.1"
      )
      .to(
        box,
        { boxShadow: `0 0 30px ${accent.shadowTo}`, duration: 0.2 },
        "-=0.2"
      )
      // Beat before the box takes over the screen.
      .to({}, { duration: 0.08 })
      .to(box, {
        width: vw + 4,
        height: vh + 4,
        left: -2,
        top: -2,
        duration: 0.5,
        ease: "power4.inOut",
        onUpdate() {
          const w = Math.round(Number(gsap.getProperty(box, "width")));
          const h = Math.round(Number(gsap.getProperty(box, "height")));
          const text = `${w} × ${h}`;
          dims.textContent = text;
          label.textContent = text;
        },
      })
      .to(handles, { scale: 1.4, duration: 0.08 })
      .to(handles, { scale: 1, duration: 0.12 })
      .to(flash, { opacity: 0.1, duration: 0.06 })
      .call(() => {
        // Snapshot the outgoing page's triggers, navigate, then retire them —
        // so the incoming page's triggers survive.
        const stale = ScrollTrigger.getAll();
        executeCallback();
        stale.forEach((t) => t.kill());
      })
      .to(flash, { opacity: 0, duration: 0.3, ease: "power2.out" })
      .to(
        blur,
        {
          backdropFilter: "blur(0px) brightness(1)",
          webkitBackdropFilter: "blur(0px) brightness(1)",
          duration: 0.3,
        },
        "-=0.25"
      )
      .to(
        box,
        {
          opacity: 0,
          boxShadow: `0 0 0px ${accent.shadowFrom}`,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.3"
      )
      .call(() => {
        ScrollTrigger.refresh();
        blur.remove();
        box.remove();
        flash.remove();
        endTransition();
      });

    return () => {
      tl.kill();
      blur.remove();
      box.remove();
      flash.remove();
    };
  }, [isTransitioning, clickPosition, executeCallback, endTransition]);

  return (
    <div
      ref={layerRef}
      className="sel-transition"
      aria-hidden="true"
      style={{ display: isTransitioning ? "block" : "none", zIndex: Z.transition }}
    />
  );
}
