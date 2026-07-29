"use client";

/**
 * Hero design-surface choreography.
 *
 * Owns two interleaved behaviours:
 *
 * 1. AMBIENT SEQUENCE — a scripted "collaborator" pointer glides in, selects
 *    each layer in turn, tweaks a property on it (tracking, stroke), then
 *    rubber-band selects the subtitle, deletes it character by character and
 *    retypes the real tagline, and finally exits off-screen.
 *
 * 2. DRAG CHOREOGRAPHY — either name line can be dragged. While dragging, a
 *    leader line stretches back to the layer's origin with a live `dx/dy`
 *    readout. On release the layer realigns itself ("Aligning to Grid…") and
 *    the collaborator types a (mildly annoyed) chat message about it.
 *
 * The visitor always wins: grabbing a layer cancels whatever the ambient
 * sequence was doing, and the sequence never fights the pointer.
 *
 * Per-frame values (pointer glide, dragged transform, leader-line geometry)
 * are written straight to the DOM; anything that changes at human pace is
 * React state so the markup stays declarative.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { HERO } from "@/lib/motion";
import { heroScene } from "@/content/hero";
import { prefersReducedMotion } from "@/lib/utils";
import { onSiteReady } from "@/components/preloader/Preloader";

/** Visual state a draggable layer can be in. */
export type LayerState = "idle" | "focus" | "editing" | "dragging";

export interface HeroRefs {
  root: React.RefObject<HTMLElement | null>;
  first: React.RefObject<HTMLDivElement | null>;
  last: React.RefObject<HTMLDivElement | null>;
  subtitle: React.RefObject<HTMLParagraphElement | null>;
  pointer: React.RefObject<HTMLDivElement | null>;
  marquee: React.RefObject<HTMLDivElement | null>;
  leader: React.RefObject<SVGPathElement | null>;
  delta: React.RefObject<HTMLDivElement | null>;
}

export interface HeroChoreography {
  /** Per-layer visual state. */
  states: { first: LayerState; last: LayerState; subtitle: LayerState };
  /** Chip text per layer (layer name, or the drag affordance). */
  labels: { first: string; last: string; subtitle: string };
  /** Live subtitle text (retyped by the sequence). */
  subtitleText: string;
  collabVisible: boolean;
  /** `key → value` property readout beside the collaborator pointer. */
  collabStatus: string | null;
  /** Chat bubble text; null when hidden. */
  collabMessage: string | null;
  /** Bubble opens to the left when near the viewport edge. */
  bubbleFlipped: boolean;
  dragActive: boolean;
  /** Attach to each draggable layer. */
  onLayerPointerDown: (which: "first" | "last") => (e: React.PointerEvent) => void;
  onLayerEnter: (which: "first" | "last") => void;
  onLayerLeave: () => void;
}

type Which = "first" | "last";

