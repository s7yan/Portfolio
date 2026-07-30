/**
 * Boot sequence copy — the initialization messages shown while the HUD
 * comes online. Each message takes over at its percentage threshold.
 */

export interface BootMessage {
  /** Counter value at which this message takes over. */
  at: number;
  label: string;
}

export const bootMessages: BootMessage[] = [
  { at: 0, label: "INITIALIZING SYSTEM" },
  { at: 12, label: "LOADING INTERFACE" },
  { at: 29, label: "CALIBRATING MODULES" },
  { at: 48, label: "AI ENGINE ONLINE" },
  { at: 67, label: "DESIGN SYSTEM READY" },
  { at: 82, label: "RENDER ENGINE ONLINE" },
  { at: 94, label: "INTERACTION MODULE READY" },
  { at: 100, label: "SYSTEM READY" },
];

/** Shown after the counter completes, just before the HUD dissolves. */
export const bootWelcome = "WELCOME";

/** Instrument labels flanking the frames, echoing a cluster's gauge units. */
export const bootGauges = {
  left: "DESIGN",
  right: "SYSTEMS",
} as const;

/** Bottom status strip, in the manner of a cluster's trip readout. */
export const bootStatus = {
  left: "SAYAN DAS",
  centreLabel: "BUILD",
  centreValue: "PORTFOLIO OS 2.0",
  right: "MUMBAI, IN",
} as const;
