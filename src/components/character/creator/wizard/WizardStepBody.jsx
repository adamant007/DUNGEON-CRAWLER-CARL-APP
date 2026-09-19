import React from "react";

/* Generic placeholder body for wizard steps whose mechanics arrive in a
   later implementation step — explains what the step will configure
   without inventing any rule content. */
export default function WizardStepBody({ step }) {
  return (
    <div className="border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-4">
      <p className="font-fell italic text-[16px] text-[var(--ink-soft)]">{step?.blurb}</p>
    </div>
  );
}