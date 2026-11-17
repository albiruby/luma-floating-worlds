import {
  canTraverseBetween,
  computeLightPropagation,
  createInitialPuzzleState,
  getSurfaceAtTile,
} from './rules';
import {
  Direction,
  LevelDef,
  PuzzleRuntimeState,
} from './types';

export type StageValidationStatus = 'VALID' | 'INVALID' | 'WARNING' | 'UNVERIFIED';

export interface StageValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  x?: number;
  z?: number;
}

export interface StageValidationResult {
  status: StageValidationStatus;
  solvable: boolean | null;
  exploredStates: number;
  shortestActions: number | null;
  issues: StageValidationIssue[];
  summary: string;
}

export const FORGE_MAX_GRID_SPAN = 24;
export const FORGE_MAX_TILES = 260;
export const FORGE_MAX_OBJECTS = 90;
const BFS_MAX_STATES = 4500;

export function countLevelObjects(level: LevelDef): number {
  const decorCount = level.tiles.filter((t) => Boolean(t.decor)).length;
  return (
    decorCount +
    (level.pressureSwitches?.length ?? 0) +
    (level.echoPlates?.length ?? 0) +
    (level.gates?.length ?? 0) +
    (level.rotatingPlatforms?.length ?? 0) +
    (level.elevationPlatforms?.length ?? 0) +
    (level.lightEmitters?.length ?? 0) +
    (level.lightPrisms?.length ?? 0) +
    (level.subCrystals?.length ?? 0) +
    (level.heroNodes?.length ?? 0) +
    (level.synergyNodes?.length ?? 0) +
    2 // crystal + portal
  );
}

/**
 * Validates structural bounds, links, walkability, and runs a bounded BFS
 * state-space solver to honestly classify a stage as VALID, INVALID, WARNING, or UNVERIFIED.
 */
