"use client";

/**
 * Visitor cursor — the "You" pointer.
 *
 * Deliberately simple, matching the reference interaction: a single element
 * holding the arrow and its name tag, tracking the pointer 1:1 with no
 * smoothing, no lag and no hover morphing. The multiplayer read comes from
 * the tag sitting next to a real-feeling pointer, not from cursor physics.
 *
 * The element is ALWAYS rendered so its ref exists when the effect binds —
 * gating the render on state would leave the listener bound to a null ref
 * while the native cursor was already hidden, i.e. no cursor at all.
 * Coarse pointers keep their native cursor and never see this.
 */
import { useEffect, useRef } from "react";
import { Z } from "@/lib/motion";

export function Cursor() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Touch/coarse pointers: leave the platform cursor alone.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    el.classList.add("on");

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    // Don't leave a stray pointer parked on screen when the mouse exits.
    const onLeave = () => el.classList.remove("on");
    const onEnter = () => el.classList.add("on");

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="you-cur"
      aria-hidden="true"
      style={{ zIndex: Z.cursor }}
    >
      <svg width="16" height="20" viewBox="0 0 14 18" fill="none">
        <path
          d="M0.5 0.5L13 10.5H5.5L2.5 17.5L0.5 0.5Z"
          fill="#fff"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="0.5"
        />
      </svg>
      <div className="you-tag">You</div>
    </div>
  );
}
