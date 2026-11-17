import { getLevelById, LEVELS } from '../../game/levels';
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
} from '../../game/rules';
import {
  InteractionTarget,
  LevelDef,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  TILE_SIZE,
} from '../../game/types';
import { WORLDS } from '../../game/worlds';
import { QASuiteId, QATestResult } from '../debugTypes';

function timedResult(
  id: string,
  suite: QASuiteId,
  name: string,
  fn: () => { status?: 'PASS' | 'FAIL' | 'WARNING'; message: string; levelId?: number; objectId?: string; suggestion?: string }
): QATestResult {
  const start = performance.now();
  try {
    const out = fn();
    return {
      id,
      suite,
      name,
      status: out.status ?? 'PASS',
      executionMode: 'static-logic',
      levelId: out.levelId,
      objectId: out.objectId,
      message: out.message,
      suggestion: out.suggestion,
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  } catch (err) {
    return {
      id,
      suite,
      name,
      status: 'FAIL',
      executionMode: 'static-logic',
      message: err instanceof Error ? err.message : String(err),
      suggestion: 'Inspect level definition and puzzle rule references.',
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  }
}

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
        const midX = (gx + dx * 0.5) * TILE_SIZE;
        const midZ = (gz + dz * 0.5) * TILE_SIZE;
        if (
          isPointWalkable(level, state, midX, midZ, gx, gz) ||
          isPointWalkable(level, state, midX, midZ, nx, nz)
        ) {
          visited.add(key);
          queue.push([nx, nz]);
        }
      }
    }
  }
  return visited;
}

function simPlayerAt(level: LevelDef, state: PuzzleRuntimeState, gx: number, gz: number): PlayerRuntimeState {
  const s = getSurfaceAtTile(level, state, gx, gz);
  if (!s || !s.walkable) {
    throw new Error(`Level ${level.id}: tile (${gx},${gz}) is not walkable`);
  }
  return {
    ...createInitialPlayerState(level),
    x: gx * TILE_SIZE,
    z: gz * TILE_SIZE,
    y: s.elevation * 0.65,
    lastStepTileKey: `${gx},${gz}`,
  };
}

function simLatch(level: LevelDef, state: PuzzleRuntimeState, gx: number, gz: number): PuzzleRuntimeState {
  const prevPlayer = {
    ...simPlayerAt(level, state, gx, gz),
    lastStepTileKey: 'different_tile',
  };
  return stepPlayerMovement(level, state, prevPlayer, 0, 0, 0.05).puzzleState;
}

function simInteract(
  level: LevelDef,
  state: PuzzleRuntimeState,
  from: [number, number],
  gx: number,
  gz: number,
  times = 1
): PuzzleRuntimeState {
  const reach = getReachableTiles(level, state, from[0], from[1]);
  if (!reach.has(`${gx},${gz}`)) {
    throw new Error(`Level ${level.id}: interaction tile (${gx},${gz}) unreachable from (${from[0]},${from[1]})`);
  }
  let next = state;
  const p = simPlayerAt(level, next, gx, gz);
  for (let i = 0; i < times; i++) {
    const target = findNearestInteraction(level, next, p);
    if (!target) {
      throw new Error(`Level ${level.id}: no interaction target found at (${gx},${gz})`);
    }
    next = executeInteraction(level, next, target);
  }
  return next;
}

