import React from "react";

/* Canonical Ginger Dragon Studios mark. Keep this tied to the exact
   approved dragon + teal d20 crest used by the installed app icon. */
export default function GdsEmblem({ size = 44, className = "" }) {
  return (
    <img
      src="/brand/ginger-dragon-app-icon.png"
      alt="Ginger Dragon Studios"
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,.55)] ${className}`}
    />
  );
}
