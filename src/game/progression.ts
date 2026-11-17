import {
  ACHIEVEMENTS,
  evaluateUnlockedAchievements,
  getNewlyUnlockedAchievements,
} from './achievements';
import {
  getCharacterById,
  getNewlyUnlockedCharacters,
  resolveUnlockedCharacters,
} from './characters';
import {
  appendSessionHistory,
  sanitizeCheckpoints,
  sanitizeSessionHistory,
} from './checkpoints';
import {
  COSMETIC_ITEMS,
  DEFAULT_EQUIPPED_COSMETICS,
  equipCosmeticSelection,
  getCosmeticById,
  getNewlyUnlockedMilestones,
  isCosmeticUnlocked,
  resolveUnlockedCosmetics,
} from './cosmetics';
import { LEVELS } from './levels';
import { evaluateLevelRun, getTotalStars } from './mastery';
import { NPCS } from './npcs';
import { evaluateAllQuests } from './questEvaluator';
import { QUESTS } from './quests';
import { computeRestoredWorlds } from './restoration';
import {
  readSaveWithRecovery,
  SaveReadResult,
  SaveWriteResult,
  writeSaveAtomic,
} from './saveManager';
import { computeDailyRiftStreak } from './dailyRift';
import {
  parseAndValidateLumaPack,
  parseAndValidateLumaReplay,
  parseAndValidateLumaStage,
} from './customFormats';
import {
  CharacterId,
  CompletionSummary,
  CosmeticId,
  DailyChallengeType,
  DailyRiftRecord,
  EchoDuelRecord,
  EquippedCosmetics,
  GameSettings,
  HubAreaId,
  LevelMasteryRecord,
  LumaCustomStageFile,
  LumaReplayFile,
  LumaStagePackFile,
  NpcId,
  PersistentStatistics,
  QuestProgressRecord,
  SaveProgress,
  StageCheckpoint,
  WorldId,
} from './types';
import { WORLDS } from './worlds';

export const STORAGE_KEY = 'luma_floating_worlds_save_v1';
export const CURRENT_SAVE_VERSION = 4;

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  volume: 0.65,
  cameraZoomOffset: 0,
};

export const DEFAULT_STATISTICS: PersistentStatistics = {
  totalPlayTimeSeconds: 0,
  totalCompletions: 0,
  totalAttempts: 0,
  totalPerfectRuns: 0,
};

const VALID_NPC_IDS = new Set<NpcId>(NPCS.map((n) => n.id));
const VALID_HUB_AREAS = new Set<HubAreaId>([
  'central_sanctuary',
  'world_portals',
  'hero_sanctum',
  'wardrobe_station',
  'echo_archive',
  'reward_gallery',
  'quest_board',
  'npc_district',
  'hidden_alcove',
]);
const VALID_WORLD_IDS = new Set<WorldId>(WORLDS.map((w) => w.id));
const VALID_QUEST_IDS = new Set<string>(QUESTS.map((q) => q.id));

export const DEFAULT_PROGRESS: SaveProgress = {
  saveVersion: CURRENT_SAVE_VERSION,
  completedLevels: [],
  highestUnlockedLevel: 1,
  bestTimes: {},
  masteryRecords: {},
  unlockedCosmetics: [
    'default_cloak',
    'default_lantern',
    'none_headwear',
    'none_backpack',
    'none_aura',
    'palette_pilgrim_classic',
  ],
  purchasedCosmetics: [],
  equippedCosmetics: { ...DEFAULT_EQUIPPED_COSMETICS },
  selectedCharacterId: 'wayfinder',
  unlockedCharacters: ['wayfinder'],
  equippedByCharacter: { wayfinder: { ...DEFAULT_EQUIPPED_COSMETICS } },
  collectedEchoFragments: [],
  lumaShards: 0,
  spentLumaShards: 0,
  unlockedAchievements: [],
  statistics: { ...DEFAULT_STATISTICS },
  settings: { ...DEFAULT_SETTINGS },
  checkpoints: {},
  sessionHistory: {},
  questProgress: {},
  trackedQuestId: 'quest_main_1',
  npcTalkedIds: [],
  npcFlags: {},
  visitedHubAreas: [],
  restoredWorlds: [],
  unlockedTitles: [],
  activeTitle: null,
  abilityUsageCount: 0,
  heroNodesResonatedCount: 0,
  mechanismsActivatedCount: 0,
  customStages: [],
  importedPacks: [],
  savedReplays: [],
  favoriteStageIds: [],
  recentlyPlayedCustomIds: [],
  dailyRiftRecords: {},
  dailyRiftStreak: 0,
  echoDuelsHistory: [],
  activePartyHero2: null,
};

const VALID_ECHO_IDS = new Set(
  LEVELS.map((l) => l.echoFragment?.id).filter((id): id is string => Boolean(id))
);
const VALID_COSMETIC_IDS = new Set(COSMETIC_ITEMS.map((c) => c.id));
const VALID_ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((a) => a.id));

function clampStars(value: unknown): 0 | 1 | 2 | 3 {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  const floored = Math.trunc(value);
  if (floored <= 0) return 0;
  if (floored === 1) return 1;
  if (floored === 2) return 2;
  return 3;
}

