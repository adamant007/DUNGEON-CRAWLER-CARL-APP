import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import GdsEmblem from "@/components/home/GdsEmblem";
import LibrarySection from "@/components/home/LibrarySection";

/* NEW USER HOME (v3 — single hero below the toolbar, nothing above it) —
   the GDS toolbar on top, and the full-bleed cinematic
   dragon artwork filling 100% of the remaining viewport beneath it.
   The artwork carries the headline, tagline, and CTAs itself — no live
   duplicates, no cards, nothing else. */
const HERO_URL = "https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/c00000162_c5029073-5a19-47ff-b083-5e8d67d470bb.png";

export default function NewUserHome() {
  return (
    <div className="flex min-h-[100svh] w-full flex-col">
      {/* GDS toolbar — kept exactly as-is */}
      <header className="relative z-20 shrink-0 border-b border-[#3c352a]/60 bg-[rgba(12,12,20,0.92)] backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <GdsEmblem size={36} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[13px] font-bold tracking-[0.14em] text-[#d4a055]">GDS</span>
              <span className="mt-1 font-display text-[6px] tracking-[0.2em] text-[#a0a0a0]">GINGER DRAGON STUDIOS</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[12px] tracking-[0.06em] text-[#a0a0a0] lg:flex">
            <span className="text-white underline decoration-[#c5a059] decoration-1 underline-offset-[6px]">Home</span>
            <Link to="/character?action=load" className="hover:text-white">Characters</Link>
            <Link to="/help" className="hover:text-white">Features</Link>
            <Link to="/rules" className="hover:text-white">Supported Games</Link>
            <Link to="/help" className="hover:text-white">About</Link>
            <span className="cursor-default hover:text-white">Pricing</span>
            <Link to="/help" className="hover:text-white">Support</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a0a0] transition-colors hover:text-white"
            >
              <Search size={15} />
            </button>
            <Link
              to="/login"
              className="hidden rounded-md border border-[#c5a059]/70 bg-[rgba(0,0,0,0.45)] px-4 py-1.5 font-display text-[11px] font-bold tracking-[0.08em] text-[#e8d8b5] transition-colors hover:border-[#c5a059] sm:block"
            >
              LOG IN
            </Link>
            <Link
              to="/register"
              className="hidden rounded-md border border-[#c5a059] bg-[linear-gradient(180deg,#8b0000,#4a0404)] px-4 py-1.5 font-display text-[11px] font-bold tracking-[0.08em] text-[#f0e2c8] shadow-[0_3px_10px_rgba(0,0,0,0.4)] transition-transform hover:brightness-110 sm:block"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </header>

      {/* Full-bleed dragon artwork — a DIRECT child of the page root,
          edge-to-edge beneath the toolbar: width 100%, height exactly
          the viewport minus the 4rem toolbar, cover-scaled so the art
          never stretches or distorts. No frames, cards, or canvases. */}
      <div className="relative w-full overflow-hidden" data-home-build="home-v5" style={{ height: "calc(100vh - 4rem)" }}>
        <img
          src={HERO_URL}
          alt="The Ginger Dragon perched upon its treasure hoard beneath a moonlit castle"
          draggable={false}
          className="block h-full w-full object-cover object-center"
        />
        {/* GDS TABLETOP COMPANION — LIVE text over the artwork (never
            baked into the image), so the header and library links stay
            clickable. pointer-events-none guarantees the text can never
            block anything behind it. */}
        <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center px-4 text-center" style={{ top: "22%" }}>
          <h1 className="font-display font-bold tracking-[0.1em] text-[clamp(22px,3.4vw,46px)] leading-tight text-[#e8c352] [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">
            GDS TABLETOP COMPANION
          </h1>
          <p className="mt-3 font-heading text-[clamp(13px,1.5vw,20px)] font-semibold tracking-[0.06em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]">
            Your Game. Your Rules. One Table.
          </p>
          <p className="mt-4 max-w-[580px] font-body text-[clamp(11px,1.1vw,14.5px)] leading-relaxed text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
            Powerful tools for players and Game Masters. Create characters, manage campaigns, build worlds, and bring your tabletop adventures to life.
          </p>
        </div>
      </div>

      {/* THE GDS LIBRARY — the seamless second section of the same
          homepage: the library environment artwork itself is the
          navigation, flowing directly beneath the hero. */}
      <LibrarySection />
    </div>
  );
}