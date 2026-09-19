import React from "react";
import { Dices, Check } from "lucide-react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

const BTN =
  "w-full h-11 flex items-center justify-center gap-2 font-fell-sc text-[16px] font-bold tracking-[0.05em] text-[#24180f] border border-[#4a3727] bg-[rgba(255,248,220,0.45)] transition-colors hover:bg-[rgba(74,55,39,0.14)] disabled:opacity-60 disabled:pointer-events-none";
const LABEL = "font-fell-sc text-[12px] tracking-[0.06em] text-[#5c4d3d]";
const VALUE = "font-garamond text-[16px] text-[#24180f]";

/* ONE reusable Skill Action Card — shared by the Skills panel and the
   Hotbar. ROLL SKILL CHECK performs the canonical d20 + Stat Mod + Rank
   roll and marks the skill's single advancement checkbox (✓) if it is
   not already marked — success or failure, and never stacking. TOGGLE
   ADVANCEMENT flips the same mark manually (a GM-called roll outside
   the app). The mark is separate data from Rank and never changes it. */
export default function SkillActionCard({ skill, marked = false, onRoll, onToggleAdv, onClose }) {
  const s = skill ?? {};
  return (
    <ParchmentDialog title={s.name || "Skill"} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {s.rank !== "" && s.rank !== undefined && s.rank !== null && (
            <span className="ink-box px-2 h-7 inline-flex items-center text-[12px] font-bold">Rank {s.rank}</span>
          )}
          {s.stat && (
            <span className="ink-box px-2 h-7 inline-flex items-center text-[12px] font-bold">
              {s.stat}{s.mod ? ` ${s.mod}` : ""}
            </span>
          )}
          <span
            className="font-fell-sc text-[12px] tracking-[0.06em] text-[#5c4d3d] ml-auto flex items-center gap-1 select-none"
            aria-label={`Advancement ${marked ? "marked" : "unmarked"}`}
          >
            ADVANCEMENT {marked ? "✓" : "☐"}
          </span>
        </div>

        {(s.check || s.stat) && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {s.stat && (
              <div>
                <span className={`${LABEL} block`}>Stat</span>
                <p className={VALUE}>{s.stat}{s.mod ? ` ${s.mod}` : ""}</p>
              </div>
            )}
            {s.check && (
              <div>
                <span className={`${LABEL} block`}>Check</span>
                <p className={VALUE}>{s.check}</p>
              </div>
            )}
          </div>
        )}

        <p className="font-fell italic text-[13px] text-[var(--ink-soft)]">
          Skill Check: d20 + Stat Modifier + Skill Rank
        </p>

        <div className="space-y-2 pt-1">
          <button type="button" className={BTN} onClick={onRoll}>
            <Dices size={15} /> ROLL SKILL CHECK
          </button>
          <button type="button" className={BTN} onClick={onToggleAdv}>
            <Check size={15} /> TOGGLE ADVANCEMENT {marked ? "✓ → ☐" : "☐ → ✓"}
          </button>
        </div>
      </div>
    </ParchmentDialog>
  );
}