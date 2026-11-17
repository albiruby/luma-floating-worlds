import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, getLevelById } from './levels';
import { WORLDS } from './worlds';
import { CHARACTERS, resolveUnlockedCharacters } from './characters';
import { COSMETIC_ITEMS, resolveWayfinderAppearance } from './cosmetics';
import { ACHIEVEMENTS } from './achievements';
import { MASTERY_TARGETS } from './masteryConfig';
import { MAX_CAMPAIGN_STARS } from './mastery';
import {
  activateHeroAbility,
  canTraverseBetween,
  computeLightPropagation,
  createInitialPlayerState,
  createInitialPuzzleState,
  executeInteraction,
  getSurfaceAtTile,
} from './rules';
import {
  purchaseCosmeticInProgress,
  recordLevelCompletionDetailed,
  selectCharacterInProgress,
  validateSaveProgress,
} from './progression';
import { InteractionTarget, LevelDef, PuzzleRuntimeState, TILE_SIZE } from './types';

function getReachableCoords(
  level: LevelDef,
  puzzle: PuzzleRuntimeState,
  startX: number,
  startZ: number
): Set<string> {
  const visited = new Set<string>();
  const queue: Array<{ x: number; z: number }> = [{ x: startX, z: startZ }];
  const startSurf = getSurfaceAtTile(level, puzzle, startX, startZ);
  if (!startSurf || !startSurf.walkable) return visited;
  visited.add(`${startX},${startZ}`);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curSurf = getSurfaceAtTile(level, puzzle, cur.x, cur.z);
    if (!curSurf || !curSurf.walkable) continue;

    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = cur.x + dx;
      const nz = cur.z + dz;
      const nKey = `${nx},${nz}`;
      if (visited.has(nKey)) continue;
      const nSurf = getSurfaceAtTile(level, puzzle, nx, nz);
      if (canTraverseBetween(curSurf, nSurf)) {
        visited.add(nKey);
        queue.push({ x: nx, z: nz });
      }
    }
  }
  return visited;
}

