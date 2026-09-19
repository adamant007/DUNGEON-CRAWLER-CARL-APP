import React from "react";

/* Wizard footer navigation. CANCEL exits to the source-selection flow;
   BACK moves exactly one step and always preserves the draft. NEXT never
   gates on Steps 1–7 — Step 8 (Review & Create) is the single validation
   hub — so the CREATE CHARACTER action lives inside the Review hub body,
   gated there by live validation; the footer shows no forward action on
   the final step to avoid a duplicate create button. */
const BTN =
  "ink-box px-3.5 py-2 text-[16px] text-[#24180f] disabled:opacity-60 disabled:pointer-events-none";
const PRIMARY =
  "nameplate px-4 py-2 font-display text-[16px] font-bold text-[#f0e2c8] disabled:opacity-60 disabled:pointer-events-none";

export default function WizardNavigation({ index, total, onBack, onNext, onCancel }) {
  const last = index === total - 1;
  return (
    <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
      <button type="button" onClick={onCancel} className={BTN}>
        Cancel
      </button>
      <div className="flex gap-2">
        <button type="button" onClick={onBack} disabled={index === 0} className={BTN}>
          Back
        </button>
        {!last && (
          <button type="button" onClick={onNext} className={PRIMARY}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}