export function useHeroChoreography(refs: HeroRefs): HeroChoreography {
  const [states, setStates] = useState<HeroChoreography["states"]>({
    first: "idle",
    last: "idle",
    subtitle: "idle",
  });
  const [labels, setLabels] = useState<HeroChoreography["labels"]>({
    first: heroScene.layers.first,
    last: heroScene.layers.last,
    subtitle: heroScene.layers.subtitle,
  });
  const [subtitleText, setSubtitleText] = useState<string>(
    heroScene.subtitleInitial
  );
  const [collabVisible, setCollabVisible] = useState(false);
  const [collabStatus, setCollabStatus] = useState<string | null>(null);
  const [collabMessage, setCollabMessage] = useState<string | null>(null);
  const [bubbleFlipped, setBubbleFlipped] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /** Mutable machine state — never triggers renders. */
  const s = useRef({
    /** Bumped to invalidate any in-flight async routine. */
    run: 0,
    disposed: false,
    dragEnabled: false,
    /** True while the stage is owned by a scripted routine. */
    locked: false,
    dragging: null as Which | null,
    /** Layer currently wearing the DRAG TO MOVE chip. */
    focus: "first" as Which,
    pointer: { x: 0, y: 0, tx: 0, ty: 0 },
    /** Drag bookkeeping. */
    origin: { x: 0, y: 0 },
    grab: { x: 0, y: 0 },
    offset: { first: { x: 0, y: 0 }, last: { x: 0, y: 0 } },
    messageIndex: 0,
    reduced: false,
  });

  const elFor = useCallback(
    (which: Which) => (which === "first" ? refs.first.current : refs.last.current),
    [refs.first, refs.last]
  );

  /* ────────────────────────────────────────────────────────────────
     Cancellable sleep — resolves false when its run was invalidated.
     ──────────────────────────────────────────────────────────────── */
  const sleep = useCallback((ms: number, run: number) => {
    return new Promise<boolean>((resolve) => {
      window.setTimeout(
        () => resolve(!s.current.disposed && s.current.run === run),
        ms
      );
    });
  }, []);

  /* ────────────────────────────────────────────────────────────────
     Pointer glide + drag geometry, once per frame.
     ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (prefersReducedMotion()) {
      s.current.reduced = true;
      // Reduced motion: land on the finished copy, no ambient theatre.
      setSubtitleText(heroScene.subtitleFinal);
      return;
    }

    let raf = 0;
    const tick = () => {
      const st = s.current;
      const p = st.pointer;
      p.x += (p.tx - p.x) * HERO.collab.lerp;
      p.y += (p.ty - p.y) * HERO.collab.lerp;
      if (refs.pointer.current) {
        refs.pointer.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [refs.pointer]);

  /** Point the collaborator pointer at viewport coordinates. */
  const aimPointer = useCallback((x: number, y: number) => {
    s.current.pointer.tx = x;
    s.current.pointer.ty = y;
  }, []);

  /** Aim at an element's centre (optionally biased across its box). */
  const aimAtElement = useCallback(
    (el: HTMLElement | null, biasX = 0.5, biasY = 0.5) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      aimPointer(r.left + r.width * biasX, r.top + r.height * biasY);
    },
    [aimPointer]
  );

  /* ────────────────────────────────────────────────────────────────
     Ambient collaborator sequence.
     ──────────────────────────────────────────────────────────────── */
  const runSequence = useCallback(async () => {
    const run = ++s.current.run;
    const ok = () => !s.current.disposed && s.current.run === run;
    s.current.locked = true;

    const firstEl = refs.first.current;
    const lastEl = refs.last.current;
    const subEl = refs.subtitle.current;
    if (!firstEl || !lastEl || !subEl) return;

    // Enter from off-screen top-left.
    s.current.pointer.x = -140;
    s.current.pointer.y = -120;
    aimAtElement(firstEl);
    setCollabVisible(true);
    if (!(await sleep(HERO.collab.travel, run))) return;

    // ── Layer 1: first name — tracking ──
    setStates((v) => ({ ...v, first: "editing" }));
    setLabels((v) => ({ ...v, first: heroScene.layers.first }));
    setCollabStatus(
      `${heroScene.edits.tracking.key} → ${heroScene.edits.tracking.value}`
    );
    gsap.to(firstEl, { x: HERO.collab.nudgePx, duration: HERO.collab.nudgeSec });
    if (!(await sleep(HERO.collab.dwell, run))) return;

    gsap.to(firstEl, { x: 0, duration: HERO.collab.nudgeSec });
    setStates((v) => ({ ...v, first: "idle" }));
    setCollabStatus(null);

    // ── Layer 2: last name — stroke colour ──
    aimAtElement(lastEl, 0.6);
    if (!(await sleep(HERO.collab.travel, run))) return;

    setStates((v) => ({ ...v, last: "editing" }));
    setLabels((v) => ({ ...v, last: heroScene.layers.last }));
    setCollabStatus(
      `${heroScene.edits.stroke.key} → ${heroScene.edits.stroke.value}`
    );
    lastEl.style.setProperty(
      "--stroke-color",
      heroScene.edits.stroke.value
    );
    if (!(await sleep(HERO.collab.dwell, run))) return;

    lastEl.style.removeProperty("--stroke-color");
    setStates((v) => ({ ...v, last: "idle" }));
    setCollabStatus(null);

    // ── Layer 3: subtitle — rubber-band select, then retype ──
    const subRect = subEl.getBoundingClientRect();
    const startX = subRect.left - 60;
    const startY = subRect.top - 40;
    aimPointer(startX, startY);
    if (!(await sleep(HERO.collab.travel, run))) return;

    const marquee = refs.marquee.current;
    if (marquee) {
      marquee.style.opacity = "1";
      marquee.style.left = `${startX}px`;
      marquee.style.top = `${startY}px`;
      marquee.style.width = "0px";
      marquee.style.height = "0px";
    }
    aimPointer(subRect.right + 40, subRect.bottom + 40);

    // Grow the marquee to follow the pointer for the duration of the sweep.
    const grow = window.setInterval(() => {
      if (!marquee || !ok()) return;
      const p = s.current.pointer;
      marquee.style.width = `${Math.max(0, p.x - startX)}px`;
      marquee.style.height = `${Math.max(0, p.y - startY)}px`;
    }, 16);
    const swept = await sleep(HERO.collab.marquee, run);
    window.clearInterval(grow);
    if (!swept) return;

    if (marquee) marquee.style.opacity = "0";
    setStates((v) => ({ ...v, subtitle: "editing" }));
    setCollabStatus(
      `${heroScene.edits.content.key} → ${heroScene.edits.content.value}`
    );
    aimAtElement(subEl, 1, 1);
    if (!(await sleep(HERO.collab.preEdit, run))) return;

    // Delete the placeholder…
    let text: string = heroScene.subtitleInitial;
    while (text.length > 0) {
      text = text.slice(0, -1);
      setSubtitleText(text);
      if (!(await sleep(HERO.collab.deleteChar, run))) return;
    }
    if (!(await sleep(HERO.collab.pauseBetween, run))) return;

    // …and type the real tagline.
    const target = heroScene.subtitleFinal;
    for (let i = 0; i <= target.length; i++) {
      setSubtitleText(target.slice(0, i));
      if (!(await sleep(HERO.collab.typeChar, run))) return;
    }
    if (!(await sleep(HERO.collab.afterType, run))) return;

    // Exit stage right.
    setStates((v) => ({ ...v, subtitle: "idle" }));
    setCollabStatus(null);
    aimPointer(window.innerWidth + 200, -100);
    if (!(await sleep(HERO.collab.exit, run))) return;
    setCollabVisible(false);
    s.current.locked = false;
  }, [
    refs.first,
    refs.last,
    refs.subtitle,
    refs.marquee,
    aimAtElement,
    aimPointer,
    sleep,
  ]);

  /* ────────────────────────────────────────────────────────────────
     Post-release: realign the layer, then have the collaborator react.
     ──────────────────────────────────────────────────────────────── */
  const runRealign = useCallback(
    async (which: Which) => {
      const run = ++s.current.run;
      const ok = () => !s.current.disposed && s.current.run === run;
      const el = elFor(which);
      if (!el) return;
      s.current.locked = true;

      if (!(await sleep(HERO.drag.settleDelay, run))) return;

      setStates((v) => ({ ...v, [which]: "editing" }));
      setLabels((v) => ({ ...v, [which]: heroScene.layers.aligning }));
      setCollabVisible(true);
      aimAtElement(el);

      await new Promise<void>((resolve) => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: HERO.drag.snapSec,
          ease: "power3.inOut",
          onUpdate: () => aimAtElement(el),
          onComplete: resolve,
        });
      });
      s.current.offset[which] = { x: 0, y: 0 };
      if (!ok()) return;
      if (!(await sleep(HERO.drag.afterSnap, run))) return;

      setStates((v) => ({ ...v, [which]: "idle" }));
      setLabels((v) => ({ ...v, [which]: heroScene.layers[which] }));

      // Collaborator types their reaction.
      const message = heroScene.messages[s.current.messageIndex];
      s.current.messageIndex =
        (s.current.messageIndex + 1) % heroScene.messages.length;
      setBubbleFlipped(
        window.innerWidth - s.current.pointer.x < HERO.drag.flipEdge
      );
      setCollabMessage("");
      if (!(await sleep(HERO.drag.bubbleDelay, run))) return;

      for (let i = 0; i <= message.length; i++) {
        setCollabMessage(message.slice(0, i));
        const jitter =
          HERO.drag.bubbleCharMin + Math.random() * HERO.drag.bubbleCharJitter;
        if (!(await sleep(jitter, run))) return;
      }
      if (!(await sleep(HERO.drag.bubbleHold, run))) return;

      setCollabMessage(null);
      aimPointer(window.innerWidth + 200, -100);
      if (!(await sleep(HERO.collab.exit, run))) return;
      setCollabVisible(false);
      s.current.locked = false;
    },
    [elFor, aimAtElement, aimPointer, sleep]
  );

  /* ────────────────────────────────────────────────────────────────
     Boot. Everything is measured from the hero reveal (not from mount),
     so the collaborator never performs underneath the preloader.
     ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const st = s.current;
    st.disposed = false; // reset: StrictMode remounts reuse this ref

    if (prefersReducedMotion()) return;

    let enable = 0;
    let start = 0;
    const off = onSiteReady(() => {
      // Dragging is available on every pointer type — touch included.
      // Only the *hover* affordance is desktop-only (see onLayerEnter).
      enable = window.setTimeout(() => {
        st.dragEnabled = true;
        setStates((v) => ({ ...v, first: "focus" }));
      }, HERO.intro.dragEnabledAt);

      start = window.setTimeout(
        () => void runSequence(),
        HERO.intro.sequenceStart
      );
    });

    return () => {
      off();
      window.clearTimeout(enable);
      window.clearTimeout(start);
      st.disposed = true;
      st.run++;
    };
  }, [runSequence]);

  /* ────────────────────────────────────────────────────────────────
     Drag handling (pointer events; manual so the leader line and the
     dx/dy readout stay exact).
     ──────────────────────────────────────────────────────────────── */
  const onLayerPointerDown = useCallback(
    (which: Which) => (e: React.PointerEvent) => {
      const st = s.current;
      if (!st.dragEnabled || st.reduced || st.dragging) return;
      const el = elFor(which);
      if (!el) return;

      // The visitor interrupts whatever the collaborator was doing.
      st.run++;
      st.locked = false;
      setCollabStatus(null);
      setCollabMessage(null);
      setStates({ first: "idle", last: "idle", subtitle: "idle" });
      setLabels({
        first: heroScene.layers.first,
        last: heroScene.layers.last,
        subtitle: heroScene.layers.subtitle,
      });
      if (refs.marquee.current) refs.marquee.current.style.opacity = "0";
      gsap.killTweensOf(el);

      st.dragging = which;
      st.focus = which;
      const offset = st.offset[which];
      st.grab = { x: e.clientX - offset.x, y: e.clientY - offset.y };

      // Origin = the layer's resting centre, independent of current offset.
      const r = el.getBoundingClientRect();
      st.origin = {
        x: r.left + r.width / 2 - offset.x,
        y: r.top + r.height / 2 - offset.y,
      };

      // Turn the chrome on BEFORE capturing: setPointerCapture throws if the
      // pointer id is already gone (fast taps, synthetic events), and an
      // exception here would otherwise leave a layer that drags with no
      // selection frame or readout.
      setStates((v) => ({ ...v, [which]: "dragging" }));
      setDragActive(true);

      try {
        el.setPointerCapture?.(e.pointerId);
      } catch {
        /* capture is an optimisation — the window listeners still track it */
      }
    },
    [elFor, refs.marquee]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const st = s.current;
      const which = st.dragging;
      if (!which) return;
      const el = elFor(which);
      if (!el) return;

      const x = e.clientX - st.grab.x;
      const y = e.clientY - st.grab.y;
      st.offset[which] = { x, y };
      gsap.set(el, { x, y });

      // Leader line from origin to the layer's live centre.
      const cx = st.origin.x + x;
      const cy = st.origin.y + y;
      refs.leader.current?.setAttribute(
        "d",
        `M${st.origin.x},${st.origin.y} L${cx},${cy}`
      );
      const chip = refs.delta.current;
      if (chip) {
        chip.style.transform = `translate3d(${(st.origin.x + cx) / 2}px, ${
          (st.origin.y + cy) / 2 - 15
        }px, 0)`;
        chip.textContent = `dx: ${Math.round(x)}, dy: ${Math.round(y)}`;
      }
    };

    const onUp = () => {
      const st = s.current;
      const which = st.dragging;
      if (!which) return;
      st.dragging = null;
      setDragActive(false);
      setStates((v) => ({ ...v, [which]: "idle" }));
      void runRealign(which);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [elFor, refs.leader, refs.delta, runRealign]);

  /* ── Focus affordance follows the hovered layer, defaults to first.
        Hover is meaningless on touch — a tap there would strand the
        affordance on whichever layer was last touched — so coarse
        pointers keep the default and move it only by dragging. ── */
  const hoverCapable = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onLayerEnter = useCallback((which: Which) => {
    const st = s.current;
    if (!hoverCapable()) return;
    if (!st.dragEnabled || st.locked || st.dragging) return;
    st.focus = which;
    setStates((v) => ({
      ...v,
      first: which === "first" ? "focus" : "idle",
      last: which === "last" ? "focus" : "idle",
    }));
  }, []);

  const onLayerLeave = useCallback(() => {
    const st = s.current;
    if (!hoverCapable()) return;
    if (!st.dragEnabled || st.locked || st.dragging) return;
    st.focus = "first";
    setStates((v) => ({ ...v, first: "focus", last: "idle" }));
  }, []);

  return {
    states,
    labels,
    subtitleText,
    collabVisible,
    collabStatus,
    collabMessage,
    bubbleFlipped,
    dragActive,
    onLayerPointerDown,
    onLayerEnter,
    onLayerLeave,
  };
}
