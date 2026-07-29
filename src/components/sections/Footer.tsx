"use client";

/**
 * Scene 07 — Footer.
 * "LET'S TALK." display pair + single mono row: email, socials
 * (placeholders clearly marked), copyright. Magnetic email link.
 */
import { site } from "@/content/site";
import { useMagnetic } from "@/hooks/useMagnetic";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Footer() {
  const emailRef = useMagnetic<HTMLAnchorElement>(14);

  return (
    <footer
      id="contact"
      aria-label="Contact"
      className="relative px-[4vw] pt-[14vh] pb-28 md:pb-12"
    >
      <div className="mb-16 flex flex-wrap items-end justify-between gap-10">
        <SectionHeading solid="LET'S" outline="TALK." />
        <a
          ref={emailRef}
          href={`mailto:${site.email}`}
          className="mono-link !text-[0.85rem]"
        >
          {site.email} <span className="arrow">→</span>
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6">
        <ul className="flex flex-wrap gap-7">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                className="mono-label transition-colors hover:text-ink"
                aria-label={
                  s.placeholder ? `${s.label} — link coming soon` : s.label
                }
                {...(s.placeholder
                  ? { "aria-disabled": true, tabIndex: -1, "data-soon": "" }
                  : { target: "_blank", rel: "noopener noreferrer" })}
              >
                {s.label}
                {s.placeholder && (
                  <sup className="ml-1 text-[0.5rem] text-ink-faint">SOON</sup>
                )}
              </a>
            </li>
          ))}
        </ul>
        <p className="mono-label !text-[0.6rem]">{site.copyright}</p>
      </div>
    </footer>
  );
}
