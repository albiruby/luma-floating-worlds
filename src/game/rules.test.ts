import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevelById, LEVELS } from './levels';
import {
  canTraverseBetween,
  createInitialPlayerState,
  createInitialPuzzleState,
  executeInteraction,
  findNearestInteraction,
  getSurfaceAtTile,
  isGateOpen,
  isPointWalkable,
  stepPlayerMovement,
} from './rules';
import {
  DEFAULT_PROGRESS,
  recordLevelCompletion,
  validateSaveProgress,
} from './progression';
import { LevelDef, PlayerRuntimeState, PuzzleRuntimeState, TILE_SIZE } from './types';

function getReachableTiles(
  level: LevelDef,
  state: PuzzleRuntimeState,
  startGx: number,
  startGz: number
): Set<string> {
  const visited = new Set<string>();
  const queue: Array<[number, number]> = [[startGx, startGz]];
  visited.add(`${startGx},${startGz}`);

  const dirs: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const [gx, gz] = queue.shift()!;
    const cur = getSurfaceAtTile(level, state, gx, gz);
    if (!cur || !cur.walkable) continue;

    for (const [dx, dz] of dirs) {
      const nx = gx + dx;
      const nz = gz + dz;
      const key = `${nx},${nz}`;
      if (visited.has(key)) continue;
      const next = getSurfaceAtTile(level, state, nx, nz);
      if (canTraverseBetween(cur, next)) {
        // Also ensure tile center and edge midpoints satisfy point walkability
        const midX = (gx + dx * 0.5) * TILE_SIZE;
        const midZ = (gz + dz * 0.5) * TILE_SIZE;
        const canStepMid =
          isPointWalkable(level, state, midX, midZ, gx, gz) ||
          isPointWalkable(level, state, midX, midZ, nx, nz);
        if (canStepMid) {
          visited.add(key);
          queue.push([nx, nz]);
        }
      }
    }
  }

  return visited;
}

function playerAtTile(
  level: LevelDef,
  state: PuzzleRuntimeState,
  gx: number,
  gz: number
): PlayerRuntimeState {
  const s = getSurfaceAtTile(level, state, gx, gz);
  assert.ok(s && s.walkable, `Tile (${gx},${gz}) must be walkable`);
  return {
    ...createInitialPlayerState(level),
    x: gx * TILE_SIZE,
    z: gz * TILE_SIZE,
    y: s.elevation * 0.65,
    lastStepTileKey: `${gx},${gz}`,
  };
}

function walkToTileAndTriggerLatch(
  level: LevelDef,
  state: PuzzleRuntimeState,
  reachableFrom: [number, number],
  gx: number,
  gz: number
): PuzzleRuntimeState {
  const reachable = getReachableTiles(level, state, reachableFrom[0], reachableFrom[1]);
  assert.ok(
    reachable.has(`${gx},${gz}`),
    `Level ${level.id}: expected tile (${gx},${gz}) to be reachable from (${reachableFrom[0]},${reachableFrom[1]})`
  );
  const res = stepPlayerMovement(
    level,
    state,
    playerAtTile(level, state, gx, gz),
    0,
    0,
    0.05
  );
  // Step onto tile cleanly via a tiny nudge from prev tile key
  const prevPlayer = {
    ...playerAtTile(level, state, gx, gz),
    lastStepTileKey: 'different',
  };
  const stepRes = stepPlayerMovement(level, state, prevPlayer, 0, 0, 0.05);
  return stepRes.puzzleState ?? res.puzzleState;
}

function interactFromTile(
  level: LevelDef,
  state: PuzzleRuntimeState,
  reachableFrom: [number, number],
  standGx: number,
  standGz: number,
  expectedKind: string,
  expectedId: string,
  times = 1
): PuzzleRuntimeState {
  const reachable = getReachableTiles(level, state, reachableFrom[0], reachableFrom[1]);
  assert.ok(
    reachable.has(`${standGx},${standGz}`),
    `Level ${level.id}: stand tile (${standGx},${standGz}) must be reachable from (${reachableFrom[0]},${reachableFrom[1]}) before interacting with ${expectedId}`
  );
  let nextState = state;
  const p = playerAtTile(level, nextState, standGx, standGz);
  for (let i = 0; i < times; i++) {
    const target = findNearestInteraction(level, nextState, p);
    assert.ok(target, `Level ${level.id}: expected interaction target near (${standGx},${standGz})`);
    assert.equal(target.kind, expectedKind);
    assert.equal(target.id, expectedId);
    nextState = executeInteraction(level, nextState, target);
  }
  return nextState;
}

