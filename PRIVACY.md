# Privacy Policy — LUMA: Floating Worlds

**Last Updated:** 2026  
**Architecture Model:** **Zero Login · Zero Server Database · Zero Tracking**

---

## 1. Summary

**LUMA: Floating Worlds — The Living Archipelago** runs 100% inside your local web browser.

- **No Login or Registration:** You are never asked for an email address, username, password, or external account.
- **No Remote Database or Cloud Save:** The game does not transmit your progress, checkpoints, playtime, settings, or save files to any developer server.
- **No Analytics, Telemetry, or Trackers:** There are no analytics SDKs, ad pixels, fingerprinting scripts, or third-party tracking requests.
- **No External Runtime Network Calls:** Fonts, audio synthesis, shaders, 3D geometry, and game data run locally from the bundled static files.

---

## 2. What Is Stored Locally (and Only on Your Device)

Your browser stores game state strictly on your own device using standard `window.localStorage`:

| Storage Key | Purpose |
| :--- | :--- |
| `luma_floating_worlds_save_v1` | Primary local save state (Schema v3: completed stages, stars, Echoes, Shards, unlocked heroes & cosmetics, quest progress, NPC conversations, world restorations, mid-run checkpoints, session history up to 5 runs/stage, and audio/camera settings). |
| `luma_floating_worlds_save_backup_v1` | Automatic local backup snapshot updated on save writes to protect against accidental primary corruption. |

You can optionally click **Request Persistence** inside **Settings → Local Save Manager** to ask your browser (`navigator.storage.persist()`) not to automatically evict site data under storage pressure. This preference stays strictly on your device.

---

## 3. Controlling, Backing Up, and Erasing Your Data

Open **Settings → Local Save Manager** at any time from the Title Screen or Pause Menu to:

1. **Inspect Diagnostics:** View exact local storage byte usage (`primary` and `backup` keys) and persistence status.
2. **Export Save (`.json`):** Download a clean JSON backup of your local progress to store anywhere you like or move to another device.
3. **Import Save (`.json`):** Preview and restore a previously exported LUMA JSON save file after client-side validation.
4. **Restore Backup:** Recover your last known-good snapshot from `luma_floating_worlds_save_backup_v1`.
5. **Delete All Local Data:** Permanently erase both `luma_floating_worlds_save_v1` and `luma_floating_worlds_save_backup_v1` from your browser with two-step confirmation.

Alternatively, clearing site data for this domain in your browser settings removes all stored LUMA data immediately.

---

## 4. Open-Source Transparency

All persistence logic is self-contained inside `src/game/saveManager.ts`, `src/game/checkpoints.ts`, and `src/game/progression.ts` so anyone hosting or inspecting the static build can verify that zero network calls are made with player data.
