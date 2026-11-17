import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canEquipCosmetic,
  COSMETIC_MILESTONES,
  DEFAULT_EQUIPPED_COSMETICS,
  equipCosmeticSelection,
  resolveUnlockedCosmetics,
  resolveWayfinderAppearance,
} from './cosmetics';
import { getLevelById, LEVELS } from './levels';
import {
  calculateMasteryRating,
  evaluateLevelRun,
  getThreeStarLevelCount,
  getTotalStars,
  MAX_CAMPAIGN_STARS,
} from './mastery';
import { getMasteryTargetForLevel, MASTERY_TARGETS } from './masteryConfig';
import {
  DEFAULT_PROGRESS,
  equipCosmeticInProgress,
  recordLevelAttempt,
  recordLevelCompletion,
  recordLevelCompletionDetailed,
  restoreDefaultCosmetics,
  validateSaveProgress,
} from './progression';
import {
  createInitialPlayerState,
  createInitialPuzzleState,
  executeInteraction,
  findNearestInteraction,
  getSurfaceAtTile,
  stepPlayerMovement,
} from './rules';
import { computePlayerStatistics } from './statistics';
import { LevelDef, PlayerRuntimeState, PuzzleRuntimeState, TILE_SIZE } from './types';

function simPlayerAt(
  level: LevelDef,
  state: PuzzleRuntimeState,
  gx: number,
  gz: number
): PlayerRuntimeState {
  const s = getSurfaceAtTile(level, state, gx, gz);
  assert.ok(s && s.walkable, `Level ${level.id}: tile (${gx},${gz}) must be walkable`);
  return {
    ...createInitialPlayerState(level),
    x: gx * TILE_SIZE,
    z: gz * TILE_SIZE,
    y: s.elevation * 0.65,
    lastStepTileKey: `${gx},${gz}`,
  };
}

function simLatch(
  level: LevelDef,
  state: PuzzleRuntimeState,
  gx: number,
  gz: number
): PuzzleRuntimeState {
  const prevPlayer = {
    ...simPlayerAt(level, state, gx, gz),
    lastStepTileKey: 'different_tile',
  };
  return stepPlayerMovement(level, state, prevPlayer, 0, 0, 0.05).puzzleState;
}

function simInteract(
  level: LevelDef,
  state: PuzzleRuntimeState,
  gx: number,
  gz: number,
  times = 1
): PuzzleRuntimeState {
  let next = state;
  const p = simPlayerAt(level, next, gx, gz);
  for (let i = 0; i < times; i++) {
    const target = findNearestInteraction(level, next, p);
    assert.ok(target, `Level ${level.id}: expected target near (${gx},${gz})`);
    next = executeInteraction(level, next, target);
  }
  return next;
}

// ============================================================================
// 1. MASTERY RATING TESTS (1–10)
// ============================================================================

test('Mastery rating: 3 stars when both Action and Time targets met in same run', () => {
  const target = getMasteryTargetForLevel(1);
  const res = calculateMasteryRating({
    levelId: 1,
    completed: true,
    clearSeconds: target.timeTargetSeconds - 3,
    actionsUsed: target.actionTarget,
    target,
  });
  assert.equal(res.stars, 3);
  assert.equal(res.metCompletion, true);
  assert.equal(res.metActionTarget, true);
  assert.equal(res.metTimeTarget, true);
});

test('Mastery rating: 2 stars when only Action target is met', () => {
  const target = getMasteryTargetForLevel(1);
  const res = calculateMasteryRating({
    levelId: 1,
    completed: true,
    clearSeconds: target.timeTargetSeconds + 15,
    actionsUsed: target.actionTarget,
    target,
  });
  assert.equal(res.stars, 2);
  assert.equal(res.metActionTarget, true);
  assert.equal(res.metTimeTarget, false);
});

