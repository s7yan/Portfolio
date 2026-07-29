"use client";

/**
 * Persistent header: wordmark + live local clock (desktop) and a
 * "Menu" toggle on mobile that opens the overlay navigation.
 */
import { useState } from "react";
import { site } from "@/content/site";
import { useClock } from "@/hooks/useClock";
import { MobileMenu } from "@/components/nav/MobileMenu";
import { Z } from "@/lib/motion";

export function Header() {
  const time = useClock(site.location.timeZone);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 flex items-center justify-between px-[4vw] py-5"
        style={{ zIndex: Z.header }}
      >
        <a
          href="#content"
          className="font-sans text-[15px] font-bold tracking-[0.02em] text-ink uppercase"
          aria-label={`${site.name} — back to top`}
        >
          {site.name}
        </a>

        {/* Live local clock — suppress until mounted to avoid mismatch */}
        <p className="mono-label hidden md:block" suppressHydrationWarning>
          {site.location.city},&nbsp;{site.location.country} —{" "}
          {time ?? "00:00:00"}&nbsp;{site.location.tzLabel}
        </p>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="mono-label flex items-center gap-3 text-ink md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "Close" : "Menu"}
          <span aria-hidden="true" className="flex w-7 flex-col gap-[6px]">
            <span
              className="h-[2px] bg-ink transition-transform duration-300"
              style={{
                transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="h-[2px] bg-ink transition-transform duration-300"
              style={{
                transform: menuOpen ? "translateY(-4px) rotate(-45deg)" : "none",
              }}
            />
          </span>
        </button>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
