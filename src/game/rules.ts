import {
  CharacterId,
  Direction,
  ELEVATION_STEP,
  INTERACT_RANGE,
  InteractionTarget,
  LevelDef,
  LightSegment,
  PLAYER_RADIUS,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  TILE_SIZE,
  TileDef,
} from './types';

export function dirToVec(dir: Direction): { dx: number; dz: number } {
  switch (dir) {
    case 0:
      return { dx: 1, dz: 0 };
    case 1:
      return { dx: 0, dz: 1 };
    case 2:
      return { dx: -1, dz: 0 };
    case 3:
      return { dx: 0, dz: -1 };
  }
}

export function rotateOffset(dx: number, dz: number, step: Direction): { dx: number; dz: number } {
  switch (step) {
    case 0:
      return { dx, dz };
    case 1:
      return { dx: -dz, dz: dx };
    case 2:
      return { dx: -dx, dz: -dz };
    case 3:
      return { dx: dz, dz: -dx };
  }
}

export function getRotatingPlatformTiles(
  level: LevelDef,
  state: PuzzleRuntimeState
): Array<{ x: number; z: number; elevation: number; platformId: string }> {
  const result: Array<{ x: number; z: number; elevation: number; platformId: string }> = [];
  for (const plat of level.rotatingPlatforms ?? []) {
    const step = state.rotatingSteps[plat.id] ?? plat.initialStep;
    for (const off of plat.baseOffsets) {
      const r = rotateOffset(off.dx, off.dz, step);
      result.push({
        x: plat.pivotX + r.dx,
        z: plat.pivotZ + r.dz,
        elevation: plat.elevation,
        platformId: plat.id,
      });
    }
  }
  return result;
}

export function isGateOpen(level: LevelDef, state: PuzzleRuntimeState, gateId: string): boolean {
  const override = state.debugGateOverrides?.[gateId];
  if (override === 'open') return true;
  if (override === 'closed') return false;

  const gate = level.gates.find((g) => g.id === gateId);
  if (!gate) return true;
  let active = false;
  if (gate.linkedSwitchId) {
    active = Boolean(state.switchStates[gate.linkedSwitchId]);
  } else if (gate.linkedSubCrystalId) {
    active = state.litSubCrystalIds.includes(gate.linkedSubCrystalId);
  }
  return gate.inverted ? !active : active;
}

export function getElevationPlatformHeight(
  level: LevelDef,
  state: PuzzleRuntimeState,
  liftId: string
): number {
  const lift = level.elevationPlatforms.find((l) => l.id === liftId);
  if (!lift) return 0;
  const isHigh = lift.linkedSwitchId
    ? Boolean(state.switchStates[lift.linkedSwitchId])
    : Boolean(state.elevationHigh[lift.id]);
  return isHigh ? lift.highElevation : lift.lowElevation;
}

export interface SurfaceInfo {
  walkable: boolean;
  elevation: number;
  isStair: boolean;
  source: 'tile' | 'rotating' | 'lift' | 'hero_bridge';
  id?: string;
}

