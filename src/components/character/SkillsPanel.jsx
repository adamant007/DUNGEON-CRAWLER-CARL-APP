import React, { useState } from "react";
import { GD_SKILLS } from "@/components/ui/GingerDragonIcons";
import SheetPanel from "@/components/character/SheetPanel";
import SkillActionCard from "@/components/character/SkillActionCard";
import { SKILL_CATALOG } from "@/rules-profile/adapters/dungeon_crawler_carl/skillCatalog";

/* V3 dynamic Skills panel. Dungeon Crawler Carl characters have ranked
   skills — rendered compactly from the character's preserved ruleset
   data (rank, name, stat/mod, check type; no recalculation). A compact
   selection shows first; "View All Skills" expands the rest inline.
   Characters on other profiles keep the legacy fixed checklist exactly
   as before. No rolling mechanics. */
const LEGACY_SKILLS = [
  "Athletics", "Acrobatics", "Stealth", "Investigation", "Nature", "Perception",
  "Persuasion", "Deception", "Intimidation", "Performance", "Survival",
];
const COMPACT_COUNT = 5;
const DCC_SKILL_BY_NAME = Object.fromEntries(
  Object.values(SKILL_CATALOG).flatMap((def) => [
    [def.name, def],
    ...(def.display_name ? [[def.display_name, def]] : []),
  ])
);

/* Rank + Advancement row. In play mode (editing=false) the name area is
   a button: tap to open the Skill Action Card (Roll Skill Check). Rank
   stays read-only in play mode. Each row carries ONE advancement
   checkbox: ☐ when unmarked, ✓ when marked. Performing a Skill Check
   marks it automatically; it is also manually toggleable (a GM-called
   roll outside the app). The mark is separate data from Skill Rank and
   never changes it; marking repeatedly never stacks. */