function sanitizeEquipped(
  rawObj: unknown,
  totalStars: number,
  collectedEchoCount: number,
  completedLevels: number[],
  purchasedCosmetics: CosmeticId[]
): EquippedCosmetics {
  const rawEquipped =
    rawObj && typeof rawObj === 'object' ? (rawObj as Record<string, unknown>) : {};
  const ctx = {
    totalStars,
    collectedEchoCount,
    completedLevels,
    purchasedCosmetics,
  };

  const check = (candidate: unknown, category: string, fallback: CosmeticId): CosmeticId => {
    if (
      typeof candidate === 'string' &&
      VALID_COSMETIC_IDS.has(candidate as CosmeticId)
    ) {
      const id = candidate as CosmeticId;
      if (
        getCosmeticById(id).category === category &&
        isCosmeticUnlocked(id, totalStars, undefined, ctx)
      ) {
        return id;
      }
    }
    return fallback;
  };

  const candidateSet = rawEquipped.setId;
  const validSet =
    typeof candidateSet === 'string' &&
    VALID_COSMETIC_IDS.has(candidateSet as CosmeticId) &&
    getCosmeticById(candidateSet as CosmeticId).category === 'set' &&
    isCosmeticUnlocked(candidateSet as CosmeticId, totalStars, undefined, ctx)
      ? (candidateSet as CosmeticId)
      : null;

  return {
    cloakId: check(rawEquipped.cloakId, 'cloak', 'default_cloak'),
    lanternId: check(rawEquipped.lanternId, 'lantern', 'default_lantern'),
    headwearId: check(rawEquipped.headwearId, 'headwear', 'none_headwear'),
    backpackId: check(rawEquipped.backpackId, 'backpack', 'none_backpack'),
    auraId: check(rawEquipped.auraId, 'aura', 'none_aura'),
    paletteId: check(rawEquipped.paletteId, 'palette', 'palette_pilgrim_classic'),
    setId: validSet,
  };
}

function sanitizeQuestProgressMap(raw: unknown): Record<string, QuestProgressRecord> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, QuestProgressRecord> = {};
  for (const [id, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!VALID_QUEST_IDS.has(id) || !val || typeof val !== 'object') continue;
    const obj = val as Record<string, unknown>;
    const completedSteps = Array.isArray(obj.completedSteps)
      ? Array.from(new Set(obj.completedSteps.filter((s): s is string => typeof s === 'string')))
      : [];
    out[id] = {
      questId: id,
      discovered: Boolean(obj.discovered),
      started: Boolean(obj.started),
      completed: Boolean(obj.completed),
      rewardClaimed: Boolean(obj.rewardClaimed),
      completedSteps,
      ...(typeof obj.claimedAt === 'number' && Number.isFinite(obj.claimedAt)
        ? { claimedAt: obj.claimedAt }
        : {}),
    };
  }
  return out;
}

