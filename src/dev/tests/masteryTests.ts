import { LEVELS } from '../../game/levels';
import {
  calculateMasteryRating,
  getThreeStarLevelCount,
  getTotalStars,
  MAX_CAMPAIGN_STARS,
} from '../../game/mastery';
import { getMasteryTargetForLevel, MASTERY_TARGETS } from '../../game/masteryConfig';
import { DEFAULT_PROGRESS, recordLevelCompletionDetailed } from '../../game/progression';
import { QATestResult } from '../debugTypes';

function runMasteryCheck(
  id: string,
  name: string,
  fn: () => { status?: 'PASS' | 'FAIL' | 'WARNING'; message: string }
): QATestResult {
  const start = performance.now();
  try {
    const out = fn();
    return {
      id,
      suite: 'mastery',
      name,
      status: out.status ?? 'PASS',
      executionMode: 'static-logic',
      message: out.message,
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  } catch (err) {
    return {
      id,
      suite: 'mastery',
      name,
      status: 'FAIL',
      executionMode: 'static-logic',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  }
}

export function runMasterySuite(): QATestResult[] {
  return [
    runMasteryCheck('mastery_tiers', 'Three-Star Evaluation & Exact Boundary Rules', () => {
      const t = getMasteryTargetForLevel(1);
      const r0 = calculateMasteryRating({ levelId: 1, completed: false, clearSeconds: 5, actionsUsed: 1, target: t });
      const r1 = calculateMasteryRating({ levelId: 1, completed: true, clearSeconds: t.timeTargetSeconds + 20, actionsUsed: t.actionTarget + 3, target: t });
      const r2Time = calculateMasteryRating({ levelId: 1, completed: true, clearSeconds: t.timeTargetSeconds, actionsUsed: t.actionTarget + 2, target: t });
      const r2Act = calculateMasteryRating({ levelId: 1, completed: true, clearSeconds: t.timeTargetSeconds + 10, actionsUsed: t.actionTarget, target: t });
      const r3 = calculateMasteryRating({ levelId: 1, completed: true, clearSeconds: t.timeTargetSeconds, actionsUsed: t.actionTarget, target: t });
      if (r0.stars !== 0 || r1.stars !== 1 || r2Time.stars !== 2 || r2Act.stars !== 2 || r3.stars !== 3) {
        return { status: 'FAIL', message: `Unexpected star outputs: [${r0.stars}, ${r1.stars}, ${r2Time.stars}, ${r2Act.stars}, ${r3.stars}]` };
      }
      return { message: '0/1/2/3 star evaluation & inclusive <= boundary conditions pass.' };
    }),

    runMasteryCheck('mastery_same_run', 'Same-Run Enforcement & Non-Downgrade Best Stars', () => {
      const t = getMasteryTargetForLevel(1);
      const runFast = recordLevelCompletionDetailed(DEFAULT_PROGRESS, 1, t.timeTargetSeconds - 5, t.actionTarget + 4);
      const runOptimalAct = recordLevelCompletionDetailed(runFast.progress, 1, t.timeTargetSeconds + 15, t.actionTarget);
      if (runOptimalAct.progress.masteryRecords[1]?.bestStars !== 2) {
        return { status: 'FAIL', message: 'Separate fast and low-action runs combined illegally into 3 stars.' };
      }
      const runBoth = recordLevelCompletionDetailed(runOptimalAct.progress, 1, t.timeTargetSeconds - 2, t.actionTarget);
      const runSlowReplay = recordLevelCompletionDetailed(runBoth.progress, 1, t.timeTargetSeconds + 50, t.actionTarget + 10);
      if (runSlowReplay.progress.masteryRecords[1]?.bestStars !== 3) {
        return { status: 'FAIL', message: 'Worse replay lowered previously earned 3-star record.' };
      }
      return { message: '3-star mastery strictly requires both targets in one run and never downgrades.' };
    }),

    runMasteryCheck('mastery_targets_180', 'All 60 Targets Configured & 180-Star Total Cap', () => {
      if (MASTERY_TARGETS.length !== 60 || MAX_CAMPAIGN_STARS !== 180) {
        return { status: 'FAIL', message: `Expected 60 targets & 180 max stars, got ${MASTERY_TARGETS.length}/${MAX_CAMPAIGN_STARS}.` };
      }
      let p = DEFAULT_PROGRESS;
      for (const lvl of LEVELS) {
        const cfg = getMasteryTargetForLevel(lvl.id);
        p = recordLevelCompletionDetailed(p, lvl.id, cfg.timeTargetSeconds, cfg.actionTarget).progress;
      }
      if (getTotalStars(p.masteryRecords) !== 180 || getThreeStarLevelCount(p.masteryRecords) !== 60) {
        return { status: 'FAIL', message: 'Full 3-star simulation did not sum to 180/180 stars across 60 stages.' };
      }
      return { message: 'All 60 mastery targets validated; campaign cap sums cleanly to 180/180 stars.' };
    }),
  ];
}
