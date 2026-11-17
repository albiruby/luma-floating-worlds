import { getCharacterById } from './characters';
import {
  getSurfaceAtTile,
  isPointWalkable,
  refreshDerivedPuzzleState,
  worldToTile,
} from './rules';
import {
  CharacterId,
  ELEVATION_STEP,
  LevelDef,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  SynergyKind,
  TILE_SIZE,
} from './types';

export interface SynergyPairDefinition {
  kind: SynergyKind;
  name: string;
  heroA: CharacterId;
  heroB: CharacterId;
  shortDesc: string;
  effectLabel: string;
  accentHex: string;
}

export const SYNERGY_DEFINITIONS: SynergyPairDefinition[] = [
  {
    kind: 'root_waterway',
    name: 'Living Root-Waterway',
    heroA: 'sylvi',
    heroB: 'neris',
    shortDesc: 'Sylvi & Neris weave flowering roots and tidal streams into walkable living bridges.',
    effectLabel: 'Creates Living Bridge',
    accentHex: '#34d399',
  },
  {
    kind: 'steam_forge_lift',
    name: 'Steam-Forge Conduit',
    heroA: 'kael',
    heroB: 'neris',
    shortDesc: 'Kael & Neris superheat mist into high-pressure steam to power lifts and forge gates.',
    effectLabel: 'Boosts Steam Lift & Gates',
    accentHex: '#fb923c',
  },
  {
    kind: 'wind_rune_relay',
    name: 'Wind-Rune Resonance',
    heroA: 'zeph',
    heroB: 'wayfinder',
    shortDesc: 'Zeph & Wayfinder harmonize lantern light and gale currents to unseal distant sanctum gates.',
    effectLabel: 'Unseals Relay Gate',
    accentHex: '#60a5fa',
  },
];

export function getSynergyDefinition(kind: SynergyKind): SynergyPairDefinition {
  return SYNERGY_DEFINITIONS.find((s) => s.kind === kind) ?? SYNERGY_DEFINITIONS[0];
}

export function doesPartyMatchSynergy(
  heroA: CharacterId,
  heroB: CharacterId | null | undefined,
  reqA: CharacterId,
  reqB: CharacterId
): boolean {
  if (!heroB) return false;
  return (heroA === reqA && heroB === reqB) || (heroA === reqB && heroB === reqA);
}

export function getMatchingSynergiesForParty(
  hero1: CharacterId,
  hero2: CharacterId | null | undefined
): SynergyPairDefinition[] {
  if (!hero2) return [];
  return SYNERGY_DEFINITIONS.filter((s) => doesPartyMatchSynergy(hero1, hero2, s.heroA, s.heroB));
}

export interface CompanionRuntimeState {
  x: number;
  y: number;
  z: number;
  facingAngle: number;
  isMoving: boolean;
  walkCycle: number;
  lastStepTileKey: string | null;
}

export function createInitialCompanionState(
  level: LevelDef,
  primaryPlayer: PlayerRuntimeState
): CompanionRuntimeState {
  // Prefer an adjacent walkable tile next to spawn so companion never spawns in void
  const candidates = [
    { gx: level.spawn.x - 1, gz: level.spawn.z },
    { gx: level.spawn.x + 1, gz: level.spawn.z },
    { gx: level.spawn.x, gz: level.spawn.z - 1 },
    { gx: level.spawn.x, gz: level.spawn.z + 1 },
  ];
  const initPuzzle = refreshDerivedPuzzleState(level, {
    levelId: level.id,
    activeCharacterId: 'wayfinder',
    rotatingSteps: Object.fromEntries((level.rotatingPlatforms ?? []).map((p) => [p.id, p.initialStep])),
    switchStates: {},
    elevationHigh: Object.fromEntries((level.elevationPlatforms ?? []).map((l) => [l.id, l.initialHigh])),
    prismDirections: Object.fromEntries((level.lightPrisms ?? []).map((p) => [p.id, p.initialDirection])),
    heroNodesActive: {},
    echoPlateStates: {},
    synergyNodesActive: {},
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
  });

  for (const c of candidates) {
    const surf = getSurfaceAtTile(level, initPuzzle, c.gx, c.gz);
    if (surf && surf.walkable) {
      return {
        x: c.gx * TILE_SIZE,
        y: surf.elevation * ELEVATION_STEP,
        z: c.gz * TILE_SIZE,
        facingAngle: level.spawn.facingAngle,
        isMoving: false,
        walkCycle: 0,
        lastStepTileKey: `${c.gx},${c.gz}`,
      };
    }
  }

  return {
    x: primaryPlayer.x,
    y: primaryPlayer.y,
    z: primaryPlayer.z,
    facingAngle: primaryPlayer.facingAngle,
    isMoving: false,
    walkCycle: 0,
    lastStepTileKey: primaryPlayer.lastStepTileKey,
  };
}

