"use client";

/**
 * Case study hero — full-viewport image with the title stack anchored to the
 * bottom. The background is oversized (120% height, inset -10%) so it can
 * parallax on scroll without exposing an edge.
 */
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import type { ImageCredit } from "@/content/projects";

export function CaseHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  credit,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  /** Shown when the imagery is third-party (attribution licences). */
  credit?: ImageCredit;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !bgRef.current) return;
      const tween = gsap.to(bgRef.current, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      return () => tween.scrollTrigger?.kill();
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="pd-hero">
      <div ref={bgRef} className="pd-hero__bg">
        <Image src={image} alt={imageAlt} fill priority className="object-cover" />
      </div>

      <div className="pd-hero__content container">
        <p className="pd-hero__eye">{eyebrow}</p>
        <h1 className="pd-hero__title">{title}</h1>
        <p className="pd-hero__desc">{description}</p>
      </div>

      {credit && (
        <p className="pd-hero__credit">
          Photo{" "}
          <a href={credit.href} target="_blank" rel="noopener noreferrer">
            {credit.author}
          </a>{" "}
          ·{" "}
          <a
            href={credit.licenseHref}
            target="_blank"
            rel="noopener noreferrer license"
          >
            {credit.license}
          </a>
        </p>
      )}
    </section>
  );
}
