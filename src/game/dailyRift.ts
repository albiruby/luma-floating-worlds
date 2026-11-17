import { computeStageHash, LUMA_ENGINE_VERSION } from './echoEngine';
import { validateCustomLevel } from './stageValidator';
import {
  DailyChallengeType,
  DailyRiftRecord,
  Direction,
  LevelDef,
  TerrainType,
  TileDef,
  WorldId,
} from './types';

export const DAILY_RIFT_GENERATOR_VERSION = 'rift-v1';

export type RiftCadence = 'daily' | 'weekly' | 'monthly';

export interface DailyRiftSpec {
  dateKey: string;
  cadence: RiftCadence;
  seed: number;
  challengeCode: string;
  generatorVersion: string;
  challengeType: DailyChallengeType;
  challengeTitle: string;
  constraintLabel: string;
  timeLimitSeconds?: number;
  actionLimit?: number;
  worldTheme: WorldId;
  level: LevelDef;
  stageHash: string;
  verifiedBySolver: boolean;
  shortestActions: number | null;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeedString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function getDateKeyForCadence(cadence: RiftCadence, date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  if (cadence === 'monthly') return `${y}-${m}`;
  if (cadence === 'weekly') {
    const startOfYear = Date.UTC(y, 0, 1);
    const diffDays = Math.floor((Date.UTC(y, date.getUTCMonth(), date.getUTCDate()) - startOfYear) / 86400000);
    const week = String(Math.floor(diffDays / 7) + 1).padStart(2, '0');
    return `${y}-W${week}`;
  }
  return `${y}-${m}-${d}`;
}

export function encodeRiftChallengeCode(dateKey: string, seed: number): string {
  const s = (seed >>> 0).toString(36).toUpperCase().padStart(6, '0');
  return `LUMA-RIFT-${dateKey.replace(/-/g, '')}-${s}`;
}

export function parseRiftChallengeCode(code: string): { dateKey: string; seed: number } | null {
  const clean = code.trim().toUpperCase();
  const match = /^LUMA-RIFT-([A-Z0-9]+)-([A-Z0-9]{1,8})$/.exec(clean);
  if (!match) return null;
  const seed = parseInt(match[2], 36);
  if (!Number.isFinite(seed) || Number.isNaN(seed)) return null;
  return { dateKey: match[1], seed: seed >>> 0 };
}

const CHALLENGE_TYPES: DailyChallengeType[] = [
  'standard',
  'limited_action',
  'time_attack',
  'no_echo',
  'hero_ability',
  'minimal_movement',
  'no_hint',
];

const CHALLENGE_META: Record<
  DailyChallengeType,
  { title: string; label: string }
> = {
  standard: {
    title: 'Standard Sanctum Rift',
    label: 'Complete the seeded sanctum puzzle cleanly.',
  },
  limited_action: {
    title: 'Precision Actions Rift',
    label: 'Solve within strict mechanism interaction budget.',
  },
  time_attack: {
    title: 'Chronometer Time Attack',
    label: 'Restore crystal & reach portal before 45s.',
  },
  no_echo: {
    title: 'Solo Vessel Trial (No Echo)',
    label: 'Echo Engine disabled — solve using pure spatial routing.',
  },
  hero_ability: {
    title: 'Resonance Surge Trial',
    label: 'Use Hero Resonance [Q] and bridge runes to awaken the sanctum.',
  },
  minimal_movement: {
    title: 'Minimal Footsteps Rift',
    label: 'Chart the shortest bridge path to clear in minimal steps.',
  },
  no_hint: {
    title: 'Unassisted Seeker Trial',
    label: 'Guided hints hidden — rely solely on architectural sightlines.',
  },
};

const WORLD_THEMES: WorldId[] = [
  'world_1',
  'world_2',
  'world_3',
  'world_4',
  'world_5',
  'world_6',
];

const THEME_TERRAINS: Record<WorldId, [TerrainType, TerrainType]> = {
  world_1: ['grass', 'stone'],
  world_2: ['moss', 'wood'],
  world_3: ['sand', 'stone'],
  world_4: ['basalt', 'ruin'],
  world_5: ['cloud', 'stone'],
  world_6: ['ruin', 'stone'],
};

function buildGuaranteedSolvableRiftLevel(
  seed: number,
  worldTheme: WorldId,
  challengeType: DailyChallengeType,
  dateKey: string
): LevelDef {
  const rng = mulberry32(seed);
  const [primaryT, accentT] = THEME_TERRAINS[worldTheme];
  const tiles: TileDef[] = [];
  const addTile = (x: number, z: number, elevation = 0, terrain: TerrainType = primaryT, isStair = false) => {
    const idx = tiles.findIndex((t) => t.x === x && t.z === z);
    if (idx >= 0) {
      tiles[idx] = { ...tiles[idx], elevation, terrain, isStair };
    } else {
      tiles.push({ x, z, elevation, terrain, isStair });
    }
  };

  // West Courtyard (x: -4..-1, z: -2..2)
  for (let x = -4; x <= -1; x++) {
    for (let z = -2; z <= 2; z++) {
      addTile(x, z, 0, (x + z) % 2 === 0 ? primaryT : accentT);
    }
  }

  // East Courtyard (x: 1..4, z: -2..2), optional elevated northern shrine
  const elevateCrystal = rng() > 0.45;
  for (let x = 1; x <= 4; x++) {
    for (let z = -2; z <= 2; z++) {
      const high = elevateCrystal && x >= 3 && z <= 0;
      const stair = elevateCrystal && x === 2 && z === 0;
      addTile(x, z, high ? 1 : 0, high || stair ? accentT : primaryT, stair);
    }
  }

  // Central bridge or rotating platform across x = 0
  const useRotatingBridge = rng() > 0.35;
  const bridgeZ = rng() > 0.5 ? 0 : -1;
  if (!useRotatingBridge) {
    addTile(0, bridgeZ, 0, 'wood');
  } else {
    // South flank stepping stones so player can always reach crank or turn bridge
    addTile(-1, 2, 0, accentT);
    addTile(0, 2, 0, accentT);
    addTile(1, 2, 0, accentT);
  }

  // Optional gate on east bridge entry linked to a west switch
  const useGate = rng() > 0.25;
  const swZ = rng() > 0.5 ? -2 : 2;
  const gateX = 1;
  const gateZ = bridgeZ;

  // Optional beam puzzle vs direct crystal
  const useBeam = challengeType !== 'no_hint' && rng() > 0.4 && !elevateCrystal;

  const decorPool = ['tree_pine', 'stone_lantern', 'ruin_pillar', 'rock_cluster'] as const;
  const decorPick = decorPool[Math.floor(rng() * decorPool.length)];
  const decorTile = tiles.find((t) => t.x === -4 && t.z === -2);
  if (decorTile) decorTile.decor = decorPick;

  const echoEnabled = challengeType !== 'no_echo';
  const useEchoPlate = echoEnabled && useGate && rng() > 0.5;

  const level: LevelDef = {
    id: 9500 + (seed % 400),
    worldId: worldTheme,
    slug: `daily-rift-${dateKey.toLowerCase()}`,
    title: `Rift ${dateKey} · ${CHALLENGE_META[challengeType].title}`,
    subtitle: `${challengeType.replace('_', ' ').toUpperCase()} · SEED ${(seed >>> 0).toString(16).slice(0, 6).toUpperCase()}`,
    objectiveDefault: CHALLENGE_META[challengeType].label,
    objectiveCrystalDone: 'Awakenings aligned — enter the Rift Portal!',
    spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0, z: 0 },
    cameraZoom: 0.96,
    tiles,
    rotatingPlatforms: useRotatingBridge
      ? [
          {
            id: 'rift_rot_1',
            pivotX: 0,
            pivotZ: bridgeZ,
            elevation: 0,
            baseOffsets: [
              { dx: 0, dz: 0 },
              { dx: 0, dz: 1 },
            ],
            initialStep: 0,
            crankPos: { x: -1, z: bridgeZ },
            label: 'Align Rift Bridge',
          },
        ]
      : [],
    pressureSwitches: useGate && !useEchoPlate
      ? [
          {
            id: 'rift_sw_1',
            x: -2,
            z: swZ,
            elevation: 0,
            latch: true,
            label: 'Rift Seal Switch',
          },
        ]
      : [],
    echoPlates: useEchoPlate
      ? [
          {
            id: 'rift_ep_1',
            x: -2,
            z: swZ,
            elevation: 0,
            echoOnly: true,
            label: 'Temporal Echo Plate',
          },
        ]
      : [],
    gates: useGate
      ? [
          {
            id: 'rift_gate_1',
            x: gateX,
            z: gateZ,
            elevation: 0,
            axis: 'z',
            linkedSwitchId: !useEchoPlate ? 'rift_sw_1' : undefined,
            linkedEchoPlateId: useEchoPlate ? 'rift_ep_1' : undefined,
            blocksLight: true,
          },
        ]
      : [],
    elevationPlatforms: [],
    lightEmitters: useBeam
      ? [
          {
            id: 'rift_emit_1',
            x: 1,
            z: -2,
            elevation: 0,
            direction: 0 as Direction,
          },
        ]
      : [],
    lightPrisms: useBeam
      ? [
          {
            id: 'rift_prism_1',
            x: 3,
            z: -2,
            elevation: 0,
            initialDirection: 0 as Direction,
            label: 'Focus Sun Prism',
          },
        ]
      : [],
    subCrystals: [],
    heroNodes: [],
    synergyNodes: [],
    echoEnabled,
    maxEchoes: echoEnabled ? 2 : 0,
    maxEchoSeconds: 10,
    customMeta: {
      formatVersion: 1,
      engineVersion: LUMA_ENGINE_VERSION,
      source: 'daily_rift',
      difficulty: 'balanced',
    },
    crystal: {
      id: 'rift_crystal',
      x: 3,
      z: elevateCrystal ? -1 : 1,
      elevation: elevateCrystal ? 1 : 0,
      requiresLightBeam: useBeam,
      label: 'Restore Rift Crystal',
    },
    portal: {
      id: 'rift_portal',
      x: 4,
      z: 2,
      elevation: 0,
      facing: 2,
    },
  };

