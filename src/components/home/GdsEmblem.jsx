import React from "react";

/* Ginger Dragon Studios brand mark — scalable vector so the toolbar, app
   shell, favicon-sized surfaces, and landing page all share one identity. */
export default function GdsEmblem({ size = 44, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="Ginger Dragon Studios emblem"
      className={`shrink-0 drop-shadow-[0_3px_10px_rgba(0,0,0,.55)] ${className}`}
    >
      <defs>
        <linearGradient id="gds-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f2034" />
          <stop offset=".55" stopColor="#661020" />
          <stop offset="1" stopColor="#35040d" />
        </linearGradient>
        <linearGradient id="gds-mane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset=".42" stopColor="#f3a04f" />
          <stop offset="1" stopColor="#cf6b2c" />
        </linearGradient>
        <linearGradient id="gds-d20" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#3ac9b7" />
          <stop offset=".45" stopColor="#138e86" />
          <stop offset="1" stopColor="#07504f" />
        </linearGradient>
        <linearGradient id="gds-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0cf7b" />
          <stop offset=".55" stopColor="#d3a24c" />
          <stop offset="1" stopColor="#8a5b22" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="47" fill="#090808" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gds-gold)" strokeWidth="3.2" strokeDasharray="122 13 83 16" strokeLinecap="round" />

      {/* Soft ginger mane */}
      <path d="M24 61 C18 44 22 26 39 13 C31 29 34 39 45 48 C34 42 28 47 24 61Z" fill="url(#gds-mane)" />
      <path d="M33 68 C25 51 31 31 50 17 C40 34 42 46 53 54 C42 49 36 54 33 68Z" fill="url(#gds-mane)" opacity=".96" />
      <path d="M42 71 C36 54 43 34 61 23 C51 38 52 48 60 55 C52 53 47 59 42 71Z" fill="url(#gds-mane)" opacity=".92" />

      {/* Deep burgundy dragon face */}
      <path
        d="M48 18
           C59 17 69 23 75 31
           L84 29 L79 37
           C84 43 87 49 86 56
           L92 61 L84 64
           C82 71 77 77 69 82
           C73 72 72 65 67 60
           C61 56 55 54 47 54
           C53 49 55 44 53 39
           C51 34 48 27 48 18Z"
        fill="url(#gds-face)"
      />
      <path d="M61 25 L73 18 L68 31 Z" fill="#5a0c19" />
      <path d="M70 34 C76 36 79 40 81 45 C76 42 72 42 68 43 Z" fill="#210207" opacity=".82" />
      <path d="M76 50 C81 49 84 51 86 54 C82 54 79 56 76 58 Z" fill="#1c0206" opacity=".9" />
      <path d="M69 40 L75 42 L70 46 L66 43 Z" fill="#f4c85d" />
      <path d="M70 41 L74 42 L70 44 Z" fill="#fff0a6" />

      {/* Teal d20 */}
      <g transform="translate(0 2)">
        <polygon points="50,55 68,66 61,86 39,86 32,66" fill="url(#gds-d20)" stroke="url(#gds-gold)" strokeWidth="2.5" />
        <path d="M50 55 L50 74 L32 66 M50 55 L68 66 L50 74 M32 66 L39 86 L50 74 L61 86 L68 66" fill="none" stroke="#e9bd64" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M39 86 L61 86 L50 74 Z" fill="rgba(0,0,0,.12)" />
      </g>

      <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,.05)" />
    </svg>
  );
}
