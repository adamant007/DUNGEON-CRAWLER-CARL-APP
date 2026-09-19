import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";

/* GDS Home — a persistent floating return-to-home control, fixed in the
   bottom-right corner on every page. Dark leather body with a restrained
   antique-gold ring and gold home symbol — Ginger Dragon brand language,
   no glow, minimal motion. Sits BELOW dialog layers (z-40 vs the dialogs'
   z-50) so it can never cover open dialogs, and honors mobile safe-area
   insets. Hidden on the home page itself (the user is already home). */
export default function GdsHomeButton() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      aria-label="GDS Home"
      title="GDS Home"
      className="fixed z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--gold)] bg-[#1f160d] shadow-[0_4px_14px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(212,160,85,0.28)] transition-[transform,border-color,filter] duration-150 hover:border-[var(--gold-bright)] hover:brightness-110 active:scale-90 sm:h-12 sm:w-12"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <HomeIcon size={19} className="text-[#d4a055]" aria-hidden="true" />
    </Link>
  );
}