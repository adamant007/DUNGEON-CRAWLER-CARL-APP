import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import RulebookCard from "./RulebookCard";
import RulebookEmptyState from "./RulebookEmptyState";
import RulebookDetail from "./RulebookDetail";
import RulebookRemoveDialog from "./RulebookRemoveDialog";
import RulebookMetadataForm from "./RulebookMetadataForm";
import AddRulebookDialog from "./AddRulebookDialog";

/* Rulebook Library — the user's PRIVATE rules library (Rulebook System
   Step 1). Persistence only: add, edit details, remove. No parsing, no AI
   processing, no profile generation — those arrive in the next stage. A
   rulebook only starts character creation when its Rules Profile
   connection RESOLVES (ready + registered); there is no fallback. */
export default function RulebookLibrary({ builtins, initialAdd = false, onBack, onStartCreation }) {
  const [records, setRecords] = useState(null); // null = loading
  const [loadError, setLoadError] = useState("");
  const [addOpen, setAddOpen] = useState(initialAdd);
  const [detailId, setDetailId] = useState("");
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const refresh = useCallback(() => {
    setLoadError("");
    base44.entities.Rulebook.list("-created_date")
      .then((rows) => setRecords(rows ?? []))
      .catch(() => setLoadError("Couldn\u2019t load your rulebooks. Please try again."));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  /* Live copy of the open detail record — edits/removals refresh the list,
     so the detail view always reflects the persisted state. */
  const detail = (records ?? []).find((r) => r.id === detailId) ?? null;

  const createRecord = async (patch) => {
    await base44.entities.Rulebook.create(patch);
    setAddOpen(false);
    refresh();
  };
  const saveEdits = async (patch) => {
    await base44.entities.Rulebook.update(editing.id, patch);
    setEditing(null);
    refresh();
  };
  const removeRecord = async (id) => {
    await base44.entities.Rulebook.delete(id);
    setRemoving(null);
    setDetailId("");
    refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-fell italic text-[15px] text-[#24180f]">Your private rules library</p>
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="ink-box px-3 py-1.5 text-[13px] text-[#24180f]">
            BACK
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="nameplate px-3 py-1.5 font-display text-[13px] font-bold text-[#f0e2c8]"
          >
            + ADD RULEBOOK
          </button>
        </div>
      </div>

      {records === null ? (
        <p className="py-6 text-center font-fell italic text-[14px] text-[var(--ink-soft)]">
          Opening your library…
        </p>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="font-fell text-[14px] italic text-[var(--hp)]">{loadError}</p>
          <button type="button" onClick={refresh} className="ink-box px-3 py-1.5 text-[13px] text-[#24180f]">
            TRY AGAIN
          </button>
        </div>
      ) : detail ? (
        <RulebookDetail
          rulebook={detail}
          builtins={builtins}
          onBack={() => setDetailId("")}
          onEdit={() => setEditing(detail)}
          onRemove={() => setRemoving(detail)}
          onProcessed={refresh}
        />
      ) : records.length === 0 ? (
        <RulebookEmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((rulebook) => (
            <RulebookCard
              key={rulebook.id}
              rulebook={rulebook}
              builtins={builtins}
              onOpen={() => setDetailId(rulebook.id)}
              onStart={(conn) =>
                onStartCreation?.({
                  sourceType: "builtin",
                  systemKey: conn.systemKey,
                  displayName: conn.displayName,
                  profile: conn.profile,
                })
              }
            />
          ))}
        </div>
      )}

      <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
        Rulebooks are private to your account. Processing into Rules Profiles arrives in the
        next stage.
      </p>

      {addOpen && (
        <AddRulebookDialog builtins={builtins} onClose={() => setAddOpen(false)} onCreate={createRecord} />
      )}
      {editing && (
        <ParchmentDialog title="Edit Rulebook Details" onClose={() => setEditing(null)}>
          <RulebookMetadataForm
            initial={editing}
            allowFile={false}
            submitLabel="SAVE DETAILS"
            onCancel={() => setEditing(null)}
            onSubmit={saveEdits}
          />
        </ParchmentDialog>
      )}
      {removing && (
        <RulebookRemoveDialog
          rulebook={removing}
          onCancel={() => setRemoving(null)}
          onConfirm={() => removeRecord(removing.id)}
        />
      )}
    </div>
  );
}