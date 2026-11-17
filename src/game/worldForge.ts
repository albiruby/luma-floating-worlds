import { computeStageHash, LUMA_ENGINE_VERSION } from './echoEngine';
import { FORGE_MAX_GRID_SPAN, FORGE_MAX_TILES } from './stageValidator';
import {
  CharacterId,
  DecorType,
  Direction,
  LevelDef,
  LumaCustomStageFile,
  SynergyKind,
  TerrainType,
  TileDef,
  WorldId,
} from './types';

export type ForgeSizePreset = 'small' | 'medium' | 'large' | 'xl';

export const FORGE_PRESET_SIZES: Record<
  ForgeSizePreset,
  { label: string; width: number; depth: number; zoom: number }
> = {
  small: { label: 'Small (9x9)', width: 9, depth: 9, zoom: 1.15 },
  medium: { label: 'Medium (13x13)', width: 13, depth: 13, zoom: 0.96 },
  large: { label: 'Large (17x17)', width: 17, depth: 17, zoom: 0.8 },
  xl: { label: 'XL (21x21)', width: 21, depth: 21, zoom: 0.68 },
};

export type ForgeTool =
  | 'select'
  | 'terrain_brush'
  | 'island_stamp'
  | 'elevation_up'
  | 'elevation_down'
  | 'stair_toggle'
  | 'decor'
  | 'spawn'
  | 'crystal'
  | 'portal'
  | 'switch'
  | 'echo_plate'
  | 'gate'
  | 'lift'
  | 'rotating'
  | 'emitter'
  | 'prism'
  | 'sub_crystal'
  | 'synergy_node'
  | 'erase';

export type ForgeSelectedObject =
  | { kind: 'tile'; x: number; z: number }
  | { kind: 'switch'; id: string }
  | { kind: 'echo_plate'; id: string }
  | { kind: 'gate'; id: string }
  | { kind: 'lift'; id: string }
  | { kind: 'rotating'; id: string }
  | { kind: 'emitter'; id: string }
  | { kind: 'prism'; id: string }
  | { kind: 'sub_crystal'; id: string }
  | { kind: 'synergy_node'; id: string }
  | { kind: 'crystal' }
  | { kind: 'portal' }
  | { kind: 'spawn' };

export interface WorldForgeState {
  id: string;
  title: string;
  description: string;
  authorAlias: string;
  difficulty: 'gentle' | 'balanced' | 'master';
  worldTheme: WorldId;
  preset: ForgeSizePreset;
  level: LevelDef;
  activeTool: ForgeTool;
  activeTerrain: TerrainType;
  activeDecor: DecorType;
  activeSynergyKind: SynergyKind;
  selectedObject: ForgeSelectedObject | null;
  clipboardTile: TileDef | null;
  undoStack: LevelDef[];
  redoStack: LevelDef[];
  verifiedByPlaytest: boolean;
}

const MAX_UNDO_HISTORY = 40;

export function cloneLevelDef(level: LevelDef): LevelDef {
  return JSON.parse(JSON.stringify(level)) as LevelDef;
}

export function recomputeLevelCamera(level: LevelDef): LevelDef {
  if (level.tiles.length === 0) return level;
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
  const span = Math.max(maxX - minX + 1, maxZ - minZ + 1, 7);
  const cameraZoom = Number(Math.max(0.58, Math.min(1.25, 11.5 / span)).toFixed(2));
  return {
    ...level,
    cameraCenter: {
      x: Number(((minX + maxX) / 2).toFixed(2)),
      z: Number(((minZ + maxZ) / 2).toFixed(2)),
    },
    cameraZoom,
  };
}

