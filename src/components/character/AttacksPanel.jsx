import React from "react";
import { GD_ATTACKS, GD_PHYSICAL_ATTACK, GD_MAGIC_ATTACK } from "@/components/ui/GingerDragonIcons";
import SheetPanel from "@/components/character/SheetPanel";
import { resolveStatMods } from "@/components/character/dice";
import AttackActionCard from "@/components/character/AttackActionCard";

const hasContent = (r) => !!(r.name || r.bonus || r.damage || r.type || r.notes || r.range);

/* Decorative row pictogram — presentation only. Arcane-named entries
   read as spell attacks, everything else as a weapon attack. It never
   implies a mechanic, and HIT/DAMAGE behavior is unchanged. */
const isArcane = (row) => /spell|magic|arcane|missile/i.test(`${row.name ?? ""} ${row.notes ?? ""}`);

/* Small labeled read-only chip. */
function StaticChip({ label, value }) {
  return (
    <div className="min-w-0">
      <span className="field-label text-[7px] block leading-none mb-0.5">{label}</span>
      <span className="ink-box w-full h-9 flex items-center justify-center text-[10px] font-bold select-none px-1 truncate">
        {value || "—"}
      </span>
    </div>
  );
}

/* V3 compact Attacks panel — an ACTION surface. Tap the bonus chip to
   roll the attack check (d20 + stored bonus); tap the damage expression
   to roll exactly that dice expression. Attack definitions come from the
   character's canonical/preserved data — they are not independently
   editable here. Range displays once: the row's own value, else the same
   preserved attack, else the "Range …" prefix of the notes (which is
   then not shown again). */
export default function AttacksPanel({ attacks, rulesetData, onAttackRoll, onDamageRoll }) {
  const [openAttack, setOpenAttack] = React.useState(null);
  const preservedRange = (row) => rulesetData?.attacks?.find((a) => a?.name === row.name)?.range || "";
  /* "Range: …" can sit anywhere in the notes (mid-list after "Attack:
     DEX"), so match on a segment boundary — not just the start. */
  const notesRange = (row) => /(?:^|·\s*)Range:?\s+([^·;]+)/i.exec(row.notes ?? "")?.[1]?.trim() ?? "";
  const rangeOf = (row) => row.range || preservedRange(row) || notesRange(row);
  const notesOf = (row) =>
    (row.notes ?? "")
      .replace(/(?:^|·\s*)Range:?\s+[^·;]+;?/i, "")
      .replace(/^[·\s]+|[·\s]+$/g, "")
      .replace(/\s*·\s*/g, " · ")
      .trim();
  /* Structural damage ("1d4 + STR Mod") displays and rolls the LIVE
     stat modifier — never the frozen text, never a stale sum. */
  const damageOf = (row) => resolveStatMods(row.damage, rulesetData?.stats);
  const rows = attacks.filter(hasContent);

  return (
    <SheetPanel icon={GD_ATTACKS} title="Attacks">
      {rows.length === 0 && (
        <p className="font-fell italic text-[11px] text-[var(--ink-faint)]">No attacks recorded yet.</p>
      )}
      {attacks.map((row, i) => {
        if (!hasContent(row)) return null;
        return (
          <div key={i} className="py-1 border-b border-[var(--rule)]/50 last:border-b-0">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 flex items-center gap-2">
                {isArcane(row) ? (
                  <GD_MAGIC_ATTACK size={40} className="shrink-0" />
                ) : (
                  <GD_PHYSICAL_ATTACK size={40} className="shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => setOpenAttack(row)}
                  aria-label={`${row.name} — attack details`}
                  className="touch-manipulation min-w-0 flex-1 truncate text-left font-garamond text-[13px] font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-2"
                >
                  {row.name}
                </button>
              </span>
              {/* HIT — rolls d20 + the attack's EXISTING stored final bonus
                  (never recalculated, never double-added). Same roll path
                  and dice engine as every other sheet roll. */}
              <div className="shrink-0">
                <span className="field-label text-[7px] block leading-none mb-0.5">HIT</span>
                {row.bonus ? (
                  <button
                    type="button"
                    onClick={() => onAttackRoll?.(row.name, row.bonus)}
                    title={`Tap to roll attack: d20 ${row.bonus}`}
                    aria-label={`${row.name} attack hit roll`}
                    className="ink-box w-12 h-9 flex items-center justify-center text-[11px] font-bold select-none cursor-pointer hover:bg-[rgba(255,248,220,0.45)]"
                  >
                    {row.bonus}
                  </button>
                ) : (
                  <span className="ink-box w-12 h-9 flex items-center justify-center text-[11px] font-bold select-none px-1 truncate">
                    —
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-2 mt-0.5">
              {row.damage ? (
                <button
                  type="button"
                  onClick={() => onDamageRoll?.(row.name, damageOf(row))}
                  title="Tap to roll damage"
                  aria-label={`${row.name} damage roll`}
                  className="block min-w-0 text-left"
                >
                  <span className="field-label text-[7px] block leading-none mb-0.5">DAMAGE</span>
                  <span className="ink-box w-full h-9 flex items-center justify-center text-[10px] font-bold select-none cursor-pointer hover:bg-[rgba(255,248,220,0.45)] px-1 truncate">
                    {damageOf(row)}
                  </span>
                </button>
              ) : (
                <StaticChip label="DMG" value="" />
              )}
              <StaticChip label="RANGE" value={rangeOf(row)} />
              <StaticChip label="TYPE" value={row.type} />
            </div>
            {notesOf(row) && (
              <p className="font-fell italic text-[10px] text-[var(--ink-faint)] leading-snug mt-0.5">
                {notesOf(row)}
              </p>
            )}
          </div>
        );
      })}
      {openAttack && (
        <AttackActionCard
          attack={openAttack}
          onAttackRoll={onAttackRoll}
          onDamageRoll={onDamageRoll}
          onClose={() => setOpenAttack(null)}
        />
      )}
    </SheetPanel>
  );
}