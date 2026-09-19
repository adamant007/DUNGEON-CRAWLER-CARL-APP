import React from "react";
import { makeThresholdLookup } from "@/rules-profile";
import { weaponPolicyForType } from "./wizardSteps";

/* Step 6 — STARTING COMBAT & SPELLS (Step 3B.7). The Step 2 baseline attack
   (Human: Unarmed Combat — Rank 3; Animal: Slice Attack — Rank 3) is shown
   read-only, and every crawler AUTOMATICALLY knows Heal (Rank 1 MAX, Mana 2,
   heals 2 Health Bar slots, Self Only, Interrupt) — Heal never consumes the
   second combat option. The player then picks exactly ONE second combat
   option from the ACTIVE PROFILE's combat_approach step: a WEAPON (approved
   category list; a custom display name may ride on an approved weapon Skill,
   never invented mechanics) OR an ATTACK SPELL (the profile's approved
   starting spells; requires the profile's minimum Enhanced Intelligence).
   Spell stat blocks, Heal details, weapon categories, and the Hotlist size
   all come from the profile — nothing is hardcoded here. Damage formulas are
   stored structurally and rendered with the CURRENT Step 3 INT modifier, so
   future stat changes recalculate. The chosen weapon is only the starting
   weapon CANDIDATE — its physical gear belongs to Step 7. No Character
   record is created. */

const Message = ({ children }) => (
  <span className="min-h-[1.25em] font-fell text-[13px] italic leading-snug text-[var(--hp)]">
    {children ?? ""}
  </span>
);

const Box = ({ title, children }) => (
  <div className="flex flex-col gap-1.5 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3">
    <p className="section-title text-[12px]">{title}</p>
    {children}
  </div>
);

const CHOICE_BASE =
  "border border-[var(--ink-soft)] px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";
const CHOICE_OFF = "bg-[rgba(255,248,220,0.25)] hover:bg-[rgba(74,55,39,0.18)]";
const CHOICE_ON = "bg-[rgba(74,55,39,0.28)]";

/* Starting spells / Hotlist snapshots for later steps — computed from the
   CURRENT draft at NEXT time, so they can never hold a stale selection. */
export const startingCombatSnapshot = (profile, draft) => {
  const healId = profile?.spells?.starting_spell?.id;
  const sc = draft?.startingCombat ?? {};
  const spellId = sc.secondOptionType === "attack_spell" ? sc.attackSpellId : "";
  const startingSpells = [];
  if (healId) startingSpells.push(healId);
  if (spellId) startingSpells.push(spellId);
  const startingHotlist = [];
  if (healId && draft?.healToHotlist !== false) startingHotlist.push(healId);
  if (spellId) startingHotlist.push(spellId);
  return { startingSpells, startingHotlist };
};