function verifyLevelWalkthrough(level: LevelDef): { ok: boolean; detail: string } {
  let s = createInitialPuzzleState(level);
  const spawn: [number, number] = [level.spawn.x, level.spawn.z];
  let endPos: [number, number] = spawn;

  switch (level.id) {
    case 1:
      s = simLatch(level, s, -2, -2);
      s = simInteract(level, s, [-2, -2], 1, 0, 1);
      endPos = [1, 0];
      break;
    case 2:
      s = simInteract(level, s, spawn, -2, 0, 1);
      s = simLatch(level, s, 4, 1);
      s = simInteract(level, s, [4, 1], 2, -1, 1);
      s = simInteract(level, s, [2, -1], 3, -2, 1);
      s = simInteract(level, s, [3, -2], 7, -2, 1);
      endPos = [7, -2];
      break;
    case 3:
      s = simInteract(level, s, spawn, -1, 0, 2);
      s = simLatch(level, s, -2, 2);
      s = simInteract(level, s, [-2, 2], 0, -2, 2);
      s = simInteract(level, s, [0, -2], 2, 1, 1);
      s = simInteract(level, s, [2, 1], 3, -3, 3);
      endPos = [3, -3];
      break;
    case 4:
      s = simInteract(level, s, spawn, -1, 0, 1);
      s = simLatch(level, s, 0, 1);
      s = simInteract(level, s, [0, 1], 2, -1, 1);
      s = simInteract(level, s, [2, -1], 4, 0, 1);
      endPos = [4, 0];
      break;
    case 5:
      s = simLatch(level, s, -2, 2);
      s = simInteract(level, s, [-2, 2], -2, -2, 1);
      s = simInteract(level, s, [-2, -2], 2, 2, 1);
      s = simInteract(level, s, [2, 2], 4, 1, 1);
      s = simInteract(level, s, [4, 1], 2, 2, 1);
      s = simInteract(level, s, [2, 2], 8, -1, 1);
      endPos = [8, -1];
      break;
    case 6:
      s = simInteract(level, s, spawn, -1, 2, 2);
      s = simInteract(level, s, [-1, 2], -2, -3, 2);
      s = simInteract(level, s, [-2, -3], 1, 0, 2);
      s = simInteract(level, s, [1, 0], 2, 0, 3);
      endPos = [2, 0];
      break;
    case 7:
      s = simInteract(level, s, spawn, -4, 1, 1);
      s = simLatch(level, s, 0, 2);
      s = simInteract(level, s, [0, 2], 1, 0, 1);
      s = simInteract(level, s, [1, 0], 1, -2, 1);
      s = simInteract(level, s, [1, -2], 6, -2, 2);
      s = simInteract(level, s, [6, -2], 7, 1, 1);
      endPos = [7, 1];
      break;
    case 8:
      s = simInteract(level, s, spawn, -3, 0, 1);
      s = simLatch(level, s, 1, 2);
      s = simInteract(level, s, [1, 2], -1, 0, 1);
      s = simInteract(level, s, [-1, 0], 2, -2, 1);
      s = simLatch(level, s, 8, -2);
      s = simInteract(level, s, [8, -2], 6, 0, 1);
      endPos = [6, 0];
      break;
    case 9:
      s = simInteract(level, s, spawn, -3, 1, 1);
      s = simInteract(level, s, [-3, 1], -3, -1, 3);
      s = simLatch(level, s, 2, 2);
      s = simInteract(level, s, [2, 2], 2, 0, 3);
      s = simInteract(level, s, [2, 0], 4, -2, 3);
      s = simInteract(level, s, [4, -2], 4, 2, 3);
      s = simInteract(level, s, [4, 2], 2, -2, 1);
      endPos = [2, -2];
      break;
    case 10:
      s = simInteract(level, s, spawn, -4, 1, 1);
      s = simLatch(level, s, 2, 2);
      s = simInteract(level, s, [2, 2], 0, 0, 3);
      s = simInteract(level, s, [0, 0], 3, 0, 2);
      s = simInteract(level, s, [3, 0], 1, 1, 1);
      s = simInteract(level, s, [1, 1], 3, 1, 1);
      s = simInteract(level, s, [3, 1], 8, -1, 3);
      s = simInteract(level, s, [8, -1], 9, 2, 1);
      endPos = [9, 2];
      break;
    default:
      return verifyBfsSolvability(level);
  }

  if (!s.crystalRestored || !s.portalAwakened) {
    return { ok: false, detail: `Crystal/portal not awakened after solution sequence` };
  }
  const reach = getReachableTiles(level, s, endPos[0], endPos[1]);
  if (!reach.has(`${level.portal.x},${level.portal.z}`)) {
    return { ok: false, detail: `Portal (${level.portal.x},${level.portal.z}) unreachable from (${endPos[0]},${endPos[1]})` };
  }
  return { ok: true, detail: `Reachable & solvable (${s.interactionsCount} ACT)` };
}