export function getSurfaceAtTile(
  level: LevelDef,
  state: PuzzleRuntimeState,
  gx: number,
  gz: number
): SurfaceInfo | null {
  for (const lift of level.elevationPlatforms) {
    if (lift.x === gx && lift.z === gz) {
      return {
        walkable: true,
        elevation: getElevationPlatformHeight(level, state, lift.id),
        isStair: false,
        source: 'lift',
        id: lift.id,
      };
    }
  }

  for (const node of level.heroNodes ?? []) {
    if (!state.heroNodesActive?.[node.id] || !node.bridgeTiles) continue;
    const bt = node.bridgeTiles.find((t) => t.x === gx && t.z === gz);
    if (bt) {
      return {
        walkable: true,
        elevation: bt.elevation,
        isStair: false,
        source: 'hero_bridge',
        id: node.id,
      };
    }
  }

  const rotTiles = getRotatingPlatformTiles(level, state);
  for (const rt of rotTiles) {
    if (rt.x === gx && rt.z === gz) {
      return {
        walkable: true,
        elevation: rt.elevation,
        isStair: false,
        source: 'rotating',
        id: rt.platformId,
      };
    }
  }

  const tile: TileDef | undefined = level.tiles.find((t) => t.x === gx && t.z === gz);
  if (!tile) return null;

  if (tile.terrain === 'water') {
    return {
      walkable: false,
      elevation: tile.elevation,
      isStair: false,
      source: 'tile',
    };
  }

  for (const gate of level.gates) {
    if (gate.x === gx && gate.z === gz && !isGateOpen(level, state, gate.id)) {
      return {
        walkable: false,
        elevation: tile.elevation,
        isStair: Boolean(tile.isStair),
        source: 'tile',
      };
    }
  }

  return {
    walkable: !tile.blocksMovement,
    elevation: tile.elevation,
    isStair: Boolean(tile.isStair),
    source: 'tile',
  };
}

export function canTraverseBetween(a: SurfaceInfo | null, b: SurfaceInfo | null): boolean {
  if (!a || !b || !a.walkable || !b.walkable) return false;
  const diff = Math.abs(a.elevation - b.elevation);
  if (diff === 0) return true;
  if (diff === 1 && (a.isStair || b.isStair)) return true;
  return false;
}

function traceLightPass(
  level: LevelDef,
  state: PuzzleRuntimeState,
  litSubCrystalIds: Set<string>
): {
  segments: LightSegment[];
  litPrismIds: Set<string>;
  newlyLitSubs: Set<string>;
  crystalLitByBeam: boolean;
} {
  const segments: LightSegment[] = [];
  const litPrismIds = new Set<string>();
  const newlyLitSubs = new Set<string>();
  let crystalLitByBeam = false;

  const MAX_STEPS = 24;
  const visitedRays = new Set<string>();
  const stateWithSubs: PuzzleRuntimeState = {
    ...state,
    litSubCrystalIds: Array.from(litSubCrystalIds),
  };

  for (const emitter of level.lightEmitters ?? []) {
    if (state.debugDisabledEmitters?.[emitter.id]) {
      continue;
    }
    let cx = emitter.x;
    let cz = emitter.z;
    let dir = emitter.direction;
    const elev = emitter.elevation;

    for (let bounce = 0; bounce < 10; bounce++) {
      const rayKey = `${cx},${cz},${dir}`;
      if (visitedRays.has(rayKey)) break;
      visitedRays.add(rayKey);

      const { dx, dz } = dirToVec(dir);
      let endX = cx;
      let endZ = cz;
      let hitType: LightSegment['hitType'] = 'void';
      let hitPrismId: string | null = null;
      let consecutiveVoidSteps = 0;

      for (let step = 1; step <= MAX_STEPS; step++) {
        const nx = cx + dx * step;
        const nz = cz + dz * step;

        // Check main crystal hit
        if (
          level.crystal.requiresLightBeam &&
          level.crystal.x === nx &&
          level.crystal.z === nz &&
          level.crystal.elevation === elev
        ) {
          endX = nx;
          endZ = nz;
          hitType = 'crystal';
          crystalLitByBeam = true;
          break;
        }

        // Check auxiliary sub-crystal hit
        const sub = level.subCrystals?.find(
          (sc) => sc.x === nx && sc.z === nz && sc.elevation === elev
        );
        if (sub) {
          endX = nx;
          endZ = nz;
          hitType = 'subcrystal';
          newlyLitSubs.add(sub.id);
          break;
        }

        // Check prism hit
        const prism = (level.lightPrisms ?? []).find(
          (p) => p.x === nx && p.z === nz && p.elevation === elev
        );
        if (prism) {
          endX = nx;
          endZ = nz;
          hitType = 'prism';
          hitPrismId = prism.id;
          litPrismIds.add(prism.id);
          break;
        }

        // Check closed gate hit
        const gate = level.gates.find(
          (g) => g.x === nx && g.z === nz && g.elevation === elev && g.blocksLight
        );
        if (gate && !isGateOpen(level, stateWithSubs, gate.id)) {
          endX = nx;
          endZ = nz;
          hitType = 'gate';
          break;
        }

        // Check tile blocker or elevated terrain wall
        const tile = level.tiles.find((t) => t.x === nx && t.z === nz);
        if (tile && (tile.blocksLight || tile.elevation > elev)) {
          endX = nx;
          endZ = nz;
          hitType = 'wall';
          break;
        }

        if (!tile) {
          consecutiveVoidSteps++;
          if (consecutiveVoidSteps >= 4) {
            endX = nx;
            endZ = nz;
            hitType = 'void';
            break;
          }
        } else {
          consecutiveVoidSteps = 0;
        }

        if (step === MAX_STEPS) {
          endX = nx;
          endZ = nz;
          hitType = 'void';
        }
      }

      segments.push({
        fromX: cx,
        fromZ: cz,
        toX: endX,
        toZ: endZ,
        elevation: elev,
        hitType,
      });

      if (hitType === 'prism' && hitPrismId) {
        const nextDir = state.prismDirections[hitPrismId] ?? 0;
        const oppositeDir = ((dir + 2) % 4) as Direction;
        if (nextDir === oppositeDir) {
          break;
        }
        cx = endX;
        cz = endZ;
        dir = nextDir;
      } else {
        break;
      }
    }
  }

  return { segments, litPrismIds, newlyLitSubs, crystalLitByBeam };
}

