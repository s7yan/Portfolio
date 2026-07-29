"use client";

/**
 * Fake multiplayer collaborator cursor — violet arrow + name tag,
 * optionally with a status chip ("editing…"). Positioned by parents
 * via GSAP; this component is purely presentational.
 */
import { forwardRef } from "react";

export const CollabCursor = forwardRef<
  HTMLDivElement,
  { name: string; status?: string; className?: string }
>(function CollabCursor({ name, status, className }, ref) {
  return (
    <div ref={ref} className={`collab-cursor ${className ?? ""}`} aria-hidden="true">
      <svg width="15" height="17" viewBox="0 0 17 19" fill="none">
        <path
          d="M1 1l5.2 15.6 2.7-6.2 6.6-1.9L1 1z"
          fill="#7B5BFF"
          stroke="#0A0A0B"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <div className="collab-tag flex flex-col items-start gap-1">
        {status && <span className="chip chip--ghost">{status}</span>}
        <span className="chip chip--violet">{name}</span>
      </div>
    </div>
  );
});