export function createStarterForgeLevel(preset: ForgeSizePreset = 'medium', worldTheme: WorldId = 'world_1'): LevelDef {
  const dims = FORGE_PRESET_SIZES[preset];
  const halfX = Math.floor(dims.width / 2);
  const halfZ = Math.floor(dims.depth / 2);
  const tiles: TileDef[] = [];

  for (let x = -Math.min(2, halfX - 1); x <= Math.min(2, halfX - 1); x++) {
    for (let z = -Math.min(2, halfZ - 1); z <= Math.min(2, halfZ - 1); z++) {
      tiles.push({
        x,
        z,
        elevation: 0,
        terrain: x === 0 && z === 0 ? 'stone' : 'grass',
      });
    }
  }

  return recomputeLevelCamera({
    id: 9001,
    worldId: worldTheme,
    slug: 'custom-sanctum',
    title: 'Skyward Echo Courtyard',
    subtitle: 'Custom Island · World Forge',
    objectiveDefault: 'Restore the Luma Crystal and awaken the portal.',
    objectiveCrystalDone: 'Enter the awakened portal to complete this custom sanctum.',
    spawn: { x: -2, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0, z: 0 },
    cameraZoom: dims.zoom,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    subCrystals: [],
    heroNodes: [],
    echoPlates: [],
    synergyNodes: [],
    echoEnabled: true,
    maxEchoes: 3,
    maxEchoSeconds: 12,
    partyEnabled: false,
    requiredCompanion: undefined,
    crystal: {
      id: 'c_custom',
      x: 0,
      z: -1,
      elevation: 0,
      requiresLightBeam: false,
      label: 'Restore Custom Luma Crystal',
    },
    portal: {
      id: 'p_custom',
      x: 2,
      z: 0,
      elevation: 0,
      facing: 2,
    },
  });
}

export function createInitialForgeState(
  existingStage?: LumaCustomStageFile,
  preset: ForgeSizePreset = 'medium'
): WorldForgeState {
  if (existingStage) {
    return {
      id: existingStage.id,
      title: existingStage.title,
      description: existingStage.description,
      authorAlias: existingStage.authorAlias,
      difficulty: existingStage.difficulty,
      worldTheme: existingStage.worldTheme,
      preset,
      level: cloneLevelDef(existingStage.level),
      activeTool: 'terrain_brush',
      activeTerrain: 'grass',
      activeDecor: 'tree_pine',
      activeSynergyKind: 'root_waterway',
      selectedObject: null,
      clipboardTile: null,
      undoStack: [],
      redoStack: [],
      verifiedByPlaytest: existingStage.verifiedSolvable,
    };
  }

  return {
    id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    title: 'Skyward Echo Courtyard',
    description: 'A handcrafted puzzle island built in LUMA World Forge.',
    authorAlias: 'Wayfinder',
    difficulty: 'balanced',
    worldTheme: 'world_1',
    preset,
    level: createStarterForgeLevel(preset, 'world_1'),
    activeTool: 'terrain_brush',
    activeTerrain: 'grass',
    activeDecor: 'tree_pine',
    activeSynergyKind: 'root_waterway',
    selectedObject: null,
    clipboardTile: null,
    undoStack: [],
    redoStack: [],
    verifiedByPlaytest: false,
  };
}

function pushUndo(state: WorldForgeState, nextLevel: LevelDef): WorldForgeState {
  const withCam = recomputeLevelCamera(nextLevel);
  return {
    ...state,
    level: withCam,
    undoStack: [...state.undoStack.slice(-(MAX_UNDO_HISTORY - 1)), cloneLevelDef(state.level)],
    redoStack: [],
    verifiedByPlaytest: false,
  };
}

export function undoForge(state: WorldForgeState): WorldForgeState {
  if (state.undoStack.length === 0) return state;
  const previous = state.undoStack[state.undoStack.length - 1];
  return {
    ...state,
    level: cloneLevelDef(previous),
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [cloneLevelDef(state.level), ...state.redoStack.slice(0, MAX_UNDO_HISTORY - 1)],
    verifiedByPlaytest: false,
  };
}

export function redoForge(state: WorldForgeState): WorldForgeState {
  if (state.redoStack.length === 0) return state;
  const next = state.redoStack[0];
  return {
    ...state,
    level: cloneLevelDef(next),
    undoStack: [...state.undoStack.slice(-(MAX_UNDO_HISTORY - 1)), cloneLevelDef(state.level)],
    redoStack: state.redoStack.slice(1),
    verifiedByPlaytest: false,
  };
}