export function computeLightPropagation(
  level: LevelDef,
  state: PuzzleRuntimeState
): {
  segments: LightSegment[];
  litPrismIds: string[];
  litSubCrystalIds: string[];
  crystalLitByBeam: boolean;
} {
  // Up to 3 fixed-point passes so energizing a sub-crystal immediately opens linked crystal gates
  const activeSubs = new Set<string>();
  let passResult = traceLightPass(level, state, activeSubs);

  for (let i = 0; i < 3; i++) {
    let changed = false;
    for (const id of passResult.newlyLitSubs) {
      if (!activeSubs.has(id)) {
        activeSubs.add(id);
        changed = true;
      }
    }
    if (!changed) break;
    passResult = traceLightPass(level, state, activeSubs);
  }

  return {
    segments: passResult.segments,
    litPrismIds: Array.from(passResult.litPrismIds),
    litSubCrystalIds: Array.from(passResult.newlyLitSubs),
    crystalLitByBeam: passResult.crystalLitByBeam,
  };
}

export function createInitialPuzzleState(
  level: LevelDef,
  activeCharacterId: CharacterId = 'wayfinder'
): PuzzleRuntimeState {
  const rotatingSteps: Record<string, Direction> = {};
  for (const r of level.rotatingPlatforms ?? []) {
    rotatingSteps[r.id] = r.initialStep;
  }

  const switchStates: Record<string, boolean> = {};
  for (const s of level.pressureSwitches ?? []) {
    switchStates[s.id] = false;
  }

  const elevationHigh: Record<string, boolean> = {};
  for (const l of level.elevationPlatforms ?? []) {
    elevationHigh[l.id] = l.initialHigh;
  }

  const prismDirections: Record<string, Direction> = {};
  for (const p of level.lightPrisms ?? []) {
    prismDirections[p.id] = p.initialDirection;
  }

  const heroNodesActive: Record<string, boolean> = {};
  for (const hn of level.heroNodes ?? []) {
    heroNodesActive[hn.id] = false;
  }

  const baseState: PuzzleRuntimeState = {
    levelId: level.id,
    activeCharacterId,
    rotatingSteps,
    switchStates,
    elevationHigh,
    prismDirections,
    heroNodesActive,
    echoCollectedInRun: false,
    abilityCooldown: 0,
    abilityActiveTimer: 0,
    crystalRestored: false,
    portalAwakened: false,
    lightSegments: [],
    litPrismIds: [],
    litSubCrystalIds: [],
    crystalLitByBeam: false,
    interactionsCount: 0,
    elapsedSeconds: 0,
    completed: false,
  };

  return refreshDerivedPuzzleState(level, baseState);
}

