import React, { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ParchmentDialog from "./ParchmentDialog";

/* Load Character — the signed-in user's saved characters (row-level
   security already scopes every read to records they own). Tap a row to
   load it; the trash button asks for confirmation naming the character
   before deleting only that record. Deleting the active character hands the
   sheet to the next saved one, or to the create-character empty state. */
export default function LoadDialog({ activeId, onLoad, onCreateNew, onDeleted, onClose }) {
  const [list, setList] = useState(null); // null = still loading
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(null); // record awaiting delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setList(await base44.entities.Character.list("-updated_date", 100));
      } catch {
        setError("Couldn't load your characters — please try again.");
        setList([]);
      }
    })();
  }, []);

  const confirmDelete = async (rec) => {
    setDeletingId(rec.id);
    setError("");
    try {
      await base44.entities.Character.delete(rec.id);
      const rest = (list || []).filter((c) => c.id !== rec.id);
      setList(rest);
      setConfirming(null);
      onDeleted?.(rec.id, rest);
    } catch {
      setError("Couldn't delete that character — please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ParchmentDialog title="Load Character" onClose={deletingId ? undefined : onClose} wide>
      {error && (
        <p className="mb-2 font-fell italic text-[16px]" style={{ color: "var(--hp)" }}>
          {error}
        </p>
      )}
      {list === null ? (
        <p className="flex items-center justify-center gap-2 py-6 font-fell italic text-[16px] text-[#24180f]">
          <Loader2 size={16} className="animate-spin" /> Unrolling your roster…
        </p>
      ) : list.length === 0 ? (
        <div className="py-4 text-center">
          <p className="font-fell italic text-[16px] text-[#24180f]">No saved characters yet.</p>
          <p className="mt-1 font-fell italic text-[16px] text-[#24180f]">
            Use New Character to inscribe your first crawler.
          </p>
          <button type="button" onClick={onCreateNew} className="ink-box mt-3 px-3.5 py-2 text-[16px] text-[#24180f]">
            New Character
          </button>
        </div>
      ) : (
        <ul className="scrollbar-thin max-h-[50vh] space-y-1.5 overflow-y-auto pr-1">
          {list.map((rec) => (
            <li key={rec.id} className="flex flex-wrap items-center gap-3 border-b border-[var(--rule-soft)]/60 px-2.5 py-2.5">
              <button type="button" onClick={() => onLoad(rec)} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-fell-sc text-[18px] font-bold text-[#24180f]">
                  {rec.name || "Unnamed Crawler"}
                  {rec.draft && (
                    <span className="ml-2 align-middle font-fell-sc text-[16px] tracking-[.18em] text-[var(--ink-soft)]">
                      DRAFT
                    </span>
                  )}
                  {rec.id === activeId && (
                    <span className="ml-2 align-middle font-fell-sc text-[16px] tracking-[.18em] text-[var(--gold)]">
                      ACTIVE
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate font-fell italic text-[16px] text-[#24180f]">
                  {rec.draft
                    ? "Unfinished character — tap to resume where you left off"
                    : `${rec.details?.race || "—"} · ${rec.details?.class || "—"} · Level ${rec.details?.level ?? 1}`}
                </span>
              </button>
              {confirming?.id === rec.id ? (
                <span className="flex items-center gap-2">
                  <span className="font-fell italic text-[16px] text-[#24180f]">
                    Delete {rec.name || "this character"}?
                  </span>
                  <button
                    type="button"
                    disabled={deletingId === rec.id}
                    onClick={() => confirmDelete(rec)}
                    className="ink-box px-3 py-1.5 text-[16px] disabled:opacity-60"
                    style={{ color: "var(--hp)" }}
                  >
                    {deletingId === rec.id ? "…" : "Yes, Delete"}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === rec.id}
                    onClick={() => setConfirming(null)}
                    className="ink-box px-3 py-1.5 text-[16px] text-[#24180f] disabled:opacity-60"
                  >
                    Keep
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={`Delete ${rec.name || "Unnamed Crawler"}`}
                  onClick={() => setConfirming(rec)}
                  className="ink-box flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{ color: "var(--hp)" }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={onClose} className="ink-box px-3.5 py-2 text-[16px] text-[#24180f]">
          Close
        </button>
      </div>
    </ParchmentDialog>
  );
}