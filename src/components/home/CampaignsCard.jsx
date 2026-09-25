import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import GdsEmblem from "@/components/home/GdsEmblem";
import { base44 } from "@/api/base44Client";

/* RECENT CAMPAIGNS — always use the signed-in account's live cloud data.
   Never fall back to presentation/mock campaign rows. */
export default function CampaignsCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const campaigns = await base44.campaigns.list();
        if (alive) setRows(campaigns || []);
      } catch {
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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

      {loading ? (
        <p className="py-2 font-fell text-[11px] text-[#8d8578]">Loading campaigns…</p>
      ) : rows.length ? (
        <ul className="flex flex-col gap-2.5">
          {rows.slice(0, 3).map((row) => (
            <li key={row.id} className="flex items-center gap-3">
              <GdsEmblem size={34} className="!border-[#3c352a]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  {row.name || row.title || "Unnamed Campaign"}
                </p>
                <p className="text-[11px] text-[#a0a0a0]">
                  {String(row.role || "player").toUpperCase()}
                </p>
              </div>
              <ChevronRight size={15} className="shrink-0 text-[#8d8578]" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 font-fell text-[11px] text-[#8d8578]">
          No cloud campaigns found for this account.
        </p>
      )}
    </section>
  );
}
