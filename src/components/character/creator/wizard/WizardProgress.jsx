import React from "react";

/* Compact wizard progress — one small segment per step (never a wide tab
   strip), the current position, and the step title. Stays readable on a
   phone with no horizontal overflow. */
export default function WizardProgress({ steps, index }) {
  return (
    <div className="mb-4">
      <div className="flex items-end justify-between gap-3">
        <p className="font-fell-sc text-[12px] tracking-[0.12em] text-[var(--ink-soft)]">
          Step {index + 1} of {steps.length}
        </p>
        <div className="flex shrink-0 gap-1">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`h-2 w-4 border border-[var(--ink-soft)] sm:w-5 ${
                i < index
                  ? "bg-[var(--ink-soft)]"
                  : i === index
                    ? "bg-[var(--ink)]"
                    : "bg-[rgba(255,248,220,0.25)]"
              }`}
            />
          ))}
        </div>
      </div>
      <h4 className="mt-1 font-display text-[20px] font-bold text-[#24180f]">
        {steps[index]?.title}
      </h4>
    </div>
  );
}