function nextUniqueId(prefix: string, existingIds: string[]): string {
  let n = 1;
  while (existingIds.includes(`${prefix}_${n}`)) n++;
  return `${prefix}_${n}`;
}

function withinSpanLimit(tiles: TileDef[], gx: number, gz: number): boolean {
  if (tiles.length === 0) return true;
  let minX = gx;
  let maxX = gx;
  let minZ = gz;
  let maxZ = gz;
  for (const t of tiles) {
    if (t.x < minX) minX = t.x;
    if (t.x > maxX) maxX = t.x;
    if (t.z < minZ) minZ = t.z;
    if (t.z > maxZ) maxZ = t.z;
  }
  return maxX - minX + 1 <= FORGE_MAX_GRID_SPAN && maxZ - minZ + 1 <= FORGE_MAX_GRID_SPAN;
}

export function applyForgeTileAction(
  state: WorldForgeState,
  gx: number,
  gz: number
): WorldForgeState {
  const level = cloneLevelDef(state.level);
  const existingTileIdx = level.tiles.findIndex((t) => t.x === gx && t.z === gz);
  const existingTile = existingTileIdx >= 0 ? level.tiles[existingTileIdx] : null;
  const baseElev = existingTile ? existingTile.elevation : 0;

  switch (state.activeTool) {
    case 'select': {
      // Select mechanism at tile if any, otherwise tile
      const sw = level.pressureSwitches.find((s) => s.x === gx && s.z === gz);
      if (sw) return { ...state, selectedObject: { kind: 'switch', id: sw.id } };
      const ep = (level.echoPlates ?? []).find((e) => e.x === gx && e.z === gz);
      if (ep) return { ...state, selectedObject: { kind: 'echo_plate', id: ep.id } };
      const gt = level.gates.find((g) => g.x === gx && g.z === gz);
      if (gt) return { ...state, selectedObject: { kind: 'gate', id: gt.id } };
      const lf = level.elevationPlatforms.find((l) => l.x === gx && l.z === gz);
      if (lf) return { ...state, selectedObject: { kind: 'lift', id: lf.id } };
      const rp = level.rotatingPlatforms.find((r) => r.pivotX === gx && r.pivotZ === gz);
      if (rp) return { ...state, selectedObject: { kind: 'rotating', id: rp.id } };
      const em = level.lightEmitters.find((e) => e.x === gx && e.z === gz);
      if (em) return { ...state, selectedObject: { kind: 'emitter', id: em.id } };
      const pr = level.lightPrisms.find((p) => p.x === gx && p.z === gz);
      if (pr) return { ...state, selectedObject: { kind: 'prism', id: pr.id } };
      const sc = (level.subCrystals ?? []).find((s) => s.x === gx && s.z === gz);
      if (sc) return { ...state, selectedObject: { kind: 'sub_crystal', id: sc.id } };
      const sn = (level.synergyNodes ?? []).find((s) => s.x === gx && s.z === gz);
      if (sn) return { ...state, selectedObject: { kind: 'synergy_node', id: sn.id } };
      if (level.crystal.x === gx && level.crystal.z === gz) {
        return { ...state, selectedObject: { kind: 'crystal' } };
      }
      if (level.portal.x === gx && level.portal.z === gz) {
        return { ...state, selectedObject: { kind: 'portal' } };
      }
      if (level.spawn.x === gx && level.spawn.z === gz) {
        return { ...state, selectedObject: { kind: 'spawn' } };
      }
      if (existingTile) {
        return { ...state, selectedObject: { kind: 'tile', x: gx, z: gz } };
      }
      return state;
    }

    case 'terrain_brush': {
      if (existingTile) {
        level.tiles[existingTileIdx] = {
          ...existingTile,
          terrain: state.activeTerrain,
        };
      } else {
        if (level.tiles.length >= FORGE_MAX_TILES || !withinSpanLimit(level.tiles, gx, gz)) {
          return state;
        }
        level.tiles.push({ x: gx, z: gz, elevation: 0, terrain: state.activeTerrain });
      }
      return pushUndo(state, level);
    }

    case 'island_stamp': {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const tx = gx + dx;
          const tz = gz + dz;
          const idx = level.tiles.findIndex((t) => t.x === tx && t.z === tz);
          if (idx >= 0) {
            level.tiles[idx] = { ...level.tiles[idx], terrain: state.activeTerrain };
          } else if (
            level.tiles.length < FORGE_MAX_TILES &&
            withinSpanLimit(level.tiles, tx, tz)
          ) {
            level.tiles.push({ x: tx, z: tz, elevation: baseElev, terrain: state.activeTerrain });
          }
        }
      }
      return pushUndo(state, level);
    }

    case 'elevation_up': {
      if (!existingTile) return state;
      level.tiles[existingTileIdx] = {
        ...existingTile,
        elevation: Math.min(3, existingTile.elevation + 1),
      };
      return pushUndo(state, level);
    }

    case 'elevation_down': {
      if (!existingTile) return state;
      level.tiles[existingTileIdx] = {
        ...existingTile,
        elevation: Math.max(0, existingTile.elevation - 1),
      };
      return pushUndo(state, level);
    }

    case 'stair_toggle': {
      if (!existingTile) return state;
      level.tiles[existingTileIdx] = {
        ...existingTile,
        isStair: !existingTile.isStair,
      };
      return pushUndo(state, level);
    }

    case 'decor': {
      if (!existingTile) return state;
      const same = existingTile.decor === state.activeDecor;
      level.tiles[existingTileIdx] = {
        ...existingTile,
        decor: same ? undefined : state.activeDecor,
        blocksMovement: same ? false : existingTile.blocksMovement,
      };
      return pushUndo(state, level);
    }

    case 'spawn': {
      if (!existingTile) return state;
      level.spawn = { ...level.spawn, x: gx, z: gz };
      return { ...pushUndo(state, level), selectedObject: { kind: 'spawn' } };
    }

    case 'crystal': {
      if (!existingTile) return state;
      level.crystal = { ...level.crystal, x: gx, z: gz, elevation: baseElev };
      return { ...pushUndo(state, level), selectedObject: { kind: 'crystal' } };
    }

    case 'portal': {
      if (!existingTile) return state;
      level.portal = { ...level.portal, x: gx, z: gz, elevation: baseElev };
      return { ...pushUndo(state, level), selectedObject: { kind: 'portal' } };
    }

    case 'switch': {
      if (!existingTile) return state;
      const existing = level.pressureSwitches.find((s) => s.x === gx && s.z === gz);
      if (existing) {
        return { ...state, selectedObject: { kind: 'switch', id: existing.id } };
      }
      const id = nextUniqueId('sw', level.pressureSwitches.map((s) => s.id));
      level.pressureSwitches.push({
        id,
        x: gx,
        z: gz,
        elevation: baseElev,
        latch: true,
        label: `Rune Switch ${id.toUpperCase()}`,
      });
      return { ...pushUndo(state, level), selectedObject: { kind: 'switch', id } };
    }

    case 'echo_plate': {
      if (!existingTile) return state;
      level.echoPlates = level.echoPlates ?? [];
      const existing = level.echoPlates.find((e) => e.x === gx && e.z === gz);
      if (existing) {
        return { ...state, selectedObject: { kind: 'echo_plate', id: existing.id } };
      }
      const id = nextUniqueId('ep', level.echoPlates.map((e) => e.id));
      level.echoPlates.push({
        id,
        x: gx,
        z: gz,
        elevation: baseElev,
        echoOnly: true,
        label: `Echo Plate ${id.toUpperCase()}`,
      });
      level.echoEnabled = true;
      return { ...pushUndo(state, level), selectedObject: { kind: 'echo_plate', id } };
    }

    case 'gate': {
      if (!existingTile) return state;
      const existing = level.gates.find((g) => g.x === gx && g.z === gz);
      if (existing) {
        return { ...state, selectedObject: { kind: 'gate', id: existing.id } };
      }
      const id = nextUniqueId('gate', level.gates.map((g) => g.id));
      const fallbackEcho = (level.echoPlates ?? [])[0]?.id;
      const fallbackSwitch = level.pressureSwitches[0]?.id;
      level.gates.push({
        id,
        x: gx,
        z: gz,
        elevation: baseElev,
        axis: 'x',
        linkedSwitchId: fallbackSwitch,
        linkedEchoPlateId: !fallbackSwitch ? fallbackEcho : undefined,
        blocksLight: true,
      });
      return { ...pushUndo(state, level), selectedObject: { kind: 'gate', id } };
    }

    case 'lift': {
      if (!existingTile) return state;
      const existing = level.elevationPlatforms.find((l) => l.x === gx && l.z === gz);
      if (existing) {
        return { ...state, selectedObject: { kind: 'lift', id: existing.id } };
      }
      const id = nextUniqueId('lift', level.elevationPlatforms.map((l) => l.id));
      level.elevationPlatforms.push({
        id,
        x: gx,
        z: gz,
        lowElevation: baseElev,
        highElevation: Math.min(3, baseElev + 1),
        initialHigh: false,
        label: `Stone Lift ${id.toUpperCase()}`,
      });
      return { ...pushUndo(state, level), selectedObject: { kind: 'lift', id } };
    }

    case 'rotating': {
      const existing = level.rotatingPlatforms.find((r) => r.pivotX === gx && r.pivotZ === gz);
      if (existing) {
        return { ...state, selectedObject: { kind: 'rotating', id: existing.id } };
      }
      const id = nextUniqueId('rot', level.rotatingPlatforms.map((r) => r.id));
      level.rotatingPlatforms.push({
        id,
        pivotX: gx,
        pivotZ: gz,
        elevation: baseElev,
        baseOffsets: [
          { dx: 0, dz: 0 },
          { dx: 1, dz: 0 },
        ],
        initialStep: 0,
        label: `Turn Rotating Bridge`,
      });
      return { ...pushUndo(state, level), selectedObject: { kind: 'rotating', id } };
    }

    case 'emitter': {
      if (!existingTile) return state;
      const existing = level.lightEmitters.find((e) => e.x === gx && e.z === gz);
      if (existing) {
        existing.direction = ((existing.direction + 1) % 4) as Direction;
        return { ...pushUndo(state, level), selectedObject: { kind: 'emitter', id: existing.id } };
      }
      const id = nextUniqueId('emit', level.lightEmitters.map((e) => e.id));
      level.lightEmitters.push({
        id,
        x: gx,
        z: gz,
        elevation: baseElev,
        direction: 0,
      });
      return { ...pushUndo(state, level), selectedObject: { kind: 'emitter', id } };
    }

    case 'prism': {
      if (!existingTile) return state;
      const existing = level.lightPrisms.find((p) => p.x === gx && p.z === gz);
      if (existing) {
        existing.initialDirection = ((existing.initialDirection + 1) % 4) as Direction;
        return { ...pushUndo(state, level), selectedObject: { kind: 'prism', id: existing.id } };
      }
      const id = nextUniqueId('prism', level.lightPrisms.map((p) => p.id));
      level.lightPrisms.push({
        id,
        x: gx,
        z: gz,
        elevation: baseElev,
        initialDirection: 1,
        label: 'Rotate Light Prism',
      });
      return { ...pushUndo(state, level), selectedObject: { kind: 'prism', id } };
    }

    case 'sub_crystal': {
      if (!existingTile) return state;
      level.subCrystals = level.subCrystals ?? [];
      const existing = level.subCrystals.find((s) => s.x === gx && s.z === gz);
      if (existing) {
        return { ...state, selectedObject: { kind: 'sub_crystal', id: existing.id } };
      }
      const id = nextUniqueId('sub', level.subCrystals.map((s) => s.id));
      level.subCrystals.push({
        id,
        x: gx,
        z: gz,
        elevation: baseElev,
        label: `Sun Relay ${id.toUpperCase()}`,
      });
      return { ...pushUndo(state, level), selectedObject: { kind: 'sub_crystal', id } };
    }

    case 'synergy_node': {
      if (!existingTile) return state;
      level.synergyNodes = level.synergyNodes ?? [];
      const existing = level.synergyNodes.find((s) => s.x === gx && s.z === gz);
      if (existing) {
        return { ...state, selectedObject: { kind: 'synergy_node', id: existing.id } };
      }
      const id = nextUniqueId('syn', level.synergyNodes.map((s) => s.id));
      const pairHeroes: Record<SynergyKind, { heroA: CharacterId; heroB: CharacterId; label: string }> = {
        root_waterway: { heroA: 'sylvi', heroB: 'neris', label: 'Root-Waterway Bridge' },
        steam_forge_lift: { heroA: 'kael', heroB: 'neris', label: 'Steam-Forge Conduit' },
        wind_rune_relay: { heroA: 'zeph', heroB: 'wayfinder', label: 'Wind-Rune Relay' },
      };
      const meta = pairHeroes[state.activeSynergyKind];
      level.synergyNodes.push({
        id,
        kind: state.activeSynergyKind,
        heroA: meta.heroA,
        heroB: meta.heroB,
        x: gx,
        z: gz,
        elevation: baseElev,
        label: meta.label,
      });
      level.partyEnabled = true;
      level.requiredCompanion = meta.heroB;
      return { ...pushUndo(state, level), selectedObject: { kind: 'synergy_node', id } };
    }

    case 'erase': {
      let modified = false;
      const beforeSw = level.pressureSwitches.length;
      level.pressureSwitches = level.pressureSwitches.filter((s) => !(s.x === gx && s.z === gz));
      if (level.pressureSwitches.length !== beforeSw) modified = true;

      if (level.echoPlates) {
        const b = level.echoPlates.length;
        level.echoPlates = level.echoPlates.filter((e) => !(e.x === gx && e.z === gz));
        if (level.echoPlates.length !== b) modified = true;
      }

      const bGate = level.gates.length;
      level.gates = level.gates.filter((g) => !(g.x === gx && g.z === gz));
      if (level.gates.length !== bGate) modified = true;

      const bLift = level.elevationPlatforms.length;
      level.elevationPlatforms = level.elevationPlatforms.filter((l) => !(l.x === gx && l.z === gz));
      if (level.elevationPlatforms.length !== bLift) modified = true;

      const bRot = level.rotatingPlatforms.length;
      level.rotatingPlatforms = level.rotatingPlatforms.filter((r) => !(r.pivotX === gx && r.pivotZ === gz));
      if (level.rotatingPlatforms.length !== bRot) modified = true;

      const bEmit = level.lightEmitters.length;
      level.lightEmitters = level.lightEmitters.filter((e) => !(e.x === gx && e.z === gz));
      if (level.lightEmitters.length !== bEmit) modified = true;

      const bPrism = level.lightPrisms.length;
      level.lightPrisms = level.lightPrisms.filter((p) => !(p.x === gx && p.z === gz));
      if (level.lightPrisms.length !== bPrism) modified = true;

      if (level.subCrystals) {
        const bSub = level.subCrystals.length;
        level.subCrystals = level.subCrystals.filter((s) => !(s.x === gx && s.z === gz));
        if (level.subCrystals.length !== bSub) modified = true;
      }

      if (level.synergyNodes) {
        const bSyn = level.synergyNodes.length;
        level.synergyNodes = level.synergyNodes.filter((s) => !(s.x === gx && s.z === gz));
        if (level.synergyNodes.length !== bSyn) modified = true;
      }

      if (!modified && existingTile && level.tiles.length > 3) {
        const isCritical =
          (level.spawn.x === gx && level.spawn.z === gz) ||
          (level.crystal.x === gx && level.crystal.z === gz) ||
          (level.portal.x === gx && level.portal.z === gz);
        if (!isCritical) {
          level.tiles.splice(existingTileIdx, 1);
          modified = true;
        }
      }

      return modified ? { ...pushUndo(state, level), selectedObject: null } : state;
    }
  }
}

