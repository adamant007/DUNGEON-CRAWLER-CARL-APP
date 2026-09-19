/* Portrait Customize — selection data.
   Options carry an optional `thumb` (URL) reserved for the upcoming
   reference artwork; tiles render the thumbnail once provided. */

/* Portrait Type — the generated portrait's visual presentation style,
   NOT the user's gender or identity. Keys stay stable so any already
   stored customization state keeps working. */
export const PORTRAIT_TYPES = [
  { key: "male", label: "MASCULINE" },
  { key: "female", label: "FEMININE" },
  { key: "androgynous", label: "ANDROGYNOUS" },
  { key: "animal", label: "COMPANION" },
];

export const DEFAULT_CUSTOMIZATION = {
  portraitType: "male",
  hair: null,
  facialHair: null,
  hairColor: "original",
  hairColorCustom: null,
  scars: null,
  markingColor: null,
  markingColorCustom: null,
  hat: null,
  eyewear: null,
  glowColor: null,
  glowColorCustom: null,
  weapon: null,
  armor: null,
  armorPrimary: null,
  armorPrimaryCustom: null,
  armorAccent: null,
  armorAccentCustom: null,
};

/* Uploaded PREVIEW/REFERENCE sheet — two rows of nine framed option cards
   (frame + label included): top row Hair Style, bottom row Facial Hair.
   Each option crops its measured card region (percent of the full sheet)
   so the artwork is shown pixel-accurate, unaltered. Reference only —
   never pasted onto the user's portrait. */
const REFERENCE_SHEET =
  "https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/98e9126a5_Ginger_Dragon_Hair_Style_and_Facial_Hair_FINAL.png";

const HAIR_COLORS = [
  { key: "original", label: "Original", hex: null },
  { key: "black", label: "Black", hex: "#1e1b18" },
  { key: "darkBrown", label: "Dark Brown", hex: "#3a2a1c" },
  { key: "brown", label: "Brown", hex: "#6b4a2c" },
  { key: "auburn", label: "Auburn", hex: "#7c3a1d" },
  { key: "ginger", label: "Ginger", hex: "#b5622b" },
  { key: "blonde", label: "Blonde", hex: "#d8b56a" },
  { key: "gray", label: "Gray", hex: "#8f8a80" },
  { key: "white", label: "White", hex: "#e8e2d5" },
];

const MARKING_COLORS = [
  { key: "red", label: "Red", hex: "#9b2226" },
  { key: "black", label: "Black", hex: "#1e1b18" },
  { key: "blue", label: "Blue", hex: "#2a5a8c" },
  { key: "green", label: "Green", hex: "#3f6b3a" },
  { key: "purple", label: "Purple", hex: "#5a3a7c" },
  { key: "gold", label: "Gold", hex: "#b08a3e" },
  { key: "white", label: "White", hex: "#e8e2d5" },
];

const GLOW_COLORS = [
  { key: "blue", label: "Blue", hex: "#4d7fae" },
  { key: "purple", label: "Purple", hex: "#7c5aa8" },
  { key: "red", label: "Red", hex: "#c23b32" },
  { key: "green", label: "Green", hex: "#4d9b5a" },
  { key: "gold", label: "Gold", hex: "#d4a055" },
  { key: "white", label: "White", hex: "#f0ead8" },
];

const ARMOR_COLORS = [
  { key: "leather", label: "Leather Brown", hex: "#6b4a2c" },
  { key: "darkLeather", label: "Dark Leather", hex: "#4a3320" },
  { key: "steel", label: "Steel", hex: "#8c8f94" },
  { key: "darkSteel", label: "Dark Steel", hex: "#5a5d63" },
  { key: "forest", label: "Forest Green", hex: "#3f5b3a" },
  { key: "crimson", label: "Crimson", hex: "#7c2a26" },
  { key: "navy", label: "Navy", hex: "#2a3f5c" },
  { key: "charcoal", label: "Charcoal", hex: "#33302b" },
  { key: "gold", label: "Gold", hex: "#b08a3e" },
  { key: "ivory", label: "Ivory", hex: "#cfc5ae" },
];

