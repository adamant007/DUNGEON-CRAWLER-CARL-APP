import React from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import {
  BUILD_FOCUSES,
  COMMON_DAMAGE,
  FIXED_DETRIMENTS,
  SPECIAL_BENEFITS,
  STAT_KEYS,
  STAT_LABELS,
  UNCOMMON_DAMAGE,
  blankBuild,
  buildEntry,
  buildMath,
  focusBuild,
  validateBuild,
} from "./homebrewBuildRules";

const BTN =
  "ink-box px-3 py-2 font-fell-sc text-[12px] font-bold tracking-[0.04em] text-[#24180f] disabled:opacity-50 disabled:pointer-events-none";
const CARD = "border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.18)] p-3";
const INPUT = "ink-box w-full px-2.5 py-2 font-fell text-[13px] text-[#24180f]";
const skillLabel = (skill) => skill?.display_name || skill?.name || skill?.id || "Skill";

function PointMeter({ build }) {
  const math = buildMath(build);
  const over = math.remaining < 0 || math.rawDetrimentCredit > 5;
  return (
    <div className={`${CARD} flex flex-wrap items-center justify-between gap-2`}>
      <div>
        <p className="font-display text-[15px] font-bold text-[#24180f]">
          {build.kind === "race" ? "Race" : "Class"} Build Points
        </p>
        <p className="font-fell text-[11px] text-[var(--ink-soft)]">
          Base {math.base} BP{math.detrimentCredit ? ` + ${math.detrimentCredit} from drawbacks` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className={`font-display text-[18px] font-bold ${over ? "text-[var(--hp)]" : "text-[#24180f]"}`}>
          {math.benefitsSpent} / {math.available} BP
        </p>
        <p className="font-fell text-[11px] text-[var(--ink-soft)]">
          {math.remaining >= 0 ? `${math.remaining} unused` : `${Math.abs(math.remaining)} over budget`}
        </p>
      </div>
    </div>
  );
}

function StepTabs({ step, setStep }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {["Concept", "Benefits", "Drawbacks", "Review"].map((label, i) => (
        <button
          key={label}
          type="button"
          className={`${BTN} ${step === i ? "outline outline-2 outline-[#6b472a]" : ""}`}
          onClick={() => setStep(i)}
        >
          {i + 1}. {label}
        </button>
      ))}
    </div>
  );
}

