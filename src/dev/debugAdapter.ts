import {
  createInitialPlayerState,
  createInitialPuzzleState,
  getSurfaceAtTile,
  refreshDerivedPuzzleState,
} from '../game/rules';
import {
  CharacterId,
  Direction,
  ELEVATION_STEP,
  LevelDef,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  TILE_SIZE,
} from '../game/types';

export function clonePuzzleState(state: PuzzleRuntimeState): PuzzleRuntimeState {
  return {
    ...state,
    rotatingSteps: { ...state.rotatingSteps },
    switchStates: { ...state.switchStates },
    elevationHigh: { ...state.elevationHigh },
    prismDirections: { ...state.prismDirections },
    lightSegments: state.lightSegments.map((s) => ({ ...s })),
    litPrismIds: [...state.litPrismIds],
    litSubCrystalIds: [...state.litSubCrystalIds],
    heroNodesActive: { ...state.heroNodesActive },
    debugGateOverrides: state.debugGateOverrides ? { ...state.debugGateOverrides } : undefined,
    debugDisabledEmitters: state.debugDisabledEmitters
      ? { ...state.debugDisabledEmitters }
      : undefined,
  };
}

export function clonePlayerState(player: PlayerRuntimeState): PlayerRuntimeState {
  return { ...player };
}

export function forceSwitchState(
  level: LevelDef,
  state: PuzzleRuntimeState,
  switchId: string,
  active: boolean
): PuzzleRuntimeState {
  const next: PuzzleRuntimeState = {
    ...state,
    switchStates: {
      ...state.switchStates,
      [switchId]: active,
    },
  };
  return refreshDerivedPuzzleState(level, next);
}

export function resetSwitchState(
  level: LevelDef,
  state: PuzzleRuntimeState,
  switchId: string
): PuzzleRuntimeState {
  return forceSwitchState(level, state, switchId, false);
}

export function forceGateOverride(
  level: LevelDef,
  state: PuzzleRuntimeState,
  gateId: string,
  mode: 'open' | 'closed' | null
): PuzzleRuntimeState {
  const overrides = { ...(state.debugGateOverrides ?? {}) };
  if (mode === null) {
    delete overrides[gateId];
  } else {
    overrides[gateId] = mode;
  }
  const hasAny = Object.keys(overrides).length > 0;
  const next: PuzzleRuntimeState = {
    ...state,
    debugGateOverrides: hasAny ? overrides : undefined,
  };
  return refreshDerivedPuzzleState(level, next);
}

export function setRotatingPlatformStep(
  level: LevelDef,
  state: PuzzleRuntimeState,
  platformId: string,
  step: Direction
): PuzzleRuntimeState {
  const next: PuzzleRuntimeState = {
    ...state,
    rotatingSteps: {
      ...state.rotatingSteps,
      [platformId]: step,
    },
  };
  return refreshDerivedPuzzleState(level, next);
}

export function resetRotatingPlatform(
  level: LevelDef,
  state: PuzzleRuntimeState,
  platformId: string
): PuzzleRuntimeState {
  const plat = level.rotatingPlatforms.find((p) => p.id === platformId);
  if (!plat) return state;
  return setRotatingPlatformStep(level, state, platformId, plat.initialStep);
}

export function setElevationPlatformState(
  level: LevelDef,
  state: PuzzleRuntimeState,
  liftId: string,
  high: boolean
): PuzzleRuntimeState {
  const lift = level.elevationPlatforms.find((l) => l.id === liftId);
  let next: PuzzleRuntimeState = {
    ...state,
    elevationHigh: {
      ...state.elevationHigh,
      [liftId]: high,
    },
  };
  if (lift?.linkedSwitchId) {
    next = {
      ...next,
      switchStates: {
        ...next.switchStates,
        [lift.linkedSwitchId]: high,
      },
    };
  }
  return refreshDerivedPuzzleState(level, next);
}

export function resetElevationPlatform(
  level: LevelDef,
  state: PuzzleRuntimeState,
  liftId: string
): PuzzleRuntimeState {
  const lift = level.elevationPlatforms.find((l) => l.id === liftId);
  if (!lift) return state;
  return setElevationPlatformState(level, state, liftId, lift.initialHigh);
}

export function setEmitterEnabled(
  level: LevelDef,
  state: PuzzleRuntimeState,
  emitterId: string,
  enabled: boolean
): PuzzleRuntimeState {
  const disabledMap = { ...(state.debugDisabledEmitters ?? {}) };
  if (enabled) {
    delete disabledMap[emitterId];
  } else {
    disabledMap[emitterId] = true;
  }
  const hasAny = Object.keys(disabledMap).length > 0;
  const next: PuzzleRuntimeState = {
    ...state,
    debugDisabledEmitters: hasAny ? disabledMap : undefined,
  };
  return refreshDerivedPuzzleState(level, next);
}

