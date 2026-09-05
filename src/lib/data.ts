import type { Tab, StatName } from './types';

export const tabs: Tab[] = [
  'Dashboard',
  'Character',
  'Combat',
  'Inventory',
  'Equipment',
  'Progression',
  'Dice',
  'Party',
  'GM Tools',
  'Rulebook',
  'Campaign',
  'Account',
];

export const statNames: StatName[] = ['Strength', 'Intelligence', 'Constitution', 'Dexterity', 'Charisma'];

export const skillNames = [
  'Acrobatics',
  'Ambush',
  'Dodge',
  'Endurance',
  'Investigation',
  'Lore',
  'Perception',
  'Persuasion',
  'Running',
  'Stealth',
  'Survival',
  'Weapon Skill',
  'Pugilism',
  'Intimidate',
];

export const races = (
  [
    ['Amazonian', 'Tall, powerful humanoids built for athletic feats and physical combat.'],
    ['Arachnid', 'Spider-like crawlers suited to climbing, ambushes, and eerie creativity.'],
    ['Cat', 'Feline crawlers known for agility, instincts, and survival.'],
    ['Cat Girl/Cat Boy', 'Humanoid felines combining social charm with feline instincts.'],
    ['Changbi Demon', 'Undead chain-wielders with supernatural resilience and menace.'],
    ['Changeling', 'Adaptive shapeshifters who use disguise and changing forms.'],
    ['Crocodilian', 'Large reptilian bruisers built for endurance and close combat.'],
    ['Doppelgänger', 'Malleable shapeshifters able to alter their physical form.'],
    ['Dwarf, Classic', 'Sturdy traditional dwarves with endurance and practical talents.'],
    ['Dwarf, Fathom', 'Deep-dungeon dwarves with engineering and earth-focused talents.'],
    ['Elf, High', 'Graceful elves with strong magical and social aptitude.'],
    ['Elf, City', 'Urban elves who thrive on social maneuvering and negotiation.'],
    ['Elf, Night', 'Darkness-adapted elves with keen senses and stealth.'],
    ['Frost Maiden', 'Fey crawlers associated with ice, strong minds, and charisma.'],
    ['Human', 'Adaptable all-rounders favored by the System.'],
    ['Igneous', 'Living molten rock built for strength, durability, and tanking.'],
    ['Lajabless', 'Day-and-night shapeshifters balancing finesse and strength.'],
    ['Obsidian Butterfly', 'Winged crawlers combining speed, intimidation, and spellcraft.'],
    ['Primal', 'A flexible blank-slate race focused on skill mastery.'],
    ['Rat Hooligan', 'Scrappy rat-kin survivors skilled at stealth and secrets.'],
    ['Sasquatch', 'Huge hairy powerhouses suited to smashing and hauling.'],
    ['Tetrakai', 'Four-armed crawlers with exceptional dexterity and flexibility.'],
    ['Tigran', 'Tiger humanoids favoring speed, stealth, and ferocious melee.'],
    ['Bune', 'Dragon-like alien crawlers known for cleverness and emerging wings.'],
    ['Caprid', 'Goat-like alien social climbers with strong presence.'],
    ['Grulke', 'Toad warriors with a mercenary streak and conquest-minded history.'],
    ['Hobgoblin', 'Large alien hooligans specializing in traps, explosives, and mayhem.'],
    ['Pocket Kuma', 'Tiny agile creatures with excellent senses and nimble movement.'],
    ['Pterolykos', 'Winged wolf-like aliens with strong scent and theatrical flair.'],
    ['Skyfowl', 'Feathered humanoids built around flight and aerial mobility.'],
  ] as [string, string][]
).map(([name, desc]) => ({ name, desc }));

