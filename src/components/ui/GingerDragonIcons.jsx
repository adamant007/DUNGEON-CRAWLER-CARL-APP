import React from "react";
import { Image } from "@/components/ui/image";
/* Gear slot artwork — bundled into the app build (src/assets/gear) so the
   icons are served from the app itself, never the cross-origin image host
   (an external-host load failure once rendered the Legs slot as an empty
   box). Same exact artwork files; nothing is redrawn or restyled. */
import gearHead from "@/assets/gear/7202dae55_GD_GEAR_HEAD_FRAME.png";
import gearChest from "@/assets/gear/691c9234f_GD_GEAR_CHEST_FRAME.png";
import gearHands from "@/assets/gear/967c3a9d0_GD_GEAR_HANDS_FRAME.png";
import gearLegs from "@/assets/gear/f29acaabf_GD_GEAR_LEGS_FRAME.png";
import gearFeet from "@/assets/gear/9d5c3368c_GD_GEAR_FEET_FRAME.png";
import gearMainHand from "@/assets/gear/b5f6f8b96_GD_GEAR_MAINHAND_FRAME.png";
import gearOffHand from "@/assets/gear/c2d015ce2_GD_GEAR_OFFHAND_FRAME.png";
import gearOther from "@/assets/gear/1acc7c228_GD_GEAR_OTHER_FRAME.png";

/* ══════════════════════════════════════════════════════════════════════
   GINGER DRAGON UI — THE canonical icon pack.

   ★ APPROVED VISUAL REFERENCE (authoritative — the final 33-icon
   contact sheet; every canonical icon below is the user's own artwork):
   https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/49bbf1f51_Ginger_Dragon_Contact_Sheet.png

   Style: high-fantasy, slightly illustrated/engraved, solid filled
   silhouettes with consistent weight, readable at ~11–28px on the dark
   charcoal sheet. Major sections antique gold/bronze; stats and gameplay
   symbols carry their controlled category colors.

   Every common Ginger Dragon UI concept is exported from THIS file under
   its canonical GD_* name. Components must import and render these exact
   names — never their own substitutes. All icons share one API:
   { size, className, tone, ...passThrough }. Presentation only — no icon
   carries data or mechanics; icons are decorative (aria-hidden, no event
   handlers). Rules Profiles decide WHAT exists; this pack decides HOW
   common concepts LOOK.
   ══════════════════════════════════════════════════════════════════════ */

/* Default tones — full literal Tailwind class strings (never composed) so
   the build keeps every one of them. Colors follow the approved pack:
   gold/bronze sections, muted stat hues, theme tokens where the bars own
   the color (HP crimson / Mana blue). */
const GOLD = "text-[#d4a055]";

/* Asset-backed canonical icon — the user's FINAL approved artwork tiles
   (framed, full-color). Same API as the drawn icons ({ size, className,
   tone, ...rest }); tone/stroke props are accepted and ignored because
   each asset owns its own color rendering. */
const gdAsset = (src) =>
  function GdAssetIcon({ size = 16, className = "", tone = "", fill, strokeWidth, ...rest }) {
    return (
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fittingType="fit"
        className={`shrink-0 ${className}`}
        style={{ width: size, height: size }}
        {...rest}
      />
    );
  };

/* Bespoke engraved Ginger Dragon SVG — the last hand-drawn icon
   (GD_MOVEMENT, no artwork asset yet). Same signature as gdAsset. */
