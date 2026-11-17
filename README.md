# LUMA: Floating Worlds

<p align="center">
  <strong>A Journey Across Worlds Beyond.</strong>
</p>

<p align="center">
  An open-source, browser-based 3D puzzle adventure featuring five playable heroes, six floating worlds, and sixty handcrafted stages.
</p>

<p align="center">
  <strong>ZERO LOGIN · ZERO BACKEND · ZERO SERVER DATABASE</strong>
</p>

---

## About

**LUMA: Floating Worlds** is a stylized 3D isometric puzzle adventure set across a mysterious archipelago of floating islands.

Explore ancient ruins, restore forgotten worlds, solve interconnected environmental puzzles, discover hidden memories, and unlock new heroes and cosmetic rewards.

Travel through six unique regions, master sixty handcrafted stages, and uncover the secrets of the floating archipelago.

LUMA is designed as a completely browser-based experience. Players can start playing immediately without creating an account, registering, or connecting to a cloud service.

**Your adventure. Your world. Your save.**

## Features

### 60 Handcrafted Stages

Explore 60 stages distributed across six distinctive worlds.

| World | Stages | Theme |
|---|---:|---|
| The First Light | 01–10 | Ancient floating islands and original LUMA puzzles |
| Verdant Reach | 11–20 | Enchanted forests and overgrown ruins |
| Tidal Expanse | 21–30 | Floating lagoons and ancient waterways |
| Emberfall Dominion | 31–40 | Volcanic islands and forgotten forges |
| Celestial Frontier | 41–50 | Sky temples and celestial observatories |
| The Echo Trials | 51–60 | Advanced puzzle challenges |

### Five Playable Heroes

Discover five original characters, each with a unique identity and signature ability.

| Hero | Signature Ability |
|---|---|
| The Wayfinder | Lantern Focus |
| Sylvi | Rootcall |
| Neris | Tidal Pulse |
| Kael | Ember Spark |
| Zeph | Windstep |

Character abilities interact with special regional mechanisms and environmental objects.

All sixty stages remain completable with the starting hero, The Wayfinder. Additional heroes provide alternative interactions and gameplay opportunities without mandatory character lockouts.

### Environmental Puzzle Systems

Master interconnected environmental mechanisms:

- Pressure switches and gates.
- Latch, toggle, and inverted switch logic.
- Rotating platforms and bridges.
- Elevation platforms and lifts.
- Light emitters and directional prisms.
- Sub-Crystal Resonators.
- Multi-stage crystal activation.
- Character-specific environmental interactions.

### Mastery & Progression

Improve your performance across the entire campaign.

- 180 possible mastery stars.
- Three-star rating per stage.
- Individual time and action targets.
- Personal best records.
- Luma Shards.
- 60 collectible Echo Fragments.
- 32 achievements.
- Cosmetic unlock progression.

### Wardrobe & Customization

Personalize your heroes with 51 cosmetic items across seven categories:

- Cloaks.
- Lanterns.
- Headwear.
- Backpacks.
- Auras.
- Palettes.
- Sets.

Preview characters in 3D, customize their appearance, and unlock additional rewards through progression.

### Echo Codex & Trophies

Discover hidden memories, track collectible progress, and explore achievements throughout the campaign.

### Developer Suite

LUMA also includes an internal development and testing environment.

Available exclusively in development builds.

Features include:

- Admin Console.
- God Mode.
- Direct access to all 60 stages.
- Player teleportation and free camera.
- Puzzle Inspector.
- World Inspector.
- Object Inspector.
- Tile, collision, elevation, and light-path overlays.
- Rendering diagnostics.
- QA Test Runner.
- Event Log.
- Debug session isolation.

Activate using `Ctrl + Shift + G` during development.

Developer tools are excluded from production builds.

---

## Visual Direction

LUMA features a handcrafted stylized low-poly 3D art direction.

Visual characteristics:

- Isometric orthographic perspective.
- Low-poly geometry.
- Handcrafted miniature environments.
- Soft directional lighting.
- Atmospheric floating islands.
- Stylized vegetation and architecture.
- Crystal-based lighting and visual effects.
- Cohesive regional color palettes.

The goal is to create a distinctive fantasy world with carefully designed environments rather than procedurally generated visual clutter.

---

## Screenshots

<!-- Add screenshots or gameplay GIFs here before publishing. -->

