import type { Character, Tab } from '../lib/types';
import { Card, HealthBar, Metric } from '../components/ui';
import { clamp, modText } from '../lib/character';

export default function Dashboard({
  char,
  update,
  go,
}: {
  char: Character;
  update: (patch: Partial<Character>) => void;
  go: (t: Tab) => void;
}) {
  const quick: { label: string; value: string | number; tab: Tab }[] = [
    { label: 'Level', value: char.level, tab: 'Progression' },
    { label: 'Floor', value: char.floor, tab: 'Character' },
    { label: 'Health', value: `${char.health}/${char.maxHealth}`, tab: 'Combat' },
    { label: 'Mana', value: `${char.mana}/${char.maxMana}`, tab: 'Combat' },
    { label: 'Popularity', value: char.popularity, tab: 'Character' },
    { label: 'AI Favor', value: char.aiFavor, tab: 'Character' },
  ];

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Crawler Companion</div>
          <h1>{char.name || 'Unnamed Crawler'}</h1>
          <p>
            {char.race} · {char.className}
            {char.crawlerNumber ? ` · Crawler ${char.crawlerNumber}` : ''}
          </p>
        </div>
        <div className="hero-actions">
          <button onClick={() => go('Character')}>Edit Character</button>
          <button onClick={() => go('Combat')}>Enter Combat</button>
        </div>
      </section>

      <div className="quick-grid">
        {quick.map((q) => (
          <button className="card quick" key={q.label} onClick={() => go(q.tab)}>
            <span className="eyebrow">{q.label}</span>
            <b>{q.value}</b>
          </button>
        ))}
      </div>

      <div className="two">
        <Card title="Vitals">
          <HealthBar health={char.health} maxHealth={char.maxHealth} onChange={(v) => update({ health: v })} />
        </Card>
        <Card title="Attributes">
          <div className="grid">
            {Object.entries(char.stats).map(([k, v]) => (
              <Metric key={k} label={k.slice(0, 3).toUpperCase()} value={`${v} (${modText(v)})`} />
            ))}
          </div>
        </Card>
      </div>

      <Card title="Active Conditions">
        {char.conditions.length === 0 ? (
          <p className="muted">No active conditions. Add them from the Combat tab.</p>
        ) : (
          <div className="chips">
            {char.conditions.map((c) => (
              <span className="chip pill" key={c}>
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="buttonrow">
          <button onClick={() => update({ mana: clamp(char.mana + 1, 0, char.maxMana) })}>+ Mana</button>
          <button onClick={() => update({ mana: clamp(char.mana - 1, 0, char.maxMana) })}>- Mana</button>
        </div>
      </Card>
    </>
  );
}
