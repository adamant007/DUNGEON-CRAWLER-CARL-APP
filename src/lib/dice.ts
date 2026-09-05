import { clamp } from './character';

export function rollDice(expr: string): { rolls: number[]; total: number } | null {
  const m = expr.trim().match(/^(\d+)d(4|6|8|10|12|20|100)([+-]\d+)?$/i);
  if (!m) return null;
  const count = clamp(Number(m[1]), 1, 100);
  const sides = Number(m[2]);
  const mod = Number(m[3] || 0);
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  return { rolls, total: rolls.reduce((a, b) => a + b, 0) + mod };
}
