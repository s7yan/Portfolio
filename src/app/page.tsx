import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/cursor/Cursor";
import { Preloader } from "@/components/preloader/Preloader";
import { Header } from "@/components/nav/Header";
import { AskConcierge } from "@/components/ai/AskConcierge";
import { Hero } from "@/components/sections/Hero";
import { Statements } from "@/components/sections/Statements";
import { Partners } from "@/components/sections/Partners";
import { Work } from "@/components/sections/Work";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />
      <Header />

      <main id="content">
        <Hero />
        <Statements />
        <Partners />
        <Work />
        <Capabilities />
        <Experience />
      </main>

      <Footer />
      <AskConcierge />
      <Cursor />
    </SmoothScroll>
  );
}