export const CATEGORIES = [
  {
    key: "hairStyle",
    label: "Hair Style",
    field: "hair",
    sheet: REFERENCE_SHEET,
    /* No style is restricted by portrait type — Masculine, Feminine and
       Androgynous all see the full list; Companion hides this category
       entirely (companion options arrive separately). */
    hideFor: ["animal"],
    options: [
      { key: "original", label: "Original", art: { x: 1.17, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "bald", label: "Bald / Shaved", art: { x: 12.5, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "short", label: "Short", art: { x: 22.66, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "medium", label: "Medium", art: { x: 33.46, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "long", label: "Long", art: { x: 44.21, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "ponytail", label: "Ponytail", art: { x: 55.14, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "braided", label: "Braided", art: { x: 66.02, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "mohawk", label: "Mohawk", art: { x: 76.76, y: 11.13, w: 10.22, h: 32.91 } },
      { key: "wild", label: "Wild / Messy", art: { x: 87.96, y: 11.13, w: 10.22, h: 32.91 } },
    ],
    colors: [
      { field: "hairColor", customField: "hairColorCustom", label: "Hair Color", palette: HAIR_COLORS },
    ],
  },
  {
    key: "facialHair",
    label: "Facial Hair",
    field: "facialHair",
    sheet: REFERENCE_SHEET,
    hideFor: ["animal"],
    options: [
      { key: "none", label: "None", art: { x: 1.17, y: 57.42, w: 10.22, h: 30.57 } },
      { key: "stubble", label: "Stubble", art: { x: 11.98, y: 57.42, w: 10.16, h: 30.57 } },
      { key: "mustache", label: "Mustache", art: { x: 22.27, y: 57.42, w: 10.22, h: 30.57 } },
      { key: "goatee", label: "Goatee", art: { x: 33.07, y: 57.42, w: 10.22, h: 30.57 } },
      { key: "shortBeard", label: "Short Beard", art: { x: 44.14, y: 57.42, w: 10.22, h: 30.57 } },
      { key: "warriorBeard", label: "Long Warrior Beard", art: { x: 55.14, y: 57.42, w: 10.22, h: 30.57 } },
      { key: "braidedBeard", label: "Braided Beard", art: { x: 66.08, y: 57.42, w: 10.22, h: 30.57 } },
      { key: "wizardBeard", label: "Wild Wizard Beard", art: { x: 77.41, y: 57.42, w: 10.22, h: 30.57 } },
      { key: "fullBeard", label: "Full Beard", art: { x: 88.41, y: 57.42, w: 10.22, h: 30.57 } },
    ],
  },
  {
    key: "scars",
    label: "Scars & Marks",
    field: "scars",
    options: [
      { key: "none", label: "None", thumb: null },
      { key: "cheekScar", label: "Cheek Scar", thumb: null },
      { key: "eyeScar", label: "Eye Scar", thumb: null },
      { key: "clawMarks", label: "Claw Marks", thumb: null },
      { key: "warPaint", label: "War Paint", thumb: null },
      { key: "arcane", label: "Arcane Markings", thumb: null },
    ],
    colors: [
      {
        field: "markingColor",
        customField: "markingColorCustom",
        label: "Marking Color",
        palette: MARKING_COLORS,
        showWhen: (sel) => sel === "warPaint" || sel === "arcane",
      },
    ],
  },
  {
    key: "hats",
    label: "Hats & Helmets",
    field: "hat",
    options: [
      { key: "none", label: "None", thumb: null },
      { key: "hood", label: "Hood", thumb: null },
      { key: "leatherCap", label: "Leather Cap", thumb: null },
      { key: "knightHelm", label: "Knight Helm", thumb: null },
      { key: "barbarianHelm", label: "Barbarian Helm", thumb: null },
      { key: "wizardHat", label: "Wizard Hat", thumb: null },
      { key: "crown", label: "Crown", thumb: null },
    ],
  },
  {
    key: "eyewear",
    label: "Eyewear",
    field: "eyewear",
    options: [
      { key: "none", label: "None", thumb: null },
      { key: "spectacles", label: "Round Spectacles", thumb: null },
      { key: "readingGlasses", label: "Reading Glasses", thumb: null },
      { key: "goggles", label: "Goggles", thumb: null },
      { key: "monocle", label: "Monocle", thumb: null },
      { key: "eyePatch", label: "Eye Patch", thumb: null },
      { key: "magicLenses", label: "Magical Lenses", thumb: null },
    ],
    colors: [
      {
        field: "glowColor",
        customField: "glowColorCustom",
        label: "Glow Color",
        palette: GLOW_COLORS,
        showWhen: (sel) => sel === "magicLenses",
      },
    ],
  },
  {
    key: "weapons",
    label: "Weapons",
    field: "weapon",
    options: [
      { key: "none", label: "None", thumb: null },
      { key: "longsword", label: "Longsword", thumb: null },
      { key: "battleaxe", label: "Battleaxe", thumb: null },
      { key: "bow", label: "Bow", thumb: null },
      { key: "staff", label: "Staff", thumb: null },
      { key: "daggers", label: "Daggers", thumb: null },
      { key: "warhammer", label: "Warhammer", thumb: null },
    ],
  },
  {
    key: "armor",
    label: "Armor & Cloak",
    field: "armor",
    options: [
      { key: "none", label: "Original Clothing", thumb: null },
      { key: "leatherAdventurer", label: "Leather Adventurer", thumb: null },
      { key: "chainmail", label: "Chainmail", thumb: null },
      { key: "plate", label: "Plate Armor", thumb: null },
      { key: "barbarianFur", label: "Barbarian Fur", thumb: null },
      { key: "wizardRobes", label: "Wizard Robes", thumb: null },
      { key: "hoodedCloak", label: "Hooded Cloak", thumb: null },
    ],
    colors: [
      { field: "armorPrimary", customField: "armorPrimaryCustom", label: "Primary Color", palette: ARMOR_COLORS },
      { field: "armorAccent", customField: "armorAccentCustom", label: "Accent Color", palette: ARMOR_COLORS },
    ],
  },
];