import type { Character, Campaign } from './types';
import { skillNames, statNames } from './data';

export function clamp(n: number, min: number, max: number) {
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
}
export function modFor(v: number) {
  return Math.floor((v - 10) / 2);
}
export function modText(v: number) {
  const m = modFor(v);
  return m >= 0 ? `+${m}` : `${m}`;
}

export function uid() {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const blankSkills = () => skillNames.map((name) => ({ name, rank: 0, trained: false, notes: '' }));
export const blankAttacks = () => [1, 2, 3].map((i) => ({ name: `Attack ${i}`, dice: '1d6', modifier: 0 }));

export const defaultCharacter: Character = {
  name: '',
  pronouns: '',
  crawlerNumber: '',
  level: 1,
  floor: 3,
  race: 'Human',
  className: 'Boring Ol’ Fighter',
  stats: { Strength: 10, Intelligence: 10, Constitution: 10, Dexterity: 10, Charisma: 10 },
  health: 10,
  maxHealth: 10,
  mana: 0,
  maxMana: 0,
  popularity: 0,
  aiFavor: 0,
  skills: blankSkills(),
  attacks: blankAttacks(),
  inventory: Array.from({ length: 14 }, () => ({ item: '', qty: 1, notes: '' })),
  gear: { Head: '', Torso: '', Arms: '', Hands: '', Legs: '', Feet: '', Accessories: '' },
  notes: '',
  conditions: [],
};

export function normalizeCharacter(raw: Partial<Character> | null): Character {
  const r = raw || {};
  const stats = { ...defaultCharacter.stats, ...(r.stats || {}) };
  return {
    ...defaultCharacter,
    ...r,
    stats,
    skills: Array.isArray(r.skills)
      ? r.skills.map((s: any, i: number) => ({ ...blankSkills()[i % skillNames.length], ...s }))
      : blankSkills(),
    attacks: Array.isArray(r.attacks) ? r.attacks.map((a: any, i: number) => ({ ...blankAttacks()[i % 3], ...a })) : blankAttacks(),
    inventory: Array.isArray(r.inventory)
      ? r.inventory.map((x: any) => ({ item: '', qty: 1, notes: '', ...x }))
      : defaultCharacter.inventory.map((x) => ({ ...x })),
    gear: { ...defaultCharacter.gear, ...(r.gear || {}) },
    conditions: Array.isArray(r.conditions) ? r.conditions : [],
  };
}

export const defaultCampaign: Campaign = {
  name: '',
  setting: '',
  currentFloor: 3,
  notes: '',
  sessions: [],
  objectives: [],
  npcs: [],
};

export function normalizeCampaign(raw: Partial<Campaign> | null): Campaign {
  const r = raw || {};
  return {
    ...defaultCampaign,
    ...r,
    sessions: Array.isArray(r.sessions) ? r.sessions : [],
    objectives: Array.isArray(r.objectives) ? r.objectives : [],
    npcs: Array.isArray(r.npcs) ? r.npcs : [],
  };
}

const _stat = statNames; // keep import used for potential future validation
void _stat;
