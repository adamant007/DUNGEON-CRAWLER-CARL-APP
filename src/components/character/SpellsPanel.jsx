import React, { useState } from "react";
import { GD_SPELLS, GD_HEAL, GD_MAGIC_ATTACK } from "@/components/ui/GingerDragonIcons";
import SheetPanel from "@/components/character/SheetPanel";
import ViewAllLink from "@/components/character/ViewAllLink";
import SpellActionCard from "@/components/character/SpellActionCard";
import { knownSpells } from "@/components/character/spellData";

const hasContent = (r) => !!(r.name || r.cost || r.type || r.notes);

/* V3 compact Spells / Abilities panel — a summary and ACTION surface, NOT
   the spell-management editor. Known spells (from the character's
   preserved canonical data) open the reusable Spell Action Card (cast
   first, then roll). The known-spell collection is managed in the
   Spells tab; both reference the SAME canonical character spell data.
   The sheet is not the complete library; VIEW ALL SPELLS routes to the
   existing Spells tab. */
export default function SpellsPanel({ spells, rulesetData, mana, maxMana, onCast, onRoll }) {
  const [open, setOpen] = useState(null);
  const known = knownSpells(rulesetData, spells);
  const knownNames = new Set(known.map((s) => s.name.toLowerCase()));
  const rows = spells.filter((r) => hasContent(r) && !knownNames.has((r.name ?? "").toLowerCase()));

  return (
    <SheetPanel
      icon={GD_SPELLS}
      title="Spells / Abilities"
      frame="hand-frame-b"
      action={<ViewAllLink to="/spells" label="VIEW ALL SPELLS" />}
    >
      {known.map((s, i) => (
        <button
          key={`known-${i}`}
          type="button"
          onClick={() => setOpen(s)}
          aria-label={`${s.name} — open spell action card`}
          className="w-full text-left py-1 border-b border-[var(--rule)]/50 last:border-b-0"
        >
          <div className="flex items-center gap-2">
              {/* Decorative category pictogram — heal-named entries read as
                  healing; everything else is a generic arcane mark. No
                  spell data is touched. */}
              <span className="min-w-0 flex-1 flex items-center gap-2">
                {/heal/i.test(`${s.name} ${s.detail}`) ? (
                  <GD_HEAL size={40} className="shrink-0" />
                ) : (
                  <GD_MAGIC_ATTACK size={40} className="shrink-0" />
                )}
                <span className="font-garamond text-[13px] font-semibold text-[var(--ink)] truncate underline decoration-[var(--rule)] underline-offset-2">
                  {s.name}
                </span>
              </span>
            {s.rank !== "" && <span className="field-label text-[8px] shrink-0">Rank {s.rank}</span>}
            {s.mana !== "" && (
              <span
                title="Mana cost"
                className="ink-box w-9 h-9 shrink-0 flex items-center justify-center text-[9px] font-bold text-[var(--mana)] select-none"
              >
                {s.mana}
              </span>
            )}
          </div>
          {s.detail && (
            <p className="font-fell italic text-[10px] text-[var(--ink-faint)] leading-snug mt-0.5">
              {s.detail}
            </p>
          )}
        </button>
      ))}

      {rows.map((r, i) => (
        <div key={`row-${i}`} className="py-1 border-b border-[var(--rule)]/50 last:border-b-0">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 flex items-center gap-2">
              <GD_MAGIC_ATTACK size={40} className="shrink-0" />
              <span className="font-garamond text-[13px] font-semibold text-[var(--ink)] truncate">
                {r.name}
              </span>
            </span>
            {r.cost && (
              <span className="ink-box w-12 h-9 shrink-0 flex items-center justify-center text-[9px] font-bold select-none">
                {r.cost}
              </span>
            )}
          </div>
          {(r.type || r.notes) && (
            <p className="font-fell italic text-[10px] text-[var(--ink-faint)] leading-snug mt-0.5">
              {[r.type, r.notes].filter(Boolean).join(" — ")}
            </p>
          )}
        </div>
      ))}

      {known.length === 0 && rows.length === 0 && (
        <p className="font-fell italic text-[11px] text-[var(--ink-faint)]">No spells recorded yet.</p>
      )}

      {open && (
        <SpellActionCard
          spell={open}
          mana={mana}
          maxMana={maxMana}
          onCast={onCast}
          onRoll={onRoll}
          onClose={() => setOpen(null)}
        />
      )}
    </SheetPanel>
  );
}