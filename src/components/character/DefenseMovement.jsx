import React from "react";
import { GD_DEFENSE, GD_DAMAGE_RESIST, GD_EVADE, GD_MOVE, GD_STEP } from "@/components/ui/GingerDragonIcons";

/* V3 lower reference panel: Damage Resistance, Evade, Move, Step (AI
   Favor lives in the compact Crawler Details). Values, editability in
   edit mode, and persistence unchanged; inputs are read-only while
   Safe Play is on. Damage Resistance mechanics untouched. */
/* Mockup-style field identifiers — decorative only; values, formulas,
   and editability are unchanged. */
const FIELDS = [
  { key: "resist", label: "Damage Resist", icon: GD_DAMAGE_RESIST },
  { key: "evade", label: "Evade", icon: GD_EVADE },
  { key: "move", label: "Move", icon: GD_MOVE },
  { key: "step", label: "Step", icon: GD_STEP },
];

export default function DefenseMovement({ defense, setDefense, playMode = false }) {
  return (
    <section className="hand-frame-b p-2">
      <header className="flex items-center gap-2 mb-2">
        <GD_DEFENSE size={40} className="shrink-0" />
        <h3 className="section-title text-[10px]">Defense &amp; Movement</h3>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FIELDS.map(({ key, label, icon: FieldIcon }) => (
          <div key={key} className="text-center min-w-0">
            <span className="field-label text-[8px] flex items-center justify-center gap-1 mb-1 leading-tight">
              <FieldIcon size={40} className="shrink-0" />
              {label}
            </span>
            <input
              type="number"
              value={defense[key]}
              onChange={(e) => setDefense({ ...defense, [key]: e.target.value })}
              placeholder="—"
              readOnly={playMode}
              aria-label={label}
              className="ink-box w-full h-9 text-base font-bold"
            />
          </div>
        ))}
      </div>
    </section>
  );
}