export function refreshDerivedPuzzleState(
  level: LevelDef,
  state: PuzzleRuntimeState
): PuzzleRuntimeState {
  const light = computeLightPropagation(level, state);
  const allSubCrystalsSatisfied =
    !level.subCrystals ||
    level.subCrystals.length === 0 ||
    level.subCrystals.every((sc) => light.litSubCrystalIds.includes(sc.id));
  const crystalRestored =
    state.crystalRestored ||
    (Boolean(level.crystal.requiresLightBeam) && light.crystalLitByBeam && allSubCrystalsSatisfied);
  const portalAwakened = state.portalAwakened || crystalRestored;

  return {
    ...state,
    lightSegments: light.segments,
    litPrismIds: light.litPrismIds,
    litSubCrystalIds: light.litSubCrystalIds,
    crystalLitByBeam: light.crystalLitByBeam,
    crystalRestored,
    portalAwakened,
  };
}

export function createInitialPlayerState(level: LevelDef): PlayerRuntimeState {
  const spawnTile = getSurfaceAtTile(level, createInitialPuzzleState(level), level.spawn.x, level.spawn.z);
  const elev = spawnTile ? spawnTile.elevation : 0;
  return {
    x: level.spawn.x * TILE_SIZE,
    y: elev * ELEVATION_STEP,
    z: level.spawn.z * TILE_SIZE,
    vx: 0,
    vz: 0,
    facingAngle: level.spawn.facingAngle,
    isMoving: false,
    walkCycle: 0,
    interactTimer: 0,
    lastStepTileKey: `${level.spawn.x},${level.spawn.z}`,
  };
}

export function worldToTile(val: number): number {
  return Math.round(val / TILE_SIZE);
}

export function isPointWalkable(
  level: LevelDef,
  state: PuzzleRuntimeState,
  wx: number,
  wz: number,
  currentGx: number,
  currentGz: number
): boolean {
  const currentSurface = getSurfaceAtTile(level, state, currentGx, currentGz);
  if (!currentSurface || !currentSurface.walkable) return false;

  const offsets = [
    [0, 0],
    [PLAYER_RADIUS, 0],
    [-PLAYER_RADIUS, 0],
    [0, PLAYER_RADIUS],
    [0, -PLAYER_RADIUS],
    [PLAYER_RADIUS * 0.7, PLAYER_RADIUS * 0.7],
    [-PLAYER_RADIUS * 0.7, PLAYER_RADIUS * 0.7],
    [PLAYER_RADIUS * 0.7, -PLAYER_RADIUS * 0.7],
    [-PLAYER_RADIUS * 0.7, -PLAYER_RADIUS * 0.7],
  ];

  for (const [ox, oz] of offsets) {
    const sx = worldToTile(wx + ox);
    const sz = worldToTile(wz + oz);
    if (sx === currentGx && sz === currentGz) continue;
    const targetSurface = getSurfaceAtTile(level, state, sx, sz);
    if (!canTraverseBetween(currentSurface, targetSurface)) {
      return false;
    }
  }
  return true;
}

export interface MovementStepOptions {
  noClip?: boolean;
  freeMovement?: boolean;
  flyMode?: boolean;
  flyOffsetY?: number;
  speedMultiplier?: number;
}

