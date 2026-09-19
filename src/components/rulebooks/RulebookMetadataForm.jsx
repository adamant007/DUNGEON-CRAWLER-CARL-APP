import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { DOCUMENT_TYPE_LABELS } from "./rulebookProfile";

/* Shared metadata form — ADD mode (allowFile: optional private upload, no
   processing) and EDIT mode (metadata only; the stored file is never
   touched). The form collects and uploads; persistence happens in the
   library's onSubmit. */
const FIELD = "ink-box px-2 py-1.5 text-left text-[14px]";

/* Source game/system identification ONLY — this list names which game a
   rulebook belongs to. It does NOT imply the system is supported by the
   app, and no Rules Profile is created from it. */
const SYSTEM_OPTIONS = [
  "Dungeons & Dragons 5e",
  "Dungeons & Dragons 2024",
  "Pathfinder 2e",
  "Pathfinder 1e",
  "Dungeon Crawl Classics",
  "Dungeon Crawler Carl RPG",
  "Call of Cthulhu",
  "Cyberpunk RED",
  "Shadowrun",
  "Savage Worlds",
  "GURPS",
  "Fate Core",
  "Powered by the Apocalypse",
  "Blades in the Dark",
  "Old-School Essentials",
  "MÖRK BORG",
  "Warhammer Fantasy Roleplay",
  "Vampire: The Masquerade",
  "Werewolf: The Apocalypse",
  "Starfinder",
  "Traveller",
  "The One Ring",
  "Alien RPG",
  "Dragonbane",
  "Forbidden Lands",
  "Mutants & Masterminds",
  "HERO System",
  "Basic Roleplaying",
  "Other / Custom",
];

export default function RulebookMetadataForm({
  initial = null,
  allowFile = true,
  submitLabel = "ADD RULEBOOK",
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [systemName, setSystemName] = useState(initial?.system_name ?? "");
  /* Other / Custom — active when the stored system is not one of the known
     options (preserves existing records on edit). */
  const [otherSystem, setOtherSystem] = useState(Boolean(initial?.system_name) && !SYSTEM_OPTIONS.includes(initial?.system_name));
  const [edition, setEdition] = useState(initial?.edition ?? "");
  const [publisher, setPublisher] = useState(initial?.publisher ?? "");
  const [documentType, setDocumentType] = useState(initial?.document_type ?? "core_rulebook");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* PDFs only at this stage. A wrong type is rejected immediately — the
     form stays open with a clear message; nothing is uploaded. */
  const handleFile = (picked) => {
    if (picked && !picked.type.includes("pdf") && !picked.name.toLowerCase().endsWith(".pdf")) {
      setFile(null);
      setError("Only PDF rulebooks are supported for now.");
      return;
    }
    setError("");
    setFile(picked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const patch = {
        title: title.trim(),
        system_name: systemName.trim(),
        edition: edition.trim(),
        publisher: publisher.trim(),
        document_type: documentType,
      };
      if (allowFile) {
        patch.source_type = "uploaded";
        if (file) {
          /* PRIVATE storage via the uploadRulebook backend function — the
             browser-side upload call proved unreliable. Owner-only access,
             no public URL, and no processing of any kind is started. */
          const response = await base44.functions.invoke("uploadRulebook", { file });
          const uploaded = response?.data ?? response;
          if (!uploaded?.file_uri) {
            throw new Error("Private storage returned no file reference.");
          }
          patch.file_url = uploaded.file_uri;
          patch.original_filename = uploaded.original_filename ?? file.name;
          patch.mime_type = uploaded.mime_type ?? file.type ?? "";
          if (typeof uploaded.file_size === "number") patch.file_size = uploaded.file_size;
          patch.status = "uploaded";
        } else {
          patch.status = "added";
        }
      }
      await onSubmit(patch);
    } catch {
      /* No record is created when the upload fails — the form stays open
         with the selected file preserved so the player can retry. */
      setError(
        file && allowFile
          ? "Upload failed — no rulebook was saved. Please try again."
          : "Couldn\u2019t save this rulebook. Please try again."
      );
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <label className="flex flex-col gap-1">
        <span className="field-label text-[11px]">Title *</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Core Rulebook"
          className={FIELD}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="field-label text-[11px]">Game / System</span>
        <select
          value={otherSystem ? "__other" : systemName}
          onChange={(e) => {
            if (e.target.value === "__other") {
              setOtherSystem(true);
              setSystemName("");
            } else {
              setOtherSystem(false);
              setSystemName(e.target.value);
            }
          }}
          className={FIELD}
        >
          <option value="">Select…</option>
          {SYSTEM_OPTIONS.map((system) => (
            <option key={system} value={system}>
              {system}
            </option>
          ))}
        </select>
        {otherSystem && (
          <input
            type="text"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="System Name"
            className={FIELD}
          />
        )}
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1">
          <span className="field-label text-[11px]">Edition</span>
          <input
            type="text"
            value={edition}
            onChange={(e) => setEdition(e.target.value)}
            placeholder="1st"
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="field-label text-[11px]">Publisher</span>
          <input
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Optional"
            className={FIELD}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="field-label text-[11px]">Document Type</span>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className={FIELD}
        >
          {Object.entries(DOCUMENT_TYPE_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {allowFile ? (
        <label className="flex flex-col gap-1">
          <span className="field-label text-[11px]">Rulebook File (optional — PDF)</span>
          <input
            type="file"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            accept="application/pdf,.pdf"
            className="font-fell text-[12px] text-[#24180f]"
          />
          {file ? (
            <span className="font-fell text-[12px] text-[#24180f]">
              Selected: {file.name}
              {typeof file.size === "number" ? ` (${Math.max(1, Math.round(file.size / 1024))} KB)` : ""}
            </span>
          ) : (
            <span className="font-fell text-[11px] italic leading-snug text-[var(--ink-soft)]">
              Stored privately — visible only to you. Nothing is processed at this stage.
            </span>
          )}
        </label>
      ) : (
        initial?.original_filename && (
          <p className="font-fell text-[12px] italic text-[var(--ink-soft)]">
            File on record: {initial.original_filename}
          </p>
        )
      )}
      {error && <p className="font-fell text-[13px] italic text-[var(--hp)]">{error}</p>}
      <div className="mt-1 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="ink-box px-3.5 py-2 text-[14px] text-[#24180f]">
          CANCEL
        </button>
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="nameplate px-3.5 py-2 font-display text-[14px] font-bold text-[#f0e2c8] disabled:opacity-60"
        >
          {saving ? (file && allowFile ? "UPLOADING…" : "SAVING…") : submitLabel}
        </button>
      </div>
    </form>
  );
}