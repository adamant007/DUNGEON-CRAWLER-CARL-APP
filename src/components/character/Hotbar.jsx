import React, { useState } from "react";
import {
  GD_HOTBAR,
  GD_SKILLS,
  GD_HEAL,
  GD_MAGIC_ATTACK,
  GD_PHYSICAL_ATTACK,
  GD_HEALING_POTION,
  GD_MANA_POTION,
} from "@/components/ui/GingerDragonIcons";
import SpellActionCard from "@/components/character/SpellActionCard";
import SkillActionCard from "@/components/character/SkillActionCard";
import AttackActionCard from "@/components/character/AttackActionCard";
import ConsumableActionCard from "@/components/character/ConsumableActionCard";
import HotbarEditGrid from "@/components/character/HotbarEditGrid";
import HotbarPicker from "@/components/character/HotbarPicker";
import { resolveHotbarSlot, shortLabel, detailOf } from "@/components/character/hotbarActions";
import { parseQty } from "@/components/character/consumableEffect";

/* V3 Hotbar — exactly 10 numbered slots. A slot is a REFERENCE to a
   canonical action (spell, attack, skill, inventory consumable) — never
   an independent duplicate. In play mode (EDIT CHARACTER OFF), tapping a
   populated slot opens the SAME action component used from its normal
   sheet location, sharing one source of truth (Mana, HP, skill
   advancement, inventory quantity). The header EDIT control (never a
   slot) toggles Hotbar Edit Mode — its OWN concept, independent of the
   global EDIT CHARACTER toggle. In Hotbar Edit Mode, tapping a slot
   opens the Hotbar Picker (assign / replace / remove) and filled slots
   can be dragged to reorder; no gameplay action fires. */
