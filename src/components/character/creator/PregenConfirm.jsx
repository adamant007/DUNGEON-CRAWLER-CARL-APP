import React from "react";

/* Pregen confirmation — compact preview of the chosen First Floor pregen
   template. Create My Character copies the template into ONE new
   canonical Character record (Step 3A.4); the button locks while creating,
   and failures keep this screen open with an error and retry. */
export default function PregenConfirm({ pregen, creating = false, error = "", onCreate, onBack, onCancel }) {
  const p = pregen ?? {};
  const id = p.identity ?? {};
  const s = p.stats ?? {};
  const d = p.derived ?? {};
  const primary = (p.attacks ?? [])[0];

  return (
    <div>
      <div className="border-[1px] border-[var(--rule)] bg-[rgba(255,248,220,0.2)] p-4 text-center">
        <p className="font-display text-[20px] font-bold text-[#24180f]">{id.name}</p>
        <p className="mt-1 font-fell text-[16px] text-[var(--ink-soft)]">
          {id.race} · Level {id.level} · Floor {p.floor}
        </p>

        {/* Compact stat preview */}
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {[
            ["STR", s.str],
            ["INT", s.int],
            ["CON", s.con],
            ["DEX", s.dex],
            ["CHA", s.cha],
          ].map(([label, st]) => (
            <div key={label} className="border-[1px] border-[var(--rule)] bg-[rgba(255,248,220,0.25)] py-1.5">
              <p className="font-fell-sc text-[11px] tracking-[0.1em] text-[var(--ink-soft)]">{label}</p>
              <p className="font-display text-[16px] font-bold text-[#24180f]">{st?.mod ?? ""}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-center gap-4 font-garamond text-[16px] text-[var(--ink)]">
          <span>Health {d.health ?? ""}</span>
          <span>Mana {d.currentMana ?? ""}/{d.maxMana ?? ""}</span>
          <span>Evade {d.evade ?? ""}</span>
        </div>

        {primary && (
          <p className="mt-2 font-garamond text-[16px] text-[var(--ink)]">
            Primary Attack: {primary.name} — {primary.damage} {primary.damageType}
          </p>
        )}
      </div>

      {error && (
        <p className="mt-2 text-center font-fell text-[16px] text-[var(--hp)]">{error}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={creating}
          className="ink-box px-3.5 py-2 text-[16px] text-[#24180f] disabled:opacity-60"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={creating}
            className="ink-box px-3.5 py-2 text-[16px] text-[#24180f] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={creating || !pregen}
            className="nameplate px-3.5 py-2 font-display text-[16px] font-bold text-[#f0e2c8] disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create My Character"}
          </button>
        </div>
      </div>
    </div>
  );
}