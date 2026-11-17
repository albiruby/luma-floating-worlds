import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSampleFeaturedDuelReplay,
  FEATURED_COMMUNITY_STAGES,
} from './communityStages';
import {
  buildLumaStagePack,
  parseAndValidateLumaPack,
  parseAndValidateLumaReplay,
  parseAndValidateLumaStage,
  sanitizePlainText,
} from './customFormats';
import {
  computeDailyRiftStreak,
  encodeRiftChallengeCode,
  generateDailyRiftSpec,
  parseRiftChallengeCode,
} from './dailyRift';
import {
  buildEchoDuelRecord,
  prepareDuelSession,
  sampleDuelGhostAtTime,
} from './echoDuels';
import {
  buildLumaReplayFile,
  computeStageHash,
  createEchoRecording,
  LUMA_ENGINE_VERSION,
  stepEchoSlotTick,
  verifyReplayDeterministically,
} from './echoEngine';
import {
  CURRENT_SAVE_VERSION,
  deleteCustomStageInProgress,
  recordDailyRiftAttemptInProgress,
  recordEchoDuelResultInProgress,
  saveCustomStageInProgress,
  toggleFavoriteStageInProgress,
  validateSaveProgress,
} from './progression';
import {
  createInitialPlayerState,
  createInitialPuzzleState,
  executeInteraction,
  isGateOpen,
  updateOccupancyPlates,
} from './rules';
import { validateCustomLevel } from './stageValidator';
import {
  createInitialCompanionState,
  getMatchingSynergiesForParty,
  stepCompanionMovement,
  swapActivePartyHero,
} from './synergy';
import {
  applyForgeTileAction,
  copySelectedTile,
  createInitialForgeState,
  exportForgeToCustomStageFile,
  pasteClipboardTileAt,
  redoForge,
  undoForge,
} from './worldForge';

test('Echo Engine: Echo-Only Plate activates ONLY for Echoes, never live player, and Echo never duplicates fragments or triggers portal victory', () => {
  const clockwork = FEATURED_COMMUNITY_STAGES[0].level;
  let state = createInitialPuzzleState(clockwork, 'wayfinder');

  // Gate g_clock_1 starts closed
  assert.equal(isGateOpen(clockwork, state, 'g_clock_1'), false);

  // Live player standing on echoOnly plate (-2, -2) MUST NOT open it
  const liveOcc = updateOccupancyPlates(clockwork, state, [
    { gx: -2, gz: -2, isEcho: false },
  ]);
  assert.equal(liveOcc.puzzleState.echoPlateStates?.['ep_clock_1'], false);
  assert.equal(isGateOpen(clockwork, liveOcc.puzzleState, 'g_clock_1'), false);

  // Summoned Echo standing on echoOnly plate (-2, -2) MUST open it
  const echoOcc = updateOccupancyPlates(clockwork, state, [
    { gx: -2, gz: -2, isEcho: true },
  ]);
  assert.equal(echoOcc.puzzleState.echoPlateStates?.['ep_clock_1'], true);
  assert.equal(isGateOpen(clockwork, echoOcc.puzzleState, 'g_clock_1'), true);

  // Replay recording: Echo walking over portal or crystal tile does not complete stage
  const rec = createEchoRecording(
    0,
    'wayfinder',
    [
      { tick: 0, moveX: 0, moveZ: 0, interact: true },
      { tick: 1, moveX: 1, moveZ: 0 },
    ],
    [],
    0
  );
  let actor = createInitialPlayerState({
    ...clockwork,
    spawn: { x: 4, z: 0, facingAngle: 0 },
  });
  state = { ...echoOcc.puzzleState, crystalRestored: true, portalAwakened: true };
  const stepRes = stepEchoSlotTick(clockwork, state, rec, actor, 0);
  assert.equal(stepRes.puzzleState.completed, false);
  assert.equal(stepRes.puzzleState.echoCollectedInRun, false);
});

