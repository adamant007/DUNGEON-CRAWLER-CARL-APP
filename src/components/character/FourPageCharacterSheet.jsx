import React from "react";

const STAT_ROWS = [
  ["str", "Strength"],
  ["int", "Intelligence"],
  ["con", "Constitution"],
  ["dex", "Dexterity"],
  ["cha", "Charisma"],
];

const GEAR_ROWS = [
  ["head", "Head"],
  ["chest", "Torso"],
  ["hands", "Arms / Hands"],
  ["mainHand", "Main Hand / Holding"],
  ["offHand", "Off Hand / Holding"],
  ["legs", "Legs"],
  ["feet", "Feet"],
  ["other", "Accessories / Other"],
];

const box = "border border-[var(--rule)] bg-[rgba(255,248,220,0.10)]";
const label = "font-fell-sc text-[8px] tracking-[0.08em] text-[var(--ink-soft)]";
const value = "font-garamond text-[12px] font-semibold text-[var(--ink)]";

function SheetTitle({ children, action }) {
  return (
    <div className="mb-1 flex items-center gap-2 border-b-2 border-[var(--ink)] bg-[rgba(32,25,19,0.88)] px-2 py-1 text-[#f2e5cb]">
      <span className="flex-1 text-center font-display text-[10px] font-bold tracking-[0.18em]">{children}</span>
      {action}
    </div>
  );
}

function Field({ label: fieldLabel, children, className = "" }) {
  return (
    <div className={`${box} min-h-[38px] px-2 py-1 ${className}`}>
      <div className={label}>{fieldLabel}</div>
      <div className={value}>{children || "—"}</div>
    </div>
  );
}

function ResourceStrip({ current, max, setCurrent, tone = "hp" }) {
  const safeMax = Math.max(1, Number(max) || 1);
  const pct = Math.max(0, Math.min(1, (Number(current) || 0) / safeMax));
  const filled = Math.round(pct * 10);
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setCurrent?.(Math.round(((i + 1) / 10) * safeMax))}
          className={`h-7 border border-[var(--ink-soft)] ${
            i < filled
              ? tone === "hp"
                ? "bg-[var(--hp)]"
                : "bg-[var(--mana)]"
              : "bg-[rgba(255,248,220,0.08)]"
          }`}
          aria-label={`Set to ${(i + 1) * 10} percent`}
        />
      ))}
    </div>
  );
}

function Tabs({ page, setPage, onCrafting }) {
  const tabs = [
    [1, "CORE"],
    [2, "INVENTORY"],
    [3, "SKILLS"],
    [4, "HOTLIST / GEAR"],
  ];
  return (
    <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5">
      {tabs.map(([id, text]) => (
        <button
          key={id}
          type="button"
          onClick={() => setPage(id)}
          aria-current={page === id ? "page" : undefined}
          className={`rounded-sm border px-3 py-1.5 font-fell-sc text-[9px] tracking-[0.08em] ${
            page === id
              ? "border-[var(--ink)] bg-[rgba(47,38,32,0.9)] text-[#f3e6cf]"
              : "border-[var(--rule)] bg-[rgba(255,248,220,0.14)] text-[var(--ink)]"
          }`}
        >
          {id}. {text}
        </button>
      ))}
      <button
        type="button"
        onClick={onCrafting}
        className="rounded-sm border border-[var(--rule)] bg-[rgba(255,248,220,0.14)] px-3 py-1.5 font-fell-sc text-[9px] tracking-[0.08em] text-[var(--ink)]"
      >
        CRAFTING
      </button>
    </div>
  );
}

