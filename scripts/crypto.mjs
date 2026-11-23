// Gemeinsame Verschlüsselung für Build-Skript (Node) und Admin-Seite (Browser).
// AES-256-GCM, Schlüssel per PBKDF2-SHA256 aus dem Passwort (Secret COMIC_KEY).
// Dateiformat: 12 Byte IV + Chiffretext (inkl. 16 Byte GCM-Tag).
export const SALT = "adventure-team-adventskalender-2026";
export const ITERATIONS = 250000;

export async function deriveKey(passphrase, subtle = globalThis.crypto.subtle) {
  const enc = new TextEncoder();
  const base = await subtle.importKey("raw", enc.encode(passphrase.trim()), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(SALT), iterations: ITERATIONS, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptBytes(key, bytes, subtle = globalThis.crypto.subtle) {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key, bytes));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv, 0); out.set(ct, 12);
  return out;
}

export async function decryptBytes(key, data, subtle = globalThis.crypto.subtle) {
  const u = new Uint8Array(data);
  return new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12)));
}
