"use client";

/**
 * Section header in the solid/outline display pair
 * (e.g. "FEATURED" solid + "WORK" outline), with a masked rise on enter.
 */
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { DUR, EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";

export function SectionHeading({
  solid,
  outline,
  as: Tag = "h2",
  className,
}: {
  solid: string;
  outline?: string;
  as?: "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const inner = ref.current.querySelector(".mask-inner");
      if (!inner) return;
      gsap.fromTo(
        inner,
        { yPercent: 115, rotate: 0.6 },
        {
          yPercent: 0,
          rotate: 0,
          duration: DUR.lg,
          ease: EASE.out,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <Tag
      ref={ref}
      className={`display mask text-[clamp(2.2rem,7vw,5.5rem)] text-ink ${className ?? ""}`}
    >
      <span className="mask-inner">
        {solid}
        {outline && (
          <>
            {" "}
            <span className="display-outline">{outline}</span>
          </>
        )}
      </span>
    </Tag>
  );
}
