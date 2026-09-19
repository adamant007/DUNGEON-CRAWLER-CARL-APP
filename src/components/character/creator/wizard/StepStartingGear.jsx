import React, { useState } from "react";
import { Plus, X } from "lucide-react";

/* Step 7 — STARTING GEAR (Step 3B.8). Physical possessions ONLY — Skill
   knowledge from Steps 2–6 is never changed here. The gear is entered into
   the crawler's ACTUAL EQUIPMENT SLOTS, rendered from the ACTIVE Rules
   Profile's gear.slots — each slot is its own field that can hold an item,
   be cleared, or stay blank. There is no combined clothing string. MAIN
   HAND is owned by the Step 6 weapon while the player brings it; it stays
   empty for Attack Spell crawlers, and the weapon is never duplicated
   into inventory. Below the slots, INVENTORY / CARRIED ITEMS holds one
   STRUCTURED entry per item — the useful item (kept for its Hotlist /
   secondary-weapon flags) and any number of added items; weird stuff is
   just an inventory entry tagged category "weird_stuff". The rules allow
   whatever reasonably makes sense (GM approval), so there is no fixed
   equipment catalog and no invented Damage Resistance or item bonuses.
   Every field is optional: NEXT is never gated on blank fields, only on
   an invalid relationship (secondary weapon without a known Skill). No
   Character record is created. */

const Message = ({ children }) => (
  <span className="min-h-[1.25em] font-fell text-[13px] italic leading-snug text-[var(--hp)]">
    {children ?? ""}
  </span>
);

const Box = ({ title, hint, children }) => (
  <div className="flex flex-col gap-1.5 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3">
    <p className="section-title text-[12px]">{title}</p>
    {hint && (
      <p className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">{hint}</p>
    )}
    {children}
  </div>
);

const EMPTY_ITEM = { name: "", hotlist: false, secondaryWeapon: false, rulesSkillKey: "" };

const CATEGORY_LABELS = { item: "ITEM", weird_stuff: "WEIRD" };

/* MAIN HAND is the Character Sheet's canonical weapon slot key — the Step 6
   weapon is serialized there at creation. Other future systems with
   different slot lists render whatever their profile defines; only this
   one canonical destination is weapon-aware. */
const WEAPON_SLOT_ID = "mainHand";

