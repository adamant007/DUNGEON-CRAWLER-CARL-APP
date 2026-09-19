import React from "react";
import { Swords, Dices } from "lucide-react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

const BTN =
  "w-full h-11 flex items-center justify-center gap-2 font-fell-sc text-[16px] font-bold tracking-[0.05em] text-[#24180f] border border-[#4a3727] bg-[rgba(255,248,220,0.45)] transition-colors hover:bg-[rgba(74,55,39,0.14)] disabled:opacity-60 disabled:pointer-events-none";
const LABEL = "font-fell-sc text-[12px] tracking-[0.06em] text-[#5c4d3d]";
const VALUE = "font-garamond text-[16px] text-[#24180f]";

/* Hotbar window into an attack's existing canonical actions — the SAME
   roll handlers the Attacks panel uses (attack check: d20 + stored bonus;
   damage: the stored dice expression). No charges/uses are consumed:
   consumption only ever happens when stored Rules Profile mechanics
   specifically define it. */
export default function AttackActionCard({ attack, onAttackRoll, onDamageRoll, onClose }) {
  const a = attack ?? {};
  return (
    <ParchmentDialog title={a.name || "Attack"} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <div>
            <span className={`${LABEL} block`}>Bonus</span>
            <p className={VALUE}>{a.bonus || "—"}</p>
          </div>
          {a.damage && (
            <div>
              <span className={`${LABEL} block`}>Damage</span>
              <p className={VALUE}>{a.damage}</p>
            </div>
          )}
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