import React from "react";
import { Dices, Flame } from "lucide-react";

/* Bottom quote banner — dark strip flanked by dice and candles. */
export default function DashboardFooter() {
  return (
    <div className="flex items-center justify-center gap-4 rounded-lg border border-[#3c352a] bg-[rgba(10,8,5,0.8)] px-4 py-5">
      <Dices size={16} className="shrink-0 text-[#d4a055]" />
      <p className="text-center font-fell italic text-[13px] leading-relaxed text-[#e0d6c2]">
        "Not just a tool. A better way to play."
        <span className="ml-2 font-display text-[9px] font-bold not-italic tracking-[0.22em] text-[#8d8578]">
          — GINGER DRAGON STUDIOS —
        </span>
      </p>
      <Flame size={16} className="shrink-0 text-[#d4a055]" />
    </div>
  );
}