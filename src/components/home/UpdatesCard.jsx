import React from "react";
import { Link } from "react-router-dom";
import { Bell, Sparkle } from "lucide-react";
import ComingSoonPill from "@/components/home/ComingSoonPill";

/* WHAT'S NEW / LATEST UPDATES — the roadmap list from the approved
   mockup. Static informational content. */
const ITEMS = ["Map & Dungeon Creator", "Expanded Rule Systems", "New GM Encounter Tools"];

export default function UpdatesCard({ title = "WHAT'S NEW?" }) {
  return (
    <section className="flex flex-col rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-4 backdrop-blur-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.12em] text-white">
          <Bell size={14} className="text-[#d4a055]" />
          {title}
        </h3>
        <Link to="/help" className="text-[10px] tracking-[0.08em] text-[#d4a055] hover:text-[var(--gold-bright)]">
          View All
        </Link>
      </header>
      <ul className="flex flex-col gap-3">
        {ITEMS.map((item) => (
          <li key={item} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2.5 text-[12px] text-[#e0d6c2]">
              <Sparkle size={12} className="shrink-0 text-[#d4a055]" />
              {item}
            </span>
            <ComingSoonPill />
          </li>
        ))}
      </ul>
    </section>
  );
}