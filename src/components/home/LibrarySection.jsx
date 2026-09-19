import React from "react";
import { Link } from "react-router-dom";

/* THE GDS LIBRARY — the seamless second section of the GDS homepage,
   directly beneath the dragon hero. The approved library environment
   artwork IS the navigation: its five painted destinations are live via
   invisible hit zones anchored to their exact positions in the art
   (percentage-locked, the same proven technique as the toolbar shields)
   — no cards, no boxes, no panels, only the scene. Hovering or focusing
   a destination warms it with a soft gold candle-glow; on phones, where
   the painted zones are too small for fingertips, engraved text paths
   appear beneath the artwork instead (same pattern as the toolbar). */

const LIBRARY_URL =
  "https://media.base44.com/images/public/6aa08093485633062c57e946/f1879fcd5_8dcf2921-7553-4d61-a1e0-e07ddf19f02e.png";

/* Measured against the artwork itself (1000x1562 source): each zone runs
   from its circular gold icon through its CTA button, left edges in % of
   artwork width. CHARACTERS deep-links into the EXISTING character
   system; every other destination routes to its existing section. */
const DESTINATIONS = [
  { label: "Characters", to: "/character?action=load", x: 3.0 },
  { label: "Campaigns", to: "/campaign", x: 21.9 },
  { label: "GM Tools", to: "/gm-tools", x: 40.8 },
  { label: "Maps & Dungeons", to: "/maps", x: 59.7 },
  { label: "Rules & Systems", to: "/rules", x: 78.6 },
];
const ZONE_Y = 32.6; // % of artwork height — icon through CTA button
const ZONE_W = 18.2; // % of artwork width
const ZONE_H = 16.9; // % of artwork height

export default function LibrarySection() {
  return (
    <section aria-label="The GDS Library" className="relative w-full bg-[#0d0a08]">
      <div className="relative w-full select-none">
        <img
          src={LIBRARY_URL}
          alt="The GDS Library — a candlelit grand library of bookshelves, maps, and dice"
          draggable={false}
          className="block h-auto w-full"
        />

        {/* Integrated tagline — set in the artwork's own quiet band, just
            beneath the engraved THE GDS LIBRARY heading. */}
        <p
          className="pointer-events-none absolute inset-x-0 text-center font-fell italic tracking-[0.08em] text-[#e8d8b5] text-[clamp(12px,1.5vw,19px)] [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]"
          style={{ top: "30.4%" }}
        >
          Your adventures begin here.
        </p>

        {/* Desktop / tablet: invisible zones over the painted destinations */}
        <div className="hidden md:block">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.to}
              to={d.to}
              aria-label={`Open ${d.label}`}
              className="group absolute focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold-bright)]"
              style={{ left: `${d.x}%`, top: `${ZONE_Y}%`, width: `${ZONE_W}%`, height: `${ZONE_H}%` }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-[50%] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0.10) 45%, transparent 72%)",
                }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Phone: the five destinations as engraved gold text paths beneath
          the artwork — large, legible touch targets, still no boxes. */}
      <nav
        aria-label="Library destinations"
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-4 md:hidden"
      >
        {DESTINATIONS.map((d) => (
          <Link
            key={d.to}
            to={d.to}
            className="font-display text-[12px] font-bold tracking-[0.14em] text-[#d4af37] opacity-90 underline-offset-4 hover:opacity-100 hover:underline focus-visible:underline"
          >
            {d.label.toUpperCase()}
          </Link>
        ))}
      </nav>
    </section>
  );
}