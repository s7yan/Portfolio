"use client";

import { useEffect, useState } from "react";
import { formatClock } from "@/lib/utils";

/**
 * Live clock string for a given IANA time zone, ticking every second.
 * Returns null until mounted (avoids SSR/client mismatch).
 */
export function useClock(timeZone: string): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(formatClock(new Date(), timeZone));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return time;
}
