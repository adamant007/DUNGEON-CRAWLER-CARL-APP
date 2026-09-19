import React, { useState } from "react";
import ParchmentDialog from "./ParchmentDialog";

/* Unsaved-changes prompt shown before creating or loading another
   character. Save keeps the edits and continues only if the save succeeds;
   Discard continues without saving; Cancel stays on the current sheet. */
export default function UnsavedDialog({ characterName, saving = false, onSave, onDiscard, onClose }) {
  const [error, setError] = useState("");

  const saveAndContinue = async () => {
    setError("");
    const ok = await onSave();
    if (ok === false) {
      setError("Save failed — your edits are still here. Try again, discard, or cancel.");
    }
  };

  return (
    <ParchmentDialog title="Unsaved Changes" onClose={onClose}>
      <p className="mb-3 font-fell italic text-[16px] text-[#24180f]">
        {characterName ? `"${characterName}"` : "This character"} has unsaved changes. Save before you continue?
      </p>
      {error && (
        <p className="mb-2 font-fell italic text-[16px]" style={{ color: "var(--hp)" }}>
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onClose} disabled={saving} className="ink-box px-3.5 py-2 text-[16px] text-[#24180f] disabled:opacity-60">
          Cancel
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={saving}
          className="ink-box px-3.5 py-2 text-[16px] text-[#24180f] disabled:opacity-60"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={saveAndContinue}
          disabled={saving}
          className="nameplate px-3.5 py-2 font-display text-[16px] font-bold text-[#f0e2c8] disabled:opacity-60"
        >
          {saving ? "Saving…" : error ? "Retry Save" : "Save"}
        </button>
      </div>
    </ParchmentDialog>
  );
}