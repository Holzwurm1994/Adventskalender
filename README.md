# Adventure Team · Adventskalender 2026

Digitaler Comic-Adventskalender: Ab dem 1. Dezember 2026 öffnet sich jeden Tag um Mitternacht (deutsche Zeit) ein neues Türchen.

**Kein Vorspulen möglich:** Die Comics liegen im Repository nur verschlüsselt (`comics-enc/`).
Eine GitHub Action entschlüsselt jede Nacht nur die Comics, deren Tag erreicht ist, und veröffentlicht sie auf GitHub Pages.
Zukünftige Comics sind auf der Webseite nirgends unverschlüsselt vorhanden.

## Admin
`/admin.html` auf der Kalenderseite: mit dem Admin-Passwort alle Türchen vorab ansehen und Comics austauschen.
Das Passwort ist zugleich das Repository-Secret `COMIC_KEY` (Settings → Secrets and variables → Actions).

## Aufbau
- `site/` – Kalenderseite und Admin-Bereich
- `comics-enc/` – verschlüsselte Comics (AES-256-GCM, Schlüssel per PBKDF2 aus `COMIC_KEY`)
- `scripts/build.mjs` – baut `_site/` und entschlüsselt nur freigegebene Tage
- `.github/workflows/veroeffentlichen.yml` – Veröffentlichung bei Änderungen und mehrmals pro Nacht