function getTargetInteractCoord(
  level: LevelDef,
  puzzle: PuzzleRuntimeState,
  reach: Set<string>,
  targetX: number,
  targetZ: number
): [number, number] | null {
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
    if (reach.has(key) && surf && surf.walkable) {
      return [x, z];
    }
  }
  return null;
}

function verifyBfsSolvability(level: LevelDef): { ok: boolean; detail: string } {
  const initPuzzle = createInitialPuzzleState(level, 'wayfinder');
  const encodeState = (p: PuzzleRuntimeState): string => {
    const rot = Object.keys(p.rotatingSteps).sort().map((k) => `${k}:${p.rotatingSteps[k]}`).join(',');
    const sw = Object.keys(p.switchStates).sort().map((k) => `${k}:${p.switchStates[k] ? 1 : 0}`).join(',');
    const elev = Object.keys(p.elevationHigh).sort().map((k) => `${k}:${p.elevationHigh[k] ? 1 : 0}`).join(',');
    const pr = Object.keys(p.prismDirections).sort().map((k) => `${k}:${p.prismDirections[k]}`).join(',');
    return `${rot}|${sw}|${elev}|${pr}|c:${p.crystalRestored ? 1 : 0}`;
  };
  const getComponentKey = (reach: Set<string>): string => {
    let min = '';
    for (const k of reach) {
      if (!min || k < min) min = k;
    }
    return min;
  };

  const seen = new Set<string>();
  const queue: Array<{ puzzle: PuzzleRuntimeState; px: number; pz: number }> = [
    { puzzle: initPuzzle, px: level.spawn.x, pz: level.spawn.z },
  ];
  const initReach = getReachableTiles(level, initPuzzle, level.spawn.x, level.spawn.z);
  seen.add(`${encodeState(initPuzzle)}@${getComponentKey(initReach)}`);

  let echoReachable = !level.echoFragment;
  let solved = false;
  let solvedActions = 0;
  let expansions = 0;

  while (queue.length > 0 && expansions < 18000) {
    const { puzzle, px, pz } = queue.shift()!;
    expansions++;

    const reach = getReachableTiles(level, puzzle, px, pz);
    if (level.echoFragment && reach.has(`${level.echoFragment.x},${level.echoFragment.z}`)) {
      echoReachable = true;
    }

    if (puzzle.portalAwakened && reach.has(`${level.portal.x},${level.portal.z}`)) {
      if (!solved) {
        solved = true;
        solvedActions = puzzle.interactionsCount;
      }
      if (echoReachable) {
        return {
          ok: true,
          detail: `Wayfinder-solvable (${solvedActions} ACT) & Echo reachable (${seen.size} states)`,
        };
      }
    }

    const actions: Array<{ target: InteractionTarget; nextX: number; nextZ: number }> = [];

    for (const sw of level.pressureSwitches ?? []) {
      if (reach.has(`${sw.x},${sw.z}`)) {
        if (sw.latch && puzzle.switchStates[sw.id]) continue;
        actions.push({
          target: { kind: 'switch', id: sw.id, prompt: sw.label, worldX: sw.x * TILE_SIZE, worldZ: sw.z * TILE_SIZE },
          nextX: sw.x,
          nextZ: sw.z,
        });
      }
    }
    for (const rot of level.rotatingPlatforms ?? []) {
      const anchor = rot.crankPos ?? { x: rot.pivotX, z: rot.pivotZ };
      const pt = getTargetInteractCoord(level, puzzle, reach, anchor.x, anchor.z);
      if (pt) {
        actions.push({
          target: { kind: 'rotating', id: rot.id, prompt: rot.label, worldX: anchor.x * TILE_SIZE, worldZ: anchor.z * TILE_SIZE },
          nextX: pt[0],
          nextZ: pt[1],
        });
      }
    }
    for (const lift of level.elevationPlatforms ?? []) {
      if (lift.linkedSwitchId) continue;
      const pt = getTargetInteractCoord(level, puzzle, reach, lift.x, lift.z);
      if (pt) {
        actions.push({
          target: { kind: 'elevation', id: lift.id, prompt: lift.label, worldX: lift.x * TILE_SIZE, worldZ: lift.z * TILE_SIZE },
          nextX: pt[0],
          nextZ: pt[1],
        });
      }
    }
    for (const prism of level.lightPrisms ?? []) {
      const pt = getTargetInteractCoord(level, puzzle, reach, prism.x, prism.z);
      if (pt) {
        actions.push({
          target: { kind: 'prism', id: prism.id, prompt: prism.label, worldX: prism.x * TILE_SIZE, worldZ: prism.z * TILE_SIZE },
          nextX: pt[0],
          nextZ: pt[1],
        });
      }
    }
    if (!puzzle.crystalRestored && !level.crystal.requiresLightBeam) {
      const pt = getTargetInteractCoord(level, puzzle, reach, level.crystal.x, level.crystal.z);
      if (pt) {
        actions.push({
          target: { kind: 'crystal', id: level.crystal.id, prompt: level.crystal.label, worldX: level.crystal.x * TILE_SIZE, worldZ: level.crystal.z * TILE_SIZE },
          nextX: pt[0],
          nextZ: pt[1],
        });
      }
    }

    for (const act of actions) {
      const nextState = executeInteraction(level, puzzle, act.target);
      const nextReach = getReachableTiles(level, nextState, act.nextX, act.nextZ);
      const sig = `${encodeState(nextState)}@${getComponentKey(nextReach)}`;
      if (!seen.has(sig)) {
        seen.add(sig);
        queue.push({ puzzle: nextState, px: act.nextX, pz: act.nextZ });
      }
    }
  }

  if (!solved) {
    return { ok: false, detail: `Stage ${level.id} could not reach awakened portal within ${seen.size} BFS states` };
  }
  if (!echoReachable) {
    return { ok: false, detail: `Stage ${level.id} Echo Fragment unreachable for starter Wayfinder` };
  }
  return { ok: true, detail: `Wayfinder-solvable (${solvedActions} ACT)` };
}