export function copySelectedTile(state: WorldForgeState): WorldForgeState {
  if (!state.selectedObject || state.selectedObject.kind !== 'tile') return state;
  const { x, z } = state.selectedObject;
  const tile = state.level.tiles.find((t) => t.x === x && t.z === z);
  if (!tile) return state;
  return { ...state, clipboardTile: { ...tile } };
}

export function pasteClipboardTileAt(
  state: WorldForgeState,
  gx: number,
  gz: number
): WorldForgeState {
  if (!state.clipboardTile) return state;
  const level = cloneLevelDef(state.level);
  const idx = level.tiles.findIndex((t) => t.x === gx && t.z === gz);
  const pasted: TileDef = { ...state.clipboardTile, x: gx, z: gz };
  if (idx >= 0) {
    level.tiles[idx] = pasted;
  } else {
    if (level.tiles.length >= FORGE_MAX_TILES || !withinSpanLimit(level.tiles, gx, gz)) {
      return state;
    }
    level.tiles.push(pasted);
  }
  return pushUndo(state, level);
}

export function updateForgeMetadata(
  state: WorldForgeState,
  patch: Partial<
    Pick<
      WorldForgeState,
      'title' | 'description' | 'authorAlias' | 'difficulty' | 'worldTheme' | 'verifiedByPlaytest'
    >
  >
): WorldForgeState {
  const nextWorld = patch.worldTheme ?? state.worldTheme;
  const nextTitle = patch.title ?? state.title;
  const nextLevel: LevelDef = {
    ...state.level,
    worldId: nextWorld,
    title: nextTitle,
  };
  return {
    ...state,
    ...patch,
    level: nextLevel,
  };
}

