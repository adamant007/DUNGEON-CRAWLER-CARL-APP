import React from "react";
import { Switch } from "@/components/ui/switch";

/* Sheet-top strip — New / Save / Load plus the EDIT CHARACTER toggle.
   OFF (default) is normal play: the sheet's character-building fields
   are protected from accidental inline edits. ON is deliberate character
   management, with SAVE CHANGES / CANCEL to finish (provided by the
   sheet; all persistence logic lives there). Formatting follows the
   approved ink-box style. */
const BTN =
  "whitespace-nowrap rounded-md border border-[#4a3a26] bg-[#15120f] px-3 py-2 text-[11px] font-semibold tracking-[0.03em] text-[#e8dfd1] transition-colors hover:border-[#d4a055] hover:bg-[#211a12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4a055] disabled:pointer-events-none disabled:opacity-50";

const SWITCH =
  "h-7 w-12 border border-[#5b4a34] data-[state=checked]:bg-[#8c641f] data-[state=unchecked]:bg-[#302a23] [&>span]:h-5 [&>span]:w-5 [&>span]:bg-[#efe7d8] data-[state=checked]:[&>span]:translate-x-6";

export default function CharacterBar({
  className = "",
  onRulebooks,
  onNew,
  onSave,
  onLoad,
  onPrint,
  onPigments,
  saveState = "idle",
  busy = false,
  dirty = false,
  onRetry,
  editMode = false,
  onToggleEdit,
  onSaveChanges,
  onCancelChanges,
  gmMode = false,
}) {
  let status = "";
  if (saveState === "saving") status = "Saving…";
  else if (saveState === "error") status = "Save failed — your changes are safe.";
  else if (dirty) status = "Unsaved changes";
  else if (saveState === "success") status = "Saved";

  return (
    <div className={`gd-toolbar flex flex-col gap-3 rounded-lg border border-[#3c352a] bg-[#0f0e0c]/95 p-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex min-w-0 flex-1 flex-wrap md:flex-nowrap items-center gap-1.5 gap-y-1">
        {/* Rulebooks — the same private Rulebook Library the Character
            Creator reaches; never a gate before New Character. */}
        {!gmMode && (
          <>
            <button
              type="button"
              className={BTN}
              onClick={onRulebooks}
              disabled={busy}
              title="Manage Games & Rules"
            >
              Rulebooks
            </button>
            <button type="button" className={BTN} onClick={onNew} disabled={busy}>
              New Character
            </button>
          </>
        )}
        {editMode ? (
          <>
            <button
              type="button"
              className={BTN}
              onClick={onSaveChanges}
              disabled={busy || saveState === "saving"}
            >
              SAVE CHANGES
            </button>
            <button
              type="button"
              className={BTN}
              onClick={onCancelChanges}
              disabled={saveState === "saving"}
            >
              CANCEL
            </button>
          </>
        ) : !gmMode ? (
          <button type="button" className={BTN} onClick={onSave} disabled={busy || saveState === "saving"}>
            Save Character
          </button>
        ) : null}
        {!gmMode && (
          <button type="button" className={BTN} onClick={onLoad} disabled={busy}>
            Load Character
          </button>
        )}
        <button
          type="button"
          className={BTN}
          onClick={onPrint}
          disabled={busy}
          title="Print a printer-friendly character sheet"
        >
          Print Sheet
        </button>
        {/* Pigments of Poor Decisions — recolor the sheet's panels; visual
            preference, so it is always available (not gated by EDIT
            CHARACTER). The sheet owns the dialog and persistence. */}
        <button
          type="button"
          className={BTN}
          onClick={onPigments}
          title="Pigments of Poor Decisions — recolor your sheet panels"
        >
          Pigments
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <label
          className="flex items-center gap-2 cursor-pointer select-none"
          title="OFF is normal play — your sheet is protected from accidental edits. Turn ON to deliberately edit the character; finish with SAVE CHANGES or CANCEL."
        >
          <span className="whitespace-nowrap text-[10px] font-bold tracking-[0.14em] text-[#c5a059]">
            EDIT CHARACTER
          </span>
          <Switch
            checked={editMode}
            onCheckedChange={onToggleEdit}
            aria-label="Edit character"
            className={SWITCH}
          />
        </label>
        <p aria-live="polite" className="min-h-[1em] text-[10px] text-[#9f978b]">
          {status}
          {saveState === "error" && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-1.5 text-[10px] font-semibold tracking-[0.05em] text-[#e8c87a] underline"
            >
              Retry
            </button>
          )}
        </p>
      </div>
    </div>
  );
}