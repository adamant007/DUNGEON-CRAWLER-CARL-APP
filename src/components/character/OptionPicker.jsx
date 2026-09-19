import React, { useRef, useState } from "react";
import { ArrowLeft, Ban, Check, ChevronLeft, ChevronRight } from "lucide-react";
import ColorSwatches from "./ColorSwatches";

/* Dedicated one-option-at-a-time picker — large reference preview, big
   flanking arrows, swipe support, relevant color controls underneath,
   and SELECT / BACK. Opens beside the Customize drawer on desktop and
   tablet, below it on phones. The artwork is selection/reference only —
   nothing is painted onto the portrait. */
export default function OptionPicker({ cat, sel, set, onClose }) {
  const options = cat.options;
  const [idx, setIdx] = useState(() => {
    const found = options.findIndex((o) => o.key === sel[cat.field]);
    return found < 0 ? 0 : found;
  });
  const opt = options[idx];
  const move = (d) => setIdx((i) => (i + d + options.length) % options.length);

  // Swipe across the preview to move through the choices.
  const startX = useRef(null);
  const onSwipeStart = (e) => {
    startX.current = e.clientX;
  };
  const onSwipeEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
  };

  // Arrow keys browse; Escape closes just this picker.
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowLeft") {
      e.stopPropagation();
      move(-1);
    } else if (e.key === "ArrowRight") {
      e.stopPropagation();
      move(1);
    }
  };

  const art = opt.art && cat.sheet ? opt.art : null;
  const alreadySelected = sel[cat.field] === opt.key;

  return (
    <div
      role="dialog"
      aria-label={`${cat.label} — choose option`}
      className="parchment portrait-drawer option-picker z-50 flex flex-col gap-1.5 overflow-y-auto p-2"
      onKeyDown={onKeyDown}
    >
      <h4 className="section-title shrink-0 text-center text-[9px]">{cat.label}</h4>

      {/* Large preview with big flanking arrows */}
      <div className="flex min-h-[200px] flex-1 items-stretch justify-center gap-1.5">
        <button
          type="button"
          aria-label="Previous option"
          onClick={() => move(-1)}
          className="ink-box flex w-12 shrink-0 items-center justify-center"
        >
          <ChevronLeft size={26} />
        </button>

        <div
          aria-hidden="true"
          onPointerDown={onSwipeStart}
          onPointerUp={onSwipeEnd}
          className="relative flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-sm border border-[var(--gold)] bg-[#181210] shadow-[inset_0_0_0_1px_rgba(176,138,62,0.35)]"
          style={{ touchAction: "pan-y", cursor: "grab", userSelect: "none" }}
        >
          {/* Reference artwork — cropped from its uploaded sheet, never
              pasted onto the portrait. */}
          {art ? (
            <span
              className="block w-full"
              style={{
                aspectRatio: `${art.w} / ${art.h}`,
                backgroundImage: `url(${cat.sheet})`,
                backgroundSize: `${(100 / art.w).toFixed(4)}% ${(100 / art.h).toFixed(4)}%`,
                backgroundPosition: `${((art.x / (100 - art.w)) * 100).toFixed(4)}% ${((art.y / (100 - art.h)) * 100).toFixed(4)}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
          ) : (
            /* Categories whose artwork sheets haven't been uploaded yet */
            <div
              className="flex h-full max-w-full items-center justify-center px-2 text-center"
              style={{ aspectRatio: "3 / 4" }}
            >
              {opt.key === "none" ? (
                <Ban size={44} style={{ color: "var(--ink-soft)" }} />
              ) : (
                <span className="font-fell-sc text-[12px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                  {opt.label}
                </span>
              )}
            </div>
          )}
          {alreadySelected && (
            <span
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(47,38,32,0.6)]"
              style={{ background: "var(--gold-bright)" }}
            >
              <Check size={12} strokeWidth={3} style={{ color: "#2f2620" }} />
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Next option"
          onClick={() => move(1)}
          className="ink-box flex w-12 shrink-0 items-center justify-center"
        >
          <ChevronRight size={26} />
        </button>
      </div>

      {/* Option name + position */}
      <div className="flex shrink-0 items-baseline justify-center gap-2">
        <span className="font-fell-sc text-[12px]" style={{ color: "var(--ink)" }}>
          {opt.label}
        </span>
        <span className="font-fell italic text-[9px]" style={{ color: "var(--ink-faint)" }}>
          {idx + 1} / {options.length}
        </span>
      </div>

      {/* Relevant color controls underneath */}
      {(cat.colors || [])
        .filter((c) => !c.showWhen || c.showWhen(opt.key))
        .map((c) => (
          <ColorSwatches
            key={c.field}
            label={c.label}
            palette={c.palette}
            value={sel[c.field]}
            custom={sel[c.customField]}
            onPick={(key) => set({ [c.field]: key, [c.customField]: null })}
            onCustom={(hex) => set({ [c.field]: "custom", [c.customField]: hex })}
          />
        ))}

      {/* BACK / SELECT */}
      <div className="mt-auto flex shrink-0 items-center justify-center gap-2 pt-1">
        <button type="button" onClick={onClose} className="ink-box flex items-center gap-1.5 px-3 py-2.5 text-[10px]">
          <ArrowLeft size={12} />
          BACK
        </button>
        <button
          type="button"
          onClick={() => {
            set({ [cat.field]: opt.key });
            onClose();
          }}
          className="nameplate flex items-center gap-1.5 px-5 py-2.5 font-display text-[11px] font-bold text-[#f0e2c8]"
        >
          {alreadySelected && <Check size={12} />}
          SELECT
        </button>
      </div>
    </div>
  );
}