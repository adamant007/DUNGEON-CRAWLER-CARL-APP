/* Shared consumable-item helpers — a Hotbar consumable is a REFERENCE to
   the SAME canonical Inventory item and its ONE shared quantity. Quantity
   parsing tolerates legacy stored formats ("x1", "×2"); effect definitions
   parse ONLY from the item's stored canonical data (inventory notes or the
   hotbar slot's preserved detail) — no effect is ever invented for an item
   whose mechanics do not define one. */

/* "x1", "×2", "3", 5 -> 1, 2, 3, 5; "" / null / junk -> 0. */
export const parseQty = (qty) => {
  const n = parseInt(String(qty ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/* "2 Healing Potions" / "x3 Mana Potions" -> "Healing Potion" / "Mana Potion"
   (leading count stripped, trailing plural stripped — case preserved). */
export const singularLabel = (name) =>
  String(name ?? "")
    .replace(/^\s*(?:\d+|[x×]\s*\d+)\s*/i, "")
    .replace(/s$/i, "")
    .trim();

const HEAL_SLOTS_RE = /heals?\s+(\d+)\s+Health Bar slots?/i;

/* Executable effect definition — resolved ONLY from stored data.
   Returns { type: "heal_slots", slots }, { type: "mana_full" }, or null
   when the item defines no executable effect (it is then never consumed). */
export const parseConsumableEffect = (itemName, effectText) => {
  const text = String(effectText ?? "");
  const heal = text.match(HEAL_SLOTS_RE);
  if (heal) return { type: "heal_slots", slots: parseInt(heal[1], 10) };

  const label = singularLabel(itemName);
  /* Core Rulebook: a Standard Mana Potion / Mana Potion fully restores
     Mana when consumed. Recognize the canonical item name even on older
     wizard-created characters whose Inventory row was saved without the
     effect text. Do NOT apply this to differently named mana items such as
     Good Mana Refill Potions, which have different mechanics. */
  if (/^(?:standard\s+)?mana\s+potion$/i.test(label)) {
    return { type: "mana_full" };
  }
  if (/full restore/i.test(text) && /mana/i.test(String(itemName ?? ""))) {
    return { type: "mana_full" };
  }
  return null;
};

/* A preserved hotlist entry -> a canonical Inventory row: the entry's
   leading count becomes the item's starting quantity, its effect text
   becomes the item's canonical notes (the effect definition used at play
   time). Spells never reach this path. */
export const consumableRow = (name, effectText) => ({
  item: singularLabel(name),
  qty: parseQty(String(name ?? "").match(/^\s*(?:\d+|[x×]\s*\d+)/i)?.[0]) || 1,
  notes: String(effectText ?? "").trim(),
});