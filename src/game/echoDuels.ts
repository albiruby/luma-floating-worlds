import { computeStageHash, ECHO_TICK_RATE, verifyReplayDeterministically } from './echoEngine';
import {
  EchoDuelRecord,
  LevelDef,
  LumaReplayFile,
  PlayerRuntimeState,
} from './types';

export interface ActiveDuelSession {
  id: string;
  stageTitle: string;
  stageHash: string;
  creatorAlias: string;
  creatorTime: number;
  creatorActions: number;
  creatorStars: 0 | 1 | 2 | 3;
  replay: LumaReplayFile;
  verified: boolean;
  verificationNote: string;
  timelinePositions: Array<{
    x: number;
    y: number;
    z: number;
    facingAngle: number;
    isMoving: boolean;
    walkCycle: number;
  }>;
}

export function prepareDuelSession(
  level: LevelDef,
  replay: LumaReplayFile
): ActiveDuelSession {
  const stageHash = computeStageHash(level);
  const verification = verifyReplayDeterministically(level, replay);

  return {
    id: `duel_${Date.now().toString(36)}`,
    stageTitle: level.title,
    stageHash,
    creatorAlias: replay.challengerAlias || 'Creator',
    creatorTime: verification.verified ? verification.simulatedSeconds : replay.clearSeconds,
    creatorActions: verification.verified ? verification.simulatedActions : replay.actionsUsed,
    creatorStars: replay.stars,
    replay,
    verified: verification.verified,
    verificationNote: verification.reason,
    timelinePositions: verification.timelinePositions,
  };
}

export function sampleDuelGhostAtTime(
  session: ActiveDuelSession,
  elapsedSeconds: number
): PlayerRuntimeState | null {
  const positions = session.timelinePositions;
  if (!positions || positions.length === 0) return null;
  const idx = Math.min(
    positions.length - 1,
    Math.max(0, Math.floor(elapsedSeconds * ECHO_TICK_RATE))
  );
  const p = positions[idx];
  return {
    x: p.x,
    y: p.y,
    z: p.z,
    vx: 0,
    vz: 0,
    facingAngle: p.facingAngle,
    isMoving: idx < positions.length - 1 ? p.isMoving : false,
    walkCycle: p.walkCycle,
    interactTimer: 0,
    lastStepTileKey: null,
  };
}

export function buildEchoDuelRecord(params: {
  session: ActiveDuelSession;
  challengerTime: number;
  challengerActions: number;
}): EchoDuelRecord {
  const { session, challengerTime, challengerActions } = params;
  const cleanTime = Number(challengerTime.toFixed(2));
  const cleanActions = Math.max(0, Math.round(challengerActions));
  const challengerWon =
    cleanTime < session.creatorTime ||
    (Math.abs(cleanTime - session.creatorTime) < 0.05 && cleanActions <= session.creatorActions);

  return {
    id: `duelrec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    stageHash: session.stageHash,
    stageTitle: session.stageTitle,
    creatorAlias: session.creatorAlias,
    creatorTime: session.creatorTime,
    creatorActions: session.creatorActions,
    challengerTime: cleanTime,
    challengerActions: cleanActions,
    challengerWon,
    verifiedReplay: session.verified,
    playedAt: Date.now(),
  };
}

/**
 * Generates an offline, zero-PII HTML5 Canvas PNG Scorecard for local sharing.
 */
export function renderDuelScorecardDataUrl(record: EchoDuelRecord): string | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background deep slate
  ctx.fillStyle = '#17252e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Parchment card frame
  ctx.fillStyle = '#f6eedb';
  ctx.strokeStyle = '#e8a838';
  ctx.lineWidth = 5;
  ctx.fillRect(24, 24, canvas.width - 48, canvas.height - 48);
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  // Header
  ctx.fillStyle = '#1f2d38';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('LUMA: UNBOUND · ECHO DUEL SCORECARD', 48, 64);

  ctx.fillStyle = '#178a80';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(record.stageTitle.slice(0, 34), 48, 102);

  // Result Banner
  ctx.fillStyle = record.challengerWon ? '#178a80' : '#9b6a24';
  ctx.fillRect(48, 124, canvas.width - 96, 44);
  ctx.fillStyle = '#fbf5e6';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(
    record.challengerWon ? 'VICTORY · RECORD SURPASSED' : 'CHALLENGE COMPLETED',
    68,
    153
  );

  // Comparison Columns
  ctx.fillStyle = '#efe6cf';
  ctx.strokeStyle = '#253542';
  ctx.lineWidth = 2;
  ctx.fillRect(48, 188, 300, 122);
  ctx.strokeRect(48, 188, 300, 122);
  ctx.fillRect(372, 188, 300, 122);
  ctx.strokeRect(372, 188, 300, 122);

  ctx.fillStyle = '#5b6973';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`RIVAL GHOST (${record.creatorAlias.slice(0, 14)})`, 66, 214);
  ctx.fillText('YOUR RUN', 390, 214);

  ctx.fillStyle = '#1f2d38';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(`${record.creatorTime.toFixed(1)}s`, 66, 255);
  ctx.fillText(`${record.challengerTime.toFixed(1)}s`, 390, 255);

  ctx.fillStyle = '#4b5c68';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${record.creatorActions} Actions`, 66, 286);
  ctx.fillText(`${record.challengerActions} Actions`, 390, 286);

  // Footer
  ctx.fillStyle = '#4b5c68';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(
    `Replay Check: ${record.verifiedReplay ? 'Deterministically Verified' : 'Unverified Visual Reference'} · Hash: ${record.stageHash}`,
    48,
    346
  );

  return canvas.toDataURL('image/png');
}

export function downloadDuelScorecardPng(record: EchoDuelRecord): boolean {
  const url = renderDuelScorecardDataUrl(record);
  if (!url || typeof document === 'undefined') return false;
  const a = document.createElement('a');
  a.href = url;
  a.download = `luma-duel-${record.stageHash}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
}
