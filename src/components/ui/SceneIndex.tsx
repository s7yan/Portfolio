/**
 * Small mono scene counter ("01", "02"…) — the wayfinding rhythm
 * between major scenes.
 */
export function SceneIndex({ index, className }: { index: string; className?: string }) {
  return (
    <p aria-hidden="true" className={`scene-index ${className ?? ""}`}>
      {index}
    </p>
  );
}
