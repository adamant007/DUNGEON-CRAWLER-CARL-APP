import React, { useLayoutEffect, useRef, useState } from "react";

/* Desktop sheet auto-balance — deterministic replacement for both the
   fixed column assignments (which left a dead zone under the shorter
   column) and the CSS-multicol approach (whose column balancing can
   reserve far more height than the panels actually need). The panels
   flow in reading order; their REAL rendered heights are measured and
   the flow is split at the prefix whose two columns come out closest in
   height, so the parchment bottom rides just under the last real panel.
   No fixed heights, no min-heights, no stretched panels.

   `frozen` pauses split changes (Edit Character keeps focus and open
   drawers stable); re-balances on the next render once unfrozen.
   Panel keys are stable across split changes, so only the panels that
   actually cross the split point remount. */
export default function BalancedColumns({ children, gap = 8, initialSplit = 5, frozen = false }) {
  const order = React.Children.toArray(children);
  const n = order.length;
  const [split, setSplit] = useState(() => Math.max(1, Math.min(initialSplit, Math.max(1, n - 1))));
  const gridRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const splitRef = useRef(split);
  splitRef.current = split;

  const rebalance = () => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right || n < 2) return;
    const hs = [...left.children, ...right.children].map((el) => el.getBoundingClientRect().height);
    if (hs.length !== n || hs.some((h) => !h)) return;
    const sum = (a, b) => hs.slice(a, b).reduce((x, y) => x + y, 0);
    let best = splitRef.current;
    let bestH = Infinity;
    for (let s = 1; s < n; s++) {
      const h = Math.max(sum(0, s) + gap * (s - 1), sum(s, n) + gap * (n - s - 1));
      if (h < bestH - 0.5 || (h <= bestH + 0.5 && Math.abs(s - initialSplit) < Math.abs(best - initialSplit))) {
        bestH = h;
        best = s;
      }
    }
    if (!frozen && best !== splitRef.current) setSplit(best);
  };

  /* Re-measure on every render — content edits (rows added, lists
     grown, character switched) re-balance the flow before paint. */
  useLayoutEffect(rebalance);

  /* Width changes (window resize, tablet rotation) change panel heights
     without a React render — observe the grid and re-balance. */
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => rebalance());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  if (n < 2) return <div className="flex flex-col gap-2">{children}</div>;

  return (
    <div ref={gridRef} className="grid grid-cols-2 gap-2 items-start">
      <div ref={leftRef} className="flex flex-col gap-2 min-w-0">{order.slice(0, split)}</div>
      <div ref={rightRef} className="flex flex-col gap-2 min-w-0">{order.slice(split)}</div>
    </div>
  );
}