import React from "react";
import { Star } from "lucide-react";
import { GD_STAT_STR, GD_STAT_DEX, GD_STAT_CON, GD_STAT_INT, GD_STAT_CHA } from "@/components/ui/GingerDragonIcons";
import SheetPanel from "@/components/character/SheetPanel";

/* Compact canonical labels — always display fully, on every viewport. */
/* Mockup-style stat emblems — decorative identifiers ONLY. They never
   alter values, modifiers, or checks. */
const STATS = [
  { key: "str", label: "STR", icon: GD_STAT_STR, tone: "text-[#d95f50]" },
  { key: "dex", label: "DEX", icon: GD_STAT_DEX, tone: "text-[#7dab5f]" },
  { key: "con", label: "CON", icon: GD_STAT_CON, tone: "text-[#d9772f]" },
  { key: "int", label: "INT", icon: GD_STAT_INT, tone: "text-[#6f9fd6]" },
  { key: "cha", label: "CHA", icon: GD_STAT_CHA, tone: "text-[#c98fd6]" },
];

/* Non-DCCarl display only — Dungeon Crawler Carl characters show their
   Rules Profile modifiers instead (statMods, never D&D math). */
function ddMod(score) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

/* V3 Core Stats. For Dungeon Crawler Carl characters each row shows
   ENHANCED (the live canonical attribute, editable) | UNENHANCED (the
   preserved ruleset value, displayed as stored) | MODIFIER (from the
   locked DCCarl modifier helper). Missing preserved values are never
   invented — an em-dash is shown. Every other profile keeps the previous
   two-column presentation. */
export default function CoreStatsPanel({ attrs, setAttrs, statMods, profile, rulesetData, playMode = false, onStatRoll }) {
  const isDcc = profile?.systemKey === "dungeon_crawler_carl";
  const statField = (k) => (v) => setAttrs({ ...attrs, [k]: v });
  const GRID = "grid grid-cols-[4.6rem_1fr_1fr_1fr] gap-1.5";

  return (
    <SheetPanel icon={Star} title="Core Stats">
      {isDcc ? (
        <div>
          <div className={`${GRID} border-b ink-rule pb-1 mb-1`}>
            <span />
            <span className="field-label text-[7px] sm:text-[8px] text-center leading-tight">Enhanced</span>
            <span className="field-label text-[7px] sm:text-[8px] text-center leading-tight">Unenhanced</span>
            <span className="field-label text-[7px] sm:text-[8px] text-center leading-tight">Mod</span>
          </div>
          {STATS.map(({ key, label, icon: StatIcon, tone }, i) => (
            <div
              key={key}
              data-stat={key}
              className={`${GRID} items-center py-0.5 ${i < STATS.length - 1 ? "border-b border-[var(--rule)]/50" : ""}`}
            >
              <span className="field-label text-[11px] font-bold flex items-center gap-2">
                <StatIcon size={40} className={`${tone} shrink-0`} aria-hidden="true" fill="currentColor" strokeWidth={2} />
                {label}
              </span>
              <input
                type="number"
                value={attrs[key]}
                onChange={(e) => statField(key)(+e.target.value)}
                readOnly={playMode}
                aria-label={`${label} enhanced`}
                className="ink-box w-full h-9 text-sm font-bold"
              />
              <span
                aria-label={`${label} unenhanced`}
                className="ink-box w-full h-9 flex items-center justify-center text-sm font-bold select-none"
              >
                {rulesetData?.stats?.[key]?.unenhanced ?? "—"}
              </span>
              {playMode ? (
                <button
                  type="button"
                  onClick={() => onStatRoll?.(label, statMods?.[key])}
                  aria-label={`${label} stat check`}
                  title={`Tap to roll: d20 ${statMods?.[key] ?? ""}`}
                  className="ink-box w-full h-9 flex items-center justify-center text-sm font-bold text-[var(--hp)] select-none cursor-pointer hover:bg-[rgba(255,248,220,0.45)]"
                >
                  {statMods?.[key] ?? "—"}
                </button>
              ) : (
                <span
                  aria-label={`${label} modifier`}
                  className="ink-box w-full h-9 flex items-center justify-center text-sm font-bold text-[var(--hp)] select-none"
                >
                  {statMods?.[key] ?? "—"}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        STATS.map(({ key, label, icon: StatIcon, tone }) => (
          <div key={key} className="flex items-center gap-2 py-1 border-b ink-rule last:border-b-0">
            <span className="field-label text-[11px] font-bold flex-1 flex items-center gap-2">
              <StatIcon size={40} className={`${tone} shrink-0`} aria-hidden="true" fill="currentColor" strokeWidth={2} />
              {label}
            </span>
            <input
              type="number"
              value={attrs[key]}
              onChange={(e) => statField(key)(+e.target.value)}
              readOnly={playMode}
              className="ink-box w-11 h-9 text-base font-bold"
            />
            {playMode ? (
              <button
                type="button"
                onClick={() => onStatRoll?.(label, ddMod(attrs[key]))}
                aria-label={`${label} stat check`}
                title={`Tap to roll: d20 ${ddMod(attrs[key])}`}
                className="ink-box w-9 h-9 text-sm font-bold text-[var(--hp)] flex items-center justify-center select-none cursor-pointer hover:bg-[rgba(255,248,220,0.45)]"
              >
                {ddMod(attrs[key])}
              </button>
            ) : (
              <span className="ink-box w-9 h-9 text-sm font-bold text-[var(--hp)] flex items-center justify-center select-none">
                {ddMod(attrs[key])}
              </span>
            )}
          </div>
        ))
      )}
    </SheetPanel>
  );
}