test('Exactly 60 handcrafted levels exist with unique IDs 1..60', () => {
  assert.equal(LEVELS.length, 60);
  assert.deepEqual(
    LEVELS.map((l) => l.id),
    Array.from({ length: 60 }, (_, idx) => idx + 1)
  );
  for (const lvl of LEVELS) {
    const seen = new Set<string>();
    for (const t of lvl.tiles) {
      const k = `${t.x},${t.z}`;
      assert.equal(seen.has(k), false, `Level ${lvl.id} has duplicate tile at (${k})`);
      seen.add(k);
    }
    const state = createInitialPuzzleState(lvl);
    const spawn = getSurfaceAtTile(lvl, state, lvl.spawn.x, lvl.spawn.z);
    assert.ok(spawn && spawn.walkable, `Level ${lvl.id} spawn must be walkable`);
  }
});

test('Level 01: pressure switch opens gate, crystal restores, portal completes level', () => {
  const level = getLevelById(1);
  let state = createInitialPuzzleState(level);
  let player = createInitialPlayerState(level);

  assert.equal(isGateOpen(level, state, 'gate1'), false);
  assert.equal(getSurfaceAtTile(level, state, 0, 0)?.walkable, false);

  player = { ...player, x: -2 * TILE_SIZE, z: -1.6 * TILE_SIZE };
  const stepRes = stepPlayerMovement(level, state, player, 0, -1, 0.25);
  state = stepRes.puzzleState;
  assert.equal(stepRes.triggeredSwitchId, 'sw1');
  assert.equal(isGateOpen(level, state, 'gate1'), true);
  assert.equal(getSurfaceAtTile(level, state, 0, 0)?.walkable, true);

  state = interactFromTile(level, state, [-2, -2], 1, 0, 'crystal', 'crystal1', 1);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  const reachable = getReachableTiles(level, state, 1, 0);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 02: rotating bridges, elevation lift, and switch-linked gate form valid solution path', () => {
  const level = getLevelById(2);
  let state = createInitialPuzzleState(level);

  assert.equal(getSurfaceAtTile(level, state, -1, 0), null);
  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -2, 0, 'rotating', 'rot1', 1);
  assert.equal(getSurfaceAtTile(level, state, -1, 0)?.walkable, true);

  state = walkToTileAndTriggerLatch(level, state, [-2, 0], 4, 1);
  assert.equal(isGateOpen(level, state, 'gate2'), true);

  state = interactFromTile(level, state, [4, 1], 2, -1, 'elevation', 'lift1', 1);
  assert.equal(getSurfaceAtTile(level, state, 2, -1)?.elevation, 1);

  state = interactFromTile(level, state, [2, -1], 3, -2, 'rotating', 'rot2', 1);
  state = interactFromTile(level, state, [3, -2], 7, -2, 'crystal', 'crystal2', 1);
  assert.equal(state.portalAwakened, true);

  const reachable = getReachableTiles(level, state, 7, -2);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 03: gate blocks beam until switch opens; aligning 3 prisms activates central crystal', () => {
  const level = getLevelById(3);
  let state = createInitialPuzzleState(level);

  assert.deepEqual(state.litPrismIds, ['prism1']);
  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -1, 0, 'prism', 'prism1', 2);
  assert.equal(state.lightSegments[1]?.hitType, 'gate');

  state = walkToTileAndTriggerLatch(level, state, [-1, 0], -2, 2);
  assert.equal(state.litPrismIds.includes('prism2'), true);

  state = interactFromTile(level, state, [-2, 2], 0, -2, 'prism', 'prism2', 2);
  assert.equal(state.litPrismIds.includes('prism3'), true);

  // Ride lift3 to East Balcony -> descend stair (3,-1) -> reach prism3 from (3,-3)
  state = interactFromTile(level, state, [0, -2], 2, 1, 'elevation', 'lift3', 1);
  state = interactFromTile(level, state, [2, 1], 3, -3, 'prism', 'prism3', 3);
  assert.equal(state.crystalLitByBeam, true);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  const reachable = getReachableTiles(level, state, 3, -3);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 04: The Ascension multi-tier lifts, switch gate, and summit crystal', () => {
  const level = getLevelById(4);
  let state = createInitialPuzzleState(level);

  // Ride lower lift from elev 0 -> 1
  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -1, 0, 'elevation', 'lift4a', 1);
  assert.equal(getSurfaceAtTile(level, state, -1, 0)?.elevation, 1);

  // Trigger terrace switch sw4 -> opens gate4
  assert.equal(isGateOpen(level, state, 'gate4'), false);
  state = walkToTileAndTriggerLatch(level, state, [-1, 0], 0, 1);
  assert.equal(isGateOpen(level, state, 'gate4'), true);

  // Ride spire lift from elev 1 -> 2
  state = interactFromTile(level, state, [0, 1], 2, -1, 'elevation', 'lift4b', 1);
  assert.equal(getSurfaceAtTile(level, state, 2, -1)?.elevation, 2);

  // Ascend stair at (4,-1) to summit crystal at (4,1) and portal at (5,2)
  state = interactFromTile(level, state, [2, -1], 4, 0, 'crystal', 'crystal4', 1);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  const reachable = getReachableTiles(level, state, 4, 0);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 05: The Forgotten Garden water tiles, inverted twin gates, and shrine bridges', () => {
  const level = getLevelById(5);
  let state = createInitialPuzzleState(level);

  // Pond water tiles must block movement
  assert.equal(getSurfaceAtTile(level, state, -3, -1)?.walkable, false);
  assert.equal(getSurfaceAtTile(level, state, 3, 0)?.walkable, false);

  // Initial twin gate state: gate5b closed, gate5c open (inverted)
  assert.equal(isGateOpen(level, state, 'gate5b'), false);
  assert.equal(isGateOpen(level, state, 'gate5c'), true);

  // Activate sw5a and rotate rot5a
  state = walkToTileAndTriggerLatch(level, state, [level.spawn.x, level.spawn.z], -2, 2);
  assert.equal(isGateOpen(level, state, 'gate5a'), true);
  state = interactFromTile(level, state, [-2, 2], -2, -2, 'rotating', 'rot5a', 1);

  // Toggle sw5b ON -> opens gate5b, closes gate5c
  state = interactFromTile(level, state, [-2, -2], 2, 2, 'switch', 'sw5b', 1);
  assert.equal(isGateOpen(level, state, 'gate5b'), true);
  assert.equal(isGateOpen(level, state, 'gate5c'), false);

  // Walk through gate5b to (4,1) to rotate rot5b
  state = interactFromTile(level, state, [2, 2], 4, 1, 'rotating', 'rot5b', 1);

  // Toggle sw5b OFF -> opens gate5c so player can cross rot5b to East Shrine
  state = interactFromTile(level, state, [4, 1], 2, 2, 'switch', 'sw5b', 1);
  assert.equal(isGateOpen(level, state, 'gate5c'), true);

  state = interactFromTile(level, state, [2, 2], 8, -1, 'crystal', 'crystal5', 1);
  assert.equal(state.portalAwakened, true);

  const reachable = getReachableTiles(level, state, 8, -1);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 06: The Crystal Maze sequential resonator unlocks second beam and central crystal', () => {
  const level = getLevelById(6);
  let state = createInitialPuzzleState(level);

  assert.equal(isGateOpen(level, state, 'gate6'), false);

  // Aim prism6a -> prism6b -> sub1
  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -1, 2, 'prism', 'prism6a', 2);
  assert.equal(state.litPrismIds.includes('prism6b'), true);

  state = interactFromTile(level, state, [-1, 2], -2, -3, 'prism', 'prism6b', 2);
  assert.equal(state.litSubCrystalIds.includes('sub1'), true);
  assert.equal(isGateOpen(level, state, 'gate6'), true);
  assert.equal(state.litPrismIds.includes('prism6c'), true);

  // Aim prism6c -> prism6d -> crystal6
  state = interactFromTile(level, state, [-2, -3], 1, 0, 'prism', 'prism6c', 2);
  assert.equal(state.litPrismIds.includes('prism6d'), true);

  state = interactFromTile(level, state, [1, 0], 2, 0, 'prism', 'prism6d', 3);
  assert.equal(state.crystalLitByBeam, true);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  const reachable = getReachableTiles(level, state, 2, 0);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 07: The Shattered Realm connects 4 islands with lifts, rotating bridges, gate, and light beam', () => {
  const level = getLevelById(7);
  let state = createInitialPuzzleState(level);

  // Island A -> rotate rot7a -> Island B
  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -4, 1, 'rotating', 'rot7a', 1);
  state = walkToTileAndTriggerLatch(level, state, [-4, 1], 0, 2);
  assert.equal(isGateOpen(level, state, 'gate7'), true);

  // Ride lift7a -> upper Island B -> rotate rot7b -> Island C
  state = interactFromTile(level, state, [0, 2], 1, 0, 'elevation', 'lift7a', 1);
  state = interactFromTile(level, state, [1, 0], 1, -2, 'rotating', 'rot7b', 1);

  // Aim prism7a -> prism7b -> crystal7 across chasm
  state = interactFromTile(level, state, [1, -2], 6, -2, 'prism', 'prism7a', 2);
  assert.equal(state.litPrismIds.includes('prism7b'), true);

  state = interactFromTile(level, state, [6, -2], 7, 1, 'prism', 'prism7b', 1);
  assert.equal(state.crystalLitByBeam, true);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  // Cross initialHigh lift7b at (5,2) to Island D portal (3,2)
  const reachable = getReachableTiles(level, state, 7, 1);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 08: The Skyforge switch-linked lift-bridge, dual bridges, and anvil sanctuary', () => {
  const level = getLevelById(8);
  let state = createInitialPuzzleState(level);

  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -3, 0, 'rotating', 'rot8a', 1);
  // Step on sw8a -> raises lift8_bridge
  state = walkToTileAndTriggerLatch(level, state, [-3, 0], 1, 2);
  assert.equal(getSurfaceAtTile(level, state, 0, -2)?.elevation, 1);

  // Raise manual crucible lift -> cross upper forge catwalk -> rotate rot8b
  state = interactFromTile(level, state, [1, 2], -1, 0, 'elevation', 'lift8_manual', 1);
  state = interactFromTile(level, state, [-1, 0], 2, -2, 'rotating', 'rot8b', 1);

  // Trigger sw8b -> open gate8b -> walk around pillars to crystal8 -> portal8
  state = walkToTileAndTriggerLatch(level, state, [2, -2], 8, -2);
  assert.equal(isGateOpen(level, state, 'gate8b'), true);

  state = interactFromTile(level, state, [8, -2], 6, 0, 'crystal', 'crystal8', 1);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  const reachable = getReachableTiles(level, state, 6, 0);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 09: The Celestial Observatory channels starlight across chasm and ascends to portal', () => {
  const level = getLevelById(9);
  let state = createInitialPuzzleState(level);

  // Crank bridge rot9 + rotate deck prism9a
  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -3, 1, 'rotating', 'rot9', 1);
  state = interactFromTile(level, state, [-3, 1], -3, -1, 'prism', 'prism9a', 3);

  // Trigger sw9 on central plaza -> open gate9 -> align prism9b, prism9c, prism9d
  state = walkToTileAndTriggerLatch(level, state, [-3, -1], 2, 2);
  assert.equal(isGateOpen(level, state, 'gate9'), true);

  state = interactFromTile(level, state, [2, 2], 2, 0, 'prism', 'prism9b', 3);
  assert.equal(state.litPrismIds.includes('prism9c'), true);

  state = interactFromTile(level, state, [2, 0], 4, -2, 'prism', 'prism9c', 3);
  assert.equal(state.litPrismIds.includes('prism9d'), true);

  state = interactFromTile(level, state, [4, -2], 4, 2, 'prism', 'prism9d', 3);
  assert.equal(state.crystalLitByBeam, true);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  // Ascend telescope lift9 to portal9
  state = interactFromTile(level, state, [4, 2], 2, -2, 'elevation', 'lift9', 1);
  const reachable = getReachableTiles(level, state, 2, -2);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Level 10: The Eternal Light unites all 4 mechanics through resonator gate to final portal', () => {
  const level = getLevelById(10);
  let state = createInitialPuzzleState(level);

  // Stage 1 -> Stage 2
  state = interactFromTile(level, state, [level.spawn.x, level.spawn.z], -4, 1, 'rotating', 'rot10a', 1);
  state = walkToTileAndTriggerLatch(level, state, [-4, 1], 2, 2);
  assert.equal(isGateOpen(level, state, 'gate10a'), true);

  // Courtyard beam -> sub10 -> opens gate10b on elev 1
  state = interactFromTile(level, state, [2, 2], 0, 0, 'prism', 'prism10a', 3);
  assert.equal(state.litPrismIds.includes('prism10b'), true);

  state = interactFromTile(level, state, [0, 0], 3, 0, 'prism', 'prism10b', 2);
  assert.equal(state.litSubCrystalIds.includes('sub10'), true);
  assert.equal(isGateOpen(level, state, 'gate10b'), true);

  // Ride lift10 -> pass gate10b -> crank rot10b -> Stage 3 Eternal Sanctuary
  state = interactFromTile(level, state, [3, 0], 1, 1, 'elevation', 'lift10', 1);
  state = interactFromTile(level, state, [1, 1], 3, 1, 'rotating', 'rot10b', 1);

  // Align sanctuary prisms 10c & 10d -> ignite Eternal Crystal
  state = interactFromTile(level, state, [3, 1], 8, -1, 'prism', 'prism10c', 3);
  assert.equal(state.litPrismIds.includes('prism10d'), true);

  state = interactFromTile(level, state, [8, -1], 9, 2, 'prism', 'prism10d', 1);
  assert.equal(state.crystalLitByBeam, true);
  assert.equal(state.crystalRestored, true);
  assert.equal(state.portalAwakened, true);

  // Walk to final portal10 at (8, 3)
  const reachable = getReachableTiles(level, state, 9, 2);
  assert.ok(reachable.has(`${level.portal.x},${level.portal.z}`));
});

