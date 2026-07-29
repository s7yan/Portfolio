/**
 * Single GSAP registration point.
 * Import gsap from here everywhere so plugins register exactly once.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);

  // Dev-only handle for debugging animation state from the console.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { gsap?: typeof gsap }).gsap = gsap;
  }
}

export { gsap, ScrollTrigger, useGSAP };
