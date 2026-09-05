import type { Character } from '../lib/types';
import { Card } from '../components/ui';
import { clamp } from '../lib/character';

export default function Inventory({
  char,
  update,
}: {
  char: Character;
  update: (patch: Partial<Character>) => void;
}) {
  const set = (i: number, patch: Partial<Character['inventory'][number]>) => {
    const inventory = char.inventory.slice();
    inventory[i] = { ...inventory[i], ...patch };
    update({ inventory });
  };
  const used = char.inventory.filter((x) => x.item.trim()).length;

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Inventory</h2>
          <p>Loot, consumables, and everything stuffed in your pockets.</p>
        </div>
        <span className="pill">{used} items</span>
      </section>

      <Card title="Items">
        <div className="table">
          <div className="row invrow">
            <b>Item</b>
            <b>Qty</b>
            <b>Notes</b>
          </div>
          {char.inventory.map((row, i) => (
            <div className="row invrow" key={i}>
              <input value={row.item} placeholder="Empty slot" onChange={(e) => set(i, { item: e.target.value })} />
              <input
                type="number"
                value={row.qty}
                onChange={(e) => set(i, { qty: clamp(Number(e.target.value) || 0, 0, 9999) })}
              />
              <input value={row.notes} placeholder="Notes" onChange={(e) => set(i, { notes: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="buttonrow">
          <button onClick={() => update({ inventory: [...char.inventory, { item: '', qty: 1, notes: '' }] })}>+ Add Slot</button>
          <button onClick={() => update({ inventory: char.inventory.filter((x) => x.item.trim()) })}>Clear Empty Slots</button>
        </div>
      </Card>
    </>
  );
}