export default function Hotbar({
  slots,
  setSlots,
  playMode = false,
  spells,
  rulesetData,
  profile,
  attacks,
  inventory,
  mana,
  maxMana,
  onCast,
  onRollSpell,
  onRollSkill,
  onToggleSkillAdv,
  onAttackRoll,
  onDamageRoll,
  onUseConsumable,
  onManageConsumable,
}) {
  const [barEdit, setBarEdit] = useState(false); // Hotbar Edit Mode — its own toggle, NOT tied to EDIT CHARACTER
  const [action, setAction] = useState(null);
  const [pickerSlot, setPickerSlot] = useState(null); // Hotbar Edit Mode: the slot being assigned / replaced / removed
  const update = (i, value) => {
    const next = [...slots];
    next[i] = value;
    setSlots(next);
  };

  const resolverData = { spells, rulesetData, attacks, inventory, profile };

  /* Consumable tiles display the LIVE canonical inventory quantity —
     Inventory is the single source of truth; there is never a second
     quantity on the Hotbar. */
  const tileLabel = (i) => {
    const slot = slots[i];
    if (!slot) return "";
    const r = resolveHotbarSlot(slot, resolverData);
    if (r?.kind === "consumable") {
      const item = inventory?.[r.itemIndex];
      return `${item?.item ?? shortLabel(slot)} ×${parseQty(item?.qty)}`;
    }
    return shortLabel(slot);
  };

  /* Canonical Ginger Dragon pictograms — presentation ONLY. Each action
     kind renders its exact canonical icon: heal-named spells read as
     GD_HEAL, other spells as GD_MAGIC_ATTACK; consumables resolve to
     GD_MANA_POTION vs GD_HEALING_POTION by their recorded reference text.
     The slot reference, label, quantity, and every behavior are
     unchanged. */
  const tileIcon = (i) => {
    const slot = slots[i];
    if (!slot) return null;
    switch (resolveHotbarSlot(slot, resolverData)?.kind) {
      case "spell":
        return /heal/i.test(slot) ? GD_HEAL : GD_MAGIC_ATTACK;
      case "skill":
        return GD_SKILLS;
      case "attack":
        return GD_PHYSICAL_ATTACK;
      case "consumable":
        return /mana/i.test(slot) ? GD_MANA_POTION : GD_HEALING_POTION;
      default:
        return null;
    }
  };

  const tapSlot = (i) => {
    if (!slots[i]) return;
    const r = resolveHotbarSlot(slots[i], resolverData);
    if (r) setAction({ ...r, slot: slots[i] });
  };

  return (
    <section className="hand-frame p-2">
      <header className="flex items-center gap-2 mb-2">
        <GD_HOTBAR size={40} className="shrink-0" />
        <h3 className="section-title text-[10px]">Hotbar (1-0)</h3>
        {/* Hotbar Edit Mode toggle — always available (independent of the
            global EDIT CHARACTER control). ON: tapping a slot opens the
            Hotbar Picker and slots can be dragged to reorder; no gameplay
            action fires. OFF: tapping a slot performs its normal action. */}
        <button
          type="button"
          onClick={() => setBarEdit((e) => !e)}
          aria-label={barEdit ? "Done editing hotbar" : "Edit hotbar"}
          className="ml-auto ink-box px-2 h-6 text-[9px] font-fell-sc tracking-[0.06em]"
        >
          {barEdit ? "Done" : "Edit"}
        </button>
      </header>

      {barEdit ? (
        <HotbarEditGrid
          slots={slots}
          labels={slots.map((_, i) => tileLabel(i))}
          onReorder={(next) => setSlots(next)}
          onTap={(i) => setPickerSlot(i)}
        />
      ) : (
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5">
          {slots.map((slot, i) => (
            <button
              key={i}
              type="button"
              onClick={() => tapSlot(i)}
              aria-label={`Hotbar slot ${i + 1}${slot ? `: ${slot}` : ""}`}
              className={`ink-box relative w-full h-16 overflow-hidden ${
                slot
                  ? "gd-slot-filled cursor-pointer hover:bg-[rgba(255,248,220,0.45)]"
                  : "gd-slot-empty cursor-default"
              }`}
            >
              <span className="absolute left-1 top-0.5 text-[7px] font-fell text-[var(--ink-faint)] select-none">
                {i + 1}
              </span>
              <span className="flex h-full flex-col items-center justify-center gap-0.5 pt-1 px-0.5">
                {(() => {
                  const TileIcon = tileIcon(i);
                  return TileIcon ? <TileIcon size={40} className="shrink-0" /> : null;
                })()}
                <span className="w-full text-center text-[8px] leading-[1.15] break-words line-clamp-2">
                  {tileLabel(i) || "—"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Mockup hint — Edit assigns slots, drag reorders them. */}
      <p className="gd-hint mt-1.5 text-center font-fell italic text-[8px] text-[var(--ink-faint)] select-none">
        EDIT TO ASSIGN · DRAG TO REORDER
      </p>

      {/* Hotbar Edit Mode picker — assign / replace / remove the tapped
          slot. Only the slot's REFERENCE changes; the underlying spell,
          item, or ability is never modified, and every change persists
          through the normal autosave. */}
      {pickerSlot !== null && (
        <HotbarPicker
          filledLabel={slots[pickerSlot] ? shortLabel(slots[pickerSlot]) : ""}
          inventory={inventory}
          spells={spells}
          rulesetData={rulesetData}
          profile={profile}
          onAssign={(value) => {
            update(pickerSlot, value);
            setPickerSlot(null);
          }}
          onRemove={() => {
            update(pickerSlot, "");
            setPickerSlot(null);
          }}
          onClose={() => setPickerSlot(null)}
        />
      )}

      {/* Shared canonical actions — the SAME components and handlers the
          sheet's own panels use. Nothing here writes a second data
          store. */}
      {action?.kind === "spell" && (
        <SpellActionCard
          spell={action.spell}
          mana={mana}
          maxMana={maxMana}
          onCast={onCast}
          onRoll={onRollSpell}
          onClose={() => setAction(null)}
        />
      )}
      {action?.kind === "skill" && (
        <SkillActionCard
          skill={rulesetData?.skills?.[action.skillIndex]}
          marked={!!rulesetData?.skills?.[action.skillIndex]?.advancement_mark}
          onRoll={() => onRollSkill?.(rulesetData?.skills?.[action.skillIndex], action.skillIndex)}
          onToggleAdv={() => onToggleSkillAdv?.(action.skillIndex)}
          onClose={() => setAction(null)}
        />
      )}
      {action?.kind === "attack" && (
        <AttackActionCard
          attack={action.attack}
          onAttackRoll={onAttackRoll}
          onDamageRoll={onDamageRoll}
          onClose={() => setAction(null)}
        />
      )}
      {action?.kind === "consumable" &&
        (() => {
          const item = inventory?.[action.itemIndex] ?? {};
          /* Canonical effect definition: the item's stored notes first, else
             the hotbar slot's preserved detail — one shared text, no second
             data copy. */
          const effectText = (item.notes || detailOf(action.slot) || "").trim();
          return (
            <ConsumableActionCard
              name={item.item || shortLabel(action.slot)}
              qty={parseQty(item.qty)}
              effect={effectText}
              onUse={() => onUseConsumable?.(action.itemIndex, effectText)}
              onManage={() => onManageConsumable?.(action.itemIndex)}
              onClose={() => setAction(null)}
            />
          );
        })()}
    </section>
  );
}