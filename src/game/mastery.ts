import { LEVELS } from './levels';
import { getMasteryTargetForLevel } from './masteryConfig';
import {
  LevelMasteryRecord,
  MasteryEvaluationInput,
  MasteryEvaluationResult,
} from './types';

export const MAX_STARS_PER_LEVEL = 3;
export const MAX_CAMPAIGN_STARS = LEVELS.length * MAX_STARS_PER_LEVEL;

/**
 * Pure mastery star evaluator.
 * - Incomplete run -> 0 stars
 * - Completed run -> 1 star base
 * - +1 star if actionsUsed <= actionTarget in THIS run
 * - +1 star if clearSeconds <= timeTargetSeconds in THIS run
 * - Three stars require meeting BOTH targets within the SAME successful run.
 */
export function calculateMasteryRating(
  input: MasteryEvaluationInput
): MasteryEvaluationResult {
  const { levelId, completed, clearSeconds, actionsUsed, target } = input;
  const safeSeconds = Number.isFinite(clearSeconds) && clearSeconds >= 0 ? clearSeconds : Number.POSITIVE_INFINITY;
  const safeActions =
    Number.isFinite(actionsUsed) && actionsUsed >= 0
      ? Math.round(actionsUsed)
      : Number.POSITIVE_INFINITY;

  if (!completed) {
    return {
      levelId,
      completed: false,
      stars: 0,
      metCompletion: false,
      metActionTarget: false,
      metTimeTarget: false,
      clearSeconds: Number.isFinite(safeSeconds) ? safeSeconds : 0,
      actionsUsed: Number.isFinite(safeActions) ? safeActions : 0,
      actionTarget: target.actionTarget,
      timeTargetSeconds: target.timeTargetSeconds,
    };
  }

  const metActionTarget = safeActions <= target.actionTarget;
  const metTimeTarget = safeSeconds <= target.timeTargetSeconds;

  let stars: 1 | 2 | 3 = 1;
  if (metActionTarget && metTimeTarget) {
    stars = 3;
  } else if (metActionTarget || metTimeTarget) {
    stars = 2;
  }

  return {
    levelId,
    completed: true,
    stars,
    metCompletion: true,
    metActionTarget,
    metTimeTarget,
    clearSeconds: Number.isFinite(safeSeconds) ? safeSeconds : 0,
    actionsUsed: Number.isFinite(safeActions) ? safeActions : 0,
    actionTarget: target.actionTarget,
    timeTargetSeconds: target.timeTargetSeconds,
  };
}

export function evaluateLevelRun(
  levelId: number,
  completed: boolean,
  clearSeconds: number,
  actionsUsed: number
): MasteryEvaluationResult {
  return calculateMasteryRating({
    levelId,
    completed,
    clearSeconds,
    actionsUsed,
    target: getMasteryTargetForLevel(levelId),
  });
}

export function getTotalStars(records: Record<number, LevelMasteryRecord>): number {
  let total = 0;
  for (const lvl of LEVELS) {
    const rec = records[lvl.id];
    if (rec && rec.completed) {
      total += Math.max(0, Math.min(3, Math.trunc(rec.bestStars)));
    }
  }
  return Math.max(0, Math.min(MAX_CAMPAIGN_STARS, total));
}

export function getThreeStarLevelCount(
  records: Record<number, LevelMasteryRecord>
): number {
  let count = 0;
  for (const lvl of LEVELS) {
    const rec = records[lvl.id];
    if (rec && rec.completed && rec.bestStars === 3) {
      count += 1;
    }
  }
  return count;
}

export function formatDurationSeconds(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}
