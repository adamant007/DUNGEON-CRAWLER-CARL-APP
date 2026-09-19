import React, { useMemo, useState } from "react";
import { PackageOpen, Plus, Trash2 } from "lucide-react";
import SheetPanel from "@/components/character/SheetPanel";
import { parseQty } from "@/components/character/consumableEffect";

const blankItem = () => ({ item: "", qty: "", notes: "" });

function insertItem(rows, item) {
  const next = Array.isArray(rows) ? rows.map((r) => ({ ...r })) : [];
  const empty = next.findIndex((r) => !(r?.item ?? "").toString().trim());
  if (empty >= 0) next[empty] = { ...blankItem(), ...item };
  else next.push({ ...blankItem(), ...item });
  return next;
}

export default function DimensionalStoragePanel({ inventory, setInventory, strength = 0 }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ item: "", qty: 1, weight: "", notes: "" });

  const liftLimit = Math.max(0, Number(strength) || 0) * 15;
  const rows = useMemo(
    () =>
      (Array.isArray(inventory) ? inventory : [])
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => (item?.item ?? "").toString().trim()),
    [inventory]
  );

  const updateRow = (index, patch) =>
    setInventory((current) => {
      const next = Array.isArray(current) ? current.map((r) => ({ ...r })) : [];
      next[index] = { ...blankItem(), ...(next[index] ?? {}), ...patch };
      return next;
    });

  const removeRow = (index) =>
    setInventory((current) => {
      const next = Array.isArray(current) ? current.map((r) => ({ ...r })) : [];
      next[index] = blankItem();
      return next;
    });

  const addItem = () => {
    const name = draft.item.trim();
    if (!name) return;
    const weight = draft.weight === "" ? undefined : Math.max(0, Number(draft.weight) || 0);
    setInventory((current) =>
      insertItem(current, {
        item: name,
        qty: String(Math.max(1, Math.round(Number(draft.qty) || 1))),
        notes: draft.notes.trim(),
        ...(weight === undefined ? {} : { weight }),
      })
    );
    setDraft({ item: "", qty: 1, weight: "", notes: "" });
    setAdding(false);
  };

  return (
    <SheetPanel icon={PackageOpen} title="Dimensional Storage">
      <div className="mb-2 grid gap-1.5 sm:grid-cols-3">
        <div className="ink-box px-2 py-1.5 text-center">
          <div className="field-label text-[8px]">Capacity</div>
          <div className="font-garamond text-[12px] font-bold">UNLIMITED</div>
        </div>
        <div className="ink-box px-2 py-1.5 text-center">
          <div className="field-label text-[8px]">Stored Weight</div>
          <div className="font-garamond text-[12px] font-bold">WEIGHTLESS</div>
        </div>
        <div className="ink-box px-2 py-1.5 text-center">
          <div className="field-label text-[8px]">Unaided Lift Limit</div>
          <div className="font-garamond text-[12px] font-bold tabular-nums">{liftLimit} lb</div>
        </div>
      </div>

      <div className="mb-2 rounded-sm border border-[var(--rule)] bg-[rgba(255,248,220,0.16)] px-2 py-1.5">
        <p className="font-fell text-[10px] leading-snug text-[var(--ink-soft)]">
          To store an item, the crawler must be able to lift it unaided for 4 seconds. Once stored, it does not count toward encumbrance.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="py-2 text-center font-fell italic text-[11px] text-[var(--ink-faint)]">
          Dimensional Storage is empty.
        </p>
      ) : (
        <div className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
          {rows.map(({ item, index }) => {
            const qty = parseQty(item?.qty);
            const weight = Number(item?.weight);
            const tooHeavy = Number.isFinite(weight) && weight > 0 && weight > liftLimit;
            return (
              <div key={index} className="rounded-sm border border-[var(--rule)]/60 px-2 py-1.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-garamond text-[13px] font-semibold text-[var(--ink)]">{item.item}</span>
                      {Number.isFinite(weight) && weight > 0 && (
                        <span className={`font-fell text-[9px] ${tooHeavy ? "text-[#a33a32]" : "text-[var(--ink-faint)]"}`}>
                          {weight} lb{tooHeavy ? " • exceeds current lift limit" : ""}
                        </span>
                      )}
                    </div>
                    {(item?.notes ?? "").trim() && (
                      <p className="font-fell italic text-[9px] leading-snug text-[var(--ink-faint)]">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateRow(index, { qty: String(Math.max(0, qty - 1)) })}
                      className="ink-box h-7 w-7 text-sm"
                      aria-label={`Remove one ${item.item}`}
                    >
                      −
                    </button>
                    <span className="ink-box inline-flex h-7 min-w-9 items-center justify-center px-1.5 text-[10px] font-bold tabular-nums">
                      ×{qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRow(index, { qty: String(qty + 1) })}
                      className="ink-box h-7 w-7 text-sm"
                      aria-label={`Add one ${item.item}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="ink-box ml-1 inline-flex h-7 w-7 items-center justify-center text-[#8b2f2a]"
                      aria-label={`Remove ${item.item} from storage`}
                      title="Remove from storage"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adding ? (
        <div className="mt-2 rounded-sm border border-[var(--rule)] p-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_6rem_7rem]">
            <label className="block">
              <span className="field-label text-[8px]">Item</span>
              <input
                value={draft.item}
                onChange={(e) => setDraft((d) => ({ ...d, item: e.target.value }))}
                className="ink-box mt-0.5 h-9 w-full px-2 text-[12px]"
                placeholder="What did you grab?"
              />
            </label>
            <label className="block">
              <span className="field-label text-[8px]">Qty</span>
              <input
                type="number"
                min="1"
                value={draft.qty}
                onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
                className="ink-box mt-0.5 h-9 w-full text-center text-[12px]"
              />
            </label>
            <label className="block">
              <span className="field-label text-[8px]">Weight (lb)</span>
              <input
                type="number"
                min="0"
                value={draft.weight}
                onChange={(e) => setDraft((d) => ({ ...d, weight: e.target.value }))}
                className="ink-box mt-0.5 h-9 w-full text-center text-[12px]"
                placeholder="optional"
              />
            </label>
          </div>
          <label className="mt-2 block">
            <span className="field-label text-[8px]">Notes</span>
            <input
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              className="ink-box mt-0.5 h-9 w-full px-2 text-[12px]"
              placeholder="Effect, source, weird warning, etc."
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={addItem} disabled={!draft.item.trim()} className="ink-box h-9 flex-1 text-[10px] font-bold disabled:opacity-40">
              STORE ITEM
            </button>
            <button type="button" onClick={() => setAdding(false)} className="ink-box h-9 px-3 text-[10px]">
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-sm border-2 border-[var(--ink)] bg-[rgba(47,38,32,0.88)] font-display text-[10px] font-bold tracking-[0.12em] text-[#f0e2c8]"
        >
          <Plus size={14} /> STORE ITEM
        </button>
      )}
    </SheetPanel>
  );
}
