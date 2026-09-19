import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import { amountOf, VAULT_CHEST_URL } from "@/components/character/currency";

/* The Vault — where the pouch's contents are visible. The battered old
   lockbox artwork shows the chaotic, jumbled hoard (decorative atmosphere
   only — never inventory records); the five currency rows are REAL
   stored character data rendered exactly as the active Rules Profile
   defines them (Platinum → Electrum → Gold → Silver → Copper). Edits are
   held in a DRAFT: SAVE & CLOSE validates (non-negative whole numbers),
   commits, recalculates the Copper-normalized wealth (the pouch updates
   immediately), persists through the character save path, confirms with
   a toast, and closes. Closing with unsaved edits (X / Escape / backdrop)
   warns first — edits are never silently discarded. Autosave continues
   to run for the committed state. */
export default function VaultDialog({ currency = {}, currencies = [], onSave, onClose }) {
  const { toast } = useToast();
  const list = Array.isArray(currencies) ? currencies : [];
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(list.map((c) => [c.id, amountOf(currency, c.id)]))
  );
  const [warn, setWarn] = useState(false);
  const [busy, setBusy] = useState(false);

  const dirty = list.some((c) => amountOf(draft, c.id) !== amountOf(currency, c.id));

  /* Validation: amounts are always clamped to non-negative whole numbers,
     both while typing and again at save. */
  const setAmount = (id, v) =>
    setDraft((d) => ({ ...d, [id]: Math.max(0, Math.round(Number(v) || 0)) }));

  const requestClose = () => {
    if (dirty) setWarn(true);
    else onClose?.();
  };

  const save = async () => {
    setBusy(true);
    try {
      const clean = {};
      for (const c of list) clean[c.id] = amountOf(draft, c.id);
      await onSave?.(clean);
      toast({ title: "Vault saved", description: "The pouch already feels heavier." });
      onClose?.();
    } catch {
      toast({
        title: "Could not save",
        description: "Your changes weren't saved — try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ParchmentDialog title="The Vault" medium onClose={requestClose}>
      <div>
        <div className="relative h-40 w-full overflow-hidden rounded-md border border-[#4a3727] bg-[#1a140e] sm:h-44">
          <Image
            src={VAULT_CHEST_URL}
            alt="The Vault — an open battered lockbox of chaotic treasure"
            fittingType="fill"
            className="h-full w-full"
          />
        </div>
        <p className="mt-1.5 text-center font-fell italic text-[10px] leading-snug text-[#5a4634]">
          “Treasure, trash, memories… it all ends up here.” — The Ginger Dragon
        </p>
        <p className="field-label mb-1.5 mt-2.5 text-[9px]">Currency Totals</p>
        {list.length === 0 ? (
          <p className="font-fell italic text-[11px] text-[#8a775c]">
            The loaded ruleset defines no currencies.
          </p>
        ) : (
          <div className="space-y-1.5">
            {list.map((c) => {
              const value = amountOf(draft, c.id);
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 font-fell-sc text-[10px]">{c.label}</span>
                  <button
                    type="button"
                    onClick={() => setAmount(c.id, value - 1)}
                    disabled={value <= 0}
                    className="ink-box h-7 w-7 shrink-0 text-sm disabled:opacity-40"
                    aria-label={`Remove one ${c.label}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => setAmount(c.id, e.target.value)}
                    className="ink-box h-7 flex-1 text-center text-[12px] font-bold tabular-nums"
                    aria-label={`${c.label} amount`}
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(c.id, value + 1)}
                    className="ink-box h-7 w-7 shrink-0 text-sm"
                    aria-label={`Add one ${c.label}`}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {warn && dirty && (
          <div className="mt-2 rounded-sm border border-[rgba(139,0,0,0.45)] bg-[rgba(139,0,0,0.08)] p-2 text-center">
            <p className="font-fell italic text-[11px] text-[var(--ink)]">
              Unsaved changes to your coin.
            </p>
            <div className="mt-1.5 flex justify-center gap-2">
              <button type="button" onClick={save} disabled={busy} className="ink-box h-7 px-3 text-[9px]">
                Save
              </button>
              <button type="button" onClick={() => onClose?.()} className="ink-box h-7 px-3 text-[9px]">
                Discard
              </button>
              <button type="button" onClick={() => setWarn(false)} className="ink-box h-7 px-3 text-[9px]">
                Keep Editing
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="mt-2.5 flex h-9 w-full items-center justify-center rounded-sm border-2 border-[var(--ink)] bg-[rgba(47,38,32,0.88)] font-display text-[10px] font-bold tracking-[0.18em] text-[#f0e2c8] transition-colors hover:bg-[rgba(47,38,32,1)] disabled:opacity-60"
        >
          {busy ? "SAVING…" : "SAVE & CLOSE"}
        </button>

        <p className="mt-2 text-center font-fell italic text-[9px] text-[#8a775c]">
          “A coin is never just a coin down here.” — The Ginger Dragon
        </p>
      </div>
    </ParchmentDialog>
  );
}