import React from "react";

/* The GDS dragon emblem — round gold-ringed badge used in headers and the
   returning-user sidebar. */
const EMBLEM = "https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/ac9f997f4_generated_image.png";

export default function GdsEmblem({ size = 44, className = "" }) {
  return (
    <img
      src={EMBLEM}
      alt="Ginger Dragon Studios emblem"
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-full border border-[var(--gold)] object-cover shadow-[0_2px_8px_rgba(0,0,0,0.6)] ${className}`}
    />
  );
}