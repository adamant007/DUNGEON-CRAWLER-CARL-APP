import React from "react";
import { GD_INVENTORY } from "@/components/ui/GingerDragonIcons";
import SheetPanel from "@/components/character/SheetPanel";
import { parseQty } from "@/components/character/consumableEffect";

/* V3 compact Inventory panel — a read-only view of the character's live
   canonical Inventory items (the SAME single source of truth the Hotbar's
   consumables reference). Quantities here are the shared canonical values:
   using a Hotbar consumable decrements the same row this panel displays.
   Adding/managing carried items belongs to character creation and future
   gear management — this panel never edits. */
export default function InventoryPanel({ inventory }) {
  const rows = (Array.isArray(inventory) ? inventory : []).filter((it) =>
    (it?.item ?? "").toString().trim() !== ""
  );

  return (
    <SheetPanel icon={GD_INVENTORY} title="Inventory">
      {rows.length === 0 && (
        <p className="font-fell italic text-[11px] text-[var(--ink-faint)]">Nothing carried yet.</p>
      )}
      {rows.map((it, i) => (
        <div key={i} className="py-0.5 border-b border-[var(--rule)]/50 last:border-b-0">
          <div className="flex items-center gap-2">
            <span className="font-garamond text-[12px] font-semibold text-[var(--ink)] min-w-0 flex-1 truncate">
              {it.item}
            </span>
            <span className="ink-box px-1.5 h-6 inline-flex items-center text-[10px] font-bold tabular-nums shrink-0 select-none">
              ×{parseQty(it.qty)}
            </span>
          </div>
          {(it?.notes ?? "").trim() && (
            <p className="font-fell italic text-[9px] text-[var(--ink-faint)] leading-snug">
              {it.notes}
            </p>
          )}
        </div>
      ))}
    </SheetPanel>
  );
}