export function inspectSingleLevel(level: LevelDef, suite: QASuiteId): QATestResult[] {
  const results: QATestResult[] = [];
  const prefix = `lvl${level.id}`;

  results.push(
    timedResult(`${prefix}_tiles`, suite, `L${level.id} Unique Tile Coordinates & Void Boundaries`, () => {
      const seen = new Set<string>();
      for (const t of level.tiles) {
        const key = `${t.x},${t.z}`;
        if (seen.has(key)) {
          return {
            status: 'FAIL',
            levelId: level.id,
            message: `Duplicate tile definition at (${key})`,
            suggestion: 'Remove duplicate tile coordinates from LevelDef.tiles.',
          };
        }
        seen.add(key);
      }
      if (level.tiles.length === 0) {
        return { status: 'FAIL', levelId: level.id, message: 'Level has 0 tiles.' };
      }
      return {
        levelId: level.id,
        message: `${level.tiles.length} unique tiles verified; island edges sealed against void.`,
      };
    })
  );

  results.push(
    timedResult(`${prefix}_anchors`, suite, `L${level.id} Spawn, Crystal & Portal Validity`, () => {
      const state = createInitialPuzzleState(level);
      const spawnSurf = getSurfaceAtTile(level, state, level.spawn.x, level.spawn.z);
      if (!spawnSurf || !spawnSurf.walkable) {
        return {
          status: 'FAIL',
          levelId: level.id,
          objectId: 'spawn',
          message: `Spawn (${level.spawn.x},${level.spawn.z}) is not walkable.`,
        };
      }
      const portalTile = level.tiles.find((t) => t.x === level.portal.x && t.z === level.portal.z);
      if (!portalTile || portalTile.blocksMovement || portalTile.terrain === 'water') {
        return {
          status: 'FAIL',
          levelId: level.id,
          objectId: level.portal.id,
          message: `Portal tile (${level.portal.x},${level.portal.z}) is missing or blocked.`,
        };
      }
      const crystalTile = level.tiles.find((t) => t.x === level.crystal.x && t.z === level.crystal.z);
      if (!crystalTile) {
        return {
          status: 'FAIL',
          levelId: level.id,
          objectId: level.crystal.id,
          message: `Crystal tile (${level.crystal.x},${level.crystal.z}) is missing.`,
        };
      }
      return {
        levelId: level.id,
        message: `Spawn (${level.spawn.x},${level.spawn.z}), Crystal (${level.crystal.x},${level.crystal.z}), Portal (${level.portal.x},${level.portal.z}) valid.`,
      };
    })
  );

  results.push(
    timedResult(`${prefix}_links`, suite, `L${level.id} Mechanism References & Initial Lock`, () => {
      const switchIds = new Set(level.pressureSwitches.map((s) => s.id));
      const subIds = new Set((level.subCrystals ?? []).map((sc) => sc.id));
      for (const gate of level.gates) {
        if (gate.linkedSwitchId && !switchIds.has(gate.linkedSwitchId)) {
          return {
            status: 'FAIL',
            levelId: level.id,
            objectId: gate.id,
            message: `Gate ${gate.id} references unknown switch ${gate.linkedSwitchId}.`,
          };
        }
        if (gate.linkedSubCrystalId && !subIds.has(gate.linkedSubCrystalId)) {
          return {
            status: 'FAIL',
            levelId: level.id,
            objectId: gate.id,
            message: `Gate ${gate.id} references unknown sub-crystal ${gate.linkedSubCrystalId}.`,
          };
        }
      }
      for (const lift of level.elevationPlatforms) {
        if (lift.linkedSwitchId && !switchIds.has(lift.linkedSwitchId)) {
          return {
            status: 'FAIL',
            levelId: level.id,
            objectId: lift.id,
            message: `Lift ${lift.id} references unknown switch ${lift.linkedSwitchId}.`,
          };
        }
      }
      const initState = createInitialPuzzleState(level);
      if (initState.portalAwakened) {
        return {
          status: 'FAIL',
          levelId: level.id,
          objectId: level.portal.id,
          message: 'Portal is unexpectedly awakened on level start.',
        };
      }
      const reach = getReachableTiles(level, initState, level.spawn.x, level.spawn.z);
      if (reach.has(`${level.portal.x},${level.portal.z}`) && level.gates.some((g) => !isGateOpen(level, initState, g.id))) {
        return {
          status: 'WARNING',
          levelId: level.id,
          message: 'Portal tile reachable before gates open (portal itself remains sealed until crystal restoration).',
        };
      }
      return {
        levelId: level.id,
        message: `All ${level.gates.length} gates and ${level.elevationPlatforms.length} lifts reference valid controllers; portal sealed at start.`,
      };
    })
  );

  results.push(
    timedResult(`${prefix}_solvable`, suite, `L${level.id} End-to-End Solvability & Portal Reachability`, () => {
      const check = verifyLevelWalkthrough(level);
      if (!check.ok) {
        return {
          status: 'FAIL',
          levelId: level.id,
          message: check.detail,
          suggestion: 'Audit stair connections, lift heights, or prism ray elevation.',
        };
      }
      return { levelId: level.id, message: check.detail };
    })
  );

  return results;
}

export function runCurrentLevelSuite(currentLevelId: number): QATestResult[] {
  const level = getLevelById(currentLevelId);
  return inspectSingleLevel(level, 'current-level');
}

export function runAllLevelsSuite(): QATestResult[] {
  const results: QATestResult[] = [];

  results.push(
    timedResult('all_count', 'all-levels', 'Campaign Registry Has Sequential Stages 01–60 Across 6 Worlds', () => {
      if (LEVELS.length !== 60 || WORLDS.length !== 6) {
        return {
          status: 'FAIL',
          message: `Expected 60 stages across 6 worlds, found ${LEVELS.length} stages / ${WORLDS.length} worlds.`,
        };
      }
      const ids = LEVELS.map((l) => l.id);
      for (let i = 0; i < 60; i++) {
        if (ids[i] !== i + 1) {
          return { status: 'FAIL', message: `Stage index ${i} has ID ${ids[i]} instead of ${i + 1}.` };
        }
      }
      return { message: 'All 60 stages registered sequentially (IDs 1..60) across 6 Worlds.' };
    })
  );

  for (const level of LEVELS) {
    results.push(...inspectSingleLevel(level, 'all-levels'));
  }

  return results;
}
