import { getCharacterById } from './characters';
import { QUESTS } from './quests';
import { computeRestoredWorlds, isWorldStagesComplete } from './restoration';
import {
  QuestDef,
  QuestProgressRecord,
  QuestStepDef,
  SaveProgress,
} from './types';

function isStepSatisfied(step: QuestStepDef, progress: SaveProgress): boolean {
  const completedSet = new Set(progress.completedLevels);
  const echoSet = new Set(progress.collectedEchoFragments ?? []);
  const talkedSet = new Set(progress.npcTalkedIds ?? []);
  const visitedSet = new Set(progress.visitedHubAreas ?? []);
  const unlockedHeroes = new Set(progress.unlockedCharacters ?? ['wayfinder']);
  const totalEarnedShards = (progress.lumaShards ?? 0) + (progress.spentLumaShards ?? 0);

  switch (step.kind) {
    case 'talk_npc':
      return Boolean(step.targetId && talkedSet.has(step.targetId as never));
    case 'visit_hub_area':
      return Boolean(step.targetId && visitedSet.has(step.targetId as never));
    case 'complete_stage':
      return Boolean(step.targetNumber && completedSet.has(step.targetNumber));
    case 'complete_stages_count':
      return progress.completedLevels.length >= (step.targetNumber ?? 1);
    case 'collect_echo':
      return Boolean(step.targetId && echoSet.has(step.targetId));
    case 'collect_echoes_count':
      return echoSet.size >= (step.targetNumber ?? 1);
    case 'collect_shards_total':
      return totalEarnedShards >= (step.targetNumber ?? 1);
    case 'use_ability':
      return (progress.abilityUsageCount ?? 0) >= (step.targetNumber ?? 1);
    case 'activate_hero_node':
      return (progress.heroNodesResonatedCount ?? 0) >= (step.targetNumber ?? 1);
    case 'interact_mechanisms_count':
      return (progress.mechanismsActivatedCount ?? 0) >= (step.targetNumber ?? 1);
    case 'restore_world':
      return Boolean(
        step.worldId && computeRestoredWorlds(progress).includes(step.worldId)
      );
    case 'unlock_hero':
      return Boolean(step.heroId && unlockedHeroes.has(step.heroId));
    case 'complete_world':
      return Boolean(
        step.worldId && isWorldStagesComplete(step.worldId, progress.completedLevels)
      );
  }
}

function isQuestAvailable(
  quest: QuestDef,
  progress: SaveProgress,
  existingRecords: Record<string, QuestProgressRecord>
): boolean {
  if (quest.hiddenUntilDiscovered) {
    return false;
  }
  if (quest.requiredCompletedStages && progress.completedLevels.length < quest.requiredCompletedStages) {
    return false;
  }
  if (
    quest.requiredUnlockedHeroId &&
    !(progress.unlockedCharacters ?? ['wayfinder']).includes(quest.requiredUnlockedHeroId)
  ) {
    return false;
  }
  if (quest.prerequisiteQuestIds) {
    for (const prereq of quest.prerequisiteQuestIds) {
      if (!existingRecords[prereq]?.completed) return false;
    }
  }
  return true;
}

export interface QuestEvaluationDelta {
  questProgress: Record<string, QuestProgressRecord>;
  newlyCompletedQuestIds: string[];
  newlyDiscoveredQuestIds: string[];
  shardsAwarded: number;
  newlyUnlockedTitles: string[];
  restoredWorlds: SaveProgress['restoredWorlds'];
  trackedQuestId: string | null;
}

