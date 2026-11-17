import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevelById } from '../game/levels';
import {
  createInitialPlayerState,
  createInitialPuzzleState,
  getElevationPlatformHeight,
  getSurfaceAtTile,
  isGateOpen,
} from '../game/rules';
import { TILE_SIZE } from '../game/types';
import { DevEventEntry } from './debugTypes';
import {
  appendDevEvent,
  createDevEvent,
  filterDevEvents,
  serializeDevEventsJson,
} from './DebugEvents';
import {
  clonePlayerState,
  clonePuzzleState,
  countPuzzleOverrides,
  forceCrystalState,
  forceGateOverride,
  forceHeroNodeActive,
  forceSwitchState,
  resetPuzzleToInitial,
  setElevationPlatformState,
  setEmitterEnabled,
  setPrismDirection,
  setRotatingPlatformStep,
  teleportPlayerToTile,
} from './debugAdapter';
import { executeQASuite } from './qaRunner';
import {
  buildLevelObjectInventory,
  buildPuzzleConnectionLinks,
  computeWorldTileWalkability,
} from './worldInventory';

test('debugAdapter operates through real rules.ts state without fake bypasses', () => {
  const l1 = getLevelById(1);
  let s1 = createInitialPuzzleState(l1);
  assert.equal(isGateOpen(l1, s1, 'gate1'), false);

  s1 = forceSwitchState(l1, s1, 'sw1', true);
  assert.equal(isGateOpen(l1, s1, 'gate1'), true);
  assert.equal(getSurfaceAtTile(l1, s1, 0, 0)?.walkable, true);

  // Force gate closed overrides switch polarity cleanly
  s1 = forceGateOverride(l1, s1, 'gate1', 'closed');
  assert.equal(isGateOpen(l1, s1, 'gate1'), false);
  assert.equal(getSurfaceAtTile(l1, s1, 0, 0)?.walkable, false);

  // Clear gate override restores switch-driven open state
  s1 = forceGateOverride(l1, s1, 'gate1', null);
  assert.equal(isGateOpen(l1, s1, 'gate1'), true);

  s1 = forceCrystalState(l1, s1, true);
  assert.equal(s1.crystalRestored, true);
  assert.equal(s1.portalAwakened, true);
  assert.ok(countPuzzleOverrides(l1, s1) >= 1);

  const reset = resetPuzzleToInitial(l1);
  assert.equal(reset.crystalRestored, false);
  assert.equal(reset.portalAwakened, false);
  assert.equal(isGateOpen(l1, reset, 'gate1'), false);
});

test('debugAdapter rotating platforms, elevation lifts, emitters, prisms, and teleport', () => {
  const l6 = getLevelById(6);
  let s6 = createInitialPuzzleState(l6);
  s6 = setPrismDirection(l6, s6, 'prism6a', 3);
  s6 = setPrismDirection(l6, s6, 'prism6b', 0);
  assert.equal(s6.litSubCrystalIds.includes('sub1'), true);
  assert.equal(isGateOpen(l6, s6, 'gate6'), true);

  for (const em of l6.lightEmitters) {
    s6 = setEmitterEnabled(l6, s6, em.id, false);
  }
  assert.equal(s6.lightSegments.length, 0);

  const l2 = getLevelById(2);
  let s2 = createInitialPuzzleState(l2);
  s2 = setRotatingPlatformStep(l2, s2, 'rot1', 2);
  assert.equal(getSurfaceAtTile(l2, s2, -1, 0)?.walkable, true);

  s2 = setElevationPlatformState(l2, s2, 'lift1', true);
  assert.equal(getElevationPlatformHeight(l2, s2, 'lift1'), 1);

  const p2 = createInitialPlayerState(l2);
  const tp = teleportPlayerToTile(l2, s2, p2, 7, -2);
  assert.equal(tp.x, 7 * TILE_SIZE);
  assert.equal(tp.z, -2 * TILE_SIZE);

  // Clones are deep enough not to share nested objects
  const clonedS = clonePuzzleState(s6);
  const clonedP = clonePlayerState(tp);
  clonedS.switchStates['extra'] = true;
  clonedS.heroNodesActive['extra_node'] = true;
  clonedP.x = 999;
  assert.equal(s6.switchStates['extra'], undefined);
  assert.equal(s6.heroNodesActive['extra_node'], undefined);
  assert.equal(tp.x, 7 * TILE_SIZE);
});