/**
 * Deterministically steps the party companion in either 'follow' or 'hold' state.
 * In 'hold' mode, the companion stays planted to hold switches/plates (Hero Relay).
 */
export function stepCompanionMovement(
  level: LevelDef,
  puzzleState: PuzzleRuntimeState,
  primaryPlayer: PlayerRuntimeState,
  companion: CompanionRuntimeState,
  dt: number,
  holdPosition: boolean
): CompanionRuntimeState {
  const gx = worldToTile(companion.x);
  const gz = worldToTile(companion.z);
  const currentSurface = getSurfaceAtTile(level, puzzleState, gx, gz);
  const groundY = currentSurface ? currentSurface.elevation * ELEVATION_STEP : companion.y;
  const smoothY = companion.y + (groundY - companion.y) * (1 - Math.exp(-12 * dt));

  if (holdPosition) {
    return {
      ...companion,
      y: smoothY,
      isMoving: false,
    };
  }

  const dx = primaryPlayer.x - companion.x;
  const dz = primaryPlayer.z - companion.z;
  const dist = Math.hypot(dx, dz);

  // Follow outside comfortable relay leash radius
  if (dist <= 1.65) {
    return {
      ...companion,
      y: smoothY,
      isMoving: false,
    };
  }

  const speed = 4.15;
  const nx = dx / dist;
  const nz = dz / dist;
  const facingAngle = Math.atan2(nx, nz);

  let nextX = companion.x;
  let nextZ = companion.z;

  const tryX = companion.x + nx * speed * dt;
  if (isPointWalkable(level, puzzleState, tryX, nextZ, gx, gz)) {
    nextX = tryX;
  }

  const ugx = worldToTile(nextX);
  const tryZ = companion.z + nz * speed * dt;
  if (isPointWalkable(level, puzzleState, nextX, tryZ, ugx, gz)) {
    nextZ = tryZ;
  }

  const moved = Math.hypot(nextX - companion.x, nextZ - companion.z);
  const isMoving = moved > 0.002;
  const finalGx = worldToTile(nextX);
  const finalGz = worldToTile(nextZ);
  const finalSurface = getSurfaceAtTile(level, puzzleState, finalGx, finalGz);
  const finalTargetY = finalSurface ? finalSurface.elevation * ELEVATION_STEP : smoothY;

  return {
    x: nextX,
    y: companion.y + (finalTargetY - companion.y) * (1 - Math.exp(-12 * dt)),
    z: nextZ,
    facingAngle,
    isMoving,
    walkCycle: isMoving ? companion.walkCycle + moved * 2.6 : companion.walkCycle,
    lastStepTileKey: `${finalGx},${finalGz}`,
  };
}

/**
 * Swaps active control between Primary Hero and Party Companion cleanly ([Tab]).
 */
export function swapActivePartyHero(
  puzzleState: PuzzleRuntimeState,
  primaryPlayer: PlayerRuntimeState,
  companion: CompanionRuntimeState
): {
  puzzleState: PuzzleRuntimeState;
  player: PlayerRuntimeState;
  companion: CompanionRuntimeState;
  swappedToName: string;
} {
  const companionId = puzzleState.companionCharacterId;
  if (!companionId) {
    return {
      puzzleState,
      player: primaryPlayer,
      companion,
      swappedToName: getCharacterById(puzzleState.activeCharacterId).name,
    };
  }

  const prevActive = puzzleState.activeCharacterId;
  const nextSlot: 0 | 1 = puzzleState.activePartySlot === 1 ? 0 : 1;

  const nextPlayer: PlayerRuntimeState = {
    x: companion.x,
    y: companion.y,
    z: companion.z,
    vx: 0,
    vz: 0,
    facingAngle: companion.facingAngle,
    isMoving: false,
    walkCycle: companion.walkCycle,
    interactTimer: 0,
    lastStepTileKey: companion.lastStepTileKey,
  };

  const nextCompanion: CompanionRuntimeState = {
    x: primaryPlayer.x,
    y: primaryPlayer.y,
    z: primaryPlayer.z,
    facingAngle: primaryPlayer.facingAngle,
    isMoving: false,
    walkCycle: primaryPlayer.walkCycle,
    lastStepTileKey: primaryPlayer.lastStepTileKey,
  };

  const nextPuzzle: PuzzleRuntimeState = {
    ...puzzleState,
    activeCharacterId: companionId,
    companionCharacterId: prevActive,
    activePartySlot: nextSlot,
    companionPos: {
      x: nextCompanion.x,
      y: nextCompanion.y,
      z: nextCompanion.z,
      facingAngle: nextCompanion.facingAngle,
      isMoving: false,
      walkCycle: nextCompanion.walkCycle,
    },
  };

  return {
    puzzleState: nextPuzzle,
    player: nextPlayer,
    companion: nextCompanion,
    swappedToName: getCharacterById(companionId).name,
  };
}
