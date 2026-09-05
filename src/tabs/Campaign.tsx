import { useState } from 'react';
import type { Campaign } from '../lib/types';
import { Card, Field } from '../components/ui';
import { clamp, uid } from '../lib/character';

export default function CampaignTab({
  campaign,
  setCampaign,
}: {
  campaign: Campaign;
  setCampaign: (patch: Partial<Campaign>) => void;
}) {
  const [session, setSession] = useState({ title: '', notes: '' });
  const [objective, setObjective] = useState('');
  const [npc, setNpc] = useState({ name: '', role: '', notes: '' });

  const addSession = () => {
    if (!session.title.trim()) return;
    setCampaign({
      sessions: [{ id: uid(), title: session.title.trim(), notes: session.notes.trim(), date: new Date().toLocaleDateString() }, ...campaign.sessions],
    });
    setSession({ title: '', notes: '' });
  };
  const addObjective = () => {
    if (!objective.trim()) return;
    setCampaign({ objectives: [...campaign.objectives, { id: uid(), text: objective.trim(), done: false }] });
    setObjective('');
  };
  const addNpc = () => {
    if (!npc.name.trim()) return;
    setCampaign({ npcs: [...campaign.npcs, { id: uid(), name: npc.name.trim(), role: npc.role.trim(), notes: npc.notes.trim() }] });
    setNpc({ name: '', role: '', notes: '' });
  };

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Campaign</h2>
          <p>Track the crawl: floors, objectives, NPCs, and session logs.</p>
        </div>
      </section>

      <Card title="Overview">
        <div className="formgrid">
          <Field label="Campaign Name" value={campaign.name} onChange={(v) => setCampaign({ name: v })} />
          <Field label="Setting / Season" value={campaign.setting} onChange={(v) => setCampaign({ setting: v })} />
          <Field label="Current Floor" type="number" value={campaign.currentFloor} onChange={(v) => setCampaign({ currentFloor: clamp(Number(v) || 1, 1, 100) })} />
        </div>
        <label className="field">
          <span>Campaign Notes</span>
          <textarea value={campaign.notes} onChange={(e) => setCampaign({ notes: e.target.value })} placeholder="Season lore, running threads, house rules…" />
        </label>
      </Card>

      <Card title="Objectives">
        <div className="formline">
          <input
            value={objective}
            placeholder="New objective"
            onChange={(e) => setObjective(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addObjective();
            }}
          />
          <button onClick={addObjective}>Add</button>
        </div>
        {campaign.objectives.length === 0 ? (
          <p className="muted">No objectives yet.</p>
        ) : (
          <div className="objlist">
            {campaign.objectives.map((o) => (
              <label className="obj" key={o.id}>
                <input
                  type="checkbox"
                  checked={o.done}
                  onChange={() => setCampaign({ objectives: campaign.objectives.map((x) => (x.id === o.id ? { ...x, done: !x.done } : x)) })}
                />
                <span className={o.done ? 'done' : ''}>{o.text}</span>
                <button onClick={() => setCampaign({ objectives: campaign.objectives.filter((x) => x.id !== o.id) })}>×</button>
              </label>
            ))}
          </div>
        )}
      </Card>

      <Card title="NPCs">
        <div className="formgrid">
          <Field label="Name" value={npc.name} onChange={(v) => setNpc({ ...npc, name: v })} />
          <Field label="Role" value={npc.role} onChange={(v) => setNpc({ ...npc, role: v })} />
          <Field label="Notes" value={npc.notes} onChange={(v) => setNpc({ ...npc, notes: v })} />
        </div>
        <div className="buttonrow">
          <button onClick={addNpc}>+ Add NPC</button>
        </div>
        {campaign.npcs.length > 0 && (
          <div className="table">
            {campaign.npcs.map((n) => (
              <div className="row npcrow" key={n.id}>
                <b>{n.name}</b>
                <span>{n.role || '—'}</span>
                <span>{n.notes || '—'}</span>
                <button onClick={() => setCampaign({ npcs: campaign.npcs.filter((x) => x.id !== n.id) })}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Session Log">
        <div className="formgrid">
          <Field label="Session Title" value={session.title} onChange={(v) => setSession({ ...session, title: v })} />
          <Field label="Notes" value={session.notes} onChange={(v) => setSession({ ...session, notes: v })} />
        </div>
        <div className="buttonrow">
          <button onClick={addSession}>+ Log Session</button>
        </div>
        {campaign.sessions.length === 0 ? (
          <p className="muted">No sessions logged yet.</p>
        ) : (
          <div className="log sessions">
            {campaign.sessions.map((s) => (
              <div className="sessionentry" key={s.id}>
                <div className="sessionhead">
                  <b>{s.title}</b>
                  <small>{s.date}</small>
                  <button onClick={() => setCampaign({ sessions: campaign.sessions.filter((x) => x.id !== s.id) })}>×</button>
                </div>
                {s.notes && <p>{s.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
