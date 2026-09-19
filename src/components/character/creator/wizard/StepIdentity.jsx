import React from "react";

/* Step 1 — IDENTITY (Dungeon Crawler Carl, Step 3B.2). Collects crawler
   name, pronouns, and crawler number into the Wizard draft. The number's
   valid range comes from the active Rules Profile's creation rules;
   RANDOMIZE draws one runtime number and writes it into the draft.
   Validation lives with the Wizard shell (validateStep) — this
   component only renders fields and the inline messages. Values are
   never invented or replaced: the draft keeps exactly what the user
   entered (the shell trims the name's outer whitespace on advance). */

const digitsOnly = (text) => (text.match(/\d/g) ?? []).join("");
const withSeparators = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* Optional gender options for the CHARACTER (never the player). Independent
   of pronouns — nothing is inferred or auto-filled either way. */
const GENDER_OPTIONS = ["Female", "Male", "Nonbinary", "Other / Custom", "Prefer not to specify"];

/* Always-present message slots keep the modal height stable when
   validation messages appear and disappear. */
const Message = ({ children }) => (
  <span className="min-h-[1.25em] font-fell text-[13px] italic leading-snug text-[var(--hp)]">
    {children ?? ""}
  </span>
);

export default function StepIdentity({ draft, updateDraft, profile, errors = {}, usedNumbers = null }) {
  const range =
    profile?.creation_flow?.basic_identity?.fields?.find((f) => f.id === "crawler_number")?.range ?? null;
  const numberText =
    draft.crawlerNumber === "" || draft.crawlerNumber == null ? "" : withSeparators(String(draft.crawlerNumber));

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="field-label text-[12px]">Crawler Name *</span>
        <input
          type="text"
          value={draft.name ?? ""}
          onChange={(e) => updateDraft({ name: e.target.value })}
          placeholder="Name your crawler"
          className="ink-box px-2 py-1.5 text-left text-[16px]"
        />
        <Message>{errors.name}</Message>
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-gender" className="field-label text-[12px]">
          Gender
        </label>
        <select
          id="wizard-gender"
          value={draft.gender?.choice ?? ""}
          onChange={(e) =>
            updateDraft({ gender: { choice: e.target.value, custom: draft.gender?.custom ?? "" } })
          }
          className="ink-box px-2 py-1.5 text-[16px]"
        >
          <option value="">Select…</option>
          {GENDER_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {draft.gender?.choice === "Other / Custom" && (
        <input
          type="text"
          value={draft.gender?.custom ?? ""}
          onChange={(e) =>
            updateDraft({ gender: { choice: draft.gender?.choice ?? "", custom: e.target.value } })
          }
          placeholder="Specify the character's gender"
          className="ink-box px-2 py-1.5 text-left text-[16px]"
        />
      )}

      <label className="flex flex-col gap-1.5">
        <span className="field-label text-[12px]">Pronouns</span>
        <input
          type="text"
          value={draft.pronouns ?? ""}
          onChange={(e) => updateDraft({ pronouns: e.target.value })}
          placeholder="she/her · he/him · they/them"
          className="ink-box px-2 py-1.5 text-left text-[16px]"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-crawler-number" className="field-label text-[12px]">
          Crawler Number *
        </label>
        <div className="flex items-stretch gap-2">
          <input
            id="wizard-crawler-number"
            type="text"
            inputMode="numeric"
            value={numberText}
            onChange={(e) => {
              const digits = digitsOnly(e.target.value);
              updateDraft({ crawlerNumber: digits === "" ? "" : parseInt(digits, 10) });
            }}
            placeholder={range ? `${withSeparators(String(range.min))} – ${withSeparators(String(range.max))}` : ""}
            className="ink-box min-w-0 flex-1 px-2 py-1.5 text-left text-[16px]"
          />
          <button
            type="button"
            onClick={() => {
              if (!range) return;
              /* One runtime draw in range — never knowingly hand back a
                 number already taken by an existing character. */
              let draw = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
              for (let tries = 0; tries < 100 && usedNumbers?.has(draw); tries++) {
                draw = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
              }
              updateDraft({ crawlerNumber: draw });
            }}
            disabled={!range}
            className="ink-box shrink-0 px-3 py-1.5 text-[16px] text-[#24180f] disabled:opacity-60 disabled:pointer-events-none"
          >
            Randomize
          </button>
        </div>
        <Message>{errors.crawlerNumber}</Message>
      </div>
    </div>
  );
}