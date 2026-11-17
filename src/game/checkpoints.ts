import { getCharacterById } from './characters';
import { getLevelById, LEVELS } from './levels';
import {
  createInitialPlayerState,
  createInitialPuzzleState,
  getSurfaceAtTile,
  refreshDerivedPuzzleState,
  worldToTile,
} from './rules';
import {
  CharacterId,
  Direction,
  ELEVATION_STEP,
  LevelDef,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  SessionHistoryRecord,
  StageCheckpoint,
  TILE_SIZE,
} from './types';

export const CHECKPOINT_VERSION = 1;
export const MAX_SESSIONS_PER_STAGE = 5;

const VALID_LEVEL_IDS = new Set(LEVELS.map((l) => l.id));
const VALID_CHAR_IDS = new Set<CharacterId>(['wayfinder', 'sylvi', 'neris', 'kael', 'zeph']);

function toDirection(val: unknown, fallback: Direction = 0): Direction {
  if (val === 0 || val === 1 || val === 2 || val === 3) return val;
  return fallback;
}

function sanitizeBoolRecord(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'boolean') out[k] = v;
  }
  return out;
}

function sanitizeDirRecord(raw: unknown): Record<string, Direction> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, Direction> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === 0 || v === 1 || v === 2 || v === 3) out[k] = v;
  }
  return out;
}

export function captureStageCheckpoint(
  levelId: number,
  player: PlayerRuntimeState,
  puzzleState: PuzzleRuntimeState,
  bonusShardsInRun = 0,
  timestamp = Date.now()
): StageCheckpoint {
  return {
    levelId,
    characterId: puzzleState.activeCharacterId,
    playerX: Number(player.x.toFixed(3)),
    playerY: Number(player.y.toFixed(3)),
    playerZ: Number(player.z.toFixed(3)),
    facingAngle: Number(player.facingAngle.toFixed(3)),
    rotatingSteps: { ...puzzleState.rotatingSteps },
    switchStates: { ...puzzleState.switchStates },
    elevationHigh: { ...puzzleState.elevationHigh },
    prismDirections: { ...puzzleState.prismDirections },
    heroNodesActive: { ...puzzleState.heroNodesActive },
    crystalRestored: Boolean(puzzleState.crystalRestored),
    portalAwakened: Boolean(puzzleState.portalAwakened),
    echoCollectedInRun: Boolean(puzzleState.echoCollectedInRun),
    elapsedSeconds: Number(Math.max(0, puzzleState.elapsedSeconds).toFixed(2)),
    interactionsCount: Math.max(0, Math.trunc(puzzleState.interactionsCount)),
    bonusShardsInRun: Math.max(0, Math.trunc(bonusShardsInRun)),
    timestamp,
    version: CHECKPOINT_VERSION,
  };
}

