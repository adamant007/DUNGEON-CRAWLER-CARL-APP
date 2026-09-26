import React from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import { raceBenefitBullets } from "./classAdvancement";

const BTN =
  "ink-box px-3 py-2 font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f] disabled:opacity-50";
const CARD =
  "w-full border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3 text-left transition-colors hover:bg-[rgba(74,55,39,0.14)]";

const sourceLabel = (entry) => (entry?.source === "user_supplied" ? "Homebrew" : "Core");

function RaceCard({ entry, selected, onClick }) {
  return (
    <button
      type="button"
      className={`${CARD} ${selected ? "outline outline-2 outline-[#6b472a]" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-[15px] font-bold text-[#24180f]">{entry.name}</p>
          <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
            {entry.race_type || (entry.earth_race ? "Earth Race" : "Alien Race")}
            {entry.size?.label ? ` · ${entry.size.label}` : ""}
          </p>
        </div>
        <span className="font-fell-sc text-[9px] tracking-[0.08em] text-[var(--ink-soft)]">
          {sourceLabel(entry)}
        </span>
      </div>
      {entry.prerequisites?.length ? (
        <p className="mt-1 font-fell text-[10px] text-[var(--hp)]">
          Prerequisite: {entry.prerequisites.join(" · ")}
        </p>
      ) : null}
    </button>
  );
}

export default function RaceAdvancementDialog({ catalog, onConfirm, onClose }) {
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState("");

  const entries = React.useMemo(
    () => Object.values(catalog ?? {}).sort((a, b) => String(a.name).localeCompare(String(b.name))),
    [catalog]
  );
  const visible = entries.filter((entry) => {
    const sourceOk =
      filter === "all" ||
      (filter === "homebrew" && entry.source === "user_supplied") ||
      (filter === "core" && entry.source !== "user_supplied") ||
      (filter === "earth" && entry.earth_race === true) ||
      (filter === "alien" && entry.earth_race === false);
    const q = search.trim().toLowerCase();
    return sourceOk && (!q || String(entry.name).toLowerCase().includes(q));
  });
  const selected = entries.find((entry) => entry.id === selectedId) ?? null;
  const benefits = selected ? raceBenefitBullets(selected) : [];

  return (
    <ParchmentDialog title="Floor 3 — Choose Race" large onClose={onClose}>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <p className="font-fell text-[14px] text-[#24180f]">
          These are the Third-Floor Races this crawler currently qualifies for. Confirming applies
          its Stats, Skills, Rank caps, Size, Move, senses, defenses, and stored special rules to
          this same character. Class selection opens immediately afterward.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {[
            ["homebrew", "Homebrew"],
            ["core", "Core"],
            ["earth", "Earth"],
            ["alien", "Alien"],
            ["all", "All"],
          ].map(([key, label]) => (
            <button key={key} type="button" className={BTN} onClick={() => setFilter(key)} aria-pressed={filter === key}>
              {label}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search races…"
            className="ink-box min-w-[180px] flex-1 px-2 py-2 font-fell text-[13px]"
          />
        </div>

        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[0.9fr_1.1fr]">
          <div className="scrollbar-thin min-h-0 overflow-y-auto pr-1">
            <div className="space-y-2">
              {!visible.length ? (
                <p className="font-fell italic text-[12px] text-[var(--ink-soft)]">No qualifying Races match this filter.</p>
              ) : null}
              {visible.map((entry) => (
                <RaceCard
                  key={entry.id}
                  entry={entry}
                  selected={selectedId === entry.id}
                  onClick={() => setSelectedId(entry.id)}
                />
              ))}
            </div>
          </div>

          <div className="scrollbar-thin min-h-0 overflow-y-auto border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.14)] p-3">
            {selected ? (
              <>
                <p className="font-display text-[18px] font-bold text-[#24180f]">{selected.name}</p>
                <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
                  {selected.race_type} · {sourceLabel(selected)}
                  {selected.size?.label ? ` · Size ${selected.size.label}${selected.size.value == null ? "" : ` (${selected.size.value})`}` : ""}
                </p>
                {selected.description ? (
                  <p className="mt-2 font-fell text-[12px] leading-relaxed text-[#24180f]">{selected.description}</p>
                ) : null}
                <ul className="mt-2 space-y-1 pl-5 font-fell text-[13px] text-[#24180f]">
                  {benefits.map((b, i) => <li key={i} className="list-disc">{b.text}</li>)}
                </ul>
                {selected.pending_choices?.length ? (
                  <div className="mt-3 border border-[var(--ink-soft)] p-2">
                    <p className="font-fell-sc text-[10px] font-bold tracking-[0.06em] text-[#24180f]">PLAYER CHOICES STILL REQUIRED</p>
                    {selected.pending_choices.map((choice, i) => (
                      <p key={i} className="mt-1 font-fell text-[11px] text-[#24180f]">• {choice}</p>
                    ))}
                  </div>
                ) : null}
                {selected.earth_race === false ? (
                  <p className="mt-3 font-fell text-[11px] italic text-[var(--hp)]">
                    Alien Races do not qualify for Earth-only Classes.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="font-fell italic text-[13px] text-[var(--ink-soft)]">Select a race to review it.</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2">
          <button type="button" className={BTN} onClick={onClose}>Not Yet</button>
          <button type="button" className={BTN} disabled={!selected} onClick={() => selected && onConfirm(selected.id)}>
            Confirm Race
          </button>
        </div>
      </div>
    </ParchmentDialog>
  );
}