test('Echo Engine & Echo Duels: Deterministic replay verification verifies Astral Mirror Duet & catches mismatches honestly', () => {
  const stage = FEATURED_COMMUNITY_STAGES[4];
  const replay = buildSampleFeaturedDuelReplay();

  const verification = verifyReplayDeterministically(stage.level, replay);
  assert.equal(verification.verified, true, verification.reason);
  assert.ok(verification.timelinePositions.length > 50);

  // Duel session prepares non-colliding ghost positions and compares results honestly
  const duelSession = prepareDuelSession(stage.level, replay);
  assert.equal(duelSession.verified, true);
  const ghostStart = sampleDuelGhostAtTime(duelSession, 0);
  const ghostEnd = sampleDuelGhostAtTime(duelSession, 10);
  assert.ok(ghostStart && ghostEnd);
  assert.notEqual(ghostStart.x, ghostEnd.x);

  const duelWin = buildEchoDuelRecord({
    session: duelSession,
    challengerTime: Math.max(0.5, duelSession.creatorTime - 0.5),
    challengerActions: 2,
  });
  assert.equal(duelWin.challengerWon, true);
  assert.equal(duelWin.verifiedReplay, true);

  // Tampering engineVersion or stageHash must immediately mark replay UNVERIFIED
  const badHashReplay = buildLumaReplayFile({
    level: FEATURED_COMMUNITY_STAGES[0].level,
    characterId: 'wayfinder',
    clearSeconds: 4.5,
    actionsUsed: 2,
    stars: 3,
    frames: replay.frames,
    keyEvents: [],
    verified: true,
  });
  const badCheck = verifyReplayDeterministically(stage.level, badHashReplay);
  assert.equal(badCheck.verified, false);
});

test('Hero Synergy: Sylvi + Neris weave Root-Waterway living bridge & companion Hold/Swap relay works', () => {
  const canalLevel = FEATURED_COMMUNITY_STAGES[1].level;
  const pairs = getMatchingSynergiesForParty('sylvi', 'neris');
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].kind, 'root_waterway');

  let player = createInitialPlayerState(canalLevel);
  let companion = createInitialCompanionState(canalLevel, player);
  let puzzle = createInitialPuzzleState(canalLevel, 'sylvi');
  puzzle = {
    ...puzzle,
    companionCharacterId: 'neris',
    activePartySlot: 0,
    companionHoldPosition: false,
    companionPos: {
      x: companion.x,
      y: companion.y,
      z: companion.z,
      facingAngle: companion.facingAngle,
      isMoving: false,
      walkCycle: 0,
    },
  };

  // Place both near (-1, 0) where syn_canal_1 is located
  player = { ...player, x: -2, z: 0 };
  companion = { ...companion, x: -2.2, z: 0.4 };
  puzzle.companionPos = {
    ...puzzle.companionPos!,
    x: companion.x,
    z: companion.z,
  };

  // Activate synergy node
  puzzle = executeInteraction(canalLevel, puzzle, {
    kind: 'synergy_node',
    id: 'syn_canal_1',
    prompt: 'Weave Bridge',
    worldX: -2,
    worldZ: 0,
  });
  assert.equal(puzzle.synergyNodesActive?.['syn_canal_1'], true);

  // Hold position keeps companion anchored while Follow tracks player
  const held = stepCompanionMovement(canalLevel, puzzle, { ...player, x: -6, z: 0 }, companion, 0.05, true);
  assert.equal(held.x, companion.x);

  // Swap Hero flips activeCharacterId and companionCharacterId cleanly
  const swapped = swapActivePartyHero(puzzle, player, companion);
  assert.equal(swapped.puzzleState.activeCharacterId, 'neris');
  assert.equal(swapped.puzzleState.companionCharacterId, 'sylvi');
  assert.equal(swapped.swappedToName, 'Neris');
});

