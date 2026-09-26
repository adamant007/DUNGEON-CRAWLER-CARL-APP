/*
  Local, deterministic text filter for user-created public/shareable content.
  No API calls and no AI moderation dependency.

  Design goals:
  - block clearly profane / explicit sexual language before save;
  - catch common punctuation, spacing, repetition, and leetspeak evasions;
  - match whole terms so innocent words such as "assassin" or "cockroach"
    are not rejected because they contain a shorter blocked sequence;
  - keep one reusable source of truth for future public user-generated text.
*/

const BLOCKED_TERMS = [
  "fuck",
  "motherfucker",
  "shit",
  "bullshit",
  "bitch",
  "cunt",
  "asshole",
  "dick",
  "cock",
  "pussy",
  "porn",
  "porno",
  "pornography",
  "blowjob",
  "handjob",
  "rimjob",
  "dildo",
  "vibrator",
  "orgasm",
  "masturbate",
  "masturbation",
  "rape",
  "rapist",
];

const BLOCKED_PHRASES = [
  "suck my dick",
  "suck my cock",
  "eat my ass",
  "fuck you",
  "fuck off",
];

const LEET = new Map([
  ["0", "o"],
  ["1", "i"],
  ["!", "i"],
  ["3", "e"],
  ["4", "a"],
  ["5", "s"],
  ["$", "s"],
  ["7", "t"],
  ["@", "a"],
]);

export function normalizeSafetyText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split("")
    .map((ch) => LEET.get(ch) ?? ch)
    .join("");
}

const escaped = (ch) => ch.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");

const obfuscatedTermRegex = (term) => {
  const letters = normalizeSafetyText(term).replace(/[^a-z0-9]/g, "").split("");
  const body = letters.map((ch) => escaped(ch) + "+[^a-z0-9]*").join("");
  return new RegExp("(^|[^a-z0-9])" + body + "($|[^a-z0-9])", "i");
};

const TERM_PATTERNS = BLOCKED_TERMS.map((term) => ({ term, regex: obfuscatedTermRegex(term) }));

const normalizedWords = (value) =>
  normalizeSafetyText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

export function checkUserText(value) {
  const raw = normalizeSafetyText(value);
  if (!raw.trim()) return { ok: true, reason: "" };

  for (const row of TERM_PATTERNS) {
    if (row.regex.test(raw)) {
      return { ok: false, reason: "That text contains language Ginger Dragon doesn’t allow." };
    }
  }

  const words = normalizedWords(raw);
  for (const phrase of BLOCKED_PHRASES) {
    if (words.includes(normalizedWords(phrase))) {
      return { ok: false, reason: "That text contains language Ginger Dragon doesn’t allow." };
    }
  }

  return { ok: true, reason: "" };
}

export function validateUserCreatedText({ name = "", description = "" } = {}) {
  const nameCheck = checkUserText(name);
  if (!nameCheck.ok) {
    return { ok: false, field: "name", reason: "Name contains language Ginger Dragon doesn’t allow." };
  }

  const descriptionCheck = checkUserText(description);
  if (!descriptionCheck.ok) {
    return { ok: false, field: "description", reason: "Description contains language Ginger Dragon doesn’t allow." };
  }

  return { ok: true, field: "", reason: "" };
}
