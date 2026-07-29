"use client";

/**
 * The collaborator's presence: violet arrow + name tag, an optional
 * `key → value` property readout above it, and an optional chat bubble
 * below it. Position is written imperatively by the choreography hook.
 */
import { forwardRef } from "react";

export const CollabPointer = forwardRef<
  HTMLDivElement,
  {
    name: string;
    visible: boolean;
    status?: string | null;
    message?: string | null;
    flipped?: boolean;
  }
>(function CollabPointer({ name, visible, status, message, flipped }, ref) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="collab-pointer"
      data-visible={visible ? "" : undefined}
    >
      <svg width="15" height="17" viewBox="0 0 17 19" fill="none">
        <path
          d="M1 1l5.2 15.6 2.7-6.2 6.6-1.9L1 1z"
          fill="var(--color-violet)"
          stroke="var(--color-canvas)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>

      <div className="collab-stack">
        {status && <span className="chip chip--ghost">{status}</span>}
        <span className="chip chip--violet">{name}</span>
        {message !== null && message !== undefined && (
          <div className="chat-bubble" data-flip={flipped ? "" : undefined}>
            {message}
            <span className="chat-caret" />
          </div>
        )}
      </div>
    </div>
  );
});
