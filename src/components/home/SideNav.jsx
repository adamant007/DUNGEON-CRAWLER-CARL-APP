import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, Users, Hammer, Map as MapIcon, BookOpen,
  Dices, Gift, Notebook, Settings, LogOut,
} from "lucide-react";
import GdsEmblem from "@/components/home/GdsEmblem";
import { base44 } from "@/api/base44Client";

/* Returning-dashboard sidebar — reproduced from the approved mockup:
   GDS brand, the full section menu with Dashboard active, and the
   Settings / Log Out footer with the tagline. */
const ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Characters", to: "/character", icon: User },
  { label: "Campaigns", to: "/campaign", icon: Users },
  { label: "GM Tools", to: "/gm-tools", icon: Hammer },
  { label: "Maps & Dungeons", to: "/maps", icon: MapIcon },
  { label: "Rules & Systems", to: "/rules", icon: BookOpen },
  { label: "Dice Roller", to: "/dice-roller", icon: Dices },
  { label: "Loot Generator", to: "/loot-generator", icon: Gift },
  { label: "Notes", to: "/notes", icon: Notebook },
];

export default function SideNav() {
  const { pathname } = useLocation();

  return (
    <aside className="flex shrink-0 items-center gap-4 border-b border-[#3c352a] bg-[#1a1612] px-4 py-3 lg:h-auto lg:w-60 lg:flex-col lg:items-stretch lg:gap-6 lg:border-b-0 lg:border-r lg:py-6">
      <Link to="/" className="flex shrink-0 items-center gap-2.5 lg:justify-center">
        <GdsEmblem size={36} />
        <span className="flex flex-col leading-none">
          <span className="font-display text-[13px] font-bold tracking-[0.14em] text-[#d4a055]">GDS</span>
          <span className="mt-1 font-display text-[6px] tracking-[0.2em] text-[#a0a0a0]">GINGER DRAGON STUDIOS</span>
        </span>
      </Link>

      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-[12px] tracking-[0.04em] transition-colors lg:border-l-2 ${
                active
                  ? "border-[#d4a055] bg-[#2d2518] font-semibold text-[#e8c87a]"
                  : "border-transparent text-[#b0b0b0] hover:bg-[rgba(212,160,85,0.08)] hover:text-white"
              }`}
            >
              <item.icon size={15} className={active ? "text-[#d4a055]" : "text-[#8d8578]"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 flex-col gap-1">
        <Link
          to="/settings"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] text-[#b0b0b0] transition-colors hover:text-white"
        >
          <Settings size={15} className="text-[#8d8578]" />
          Settings
        </Link>
        <button
          type="button"
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12px] text-[#b0b0b0] transition-colors hover:text-white"
        >
          <LogOut size={15} className="text-[#8d8578]" />
          Log Out
        </button>
        <p className="mt-2 hidden font-fell italic text-[10px] text-[#8d8578] lg:block">
          Great Games Bring People Together
        </p>
      </div>
    </aside>
  );
}