function RankedRow({ skill, editing = false, onAdjustRank, onToggleAdv, onOpen }) {
  const marked = !!skill.advancement_mark;
  const advBox = (
    <button
      type="button"
      role="checkbox"
      aria-checked={marked}
      aria-label={`${skill.name} advancement ${marked ? "marked" : "unmarked"}`}
      title="Advancement — marked by a Skill Check, or tap to toggle"
      onClick={() => onToggleAdv?.()}
      className="w-4 h-4 shrink-0 flex items-center justify-center border-[1.5px] border-[var(--ink-soft)] rounded-[1px] text-[10px] leading-none font-bold select-none"
      style={marked ? { background: "var(--ink)", color: "var(--parch-1, #dcc59f)" } : { background: "rgba(255,248,220,0.15)" }}
    >
      {marked ? "✓" : ""}
    </button>
  );
  if (!editing) {
    return (
      <div className="w-full flex items-center gap-1.5 py-0.5 border-b border-[var(--rule)]/50 last:border-b-0">
        {/* Name area — still opens the Skill Action Card (Roll Skill
            Check). Rank stays read-only in play mode. */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${skill.name} — skill check`}
          className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
        >
          <span className="ink-box w-7 h-6 shrink-0 flex items-center justify-center text-[9px] font-bold select-none">
            R{skill.rank}
          </span>
          <span className="font-garamond text-[13px] text-[var(--ink)] min-w-0 flex-1 truncate underline decoration-[var(--rule)] underline-offset-2">
            {skill.name}
          </span>
          {skill.stat && (
            <span className="font-garamond text-[11px] text-[var(--ink-soft)] shrink-0">
              {skill.stat}{skill.mod ? ` ${skill.mod}` : ""}
            </span>
          )}
          {skill.check && <span className="field-label text-[8px] shrink-0">{skill.check}</span>}
        </button>
        {/* Advancement checkbox — toggle in play for GM-called checks. */}
        {advBox}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 py-0.5 border-b border-[var(--rule)]/50 last:border-b-0">
      <span className="flex items-center gap-0.5 shrink-0">
        <span
          aria-label={`${skill.name} rank ${skill.rank}`}
          className="ink-box w-7 h-6 flex items-center justify-center text-[9px] font-bold select-none"
        >
          R{skill.rank}
        </span>
        <button
          type="button"
          aria-label={`Decrease ${skill.name} rank`}
          onClick={() => onAdjustRank?.(-1)}
          className="ink-box w-5 h-6 flex items-center justify-center text-[11px] font-bold select-none"
        >
          −
        </button>
        <button
          type="button"
          aria-label={`Increase ${skill.name} rank`}
          onClick={() => onAdjustRank?.(1)}
          className="ink-box w-5 h-6 flex items-center justify-center text-[11px] font-bold select-none"
        >
          +
        </button>
      </span>
      <span className="font-garamond text-[13px] text-[var(--ink)] min-w-0 flex-1 truncate">{skill.name}</span>
      {skill.stat && (
        <span className="font-garamond text-[11px] text-[var(--ink-soft)] shrink-0">
          {skill.stat}{skill.mod ? ` ${skill.mod}` : ""}
        </span>
      )}
      {advBox}
    </div>
  );
}

export default function SkillsPanel({ profile, rulesetData, rankDraft = null, onAdjustRank, onToggleAdv, onRollSkill, onToggleSkillAdv, skills, setSkills, playMode = false }) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(null); // { skill, index } — the open Skill Action Card
  const isDcc = profile?.systemKey === "dungeon_crawler_carl";
  /* Edit-session draft overlay: a rank tap updates the parent's temporary
     in-memory draft — NEVER the canonical rulesetData — so no background
     save can commit a rank change mid-session. SAVE CHANGES commits the
     draft through the existing save path; CANCEL discards it. The row
     displays the drafted rank immediately. */
  const ranked = (isDcc && Array.isArray(rulesetData?.skills) ? rulesetData.skills : []).map((s, i) => {
    const drafted = rankDraft && i in rankDraft ? { ...s, rank: rankDraft[i] } : s;
    const def = (drafted?.id && SKILL_CATALOG[drafted.id]) || DCC_SKILL_BY_NAME[drafted?.name] || null;
    return {
      ...drafted,
      ...(def?.id && !drafted?.id ? { id: def.id } : {}),
      ...(def?.description && !drafted?.description ? { description: def.description } : {}),
    };
  });
  const editing = !playMode;

  /* Adjust the rank of an EXISTING skill row — one tap = exactly ±1,
     clamped at 0, stepping from the currently displayed (drafted) rank.
     Nothing else on the row changes. */
  const adjustRank = (index, delta) => {
    if (!onAdjustRank || !ranked[index]) return;
    const current = Number(ranked[index].rank) || 0;
    const next = Math.max(0, current + delta);
    if (next === current) return;
    onAdjustRank(index, next);
  };
  const toggleAdv = (index) => onToggleAdv?.(index);

  if (isDcc) {
    if (ranked.length === 0) {
      return (
        <SheetPanel icon={GD_SKILLS} title="Skills" frame="hand-frame-b" iconClass="text-[#d4a055]">
          <p className="font-fell italic text-[11px] text-[var(--ink-faint)]">No skills recorded yet.</p>
        </SheetPanel>
      );
    }
    const visible = expanded ? ranked : ranked.slice(0, COMPACT_COUNT);
    return (
      <SheetPanel icon={GD_SKILLS} title="Skills" frame="hand-frame-b" iconClass="text-[#d4a055]">
        {visible.map((s, i) => (
          <RankedRow
            key={`${s.name}-${i}`}
            skill={s}
            editing={editing}
            onAdjustRank={(d) => adjustRank(i, d)}
            onToggleAdv={() => toggleAdv(i)}
            onOpen={() => setOpen({ skill: s, index: i })}
          />
        ))}
        {ranked.length > COMPACT_COUNT && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 font-fell-sc text-[9px] tracking-[0.08em] text-[var(--hp)] underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--ink)]"
          >
            {expanded ? "Show Fewer" : `View All Skills (${ranked.length})`}
          </button>
        )}
        {/* Opening a skill never marks it — only the card's ROLL SKILL
            CHECK (automatic) or the advancement checkbox (manual toggle)
            do. */}
        {open && (
          <SkillActionCard
            skill={open.skill}
            marked={!!ranked[open.index]?.advancement_mark}
            onRoll={() => onRollSkill?.(open.skill, open.index)}
            onToggleAdv={() => onToggleSkillAdv?.(open.index)}
            onClose={() => setOpen(null)}
          />
        )}
      </SheetPanel>
    );
  }

  return (
    <SheetPanel icon={GD_SKILLS} title="Skills" frame="hand-frame-b" iconClass="text-[#d4a055]">
      {LEGACY_SKILLS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setSkills({ ...skills, [s]: !skills[s] })}
          disabled={playMode}
          className="w-full flex items-center justify-between py-1 border-b border-[var(--rule)]/50 last:border-b-0 disabled:pointer-events-none"
        >
          <span className="field-label text-[10px]">{s}</span>
          <span aria-hidden="true" className={`skill-box ${skills[s] ? "on" : ""}`} />
        </button>
      ))}
    </SheetPanel>
  );
}