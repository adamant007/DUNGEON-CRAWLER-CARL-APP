import React, { useState } from "react";
import { PIGMENT_PRESETS, normalizeHex } from "@/components/character/pigments";

/* Pigments of Poor Decisions — pick the sheet's ACCENT color plus the
   sheet APPEARANCE (Dungeon dark / Tome light). A pigment only re-inks
   the accents (thick panel borders, dividers, headings, value-box
   edges) — parchment, gold trim, artwork, and resources stay
   untouched. Every selection applies to the sheet LIVE (the flyout
   never blocks the sheet) and persists with the character through the
   normal autosave. Default Brown restores the original gold/bronze
   accents. */
export default function PigmentsDialog({
  value,
  customHex = "",
  appearance = "dungeon",
  onSelect,
  onAppearance,
}) {
  const [draft, setDraft] = useState(customHex || "#4b3c2c");
  const applyCustom = (raw) => {
    setDraft(raw);
    const hex = normalizeHex(raw);
    if (hex) onSelect?.("custom", hex);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* SHEET APPEARANCE — Dungeon (Dark) is the original sheet and the
          default; Tome (Light) re-faces the panels in aged ivory. Both
          preview live and save with the character. */}
      <div className="ink-border-thin p-2 flex flex-wrap items-center gap-2">
        <span className="field-label text-[9px] shrink-0">SHEET APPEARANCE</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={appearance !== "tome"}
            onClick={() => onAppearance?.("dungeon")}
            className={`ink-box px-2 h-6 text-[9px] font-fell-sc tracking-[0.04em] whitespace-nowrap ${
              appearance !== "tome" ? "bg-[rgba(74,55,39,0.18)]" : ""
            }`}
          >
            {appearance !== "tome" ? "●" : "○"} Dungeon (Dark)
          </button>
          <button
            type="button"
            aria-pressed={appearance === "tome"}
            onClick={() => onAppearance?.("tome")}
            className={`ink-box px-2 h-6 text-[9px] font-fell-sc tracking-[0.04em] whitespace-nowrap ${
              appearance === "tome" ? "bg-[rgba(74,55,39,0.18)]" : ""
            }`}
          >
            {appearance === "tome" ? "●" : "○"} Tome (Light)
          </button>
        </div>
      </div>
      <p className="font-fell italic text-[11px] text-[#5c4d3d] leading-snug">
        Pick a hand-applied accent — panel borders, dividers, and headings take the color. Parchment, gold trim, artwork, and resources stay untouched.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PIGMENT_PRESETS.map((p) => {
          const selected = value === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelect?.(p.key)}
              aria-pressed={selected}
              className={`flex flex-col gap-1 p-1.5 border transition-colors ${
                selected
                  ? "border-[#2f2620] bg-[rgba(74,55,39,0.18)]"
                  : "border-[#a8957c] bg-[rgba(255,248,220,0.25)] hover:bg-[rgba(74,55,39,0.1)]"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-7 w-full border border-[rgba(47,38,32,0.4)]"
                style={{
                  /* the pigment itself — the accent the sheet will carry */
                  backgroundColor: p.hex,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -3px 6px rgba(0,0,0,0.3)",
                }}
              />
              <span className="font-fell text-[11px] text-[#2f2620] leading-tight">{p.label}</span>
            </button>
          );
        })}
      </div>
      <div className="ink-border-thin p-2 flex items-center gap-2">
        <input
          type="color"
          value={normalizeHex(draft) ?? "#4b3c2c"}
          onChange={(e) => applyCustom(e.target.value)}
          aria-label="Custom pigment color"
          className="h-8 w-10 shrink-0 cursor-pointer border border-[#5c4d3d] bg-transparent p-0.5"
        />
        <span className="field-label text-[9px] shrink-0">CUSTOM PIGMENT</span>
        <input
          type="text"
          value={draft}
          onChange={(e) => applyCustom(e.target.value)}
          placeholder="#rrggbb"
          aria-label="Custom pigment hex"
          className="ink-input font-garamond text-[13px] uppercase"
          spellCheck={false}
        />
      </div>
      <p className="font-fell italic text-[10px] text-[#8a775c] leading-snug">
        Default Brown restores the original accents. Every change previews live behind this window and saves with this character.
      </p>
    </div>
  );
}