Suggested screenshots:

- Main Title Screen.
- The Convergence / Central Hub.
- World Atlas.
- Character Selection.
- Wardrobe.
- The First Light.
- Verdant Reach.
- Tidal Expanse.
- Emberfall Dominion.
- Celestial Frontier.
- The Echo Trials.
- Puzzle Gameplay.
- Developer Suite.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Application framework |
| TypeScript | Type safety and game logic |
| Three.js | 3D rendering |
| React Three Fiber | React-based Three.js integration |
| @react-three/drei | 3D utilities and helpers |
| Tailwind CSS v4 | UI styling |
| Vite | Development and production build |
| Web Audio API | Procedural audio |
| LocalStorage | Local game progression and preferences |

### Architecture

LUMA is a frontend-only single-page application.

There is no required application backend, authentication service, or server-side game database.

The game runs directly in the player's browser.

---

## Privacy & Local Save System

LUMA follows a local-first design philosophy.

**No accounts. No login. No server database. No cloud save.**

Player progression is stored locally in the browser using LocalStorage.

Saved game information includes supported progression data such as:

- Stage completion.
- Hero unlocks.
- Mastery progression.
- Cosmetic unlocks.
- Collectibles.
- Achievements.
- Game preferences.

### Important Storage Information

Local saves are associated with the browser profile and website origin.

This means:

- Progress remains available after refreshing or reopening the game in the same browser profile.
- Clearing browser or website data can permanently remove local progress.
- Private browsing sessions may not retain progress after the session ends.
- Progress does not automatically synchronize between browsers or devices.
- A different hosting domain has separate browser storage.

There is no automatic cloud recovery.

Manual save transfer through export/import is intended as a future capability.

LUMA does not require players to provide personal information to access gameplay.

---

## Getting Started

### Requirements

- Node.js.
- npm.
- A modern web browser.
- WebGL-compatible graphics support.

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/luma-floating-worlds.git
```

Navigate to the project:

```bash
cd luma-floating-worlds
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL displayed in your terminal.

### Production Build

Build the application:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Available project scripts can be inspected using:

```bash
npm run
```

---

## Controls

| Input | Action |
|---|---|
| WASD / Arrow Keys | Character movement |
| E / Space | Interact |
| Q | Activate character ability |
| Mouse Wheel | Camera zoom |
| R | Restart stage |
| M | Toggle audio |
| Esc / P | Pause |
| Ctrl + Shift + G | Developer Console (development only) |

Some interface controls may also be available through on-screen buttons.

---

## Testing

The project includes automated tests for game rules, progression, world definitions, and developer tools.

Run the existing test suites:

```bash
npx --yes tsx --test \
  src/game/rules.test.ts \
  src/game/mastery.test.ts \
  src/game/worlds.test.ts \
  src/dev/devSuite.test.ts
```

Run the TypeScript check:

```bash
npx tsc --noEmit
```

Build the production application:

```bash
npm run build
```

The reported development milestone includes 39 passing automated tests, successful TypeScript checks, successful production builds, and browser verification.

---

## Roadmap

LUMA is an evolving open-source game.

Potential future developments include:

- The Living Archipelago central hub.
- Interactive NPCs and dialogue.
- Main story and side quests.
- Hero personal storylines.
- Progressive world restoration.
- Interactive world map.
- Per-stage checkpoint improvements.
- Session history.
- Save export and import.
- Additional environmental interactions.
- Further visual and audio improvements.

Roadmap items are not necessarily implemented in the current release.

---

## Open Source

LUMA is intended to be developed and distributed as an open-source project.

Community contributions, bug reports, gameplay feedback, and development suggestions are welcome.

Before submitting a contribution:

1. Check existing issues.
2. Describe the proposed change.
3. Keep the existing visual identity consistent.
4. Avoid breaking existing stage solutions and save compatibility.
5. Include appropriate tests for gameplay logic changes.

See the repository's contribution guidelines when available.

---

## License

A license has not yet been specified in this README.

Add the selected open-source license as a `LICENSE` file before public release.

---

<p align="center">
  <strong>LUMA: FLOATING WORLDS</strong>
  <br/>
  Explore six worlds. Master sixty stages. Restore the floating archipelago.
  <br/><br/>
  Made for explorers, puzzle lovers, and fans of handcrafted fantasy worlds.
</p>
