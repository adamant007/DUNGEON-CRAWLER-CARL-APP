import React from "react";
import { Link } from "react-router-dom";

/* Borderless text link for panel headers (minimalist parchment style) —
   routes to the existing toolbar tabs, never new navigation logic. */
export default function ViewAllLink({ to, label }) {
  return (
    <Link
      to={to}
      className="font-fell-sc text-[9px] tracking-[0.08em] text-[var(--hp)] underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--ink)] whitespace-nowrap"
    >
      {label} →
    </Link>
  );
}