import React from "react";

/* The GDS dragon-hoard artwork as a persistent full-bleed backdrop for the
   app interior (everything under the GDS toolbar). Fixed to the viewport,
   cover-scaled and centered — never tiled, never stretched — and layered
   beneath the interface with a subtle dark overlay so sheet and dialog
   text stay readable. Purely decorative: pointer-events none. */
const HERO_URL = "https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/c00000162_c5029073-5a19-47ff-b083-5e8d67d470bb.png";

export default function GdsBackdrop({ overlay = true }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={HERO_URL}
        alt=""
        draggable={false}
        className="absolute inset-0 block h-full w-full object-cover object-center"
      />
      {overlay && <div className="absolute inset-0 bg-black/45" />}
    </div>
  );
}