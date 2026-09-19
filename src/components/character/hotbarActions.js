import { knownSpells } from "@/components/character/spellData";

/* Hotbar slot resolver — a Hotbar slot is a REFERENCE to a canonical
   action, never an independent duplicate. Given the slot text and the
   character's canonical data, this resolves which existing action the
   slot points to. Resolution order: known spell → attack → ranked skill
   → inventory consumable. Returns a { kind, … } descriptor or null. */

const shortLabel = (slot) => {
  const s = slot ?? "";
  return s.includes("—") ? s.split("—")[0].trim() : s;
};

/* The slot's preserved detail text (after the "—") — the only place a
   consumable's mechanical effect (e.g. "heal 5 Health Bar slots") is
   stored. Displayed and parsed; never invented. */
const detailOf = (slot) => {
  const s = slot ?? "";
  return s.includes("—") ? s.split("—").slice(1).join("—").trim() : "";
};

/* Loose consumable-name matching: strips a leading quantity ("2 ", "x3",
   "×3") and a trailing plural "s", so the pregen slot "2 Healing Potions"
   references the canonical inventory item "Healing Potion". */
const normalize = (name) =>
  String(name ?? "")
    .toLowerCase()
    .replace(/^\s*\d+\s*/, "")
    .replace(/^\s*[x×]\s*\d+\s*/, "")
    .replace(/s$/, "")
    .trim();

export function resolveHotbarSlot(slot, { spells, rulesetData, attacks, inventory }) {
  const label = shortLabel(slot);
  if (!label) return null;
  const lower = label.toLowerCase();

  // 1 — known spell: opens the SAME spell action (CAST/ROLL, Mana rules).
  const spell = knownSpells(rulesetData, spells).find(
    (s) => (s.name ?? "").toLowerCase() === lower
  );
  if (spell) return { kind: "spell", spell };

  // 2 — attack (canonical row, else the preserved ruleset attack): the
  //     same attack-check / damage rolls the Attacks panel performs.
  const rows = Array.isArray(attacks) ? attacks : [];
  const canon = rows.find((a) => (a?.name ?? "").toLowerCase() === lower);
  if (canon) return { kind: "attack", attack: canon };
  const preserved = (Array.isArray(rulesetData?.attacks) ? rulesetData.attacks : []).find(
    (a) => (a?.name ?? "").toLowerCase() === lower
  );
  if (preserved) {
    return {
      kind: "attack",
      attack: {
        name: preserved.name,
        bonus: preserved.toHit ?? "",
        damage: preserved.damage ?? "",
        type: preserved.damageType ?? "",
        notes: preserved.notes ?? "",
      },
    };
  }

  // 3 — ranked skill: opens the SAME skill action (ROLL SKILL CHECK /
  //     MARK USE) that shares the canonical use_count.
  const skills = Array.isArray(rulesetData?.skills) ? rulesetData.skills : [];
  const sIdx = skills.findIndex((s) => (s?.name ?? "").toLowerCase() === lower);
  if (sIdx !== -1) return { kind: "skill", skillIndex: sIdx };

  // 4 — inventory consumable: the SAME canonical Inventory item and its
  //     single shared quantity.
  const items = Array.isArray(inventory) ? inventory : [];
  const iIdx = items.findIndex(
    (it) => (it?.item ?? "") && normalize(it.item) === normalize(label)
  );
  if (iIdx !== -1) return { kind: "consumable", itemIndex: iIdx };

  return null;
}

export { shortLabel, detailOf };