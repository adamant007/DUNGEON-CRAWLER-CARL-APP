import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const payloadDir = path.join(root, "payload");
const outputDir = path.join(root, "public", "brand");
const output = path.join(outputDir, "ginger-dragon-app-icon.png");
const parts = Array.from({ length: 6 }, (_, i) =>
  path.join(payloadDir, `ginger-dragon-app-icon.${String(i).padStart(2, "0")}.b64part`)
);

const base64 = parts.map((file) => fs.readFileSync(file, "utf8").trim()).join("");
const bytes = Buffer.from(base64, "base64");
const hash = crypto.createHash("sha256").update(bytes).digest("hex");
const expectedHash = "997ae4f75a49fd145f591c9e888a1906b4052bb016d45ec6aaea51cdafd42365";

if (hash !== expectedHash) {
  throw new Error(`Ginger Dragon icon payload hash mismatch: ${hash}`);
}
if (bytes.length !== 76454 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
  throw new Error("Ginger Dragon icon payload is not the approved PNG.");
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(output, bytes);
console.log(`Restored approved Ginger Dragon icon: ${output} (${bytes.length} bytes)`);
