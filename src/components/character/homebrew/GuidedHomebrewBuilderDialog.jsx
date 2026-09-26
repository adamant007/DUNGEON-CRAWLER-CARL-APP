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
const CARD =
  "border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.18)] p-3";
const INPUT =
  "ink-box w-full px-2.5 py-2 font-fell text-[13px] text-[#24180f]";

const skillLabel = (skill) => skill?.display_name || skill?.name || skill?.id || "Skill";

function PointMeter({ build }) {
  const math = buildMath(build);

  return (
    <ParchmentDialog title="Guided Race / Class Builder" large onClose={onClose}>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="shrink-0">
          <StepTabs step={step} setStep={setStep} />
          <div className="mt-2">
            <PointMeter build={build} />
          </div>
        </div>

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
