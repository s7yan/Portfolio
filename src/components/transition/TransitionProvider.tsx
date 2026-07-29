"use client";

/**
 * Route-transition coordination.
 *
 * A link records where it was clicked and hands over a callback; the overlay
 * plays its timeline and invokes that callback at the exact frame the new
 * route should mount, then signals completion.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface TransitionState {
  isTransitioning: boolean;
  clickPosition: { x: number; y: number };
  /** Begin a transition from a click point, deferring `run` to mid-timeline. */
  startTransition: (x: number, y: number, run: () => void) => void;
  /** Called by the overlay when the route should actually change. */
  executeCallback: () => void;
  /** Called by the overlay once the timeline has fully unwound. */
  endTransition: () => void;
}

const Ctx = createContext<TransitionState | null>(null);

export function useTransition(): TransitionState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useTransition must be used inside <TransitionProvider>");
  }
  return ctx;
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const pending = useRef<(() => void) | null>(null);

  const startTransition = useCallback(
    (x: number, y: number, run: () => void) => {
      // Ignore re-entrant clicks while a transition is already playing.
      if (pending.current) return;
      pending.current = run;
      setClickPosition({ x, y });
      setIsTransitioning(true);
    },
    []
  );

  const executeCallback = useCallback(() => {
    pending.current?.();
    pending.current = null;
  }, []);

  const endTransition = useCallback(() => {
    pending.current = null;
    setIsTransitioning(false);
  }, []);

  const value = useMemo(
    () => ({
      isTransitioning,
      clickPosition,
      startTransition,
      executeCallback,
      endTransition,
    }),
    [isTransitioning, clickPosition, startTransition, executeCallback, endTransition]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
