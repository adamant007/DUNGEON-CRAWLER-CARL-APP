export type Tab =
  | 'Dashboard'
  | 'Character'
  | 'Combat'
  | 'Inventory'
  | 'Equipment'
  | 'Progression'
  | 'Dice'
  | 'Party'
  | 'GM Tools'
  | 'Rulebook'
  | 'Campaign'
  | 'Account';

export type StatName = 'Strength' | 'Intelligence' | 'Constitution' | 'Dexterity' | 'Charisma';
export type StatBlock = Record<StatName, number>;

export type Skill = { name: string; rank: number; trained: boolean; notes: string };
export type Attack = { name: string; dice: string; modifier: number };
export type InventoryItem = { item: string; qty: number; notes: string };

export type Character = {
  name: string;
  pronouns: string;
  crawlerNumber: string;
  level: number;
  floor: number;
  race: string;
  className: string;
  stats: StatBlock;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  popularity: number;
  aiFavor: number;
  skills: Skill[];
  attacks: Attack[];
  inventory: InventoryItem[];
  gear: Record<string, string>;
  notes: string;
  conditions: string[];
};

export type SessionEntry = { id: string; title: string; notes: string; date: string };
export type Objective = { id: string; text: string; done: boolean };
export type NPC = { id: string; name: string; role: string; notes: string };

export type Campaign = {
  name: string;
  setting: string;
  currentFloor: number;
  notes: string;
  sessions: SessionEntry[];
  objectives: Objective[];
  npcs: NPC[];
};

export type CloudPayload = {
  character: Character;
  party: string[];
  campaign: Campaign;
  savedAt: string;
};

export type AuthUser = { id: string; email: string | null };
