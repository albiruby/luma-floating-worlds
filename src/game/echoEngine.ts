import {
  activateHeroAbility,
  createInitialPlayerState,
  createInitialPuzzleState,
  executeInteraction,
  findNearestInteraction,
  FIXED_SIM_DT,
  stepPlayerMovement,
  updateOccupancyPlates,
} from './rules';
import {
  CharacterId,
  EchoInputFrame,
  EchoKeyEvent,
  EchoRecording,
  LevelDef,
  LumaReplayFile,
  PlayerRuntimeState,
  PuzzleRuntimeState,
} from './types';

export const LUMA_ENGINE_VERSION = 'unbound-1.0.0';
export const ECHO_TICK_RATE = 30;
export const MAX_REPLAY_TICKS = ECHO_TICK_RATE * 180; // 3 minute cap per replay

/**
 * Converts screen-relative axes (moveX = right - left, moveZ = up - down)
 * to LUMA's isometric world movement vector.
 */
export function screenAxesToWorldInput(moveX: -1 | 0 | 1, moveZ: -1 | 0 | 1): {
  inputX: number;
  inputZ: number;
} {
  return {
    inputX: moveX - moveZ,
    inputZ: -moveX - moveZ,
  };
}

/**
 * Deterministic 32-bit FNV-1a hash of the structural puzzle geometry & mechanisms
 * so replays verify against the exact stage layout they were recorded on.
 */
