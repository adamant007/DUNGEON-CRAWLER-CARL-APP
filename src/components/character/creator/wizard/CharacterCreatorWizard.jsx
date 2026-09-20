import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { wizardStepsFor, blankWizardDraft, validateStep, crawlerNumbersFromRecords } from "./wizardSteps";
import WizardProgress from "./WizardProgress";
import WizardNavigation from "./WizardNavigation";
import WizardStepBody from "./WizardStepBody";
import StepIdentity from "./StepIdentity";
import StepRaceSpecies from "./StepRaceSpecies";
import StepCoreStats from "./StepCoreStats";
import StepBackground from "./StepBackground";
import StepDerivedStats from "./StepDerivedStats";
import { derivedStatsFromDraft } from "./derivedStats";
import StepAbilities, { startingCombatSnapshot } from "./StepAbilities";
import StepStartingGear from "./StepStartingGear";
import StepStoryHooks from "./StepStoryHooks";
import StepReview from "./StepReview";

/* Character Creator Wizard — Rules Profile-driven multi-step shell
   (Step 3B.1). The selected Rules Profile launches it; the step flow is
   keyed by system_key in wizardSteps.js, so future profiles define their
   own steps without editing this component. ONE in-memory wizard draft —
   separate from the canonical Character record — holds the choices and
   survives every NEXT/BACK move. No Character record is created here:
   creation happens only at Review & Create in a later step, through the
   existing persistence path. */

/* Step bodies — real mechanics components attach here one step at a
   time; any step not listed yet renders the shared placeholder. */
const STEP_BODIES = {
  identity: StepIdentity,
  race: StepRaceSpecies,
  "core-stats": StepCoreStats,
  background: StepBackground,
  derived: StepDerivedStats,
  abilities: StepAbilities,
  gear: StepStartingGear,
  story: StepStoryHooks,
  review: StepReview,
};

export default function CharacterCreatorWizard({ selection, onCancel, onCreate }) {
  const steps = wizardStepsFor(selection);
  const [draft, setDraft] = useState(() => blankWizardDraft(selection));
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState({}); // inline validation for the current step
  /* Crawler numbers already in use by the user's canonical Characters —
     read once on open, read-only; browsing or abandoning the wizard
     reserves nothing. */
  const [usedNumbers, setUsedNumbers] = useState(() => new Set());
  useEffect(() => {
    let alive = true;
    base44.entities.Character.list()
      .then((records) => {
        if (alive) setUsedNumbers(crawlerNumbersFromRecords(records));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  /* CREATE CHARACTER request state — one create request at a time; on
     failure the wizard stays open with the error and offers retry. */
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  /* Missing or invalid Rules Profile — never guess a system. The user
     can return to the game selection flow. */
  if (!steps) {
    return (
      <div className="border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-4 text-center">
        <p className="font-fell text-[16px] text-[#24180f]">
          Rules Profile unavailable. Return to game selection.
        </p>
        <button type="button" onClick={onCancel} className="ink-box mt-3 px-3.5 py-2 text-[16px] text-[#24180f]">
          Return to Game Selection
        </button>
      </div>
    );
  }

  const updateDraft = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors({}); // editing clears stale validation messages
  };
  const StepBody = STEP_BODIES[steps[index].key] ?? WizardStepBody;

  /* GLOBAL BROWSE BEHAVIOR: NEXT NEVER blocks on Steps 1–8. Required-but-
     blank or invalid input is always navigable — Step 9 (Review & Create)
     is the single validation and correction hub. The step being left still
     records its inline messages, so returning to it shows what is missing
     without gating navigation. The identity name is trimmed on advance —
     the only normalization, never an invented value. The Step 5 and Step 6
     snapshots are still refreshed on advance so later steps never read
     stale values. */
  const advance = () => {
    setErrors(validateStep(steps[index].key, draft, selection.profile, usedNumbers));
    if (steps[index].key === "identity") setDraft((d) => ({ ...d, name: d.name.trim() }));
    if (steps[index].key === "derived") {
      setDraft((d) => ({ ...d, derived: derivedStatsFromDraft(selection.profile, d) }));
    }
    if (steps[index].key === "abilities") {
      setDraft((d) => ({ ...d, ...startingCombatSnapshot(selection.profile, d) }));
    }
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  };

  /* Direct step return (Step 9 Review hub): jump straight to any step
     with its CURRENT validation shown inline. The draft is never reset —
     every choice from every step is preserved. */
  const jumpTo = (targetIndex) => {
    const clamped = Math.min(steps.length - 1, Math.max(0, targetIndex));
    setErrors(validateStep(steps[clamped].key, draft, selection.profile, usedNumbers));
    setIndex(clamped);
  };

  /* CREATE CHARACTER — invoked only from the Review hub, which enables it
     exclusively when every required issue is complete and valid. The ONE
     canonical record is created through the parent's existing persistence
     path; on failure the wizard stays open with the error and offers
     retry. No partial or placeholder record is ever written. */
  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setCreateError("");
    try {
      await onCreate?.(selection, draft);
      // the parent closes the wizard once the record exists
    } catch {
      setCreating(false);
      setCreateError("Couldn\u2019t create this character. Nothing was saved — please try again.");
    }
  };

  /* Stable shell sizing (enlarged): the wizard view's modal is a FIXED
     responsive box — min(720px, 88vw) wide, min(820px, 88dvh) tall — so
     every step shares one identical outer size and Next/Back never resizes
     the modal. The wizard fills that box: header + progress stay pinned,
     the step body is the ONLY region that scrolls (long steps scroll
     internally), and the bottom navigation stays visible beneath it.
     Phones keep the same rule at viewport scale — full width minus the
     dialog's small outer margin, no horizontal scrolling. */
  return (
    <div className="flex h-full w-full flex-col">
      <p className="mb-2 shrink-0 font-fell text-[16px] text-[#24180f]">
        Creating a new crawler — <span className="font-display font-bold">{selection.displayName}</span>
      </p>
      <WizardProgress steps={steps} index={index} />
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <StepBody
          step={steps[index]}
          steps={steps}
          draft={draft}
          updateDraft={updateDraft}
          profile={selection.profile}
          errors={errors}
          usedNumbers={usedNumbers}
          onJumpTo={jumpTo}
          onCreate={handleCreate}
          creating={creating}
          createError={createError}
        />
      </div>
      <WizardNavigation
        index={index}
        total={steps.length}
        onBack={() => {
          setErrors({});
          setIndex((i) => Math.max(0, i - 1));
        }}
        onNext={advance}
        onCancel={onCancel}
      />
    </div>
  );
}