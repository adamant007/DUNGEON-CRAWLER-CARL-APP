import React, { useState } from "react";
import { User } from "lucide-react";
import { FIRST_FLOOR_PREGENS } from "./data/firstFloorPregens";
import { SECOND_FLOOR_PREGENS } from "./data/secondFloorPregens";

/* Pregenerated Characters browser — selectable cards for the pregen
   TEMPLATES, at either starting level: First Floor (Level 1, the
   verified source templates) or Second Floor (Level 2, advanced per the
   core rulebook's Crawler Advancement rules). Selection is visual only;
   no Character record is created here. */
const FLOORS = [
  { floor: 1, label: "First Floor", level: "Level 1" },
  { floor: 2, label: "Second Floor", level: "Level 2" },
];

export default function PregensBrowser({ selection, onSelect, onContinue, onBack, onCancel }) {
  const [floor, setFloor] = useState(1);
  const list = floor === 2 ? SECOND_FLOOR_PREGENS : FIRST_FLOOR_PREGENS;

  const switchFloor = (next) => {
    if (next === floor) return;
    setFloor(next);
    onSelect(null); // a selection from the other level never carries over
  };

  return (
    <div>
      <p className="mb-2 font-fell italic text-[16px] text-[#24180f]">
        Choose a ready-to-play character.
      </p>

      {/* Starting-level toggle — the six crawlers at Level 1 or Level 2. */}
      <div className="mb-3 flex gap-2">
        {FLOORS.map((f) => (
          <button
            key={f.floor}
            type="button"
            onClick={() => switchFloor(f.floor)}
            className={`px-3 py-1.5 font-display text-[14px] font-bold tracking-[0.06em] ${
              floor === f.floor
                ? "nameplate text-[#f0e2c8]"
                : "ink-box text-[#24180f]"
            }`}
          >
            {f.label} · {f.level}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
        {list.map((p) => {
          const active = selection?.id === p.id;
          const primary = p.attacks[0];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className={`border-[1.5px] p-2.5 text-left ${
                active
                  ? "border-[var(--ink)] bg-[rgba(255,248,220,0.55)]"
                  : "border-[var(--ink-soft)] bg-[rgba(255,248,220,0.25)] hover:bg-[rgba(255,248,220,0.45)]"
              }`}
            >
              {/* Portrait / art placeholder — no copyrighted artwork */}
              <div className="flex h-24 items-center justify-center border-[1px] border-dashed border-[var(--rule)] bg-[rgba(255,248,220,0.15)]">
                <User size={28} className="text-[var(--ink-faint)]" />
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <span className="font-display text-[16px] font-bold text-[#24180f]">{p.identity.name}</span>
                <span aria-hidden="true" className={`skill-box ${active ? "on" : ""}`} />
              </div>
              <p className="mt-0.5 font-fell text-[16px] text-[var(--ink-soft)]">
                {p.floor === 2 ? "Second Floor" : "First Floor"} · Level {p.identity.level}
              </p>
              <p className="font-fell text-[16px] text-[var(--ink-soft)]">{p.identity.race}</p>
              <p className="mt-0.5 font-garamond text-[16px] text-[var(--ink)]">
                {primary.name} — {primary.damage} {primary.damageType}
              </p>
            </button>
          );
        })}
      </div>

      {/* Sticky action bar — stays reachable above the fold while the
          cards scroll; solid parchment tone so cards don't show through. */}
      <div className="sticky bottom-0 mt-3 flex items-center justify-between bg-[#f2e6c9] pt-2">
        <button type="button" onClick={onBack} className="ink-box px-3.5 py-2 text-[16px] text-[#24180f]">
          Back
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="ink-box px-3.5 py-2 text-[16px] text-[#24180f]">
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={!selection}
            className="nameplate px-3.5 py-2 font-display text-[16px] font-bold text-[#f0e2c8] disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}