  return level;
}

export function generateDailyRiftSpec(
  cadence: RiftCadence = 'daily',
  date = new Date(),
  overrideSeed?: number
): DailyRiftSpec {
  const dateKey = getDateKeyForCadence(cadence, date);
  const baseSeed =
    overrideSeed !== undefined
      ? overrideSeed >>> 0
      : hashSeedString(`${DAILY_RIFT_GENERATOR_VERSION}:${cadence}:${dateKey}`);

  const rng = mulberry32(baseSeed);
  const worldTheme = WORLD_THEMES[Math.floor(rng() * WORLD_THEMES.length)];
  const challengeType = CHALLENGE_TYPES[Math.floor(rng() * CHALLENGE_TYPES.length)];

  let chosenLevel: LevelDef | null = null;
  let shortestActions: number | null = null;
  let verifiedBySolver = false;

  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = buildGuaranteedSolvableRiftLevel(
      (baseSeed + attempt * 7919) >>> 0,
      worldTheme,
      challengeType,
      dateKey
    );
    const val = validateCustomLevel(candidate);
    if (val.solvable) {
      chosenLevel = candidate;
      shortestActions = val.shortestActions;
      verifiedBySolver = true;
      break;
    }
  }

  // Verified deterministic fallback template if all 6 randomized layouts fail
  if (!chosenLevel) {
    chosenLevel = buildGuaranteedSolvableRiftLevel(0x52494654, 'world_1', 'standard', dateKey);
    const val = validateCustomLevel(chosenLevel);
    verifiedBySolver = Boolean(val.solvable);
    shortestActions = val.shortestActions;
  }

  const stageHash = computeStageHash(chosenLevel);
  chosenLevel.customMeta = {
    ...chosenLevel.customMeta,
    formatVersion: 1,
    engineVersion: LUMA_ENGINE_VERSION,
    stageHash,
    source: 'daily_rift',
  };

  const actionLimit =
    challengeType === 'limited_action' && shortestActions !== null
      ? Math.max(2, shortestActions + 2)
      : undefined;
  const timeLimitSeconds = challengeType === 'time_attack' ? 45 : undefined;

  return {
    dateKey,
    cadence,
    seed: baseSeed,
    challengeCode: encodeRiftChallengeCode(dateKey, baseSeed),
    generatorVersion: DAILY_RIFT_GENERATOR_VERSION,
    challengeType,
    challengeTitle: CHALLENGE_META[challengeType].title,
    constraintLabel: CHALLENGE_META[challengeType].label,
    timeLimitSeconds,
    actionLimit,
    worldTheme,
    level: chosenLevel,
    stageHash,
    verifiedBySolver,
    shortestActions,
  };
}

export function computeDailyRiftStreak(records: Record<string, DailyRiftRecord> | undefined): number {
  if (!records) return 0;
  const completedDays = Object.values(records)
    .filter((r) => r.completed && /^\d{4}-\d{2}-\d{2}$/.test(r.dateKey))
    .map((r) => r.dateKey)
    .sort()
    .reverse();
  if (completedDays.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < completedDays.length; i++) {
    const prev = Date.parse(`${completedDays[i - 1]}T00:00:00Z`);
    const cur = Date.parse(`${completedDays[i]}T00:00:00Z`);
    if (Math.round((prev - cur) / 86400000) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
