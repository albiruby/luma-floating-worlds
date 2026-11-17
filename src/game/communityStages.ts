import { computeStageHash, LUMA_ENGINE_VERSION } from './echoEngine';
import {
  LevelDef,
  LumaCustomStageFile,
  LumaReplayFile,
  TileDef,
} from './types';

function makeRectTiles(
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  elevation = 0,
  terrain: TileDef['terrain'] = 'grass'
): TileDef[] {
  const out: TileDef[] = [];
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      out.push({ x, z, elevation, terrain });
    }
  }
  return out;
}

function upsertTiles(tiles: TileDef[]): TileDef[] {
  const map = new Map<string, TileDef>();
  for (const t of tiles) {
    map.set(`${t.x}_${t.z}`, t);
  }
  return Array.from(map.values());
}

function finalizeCommunityStage(params: {
  id: string;
  title: string;
  description: string;
  authorAlias: string;
  difficulty: 'gentle' | 'balanced' | 'master';
  worldTheme: LumaCustomStageFile['worldTheme'];
  tags: string[];
  level: LevelDef;
}): LumaCustomStageFile {
  const stageHash = computeStageHash(params.level);
  const lvl: LevelDef = {
    ...params.level,
    customMeta: {
      formatVersion: 1,
      engineVersion: LUMA_ENGINE_VERSION,
      customId: params.id,
      authorAlias: params.authorAlias,
      difficulty: params.difficulty,
      stageHash,
      source: 'community',
    },
  };
  return {
    format: 'luma',
    formatVersion: 1,
    engineVersion: LUMA_ENGINE_VERSION,
    id: params.id,
    title: params.title,
    description: params.description,
    difficulty: params.difficulty,
    authorAlias: params.authorAlias,
    worldTheme: params.worldTheme,
    createdAt: 1731800000000,
    updatedAt: 1731800000000,
    stageHash,
    level: lvl,
    verifiedSolvable: true,
    bestClearSeconds: 18.5,
    bestActions: 3,
    tags: params.tags,
  };
}

const STAGE_1_LEVEL: LevelDef = {
  id: 9201,
  worldId: 'world_6',
  slug: 'foundry-echo-clockwork',
  title: 'The Echo Clockwork',
  subtitle: 'Featured Creation · Echo Engine',
  objectiveDefault: 'Record an Echo on the Temporal Plate [F], rewind, and restore the Crystal.',
  objectiveCrystalDone: 'Pass the unsealed gate into the Awakening Portal.',
  spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
  cameraCenter: { x: 0, z: 0 },
  cameraZoom: 0.96,
  tiles: upsertTiles([
    ...makeRectTiles(-4, -1, -2, 2, 0, 'ruin'),
    { x: 0, z: 0, elevation: 0, terrain: 'stone' },
    ...makeRectTiles(1, 4, -2, 2, 0, 'stone'),
    { x: -4, z: -2, elevation: 0, terrain: 'ruin', decor: 'echo_monolith' },
    { x: 4, z: -2, elevation: 0, terrain: 'stone', decor: 'stone_lantern' },
  ]),
  rotatingPlatforms: [],
  pressureSwitches: [],
  echoPlates: [
    {
      id: 'ep_clock_1',
      x: -2,
      z: -2,
      elevation: 0,
      echoOnly: true,
      label: 'Chrono Gate Plate (Echo Only)',
    },
  ],
  gates: [
    {
      id: 'g_clock_1',
      x: 1,
      z: 0,
      elevation: 0,
      axis: 'z',
      linkedEchoPlateId: 'ep_clock_1',
      blocksLight: false,
    },
  ],
  elevationPlatforms: [],
  lightEmitters: [],
  lightPrisms: [],
  echoEnabled: true,
  maxEchoes: 2,
  maxEchoSeconds: 12,
  crystal: {
    id: 'c_clock_1',
    x: 2,
    z: 0,
    elevation: 0,
    requiresLightBeam: false,
    label: 'Restore Chrono Crystal',
  },
  portal: {
    id: 'p_clock_1',
    x: 4,
    z: 0,
    elevation: 0,
    facing: 2,
  },
};

