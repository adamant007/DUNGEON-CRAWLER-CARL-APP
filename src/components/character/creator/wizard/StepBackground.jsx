import React from "react";
import { Info } from "lucide-react";
import { makeThresholdLookup } from "@/rules-profile";
import { rollDice } from "@/components/character/dice";

/* Step 4 — BACKGROUND & SKILLS (Step 3B.5). Only APPROVED backgrounds from
   the ACTIVE PROFILE appear — no free-text creation. The crawler type from
   Step 2 decides which table is used (Human: Childhood / Adolescence /
   Career / Hobby; Animal: Youth / Training / Quirk / Adult). For each life
   stage the player chooses or rolls a background (Human 1d12, Animal 1d6 —
   shared dice engine; the roll picks the BACKGROUND only, skills stay a
   deliberate choice), then picks exactly 2 of its 3 skills. A skill taken
   from another background is disabled — ranks never combine, and the
   player must end with exactly 8 unique background skills. The Step 2
   baseline combat skill is shown read-only and is NOT one of the 8. Skill
   names, stats, ranks, and Stat Mods all resolve from the profile (the
   same shared threshold-table lookup as the sheet). No Character record
   is created here. */

const Message = ({ children }) => (
  <span className="min-h-[1.25em] font-fell text-[13px] italic leading-snug text-[var(--hp)]">
    {children ?? ""}
  </span>
);

