import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from './characters';
import {
  appendSessionHistory,
  captureStageCheckpoint,
  getTotalSessionHistoryCount,
  MAX_SESSIONS_PER_STAGE,
  restoreFromCheckpoint,
} from './checkpoints';
import { COSMETIC_ITEMS } from './cosmetics';
import {
  CONVERGENCE_HUB_LEVEL,
  HUB_AREAS,
  HUB_SPAWN,
  HUB_WORLD_PORTALS,
} from './hubLayout';
import { getLevelById, LEVELS } from './levels';
import { NPCS } from './npcs';
import {
  DEFAULT_PROGRESS,
  recordHubAreaVisitedInProgress,
  recordLevelCompletionDetailed,
  recordNpcTalkedInProgress,
  validateSaveProgress,
} from './progression';
import { evaluateAllQuests, getTrackedQuestBannerInfo } from './questEvaluator';
import { QUESTS } from './quests';
import {
  computeRestoredWorlds,
  getHubRestorationTier,
  getWorldRestoredVisualBoost,
} from './restoration';
import {
  canTraverseBetween,
  createInitialPlayerState,
  createInitialPuzzleState,
  executeInteraction,
  findNearestInteraction,
  getSurfaceAtTile,
  isPointWalkable,
} from './rules';
import {
  CURRENT_SAVE_SCHEMA_VERSION,
  exportSavePayload,
  parseAndValidateImport,
} from './saveManager';
import { QuestCategory, TILE_SIZE } from './types';

function computeHubReachableTiles(): Set<string> {
  const state = createInitialPuzzleState(CONVERGENCE_HUB_LEVEL);
  const visited = new Set<string>();
  const queue: Array<[number, number]> = [[HUB_SPAWN.x, HUB_SPAWN.z]];
  visited.add(`${HUB_SPAWN.x},${HUB_SPAWN.z}`);

  const dirs: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const [gx, gz] = queue.shift()!;
    const cur = getSurfaceAtTile(CONVERGENCE_HUB_LEVEL, state, gx, gz);
    if (!cur || !cur.walkable) continue;

    for (const [dx, dz] of dirs) {
      const nx = gx + dx;
      const nz = gz + dz;
      const key = `${nx},${nz}`;
      if (visited.has(key)) continue;
      const next = getSurfaceAtTile(CONVERGENCE_HUB_LEVEL, state, nx, nz);
      if (canTraverseBetween(cur, next)) {
        const midX = (gx + dx * 0.5) * TILE_SIZE;
        const midZ = (gz + dz * 0.5) * TILE_SIZE;
        if (
          isPointWalkable(CONVERGENCE_HUB_LEVEL, state, midX, midZ, gx, gz) ||
          isPointWalkable(CONVERGENCE_HUB_LEVEL, state, midX, midZ, nx, nz)
        ) {
          visited.add(key);
          queue.push([nx, nz]);
        }
      }
    }
  }

  return visited;
}

test('Living Archipelago preserves all 60 stages, 5 heroes, 51 cosmetics, and adds 10 NPCs + 30 quests', () => {
  assert.equal(LEVELS.length, 60);
  assert.equal(CHARACTERS.length, 5);
  assert.equal(COSMETIC_ITEMS.length, 51);
  assert.equal(NPCS.length, 10);
  assert.equal(QUESTS.length, 30);

  const counts = new Map<QuestCategory, number>();
  for (const q of QUESTS) {
    counts.set(q.category, (counts.get(q.category) ?? 0) + 1);
  }
  assert.equal(counts.get('main_story'), 6);
  assert.equal(counts.get('world_restoration'), 6);
  assert.equal(counts.get('hero_story'), 5);
  assert.equal(counts.get('side_quest'), 8);
  assert.equal(counts.get('hidden_secret'), 5);
});

