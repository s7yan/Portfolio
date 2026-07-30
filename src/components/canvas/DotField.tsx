"use client";

/**
 * Hero dot field — a grid of dots that is *displaced* by the cursors.
 *
 * Each dot is a little mass on a spring: cursors push it away, the spring
 * pulls it home, damping settles it. That repulsion is what reads as a
 * magnifying bubble travelling under the pointer — the dots aren't
 * brightening, they're getting out of the way.
 *
 * Two cursors act on the field. The visitor's pushes within 150px; the
 * scripted collaborator's pushes harder within 200px and tints the dots it
 * touches violet, so you can see where it is even before it's on screen.
 *
 * Canvas is sized 1:1 with CSS pixels (no DPR scaling): the dots are 1.5px
 * blurs of colour, nothing here benefits from a retina buffer, and the
 * cheaper fill keeps the loop comfortably inside a frame.
 */
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";
import { heroPointers, parkPointer } from "@/lib/heroPointers";
import { FIELD } from "@/lib/motion";

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const { gap, dotRadius, restColor, visitor, collab, spring, damping } = FIELD;

    let dots: Dot[] = [];
    let raf = 0;
    let running = false;

    const build = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dots = [];
      for (let x = 0; x < canvas.width; x += gap) {
        for (let y = 0; y < canvas.height; y += gap) {
          dots.push({ x, y, baseX: x, baseY: y, vx: 0, vy: 0 });
        }
      }
    };

    /** Static render for reduced motion — the grid, no physics. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = restColor;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = canvas.getBoundingClientRect();
      // Pointers are in viewport space; the canvas may be offset (and is
      // transformed by the camera track), so bring them into canvas space.
      const vx = heroPointers.visitor.x - rect.left;
      const vy = heroPointers.visitor.y - rect.top;
      const cx = heroPointers.collab.x - rect.left;
      const cy = heroPointers.collab.y - rect.top;

      for (const d of dots) {
        // ── visitor cursor: push away ──
        const dvx = vx - d.x;
        const dvy = vy - d.y;
        const dv = Math.sqrt(dvx * dvx + dvy * dvy);
        if (dv < visitor.radius && dv > 0) {
          const force = (visitor.radius - dv) / visitor.radius;
          d.vx -= (dvx / dv) * force * visitor.strength;
          d.vy -= (dvy / dv) * force * visitor.strength;
        }

        // ── collaborator cursor: push harder, and tint ──
        const dcx = cx - d.x;
        const dcy = cy - d.y;
        const dc = Math.sqrt(dcx * dcx + dcy * dcy);
        if (dc < collab.radius && dc > 0) {
          const force = (collab.radius - dc) / collab.radius;
          d.vx -= (dcx / dc) * force * collab.strength;
          d.vy -= (dcy / dc) * force * collab.strength;
          ctx.fillStyle = `rgba(167, 139, 250, ${force * collab.tint})`;
        } else {
          ctx.fillStyle = restColor;
        }

        // ── spring home, then damp ──
        d.vx += (d.baseX - d.x) * spring;
        d.vy += (d.baseY - d.y) * spring;
        d.vx *= damping;
        d.vy *= damping;
        d.x += d.vx;
        d.y += d.vy;

        ctx.beginPath();
        ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      build();
      if (reduced) drawStatic();
    };

    /* ── Input: pointer on desktop, device tilt on touch ── */
    const onMove = (e: MouseEvent) => {
      heroPointers.visitor.x = e.clientX;
      heroPointers.visitor.y = e.clientY;
    };
    const onLeave = () => parkPointer("visitor");

    /**
     * Touch devices have no hovering pointer, so the field follows device
     * tilt: gamma (left/right) and beta (front/back), clamped to ±45° and
     * projected from the centre of the screen.
     *
     * iOS 13+ gates this behind DeviceOrientationEvent.requestPermission(),
     * which needs an explicit gesture — we don't prompt, so there the field
     * simply rests.
     */
    const onTilt = (e: DeviceOrientationEvent) => {
      const beta = Math.max(-45, Math.min(45, e.beta ?? 0));
      const gamma = Math.max(-45, Math.min(45, e.gamma ?? 0));
      heroPointers.visitor.x = window.innerWidth / 2 + gamma * 10;
      heroPointers.visitor.y = window.innerHeight / 2 + beta * 10;
    };

    const coarse =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    build();
    window.addEventListener("resize", onResize);

    if (reduced) {
      drawStatic();
      return () => window.removeEventListener("resize", onResize);
    }

    if (coarse) {
      window.addEventListener("deviceorientation", onTilt);
    } else {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseout", onLeave);
    }

    // Only burn frames while the hero is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);
    running = true;
    raf = requestAnimationFrame(frame);

    return () => {
      io.disconnect();
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      /* pointer-events: none is load-bearing. The hero sits inside a
         perspective/preserve-3d context, where a hit-testable full-bleed
         canvas beats the nested draggable layers and swallows pointerdown —
         the name silently stops being draggable. */
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${className ?? ""}`}
    />
  );
}