export default function StepAbilities({ draft, updateDraft, profile, errors = {} }) {
  const stepDef = profile?.creation_flow?.steps?.find((s) => s.id === "combat_approach") ?? null;
  const options = stepDef?.options ?? [];
  const weaponOption = options.find((o) => o.id === "weapon") ?? null;
  const spellOption = options.find((o) => o.id === "attack_spell") ?? null;
  const catalog = profile?.skills?.catalog ?? {};
  const heal = profile?.spells?.starting_spell ?? null;
  const hotbarSlots = profile?.spells?.hotbar?.slots ?? 10;
  const sc = draft.startingCombat ?? { secondOptionType: "", weapon: null, attackSpellId: "", animalWeaponOverride: false };

  /* Profile-driven weapon policy for this crawler type (Animal / Non-Human
     restriction + GM override). No policy / type not listed = fully normal
     Weapon path — DCCarl Humans are completely unaffected. */
  const weaponPolicy = weaponPolicyForType(profile, draft.startingSpecies?.type);
  const weaponRestricted = weaponPolicy.mode !== "allowed";
  const weaponAllowed =
    weaponPolicy.mode === "allowed" ||
    (weaponPolicy.mode === "restricted" && sc.animalWeaponOverride === true);

  /* Attack Spell gate — the profile's minimum Enhanced Intelligence, checked
     against the CURRENT Step 3 stats (never alters INT). */
  const intEnh = draft.coreStats?.int?.enhanced;
  const minInt = spellOption?.requirement?.min_enhanced_int ?? 4;
  const spellAllowed = typeof intEnh === "number" && intEnh >= minInt;
  const intModLookup = React.useMemo(
    () => makeThresholdLookup(profile?.stats?.mod_rule?.table ?? []),
    [profile]
  );
  const intMod = typeof intEnh === "number" ? intModLookup(intEnh) : null;
  const modOf = (key) => {
    const v = draft.coreStats?.[key]?.enhanced;
    return typeof v === "number" ? intModLookup(v) : null;
  };

  const weapon = sc.weapon ?? null;
  const weaponRank = weaponOption?.rank ?? 3;
  const weaponDetails = weaponOption?.details ?? {};
  const weaponDetail = weapon?.rulesSkillId ? weaponDetails[weapon.rulesSkillId] ?? null : null;
  /* Compact dropdown label — DISPLAY ONLY, built from the profile's
     structural data: "Longsword — 1d8+STR · S". Never written back into the
     draft or the profile; the detail card keeps full mechanics. */
  const DAMAGE_TYPE_ABBR = { Bludgeoning: "B", Piercing: "P", Slashing: "S" };
  const weaponOptionLabel = (id) => {
    const det = weaponDetails[id];
    const base = catalog[id]?.display_name ?? catalog[id]?.name ?? id;
    if (!det?.damage?.dice) return base;
    const dmg =
      det.damage.dice +
      (det.damage.plus_mod_stat ? `+${det.damage.plus_mod_stat.toUpperCase()}` : "");
    const abbr = DAMAGE_TYPE_ABBR[det.damage_type] ?? det.damage_type ?? "";
    return `${base} — ${dmg} · ${abbr}`;
  };
  const spellIds = spellOption?.starting_options ?? [];
  const spellDetails = spellOption?.spell_details ?? {};
  const healOnHotlist = draft.healToHotlist !== false;

  const setType = (type) => {
    if (type === sc.secondOptionType) return;
    if (type === "attack_spell" && !spellAllowed) return;
    if (type === "weapon" && !weaponAllowed) return;
    updateDraft({
      startingCombat: { secondOptionType: type, weapon: null, attackSpellId: "" },
    });
  };
  const chooseWeapon = (rulesSkillId) =>
    updateDraft({
      startingCombat: {
        secondOptionType: "weapon",
        attackSpellId: "",
        weapon: { displayName: weapon?.displayName ?? "", rulesSkillId, rank: weaponRank },
      },
    });
  const setCustomName = (name) =>
    updateDraft({
      startingCombat: {
        ...sc,
        weapon: { displayName: name, rulesSkillId: weapon?.rulesSkillId ?? "", rank: weaponRank },
      },
    });
  const chooseSpell = (id) =>
    updateDraft({
      startingCombat: { secondOptionType: "attack_spell", weapon: null, attackSpellId: id },
    });
  /* GM override — OFF clears a previously selected physical weapon (now
     invalid under the restriction) without touching stats, the Slice
     Attack baseline, or spells; ON restores the exact Human weapon path. */
  const setWeaponOverride = (on) => {
    if (on === (sc.animalWeaponOverride === true)) return;
    const cleared = !on && sc.secondOptionType === "weapon";
    updateDraft({
      startingCombat: {
        ...sc,
        animalWeaponOverride: on,
        ...(cleared ? { secondOptionType: "", weapon: null } : {}),
      },
    });
  };

  const hotlistIds = [];
  if (heal?.id && healOnHotlist) hotlistIds.push(heal.id);
  if (sc.secondOptionType === "attack_spell" && sc.attackSpellId) hotlistIds.push(sc.attackSpellId);
  const hotlistNames = hotlistIds.map((id) => catalog[id]?.name ?? id).join(", ");

  return (
    <div className="flex flex-col gap-2.5">
      <Box title="Baseline Combat">
        <p className="font-fell text-[15px] font-bold text-[#24180f]">
          {draft.baselineAttack
            ? `${draft.baselineAttack.name} — Rank ${draft.baselineAttack.rank}`
            : "Determined by Rules Profile"}
        </p>
      </Box>

      {heal && (
        <Box title="Automatic Starting Spell">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-fell text-[15px] font-bold text-[#24180f]">
              {catalog[heal.id]?.name ?? heal.id} — Rank {heal.rank}
              {heal.rank_is_max ? " (MAX)" : ""}
            </span>
            <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
              Known automatically — not your second combat option
            </span>
          </div>
          {heal.desc && (
            <p className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
              {heal.desc}
            </p>
          )}
          <p className="font-fell text-[13px] text-[#24180f]">
            Mana Cost {heal.mana_cost} · Heals {heal.heals_slots} Health Bar slots · {heal.range}
            {heal.interrupt ? " · Interrupt" : ""}
          </p>
          {heal.optional_hotbar && (
            <label className="flex items-center gap-2 px-1 py-0.5">
              <input
                type="checkbox"
                checked={healOnHotlist}
                onChange={() => updateDraft({ healToHotlist: !healOnHotlist })}
                className="h-3.5 w-3.5 accent-[#24180f]"
              />
              <span className="field-label text-[11px]">ADD HEAL TO HOTLIST</span>
            </label>
          )}
        </Box>
      )}

      <Box title="Second Combat Option">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setType("weapon")}
            aria-pressed={sc.secondOptionType === "weapon"}
            disabled={!weaponAllowed}
            aria-describedby={weaponRestricted ? "animal-weapon-policy" : undefined}
            className={`${CHOICE_BASE} ${sc.secondOptionType === "weapon" ? CHOICE_ON : CHOICE_OFF} ${
              !weaponAllowed ? "opacity-50" : ""
            }`}
          >
            <span className="block font-fell-sc text-[15px] font-bold tracking-[0.04em] text-[#24180f]">
              WEAPON
            </span>
            <span className="block font-fell italic text-[11px] text-[var(--ink-soft)]">
              Approved weapon Skill — Rank {weaponRank}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setType("attack_spell")}
            aria-pressed={sc.secondOptionType === "attack_spell"}
            disabled={!spellAllowed}
            className={`${CHOICE_BASE} ${
              sc.secondOptionType === "attack_spell" ? CHOICE_ON : CHOICE_OFF
            } ${!spellAllowed ? "opacity-50" : ""}`}
          >
            <span className="block font-fell-sc text-[15px] font-bold tracking-[0.04em] text-[#24180f]">
              ATTACK SPELL
            </span>
            <span className="block font-fell italic text-[11px] text-[var(--ink-soft)]">
              Requires Enhanced INT {minInt}+
            </span>
          </button>
        </div>
        {weaponRestricted && (
          <div
            id="animal-weapon-policy"
            className="flex flex-col gap-1 border-[1.5px] border-dashed border-[var(--rule)] px-2.5 py-1.5"
          >
            <p className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
              {weaponAllowed
                ? "Your GM approved weapon use — the Weapon path now behaves exactly as it does for Humans."
                : "Standard weapons may not be practical for your animal form without a special ability, suitable anatomy, transformation, or GM approval."}
            </p>
            {weaponPolicy.mode === "restricted" && weaponPolicy.overrideAllowed && (
              <>
                <label className="flex items-center gap-2 px-0.5 py-0.5">
                  <input
                    type="checkbox"
                    checked={sc.animalWeaponOverride === true}
                    onChange={() => setWeaponOverride(sc.animalWeaponOverride !== true)}
                    className="h-3.5 w-3.5 accent-[#24180f]"
                  />
                  <span className="field-label text-[10px]">GM ALLOWS WEAPON USE</span>
                </label>
                <p className="font-fell text-[10px] italic leading-snug text-[var(--ink-soft)]">
                  Use this if your crawler's anatomy, abilities, transformation, or GM ruling
                  allows effective weapon use.
                </p>
              </>
            )}
          </div>
        )}
        {!spellAllowed && (
          <Message>
            Attack Spells require Enhanced Intelligence {minInt} or higher — choose a Weapon, or go BACK to Step 3 to revise your stats.
          </Message>
        )}

        {sc.secondOptionType === "weapon" && weaponOption && (
          <div className="mt-1 flex flex-col gap-1.5">
            <label className="flex flex-col gap-1">
              <span className="field-label text-[11px]">Choose a Weapon</span>
              <select
                value={weapon?.rulesSkillId ?? ""}
                onChange={(e) => chooseWeapon(e.target.value)}
                aria-label="Weapon"
                className="ink-box px-2 py-1.5 text-left text-[14px]"
              >
                <option value="">Select…</option>
                {(weaponOption.categories ?? []).map((cat) => (
                  <optgroup key={cat.id} label={cat.label}>
                    {(cat.weaponIds ?? []).map((id) => (
                      <option key={id} value={id}>
                        {weaponOptionLabel(id)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="font-fell text-[10px] italic text-[var(--ink-soft)]">
                B = Bludgeoning · P = Piercing · S = Slashing
              </span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="field-label text-[11px]">Custom / Unique Weapon (optional)</span>
              <input
                type="text"
                value={weapon?.displayName ?? ""}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your weapon's name"
                className="ink-box px-2 py-1.5 text-left text-[14px]"
              />
            </label>
            {!weapon?.rulesSkillId && (
              <p className="font-fell text-[12px] italic text-[var(--ink-soft)]">
                A custom weapon still uses one approved weapon Skill's mechanics — no invented mechanics.
              </p>
            )}
            {weapon?.rulesSkillId &&
              weaponDetail &&
              (() => {
                const mechLabel =
                  catalog[weapon.rulesSkillId]?.display_name ??
                  catalog[weapon.rulesSkillId]?.name ??
                  weapon.rulesSkillId;
                const customName = (weapon.displayName ?? "").trim();
                const stat = (weaponDetail.attack_stat ?? "").toUpperCase();
                const modStat = weaponDetail.damage?.plus_mod_stat;
                const modValue = modStat ? modOf(modStat) : null;
                const liveDamage = `${weaponDetail.damage?.dice ?? ""}${modValue !== null ? ` +${modValue}` : ""}`;
                const formulaText = `${weaponDetail.damage?.dice ?? ""}${modStat ? ` + ${modStat.toUpperCase()} Mod` : ""}`;
                return (
                  <div className="border-[1.5px] border-[var(--ink-soft)] bg-[rgba(74,55,39,0.12)] px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f]">
                        {(customName || mechLabel).toUpperCase()}
                      </span>
                      <span className="font-fell text-[12px] font-bold text-[#24180f]">
                        Rank {weapon.rank ?? weaponRank}
                      </span>
                    </div>
                    {customName && (
                      <p className="font-fell text-[12px] text-[var(--ink-soft)]">
                        Uses {mechLabel} rules
                      </p>
                    )}
                    {weaponDetail.desc && (
                      <p className="font-fell italic text-[12px] text-[#24180f]">{weaponDetail.desc}</p>
                    )}
                    <p className="font-fell text-[12px] text-[#24180f]">
                      Attack: {stat || "—"} · Damage: {liveDamage} {weaponDetail.damage_type ?? ""}
                      {modStat ? ` (${formulaText})` : ""} · Range: {weaponDetail.range ?? "—"}
                    </p>
                    {(weaponDetail.limitations ?? []).map((l) => (
                      <span
                        key={l}
                        className="block font-fell italic text-[11px] leading-snug text-[var(--hp)]"
                      >
                        {l}
                      </span>
                    ))}
                    {weaponDetail.ai_favor !== undefined &&
                      weaponDetail.ai_favor !== null && (
                        <span className="block font-fell text-[11px] text-[var(--ink-soft)]">
                          AI Favor rating: {weaponDetail.ai_favor}
                        </span>
                      )}
                    <span className="block font-fell text-[11px] italic text-[var(--ink-soft)]">
                      Carried forward to Starting Gear.
                    </span>
                  </div>
                );
              })()}
            {weapon?.rulesSkillId && !weaponDetail && (
              <p className="font-fell text-[12px] italic text-[var(--ink-soft)]">
                Uses rules for: {catalog[weapon.rulesSkillId]?.name ?? weapon.rulesSkillId} — carried forward to Starting Gear.
              </p>
            )}
          </div>
        )}

        {sc.secondOptionType === "attack_spell" && spellAllowed && (
          <div className="mt-1 flex flex-col gap-2">
            {spellIds.map((id) => {
              const det = spellDetails[id] ?? {};
              const selected = sc.attackSpellId === id;
              const damageText =
                det.damage?.dice + (det.damage?.plus_int_mod && intMod !== null ? ` +${intMod}` : "");
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseSpell(id)}
                  aria-pressed={selected}
                  className={`${CHOICE_BASE} ${selected ? CHOICE_ON : CHOICE_OFF}`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-fell-sc text-[14px] font-bold tracking-[0.04em] text-[#24180f]">
                      {(catalog[id]?.name ?? id).toUpperCase()}
                    </span>
                    <span className="font-fell text-[12px] font-bold text-[#24180f]">
                      Rank {det.rank ?? spellOption.rank}
                    </span>
                  </span>
                  {det.desc && (
                    <span className="block font-fell italic text-[12px] text-[#24180f]">
                      {det.desc}
                    </span>
                  )}
                  <span className="block font-fell text-[12px] text-[var(--ink-soft)]">
                    Mana {det.mana_cost} · Range {det.range} · Damage {damageText} · {det.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <Message>{errors.combatOption}</Message>
      </Box>

      <p className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
        Intended Hotlist: {hotlistNames || "empty"} — {hotlistIds.length} of {hotbarSlots} slots. Room
        remains for potions, gear, and later finds.
      </p>
    </div>
  );
}