function CorePage({
  name, info, attrs, statMods, rulesetData, portrait,
  hp, maxHp, setHp, mana, maxMana, setMana, defense,
  attacks, onAttackRoll, onDamageRoll, onEditPortrait,
  editing, onAttrsChange,
}) {
  const pronouns = rulesetData?.identity?.pronouns ?? "";
  const rows = (Array.isArray(attacks) ? attacks : []).filter((r) => r?.name);
  return (
    <div className="space-y-2">
      <div className="grid gap-2 lg:grid-cols-[180px_1fr_180px]">
        <div className="space-y-1">
          {STAT_ROWS.map(([key, text]) => (
            <div key={key} className={`${box} p-2`}>
              <div className="font-display text-[10px] font-bold">{text}</div>
              <div className="mt-1 grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className={label}>Enhanced</div>
                  {editing ? (
                    <input
                      type="number"
                      value={attrs?.[key] ?? ""}
                      onChange={(e) => onAttrsChange?.({ ...attrs, [key]: Number(e.target.value) || 0 })}
                      className="w-full border border-[var(--rule)] bg-transparent text-center font-garamond text-[12px] font-semibold"
                    />
                  ) : (
                    <div className={value}>{attrs?.[key] ?? "—"}</div>
                  )}
                </div>
                <div><div className={label}>Unenhanced</div><div className={value}>{rulesetData?.stats?.[key]?.unenhanced ?? "—"}</div></div>
                <div><div className={label}>Mod</div><div className={value}>{statMods?.[key] ?? "—"}</div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            <Field label="Name">{name}</Field>
            <Field label="Race">{info?.race}</Field>
            <Field label="Class">{info?.class}</Field>
            <Field label="Level / Floor">{info?.level ?? "—"} / {info?.floor ?? "—"}</Field>
            <Field label="Crawler Number">{info?.crawler}</Field>
            <Field label="Gender / Pronouns">{pronouns}</Field>
            <Field label="Size">{info?.size}</Field>
            <Field label="AI Favor">{defense?.favor}</Field>
          </div>

          <div className={`${box} p-2`}>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-display text-[10px] font-bold">HEALTH BAR</span>
              <span className={value}>{hp} / {maxHp}</span>
            </div>
            <ResourceStrip current={hp} max={maxHp} setCurrent={setHp} tone="hp" />
          </div>

          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            <Field label="Evade">{defense?.evade}</Field>
            <Field label="Damage Resistance">{defense?.resist}</Field>
            <Field label="Move">{defense?.move}</Field>
            <Field label="Step">{defense?.step}</Field>
          </div>

          <div className={`${box} p-2`}>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-display text-[10px] font-bold">MANA</span>
              <span className={value}>{mana} / {maxMana}</span>
            </div>
            <ResourceStrip current={mana} max={maxMana} setCurrent={setMana} tone="mana" />
          </div>
        </div>

        <div className={`${box} flex min-h-[180px] flex-col items-center justify-center p-2 text-center`}>
          {portrait ? (
            <img src={portrait} alt={name ? `${name} portrait` : "Character portrait"} className="aspect-square w-full max-w-[160px] object-cover" />
          ) : (
            <div className="flex aspect-square w-full max-w-[160px] items-center justify-center border border-[var(--rule)] font-fell italic text-[10px] text-[var(--ink-faint)]">
              Portrait
            </div>
          )}
          <button type="button" onClick={onEditPortrait} className="mt-2 font-fell-sc text-[8px] underline">EDIT PORTRAIT</button>
          <div className="mt-3 w-full text-left">
            <div className={label}>External Buffs</div>
            <div className="mt-1 min-h-[68px] border-t border-[var(--rule)] pt-1 font-fell text-[10px] text-[var(--ink-soft)]">
              {rulesetData?.externalBuffs?.length ? rulesetData.externalBuffs.join(" · ") : "—"}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SheetTitle>ATTACKS</SheetTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="font-fell-sc text-[8px]">
                <th className="border border-[var(--rule)] px-2 py-1">Name</th>
                <th className="border border-[var(--rule)] px-2 py-1">To Hit</th>
                <th className="border border-[var(--rule)] px-2 py-1">Damage</th>
                <th className="border border-[var(--rule)] px-2 py-1">Type / Effects</th>
              </tr>
            </thead>
            <tbody>
              {(rows.length ? rows : [{ name: "" }]).map((row, i) => (
                <tr key={i}>
                  <td className="border border-[var(--rule)] px-2 py-2 font-garamond text-[12px]">{row.name || "—"}</td>
                  <td className="border border-[var(--rule)] px-2 py-2 text-center">
                    {row.bonus ? <button type="button" onClick={() => onAttackRoll?.(row.name, row.bonus)} className="font-garamond text-[12px] font-bold underline">{row.bonus}</button> : "—"}
                  </td>
                  <td className="border border-[var(--rule)] px-2 py-2 text-center">
                    {row.damage ? <button type="button" onClick={() => onDamageRoll?.(row.name, row.damage)} className="font-garamond text-[12px] font-bold underline">{row.damage}</button> : "—"}
                  </td>
                  <td className="border border-[var(--rule)] px-2 py-2 font-fell text-[10px]">{[row.type, row.notes].filter(Boolean).join(" · ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryPage({ inventory, onManageStorage }) {
  const rows = (Array.isArray(inventory) ? inventory : []).filter((r) => (r?.item ?? "").toString().trim());
  return (
    <div>
      <SheetTitle action={<button type="button" onClick={onManageStorage} className="font-fell-sc text-[8px] underline">MANAGE / ADD ITEMS</button>}>INVENTORY</SheetTitle>
      <div className="mb-2 grid grid-cols-3 gap-1 text-center">
        <Field label="Storage">Dimensional</Field>
        <Field label="Capacity">Unlimited</Field>
        <Field label="Stored Weight">Weightless</Field>
      </div>
      <p className="mb-2 font-fell italic text-[9px] text-[var(--ink-faint)]">
        An item can enter storage if the crawler can lift it unaided for 4 seconds.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="font-fell-sc text-[8px]">
              <th className="w-[40%] border border-[var(--rule)] px-2 py-1">Item</th>
              <th className="w-[12%] border border-[var(--rule)] px-2 py-1">Quantity</th>
              <th className="border border-[var(--rule)] px-2 py-1">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[...rows, ...Array.from({ length: Math.max(8, 16 - rows.length) }, () => ({ item: "", qty: "", notes: "" }))].map((row, i) => (
              <tr key={i}>
                <td className="h-9 border border-[var(--rule)] px-2 font-garamond text-[12px]">{row.item}</td>
                <td className="h-9 border border-[var(--rule)] px-2 text-center font-garamond text-[12px]">{row.qty}</td>
                <td className="h-9 border border-[var(--rule)] px-2 font-fell text-[10px]">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SkillsPage({ rulesetData, rankDraft, editing, onAdjustRank, onToggleAdv, onRollSkill }) {
  const skills = (Array.isArray(rulesetData?.skills) ? rulesetData.skills : []).map((s, i) =>
    rankDraft && i in rankDraft ? { ...s, rank: rankDraft[i] } : s
  );
  return (
    <div>
      <SheetTitle>SKILLS</SheetTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="font-fell-sc text-[8px]">
              <th className="border border-[var(--rule)] px-2 py-1">Name</th>
              <th className="border border-[var(--rule)] px-2 py-1">Rank</th>
              <th className="border border-[var(--rule)] px-2 py-1">Stat & Mod</th>
              <th className="border border-[var(--rule)] px-2 py-1">Check Type</th>
              <th className="border border-[var(--rule)] px-2 py-1">Notes & Upgrades</th>
              <th className="w-10 border border-[var(--rule)] px-2 py-1">✓</th>
            </tr>
          </thead>
          <tbody>
            {[...skills, ...Array.from({ length: Math.max(8, 16 - skills.length) }, () => ({ name: "" }))].map((s, i) => (
              <tr key={i}>
                <td className="h-9 border border-[var(--rule)] px-2">
                  {s.name ? <button type="button" onClick={() => onRollSkill?.(s, i)} className="font-garamond text-[12px] underline">{s.name}</button> : ""}
                </td>
                <td className="h-9 border border-[var(--rule)] px-1 text-center font-garamond text-[11px]">
                  {s.name && editing ? (
                    <span className="inline-flex items-center gap-1">
                      <button type="button" onClick={() => onAdjustRank?.(i, Math.max(0, (Number(s.rank) || 0) - 1))}>−</button>
                      <b>{s.rank}</b>
                      <button type="button" onClick={() => onAdjustRank?.(i, (Number(s.rank) || 0) + 1)}>+</button>
                    </span>
                  ) : s.rank ?? ""}
                </td>
                <td className="h-9 border border-[var(--rule)] px-2 text-center font-garamond text-[11px]">{s.name ? [s.stat, s.mod].filter(Boolean).join(" ") : ""}</td>
                <td className="h-9 border border-[var(--rule)] px-2 font-fell text-[10px]">{s.check ?? ""}</td>
                <td className="h-9 border border-[var(--rule)] px-2 font-fell text-[10px]">{s.note ?? ""}</td>
                <td className="h-9 border border-[var(--rule)] text-center">
                  {s.name && <button type="button" onClick={() => onToggleAdv?.(i)} className="h-5 w-5 border border-[var(--ink-soft)] text-[11px]">{s.advancement_mark ? "✓" : ""}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HotlistGearPage({ hotbar, gear, rulesetData, notes, onManageHotlist }) {
  const story = rulesetData?.storyHooks ?? {};
  const popularity = rulesetData?.identity?.popularity ?? "—";
  return (
    <div className="space-y-3">
      <div>
        <SheetTitle action={<button type="button" onClick={onManageHotlist} className="font-fell-sc text-[8px] underline">MANAGE</button>}>HOTLIST</SheetTitle>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`${box} min-h-[74px] p-2`}>
              <div className={label}>{i + 1}</div>
              <div className="mt-1 font-fell text-[10px] leading-snug">{hotbar?.[i] || ""}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-[1fr_280px]">
        <div>
          <SheetTitle>GEAR SLOTS / TATTOOS / PATCHES</SheetTitle>
          <div className="space-y-0">
            {GEAR_ROWS.map(([key, text]) => (
              <div key={key} className="grid grid-cols-[130px_1fr] border border-b-0 border-[var(--rule)] last:border-b">
                <div className="border-r border-[var(--rule)] px-2 py-2 font-fell-sc text-[8px]">{text}</div>
                <div className="min-h-[38px] px-2 py-2 font-garamond text-[12px]">{gear?.[key] || ""}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Field label="Popularity">{popularity}</Field>
          <Field label="Past Trauma">{story.pastTrauma}</Field>
          <Field label="Loose Ends">{story.looseEnd}</Field>
          <Field label="Regrets">{story.regret}</Field>
          <div className={`${box} min-h-[120px] px-2 py-1`}>
            <div className={label}>Notes</div>
            <div className="whitespace-pre-wrap font-fell text-[10px]">{notes || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FourPageCharacterSheet(props) {
  const { page, setPage, onCrafting } = props;
  return (
    <section className="mx-auto w-full max-w-[1040px]">
      <Tabs page={page} setPage={setPage} onCrafting={onCrafting} />
      <div className="min-h-[620px] border-2 border-[var(--ink-soft)] bg-[rgba(255,248,220,0.09)] p-2 sm:p-3">
        {page === 1 && <CorePage {...props} />}
        {page === 2 && <InventoryPage {...props} />}
        {page === 3 && <SkillsPage {...props} />}
        {page === 4 && <HotlistGearPage {...props} />}
      </div>
    </section>
  );
}