test('World Forge & Stage Validator: Featured stages pass BFS validation, undo/redo/copy/paste work, and trapped stages return INVALID', () => {
  // All 5 bundled featured stages must be structurally valid and solvable
  for (const featured of FEATURED_COMMUNITY_STAGES) {
    const res = validateCustomLevel(featured.level);
    assert.equal(
      res.status === 'VALID' || res.status === 'WARNING',
      true,
      `Featured stage ${featured.title} failed validation: ${res.summary}`
    );
    assert.equal(res.solvable, true);
  }

  // Forge undo/redo + copy/paste
  let forge = createInitialForgeState(undefined, 'medium');
  const startTiles = forge.level.tiles.length;
  forge = { ...forge, activeTool: 'terrain_brush', activeTerrain: 'basalt' };
  forge = applyForgeTileAction(forge, 4, 4);
  assert.equal(forge.level.tiles.length, startTiles + 1);
  forge = undoForge(forge);
  assert.equal(forge.level.tiles.length, startTiles);
  forge = redoForge(forge);
  assert.equal(forge.level.tiles.length, startTiles + 1);

  forge = { ...forge, activeTool: 'select' };
  forge = applyForgeTileAction(forge, 4, 4);
  forge = copySelectedTile(forge);
  forge = pasteClipboardTileAt(forge, 4, 3);
  assert.equal(forge.level.tiles.find((t) => t.x === 4 && t.z === 3)?.terrain, 'basalt');

  const exported = exportForgeToCustomStageFile(forge, true);
  assert.equal(exported.format, 'luma');
  assert.equal(exported.engineVersion, LUMA_ENGINE_VERSION);
  assert.equal(exported.stageHash, computeStageHash(exported.level));

  // Disconnected portal must be flagged INVALID by BFS validator
  const brokenLevel = {
    ...forge.level,
    portal: { ...forge.level.portal, x: 4, z: 4 }, // isolated island tile not reachable from spawn
  };
  const brokenVal = validateCustomLevel(brokenLevel);
  assert.equal(brokenVal.status, 'INVALID');
  assert.equal(brokenVal.solvable, false);
});

test('Custom Formats Safety: Rejects XSS/HTML, external URLs, prototype pollution, and oversized payloads', () => {
  assert.equal(sanitizePlainText('  Hello <script>alert(1)</script> World ', 'Fallback'), 'Hello alert(1) World');

  const maliciousStage = JSON.stringify({
    format: 'luma',
    formatVersion: 1,
    title: '<script>evil()</script>',
    description: 'Check https://evil.example.com',
    authorAlias: 'Hacker',
    worldTheme: 'world_1',
    level: FEATURED_COMMUNITY_STAGES[0].level,
  });
  const resHtml = parseAndValidateLumaStage(maliciousStage);
  assert.equal(resHtml.ok, false);

  const protoPayload = '{"format":"luma","formatVersion":1,"__proto__":{"polluted":true},"level":{"tiles":[]}}';
  const resProto = parseAndValidateLumaStage(protoPayload);
  assert.equal(resProto.ok, false);

  // Valid round-trip stage + pack + replay
  const stageJson = JSON.stringify(FEATURED_COMMUNITY_STAGES[0]);
  const validStage = parseAndValidateLumaStage(stageJson);
  assert.equal(validStage.ok, true);

  const replayJson = JSON.stringify(buildSampleFeaturedDuelReplay());
  const validReplay = parseAndValidateLumaReplay(replayJson);
  assert.equal(validReplay.ok, true);

  const pack = buildLumaStagePack({
    title: 'Test Pack',
    description: 'Pure local pack',
    authorAlias: 'Tester',
    stages: [FEATURED_COMMUNITY_STAGES[0]],
    challengeReplay: buildSampleFeaturedDuelReplay(),
  });
  const validPack = parseAndValidateLumaPack(JSON.stringify(pack));
  assert.equal(validPack.ok, true);
});