export function restoreFromCheckpoint(
  level: LevelDef,
  checkpoint: StageCheckpoint,
  fallbackCharacterId: CharacterId = 'wayfinder'
): {
  playerState: PlayerRuntimeState;
  puzzleState: PuzzleRuntimeState;
  bonusShardsInRun: number;
} {
  const safeChar = VALID_CHAR_IDS.has(checkpoint.characterId)
    ? checkpoint.characterId
    : getCharacterById(fallbackCharacterId).id;

  const basePuzzle = createInitialPuzzleState(level, safeChar);

  const rotatingSteps = { ...basePuzzle.rotatingSteps };
  for (const r of level.rotatingPlatforms ?? []) {
    if (checkpoint.rotatingSteps?.[r.id] !== undefined) {
      rotatingSteps[r.id] = toDirection(checkpoint.rotatingSteps[r.id], r.initialStep);
    }
  }

  const switchStates = { ...basePuzzle.switchStates };
  for (const s of level.pressureSwitches ?? []) {
    if (typeof checkpoint.switchStates?.[s.id] === 'boolean') {
      switchStates[s.id] = checkpoint.switchStates[s.id];
    }
  }

  const elevationHigh = { ...basePuzzle.elevationHigh };
  for (const l of level.elevationPlatforms ?? []) {
    if (typeof checkpoint.elevationHigh?.[l.id] === 'boolean') {
      elevationHigh[l.id] = checkpoint.elevationHigh[l.id];
    }
  }

  const prismDirections = { ...basePuzzle.prismDirections };
  for (const p of level.lightPrisms ?? []) {
    if (checkpoint.prismDirections?.[p.id] !== undefined) {
      prismDirections[p.id] = toDirection(checkpoint.prismDirections[p.id], p.initialDirection);
    }
  }

  const heroNodesActive = { ...basePuzzle.heroNodesActive };
  for (const hn of level.heroNodes ?? []) {
    if (typeof checkpoint.heroNodesActive?.[hn.id] === 'boolean') {
      heroNodesActive[hn.id] = checkpoint.heroNodesActive[hn.id];
    }
  }

  const puzzleState = refreshDerivedPuzzleState(level, {
    ...basePuzzle,
    rotatingSteps,
    switchStates,
    elevationHigh,
    prismDirections,
    heroNodesActive,
    echoCollectedInRun: Boolean(checkpoint.echoCollectedInRun),
    crystalRestored: Boolean(checkpoint.crystalRestored),
    portalAwakened: Boolean(checkpoint.portalAwakened),
    elapsedSeconds:
      typeof checkpoint.elapsedSeconds === 'number' && Number.isFinite(checkpoint.elapsedSeconds)
        ? Math.max(0, checkpoint.elapsedSeconds)
        : 0,
    interactionsCount:
      typeof checkpoint.interactionsCount === 'number' && Number.isFinite(checkpoint.interactionsCount)
        ? Math.max(0, Math.trunc(checkpoint.interactionsCount))
        : 0,
    completed: false,
  });

  const gx = worldToTile(checkpoint.playerX);
  const gz = worldToTile(checkpoint.playerZ);
  const surface = getSurfaceAtTile(level, puzzleState, gx, gz);

  let playerState: PlayerRuntimeState;
  if (surface && surface.walkable) {
    playerState = {
      x: checkpoint.playerX,
      y: surface.elevation * ELEVATION_STEP,
      z: checkpoint.playerZ,
      vx: 0,
      vz: 0,
      facingAngle: Number.isFinite(checkpoint.facingAngle)
        ? checkpoint.facingAngle
        : level.spawn.facingAngle,
      isMoving: false,
      walkCycle: 0,
      interactTimer: 0,
      lastStepTileKey: `${gx},${gz}`,
    };
  } else {
    playerState = createInitialPlayerState(level);
  }

  return {
    playerState,
    puzzleState,
    bonusShardsInRun: Math.max(0, Math.trunc(checkpoint.bonusShardsInRun ?? 0)),
  };
}

export function sanitizeCheckpoints(raw: unknown): Record<number, StageCheckpoint> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<number, StageCheckpoint> = {};

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(key);
    if (!Number.isInteger(id) || !VALID_LEVEL_IDS.has(id) || !val || typeof val !== 'object') {
      continue;
    }
    const obj = val as Record<string, unknown>;
    const lvl = getLevelById(id);
    const charId =
      typeof obj.characterId === 'string' && VALID_CHAR_IDS.has(obj.characterId as CharacterId)
        ? (obj.characterId as CharacterId)
        : 'wayfinder';

    const px =
      typeof obj.playerX === 'number' && Number.isFinite(obj.playerX)
        ? obj.playerX
        : lvl.spawn.x * TILE_SIZE;
    const py =
      typeof obj.playerY === 'number' && Number.isFinite(obj.playerY) ? obj.playerY : 0;
    const pz =
      typeof obj.playerZ === 'number' && Number.isFinite(obj.playerZ)
        ? obj.playerZ
        : lvl.spawn.z * TILE_SIZE;

    out[id] = {
      levelId: id,
      characterId: charId,
      playerX: px,
      playerY: py,
      playerZ: pz,
      facingAngle:
        typeof obj.facingAngle === 'number' && Number.isFinite(obj.facingAngle)
          ? obj.facingAngle
          : lvl.spawn.facingAngle,
      rotatingSteps: sanitizeDirRecord(obj.rotatingSteps),
      switchStates: sanitizeBoolRecord(obj.switchStates),
      elevationHigh: sanitizeBoolRecord(obj.elevationHigh),
      prismDirections: sanitizeDirRecord(obj.prismDirections),
      heroNodesActive: sanitizeBoolRecord(obj.heroNodesActive),
      crystalRestored: Boolean(obj.crystalRestored),
      portalAwakened: Boolean(obj.portalAwakened),
      echoCollectedInRun: Boolean(obj.echoCollectedInRun),
      elapsedSeconds:
        typeof obj.elapsedSeconds === 'number' && Number.isFinite(obj.elapsedSeconds) && obj.elapsedSeconds >= 0
          ? obj.elapsedSeconds
          : 0,
      interactionsCount:
        typeof obj.interactionsCount === 'number' &&
        Number.isFinite(obj.interactionsCount) &&
        obj.interactionsCount >= 0
          ? Math.trunc(obj.interactionsCount)
          : 0,
      bonusShardsInRun:
        typeof obj.bonusShardsInRun === 'number' &&
        Number.isFinite(obj.bonusShardsInRun) &&
        obj.bonusShardsInRun >= 0
          ? Math.trunc(obj.bonusShardsInRun)
          : 0,
      timestamp:
        typeof obj.timestamp === 'number' && Number.isFinite(obj.timestamp) && obj.timestamp > 0
          ? obj.timestamp
          : Date.now(),
      version:
        typeof obj.version === 'number' && Number.isInteger(obj.version)
          ? obj.version
          : CHECKPOINT_VERSION,
    };
  }

  return out;
}

