import React, { useEffect, useRef } from "react";
import { RotateCcw, X, Scan } from "lucide-react";

const FIT_SETTINGS = { offsetX: 0, offsetY: 0, scale: 1 };

/**
 * Reposition Photo drawer — positioning only, no zoom controls.
 * The uploaded photo always fully covers the portrait opening (never
 * smaller, never distorted). The user drags the photo inside the frame to
 * choose which part shows; dragging keeps the photo covering the opening.
 *
 * FIT TO PORTRAIT — scales the photo proportionally so its visible
 *   content covers the opening edge to edge (excess cropped, never
 *   stretched) and centers it. Photos without transparent padding stay
 *   at 1x — plain object-fit cover.
 * RESET POSITION — re-centers the photo at its current size.
 * DONE — keeps the selected position and closes the drawer.
 *
 * Action buttons use native click listeners (the mechanism proven to work
 * here) and write through the same settings callback the working drag uses.
 */
export default function RepositionDrawer({ settings, onChange, onFit, onClose }) {
  const fitRef = useRef(null);
  const resetRef = useRef(null);

  // Always-current refs — listeners never read stale settings or callbacks.
  const onChangeRef = useRef(onChange);
  const onFitRef = useRef(onFit);
  const settingsRef = useRef(settings);
  useEffect(() => {
    onChangeRef.current = onChange;
    onFitRef.current = onFit;
    settingsRef.current = settings;
  });

  useEffect(() => {
    const bind = (el, fn) => {
      if (!el) return () => {};
      el.addEventListener("click", fn);
      return () => el.removeEventListener("click", fn);
    };
    const onFit = () => (onFitRef.current ? onFitRef.current() : onChangeRef.current(FIT_SETTINGS));
    const onReset = () => {
      const cur = settingsRef.current || FIT_SETTINGS;
      onChangeRef.current({ ...cur, offsetX: 0, offsetY: 0 });
    };
    const unbind = [bind(fitRef.current, onFit), bind(resetRef.current, onReset)];
    return () => unbind.forEach((u) => u());
  }, []);

  return (
    <div
      role="dialog"
      aria-label="Reposition Photo"
      className="parchment portrait-drawer portrait-sub-drawer absolute left-full top-0 z-40 ml-1 flex h-full w-[80%] max-w-[260px] flex-col gap-1.5 overflow-hidden p-2"
    >
      {/* Title + close */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="section-title text-[9px]">Reposition Photo</h4>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="ink-box flex h-5 w-5 shrink-0 items-center justify-center"
        >
          <X size={11} />
        </button>
      </div>

      <p className="text-center font-fell italic text-[10px] leading-snug">
        Drag photo to position
      </p>

      {/* Fit to Portrait — best cover size, centered */}
      <button
        ref={fitRef}
        type="button"
        className="ink-box flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px]"
      >
        <Scan size={14} />
        Fit to Portrait
      </button>

      {/* Reset Position / Done */}
      <div className="mt-auto flex items-center justify-center gap-2 pt-1">
        <button
          ref={resetRef}
          type="button"
          className="ink-box flex items-center justify-center gap-1.5 px-3 py-2 text-[11px]"
        >
          <RotateCcw size={13} />
          Reset Position
        </button>
        <button
          type="button"
          onClick={onClose}
          className="nameplate px-4 py-2 font-display text-[11px] font-bold text-[#f0e2c8]"
        >
          Done
        </button>
      </div>
    </div>
  );
}