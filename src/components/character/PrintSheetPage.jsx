import React from "react";
/* The printable page — built from the LIVE sheet snapshot passed in.
   Presentation only: plain black-on-white markup with thin gray borders;
   all styling (screen preview + @media print) lives in print-sheet.css.
   Sections carry break-inside: avoid so they don't split across pages
   wherever possible. */

const STATS = [
  ["str", "STR"],
  ["dex", "DEX"],
  ["con", "CON"],
  ["int", "INT"],
  ["cha", "CHA"],
];
const GEAR_SLOTS = [
  ["mainHand", "Main Hand"],
  ["offHand", "Off Hand"],
  ["head", "Head"],
  ["chest", "Chest"],
  ["hands", "Hands"],
  ["legs", "Legs"],
  ["feet", "Feet"],
  ["other", "Other"],
];

const txt = (v) => String(v ?? "").trim();
const formatCrawlerNumber = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n.toLocaleString("en-US") : "";
};
const ddMod = (score) => Math.floor(((Number(score) || 10) - 10) / 2);
const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

function Section({ title, children }) {
  return (
    <section className="ps-section">
      <h2 className="ps-h">{title}</h2>
      {children}
    </section>
  );
}

const table = (head, rows) => (
  <table className="ps-table">
    <thead>
      <tr>
        {head.map((h) => (
          <th key={h}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>{rows}</tbody>
  </table>
);

export default function PrintSheetPage({
  sheet,
  statMods,
  status,
  withPortrait,
  withInventory,
  withNotes,
  inkSaver,
}) {
  const info = sheet?.info ?? {};
  const d = sheet?.defense ?? {};
  /* DCCarl mods come from the profile's threshold table (authoritative);
     anything else falls back to the standard D&D formula. */
  const mods = {};
  for (const [key] of STATS) {
    mods[key] = txt(statMods?.[key]) || fmtMod(ddMod(sheet?.attrs?.[key]));
  }
  const abilities = (sheet?.rulesetData?.skills ?? []).filter((s) => txt(s?.name));
  const attacks = (sheet?.attacks ?? []).filter((r) => txt(r?.name));
  const spells = (sheet?.spells ?? []).filter((r) => txt(r?.name));
  const invRows = withInventory
    ? (sheet?.inventory ?? []).filter((r) => txt(r?.item))
    : null;
  const gearRows = GEAR_SLOTS.map(([k, label]) => [label, txt(sheet?.gear?.[k])]).filter(
    ([, v]) => v
  );

  const cell = (label, value) => (
    <div key={label}>
      <span className="ps-l">{label}</span>
      <br />
      <span className="ps-v">{txt(value) || "—"}</span>
    </div>
  );
  const box = (label, value) => (
    <div key={label} className="ps-box">
      <span className="ps-l">{label}</span>
      <div className="ps-v">{value}</div>
    </div>
  );

  return (
    <div className={`ps-page${inkSaver ? "" : " ps-tinted"}`}>
      <div className="ps-body">
        {/* Header — name, identity, optional portrait */}
        <section className="ps-section">
          <div className="ps-flex">
            <div style={{ minWidth: 0 }}>
              <h1 className="ps-name">{txt(sheet?.name) || "Unnamed Crawler"}</h1>
              <div className="ps-identity">
                {cell("Race", info.race)}
                {cell("Class", info.class)}
                {cell("Level", info.level)}
                {cell("Floor", info.floor)}
                {cell("Crawler #", formatCrawlerNumber(info.crawler))}
              </div>
            </div>
            {withPortrait && (
              <div className="ps-portrait">
                {sheet?.portrait ? <img src={sheet.portrait} alt="" /> : "No Portrait"}
              </div>
            )}
          </div>
        </section>

        <Section title="Vitals & Defense">
          <div className="ps-boxes">
            {box("HP", `${Number(sheet?.hp) || 0} / ${Number(sheet?.maxHp) || 0}`)}
            {box("Mana", `${Number(sheet?.mana) || 0} / ${Number(sheet?.maxMana) || 0}`)}
            {box("AI Favor", Number(sheet?.aiFavor ?? d.favor) || 0)}
            {box("Damage Resist", txt(d.resist) || "—")}
            {box("Evade", txt(d.evade) || "—")}
            {box("Move", txt(d.move) || "—")}
            {box("Step", txt(d.step) || "—")}
          </div>
        </Section>

        <Section title="Core Stats">
          <div className="ps-stats">
            {STATS.map(([key, label]) => (
              <div key={key} className="ps-box">
                <span className="ps-l">{label}</span>
                <div className="ps-v">{txt(sheet?.attrs?.[key]) || "—"}</div>
                <span className="ps-l">Mod {mods[key]}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Attacks">
          {attacks.length ? (
            table(
              ["Name", "Bonus", "Damage", "Type", "Notes"],
              attacks.map((a, i) => (
                <tr key={i}>
                  <td>{txt(a.name)}</td>
                  <td>{txt(a.bonus) || "—"}</td>
                  <td>{txt(a.damage) || "—"}</td>
                  <td>{txt(a.type) || "—"}</td>
                  <td>{txt(a.notes) || "—"}</td>
                </tr>
              ))
            )
          ) : (
            <p className="ps-none">None</p>
          )}
        </Section>

        <Section title="Abilities">
          {abilities.length ? (
            table(
              ["Name", "Mod", "Rank"],
              abilities.map((s, i) => (
                <tr key={i}>
                  <td>{txt(s.name)}</td>
                  <td>{txt(s.mod) || "—"}</td>
                  <td>{txt(s.rank) || "—"}</td>
                </tr>
              ))
            )
          ) : (
            <p className="ps-none">None</p>
          )}
        </Section>

        <Section title="Spells">
          {spells.length ? (
            table(
              ["Name", "Cost", "Type", "Notes"],
              spells.map((s, i) => (
                <tr key={i}>
                  <td>{txt(s.name)}</td>
                  <td>{txt(s.cost) || "—"}</td>
                  <td>{txt(s.type) || "—"}</td>
                  <td>{txt(s.notes) || "—"}</td>
                </tr>
              ))
            )
          ) : (
            <p className="ps-none">None</p>
          )}
        </Section>

        <Section title="Equipped Gear">
          {gearRows.length ? (
            <div className="ps-kv">
              {gearRows.map(([label, value]) => (
                <div key={label}>
                  <span className="ps-l">{label}</span>
                  <br />
                  <span className="ps-v">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="ps-none">None</p>
          )}
        </Section>

        {withInventory && (
          <Section title="Inventory">
            {invRows.length ? (
              table(
                ["Item", "Qty", "Notes"],
                invRows.map((r, i) => (
                  <tr key={i}>
                    <td>{txt(r.item)}</td>
                    <td>{txt(r.qty) || "—"}</td>
                    <td>{txt(r.notes) || "—"}</td>
                  </tr>
                ))
              )
            ) : (
              <p className="ps-none">None</p>
            )}
          </Section>
        )}

        <Section title="Buffs & Debuffs">
          {txt(status) ? (
            <p className="ps-notes">{txt(status)}</p>
          ) : (
            <p className="ps-none">None</p>
          )}
        </Section>

        {withNotes && (
          <Section title="Notes">
            {txt(sheet?.notes) ? (
              <p className="ps-notes">{sheet.notes}</p>
            ) : (
              <p className="ps-none">None</p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}