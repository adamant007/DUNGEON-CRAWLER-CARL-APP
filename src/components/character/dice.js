/* Ginger Dragon shared dice engine — ONE implementation for every action
   roll on the sheet (attack checks, damage, spells). Parses standard dice
   expressions and rolls real random results at runtime. */

const DICE_RE = /^\s*(?:(\d+)\s*)?d\s*(\d+)\s*(?:([+-])\s*(\d+)\s*)?$/i;

export function parseDice(expr) {
  const m = DICE_RE.exec(String(expr ?? ""));
  if (!m) return null;
  return {
    count: Math.min(Math.max(parseInt(m[1] || "1", 10), 1), 50),
    sides: Math.min(Math.max(parseInt(m[2], 10), 2), 1000),
    mod: m[3] === "-" ? -parseInt(m[4], 10) : m[3] ? parseInt(m[4], 10) : 0,
  };
}

export function formatDice({ count, sides, mod }) {
  const base = `${count}d${sides}`;
  return mod ? `${base} ${mod > 0 ? "+" : "−"} ${Math.abs(mod)}` : base;
}

/* Roll a dice expression — "d20", "1d4+4", "2d6", "1d8 + 2"… Returns the
   expression, the individual die results, the modifier, and the total. */
export function rollDice(expr) {
  const parsed = parseDice(expr);
  if (!parsed) return null;
  const dice = Array.from({ length: parsed.count }, () => 1 + Math.floor(Math.random() * parsed.sides));
  return {
    display: formatDice(parsed),
    sides: parsed.sides,
    dice,
    mod: parsed.mod,
    total: dice.reduce((a, b) => a + b, 0) + parsed.mod,
  };
}

/* Resolve STRUCTURAL damage formulas ("1d4 + STR Mod") against the
   character's live stat modifiers ({ str: { mod: 2 }, … }) into a clean
   rollable expression ("1d4 + 2"). Stats without mod data resolve to +0. */
export function resolveStatMods(expr, stats) {
  return String(expr ?? "").replace(/\b(STR|DEX|CON|INT|CHA)\s*Mod\b/g, (m, stat) => {
    const mod = Number(stats?.[stat.toLowerCase()]?.mod) || 0;
    return mod < 0 ? `- ${Math.abs(mod)}` : `+ ${mod}`;
  });
}

/* Attack check: d20 plus the stored total bonus. */
export function rollD20(bonus) {
  const b = parseInt(String(bonus ?? "").replace(/[+\s]/g, ""), 10) || 0;
  const die = 1 + Math.floor(Math.random() * 20);
  return {
    display: formatDice({ count: 1, sides: 20, mod: b }),
    sides: 20,
    dice: [die],
    mod: b,
    total: die + b,
  };
}