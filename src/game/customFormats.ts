import { computeStageHash, LUMA_ENGINE_VERSION, MAX_REPLAY_TICKS } from './echoEngine';
import { FORGE_MAX_GRID_SPAN, FORGE_MAX_OBJECTS, FORGE_MAX_TILES, countLevelObjects } from './stageValidator';
import {
  CharacterId,
  DecorType,
  Direction,
  EchoInputFrame,
  LevelDef,
  LumaCustomStageFile,
  LumaReplayFile,
  LumaStagePackFile,
  SynergyKind,
  TerrainType,
  TileDef,
  WorldId,
} from './types';

export const MAX_LUMA_STAGE_BYTES = 512 * 1024;
export const MAX_LUMA_PACK_BYTES = 2 * 1024 * 1024;
export const MAX_LUMA_REPLAY_BYTES = 512 * 1024;

const ALLOWED_TERRAINS = new Set<TerrainType>([
  'grass',
  'stone',
  'ruin',
  'wood',
  'water',
  'moss',
  'sand',
  'basalt',
  'cloud',
]);

const ALLOWED_DECORS = new Set<DecorType>([
  'tree_pine',
  'tree_broad',
  'rock_cluster',
  'ruin_pillar',
  'ruin_arch',
  'stone_lantern',
  'waterfall',
  'pond_lily',
  'forge_gear',
  'celestial_orrery',
  'verdant_arch',
  'ancient_root_tree',
  'tidal_fountain',
  'coral_spire',
  'ember_brazier_prop',
  'basalt_obelisk',
  'sky_obelisk',
  'wind_chime',
  'echo_monolith',
]);

const ALLOWED_HEROES = new Set<CharacterId>(['wayfinder', 'sylvi', 'neris', 'kael', 'zeph']);
const ALLOWED_WORLDS = new Set<WorldId>([
  'world_1',
  'world_2',
  'world_3',
  'world_4',
  'world_5',
  'world_6',
]);
const ALLOWED_SYNERGIES = new Set<SynergyKind>([
  'root_waterway',
  'steam_forge_lift',
  'wind_rune_relay',
]);

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const DANGEROUS_TEXT_RE = /<[^>]*>|javascript:|data:|vbscript:|on\w+\s*=|https?:\/\//i;

export function hasPrototypePollutionKeys(obj: unknown, depth = 0): boolean {
  if (depth > 8 || !obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj)) {
    return obj.some((item) => hasPrototypePollutionKeys(item, depth + 1));
  }
  const rec = obj as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(rec)) {
    if (FORBIDDEN_KEYS.has(key)) return true;
    if (hasPrototypePollutionKeys(rec[key], depth + 1)) return true;
  }
  return false;
}

/**
 * Strips potentially unsafe HTML/URLs and enforces strict plain-text length caps.
 */
