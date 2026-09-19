import React, { useState } from "react";
import { Wand2, Dices } from "lucide-react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

const BTN =
  "w-full h-11 flex items-center justify-center gap-2 font-fell-sc text-[16px] font-bold tracking-[0.05em] text-[#24180f] border border-[#4a3727] bg-[rgba(255,248,220,0.45)] transition-colors hover:bg-[rgba(74,55,39,0.14)] disabled:opacity-60 disabled:pointer-events-none";

const LABEL = "font-fell-sc text-[12px] tracking-[0.06em] text-[#5c4d3d]";
const VALUE = "font-garamond text-[16px] text-[#24180f]";

/* ONE reusable Spell Action Card — used by the Character Sheet's known
   spells and available to the Spells tab. Interaction order is LOCKED:
   open → read details → CAST (deduct mana, apply heal effects) → ROLL
   appears only when the spell's canonical data carries dice. Missing
   information is never invented. */
export default function SpellActionCard({ spell, mana, maxMana, onCast, onRoll, onClose }) {
  const [castDone, setCastDone] = useState(false);
  const [notice, setNotice] = useState("");
  const s = spell ?? {};
  const damage = s.attack?.damage ?? "";

  const handleCast = () => {
    setNotice("");
    const res = onCast?.(s) ?? { ok: false, cost: 0, current: 0 };
    if (!res.ok) {
      setNotice(`NOT ENOUGH MANA\nRequires ${res.cost} Mana\nCurrent Mana: ${res.current}`);
      return;
    }
    setCastDone(true);
  };

  return (
    <ParchmentDialog title={s.name || "Spell"} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {s.rank !== "" && (
            <span className="ink-box px-2 h-7 inline-flex items-center text-[12px] font-bold">Rank {s.rank}</span>
          )}
          {s.mana !== "" && (
            <span className="ink-box px-2 h-7 inline-flex items-center text-[12px] font-bold text-[var(--mana)]">
              Mana {s.mana}
            </span>
          )}
          <span className="font-fell italic text-[14px] text-[#5c4d3d] ml-auto tabular-nums">
            Mana {Number(mana) || 0}/{Number(maxMana) || 0}
          </span>
        </div>

        {s.detail && (
          <p className="font-fell italic text-[15px] leading-snug text-[#24180f]">{s.detail}</p>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {s.attack?.range && (
            <div>
              <span className={`${LABEL} block`}>Range</span>
              <p className={VALUE}>{s.attack.range}</p>
            </div>
          )}
          {damage && (
            <div>
              <span className={`${LABEL} block`}>Damage</span>
              <p className={VALUE}>{damage}</p>
            </div>
          )}
          {(s.attack?.attackStat || s.skill?.check) && (
            <div>
              <span className={`${LABEL} block`}>Check</span>
              <p className={VALUE}>
                {[
                  s.attack?.attackStat
                    ? `${s.attack.attackStat}${s.attack.attackStatMod ? ` ${s.attack.attackStatMod}` : ""}`
                    : null,
                  s.skill?.check,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}
        </div>

        {notice && (
          <p className="whitespace-pre-line font-fell font-bold text-[15px] leading-snug text-[#8b0000]">
            {notice}
          </p>
        )}

        <div className="space-y-2 pt-1">
          <button type="button" className={BTN} onClick={handleCast} disabled={castDone}>
            <Wand2 size={15} /> {castDone ? "CAST ✓" : "CAST"}
          </button>
          {castDone && damage && (
            <button type="button" className={BTN} onClick={() => onRoll?.(s)}>
              <Dices size={15} /> ROLL {damage}
            </button>
          )}
        </div>
      </div>
    </ParchmentDialog>
  );
}