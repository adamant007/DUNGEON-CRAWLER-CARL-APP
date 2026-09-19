import React, { useEffect } from "react";
import PigmentsDialog from "@/components/character/PigmentsDialog";

/* Pigments of Poor Decisions — LIVE-PREVIEW flyout. A docked parchment
   island with NO dimming backdrop: the character sheet stays fully
   visible, so every pigment and Dungeon/Tome appearance change shows on
   the sheet IMMEDIATELY while the window stays open. The window never
   closes itself after a selection — only the DONE button (or Escape)
   dismisses it. */
export default function PigmentsFlyout({
  value,
  customHex = "",
  appearance = "dungeon",
  onSelect,
  onAppearance,
  onDone,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onDone?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  return (
    /* The positioning shell carries ONLY Tailwind utilities — the
       parchment .hand-frame panel must never sit on the positioned
       element, because the base stylesheet's .hand-frame rule loads
       after Tailwind and its position:relative would override
       position:fixed, dropping the flyout into the page flow below
       the sheet (invisible off-screen). */
    <div
      role="dialog"
      aria-label="Pigments of Poor Decisions"
      className="fixed z-50 bottom-2 left-2 right-2 sm:left-auto sm:right-3 sm:w-[320px] max-h-[62vh] sm:max-h-[76vh] overflow-y-auto scrollbar-thin"
    >
      <aside className="dialog-parchment hand-frame p-2.5">
        <header className="flex items-center gap-2 mb-2">
          <h3 className="section-title text-[10px]">Pigments of Poor Decisions</h3>
          <button
            type="button"
            onClick={onDone}
            className="ml-auto ink-box px-2.5 h-7 text-[10px] font-fell-sc tracking-[0.06em] shrink-0"
          >
            Done
          </button>
        </header>
        <PigmentsDialog
          value={value}
          customHex={customHex}
          appearance={appearance}
          onSelect={onSelect}
          onAppearance={onAppearance}
        />
      </aside>
    </div>
  );
}