export function mutateForgeLevel(
  state: WorldForgeState,
  mutator: (draft: LevelDef) => void
): WorldForgeState {
  const draft = cloneLevelDef(state.level);
  mutator(draft);
  return pushUndo(state, draft);
}

export function exportForgeToCustomStageFile(
  state: WorldForgeState,
  verifiedSolvable: boolean,
  existingStats?: { bestClearSeconds?: number; bestActions?: number; localRating?: number }
): LumaCustomStageFile {
  const cleanTitle = state.title.trim() || 'Untitled Sanctum';
  const level: LevelDef = {
    ...cloneLevelDef(state.level),
    worldId: state.worldTheme,
    title: cleanTitle,
    subtitle: `${state.difficulty.toUpperCase()} · By ${state.authorAlias.trim() || 'Wayfinder'}`,
    customMeta: {
      formatVersion: 1,
      engineVersion: LUMA_ENGINE_VERSION,
      customId: state.id,
      authorAlias: state.authorAlias.trim() || 'Wayfinder',
      difficulty: state.difficulty,
      source: 'custom',
    },
  };
  const stageHash = computeStageHash(level);
  level.customMeta!.stageHash = stageHash;

  return {
    format: 'luma',
    formatVersion: 1,
    engineVersion: LUMA_ENGINE_VERSION,
    id: state.id,
    title: cleanTitle,
    description: state.description.trim() || 'Handcrafted custom stage created in LUMA World Forge.',
    difficulty: state.difficulty,
    authorAlias: state.authorAlias.trim() || 'Wayfinder',
    worldTheme: state.worldTheme,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stageHash,
    level,
    verifiedSolvable: verifiedSolvable || state.verifiedByPlaytest,
    bestClearSeconds: existingStats?.bestClearSeconds,
    bestActions: existingStats?.bestActions,
    localRating: existingStats?.localRating,
    tags: [
      level.echoEnabled ? 'echo' : 'classic',
      level.partyEnabled ? 'synergy' : 'solo',
      state.difficulty,
    ],
  };
}
