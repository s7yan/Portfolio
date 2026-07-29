"use client";

/**
 * Lenis smooth scroll wired into GSAP's ticker + ScrollTrigger.
 * Disabled automatically for prefers-reduced-motion.
 */
import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LENIS } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  /* Held in state as well as a ref: the context value must actually change
     once Lenis exists, otherwise consumers keep the initial null forever. */
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Native scroll; still refresh triggers after layout settles.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: LENIS.duration,
      wheelMultiplier: LENIS.wheelMultiplier,
      touchMultiplier: LENIS.touchMultiplier,
    });
    lenisRef.current = lenis;
    setLenis(lenis);

    // Dev-only handle: Lenis owns the scroll position, so window.scrollTo is
    // fought off on the next frame. Exposing the instance makes it possible
    // to drive scroll from the console/automation while debugging.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
