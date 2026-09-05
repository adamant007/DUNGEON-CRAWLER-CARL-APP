import type { Character } from '../lib/types';
import { Card, Field, Metric } from '../components/ui';
import { clamp } from '../lib/character';
import { skillNames } from '../lib/data';

export default function Progression({
  char,
  update,
}: {
  char: Character;
  update: (patch: Partial<Character>) => void;
}) {
  const levelUp = () =>
    update({
      level: clamp(char.level + 1, 1, 999),
      maxHealth: char.maxHealth + 5,
      health: char.maxHealth + 5,
      maxMana: char.maxMana + 2,
    });

  const setSkill = (i: number, patch: Partial<Character['skills'][number]>) => {
    const skills = char.skills.slice();
    skills[i] = { ...skills[i], ...patch };
    update({ skills });
  };

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Progression</h2>
          <p>Level up, tune resources, and track skill ranks.</p>
        </div>
      </section>

      <Card title="Level" actions={<button className="roll" onClick={levelUp}>Level Up</button>}>
        <div className="grid">
          <Metric label="Level" value={char.level} />
          <Metric label="Max Health" value={char.maxHealth} />
          <Metric label="Max Mana" value={char.maxMana} />
          <Metric label="Floor" value={char.floor} />
        </div>
        <div className="levelup formgrid">
          <Field label="Max Health" type="number" value={char.maxHealth} onChange={(v) => update({ maxHealth: clamp(Number(v) || 1, 1, 9999) })} />
          <Field label="Max Mana" type="number" value={char.maxMana} onChange={(v) => update({ maxMana: clamp(Number(v) || 0, 0, 9999) })} />
        </div>
      </Card>

      <Card title="Skills">
        <div className="table">
          <div className="row skillrow">
            <b>Skill</b>
            <b>Rank</b>
            <b>Trained</b>
          </div>
          {char.skills.map((s, i) => (
            <div className="row skillrow" key={s.name + i}>
              <span>{skillNames[i] ?? s.name}</span>
              <input
                type="number"
                value={s.rank}
                onChange={(e) => setSkill(i, { rank: clamp(Number(e.target.value) || 0, 0, 99) })}
              />
              <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={s.trained} onChange={(e) => setSkill(i, { trained: e.target.checked })} />
                <span>Trained</span>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