function ConceptStep({ build, setBuild }) {
  const applyFocus = (focusId) => {
    const seeded = focusBuild(build.kind, focusId);
    setBuild({
      ...seeded,
      name: build.name,
      description: build.description,
      earth: build.earth,
      classType: build.classType,
      size: build.size,
    });
  };

  return (
    <div className="space-y-3">
      <div className={CARD}>
        <p className="font-display text-[16px] font-bold text-[#24180f]">What are you making?</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["race", "class"].map((kind) => (
            <button
              key={kind}
              type="button"
              className={`${BTN} ${build.kind === kind ? "outline outline-2 outline-[#6b472a]" : ""}`}
              onClick={() =>
                setBuild((old) => ({
                  ...blankBuild(kind),
                  name: old.name,
                  description: old.description,
                }))
              }
            >
              Build a {kind === "race" ? "Race" : "Class"}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="font-fell-sc text-[11px] font-bold tracking-[0.05em] text-[#24180f]">NAME</span>
        <input
          className={INPUT + " mt-1"}
          value={build.name}
          onChange={(e) => setBuild((b) => ({ ...b, name: e.target.value }))}
          placeholder={build.kind === "race" ? "e.g. Redacted Asset" : "e.g. Gray Man Field Operative"}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={CARD}>
          <p className="font-fell-sc text-[11px] font-bold tracking-[0.05em] text-[#24180f]">
            {build.kind === "race" ? "ORIGIN" : "CLASS ORIGIN"}
          </p>
          <div className="mt-2 flex gap-2">
            <button type="button" className={`${BTN} ${build.earth ? "outline outline-2 outline-[#6b472a]" : ""}`} onClick={() => setBuild((b) => ({ ...b, earth: true }))}>
              Earth
            </button>
            <button type="button" className={`${BTN} ${!build.earth ? "outline outline-2 outline-[#6b472a]" : ""}`} onClick={() => setBuild((b) => ({ ...b, earth: false }))}>
              {build.kind === "race" ? "Alien" : "Non-Earth"}
            </button>
          </div>
          <p className="mt-2 font-fell text-[11px] text-[var(--ink-soft)]">
            {build.kind === "race"
              ? build.earth
                ? "Earth Races keep access to Earth Classes and receive the normal Earth reward."
                : "Alien Races cannot select Earth-only Classes."
              : build.earth
                ? "Earth Class: receives the normal Earth reward."
                : "Not restricted to Earth-compatible Races."}
          </p>
        </div>

        {build.kind === "race" ? (
          <div className={CARD}>
            <p className="font-fell-sc text-[11px] font-bold tracking-[0.05em] text-[#24180f]">SIZE</p>
            <div className="mt-2 flex gap-2">
              {["Medium", "Small"].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`${BTN} ${build.size === size ? "outline outline-2 outline-[#6b472a]" : ""}`}
                  onClick={() => setBuild((b) => ({ ...b, size }))}
                >
                  {size}
                </button>
              ))}
            </div>
            {build.size === "Small" ? (
              <p className="mt-2 font-fell text-[11px] text-[var(--ink-soft)]">Small costs 3 BP.</p>
            ) : null}
          </div>
        ) : (
          <label className={CARD}>
            <span className="font-fell-sc text-[11px] font-bold tracking-[0.05em] text-[#24180f]">CLASS TYPE</span>
            <select className={INPUT + " mt-2"} value={build.classType} onChange={(e) => setBuild((b) => ({ ...b, classType: e.target.value }))}>
              {["Arcanist", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Mage", "Monk", "Paladin", "Rogue"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className={CARD}>
        <p className="font-display text-[15px] font-bold text-[#24180f]">What should it be good at?</p>
        <p className="mt-1 font-fell text-[11px] text-[var(--ink-soft)]">
          Choose a starting direction. Ginger Dragon fills in a sensible starter package, then you can change every pick.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {BUILD_FOCUSES.map((focus) => (
            <button key={focus.id} type="button" className={CARD + " text-left hover:bg-[rgba(74,55,39,0.12)]"} onClick={() => applyFocus(focus.id)}>
              <strong className="font-display text-[13px] text-[#24180f]">{focus.name}</strong>
              <span className="mt-0.5 block font-fell text-[11px] text-[var(--ink-soft)]">{focus.note}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="font-fell-sc text-[11px] font-bold tracking-[0.05em] text-[#24180f]">FUNNY / FLAVOR DESCRIPTION — FREE</span>
        <textarea className={INPUT + " mt-1 min-h-[82px]"} value={build.description} onChange={(e) => setBuild((b) => ({ ...b, description: e.target.value }))} placeholder="What kind of ridiculous Dungeon creation is this?" />
      </label>
    </div>
  );
}

function CounterRow({ label, value, onMinus, onPlus, note }) {
  return (
    <div className="grid grid-cols-[1fr_42px_80px] items-center gap-2 border-b border-[var(--rule)] py-2">
      <div>
        <p className="font-fell text-[13px] font-bold text-[#24180f]">{label}</p>
        {note ? <p className="font-fell text-[10px] text-[var(--ink-soft)]">{note}</p> : null}
      </div>
      <div className="text-center font-display text-[16px] font-bold text-[#24180f]">{value}</div>
      <div className="flex gap-1">
        <button type="button" className={BTN} onClick={onMinus} disabled={!value}>−</button>
        <button type="button" className={BTN} onClick={onPlus}>+</button>
      </div>
    </div>
  );
}

function BenefitsStep({ build, setBuild, skills }) {
  const [search, setSearch] = React.useState("");
  const q = search.trim().toLowerCase();
  const skillRows = Object.values(skills ?? {})
    .filter((s) => s.category !== "damage_effect")
    .filter((s) => !q || skillLabel(s).toLowerCase().includes(q))
    .sort((a, b) => skillLabel(a).localeCompare(skillLabel(b)))
    .slice(0, q ? 80 : 30);

  const toggleArray = (field, value) =>
    setBuild((b) => {
      const set = new Set(b[field] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...b, [field]: [...set] };
    });

  return (
    <div className="space-y-3">
      <PointMeter build={build} />

      <div className={CARD}>
        <p className="font-display text-[15px] font-bold text-[#24180f]">Stats — 1 BP per +1</p>
        {STAT_KEYS.map((key) => (
          <CounterRow
            key={key}
            label={STAT_LABELS[key]}
            value={Number(build.statBonuses[key] || 0)}
            onMinus={() => setBuild((b) => ({ ...b, statBonuses: { ...b.statBonuses, [key]: Math.max(0, Number(b.statBonuses[key] || 0) - 1) } }))}
            onPlus={() => setBuild((b) => ({ ...b, statBonuses: { ...b.statBonuses, [key]: Number(b.statBonuses[key] || 0) + 1 } }))}
          />
        ))}
      </div>

      <div className={CARD}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-display text-[15px] font-bold text-[#24180f]">Skills & Spells</p>
            <p className="font-fell text-[11px] text-[var(--ink-soft)]">+1 costs 2 BP · Rank-20 access costs 1 BP · Advantage on one non-combat Skill costs 3 BP.</p>
          </div>
          <input className={INPUT + " max-w-[230px]"} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a Skill…" />
        </div>
        <div className="mt-2 max-h-[330px] overflow-y-auto">
          {skillRows.map((skill) => {
            const bonus = Number(build.skillBonuses?.[skill.id] || 0);
            const rank20 = build.rank20?.includes(skill.id);
            const advantage = build.advantageSkills?.includes(skill.id);
            const canAdvantage = skill.category === "general";
            return (
              <div key={skill.id} className="border-b border-[var(--rule)] py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="min-w-[170px] flex-1">
                    <p className="font-fell text-[12px] font-bold text-[#24180f]">{skillLabel(skill)}</p>
                    <p className="font-fell text-[10px] text-[var(--ink-soft)]">{skill.category || "Skill"}{skill.stat ? ` · ${String(skill.stat).toUpperCase()}` : ""}</p>
                  </div>
                  <button type="button" className={BTN} disabled={bonus <= 0} onClick={() => setBuild((b) => ({ ...b, skillBonuses: { ...b.skillBonuses, [skill.id]: Math.max(0, bonus - 1) } }))}>−</button>
                  <span className="w-8 text-center font-display text-[14px] font-bold text-[#24180f]">+{bonus}</span>
                  <button type="button" className={BTN} onClick={() => setBuild((b) => ({ ...b, skillBonuses: { ...b.skillBonuses, [skill.id]: bonus + 1 } }))}>+</button>
                  <label className="flex items-center gap-1 font-fell text-[10px] text-[#24180f]"><input type="checkbox" checked={!!rank20} onChange={() => toggleArray("rank20", skill.id)} /> Rank 20</label>
                  {canAdvantage ? <label className="flex items-center gap-1 font-fell text-[10px] text-[#24180f]"><input type="checkbox" checked={!!advantage} onChange={() => toggleArray("advantageSkills", skill.id)} /> Advantage</label> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={CARD}>
        <p className="font-display text-[15px] font-bold text-[#24180f]">Special Benefits</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {SPECIAL_BENEFITS.filter((x) => x.kinds.includes(build.kind)).map((row) => (
            <label key={row.id} className="flex items-start gap-2 border border-[var(--rule)] p-2 font-fell text-[11px] text-[#24180f]">
              <input type="checkbox" checked={build.specials.includes(row.id)} onChange={() => toggleArray("specials", row.id)} />
              <span><strong>{row.label}</strong><br /><span className="text-[var(--ink-soft)]">{row.cost} BP</span></span>
            </label>
          ))}
        </div>

        <div className="mt-3">
          <CounterRow
            label="DR Buff"
            note="2 BP per +1, maximum +3."
            value={Number(build.drBonus || 0)}
            onMinus={() => setBuild((b) => ({ ...b, drBonus: Math.max(0, Number(b.drBonus || 0) - 1) }))}
            onPlus={() => setBuild((b) => ({ ...b, drBonus: Math.min(3, Number(b.drBonus || 0) + 1) }))}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="font-fell text-[11px] font-bold text-[#24180f]">Uncommon Resistance — 2 BP</span>
            <select className={INPUT + " mt-1"} value={build.uncommonResistance} onChange={(e) => setBuild((b) => ({ ...b, uncommonResistance: e.target.value }))}>
              <option value="">None</option>{UNCOMMON_DAMAGE.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            <span className="font-fell text-[11px] font-bold text-[#24180f]">Common Resistance — 4 BP</span>
            <select className={INPUT + " mt-1"} value={build.commonResistance} onChange={(e) => setBuild((b) => ({ ...b, commonResistance: e.target.value }))}>
              <option value="">None</option>{COMMON_DAMAGE.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-3">
          <p className="font-fell text-[11px] font-bold text-[#24180f]">Advantage on all Skill Checks using a Stat — 6 BP each</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {STAT_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-1 font-fell text-[11px] text-[#24180f]">
                <input type="checkbox" checked={build.advantageStats.includes(key)} onChange={() => toggleArray("advantageStats", key)} />
                {STAT_LABELS[key]}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawbacksStep({ build, setBuild }) {
  const toggleDetriment = (id) =>
    setBuild((b) => {
      const set = new Set(b.detriments ?? []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...b, detriments: [...set] };
    });

  return (
    <div className="space-y-3">
      <PointMeter build={build} />
      <div className={CARD}>
        <p className="font-display text-[15px] font-bold text-[#24180f]">Stat Penalties</p>
        <p className="font-fell text-[11px] text-[var(--ink-soft)]">Every 2 total penalty points grants +1 BP. All drawbacks together can grant at most +5 BP.</p>
        {STAT_KEYS.map((key) => {
          const value = Number(build.statPenalties[key] || 0);
          return (
            <CounterRow
              key={key}
              label={STAT_LABELS[key]}
              value={value}
              onMinus={() => setBuild((b) => ({ ...b, statPenalties: { ...b.statPenalties, [key]: Math.max(-10, value - 1) } }))}
              onPlus={() => setBuild((b) => ({ ...b, statPenalties: { ...b.statPenalties, [key]: Math.min(0, value + 1) } }))}
            />
          );
        })}
      </div>

      <div className={CARD}>
        <p className="font-display text-[15px] font-bold text-[#24180f]">Priced Drawbacks</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {FIXED_DETRIMENTS.filter((x) => x.kinds.includes(build.kind)).map((row) => (
            <label key={row.id} className="flex items-start gap-2 border border-[var(--rule)] p-2 font-fell text-[11px] text-[#24180f]">
              <input type="checkbox" checked={build.detriments.includes(row.id)} onChange={() => toggleDetriment(row.id)} />
              <span><strong>{row.label}</strong><br /><span className="text-[var(--ink-soft)]">+{row.credit} BP</span></span>
            </label>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="font-fell text-[11px] font-bold text-[#24180f]">Uncommon Vulnerability — +1 BP</span>
            <select className={INPUT + " mt-1"} value={build.uncommonVulnerability} onChange={(e) => setBuild((b) => ({ ...b, uncommonVulnerability: e.target.value }))}>
              <option value="">None</option>{UNCOMMON_DAMAGE.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            <span className="font-fell text-[11px] font-bold text-[#24180f]">Common Vulnerability — +3 BP</span>
            <select className={INPUT + " mt-1"} value={build.commonVulnerability} onChange={(e) => setBuild((b) => ({ ...b, commonVulnerability: e.target.value }))}>
              <option value="">None</option>{COMMON_DAMAGE.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="font-fell text-[11px] font-bold text-[#24180f]">Cap one Stat at 10 — +3 BP</span>
          <select className={INPUT + " mt-1"} value={build.statCap10} onChange={(e) => setBuild((b) => ({ ...b, statCap10: e.target.value }))}>
            <option value="">No Stat cap</option>{STAT_KEYS.map((key) => <option key={key} value={key}>{STAT_LABELS[key]}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}

function ReviewStep({ build, skills, onSave }) {
  const validation = validateBuild(build);
  const built = validation.legal ? buildEntry(build, skills) : null;
  const math = validation.math;
  const skillBonuses = Object.entries(build.skillBonuses ?? {}).filter(([, v]) => Number(v) > 0);

  return (
    <div className="space-y-3">
      <PointMeter build={build} />
      <div className={CARD}>
        <p className="font-display text-[19px] font-bold text-[#24180f]">{build.name || "Unnamed Creation"}</p>
        <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
          {build.earth ? "Earth" : build.kind === "race" ? "Alien" : "Non-Earth"} {build.kind === "race" ? "Race" : "Class"}
          {build.kind === "class" ? ` · ${build.classType}` : ""}
        </p>
        {build.description ? <p className="mt-2 font-fell text-[12px] text-[#24180f]">{build.description}</p> : null}
      </div>

      <div className={CARD}>
        <p className="font-fell-sc text-[11px] font-bold tracking-[0.05em] text-[#24180f]">MECHANICS</p>
        <div className="mt-2 grid gap-1 font-fell text-[12px] text-[#24180f] sm:grid-cols-2">
          {STAT_KEYS.filter((k) => Number(build.statBonuses[k]) > 0).map((k) => <span key={"b"+k}>+{build.statBonuses[k]} {STAT_LABELS[k]}</span>)}
          {STAT_KEYS.filter((k) => Number(build.statPenalties[k]) < 0).map((k) => <span key={"p"+k}>{build.statPenalties[k]} {STAT_LABELS[k]}</span>)}
          {skillBonuses.map(([id, rank]) => <span key={id}>+{rank} {skillLabel(skills[id])}</span>)}
          {build.rank20.map((id) => <span key={"r"+id}>{skillLabel(skills[id])} → Rank 20</span>)}
          {build.advantageSkills.map((id) => <span key={"a"+id}>Advantage: {skillLabel(skills[id])}</span>)}
          {build.kind === "race" && build.size === "Small" ? <span>Small Size — 3 BP</span> : null}
        </div>
      </div>

      {!validation.legal ? (
        <div className="border border-[var(--hp)] p-3">
          <p className="font-display text-[14px] font-bold text-[var(--hp)]">NOT LEGAL YET</p>
          {validation.errors.map((error) => <p key={error} className="mt-1 font-fell text-[11px] text-[var(--hp)]">• {error}</p>)}
        </div>
      ) : (
        <div className="border border-[#557b49] bg-[rgba(85,123,73,0.08)] p-3">
          <p className="font-display text-[15px] font-bold text-[#315a2d]">LEGAL BUILD</p>
          <p className="mt-1 font-fell text-[11px] text-[#24180f]">
            {math.benefitsSpent} BP spent out of {math.available}.{math.remaining > 0 ? ` ${math.remaining} BP will be unused.` : " Full budget used."}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" className={BTN} disabled={!validation.legal || !built?.ok} onClick={() => built?.entry && onSave(built.entry)}>
          SAVE LEGAL {build.kind === "race" ? "RACE" : "CLASS"}
        </button>
      </div>
    </div>
  );
}

export default function GuidedHomebrewBuilderDialog({ profile, savedRaces = [], savedClasses = [], onSave, onClose }) {
  const [step, setStep] = React.useState(0);
  const [build, setBuild] = React.useState(() => blankBuild("race"));
  const skills = profile?.skills?.catalog ?? {};

  return (
    <ParchmentDialog title="Guided Race / Class Builder" large onClose={onClose}>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="shrink-0"><StepTabs step={step} setStep={setStep} /></div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {step === 0 ? <ConceptStep build={build} setBuild={setBuild} /> : null}
          {step === 1 ? <BenefitsStep build={build} setBuild={setBuild} skills={skills} /> : null}
          {step === 2 ? <DrawbacksStep build={build} setBuild={setBuild} /> : null}
          {step === 3 ? <ReviewStep build={build} skills={skills} onSave={onSave} /> : null}
        </div>
        <div className="shrink-0 border-t border-[var(--rule)] pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-fell text-[10px] text-[var(--ink-soft)]">
              Saved for this crawler: {savedRaces.length} custom Race{savedRaces.length === 1 ? "" : "s"} · {savedClasses.length} custom Class{savedClasses.length === 1 ? "" : "es"}
            </p>
            <div className="flex gap-2">
              <button type="button" className={BTN} disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</button>
              {step < 3 ? <button type="button" className={BTN} onClick={() => setStep((s) => Math.min(3, s + 1))}>Next</button> : null}
            </div>
          </div>
        </div>
      </div>
    </ParchmentDialog>
  );
}