export function stepPlayerMovement(
  level: LevelDef,
  puzzleState: PuzzleRuntimeState,
  player: PlayerRuntimeState,
  inputX: number,
  inputZ: number,
  dt: number,
  options?: MovementStepOptions
): {
  player: PlayerRuntimeState;
  puzzleState: PuzzleRuntimeState;
  triggeredSwitchId: string | null;
  collectedEchoId: string | null;
  enteredPortal: boolean;
} {
  const MOVE_SPEED = 4.6 * (options?.speedMultiplier ?? 1);
  const bypassTileCollision = Boolean(options?.noClip || options?.freeMovement);
  const currentGx = worldToTile(player.x);
  const currentGz = worldToTile(player.z);

  let nextX = player.x;
  let nextZ = player.z;
  let vx = 0;
  let vz = 0;
  let isMoving = false;
  let facingAngle = player.facingAngle;

  const mag = Math.hypot(inputX, inputZ);
  if (mag > 0.01) {
    const nx = inputX / mag;
    const nz = inputZ / mag;
    vx = nx * MOVE_SPEED;
    vz = nz * MOVE_SPEED;
    isMoving = true;
    facingAngle = Math.atan2(nx, nz);

    const tryX = player.x + vx * dt;
    if (bypassTileCollision) {
      if (options?.freeMovement || options?.flyMode) {
        nextX = tryX;
      } else {
        // No Clip: allow passing through obstacles/closed gates/water as long as a tile exists or within island bounds
        const tryGx = worldToTile(tryX);
        const hasTile = Boolean(getSurfaceAtTile(level, puzzleState, tryGx, currentGz));
        if (hasTile) nextX = tryX;
      }
    } else if (isPointWalkable(level, puzzleState, tryX, nextZ, currentGx, currentGz)) {
      nextX = tryX;
    }

    const updatedGx = worldToTile(nextX);
    const tryZ = player.z + vz * dt;
    if (bypassTileCollision) {
      if (options?.freeMovement || options?.flyMode) {
        nextZ = tryZ;
      } else {
        const tryGz = worldToTile(tryZ);
        const hasTile = Boolean(getSurfaceAtTile(level, puzzleState, updatedGx, tryGz));
        if (hasTile) nextZ = tryZ;
      }
    } else if (isPointWalkable(level, puzzleState, nextX, tryZ, updatedGx, currentGz)) {
      nextZ = tryZ;
    }
  }

  const finalGx = worldToTile(nextX);
  const finalGz = worldToTile(nextZ);
  const surface = getSurfaceAtTile(level, puzzleState, finalGx, finalGz);

  let targetY = player.y;
  if (options?.flyMode) {
    const baseGround = surface ? surface.elevation * ELEVATION_STEP : 0;
    targetY = Math.max(baseGround, baseGround + (options.flyOffsetY ?? 0));
  } else if (surface) {
    targetY = surface.elevation * ELEVATION_STEP;
    if (surface.isStair) {
      const north = getSurfaceAtTile(level, puzzleState, finalGx, finalGz - 1);
      const south = getSurfaceAtTile(level, puzzleState, finalGx, finalGz + 1);
      const east = getSurfaceAtTile(level, puzzleState, finalGx + 1, finalGz);
      const west = getSurfaceAtTile(level, puzzleState, finalGx - 1, finalGz);
      const localZ = (nextZ - finalGz * TILE_SIZE) / TILE_SIZE;
      const localX = (nextX - finalGx * TILE_SIZE) / TILE_SIZE;
      if (north && north.elevation > surface.elevation) {
        targetY = (surface.elevation + Math.max(0, 0.5 - localZ) * 0.5) * ELEVATION_STEP;
      } else if (south && south.elevation > surface.elevation) {
        targetY = (surface.elevation + Math.max(0, 0.5 + localZ) * 0.5) * ELEVATION_STEP;
      } else if (east && east.elevation > surface.elevation) {
        targetY = (surface.elevation + Math.max(0, 0.5 + localX) * 0.5) * ELEVATION_STEP;
      } else if (west && west.elevation > surface.elevation) {
        targetY = (surface.elevation + Math.max(0, 0.5 - localX) * 0.5) * ELEVATION_STEP;
      }
    }
  }

  const smoothY = player.y + (targetY - player.y) * (1 - Math.exp(-12 * dt));
  const distMoved = Math.hypot(nextX - player.x, nextZ - player.z);
  const walkCycle = isMoving ? player.walkCycle + distMoved * 2.6 : player.walkCycle;

  const tileKey = `${finalGx},${finalGz}`;
  let nextPuzzleState: PuzzleRuntimeState =
    puzzleState.abilityCooldown > 0 || puzzleState.abilityActiveTimer > 0
      ? {
          ...puzzleState,
          abilityCooldown: Math.max(0, puzzleState.abilityCooldown - dt),
          abilityActiveTimer: Math.max(0, puzzleState.abilityActiveTimer - dt),
        }
      : puzzleState;
  let triggeredSwitchId: string | null = null;
  let collectedEchoId: string | null = null;

  if (tileKey !== player.lastStepTileKey) {
    const sw = level.pressureSwitches.find((s) => s.x === finalGx && s.z === finalGz);
    if (sw && sw.latch && !nextPuzzleState.switchStates[sw.id]) {
      nextPuzzleState = refreshDerivedPuzzleState(level, {
        ...nextPuzzleState,
        switchStates: { ...nextPuzzleState.switchStates, [sw.id]: true },
        interactionsCount: nextPuzzleState.interactionsCount + 1,
      });
      triggeredSwitchId = sw.id;
    }
  }

  if (level.echoFragment && !nextPuzzleState.echoCollectedInRun) {
    const distEcho = Math.hypot(
      nextX - level.echoFragment.x * TILE_SIZE,
      nextZ - level.echoFragment.z * TILE_SIZE
    );
    const sameElev =
      Math.abs((surface?.elevation ?? level.echoFragment.elevation) - level.echoFragment.elevation) <= 1;
    if (distEcho < 0.92 && sameElev) {
      collectedEchoId = level.echoFragment.id;
      nextPuzzleState = {
        ...nextPuzzleState,
        echoCollectedInRun: true,
      };
    }
  }

  let enteredPortal = false;
  if (
    nextPuzzleState.portalAwakened &&
    !nextPuzzleState.completed &&
    finalGx === level.portal.x &&
    finalGz === level.portal.z
  ) {
    const distToPortal = Math.hypot(
      nextX - level.portal.x * TILE_SIZE,
      nextZ - level.portal.z * TILE_SIZE
    );
    if (distToPortal < 0.72) {
      enteredPortal = true;
      nextPuzzleState = { ...nextPuzzleState, completed: true };
    }
  }

  return {
    player: {
      x: nextX,
      y: smoothY,
      z: nextZ,
      vx,
      vz,
      facingAngle,
      isMoving,
      walkCycle,
      interactTimer: Math.max(0, player.interactTimer - dt),
      lastStepTileKey: tileKey,
    },
    puzzleState: nextPuzzleState,
    triggeredSwitchId,
    collectedEchoId,
    enteredPortal,
  };
}

