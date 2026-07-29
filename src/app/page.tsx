import { HeroDeck } from "@/components/sections/HeroDeck";
import { Partners } from "@/components/sections/Partners";
import { Work } from "@/components/sections/Work";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";

/** Home — the persistent chrome (nav, cursor, footer, transition) lives in
 *  the root layout so it survives navigation into case studies. */
export default function Home() {
  return (
    <>
      <HeroDeck />
      <Partners />
      <Work />
      <Capabilities />
      <Experience />
    </>
  );
}
