import React from "react";

/* One compact label-over-input cell, shared by the Crawler Details and
   Equipped Gear grids. */
export default function CompactCell({ label, value, onChange, type = "text", readOnly = false, className = "" }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="field-label text-[8px] block leading-tight mb-0.5">{label}</span>
      {/* Read-only cells render as wrapping text — long values (e.g. a
          full class line) are never clipped the way an input clips them. */}
      {readOnly ? (
        <span className="ink-input block py-0.5 text-[13px] break-words">
          {value?.toString().trim() || "—"}
        </span>
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="—"
          readOnly={readOnly}
          aria-label={label}
          className="ink-input py-0.5 text-[13px]"
        />
      )}
    </label>
  );
}