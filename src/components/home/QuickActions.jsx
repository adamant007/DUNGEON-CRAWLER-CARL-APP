import React from "react";
import { Link } from "react-router-dom";
import { Shield, FolderDown, Users } from "lucide-react";

/* QUICK ACTIONS — three square gold-outlined buttons wired to the
   existing character flows; Join Campaign opens the Campaigns section. */
const ACTIONS = [
  { label: "CREATE CHARACTER", to: "/character?action=new", icon: Shield },
  { label: "LOAD / IMPORT CHARACTER", to: "/character?action=load", icon: FolderDown },
  { label: "JOIN CAMPAIGN", to: "/campaign", icon: Users },
];

export default function QuickActions() {
  return (
    <section className="flex flex-col rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-4 backdrop-blur-sm">
      <h3 className="mb-3 font-display text-[12px] font-bold tracking-[0.12em] text-white">QUICK ACTIONS</h3>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#4a3a26] bg-[rgba(255,255,255,0.03)] p-3 text-center transition-colors hover:border-[var(--gold)] hover:bg-[rgba(212,160,85,0.10)]"
          >
            <action.icon size={20} className="text-[#d4a055]" />
            <span className="font-display text-[9px] font-bold leading-tight tracking-[0.08em] text-[#e8d8b5]">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}