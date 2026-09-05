import { useState } from 'react';
import { Card } from '../components/ui';

export default function Party({ party, setParty }: { party: string[]; setParty: (p: string[]) => void }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setParty([...party, v]);
    setDraft('');
  };

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Party</h2>
          <p>Everyone crawling alongside you (and their pets).</p>
        </div>
        <span className="pill">{party.length} members</span>
      </section>

      <Card title="Add Member">
        <div className="formline">
          <input
            value={draft}
            placeholder="Name — race / class / role"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) add();
            }}
          />
          <button onClick={add}>Add</button>
        </div>
      </Card>

      <Card title="Roster">
        {party.length === 0 ? (
          <p className="muted">No party members yet. Add your first crawler above.</p>
        ) : (
          <div className="party">
            {party.map((m, i) => (
              <div className="attack" key={i}>
                <span>{m}</span>
                <button onClick={() => setParty(party.filter((_, idx) => idx !== i))}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