export function validateSaveProgress(raw: unknown): SaveProgress {
  if (!raw || typeof raw !== 'object') {
    const fresh: SaveProgress = {
      ...DEFAULT_PROGRESS,
      equippedCosmetics: { ...DEFAULT_EQUIPPED_COSMETICS },
      equippedByCharacter: { wayfinder: { ...DEFAULT_EQUIPPED_COSMETICS } },
      statistics: { ...DEFAULT_STATISTICS },
      settings: { ...DEFAULT_SETTINGS },
      checkpoints: {},
      sessionHistory: {},
      questProgress: {},
      npcTalkedIds: [],
      npcFlags: {},
      visitedHubAreas: [],
      restoredWorlds: [],
      unlockedTitles: [],
      customStages: [],
      importedPacks: [],
      savedReplays: [],
      favoriteStageIds: [],
      recentlyPlayedCustomIds: [],
      dailyRiftRecords: {},
      dailyRiftStreak: 0,
      echoDuelsHistory: [],
      activePartyHero2: null,
    };
    const evalRes = evaluateAllQuests(fresh);
    fresh.questProgress = evalRes.questProgress;
    fresh.trackedQuestId = evalRes.trackedQuestId;
    return fresh;
  }

  const obj = raw as Record<string, unknown>;
  const validIds = new Set(LEVELS.map((l) => l.id));

  const completedLevels = Array.from(
    new Set(
      (Array.isArray(obj.completedLevels) ? obj.completedLevels : []).filter(
        (n): n is number => typeof n === 'number' && Number.isInteger(n) && validIds.has(n)
      )
    )
  ).sort((a, b) => a - b);

  const completedSet = new Set(completedLevels);

  let highestUnlockedLevel =
    typeof obj.highestUnlockedLevel === 'number' && Number.isInteger(obj.highestUnlockedLevel)
      ? Math.max(1, Math.min(LEVELS.length, obj.highestUnlockedLevel))
      : 1;

  for (const id of completedLevels) {
    if (id + 1 <= LEVELS.length) {
      highestUnlockedLevel = Math.max(highestUnlockedLevel, id + 1);
    }
  }

  const bestTimes: Record<number, number> = {};
  if (obj.bestTimes && typeof obj.bestTimes === 'object') {
    for (const [k, v] of Object.entries(obj.bestTimes as Record<string, unknown>)) {
      const id = Number(k);
      if (validIds.has(id) && typeof v === 'number' && Number.isFinite(v) && v > 0) {
        bestTimes[id] = v;
      }
    }
  }

  const masteryRecords: Record<number, LevelMasteryRecord> = {};
  const rawMastery =
    obj.masteryRecords && typeof obj.masteryRecords === 'object'
      ? (obj.masteryRecords as Record<string, unknown>)
      : {};

  for (const lvl of LEVELS) {
    const id = lvl.id;
    const isCompleted = completedSet.has(id);
    const rawRec = rawMastery[String(id)];
    const legacyBestTime = bestTimes[id];

    if (rawRec && typeof rawRec === 'object') {
      const recObj = rawRec as Record<string, unknown>;
      const recBestTime =
        typeof recObj.bestTime === 'number' &&
        Number.isFinite(recObj.bestTime) &&
        recObj.bestTime > 0
          ? recObj.bestTime
          : undefined;
      const mergedBestTime =
        recBestTime !== undefined && legacyBestTime !== undefined
          ? Math.min(recBestTime, legacyBestTime)
          : recBestTime ?? legacyBestTime;

      const recBestActions =
        typeof recObj.bestActions === 'number' &&
        Number.isFinite(recObj.bestActions) &&
        recObj.bestActions >= 0
          ? Math.round(recObj.bestActions)
          : undefined;

      const completions =
        isCompleted &&
        typeof recObj.completions === 'number' &&
        Number.isFinite(recObj.completions) &&
        recObj.completions >= 0
          ? Math.trunc(recObj.completions)
          : 0;

      const bestStars = isCompleted ? clampStars(recObj.bestStars) : 0;
      const rawPerfect =
        isCompleted &&
        typeof recObj.perfectRuns === 'number' &&
        Number.isFinite(recObj.perfectRuns) &&
        recObj.perfectRuns >= 0
          ? Math.trunc(recObj.perfectRuns)
          : 0;
      const perfectRuns =
        bestStars === 3
          ? Math.min(Math.max(rawPerfect, completions > 0 ? 1 : 0), Math.max(1, completions))
          : 0;

      if (mergedBestTime !== undefined && isCompleted) {
        bestTimes[id] = mergedBestTime;
      }

      if (isCompleted) {
        masteryRecords[id] = {
          levelId: id,
          completed: true,
          bestStars,
          bestTime: mergedBestTime,
          bestActions: recBestActions,
          completions,
          perfectRuns,
        };
      }
    } else if (isCompleted) {
      masteryRecords[id] = {
        levelId: id,
        completed: true,
        bestStars: 0,
        bestTime: legacyBestTime,
        bestActions: undefined,
        completions: 0,
        perfectRuns: 0,
      };
    }
  }

  const collectedEchoFragments = Array.from(
    new Set(
      (Array.isArray(obj.collectedEchoFragments) ? obj.collectedEchoFragments : []).filter(
        (id): id is string => typeof id === 'string' && VALID_ECHO_IDS.has(id)
      )
    )
  ).sort();

  const purchasedCosmetics = Array.from(
    new Set(
      (Array.isArray(obj.purchasedCosmetics) ? obj.purchasedCosmetics : []).filter(
        (id): id is CosmeticId =>
          typeof id === 'string' && VALID_COSMETIC_IDS.has(id as CosmeticId)
      )
    )
  );

  const totalStars = getTotalStars(masteryRecords);
  const unlockedCosmetics = resolveUnlockedCosmetics(
    totalStars,
    collectedEchoFragments.length,
    completedLevels,
    purchasedCosmetics
  );

  const equippedCosmetics = sanitizeEquipped(
    obj.equippedCosmetics,
    totalStars,
    collectedEchoFragments.length,
    completedLevels,
    purchasedCosmetics
  );

  const unlockedCharacters = resolveUnlockedCharacters(completedLevels);
  const candidateChar =
    typeof obj.selectedCharacterId === 'string'
      ? (obj.selectedCharacterId as CharacterId)
      : 'wayfinder';
  const selectedCharacterId: CharacterId = unlockedCharacters.includes(candidateChar)
    ? candidateChar
    : 'wayfinder';

  const equippedByCharacter: Partial<Record<CharacterId, EquippedCosmetics>> = {};
  if (obj.equippedByCharacter && typeof obj.equippedByCharacter === 'object') {
    const rawMap = obj.equippedByCharacter as Record<string, unknown>;
    for (const heroId of unlockedCharacters) {
      if (rawMap[heroId]) {
        equippedByCharacter[heroId] = sanitizeEquipped(
          rawMap[heroId],
          totalStars,
          collectedEchoFragments.length,
          completedLevels,
          purchasedCosmetics
        );
      }
    }
  }
  if (!equippedByCharacter[selectedCharacterId]) {
    equippedByCharacter[selectedCharacterId] = { ...equippedCosmetics };
  }

  const rawStats =
    obj.statistics && typeof obj.statistics === 'object'
      ? (obj.statistics as Record<string, unknown>)
      : {};
  const statistics: PersistentStatistics = {
    totalPlayTimeSeconds:
      typeof rawStats.totalPlayTimeSeconds === 'number' &&
      Number.isFinite(rawStats.totalPlayTimeSeconds) &&
      rawStats.totalPlayTimeSeconds >= 0
        ? rawStats.totalPlayTimeSeconds
        : 0,
    totalCompletions:
      typeof rawStats.totalCompletions === 'number' &&
      Number.isFinite(rawStats.totalCompletions) &&
      rawStats.totalCompletions >= 0
        ? Math.trunc(rawStats.totalCompletions)
        : 0,
    totalAttempts:
      typeof rawStats.totalAttempts === 'number' &&
      Number.isFinite(rawStats.totalAttempts) &&
      rawStats.totalAttempts >= 0
        ? Math.trunc(rawStats.totalAttempts)
        : 0,
    totalPerfectRuns:
      typeof rawStats.totalPerfectRuns === 'number' &&
      Number.isFinite(rawStats.totalPerfectRuns) &&
      rawStats.totalPerfectRuns >= 0
        ? Math.trunc(rawStats.totalPerfectRuns)
        : 0,
  };

  const rawSettings = (obj.settings && typeof obj.settings === 'object' ? obj.settings : {}) as Record<
    string,
    unknown
  >;
  const settings: GameSettings = {
    soundEnabled:
      typeof rawSettings.soundEnabled === 'boolean'
        ? rawSettings.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled,
    volume:
      typeof rawSettings.volume === 'number' && Number.isFinite(rawSettings.volume)
        ? Math.max(0, Math.min(1, rawSettings.volume))
        : DEFAULT_SETTINGS.volume,
    cameraZoomOffset:
      typeof rawSettings.cameraZoomOffset === 'number' &&
      Number.isFinite(rawSettings.cameraZoomOffset)
        ? Math.max(-0.25, Math.min(0.35, rawSettings.cameraZoomOffset))
        : DEFAULT_SETTINGS.cameraZoomOffset,
  };

  let lumaShards =
    typeof obj.lumaShards === 'number' && Number.isFinite(obj.lumaShards) && obj.lumaShards >= 0
      ? Math.trunc(obj.lumaShards)
      : 0;
  const spentLumaShards =
    typeof obj.spentLumaShards === 'number' &&
    Number.isFinite(obj.spentLumaShards) &&
    obj.spentLumaShards >= 0
      ? Math.trunc(obj.spentLumaShards)
      : 0;

  const storedAch = Array.isArray(obj.unlockedAchievements)
    ? obj.unlockedAchievements.filter(
        (id): id is string => typeof id === 'string' && VALID_ACHIEVEMENT_IDS.has(id)
      )
    : [];

  const checkpoints = sanitizeCheckpoints(obj.checkpoints);
  const sessionHistory = sanitizeSessionHistory(obj.sessionHistory);
  const rawQuestProgress = sanitizeQuestProgressMap(obj.questProgress);

  const npcTalkedIds = Array.from(
    new Set(
      (Array.isArray(obj.npcTalkedIds) ? obj.npcTalkedIds : []).filter(
        (id): id is NpcId => typeof id === 'string' && VALID_NPC_IDS.has(id as NpcId)
      )
    )
  );

  const npcFlags: Record<string, boolean> = {};
  if (obj.npcFlags && typeof obj.npcFlags === 'object') {
    for (const [k, v] of Object.entries(obj.npcFlags as Record<string, unknown>)) {
      if (typeof v === 'boolean') npcFlags[k] = v;
    }
  }

  const visitedHubAreas = Array.from(
    new Set(
      (Array.isArray(obj.visitedHubAreas) ? obj.visitedHubAreas : []).filter(
        (id): id is HubAreaId =>
          typeof id === 'string' && VALID_HUB_AREAS.has(id as HubAreaId)
      )
    )
  );

  const unlockedTitles = Array.from(
    new Set(
      (Array.isArray(obj.unlockedTitles) ? obj.unlockedTitles : []).filter(
        (t): t is string => typeof t === 'string' && t.length > 0
      )
    )
  );

  const activeTitle =
    typeof obj.activeTitle === 'string' && unlockedTitles.includes(obj.activeTitle)
      ? obj.activeTitle
      : null;

  const restoredWorldsInput = Array.from(
    new Set(
      (Array.isArray(obj.restoredWorlds) ? obj.restoredWorlds : []).filter(
        (id): id is WorldId => typeof id === 'string' && VALID_WORLD_IDS.has(id as WorldId)
      )
    )
  );

  const draft: SaveProgress = {
    saveVersion: CURRENT_SAVE_VERSION,
    completedLevels,
    highestUnlockedLevel,
    bestTimes,
    masteryRecords,
    unlockedCosmetics,
    purchasedCosmetics,
    equippedCosmetics,
    selectedCharacterId,
    unlockedCharacters,
    equippedByCharacter,
    collectedEchoFragments,
    lumaShards,
    spentLumaShards,
    unlockedAchievements: storedAch,
    statistics,
    settings,
    checkpoints,
    sessionHistory,
    questProgress: rawQuestProgress,
    trackedQuestId:
      typeof obj.trackedQuestId === 'string' && VALID_QUEST_IDS.has(obj.trackedQuestId)
        ? obj.trackedQuestId
        : null,
    npcTalkedIds,
    npcFlags,
    visitedHubAreas,
    restoredWorlds: restoredWorldsInput,
    unlockedTitles,
    activeTitle,
    abilityUsageCount:
      typeof obj.abilityUsageCount === 'number' &&
      Number.isFinite(obj.abilityUsageCount) &&
      obj.abilityUsageCount >= 0
        ? Math.trunc(obj.abilityUsageCount)
        : 0,
    heroNodesResonatedCount:
      typeof obj.heroNodesResonatedCount === 'number' &&
      Number.isFinite(obj.heroNodesResonatedCount) &&
      obj.heroNodesResonatedCount >= 0
        ? Math.trunc(obj.heroNodesResonatedCount)
        : 0,
    mechanismsActivatedCount:
      typeof obj.mechanismsActivatedCount === 'number' &&
      Number.isFinite(obj.mechanismsActivatedCount) &&
      obj.mechanismsActivatedCount >= 0
        ? Math.trunc(obj.mechanismsActivatedCount)
        : 0,
    lastUpdatedAt:
      typeof obj.lastUpdatedAt === 'number' && Number.isFinite(obj.lastUpdatedAt)
        ? obj.lastUpdatedAt
        : undefined,
    customStages: Array.isArray(obj.customStages)
      ? obj.customStages
          .slice(0, 24)
          .map((s) => {
            try {
              const res = parseAndValidateLumaStage(JSON.stringify(s));
              return res.ok ? res.data : null;
            } catch {
              return null;
            }
          })
          .filter((s): s is LumaCustomStageFile => s !== null)
      : [],
    importedPacks: Array.isArray(obj.importedPacks)
      ? obj.importedPacks
          .slice(0, 8)
          .map((p) => {
            try {
              const res = parseAndValidateLumaPack(JSON.stringify(p));
              return res.ok ? res.data : null;
            } catch {
              return null;
            }
          })
          .filter((p): p is LumaStagePackFile => p !== null)
      : [],
    savedReplays: Array.isArray(obj.savedReplays)
      ? obj.savedReplays
          .slice(0, 10)
          .map((r) => {
            try {
              const res = parseAndValidateLumaReplay(JSON.stringify(r));
              return res.ok
                ? { ...res.data, verified: Boolean((r as Record<string, unknown>)?.verified) }
                : null;
            } catch {
              return null;
            }
          })
          .filter((r): r is LumaReplayFile => r !== null)
      : [],
    favoriteStageIds: Array.isArray(obj.favoriteStageIds)
      ? Array.from(
          new Set(
            obj.favoriteStageIds.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 64)
          )
        ).slice(0, 48)
      : [],
    recentlyPlayedCustomIds: Array.isArray(obj.recentlyPlayedCustomIds)
      ? Array.from(
          new Set(
            obj.recentlyPlayedCustomIds.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 64)
          )
        ).slice(0, 24)
      : [],
    dailyRiftRecords: (() => {
      const out: Record<string, DailyRiftRecord> = {};
      if (obj.dailyRiftRecords && typeof obj.dailyRiftRecords === 'object') {
        const entries = Object.entries(obj.dailyRiftRecords as Record<string, unknown>).slice(0, 45);
        for (const [k, v] of entries) {
          if (!v || typeof v !== 'object') continue;
          const rec = v as Record<string, unknown>;
          out[k] = {
            dateKey: typeof rec.dateKey === 'string' ? rec.dateKey.slice(0, 24) : k,
            seed: typeof rec.seed === 'number' && Number.isFinite(rec.seed) ? rec.seed >>> 0 : 0,
            generatorVersion:
              typeof rec.generatorVersion === 'string' ? rec.generatorVersion.slice(0, 20) : 'rift-v1',
            challengeType: (typeof rec.challengeType === 'string'
              ? rec.challengeType
              : 'standard') as DailyChallengeType,
            completed: Boolean(rec.completed),
            bestTime:
              typeof rec.bestTime === 'number' && Number.isFinite(rec.bestTime) && rec.bestTime > 0
                ? rec.bestTime
                : undefined,
            bestActions:
              typeof rec.bestActions === 'number' && Number.isFinite(rec.bestActions) && rec.bestActions >= 0
                ? Math.round(rec.bestActions)
                : undefined,
            bestStars: clampStars(rec.bestStars),
            attempts:
              typeof rec.attempts === 'number' && Number.isFinite(rec.attempts) && rec.attempts >= 0
                ? Math.trunc(rec.attempts)
                : 0,
            lastPlayedAt:
              typeof rec.lastPlayedAt === 'number' && Number.isFinite(rec.lastPlayedAt)
                ? rec.lastPlayedAt
                : undefined,
          };
        }
      }
      return out;
    })(),
    dailyRiftStreak: 0,
    echoDuelsHistory: Array.isArray(obj.echoDuelsHistory)
      ? (obj.echoDuelsHistory as EchoDuelRecord[])
          .filter(
            (d) =>
              d &&
              typeof d === 'object' &&
              typeof d.stageTitle === 'string' &&
              typeof d.challengerTime === 'number'
          )
          .slice(0, 30)
      : [],
    activePartyHero2: (() => {
      const cand = obj.activePartyHero2;
      if (
        typeof cand === 'string' &&
        unlockedCharacters.includes(cand as CharacterId) &&
        cand !== selectedCharacterId
      ) {
        return cand as CharacterId;
      }
      return null;
    })(),
  };

  draft.dailyRiftStreak = computeDailyRiftStreak(draft.dailyRiftRecords);

  // Evaluate quest state deterministically without duplicating rewards if already claimed
  const questEval = evaluateAllQuests(draft);
  const incomingVersion = typeof obj.saveVersion === 'number' ? obj.saveVersion : 1;
  // On v1/v2/v3 migration OR new step completions, grant one-time rewards once cleanly
  if (incomingVersion < CURRENT_SAVE_VERSION || Object.keys(rawQuestProgress).length > 0) {
    if (questEval.shardsAwarded > 0) {
      lumaShards += questEval.shardsAwarded;
    }
    if (questEval.newlyUnlockedTitles.length > 0) {
      for (const t of questEval.newlyUnlockedTitles) {
        if (!unlockedTitles.includes(t)) unlockedTitles.push(t);
      }
    }
  } else if (questEval.shardsAwarded > 0) {
    lumaShards += questEval.shardsAwarded;
    for (const t of questEval.newlyUnlockedTitles) {
      if (!unlockedTitles.includes(t)) unlockedTitles.push(t);
    }
  }

  draft.lumaShards = lumaShards;
  draft.questProgress = questEval.questProgress;
  draft.trackedQuestId = questEval.trackedQuestId;
  draft.unlockedTitles = unlockedTitles;
  draft.restoredWorlds = computeRestoredWorlds(draft);

  const evaluatedAch = evaluateUnlockedAchievements(draft);
  draft.unlockedAchievements = Array.from(new Set([...storedAch, ...evaluatedAch]));

  return draft;
}