export default function StepStartingGear({ draft, updateDraft, profile, errors = {} }) {
  const stepDef = profile?.creation_flow?.steps?.find((s) => s.id === "starting_gear") ?? null;
  const catalog = profile?.skills?.catalog ?? {};
  const combatOptions =
    profile?.creation_flow?.steps?.find((s) => s.id === "combat_approach")?.options ?? [];
  const weaponDetails = combatOptions.find((o) => o.id === "weapon")?.details ?? {};
  const spellDetails = combatOptions.find((o) => o.id === "attack_spell")?.spell_details ?? {};
  const hotbarSlots = profile?.spells?.hotbar?.slots ?? 10;
  const maxWeird = stepDef?.weird_stuff?.max_entries_ui ?? 4;
  /* The equipment-slot list comes from the ACTIVE PROFILE — the wizard
     never assumes a fixed slot set for future games. */
  const slots = profile?.gear?.slots ?? [];

  const sc = draft.startingCombat ?? { secondOptionType: "", weapon: null, attackSpellId: "" };
  const g =
    draft.startingGear ?? { bringPrimaryWeapon: true, equipped: {}, usefulItem: EMPTY_ITEM, inventory: [] };
  const item = g.usefulItem ?? EMPTY_ITEM;
  const equipped = g.equipped ?? {};

  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("item");

  const setGear = (patch) => updateDraft({ startingGear: { ...g, ...patch } });
  const setItem = (patch) => setGear({ usefulItem: { ...item, ...patch } });
  const setSlot = (id, value) => setGear({ equipped: { ...equipped, [id]: value } });

  /* Qualifying combat Skills for a secondary weapon — WEAPON-category skills
     the crawler already knows from a Step 4 background (the profile's
     requires_known_skill_category). Never grants a new Skill; if none
     exist the option does not appear. */
  const knownWeaponSkills = React.useMemo(() => {
    const cat = stepDef?.secondary_weapon?.requires_known_skill_category ?? "weapon";
    const ids = new Set();
    for (const sel of Object.values(draft.backgrounds ?? {})) {
      for (const id of sel?.skills ?? []) ids.add(id);
    }
    return [...ids]
      .filter((id) => catalog[id]?.category === cat)
      .map((id) => catalog[id]);
  }, [draft.backgrounds, catalog, stepDef]);

  /* Step 6 weapon carry-forward — reference only, mechanics never
     duplicated here. */
  const weapon = sc.secondOptionType === "weapon" ? (sc.weapon ?? null) : null;
  const weaponDetail = weapon?.rulesSkillId ? weaponDetails[weapon.rulesSkillId] ?? null : null;
  const customName = (weapon?.displayName ?? "").trim();
  const mechLabel = weapon?.rulesSkillId
    ? catalog[weapon.rulesSkillId]?.display_name ?? catalog[weapon.rulesSkillId]?.name ?? weapon.rulesSkillId
    : "";
  const weaponLabel = weapon ? customName || mechLabel : "";
  const spellId = sc.secondOptionType === "attack_spell" ? sc.attackSpellId : "";
  const spellName = spellId ? catalog[spellId]?.name ?? spellId : "";
  const spellRank = spellId ? spellDetails[spellId]?.rank ?? 3 : 3;
  const bringWeapon = g.bringPrimaryWeapon !== false;

  const entries = g.inventory ?? [];
  const weirdCount = entries.filter((e) => e?.category === "weird_stuff").length;

  const addEntry = () => {
    const v = newItem.trim();
    if (!v) return;
    if (newCategory === "weird_stuff" && weirdCount >= maxWeird) return;
    const entry = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: v,
      category: newCategory,
      quantity: 1,
    };
    setGear({ inventory: [...entries, entry] });
    setNewItem("");
  };

  const removeEntry = (id) => setGear({ inventory: entries.filter((e) => e?.id !== id) });

  const examples = stepDef?.useful_item?.examples ?? [];

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
        What were you wearing when you entered? Put each item directly into its equipment slot —
        every slot may stay blank. Carried odds and ends go in Inventory below, one entry each.
        Your GM approves what reasonably makes sense; mundane items grant no Damage Resistance.
      </p>

      {/* ===== EQUIPMENT SLOTS ===== */}
      <Box
        title="Equipment Slots"
        hint="Separate destinations on your character sheet — enter an item, clear it, or leave it empty."
      >
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {slots.map((slot) => {
            if (slot.id === WEAPON_SLOT_ID) {
              /* MAIN HAND — auto-populated from the Step 6 weapon. */
              return (
                <div
                  key={slot.id}
                  className="flex flex-col gap-1 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.15)] px-2 py-1.5"
                >
                  <p className="field-label text-[11px]">{slot.label}</p>
                  {weapon ? (
                    <>
                      <p className="font-fell text-[13px] font-bold leading-snug text-[#24180f]">
                        {bringWeapon ? weaponLabel : "— (not carried)"}
                      </p>
                      {bringWeapon && (
                        <p className="font-fell text-[12px] leading-snug text-[#24180f]">
                          Uses {mechLabel} rules
                          {weaponDetail?.damage?.dice
                            ? ` · ${weaponDetail.damage.dice} ${weaponDetail.damage_type ?? ""}`
                            : ""}
                          {weaponDetail?.range ? ` · Range ${weaponDetail.range}` : ""}
                        </p>
                      )}
                      <label className="flex items-center gap-2 px-0.5 py-0.5">
                        <input
                          type="checkbox"
                          checked={bringWeapon}
                          onChange={() => setGear({ bringPrimaryWeapon: !bringWeapon })}
                          className="h-3.5 w-3.5 accent-[#24180f]"
                        />
                        <span className="field-label text-[10px]">BRING THIS WEAPON</span>
                      </label>
                      {!bringWeapon && (
                        <p className="font-fell text-[11px] italic leading-snug text-[var(--hp)]">
                          You keep the Skill — you just didn't enter carrying one.
                        </p>
                      )}
                    </>
                  ) : spellName ? (
                    <p className="font-fell text-[13px] italic leading-snug text-[var(--ink-faint)]">
                      — (Attack Spell caster)
                    </p>
                  ) : (
                    <p className="font-fell text-[13px] italic text-[var(--ink-faint)]">—</p>
                  )}
                </div>
              );
            }
            const value = equipped[slot.id] ?? "";
            return (
              <div
                key={slot.id}
                className="flex flex-col gap-1 border-[1.5px] border-[var(--rule)] bg-[rgba(255,248,220,0.15)] px-2 py-1.5"
              >
                <p className="field-label text-[11px]">{slot.label}</p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setSlot(slot.id, e.target.value)}
                    placeholder="— empty —"
                    aria-label={`${slot.label} equipment slot`}
                    className="ink-box min-w-0 flex-1 px-2 py-1 text-left text-[13px]"
                  />
                  {value.trim() && (
                    <button
                      type="button"
                      aria-label={`Clear ${slot.label}`}
                      onClick={() => setSlot(slot.id, "")}
                      className="ink-box flex h-5 w-5 shrink-0 items-center justify-center text-[#24180f]"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Box>

      {/* ===== INVENTORY / CARRIED ITEMS ===== */}
      <Box
        title="Inventory / Carried Items"
        hint="Each item is its own entry — remove any, or add more below. Weird stuff is just an odd kind of carried item."
      >
        {/* The one interesting/useful item — a structured entry kept for its
            Hotlist and secondary-weapon flags. */}
        <div className="flex flex-col gap-1 border-[1.5px] border-[var(--rule)] px-2 py-1.5">
          <p className="field-label text-[11px]">One Interesting / Useful Item</p>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={item.name ?? ""}
              onChange={(e) => setItem({ name: e.target.value })}
              placeholder="e.g. lighter, headphones, game book, phone"
              aria-label="Interesting or useful item"
              className="ink-box min-w-0 flex-1 px-2 py-1 text-left text-[13px]"
            />
            <span className="field-label shrink-0 px-1 text-[9px]">USEFUL</span>
          </div>
          {examples.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setItem({ name: ex })}
                  className="ink-box px-2 py-0.5 font-fell text-[12px] text-[#24180f]"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 px-0.5 py-0.5">
            <input
              type="checkbox"
              checked={item.hotlist === true}
              onChange={() => setItem({ hotlist: !(item.hotlist === true) })}
              className="h-3.5 w-3.5 accent-[#24180f]"
            />
            <span className="field-label text-[10px]">PUT USEFUL ITEM IN HOTLIST</span>
          </label>
          {item.hotlist && (
            <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
              Placement is applied at final creation — the Hotlist never exceeds {hotbarSlots} slots.
            </p>
          )}
          {knownWeaponSkills.length > 0 && (
            <>
              <label className="flex items-center gap-2 px-0.5 py-0.5">
                <input
                  type="checkbox"
                  checked={item.secondaryWeapon === true}
                  onChange={() => setItem({ secondaryWeapon: !(item.secondaryWeapon === true) })}
                  className="h-3.5 w-3.5 accent-[#24180f]"
                />
                <span className="field-label text-[10px]">MY USEFUL ITEM IS A SECONDARY WEAPON</span>
              </label>
              {item.secondaryWeapon && (
                <label className="flex flex-col gap-1">
                  <span className="field-label text-[10px]">Uses Known Weapon Skill</span>
                  <select
                    value={item.rulesSkillKey ?? ""}
                    onChange={(e) => setItem({ rulesSkillKey: e.target.value })}
                    aria-label="Known weapon Skill for the secondary weapon"
                    className="ink-box px-2 py-1 text-left text-[13px]"
                  >
                    <option value="">Select…</option>
                    {knownWeaponSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <span className="font-fell text-[11px] italic text-[var(--ink-soft)]">
                    Uses a weapon Skill you already know from your backgrounds — no new Skill or
                    mechanics are granted.
                  </span>
                </label>
              )}
            </>
          )}
          <Message>{errors.gearSecondarySkill}</Message>
        </div>

        {/* Added carried items — one structured row each. */}
        {entries.map((entry) => (
          <div
            key={entry?.id}
            className="flex items-center justify-between gap-2 border-[1.5px] border-[var(--rule)] px-2 py-1"
          >
            <span className="font-fell text-[13px] leading-snug text-[#24180f]">
              {entry?.name ?? ""}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="field-label text-[9px]">
                {CATEGORY_LABELS[entry?.category] ?? "ITEM"} × {entry?.quantity ?? 1}
              </span>
              <button
                type="button"
                aria-label={`Remove ${entry?.name ?? "item"}`}
                onClick={() => removeEntry(entry?.id)}
                className="ink-box flex h-5 w-5 items-center justify-center text-[#24180f]"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          </div>
        ))}

        {/* ADD ITEM */}
        <div className="flex flex-wrap gap-1.5">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addEntry();
              }
            }}
            placeholder="laptop, lighter, snack bar…"
            aria-label="New carried item"
            className="ink-box min-w-0 flex-1 px-2 py-1 text-left text-[13px]"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            aria-label="New item category"
            className="ink-box px-2 py-1 text-left text-[13px]"
          >
            <option value="item">Item</option>
            <option value="weird_stuff">Weird Stuff</option>
          </select>
          <button
            type="button"
            onClick={addEntry}
            disabled={!newItem.trim() || (newCategory === "weird_stuff" && weirdCount >= maxWeird)}
            aria-label="Add carried item"
            className="ink-box flex items-center gap-1 px-3 py-1 font-fell text-[13px] font-bold text-[#24180f] disabled:pointer-events-none disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            ADD
          </button>
        </div>
        <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
          Up to {maxWeird} weird-stuff entries — an app limit, not a game-rule claim.
        </p>
      </Box>
    </div>
  );
}