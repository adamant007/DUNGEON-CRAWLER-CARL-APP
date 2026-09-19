import React from "react";

/* Small gold pill marking a planned feature — always honest, never fake. */
export default function ComingSoonPill({ className = "" }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border border-[var(--gold)] bg-[rgba(12,10,6,0.6)] px-2 py-0.5 font-display text-[7px] font-bold tracking-[0.16em] text-[var(--gold-bright)] ${className}`}
    >
      COMING SOON
    </span>
  );
}