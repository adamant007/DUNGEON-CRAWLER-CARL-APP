import React from "react";
import { Swords, Dices } from "lucide-react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

const BTN =
  "w-full h-11 flex items-center justify-center gap-2 font-fell-sc text-[16px] font-bold tracking-[0.05em] text-[#24180f] border border-[#4a3727] bg-[rgba(255,248,220,0.45)] transition-colors hover:bg-[rgba(74,55,39,0.14)] disabled:opacity-60 disabled:pointer-events-none";
const LABEL = "font-fell-sc text-[12px] tracking-[0.06em] text-[#5c4d3d]";
const VALUE = "font-garamond text-[16px] text-[#24180f]";

const rangeFromNotes = (notes) =>
  /(?:^|·\s*)Range:?\s+([^·;]+)/i.exec(String(notes ?? ""))?.[1]?.trim() ?? "";

const cleanNotes = (notes) =>
  String(notes ?? "")
    .replace(/(?:^|·\s*)Range:?\s+[^·;]+;?/i, "")
    .replace(/^[·\s]+|[·\s]+$/g, "")
    .replace(/\s*·\s*/g, " · ")
    .trim();

/* ONE reusable Attack Action Card — shared by the Character Sheet and
   Hotbar. Tap the attack name for the full at-table explanation; the
   compact hit and damage values can still be tapped directly for fast
   rolling. Everything shown here comes from the canonical attack row. */
export default function AttackActionCard({ attack, onAttackRoll, onDamageRoll, onClose }) {
  const a = attack ?? {};
  const rawNotes = a.notes ?? a.detail ?? a.description ?? "";
  const range = a.range || rangeFromNotes(rawNotes);
  const details = cleanNotes(rawNotes);
  const attackRoll = a.bonus ? `d20 ${a.bonus}` : "d20";

  return (
    <ParchmentDialog title={a.name || "Attack"} onClose={onClose}>
      <div className="space-y-3">
        {details && (
          <div className="border border-[var(--rule)] bg-[rgba(255,248,220,0.22)] px-3 py-2">
            <span className={`${LABEL} mb-1 block`}>What It Does</span>
            <p className="font-garamond text-[14px] leading-snug text-[#24180f]">{details}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <div>
            <span className={`${LABEL} block`}>Attack Roll</span>
            <p className={VALUE}>{attackRoll}</p>
          </div>
          {a.damage && (
            <div>
              <span className={`${LABEL} block`}>Damage</span>
              <p className={VALUE}>{a.damage}</p>
            </div>
          )}
          {range && (
            <div>
              <span className={`${LABEL} block`}>Range</span>
              <p className={VALUE}>{range}</p>
            </div>
          )}
          {a.type && (
            <div>
              <span className={`${LABEL} block`}>Type</span>
              <p className={VALUE}>{a.type}</p>
            </div>
          )}
        </div>

        <div className="border border-[var(--rule)] bg-[rgba(255,248,220,0.18)] px-3 py-2">
          <span className={`${LABEL} mb-1 block`}>How To Use It</span>
          <p className="font-fell text-[13px] leading-snug text-[var(--ink-soft)]">
            Use ROLL ATTACK for the hit check. Use ROLL DAMAGE when damage is called for.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button type="button" className={BTN} onClick={() => onAttackRoll?.(a.name, a.bonus)}>
            <Swords size={15} /> ROLL ATTACK{a.bonus ? ` (d20 ${a.bonus})` : ""}
          </button>
          {a.damage && (
            <button type="button" className={BTN} onClick={() => onDamageRoll?.(a.name, a.damage)}>
              <Dices size={15} /> ROLL DAMAGE {a.damage}
            </button>
          )}
        </div>
      </div>
    </ParchmentDialog>
  );
}
