import React, { useState } from "react";
import { X } from "lucide-react";
import { GD_HEALING_POTION, GD_MANA_POTION, GD_MAGIC_ATTACK, GD_SKILLS } from "@/components/ui/GingerDragonIcons";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import { knownSpells } from "@/components/character/spellData";
import { parseQty, parseConsumableEffect } from "@/components/character/consumableEffect";

const TAB_BTN = "ink-box px-2 h-7 text-[9px] font-fell-sc tracking-[0.06em]";
const ROW =
  "w-full flex items-center gap-2 border border-[#4a3727] bg-[rgba(255,248,220,0.25)] hover:bg-[rgba(255,248,220,0.45)] px-2 min-h-9 py-1.5 text-left transition-colors cursor-pointer";

/* Hotbar Picker — assigns a canonical REFERENCE to the tapped Hotbar
   slot. Shows only the ACTIVE character's own eligible entries in three
   categories: INVENTORY consumables whose stored data defines an
   executable effect, known SPELLS, and manually-activated ABILITIES
   (ranked skills — passives with no manual activation are never offered,
   and no runtime behavior is invented for them). Selecting an entry
   replaces the slot's reference; REMOVE empties the slot without touching
   the underlying spell, item, or ability. The slot text written here is
   resolved back to the SAME canonical record at play time — no data copy,
   no second quantity. */
export default function HotbarPicker({
  filledLabel = "",
  inventory,
  spells,
  rulesetData,
  profile,
  onAssign,
  onRemove,
  onClose,
}) {
  const [tab, setTab] = useState("INVENTORY");

  /* INVENTORY eligibility — only items whose canonical stored definition
     parses to an executable effect. Ordinary gear, keys, quest objects,
     and junk never appear here. */
  const consumables = (Array.isArray(inventory) ? inventory : []).filter(
    (it) =>
      (it?.item ?? "").toString().trim() !== "" &&
      !!parseConsumableEffect(it.item, it.notes)
  );
  /* SPELLS — this character's own known spells. */
  const spellNames = knownSpells(rulesetData, spells, profile)
    .map((s) => s?.name)
    .filter(Boolean);
  /* ABILITIES — ranked skills, which have manual activation (ROLL SKILL
     CHECK / MARK USE). Passive effects have no manual activation and are
     excluded by design. */
  const abilityNames = (Array.isArray(rulesetData?.skills) ? rulesetData.skills : [])
    .map((s) => s?.name)
    .filter(Boolean);

  /* Canonical slot reference: the item's own name plus its stored effect
     text. The resolver matches this back to the SAME inventory row by
     name, so the slot is a reference — never a duplicate record. */
  const itemRef = (it) =>
    `${it.item}${(it.notes ?? "").trim() ? ` — ${String(it.notes).trim()}` : ""}`;

  const EmptyNote = ({ children }) => (
    <p className="font-fell italic text-[12px] text-[var(--ink-faint)]">{children}</p>
  );

  return (
    <ParchmentDialog
      title={filledLabel ? `Slot — ${filledLabel}` : "Hotbar Slot"}
      onClose={onClose}
    >
      <div className="space-y-3">
        {filledLabel && (
          <button type="button" className={ROW} onClick={onRemove}>
            <X size={13} className="shrink-0 text-[#8b0000]" />
            <span className="font-fell-sc text-[12px] font-bold text-[#24180f]">
              REMOVE {filledLabel}
            </span>
          </button>
        )}
        <div className="flex gap-1">
          {["INVENTORY", "SPELLS", "ABILITIES"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`${TAB_BTN} ${tab === t ? "bg-[rgba(255,248,220,0.6)]" : "opacity-70"}`}
              aria-pressed={tab === t}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          {tab === "INVENTORY" &&
            (consumables.length > 0 ? (
              consumables.map((it, i) => (
                <button key={i} type="button" className={ROW} onClick={() => onAssign(itemRef(it))}>
                  {/mana/i.test(itemRef(it)) ? (
                    <GD_MANA_POTION size={28} className="shrink-0" />
                  ) : (
                    <GD_HEALING_POTION size={28} className="shrink-0" />
                  )}
                  <span className="font-garamond text-[13px] font-semibold text-[#24180f] flex-1 break-words">
                    {it.item}
                  </span>
                  <span className="font-fell text-[11px] text-[#5c4d3d] tabular-nums shrink-0">
                    ×{parseQty(it.qty)}
                  </span>
                </button>
              ))
            ) : (
              <EmptyNote>No usable consumables.</EmptyNote>
            ))}
          {tab === "SPELLS" &&
            (spellNames.length > 0 ? (
              spellNames.map((n) => (
                <button key={n} type="button" className={ROW} onClick={() => onAssign(n)}>
                  <GD_MAGIC_ATTACK size={28} className="shrink-0" />
                  <span className="font-garamond text-[13px] font-semibold text-[#24180f] flex-1 break-words">
                    {n}
                  </span>
                </button>
              ))
            ) : (
              <EmptyNote>No known spells.</EmptyNote>
            ))}
          {tab === "ABILITIES" &&
            (abilityNames.length > 0 ? (
              abilityNames.map((n) => (
                <button key={n} type="button" className={ROW} onClick={() => onAssign(n)}>
                  <GD_SKILLS size={28} className="shrink-0" />
                  <span className="font-garamond text-[13px] font-semibold text-[#24180f] flex-1 break-words">
                    {n}
                  </span>
                </button>
              ))
            ) : (
              <EmptyNote>No usable abilities.</EmptyNote>
            ))}
        </div>
      </div>
    </ParchmentDialog>
  );
}