test('Mastery rating: 2 stars when only Time target is met', () => {
  const target = getMasteryTargetForLevel(1);
  const res = calculateMasteryRating({
    levelId: 1,
    completed: true,
    clearSeconds: target.timeTargetSeconds - 2,
    actionsUsed: target.actionTarget + 4,
    target,
  });
  assert.equal(res.stars, 2);
  assert.equal(res.metActionTarget, false);
  assert.equal(res.metTimeTarget, true);
});

test('Mastery rating: 1 star when completed but both targets missed', () => {
  const target = getMasteryTargetForLevel(1);
  const res = calculateMasteryRating({
    levelId: 1,
    completed: true,
    clearSeconds: target.timeTargetSeconds + 25,
    actionsUsed: target.actionTarget + 5,
    target,
  });
  assert.equal(res.stars, 1);
  assert.equal(res.metActionTarget, false);
  assert.equal(res.metTimeTarget, false);
});

test('Mastery rating: incomplete run yields 0 stars', () => {
  const target = getMasteryTargetForLevel(1);
  const res = calculateMasteryRating({
    levelId: 1,
    completed: false,
    clearSeconds: 5,
    actionsUsed: 1,
    target,
  });
  assert.equal(res.stars, 0);
  assert.equal(res.metCompletion, false);
});

test('Mastery rating: exact boundary equality qualifies for both targets', () => {
  const target = getMasteryTargetForLevel(2);
  const res = calculateMasteryRating({
    levelId: 2,
    completed: true,
    clearSeconds: target.timeTargetSeconds,
    actionsUsed: target.actionTarget,
    target,
  });
  assert.equal(res.stars, 3);
  assert.equal(res.metActionTarget, true);
  assert.equal(res.metTimeTarget, true);
});

test('Progression: replaying with a worse score never lowers bestStars', () => {
  const afterPerfect = recordLevelCompletion(DEFAULT_PROGRESS, 1, 10, 2);
  assert.equal(afterPerfect.masteryRecords[1]?.bestStars, 3);

  const afterWorse = recordLevelCompletion(afterPerfect, 1, 90, 12);
  assert.equal(afterWorse.masteryRecords[1]?.bestStars, 3);
  assert.equal(afterWorse.masteryRecords[1]?.bestTime, 10);
  assert.equal(afterWorse.masteryRecords[1]?.bestActions, 2);
  assert.equal(afterWorse.masteryRecords[1]?.completions, 2);
  assert.equal(afterWorse.masteryRecords[1]?.perfectRuns, 1);
});

test('Progression: best time and best actions from SEPARATE runs do NOT combine for 3 stars', () => {
  // Run 1: Fast time (10s <= 18s), too many actions (6 > 2) -> 2 stars
  const run1 = recordLevelCompletionDetailed(DEFAULT_PROGRESS, 1, 10, 6);
  assert.equal(run1.summary.rating.stars, 2);
  assert.equal(run1.progress.masteryRecords[1]?.bestStars, 2);

  // Run 2: Optimal actions (2 <= 2), slow time (40s > 18s) -> 2 stars
  const run2 = recordLevelCompletionDetailed(run1.progress, 1, 40, 2);
  assert.equal(run2.summary.rating.stars, 2);
  assert.equal(run2.progress.masteryRecords[1]?.bestTime, 10);
  assert.equal(run2.progress.masteryRecords[1]?.bestActions, 2);
  // Best stars MUST stay 2 because neither single run satisfied both targets simultaneously!
  assert.equal(run2.progress.masteryRecords[1]?.bestStars, 2);
  assert.equal(run2.progress.masteryRecords[1]?.perfectRuns, 0);

  // Run 3: Both targets in SAME run -> 3 stars
  const run3 = recordLevelCompletionDetailed(run2.progress, 1, 12, 2);
  assert.equal(run3.summary.rating.stars, 3);
  assert.equal(run3.progress.masteryRecords[1]?.bestStars, 3);
  assert.equal(run3.progress.masteryRecords[1]?.perfectRuns, 1);
});

