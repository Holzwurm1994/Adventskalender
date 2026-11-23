// Einmalig/lokal: verschlüsselt Bilder tag01.webp … tag24.webp und Quizfragen quiz01.json … quiz24.json aus einem Ordner nach comics-enc/.
// Aufruf: COMIC_KEY="…" node scripts/encrypt.mjs <ordner-mit-bildern>
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { deriveKey, encryptBytes } from "./crypto.mjs";

const dir = process.argv[2];
if (!dir || !process.env.COMIC_KEY) { console.error("Aufruf: COMIC_KEY=… node scripts/encrypt.mjs <ordner>"); process.exit(1); }
const key = await deriveKey(process.env.COMIC_KEY);
await mkdir("comics-enc", { recursive: true });
for (const f of (await readdir(dir)).filter(f => /^(tag\d\d\.webp|quiz\d\d\.json)$/.test(f)).sort()) {
  const out = join("comics-enc", f.replace(/\.(webp|json)$/, ".enc"));
  await writeFile(out, await encryptBytes(key, await readFile(join(dir, f))));
  console.log("verschlüsselt:", out);
}
