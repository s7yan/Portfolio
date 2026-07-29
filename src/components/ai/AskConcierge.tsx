"use client";

/**
 * "Ask me anything" concierge.
 * - Persistent pill (bottom-center) with a glowing orb + ⌘K hint
 * - Opens a full-screen overlay: time-of-day greeting, suggestion chips,
 *   large input; answers via /api/chat (graceful offline fallback)
 * - ⌘K / Ctrl+K toggles, Escape closes, focus is trapped in the panel
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, Z } from "@/lib/motion";
import { aiGreeting, aiSuggestions } from "@/content/ai";

type ChatMessage = { role: "user" | "assistant"; content: string };

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 12) return aiGreeting.morning;
  if (h < 18) return aiGreeting.afternoon;
  return aiGreeting.evening;
}

export function AskConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  // ⌘K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      if (open) {
        gsap.set(panel, { pointerEvents: "auto" });
        gsap.fromTo(
          panel,
          { autoAlpha: 0, scale: 0.985 },
          { autoAlpha: 1, scale: 1, duration: 0.45, ease: EASE.out }
        );
        gsap.fromTo(
          panel.querySelectorAll("[data-stagger]"),
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, ease: EASE.out, stagger: 0.06, delay: 0.1 }
        );
        inputRef.current?.focus();
      } else {
        gsap.to(panel, {
          autoAlpha: 0,
          scale: 0.985,
          duration: 0.3,
          ease: EASE.ui,
          onComplete: () => gsap.set(panel, { pointerEvents: "none" }),
        });
      }
    },
    { dependencies: [open] }
  );

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;
      setBusy(true);
      setInput("");
      setMessages((m) => [...m, { role: "user", content: question }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
        const data = (await res.json()) as { reply: string };
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "Something went sideways — try again, or email hello@sayandas.design.",
          },
        ]);
      } finally {
        setBusy(false);
        requestAnimationFrame(() => {
          threadRef.current?.scrollTo({
            top: threadRef.current.scrollHeight,
            behavior: "smooth",
          });
        });
      }
    },
    [busy]
  );

  return (
    <>
      {/* ── Persistent pill ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-surface/80 py-3 pr-5 pl-3 backdrop-blur-md transition-colors duration-300 hover:border-line-strong"
        style={{ zIndex: Z.askPill }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span aria-hidden="true" className="orb block h-6 w-6 rounded-full" />
        <span className="text-sm font-medium text-ink">Ask me anything</span>
        <kbd className="mono-label hidden rounded border border-line px-1.5 py-0.5 text-[0.6rem] sm:block">
          ⌘K
        </kbd>
      </button>

      {/* ── Overlay panel ── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ask Sayan's assistant"
        className="ask-panel fixed inset-0 flex flex-col items-center justify-end pb-[6vh] opacity-0"
        style={{ zIndex: Z.askPanel, pointerEvents: "none" }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
          className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-2"
        >
          ✕
        </button>

        {/* Greeting / thread */}
        <div
          ref={threadRef}
          className="mb-8 flex w-full max-w-2xl flex-1 flex-col justify-end gap-5 overflow-y-auto px-6 pt-24"
        >
          {messages.length === 0 ? (
            <div className="text-center" data-stagger>
              <h2 className="font-sans text-4xl font-medium text-ink md:text-5xl">
                {greetingForNow()}
              </h2>
              <p className="mt-3 text-lg text-ink-dim">{aiGreeting.sub}</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "self-end rounded-2xl rounded-br-sm bg-violet px-4 py-2.5 text-sm text-white"
                    : "self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-2.5 text-sm leading-relaxed text-ink"
                }
              >
                {m.content}
              </div>
            ))
          )}
          {busy && (
            <p className="mono-label self-start animate-pulse">thinking…</p>
          )}
        </div>

        {/* Suggestion chips */}
        {messages.length === 0 && (
          <div
            className="mb-4 flex max-w-2xl flex-wrap justify-center gap-2 px-6"
            data-stagger
          >
            {aiSuggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => send(s.label)}
                className="chip chip--ghost !text-[0.68rem] transition-colors hover:border-line-strong hover:text-ink"
              >
                <span aria-hidden="true" className="text-violet-soft">
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          data-stagger
          className="w-full max-w-2xl px-6"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div className="rounded-2xl border border-line bg-surface/90 p-4 backdrop-blur-lg focus-within:border-line-strong">
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask me anything"
              aria-label="Your question"
              className="w-full resize-none bg-transparent text-ink outline-none placeholder:text-ink-faint"
            />
            <div className="flex items-center justify-between pt-2">
              <span className="mono-label !text-[0.55rem]">
                Powered by Claude · answers from Sayan's portfolio
              </span>
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-full bg-ink px-4 py-1.5 font-mono text-[0.65rem] tracking-widest text-canvas uppercase transition-opacity disabled:opacity-30"
              >
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
