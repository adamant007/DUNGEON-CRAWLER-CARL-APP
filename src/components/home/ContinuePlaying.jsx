import React from "react";
import { ChevronRight } from "lucide-react";
import { Image } from "@/components/ui/image";

/* CONTINUE PLAYING — reproduced from the approved mockup: the active
   character's portrait, name, level/race/class line, and campaign name,
   with the OPEN CHARACTER SHEET button. Opens the EXISTING sheet. */
export default function ContinuePlaying({ character, onContinue }) {
  const d = character?.details ?? {};
  const statLine = [
    d.level ? `Level ${d.level}` : "",
    d.race || "",
    d.class || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="flex items-center gap-4 rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-4 backdrop-blur-sm sm:p-5">
      {character?.portrait_url ? (
        <Image
          src={character.portrait_url}
          alt=""
          fittingType="fill"
          className="shrink-0 rounded-md border border-[#3c352a]"
          style={{ width: 84, height: 84 }}
        />
      ) : (
        <span className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-md border border-[#3c352a] bg-[rgba(255,255,255,0.04)] font-display text-3xl font-bold text-[#d4a055]">
          {(character?.name || "?").trim().charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-display text-[10px] font-bold tracking-[0.22em] text-[#d4a055]">CONTINUE PLAYING</p>
        <p className="mt-1 truncate font-display text-lg font-bold text-white sm:text-xl">
          {character?.name || "Your Character"}
        </p>
        {statLine && <p className="mt-0.5 truncate text-[11px] text-[#a0a0a0]">{statLine}</p>}
        <p className="mt-0.5 truncate text-[11px] text-[#a0a0a0]">The Tower of Wonky Magic</p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-2.5 flex items-center gap-1.5 font-display text-[11px] font-bold tracking-[0.08em] text-[#d4a055] transition-colors hover:text-[var(--gold-bright)]"
        >
          OPEN CHARACTER SHEET
          <ChevronRight size={13} />
        </button>
      </div>
    </section>
  );
}