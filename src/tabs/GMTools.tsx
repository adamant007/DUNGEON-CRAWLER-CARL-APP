import { useState } from 'react';
import type { Character } from '../lib/types';
import { Card, Field } from '../components/ui';
import { clamp } from '../lib/character';

const pools: Record<string, string[]> = {
  Weapon: ['Blade', 'Warhammer', 'Spear', 'Bow', 'Wand', 'Pistol', 'Axe', 'Whip'],
  Armor: ['Helmet', 'Chestpiece', 'Boots', 'Gloves', 'Cloak', 'Shield', 'Armor Patch'],
  Consumable: ['Potion', 'Ration', 'Candy', 'Injection', 'Scroll', 'Bomb', 'Stimulant'],
  'Crafting Material': ['Crystal', 'Metal Ingots', 'Monster Hide', 'Bone Bundle', 'Arcane Dust', 'Rare Fiber'],
  Utility: ['Grappling Tool', 'Lantern', 'Scanner', 'Rope', 'Lock Kit', 'Portable Shelter', 'Tool Kit'],
  Valuable: ['Gem', 'Coin Cache', 'Collector Token', 'Jewelry', 'Artifact Fragment', 'Luxury Item'],
  'Weird / System': ['Impossible Gadget', 'Talking Trinket', 'Suspicious Button', 'Glowing Cube', 'Sentient Object', 'System Coupon'],
  'Quest Item': ['Sealed Key', 'Ancient Map', 'Marked Relic', 'Dungeon Badge', 'Mystery Package', 'Boss Trophy'],
};
const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const adjectives = ['Glowing', 'Jagged', 'Whispering', 'Clockwork', 'Cursed', 'Polished', 'Impossible', 'Suspicious', 'Frostbitten', 'Overengineered'];
const effects = [
  'with a strange secondary function',
  'that reacts to nearby monsters',
  'that carries an odd System warning',
  'with a useful but inconvenient quirk',
  'that seems worth more than it looks',
  'with a hidden compartment',
  'that changes slightly each time it is used',
];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function GMTools({ char }: { char: Character }) {
  const [loot, setLoot] = useState<string[]>([]);
  const [kind, setKind] = useState('Random');
  const [rarity, setRarity] = useState('Random');
  const [count, setCount] = useState(5);
  const [floor, setFloor] = useState(char.floor);
  const [seed, setSeed] = useState('');

  const generate = () => {
    const keys = Object.keys(pools);
    const kinds = kind === 'Random' ? keys : [kind];
    const out = Array.from({ length: clamp(count, 1, 20) }, () => {
      const k = pick(kinds);
      const r = rarity === 'Random' ? pick(rarities) : rarity;
      const noun = pick(pools[k]);
      return `${r} ${pick(adjectives)} ${noun} — ${k}, Floor ${floor}${seed ? ` [${seed}]` : ''}; ${pick(effects)}.`;
    });
    setLoot(out);
  };

  return (
    <>
      <section className="section-head">
        <div>
          <h2>GM Command Center</h2>
          <p>Generators and table tools for whoever is running the dungeon.</p>
        </div>
      </section>

      <Card title="Dungeon Loot Generator">
        <div className="formgrid">
          <Field label="Floor" type="number" value={floor} onChange={(v) => setFloor(clamp(Number(v) || 1, 1, 100))} />
          <label className="field">
            <span>Loot Kind</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option>Random</option>
              {Object.keys(pools).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Rarity</span>
            <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
              <option>Random</option>
              {rarities.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <Field label="Number of Results" type="number" value={count} onChange={(v) => setCount(clamp(Number(v) || 1, 1, 20))} />
          <Field label="Theme / Seed" value={seed} onChange={setSeed} />
        </div>
        <div className="buttonrow">
          <button className="roll" onClick={generate}>Generate Loot</button>
          {loot.length > 0 && <button onClick={generate}>Reroll</button>}
        </div>
        {loot.length > 0 && (
          <div className="lootlist">
            {loot.map((x, i) => (
              <div className="loot" key={i}>
                <b>{i + 1}.</b> {x}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="More GM Tools">
        <div className="featurelist">
          <span>Encounter Builder — planned</span>
          <span>Mob &amp; Boss Generator — planned</span>
          <span>NPC Generator — planned</span>
          <span>Quest Hook Table — planned</span>
        </div>
      </Card>
    </>
  );
}