export function appendSessionHistory(
  existing: Record<number, SessionHistoryRecord[]> | undefined,
  record: SessionHistoryRecord,
  capPerStage = MAX_SESSIONS_PER_STAGE
): Record<number, SessionHistoryRecord[]> {
  if (!VALID_LEVEL_IDS.has(record.levelId)) {
    return existing ? { ...existing } : {};
  }
  const prevList = existing?.[record.levelId] ?? [];
  const nextList = [record, ...prevList].slice(0, Math.max(1, capPerStage));
  return {
    ...(existing ?? {}),
    [record.levelId]: nextList,
  };
}

export function sanitizeSessionHistory(
  raw: unknown,
  capPerStage = MAX_SESSIONS_PER_STAGE
): Record<number, SessionHistoryRecord[]> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<number, SessionHistoryRecord[]> = {};

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(key);
    if (!Number.isInteger(id) || !VALID_LEVEL_IDS.has(id) || !Array.isArray(val)) {
      continue;
    }
    const cleanList: SessionHistoryRecord[] = [];
    for (const entry of val) {
      if (!entry || typeof entry !== 'object') continue;
      const e = entry as Record<string, unknown>;
      const charId =
        typeof e.characterId === 'string' && VALID_CHAR_IDS.has(e.characterId as CharacterId)
          ? (e.characterId as CharacterId)
          : 'wayfinder';
      const outcome =
        e.outcome === 'completed' || e.outcome === 'checkpoint_saved' || e.outcome === 'abandoned'
          ? e.outcome
          : 'completed';
      const stars =
        e.starsEarned === 1 || e.starsEarned === 2 || e.starsEarned === 3 ? e.starsEarned : 0;

      cleanList.push({
        id:
          typeof e.id === 'string' && e.id.length > 0
            ? e.id
            : `sess_${id}_${cleanList.length}_${Math.trunc(Number(e.timestamp) || 0)}`,
        levelId: id,
        characterId: charId,
        outcome,
        clearSeconds:
          typeof e.clearSeconds === 'number' && Number.isFinite(e.clearSeconds) && e.clearSeconds >= 0
            ? Number(e.clearSeconds.toFixed(2))
            : 0,
        actionsUsed:
          typeof e.actionsUsed === 'number' && Number.isFinite(e.actionsUsed) && e.actionsUsed >= 0
            ? Math.trunc(e.actionsUsed)
            : 0,
        starsEarned: stars,
        echoCollected: Boolean(e.echoCollected),
        timestamp:
          typeof e.timestamp === 'number' && Number.isFinite(e.timestamp) && e.timestamp > 0
            ? e.timestamp
            : Date.now(),
      });
    }
    if (cleanList.length > 0) {
      cleanList.sort((a, b) => b.timestamp - a.timestamp);
      out[id] = cleanList.slice(0, capPerStage);
    }
  }

  return out;
}

export function getTotalSessionHistoryCount(
  history: Record<number, SessionHistoryRecord[]> | undefined
): number {
  if (!history) return 0;
  let total = 0;
  for (const list of Object.values(history)) {
    total += list.length;
  }
  return total;
}