export function sanitizePlainText(raw: unknown, fallback: string, maxLen = 80): string {
  if (typeof raw !== 'string') return fallback;
  const trimmed = raw.trim().replace(/[\r\n\t]+/g, ' ').slice(0, maxLen);
  if (!trimmed) return fallback;
  if (DANGEROUS_TEXT_RE.test(trimmed)) {
    return trimmed
      .replace(/<[^>]*>/g, '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/javascript:/gi, '')
      .trim() || fallback;
  }
  return trimmed;
}

export function containsForbiddenMarkup(raw: unknown): boolean {
  return typeof raw === 'string' && DANGEROUS_TEXT_RE.test(raw);
}

function clampCoord(val: unknown): number | null {
  if (typeof val !== 'number' || !Number.isFinite(val)) return null;
  const n = Math.round(val);
  if (n < -20 || n > 24) return null;
  return n;
}

function clampDir(val: unknown): Direction {
  if (typeof val !== 'number' || !Number.isFinite(val)) return 0;
  return ((((Math.trunc(val) % 4) + 4) % 4) as Direction);
}

export type ParseValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function parseAndValidateLumaStage(rawText: string): ParseValidationResult<LumaCustomStageFile> {
  if (!rawText || rawText.length > MAX_LUMA_STAGE_BYTES) {
    return { ok: false, error: 'Stage file is empty or exceeds the 512 KB safety limit.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'Invalid JSON syntax inside .luma stage file.' };
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    hasPrototypePollutionKeys(parsed)
  ) {
    return { ok: false, error: 'Rejected stage file due to invalid structure or unsafe keys.' };
  }

  const root = parsed as Record<string, unknown>;
  if (root.format !== 'luma' || root.formatVersion !== 1) {
    return { ok: false, error: 'Unsupported format or formatVersion (expected .luma v1).' };
  }
  if (
    containsForbiddenMarkup(root.title) ||
    containsForbiddenMarkup(root.description) ||
    containsForbiddenMarkup(root.authorAlias)
  ) {
    return { ok: false, error: 'Stage metadata contains forbidden HTML, scripts, or external URLs.' };
  }

  const rawLevel = root.level;
  if (!rawLevel || typeof rawLevel !== 'object' || Array.isArray(rawLevel)) {
    return { ok: false, error: 'Stage file is missing its level definition.' };
  }

  const lvlObj = rawLevel as Record<string, unknown>;
  if (!Array.isArray(lvlObj.tiles) || lvlObj.tiles.length < 3 || lvlObj.tiles.length > FORGE_MAX_TILES) {
    return {
      ok: false,
      error: `Tiles must be between 3 and ${FORGE_MAX_TILES}.`,
    };
  }

  const tiles: TileDef[] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const rawT of lvlObj.tiles) {
    if (!rawT || typeof rawT !== 'object') return { ok: false, error: 'Malformed tile entry.' };
    const t = rawT as Record<string, unknown>;
    const x = clampCoord(t.x);
    const z = clampCoord(t.z);
    if (x === null || z === null) return { ok: false, error: 'Tile coordinates out of bounds.' };
    const elev = typeof t.elevation === 'number' && Number.isFinite(t.elevation)
      ? Math.max(0, Math.min(3, Math.round(t.elevation)))
      : 0;
    const terrain = ALLOWED_TERRAINS.has(t.terrain as TerrainType)
      ? (t.terrain as TerrainType)
      : 'grass';
    const decor =
      typeof t.decor === 'string' && ALLOWED_DECORS.has(t.decor as DecorType)
        ? (t.decor as DecorType)
        : undefined;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
    tiles.push({
      x,
      z,
      elevation: elev,
      terrain,
      isStair: Boolean(t.isStair),
      decor,
      blocksMovement: Boolean(t.blocksMovement),
      blocksLight: Boolean(t.blocksLight),
    });
  }

  if (maxX - minX + 1 > FORGE_MAX_GRID_SPAN || maxZ - minZ + 1 > FORGE_MAX_GRID_SPAN) {
    return {
      ok: false,
      error: `Stage grid exceeds ${FORGE_MAX_GRID_SPAN}x${FORGE_MAX_GRID_SPAN} maximum dimensions.`,
    };
  }

  const spawnObj = (lvlObj.spawn ?? {}) as Record<string, unknown>;
  const spawnX = clampCoord(spawnObj.x);
  const spawnZ = clampCoord(spawnObj.z);
  const cryObj = (lvlObj.crystal ?? {}) as Record<string, unknown>;
  const cryX = clampCoord(cryObj.x);
  const cryZ = clampCoord(cryObj.z);
  const portObj = (lvlObj.portal ?? {}) as Record<string, unknown>;
  const portX = clampCoord(portObj.x);
  const portZ = clampCoord(portObj.z);

  if (
    spawnX === null ||
    spawnZ === null ||
    cryX === null ||
    cryZ === null ||
    portX === null ||
    portZ === null
  ) {
    return { ok: false, error: 'Spawn, Crystal, or Portal coordinates are invalid.' };
  }

  const worldTheme = ALLOWED_WORLDS.has(root.worldTheme as WorldId)
    ? (root.worldTheme as WorldId)
    : 'world_1';

  const cleanLevel: LevelDef = {
    id: 9100,
    worldId: worldTheme,
    slug: 'imported-custom',
    title: sanitizePlainText(root.title, 'Imported Sanctum', 48),
    subtitle: 'Custom Creation',
    objectiveDefault: sanitizePlainText(lvlObj.objectiveDefault, 'Restore the Crystal and enter the Portal.', 140),
    objectiveCrystalDone: sanitizePlainText(lvlObj.objectiveCrystalDone, 'Enter the awakened Portal.', 140),
    spawn: {
      x: spawnX,
      z: spawnZ,
      facingAngle: typeof spawnObj.facingAngle === 'number' && Number.isFinite(spawnObj.facingAngle) ? spawnObj.facingAngle : 0,
    },
    cameraCenter: {
      x: Number(((minX + maxX) / 2).toFixed(2)),
      z: Number(((minZ + maxZ) / 2).toFixed(2)),
    },
    cameraZoom: Number(Math.max(0.58, Math.min(1.25, 11.5 / Math.max(maxX - minX + 1, maxZ - minZ + 1, 7))).toFixed(2)),
    tiles,
    rotatingPlatforms: Array.isArray(lvlObj.rotatingPlatforms)
      ? lvlObj.rotatingPlatforms.slice(0, 12).map((r: any, i) => ({
          id: sanitizePlainText(r?.id, `rot_${i}`, 24),
          pivotX: clampCoord(r?.pivotX) ?? 0,
          pivotZ: clampCoord(r?.pivotZ) ?? 0,
          elevation: Math.max(0, Math.min(3, Math.round(Number(r?.elevation) || 0))),
          baseOffsets: Array.isArray(r?.baseOffsets)
            ? r.baseOffsets.slice(0, 6).map((o: any) => ({
                dx: Math.max(-3, Math.min(3, Math.round(Number(o?.dx) || 0))),
                dz: Math.max(-3, Math.min(3, Math.round(Number(o?.dz) || 0))),
              }))
            : [{ dx: 0, dz: 0 }, { dx: 1, dz: 0 }],
          initialStep: clampDir(r?.initialStep),
          crankPos:
            r?.crankPos && clampCoord(r.crankPos.x) !== null && clampCoord(r.crankPos.z) !== null
              ? { x: clampCoord(r.crankPos.x)!, z: clampCoord(r.crankPos.z)! }
              : undefined,
          label: sanitizePlainText(r?.label, 'Rotate Bridge', 40),
        }))
      : [],
    pressureSwitches: Array.isArray(lvlObj.pressureSwitches)
      ? lvlObj.pressureSwitches.slice(0, 16).map((s: any, i) => ({
          id: sanitizePlainText(s?.id, `sw_${i}`, 24),
          x: clampCoord(s?.x) ?? 0,
          z: clampCoord(s?.z) ?? 0,
          elevation: Math.max(0, Math.min(3, Math.round(Number(s?.elevation) || 0))),
          latch: Boolean(s?.latch),
          label: sanitizePlainText(s?.label, 'Rune Switch', 40),
        }))
      : [],
    echoPlates: Array.isArray(lvlObj.echoPlates)
      ? lvlObj.echoPlates.slice(0, 12).map((e: any, i) => ({
          id: sanitizePlainText(e?.id, `ep_${i}`, 24),
          x: clampCoord(e?.x) ?? 0,
          z: clampCoord(e?.z) ?? 0,
          elevation: Math.max(0, Math.min(3, Math.round(Number(e?.elevation) || 0))),
          echoOnly: Boolean(e?.echoOnly),
          label: sanitizePlainText(e?.label, 'Echo Plate', 40),
        }))
      : [],
    gates: Array.isArray(lvlObj.gates)
      ? lvlObj.gates.slice(0, 16).map((g: any, i) => ({
          id: sanitizePlainText(g?.id, `gate_${i}`, 24),
          x: clampCoord(g?.x) ?? 0,
          z: clampCoord(g?.z) ?? 0,
          elevation: Math.max(0, Math.min(3, Math.round(Number(g?.elevation) || 0))),
          axis: g?.axis === 'z' ? 'z' : 'x',
          linkedSwitchId: typeof g?.linkedSwitchId === 'string' ? sanitizePlainText(g.linkedSwitchId, '', 24) || undefined : undefined,
          linkedSubCrystalId: typeof g?.linkedSubCrystalId === 'string' ? sanitizePlainText(g.linkedSubCrystalId, '', 24) || undefined : undefined,
          linkedEchoPlateId: typeof g?.linkedEchoPlateId === 'string' ? sanitizePlainText(g.linkedEchoPlateId, '', 24) || undefined : undefined,
          linkedSynergyId: typeof g?.linkedSynergyId === 'string' ? sanitizePlainText(g.linkedSynergyId, '', 24) || undefined : undefined,
          inverted: Boolean(g?.inverted),
          blocksLight: Boolean(g?.blocksLight),
        }))
      : [],
    elevationPlatforms: Array.isArray(lvlObj.elevationPlatforms)
      ? lvlObj.elevationPlatforms.slice(0, 12).map((l: any, i) => ({
          id: sanitizePlainText(l?.id, `lift_${i}`, 24),
          x: clampCoord(l?.x) ?? 0,
          z: clampCoord(l?.z) ?? 0,
          lowElevation: Math.max(0, Math.min(2, Math.round(Number(l?.lowElevation) || 0))),
          highElevation: Math.max(1, Math.min(3, Math.round(Number(l?.highElevation) || 1))),
          initialHigh: Boolean(l?.initialHigh),
          linkedSwitchId: typeof l?.linkedSwitchId === 'string' ? sanitizePlainText(l.linkedSwitchId, '', 24) || undefined : undefined,
          label: sanitizePlainText(l?.label, 'Stone Lift', 40),
        }))
      : [],
    lightEmitters: Array.isArray(lvlObj.lightEmitters)
      ? lvlObj.lightEmitters.slice(0, 8).map((e: any, i) => ({
          id: sanitizePlainText(e?.id, `emit_${i}`, 24),
          x: clampCoord(e?.x) ?? 0,
          z: clampCoord(e?.z) ?? 0,
          elevation: Math.max(0, Math.min(3, Math.round(Number(e?.elevation) || 0))),
          direction: clampDir(e?.direction),
        }))
      : [],
    lightPrisms: Array.isArray(lvlObj.lightPrisms)
      ? lvlObj.lightPrisms.slice(0, 12).map((p: any, i) => ({
          id: sanitizePlainText(p?.id, `prism_${i}`, 24),
          x: clampCoord(p?.x) ?? 0,
          z: clampCoord(p?.z) ?? 0,
          elevation: Math.max(0, Math.min(3, Math.round(Number(p?.elevation) || 0))),
          initialDirection: clampDir(p?.initialDirection),
          label: sanitizePlainText(p?.label, 'Rotate Prism', 40),
        }))
      : [],
    subCrystals: Array.isArray(lvlObj.subCrystals)
      ? lvlObj.subCrystals.slice(0, 8).map((s: any, i) => ({
          id: sanitizePlainText(s?.id, `sub_${i}`, 24),
          x: clampCoord(s?.x) ?? 0,
          z: clampCoord(s?.z) ?? 0,
          elevation: Math.max(0, Math.min(3, Math.round(Number(s?.elevation) || 0))),
          label: sanitizePlainText(s?.label, 'Sub-Crystal', 40),
        }))
      : [],
    heroNodes: [],
    synergyNodes: Array.isArray(lvlObj.synergyNodes)
      ? lvlObj.synergyNodes.slice(0, 6).map((sn: any, i) => {
          const kind = ALLOWED_SYNERGIES.has(sn?.kind as SynergyKind)
            ? (sn.kind as SynergyKind)
            : 'root_waterway';
          return {
            id: sanitizePlainText(sn?.id, `syn_${i}`, 24),
            kind,
            heroA: ALLOWED_HEROES.has(sn?.heroA) ? (sn.heroA as CharacterId) : 'sylvi',
            heroB: ALLOWED_HEROES.has(sn?.heroB) ? (sn.heroB as CharacterId) : 'neris',
            x: clampCoord(sn?.x) ?? 0,
            z: clampCoord(sn?.z) ?? 0,
            elevation: Math.max(0, Math.min(3, Math.round(Number(sn?.elevation) || 0))),
            label: sanitizePlainText(sn?.label, 'Synergy Conduit', 40),
            bridgeTiles: Array.isArray(sn?.bridgeTiles)
              ? sn.bridgeTiles.slice(0, 8).map((b: any) => ({
                  x: clampCoord(b?.x) ?? 0,
                  z: clampCoord(b?.z) ?? 0,
                  elevation: Math.max(0, Math.min(3, Math.round(Number(b?.elevation) || 0))),
                  terrain: ALLOWED_TERRAINS.has(b?.terrain) ? b.terrain : 'wood',
                }))
              : undefined,
            opensGateId: typeof sn?.opensGateId === 'string' ? sanitizePlainText(sn.opensGateId, '', 24) || undefined : undefined,
          };
        })
      : [],
    echoEnabled: lvlObj.echoEnabled !== false,
    maxEchoes: Math.max(1, Math.min(3, Math.round(Number(lvlObj.maxEchoes) || 3))),
    maxEchoSeconds: Math.max(4, Math.min(25, Math.round(Number(lvlObj.maxEchoSeconds) || 12))),
    partyEnabled: Boolean(lvlObj.partyEnabled),
    requiredCompanion: ALLOWED_HEROES.has(lvlObj.requiredCompanion as CharacterId)
      ? (lvlObj.requiredCompanion as CharacterId)
      : undefined,
    crystal: {
      id: sanitizePlainText(cryObj.id, 'c_custom', 24),
      x: cryX,
      z: cryZ,
      elevation: Math.max(0, Math.min(3, Math.round(Number(cryObj.elevation) || 0))),
      requiresLightBeam: Boolean(cryObj.requiresLightBeam),
      label: sanitizePlainText(cryObj.label, 'Restore Crystal', 40),
    },
    portal: {
      id: sanitizePlainText(portObj.id, 'p_custom', 24),
      x: portX,
      z: portZ,
      elevation: Math.max(0, Math.min(3, Math.round(Number(portObj.elevation) || 0))),
      facing: clampDir(portObj.facing),
    },
  };

  if (countLevelObjects(cleanLevel) > FORGE_MAX_OBJECTS) {
    return {
      ok: false,
      error: `Object count exceeds maximum cap of ${FORGE_MAX_OBJECTS}.`,
    };
  }

  const stageHash = computeStageHash(cleanLevel);
  const difficulty =
    root.difficulty === 'gentle' || root.difficulty === 'master' ? root.difficulty : 'balanced';

  return {
    ok: true,
    data: {
      format: 'luma',
      formatVersion: 1,
      engineVersion: sanitizePlainText(root.engineVersion, LUMA_ENGINE_VERSION, 32),
      id: sanitizePlainText(root.id, `imp_${stageHash}`, 48),
      title: sanitizePlainText(root.title, 'Imported Sanctum', 48),
      description: sanitizePlainText(root.description, 'Imported community creation.', 160),
      difficulty,
      authorAlias: sanitizePlainText(root.authorAlias, 'Wayfinder', 32),
      worldTheme,
      createdAt: typeof root.createdAt === 'number' ? root.createdAt : Date.now(),
      updatedAt: Date.now(),
      stageHash,
      level: cleanLevel,
      verifiedSolvable: Boolean(root.verifiedSolvable),
      tags: Array.isArray(root.tags)
        ? root.tags.slice(0, 6).map((t) => sanitizePlainText(t, '', 20)).filter(Boolean)
        : ['imported'],
    },
  };
}

export function parseAndValidateLumaReplay(rawText: string): ParseValidationResult<LumaReplayFile> {
  if (!rawText || rawText.length > MAX_LUMA_REPLAY_BYTES) {
    return { ok: false, error: 'Replay file is empty or exceeds the 512 KB safety limit.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'Invalid JSON syntax inside .luma-replay file.' };
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    hasPrototypePollutionKeys(parsed)
  ) {
    return { ok: false, error: 'Rejected replay file due to unsafe keys.' };
  }
  const r = parsed as Record<string, unknown>;
  if (r.format !== 'luma-replay' || r.formatVersion !== 1) {
    return { ok: false, error: 'Unsupported replay format (expected luma-replay v1).' };
  }
  if (containsForbiddenMarkup(r.stageTitle) || containsForbiddenMarkup(r.challengerAlias)) {
    return { ok: false, error: 'Replay metadata contains forbidden markup or URLs.' };
  }
  if (!Array.isArray(r.frames) || r.frames.length === 0 || r.frames.length > MAX_REPLAY_TICKS) {
    return { ok: false, error: `Replay frame count must be between 1 and ${MAX_REPLAY_TICKS}.` };
  }

  const frames: EchoInputFrame[] = [];
  for (let i = 0; i < r.frames.length; i++) {
    const f = r.frames[i] as Record<string, unknown>;
    if (!f || typeof f !== 'object') return { ok: false, error: 'Malformed replay input frame.' };
    const mx = f.moveX === -1 || f.moveX === 0 || f.moveX === 1 ? f.moveX : 0;
    const mz = f.moveZ === -1 || f.moveZ === 0 || f.moveZ === 1 ? f.moveZ : 0;
    frames.push({
      tick: i,
      moveX: mx,
      moveZ: mz,
      interact: Boolean(f.interact),
      ability: Boolean(f.ability),
      switchHero: Boolean(f.switchHero),
    });
  }

  const stars =
    r.stars === 1 || r.stars === 2 || r.stars === 3 ? r.stars : 0;

  return {
    ok: true,
    data: {
      format: 'luma-replay',
      formatVersion: 1,
      engineVersion: sanitizePlainText(r.engineVersion, LUMA_ENGINE_VERSION, 32),
      stageHash: sanitizePlainText(r.stageHash, '', 40),
      stageTitle: sanitizePlainText(r.stageTitle, 'Untitled Sanctum', 48),
      characterId: ALLOWED_HEROES.has(r.characterId as CharacterId)
        ? (r.characterId as CharacterId)
        : 'wayfinder',
      companionId: ALLOWED_HEROES.has(r.companionId as CharacterId)
        ? (r.companionId as CharacterId)
        : null,
      clearSeconds:
        typeof r.clearSeconds === 'number' && Number.isFinite(r.clearSeconds) && r.clearSeconds > 0
          ? Number(r.clearSeconds.toFixed(2))
          : Number((frames.length / 30).toFixed(2)),
      actionsUsed:
        typeof r.actionsUsed === 'number' && Number.isFinite(r.actionsUsed) && r.actionsUsed >= 0
          ? Math.round(r.actionsUsed)
          : 0,
      stars,
      tickRate: 30,
      frames,
      keyEvents: [],
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
      challengerAlias: sanitizePlainText(r.challengerAlias, 'Challenger', 32),
      verified: false, // Re-verified deterministically against loaded stage
    },
  };
}

export function parseAndValidateLumaPack(rawText: string): ParseValidationResult<LumaStagePackFile> {
  if (!rawText || rawText.length > MAX_LUMA_PACK_BYTES) {
    return { ok: false, error: 'Pack file is empty or exceeds the 2 MB safety limit.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'Invalid JSON syntax inside .luma-pack file.' };
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    hasPrototypePollutionKeys(parsed)
  ) {
    return { ok: false, error: 'Rejected pack file due to unsafe structure.' };
  }
  const p = parsed as Record<string, unknown>;
  if (p.format !== 'luma-pack' || p.formatVersion !== 1 || !Array.isArray(p.stages) || p.stages.length === 0) {
    return { ok: false, error: 'Invalid .luma-pack v1 header or empty stage list.' };
  }
  if (p.stages.length > 12) {
    return { ok: false, error: 'Challenge Packs are capped at 12 stages.' };
  }

  const validStages: LumaCustomStageFile[] = [];
  for (const rawStage of p.stages) {
    const res = parseAndValidateLumaStage(JSON.stringify(rawStage));
    if (!res.ok) {
      return { ok: false, error: `Pack stage validation failed: ${res.error}` };
    }
    validStages.push(res.data);
  }

  let challengeReplay: LumaReplayFile | undefined;
  if (p.challengeReplay) {
    const repRes = parseAndValidateLumaReplay(JSON.stringify(p.challengeReplay));
    if (!repRes.ok) {
      return { ok: false, error: `Pack challenge replay invalid: ${repRes.error}` };
    }
    challengeReplay = repRes.data;
  }

  return {
    ok: true,
    data: {
      format: 'luma-pack',
      formatVersion: 1,
      engineVersion: LUMA_ENGINE_VERSION,
      id: sanitizePlainText(p.id, `pack_${Date.now().toString(36)}`, 48),
      title: sanitizePlainText(p.title, 'Challenge Pack', 56),
      description: sanitizePlainText(p.description, 'Local LUMA challenge pack.', 160),
      authorAlias: sanitizePlainText(p.authorAlias, 'Wayfinder', 32),
      stages: validStages,
      challengeReplay,
      createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
    },
  };
}

export function buildLumaStagePack(params: {
  title: string;
  description: string;
  authorAlias: string;
  stages: LumaCustomStageFile[];
  challengeReplay?: LumaReplayFile;
}): LumaStagePackFile {
  return {
    format: 'luma-pack',
    formatVersion: 1,
    engineVersion: LUMA_ENGINE_VERSION,
    id: `pack_${Date.now().toString(36)}`,
    title: sanitizePlainText(params.title, 'Echo Duel Challenge Pack', 56),
    description: sanitizePlainText(params.description, 'Exported LUMA Challenge Pack.', 160),
    authorAlias: sanitizePlainText(params.authorAlias, 'Wayfinder', 32),
    stages: params.stages.slice(0, 12),
    challengeReplay: params.challengeReplay,
    createdAt: Date.now(),
  };
}

export function triggerTextDownload(filename: string, content: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