export function setPrismDirection(
  level: LevelDef,
  state: PuzzleRuntimeState,
  prismId: string,
  direction: Direction
): PuzzleRuntimeState {
  const next: PuzzleRuntimeState = {
    ...state,
    prismDirections: {
      ...state.prismDirections,
      [prismId]: direction,
    },
  };
  return refreshDerivedPuzzleState(level, next);
}

export function forceSubCrystalLit(
  level: LevelDef,
  state: PuzzleRuntimeState,
  subCrystalId: string,
  lit: boolean
): PuzzleRuntimeState {
  const set = new Set(state.litSubCrystalIds);
  if (lit) set.add(subCrystalId);
  else set.delete(subCrystalId);
  const next: PuzzleRuntimeState = {
    ...state,
    litSubCrystalIds: Array.from(set),
  };
  return next;
}

export function forceCrystalState(
  level: LevelDef,
  state: PuzzleRuntimeState,
  restored: boolean
): PuzzleRuntimeState {
  if (restored) {
    return refreshDerivedPuzzleState(level, {
      ...state,
      crystalRestored: true,
      portalAwakened: true,
    });
  }
  return refreshDerivedPuzzleState(level, {
    ...state,
    crystalRestored: false,
    portalAwakened: false,
    completed: false,
  });
}

export function resetAllLightOverrides(
  level: LevelDef,
  state: PuzzleRuntimeState
): PuzzleRuntimeState {
  const prismDirections: Record<string, Direction> = {};
  for (const p of level.lightPrisms) {
    prismDirections[p.id] = p.initialDirection;
  }
  return refreshDerivedPuzzleState(level, {
    ...state,
    prismDirections,
    debugDisabledEmitters: undefined,
    crystalRestored: false,
    portalAwakened: false,
    completed: false,
  });
}

export function forceHeroNodeActive(
  level: LevelDef,
  state: PuzzleRuntimeState,
  nodeId: string,
  active: boolean
): PuzzleRuntimeState {
  const next: PuzzleRuntimeState = {
    ...state,
    heroNodesActive: {
      ...state.heroNodesActive,
      [nodeId]: active,
    },
  };
  return refreshDerivedPuzzleState(level, next);
}

export function resetPuzzleToInitial(
  level: LevelDef,
  characterId: CharacterId = 'wayfinder'
): PuzzleRuntimeState {
  return createInitialPuzzleState(level, characterId);
}

export function teleportPlayerToTile(
  level: LevelDef,
  state: PuzzleRuntimeState,
  player: PlayerRuntimeState,
  gx: number,
  gz: number,
  overrideElevation?: number
): PlayerRuntimeState {
  const surface = getSurfaceAtTile(level, state, gx, gz);
  const elev = overrideElevation ?? surface?.elevation ?? 0;
  return {
    ...player,
    x: gx * TILE_SIZE,
    y: elev * ELEVATION_STEP,
    z: gz * TILE_SIZE,
    vx: 0,
    vz: 0,
    isMoving: false,
    lastStepTileKey: `${gx},${gz}`,
  };
}

export function resetPlayerToSpawn(level: LevelDef): PlayerRuntimeState {
  return createInitialPlayerState(level);
}

export function countPuzzleOverrides(
  level: LevelDef,
  state: PuzzleRuntimeState
): number {
  let count = 0;
  if (state.debugGateOverrides) {
    count += Object.keys(state.debugGateOverrides).length;
  }
  if (state.debugDisabledEmitters) {
    count += Object.keys(state.debugDisabledEmitters).length;
  }
  for (const sw of level.pressureSwitches) {
    if (state.switchStates[sw.id]) count++;
  }
  for (const r of level.rotatingPlatforms) {
    if ((state.rotatingSteps[r.id] ?? r.initialStep) !== r.initialStep) count++;
  }
  for (const l of level.elevationPlatforms) {
    if (Boolean(state.elevationHigh[l.id]) !== l.initialHigh) count++;
  }
  for (const p of level.lightPrisms) {
    if ((state.prismDirections[p.id] ?? p.initialDirection) !== p.initialDirection) count++;
  }
  for (const hn of level.heroNodes ?? []) {
    if (state.heroNodesActive?.[hn.id]) count++;
  }
  return count;
}
