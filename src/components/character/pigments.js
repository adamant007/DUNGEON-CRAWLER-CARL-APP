/* Pigments of Poor Decisions — sheet ACCENT recoloring. PRESENTATION
   ONLY: a pigment never touches the panel backgrounds, parchment, gold
   trim, artwork, HP/Mana, body text, or values — it only re-inks the
   sheet's small secondary accents (thin inner panel lines, header
   underlines, heading diamonds, section-heading text, and value-box
   edges) through CSS custom properties set on the sheet element.
   Default Brown sets no variables at all, restoring the completely
   original gold/bronze appearance. The chosen pigment lives in the
   character's customization object, so it persists through the normal
   save/load path with no new storage. */

/* The official Pigments of Poor Decisions — the final kid-colored
   crayon/chalk palette, used as hand-applied accent/highlighter
   colors. `default` is the original brown (the restore-original
   option; the key also catches records saved before this feature). */
export const PIGMENT_PRESETS = [
  { key: "default", label: "Default Brown", hex: "#4b3c2c" },
  { key: "driedScab", label: "Dried Scab", hex: "#b94e46" },
  { key: "dungeonMoss", label: "Dungeon Moss", hex: "#708b61" },
  { key: "questionablePuddle", label: "Questionable Puddle", hex: "#5d8991" },
  { key: "torchSoot", label: "Torch Soot", hex: "#4c4947" },
  { key: "oldBruise", label: "Old Bruise", hex: "#765781" },
  { key: "expiredPotion", label: "Expired Healing Potion", hex: "#a65a72" },
  { key: "cheapMead", label: "Cheap Mead", hex: "#c39145" },
  { key: "goblinMustard", label: "Goblin Mustard", hex: "#b59a3f" },
  { key: "definitelyRust", label: "Definitely Rust", hex: "#b65e3e" },
  { key: "moldyBread", label: "Moldy Bread", hex: "#8b8a59" },
  { key: "threeDayCorpse", label: "Three-Day Corpse", hex: "#738a91" },
  { key: "ratBelly", label: "Rat Belly", hex: "#92756f" },
  { key: "dragonDandruff", label: "Dragon Dandruff", hex: "#d8d0bb" },
  { key: "sage", label: "Sage", hex: "#8ea080" },
  { key: "fingernail", label: "Whatever's Under the Fingernail", hex: "#665649" },
];

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex ?? "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/* "#abc" / "#aabbcc" / "aabbcc" -> "#aabbcc"; anything else -> null. */
export const normalizeHex = (hex) => {
  const s = String(hex ?? "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(s)) return "#" + [...s.toLowerCase()].map((c) => c + c).join("");
  if (/^[0-9a-f]{6}$/i.test(s)) return "#" + s.toLowerCase();
  return null;
};

const mix = (rgb, target, t) => rgb.map((c) => Math.round(c + (target - c) * t));
const css = (rgb) => `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;

/* Relative luminance of a pigment color. */
export const pigmentIsLight = (hex) => {
  const [r, g, b] = hexToRgb(hex) ?? [75, 60, 44];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
};

/* Line/border/diamond accent channels — very dark pigments are lifted
   just enough to still read as a hand-drawn line on the dark brown
   panels; bright pigments pass through unchanged. */
const liftedChannels = (hex) => {
  const c = hexToRgb(hex) ?? [228, 182, 106];
  const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  return lum < 0.35 ? mix(c, 255, 0.55) : c;
};

/* HSL helpers — border/accent channels are re-tinted per appearance. */
const rgbToHsl = ([r, g, b]) => {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rr) h = ((gg - bb) / d) % 6;
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
};

const hslToRgb = ([h, s, l]) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] :
    hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return [r1 + m, g1 + m, b1 + m].map((v) => Math.round(Math.max(0, Math.min(255, v * 255))));
};

/* NEON display version of a pigment for the panel BORDERS on the dark
   Dungeon sheet — an extremely vivid hand-applied pigment/chalk line:
   saturation driven to near maximum and lightness lifted high, so the
   band reads as the chosen color at a glance while keeping each
   pigment's hue identity. Pure flat color only — no glow, bloom,
   shadow, or luminous effects are ever added. */
const brightBorderChannels = (hex) => {
  const c = hexToRgb(hex) ?? [228, 182, 106];
  const [h, s, l] = rgbToHsl(c);
  return hslToRgb([h, Math.min(1, s * 1.8 + 0.25), Math.min(0.74, Math.max(l, 0.64))]);
};

/* Contrast-adjusted channels for the LIGHT Tome sheet: over-light
   pigments are pulled down so every accent stays clearly visible on
   the aged-ivory panels. */
const tomeChannels = (hex) => {
  const c = hexToRgb(hex) ?? [122, 88, 44];
  const [h, s, l] = rgbToHsl(c);
  const l2 = l > 0.5 ? Math.max(0.3, 0.45 - (l - 0.5) * 0.6) : Math.max(l, 0.25);
  return hslToRgb([h, Math.min(0.9, Math.max(s, 0.2)), l2]);
};

const accentChannels = (hex, appearance) =>
  appearance === "tome" ? tomeChannels(hex) : liftedChannels(hex);

/* The same adjusted accent as a CSS color string (title diamonds). */
export const pigmentAccentHex = (hex, appearance = "dungeon") => css(accentChannels(hex, appearance));

/* "r g b" channel string for the CSS accent rules, which tint with
   alpha like rgb(var(--pig-accent-rgb) / 0.38). */
export const pigmentAccentVars = (hex, appearance = "dungeon") =>
  accentChannels(hex, appearance).join(" ");

/* "r g b" channels for the thick panel BORDER band — a brighter
   display version of the pigment on the Dark sheet, contrast-tuned on
   the Light sheet. */
export const pigmentBorderVars = (hex, appearance = "dungeon") =>
  (appearance === "tome" ? tomeChannels(hex) : brightBorderChannels(hex)).join(" ");

/* Readable text variant of the pigment for small heading/label accents:
   on the Dark sheet dark pigments are lifted toward the light and light
   pigments pulled down; on the Light sheet everything is inked darker
   to read on the ivory panels. */
export const pigmentAccentText = (hex, appearance = "dungeon") => {
  const c = hexToRgb(hex) ?? [230, 200, 142];
  if (appearance === "tome") {
    return css(pigmentIsLight(hex) ? mix(c, 20, 0.45) : mix(c, 30, 0.15));
  }
  return css(pigmentIsLight(hex) ? mix(c, 0, 0.12) : mix(c, 255, 0.55));
};

/* Resolve the character's stored customization into the active
   pigment. Unknown/missing values fall back to the default brown
   (hex null = set no accent variables = the original sheet). */
export const resolvePigment = (customization) => {
  const key = String(customization?.pigment ?? "default");
  if (key === "custom") {
    const hex = normalizeHex(customization?.pigmentCustom);
    if (hex) return { key, hex };
    return { key: "default", hex: null };
  }
  const preset = PIGMENT_PRESETS.find((p) => p.key === key) ?? PIGMENT_PRESETS[0];
  return { key: preset.key, hex: preset.key === "default" ? null : preset.hex };
};