export function validateCustomLevel(level: LevelDef): StageValidationResult {
  const issues: StageValidationIssue[] = [];

  if (level.tiles.length === 0) {
    issues.push({
      severity: 'error',
      code: 'NO_TILES',
      message: 'Stage must contain at least 3 walkable tiles.',
    });
  }
  if (level.tiles.length > FORGE_MAX_TILES) {
    issues.push({
      severity: 'error',
      code: 'TOO_MANY_TILES',
      message: `Tile count (${level.tiles.length}) exceeds cap of ${FORGE_MAX_TILES}.`,
    });
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const t of level.tiles) {
    if (t.x < minX) minX = t.x;
    if (t.x > maxX) maxX = t.x;
    if (t.z < minZ) minZ = t.z;
    if (t.z > maxZ) maxZ = t.z;
  }
  if (Number.isFinite(minX)) {
    const spanX = maxX - minX + 1;
    const spanZ = maxZ - minZ + 1;
    if (spanX > FORGE_MAX_GRID_SPAN || spanZ > FORGE_MAX_GRID_SPAN) {
      issues.push({
        severity: 'error',
        code: 'SPAN_EXCEEDED',
        message: `Map span (${spanX}x${spanZ}) exceeds maximum ${FORGE_MAX_GRID_SPAN}x${FORGE_MAX_GRID_SPAN}.`,
      });
    }
  }

  const objCount = countLevelObjects(level);
  if (objCount > FORGE_MAX_OBJECTS) {
    issues.push({
      severity: 'error',
      code: 'TOO_MANY_OBJECTS',
      message: `Object count (${objCount}) exceeds cap of ${FORGE_MAX_OBJECTS}.`,
    });
  }

  const initPuzzle = createInitialPuzzleState(level);
  const spawnSurf = getSurfaceAtTile(level, initPuzzle, level.spawn.x, level.spawn.z);
  if (!spawnSurf || !spawnSurf.walkable) {
    issues.push({
      severity: 'error',
      code: 'INVALID_SPAWN',
      message: 'Hero Spawn must rest on a walkable tile (not void, water, or closed gate).',
      x: level.spawn.x,
      z: level.spawn.z,
    });
  }

  const crystalTile = level.tiles.find(
    (t) => t.x === level.crystal.x && t.z === level.crystal.z
  );
  if (!crystalTile || crystalTile.terrain === 'water') {
    issues.push({
      severity: 'error',
      code: 'INVALID_CRYSTAL',
      message: 'Luma Crystal must rest on solid island terrain.',
      x: level.crystal.x,
      z: level.crystal.z,
    });
  }

  const portalTile = level.tiles.find(
    (t) => t.x === level.portal.x && t.z === level.portal.z
  );
  if (!portalTile || portalTile.terrain === 'water' || portalTile.blocksMovement) {
    issues.push({
      severity: 'error',
      code: 'INVALID_PORTAL',
      message: 'Awakening Portal must sit on a walkable tile.',
      x: level.portal.x,
      z: level.portal.z,
    });
  }

  if (level.crystal.x === level.portal.x && level.crystal.z === level.portal.z) {
    issues.push({
      severity: 'warning',
      code: 'OVERLAP_CRYSTAL_PORTAL',
      message: 'Crystal and Portal share the same tile — separate them for clearer puzzle pacing.',
      x: level.crystal.x,
      z: level.crystal.z,
    });
  }

  if (level.crystal.requiresLightBeam && (level.lightEmitters?.length ?? 0) === 0) {
    issues.push({
      severity: 'error',
      code: 'MISSING_EMITTER',
      message: 'Crystal requires a Light Beam, but no Light Emitter is placed.',
      x: level.crystal.x,
      z: level.crystal.z,
    });
  }

  const switchIds = new Set((level.pressureSwitches ?? []).map((s) => s.id));
  const echoIds = new Set((level.echoPlates ?? []).map((e) => e.id));
  const subIds = new Set((level.subCrystals ?? []).map((s) => s.id));
  const synIds = new Set((level.synergyNodes ?? []).map((s) => s.id));

  for (const gate of level.gates ?? []) {
    if (gate.linkedSwitchId && !switchIds.has(gate.linkedSwitchId)) {
      issues.push({
        severity: 'error',
        code: 'DANGLING_GATE_LINK',
        message: `Gate ${gate.id} links to missing switch "${gate.linkedSwitchId}".`,
        x: gate.x,
        z: gate.z,
      });
    }
    if (gate.linkedEchoPlateId && !echoIds.has(gate.linkedEchoPlateId)) {
      issues.push({
        severity: 'error',
        code: 'DANGLING_ECHO_LINK',
        message: `Gate ${gate.id} links to missing Echo Plate "${gate.linkedEchoPlateId}".`,
        x: gate.x,
        z: gate.z,
      });
    }
    if (gate.linkedSubCrystalId && !subIds.has(gate.linkedSubCrystalId)) {
      issues.push({
        severity: 'error',
        code: 'DANGLING_SUB_LINK',
        message: `Gate ${gate.id} links to missing Sub-Crystal "${gate.linkedSubCrystalId}".`,
        x: gate.x,
        z: gate.z,
      });
    }
    if (gate.linkedSynergyId && !synIds.has(gate.linkedSynergyId)) {
      issues.push({
        severity: 'error',
        code: 'DANGLING_SYNERGY_LINK',
        message: `Gate ${gate.id} links to missing Synergy Node "${gate.linkedSynergyId}".`,
        x: gate.x,
        z: gate.z,
      });
    }
  }

  const hasEchoOnly = (level.echoPlates ?? []).some((e) => e.echoOnly);
  if (hasEchoOnly && !level.echoEnabled) {
    issues.push({
      severity: 'error',
      code: 'ECHO_DISABLED_WITH_ECHO_PLATE',
      message: 'Stage uses an Echo-Only Plate while Echo Engine is disabled.',
    });
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  if (hasErrors) {
    return {
      status: 'INVALID',
      solvable: false,
      exploredStates: 0,
      shortestActions: null,
      issues,
      summary: issues.find((i) => i.severity === 'error')?.message ?? 'Structural errors detected.',
    };
  }

  // Bounded BFS State-Space Solver
  interface SearchNode {
    gx: number;
    gz: number;
    puzzle: PuzzleRuntimeState;
    actions: number;
  }

  const stateKey = (gx: number, gz: number, p: PuzzleRuntimeState): string => {
    const sw = (level.pressureSwitches ?? []).map((s) => (p.switchStates[s.id] ? '1' : '0')).join('');
    const ep = (level.echoPlates ?? []).map((e) => (p.echoPlateStates?.[e.id] ? '1' : '0')).join('');
    const lf = (level.elevationPlatforms ?? []).map((l) => (p.elevationHigh[l.id] ? '1' : '0')).join('');
    const rot = (level.rotatingPlatforms ?? []).map((r) => String(p.rotatingSteps[r.id] ?? 0)).join('');
    const pr = (level.lightPrisms ?? []).map((prItem) => String(p.prismDirections[prItem.id] ?? 0)).join('');
    const hn = (level.heroNodes ?? []).map((h) => (p.heroNodesActive[h.id] ? '1' : '0')).join('');
    const sn = (level.synergyNodes ?? []).map((s) => (p.synergyNodesActive?.[s.id] ? '1' : '0')).join('');
    return `${gx},${gz}|${sw}|${ep}|${lf}|${rot}|${pr}|${hn}|${sn}|${p.crystalRestored ? 1 : 0}`;
  };

  const applyDerived = (p: PuzzleRuntimeState): PuzzleRuntimeState => {
    const light = computeLightPropagation(level, p);
    const allSubs =
      !level.subCrystals ||
      level.subCrystals.length === 0 ||
      level.subCrystals.every((sc) => light.litSubCrystalIds.includes(sc.id));
    const crystalRestored =
      p.crystalRestored ||
      (Boolean(level.crystal.requiresLightBeam) && light.crystalLitByBeam && allSubs);
    return {
      ...p,
      lightSegments: light.segments,
      litPrismIds: light.litPrismIds,
      litSubCrystalIds: light.litSubCrystalIds,
      crystalLitByBeam: light.crystalLitByBeam,
      crystalRestored,
      portalAwakened: p.portalAwakened || crystalRestored,
    };
  };

  const visited = new Set<string>();
  const queue: SearchNode[] = [
    {
      gx: level.spawn.x,
      gz: level.spawn.z,
      puzzle: initPuzzle,
      actions: 0,
    },
  ];
  visited.add(stateKey(level.spawn.x, level.spawn.z, initPuzzle));

  let head = 0;
  let explored = 0;
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (head < queue.length && explored < BFS_MAX_STATES) {
    const cur = queue[head++];
    explored++;

    if (cur.puzzle.portalAwakened && cur.gx === level.portal.x && cur.gz === level.portal.z) {
      const hasWarnings = issues.some((i) => i.severity === 'warning');
      return {
        status: hasWarnings ? 'WARNING' : 'VALID',
        solvable: true,
        exploredStates: explored,
        shortestActions: cur.actions,
        issues,
        summary: hasWarnings
          ? `Solvable (${cur.actions} actions) with ${issues.length} layout note(s).`
          : `Verified solvable in ${cur.actions} action(s) across ${explored} states.`,
      };
    }

    const curSurf = getSurfaceAtTile(level, cur.puzzle, cur.gx, cur.gz);

    const pushState = (nx: number, nz: number, nextPuzzle: PuzzleRuntimeState, nextActions: number) => {
      const derived = applyDerived(nextPuzzle);
      const k = stateKey(nx, nz, derived);
      if (!visited.has(k)) {
        visited.add(k);
        queue.push({ gx: nx, gz: nz, puzzle: derived, actions: nextActions });
      }
    };

    // 1. Walk to 4 orthogonal neighbors
    for (const [dx, dz] of dirs) {
      const nx = cur.gx + dx;
      const nz = cur.gz + dz;
      const nextSurf = getSurfaceAtTile(level, cur.puzzle, nx, nz);
      if (canTraverseBetween(curSurf, nextSurf)) {
        // Stepping onto a latched pressure switch automatically activates it
        const sw = (level.pressureSwitches ?? []).find((s) => s.x === nx && s.z === nz && s.latch);
        let nextP = cur.puzzle;
        if (sw && !nextP.switchStates[sw.id]) {
          nextP = {
            ...nextP,
            switchStates: { ...nextP.switchStates, [sw.id]: true },
          };
        }
        pushState(nx, nz, nextP, cur.actions);
      }
    }

    // 2. Interact with mechanisms within Manhattan distance <= 1
    const isNear = (tx: number, tz: number) => Math.abs(cur.gx - tx) + Math.abs(cur.gz - tz) <= 1;

    // Crystal restoration (if non-beam)
    if (!cur.puzzle.crystalRestored && !level.crystal.requiresLightBeam && isNear(level.crystal.x, level.crystal.z)) {
      pushState(
        cur.gx,
        cur.gz,
        { ...cur.puzzle, crystalRestored: true, portalAwakened: true },
        cur.actions + 1
      );
    }

    // Switches (non-latch or manual)
    for (const sw of level.pressureSwitches ?? []) {
      if (isNear(sw.x, sw.z)) {
        const nextVal = sw.latch ? true : !cur.puzzle.switchStates[sw.id];
        if (nextVal !== Boolean(cur.puzzle.switchStates[sw.id])) {
          pushState(
            cur.gx,
            cur.gz,
            {
              ...cur.puzzle,
              switchStates: { ...cur.puzzle.switchStates, [sw.id]: nextVal },
            },
            cur.actions + 1
          );
        }
      }
    }

    // Echo Plates: if Echo Engine enabled (or companion can hold non-echoOnly), placing an Echo or Companion on a plate while standing on it leaves it held!
    for (const ep of level.echoPlates ?? []) {
      const standingOn = cur.gx === ep.x && cur.gz === ep.z;
      const canUse = ep.echoOnly ? Boolean(level.echoEnabled) : Boolean(level.echoEnabled || level.partyEnabled || isNear(ep.x, ep.z));
      if ((standingOn || isNear(ep.x, ep.z)) && canUse && !cur.puzzle.echoPlateStates?.[ep.id]) {
        pushState(
          cur.gx,
          cur.gz,
          {
            ...cur.puzzle,
            echoPlateStates: { ...(cur.puzzle.echoPlateStates ?? {}), [ep.id]: true },
          },
          cur.actions + 1
        );
      }
    }

    // Rotating Platforms
    for (const rp of level.rotatingPlatforms ?? []) {
      const anchor = rp.crankPos ?? { x: rp.pivotX, z: rp.pivotZ };
      if (isNear(anchor.x, anchor.z)) {
        const nextStep = (((cur.puzzle.rotatingSteps[rp.id] ?? 0) + 1) % 4) as Direction;
        pushState(
          cur.gx,
          cur.gz,
          {
            ...cur.puzzle,
            rotatingSteps: { ...cur.puzzle.rotatingSteps, [rp.id]: nextStep },
          },
          cur.actions + 1
        );
      }
    }

    // Elevation Platforms (unlinked lifts)
    for (const lf of level.elevationPlatforms ?? []) {
      if (!lf.linkedSwitchId && isNear(lf.x, lf.z)) {
        pushState(
          cur.gx,
          cur.gz,
          {
            ...cur.puzzle,
            elevationHigh: { ...cur.puzzle.elevationHigh, [lf.id]: !cur.puzzle.elevationHigh[lf.id] },
          },
          cur.actions + 1
        );
      }
    }

    // Light Prisms
    for (const pr of level.lightPrisms ?? []) {
      if (isNear(pr.x, pr.z)) {
        const nextDir = (((cur.puzzle.prismDirections[pr.id] ?? 0) + 1) % 4) as Direction;
        pushState(
          cur.gx,
          cur.gz,
          {
            ...cur.puzzle,
            prismDirections: { ...cur.puzzle.prismDirections, [pr.id]: nextDir },
          },
          cur.actions + 1
        );
      }
    }

    // Hero Nodes (accessible if matching or flexible party)
    for (const hn of level.heroNodes ?? []) {
      if (!cur.puzzle.heroNodesActive[hn.id] && isNear(hn.x, hn.z)) {
        const nextElev = { ...cur.puzzle.elevationHigh };
        if (hn.boostsLiftId) nextElev[hn.boostsLiftId] = !nextElev[hn.boostsLiftId];
        pushState(
          cur.gx,
          cur.gz,
          {
            ...cur.puzzle,
            heroNodesActive: { ...cur.puzzle.heroNodesActive, [hn.id]: true },
            elevationHigh: nextElev,
          },
          cur.actions + 1
        );
      }
    }

    // Synergy Nodes (if partyEnabled)
    if (level.partyEnabled) {
      for (const sn of level.synergyNodes ?? []) {
        if (!cur.puzzle.synergyNodesActive?.[sn.id] && isNear(sn.x, sn.z)) {
          const nextElev = { ...cur.puzzle.elevationHigh };
          if (sn.boostsLiftId) nextElev[sn.boostsLiftId] = !nextElev[sn.boostsLiftId];
          pushState(
            cur.gx,
            cur.gz,
            {
              ...cur.puzzle,
              synergyNodesActive: { ...(cur.puzzle.synergyNodesActive ?? {}), [sn.id]: true },
              elevationHigh: nextElev,
            },
            cur.actions + 1
          );
        }
      }
    }
  }

  if (explored >= BFS_MAX_STATES) {
    issues.push({
      severity: 'warning',
      code: 'SEARCH_BUDGET_REACHED',
      message: `Complexity exceeded solver budget (${BFS_MAX_STATES} states) — test-play manually to verify.`,
    });
    return {
      status: 'UNVERIFIED',
      solvable: null,
      exploredStates: explored,
      shortestActions: null,
      issues,
      summary: `State space exceeded ${BFS_MAX_STATES} states — marked Unverified until Test-Played.`,
    };
  }

  issues.push({
    severity: 'error',
    code: 'UNREACHABLE_COMPLETION',
    message: 'No valid path reaches Crystal restoration and Awakening Portal from Spawn.',
  });
  return {
    status: 'INVALID',
    solvable: false,
    exploredStates: explored,
    shortestActions: null,
    issues,
    summary: `No solution found across ${explored} reachable states — check bridges, gates, beams, or elevation stairs.`,
  };
}