test('Collision prevents walking into void, closed gate, or water pond', () => {
  const level1 = getLevelById(1);
  const state1 = createInitialPuzzleState(level1);
  const player1 = {
    ...createInitialPlayerState(level1),
    x: -1 * TILE_SIZE,
    z: 0,
  };
  const res1 = stepPlayerMovement(level1, state1, player1, 1, 0, 0.5);
  assert.ok(res1.player.x < 0 * TILE_SIZE - 0.5);

  const level5 = getLevelById(5);
  const state5 = createInitialPuzzleState(level5);
  const player5 = {
    ...createInitialPlayerState(level5),
    x: -4 * TILE_SIZE,
    z: -1 * TILE_SIZE,
  };
  const res5 = stepPlayerMovement(level5, state5, player5, 1, 0, 0.5);
  assert.ok(res5.player.x < -3 * TILE_SIZE - 0.5);
});

test('Progression preserves 3-level saves and unlocks Level 4 automatically', () => {
  const legacy3LevelSave = validateSaveProgress({
    completedLevels: [1, 2, 3],
    highestUnlockedLevel: 3,
    bestTimes: { 1: 14.2, 2: 28.1, 3: 41.5 },
  });
  assert.deepEqual(legacy3LevelSave.completedLevels, [1, 2, 3]);
  assert.equal(legacy3LevelSave.highestUnlockedLevel, 4);
  assert.deepEqual(legacy3LevelSave.bestTimes, { 1: 14.2, 2: 28.1, 3: 41.5 });

  const corrupted = validateSaveProgress({
    completedLevels: [1, 99, 'bad', 1],
    highestUnlockedLevel: -5,
    bestTimes: { 1: 12.4, 2: -10, 99: 5 },
    settings: { soundEnabled: 'yes', volume: 5, cameraZoomOffset: 99 },
  });

  assert.deepEqual(corrupted.completedLevels, [1]);
  assert.equal(corrupted.highestUnlockedLevel, 2);
  assert.deepEqual(corrupted.bestTimes, { 1: 12.4 });
  assert.equal(corrupted.settings.soundEnabled, true);
  assert.equal(corrupted.settings.volume, 1);
  assert.equal(corrupted.settings.cameraZoomOffset, 0.35);

  const afterL10 = recordLevelCompletion(DEFAULT_PROGRESS, 10, 52.0);
  assert.equal(afterL10.highestUnlockedLevel, 11);
  assert.deepEqual(afterL10.completedLevels, [10]);

  const afterL60 = recordLevelCompletion(DEFAULT_PROGRESS, 60, 52.0);
  assert.equal(afterL60.highestUnlockedLevel, 60);
});
