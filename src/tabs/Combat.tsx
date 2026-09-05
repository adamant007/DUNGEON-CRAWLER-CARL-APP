import { useState } from 'react';
import type { Character } from '../lib/types';
import { Card, HealthBar } from '../components/ui';
import { clamp } from '../lib/character';
import { rollDice } from '../lib/dice';

const CONDITIONS = ['Bleeding', 'Poisoned', 'Stunned', 'Burning', 'Frozen', 'Blessed', 'Hidden', 'Enraged'];

export default function Combat({
  char,
  update,
  log,
  setLog,
}: {
  char: Character;
  update: (patch: Partial<Character>) => void;
  log: string[];
  setLog: (l: string[]) => void;
}) {
  const [amount, setAmount] = useState(3);
  const push = (line: string) => setLog([`${new Date().toLocaleTimeString()} — ${line}`, ...log].slice(0, 60));

  const attack = (name: string, dice: string, mod: number) => {
    const r = rollDice(dice);
    if (!r) {
      push(`${name}: invalid dice "${dice}"`);
      return;
    }
    const total = r.total + mod;
    push(`${name}: ${dice}${mod ? (mod > 0 ? `+${mod}` : mod) : ''} → [${r.rolls.join(', ')}] = ${total}`);
  };

  const toggleCondition = (c: string) =>
    update({ conditions: char.conditions.includes(c) ? char.conditions.filter((x) => x !== c) : [...char.conditions, c] });

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Combat</h2>
          <p>Track health, mana, attacks, and conditions in real time.</p>
        </div>
      </section>

      <div className="two">
        <Card title="Health">
          <HealthBar health={char.health} maxHealth={char.maxHealth} onChange={(v) => update({ health: v })} />
          <div className="formline">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(clamp(Number(e.target.value) || 0, 0, 999))}
              aria-label="Amount"
            />
            <button onClick={() => update({ health: clamp(char.health - amount, 0, char.maxHealth) })}>Damage</button>
            <button onClick={() => update({ health: clamp(char.health + amount, 0, char.maxHealth) })}>Heal</button>
          </div>
        </Card>
        <Card title="Mana">
          <div className="health-label">
            <span>Mana</span>
            <b>
              {char.mana} / {char.maxMana}
            </b>
          </div>
          <div className="formline">
            <button onClick={() => update({ mana: clamp(char.mana - amount, 0, char.maxMana) })}>- Spend</button>
            <button onClick={() => update({ mana: clamp(char.mana + amount, 0, char.maxMana) })}>+ Restore</button>
            <button onClick={() => update({ mana: char.maxMana })}>Full</button>
          </div>
        </Card>
      </div>

      <Card title="Attacks">
        <div className="attack-list">
          {char.attacks.map((a, i) => (
            <div className="attack" key={i}>
              <div>
                <b>{a.name || `Attack ${i + 1}`}</b>
                <small>
                  {a.dice}
                  {a.modifier ? (a.modifier > 0 ? ` +${a.modifier}` : ` ${a.modifier}`) : ''}
                </small>
              </div>
              <button onClick={() => attack(a.name || `Attack ${i + 1}`, a.dice, a.modifier)}>Roll</button>
            </div>
          ))}
        </div>
        <div className="table">
          {char.attacks.map((a, i) => (
            <div className="row" key={i}>
              <input
                value={a.name}
                placeholder="Attack name"
                onChange={(e) => {
                  const attacks = char.attacks.slice();
                  attacks[i] = { ...a, name: e.target.value };
                  update({ attacks });
                }}
              />
              <input
                value={a.dice}
                placeholder="1d6"
                onChange={(e) => {
                  const attacks = char.attacks.slice();
                  attacks[i] = { ...a, dice: e.target.value };
                  update({ attacks });
                }}
              />
              <input
                type="number"
                value={a.modifier}
                onChange={(e) => {
                  const attacks = char.attacks.slice();
                  attacks[i] = { ...a, modifier: Number(e.target.value) || 0 };
                  update({ attacks });
                }}
              />
            </div>
          ))}
        </div>
        <div className="buttonrow">
          <button onClick={() => update({ attacks: [...char.attacks, { name: '', dice: '1d6', modifier: 0 }] })}>
            + Add Attack
          </button>
          {char.attacks.length > 1 && (
            <button onClick={() => update({ attacks: char.attacks.slice(0, -1) })}>- Remove Last</button>
          )}
        </div>
      </Card>

      <Card title="Conditions">
        <div className="chips">
          {CONDITIONS.map((c) => (
            <button key={c} className={`chip pill${char.conditions.includes(c) ? ' active' : ''}`} onClick={() => toggleCondition(c)}>
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Combat Log" actions={log.length > 0 ? <button onClick={() => setLog([])}>Clear</button> : undefined}>
        {log.length === 0 ? (
          <p className="muted">Roll an attack to start the log.</p>
        ) : (
          <div className="log">
            {log.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
