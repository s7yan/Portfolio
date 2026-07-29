"use client";

/**
 * Persistent site chrome: smooth scroll, preloader, header, footer, the AI
 * concierge, the visitor cursor and the route-transition layer.
 *
 * Lives in the root layout so none of it remounts when navigating between
 * the home page and a case study — the transition overlay in particular must
 * outlive the route swap it is animating.
 */
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { NavTransition } from "@/components/transition/NavTransition";
import { Cursor } from "@/components/cursor/Cursor";
import { Preloader } from "@/components/preloader/Preloader";
import { Header } from "@/components/nav/Header";
import { AskConcierge } from "@/components/ai/AskConcierge";
import { Footer } from "@/components/sections/Footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <SmoothScroll>
        <Preloader />
        <Header />

        <main id="content">{children}</main>

        <Footer />
        <AskConcierge />
        <Cursor />
        <NavTransition />
      </SmoothScroll>
    </TransitionProvider>
  );
}
