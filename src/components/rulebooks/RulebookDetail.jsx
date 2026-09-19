import React, { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RulebookStatusBadge from "./RulebookStatusBadge";
import ExtractionSample from "./ExtractionSample";
import ReprocessConfirm from "./ReprocessConfirm";
import { resolveRulebookProfile, DOCUMENT_TYPE_LABELS } from "./rulebookProfile";

/* Rulebook detail view — full record, edit/remove actions, and the
   PROCESS INTO RULES PROFILE action (Step 2A: private text extraction only).
   The raw file reference is never surfaced; only the original filename is
   shown. Extracted text is private and verified via a small diagnostic
   sample — never a full export. */
const Row = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-[var(--rule-soft)] py-1.5">
    <span className="field-label shrink-0 text-[11px]">{label}</span>
    <span className="min-w-0 break-words text-right font-garamond text-[15px] font-bold text-[#24180f]">
      {value || "—"}
    </span>
  </div>
);

export default function RulebookDetail({ rulebook, builtins, onBack, onEdit, onRemove, onProcessed }) {
  const conn = resolveRulebookProfile(rulebook, builtins);
  const [phase, setPhase] = useState("idle"); // "idle" | "processing" | "succeeded" | "failed"
  const [processError, setProcessError] = useState("");
  const [confirmReprocess, setConfirmReprocess] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [sample, setSample] = useState(null);

  const hasFile = !!rulebook.file_url;
  const isProcessing = phase === "processing";
  const showComplete = phase === "succeeded" || (phase === "idle" && rulebook.status === "extraction_complete");
  const showFailed = phase === "failed" || (phase === "idle" && rulebook.status === "failed");
  const showProcessButton = phase === "idle" && hasFile && !showComplete && !showFailed;

  const runProcess = async () => {
    setPhase("processing");
    setProcessError("");
    try {
      await base44.functions.invoke("processRulebook", { rulebook_id: rulebook.id });
      setPhase("succeeded");
      onProcessed?.();
    } catch (err) {
      setProcessError(err?.response?.data?.error || err?.message || "We couldn\u2019t read this rulebook.");
      setPhase("failed");
      onProcessed?.();
    }
  };

  const handleProcessClick = () => {
    if (!hasFile || isProcessing) return;
    if (showComplete) {
      setConfirmReprocess(true);
      return;
    }
    runProcess();
  };

  const loadSample = async () => {
    if (showSample) {
      setShowSample(false);
      return;
    }
    setShowSample(true);
    if (sample && !sample.error) return;
    setSample({ loading: true });
    try {
      const chunks = await base44.entities.RulebookExtraction.filter(
        { rulebook_id: rulebook.id },
        "page_number",
        1000
      );
      const sorted = [...(chunks ?? [])].sort(
        (a, b) =>
          (a.page_number ?? 0) - (b.page_number ?? 0) ||
          (a.section_index ?? 0) - (b.section_index ?? 0)
      );
      const totalChars = sorted.reduce((s, c) => s + (c.character_count || 0), 0);
      const pageCount = new Set(sorted.map((c) => c.page_number).filter((p) => p != null)).size;
      const first = sorted[0];
      const laterIdx =
        sorted.length > 2 ? Math.min(sorted.length - 1, Math.floor(sorted.length / 2)) : sorted.length - 1;
      const later = sorted[laterIdx];
      setSample({
        loading: false,
        pageCount,
        chunkCount: sorted.length,
        totalChars,
        firstSample: first?.text?.slice(0, 400) || "",
        laterSample: later?.text?.slice(0, 400) || "",
        firstPage: first?.page_number,
        laterPage: later?.page_number,
      });
    } catch {
      setSample({ loading: false, error: "Couldn\u2019t load the extraction sample." });
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <RulebookStatusBadge status={rulebook.status} />
      <div className="border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] px-3 py-1.5">
        <Row label="Title" value={rulebook.title} />
        <Row label="System" value={rulebook.system_name} />
        <Row label="Edition" value={rulebook.edition} />
        <Row label="Publisher" value={rulebook.publisher} />
        <Row label="Document Type" value={DOCUMENT_TYPE_LABELS[rulebook.document_type] ?? rulebook.document_type} />
        <Row label="File" value={rulebook.original_filename} />
        <Row
          label="Rules Profile"
          value={
            conn
              ? `${conn.displayName} — READY`
              : rulebook.rules_profile_id
                ? "Connected — not ready yet"
                : "Not Connected"
          }
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onBack} className="ink-box px-3 py-2 text-[13px] text-[#24180f]">
          BACK TO LIBRARY
        </button>
        <button type="button" onClick={onEdit} className="ink-box px-3 py-2 text-[13px] text-[#24180f]">
          EDIT DETAILS
        </button>
        <button type="button" onClick={onRemove} className="nameplate px-3 py-2 font-display text-[13px] font-bold text-[#f0e2c8]">
          REMOVE RULEBOOK
        </button>
      </div>

      {/* Processing panel */}
      <div className="flex flex-col gap-1.5 border-[1.5px] border-dashed border-[var(--rule)] px-3 py-2.5">
        {!hasFile && !isProcessing && !showComplete && (
          <>
            <button type="button" disabled className="cursor-not-allowed ink-box px-3 py-2 text-[13px] text-[#24180f] opacity-50">
              PROCESS INTO RULES PROFILE
            </button>
            <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
              No source file has been uploaded for this rulebook.
            </p>
          </>
        )}

        {showProcessButton && (
          <>
            <button
              type="button"
              onClick={handleProcessClick}
              className="ink-box px-3 py-2 text-[13px] text-[#24180f] hover:bg-[rgba(255,248,220,0.4)]"
            >
              PROCESS INTO RULES PROFILE
            </button>
            <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
              Begins private text extraction from your uploaded PDF. No rules are generated yet.
            </p>
          </>
        )}

        {isProcessing && (
          <>
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[var(--ink-soft)]" />
              <span className="section-title text-[13px] text-[#24180f]">PROCESSING RULEBOOK</span>
            </div>
            <p className="font-fell text-[12px] italic text-[var(--ink-soft)]">
              Stage: Extracting document text…
            </p>
          </>
        )}

        {showFailed && !isProcessing && (
          <>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-[var(--hp)]" />
              <span className="section-title text-[13px] text-[var(--hp)]">We couldn&rsquo;t read this rulebook.</span>
            </div>
            {processError && (
              <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">{processError}</p>
            )}
            <button
              type="button"
              onClick={runProcess}
              className="ink-box px-3 py-2 text-[13px] text-[#24180f] hover:bg-[rgba(255,248,220,0.4)]"
            >
              RETRY PROCESSING
            </button>
          </>
        )}

        {showComplete && !isProcessing && (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#24180f]" />
              <span className="section-title text-[13px] text-[#24180f]">TEXT EXTRACTION COMPLETE</span>
            </div>
            <p className="font-fell text-[12px] italic text-[var(--ink-soft)]">
              Your rulebook has been read successfully and is ready for rules analysis.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadSample}
                className="ink-box px-3 py-1.5 text-[12px] text-[#24180f] hover:bg-[rgba(255,248,220,0.4)]"
              >
                {showSample ? "HIDE EXTRACTION SAMPLE" : "VIEW EXTRACTION SAMPLE"}
              </button>
              <button
                type="button"
                onClick={handleProcessClick}
                className="ink-box px-3 py-1.5 text-[12px] text-[#24180f] hover:bg-[rgba(255,248,220,0.4)]"
              >
                REPROCESS
              </button>
            </div>
            <button
              type="button"
              disabled
              className="cursor-not-allowed ink-box px-3 py-2 text-[13px] text-[#24180f] opacity-50"
            >
              ANALYZE RULES — COMING NEXT
            </button>
          </>
        )}
      </div>

      {showSample && showComplete && <ExtractionSample sample={sample} />}

      {confirmReprocess && (
        <ReprocessConfirm
          onCancel={() => setConfirmReprocess(false)}
          onConfirm={() => {
            setConfirmReprocess(false);
            runProcess();
          }}
        />
      )}
    </div>
  );
}