export function getActiveEquippedCosmetics(progress: SaveProgress): EquippedCosmetics {
  const heroId = progress.selectedCharacterId ?? 'wayfinder';
  return progress.equippedByCharacter?.[heroId] ?? progress.equippedCosmetics ?? DEFAULT_EQUIPPED_COSMETICS;
}

export function recordLevelAttempt(progress: SaveProgress, levelId: number): SaveProgress {
  const validId = LEVELS.some((l) => l.id === levelId);
  if (!validId) return progress;
  return {
    ...progress,
    statistics: {
      ...progress.statistics,
      totalAttempts: progress.statistics.totalAttempts + 1,
    },
  };
}

export interface CompletionRecordOptions {
  echoCollectedInRun?: boolean;
  bonusShards?: number;
}

export function recordLevelCompletionDetailed(
  progress: SaveProgress,
  levelId: number,
  clearSeconds: number,
  interactionsCount: number,
  options: CompletionRecordOptions = {}
): { progress: SaveProgress; summary: CompletionSummary } {
  const cleanSeconds =
    Number.isFinite(clearSeconds) && clearSeconds > 0 ? clearSeconds : 0.1;
  const cleanActions =
    Number.isFinite(interactionsCount) && interactionsCount >= 0
      ? Math.round(interactionsCount)
      : 0;

  const rating = evaluateLevelRun(levelId, true, cleanSeconds, cleanActions);
  const prevRec = progress.masteryRecords[levelId];
  const previousBestStars = prevRec ? prevRec.bestStars : 0;
  const previousBestTime = prevRec?.bestTime ?? progress.bestTimes[levelId];
  const previousBestActions = prevRec?.bestActions;
  const isFirstCompletion = !progress.completedLevels.includes(levelId);

  const isNewBestTime =
    previousBestTime === undefined || cleanSeconds < previousBestTime;
  const isNewBestActions =
    previousBestActions === undefined || cleanActions < previousBestActions;

  const nextBestStars = Math.max(previousBestStars, rating.stars) as 0 | 1 | 2 | 3;
  const nextBestTime =
    previousBestTime !== undefined
      ? Math.min(previousBestTime, cleanSeconds)
      : cleanSeconds;
  const nextBestActions =
    previousBestActions !== undefined
      ? Math.min(previousBestActions, cleanActions)
      : cleanActions;

  const totalStarsBefore = getTotalStars(progress.masteryRecords);

  const nextMasteryRecords: Record<number, LevelMasteryRecord> = {
    ...progress.masteryRecords,
    [levelId]: {
      levelId,
      completed: true,
      bestStars: nextBestStars,
      bestTime: nextBestTime,
      bestActions: nextBestActions,
      completions: (prevRec?.completions ?? 0) + 1,
      perfectRuns: (prevRec?.perfectRuns ?? 0) + (rating.stars === 3 ? 1 : 0),
    },
  };

  const completedLevels = Array.from(new Set([...progress.completedLevels, levelId])).sort(
    (a, b) => a - b
  );
  const nextUnlock = Math.min(LEVELS.length, levelId + 1);
  const highestUnlockedLevel = Math.max(progress.highestUnlockedLevel, nextUnlock);
  const bestTimes = {
    ...progress.bestTimes,
    [levelId]: nextBestTime,
  };

  const levelDef = LEVELS.find((l) => l.id === levelId);
  const stageEchoId = levelDef?.echoFragment?.id;
  const existingEchoes = progress.collectedEchoFragments ?? [];
  const isNewEcho =
    Boolean(options.echoCollectedInRun) &&
    Boolean(stageEchoId) &&
    !existingEchoes.includes(stageEchoId!);
  const nextEchoes = isNewEcho ? [...existingEchoes, stageEchoId!] : existingEchoes;

  const totalStarsAfter = getTotalStars(nextMasteryRecords);
  const starDelta = Math.max(0, totalStarsAfter - totalStarsBefore);
  const newlyUnlockedMilestones = getNewlyUnlockedMilestones(
    totalStarsBefore,
    totalStarsAfter
  );
  const newlyUnlockedCharacters = getNewlyUnlockedCharacters(
    progress.completedLevels,
    completedLevels
  );

  let lumaShardsEarned = isFirstCompletion ? 8 : 3;
  lumaShardsEarned += starDelta * 2;
  if (isNewEcho) lumaShardsEarned += 6;
  if (options.bonusShards && options.bonusShards > 0) {
    lumaShardsEarned += Math.trunc(options.bonusShards);
  }

  // Clear resumable stage checkpoint on victory and append capped session history
  const nextCheckpoints = { ...(progress.checkpoints ?? {}) };
  delete nextCheckpoints[levelId];

  const nextSessionHistory = appendSessionHistory(progress.sessionHistory, {
    id: `sess_${levelId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    levelId,
    characterId: progress.selectedCharacterId ?? 'wayfinder',
    outcome: 'completed',
    clearSeconds: Number(cleanSeconds.toFixed(2)),
    actionsUsed: cleanActions,
    starsEarned: rating.stars,
    echoCollected: Boolean(options.echoCollectedInRun),
    timestamp: Date.now(),
  });

  const prevAch = progress.unlockedAchievements ?? [];
  const draftBeforeAch: SaveProgress = {
    ...progress,
    completedLevels,
    highestUnlockedLevel,
    bestTimes,
    masteryRecords: nextMasteryRecords,
    collectedEchoFragments: nextEchoes,
    unlockedCharacters: resolveUnlockedCharacters(completedLevels),
    unlockedCosmetics: resolveUnlockedCosmetics(
      totalStarsAfter,
      nextEchoes.length,
      completedLevels,
      progress.purchasedCosmetics ?? []
    ),
    lumaShards: (progress.lumaShards ?? 0) + lumaShardsEarned,
    checkpoints: nextCheckpoints,
    sessionHistory: nextSessionHistory,
    mechanismsActivatedCount: (progress.mechanismsActivatedCount ?? 0) + cleanActions,
    statistics: {
      ...progress.statistics,
      totalPlayTimeSeconds: progress.statistics.totalPlayTimeSeconds + cleanSeconds,
      totalCompletions: progress.statistics.totalCompletions + 1,
      totalPerfectRuns:
        progress.statistics.totalPerfectRuns + (rating.stars === 3 ? 1 : 0),
    },
  };

  const newlyUnlockedAchievements = getNewlyUnlockedAchievements(prevAch, draftBeforeAch);
  const achShardBonus = newlyUnlockedAchievements.reduce((acc, a) => acc + a.shardReward, 0);
  lumaShardsEarned += achShardBonus;

  const questCheck = evaluateAllQuests({
    ...draftBeforeAch,
    lumaShards: (progress.lumaShards ?? 0) + lumaShardsEarned,
  });

  const nextProgress: SaveProgress = validateSaveProgress({
    ...draftBeforeAch,
    lumaShards: (progress.lumaShards ?? 0) + lumaShardsEarned + questCheck.shardsAwarded,
    questProgress: questCheck.questProgress,
    trackedQuestId: questCheck.trackedQuestId,
    restoredWorlds: questCheck.restoredWorlds,
    unlockedTitles: [
      ...(progress.unlockedTitles ?? []),
      ...questCheck.newlyUnlockedTitles,
    ],
  });

  return {
    progress: nextProgress,
    summary: {
      levelId,
      rating,
      previousBestStars,
      previousBestTime,
      previousBestActions,
      improvedStars: rating.stars > previousBestStars,
      isFirstCompletion,
      isNewBestTime,
      isNewBestActions,
      totalStarsBefore,
      totalStarsAfter,
      newlyUnlockedMilestones,
      echoCollectedInRun: Boolean(options.echoCollectedInRun),
      lumaShardsEarned: lumaShardsEarned + questCheck.shardsAwarded,
      newlyUnlockedCharacters,
      newlyUnlockedAchievements,
    },
  };
}

export function recordLevelCompletion(
  progress: SaveProgress,
  levelId: number,
  clearSeconds: number,
  interactionsCount = 0
): SaveProgress {
  return recordLevelCompletionDetailed(progress, levelId, clearSeconds, interactionsCount).progress;
}

export function collectEchoInProgress(
  progress: SaveProgress,
  echoId: string
): SaveProgress {
  if (!VALID_ECHO_IDS.has(echoId)) return progress;
  const existing = progress.collectedEchoFragments ?? [];
  if (existing.includes(echoId)) return progress;
  const nextEchoes = [...existing, echoId];
  return validateSaveProgress({
    ...progress,
    collectedEchoFragments: nextEchoes,
    lumaShards: (progress.lumaShards ?? 0) + 6,
  });
}

export function saveStageCheckpointInProgress(
  progress: SaveProgress,
  checkpoint: StageCheckpoint
): SaveProgress {
  return validateSaveProgress({
    ...progress,
    checkpoints: {
      ...(progress.checkpoints ?? {}),
      [checkpoint.levelId]: checkpoint,
    },
  });
}

export function clearStageCheckpointInProgress(
  progress: SaveProgress,
  levelId: number
): SaveProgress {
  if (!progress.checkpoints?.[levelId]) return progress;
  const nextCheckpoints = { ...progress.checkpoints };
  delete nextCheckpoints[levelId];
  return validateSaveProgress({
    ...progress,
    checkpoints: nextCheckpoints,
  });
}

export function recordSessionSnapshotInProgress(
  progress: SaveProgress,
  levelId: number,
  characterId: CharacterId,
  outcome: 'checkpoint_saved' | 'abandoned',
  clearSeconds: number,
  actionsUsed: number,
  echoCollected: boolean
): SaveProgress {
  const nextSessionHistory = appendSessionHistory(progress.sessionHistory, {
    id: `sess_${levelId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    levelId,
    characterId,
    outcome,
    clearSeconds: Number(Math.max(0, clearSeconds).toFixed(2)),
    actionsUsed: Math.max(0, Math.trunc(actionsUsed)),
    starsEarned: 0,
    echoCollected,
    timestamp: Date.now(),
  });
  return validateSaveProgress({
    ...progress,
    sessionHistory: nextSessionHistory,
  });
}

export function recordNpcTalkedInProgress(
  progress: SaveProgress,
  npcId: NpcId,
  flags?: Record<string, boolean>
): SaveProgress {
  if (!VALID_NPC_IDS.has(npcId)) return progress;
  const prevTalked = progress.npcTalkedIds ?? [];
  const nextTalked = prevTalked.includes(npcId) ? prevTalked : [...prevTalked, npcId];
  const nextFlags = flags
    ? { ...(progress.npcFlags ?? {}), ...flags }
    : progress.npcFlags ?? {};
  return validateSaveProgress({
    ...progress,
    npcTalkedIds: nextTalked,
    npcFlags: nextFlags,
  });
}

export function recordHubAreaVisitedInProgress(
  progress: SaveProgress,
  areaId: HubAreaId
): SaveProgress {
  if (!VALID_HUB_AREAS.has(areaId)) return progress;
  const prevVisited = progress.visitedHubAreas ?? [];
  if (prevVisited.includes(areaId)) return progress;
  return validateSaveProgress({
    ...progress,
    visitedHubAreas: [...prevVisited, areaId],
  });
}

export function recordAbilityUsedInProgress(
  progress: SaveProgress,
  activatedHeroNodesCount = 0
): SaveProgress {
  return validateSaveProgress({
    ...progress,
    abilityUsageCount: (progress.abilityUsageCount ?? 0) + 1,
    heroNodesResonatedCount:
      (progress.heroNodesResonatedCount ?? 0) + Math.max(0, activatedHeroNodesCount),
  });
}

export function setTrackedQuestInProgress(
  progress: SaveProgress,
  questId: string | null
): SaveProgress {
  return validateSaveProgress({
    ...progress,
    trackedQuestId: questId,
  });
}

export function setActiveTitleInProgress(
  progress: SaveProgress,
  title: string | null
): SaveProgress {
  return validateSaveProgress({
    ...progress,
    activeTitle: title,
  });
}

export function selectCharacterInProgress(
  progress: SaveProgress,
  characterId: CharacterId
): SaveProgress {
  const unlocked = progress.unlockedCharacters ?? ['wayfinder'];
  if (!unlocked.includes(characterId)) return progress;
  const hero = getCharacterById(characterId);
  const charEquipped =
    progress.equippedByCharacter?.[hero.id] ?? { ...DEFAULT_EQUIPPED_COSMETICS };
  return validateSaveProgress({
    ...progress,
    selectedCharacterId: hero.id,
    equippedCosmetics: charEquipped,
  });
}

export function purchaseCosmeticInProgress(
  progress: SaveProgress,
  cosmeticId: CosmeticId
): { progress: SaveProgress; purchased: boolean } {
  const item = getCosmeticById(cosmeticId);
  if (item.unlockType !== 'shards' || !item.shardCost) {
    return { progress, purchased: false };
  }
  const purchasedList = progress.purchasedCosmetics ?? [];
  if (purchasedList.includes(cosmeticId)) {
    return { progress, purchased: false };
  }
  const balance = progress.lumaShards ?? 0;
  if (balance < item.shardCost) {
    return { progress, purchased: false };
  }
  const nextPurchased = [...purchasedList, cosmeticId];
  const totalStars = getTotalStars(progress.masteryRecords);
  const nextUnlockedCosmetics = resolveUnlockedCosmetics(
    totalStars,
    (progress.collectedEchoFragments ?? []).length,
    progress.completedLevels,
    nextPurchased
  );
  const draft: SaveProgress = {
    ...progress,
    saveVersion: CURRENT_SAVE_VERSION,
    lumaShards: balance - item.shardCost,
    spentLumaShards: (progress.spentLumaShards ?? 0) + item.shardCost,
    purchasedCosmetics: nextPurchased,
    unlockedCosmetics: nextUnlockedCosmetics,
  };
  const evaluatedAch = evaluateUnlockedAchievements(draft);
  const nextProgress: SaveProgress = {
    ...draft,
    unlockedAchievements: Array.from(
      new Set([...(progress.unlockedAchievements ?? []), ...evaluatedAch])
    ),
  };
  return { progress: nextProgress, purchased: true };
}

export function equipCosmeticInProgress(
  progress: SaveProgress,
  cosmeticId: CosmeticId,
  targetCharacterId?: CharacterId
): SaveProgress {
  const totalStars = getTotalStars(progress.masteryRecords);
  const heroId = targetCharacterId ?? progress.selectedCharacterId ?? 'wayfinder';
  const currentEquipped =
    progress.equippedByCharacter?.[heroId] ?? progress.equippedCosmetics;
  const nextEquipped = equipCosmeticSelection(
    currentEquipped,
    cosmeticId,
    totalStars,
    progress.unlockedCosmetics
  );
  return validateSaveProgress({
    ...progress,
    equippedCosmetics:
      heroId === (progress.selectedCharacterId ?? 'wayfinder')
        ? nextEquipped
        : progress.equippedCosmetics,
    equippedByCharacter: {
      ...(progress.equippedByCharacter ?? {}),
      [heroId]: nextEquipped,
    },
  });
}

export function restoreDefaultCosmetics(
  progress: SaveProgress,
  targetCharacterId?: CharacterId
): SaveProgress {
  const heroId = targetCharacterId ?? progress.selectedCharacterId ?? 'wayfinder';
  return validateSaveProgress({
    ...progress,
    equippedCosmetics:
      heroId === (progress.selectedCharacterId ?? 'wayfinder')
        ? { ...DEFAULT_EQUIPPED_COSMETICS }
        : progress.equippedCosmetics,
    equippedByCharacter: {
      ...(progress.equippedByCharacter ?? {}),
      [heroId]: { ...DEFAULT_EQUIPPED_COSMETICS },
    },
  });
}

export function loadProgressWithMeta(): SaveReadResult {
  return readSaveWithRecovery(validateSaveProgress);
}

export function saveProgressWithResult(progress: SaveProgress): SaveWriteResult {
  return writeSaveAtomic(progress, validateSaveProgress);
}

export function loadProgress(): SaveProgress {
  return readSaveWithRecovery(validateSaveProgress).progress;
}

export function saveProgress(progress: SaveProgress): void {
  writeSaveAtomic(progress, validateSaveProgress);
}

// ============================================================
// LUMA: UNBOUND — Local Custom Stages, Replays, Rifts & Duels
// ============================================================

export function saveCustomStageInProgress(
  progress: SaveProgress,
  stage: LumaCustomStageFile
): SaveProgress {
  const existing = progress.customStages ?? [];
  const filtered = existing.filter((s) => s.id !== stage.id);
  return validateSaveProgress({
    ...progress,
    customStages: [stage, ...filtered].slice(0, 24),
  });
}

export function deleteCustomStageInProgress(
  progress: SaveProgress,
  stageId: string
): SaveProgress {
  return validateSaveProgress({
    ...progress,
    customStages: (progress.customStages ?? []).filter((s) => s.id !== stageId),
    favoriteStageIds: (progress.favoriteStageIds ?? []).filter((id) => id !== stageId),
    recentlyPlayedCustomIds: (progress.recentlyPlayedCustomIds ?? []).filter((id) => id !== stageId),
  });
}

export function saveImportedPackInProgress(
  progress: SaveProgress,
  pack: LumaStagePackFile
): SaveProgress {
  const existing = progress.importedPacks ?? [];
  const filtered = existing.filter((p) => p.id !== pack.id);
  return validateSaveProgress({
    ...progress,
    importedPacks: [pack, ...filtered].slice(0, 8),
  });
}

export function saveReplayInProgress(
  progress: SaveProgress,
  replay: LumaReplayFile
): SaveProgress {
  const existing = progress.savedReplays ?? [];
  return validateSaveProgress({
    ...progress,
    savedReplays: [replay, ...existing].slice(0, 10),
  });
}

export function toggleFavoriteStageInProgress(
  progress: SaveProgress,
  stageId: string
): SaveProgress {
  const prev = progress.favoriteStageIds ?? [];
  const exists = prev.includes(stageId);
  const next = exists ? prev.filter((id) => id !== stageId) : [stageId, ...prev];
  return validateSaveProgress({
    ...progress,
    favoriteStageIds: next,
  });
}

export function recordRecentlyPlayedCustomInProgress(
  progress: SaveProgress,
  stageId: string
): SaveProgress {
  const prev = progress.recentlyPlayedCustomIds ?? [];
  const next = [stageId, ...prev.filter((id) => id !== stageId)].slice(0, 24);
  return validateSaveProgress({
    ...progress,
    recentlyPlayedCustomIds: next,
  });
}

export function recordDailyRiftAttemptInProgress(
  progress: SaveProgress,
  params: {
    dateKey: string;
    seed: number;
    generatorVersion: string;
    challengeType: DailyChallengeType;
    completed: boolean;
    clearSeconds?: number;
    actionsUsed?: number;
    stars?: 0 | 1 | 2 | 3;
  }
): SaveProgress {
  const existingMap = { ...(progress.dailyRiftRecords ?? {}) };
  const prev = existingMap[params.dateKey];
  const nextCompleted = Boolean(prev?.completed || params.completed);
  const nextBestTime =
    params.completed && params.clearSeconds !== undefined
      ? prev?.bestTime !== undefined
        ? Math.min(prev.bestTime, params.clearSeconds)
        : params.clearSeconds
      : prev?.bestTime;
  const nextBestActions =
    params.completed && params.actionsUsed !== undefined
      ? prev?.bestActions !== undefined
        ? Math.min(prev.bestActions, params.actionsUsed)
        : params.actionsUsed
      : prev?.bestActions;
  const nextBestStars = Math.max(prev?.bestStars ?? 0, params.stars ?? 0) as 0 | 1 | 2 | 3;

  existingMap[params.dateKey] = {
    dateKey: params.dateKey,
    seed: params.seed,
    generatorVersion: params.generatorVersion,
    challengeType: params.challengeType,
    completed: nextCompleted,
    bestTime: nextBestTime,
    bestActions: nextBestActions,
    bestStars: nextBestStars,
    attempts: (prev?.attempts ?? 0) + 1,
    lastPlayedAt: Date.now(),
  };

  return validateSaveProgress({
    ...progress,
    dailyRiftRecords: existingMap,
    dailyRiftStreak: computeDailyRiftStreak(existingMap),
  });
}

export function recordEchoDuelResultInProgress(
  progress: SaveProgress,
  record: EchoDuelRecord
): SaveProgress {
  return validateSaveProgress({
    ...progress,
    echoDuelsHistory: [record, ...(progress.echoDuelsHistory ?? [])].slice(0, 30),
  });
}

export function setActivePartyCompanionInProgress(
  progress: SaveProgress,
  companionId: CharacterId | null
): SaveProgress {
  const unlocked = progress.unlockedCharacters ?? ['wayfinder'];
  const primary = progress.selectedCharacterId ?? 'wayfinder';
  const validCompanion =
    companionId && unlocked.includes(companionId) && companionId !== primary
      ? companionId
      : null;
  return validateSaveProgress({
    ...progress,
    activePartyHero2: validCompanion,
  });
}
