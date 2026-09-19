import React, { useMemo, useState } from "react";
import { Hammer } from "lucide-react";
import SheetPanel from "@/components/character/SheetPanel";
import { parseQty } from "@/components/character/consumableEffect";

const SIZE_OPTIONS = [
  { rank: 1, label: "Tiny", example: "soda-can scale", junk: 1 },
  { rank: 2, label: "Small", example: "toaster scale", junk: 4 },
  { rank: 3, label: "Petite", example: "chair scale", junk: 16 },
  { rank: 4, label: "Medium", example: "desk scale", junk: 32 },
  { rank: 5, label: "Large", example: "statue scale", junk: 64 },
  { rank: 6, label: "Huge", example: "dumpster scale", junk: 128 },
  { rank: 7, label: "Colossal", example: "barn scale", junk: 256 },
  { rank: 8, label: "Gargantuan", example: "grain-silo scale", junk: 512 },
];

const TABLES = [
  ["Alchemy", "Potions / poisons"],
  ["Arcanist", "Items with inherent spells"],
  ["Armorer", "Armor"],
  ["Engineering", "Moving parts, fluids, chemicals, ammunition"],
  ["Metalworking", "Weapons"],
  ["Sapper's", "Explosives"],
  ["Writing", "Scrolls"],
];

const blankItem = () => ({ item: "", qty: "", notes: "" });

function insertItem(rows, item) {
  const next = Array.isArray(rows) ? rows.map((r) => ({ ...r })) : [];
  const empty = next.findIndex((r) => !(r?.item ?? "").toString().trim());
  if (empty >= 0) next[empty] = { ...blankItem(), ...item };
  else next.push({ ...blankItem(), ...item });
  return next;
}

function isMiscJunk(name) {
  return /misc(?:ellaneous)?\.?\s+junk/i.test((name ?? "").toString().trim());
}

