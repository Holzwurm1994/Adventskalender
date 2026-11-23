// Baut die veröffentlichte Seite nach _site/.
// Entschlüsselt NUR die Comics, deren Tag (deutsche Zeit) schon erreicht ist.
// Noch nicht freigegebene Comics landen nie unverschlüsselt auf der Webseite.
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { deriveKey, decryptBytes } from "./crypto.mjs";

const YEAR = 2026, MONTH = 12, TZ = "Europe/Berlin";

function berlinNow(date = new Date()) {
  const o = {};
  for (const p of new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date)) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day };
}
export function releasedUpTo(date = new Date()) {
  // Optional zum Testen: BUILD_DATE=2026-12-05
  const t = process.env.BUILD_DATE
    ? (([y, m, d]) => ({ y: +y, m: +m, d: +d }))(process.env.BUILD_DATE.split("-"))
    : berlinNow(date);
  const k = t.y * 10000 + t.m * 100 + t.d, start = YEAR * 10000 + MONTH * 100;
  if (k < start + 1) return 0;
  if (k >= start + 24) return 24;
  return t.d;
}

const pass = process.env.COMIC_KEY;
if (!pass) { console.error("Secret COMIC_KEY fehlt."); process.exit(1); }
const key = await deriveKey(pass);
const upTo = releasedUpTo();

await rm("_site", { recursive: true, force: true });
await mkdir("_site/comics", { recursive: true });
await cp("site", "_site", { recursive: true });
await cp("scripts/crypto.mjs", "_site/crypto.mjs");
// Verschlüsselte Dateien für den Admin-Bereich (ohne Passwort wertlos)
await cp("comics-enc", "_site/enc", { recursive: true });

const days = [];
for (let n = 1; n <= upTo; n++) {
  const f = `comics-enc/tag${String(n).padStart(2, "0")}.enc`;
  if (!existsSync(f)) { console.warn("fehlt:", f); continue; }
  const img = await decryptBytes(key, await readFile(f));
  await writeFile(`_site/comics/tag${String(n).padStart(2, "0")}.webp`, img);
  days.push(n);
}
await writeFile("_site/released.json", JSON.stringify({ days, builtAt: new Date().toISOString() }));
await writeFile("_site/.nojekyll", "");
console.log(`Freigegeben: ${days.length} Türchen (${days.join(", ") || "keins"})`);
