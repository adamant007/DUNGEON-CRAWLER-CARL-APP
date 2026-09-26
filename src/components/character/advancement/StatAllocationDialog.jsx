import React from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

const STAT_ROWS = [
  ["str", "Strength"],
  ["int", "Intelligence"],
  ["con", "Constitution"],
  ["dex", "Dexterity"],
  ["cha", "Charisma"],
];

const BTN =
  "ink-box px-3 py-2 font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f] disabled:opacity-50";

export default function StatAllocationDialog({
  sheet,
  available,
  forced = false,
  onConfirm,
  onClose,
}) {
  const [allocation, setAllocation] = React.useState({ str: 0, int: 0, con: 0, dex: 0, cha: 0 });
  const [error, setError] = React.useState("");
  const spent = Object.values(allocation).reduce((a, b) => a + Number(b || 0), 0);
  const remaining = Math.max(0, Number(available || 0) - spent);
  const caps = sheet?.rulesetData?.statCaps ?? {};

  const change = (key, delta) => {
    setError("");
    setAllocation((prev) => {
      const current = Number(prev[key] || 0);
      const next = Math.max(0, current + delta);
      const totalWithout = Object.entries(prev).reduce(
        (sum, [k, v]) => sum + (k === key ? 0 : Number(v || 0)),
        0
      );
      if (totalWithout + next > Number(available || 0)) return prev;
      const cap = Number(caps[key]);
      if (Number.isFinite(cap) && Number(sheet?.attrs?.[key] || 0) + next > cap) return prev;
      return { ...prev, [key]: next };
    });
  };

  const submit = async () => {
    if (forced && remaining !== 0) {
      setError("Spend all available Stat points before choosing your Floor 3 Race.");
      return;
    }
    if (spent <= 0) {
      setError("Choose at least one Stat point.");
      return;
    }
    const result = await onConfirm?.(allocation);
    if (result?.ok === false) setError(result.reason || "Those Stat points could not be applied.");
  };

  return (
    <ParchmentDialog
      title={forced ? "Floor 3 — Distribute Stat Points" : "Spend Stat Points"}
      medium
      dismissible={!forced}
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.18)] p-3">
          <p className="font-display text-[17px] font-bold text-[#24180f]">
            {available} Stat Point{Number(available) === 1 ? "" : "s"} Available
          </p>
          <p className="mt-1 font-fell text-[12px] text-[#24180f]">
            Each point permanently increases both the Unenhanced and Enhanced value of that Stat.
            {forced
              ? " Spend the full pool now; your updated Stats determine which Third-Floor choices you qualify for."
              : " You may spend some now and leave the rest banked for a later saferoom."}
          </p>
        </div>

        <div className="space-y-2">
          {STAT_ROWS.map(([key, label]) => {
            const base = Number(sheet?.attrs?.[key] || 0);
            const add = Number(allocation[key] || 0);
            const cap = Number(caps[key]);
            const capped = Number.isFinite(cap) && base + add >= cap;
            return (
              <div key={key} className="grid grid-cols-[1fr_48px_92px] items-center gap-2 border border-[var(--rule)] px-3 py-2">
                <div>
                  <p className="font-display text-[14px] font-bold text-[#24180f]">{label}</p>
                  <p className="font-fell text-[11px] text-[var(--ink-soft)]">
                    {base}{add ? ` → ${base + add}` : ""}{Number.isFinite(cap) ? ` · Cap ${cap}` : ""}
                  </p>
                </div>
                <div className="text-center font-display text-[17px] font-bold text-[#24180f]">+{add}</div>
                <div className="flex justify-end gap-1">
                  <button type="button" className={BTN} disabled={add <= 0} onClick={() => change(key, -1)}>−</button>
                  <button type="button" className={BTN} disabled={remaining <= 0 || capped} onClick={() => change(key, 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--rule)] pt-3">
          <p className="font-fell text-[13px] font-bold text-[#24180f]">Remaining: {remaining}</p>
          <div className="flex gap-2">
            {!forced ? <button type="button" className={BTN} onClick={onClose}>Later</button> : null}
            <button type="button" className={BTN} disabled={spent <= 0 || (forced && remaining !== 0)} onClick={submit}>
              Apply {spent} Point{spent === 1 ? "" : "s"}
            </button>
          </div>
        </div>
        {error ? <p className="font-fell text-[12px] font-bold text-[var(--hp)]">{error}</p> : null}
      </div>
    </ParchmentDialog>
  );
}
