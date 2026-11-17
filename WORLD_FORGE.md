# World Forge — 3D Stage Creation Guide

**World Forge** is the built-in 3D isometric stage editor in **LUMA: UNBOUND — Play Beyond Worlds**, reusing LUMA's bundled terrain tiles, elevation blocks, architectural props, puzzle mechanisms, and Web Audio feedback.

---

## 1. Opening World Forge

- From the **Title Screen**, click **World Forge** to start a blank island, or open **Foundry → Create in World Forge** / **Edit in Forge** on any custom creation.
- **Size Presets**:
  - `Small` (`9×9`)
  - `Medium` (`13×13`)
  - `Large` (`17×17`)
  - `XL` (`21×21`)
- Hard safety limits enforced by the editor and validator: up to **260 tiles**, **24×24 grid span**, and **90 total objects**.

---

## 2. Viewport Navigation & Controls

| Action | Input |
| :--- | :--- |
| Place / Paint / Select | Left Click (drag with Brush Tile to paint continuously) |
| Pan Isometric Camera | `W` `A` `S` `D`, Arrow Keys, or Right-Click Drag |
| Zoom In / Out | Mouse Wheel |
| Undo / Redo | Top Bar **Undo** / **Redo** buttons |
| Copy / Paste Selected Tile | Top Bar **Copy Tile** / **Paste Tile** buttons |

---

## 3. Tool Palette

### Inspect & Paint
- **Select**: Click any tile or object to inspect/edit its coordinates, elevation, and connections in the right-hand Inspector.
- **Brush Tile**: Paint tiles using the selected terrain (`grass`, `stone`, `ruin`, `wood`, `water`, `moss`, `sand`, `basalt`, `cloud`). Note that `water` tiles cannot be walked on unless bridged by a rotating bridge, lift, or hero synergy bridge.
- **3×3 Island**: Stamp a 3×3 block of the active terrain.
- **Raise +1 / Lower -1**: Adjust tile elevation between `0` and `3`.
- **Stair**: Toggle stairs on a tile so heroes can climb or descend between adjacent elevations cleanly.
- **Decor**: Place atmospheric props (`tree_pine`, `tree_broad`, `rock_cluster`, `ruin_pillar`, `ruin_arch`, `stone_lantern`, `echo_monolith`, `verdant_arch`, `tidal_fountain`, `ember_brazier_prop`, `celestial_orrery`, `sky_obelisk`).
- **Erase**: Remove decor, mechanisms, or non-anchor tiles cleanly.

### Anchors (Required in Every Stage)
- **Spawn**: Starting tile and facing direction.
- **Crystal**: Primary beacon to restore. Can optionally require a Light Beam (`requiresLightBeam`).
- **Portal**: Exit threshold that unlocks once the Crystal is restored.

### Puzzles & Echoes
- **Switch**: Pressure switches (latching or momentary) linked to gates or lifts.
- **Echo Plate**: Temporal plates, optionally marked **Echo Only** (`echoOnly: true`) so only a recorded Echo ghost can hold them down.
- **Gate**: Barrier tiles (`axis: 'x' | 'z'`) linked to a Switch, Sub-Crystal, Echo Plate, or Synergy Node (supports `inverted` polarity and `blocksLight`).
- **Lift**: Elevation platform moving between `lowElevation` and `highElevation`, optionally linked to a Switch.
- **Bridge**: Rotating platform anchored at a pivot with 4 step orientations.
- **Emitter / Prism / Sub-Cryst**: Directional solar beam sources, 90°-rotatable prisms, and beam targets.
- **Synergy**: Cooperative 2-hero Resonance Nodes (`root_waterway` for Sylvi+Neris, `steam_forge_lift` for Kael+Neris, `wind_rune_relay` for Zeph+Wayfinder).

---

## 4. Connection Linker & Rules Panel

Select any Switch, Echo Plate, Sub-Crystal, Synergy Node, Gate, Lift, Prism, or Crystal in the right Inspector to:
- Bind Gate `linkedSwitchId`, `linkedEchoPlateId`, `linkedSubCrystalId`, or `linkedSynergyId`.
- Bind Lift `linkedSwitchId` and low/high elevation states.
- Toggle **Allow Echo Engine** (`maxEchoes` 1–3) and **Allow 2-Hero Synergy Party** (`requiredCompanion`).
- Edit sanitized stage metadata (**Title**, **Description**, **Author Alias**, **Difficulty**, **World Theme**).

---

## 5. Honest BFS Stage Validator

Click **Validate Stage** in the top bar at any time. `validateCustomLevel()` checks:
1. Structural bounds, anchor existence (`spawn`, `crystal`, `portal`), valid tile footing, and non-broken object links.
2. Bounded BFS state-space reachability from Spawn → Crystal → Portal (`BFS_MAX_STATES = 4500`).

Validation reports one of four honest statuses:
- **VALID**: Structural checks pass and the bounded solver found a reachable path to Crystal & Portal.
- **INVALID**: Missing required anchors, out-of-bounds/blocked placement, broken links, or the bounded solver confirmed no valid solution path exists.
- **WARNING**: Solvable or structurally complete with design notes (e.g., unused switches or unlinked gates).
- **UNVERIFIED**: Complex mechanism state space exceeded the 4,500-state BFS exploration budget without proving insolvability—use **Test Play** to confirm manually.

---

## 6. Test Play, Saving & Exporting

- **Test Play**: Launches your draft immediately inside the live 3D engine with a **Back to Forge** button in the HUD and Pause Menu. **Playtest runs never award campaign Stars, Luma Shards, or Achievements.**
- **Save to Foundry**: Saves the `.luma` creation locally inside `localStorage` under **My Creations** in the Community Foundry.
- **Export `.luma`**: Downloads a portable JSON `.luma` file ready to share with other players offline or via repository/chat.
