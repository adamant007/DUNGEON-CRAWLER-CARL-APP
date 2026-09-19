import React from "react";
import { derivedStatsFromDraft } from "./derivedStats";

/* Step 5 — DERIVED STATS (Step 3B.6). Every value is RULE-DERIVED and
   read-only: Health = CON Mod × 10 (Max Mana = Enhanced INT, Evade = DEX
   Mod, Move/Step defaults) all come from the ACTIVE PROFILE's declarative
   formulas evaluated against the CURRENT draft — the wizard never hardcodes
   DCCarl math. AI Favor and Size carry forward from the Step 2 choices.
   Everything recomputes LIVE on every render, so BACK edits to Steps 2–3
   are reflected immediately — no stale cached numbers. Damage Resistance
   starts at the profile's default (0 — no gear chosen yet). No damage or
   mana controls, no Character record: creation/review only. */

const Box = ({ title, children }) => (
  <div className="flex flex-col gap-1.5 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3">
    <p className="section-title text-[12px]">{title}</p>
    {children}
  </div>
);

const Value = ({ children }) => (
  <span className="font-fell text-[17px] font-bold text-[#24180f]">{children}</span>
);
const Caption = ({ children }) => (
  <span className="font-fell text-[12px] italic leading-snug text-[var(--ink-soft)]">
    {children}
  </span>
);

const Row = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className="field-label text-[11px]">{label}</dt>
    <dd className="font-fell text-[15px] text-[#24180f] text-right">{value}</dd>
  </div>
);

const num = (v) => (typeof v === "number" ? v : "—");
const signed = (v) => (typeof v === "number" ? `+${v}` : "—");

export default function StepDerivedStats({ draft, profile }) {
  const d = derivedStatsFromDraft(profile, draft);

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-fell text-[13px] italic leading-snug text-[var(--ink-soft)]">
        These values follow automatically from your Step 2 and Step 3 choices — nothing to enter here.
      </p>

      <Box title="Health">
        <div className="flex items-baseline justify-between gap-3">
          <Value>
            {num(d.health.max)} / {num(d.health.max)}
          </Value>
          <Caption>CON Mod {signed(d.health.sourceMod)} × 10</Caption>
        </div>
        {/* Ginger Dragon 10-slot Health Bar — full at creation, display only. */}
        <div
          className="flex h-3.5 gap-[3px]"
          role="img"
          aria-label={`Health bar — ${d.health.slotCount} of ${d.health.slotCount} slots full`}
        >
          {Array.from({ length: d.health.slotCount }, (_, i) => (
            <div key={i} className="pip on-hp pointer-events-none" />
          ))}
        </div>
        <Caption>
          {num(d.health.valuePerSlot)} Health per slot · full at creation
        </Caption>
      </Box>

      <Box title="Mana">
        <div className="flex items-baseline justify-between gap-3">
          <Value>
            {num(d.mana.max)} / {num(d.mana.max)}
          </Value>
          <Caption>Enhanced INT {num(d.mana.sourceValue)}</Caption>
        </div>
      </Box>

      <Box title="Evade">
        <div className="flex items-baseline justify-between gap-3">
          <Value>{signed(d.evade)}</Value>
          <Caption>DEX Mod {signed(d.evade)}</Caption>
        </div>
      </Box>

      <Box title="Movement">
        <div className="flex items-baseline justify-between gap-3">
          <Value>Move {num(d.move)} ft</Value>
          <Caption>Step {num(d.step)} ft</Caption>
        </div>
      </Box>

      <Box title="Defense / Identity">
        <dl className="flex flex-col gap-1">
          <Row label="Damage Resistance" value={num(d.damageResistance)} />
          <Row label="AI Favor" value={num(d.aiFavor)} />
          <Row
            label="Size"
            value={d.size !== null ? `${d.sizeLabel || "—"} (${d.size})` : "—"}
          />
        </dl>
        <Caption>Size and AI Favor follow your Step 2 choices — go BACK to change them.</Caption>
      </Box>
    </div>
  );
}