export function computeStageHash(level: LevelDef): string {
  const canonical = {
    spawn: { x: level.spawn.x, z: level.spawn.z },
    tiles: [...level.tiles]
      .map((t) => `${t.x},${t.z},${t.elevation},${t.terrain},${t.isStair ? 1 : 0},${t.blocksMovement ? 1 : 0},${t.blocksLight ? 1 : 0}`)
      .sort(),
    switches: (level.pressureSwitches ?? [])
      .map((s) => `${s.id}:${s.x},${s.z},${s.elevation},${s.latch ? 1 : 0}`)
      .sort(),
    echoPlates: (level.echoPlates ?? [])
      .map((e) => `${e.id}:${e.x},${e.z},${e.elevation},${e.echoOnly ? 1 : 0}`)
      .sort(),
    gates: (level.gates ?? [])
      .map((g) => `${g.id}:${g.x},${g.z},${g.elevation},${g.axis},${g.linkedSwitchId ?? ''},${g.linkedSubCrystalId ?? ''},${g.linkedEchoPlateId ?? ''},${g.linkedSynergyId ?? ''},${g.inverted ? 1 : 0},${g.blocksLight ? 1 : 0}`)
      .sort(),
    rotating: (level.rotatingPlatforms ?? [])
      .map((r) => `${r.id}:${r.pivotX},${r.pivotZ},${r.elevation},${r.initialStep}:${r.baseOffsets.map((o) => `${o.dx}/${o.dz}`).join(';')}`)
      .sort(),
    lifts: (level.elevationPlatforms ?? [])
      .map((l) => `${l.id}:${l.x},${l.z},${l.lowElevation},${l.highElevation},${l.initialHigh ? 1 : 0},${l.linkedSwitchId ?? ''}`)
      .sort(),
    emitters: (level.lightEmitters ?? [])
      .map((e) => `${e.id}:${e.x},${e.z},${e.elevation},${e.direction}`)
      .sort(),
    prisms: (level.lightPrisms ?? [])
      .map((p) => `${p.id}:${p.x},${p.z},${p.elevation},${p.initialDirection}`)
      .sort(),
    subs: (level.subCrystals ?? [])
      .map((s) => `${s.id}:${s.x},${s.z},${s.elevation}`)
      .sort(),
    heroNodes: (level.heroNodes ?? [])
      .map((h) => `${h.id}:${h.heroId}:${h.x},${h.z},${h.elevation}`)
      .sort(),
    synergyNodes: (level.synergyNodes ?? [])
      .map((s) => `${s.id}:${s.kind}:${s.x},${s.z},${s.elevation}`)
      .sort(),
    crystal: `${level.crystal.x},${level.crystal.z},${level.crystal.elevation},${level.crystal.requiresLightBeam ? 1 : 0}`,
    portal: `${level.portal.x},${level.portal.z},${level.portal.elevation}`,
  };

  const json = JSON.stringify(canonical);
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `lh_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export interface EchoActorSnapshot {
  slotIndex: number;
  label: string;
  characterId: CharacterId;
  active: boolean;
  finished: boolean;
  player: PlayerRuntimeState;
  currentTick: number;
  totalTicks: number;
}

export interface EchoAnchorSnapshot {
  player: PlayerRuntimeState;
  puzzleState: PuzzleRuntimeState;
}

export function clonePuzzleRuntime(state: PuzzleRuntimeState): PuzzleRuntimeState {
  return {
    ...state,
    rotatingSteps: { ...state.rotatingSteps },
    switchStates: { ...state.switchStates },
    elevationHigh: { ...state.elevationHigh },
    prismDirections: { ...state.prismDirections },
    heroNodesActive: { ...state.heroNodesActive },
    echoPlateStates: { ...(state.echoPlateStates ?? {}) },
    synergyNodesActive: { ...(state.synergyNodesActive ?? {}) },
    lightSegments: state.lightSegments.map((s) => ({ ...s })),
    litPrismIds: [...state.litPrismIds],
    litSubCrystalIds: [...state.litSubCrystalIds],
    companionPos: state.companionPos ? { ...state.companionPos } : undefined,
    debugGateOverrides: undefined,
    debugDisabledEmitters: undefined,
  };
}

export function createEchoRecording(
  slotIndex: number,
  characterId: CharacterId,
  frames: EchoInputFrame[],
  keyEvents: EchoKeyEvent[],
  timeOffsetTicks = 0
): EchoRecording {
  return {
    id: `echo_slot_${slotIndex}_${Date.now().toString(36)}`,
    slotIndex,
    label: `Echo ${slotIndex + 1}`,
    characterId,
    durationTicks: frames.length,
    timeOffsetTicks: Math.max(0, Math.min(ECHO_TICK_RATE * 10, Math.round(timeOffsetTicks))),
    frames: frames.map((f) => ({ ...f })),
    keyEvents: keyEvents.map((k) => ({ ...k })),
    recordedAt: Date.now(),
  };
}

/**
 * Steps a single Echo actor forward at `globalTick` (respecting its timeOffsetTicks)
 * against the live level & puzzleState.
 * Echoes NEVER collect Echo Fragments, complete the Portal, or award Shards/Campaign Stars.
 */
export function stepEchoSlotTick(
  level: LevelDef,
  puzzleState: PuzzleRuntimeState,
  recording: EchoRecording,
  actorState: PlayerRuntimeState,
  globalTick: number
): {
  actor: PlayerRuntimeState;
  puzzleState: PuzzleRuntimeState;
  active: boolean;
  finished: boolean;
  triggeredInteraction: boolean;
} {
  const localTick = globalTick - recording.timeOffsetTicks;
  if (localTick < 0) {
    return {
      actor: actorState,
      puzzleState,
      active: false,
      finished: false,
      triggeredInteraction: false,
    };
  }
  if (localTick >= recording.frames.length) {
    return {
      actor: { ...actorState, isMoving: false, vx: 0, vz: 0 },
      puzzleState,
      active: true, // Echo remains standing on its final tile (holding plates/switches!)
      finished: true,
      triggeredInteraction: false,
    };
  }

  const frame = recording.frames[localTick];
  const { inputX, inputZ } = screenAxesToWorldInput(frame.moveX, frame.moveZ);
  const moveRes = stepPlayerMovement(
    level,
    puzzleState,
    actorState,
    inputX,
    inputZ,
    FIXED_SIM_DT
  );

  // Strip echo fragment / portal completion side effects from Echo actors
  let nextPuzzle: PuzzleRuntimeState = {
    ...moveRes.puzzleState,
    echoCollectedInRun: puzzleState.echoCollectedInRun,
    completed: puzzleState.completed,
  };
  let nextActor = moveRes.player;
  let triggeredInteraction = Boolean(moveRes.triggeredSwitchId);

  if (frame.interact) {
    const target = findNearestInteraction(level, nextPuzzle, nextActor);
    if (
      target &&
      target.kind !== 'echo' &&
      target.kind !== 'portal' &&
      target.kind !== 'crystal'
    ) {
      nextPuzzle = executeInteraction(level, nextPuzzle, target);
      nextActor = { ...nextActor, interactTimer: 0.3 };
      triggeredInteraction = true;
    }
  }

  return {
    actor: nextActor,
    puzzleState: nextPuzzle,
    active: true,
    finished: localTick === recording.frames.length - 1,
    triggeredInteraction,
  };
}

export function buildLumaReplayFile(params: {
  level: LevelDef;
  characterId: CharacterId;
  companionId?: CharacterId | null;
  clearSeconds: number;
  actionsUsed: number;
  stars: 0 | 1 | 2 | 3;
  frames: EchoInputFrame[];
  keyEvents: EchoKeyEvent[];
  challengerAlias?: string;
  verified: boolean;
}): LumaReplayFile {
  return {
    format: 'luma-replay',
    formatVersion: 1,
    engineVersion: LUMA_ENGINE_VERSION,
    stageHash: computeStageHash(params.level),
    stageTitle: params.level.title,
    characterId: params.characterId,
    companionId: params.companionId ?? null,
    clearSeconds: Number(params.clearSeconds.toFixed(2)),
    actionsUsed: Math.max(0, Math.round(params.actionsUsed)),
    stars: params.stars,
    tickRate: 30,
    frames: params.frames.slice(0, MAX_REPLAY_TICKS),
    keyEvents: params.keyEvents.slice(0, 500),
    createdAt: Date.now(),
    challengerAlias: params.challengerAlias?.trim() || 'Wayfinder',
    verified: params.verified,
  };
}

export interface ReplayVerificationResult {
  verified: boolean;
  reason: string;
  simulatedSeconds: number;
  simulatedActions: number;
  timelinePositions: Array<{ x: number; y: number; z: number; facingAngle: number; isMoving: boolean; walkCycle: number }>;
}

/**
 * Runs headless deterministic fixed-timestep simulation to honestly verify whether
 * a replay file solves the given level under the current engine version and stageHash.
 * Returns per-tick positions so verified (or unverified reference) Duel Ghosts can animate cleanly.
 */
export function verifyReplayDeterministically(
  level: LevelDef,
  replay: LumaReplayFile
): ReplayVerificationResult {
  const expectedHash = computeStageHash(level);
  if (replay.engineVersion !== LUMA_ENGINE_VERSION) {
    return {
      verified: false,
      reason: `Engine mismatch (${replay.engineVersion} vs ${LUMA_ENGINE_VERSION}).`,
      simulatedSeconds: replay.clearSeconds,
      simulatedActions: replay.actionsUsed,
      timelinePositions: [],
    };
  }
  if (replay.stageHash !== expectedHash) {
    return {
      verified: false,
      reason: 'Stage layout hash does not match this stage.',
      simulatedSeconds: replay.clearSeconds,
      simulatedActions: replay.actionsUsed,
      timelinePositions: [],
    };
  }
  if (!Array.isArray(replay.frames) || replay.frames.length === 0) {
    return {
      verified: false,
      reason: 'Replay contains no recorded input frames.',
      simulatedSeconds: replay.clearSeconds,
      simulatedActions: replay.actionsUsed,
      timelinePositions: [],
    };
  }

  let puzzleState = createInitialPuzzleState(level, replay.characterId);
  if (replay.companionId) {
    puzzleState = { ...puzzleState, companionCharacterId: replay.companionId };
  }
  let player = createInitialPlayerState(level);
  const timelinePositions: ReplayVerificationResult['timelinePositions'] = [];
  const cap = Math.min(replay.frames.length, MAX_REPLAY_TICKS);

  for (let i = 0; i < cap; i++) {
    const frame = replay.frames[i];
    const { inputX, inputZ } = screenAxesToWorldInput(frame.moveX, frame.moveZ);
    puzzleState = {
      ...puzzleState,
      elapsedSeconds: puzzleState.elapsedSeconds + FIXED_SIM_DT,
    };

    const moveRes = stepPlayerMovement(
      level,
      puzzleState,
      player,
      inputX,
      inputZ,
      FIXED_SIM_DT
    );
    player = moveRes.player;
    puzzleState = moveRes.puzzleState;

    const occRes = updateOccupancyPlates(level, puzzleState, [
      {
        gx: Math.round(player.x / 2),
        gz: Math.round(player.z / 2),
        isEcho: false,
      },
    ]);
    puzzleState = occRes.puzzleState;

    if (frame.ability) {
      const abRes = activateHeroAbility(level, puzzleState, player);
      if (abRes.pulsed) {
        puzzleState = abRes.puzzleState;
      }
    }

    if (frame.interact) {
      const target = findNearestInteraction(level, puzzleState, player);
      if (target) {
        puzzleState = executeInteraction(level, puzzleState, target);
      }
    }

    timelinePositions.push({
      x: player.x,
      y: player.y,
      z: player.z,
      facingAngle: player.facingAngle,
      isMoving: player.isMoving,
      walkCycle: player.walkCycle,
    });

    if (puzzleState.completed) {
      return {
        verified: true,
        reason: 'Deterministically verified on matching stage & engine.',
        simulatedSeconds: Number(((i + 1) * FIXED_SIM_DT).toFixed(2)),
        simulatedActions: puzzleState.interactionsCount,
        timelinePositions,
      };
    }
  }

  return {
    verified: false,
    reason: 'Replay ended before portal completion (Unverified Visual Reference).',
    simulatedSeconds: Number((cap * FIXED_SIM_DT).toFixed(2)),
    simulatedActions: puzzleState.interactionsCount,
    timelinePositions,
  };
}
