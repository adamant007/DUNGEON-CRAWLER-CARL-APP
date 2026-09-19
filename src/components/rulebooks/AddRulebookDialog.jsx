import React, { useState } from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import RulebookMetadataForm from "./RulebookMetadataForm";
import { profileRefForBuiltin } from "./rulebookProfile";

/* Add a Rulebook — three entry choices (Rulebook System Step 1):
   1. UPLOAD RULEBOOK  → minimal metadata form (+ optional private file
      upload — no processing).
   2. BUILT-IN / SUPPORTED GAME → registers the user's library entry for a
      registered builtin Rules Profile (today: Dungeon Crawler Carl) —
      no proprietary source material is exposed.
   3. CUSTOM / HOMEBREW → "Coming Next" placeholder. */
const OPTION =
  "flex flex-col gap-0.5 border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.25)] px-3 py-2.5 text-left hover:bg-[rgba(255,248,220,0.45)]";

export default function AddRulebookDialog({ builtins, onClose, onCreate }) {
  const [view, setView] = useState("options"); // "options" | "upload" | "builtin" | "homebrew"

  /* Registering a built-in game adds a READY library entry pointing at the
     registered adapter — the profile itself already exists and no source
     document is involved. */
  const addBuiltin = (profile) =>
    onCreate({
      title: `${profile.display_name} — Built-In Rules`,
      system_name: profile.display_name,
      document_type: "core_rulebook",
      source_type: "builtin",
      status: "ready",
      rules_profile_id: profileRefForBuiltin(profile.system_key),
      is_private: true,
      notes: "Built-in Ginger Dragon Rules Profile — no source document required.",
    });

  return (
    <ParchmentDialog title="Add a Rulebook" onClose={onClose}>
      {view === "options" && (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setView("upload")} className={OPTION}>
            <span className="font-fell-sc text-[15px] font-bold tracking-[0.04em] text-[#24180f]">
              UPLOAD RULEBOOK
            </span>
            <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
              Add a digital rulebook you legally own.
            </span>
          </button>
          <button type="button" onClick={() => setView("builtin")} className={OPTION}>
            <span className="font-fell-sc text-[15px] font-bold tracking-[0.04em] text-[#24180f]">
              BUILT-IN / SUPPORTED GAME
            </span>
            <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
              Use an available Ginger Dragon Rules Profile.
            </span>
          </button>
          <button type="button" onClick={() => setView("homebrew")} className={OPTION}>
            <span className="font-fell-sc text-[15px] font-bold tracking-[0.04em] text-[#24180f]">
              CUSTOM / HOMEBREW
            </span>
            <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
              Build your own Rules Profile manually.
            </span>
          </button>
        </div>
      )}

      {view === "upload" && (
        <RulebookMetadataForm
          allowFile
          submitLabel="ADD RULEBOOK"
          onCancel={() => setView("options")}
          onSubmit={onCreate}
        />
      )}

      {view === "builtin" && (
        <div className="flex flex-col gap-2">
          <p className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
            These games are already supported — adding one registers it in your library. No
            source document is needed and no proprietary material is shared.
          </p>
          {builtins.map((profile) => (
            <button
              key={profile.system_key}
              type="button"
              onClick={() => addBuiltin(profile)}
              className={OPTION}
            >
              <span className="font-garamond text-[16px] font-bold text-[#24180f]">
                {profile.display_name}
              </span>
              <span className="font-fell text-[11px] italic text-[var(--ink-soft)]">
                Built-in Rules Profile — ready
              </span>
            </button>
          ))}
          {builtins.length === 0 && (
            <p className="font-fell italic text-[14px] text-[var(--ink-soft)]">
              No built-in games yet.
            </p>
          )}
        </div>
      )}

      {view === "homebrew" && (
        <div className="flex flex-col gap-2">
          <p className="font-fell text-[16px] font-bold text-[#24180f]">Coming Next</p>
          <p className="font-fell text-[13px] italic leading-snug text-[var(--ink-soft)]">
            Custom / Homebrew Rules Profile building arrives in the next stage. Your rulebook
            library is ready for it — you can add homebrew source documents today.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setView("options")}
              className="ink-box px-3.5 py-2 text-[14px] text-[#24180f]"
            >
              BACK
            </button>
          </div>
        </div>
      )}
    </ParchmentDialog>
  );
}