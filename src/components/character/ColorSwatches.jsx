import React from "react";
import { Pipette } from "lucide-react";

/* "Original" (no hex) renders as a parchment swatch with a diagonal slash. */
const ORIGINAL_BG = "linear-gradient(135deg, #d4b98e 49%, #8a775c 51%)";
const CUSTOM_BG =
  "conic-gradient(#9b2226, #b5622b, #d8b56a, #3f6b3a, #2a5a8c, #5a3a7c, #9b2226)";

function Swatch({ hex, selected, title, onClick, style }) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      className={`h-5 w-5 shrink-0 rounded-sm border border-[rgba(47,38,32,0.55)] transition-shadow ${
        selected ? "outline outline-2 outline-[var(--gold-bright)]" : "hover:outline hover:outline-1 hover:outline-[var(--rule)]"
      }`}
      style={{ background: hex, ...style }}
    />
  );
}

/**
 * One labeled color row: palette swatches plus a Custom color picker.
 * `value` is the selected palette key ("custom" when a hex is chosen).
 */
export default function ColorSwatches({ label, palette, value, custom, onPick, onCustom }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="field-label text-[8px]">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {palette.map((c) => (
          <Swatch
            key={c.key}
            title={c.label}
            hex={c.hex || ORIGINAL_BG}
            selected={value === c.key}
            onClick={() => onPick(c.key)}
          />
        ))}
        <label
          className={`flex items-center gap-1 rounded-sm border border-[rgba(47,38,32,0.55)] px-1 py-0.5 cursor-pointer ${
            value === "custom" ? "outline outline-2 outline-[var(--gold-bright)]" : "hover:outline hover:outline-1 hover:outline-[var(--rule)]"
          }`}
          title="Custom Color"
        >
          <Swatch
            hex={value === "custom" && custom ? custom : CUSTOM_BG}
            selected={false}
            style={{ border: "none", width: 14, height: 14 }}
            onClick={() => {}}
            title="Custom Color"
          />
          <Pipette size={9} style={{ color: "var(--ink-soft)" }} />
          <input
            type="color"
            className="sr-only"
            value={custom || "#8b5a2b"}
            onChange={(e) => onCustom(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}