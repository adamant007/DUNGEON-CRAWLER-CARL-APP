import React from "react";
import { Sparkle } from "lucide-react";
import { GD_INVENTORY } from "@/components/ui/GingerDragonIcons";

/* WHAT'S NEW — treasure-chest feature panel with the update list from
   the approved mockup. */
const UPDATES = ["New Maps Pack: Sunken Halls", "Rules Update v1.2", "New GM Encounter Tools"];

export default function WhatsNew() {
  return (
    <section className="flex flex-col rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-4 backdrop-blur-sm">
      <h3 className="mb-3 font-display text-[12px] font-bold tracking-[0.14em] text-[#c5a059]">
        WHAT'S NEW?
      </h3>
      <div className="flex flex-1 items-start gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-[#4a3a26] bg-[rgba(255,255,255,0.03)]">
          <GD_INVENTORY size={44} />
        </span>
        <ul className="flex flex-1 flex-col gap-2.5">
          {UPDATES.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[12px] text-[#e0d8c3]">
              <Sparkle size={11} className="shrink-0 text-[#d4a055]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}