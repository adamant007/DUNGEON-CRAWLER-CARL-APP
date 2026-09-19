import React from "react";

/* Silhouettes for the standard RPG dice the shared engine understands
   (d4, d6, d8, d10, d12, d20) — parchment faces, bronze-ink edges. */
const SHAPES = {
  4: "M50 8 L94 82 L6 82 Z",
  6: "M16 16 H84 Q90 16 90 22 V78 Q90 84 84 84 H16 Q10 84 10 78 V22 Q10 16 16 16 Z",
  8: "M50 5 L92 50 L50 95 L8 50 Z",
  10: "M50 5 L89 42 L50 95 L11 42 Z",
  12: "M50 6 L91 36 L76 88 L24 88 L9 36 Z",
  20: "M50 5 L88 27 L88 73 L50 95 L12 73 L12 27 Z",
};

/* Visual die — PRESENTATION ONLY for the shared dice engine. It always
   settles on the exact result the engine already generated; the rapid
   frames while tumbling are throwaway animation, never a second roll. */
export default function Die({ sides, value, rolling = false, size = 44 }) {
  const path = SHAPES[sides] ?? SHAPES[6];
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={rolling ? "die-tumble" : "die-settled"}
      role="img"
      aria-label={`d${sides} showing ${value}`}
    >
      <path d={path} fill="#e9d8b2" stroke="#4a3727" strokeWidth="4.5" strokeLinejoin="round" />
      <path
        d={path}
        fill="none"
        stroke="#b08a3e"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.7"
        transform="translate(2.5,2.5)"
      />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="34"
        fontWeight="700"
        fill="#24180f"
        fontFamily="'EB Garamond', serif"
      >
        {value}
      </text>
    </svg>
  );
}