const STAGE_2_LEVEL: LevelDef = {
  id: 9202,
  worldId: 'world_2',
  slug: 'foundry-root-waterway',
  title: 'Verdant Canal Relay',
  subtitle: 'Featured Creation · Hero Synergy',
  objectiveDefault: 'Unite Sylvi & Neris at the Synergy Conduit or use [Tab] & [H] Hero Relay.',
  objectiveCrystalDone: 'Cross the living bridge to enter the Portal.',
  spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
  cameraCenter: { x: 0, z: 0 },
  cameraZoom: 0.96,
  tiles: upsertTiles([
    ...makeRectTiles(-4, -1, -2, 2, 0, 'moss'),
    { x: 0, z: -1, elevation: 0, terrain: 'water' },
    { x: 0, z: 0, elevation: 0, terrain: 'water' },
    { x: 0, z: 1, elevation: 0, terrain: 'water' },
    ...makeRectTiles(1, 4, -2, 2, 0, 'grass'),
    { x: -4, z: 2, elevation: 0, terrain: 'moss', decor: 'verdant_arch' },
    { x: 4, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_broad' },
  ]),
  rotatingPlatforms: [],
  pressureSwitches: [
    {
      id: 'sw_canal_1',
      x: -2,
      z: 2,
      elevation: 0,
      latch: true,
      label: 'Tidal Sluice Switch',
    },
  ],
  gates: [
    {
      id: 'g_canal_1',
      x: 2,
      z: 0,
      elevation: 0,
      axis: 'z',
      linkedSwitchId: 'sw_canal_1',
    },
  ],
  elevationPlatforms: [],
  lightEmitters: [],
  lightPrisms: [],
  synergyNodes: [
    {
      id: 'syn_canal_1',
      kind: 'root_waterway',
      heroA: 'sylvi',
      heroB: 'neris',
      x: -1,
      z: 0,
      elevation: 0,
      label: 'Weave Root-Waterway Bridge',
      bridgeTiles: [
        { x: 0, z: 0, elevation: 0, terrain: 'wood' },
        { x: 0, z: 1, elevation: 0, terrain: 'wood' },
      ],
    },
  ],
  partyEnabled: true,
  requiredCompanion: 'neris',
  echoEnabled: true,
  maxEchoes: 1,
  maxEchoSeconds: 10,
  crystal: {
    id: 'c_canal_1',
    x: 3,
    z: -1,
    elevation: 0,
    requiresLightBeam: false,
    label: 'Restore Canal Crystal',
  },
  portal: {
    id: 'p_canal_1',
    x: 4,
    z: 1,
    elevation: 0,
    facing: 2,
  },
};

const STAGE_3_LEVEL: LevelDef = {
  id: 9203,
  worldId: 'world_3',
  slug: 'foundry-prism-courtyard',
  title: 'Sun-Glass Observatory',
  subtitle: 'Featured Creation · Light & Echoes',
  objectiveDefault: 'Align the sun prisms and open the beam shutter to ignite the Crystal.',
  objectiveCrystalDone: 'Portal awakened — step through the arch.',
  spawn: { x: -3, z: 1, facingAngle: Math.PI / 2 },
  cameraCenter: { x: 0, z: 0 },
  cameraZoom: 0.96,
  tiles: upsertTiles([
    ...makeRectTiles(-4, 4, -2, 2, 0, 'sand'),
    { x: -4, z: -2, elevation: 0, terrain: 'sand', decor: 'coral_spire' },
    { x: 4, z: -2, elevation: 0, terrain: 'sand', decor: 'tidal_fountain' },
  ]),
  rotatingPlatforms: [],
  pressureSwitches: [
    {
      id: 'sw_obs_1',
      x: -2,
      z: 2,
      elevation: 0,
      latch: true,
      label: 'Shutter Release',
    },
  ],
  gates: [
    {
      id: 'g_obs_1',
      x: 1,
      z: -1,
      elevation: 0,
      axis: 'z',
      linkedSwitchId: 'sw_obs_1',
      blocksLight: true,
    },
  ],
  elevationPlatforms: [],
  lightEmitters: [
    {
      id: 'em_obs_1',
      x: -3,
      z: -1,
      elevation: 0,
      direction: 0,
    },
  ],
  lightPrisms: [
    {
      id: 'pr_obs_1',
      x: 2,
      z: -1,
      elevation: 0,
      initialDirection: 0,
      label: 'Pivot Sun Prism',
    },
  ],
  echoEnabled: true,
  maxEchoes: 2,
  maxEchoSeconds: 12,
  crystal: {
    id: 'c_obs_1',
    x: 2,
    z: 2,
    elevation: 0,
    requiresLightBeam: true,
    label: 'Solar Crystal',
  },
  portal: {
    id: 'p_obs_1',
    x: 4,
    z: 1,
    elevation: 0,
    facing: 2,
  },
};

const STAGE_4_LEVEL: LevelDef = {
  id: 9204,
  worldId: 'world_4',
  slug: 'foundry-steam-lifts',
  title: 'Caldera Twin Lifts',
  subtitle: 'Featured Creation · Dual Elevation',
  objectiveDefault: 'Operate the rotating bridge & caldera lift to ascend the basalt terrace.',
  objectiveCrystalDone: 'Ascend to the awakened Portal.',
  spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
  cameraCenter: { x: 0, z: 0 },
  cameraZoom: 0.94,
  tiles: upsertTiles([
    ...makeRectTiles(-4, -1, -2, 2, 0, 'basalt'),
    ...makeRectTiles(1, 2, -2, 2, 0, 'stone'),
    ...makeRectTiles(3, 4, -2, 2, 1, 'ruin'),
    { x: 2, z: 0, elevation: 0, terrain: 'stone', isStair: true },
    { x: -4, z: -2, elevation: 0, terrain: 'basalt', decor: 'ember_brazier_prop' },
  ]),
  rotatingPlatforms: [
    {
      id: 'rot_cald_1',
      pivotX: 0,
      pivotZ: 0,
      elevation: 0,
      baseOffsets: [
        { dx: 0, dz: 0 },
        { dx: 0, dz: 1 },
      ],
      initialStep: 0,
      crankPos: { x: -1, z: 0 },
      label: 'Swing Basalt Span',
    },
  ],
  pressureSwitches: [],
  gates: [],
  elevationPlatforms: [
    {
      id: 'lift_cald_1',
      x: 3,
      z: 0,
      lowElevation: 0,
      highElevation: 1,
      initialHigh: false,
      label: 'Forge Lift',
    },
  ],
  lightEmitters: [],
  lightPrisms: [],
  echoEnabled: true,
  maxEchoes: 2,
  maxEchoSeconds: 12,
  crystal: {
    id: 'c_cald_1',
    x: 4,
    z: -1,
    elevation: 1,
    requiresLightBeam: false,
    label: 'Restore Forge Crystal',
  },
  portal: {
    id: 'p_cald_1',
    x: 4,
    z: 2,
    elevation: 1,
    facing: 2,
  },
};

const STAGE_5_LEVEL: LevelDef = {
  id: 9205,
  worldId: 'world_5',
  slug: 'foundry-celestial-duet',
  title: 'Astral Mirror Duet',
  subtitle: 'Featured Creation · Echo & Duel Ready',
  objectiveDefault: 'Race your Echo or a Rival Ghost through the Starlight Gate!',
  objectiveCrystalDone: 'Ascend to the Celestial Portal.',
  spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
  cameraCenter: { x: 0, z: 0 },
  cameraZoom: 0.96,
  tiles: upsertTiles([
    ...makeRectTiles(-4, 4, -2, 2, 0, 'cloud'),
    { x: -4, z: -2, elevation: 0, terrain: 'cloud', decor: 'celestial_orrery' },
    { x: 4, z: 2, elevation: 0, terrain: 'cloud', decor: 'sky_obelisk' },
  ]),
  rotatingPlatforms: [],
  pressureSwitches: [
    {
      id: 'sw_ast_1',
      x: -1,
      z: -2,
      elevation: 0,
      latch: true,
      label: 'North Star Plate',
    },
  ],
  gates: [
    {
      id: 'g_ast_1',
      x: 1,
      z: 0,
      elevation: 0,
      axis: 'z',
      linkedSwitchId: 'sw_ast_1',
    },
  ],
  elevationPlatforms: [],
  lightEmitters: [],
  lightPrisms: [],
  echoEnabled: true,
  maxEchoes: 3,
  maxEchoSeconds: 14,
  crystal: {
    id: 'c_ast_1',
    x: 2,
    z: 0,
    elevation: 0,
    requiresLightBeam: false,
    label: 'Restore Starlight Crystal',
  },
  portal: {
    id: 'p_ast_1',
    x: 4,
    z: 0,
    elevation: 0,
    facing: 2,
  },
};

export const FEATURED_COMMUNITY_STAGES: LumaCustomStageFile[] = [
  finalizeCommunityStage({
    id: 'featured_echo_clockwork',
    title: 'The Echo Clockwork',
    description: 'Step onto the Temporal Plate as an Echo, rewind, and walk past the Chrono Gate.',
    authorAlias: 'Chronomancer Lin',
    difficulty: 'balanced',
    worldTheme: 'world_6',
    tags: ['echo', 'temporal', 'duel-ready'],
    level: STAGE_1_LEVEL,
  }),
  finalizeCommunityStage({
    id: 'featured_verdant_canal',
    title: 'Verdant Canal Relay',
    description: 'Showcase Hero Synergy between Sylvi & Neris to weave a living root bridge.',
    authorAlias: 'Botanist Wren',
    difficulty: 'gentle',
    worldTheme: 'world_2',
    tags: ['synergy', 'hero-relay'],
    level: STAGE_2_LEVEL,
  }),
  finalizeCommunityStage({
    id: 'featured_sunglass_obs',
    title: 'Sun-Glass Observatory',
    description: 'Lower the shutter gate so the solar beam reaches the rotating courtyard prism.',
    authorAlias: 'Optician Sol',
    difficulty: 'balanced',
    worldTheme: 'world_3',
    tags: ['light-beam', 'prism'],
    level: STAGE_3_LEVEL,
  }),
  finalizeCommunityStage({
    id: 'featured_caldera_lifts',
    title: 'Caldera Twin Lifts',
    description: 'Combine rotating basalt spans with terraced caldera stairs to restore the forge.',
    authorAlias: 'Smith Kaelen',
    difficulty: 'balanced',
    worldTheme: 'world_4',
    tags: ['elevation', 'rotating'],
    level: STAGE_4_LEVEL,
  }),
  finalizeCommunityStage({
    id: 'featured_astral_duet',
    title: 'Astral Mirror Duet',
    description: 'Clean speedrun arena designed for asynchronous Echo Duels.',
    authorAlias: 'Astral Iris',
    difficulty: 'gentle',
    worldTheme: 'world_5',
    tags: ['echo-duel', 'speedrun'],
    level: STAGE_5_LEVEL,
  }),
];

/**
 * Generates a pre-recorded deterministic ghost replay for Featured Stage 5 ("Astral Mirror Duet")
 * so players can try Echo Duels immediately out of the box.
 */
export function buildSampleFeaturedDuelReplay(): LumaReplayFile {
  const stage = FEATURED_COMMUNITY_STAGES[4];
  const frames: LumaReplayFile['frames'] = [];
  let t = 0;
  // Spawn is (-3, 0). In isometric coords: moveX=1,moveZ=0 => (+X, -Z) diagonal!
  // 28 ticks at ~4.6 u/s (~0.153 u/tick * 0.707 = 0.108 u/tick per axis -> 4.0 units = 37 ticks)
  for (let i = 0; i < 38; i++) frames.push({ tick: t++, moveX: 1, moveZ: 0 }); // (-3,0) -> (-1,-2) switch!
  // Move (-1,-2) -> (1, 0) via moveX=0, moveZ=-1 => (+X, +Z) diagonal!
  for (let i = 0; i < 38; i++) frames.push({ tick: t++, moveX: 0, moveZ: -1 });
  // Move (1, 0) -> (2, 0) crystal via moveX=1, moveZ=-1 => (+X, 0)
  for (let i = 0; i < 16; i++) frames.push({ tick: t++, moveX: 1, moveZ: -1 });
  frames.push({ tick: t++, moveX: 0, moveZ: 0, interact: true }); // restore crystal
  // Move (2, 0) -> (4, 0) portal via moveX=1, moveZ=-1 => (+X, 0)
  for (let i = 0; i < 36; i++) frames.push({ tick: t++, moveX: 1, moveZ: -1 });

  return {
    format: 'luma-replay',
    formatVersion: 1,
    engineVersion: LUMA_ENGINE_VERSION,
    stageHash: stage.stageHash,
    stageTitle: stage.title,
    characterId: 'zeph',
    companionId: null,
    clearSeconds: Number((frames.length / 30).toFixed(2)),
    actionsUsed: 2,
    stars: 3,
    tickRate: 30,
    frames,
    keyEvents: [],
    createdAt: 1731800000000,
    challengerAlias: 'Astral Iris',
    verified: true,
  };
}
