import React from "react";
import { makeThresholdLookup } from "@/rules-profile";
import { derivedStatsFromDraft } from "./derivedStats";
import { startingCombatSnapshot } from "./StepAbilities";

/* CHARACTER RECAP for the Review & Create hub (Step 8 polish). Broken down
   by the CHARACTER SHEET'S OWN anatomy — sheet header, EQUIPPED slots,
   INVENTORY carried items, hotlist — so the recap reads like the sheet the
   crawler will populate. Display only: populated ENTIRELY from the
   existing wizard draft and the ACTIVE Rules Profile, recomputed live so
   it always mirrors the current draft after any EDIT jump. Empty slots and
   absent items show a subtle "—" — nothing is invented, and optional
   fields are never treated as errors. No validation, no creation, not a
   duplicate full Character Sheet. */

const WEAPON_SLOT_ID = "mainHand"; // canonical Character Sheet weapon destination

const Section = ({ title, edits = [], children, wide = false }) => (
  <div
    className={`flex flex-col gap-1 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-2.5 ${
      wide ? "md:col-span-2" : ""
    }`}
  >
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="section-title text-[11px]">{title}</p>
      <div className="flex gap-1">
        {edits.map((e) => (
          <button
            key={e.label}
            type="button"
            onClick={e.onClick}
            className="ink-box px-2 py-0.5 font-fell text-[11px] font-bold text-[#24180f]"
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
    {children}
  </div>
);

const Row = ({ label, value, faint = false }) => (
  <p className="font-fell text-[13px] leading-snug text-[#24180f]">
    <span className="field-label mr-1.5 text-[10px]">{label}</span>
    <span className={faint ? "text-[var(--ink-faint)] italic" : ""}>{value}</span>
  </p>
);

const orNone = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

export default function ReviewRecap({ steps = [], draft, profile, onJumpTo }) {
  const catalog = profile?.skills?.catalog ?? {};
  /* EDIT jumps — the step's live index in this wizard's step flow; jumping
     never clears or resets any draft data. */
  const stepIndex = (key) => steps.findIndex((s) => s.key === key);
  const editTo = (key) => {
    const i = stepIndex(key);
    if (i !== -1) onJumpTo?.(i);
  };
  const edit = (key, label) => ({ label, onClick: () => editTo(key) });

  const modLookup = React.useMemo(
    () => makeThresholdLookup(profile?.stats?.mod_rule?.table ?? []),
    [profile]
  );
  const derived = React.useMemo(() => derivedStatsFromDraft(profile, draft), [profile, draft]);

  const cs = draft?.coreStats ?? {};
  const sp = draft?.startingSpecies ?? {};
  const g = draft?.startingGear ?? {};
  const equipped = g.equipped ?? {};
  const sc = draft?.startingCombat ?? {};
  const heal = profile?.spells?.starting_spell ?? null;

  const genderText = (draft?.gender?.custom ?? "").trim() || (draft?.gender?.choice ?? "");
  const pronouns = (draft?.pronouns ?? "").trim();

  /* Backgrounds — the ACTIVE PROFILE's categories for this crawler type. */
  const bgRows = (profile?.creation_flow?.backgrounds?.[sp.type] ?? []).map((cat) => {
    const sel = (draft?.backgrounds ?? {})[cat.id];
    return {
      label: cat.label,
      background: sel?.background ?? "",
      skills: (sel?.skills ?? []).map((id) => catalog[id]?.name ?? id),
    };
  });
  const bgNames = bgRows.filter((r) => r.background).map((r) => r.background).join(", ");

  /* Second combat option — the SAME verified profile payloads Steps 6–7
     display; mechanics are never recalculated or invented here. */
  const combatOptions =
    profile?.creation_flow?.steps?.find((s) => s.id === "combat_approach")?.options ?? [];
  const weaponDetails = combatOptions.find((o) => o.id === "weapon")?.details ?? {};
  const spellDetails = combatOptions.find((o) => o.id === "attack_spell")?.spell_details ?? {};
  const handOption = combatOptions.find((o) => o.id === "hand_to_hand") ?? null;
  const spellGrants = combatOptions.find((o) => o.id === "attack_spell")?.grants ?? null;
  const w = sc.secondOptionType === "weapon" ? sc.weapon : null;
  const weaponDetail = w?.rulesSkillId ? weaponDetails[w.rulesSkillId] ?? null : null;
  const weaponName = w
    ? (w.displayName ?? "").trim() ||
      catalog[w.rulesSkillId]?.display_name ||
      catalog[w.rulesSkillId]?.name ||
      w.rulesSkillId
    : "";
  const weaponDamage = weaponDetail?.damage?.dice
    ? `${weaponDetail.damage.dice}${weaponDetail.damage.plus_mod_stat ? ` + ${weaponDetail.damage.plus_mod_stat.toUpperCase()} Mod` : ""} ${weaponDetail.damage_type ?? ""}`
    : "";
  const spellId = sc.secondOptionType === "attack_spell" ? sc.attackSpellId : "";
  const spellDet = spellId ? spellDetails[spellId] ?? null : null;
  const hand = sc.secondOptionType === "hand_to_hand" ? sc.handToHand ?? null : null;
  const handPair = hand
    ? (handOption?.pairs ?? []).find((p) => p.attackSkillId === hand.attackSkillId) ?? null
    : null;
  const handName = hand ? catalog[hand.attackSkillId]?.name ?? hand.attackSkillId : "";
  const handEffectName = handPair
    ? catalog[handPair.damageEffectId]?.name ?? handPair.damageEffectId
    : "";
  const spellDamage = spellDet?.damage?.dice
    ? `${spellDet.damage.dice}${spellDet.damage.plus_int_mod ? " + INT Mod" : ""}`
    : "";

  const usefulItem = g.usefulItem ?? {};
  const bringWeapon = g.bringPrimaryWeapon !== false;
  const invEntries = (g.inventory ?? []).filter((e) => String(e?.name ?? "").trim());

  /* Intended Hotlist — the LIVE Step 6 snapshot (never stale) plus the
     Step 7 useful-item Hotlist intent. */
  const { startingHotlist: hotIds } = startingCombatSnapshot(profile, draft);
  const hotNames = hotIds.map((id) => catalog[id]?.name ?? id);
  if (usefulItem.hotlist && (usefulItem.name ?? "").trim()) hotNames.push(usefulItem.name.trim());

  return (
    <div>
      <p className="section-title mb-2 text-[13px]">CHARACTER RECAP</p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* ===== SHEET SECTION — the identity band across the top of the sheet ===== */}
        <Section
          title="Sheet Section"
          wide
          edits={[edit("identity", "EDIT IDENTITY"), edit("race", "EDIT SPECIES")]}
        >
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <Row label="Crawler Name" value={orNone((draft?.name ?? "").trim())} />
            <Row label="Crawler #" value={orNone(draft?.crawlerNumber)} />
            <Row label="Species" value={orNone((sp.species ?? "").trim() || sp.label)} />
            <Row label="Size" value={orNone(sp.sizeLabel)} faint={!sp.sizeLabel} />
            <Row label="Class" value="Not Yet Assigned" />
            <Row label="Background" value={orNone(bgNames)} faint={!bgNames} />
            <Row label="Gender" value={orNone(genderText)} faint={!genderText} />
            <Row label="Pronouns" value={orNone(pronouns)} faint={!pronouns} />
            <Row label="Floor" value="1" />
            <Row label="AI Favor" value={orNone(derived.aiFavor)} />
          </div>
        </Section>

        {/* ===== EQUIPPED — every sheet slot, one row each ===== */}
        <Section
          title="Equipped"
          edits={[edit("gear", "EDIT SLOTS"), edit("abilities", "EDIT COMBAT")]}
        >
          {(profile?.gear?.slots ?? []).map((slot) => {
            if (slot.id === WEAPON_SLOT_ID) {
              const value = w
                ? bringWeapon
                  ? `${weaponName}${weaponDamage ? ` · ${weaponDamage}` : ""}${weaponDetail?.range ? ` · Range ${weaponDetail.range}` : ""}`
                  : "— (Skill known, not carried)"
                : spellId
                  ? "— (Attack Spell caster)"
                  : hand
                    ? "— (Unarmed / hand-to-hand)"
                    : "";
              return (
                <Row key={slot.id} label={slot.label} value={value || "—"} faint={!value} />
              );
            }
            const v = (equipped[slot.id] ?? "").trim();
            return <Row key={slot.id} label={slot.label} value={v || "—"} faint={!v} />;
          })}
        </Section>

        {/* ===== INVENTORY — one structured entry per carried item ===== */}
        <Section title="Inventory / Carried Items" edits={[edit("gear", "EDIT")]}>
          {(usefulItem.name ?? "").trim() && (
            <Row
              label="Useful Item"
              value={`${usefulItem.name.trim()}${usefulItem.secondaryWeapon && usefulItem.rulesSkillKey ? ` (secondary — ${catalog[usefulItem.rulesSkillKey]?.name ?? usefulItem.rulesSkillKey} Skill)` : ""}`}
            />
          )}
          {invEntries.map((e) => (
            <Row
              key={e.id}
              label={e.category === "weird_stuff" ? "Weird Stuff" : "Item"}
              value={`${e.name} × ${e.quantity ?? 1}`}
            />
          ))}
          {spellId && spellGrants?.mana_potions && (
            <Row label="Granted" value={`${spellGrants.mana_potions.qty} × ${spellGrants.mana_potions.item}`} />
          )}
          {!(usefulItem.name ?? "").trim() && invEntries.length === 0 && (
            <Row label="Carried Items" value="None selected" faint />
          )}
        </Section>

        {/* ===== HOTLIST ===== */}
        <Section title="Hotlist" edits={[edit("abilities", "EDIT HOTLIST")]}>
          <Row
            label="Intended Slots"
            value={hotNames.length > 0 ? hotNames.join(" · ") : "None selected"}
            faint={hotNames.length === 0}
          />
        </Section>

        {/* ===== Remaining verified recap data ===== */}
        <Section title="Core Stats" edits={[edit("core-stats", "EDIT")]}>
          <div className="grid grid-cols-5 gap-1">
            {(profile?.stats?.order ?? []).map((k) => {
              const v = cs[k]?.enhanced;
              const mod = typeof v === "number" ? modLookup(v) : null;
              return (
                <div key={k} className="ink-box flex flex-col items-center px-1 py-1">
                  <span className="font-fell text-[9px] font-bold tracking-[0.08em] text-[var(--ink-soft)]">
                    {k.toUpperCase()}
                  </span>
                  <span className="font-fell text-[16px] font-bold text-[#24180f]">
                    {typeof v === "number" ? v : "—"}
                  </span>
                  <span className="font-fell text-[10px] text-[var(--ink-soft)]">
                    Mod {mod ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Background & Skills" edits={[edit("background", "EDIT")]}>
          {bgRows.map((r) => (
            <Row
              key={r.label}
              label={r.label}
              value={r.background ? `${r.background} — ${r.skills.join(" · ")}` : "—"}
              faint={!r.background}
            />
          ))}
          <Row
            label="Baseline Combat"
            value={
              draft?.baselineAttack
                ? `${draft.baselineAttack.name} — Rank ${draft.baselineAttack.rank ?? "—"}`
                : "—"
            }
            faint={!draft?.baselineAttack}
          />
        </Section>

        <Section title="Derived Stats" edits={[edit("derived", "EDIT")]}>
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <Row
              label="Health"
              value={derived.health.max !== null ? `${derived.health.current} / ${derived.health.max}` : "—"}
            />
            <Row
              label="Mana"
              value={derived.mana.max !== null ? `${derived.mana.current} / ${derived.mana.max}` : "—"}
            />
            <Row label="Evade" value={orNone(derived.evade)} />
            <Row label="Damage Resist." value={orNone(derived.damageResistance)} />
            <Row label="Move" value={orNone(derived.move)} />
            <Row label="Step" value={orNone(derived.step)} />
          </div>
        </Section>

        <Section title="Abilities / Combat" edits={[edit("abilities", "EDIT")]}>
          {heal && (
            <Row
              label="Heal"
              value={`${catalog[heal.id]?.name ?? heal.id} — Rank ${heal.rank}${heal.rank_is_max ? " (MAX)" : ""}`}
            />
          )}
          {w && <Row label="Weapon Skill" value={`${weaponName} — Rank ${w.rank ?? "—"}`} />}
          {hand && (
            <Row
              label="Unarmed / Hand-to-Hand"
              value={`${handName} — Rank ${hand.rank ?? handOption?.rank ?? "—"}${handEffectName ? ` · Linked Damage Effect: ${handEffectName}` : ""}`}
            />
          )}
          {spellId && (
            <Row
              label="Attack Spell"
              value={
                spellDet
                  ? `${catalog[spellId]?.name ?? spellId} — Rank ${spellDet.rank ?? "—"} · Mana ${spellDet.mana_cost ?? "—"}${spellDamage ? ` · Damage ${spellDamage}` : ""}${spellDet.type ? ` · ${spellDet.type}` : ""} · Range ${spellDet.range ?? "—"}`
                  : "—"
              }
            />
          )}
          {!w && !spellId && !hand && <Row label="Second Option" value="—" faint />}
        </Section>
      </div>
    </div>
  );
}