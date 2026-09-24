import React from "react";

/* Canonical Ginger Dragon Studios mark. Keep this tied to the approved
   full-resolution Ginger Dragon artwork used by the installed app icon. */
export default function GdsEmblem({ size = 44, className = "" }) {
  return (
    <img
      src="/brand/app-icon.svg"
      alt="Ginger Dragon Studios"
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-full object-cover drop-shadow-[0_3px_10px_rgba(0,0,0,.55)] ${className}`}
    />
  );
}
