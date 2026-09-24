import React from "react";
import { Link } from "react-router-dom";
import { Play, Users, Hammer, Plus } from "lucide-react";
import { format } from "date-fns";

/* Dashboard hero — dragon-hoard backdrop with the welcome heading, the
   Continue Playing card, secondary action buttons, and the parchment
   flourish banner. Reproduced from the approved mockup. */
const HERO_URL = "/brand/ginger-dragon-studios-tapestry.png";

export default function DashboardHero({ me, activeCharacter, onContinue, onCreateNew }) {
  const firstName = (me?.full_name || "").trim().split(" ")[0] || "";
  const lastSession = activeCharacter?.updated_date
    ? format(new Date(activeCharacter.updated_date), "MMM d, yyyy")
    : "";

  return (
    <section className="relative overflow-hidden rounded-lg border border-[#3c352a] bg-[radial-gradient(circle_at_82%_42%,rgba(110,25,36,.26),transparent_30%),linear-gradient(135deg,#150d0d_0%,#0b0d12_58%,#08090c_100%)]">
      <img
        src={HERO_URL}
        alt="Ginger Dragon Studios"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-[50%_18%] opacity-95"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,.94)_0%,rgba(5,5,6,.72)_46%,rgba(5,5,6,.28)_76%,rgba(5,5,6,.12)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0a0a0a]" />

      {/* Parchment flourish — top right */}
      <span className="absolute right-5 top-5 rotate-[2deg] border border-[#8a775c] bg-[linear-gradient(rgba(248,239,216,0.92),rgba(243,232,206,0.92))] px-4 py-2 font-fell italic text-[11px] text-[#3a2b16] shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
        Adventure Builds Better Stories
      </span>

      <div className="relative z-10 flex min-h-[360px] flex-col justify-end gap-6 p-6 sm:p-10">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[0.06em] text-white sm:text-[38px]">
            Welcome back, {firstName || "Crawler"}
          </h1>
          <p className="mt-2 font-display text-[11px] font-bold tracking-[0.3em] text-[#c5a059] sm:text-[13px]">
            SAME TABLE. NEW ADVENTURES.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeCharacter && (
            <button
              type="button"
              onClick={onContinue}
              className="flex items-center gap-3 rounded-md border border-[#4a3a26] bg-[rgba(0,0,0,0.6)] px-5 py-3 text-left backdrop-blur-sm transition-colors hover:border-[var(--gold)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#a11616,#6e0000)] shadow-[0_0_12px_rgba(166,58,48,0.5)]">
                <Play size={15} className="ml-0.5 text-[#f0e2c8]" />
              </span>
              <span>
                <span className="block text-[9px] font-bold tracking-[0.22em] text-[#d4a055]">CONTINUE PLAYING</span>
                <span className="block font-display text-[16px] font-bold text-white">
                  {activeCharacter.name || "Your Character"}
                </span>
                {lastSession && (
                  <span className="block text-[10px] text-[#b0b0b0]">Last session: {lastSession}</span>
                )}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-2 rounded-md border border-[#4a3a26] bg-[rgba(0,0,0,0.5)] px-4 py-2.5 text-[12px] font-semibold text-[#e0d8c3] backdrop-blur-sm transition-colors hover:border-[var(--gold)]"
          >
            <Plus size={14} className="text-[#d4a055]" />
            Create Character
          </button>
          <Link
            to="/campaign"
            className="flex items-center gap-2 rounded-md border border-[#4a3a26] bg-[rgba(0,0,0,0.5)] px-4 py-2.5 text-[12px] font-semibold text-[#e0d8c3] backdrop-blur-sm transition-colors hover:border-[var(--gold)]"
          >
            <Users size={14} className="text-[#d4a055]" />
            Join Campaign
          </Link>
          <Link
            to="/gm-tools"
            className="flex items-center gap-2 rounded-md border border-[#4a3a26] bg-[rgba(0,0,0,0.5)] px-4 py-2.5 text-[12px] font-semibold text-[#e0d8c3] backdrop-blur-sm transition-colors hover:border-[var(--gold)]"
          >
            <Hammer size={14} className="text-[#d4a055]" />
            Launch GM Tools
          </Link>
        </div>
      </div>
    </section>
  );
}