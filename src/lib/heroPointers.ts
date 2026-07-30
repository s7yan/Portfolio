/**
 * Live pointer positions shared across the hero, in viewport coordinates.
 *
 * The dot field reacts to *both* cursors — the visitor's and the
 * collaborator's — but they are owned by different components and update
 * every frame. Passing them as props would re-render the canvas 60×/sec,
 * so they live here as a plain mutable record that writers poke and the
 * canvas reads inside its own animation loop.
 */
export const heroPointers = {
  /** The visitor's pointer. Parked off-screen until it moves. */
  visitor: { x: -9999, y: -9999 },
  /** The scripted collaborator's pointer. */
  collab: { x: -9999, y: -9999 },
};

/** Park a pointer off-canvas so it stops exerting any force. */
export function parkPointer(which: "visitor" | "collab") {
  heroPointers[which].x = -9999;
  heroPointers[which].y = -9999;
}
