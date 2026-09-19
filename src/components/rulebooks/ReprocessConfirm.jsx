import React from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

/* Reprocess confirmation — the new extraction replaces the previous one
   for future analysis. processing_version is incremented; any existing
   Rules Profile is left untouched. */
export default function ReprocessConfirm({ onCancel, onConfirm }) {
  return (
    <ParchmentDialog title="Reprocess this rulebook?" onClose={onCancel}>
      <div className="flex flex-col gap-3">
        <p className="font-garamond text-[15px] leading-relaxed text-[#24180f]">
          A new extraction will replace the previous extraction for future analysis.
          The processing version will be incremented. Any existing Rules Profile
          will not be modified.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="ink-box px-3 py-2 text-[13px] text-[#24180f]">
            CANCEL
          </button>
          <button type="button" onClick={onConfirm} className="nameplate px-3 py-2 font-display text-[13px] font-bold text-[#f0e2c8]">
            REPROCESS
          </button>
        </div>
      </div>
    </ParchmentDialog>
  );
}