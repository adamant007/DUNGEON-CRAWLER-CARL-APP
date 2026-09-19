import React from "react";
import { Switch } from "@/components/ui/switch";

/* Sheet-top strip — New / Save / Load plus the EDIT CHARACTER toggle.
   OFF (default) is normal play: the sheet's character-building fields
   are protected from accidental inline edits. ON is deliberate character
   management, with SAVE CHANGES / CANCEL to finish (provided by the
   sheet; all persistence logic lives there). Formatting follows the
   approved ink-box style. */
const BTN =
  "font-fell-sc text-[15px] font-bold tracking-[0.04em] text-[#24180f] whitespace-nowrap px-1.5 py-1 border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.25)] transition-colors hover:bg-[rgba(74,55,39,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:opacity-60 disabled:pointer-events-none";

const SWITCH =
  "h-7 w-12 border border-[var(--ink-soft)] data-[state=checked]:bg-[#4a3727] data-[state=unchecked]:bg-[#c4b18d] [&>span]:h-5 [&>span]:w-5 data-[state=checked]:[&>span]:translate-x-6";

export default function CharacterBar({
  className = "",
  onRulebooks,
  onNew,
  onSave,
  onLoad,
  onPigments,
  saveState = "idle",
  busy = false,
  dirty = false,
  onRetry,
  editMode = false,
  onToggleEdit,
  onSaveChanges,
  onCancelChanges,
}) {
  let status = "";
  if (saveState === "saving") status = "Saving…";
  else if (saveState === "error") status = "Save failed — your changes are safe.";
  else if (dirty) status = "Unsaved changes";
  else if (saveState === "success") status = "Saved";

  return (
    <div className={`gd-toolbar flex items-start justify-between gap-x-5 ${className}`}>
      <div className="flex min-w-0 flex-1 flex-wrap md:flex-nowrap items-center gap-1.5 gap-y-1">
        {/* Rulebooks — the same private Rulebook Library the Character
            Creator reaches; never a gate before New Character. */}
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
        ) : (
          <button type="button" className={BTN} onClick={onSave} disabled={busy || saveState === "saving"}>
            Save Character
          </button>
        )}
        <button type="button" className={BTN} onClick={onLoad} disabled={busy}>
          Load Character
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
          <span className="font-fell-sc text-[15px] font-bold tracking-[0.04em] whitespace-nowrap text-[#24180f]">
            EDIT CHARACTER
          </span>
          <Switch
            checked={editMode}
            onCheckedChange={onToggleEdit}
            aria-label="Edit character"
            className={SWITCH}
          />
        </label>
        <p aria-live="polite" className="font-fell italic text-[11px] text-[var(--ink-soft)] min-h-[1em]">
          {status}
          {saveState === "error" && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-1.5 font-fell-sc text-[11px] tracking-[0.06em] underline text-[var(--hp)]"
            >
              Retry
            </button>
          )}
        </p>
      </div>
    </div>
  );
}