test('The Convergence Hub tiles allow full walkable reachability to all areas, portals, alcove, and NPCs', () => {
  const reachable = computeHubReachableTiles();
  assert.ok(reachable.has(`${HUB_SPAWN.x},${HUB_SPAWN.z}`));

  // Every named Hub area must have at least one reachable walkable tile within radius 1.5 of its center
  for (const area of HUB_AREAS) {
    let found = false;
    for (const key of reachable) {
      const [xStr, zStr] = key.split(',');
      const dist = Math.hypot(Number(xStr) - area.centerX, Number(zStr) - area.centerZ);
      if (dist <= 1.5) {
        found = true;
        break;
      }
    }
    assert.ok(found, `Hub area "${area.name}" (${area.centerX}, ${area.centerZ}) is unreachable from spawn`);
  }

  // Hidden Eastern Alcove exact tile
  assert.ok(reachable.has('9,-1'), 'Forgotten Eastern Alcove (9, -1) must be reachable from HUB_SPAWN');

  // All 6 World Portals must be reachable
  for (const portal of HUB_WORLD_PORTALS) {
    assert.ok(
      reachable.has(`${portal.x},${portal.z}`),
      `World portal ${portal.worldId} at (${portal.x}, ${portal.z}) is unreachable`
    );
  }

  // Every NPC must have at least one reachable adjacent/standing tile within interaction distance
  for (const npc of NPCS) {
    let nearNpc = false;
    for (const key of reachable) {
      const [xStr, zStr] = key.split(',');
      const dist = Math.hypot(Number(xStr) - npc.hubX, Number(zStr) - npc.hubZ);
      if (dist <= 1.1) {
        nearNpc = true;
        break;
      }
    }
    assert.ok(nearNpc, `NPC ${npc.name} at (${npc.hubX}, ${npc.hubZ}) has no reachable adjacent tile`);
  }
});

test('Legacy v1 and v2 save files migrate losslessly to Schema v3 without fabricating stars', () => {
  const v1Migrated = validateSaveProgress({
    completedLevels: [1, 2, 3],
    highestUnlockedLevel: 3,
    bestTimes: { 1: 11.4, 2: 24.0, 3: 39.2 },
    lumaShards: 12,
  });

  assert.equal(v1Migrated.saveVersion, CURRENT_SAVE_SCHEMA_VERSION);
  assert.deepEqual(v1Migrated.completedLevels, [1, 2, 3]);
  assert.equal(v1Migrated.highestUnlockedLevel, 4);
  assert.equal(v1Migrated.masteryRecords[1]?.bestStars, 0);
  assert.equal(v1Migrated.masteryRecords[1]?.bestActions, undefined);
  assert.ok((v1Migrated.lumaShards ?? 0) >= 12);

  // World 1..10 completion restores World 1 cleanly upon migration
  const v2World1 = validateSaveProgress({
    saveVersion: 2,
    completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    highestUnlockedLevel: 11,
  });
  assert.ok(computeRestoredWorlds(v2World1).includes('world_1'));
  assert.equal(getHubRestorationTier(v2World1), 'awakening');
});

test('Quest evaluation and one-time rewards are strictly idempotent across re-validation', () => {
  let sim = validateSaveProgress(DEFAULT_PROGRESS);
  sim = recordNpcTalkedInProgress(sim, 'orin');
  sim = recordLevelCompletionDetailed(sim, 1, 12, 2).progress;
  sim = recordHubAreaVisitedInProgress(sim, 'central_sanctuary');
  sim = recordHubAreaVisitedInProgress(sim, 'npc_district');

  assert.equal(sim.questProgress?.quest_main_1?.completed, true);
  assert.equal(sim.questProgress?.quest_main_1?.rewardClaimed, true);
  const shardsAfterFirst = sim.lumaShards ?? 0;
  assert.ok(shardsAfterFirst > 0);
  assert.ok((sim.unlockedTitles ?? []).includes('Pilgrim of First Light'));

  // Re-validating and re-evaluating must NOT double-grant Shards or Titles
  const revalidated = validateSaveProgress(sim);
  const secondEval = evaluateAllQuests(revalidated);
  assert.equal(revalidated.lumaShards, shardsAfterFirst);
  assert.equal(secondEval.shardsAwarded, 0);
  assert.equal(secondEval.newlyCompletedQuestIds.length, 0);

  const banner = getTrackedQuestBannerInfo(revalidated);
  assert.ok(banner === null || banner.quest.id !== 'quest_main_1');
});

