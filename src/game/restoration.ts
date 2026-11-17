import {
  HubRestorationTier,
  SaveProgress,
  WorldId,
  WorldRestorationState,
} from './types';
import { WORLDS } from './worlds';

export const WORLD_RESTORATION_QUEST_IDS: Record<WorldId, string> = {
  world_1: 'quest_restore_w1',
  world_2: 'quest_restore_w2',
  world_3: 'quest_restore_w3',
  world_4: 'quest_restore_w4',
  world_5: 'quest_restore_w5',
  world_6: 'quest_restore_w6',
};

export interface WorldVisualBoost {
  sunIntensityMult: number;
  ambientIntensityMult: number;
  emissiveMult: number;
  fogNearOffset: number;
  fogFarOffset: number;
  waterEmissiveBoost: number;
  statusLabel: string;
}

export function isWorldStagesComplete(worldId: WorldId, completedLevels: number[]): boolean {
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) return false;
  const set = new Set(completedLevels);
  for (let id = world.levelRange[0]; id <= world.levelRange[1]; id++) {
    if (!set.has(id)) return false;
  }
  return true;
}

export function countCompletedStagesInWorld(
  worldId: WorldId,
  completedLevels: number[]
): number {
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) return 0;
  const set = new Set(completedLevels);
  let count = 0;
  for (let id = world.levelRange[0]; id <= world.levelRange[1]; id++) {
    if (set.has(id)) count++;
  }
  return count;
}

export function computeRestoredWorlds(progress: SaveProgress): WorldId[] {
  const set = new Set<WorldId>(progress.restoredWorlds ?? []);
  for (const world of WORLDS) {
    const stagesDone = isWorldStagesComplete(world.id, progress.completedLevels);
    const questId = WORLD_RESTORATION_QUEST_IDS[world.id];
    const questDone = Boolean(progress.questProgress?.[questId]?.completed);
    if (stagesDone || questDone) {
      set.add(world.id);
    }
  }
  return WORLDS.map((w) => w.id).filter((id) => set.has(id));
}

export function getWorldRestorationState(
  progress: SaveProgress,
  worldId: WorldId
): WorldRestorationState {
  const restored = computeRestoredWorlds(progress);
  return restored.includes(worldId) ? 'restored' : 'unrestored';
}

export function getHubRestorationTier(progress: SaveProgress): HubRestorationTier {
  const restoredWorlds = computeRestoredWorlds(progress);
  const completedCount = progress.completedLevels.length;
  const mainFinaleDone = Boolean(progress.questProgress?.quest_main_6?.completed);
  const firstAwakeningDone = Boolean(progress.questProgress?.quest_main_1?.completed);

  if (restoredWorlds.length >= 4 || completedCount >= 35 || mainFinaleDone) {
    return 'restored';
  }
  if (restoredWorlds.length >= 1 || completedCount >= 3 || firstAwakeningDone) {
    return 'awakening';
  }
  return 'dormant';
}

export function getHubRestorationSummary(tier: HubRestorationTier): {
  title: string;
  badge: string;
  description: string;
} {
  switch (tier) {
    case 'dormant':
      return {
        title: 'Dormant Sanctuary',
        badge: 'State I · Dormant',
        description:
          'The Convergence sleeps beneath muted skies. Complete early islands or speak with Orin to awaken its central beacon.',
      };
    case 'awakening':
      return {
        title: 'Awakening Archipelago',
        badge: 'State II · Awakening',
        description:
          'Light bridges shimmer into view, sanctuary flora blooms, and restored World Portals hum with living resonance.',
      };
    case 'restored':
      return {
        title: 'Living Convergence',
        badge: 'State III · Restored',
        description:
          'Golden energy crowns the Central Crystal spire while beacons, gardens, and all six skyways blaze in harmony.',
      };
  }
}

export function getWorldRestoredVisualBoost(
  worldId: WorldId,
  restored: boolean
): WorldVisualBoost {
  if (!restored) {
    return {
      sunIntensityMult: 0.96,
      ambientIntensityMult: 0.94,
      emissiveMult: 0.9,
      fogNearOffset: -3,
      fogFarOffset: -6,
      waterEmissiveBoost: 0,
      statusLabel: 'Unrestored · Dimmed Horizon',
    };
  }

  switch (worldId) {
    case 'world_1':
      return {
        sunIntensityMult: 1.12,
        ambientIntensityMult: 1.08,
        emissiveMult: 1.25,
        fogNearOffset: 6,
        fogFarOffset: 12,
        waterEmissiveBoost: 0.14,
        statusLabel: 'Restored · Radiant Dawn',
      };
    case 'world_2':
      return {
        sunIntensityMult: 1.1,
        ambientIntensityMult: 1.12,
        emissiveMult: 1.3,
        fogNearOffset: 5,
        fogFarOffset: 10,
        waterEmissiveBoost: 0.18,
        statusLabel: 'Restored · Living Canopy',
      };
    case 'world_3':
      return {
        sunIntensityMult: 1.1,
        ambientIntensityMult: 1.1,
        emissiveMult: 1.28,
        fogNearOffset: 7,
        fogFarOffset: 14,
        waterEmissiveBoost: 0.25,
        statusLabel: 'Restored · Flowing Aqueducts',
      };
    case 'world_4':
      return {
        sunIntensityMult: 1.14,
        ambientIntensityMult: 1.06,
        emissiveMult: 1.38,
        fogNearOffset: 6,
        fogFarOffset: 12,
        waterEmissiveBoost: 0.28,
        statusLabel: 'Restored · Rekindled Forge',
      };
    case 'world_5':
      return {
        sunIntensityMult: 1.12,
        ambientIntensityMult: 1.14,
        emissiveMult: 1.35,
        fogNearOffset: 8,
        fogFarOffset: 16,
        waterEmissiveBoost: 0.22,
        statusLabel: 'Restored · Celestial Resonance',
      };
    case 'world_6':
      return {
        sunIntensityMult: 1.16,
        ambientIntensityMult: 1.16,
        emissiveMult: 1.45,
        fogNearOffset: 10,
        fogFarOffset: 20,
        waterEmissiveBoost: 0.3,
        statusLabel: 'Restored · Prismatic Harmony',
      };
  }
}