export function findNearestInteraction(
  level: LevelDef,
  state: PuzzleRuntimeState,
  player: PlayerRuntimeState
): InteractionTarget | null {
  const candidates: Array<InteractionTarget & { dist: number }> = [];

  const checkDist = (gx: number, gz: number) =>
    Math.hypot(player.x - gx * TILE_SIZE, player.z - gz * TILE_SIZE);

  if (!state.crystalRestored && !level.crystal.requiresLightBeam) {
    const dist = checkDist(level.crystal.x, level.crystal.z);
    if (dist <= INTERACT_RANGE) {
      candidates.push({
        kind: 'crystal',
        id: level.crystal.id,
        prompt: level.crystal.label,
        worldX: level.crystal.x * TILE_SIZE,
        worldZ: level.crystal.z * TILE_SIZE,
        dist,
      });
    }
  }

  if (state.portalAwakened && !state.completed) {
    const dist = checkDist(level.portal.x, level.portal.z);
    if (dist <= INTERACT_RANGE * 0.9) {
      candidates.push({
        kind: 'portal',
        id: level.portal.id,
        prompt: 'Enter Awakening Portal',
        worldX: level.portal.x * TILE_SIZE,
        worldZ: level.portal.z * TILE_SIZE,
        dist,
      });
    }
  }

  for (const prism of level.lightPrisms ?? []) {
    const dist = checkDist(prism.x, prism.z);
    if (dist <= INTERACT_RANGE) {
      candidates.push({
        kind: 'prism',
        id: prism.id,
        prompt: prism.label,
        worldX: prism.x * TILE_SIZE,
        worldZ: prism.z * TILE_SIZE,
        dist,
      });
    }
  }

  for (const lift of level.elevationPlatforms ?? []) {
    if (lift.linkedSwitchId) continue;
    const dist = checkDist(lift.x, lift.z);
    if (dist <= INTERACT_RANGE * 0.92) {
      const isHigh = Boolean(state.elevationHigh[lift.id]);
      candidates.push({
        kind: 'elevation',
        id: lift.id,
        prompt: isHigh ? 'Lower Stone Lift' : 'Raise Stone Lift',
        worldX: lift.x * TILE_SIZE,
        worldZ: lift.z * TILE_SIZE,
        dist,
      });
    }
  }

  for (const plat of level.rotatingPlatforms ?? []) {
    const anchor = plat.crankPos ?? { x: plat.pivotX, z: plat.pivotZ };
    const dist = checkDist(anchor.x, anchor.z);
    if (dist <= INTERACT_RANGE) {
      candidates.push({
        kind: 'rotating',
        id: plat.id,
        prompt: plat.label,
        worldX: anchor.x * TILE_SIZE,
        worldZ: anchor.z * TILE_SIZE,
        dist,
      });
    }
  }

  for (const sw of level.pressureSwitches ?? []) {
    const dist = checkDist(sw.x, sw.z);
    if (dist <= INTERACT_RANGE * 0.88) {
      const active = Boolean(state.switchStates[sw.id]);
      if (!active || !sw.latch) {
        candidates.push({
          kind: 'switch',
          id: sw.id,
          prompt: sw.label,
          worldX: sw.x * TILE_SIZE,
          worldZ: sw.z * TILE_SIZE,
          dist,
        });
      }
    }
  }

  for (const hn of level.heroNodes ?? []) {
    if (hn.heroId !== state.activeCharacterId) continue;
    const dist = checkDist(hn.x, hn.z);
    if (dist <= INTERACT_RANGE * 1.1 && !state.heroNodesActive?.[hn.id]) {
      candidates.push({
        kind: 'hero_node',
        id: hn.id,
        prompt: `${hn.label} [E/Q]`,
        worldX: hn.x * TILE_SIZE,
        worldZ: hn.z * TILE_SIZE,
        dist,
      });
    }
  }

  if (level.echoFragment && !state.echoCollectedInRun) {
    const dist = checkDist(level.echoFragment.x, level.echoFragment.z);
    if (dist <= INTERACT_RANGE * 0.9) {
      candidates.push({
        kind: 'echo',
        id: level.echoFragment.id,
        prompt: `Gather Echo: ${level.echoFragment.title}`,
        worldX: level.echoFragment.x * TILE_SIZE,
        worldZ: level.echoFragment.z * TILE_SIZE,
        dist,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.dist - b.dist);
  const best = candidates[0];
  return {
    kind: best.kind,
    id: best.id,
    prompt: best.prompt,
    worldX: best.worldX,
    worldZ: best.worldZ,
  };
}

export function activateHeroAbility(
  level: LevelDef,
  state: PuzzleRuntimeState,
  player: PlayerRuntimeState
): { puzzleState: PuzzleRuntimeState; activatedNodeIds: string[]; pulsed: boolean } {
  if (state.abilityCooldown > 0.05) {
    return { puzzleState: state, activatedNodeIds: [], pulsed: false };
  }

  const nextHeroNodes = { ...state.heroNodesActive };
  const activatedNodeIds: string[] = [];
  const nextElev = { ...state.elevationHigh };

  for (const hn of level.heroNodes ?? []) {
    if (hn.heroId !== state.activeCharacterId) continue;
    const dist = Math.hypot(player.x - hn.x * TILE_SIZE, player.z - hn.z * TILE_SIZE);
    if (dist <= INTERACT_RANGE * 1.65 && !nextHeroNodes[hn.id]) {
      nextHeroNodes[hn.id] = true;
      activatedNodeIds.push(hn.id);
      if (hn.boostsLiftId) {
        nextElev[hn.boostsLiftId] = !nextElev[hn.boostsLiftId];
      }
    }
  }

  const nextState = refreshDerivedPuzzleState(level, {
    ...state,
    heroNodesActive: nextHeroNodes,
    elevationHigh: nextElev,
    abilityCooldown: 0.9,
    abilityActiveTimer: 2.6,
  });

  return { puzzleState: nextState, activatedNodeIds, pulsed: true };
}

export function executeInteraction(
  level: LevelDef,
  state: PuzzleRuntimeState,
  target: InteractionTarget
): PuzzleRuntimeState {
  let next = state;

  switch (target.kind) {
    case 'switch': {
      const sw = level.pressureSwitches.find((s) => s.id === target.id);
      if (!sw) return state;
      const cur = Boolean(state.switchStates[sw.id]);
      const nextVal = sw.latch ? true : !cur;
      next = {
        ...state,
        switchStates: { ...state.switchStates, [sw.id]: nextVal },
        interactionsCount: state.interactionsCount + 1,
      };
      break;
    }
    case 'rotating': {
      const cur = state.rotatingSteps[target.id] ?? 0;
      const nextStep = ((cur + 1) % 4) as Direction;
      next = {
        ...state,
        rotatingSteps: { ...state.rotatingSteps, [target.id]: nextStep },
        interactionsCount: state.interactionsCount + 1,
      };
      break;
    }
    case 'elevation': {
      const cur = Boolean(state.elevationHigh[target.id]);
      next = {
        ...state,
        elevationHigh: { ...state.elevationHigh, [target.id]: !cur },
        interactionsCount: state.interactionsCount + 1,
      };
      break;
    }
    case 'prism': {
      const cur = state.prismDirections[target.id] ?? 0;
      const nextDir = ((cur + 1) % 4) as Direction;
      next = {
        ...state,
        prismDirections: { ...state.prismDirections, [target.id]: nextDir },
        interactionsCount: state.interactionsCount + 1,
      };
      break;
    }
    case 'crystal': {
      next = {
        ...state,
        crystalRestored: true,
        portalAwakened: true,
        interactionsCount: state.interactionsCount + 1,
      };
      break;
    }
    case 'hero_node': {
      const hn = (level.heroNodes ?? []).find((n) => n.id === target.id);
      if (!hn || hn.heroId !== state.activeCharacterId) return state;
      const nextElev = { ...state.elevationHigh };
      if (hn.boostsLiftId) {
        nextElev[hn.boostsLiftId] = !nextElev[hn.boostsLiftId];
      }
      next = {
        ...state,
        heroNodesActive: { ...state.heroNodesActive, [hn.id]: true },
        elevationHigh: nextElev,
        abilityActiveTimer: 2.2,
      };
      break;
    }
    case 'echo': {
      next = {
        ...state,
        echoCollectedInRun: true,
      };
      break;
    }
    case 'portal': {
      if (state.portalAwakened) {
        next = {
          ...state,
          completed: true,
        };
      }
      break;
    }
  }

  return refreshDerivedPuzzleState(level, next);
}
