import React from "react";
import { NavLink } from "react-router-dom";
import { Image } from "@/components/ui/image";

/* Approved final navbar artwork — used as-is, never recolored. All visible
   artwork (toolbar, shields, tartan band) renders uncropped at full width;
   only the baked-in pure-black padding beneath the tartan band is excluded.
   The GINGER DRAGON / RPG COMPANION / FERRO IGNIQUE center branding is baked
   directly into this image: decorative only, never a hit target. */
const NAV_ART =
  "https://media.base44.com/images/public/6aa08093485633062c57e946/2215acebc_Ginger_Dragon_FINAL_Toolbar.png";
const ART_WIDTH = 2172;
const ART_HEIGHT = 724;
/* Measured visible content of the artwork (pixel scan of the source):
   rows 72-561 hold the entire toolbar — dragon, flames, plaque and
   bottom border. Every row outside that range (0-71 above, 562-723
   below) is pure black baked into the file. Wix fill-crops CENTER the
   window on the focal point (clamped to the image bounds), and the URL
   builder limits fp to 2 decimals — so a 494-row window with fp_y=0.44
   centers on source row 318.6, giving window rows ~71.6-565.6: every
   artwork row is inside (plaque and bottom border fully visible), the
   file is unchanged, the art keeps its usual scale, and the sliver of
   black left at the window's bottom edge blends into the page
   background. Verified against the transform server. */
const ART_WINDOW_HEIGHT = 494; // window rows ~71.6-565.6 contain all art
const ART_CROP_FOCUS_Y = 0.44;

/* Shield bounds are percentages of the CROPPED artwork box (source rows
   ~71.6-565.6). The block Image and its zero-padding positioning wrapper
   have identical rendered bounds; the focal-anchored fill crop adds no
   letterboxing. x is a shield CENTER, so translateX(-50%) centers the hit
   area on it. The boar/wolf ornaments and center dragon remain
   decorative. */
/* Tuned bounds over the full 724px source: top 34%, height 35%, i.e.
   source rows 246-499. Rescaled to the 494-row window starting at source
   row 71.6: (246-71.6)/494=35.3%, 253.4/494=51.3%. */
const HIT_TOP = 35.3; // % of image height — shield crest
const HIT_HEIGHT = 51.3; // % of image height — through shield tip and label

const DESTINATIONS = [
  { to: "/character", label: "Character", x: 10 },
  { to: "/spells", label: "Spells", x: 16 },
  { to: "/gear", label: "Gear", x: 22 },
  { to: "/campaign", label: "Campaign", x: 28.1 },
  { to: "/party", label: "Party", x: 34.2 },
  { to: "/gm-tools", label: "GM Tools", x: 65.6 },
  { to: "/leaderboard", label: "Leaderboard", x: 71.7 },
  { to: "/notes", label: "Notes", x: 78 },
  { to: "/dungeon-ai", label: "Dungeon AI", x: 84 },
  { to: "/settings", label: "Settings", x: 90 },
];
const HIT_WIDTH = 5.6; // % of image width per shield, matches the painted shields

/* Phone: identical shield centers and percentage anchoring, but a taller
   touch span for fingertips. Hit-area width stays at HIT_WIDTH — shields
   are ~6.1% apart center-to-center, so adjacent hit areas never overlap
   at any viewport and a thumb can't spill onto a neighboring shield. */
const PHONE_HIT_TOP = 30; // % of image height — just above the shield crest
const PHONE_HIT_HEIGHT = 66; // % of image height — through the shield tip and label
const PHONE_HIT_WIDTH = HIT_WIDTH;

function ShieldHit({ to, label, x, phone = false }) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      style={{
        left: `${x}%`,
        transform: "translateX(-50%)",
        top: `${phone ? PHONE_HIT_TOP : HIT_TOP}%`,
        width: `${phone ? PHONE_HIT_WIDTH : HIT_WIDTH}%`,
        height: `${phone ? PHONE_HIT_HEIGHT : HIT_HEIGHT}%`,
      }}
      className={({ isActive }) =>
        `absolute rounded nav-hit focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold-bright)] ${
          isActive ? "nav-hit-active" : ""
        }`
      }
    />
  );
}

export default function GlobalNav({ className = "" }) {
  return (
    <nav aria-label="Crawler Companion primary navigation" className={`w-full ${className}`}>
      {/* Desktop / tablet: approved artwork, aspect ratio locked, one hit area per shield */}
      <div className="hidden md:block relative select-none w-full">
        <Image
          src={NAV_ART}
          alt="The Ginger Dragon RPG Companion"
          fittingType="fill"
          originWidth={ART_WIDTH}
          originHeight={ART_HEIGHT}
          aspectRatio={`${ART_WIDTH} / ${ART_WINDOW_HEIGHT}`}
          focalPointX={0.5}
          focalPointY={ART_CROP_FOCUS_Y}
          className="block w-full pointer-events-none"
          draggable={false}
        />
        {DESTINATIONS.map((d) => (
          <ShieldHit key={d.to} {...d} />
        ))}
      </div>

      {/* Phone: the ten shields are tappable ON the artwork itself (same
          percentage anchoring as desktop, taller touch span), and the text
          navigation grid stays beneath it. */}
      <div className="md:hidden">
        <div className="relative select-none w-full">
          <Image
            src={NAV_ART}
            alt="The Ginger Dragon RPG Companion"
            fittingType="fill"
            originWidth={ART_WIDTH}
            originHeight={ART_HEIGHT}
            aspectRatio={`${ART_WIDTH} / ${ART_WINDOW_HEIGHT}`}
            focalPointX={0.5}
            focalPointY={ART_CROP_FOCUS_Y}
            className="block w-full pointer-events-none select-none"
            draggable={false}
          />
          {DESTINATIONS.map((d) => (
            <ShieldHit key={d.to} {...d} phone />
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-5 gap-1 rounded-md border border-[#4a3a26]/70 bg-[#221a13]/90 p-1.5">
          {DESTINATIONS.map((d) => (
            <NavLink
              key={d.to}
              to={d.to}
              className={({ isActive }) =>
                `flex min-h-11 items-center justify-center rounded px-1 text-center font-fell-sc text-[9px] tracking-[0.06em] ${
                  isActive
                    ? "bg-[#3a2c1b] text-[var(--gold-bright)] shadow-[inset_0_0_0_1px_rgba(212,160,85,0.6)]"
                    : "text-[#e8d8b5] opacity-80"
                }`
              }
            >
              {d.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}