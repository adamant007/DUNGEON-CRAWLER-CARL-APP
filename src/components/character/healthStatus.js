/* Dynamic health-status text — PRESENTATION ONLY. Derives the standing
   phrase live from the character's CURRENT HP as a percentage of MAX HP
   (never from health-bar segment counts). Pure function: no state, no
   persistence, no effect on HP mechanics, conditions, or rules. The same
   helper feeds every visible health-status label so they can never
   disagree. */
export function healthStatusText(hp, maxHp) {
  const cur = Number(hp) || 0;
  if (cur <= 0) return "DEFINITELY NOT STANDING";
  const max = Number(maxHp) || 0;
  const pct = max > 0 ? (cur / max) * 100 : 100;
  if (pct <= 20) return "BARELY STANDING";
  if (pct <= 50) return "KINDA STANDING";
  return "STILL STANDING";
}