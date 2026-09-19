/* Vault currency helpers. Currency amounts are REAL stored character
   data (Character.currency, keyed by the Rules Profile's currency ids).
   The Money Pouch itself is ONE permanent artwork with NO wealth-based
   visual progression — it never changes with the stored amounts; the
   numbers live in The Vault. Currency types come from the active Rules
   Profile; nothing here is hard-coded to any specific metal or system. */

const IMG = "https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets";

/* The Vault chest — the battered old open lockbox, its hoard a chaotic
   jumble of mismatched coins and pocket debris. Decorative atmosphere
   only (never inventory records); visible only inside the Vault. */
export const VAULT_CHEST_URL = `${IMG}/3a23cd4cf_generated_image.png`;

/* Stored amount for one currency id — 0 for anything absent/invalid. */
export const amountOf = (currency, id) => {
  const n = Number(currency?.[id]);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/* Normalized total wealth — every stored amount converted to the
   profile's base unit via the profile's conversion ratios (weight).
   Ratios are PROFILE data, never universal app constants. */
export function totalWealth({ currency = {}, currencies = [] }) {
  return (Array.isArray(currencies) ? currencies : []).reduce(
    (sum, c) => sum + amountOf(currency, c.id) * (c.weight ?? 1),
    0
  );
}