test('Progression: incomplete / abandoned attempts never overwrite completion records', () => {
  const afterClear = recordLevelCompletion(DEFAULT_PROGRESS, 1, 15, 2);
  const afterAttempt = recordLevelAttempt(afterClear, 1);
  assert.equal(afterAttempt.statistics.totalAttempts, 1);
  assert.equal(afterAttempt.masteryRecords[1]?.bestStars, 3);
  assert.equal(afterAttempt.masteryRecords[1]?.bestTime, 15);
  assert.equal(afterAttempt.masteryRecords[1]?.bestActions, 2);
  assert.equal(afterAttempt.masteryRecords[1]?.completions, 1);
});

test('Total stars across all 60 levels aggregate accurately and max out at 180', () => {
  let state = DEFAULT_PROGRESS;
  for (const lvl of LEVELS) {
    const t = getMasteryTargetForLevel(lvl.id);
    state = recordLevelCompletion(state, lvl.id, t.timeTargetSeconds - 1, t.actionTarget);
  }
  assert.equal(getTotalStars(state.masteryRecords), MAX_CAMPAIGN_STARS);
  assert.equal(MAX_CAMPAIGN_STARS, 180);
  assert.equal(getThreeStarLevelCount(state.masteryRecords), 60);
});

// ============================================================================
// 2. TARGET CALIBRATION & OPTIMAL SOLUTION VERIFICATION
// ============================================================================

test('All 60 levels have valid targets and Levels 1-10 optimal solutions achieve <= actionTarget', () => {
  assert.equal(MASTERY_TARGETS.length, 60);
  for (const cfg of MASTERY_TARGETS) {
    assert.ok(cfg.actionTarget >= 1);
    assert.ok(cfg.timeTargetSeconds >= 10);
    assert.ok(cfg.calibrationSource === 'playtested' || cfg.calibrationSource === 'provisional');
  }

  // Simulate optimal action counts across all 10 levels
  const optimalRuns: Record<number, () => PuzzleRuntimeState> = {
    1: () => {
      const l = getLevelById(1);
      let s = createInitialPuzzleState(l);
      s = simLatch(l, s, -2, -2);
      s = simInteract(l, s, 1, 0, 1);
      return s;
    },
    2: () => {
      const l = getLevelById(2);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -2, 0, 1);
      s = simLatch(l, s, 4, 1);
      s = simInteract(l, s, 2, -1, 1);
      s = simInteract(l, s, 3, -2, 1);
      s = simInteract(l, s, 7, -2, 1);
      return s;
    },
    3: () => {
      const l = getLevelById(3);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -1, 0, 2);
      s = simLatch(l, s, -2, 2);
      s = simInteract(l, s, 0, -2, 2);
      s = simInteract(l, s, 2, 1, 1);
      s = simInteract(l, s, 3, -3, 3);
      return s;
    },
    4: () => {
      const l = getLevelById(4);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -1, 0, 1);
      s = simLatch(l, s, 0, 1);
      s = simInteract(l, s, 2, -1, 1);
      s = simInteract(l, s, 4, 0, 1);
      return s;
    },
    5: () => {
      const l = getLevelById(5);
      let s = createInitialPuzzleState(l);
      s = simLatch(l, s, -2, 2);
      s = simInteract(l, s, -2, -2, 1);
      s = simInteract(l, s, 2, 2, 1);
      s = simInteract(l, s, 4, 1, 1);
      s = simInteract(l, s, 2, 2, 1);
      s = simInteract(l, s, 8, -1, 1);
      return s;
    },
    6: () => {
      const l = getLevelById(6);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -1, 2, 2);
      s = simInteract(l, s, -2, -3, 2);
      s = simInteract(l, s, 1, 0, 2);
      s = simInteract(l, s, 2, 0, 3);
      return s;
    },
    7: () => {
      const l = getLevelById(7);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -4, 1, 1);
      s = simLatch(l, s, 0, 2);
      s = simInteract(l, s, 1, 0, 1);
      s = simInteract(l, s, 1, -2, 1);
      s = simInteract(l, s, 6, -2, 2);
      s = simInteract(l, s, 7, 1, 1);
      return s;
    },
    8: () => {
      const l = getLevelById(8);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -3, 0, 1);
      s = simLatch(l, s, 1, 2);
      s = simInteract(l, s, -1, 0, 1);
      s = simInteract(l, s, 2, -2, 1);
      s = simLatch(l, s, 8, -2);
      s = simInteract(l, s, 6, 0, 1);
      return s;
    },
    9: () => {
      const l = getLevelById(9);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -3, 1, 1);
      s = simInteract(l, s, -3, -1, 3);
      s = simLatch(l, s, 2, 2);
      s = simInteract(l, s, 2, 0, 3);
      s = simInteract(l, s, 4, -2, 3);
      s = simInteract(l, s, 4, 2, 3);
      s = simInteract(l, s, 2, -2, 1);
      return s;
    },
    10: () => {
      const l = getLevelById(10);
      let s = createInitialPuzzleState(l);
      s = simInteract(l, s, -4, 1, 1);
      s = simLatch(l, s, 2, 2);
      s = simInteract(l, s, 0, 0, 3);
      s = simInteract(l, s, 3, 0, 2);
      s = simInteract(l, s, 1, 1, 1);
      s = simInteract(l, s, 3, 1, 1);
      s = simInteract(l, s, 8, -1, 3);
      s = simInteract(l, s, 9, 2, 1);
      return s;
    },
  };

  for (const lvl of LEVELS.slice(0, 10)) {
    const finalState = optimalRuns[lvl.id]();
    assert.equal(finalState.crystalRestored, true, `Level ${lvl.id} crystal must restore`);
    assert.equal(finalState.portalAwakened, true, `Level ${lvl.id} portal must awaken`);
    const target = getMasteryTargetForLevel(lvl.id);
    assert.ok(
      finalState.interactionsCount <= target.actionTarget,
      `Level ${lvl.id} optimal ACT (${finalState.interactionsCount}) must satisfy actionTarget (${target.actionTarget})`
    );
    const evalResult = evaluateLevelRun(
      lvl.id,
      true,
      target.timeTargetSeconds,
      finalState.interactionsCount
    );
    assert.equal(evalResult.stars, 3);
  }
});

