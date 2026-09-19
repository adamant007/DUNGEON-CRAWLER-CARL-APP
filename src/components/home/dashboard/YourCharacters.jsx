import React from "react";
import { Plus } from "lucide-react";
import { Image } from "@/components/ui/image";

/* YOUR CHARACTERS — real character cards from the account, each opening
   the existing sheet, plus the Create New Character tile. */
function CharacterTile({ character, onContinue }) {
  const d = character?.details ?? {};
  const line = [d.class, d.level ? `Level ${d.level}` : ""].filter(Boolean).join(" • ");

  return (
    <button
      type="button"
      onClick={() => onContinue(character)}
      className="group flex flex-col overflow-hidden rounded-md border border-[#3c352a] bg-[rgba(10,10,10,0.65)] backdrop-blur-sm transition-colors hover:border-[var(--gold)]"
    >
      {character?.portrait_url ? (
        <Image
          src={character.portrait_url}
          alt=""
          fittingType="fill"
          className="aspect-square w-full border-b border-[#3c352a]"
        />
      ) : (
        <span className="flex aspect-square w-full items-center justify-center border-b border-[#3c352a] bg-[rgba(255,255,255,0.03)] font-display text-4xl font-bold text-[#d4a055]">
          {(character?.name || "?").trim().charAt(0).toUpperCase()}
        </span>
      )}
      <span className="flex flex-col gap-0.5 p-2.5 text-left">
        <span className="truncate font-display text-[13px] font-bold text-white group-hover:text-[#e8c87a]">
          {character?.name || "Unnamed"}
        </span>
        {line && <span className="truncate text-[10px] text-[#b0b0b0]">{line}</span>}
      </span>
    </button>
  );
}

export default function YourCharacters({ characters = [], onContinue, onCreateNew }) {
  return (
    <section className="rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-4 backdrop-blur-sm">
      <h3 className="mb-3 font-display text-[12px] font-bold tracking-[0.14em] text-[#c5a059]">
        YOUR CHARACTERS
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {characters.slice(0, 7).map((c) => (
          <CharacterTile key={c.id} character={c} onContinue={onContinue} />
        ))}
        <button
          type="button"
          onClick={onCreateNew}
          className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#4a3a26] bg-[rgba(255,255,255,0.02)] text-[#d4a055] transition-colors hover:border-[var(--gold)]"
        >
          <Plus size={22} />
          <span className="px-2 text-center font-display text-[10px] font-bold tracking-[0.12em]">
            CREATE NEW CHARACTER
          </span>
        </button>
      </div>
    </section>
  );
}