import React, { useState } from "react";
import { GD_HP, GD_MANA } from "@/components/ui/GingerDragonIcons";
import { healthStatusText } from "@/components/character/healthStatus";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function SegBar({ label, Icon, tone, current, max, setCurrent, caption, ruleNote }) {
  const safeMax = Math.max(Number(max) || 1, 1);
  /* Segment count — nearest-percentage rounding. The old ceil() always
     rounded UP, so non-decade maxima (e.g. Mana 8) showed one segment
     MORE than the true value (1/8 filled 2 pips, 5/8 filled 7). Rounding
     to nearest is identical for max-10 pools (integer HP steps map to
     the same counts), and any value above zero still keeps at least one
     lit segment. */
  const shown = Math.round((Math.max(0, Number(current) || 0) / safeMax) * 10);
  const filled = Math.min(10, Number(current) > 0 ? Math.max(1, shown) : 0);
  const set = (i) =>
    setCurrent(filled === i + 1 ? Math.round((i / 10) * safeMax) : Math.round(((i + 1) / 10) * safeMax));

  /* HP color-state — PRESENTATION ONLY. Every FILLED segment carries the
     color of the character's CURRENT condition: healthy crimson (100–61%),
     wounded amber (60–31%), critical scarlet (30–1%). No mechanics change.
     Mana keeps its single blue treatment untouched. */
  const hpState = (pct) => (pct > 60 ? "on-hp" : pct > 30 ? "hp-wounded" : "hp-critical");
  const pct = (Math.max(0, Number(current) || 0) / safeMax) * 100;

  /* Low-health heartbeat — HEALTH bar only (tone === "hp"), driven by
     the LIVE HP percentage so it works for any ruleset or maximum.
     The halo rides the LAST FILLED red segments (the lit ones — the
     trailing slots are empty when HP is low, so they must never be
     the target): ≤20% the last two filled segments breathe, ≤10% the
     final filled segment pulses urgently. 0 HP stops the pulse and
     leaves the existing defeated/unconscious presentation untouched.
     Above 20% nothing changes and Mana never animates. */
  const alive = (Number(current) || 0) > 0;
  const lowHp = tone === "hp" && alive ? pct : 101;
  const dangerSlot = (i) => {
    if (tone !== "hp" || i >= filled) return ""; // only FILLED segments glow
    if (lowHp <= 10) return i === filled - 1 ? "hp-pulse-urgent" : "";
    if (lowHp <= 20) return i >= filled - 2 ? "hp-pulse" : "";
    return "";
  };

  /* Points carried by ONE bar segment — one tenth of the calculated
     maximum (the same unit heal effects use per restored slot). Shown so
     a stat-driven capacity change is readable at a glance. */
  const perSeg = safeMax / 10;
  const perSegment = Number.isInteger(perSeg) ? String(perSeg) : perSeg.toFixed(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-1 gap-1">
        <span className="field-label text-[10px] flex items-center gap-1.5 min-w-0">
          <Icon size={40} className={tone === "hp" ? "text-[var(--hp)]" : "text-[var(--mana)]"} fill="currentColor" />
          {label}
          <em className="font-fell italic text-[8px] text-[var(--ink-faint)] whitespace-nowrap">{perSegment} per segment</em>
        </span>
        <span className="flex items-center gap-1.5">
          {caption && <em className="font-fell italic text-[10px] text-[var(--ink-faint)] mr-1">{caption}</em>}
          <span
            className={`score-blank w-9 text-center font-garamond text-sm font-bold select-none tabular-nums ${
              tone === "hp" ? "text-[#de6550]" : "text-[#7aa5d6]"
            }`}
          >
            {current}
          </span>
          <span className="font-garamond text-sm text-[var(--ink-faint)]">/</span>
          <span className="score-blank w-9 text-center font-garamond text-sm text-[var(--ink)] select-none tabular-nums">{max}</span>
        </span>
      </div>
      <div className="grid grid-cols-10 gap-[3px] h-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Set ${label} to ${(i + 1) * 10} percent`}
            onClick={() => set(i)}
            className={`pip ${i < filled ? (tone === "hp" ? hpState(pct) : `on-${tone}`) : ""} ${dangerSlot(i)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-10 mt-0.5 text-center text-[6.5px] font-fell text-[var(--ink-faint)] select-none leading-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i}>{(i + 1) * 10}%</span>
        ))}
      </div>
      {ruleNote && (
        <p className="mt-1 text-right font-fell italic text-[8px] leading-none text-[var(--ink-faint)]">
          {ruleNote}
        </p>
      )}
    </div>
  );
}

export default function Vitals({ hp, setHp, maxHp, mana, setMana, maxMana, damageResistance = 0, healthRule = "", manaRule = "" }) {
  const [healthAmount, setHealthAmount] = useState(1);

  const amount = Math.max(1, Number(healthAmount) || 1);
  const damage = () => {
    const finalDamage = Math.max(0, amount - (Number(damageResistance) || 0));
    setHp(clamp(Number(hp) - finalDamage, 0, Number(maxHp)));
  };
  const heal = () => setHp(clamp(Number(hp) + amount, 0, Number(maxHp)));
  const manaDown = () => setMana(clamp(Number(mana) - 1, 0, Number(maxMana)));
  const manaUp = () => setMana(clamp(Number(mana) + 1, 0, Number(maxMana)));

  return (
    <div className="hand-frame p-2 space-y-2">
      <SegBar
        label="Hit Points"
        Icon={GD_HP}
        tone="hp"
        current={hp}
        max={maxHp}
        setCurrent={setHp}
        caption={healthStatusText(hp, maxHp)}
        ruleNote={healthRule}
      />
      <div className="flex items-center justify-end gap-2 -mt-1">
        <input
          type="number"
          min="1"
          value={healthAmount}
          onChange={(e) => setHealthAmount(e.target.value)}
          className="ink-box w-14 h-9 text-center text-sm"
          aria-label="Damage or heal amount"
        />
        <button type="button" onClick={damage} className="gd-damage px-3 h-9 border border-[#7b2c28]/60 bg-[#8a2d28]/10 font-fell text-[10px] tracking-wide text-[#7b2c28]">DAMAGE</button>
        <button type="button" onClick={heal} className="gd-heal px-3 h-9 border border-[#315d7c]/55 bg-[#315d7c]/10 font-fell text-[10px] tracking-wide text-[#315d7c]">HEAL</button>
      </div>

      <SegBar label="Mana" Icon={GD_MANA} tone="mana" current={mana} max={maxMana} setCurrent={setMana} ruleNote={manaRule} />
      <div className="flex items-center justify-end gap-2 -mt-1">
        <button type="button" onClick={manaDown} className="ink-box w-9 h-9 text-base">−</button>
        <button type="button" onClick={manaUp} className="ink-box w-9 h-9 text-base">+</button>
      </div>
    </div>
  );
}