export default function CraftingPanel({ inventory, setInventory, floor = 1 }) {
  const [mode, setMode] = useState("common");
  const [name, setName] = useState("");
  const [sizeRank, setSizeRank] = useState(1);
  const [movingParts, setMovingParts] = useState(false);

  const junk = useMemo(() => {
    const rows = Array.isArray(inventory) ? inventory : [];
    const index = rows.findIndex((row) => isMiscJunk(row?.item));
    return { index, qty: index >= 0 ? parseQty(rows[index]?.qty) : 0 };
  }, [inventory]);

  const size = SIZE_OPTIONS.find((s) => s.rank === Number(sizeRank)) ?? SIZE_OPTIONS[0];
  const craftSkill = movingParts ? "Engineering" : "Fabricate";
  const craftHours = size.rank * size.rank;

  const spendJunkAndStore = (amount, item) => {
    setInventory((current) => {
      let next = Array.isArray(current) ? current.map((r) => ({ ...r })) : [];
      const index = next.findIndex((row) => isMiscJunk(row?.item));
      if (index < 0) return next;
      const qty = parseQty(next[index]?.qty);
      if (qty < amount) return next;
      next[index] = { ...next[index], qty: String(qty - amount) };
      next = insertItem(next, item);
      return next;
    });
  };

  const recoverCommon = () => {
    const label = name.trim();
    if (!label || junk.qty < 1) return;
    spendJunkAndStore(1, { item: label, qty: "1", notes: "Recovered from Misc. Junk." });
    setName("");
  };

  const completeUncommon = () => {
    const label = name.trim();
    if (!label || junk.qty < size.junk) return;
    spendJunkAndStore(size.junk, {
      item: label,
      qty: "1",
      notes: `Crafted ${size.label} item • ${craftSkill} • ${craftHours}h project • ${size.junk} Misc. Junk`,
    });
    setName("");
  };

  const modes = [
    ["common", "COMMON"],
    ["uncommon", "UNCOMMON"],
    ["magic", "MAGIC / TABLES"],
  ];

  return (
    <SheetPanel icon={Hammer} title="Crafting">
      <div className="mb-2 flex gap-1 overflow-x-auto">
        {modes.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`ink-box h-8 min-w-fit flex-1 px-2 text-[9px] font-bold ${mode === id ? "bg-[rgba(47,38,32,0.16)]" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between rounded-sm border border-[var(--rule)] px-2 py-1.5">
        <span className="field-label text-[8px]">Misc. Junk Available</span>
        <span className="font-garamond text-[14px] font-bold tabular-nums">{junk.qty}</span>
      </div>

      {mode === "common" && (
        <div className="space-y-2">
          <p className="font-fell text-[10px] leading-snug text-[var(--ink-soft)]">
            Pull a small everyday item out of Misc. Junk. This spends 1 Misc. Junk and places the item directly into Dimensional Storage.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ink-box h-9 w-full px-2 text-[12px]"
            placeholder="Item name"
          />
          <button
            type="button"
            onClick={recoverCommon}
            disabled={!name.trim() || junk.qty < 1}
            className="ink-box h-9 w-full text-[10px] font-bold disabled:opacity-40"
          >
            SPEND 1 JUNK & STORE ITEM
          </button>
        </div>
      )}

      {mode === "uncommon" && (
        <div className="space-y-2">
          <p className="font-fell text-[10px] leading-snug text-[var(--ink-soft)]">
            Plan an uncommon mundane project. Make the required Skill Check at the table; use COMPLETE only after the GM confirms success.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label>
              <span className="field-label text-[8px]">Project</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ink-box mt-0.5 h-9 w-full px-2 text-[12px]"
                placeholder="What are you making?"
              />
            </label>
            <label>
              <span className="field-label text-[8px]">Size</span>
              <select
                value={sizeRank}
                onChange={(e) => setSizeRank(Number(e.target.value))}
                className="ink-box mt-0.5 h-9 w-full px-2 text-[11px]"
              >
                {SIZE_OPTIONS.map((s) => (
                  <option key={s.rank} value={s.rank}>{s.label} — {s.junk} Junk</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 font-fell text-[10px]">
            <input type="checkbox" checked={movingParts} onChange={(e) => setMovingParts(e.target.checked)} />
            Project has moving parts
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="ink-box px-1 py-1.5">
              <div className="field-label text-[7px]">Check</div>
              <div className="font-garamond text-[11px] font-bold">{craftSkill}</div>
            </div>
            <div className="ink-box px-1 py-1.5">
              <div className="field-label text-[7px]">Time</div>
              <div className="font-garamond text-[11px] font-bold">{craftHours}h</div>
            </div>
            <div className="ink-box px-1 py-1.5">
              <div className="field-label text-[7px]">Junk</div>
              <div className="font-garamond text-[11px] font-bold">{size.junk}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={completeUncommon}
            disabled={!name.trim() || junk.qty < size.junk}
            className="ink-box h-9 w-full text-[10px] font-bold disabled:opacity-40"
          >
            COMPLETE AFTER SUCCESSFUL CHECK
          </button>
          {junk.qty < size.junk && (
            <p className="font-fell italic text-[9px] text-[#9a3d35]">Not enough Misc. Junk in storage.</p>
          )}
        </div>
      )}

      {mode === "magic" && (
        <div className="space-y-2">
          {Number(floor) < 4 ? (
            <div className="rounded-sm border border-[var(--rule)] bg-[rgba(255,248,220,0.12)] p-2 text-center">
              <div className="field-label text-[8px]">Magic Crafting</div>
              <div className="font-garamond text-[13px] font-bold">UNLOCKS ON FLOOR 4+</div>
            </div>
          ) : (
            <p className="font-fell text-[10px] leading-snug text-[var(--ink-soft)]">
              Magic crafting needs the appropriate crafting skill, a suitable crafting table, and the materials or blueprint your GM requires.
            </p>
          )}
          <div className="space-y-1">
            {TABLES.map(([table, output]) => (
              <div key={table} className="grid grid-cols-[6.5rem_1fr] gap-2 border-b border-[var(--rule)]/50 py-1 last:border-b-0">
                <span className="font-fell-sc text-[9px] font-bold">{table}</span>
                <span className="font-fell text-[9px] text-[var(--ink-soft)]">{output}</span>
              </div>
            ))}
          </div>
          <p className="font-fell italic text-[9px] leading-snug text-[var(--ink-faint)]">
            Recipe and blueprint requirements stay GM/ruleset-driven; the companion will not invent missing ingredients or enchantment effects.
          </p>
        </div>
      )}
    </SheetPanel>
  );
}
