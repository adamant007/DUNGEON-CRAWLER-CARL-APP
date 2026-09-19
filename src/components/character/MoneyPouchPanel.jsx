import React from "react";
import pouchUrl from "@/assets/pouch/pouch-permanent.png";

/* Money Pouch — ONE permanent, LOCKED static artwork, displayed exactly
   as the approved base image appears: directly on the parchment with no
   shadow, glow, halo, platform, or background, and with NO customization
   — no tone, condition, scuffs, overlays, filters, medallion stamps, or
   wealth stages. It is purely a visual launcher: tapping the pouch opens
   The Vault, where the currency amounts live and save/load normally. */
export default function MoneyPouchPanel({ onOpenVault }) {
  return (
    <div className="px-1">
      <span className="mb-0.5 block font-fell italic text-[15px] leading-tight text-[var(--ink)]">
        Money Pouch
      </span>

      <button
        type="button"
        onClick={onOpenVault}
        className="group relative block w-full"
        aria-label="Money Pouch. Tap to open The Vault."
      >
        <img
          src={pouchUrl}
          alt="Money pouch"
          draggable={false}
          className="mx-auto w-[67%] select-none"
        />
      </button>

      <span className="mt-0.5 block text-center font-fell italic text-[9px] text-[var(--ink-soft)]">
        Tap the pouch to open The Vault
      </span>
    </div>
  );
}