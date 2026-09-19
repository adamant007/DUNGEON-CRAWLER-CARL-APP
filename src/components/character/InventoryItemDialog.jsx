import React, { useState } from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import { parseQty } from "@/components/character/consumableEffect";

const BTN =
  "w-full h-11 flex items-center justify-center gap-2 font-fell-sc text-[16px] font-bold tracking-[.05em] text-[#24180f] border border-[#4a3727] bg-[rgba(255,248,220,0.45)] transition-colors hover:bg-[rgba(74,55,39,0.14)]";

/* Restock / Manage in Inventory — opens from the Hotbar potion popup and
   edits the ONE canonical Inventory row the hotbar slot references.
   Quantity and notes write straight back into the SAME row (never a new
   entry), so the Hotbar tile, the potion popup, and the Inventory panel
   all read the same live count, persisted through the normal autosave.
   The item's name is fixed here — renaming would break the Hotbar slot's
   reference to this row. */
export default function InventoryItemDialog({ item, onSave, onClose }) {
  const [qty, setQty] = useState(parseQty(item?.qty));
  const [notes, setNotes] = useState((item?.notes ?? "").trim());

  const adjust = (d) => setQty((q) => Math.max(0, (Number(q) || 0) + d));

  const save = () => {
    onSave({ qty: String(qty), notes });
  };

  return (
    <ParchmentDialog title="Restock / Manage Item" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <p className="field-label text-[9px] mb-0.5">Item</p>
          <p className="font-garamond text-[16px] font-semibold text-[#24180f]">
            {item?.item || "—"}
          </p>
        </div>
        <div>
          <p className="field-label text-[9px] mb-1">Quantity in Inventory</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => adjust(-1)} className="ink-box w-9 h-9 text-base shrink-0" aria-label="Decrease quantity">−</button>
            <input
              type="number"
              min="0"
              value={qty}
              onChange={(e) => setQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="ink-box flex-1 h-9 text-center text-sm font-bold tabular-nums"
              aria-label="Quantity"
            />
            <button type="button" onClick={() => adjust(1)} className="ink-box w-9 h-9 text-base shrink-0" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <p className="field-label text-[9px] mb-1">Notes / Effect</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full ink-input font-garamond text-[13px] leading-snug resize-none"
            aria-label="Item notes"
          />
        </div>
        <button type="button" className={BTN} onClick={save}>
          SAVE ITEM
        </button>
      </div>
    </ParchmentDialog>
  );
}