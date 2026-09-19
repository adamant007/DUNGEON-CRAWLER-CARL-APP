import React from "react";
import { Link } from "react-router-dom";
import { Dices, Gift, Notebook, Swords } from "lucide-react";

/* QUICK TOOLS — four gold-outlined tool boxes from the approved mockup.
   The tools ship as marked placeholders until they're built. */
const TOOLS = [
  { label: "Dice Roller", to: "/dice-roller", icon: Dices },
  { label: "Loot Generator", to: "/loot-generator", icon: Gift },
  { label: "Session Notes", to: "/notes", icon: Notebook },
  { label: "Initiative Tracker", to: "/initiative-tracker", icon: Swords },
];

export default function QuickTools() {
  return (
    <section className="rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-4 backdrop-blur-sm">
      <h3 className="mb-3 font-display text-[12px] font-bold tracking-[0.14em] text-[#c5a059]">
        QUICK TOOLS
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.label}
            to={tool.to}
            className="flex flex-col items-center gap-2 rounded-md border border-[#4a3a26] bg-[rgba(255,255,255,0.02)] px-3 py-4 transition-colors hover:border-[var(--gold)]"
          >
            <tool.icon size={20} className="text-[#d4a055]" />
            <span className="text-center font-display text-[10px] font-bold tracking-[0.1em] text-[#e0d8c3]">
              {tool.label.toUpperCase()}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}