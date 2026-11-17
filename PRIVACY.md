# Privacy Policy — LUMA: Floating Worlds (Unbound)

**Last Updated:** 2026  
**Architecture Model:** **Zero Login · Zero Server Database · Zero Tracking**

---

## 1. Summary

**LUMA: Floating Worlds — UNBOUND** runs 100% inside your local web browser.

- **No Login or Registration:** You are never asked for an email address, username, password, or external account.
- **No Remote Database or Cloud Save:** Campaign progress, custom creations, Echo Duels, Daily Rift streaks, checkpoints, and settings never leave your device.
- **No Analytics, Telemetry, or Trackers:** There are no analytics SDKs, ad pixels, fingerprinting scripts, cookies, or third-party tracking requests.
- **No External Runtime Network Calls:** Fonts, audio synthesis, shaders, 3D geometry, Daily Rift generation, replay verification, and HTML5-Canvas PNG Scorecard generation run locally from bundled static files.

---

## 2. What Is Stored Locally (and Only on Your Device)

Your browser stores game state strictly on your own device using standard `window.localStorage`:

| Storage Key | Purpose |
| :--- | :--- |
| `luma_floating_worlds_save_v1` | Primary local save state (Schema v4: campaign stages, stars, Echoes, Shards, heroes, cosmetics, quests, NPC conversations, world restorations, checkpoints, session history, plus Unbound custom stages, imported packs, saved `.luma-replay` files, Duel history, and Daily/Weekly/Monthly Rift streaks). |
| `luma_floating_worlds_save_backup_v1` | Automatic local backup snapshot updated on save writes to protect against accidental primary corruption. |

You can optionally click **Request Persistence** inside **Settings → Local Save Manager** to ask your browser (`navigator.storage.persist()`) not to automatically evict site data under storage pressure. This preference stays strictly on your device.

---

## 3. Portable Files & Client-Side Sharing

When you export or import files in **World Forge**, **Community Foundry**, **Echo Duels**, or **Daily Rift**:
- **`.luma`, `.luma-pack`, `.luma-replay` Files:** Generated and parsed 100% in memory on your device with strict prototype-pollution, URL, and HTML sanitization (`src/game/customFormats.ts`). Nothing is uploaded to a server.
- **Shareable Daily Rift Codes (`LUMA-RIFT-...`):** Deterministic strings encoding the date key and PRNG seed—no personal data is contained in a Rift code.
- **Echo Duel PNG Scorecards:** Rendered locally onto an HTML5 `<canvas>` and downloaded directly to your device (`src/game/echoDuels.ts`).

---

## 4. Controlling, Backing Up, and Erasing Your Data

Open **Settings → Local Save Manager** at any time from the Title Screen or Pause Menu to:

1. **Inspect Diagnostics:** View exact local storage byte usage (`primary` and `backup` keys) and persistence status.
2. **Export Save (`.json`):** Download a clean JSON backup of your local progress to store anywhere you like or move to another device.
3. **Import Save (`.json`):** Preview and restore a previously exported LUMA JSON save file after client-side validation.
4. **Restore Backup:** Recover your last known-good snapshot from `luma_floating_worlds_save_backup_v1`.
5. **Delete All Local Data:** Permanently erase both `luma_floating_worlds_save_v1` and `luma_floating_worlds_save_backup_v1` from your browser with two-step confirmation.

Alternatively, clearing site data for this domain in your browser settings removes all stored LUMA data immediately.

---

## 5. Open-Source Transparency

All persistence and portable file validation logic is self-contained inside `src/game/saveManager.ts`, `src/game/checkpoints.ts`, `src/game/progression.ts`, `src/game/customFormats.ts`, `src/game/echoEngine.ts`, and `src/game/echoDuels.ts` so anyone hosting or inspecting the static build can verify that zero network calls are made with player data.
