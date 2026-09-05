import type { Character } from '../lib/types';
import { Card, Field } from '../components/ui';

export default function Equipment({
  char,
  update,
}: {
  char: Character;
  update: (patch: Partial<Character>) => void;
}) {
  const slots = Object.keys(char.gear);
  const equipped = slots.filter((s) => char.gear[s].trim()).length;

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Equipment</h2>
          <p>What you are wearing and wielding right now.</p>
        </div>
        <span className="pill">
          {equipped} / {slots.length} slots
        </span>
      </section>

      <Card title="Worn Gear">
        <div className="formgrid">
          {slots.map((slot) => (
            <Field
              key={slot}
              label={slot}
              value={char.gear[slot]}
              placeholder="Empty"
              onChange={(v) => update({ gear: { ...char.gear, [slot]: v } })}
            />
          ))}
        </div>
        <div className="buttonrow">
          <button onClick={() => update({ gear: Object.fromEntries(slots.map((s) => [s, ''])) })}>Unequip All</button>
        </div>
      </Card>
    </>
  );
}
