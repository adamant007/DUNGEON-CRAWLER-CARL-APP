import React from "react";

/* Empty library state — three clear entry choices, each opening the
   Add Rulebook dialog where the player picks the matching option. */
const CHOICE =
  "flex flex-col gap-0.5 border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.25)] px-3 py-2.5 text-left hover:bg-[rgba(255,248,220,0.45)]";

export default function RulebookEmptyState({ onAdd }) {
  return (
    <div className="flex flex-col gap-3 border-[1.5px] border-dashed border-[var(--rule)] px-4 py-5">
      <p className="text-center font-fell italic text-[15px] leading-snug text-[#24180f]">
        Add the games you play to build your private Ginger Dragon rules library.
      </p>
      <div className="grid gap-2 md:grid-cols-3">
        <button type="button" onClick={onAdd} className={CHOICE}>
          <span className="font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f]">
            UPLOAD RULEBOOK
          </span>
          <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
            Upload a legally owned digital rulebook.
          </span>
        </button>
        <button type="button" onClick={onAdd} className={CHOICE}>
          <span className="font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f]">
            CUSTOM / HOMEBREW
          </span>
          <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
            Create a rules system manually without a source PDF.
          </span>
        </button>
        <button type="button" onClick={onAdd} className={CHOICE}>
          <span className="font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f]">
            BUILT-IN GAMES
          </span>
          <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
            Use systems already supported by Ginger Dragon.
          </span>
        </button>
      </div>
    </div>
  );
}