const gdSvg = (children, defaultTone) =>
  function GdCustomIcon({ size = 16, className = "", tone = defaultTone, ...rest }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={`${tone} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...rest}
      >
        {children}
      </svg>
    );
  };

/* ─── Shared bespoke geometry ─── */



/* Leather boot — shaft plus foot. */
const BOOT_PATH = (
  <path
    fill="currentColor"
    d="M6 2h4v7c0 .5.3 1 .7 1.2l5.3 3c2 1.1 4 3 4 5.3V19c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z"
  />
);

/* Feathered wing sweeping back from the boot's upper shaft. */
const WING_PATH = (
  <path
    fill="currentColor"
    d="M9 3.4C7 2.8 5 1.9 3.4.4c.4 2 1.6 3.2 3 3.8-1.3.2-2.6-.1-3.8-.9.5 1.6 1.6 2.6 3 3-1 .4-2.1.3-3.1-.1.8 1.3 2 2 3.5 2.1l1.6.1L9 6z"
  />
);

/* Speed trail behind the boot. */
const TRAIL_PATH = (
  <path fill="currentColor" d="M0 11h2.6v1.1H0zM.6 14.2h2.2v1H.6zM1.2 17.2h1.8v.9H1.2z" />
);









/* ═══════════════ CORE STATS ═══════════════ */

/* Core stat icons — all approved artwork assets. */
export const GD_STAT_STR = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/e47073b4b_GD_STAT_STR.png");
export const GD_STAT_DEX = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/31e82c23c_GD_STAT_DEX.png");
export const GD_STAT_CON = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/011cc93fb_GD_STAT_CON.png");
export const GD_STAT_INT = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/e2a9e7621_GD_STAT_INT.png");
export const GD_STAT_CHA = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/28571feef_GD_STAT_CHA.png");

/* ═══════════════ MAJOR SECTIONS (antique gold/bronze) ═══════════════ */

/* Attacks — crossed fantasy weapons. Approved artwork asset. */
export const GD_ATTACKS = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/02e82007b_GD_ATTACKS.png");
/* Skills — ornate gold star compass / compass rose. Approved artwork asset. */
export const GD_SKILLS = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/b6a337a91_GD_SKILLS.png");
/* Equipment — fantasy great helm. Approved artwork asset. */
export const GD_GEAR = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/3a9616657_GD_GEAR.png");
/* Defense — fantasy heater shield. Approved artwork asset. */
export const GD_DEFENSE = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/4dc65d8f2_GD_DEFENSE.png");
/* Movement — winged fantasy boot (section-level symbol). Antique gold. */
export const GD_MOVEMENT = gdSvg(
  <g>
    {WING_PATH}
    {BOOT_PATH}
    {TRAIL_PATH}
  </g>,
  GOLD
);

/* Spells — open glowing spellbook with an arcane spark. Approved artwork asset. */
export const GD_SPELLS = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/adc0cced2_GD_SPELLS.png");

/* ═══════════════ RESOURCES ═══════════════ */

/* HP — faceted vitality heart. Approved artwork asset. */
export const GD_HP = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/0fd3d4f66_GD_HP.png");
/* Mana — faceted arcane crystal. Approved artwork asset. */
export const GD_MANA = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/3c226e55e_GD_MANA.png");
/* Hotbar — magical flame over a ruby. Approved artwork asset. */
export const GD_HOTBAR = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/5e2052a2a_GD_HOTBAR.png");

/* ═══════════════ DEFENSE / MOVEMENT MICRO ICONS ═══════════════ */

/* Damage Resist — reinforced gold shield. Approved artwork asset. */
export const GD_DAMAGE_RESIST = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/45dc859e1_GD_DAMAGE_RESIST.png");
/* Evade — blue wind / deflection swirl. Approved artwork asset. */
export const GD_EVADE = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/8d29b61c8_GD_EVADE.png");
/* Move — winged boot. Approved artwork asset. */
export const GD_MOVE = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/6d3c5ab5c_GD_MOVE.png");
/* Step — two gold footprints. Approved artwork asset. */
export const GD_STEP = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/f41684f45_GD_STEP.png");

/* ═══════════════ CHARACTER / INVENTORY ═══════════════ */

/* Character Details — rolled scroll with a quill. Approved artwork asset. */
export const GD_CHARACTER_DETAILS = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/348df435f_GD_CHARACTER_DETAILS.png");
/* Inventory — leather backpack / satchel. Approved artwork asset. */
export const GD_INVENTORY = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/cf23d37e8_GD_INVENTORY.png");

/* ═══════════════ ACTION ICONS ═══════════════ */

/* Heal — green cross with light rays. Approved artwork asset. */
export const GD_HEAL = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/adddee7e0_GD_ACTION_HEAL.png");
/* Magic Attack — blue magical energy bolt. Approved artwork asset. */
export const GD_MAGIC_ATTACK = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/958434804_GD_ACTION_MAGIC_ATTACK.png");
/* Physical Attack — silver sword. Approved artwork asset. */
export const GD_PHYSICAL_ATTACK = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/f293beb62_GD_ACTION_PHYSICAL_ATTACK.png");
/* Passive — purple swirling vortex spiral. Approved artwork asset. */
export const GD_PASSIVE = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/bc36ec004_GD_ACTION_PASSIVE.png");

/* ═══════════════ CONSUMABLE ICONS ═══════════════ */

/* Healing Potion — round potion bottle, crimson liquid. Approved artwork asset. */
export const GD_HEALING_POTION = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/853b4cf25_GD_HEALING_POTION.png");
/* Mana Potion — round potion bottle, arcane-blue liquid. Approved artwork asset. */
export const GD_MANA_POTION = gdAsset("https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/0814084b1_GD_MANA_POTION.png");

/* ═══════════════ GEAR SLOT ICONS ═══════════════ */

/* Gear slot icons — the user's approved artwork assets, resampled:
   the object inside each drawn frame is scaled up to fill the frame
   interior (small consistent inset, frame pixels untouched), and each
   tile is cropped to the frame itself on ONE uniform canvas so the
   frames render large at their slot size. The original tiles are
   preserved; these are deterministic resamples of them. */
export const GD_SLOT_HEAD = gdAsset(gearHead);
export const GD_SLOT_CHEST = gdAsset(gearChest);
export const GD_SLOT_HANDS = gdAsset(gearHands);
export const GD_SLOT_LEGS = gdAsset(gearLegs);
export const GD_SLOT_FEET = gdAsset(gearFeet);
export const GD_SLOT_MAINHAND = gdAsset(gearMainHand);
export const GD_SLOT_OFFHAND = gdAsset(gearOffHand);
export const GD_SLOT_OTHER = gdAsset(gearOther);