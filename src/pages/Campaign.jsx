import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

const ACTIVE_CAMPAIGN_KEY = "gds_active_campaign_id";
const panel = "rounded-xl border border-[#6d4b26]/70 bg-[#17110d]/95 p-4 shadow-xl";
const input = "w-full rounded-md border border-[#7b5a31] bg-[#0f0c09] px-3 py-2 text-[#f2e5cb] outline-none focus:border-[#d4a055]";
const button = "rounded-md border border-[#b47a36] bg-[#2b1c10] px-4 py-2 font-fell-sc text-sm font-bold text-[#f2d49b] hover:bg-[#3a2818] disabled:opacity-50";

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_CAMPAIGN_KEY) || "");
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("Loading campaigns…");
  const [busy, setBusy] = useState(false);

  const active = useMemo(
    () => campaigns.find((c) => c.id === activeId) || campaigns[0] || null,
    [campaigns, activeId]
  );

  const load = async () => {
    try {
      const rows = await base44.campaigns.list();
      setCampaigns(rows);
      const stored = localStorage.getItem(ACTIVE_CAMPAIGN_KEY);
      const chosen = rows.find((c) => c.id === stored) || rows[0] || null;
      if (chosen) {
        setActiveId(chosen.id);
        localStorage.setItem(ACTIVE_CAMPAIGN_KEY, chosen.id);
      }
      setStatus(rows.length ? "" : "No campaigns yet. Create one or join with an invite code.");
    } catch (err) {
      setStatus(err?.message || "Could not load campaigns.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selectCampaign = (id) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_CAMPAIGN_KEY, id);
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setStatus("Creating campaign…");
    try {
      const created = await base44.campaigns.create(newName);
      setNewName("");
      await load();
      selectCampaign(created.id);
      setStatus("Campaign created.");
    } catch (err) {
      setStatus(err?.message || "Could not create campaign.");
    } finally {
      setBusy(false);
    }
  };

  const joinCampaign = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setBusy(true);
    setStatus("Joining campaign…");
    try {
      const joined = await base44.campaigns.join(joinCode);
      setJoinCode("");
      await load();
      selectCampaign(joined.id);
      setStatus("Joined campaign.");
    } catch (err) {
      setStatus(err?.message || "Could not join campaign.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1120px] px-2 pb-8 text-[#f2e5cb]">
      <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#6d4b26] pb-3">
          <div>
            <p className="font-fell-sc text-xs tracking-[0.18em] text-[#d4a055]">CAMPAIGNS</p>
            <h1 className="font-display text-2xl font-bold">Your Dungeon Tables</h1>
            <p className="mt-1 max-w-2xl font-fell text-sm text-[#cbb99b]">
              Create a table as GM or join one with an invite code. Players can join before the GM starts play.
            </p>
          </div>
          {active?.role === "gm" && (
            <a href="/gm-tools" className={button}>OPEN GM TOOLS</a>
          )}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-lg border border-[#4f3922] bg-black/20 p-3">
            <label className="font-fell-sc text-xs text-[#d4a055]">Active Campaign</label>
            <select
              className={input + " mt-2"}
              value={active?.id || ""}
              onChange={(e) => selectCampaign(e.target.value)}
              disabled={!campaigns.length}
            >
              {!campaigns.length && <option value="">No campaigns</option>}
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {String(c.role || "player").toUpperCase()}
                </option>
              ))}
            </select>
            {active && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded border border-[#4f3922] p-3">
                  <div className="font-fell-sc text-[10px] text-[#a9916e]">ROLE</div>
                  <div className="font-garamond text-lg font-bold">{String(active.role || "player").toUpperCase()}</div>
                </div>
                <div className="rounded border border-[#4f3922] p-3">
                  <div className="font-fell-sc text-[10px] text-[#a9916e]">INVITE CODE</div>
                  <div className="font-mono text-lg font-bold tracking-wider">{active.invite_code || "—"}</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <form onSubmit={createCampaign} className="rounded-lg border border-[#4f3922] bg-black/20 p-3">
              <h2 className="font-display text-lg font-bold">Create a Campaign</h2>
              <input
                className={input + " mt-2"}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Campaign name"
              />
              <button className={button + " mt-2 w-full"} disabled={busy || !newName.trim()}>
                CREATE AS GM
              </button>
            </form>

            <form onSubmit={joinCampaign} className="rounded-lg border border-[#4f3922] bg-black/20 p-3">
              <h2 className="font-display text-lg font-bold">Join a Campaign</h2>
              <input
                className={input + " mt-2 uppercase"}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="ABCD-EFGH"
              />
              <button className={button + " mt-2 w-full"} disabled={busy || !joinCode.trim()}>
                JOIN CAMPAIGN
              </button>
            </form>
          </div>
        </div>
        <p aria-live="polite" className="mt-3 min-h-5 font-fell text-xs text-[#cbb99b]">{status}</p>
      </section>
    </main>
  );
}
