import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { wizardReview } from "./wizardSteps";
import ReviewRecap from "./ReviewRecap";

/* Step 8 — REVIEW & CREATE (Step 3B.9): the single validation and
   correction hub for the whole Wizard. It calls the SAME shared
   per-step validators the steps use (wizardReview -> stepIssues) — no
   duplicated validation logic — recomputed LIVE from the current draft
   on every render, so a fix applied anywhere updates this view the
   moment the player returns. Steps 1–7 never block NEXT; this is where
   required information must finally be complete AND valid. CREATE
   CHARACTER is enabled only when every required issue is resolved —
   no partial, placeholder, or invented data is ever written. */

const PRIMARY =
  "nameplate px-6 py-2.5 font-display text-[17px] font-bold tracking-[0.06em] text-[#f0e2c8] disabled:opacity-60 disabled:pointer-events-none";
const BTN = "ink-box px-2.5 py-1 font-fell text-[12px] font-bold text-[#24180f]";

const Message = ({ children }) => (
  <span className="min-h-[1.25em] font-fell text-[13px] italic leading-snug text-[var(--hp)]">
    {children ?? ""}
  </span>
);

export default function StepReview({
  steps = [],
  draft,
  profile,
  usedNumbers,
  onJumpTo,
  onCreate,
  creating = false,
  createError = "",
}) {
  /* Live full-wizard validation — every step's status and issues,
     recomputed from the CURRENT draft. */
  const review = React.useMemo(
    () => wizardReview(steps, draft, profile, usedNumbers),
    [steps, draft, profile, usedNumbers]
  );
  /* The Review step itself is excluded — it validates the others. */
  const groups = review.filter((r) => r.step.key !== "review" && r.issues.length > 0);
  const totalIssues = groups.reduce((n, g) => n + g.issues.length, 0);
  const ready = groups.length === 0;

  return (
    <div className="flex flex-col gap-2.5">
      {ready ? (
        <div className="flex items-center justify-center gap-2 border-[3px] border-double border-[#2e5c3a] bg-[rgba(46,92,58,0.12)] px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2e5c3a]" aria-hidden="true" />
          <p className="section-title text-[15px] text-[#2e5c3a]">READY TO CREATE ✓</p>
        </div>
      ) : (
        <p className="section-title text-center text-[15px] text-[var(--hp)]">
          {totalIssues} {totalIssues === 1 ? "THING" : "THINGS"} STILL NEEDED
        </p>
      )}

      {!ready && (
        <p className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
          You can fix these now or come back later — nothing is saved until the character is
          created. GO TO STEP jumps straight to the step; every choice you have made is
          preserved.
        </p>
      )}

      {groups.map((g) => (
        <div
          key={g.step.key}
          className="flex flex-col gap-1.5 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="section-title text-[12px]">{g.step.title}</p>
            <button type="button" onClick={() => onJumpTo?.(g.index)} className={BTN}>
              GO TO STEP {g.index + 1}
            </button>
          </div>
          {g.issues.map((iss, i) => (
            <p
              key={`${iss.key}-${i}`}
              className="flex items-start gap-1.5 font-fell text-[13px] leading-snug text-[#24180f]"
            >
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--hp)]"
                aria-hidden="true"
              />
              {iss.message}
            </p>
          ))}
        </div>
      ))}

      {/* Compact recap — display only, fully draft/profile-driven, live on
          every return to Step 8; EDIT jumps preserve the entire draft. */}
      <ReviewRecap steps={steps} draft={draft} profile={profile} onJumpTo={onJumpTo} />

      <div className="mt-1 flex flex-col items-center gap-1.5">
        <button type="button" onClick={() => onCreate?.()} disabled={!ready || creating} className={PRIMARY}>
          {creating ? "CREATING…" : "CREATE CHARACTER"}
        </button>
        {ready && (
          <p className="font-fell text-[12px] italic text-[var(--ink-soft)]">
            {(draft?.name ?? "").trim() || "Your crawler"} enters the dungeon exactly as chosen —
            one canonical Character record is created.
          </p>
        )}
        <Message>{createError}</Message>
      </div>
    </div>
  );
}