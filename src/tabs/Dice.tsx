import { useState } from 'react';
import { Card } from '../components/ui';
import { rollDice } from '../lib/dice';

const DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export default function Dice({ history, setHistory }: { history: string[]; setHistory: (h: string[]) => void }) {
  const [expr, setExpr] = useState('1d20');
  const [last, setLast] = useState<string>('');

  const roll = (e: string) => {
    const r = rollDice(e);
    if (!r) {
      setLast(`Invalid expression: ${e}`);
      return;
    }
    const line = `${e} → [${r.rolls.join(', ')}] = ${r.total}`;
    setLast(line);
    setHistory([`${new Date().toLocaleTimeString()} — ${line}`, ...history].slice(0, 60));
  };

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Dice Roller</h2>
          <p>Standard dice plus any custom expression like 2d6+3.</p>
        </div>
      </section>

      <Card title="Quick Rolls">
        <div className="dicegrid">
          {DICE.map((d) => (
            <button key={d} className="card" onClick={() => roll(`1${d}`)}>
              {d}
            </button>
          ))}
        </div>
        <div className="formline">
          <input value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="2d6+3" aria-label="Dice expression" />
          <button onClick={() => roll(expr)}>Roll</button>
        </div>
        {last && <div className="result">{last}</div>}
      </Card>

      <Card title="Roll History" actions={history.length > 0 ? <button onClick={() => setHistory([])}>Clear</button> : undefined}>
        {history.length === 0 ? (
          <p className="muted">Your rolls will appear here.</p>
        ) : (
          <div className="log">
            {history.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
