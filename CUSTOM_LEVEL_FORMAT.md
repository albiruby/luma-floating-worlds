# LUMA Custom File Formats & Security Specification

**LUMA: UNBOUND — Play Beyond Worlds** introduces three portable, strictly client-side JSON file formats:
1. **`.luma`** — Single Custom Stage (`LumaCustomStageFile`)
2. **`.luma-pack`** — Multi-Stage Collection (`LumaStagePackFile`)
3. **`.luma-replay`** — Deterministic Input Replay (`LumaReplayFile`)

All parsing, validation, sanitization, and verification run 100% locally in `src/game/customFormats.ts` and `src/game/echoEngine.ts` with zero server uploads.

---

## 1. File Size & Bounds Caps

| Format | Max Byte Size | Structural Caps |
| :--- | :--- | :--- |
| `.luma` | `524,288` bytes (512 KB) | Max `260` tiles, `24×24` span, coordinates clamped to `[-20, 24]`, max `90` objects |
| `.luma-pack` | `2,097,152` bytes (2 MB) | 1 to `20` validated `.luma` stages per pack |
| `.luma-replay` | `524,288` bytes (512 KB) | `tickRate === 30`, max `5,400` frames (`180` seconds at 30 Hz) |

---

## 2. Security & Sanitization Rules

Every imported `.luma`, `.luma-pack`, or `.luma-replay` file is rejected or sanitized before touching React state or `localStorage`:
1. **Prototype Pollution Guard**: Deep recursive inspection rejects any object containing `__proto__`, `constructor`, or `prototype` own properties.
2. **Plain-Text Sanitization**: All strings (`title`, `description`, `authorAlias`, `challengerAlias`, labels, tags) forbid HTML tags (`<...>`), `javascript:`, `data:`, `vbscript:`, inline event handlers (`on*=`), and external URLs (`http://`, `https://`), with strict character length caps.
3. **Strict Enum Allowlists**: Terrain types, decor props, hero IDs (`wayfinder`, `sylvi`, `neris`, `kael`, `zeph`), synergy kinds, and world themes must belong to LUMA's bundled allowlists. Unknown types fail validation safely.
4. **No Executable Code**: Only declarative JSON data is parsed (`JSON.parse`); zero dynamic `eval`, `Function`, or remote asset loading exists anywhere.

---

## 3. `.luma` Schema (`LumaCustomStageFile`)

```json
{
  "format": "luma",
  "formatVersion": 1,
  "engineVersion": "unbound-1.0.0",
  "id": "custom_example_01",
  "title": "Echo Clockwork",
  "description": "Record an Echo onto the Chrono Plate.",
  "difficulty": "balanced",
  "authorAlias": "Wayfinder",
  "worldTheme": "world_6",
  "createdAt": 1731800000000,
  "updatedAt": 1731800000000,
  "stageHash": "3f9a1c2b",
  "verifiedSolvable": true,
  "tags": ["echo", "temporal"],
  "level": { "...": "Validated LevelDef payload" }
}
```

### Deterministic `stageHash`
`computeStageHash(level)` in `src/game/echoEngine.ts` computes a canonical 32-bit FNV-1a hex digest over spawn, sorted tiles, switches, echo plates, gates, rotating bridges, lifts, emitters, prisms, sub-crystals, hero nodes, synergy nodes, crystal, and portal. Cosmetics, decor props, and flavor descriptions do **not** alter puzzle physics and are excluded from `stageHash`.

---

## 4. `.luma-pack` Schema (`LumaStagePackFile`)

```json
{
  "format": "luma-pack",
  "formatVersion": 1,
  "id": "pack_astral_collection",
  "title": "Astral Relay Pack",
  "description": "Curated challenges for Echo Duels.",
  "authorAlias": "Astral Iris",
  "createdAt": 1731800000000,
  "stages": [ "...1 to 20 LumaCustomStageFile objects..." ]
}
```

---

## 5. `.luma-replay` Schema & Verification (`LumaReplayFile`)

```json
{
  "format": "luma-replay",
  "formatVersion": 1,
  "engineVersion": "unbound-1.0.0",
  "stageHash": "3f9a1c2b",
  "stageTitle": "Astral Mirror Duet",
  "characterId": "zeph",
  "companionId": null,
  "clearSeconds": 4.27,
  "actionsUsed": 2,
  "stars": 3,
  "tickRate": 30,
  "frames": [
    { "tick": 0, "moveX": 1, "moveZ": 0 },
    { "tick": 38, "moveX": 0, "moveZ": -1, "interact": true }
  ],
  "keyEvents": [],
  "createdAt": 1731800000000,
  "challengerAlias": "Astral Iris",
  "verified": true
}
```

### Honest Verification (`Deterministically Verified` vs `Unverified Visual Reference`)
When a `.luma-replay` is imported into **Echo Duels** or **Community Foundry**, `verifyReplayDeterministically(level, replay)` simulates the fixed-timestep 30 Hz engine from tick 0:
- If `engineVersion === LUMA_ENGINE_VERSION`, `stageHash === computeStageHash(level)`, `tickRate === 30`, and replaying every input frame + key event completes the stage cleanly, the replay is marked **Deterministically Verified**.
- If the replay's `stageHash` differs (e.g., the stage layout was edited) or deterministic simulation does not complete, the UI honestly labels it **Unverified Visual Reference** rather than claiming verified speedrun parity.
