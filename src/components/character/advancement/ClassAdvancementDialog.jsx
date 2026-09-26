import React from "react";
import ParchmentDialog from "@/components/character/ParchmentDialog";
import {
  characterActorClassOptions,
  characterActorRank,
  classBenefitBullets,
  rollCharacterActorBenefits,
} from "./classAdvancement";

const BTN =
  "ink-box px-3 py-2 font-fell-sc text-[13px] font-bold tracking-[0.04em] text-[#24180f] disabled:opacity-50";
const CARD =
  "w-full border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3 text-left transition-colors hover:bg-[rgba(74,55,39,0.14)]";

const sourceLabel = (entry) => (entry?.source === "user_supplied" ? "Homebrew" : "Core");

function BenefitList({ entry }) {
  const bullets = classBenefitBullets(entry);
  return (
    <ul className="mt-2 space-y-1 pl-5 font-fell text-[13px] text-[#24180f]">
      {bullets.map((b, i) => <li key={i} className="list-disc">{b.text}</li>)}
    </ul>
  );
}

function ClassCard({ entry, selected, onClick }) {
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
            {(entry.class_types ?? []).join(" / ") || entry.class_type || "Class"}
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

function ThirdFloorPicker({ catalog, sheet, onConfirm, onClose }) {
  const [source, setSource] = React.useState("homebrew");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState("");
  const raceEarthBased = sheet?.rulesetData?.advancement?.thirdFloor?.raceEarthBased !== false;
  const entries = React.useMemo(
    () => Object.values(catalog ?? {})
      .filter((entry) => raceEarthBased || entry?.earth_class !== true)
      .sort((a, b) => String(a.name).localeCompare(String(b.name))),
    [catalog, raceEarthBased]
  );
  const visible = entries.filter((entry) => {
    const sourceOk =
      source === "all" ||
      (source === "homebrew" && entry.source === "user_supplied") ||
      (source === "core" && entry.source !== "user_supplied");
    const q = search.trim().toLowerCase();
    return sourceOk && (!q || String(entry.name).toLowerCase().includes(q));
  });
  const selected = entries.find((entry) => entry.id === selectedId) ?? null;

  return (
    <ParchmentDialog title="Floor 3 — Choose Class" large onClose={onClose}>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <p className="font-fell text-[14px] text-[#24180f]">
          Choose your permanent Third-Floor Class. Homebrew classes are available alongside the Core catalog.
          Earth-only Classes are automatically hidden for Alien Races. Confirming applies its stat, Skill, Spell,
          defense, and special-effect changes to this character.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {[
            ["homebrew", "Homebrew"],
            ["core", "Core"],
            ["all", "All"],
          ].map(([key, label]) => (
            <button key={key} type="button" className={BTN} onClick={() => setSource(key)} aria-pressed={source === key}>
              {label}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes…"
            className="ink-box min-w-[180px] flex-1 px-2 py-2 font-fell text-[13px]"
          />
        </div>

        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[0.9fr_1.1fr]">
          <div className="scrollbar-thin min-h-0 overflow-y-auto pr-1">
            <div className="space-y-2">
              {visible.map((entry) => (
                <ClassCard
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
                  {(selected.class_types ?? []).join(" / ") || selected.class_type || "Class"} · {sourceLabel(selected)}
                </p>
                {selected.description ? (
                  <p className="mt-2 font-fell text-[12px] leading-relaxed text-[#24180f]">{selected.description}</p>
                ) : null}
                <BenefitList entry={selected} />
                {selected.id === "former_child_actor" ? (
                  <div className="mt-3 border border-[var(--ink-soft)] p-2 font-fell text-[11px] text-[#24180f]">
                    Character Actor begins at Rank 3. At the start of each floor, Ginger Dragon will offer the temporary class choice for that floor.
                  </div>
                ) : null}
              </>
            ) : (
              <p className="font-fell italic text-[13px] text-[var(--ink-soft)]">Select a class to review it.</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2">
          <button type="button" className={BTN} onClick={onClose}>Not Yet</button>
          <button type="button" className={BTN} disabled={!selected} onClick={() => selected && onConfirm(selected.id)}>
            Confirm Class
          </button>
        </div>
      </div>
    </ParchmentDialog>
  );
}

function CharacterActorPicker({ catalog, sheet, floor, seed, onConfirm }) {
  const rank = characterActorRank(sheet, floor);
  const choices = React.useMemo(
    () => characterActorClassOptions(catalog, floor, seed, rank),
    [catalog, floor, seed, rank]
  );
  const [selectedId, setSelectedId] = React.useState("");
  const [rolls, setRolls] = React.useState(null);
  const selected = choices.find((entry) => entry.id === selectedId) ?? null;

  const pick = (id) => {
    if (rolls) return;
    setSelectedId(id);
  };

  const roll = () => {
    if (!selected || rolls) return;
    setRolls(rollCharacterActorBenefits(selected));
  };

  return (
    <ParchmentDialog title={`Former Child Actor — Floor ${floor}`} large dismissible={false}>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="border border-[var(--ink-soft)] bg-[rgba(255,248,220,0.18)] p-3">
          <p className="font-display text-[16px] font-bold text-[#24180f]">Character Actor — Rank {rank}</p>
          <p className="mt-1 font-fell text-[12px] text-[#24180f]">
            {rank >= 15
              ? "Rank 15: choose any available Class for this floor."
              : "Choose one of the three Classes offered for this floor."}
            {" "}After choosing, each listed benefit rolls 1d2. A 2 grants that benefit for this floor.
          </p>
          {rank >= 10 ? (
            <p className="mt-1 font-fell text-[11px] italic text-[var(--ink-soft)]">
              Rank 10+: Skill Ranks earned during the floor can persist after the temporary starting ranks are removed.
            </p>
          ) : null}
        </div>

        {!rolls ? (
          <div className="grid min-h-0 flex-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {choices.map((entry) => (
              <ClassCard
                key={entry.id}
                entry={entry}
                selected={selectedId === entry.id}
                onClick={() => pick(entry.id)}
              />
            ))}
          </div>
        ) : (
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto border border-[var(--ink-soft)] p-3">
            <p className="font-display text-[17px] font-bold text-[#24180f]">{selected?.name}</p>
            <p className="mb-2 font-fell text-[11px] italic text-[var(--ink-soft)]">Floor {floor} temporary benefits</p>
            <div className="space-y-1.5">
              {rolls.map((r) => (
                <div key={r.index} className="grid grid-cols-[44px_1fr_70px] items-start gap-2 border-b border-[var(--rule)] py-1.5">
                  <span className="font-display text-[13px] font-bold text-[#24180f]">d2: {r.roll}</span>
                  <span className="font-fell text-[12px] text-[#24180f]">{r.text}</span>
                  <span className={`font-fell-sc text-[10px] font-bold ${r.granted ? "text-[#315a2d]" : "text-[var(--hp)]"}`}>
                    {r.granted ? "GRANTED" : "MISSED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex shrink-0 justify-end gap-2">
          {!rolls ? (
            <button type="button" className={BTN} disabled={!selected} onClick={roll}>
              Choose & Roll Benefits
            </button>
          ) : (
            <button type="button" className={BTN} onClick={() => onConfirm(selected.id, rolls)}>
              Apply Floor {floor} Class
            </button>
          )}
        </div>
      </div>
    </ParchmentDialog>
  );
}

export default function ClassAdvancementDialog(props) {
  if (props.mode === "characterActor") return <CharacterActorPicker {...props} />;
  return <ThirdFloorPicker {...props} />;
}
