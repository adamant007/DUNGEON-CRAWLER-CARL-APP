import React, { useState } from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import CreatorEntryScreen from "./CreatorEntryScreen";
import CharacterCreatorWizard from "./wizard/CharacterCreatorWizard";
import PregensBrowser from "./PregensBrowser";
import PregenConfirm from "./PregenConfirm";
import { listBuiltinProfiles } from "@/rules-profile";
import RulebookLibrary from "@/components/rulebooks/RulebookLibrary";

/* Character Creator — entry flow foundation (Step 3A).
   NEW CHARACTER opens here instead of the old name-only dialog. The user
   picks a rules source; a supported built-in selection resolves to a real
   Rules Profile from the Step 1 registry and carries it to the
   multi-step Wizard (Step 3B). No Character record is created
   until the wizard actually builds one — one canonical record per
   character, created through the existing persistence path. */
export default function CharacterCreatorDialog({ onClose, onCreatePregen, onCreateWizard }) {
  const builtins = listBuiltinProfiles();
  const [view, setView] = useState("entry"); // "entry" | "wizard" | "pregens" | "pregenConfirm"
  const [selection, setSelection] = useState(null);
  const [pregen, setPregen] = useState(null); // selected First Floor pregen template
  const [creating, setCreating] = useState(false); // one create request at a time — no double-tap duplicates
  const [createError, setCreateError] = useState("");
  /* Rulebook Library view (Rulebook System Step 1) — libraryAdd opens it
     with the Add Rulebook dialog already showing. */
  const [libraryAdd, setLibraryAdd] = useState(false);
  const openLibrary = (withAdd) => {
    setLibraryAdd(Boolean(withAdd));
    setView("library");
  };

  const title =
    view === "entry"
      ? "New Character"
      : view === "library"
        ? "Rulebooks"
        : view === "pregens" || view === "pregenConfirm"
          ? "Pregenerated Characters"
          : "Character Creator";

  /* Step 3A.4 — Create My Character copies the template into ONE new
     canonical Character record via the sheet's handler. The button stays
     locked while the request runs; on failure the creator stays open with
     an error and retry, and closes only after a successful create. */
  const handleCreate = async () => {
    if (creating || !pregen) return;
    setCreating(true);
    setCreateError("");
    try {
      await onCreatePregen?.(pregen);
      // the parent closes this dialog once the record exists
    } catch {
      setCreating(false);
      setCreateError("Couldn\u2019t create this character. Nothing was saved — please try again.");
    }
  };

  return (
    <ParchmentDialog
      title={title}
      wide={view === "entry" || view === "pregens"}
      large={view === "wizard" || view === "library"}
      onClose={onClose}
      dismissible={false}
    >
      {view === "entry" ? (
        <CreatorEntryScreen
          builtins={builtins}
          selection={selection}
          onSelect={setSelection}
          onContinue={() => {
            if (!selection) return;
            setView(selection.sourceType === "pregen" ? "pregens" : "wizard");
          }}
          onCancel={onClose}
          onOpenRulebooks={() => openLibrary(false)}
          onAddRulebook={() => openLibrary(true)}
          onOpenHomebrew={() => openLibrary(true)}
        />
      ) : view === "library" ? (
        /* Rulebook Library — the library only launches the Wizard with a
           RESOLVED ready Rules Profile connection; never a silent fallback. */
        <RulebookLibrary
          builtins={builtins}
          initialAdd={libraryAdd}
          onBack={() => setView("entry")}
          onStartCreation={(sel) => {
            setSelection(sel);
            setView("wizard");
          }}
        />
      ) : view === "pregens" ? (
        <PregensBrowser
          selection={pregen}
          onSelect={setPregen}
          onContinue={() => pregen && setView("pregenConfirm")}
          onBack={() => setView("entry")}
          onCancel={onClose}
        />
      ) : view === "pregenConfirm" ? (
        <PregenConfirm
          pregen={pregen}
          creating={creating}
          error={createError}
          onCreate={handleCreate}
          onBack={() => setView("pregens")}
          onCancel={onClose}
        />
      ) : (
        /* Custom-character Wizard — CANCEL returns to the game selection
           flow; no Character record exists until a later creation step. */
        <CharacterCreatorWizard
          selection={selection}
          onCancel={() => setView("entry")}
          onCreate={onCreateWizard}
        />
      )}
    </ParchmentDialog>
  );
}