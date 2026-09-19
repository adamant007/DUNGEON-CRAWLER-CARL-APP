import React from "react";
import { healthStatusText } from "@/components/character/healthStatus";

/* Mockup identity treatment — the Crawler's name sits top-aligned BESIDE
   the portrait, followed by the profile's own race/class/level line
   (only what the Rules Profile provides — nothing invented), the live
   health-status quote, and the EDIT DETAILS entry into the SAME Edit
   Character mode the locked toolbar drives. Presentation only. */
export default function IdentityStack({
  name,
  setName,
  info,
  hp,
  maxHp,
  playMode = false,
  onEditDetails,
}) {
  const subheader = [info?.race, info?.class, info?.level ? `Level ${info.level}` : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="text-center pt-1">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Crawler Name"
        readOnly={playMode}
        aria-label="Character name"
        className="gd-name w-full bg-transparent text-center outline-none font-display font-bold text-[22px] leading-tight tracking-wide text-[#f3e3b5] drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] placeholder:text-[#e8c987]/50"
      />
      {subheader && (
        <p className="font-fell text-[11px] text-[var(--ink-soft)] -mt-0.5">{subheader}</p>
      )}
      {/* Dynamic health-status quote — derived live from current/max HP
          (presentation only; no state is persisted). */}
      <p className="font-fell italic text-[11px] text-[var(--gold)]">
        {healthStatusText(hp, maxHp)}
      </p>
      {playMode && onEditDetails && (
        <div className="flex justify-center mt-1">
          <button
            type="button"
            onClick={onEditDetails}
            className="ink-box px-3 h-8 font-fell-sc text-[10px] tracking-[0.06em]"
          >
            EDIT DETAILS
          </button>
        </div>
      )}
    </div>
  );
}