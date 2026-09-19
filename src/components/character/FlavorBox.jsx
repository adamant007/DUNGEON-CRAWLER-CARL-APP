import React from "react";
import { Flame, Quote } from "lucide-react";

/* The Ginger Dragon quote — written straight on the parchment with the
   flame emblem, NO panel box (per the approved look). Ink colors are the
   parchment's own dark ink, explicit so the quote stays readable on the
   Dungeon and Tome faces alike. Purely decorative brand flavor; no
   character data is displayed or invented. */
export default function FlavorBox() {
  return (
    <div className="flex items-center gap-2.5 px-1 py-1">
      <div
        aria-hidden="true"
        className="shrink-0 pointer-events-none select-none w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border border-[rgba(176,138,74,0.55)] bg-[radial-gradient(circle_at_50%_35%,rgba(160,60,30,0.4),rgba(20,15,10,0.95))] shadow-[inset_0_0_0_2px_rgba(15,11,7,0.9),inset_0_0_0_3px_rgba(220,172,96,0.3),0_0_10px_rgba(160,60,30,0.2)]"
      >
        <Flame size={20} className="text-[#d4a055]" strokeWidth={1.75} fill="rgba(217,95,76,0.25)" />
      </div>
      <div className="min-w-0">
        <Quote size={12} className="hidden sm:block text-[#8a6a2e] mb-0.5" fill="currentColor" strokeWidth={2} />
        <p className="font-fell italic text-[11px] sm:text-[13px] leading-tight sm:leading-snug text-[#33261d]">
          “Good gear gets you in the door. Good decisions keep you alive.”
          <span className="font-fell-sc not-italic uppercase tracking-[.08em] text-[7px] sm:text-[8px] ml-1 text-[#5a4634]">
            — The Ginger Dragon
          </span>
        </p>
      </div>
    </div>
  );
}