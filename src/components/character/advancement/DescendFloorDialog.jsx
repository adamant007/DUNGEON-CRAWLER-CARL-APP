import React from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";

const BTN =
  "ink-box px-3 py-2 font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f] disabled:opacity-50";

export default function DescendFloorDialog({ sheet, onConfirm, onClose }) {
  const floor = Math.max(1, Number(sheet?.info?.floor) || 1);
  const marked = (sheet?.rulesetData?.skills ?? []).filter(
    (skill) => skill?.advancement_mark && Number(skill?.rank || 0) >= 5
  );

  return (
    <ParchmentDialog title={`Descend to Floor ${floor + 1}`} medium onClose={onClose}>
      <div className="space-y-3">
        <p className="font-fell text-[14px] text-[#24180f]">
          Ginger Dragon will resolve the end-of-floor Skill Advancement checks below, clear those
          resolved marks, and then move this crawler from Floor {floor} to Floor {floor + 1}.
        </p>
        {marked.length ? (
          <div className="space-y-1 border border-[var(--ink-soft)] p-3">
            <p className="font-fell-sc text-[11px] font-bold tracking-[0.06em] text-[#24180f]">ROLLING ON DESCENT</p>
            {marked.map((skill) => (
              <p key={skill.id} className="font-fell text-[12px] text-[#24180f]">
                {skill.name} — Rank {skill.rank}
              </p>
            ))}
          </div>
        ) : (
          <p className="font-fell italic text-[12px] text-[var(--ink-soft)]">
            No marked Rank-5+ Skills need a floor-end Advancement Check.
          </p>
        )}
        {floor + 1 === 3 ? (
          <div className="border border-[#8a642f] bg-[rgba(138,100,47,0.08)] p-3">
            <p className="font-display text-[14px] font-bold text-[#24180f]">Third Floor milestone</p>
            <p className="mt-1 font-fell text-[12px] text-[#24180f]">
              After descending, you must distribute your accumulated Tutorial-floor Stat points.
              Then Ginger Dragon will show only Races you qualify for, followed by only compatible Classes you qualify for.
            </p>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN} onClick={onClose}>Cancel</button>
          <button type="button" className={BTN} onClick={onConfirm}>Descend</button>
        </div>
      </div>
    </ParchmentDialog>
  );
}
