"use client";

/**
 * Full-screen mobile navigation overlay.
 * Links stagger in with masked rises; Escape and link-tap close it.
 */
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, STAGGER, Z } from "@/lib/motion";
import { site } from "@/content/site";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (open) {
        gsap.set(root, { pointerEvents: "auto" });
        gsap.to(root, { autoAlpha: 1, duration: 0.35, ease: EASE.ui });
        gsap.fromTo(
          root.querySelectorAll(".mask-inner"),
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.7,
            ease: EASE.out,
            stagger: STAGGER.lines,
            delay: 0.08,
          }
        );
      } else {
        gsap.set(root, { pointerEvents: "none" });
        gsap.to(root, { autoAlpha: 0, duration: 0.3, ease: EASE.ui });
      }
    },
    { dependencies: [open] }
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      className="dot-grid fixed inset-0 flex flex-col justify-center bg-canvas px-[8vw] opacity-0"
      style={{ zIndex: Z.menu, pointerEvents: "none" }}
    >
      <nav>
        <ul className="flex flex-col gap-2">
          {LINKS.map((link, i) => (
            <li key={link.href} className="mask">
              <span className="mask-inner">
                <a
                  href={link.href}
                  onClick={onClose}
                  className="display flex items-baseline gap-4 text-[13vw] text-ink"
                >
                  <span className="mono-label w-8">0{i + 1}</span>
                  {link.label}
                </a>
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mono-label absolute bottom-10 left-[8vw]">
        {site.email}
      </p>
    </div>
  );
}
