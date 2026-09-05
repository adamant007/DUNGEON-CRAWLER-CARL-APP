import { useState } from 'react';
import type { Character } from '../lib/types';
import { Card, Field, Metric } from '../components/ui';
import { clamp, modText } from '../lib/character';
import { races, classes, statNames } from '../lib/data';

function Scanner({ update }: { update: (patch: Partial<Character>) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [raw, setRaw] = useState('');

  const doOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const text = data.text;
      setRaw(text);
      const get = (re: RegExp) => text.match(re)?.[1]?.trim();
      const patch: Partial<Character> = {};
      const name = get(/(?:name|crawler)\s*[:#-]?\s*([^\n]+)/i);
      if (name) patch.name = name;
      const race = get(/race\s*[:#-]?\s*([^\n]+)/i);
      if (race) patch.race = race;
      const lvl = get(/level\s*[:#-]?\s*(\d+)/i);
      if (lvl) patch.level = clamp(Number(lvl), 1, 999);
      const floor = get(/floor\s*[:#-]?\s*(\d+)/i);
      if (floor) patch.floor = clamp(Number(floor), 1, 100);
      if (Object.keys(patch).length) update(patch);
      else setError('OCR finished but no recognizable fields were found. You can copy from the raw text below.');
    } catch (err) {
      console.log('[v0] OCR error:', err);
      setError('Could not scan this image. Try a clearer, higher-contrast photo.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <Card title="Character Scanner (OCR)">
      <p className="hint">Photograph an existing sheet to auto-fill name, race, level, and floor. Everything stays on your device.</p>
      <label className="upload">
        {busy ? 'Scanning…' : 'Scan Character Sheet'}
        <input type="file" accept="image/*" capture="environment" disabled={busy} onChange={doOCR} />
      </label>
      {error && <p className="error">{error}</p>}
      {raw && (
        <details>
          <summary>Raw scanned text</summary>
          <pre>{raw}</pre>
        </details>
      )}
    </Card>
  );
}

export default function CharacterTab({
  char,
  update,
}: {
  char: Character;
  update: (patch: Partial<Character>) => void;
}) {
  const setStat = (k: string, v: number) => update({ stats: { ...char.stats, [k]: clamp(v, 1, 40) } });

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Character</h2>
          <p>Identity, race, class, and core attributes.</p>
        </div>
      </section>

      <Card title="Identity">
        <div className="formgrid">
          <Field label="Name" value={char.name} onChange={(v) => update({ name: v })} />
          <Field label="Pronouns" value={char.pronouns} onChange={(v) => update({ pronouns: v })} />
          <Field label="Crawler Number" value={char.crawlerNumber} onChange={(v) => update({ crawlerNumber: v })} />
          <Field label="Level" type="number" value={char.level} onChange={(v) => update({ level: clamp(Number(v) || 1, 1, 999) })} />
          <Field label="Floor" type="number" value={char.floor} onChange={(v) => update({ floor: clamp(Number(v) || 1, 1, 100) })} />
        </div>
      </Card>

      <Card title="Race">
        <div className="choicegrid">
          {races.map((r) => (
            <button
              key={r.name}
              className={`card choice${char.race === r.name ? ' selected' : ''}`}
              onClick={() => update({ race: r.name })}
            >
              <b>{r.name}</b>
              <span>{r.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Class">
        <div className="choicegrid">
          {classes.map((c) => (
            <button
              key={c.name}
              className={`card choice${char.className === c.name ? ' selected' : ''}`}
              onClick={() => update({ className: c.name })}
            >
              <b>{c.name}</b>
              <small>{c.type}</small>
              <span>{c.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Attributes">
        <div className="statgrid">
          {statNames.map((s) => (
            <div className="stat" key={s}>
              <span>{s}</span>
              <b>
                {char.stats[s]} <small>({modText(char.stats[s])})</small>
              </b>
              <div className="buttonrow">
                <button onClick={() => setStat(s, char.stats[s] - 1)}>-</button>
                <button onClick={() => setStat(s, char.stats[s] + 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Standing">
        <div className="grid">
          <Metric label="Popularity" value={char.popularity} />
          <Metric label="AI Favor" value={char.aiFavor} />
        </div>
        <div className="formgrid">
          <Field label="Popularity" type="number" value={char.popularity} onChange={(v) => update({ popularity: Number(v) || 0 })} />
          <Field label="AI Favor" type="number" value={char.aiFavor} onChange={(v) => update({ aiFavor: Number(v) || 0 })} />
        </div>
      </Card>

      <Scanner update={update} />

      <Card title="Notes">
        <textarea value={char.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Backstory, goals, reminders…" />
      </Card>
    </>
  );
}