const classPairs: [string, string][] = [
  ['Boring Ol’ Arcanist', 'Arcanist'],
  ['Alchemist', 'Arcanist'],
  ['Douchy Wizard School Wand-Maker', 'Arcanist'],
  ['Infernocrafter', 'Arcanist'],
  ['Prison Tattoo Artist', 'Arcanist'],
  ['Boring Ol’ Barbarian', 'Barbarian'],
  ['Gladiator', 'Barbarian / Bard'],
  ['Harii', 'Barbarian / Rogue'],
  ['Feral Cat Berserker', 'Barbarian'],
  ['Shieldmaiden', 'Barbarian / Fighter'],
  ['Boring Ol’ Bard', 'Bard'],
  ['Artist Alley Mogul', 'Bard / Merchant'],
  ['Former Child Actor', 'Bard'],
  ['NecroBard', 'Bard / Necromancer'],
  ['Poet Laureate', 'Bard'],
  ['Professional Roadie', 'Bard / Rogue'],
  ['Spellbinder', 'Bard'],
  ['Boring Ol’ Cleric', 'Cleric'],
  ['Santero', 'Cleric'],
  ['Boring Ol’ Druid', 'Druid'],
  ['Herbalist', 'Arcanist / Druid'],
  ['Lifebringer', 'Druid'],
  ['Physicker', 'Druid'],
  ['Shepherd', 'Druid'],
  ['Boring Ol’ Fighter', 'Fighter'],
  ['Pit Fighter', 'Fighter'],
  ['Shotgun Messenger', 'Fighter'],
  ['Straight-to-DVD Action Hero', 'Fighter'],
  ['Sword and Boarder', 'Fighter'],
  ['Monster Truck Driver', 'Fighter'],
  ['Zulu Warrior', 'Fighter'],
  ['Boring Ol’ Mage', 'Mage'],
  ['Blizzardmancer', 'Mage'],
  ['Crisper', 'Mage'],
  ['Fire Spiritualist', 'Bard / Mage'],
  ['Forsaken Aerialist', 'Mage'],
  ['Necromancer', 'Mage / Necromancer'],
  ['Boring Ol’ Monk', 'Monk'],
  ['Elemental Monk', 'Mage / Monk'],
  ['Prizefighter', 'Bard / Monk'],
  ['Spirit Healer', 'Druid / Monk'],
  ['Street Monk', 'Fighter / Monk'],
  ['Boring Ol’ Paladin', 'Paladin'],
  ['Cavalier', 'Fighter / Paladin'],
  ['Sacred Paladin', 'Paladin'],
  ['Boring Ol’ Rogue', 'Rogue'],
  ['Bomb Squad Tech', 'Rogue'],
  ['Compensated Anarchist', 'Monk / Rogue'],
  ['High Rise Grifter', 'Rogue'],
  ['Identity Thief', 'Rogue'],
  ['Swashbuckler', 'Bard / Fighter / Rogue'],
];

const classDescription = (n: string, t: string) => {
  const k = n.toLowerCase();
  if (k.includes('alchemist')) return 'Arcane crafter focused on potions, poisons, and infusions.';
  if (k.includes('wand-maker')) return 'Specialist crafter turning arcane power into magical tools.';
  if (k.includes('infernocrafter')) return 'Fire-focused crafter who makes dangerous things that burn.';
  if (k.includes('tattoo')) return 'Arcane artisan whose tattoo work has magical potential.';
  if (k.includes('gladiator') || k.includes('pit fighter') || k.includes('prizefighter'))
    return 'Arena-trained combatant built around toughness and spectacle.';
  if (k.includes('bard') || k.includes('poet') || k.includes('roadie') || k.includes('actor'))
    return 'Performer and storyteller who turns creativity and personality into power.';
  if (k.includes('cleric') || k === 'santero') return 'Faith-driven support specialist drawing on spiritual power.';
  if (k.includes('druid') || k.includes('herbalist') || k.includes('lifebringer') || k.includes('shepherd') || k.includes('physicker'))
    return 'Nature-focused specialist emphasizing survival, healing, and life.';
  if (k.includes('fighter') || k.includes('barbarian') || k.includes('shieldmaiden') || k.includes('cavalier') || k.includes('paladin'))
    return 'Martial specialist built for direct confrontation and durability.';
  if (
    k.includes('mage') ||
    k.includes('arcanist') ||
    k.includes('wizard') ||
    k.includes('necromancer') ||
    k.includes('spiritualist') ||
    k.includes('blizzard') ||
    k.includes('crisper')
  )
    return 'Magic-focused crawler specializing in arcane or elemental solutions.';
  if (k.includes('monk') || k.includes('street')) return 'Disciplined close-combat specialist using body, movement, and technique.';
  if (k.includes('rogue') || k.includes('grifter') || k.includes('thief') || k.includes('anarchist') || k.includes('bomb squad'))
    return 'Cunning specialist favoring stealth, tricks, mobility, and unconventional solutions.';
  return `${t} specialist built around the distinctive ${n} concept.`;
};

export const classes = classPairs.map(([name, type]) => ({ name, type, desc: classDescription(name, type) }));
