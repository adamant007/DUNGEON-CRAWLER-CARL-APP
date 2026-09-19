import React from "react";
import { Link } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import GdsEmblem from "@/components/home/GdsEmblem";

/* RECENT CAMPAIGNS — rendered exactly as the approved mockup: a list of
   campaign rows with thumbnail, title, and last-session date. Campaigns
   are not live yet, so these are the mockup's presentation rows. */
const DEFAULT_ROWS = [
  { title: "The Tower of Wonky Magic", date: "Sep 6, 2026" },
  { title: "The Broken Realms", date: "Aug 28, 2026" },
  { title: "Sunday Night Crawl", date: "Aug 15, 2026" },
];

export default function CampaignsCard({ rows = DEFAULT_ROWS }) {
  return (
    <section className="flex flex-col rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-4 backdrop-blur-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.12em] text-white">
          <Users size={14} className="text-[#d4a055]" />
          RECENT CAMPAIGNS
        </h3>
        <Link to="/campaign" className="text-[10px] tracking-[0.08em] text-[#d4a055] hover:text-[var(--gold-bright)]">
          View All
        </Link>
      </header>
      <ul className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <li key={row.title} className="flex items-center gap-3">
            <GdsEmblem size={34} className="!border-[#3c352a]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{row.title}</p>
              <p className="text-[11px] text-[#a0a0a0]">Last played: {row.date}</p>
            </div>
            <ChevronRight size={15} className="shrink-0 text-[#8d8578]" />
          </li>
        ))}
      </ul>
    </section>
  );
}