import React from "react";

/* Private diagnostic sample — verifies ingestion worked. Shows only a
   small excerpt (never the full document) and provides no export. */
export default function ExtractionSample({ sample }) {
  if (!sample || sample.loading) {
    return (
      <div className="border-[1.5px] border-[var(--rule)] bg-[rgba(255,248,220,0.15)] px-3 py-2.5">
        <p className="font-fell text-[12px] italic text-[var(--ink-soft)]">Loading extraction sample…</p>
      </div>
    );
  }
  if (sample.error) {
    return (
      <div className="border-[1.5px] border-[var(--rule)] bg-[rgba(255,248,220,0.15)] px-3 py-2.5">
        <p className="font-fell text-[12px] italic text-[var(--hp)]">{sample.error}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 border-[1.5px] border-[var(--rule)] bg-[rgba(255,248,220,0.15)] px-3 py-2.5">
      <span className="section-title text-[11px] text-[#24180f]">EXTRACTION SAMPLE</span>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Pages" value={sample.pageCount} />
        <Stat label="Chunks" value={sample.chunkCount} />
        <Stat label="Characters" value={sample.totalChars.toLocaleString("en-US")} />
      </div>
      {sample.firstSample && (
        <SampleBlock label={`Page ${sample.firstPage ?? "?"} — first excerpt`} text={sample.firstSample} />
      )}
      {sample.laterSample && (
        <SampleBlock label={`Page ${sample.laterPage ?? "?"} — later excerpt`} text={sample.laterSample} />
      )}
      <p className="font-fell text-[10px] italic text-[var(--ink-faint)]">
        Diagnostic sample only — not a full export of the source document.
      </p>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="flex flex-col items-center border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.3)] py-1">
    <span className="font-display text-[16px] font-bold text-[#24180f]">{value}</span>
    <span className="field-label text-[9px]">{label}</span>
  </div>
);

const SampleBlock = ({ label, text }) => (
  <div className="flex flex-col gap-0.5">
    <span className="field-label text-[9px]">{label}</span>
    <p className="scrollbar-thin max-h-24 overflow-y-auto whitespace-pre-wrap break-words font-garamond text-[12px] leading-snug text-[#24180f]">
      {text}
    </p>
  </div>
);