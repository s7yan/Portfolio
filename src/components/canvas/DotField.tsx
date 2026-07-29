"use client";

/**
 * Interactive dot-field canvas — the hero "artboard".
 * Dots brighten and shift toward violet near the pointer, giving the
 * design-tool canvas a living surface. Canvas 2D, DPR-capped, and
 * paused when off-screen or when reduced motion is preferred.
 */
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";

const GAP = 26;
const BASE_ALPHA = 0.10;
const NEAR_RADIUS = 180;

export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) drawStatic();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(237,237,239,${BASE_ALPHA})`;
      for (let x = GAP / 2; x < w; x += GAP) {
        for (let y = GAP / 2; y < h; y += GAP) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let x = GAP / 2; x < w; x += GAP) {
        for (let y = GAP / 2; y < h; y += GAP) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const d = Math.hypot(dx, dy);
          const near = Math.max(0, 1 - d / NEAR_RADIUS);

          if (near > 0.01) {
            // Violet glow near the pointer
            const a = BASE_ALPHA + near * 0.5;
            ctx.fillStyle = `rgba(167,139,255,${a})`;
            ctx.beginPath();
            ctx.arc(x, y, 1 + near * 1.3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(237,237,239,${BASE_ALPHA})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    /**
     * Touch devices have no pointer to follow, so the field tracks device
     * tilt instead: gamma (left/right) and beta (front/back), clamped to
     * ±45° and projected out from the centre of the screen.
     *
     * iOS 13+ gates this behind DeviceOrientationEvent.requestPermission(),
     * which needs an explicit user gesture — we don't prompt, so there the
     * field simply rests until the visitor drags something.
     */
    const onTilt = (e: DeviceOrientationEvent) => {
      const rect = canvas.getBoundingClientRect();
      const beta = Math.max(-45, Math.min(45, e.beta ?? 0));
      const gamma = Math.max(-45, Math.min(45, e.gamma ?? 0));
      mouse.x = window.innerWidth / 2 + gamma * 10 - rect.left;
      mouse.y = window.innerHeight / 2 + beta * 10 - rect.top;
    };

    const coarse =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    resize();
    window.addEventListener("resize", resize);

    if (!reduced) {
      if (coarse) {
        window.addEventListener("deviceorientation", onTilt);
      } else {
        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseout", onLeave);
      }

      // Pause rendering when the hero leaves the viewport
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!running) {
              running = true;
              raf = requestAnimationFrame(draw);
            }
          } else {
            running = false;
            cancelAnimationFrame(raf);
          }
        },
        { threshold: 0 }
      );
      io.observe(canvas);
      raf = requestAnimationFrame(draw);

      return () => {
        io.disconnect();
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("deviceorientation", onTilt);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseout", onLeave);
      };
    }

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}
