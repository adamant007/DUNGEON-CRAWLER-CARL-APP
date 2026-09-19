import React from "react";
import { startingValuesForType, suggestedSizeForSpecies, outOfRangeSizeNotice } from "./wizardSteps";

/* Step 2 — RACE / SPECIES: FIRST-FLOOR STARTING IDENTITY ONLY (Step
   3B.3). Records what kind of crawler ENTERED the dungeon — never the
   later Third-Floor Race or Class catalogs, which are progression events
   the ACTIVE Rules Profile unlocks at a milestone. Everything rendered
   is profile-driven: crawler types, per-type Size rules, AI Favor
   defaults, and the baseline attack skill (no universal Ginger Dragon
   values). The wizard draft holds the choices; no Character record is
   created here. */

/* Always-present message slots keep the modal height stable when
   validation messages appear and disappear. */
const Message = ({ children }) => (
  <span className="min-h-[1.25em] font-fell text-[13px] italic leading-snug text-[var(--hp)]">
    {children ?? ""}
  </span>
);

const CHOICE_BASE =
  "border border-[var(--ink-soft)] px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";
const CHOICE_OFF = "bg-[rgba(255,248,220,0.25)] hover:bg-[rgba(74,55,39,0.18)]";
const CHOICE_ON = "bg-[rgba(74,55,39,0.28)]";

const Row = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className="field-label text-[11px]">{label}</dt>
    <dd className="font-fell text-[15px] text-[#24180f] text-right">{value}</dd>
  </div>
);

export default function StepRaceSpecies({ draft, updateDraft, profile, errors = {} }) {
  const types = profile?.creation_flow?.crawler_types ?? [];
  const sp = draft.startingSpecies ?? {};
  const sizeConf = profile?.creation_flow?.steps?.find((s) => s.id === "favor_size")?.size ?? null;
  const chosen = types.find((t) => t.id === sp.type) ?? null;
  const typeSizeConf = sizeConf?.[sp.type] ?? null;
  const sizeOptions = Array.isArray(typeSizeConf?.options) ? typeSizeConf.options : null; // option-Size type (Animal / Non-Human)
  const scale = sizeConf?.scale ?? [];
  const sizeText = sp.sizeLabel ? `${sp.sizeLabel} (${sp.sizeValue})` : "";

  /* The last species the wizard auto-suggested a size for (normalized key).
     The suggestion applies only when the recognized species CHANGES — so a
     manual override survives continued typing of the same species, while a
     different recognized species gets its mapped default recalculated. */
  const lastSuggestedRef = React.useRef(null);

  const selectType = (typeDef) => {
    if (sp.type === typeDef.id) return;
    lastSuggestedRef.current = null; // new crawler type — fresh suggestion state
    updateDraft(startingValuesForType(profile, typeDef));
  };
  const patchSpecies = (patch) => updateDraft({ startingSpecies: { ...sp, ...patch } });

  const onSpeciesChange = (e) => {
    const patch = { species: e.target.value };
    const suggested = suggestedSizeForSpecies(profile, sp.type, e.target.value);
    if (suggested && !suggested.notPermitted && lastSuggestedRef.current !== suggested.speciesKey) {
      lastSuggestedRef.current = suggested.speciesKey;
      patch.sizeValue = suggested.value;
      patch.sizeLabel = suggested.label;
    }
    patchSpecies(patch);
  };

  /* A recognized species whose mapped size is not permitted for starting
     creation leaves the Size unresolved — never silently forcing another
     size — and says so in the dropdown's message slot. */
  const sizeBlocked = chosen ? (outOfRangeSizeNotice(profile, sp.type, sp.species) ?? "") : "";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {types.map((t) => {
          const active = sp.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectType(t)}
              aria-pressed={active}
              className={`${CHOICE_BASE} ${active ? CHOICE_ON : CHOICE_OFF}`}
            >
              <span className="block font-fell-sc text-[16px] font-bold tracking-[0.04em] text-[#24180f]">
                {t.label}
              </span>
              {t.requires_gm_permission && (
                <span className="block font-fell italic text-[12px] text-[var(--ink-soft)]">
                  Requires campaign / GM permission
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Message>{errors.startingSpeciesType}</Message>

      {chosen && sizeOptions && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="field-label text-[12px]">Starting Species / Animal Type *</span>
            <input
              type="text"
              value={sp.species ?? ""}
              onChange={onSpeciesChange}
              placeholder="Enter starting species or animal type"
              className="ink-box px-2 py-1.5 text-left text-[16px]"
            />
            <Message>{errors.startingSpeciesName}</Message>
          </label>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="wizard-starting-size" className="field-label text-[12px]">
              Starting Size *
            </label>
            <select
              id="wizard-starting-size"
              value={sp.sizeValue ?? ""}
              onChange={(e) => {
                const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                const opt = scale.find((s) => s.value === value);
                patchSpecies({ sizeValue: value, sizeLabel: opt?.label ?? "" });
              }}
              className="ink-box px-2 py-1.5 text-[16px]"
            >
              <option value="">Select…</option>
              {/* Official scale order — Tiny (1) and Large (5) stay visible but
                  disabled: only the type's permitted starting sizes (2–4) are
                  selectable for a First-Floor Animal crawler. */}
              {scale.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={!sizeOptions.includes(opt.value)}>
                  {`${opt.label} (${opt.value})${opt.example ? ` — ${opt.example}` : ""}`}
                </option>
              ))}
            </select>
            <Message>{errors.startingSpeciesSize || sizeBlocked}</Message>
          </div>
        </>
      )}

      {chosen && (
        <div className="flex flex-col gap-1.5 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3">
          <p className="field-label text-[12px]">Starting Values</p>
          <dl className="flex flex-col gap-1">
            <Row label="Starting Species" value={sp.species || "—"} />
            <Row label="Size" value={sizeText || "—"} />
            <Row label="AI Favor" value={draft.aiFavor ?? "—"} />
            <Row
              label="Baseline Attack"
              value={draft.baselineAttack ? `${draft.baselineAttack.name} — Rank ${draft.baselineAttack.rank}` : "Determined by Rules Profile"}
            />
            <Row label="Class" value="Not Yet Assigned" />
          </dl>
          <Message>{errors.startingSpeciesDerived}</Message>
        </div>
      )}
    </div>
  );
}