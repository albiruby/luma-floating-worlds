# Contributing to LUMA: Floating Worlds — Unbound

Thank you for exploring and contributing to **LUMA: Floating Worlds**. Every contribution must preserve the project's core principles:

1. **Zero Login · Zero Database · Zero Tracking · Zero External CDNs**: All runtime features, saves, exports, PNG scorecards, and Daily Rift seeds must execute 100% locally in the browser using `localStorage` and bundled assets.
2. **Modular Pure Logic**: Game rules (`src/game/rules.ts`), Echo Engine (`src/game/echoEngine.ts`), stage validation (`src/game/stageValidator.ts`), Daily Rift generation (`src/game/dailyRift.ts`), and custom format sanitization (`src/game/customFormats.ts`) live separately from Three.js rendering (`src/three/*`) and React UI (`src/ui/*`) so they remain unit-testable in Node.
3. **Campaign Integrity**: All 60 official campaign levels, 180 Mastery Stars, 60 Echo Fragments, 51 cosmetics, and 30 quests must remain solvable and backward-compatible across save migrations (`v1 → v2 → v3 → v4`).
4. **Dev-Only Tooling Isolation**: Internal QA tools inside `src/dev/` must only load when `import.meta.env.DEV` is true and must never be bundled into `dist/`.

---

## Local Development Setup

```bash
npm install
npm run dev       # Starts development server on http://localhost:3000
```

## Running Tests & Verification

Before opening a pull request, verify all unit tests, TypeScript checks, and production bundling:

```bash
# Run all pure-logic & Developer Suite tests (Node native test runner via tsx)
npx --yes tsx --test src/game/*.test.ts src/dev/devSuite.test.ts

# TypeScript typecheck
npm run lint

# Production build check (verifies dist/ excludes src/dev/*)
NODE_ENV=production npm run build
```

## Internal Developer Console (Dev Builds Only)

While running `npm run dev`, press `Ctrl + Shift + G` to toggle the **LUMA Developer Console**, including:
- Level jumping across all 60 campaign stages and The Convergence Hub
- **Unbound Inspector**: Inspect `stageHash`, toggle Echo Plates & Synergy Nodes, inspect 2-Hero Party state, and invoke the BFS Stage Validator
- **QA Test Runner**: Run full regression checks (`All 60 Stages`, `Puzzle Systems`, `Save & Isolation`, `Mastery`, `Cosmetics`, `Unbound Systems`, and `Rendering Check`)

Note: Developer Console sessions intentionally mark themselves as `PROGRESS NOT SAVED` so debugging overrides never corrupt player saves.
