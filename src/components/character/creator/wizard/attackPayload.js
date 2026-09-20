/* Canonical attack serialization for wizard-created crawlers.

   ONE canonical Character record — the wizard never keeps its own attack
   store. When Review & Create builds the record, the rows here serialize
   into the Character's canonical `attacks` (the characterStorage ATTACK row
   shape: { name, bonus, damage, type, notes }) — the SAME data the Character
   Sheet Attacks panel already reads.

   Weapon path -> baseline attack (Unarmed Combat / Slice Attack, Rank 3)
   PLUS the selected starting weapon at Rank 3. Hand-to-Hand path ->
   baseline attack PLUS the selected unarmed Attack Skill, preserving its
   linked Damage Effect without inventing missing damage mechanics. Attack
   Spell path -> the baseline attack only; a chosen Attack Spell becomes a
   known spell (spellPayload.js), never a physical weapon attack.

   Damage formulas stay STRUCTURAL ("1d8 + STR Mod") — the current Stat Mod
   is rendered live by consumers and never frozen into the stored entry, so
   the attack recalculates if the Stat changes later.

   HIT bonus is the canonical Rank + attack-stat Mod (e.g. Handgun Rank 3
   + DEX Mod 3 = +6), stored once at creation — the sheet's existing HIT
   roller consumes it as-is and never re-adds anything. */

import { makeThresholdLookup } from "@/rules-profile";

const weaponDetailFor = (profile, skillId) =>
  profile?.creation_flow?.steps
    ?.find((s) => s.id === "combat_approach")
    ?.options?.find((o) => o.id === "weapon")?.details?.[skillId] ?? null;

export const canonicalAttacksFromDraft = (profile, draft) => {
  const catalog = profile?.skills?.catalog ?? {};
  const rows = [];
  const modLookup = makeThresholdLookup(profile?.stats?.mod_rule?.table ?? []);

  /* Rank + attack-stat Mod -> canonical final HIT bonus, stored once at
     creation. Blank only when the linked stat or its modifier is genuinely
     unavailable — never invented. */
  const hitBonus = (skillId, statKey, rank) => {
    const def = catalog[skillId] ?? {};
    const atkStat = (statKey ?? def.attack_stat ?? def.stat ?? "").toLowerCase();
    const statVal = draft?.coreStats?.[atkStat]?.enhanced;
    const mod = typeof statVal === "number" ? modLookup(statVal) : null;
    const r = Number(rank ?? 3);
    return typeof mod === "number" && Number.isFinite(mod) && Number.isFinite(r)
      ? `+${r + mod}`
      : "";
  };

  /* Structural damage formula — "1d4 + STR Mod". The LIVE Stat Mod is
     rendered and rolled by consumers against the current stats; the
     stored entry never freezes a summed number. */
  const damageFormula = (dmg) =>
    dmg ? dmg.dice + (dmg.plus_mod_stat ? ` + ${dmg.plus_mod_stat.toUpperCase()} Mod` : "") : "";

  /* 1 — baseline combat Skill. HIT bonus = Rank + the attack skill's
     source-verified attack_stat Mod; damage and type are likewise
     source-verified by the First Floor pregen tables (Unarmed Combat:
     1d4 + STR Mod, Bludgeoning; Slice Attack: 1d4 + STR Mod, Slashing). */
  const baseline = draft?.baselineAttack;
  if (baseline?.name) {
    const bDef = catalog[baseline.id] ?? {};
    rows.push({
      name: baseline.name,
      bonus: hitBonus(baseline.id, null, baseline.rank),
      damage: damageFormula(bDef.damage),
      type: bDef.damage_type ?? "",
      notes: `Rank ${baseline.rank ?? ""} · Baseline combat Skill`,
    });
  }

  /* 2 — selected starting weapon (weapon path only). */
  const sc = draft?.startingCombat ?? {};
  const w = sc.secondOptionType === "weapon" ? sc.weapon : null;
  if (w?.rulesSkillId) {
    const det = weaponDetailFor(profile, w.rulesSkillId);
    const mechName = catalog[w.rulesSkillId]?.name ?? w.rulesSkillId;
    const customName = (w.displayName ?? "").trim();
    const formula = damageFormula(det?.damage);
    const bits = [`Rules Skill: ${mechName}`, `Rank ${w.rank ?? 3}`];
    if (det) {
      bits.push(`Attack: ${(det.attack_stat ?? "").toUpperCase()}`);
      if (det.range) bits.push(`Range: ${det.range}`);
      (det.limitations ?? []).forEach((l) => bits.push(l));
      if (det.ai_favor !== undefined && det.ai_favor !== null) {
        bits.push(`AI Favor rating: ${det.ai_favor}`);
      }
    }
    if (customName) bits.push(`Custom name for ${mechName}`);
    /* Canonical HIT bonus — Rank + attack-stat Mod, computed once from
       the draft's live core stats (same mod table the sheet uses). If
       either piece is missing the bonus stays blank rather than being
       invented. */
    const toHitBonus = hitBonus(null, det?.attack_stat, w.rank);
    rows.push({
      name: customName || catalog[w.rulesSkillId]?.display_name || mechName,
      bonus: toHitBonus,
      damage: formula,
      type: det?.damage_type ?? "",
      notes: bits.join(" · "),
    });
  }

  /* 3 — selected Hand-to-Hand / Unarmed combat Skill. */
  if (sc.secondOptionType === "hand_to_hand" && sc.handToHand?.attackSkillId) {
    const h = sc.handToHand;
    const handOption = profile?.creation_flow?.steps
      ?.find((s) => s.id === "combat_approach")
      ?.options?.find((o) => o.id === "hand_to_hand");
    const pair = (handOption?.pairs ?? []).find((p) => p.attackSkillId === h.attackSkillId);
    const def = catalog[h.attackSkillId] ?? {};
    const effectId = pair?.damageEffectId ?? h.damageEffectId;
    const effect = catalog[effectId] ?? {};
    const rank = h.rank ?? handOption?.rank ?? 3;
    rows.push({
      name: def.display_name ?? def.name ?? h.attackSkillId,
      bonus: hitBonus(h.attackSkillId, null, rank),
      damage: "",
      type: "",
      notes: [
        `Rank ${rank}`,
        "Hand-to-Hand",
        effectId ? `Linked Damage Effect: ${effect.name ?? effectId}` : "",
      ].filter(Boolean).join(" · "),
    });
  }

  return rows;
};