"use client";

/**
 * Drag telemetry: a dashed leader line from the layer's origin to where the
 * visitor has dragged it, with a `dx / dy` chip pinned at the midpoint.
 * Geometry is written imperatively per frame by the choreography hook.
 */
import { forwardRef } from "react";

interface Props {
  active: boolean;
  lineRef: React.RefObject<SVGPathElement | null>;
}

export const DragReadout = forwardRef<HTMLDivElement, Props>(
  function DragReadout({ active, lineRef }, chipRef) {
    return (
      <div
        aria-hidden="true"
        className="drag-readout"
        data-active={active ? "" : undefined}
      >
        <svg className="drag-readout-svg">
          <path ref={lineRef} className="drag-leader" fill="none" />
        </svg>
        <div ref={chipRef} className="delta-chip">
          dx: 0, dy: 0
        </div>
      </div>
    );
  }
);
