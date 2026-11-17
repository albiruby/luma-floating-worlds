import { ACHIEVEMENTS } from './achievements';
import { CHARACTERS } from './characters';
import { LEVELS } from './levels';
import { getThreeStarLevelCount, getTotalStars, MAX_CAMPAIGN_STARS } from './mastery';
import { PlayerStatistics, SaveProgress } from './types';

export function computePlayerStatistics(progress: SaveProgress): PlayerStatistics {
  const totalStars = getTotalStars(progress.masteryRecords);
  const completedLevelsCount = progress.completedLevels.length;
  const threeStarLevelsCount = getThreeStarLevelCount(progress.masteryRecords);
  const collectedEchoesCount = progress.collectedEchoFragments?.length ?? 0;
  const unlockedHeroesCount = progress.unlockedCharacters?.length ?? 1;
  const unlockedAchievementsCount = progress.unlockedAchievements?.length ?? 0;
  const lumaShards = Math.max(0, Math.trunc(progress.lumaShards ?? 0));

  return {
    totalStars,
    maxStars: MAX_CAMPAIGN_STARS,
    completedLevelsCount,
    totalLevels: LEVELS.length,
    threeStarLevelsCount,
    remainingStars: Math.max(0, MAX_CAMPAIGN_STARS - totalStars),
    remainingThreeStarLevels: Math.max(0, LEVELS.length - threeStarLevelsCount),
    collectedEchoesCount,
    totalEchoes: LEVELS.length,
    unlockedHeroesCount,
    totalHeroes: CHARACTERS.length,
    unlockedAchievementsCount,
    totalAchievements: ACHIEVEMENTS.length,
    lumaShards,
    totalPlayTimeSeconds: Math.max(0, progress.statistics.totalPlayTimeSeconds),
    totalCompletions: Math.max(0, Math.trunc(progress.statistics.totalCompletions)),
    totalAttempts: Math.max(0, Math.trunc(progress.statistics.totalAttempts)),
    totalPerfectRuns: Math.max(0, Math.trunc(progress.statistics.totalPerfectRuns)),
  };
}
