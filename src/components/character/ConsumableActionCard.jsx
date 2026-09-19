import React from "react";
import { FlaskConical, Package } from "lucide-react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import { parseQty, parseConsumableEffect } from "@/components/character/consumableEffect";

const BTN =
  "w-full h-11 flex items-center justify-center gap-2 font-fell-sc text-[16px] font-bold tracking-[.05em] text-[#24180f] border border-[#4a3727] bg-[rgba(255,248,220,0.45)] transition-colors hover:bg-[rgba(74,55,39,0.14)] disabled:opacity-60 disabled:pointer-events-none";

const MANAGE_BTN =
  "w-full h-8 flex items-center justify-center gap-1.5 font-fell-sc text-[10px] font-bold tracking-[.05em] text-[#4a3727] border border-[#4a3727]/60 bg-[rgba(255,248,220,0.3)] transition-colors hover:bg-[rgba(74,55,39,0.12)]";

/* Hotbar consumable card — references the SAME canonical Inventory item
   and its ONE shared quantity (Inventory is the single source of truth;
   the hotbar slot is only a reference). USE applies the item's STORED
   effect definition and decrements the shared inventory quantity by
   exactly 1 (never below 0) only after the effect resolves. At 0 the
   assignment stays and the card says "No [item] remaining" — the small
   RESTOCK / MANAGE IN INVENTORY control opens that specific Inventory
   row for editing/restocking (updating it in place, never a duplicate). */
export default function ConsumableActionCard({ name, qty = 0, effect = "", onUse, onManage, onClose }) {
  const remaining = parseQty(qty);
  const executable = !!parseConsumableEffect(name, effect);
  const usable = remaining > 0 && executable;
  return (
    <ParchmentDialog title={name || "Item"} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="ink-box px-2 h-7 inline-flex items-center text-[12px] font-bold tabular-nums">
            Qty {remaining}
          </span>
        </div>
        {effect && (
          <p className="font-fell italic text-[14px] leading-snug text-[#24180f]">{effect}</p>
        )}
        {usable ? (
          <button type="button" className={BTN} onClick={onUse}>
            <FlaskConical size={15} /> USE {name}
          </button>
        ) : remaining > 0 ? (
          <p className="font-fell font-bold text-[15px] text-[#8b0000]">
            {name} cannot currently be used.
          </p>
        ) : (
          <p className="font-fell font-bold text-[15px] text-[#8b0000]">No {name} remaining.</p>
        )}
        {onManage && (
          <button type="button" className={MANAGE_BTN} onClick={onManage}>
            <Package size={12} /> RESTOCK / MANAGE IN INVENTORY
          </button>
        )}
      </div>
    </ParchmentDialog>
  );
}