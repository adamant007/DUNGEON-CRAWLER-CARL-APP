import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AuthLayout from "@/components/AuthLayout";
import { UserCheck } from "lucide-react";

const button = "rounded-md border border-[#b47a36] bg-[#2b1c10] px-4 py-2 font-fell-sc text-sm font-bold text-[#f2d49b] hover:bg-[#3a2818] disabled:opacity-50";

export default function ClaimCharacter() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const returnTo = window.location.pathname + window.location.search;
  const [state, setState] = useState("checking");
  const [message, setMessage] = useState("Checking your claim link…");
  const [characterId, setCharacterId] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) {
        setState("error");
        setMessage("This claim link is missing its token.");
        return;
      }
      try {
        await base44.auth.me();
      } catch {
        if (!alive) return;
        setState("auth");
        setMessage("Log in or create a free account to claim this crawler.");
        return;
      }
      try {
        const result = await base44.campaigns.claimGuest(token);
        const id = result?.character_id || "";
        if (id) await base44.auth.updateMe({ active_character_id: id }).catch(() => {});
        if (!alive) return;
        setCharacterId(id);
        setState("success");
        setMessage("Crawler claimed. It now belongs to your account.");
      } catch (err) {
        if (!alive) return;
        setState("error");
        setMessage(err?.message || "This claim link is invalid or has already been used.");
      }
    })();
    return () => { alive = false; };
  }, [token]);

  return (
    <AuthLayout
      icon={UserCheck}
      title="Claim Your Crawler"
      subtitle="Move a GM-created guest crawler into your own account"
    >
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-50">
        {message}
      </div>

      {state === "auth" && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a className={button + " text-center"} href={"/login?returnTo=" + encodeURIComponent(returnTo)}>LOG IN</a>
          <a className={button + " text-center"} href={"/register?returnTo=" + encodeURIComponent(returnTo)}>CREATE ACCOUNT</a>
        </div>
      )}

      {state === "success" && (
        <a
          className={button + " mt-4 block w-full text-center"}
          href={characterId ? "/character" : "/dashboard"}
        >
          OPEN MY CHARACTER
        </a>
      )}

      {state === "error" && (
        <a className={button + " mt-4 block w-full text-center"} href="/">RETURN HOME</a>
      )}
    </AuthLayout>
  );
}