test('worldInventory builds objects (including Hero Nodes & Echoes), walkability heatmap, void borders & connection graph', () => {
  const l10 = getLevelById(10);
  const s10 = createInitialPuzzleState(l10);
  const inventory = buildLevelObjectInventory(l10, s10);
  assert.ok(inventory.some((i) => i.kind === 'spawn'));
  assert.ok(inventory.some((i) => i.kind === 'crystal' && i.id === 'crystal10'));
  assert.ok(inventory.some((i) => i.kind === 'portal' && i.id === 'portal10'));
  assert.ok(inventory.some((i) => i.kind === 'subcrystal'));
  assert.ok(inventory.some((i) => i.kind === 'echo'));

  const walk = computeWorldTileWalkability(l10, s10);
  assert.ok(walk.tiles.length >= l10.tiles.length);
  assert.ok(walk.voidBorders.length > 0);

  const links = buildPuzzleConnectionLinks(l10, s10);
  assert.ok(links.length >= 3);
  assert.ok(links.some((l) => l.fromKind === 'crystal' && l.toKind === 'portal'));

  const l11 = getLevelById(11);
  let s11 = createInitialPuzzleState(l11, 'sylvi');
  const inv11 = buildLevelObjectInventory(l11, s11);
  assert.ok(inv11.some((i) => i.kind === 'hero_node'));
  assert.ok(inv11.some((i) => i.kind === 'echo'));
  const nodeId = l11.heroNodes![0].id;
  s11 = forceHeroNodeActive(l11, s11, nodeId, true);
  assert.equal(s11.heroNodesActive[nodeId], true);
});

test('DebugEvents logs, filters, caps at 300, and serializes JSON', () => {
  let list: DevEventEntry[] = [];
  for (let i = 0; i < 310; i++) {
    list = appendDevEvent(
      list,
      createDevEvent(i % 2 === 0 ? 'puzzle' : 'player', `EVT_${i}`, 3, `Detail ${i}`, 'gate3')
    );
  }
  assert.equal(list.length, 300);

  const filtered = filterDevEvents(list, 'evt_309', 'player');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].type, 'EVT_309');

  const json = serializeDevEventsJson(filtered);
  const parsed = JSON.parse(json);
  assert.equal(parsed.totalEvents, 1);
  assert.equal(parsed.events[0].objectId, 'gate3');
});

test('QA runner executes all core suites cleanly with zero failures', () => {
  const suites = [
    'current-level',
    'all-levels',
    'puzzle-systems',
    'save-system',
    'mastery',
    'cosmetics',
    'full',
  ] as const;

  for (const suite of suites) {
    const report = executeQASuite(suite, {
      currentLevelId: 10,
      diagnostics: {
        fps: 60,
        avgFrameTimeMs: 16.6,
        drawCalls: 42,
        triangles: 4800,
        geometries: 64,
        textures: 4,
        viewportWidth: 1440,
        viewportHeight: 900,
        cameraPos: { x: 18, y: 15.5, z: 18 },
        cameraTarget: { x: 0, y: 0.4, z: 0 },
        cameraZoom: 1,
        tileCount: 40,
        decorCount: 10,
        mechanismCount: 12,
      },
      devActive: true,
      snapshot: {
        capturedAt: Date.now(),
        screenState: 'playing',
        levelId: 1,
        puzzleState: createInitialPuzzleState(getLevelById(1)),
        playerState: createInitialPlayerState(getLevelById(1)),
      },
    });
    assert.equal(
      report.failed,
      0,
      `Suite "${suite}" failed: ${report.results
        .filter((r) => r.status === 'FAIL')
        .map((r) => `${r.name}: ${r.message}`)
        .join('; ')}`
    );
    assert.ok(report.passed > 0, `Suite "${suite}" should have passing checks`);
  }
});