// ============================================================================
// 3. COSMETIC REWARD & MILESTONE TESTS (1–10)
// ============================================================================

test('Cosmetic milestones unlock at exact 6, 12, 18, 24, 30 star thresholds', () => {
  assert.deepEqual(
    COSMETIC_MILESTONES.map((m) => [m.requiredStars, m.cosmeticId]),
    [
      [6, 'mossweave_cloak'],
      [12, 'tideglass_lantern'],
      [18, 'emberglow_lantern'],
      [24, 'celestial_cloak'],
      [30, 'eternal_wayfinder_set'],
    ]
  );

  assert.equal(resolveUnlockedCosmetics(5).includes('mossweave_cloak'), false);
  assert.equal(resolveUnlockedCosmetics(6).includes('mossweave_cloak'), true);
  assert.equal(resolveUnlockedCosmetics(11).includes('tideglass_lantern'), false);
  assert.equal(resolveUnlockedCosmetics(12).includes('tideglass_lantern'), true);
  assert.equal(resolveUnlockedCosmetics(17).includes('emberglow_lantern'), false);
  assert.equal(resolveUnlockedCosmetics(18).includes('emberglow_lantern'), true);
  assert.equal(resolveUnlockedCosmetics(23).includes('celestial_cloak'), false);
  assert.equal(resolveUnlockedCosmetics(24).includes('celestial_cloak'), true);
  assert.equal(resolveUnlockedCosmetics(29).includes('eternal_wayfinder_set'), false);
  assert.equal(resolveUnlockedCosmetics(30).includes('eternal_wayfinder_set'), true);
});

