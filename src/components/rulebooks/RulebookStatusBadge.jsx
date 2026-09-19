import React from "react";

/* Status chip for a Rulebook — literal class map (Tailwind purges dynamic
   names). READY reads as positive ink; processing states stay neutral;
   review-required / failed carry the alarm red. */
const STATUS = {
  added: { label: "ADDED", tone: "text-[var(--ink-soft)]" },
  uploaded: { label: "UPLOADED", tone: "text-[var(--ink-soft)]" },
  awaiting_processing: { label: "AWAITING PROCESSING", tone: "text-[var(--ink-soft)]" },
  processing: { label: "PROCESSING", tone: "text-[var(--mana)]" },
  extraction_complete: { label: "EXTRACTION COMPLETE", tone: "text-[#24180f]" },
  review_required: { label: "REVIEW REQUIRED", tone: "text-[var(--hp)]" },
  ready: { label: "READY", tone: "text-[#24180f]" },
  failed: { label: "FAILED", tone: "text-[var(--hp)]" },
};

export default function RulebookStatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.added;
  return (
    <span
      className={`inline-block shrink-0 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.3)] px-1.5 py-0.5 font-fell-sc text-[10px] font-bold tracking-[0.06em] ${s.tone}`}
    >
      {s.label}
    </span>
  );
}