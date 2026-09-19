import React from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

/* Remove confirmation — required before any deletion. A linked Rules
   Profile is NEVER auto-deleted (explicit warning when connected), and
   Character records are never touched by removing a rulebook. */
export default function RulebookRemoveDialog({ rulebook, onCancel, onConfirm }) {
  const linked = Boolean(rulebook?.rules_profile_id);
  return (
    <ParchmentDialog title="Remove Rulebook" onClose={onCancel}>
      <p className="font-fell text-[15px] leading-snug text-[#24180f]">
        Remove “{rulebook?.title}” from your library?
      </p>
      {linked && (
        <p className="mt-2 font-fell text-[13px] italic leading-snug text-[var(--hp)]">
          This rulebook is connected to a Rules Profile. Removing the source document will not
          automatically delete the profile.
        </p>
      )}
      <p className="mt-2 font-fell text-[12px] italic text-[var(--ink-soft)]">
        Your characters are never affected by removing a rulebook.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="ink-box px-3.5 py-2 text-[14px] text-[#24180f]">
          CANCEL
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="nameplate px-3.5 py-2 font-display text-[14px] font-bold text-[#f0e2c8]"
        >
          REMOVE RULEBOOK
        </button>
      </div>
    </ParchmentDialog>
  );
}