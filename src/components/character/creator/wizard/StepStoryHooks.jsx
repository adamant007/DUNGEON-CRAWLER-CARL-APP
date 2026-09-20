import React from "react";

/* Story Hooks — Past Trauma, Loose End, and Regret. These are required
   character-creation details and are saved into ruleset_data.storyHooks,
   which the existing Character Sheet already renders. NEXT remains
   browseable; Review & Create is the final validation gate. */

const Message = ({ children }) => (
  <span className="min-h-[1.25em] font-fell text-[13px] italic leading-snug text-[var(--hp)]">
    {children ?? ""}
  </span>
);

const Field = ({ label, value, onChange, error, placeholder }) => (
  <label className="flex flex-col gap-1.5 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3">
    <span className="section-title text-[12px]">{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      placeholder={placeholder}
      className="ink-box min-h-[92px] resize-y px-3 py-2 font-fell text-[14px] leading-snug text-[#24180f]"
    />
    <Message>{error}</Message>
  </label>
);

export default function StepStoryHooks({ draft, updateDraft, errors = {} }) {
  const story = draft.storyHooks ?? { pastTrauma: "", looseEnd: "", regret: "" };
  const set = (key, value) => updateDraft({ storyHooks: { ...story, [key]: value } });

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-fell text-[13px] italic leading-snug text-[var(--ink-soft)]">
        Give the GM three hooks from your crawler’s life before the dungeon. Short answers are fine.
      </p>

      <Field
        label="PAST TRAUMA"
        value={story.pastTrauma ?? ""}
        onChange={(value) => set("pastTrauma", value)}
        error={errors.pastTrauma}
        placeholder="What happened that still affects this crawler?"
      />
      <Field
        label="LOOSE END"
        value={story.looseEnd ?? ""}
        onChange={(value) => set("looseEnd", value)}
        error={errors.looseEnd}
        placeholder="What unresolved person, promise, debt, problem, or situation was left behind?"
      />
      <Field
        label="REGRET"
        value={story.regret ?? ""}
        onChange={(value) => set("regret", value)}
        error={errors.regret}
        placeholder="What does this crawler wish they had done differently?"
      />
    </div>
  );
}