function getTargetInteractionPoint(
  level: LevelDef,
  puzzle: PuzzleRuntimeState,
  reachable: Set<string>,
  targetX: number,
  targetZ: number
): { x: number; z: number } | null {
  for (const [dx, dz] of [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const x = targetX + dx;
    const z = targetZ + dz;
    const key = `${x},${z}`;
    const surf = getSurfaceAtTile(level, puzzle, x, z);
    if (reachable.has(key) && surf && surf.walkable) {
      return { x, z };
    }
  }
  return null;
}

/**
 * Breadth-first puzzle solver over discrete mechanism states for any handcrafted stage
 * proving EVERY Stage 01-60 is 100% completable as 'wayfinder' without hero lockouts!
 */
function solveLevelWithBfs(level: LevelDef): {
  solved: boolean;
  echoReachable: boolean;
  visitedStates: number;
} {
  const initPuzzle = createInitialPuzzleState(level, 'wayfinder');

  const encodeState = (p: PuzzleRuntimeState): string => {
    const rot = Object.keys(p.rotatingSteps)
      .sort()
      .map((k) => `${k}:${p.rotatingSteps[k]}`)
      .join(',');
    const sw = Object.keys(p.switchStates)
      .sort()
      .map((k) => `${k}:${p.switchStates[k] ? 1 : 0}`)
      .join(',');
    const elev = Object.keys(p.elevationHigh)
      .sort()
      .map((k) => `${k}:${p.elevationHigh[k] ? 1 : 0}`)
      .join(',');
    const pr = Object.keys(p.prismDirections)
      .sort()
      .map((k) => `${k}:${p.prismDirections[k]}`)
      .join(',');
    return `${rot}|${sw}|${elev}|${pr}|c:${p.crystalRestored ? 1 : 0}`;
  };

  interface Node {
    puzzle: PuzzleRuntimeState;
    px: number;
    pz: number;
  }

  const getComponentKey = (reach: Set<string>): string => {
    let min = '';
    for (const k of reach) {
      if (!min || k < min) min = k;
    }
    return min;
  };

  const seen = new Set<string>();
  const queue: Node[] = [{ puzzle: initPuzzle, px: level.spawn.x, pz: level.spawn.z }];
  const initReach = getReachableCoords(level, initPuzzle, level.spawn.x, level.spawn.z);
  seen.add(`${encodeState(initPuzzle)}@${getComponentKey(initReach)}`);

  let echoReachable = false;
  let solved = false;
  let expansions = 0;

  while (queue.length > 0 && expansions < 20000) {
    const { puzzle, px, pz } = queue.shift()!;
    expansions++;

    const reach = getReachableCoords(level, puzzle, px, pz);
    if (level.echoFragment) {
      const eKey = `${level.echoFragment.x},${level.echoFragment.z}`;
      if (reach.has(eKey)) {
        echoReachable = true;
      }
    }

    if (puzzle.portalAwakened && reach.has(`${level.portal.x},${level.portal.z}`)) {
      solved = true;
      if (echoReachable || !level.echoFragment) {
        return { solved: true, echoReachable: true, visitedStates: seen.size };
      }
    }

    const actions: Array<{ target: InteractionTarget; nextX: number; nextZ: number }> = [];

    for (const sw of level.pressureSwitches ?? []) {
      if (reach.has(`${sw.x},${sw.z}`)) {
        if (sw.latch && puzzle.switchStates[sw.id]) continue;
        actions.push({
          target: {
            kind: 'switch',
            id: sw.id,
            prompt: sw.label,
            worldX: sw.x * TILE_SIZE,
            worldZ: sw.z * TILE_SIZE,
          },
          nextX: sw.x,
          nextZ: sw.z,
        });
      }
    }

    for (const rot of level.rotatingPlatforms ?? []) {
      const anchor = rot.crankPos ?? { x: rot.pivotX, z: rot.pivotZ };
      const pt = getTargetInteractionPoint(level, puzzle, reach, anchor.x, anchor.z);
      if (pt) {
        actions.push({
          target: {
            kind: 'rotating',
            id: rot.id,
            prompt: rot.label,
            worldX: anchor.x * TILE_SIZE,
            worldZ: anchor.z * TILE_SIZE,
          },
          nextX: pt.x,
          nextZ: pt.z,
        });
      }
    }

    for (const lift of level.elevationPlatforms ?? []) {
      if (lift.linkedSwitchId) continue;
      const pt = getTargetInteractionPoint(level, puzzle, reach, lift.x, lift.z);
      if (pt) {
        actions.push({
          target: {
            kind: 'elevation',
            id: lift.id,
            prompt: lift.label,
            worldX: lift.x * TILE_SIZE,
            worldZ: lift.z * TILE_SIZE,
          },
          nextX: pt.x,
          nextZ: pt.z,
        });
      }
    }

    for (const prism of level.lightPrisms ?? []) {
      const pt = getTargetInteractionPoint(level, puzzle, reach, prism.x, prism.z);
      if (pt) {
        actions.push({
          target: {
            kind: 'prism',
            id: prism.id,
            prompt: prism.label,
            worldX: prism.x * TILE_SIZE,
            worldZ: prism.z * TILE_SIZE,
          },
          nextX: pt.x,
          nextZ: pt.z,
        });
      }
    }

    if (!puzzle.crystalRestored && !level.crystal.requiresLightBeam) {
      const pt = getTargetInteractionPoint(level, puzzle, reach, level.crystal.x, level.crystal.z);
      if (pt) {
        actions.push({
          target: {
            kind: 'crystal',
            id: level.crystal.id,
            prompt: level.crystal.label,
            worldX: level.crystal.x * TILE_SIZE,
            worldZ: level.crystal.z * TILE_SIZE,
          },
          nextX: pt.x,
          nextZ: pt.z,
        });
      }
    }

    for (const act of actions) {
      const nextState = executeInteraction(level, puzzle, act.target);
      const nextReach = getReachableCoords(level, nextState, act.nextX, act.nextZ);
      const sig = `${encodeState(nextState)}@${getComponentKey(nextReach)}`;
      if (!seen.has(sig)) {
        seen.add(sig);
        queue.push({ puzzle: nextState, px: act.nextX, pz: act.nextZ });
      }
    }
  }

  return { solved, echoReachable, visitedStates: seen.size };
}

test('Worlds Beyond structural inventory meets targets', () => {
  assert.equal(LEVELS.length, 60);
  assert.equal(WORLDS.length, 6);
  assert.equal(CHARACTERS.length, 5);
  assert.equal(MAX_CAMPAIGN_STARS, 180);
  assert.equal(MASTERY_TARGETS.length, 60);
  assert.ok(COSMETIC_ITEMS.length >= 45, `Expected 45+ cosmetics, got ${COSMETIC_ITEMS.length}`);
  assert.ok(ACHIEVEMENTS.length >= 30, `Expected 30+ achievements, got ${ACHIEVEMENTS.length}`);

  const ids = new Set<number>();
  const slugs = new Set<string>();
  const echoIds = new Set<string>();
  for (let i = 1; i <= 60; i++) {
    const lvl = getLevelById(i);
    assert.equal(lvl.id, i);
    assert.ok(!ids.has(lvl.id), `Duplicate level id ${lvl.id}`);
    assert.ok(!slugs.has(lvl.slug), `Duplicate slug ${lvl.slug}`);
    assert.ok(lvl.echoFragment, `Level ${i} missing echoFragment`);
    assert.ok(!echoIds.has(lvl.echoFragment!.id), `Duplicate echo id ${lvl.echoFragment!.id}`);
    ids.add(lvl.id);
    slugs.add(lvl.slug);
    echoIds.add(lvl.echoFragment!.id);
  }
});

test('All 60 stages are 100% solvable as starter Wayfinder with reachable Echo Fragments', () => {
  for (const level of LEVELS) {
    const tileSet = new Set<string>();
    for (const t of level.tiles) {
      const k = `${t.x},${t.z}`;
      assert.ok(!tileSet.has(k), `Level ${level.id} duplicate tile at ${k}`);
      tileSet.add(k);
    }

    const initPuzzle = createInitialPuzzleState(level);
    const lightCheck = computeLightPropagation(level, initPuzzle);
    assert.ok(Array.isArray(lightCheck.segments));

    const result = solveLevelWithBfs(level);
    assert.equal(
      result.solved,
      true,
      `Level ${level.id} (${level.slug}) was not solved within ${result.visitedStates} states`
    );
    assert.equal(
      result.echoReachable,
      true,
      `Level ${level.id} (${level.slug}) Echo Fragment (${level.echoFragment?.x},${level.echoFragment?.z}) is unreachable`
    );
  }
});

test('Hero progression, [Q] ability activation, Luma Shards shop, and lossless v1->v2 migration', () => {
  const v1Save = {
    completedLevels: [1, 2, 10],
    highestUnlockedLevel: 11,
    bestTimes: { 1: 12.5, 2: 21.0, 10: 55.0 },
    unlockedCosmetics: ['default_cloak', 'default_lantern'],
    equippedCosmetics: { cloakId: 'default_cloak', lanternId: 'default_lantern', setId: null },
  };
  const migrated = validateSaveProgress(v1Save);
  assert.equal(migrated.saveVersion, 3);
  assert.deepEqual(migrated.completedLevels, [1, 2, 10]);
  assert.deepEqual(migrated.collectedEchoFragments, []);
  assert.equal(migrated.unlockedCharacters?.includes('sylvi'), true);
  assert.equal(migrated.unlockedCharacters?.includes('neris'), false);

  assert.deepEqual(resolveUnlockedCharacters([10, 20, 30, 40]), [
    'wayfinder',
    'sylvi',
    'neris',
    'kael',
    'zeph',
  ]);

  let prog = selectCharacterInProgress(migrated, 'sylvi');
  assert.equal(prog.selectedCharacterId, 'sylvi');

  const stage11 = getLevelById(11);
  const pState = createInitialPuzzleState(stage11, 'sylvi');
  const node = stage11.heroNodes![0];
  const playerAtNode = {
    ...createInitialPlayerState(stage11),
    x: node.x * TILE_SIZE,
    z: node.z * TILE_SIZE,
  };
  const abRes = activateHeroAbility(stage11, pState, playerAtNode);
  assert.equal(abRes.pulsed, true);
  assert.equal(abRes.puzzleState.heroNodesActive[node.id], true);

  const compRes = recordLevelCompletionDetailed(prog, 11, 14, 2, {
    echoCollectedInRun: true,
    bonusShards: 5,
  });
  prog = compRes.progress;
  assert.ok(compRes.summary.lumaShardsEarned >= 10);
  assert.ok(prog.collectedEchoFragments?.includes('echo_11'));

  const buy = purchaseCosmeticInProgress(prog, 'dawn_mantle');
  assert.equal(buy.purchased, true);
  assert.ok(buy.progress.unlockedCosmetics.includes('dawn_mantle'));

  const sylviLook = resolveWayfinderAppearance(buy.progress.equippedCosmetics, 'sylvi');
  assert.equal(sylviLook.characterId, 'sylvi');
});