test('Equipping locked cosmetic fails safely and preserves current outfit', () => {
  const unlockedAtZero = resolveUnlockedCosmetics(0);
  assert.equal(canEquipCosmetic('mossweave_cloak', 0, unlockedAtZero), false);

  const attempt = equipCosmeticSelection(
    DEFAULT_EQUIPPED_COSMETICS,
    'mossweave_cloak',
    0,
    unlockedAtZero
  );
  assert.deepEqual(attempt, DEFAULT_EQUIPPED_COSMETICS);

  const progressAttempt = equipCosmeticInProgress(DEFAULT_PROGRESS, 'celestial_cloak');
  assert.deepEqual(progressAttempt.equippedCosmetics, DEFAULT_EQUIPPED_COSMETICS);
});

test('Equipping unlocked cosmetics persists, resolves visual appearance, and restores defaults cleanly', () => {
  // Earn 30 stars across first 10 levels
  let state = DEFAULT_PROGRESS;
  for (const lvl of LEVELS.slice(0, 10)) {
    const t = getMasteryTargetForLevel(lvl.id);
    state = recordLevelCompletion(state, lvl.id, t.timeTargetSeconds - 2, t.actionTarget);
  }
  assert.equal(state.unlockedCosmetics.includes('eternal_wayfinder_set'), true);

  state = equipCosmeticInProgress(state, 'mossweave_cloak');
  state = equipCosmeticInProgress(state, 'tideglass_lantern');
  assert.equal(state.equippedCosmetics.cloakId, 'mossweave_cloak');
  assert.equal(state.equippedCosmetics.lanternId, 'tideglass_lantern');
  assert.equal(state.equippedCosmetics.setId, null);

  const mossAppearance = resolveWayfinderAppearance(state.equippedCosmetics);
  assert.equal(mossAppearance.hasMossBrooch, true);
  assert.equal(mossAppearance.hasEternalAura, false);

  // Equip Eternal Set
  state = equipCosmeticInProgress(state, 'eternal_wayfinder_set');
  assert.equal(state.equippedCosmetics.setId, 'eternal_wayfinder_set');
  const eternalAppearance = resolveWayfinderAppearance(state.equippedCosmetics);
  assert.equal(eternalAppearance.hasEternalAura, true);
  assert.equal(eternalAppearance.hasCelestialTrim, true);

  // Restore defaults keeps unlocked cosmetics & stars intact
  state = restoreDefaultCosmetics(state);
  assert.deepEqual(state.equippedCosmetics, DEFAULT_EQUIPPED_COSMETICS);
  assert.equal(getTotalStars(state.masteryRecords), 30);
  assert.equal(state.unlockedCosmetics.includes('eternal_wayfinder_set'), true);
});

test('Milestones trigger newlyUnlockedMilestones when crossing threshold via completion', () => {
  let state = DEFAULT_PROGRESS;
  const t1 = getMasteryTargetForLevel(1);
  const res1 = recordLevelCompletionDetailed(state, 1, t1.timeTargetSeconds - 1, t1.actionTarget);
  assert.equal(res1.summary.newlyUnlockedMilestones.length, 0);
  state = res1.progress;

  const t2 = getMasteryTargetForLevel(2);
  const res2 = recordLevelCompletionDetailed(state, 2, t2.timeTargetSeconds - 1, t2.actionTarget);
  assert.equal(res2.summary.totalStarsAfter, 6);
  assert.deepEqual(
    res2.summary.newlyUnlockedMilestones.map((m) => m.cosmeticId),
    ['mossweave_cloak']
  );
});

// ============================================================================
// 4. SAVE MIGRATION, CORRUPTION PROTECTION & STATISTICS TESTS
// ============================================================================