export default function StepBackground({ draft, updateDraft, profile, errors = {} }) {
  const stepDef = profile?.creation_flow?.steps?.find((s) => s.id === "backgrounds") ?? null;
  const skillsPer = stepDef?.skills_per_background ?? 2;
  const type = draft.startingSpecies?.type ?? "";
  const categories = profile?.creation_flow?.backgrounds?.[type] ?? [];
  const catalog = profile?.skills?.catalog ?? {};
  /* ONE modifier lookup — the profile's official threshold table over the
     Step 3 Enhanced stats, the same shared helper the Character Sheet uses. */
  const modLookup = React.useMemo(
    () => makeThresholdLookup(profile?.stats?.mod_rule?.table ?? []),
    [profile]
  );

  const bgs = draft.backgrounds ?? {};
  /* Optional per-category description list — tap/keyboard toggle, never
     hover-only, so phone and desktop discover the same information. */
  const [openDesc, setOpenDesc] = React.useState(null);
  const [openSkillDesc, setOpenSkillDesc] = React.useState(null);
  const stateOf = (cat) => bgs[cat.id] ?? { background: null, skills: [] };

  /* No double-dipping: a skill picked in another category is unavailable here. */
  const chosenElsewhere = (catId, skillId) =>
    categories.some((c) => c.id !== catId && (bgs[c.id]?.skills ?? []).includes(skillId));

  /* Changing a background clears ONLY that category's skills. */
  const setBackground = (cat, name) =>
    updateDraft({ backgrounds: { ...bgs, [cat.id]: { background: name, skills: [] } } });

  const rollBackground = (cat) => {
    const opt = cat.options[rollDice(`1d${cat.roll}`).total - 1];
    if (opt) setBackground(cat, opt.name);
  };

  const toggleSkill = (cat, skillId) => {
    const cur = stateOf(cat);
    if (cur.skills.includes(skillId)) {
      updateDraft({
        backgrounds: { ...bgs, [cat.id]: { ...cur, skills: cur.skills.filter((s) => s !== skillId) } },
      });
      return;
    }
    if (cur.skills.length >= skillsPer) return; // exactly two — never a third
    updateDraft({
      backgrounds: { ...bgs, [cat.id]: { ...cur, skills: [...cur.skills, skillId] } },
    });
  };

  /* NONE/passive skills never get an invented Stat modifier. */
  const modText = (skill) => {
    if (!skill?.stat) return "Passive";
    const value = draft.coreStats?.[skill.stat]?.enhanced;
    const stat = skill.stat.toUpperCase();
    return typeof value === "number" ? `${stat} +${modLookup(value)}` : stat;
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Step 2 baseline combat skill — read-only, never one of the 8 picks. */}
      <div className="flex items-center justify-between gap-3 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] px-3 py-2">
        <p className="field-label text-[11px]">Baseline Combat Skill</p>
        <p className="font-fell text-[15px] font-bold text-[#24180f]">
          {draft.baselineAttack
            ? `${draft.baselineAttack.name} — Rank ${draft.baselineAttack.rank}`
            : "Determined by Rules Profile"}
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="font-fell text-[15px] text-[#24180f]">
          Choose a crawler type in Step 2 before selecting backgrounds.
        </p>
      ) : (
        categories.map((cat) => {
          const sel = stateOf(cat);
          const bg = cat.options.find((o) => o.name === sel.background) ?? null;
          return (
            <div
              key={cat.id}
              className="flex flex-col gap-1.5 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="section-title text-[12px]">
                  {cat.label} — Skills at Rank {cat.startingRank}
                </p>
                <span className="font-fell text-[12px] italic text-[var(--ink-soft)]">
                  {sel.skills.length} of {skillsPer}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sel.background ?? ""}
                  onChange={(e) => setBackground(cat, e.target.value)}
                  aria-label={`${cat.label} background`}
                  className="ink-box flex-1 px-2 py-1 text-left text-[14px]"
                >
                  <option value="">Select…</option>
                  {/* Scannable dropdown labels — DISPLAY ONLY, built from the
                      active profile's data: background name + its approved
                      skill names joined by " · ". The stored value stays the
                      canonical background key; no descriptions, ranks, or
                      modifiers in the dropdown (those would clutter the
                      list). Works for any future profile automatically. */}
                  {cat.options.map((o) => (
                    <option key={o.name} value={o.name}>
                      {`${o.name} — ${o.skillIds.map((id) => catalog[id]?.name ?? id).join(" · ")}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => rollBackground(cat)}
                  aria-label={`Roll ${cat.label} background`}
                  className="ink-box px-3 py-1.5 font-fell text-[13px] font-bold text-[#24180f]"
                >
                  Roll
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDesc(openDesc === cat.id ? null : cat.id)}
                  aria-label={`Show ${cat.label} background descriptions`}
                  aria-expanded={openDesc === cat.id}
                  className="ink-box px-2 py-1.5 text-[#24180f]"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {/* Pre-commit discovery: every approved option's one-sentence
                  Ginger Dragon summary, one compact scrollable list. */}
              {openDesc === cat.id && (
                <div className="scrollbar-thin max-h-28 overflow-y-auto border-[1.5px] border-[var(--rule)] px-2 py-1">
                  {cat.options.map((o) => (
                    <p key={o.name} className="font-fell text-[12px] leading-snug text-[#24180f]">
                      <strong className="font-bold">{o.name}:</strong> {o.desc ?? ""}
                    </p>
                  ))}
                </div>
              )}
              {/* After committing: the chosen background's summary, subtle and
                 compact, above the three skill choices. */}
              {bg?.desc && (
                <p className="px-1 font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
                  {bg.desc}
                </p>
              )}
              {bg && (
                <div className="flex flex-col">
                  {bg.skillIds.map((id) => {
                    const skill = catalog[id];
                    const taken = chosenElsewhere(cat.id, id);
                    const checked = sel.skills.includes(id);
                    const locked = !checked && (taken || sel.skills.length >= skillsPer);
                    const skillDescKey = `${cat.id}:${id}`;
                    return (
                      <div
                        key={id}
                        className={`px-1 py-0.5 ${locked ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex min-w-0 flex-1 flex-wrap items-center gap-2 font-fell text-[14px] text-[#24180f]">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={locked}
                              onChange={() => toggleSkill(cat, id)}
                              className="h-3.5 w-3.5 accent-[#24180f]"
                            />
                            <span>{skill?.name ?? id}</span>
                            {taken && (
                              <em className="font-fell text-[11px] italic text-[var(--hp)]">
                                Already selected from another background.
                              </em>
                            )}
                          </label>
                          <span className="flex shrink-0 items-center gap-1.5">
                            <span className="font-fell text-[13px] text-[var(--ink-soft)]">
                              {modText(skill)}
                            </span>
                            {skill?.description && (
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenSkillDesc(openSkillDesc === skillDescKey ? null : skillDescKey)
                                }
                                aria-label={`${openSkillDesc === skillDescKey ? "Hide" : "Show"} ${skill.name} description`}
                                aria-expanded={openSkillDesc === skillDescKey}
                                className="ink-box px-1.5 py-1 text-[#24180f]"
                              >
                                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            )}
                          </span>
                        </div>
                        {openSkillDesc === skillDescKey && skill?.description && (
                          <p className="ml-5 mt-1 border-l-2 border-[var(--rule)] pl-2 font-fell text-[12px] leading-snug text-[var(--ink-soft)]">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <Message>{errors[`bg_${cat.id}`]}</Message>
            </div>
          );
        })
      )}
      <Message>{errors.backgroundsUnique}</Message>
    </div>
  );
}