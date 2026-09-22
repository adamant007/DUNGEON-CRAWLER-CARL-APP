import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { blankCharacter } from "@/components/character/characterStorage";

const ACTIVE_CAMPAIGN_KEY = "gds_active_campaign_id";
const panel = "rounded-xl border border-[#6d4b26]/70 bg-[#17110d]/95 p-4 shadow-xl";
const input = "w-full rounded-md border border-[#7b5a31] bg-[#0f0c09] px-3 py-2 text-[#f2e5cb] outline-none focus:border-[#d4a055]";
const button = "rounded-md border border-[#b47a36] bg-[#2b1c10] px-4 py-2 font-fell-sc text-sm font-bold text-[#f2d49b] hover:bg-[#3a2818] disabled:opacity-50";

export default function GmTools() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_CAMPAIGN_KEY) || "");
  const [characters, setCharacters] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [claimLink, setClaimLink] = useState("");
  const [status, setStatus] = useState("Loading GM tools…");
  const [busy, setBusy] = useState(false);

  const active = useMemo(
    () => campaigns.find((c) => c.id === activeId) || campaigns[0] || null,
    [campaigns, activeId]
  );

  const refreshCharacters = async (campaignId) => {
    if (!campaignId) {
      setCharacters([]);
      return;
    }
    const rows = await base44.campaigns.characters(campaignId);
    setCharacters(rows);
  };

  const load = async () => {
    try {
      const me = await base44.auth.me();
      const all = await base44.campaigns.list();
      const gmCampaigns = all.filter((c) => c.owner_id === me.id);
      setCampaigns(gmCampaigns);
      const stored = localStorage.getItem(ACTIVE_CAMPAIGN_KEY);
      const chosen = gmCampaigns.find((c) => c.id === stored) || gmCampaigns[0] || null;
      if (chosen) {
        setActiveId(chosen.id);
        localStorage.setItem(ACTIVE_CAMPAIGN_KEY, chosen.id);
        await refreshCharacters(chosen.id);
        setStatus("");
      } else {
        setStatus("You do not have a GM campaign yet. Create one from Campaign.");
      }
    } catch (err) {
      setStatus(err?.message || "Could not load GM tools.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changeCampaign = async (id) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_CAMPAIGN_KEY, id);
    setClaimLink("");
    setStatus("Loading crawlers…");
    try {
      await refreshCharacters(id);
      setStatus("");
    } catch (err) {
      setStatus(err?.message || "Could not load crawlers.");
    }
  };

  const createGuest = async (e) => {
    e.preventDefault();
    if (!active?.id || !guestName.trim()) return;
    setBusy(true);
    setStatus("Creating guest crawler…");
    try {
      const name = guestName.trim();
      const data = { ...blankCharacter(), name };
      const created = await base44.campaigns.createGuest(active.id, name, data);
      const link = window.location.origin + "/claim?token=" + encodeURIComponent(created.claim_token);
      setClaimLink(link);
      setGuestName("");
      await refreshCharacters(active.id);
      setStatus("Guest crawler created. Copy the claim link now; it is shown only to you here.");
    } catch (err) {
      setStatus(err?.message || "Could not create guest crawler.");
    } finally {
      setBusy(false);
    }
  };

  const copyClaim = async () => {
    if (!claimLink) return;
    try {
      await navigator.clipboard.writeText(claimLink);
      setStatus("Claim link copied.");
    } catch {
      setStatus("Copy failed. Press and hold the link to copy it.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1120px] px-2 pb-8 text-[#f2e5cb]">
      <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#6d4b26] pb-3">
          <div>
            <p className="font-fell-sc text-xs tracking-[0.18em] text-[#d4a055]">GM TOOLS</p>
            <h1 className="font-display text-2xl font-bold">Campaign Character Viewer</h1>
            <p className="mt-1 max-w-2xl font-fell text-sm text-[#cbb99b]">
              Create crawlers for players who do not want an account yet, run them immediately, and let players claim them later.
            </p>
          </div>
          <a className={button} href="/campaign">CAMPAIGNS</a>
        </div>

        <div className="mt-4">
          <label className="font-fell-sc text-xs text-[#d4a055]">GM Campaign</label>
          <select
            className={input + " mt-2"}
            value={active?.id || ""}
            onChange={(e) => void changeCampaign(e.target.value)}
            disabled={!campaigns.length}
          >
            {!campaigns.length && <option value="">No GM campaigns</option>}
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {active && (
            <p className="mt-2 font-fell text-xs text-[#cbb99b]">
              Invite code: <strong className="font-mono text-[#f2d49b]">{active.invite_code}</strong>
            </p>
          )}
        </div>

        {active && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.4fr]">
            <form onSubmit={createGuest} className="rounded-lg border border-[#4f3922] bg-black/20 p-3">
              <h2 className="font-display text-lg font-bold">Create Guest Crawler</h2>
              <p className="mt-1 font-fell text-xs text-[#cbb99b]">
                No player account is required. You own table management until the player claims this crawler.
              </p>
              <input
                className={input + " mt-3"}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Crawler name"
              />
              <button className={button + " mt-2 w-full"} disabled={busy || !guestName.trim()}>
                CREATE GUEST CRAWLER
              </button>

              {claimLink && (
                <div className="mt-3 rounded border border-[#8a642f] bg-[#0c0a08] p-3">
                  <div className="font-fell-sc text-[10px] text-[#d4a055]">PLAYER CLAIM LINK</div>
                  <div className="mt-1 break-all font-mono text-[11px] text-[#ead9b8]">{claimLink}</div>
                  <button type="button" onClick={copyClaim} className={button + " mt-2 w-full"}>
                    COPY CLAIM LINK
                  </button>
                </div>
              )}
            </form>

            <div className="rounded-lg border border-[#4f3922] bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">Campaign Crawlers</h2>
                <button type="button" className={button} onClick={() => void refreshCharacters(active.id)}>REFRESH</button>
              </div>
              <div className="mt-3 grid gap-2">
                {!characters.length && (
                  <p className="font-fell italic text-sm text-[#a9916e]">No crawlers assigned yet.</p>
                )}
                {characters.map((character) => (
                  <div key={character.id} className="flex flex-wrap items-center gap-3 rounded border border-[#4f3922] p-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-garamond text-lg font-bold">{character.name || "Unnamed Crawler"}</div>
                      <div className="font-fell text-xs text-[#cbb99b]">
                        {character.is_guest ? "Guest — unclaimed" : "Player-owned"}
                      </div>
                    </div>
                    <a
                      className={button}
                      href={"/character?gmCampaign=" + encodeURIComponent(active.id) + "&gmCharacter=" + encodeURIComponent(character.id)}
                    >
                      OPEN / EDIT SHEET
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <p aria-live="polite" className="mt-3 min-h-5 font-fell text-xs text-[#cbb99b]">{status}</p>
      </section>
    </main>
  );
}