test('Legacy save migration preserves progress without fabricating historical stars or actions', () => {
  const legacySave = {
    completedLevels: [1, 2, 3],
    highestUnlockedLevel: 3,
    bestTimes: { 1: 12.5, 2: 24.0, 3: 45.0 },
    settings: { soundEnabled: false, volume: 0.4, cameraZoomOffset: 0.1 },
  };

  const migrated = validateSaveProgress(legacySave);
  assert.deepEqual(migrated.completedLevels, [1, 2, 3]);
  assert.equal(migrated.highestUnlockedLevel, 4);
  assert.deepEqual(migrated.bestTimes, { 1: 12.5, 2: 24.0, 3: 45.0 });
  assert.equal(migrated.settings.soundEnabled, false);

  // Must NOT invent historical stars or action counts!
  assert.equal(getTotalStars(migrated.masteryRecords), 0);
  assert.equal(migrated.masteryRecords[1]?.completed, true);
  assert.equal(migrated.masteryRecords[1]?.bestStars, 0);
  assert.equal(migrated.masteryRecords[1]?.bestActions, undefined);
  assert.equal(migrated.masteryRecords[1]?.bestTime, 12.5);
  assert.equal(migrated.unlockedCosmetics.includes('mossweave_cloak'), false);

  // Repeated migration is strictly idempotent
  const migratedTwice = validateSaveProgress(migrated);
  assert.deepEqual(migratedTwice, migrated);
});

test('Corrupted or tampered save data clamps impossible values and blocks unearned cosmetics', () => {
  const tampered = validateSaveProgress({
    completedLevels: [1, 99, 'bad', 1],
    highestUnlockedLevel: -10,
    bestTimes: { 1: 10.5, 2: -5 },
    masteryRecords: {
      1: { levelId: 1, completed: true, bestStars: 99, bestTime: -3, bestActions: -2, completions: 2, perfectRuns: 99 },
      4: { levelId: 4, completed: false, bestStars: 3, bestTime: 10, bestActions: 4 },
    },
    unlockedCosmetics: ['default_cloak', 'eternal_wayfinder_set'],
    equippedCosmetics: {
      cloakId: 'celestial_cloak',
      lanternId: 'emberglow_lantern',
      setId: 'eternal_wayfinder_set',
    },
    statistics: {
      totalPlayTimeSeconds: -100,
      totalCompletions: Number.NaN,
      totalAttempts: 4.9,
      totalPerfectRuns: -1,
    },
  });

  assert.deepEqual(tampered.completedLevels, [1]);
  assert.equal(tampered.highestUnlockedLevel, 2);
  assert.equal(tampered.masteryRecords[1]?.bestStars, 3);
  assert.equal(tampered.masteryRecords[1]?.perfectRuns, 2);
  assert.equal(tampered.masteryRecords[4], undefined);
  assert.ok(getTotalStars(tampered.masteryRecords) <= 30);

  // Only 3 stars earned -> locked cosmetics stripped from unlocked & equipped
  assert.equal(tampered.unlockedCosmetics.includes('eternal_wayfinder_set'), false);
  assert.deepEqual(tampered.equippedCosmetics, DEFAULT_EQUIPPED_COSMETICS);

  assert.equal(tampered.statistics.totalPlayTimeSeconds, 0);
  assert.equal(tampered.statistics.totalCompletions, 0);
  assert.equal(tampered.statistics.totalAttempts, 4);
  assert.equal(tampered.statistics.totalPerfectRuns, 0);
});

test('Player statistics compute totals cleanly from valid saved records', () => {
  let state = recordLevelAttempt(DEFAULT_PROGRESS, 1);
  state = recordLevelCompletion(state, 1, 14, 2); // 3★
  state = recordLevelAttempt(state, 2);
  state = recordLevelAttempt(state, 2); // abandoned attempt
  state = recordLevelCompletion(state, 2, 40, 5); // 2★ (missed time target 26s)

  const stats = computePlayerStatistics(state);
  assert.equal(stats.totalStars, 5);
  assert.equal(stats.maxStars, 180);
  assert.equal(stats.completedLevelsCount, 2);
  assert.equal(stats.threeStarLevelsCount, 1);
  assert.equal(stats.remainingStars, 175);
  assert.equal(stats.remainingThreeStarLevels, 59);
  assert.equal(stats.totalAttempts, 3);
  assert.equal(stats.totalCompletions, 2);
  assert.equal(stats.totalPerfectRuns, 1);
  assert.equal(stats.totalPlayTimeSeconds, 54);
});
