import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const payload = path.join(root, "payload");
const output = path.join(root, "public", "brand", "homepage-exact.webp");

const parts = fs.readdirSync(payload)
  .filter((name) => name.startsWith("homepage-exact.") && name.endsWith(".b64part"))
  .sort();

if (!parts.length) throw new Error("Missing homepage-exact image payload");

const base64 = parts
  .map((name) => fs.readFileSync(path.join(payload, name), "utf8").trim())
  .join("");

const bytes = Buffer.from(base64, "base64");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, bytes);
console.log(`Restored public/brand/homepage-exact.webp (${bytes.length} bytes)`);
