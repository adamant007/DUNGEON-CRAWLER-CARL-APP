import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/* Make Me a Crawler — server-side portrait forge. The image generation
   runs from the backend (the environment where it is proven reliable)
   instead of from the browser, and returns the generated portrait URL.
   Each forge rolls a UNIQUE fantasy treatment — random outfit, outer
   layer, weapon, pose, environment, and lighting — so one click gives a
   varied crawler every time. (Later, Customize lets the user swap the
   rolled gear, e.g. a bow for a sword.) STRONG identity preservation
   always takes priority over stylistic variation: the forge may only
   change clothing, equipment, environment, lighting and fantasy
   styling — never the person's face. */
const STYLE_LINES = {
  male: "Present the character with a masculine visual presentation.",
  female: "Present the character with a feminine visual presentation.",
  androgynous: "Present the character with an androgynous visual presentation.",
  animal: "Present the subject as a fantasy animal companion, preserving its recognizable appearance and markings.",
};

/* Randomized fantasy treatments — one roll per forge so every generated
   crawler is unique. Weapons must fit the pose and scene naturally. */
const OUTFITS = [
  "worn dark leather armor with fur-lined shoulders",
  "dented, battle-scarred steel plate armor",
  "a ranger's oiled chainmail under a boiled-leather harness",
  "heavy furs and hide wrappings, mountain-tribe style",
  "a weathered wool tunic with leather braces and a bandolier",
  "dark robes with armored shoulder plates, battle-mage style",
  "a studded leather vest over rough-spun linen",
  "an old mail haubergeon with a tarnished clasp",
];
const OUTERS = [
  "a heavy fur mantle draped over the shoulders",
  "a travel-worn hooded cloak",
  "no cloak — the gear on open display",
  "a moth-eaten arcane shawl",
  "a wolf pelt slung across one shoulder",
];
const WEAPONS = [
  "a sword hilt rising over one shoulder",
  "a notched battle axe resting against the shoulder",
  "a longbow and quiver of arrows slung across the back",
  "a gnarled wooden staff held naturally at their side",
  "twin daggers sheathed at the belt",
  "a massive warhammer head visible behind the shoulder",
  "a spear planted butt-down at their side, held at ease",
];
const POSES = [
  "a confident three-quarter stance, chin level",
  "arms crossed, weight on one hip",
  "half-turned, glancing back over the shoulder",
  "a calm head-on gaze with a slight smile",
];
const ENVIRONMENTS = [
  "a dark stone-walled dungeon interior",
  "a torch-lit medieval tavern corner",
  "a misty forest clearing at dusk",
  "a snowy mountain pass with wind-blown drifts",
  "an ancient library vault with towering shelves",
  "a cave mouth opening onto a distant valley",
  "a ruined castle courtyard under a stormy sky",
];
const LIGHTINGS = [
  "warm torchlight raking across the scene",
  "cold blue moonlight with a single warm ember glow",
  "golden dusk light filtering through the scene",
  "overcast silver light, somber and atmospheric",
  "firelight from below, casting dramatic shadows",
];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function forgePrompt(portraitType) {
  const styleLine = STYLE_LINES[portraitType] || STYLE_LINES.male;
  return `Transform this photo into a CASTLE PORTRAIT of this EXACT person — a believable fantasy RPG character who looks like an old hand-painted portrait hanging in a medieval castle. Think: "this same real person sat for a fantasy-era painted portrait," NOT "a new fantasy character inspired by this person."

IDENTITY — IDENTITY IS THE HIGHEST PRIORITY. The uploaded face is the primary reference: copy it into the result, do not reinterpret or regenerate it into a fantasy archetype. Preserve exactly: the same face shape and width; the same eyes, eyelids, and spacing; the same eyebrows; the same nose shape and size; the same mouth and lips; the same cheeks and jaw; the same age; the same wrinkles and natural facial details (tone, texture, freckles, moles, lines); the same hairline; the same facial hair when present; the same natural expression; and natural facial asymmetry. Do NOT beautify, idealize, de-age, slim, masculinize, feminize, or replace the person's face. Do NOT change the person's ethnicity, age, body type, or recognizable identity.

STYLE — aged hand-painted oil portrait, medieval castle portrait. Realistic painterly texture with a slightly weathered, aged painted finish. Warm, subdued fantasy lighting. Believable medieval/fantasy clothing and armor — tasteful fur, leather, cloth, or metal depending on this portrait's randomized treatment. This sitter's unique treatment: ${pick(OUTFITS)}, ${pick(OUTERS)}, and ${pick(WEAPONS)}, with a small circular dragon emblem somewhere on the gear. The weapon must look naturally integrated into the portrait and pose — never pasted on, never enormous superhero armor. Pose: ${pick(POSES)}. ${styleLine} Restrained fantasy background: ${pick(ENVIRONMENTS)}, lit by ${pick(LIGHTINGS)} — uncluttered, no props beyond the gear. Centered head-and-upper-body composition, vertical, suitable for display in a portrait frame.

The desired result: someone looking at it says, "That's clearly the same person, but they look like they had their portrait painted in a fantasy castle." No text, no signs, no logos, no captions, no watermark, no frame or border — portrait only.`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sourceUrl, portraitType } = await req.json();
    if (!sourceUrl) return Response.json({ error: 'Missing source image' }, { status: 400 });

    const { url } = await base44.integrations.Core.GenerateImage({
      prompt: forgePrompt(portraitType),
      existing_image_urls: [sourceUrl],
    });
    return Response.json({ url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}