test('Stage checkpoints capture puzzle/player state and reconstruct derived light & walkability cleanly', () => {
  const lvl = getLevelById(3);
  let state = createInitialPuzzleState(lvl);
  let player = createInitialPlayerState(lvl);

  // Interact with first switch/prism on stage 3 so state differs from initial
  for (const sw of lvl.pressureSwitches) {
    player.x = sw.x * TILE_SIZE;
    player.z = sw.z * TILE_SIZE;
    const target = findNearestInteraction(lvl, state, player);
    if (target) {
      state = executeInteraction(lvl, state, target);
    }
  }
  state.elapsedSeconds = 27.45;
  state.interactionsCount = 3;

  const checkpoint = captureStageCheckpoint(3, player, state, 5, 1700000000000);
  const restored = restoreFromCheckpoint(lvl, checkpoint, 'wayfinder');

  assert.equal(restored.bonusShardsInRun, 5);
  assert.equal(restored.puzzleState.elapsedSeconds, 27.45);
  assert.equal(restored.puzzleState.interactionsCount, 3);
  assert.deepEqual(restored.puzzleState.switchStates, state.switchStates);
  assert.deepEqual(restored.puzzleState.prismDirections, state.prismDirections);
  assert.equal(restored.puzzleState.lightSegments.length, state.lightSegments.length);
  assert.equal(Number(restored.playerState.x.toFixed(3)), Number(player.x.toFixed(3)));
  assert.equal(Number(restored.playerState.z.toFixed(3)), Number(player.z.toFixed(3)));
});

test('Session history caps at 5 records per stage and victory clears active checkpoint', () => {
  let hist = appendSessionHistory(undefined, {
    id: 's1',
    levelId: 2,
    characterId: 'wayfinder',
    outcome: 'abandoned',
    clearSeconds: 5,
    actionsUsed: 1,
    starsEarned: 0,
    echoCollected: false,
    timestamp: 100,
  });

  for (let i = 0; i < 8; i++) {
    hist = appendSessionHistory(hist, {
      id: `s_${i}`,
      levelId: 2,
      characterId: 'wayfinder',
      outcome: 'completed',
      clearSeconds: 15 + i,
      actionsUsed: 2,
      starsEarned: 3,
      echoCollected: false,
      timestamp: 200 + i,
    });
  }

  assert.equal(hist[2].length, MAX_SESSIONS_PER_STAGE);
  assert.equal(getTotalSessionHistoryCount(hist), MAX_SESSIONS_PER_STAGE);

  const l1 = getLevelById(1);
  const cp = captureStageCheckpoint(1, createInitialPlayerState(l1), createInitialPuzzleState(l1), 0);
  const withCp = validateSaveProgress({
    ...DEFAULT_PROGRESS,
    checkpoints: { 1: cp },
  });
  assert.ok(withCp.checkpoints?.[1]);

  const completed = recordLevelCompletionDetailed(withCp, 1, 10, 2).progress;
  assert.equal(completed.checkpoints?.[1], undefined);
  assert.ok((completed.sessionHistory?.[1]?.length ?? 0) >= 1);
});

test('World Restoration tiers and Export/Import envelope validation work deterministically', () => {
  let prog = validateSaveProgress(DEFAULT_PROGRESS);
  assert.equal(getHubRestorationTier(prog), 'dormant');

  // Complete Worlds 1-4 -> Hub reaches 'restored'
  const w1to4 = Array.from({ length: 40 }, (_, i) => i + 1);
  prog = validateSaveProgress({
    ...prog,
    completedLevels: w1to4,
    highestUnlockedLevel: 41,
  });
  assert.equal(computeRestoredWorlds(prog).length, 4);
  assert.equal(getHubRestorationTier(prog), 'restored');
  assert.ok(getWorldRestoredVisualBoost('world_1', true).emissiveMult > 1);

  const exported = exportSavePayload(prog, validateSaveProgress);
  const parsed = parseAndValidateImport(exported, validateSaveProgress);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.summary.completedCount, 40);
    assert.equal(parsed.summary.restoredWorldsCount, 4);
    assert.equal(parsed.summary.schemaVersion, CURRENT_SAVE_SCHEMA_VERSION);
  }

  const badSyntax = parseAndValidateImport('{broken', validateSaveProgress);
  assert.equal(badSyntax.ok, false);

  const wrongApp = parseAndValidateImport(
    JSON.stringify({ app: 'Other Game', data: { completedLevels: [1] } }),
    validateSaveProgress
  );
  assert.equal(wrongApp.ok, false);
});