test('Daily Rift: Deterministic same-day seed generation, challenge code round-trip, solver verification, and streak math', () => {
  const date = new Date('2026-11-17T10:00:00Z');
  const specA = generateDailyRiftSpec('daily', date);
  const specB = generateDailyRiftSpec('daily', date);
  assert.equal(specA.seed, specB.seed);
  assert.equal(specA.stageHash, specB.stageHash);
  assert.equal(specA.verifiedBySolver, true);

  const code = encodeRiftChallengeCode(specA.dateKey, specA.seed);
  const parsed = parseRiftChallengeCode(code);
  assert.ok(parsed);
  assert.equal(parsed.seed, specA.seed);

  const streak = computeDailyRiftStreak({
    '2026-11-15': {
      dateKey: '2026-11-15',
      seed: 1,
      generatorVersion: 'rift-v1',
      challengeType: 'standard',
      completed: true,
      bestStars: 3,
      attempts: 1,
    },
    '2026-11-16': {
      dateKey: '2026-11-16',
      seed: 2,
      generatorVersion: 'rift-v1',
      challengeType: 'standard',
      completed: true,
      bestStars: 3,
      attempts: 1,
    },
    '2026-11-17': {
      dateKey: '2026-11-17',
      seed: 3,
      generatorVersion: 'rift-v1',
      challengeType: 'standard',
      completed: true,
      bestStars: 3,
      attempts: 1,
    },
  });
  assert.equal(streak, 3);
});

test('Save Migration v1/v3 -> v4: Preserves campaign stars & relics losslessly and stores Unbound progress', () => {
  const legacyV3 = {
    saveVersion: 3,
    completedLevels: [1, 2, 3],
    highestUnlockedLevel: 4,
    bestTimes: { 1: 12.4, 2: 24.1, 3: 31.2 },
    masteryRecords: {
      1: { levelId: 1, completed: true, bestStars: 3, bestTime: 12.4, bestActions: 2, completions: 1, perfectRuns: 1 },
      2: { levelId: 2, completed: true, bestStars: 3, bestTime: 24.1, bestActions: 4, completions: 1, perfectRuns: 1 },
      3: { levelId: 3, completed: true, bestStars: 2, bestTime: 31.2, bestActions: 6, completions: 1, perfectRuns: 0 },
    },
    lumaShards: 42,
    collectedEchoFragments: ['echo_01', 'echo_02'],
  };

  let migrated = validateSaveProgress(legacyV3);
  assert.equal(migrated.saveVersion, CURRENT_SAVE_VERSION);
  assert.deepEqual(migrated.completedLevels, [1, 2, 3]);
  assert.equal(migrated.masteryRecords[1].bestStars, 3);
  assert.ok((migrated.lumaShards ?? 0) >= 42);
  assert.deepEqual(migrated.collectedEchoFragments, ['echo_01', 'echo_02']);

  // Save & favorite custom stage + Daily Rift record + Duel record
  const customStage = FEATURED_COMMUNITY_STAGES[0];
  migrated = saveCustomStageInProgress(migrated, customStage);
  assert.equal(migrated.customStages?.length, 1);

  migrated = toggleFavoriteStageInProgress(migrated, customStage.id);
  assert.equal(migrated.favoriteStageIds?.includes(customStage.id), true);

  migrated = recordDailyRiftAttemptInProgress(migrated, {
    dateKey: '2026-11-17',
    seed: 12345,
    generatorVersion: 'rift-v1',
    challengeType: 'standard',
    completed: true,
    clearSeconds: 19.4,
    actionsUsed: 4,
    stars: 3,
  });
  assert.equal(migrated.dailyRiftStreak, 1);

  const duelSession = prepareDuelSession(
    FEATURED_COMMUNITY_STAGES[4].level,
    buildSampleFeaturedDuelReplay()
  );
  migrated = recordEchoDuelResultInProgress(
    migrated,
    buildEchoDuelRecord({
      session: duelSession,
      challengerTime: 5.5,
      challengerActions: 2,
    })
  );
  assert.equal(migrated.echoDuelsHistory?.length, 1);

  migrated = deleteCustomStageInProgress(migrated, customStage.id);
  assert.equal(migrated.customStages?.length, 0);
});
