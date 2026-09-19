import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/* Creator entry screen — "What are you playing?".
   1. Supported / Built-In Games lists the registered Rules Profiles
      (Step 1 registry) and is the only source that can proceed today.
   2. My Rulebooks / + Add a Rulebook / Custom / Homebrew open the
      Rulebook Library (Rulebook System Step 1) — the persistent private
      rulebook data model, the add flow, and the Rules Profile connection
      live there. No selection is faked here. */
const choiceClass =
  "flex items-center justify-between gap-2 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.25)] px-3 py-2.5 text-left hover:bg-[rgba(255,248,220,0.45)]";

export default function CreatorEntryScreen({ builtins, selection, onSelect, onContinue, onCancel, onOpenRulebooks, onAddRulebook, onOpenHomebrew }) {
  const [showBuiltins, setShowBuiltins] = useState(true);
  const [notice, setNotice] = useState("");

  const pickBuiltin = (profile) => {
    setNotice("");
    onSelect({
      sourceType: "builtin",
      systemKey: profile.system_key,
      displayName: profile.display_name,
      profile,
    });
  };

  return (
    <div>
      <p className="mb-3 font-fell italic text-[16px] text-[#24180f]">What are you playing?</p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            setNotice("");
            setShowBuiltins((v) => !v);
          }}
          className={choiceClass}
        >
          <span className="font-display text-[16px] font-bold text-[#24180f]">Supported / Built-In Games</span>
          {showBuiltins ? <ChevronUp size={16} className="text-[var(--ink-soft)]" /> : <ChevronDown size={16} className="text-[var(--ink-soft)]" />}
        </button>

        {showBuiltins && (
          <div className="ml-3 flex flex-col gap-1.5 border-l-2 border-[var(--rule)] pl-2">
            {builtins.length === 0 && (
              <p className="px-1 py-1 font-fell italic text-[16px] text-[var(--ink-soft)]">No built-in games yet.</p>
            )}
            {builtins.map((p) => {
              const active = selection?.systemKey === p.system_key;
              return (
                <button
                  key={p.system_key}
                  type="button"
                  onClick={() => pickBuiltin(p)}
                  className={`flex items-center justify-between border px-3 py-2 text-left ${
                    active
                      ? "border-[var(--ink)] bg-[rgba(255,248,220,0.55)]"
                      : "border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] hover:bg-[rgba(255,248,220,0.4)]"
                  }`}
                >
                  <span className="font-garamond text-[16px] font-bold text-[#24180f]">{p.display_name}</span>
                  <span aria-hidden="true" className={`skill-box ${active ? "on" : ""}`} />
                </button>
              );
            })}
          </div>
        )}

        <button type="button" onClick={onOpenRulebooks} className={choiceClass}>
          <span className="font-display text-[16px] font-bold text-[#24180f]">My Rulebooks</span>
        </button>
        <button type="button" onClick={onAddRulebook} className={choiceClass}>
          <span className="font-display text-[16px] font-bold text-[#24180f]">+ Add a Rulebook</span>
        </button>
        <button type="button" onClick={onOpenHomebrew} className={choiceClass}>
          <span className="font-display text-[16px] font-bold text-[#24180f]">Custom / Homebrew</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setNotice("");
            onSelect({ sourceType: "pregen", displayName: "Pregenerated Characters" });
          }}
          className={choiceClass}
        >
          <span className="font-display text-[16px] font-bold text-[#24180f]">Pregenerated Characters</span>
        </button>
      </div>

      {notice && (
        <p className="mt-2 font-fell italic text-[16px] text-[var(--ink-soft)]">{notice}</p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="ink-box px-3.5 py-2 text-[16px] text-[#24180f]">
          Cancel
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!selection}
          className="nameplate px-3.5 py-2 font-display text-[16px] font-bold text-[#f0e2c8] disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  );
}