import React from "react";
import { FlaskConical, Package } from "lucide-react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import { parseQty, parseConsumableEffect } from "@/components/character/consumableEffect";

const BTN =
  "w-full h-11 flex items-center justify-center gap-2 font-fell-sc text-[16px] font-bold tracking-[.05em] text-[#24180f] border border-[#4a3727] bg-[rgba(255,248,220,0.45)] transition-colors hover:bg-[rgba(74,55,39,0.14)] disabled:opacity-60 disabled:pointer-events-none";

const MANAGE_BTN =
  "w-full h-8 flex items-center justify-center gap-1.5 font-fell-sc text-[10px] font-bold tracking-[.05em] text-[#4a3727] border border-[#4a3727]/60 bg-[rgba(255,248,220,0.3)] transition-colors hover:bg-[rgba(74,55,39,0.12)]";
const LABEL = "font-fell-sc text-[12px] tracking-[0.06em] text-[#5c4d3d]";

/* ONE reusable Consumable Action Card — shared by Inventory and Hotbar.
   Inventory remains the single source of truth for item quantity and
   stored effect text. USE applies only a canonical effect the parser
   understands, then the shared inventory quantity changes in one place. */
export default function ConsumableActionCard({ name, qty = 0, effect = "", onUse, onManage, onClose }) {
  const remaining = parseQty(qty);
  const parsed = parseConsumableEffect(name, effect);
  const executable = !!parsed;
  const usable = remaining > 0 && executable;

  const effectSummary =
    parsed?.type === "heal_slots"
      ? `Restores ${parsed.slots} Health Bar slot${parsed.slots === 1 ? "" : "s"}.`
      : parsed?.type === "mana_full"
        ? "Restores Mana to full."
        : "";

  return (
    <ParchmentDialog title={name || "Item"} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="ink-box px-2 h-7 inline-flex items-center text-[12px] font-bold tabular-nums">
            Qty {remaining}
          </span>
        </div>

        {(effect || effectSummary) && (
          <div className="border border-[var(--rule)] bg-[rgba(255,248,220,0.22)] px-3 py-2">
            <span className={`${LABEL} mb-1 block`}>What It Does</span>
            {effectSummary && (
              <p className="font-garamond text-[14px] font-semibold leading-snug text-[#24180f]">
                {effectSummary}
              </p>
            )}
            {effect && effect !== effectSummary && (
              <p className="mt-1 font-fell italic text-[13px] leading-snug text-[var(--ink-soft)]">{effect}</p>
            )}
          </div>
        )}

        <div className="border border-[var(--rule)] bg-[rgba(255,248,220,0.18)] px-3 py-2">
          <span className={`${LABEL} mb-1 block`}>How To Use It</span>
          <p className="font-fell text-[13px] leading-snug text-[var(--ink-soft)]">
            Tap USE to apply the stored effect and spend one item. Inventory quantity updates automatically.
          </p>
        </div>

        {usable ? (
          <button type="button" className={BTN} onClick={onUse}>
            <FlaskConical size={15} /> USE {name}
          </button>
        ) : remaining > 0 ? (
          <p className="font-fell font-bold text-[15px] text-[#8b0000]">
            No executable effect is recorded for {name}.
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
