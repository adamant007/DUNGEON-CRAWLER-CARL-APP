import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

const ACTIVE_CAMPAIGN_KEY = "gds_active_campaign_id";

function seenKey(campaignId, userId) {
  return `gds_campaign_seen_events_${campaignId}_${userId}`;
}

function readSeen(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSeen(key, seen) {
  try {
    localStorage.setItem(key, JSON.stringify([...seen].slice(-80)));
  } catch {}
}

function eventCopy(event) {
  const payload = event?.payload || {};
  if (event?.event_type === "gm_reward") {
    return {
      eyebrow: "GM REWARD",
      title: payload.title || "Reward received",
      detail: payload.detail || payload.message || "Your GM sent you a reward.",
      icon: "🎁",
    };
  }
  if (event?.event_type === "gm_effect") {
    return {
      eyebrow: "GM EFFECT",
      title: payload.title || payload.kind || "Effect applied",
      detail: payload.detail || payload.message || "Your crawler was updated by the GM.",
      icon: payload.kind === "damage" ? "💥" : payload.kind === "healing" ? "❤️" : "✨",
    };
  }
  return {
    eyebrow: "CAMPAIGN MESSAGE",
    title: payload.title || "GM announcement",
    detail: payload.detail || payload.message || "There is a new campaign update.",
    icon: "📣",
  };
}

export default function CampaignEventInbox() {
  const [notice, setNotice] = useState(null);
  const meRef = useRef(null);
  const pollingRef = useRef(false);

  useEffect(() => {
    let alive = true;
    let timer = null;

    const poll = async () => {
      if (!alive || pollingRef.current || notice) return;
      pollingRef.current = true;
      try {
        const campaignId = localStorage.getItem(ACTIVE_CAMPAIGN_KEY) || "";
        if (!campaignId) return;
        if (!meRef.current) {
          try {
            meRef.current = await base44.auth.me();
          } catch {
            return;
          }
        }
        const me = meRef.current;
        const key = seenKey(campaignId, me.id);
        const seen = readSeen(key);
        const rows = await base44.campaigns.events(campaignId, 30);
        const next = (rows || []).find((row) =>
          row?.id &&
          row.sender_id !== me.id &&
          !seen.has(row.id) &&
          row.id !== notice?.id &&
          ["gm_reward", "gm_effect", "gm_announcement"].includes(row.event_type)
        );
        if (!next) return;
        if (next.target_character_id) {
          window.dispatchEvent(new CustomEvent("gds:campaign-character-updated", {
            detail: { characterId: next.target_character_id, event: next },
          }));
        }
        setNotice(next);
      } catch {
        // Campaign polling is best-effort and must never interrupt play.
      } finally {
        pollingRef.current = false;
      }
    };

    void poll();
    timer = window.setInterval(poll, 6000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", poll);

    return () => {
      alive = false;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", poll);
    };
  }, [notice?.id]);

  const dismiss = () => {
    const campaignId = localStorage.getItem(ACTIVE_CAMPAIGN_KEY) || "";
    const userId = meRef.current?.id || "";
    if (notice?.id && campaignId && userId) {
      const key = seenKey(campaignId, userId);
      const seen = readSeen(key);
      seen.add(notice.id);
      saveSeen(key, seen);
    }
    setNotice(null);
  };

  if (!notice) return null;
  const copy = eventCopy(notice);

  return (
    <aside className="fixed right-3 top-20 z-[80] w-[min(92vw,390px)] rounded-xl border border-[#b47a36] bg-[#17110d]/[0.98] p-4 text-[#f2e5cb] shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="text-3xl" aria-hidden="true">{copy.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="font-fell-sc text-[10px] tracking-[0.16em] text-[#d4a055]">{copy.eyebrow}</div>
          <div className="mt-1 font-display text-lg font-bold">{copy.title}</div>
          <p className="mt-1 whitespace-pre-wrap font-fell text-sm text-[#d9c7a7]">{copy.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {notice.target_character_id && (
              <a
                href="/character"
                onClick={dismiss}
                className="rounded-md border border-[#b47a36] bg-[#2b1c10] px-3 py-2 font-fell-sc text-xs font-bold text-[#f2d49b]"
              >
                OPEN CRAWLER
              </a>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md border border-[#6d4b26] bg-black/20 px-3 py-2 font-fell-sc text-xs font-bold text-[#d9c7a7]"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
