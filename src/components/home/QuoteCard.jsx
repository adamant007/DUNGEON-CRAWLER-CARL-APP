import React from "react";

/* Decorative brand quote card — pure Ginger Dragon flavor, no data. */
export default function QuoteCard() {
  return (
    <section className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-6 text-center backdrop-blur-sm">
      <p className="font-fell italic text-[15px] leading-relaxed text-[#e8d8b5]">
        “A good adventure is better with great tools.”
      </p>
      <span className="text-[9px] text-[var(--gold)]">◆</span>
      <p className="font-display text-[11px] font-bold tracking-[0.22em] text-[#d4a055]">— GDS</p>
    </section>
  );
}