export function evaluateAllQuests(progress: SaveProgress): QuestEvaluationDelta {
  const prevMap = progress.questProgress ?? {};
  const nextMap: Record<string, QuestProgressRecord> = {};
  const newlyCompletedQuestIds: string[] = [];
  const newlyDiscoveredQuestIds: string[] = [];
  let shardsAwarded = 0;
  const titleSet = new Set<string>(progress.unlockedTitles ?? []);
  const newlyUnlockedTitles: string[] = [];

  // Process sequentially so prerequisite chains resolve cleanly in one pass
  for (const quest of QUESTS) {
    const prevRec = prevMap[quest.id];
    const completedSteps = quest.steps
      .filter((step) => isStepSatisfied(step, progress))
      .map((step) => step.id);
    const allStepsDone = completedSteps.length === quest.steps.length;

    const alreadyCompleted = Boolean(prevRec?.completed);
    const alreadyRewardClaimed = Boolean(prevRec?.rewardClaimed);

    const available = isQuestAvailable(quest, progress, nextMap);
    const discovered = Boolean(
      prevRec?.discovered ||
        available ||
        (quest.hiddenUntilDiscovered && (completedSteps.length > 0 || allStepsDone))
    );
    const started = Boolean(prevRec?.started || discovered || completedSteps.length > 0);
    const completed = Boolean(alreadyCompleted || allStepsDone);

    if (discovered && !prevRec?.discovered && quest.hiddenUntilDiscovered) {
      newlyDiscoveredQuestIds.push(quest.id);
    }

    let rewardClaimed = alreadyRewardClaimed;
    let claimedAt = prevRec?.claimedAt;

    if (completed && !alreadyRewardClaimed) {
      rewardClaimed = true;
      claimedAt = Date.now();
      newlyCompletedQuestIds.push(quest.id);
      if (quest.reward.lumaShards && quest.reward.lumaShards > 0) {
        shardsAwarded += quest.reward.lumaShards;
      }
      if (quest.reward.titleUnlock && !titleSet.has(quest.reward.titleUnlock)) {
        titleSet.add(quest.reward.titleUnlock);
        newlyUnlockedTitles.push(quest.reward.titleUnlock);
      }
    }

    nextMap[quest.id] = {
      questId: quest.id,
      discovered,
      started,
      completed,
      rewardClaimed,
      completedSteps,
      ...(claimedAt ? { claimedAt } : {}),
    };
  }

  // Reconcile restoredWorlds deterministically
  const restoredSet = new Set(computeRestoredWorlds({ ...progress, questProgress: nextMap }));
  const restoredWorlds = Array.from(restoredSet);

  // Pick / keep sensible trackedQuestId
  let trackedQuestId = progress.trackedQuestId ?? null;
  if (trackedQuestId) {
    const trackedRec = nextMap[trackedQuestId];
    if (!trackedRec || !trackedRec.discovered || trackedRec.completed) {
      trackedQuestId = null;
    }
  }
  if (!trackedQuestId) {
    const nextActive = QUESTS.find((q) => {
      const rec = nextMap[q.id];
      return rec && rec.discovered && !rec.completed;
    });
    trackedQuestId = nextActive ? nextActive.id : null;
  }

  return {
    questProgress: nextMap,
    newlyCompletedQuestIds,
    newlyDiscoveredQuestIds,
    shardsAwarded,
    newlyUnlockedTitles,
    restoredWorlds,
    trackedQuestId,
  };
}

export function getQuestStepProgressSummary(
  quest: QuestDef,
  record: QuestProgressRecord | undefined
): { done: number; total: number; nextStep: QuestStepDef | null } {
  const doneSet = new Set(record?.completedSteps ?? []);
  const nextStep = quest.steps.find((s) => !doneSet.has(s.id)) ?? null;
  return {
    done: doneSet.size,
    total: quest.steps.length,
    nextStep,
  };
}

export function getTrackedQuestBannerInfo(progress: SaveProgress): {
  quest: QuestDef;
  stepText: string;
  waypointLabel?: string;
} | null {
  const trackedId = progress.trackedQuestId;
  if (!trackedId) return null;
  const quest = QUESTS.find((q) => q.id === trackedId);
  if (!quest) return null;
  const rec = progress.questProgress?.[quest.id];
  if (!rec || !rec.discovered || rec.completed) return null;
  const { done, total, nextStep } = getQuestStepProgressSummary(quest, rec);
  const heroHint = quest.heroId ? ` (${getCharacterById(quest.heroId).name})` : '';
  return {
    quest,
    stepText: nextStep ? `${nextStep.description} (${done}/${total})` : `${quest.title}${heroHint}`,
    waypointLabel: nextStep?.waypointLabel,
  };
}
