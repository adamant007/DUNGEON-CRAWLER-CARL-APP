import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HomeBackdrop from "@/components/home/HomeBackdrop";
import ReturningHome from "@/components/home/ReturningHome";

/* RETURNING DASHBOARD (/dashboard) — the logged-in home for accounts
   with characters: Continue Playing, Your Characters, campaigns, tools. */
export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Resolve auth + imported-character claim before loading the character list.
        // Doing these in parallel could render an empty dashboard on the first
        // successful OAuth login while the legacy claim was still committing.
        const user = await base44.auth.me().catch(() => null);
        const rows = user
          ? await base44.entities.Character.list("-updated_date", 20).catch(() => [])
          : [];
        if (!alive) return;
        setMe(user);
        setCharacters(rows ?? []);
        setActiveId(user?.active_character_id ?? "");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const activeCharacter = characters.find((c) => c.id === activeId) ?? null;

  /* Continuing a character makes it the remembered active character, then
     opens the EXISTING character sheet. */
  const continueCharacter = async (character) => {
    if (!character) return;
    await base44.auth.updateMe({ active_character_id: character.id }).catch(() => {});
    navigate("/character");
  };

  const createNew = () => navigate("/character?action=new");

  if (loading) {
    return (
      <div className="relative flex min-h-[100svh] items-center justify-center bg-[#0a0a0a]">
        <p className="font-fell italic text-sm text-[#8d8578]">Setting the table…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] bg-[#0a0a0a]">
      <HomeBackdrop variant="returning" />
      <ReturningHome
        me={me}
        characters={characters}
        activeCharacter={activeCharacter}
        onContinue={continueCharacter}
        onCreateNew={createNew}
      />
    </div>
  );
}