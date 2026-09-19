import React, { useEffect, useState } from "react";
import Die from "@/components/character/DiceVisual";

/* Compact dice result overlay for every action roll. This is a
   presentation layer on TOP of the existing shared dice engine — the
   engine's generated results are displayed exactly; the tumble frames
   are visual only. Fast (~0.65s), tap anywhere to dismiss. */
const TUMBLE_MS = 650;
const FRAME_MS = 80;

export default function RollResultCard({ result, onClose }) {
  const { action, roll } = result ?? {};
  const [settled, setSettled] = useState(false);
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    if (!roll) return;
    setSettled(false);
    setFrames(roll.dice);
    const spin = setInterval(() => {
      setFrames(roll.dice.map(() => 1 + Math.floor(Math.random() * roll.sides)));
    }, FRAME_MS);
    const stop = setTimeout(() => {
      clearInterval(spin);
      setFrames(roll.dice); // settle on the engine's exact generated results
      setSettled(true);
    }, TUMBLE_MS);
    return () => {
      clearInterval(spin);
      clearTimeout(stop);
    };
  }, [roll]);

  if (!roll) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-[60] flex justify-center"
      onClick={onClose}
      role="status"
      aria-live="polite"
    >
      <div className="parchment dialog-parchment ink-border w-full max-w-[280px] p-3 shadow-[0_18px_44px_rgba(0,0,0,0.6)]">
        <p className="section-title text-[12px]">{action}</p>
        <p className="font-fell text-[13px] text-[var(--ink)]">{roll.display}</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 my-1.5">
          {(settled ? roll.dice : frames).map((v, i) => (
            <Die key={i} sides={roll.sides} value={v} rolling={!settled} />
          ))}
        </div>
        {settled && (
          <>
            {roll.mod !== 0 && (
              <p className="font-garamond text-[15px] text-[var(--ink)]">
                {roll.mod > 0 ? `+${roll.mod}` : roll.mod}
              </p>
            )}
            <p className="mt-1 border-t ink-rule pt-1 font-display font-bold text-[16px] text-[var(--hp)]">
              TOTAL: {roll.total}
            </p>
            <p className="mt-1.5 text-center font-fell-sc text-[7px] tracking-[0.22em] text-[var(--ink-faint)] select-none">
              TAP TO DISMISS
            </p>
          </>
        )}
      </div>
    </div>
  );
}