import { useCallback, useEffect, useRef, useState } from 'react';
import type { Campaign, Character, CloudPayload, Tab } from './lib/types';
import { tabs } from './lib/data';
import { defaultCampaign, defaultCharacter, normalizeCampaign, normalizeCharacter } from './lib/character';
import { loadLocal, saveCloud, saveLocal } from './lib/storage';
import { useAuth } from './context/AuthContext';

import Dashboard from './tabs/Dashboard';
import CharacterTab from './tabs/Character';
import Combat from './tabs/Combat';
import Inventory from './tabs/Inventory';
import Equipment from './tabs/Equipment';
import Progression from './tabs/Progression';
import Dice from './tabs/Dice';
import Party from './tabs/Party';
import GMTools from './tabs/GMTools';
import Rulebook from './tabs/Rulebook';
import CampaignTab from './tabs/Campaign';
import Account from './tabs/Account';

export default function App() {
  const { configured, user } = useAuth();

  const [tab, setTab] = useState<Tab>('Dashboard');
  const [char, setChar] = useState<Character>(() => normalizeCharacter(loadLocal('character', defaultCharacter)));
  const [party, setParty] = useState<string[]>(() => loadLocal<string[]>('party', []));
  const [campaign, setCampaignState] = useState<Campaign>(() => normalizeCampaign(loadLocal('campaign', defaultCampaign)));
  const [combatLog, setCombatLog] = useState<string[]>(() => loadLocal<string[]>('combatLog', []));
  const [diceHistory, setDiceHistory] = useState<string[]>(() => loadLocal<string[]>('diceHistory', []));

  // Local-first persistence: every slice mirrors to localStorage immediately.
  useEffect(() => saveLocal('character', char), [char]);
  useEffect(() => saveLocal('party', party), [party]);
  useEffect(() => saveLocal('campaign', campaign), [campaign]);
  useEffect(() => saveLocal('combatLog', combatLog), [combatLog]);
  useEffect(() => saveLocal('diceHistory', diceHistory), [diceHistory]);

  const update = useCallback((patch: Partial<Character>) => setChar((c) => ({ ...c, ...patch })), []);
  const setCampaign = useCallback((patch: Partial<Campaign>) => setCampaignState((c) => ({ ...c, ...patch })), []);

  const getPayload = useCallback(
    (): CloudPayload => ({ character: char, party, campaign, savedAt: new Date().toISOString() }),
    [char, party, campaign],
  );
  const applyPayload = useCallback((p: CloudPayload) => {
    if (p.character) setChar(normalizeCharacter(p.character));
    if (Array.isArray(p.party)) setParty(p.party);
    if (p.campaign) setCampaignState(normalizeCampaign(p.campaign));
  }, []);

  // Optional cloud autosave: only when configured AND signed in. Debounced.
  const firstSync = useRef(true);
  useEffect(() => {
    if (!configured || !user) return;
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    const t = setTimeout(() => {
      saveCloud(user.id, { character: char, party, campaign, savedAt: new Date().toISOString() }).catch((e) =>
        console.log('[v0] cloud autosave failed:', e),
      );
    }, 2000);
    return () => clearTimeout(t);
  }, [configured, user, char, party, campaign]);

  const render = () => {
    switch (tab) {
      case 'Dashboard':
        return <Dashboard char={char} update={update} go={setTab} />;
      case 'Character':
        return <CharacterTab char={char} update={update} />;
      case 'Combat':
        return <Combat char={char} update={update} log={combatLog} setLog={setCombatLog} />;
      case 'Inventory':
        return <Inventory char={char} update={update} />;
      case 'Equipment':
        return <Equipment char={char} update={update} />;
      case 'Progression':
        return <Progression char={char} update={update} />;
      case 'Dice':
        return <Dice history={diceHistory} setHistory={setDiceHistory} />;
      case 'Party':
        return <Party party={party} setParty={setParty} />;
      case 'GM Tools':
        return <GMTools char={char} />;
      case 'Rulebook':
        return <Rulebook />;
      case 'Campaign':
        return <CampaignTab campaign={campaign} setCampaign={setCampaign} />;
      case 'Account':
        return <Account getPayload={getPayload} applyPayload={applyPayload} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">CC</span>
          <div>
            <b>Crawler Companion</b>
            <small>Dungeon Crawler Carl toolkit</small>
          </div>
        </div>
        <div className="cloudflag">
          {configured ? (user ? `Synced · ${user.email ?? 'account'}` : 'Cloud ready · sign in') : 'Local-first'}
        </div>
      </header>

      <nav className="tabs" aria-label="Sections">
        {tabs.map((t) => (
          <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>

      <main className="content">{render()}</main>

      <footer className="foot">
        <span>Local-first. Cloud sync is optional and off unless configured.</span>
      </footer>
    </div>
  );
}
