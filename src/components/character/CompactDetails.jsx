import React, { useEffect, useState } from "react";
import CompactCell from "@/components/character/CompactCell";

/* V3 compact identity grid. Alignment is intentionally NOT displayed —
   the value stays safely in the character record. Popularity appears
   only when the character's preserved ruleset data actually carries it.
   While Edit Character is OFF every cell is read-only; while ON, Level
   and Floor use compact − / + steppers (exactly ±1, never below 1) —
   the only fields given steppers in this step. */
const DETAILS = [
  { key: "race", label: "Race" },
  { key: "class", label: "Class" },
  { key: "level", label: "Level", type: "number" },
  { key: "floor", label: "Floor", type: "number" },
  { key: "crawler", label: "Crawler #" },
  { key: "size", label: "Size" },
];

function Stepper({ label, value, onChange, min = 1 }) {
  const parsed = parseInt(value, 10);
  const current = Number.isFinite(parsed) ? Math.max(min, parsed) : min;
  return (
    <div className="min-w-0">
      <span className="field-label text-[8px] block leading-tight mb-0.5">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, current - 1))}
          disabled={current <= min}
          className="ink-box w-8 h-8 text-base font-bold shrink-0 flex items-center justify-center select-none disabled:opacity-50 disabled:pointer-events-none"
        >
          −
        </button>
        <span className="ink-box w-9 h-8 flex items-center justify-center text-[13px] font-bold tabular-nums">
          {current}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(current + 1)}
          className="ink-box w-8 h-8 text-base font-bold shrink-0 flex items-center justify-center select-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* Crawler # entry — whole numbers only, 100 to 13,000,000 (the same
   range the Dungeon Crawler Carl profile enforces at creation). An
   out-of-range draft is REJECTED: it stays visible with the message
   but is never written into the character. Existing saved values are
   never rewritten — the check runs only when the number is newly
   entered or edited. */
const CRAWLER_NUMBER_MIN = 100;
const CRAWLER_NUMBER_MAX = 13000000;

function CrawlerCell({ value, onChange }) {
  const [text, setText] = useState(String(value ?? ""));
  const [error, setError] = useState("");
  useEffect(() => setText(String(value ?? "")), [value]);
  const handleChange = (raw) => {
    const digits = raw.replace(/\D/g, ""); // whole numbers only — no decimals, no sign
    setText(digits);
    const num = parseInt(digits, 10);
    if (digits !== "" && (Number.isNaN(num) || num < CRAWLER_NUMBER_MIN || num > CRAWLER_NUMBER_MAX)) {
      setError(
        `Crawler # must be a whole number between ${CRAWLER_NUMBER_MIN.toLocaleString("en-US")} and ${CRAWLER_NUMBER_MAX.toLocaleString("en-US")}.`
      );
      return; // rejected — never written into the character
    }
    setError("");
    onChange?.(digits);
  };
  return (
    <div className="min-w-0">
      <span className="field-label text-[8px] block leading-tight mb-0.5">Crawler #</span>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="—"
        aria-label="Crawler #"
        className="ink-input py-0.5 text-[13px]"
      />
      <span className="block min-h-[1.1em] font-fell text-[10px] italic leading-tight text-[var(--hp)]">
        {error}
      </span>
    </div>
  );
}

export default function CompactDetails({ info, setInfo, defense, setDefense, rulesetData, playMode = false }) {
  const infoField = (k) => (v) => setInfo({ ...info, [k]: v });
  const popularity = rulesetData?.identity?.popularity;
  const editing = !playMode;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
      {DETAILS.map((f) =>
        editing && (f.key === "level" || f.key === "floor") ? (
          <Stepper key={f.key} label={f.label} value={info?.[f.key]} onChange={infoField(f.key)} />
        ) : editing && f.key === "crawler" ? (
          <CrawlerCell key={f.key} value={info?.crawler} onChange={infoField("crawler")} />
        ) : (
          <CompactCell
            key={f.key}
            label={f.label}
            type={f.type}
            value={info?.[f.key]}
            onChange={infoField(f.key)}
            readOnly={playMode}
          />
        )
      )}
      <CompactCell
        label="AI Favor"
        value={defense?.favor}
        onChange={(v) => setDefense({ ...defense, favor: v })}
        readOnly={playMode}
      />
      {popularity !== undefined && <CompactCell label="Popularity" value={popularity} readOnly />}
      <CompactCell
        label="Background"
        value={info?.background}
        onChange={infoField("background")}
        readOnly={playMode}
        className="col-span-2 sm:col-span-3"
      />
    </div>
  );
}