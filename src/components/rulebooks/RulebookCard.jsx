import React from "react";
import RulebookStatusBadge from "./RulebookStatusBadge";
import { resolveRulebookProfile, DOCUMENT_TYPE_LABELS } from "./rulebookProfile";

/* One library row. A rulebook only offers CREATE CHARACTER when its
   Rules Profile connection RESOLVES (ready + registered) — otherwise the
   connection line explains itself and nothing is selectable, with no
   fallback to another system. */
export default function RulebookCard({ rulebook, builtins, onOpen, onStart }) {
  const conn = resolveRulebookProfile(rulebook, builtins);
  const ref = rulebook.rules_profile_id;
  const subtitle = [
    rulebook.system_name,
    rulebook.edition,
    DOCUMENT_TYPE_LABELS[rulebook.document_type] ?? rulebook.document_type,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className="block font-fell text-[16px] font-bold text-[#24180f]">
            {rulebook.title}
          </span>
          {subtitle && (
            <span className="block font-garamond text-[13px] text-[var(--ink-soft)]">{subtitle}</span>
          )}
          <span className="block font-fell text-[12px] italic text-[var(--ink-soft)]">
            {conn
              ? `Rules Profile: ${conn.displayName} — READY`
              : ref
                ? "Rules Profile: not ready"
                : "Rules Profile: Not Connected"}
          </span>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <RulebookStatusBadge status={rulebook.status} />
          {conn && (
            <button
              type="button"
              onClick={() => onStart(conn)}
              className="nameplate px-2.5 py-1 font-display text-[11px] font-bold text-[#f0e2c8]"
            >
              CREATE CHARACTER
            </button>
          )}
        </div>
      </div>
    </div>
  );
}