import { Hero } from "@/components/sections/Hero";
import { Statements } from "@/components/sections/Statements";
import { Partners } from "@/components/sections/Partners";
import { Work } from "@/components/sections/Work";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";

/** Home — the persistent chrome (nav, cursor, footer, transition) lives in
 *  the root layout so it survives navigation into case studies. */
export default function Home() {
  return (
    <>
      <Hero />
      <Statements />
      <Partners />
      <Work />
      <Capabilities />
      <Experience />
    </>
  );
}
