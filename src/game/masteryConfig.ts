import { LEVELS } from './levels';
import { MasteryTargetConfig } from './types';

/**
 * Calibrated mastery targets for all 60 handcrafted stages across Worlds I-VI.
 *
 * Action targets correspond directly to `PuzzleRuntimeState.interactionsCount`:
 * - +1 ACT when stepping onto an unlatched latch pressure switch
 * - +1 ACT when pressing E/Space on a toggle switch, rotating bridge, lift, prism, or crystal
 * -  0 ACT when using a Hero Node, collecting an Echo Fragment, or entering the awakened portal
 *
 * Time targets:
 * - Stages 01–02 are calibrated directly from verified browser playthroughs (11s and 17s).
 * - Stages 03–60 are derived from optimal traversal distance, mechanism cycles, and prism alignment counts.
 */
export const MASTERY_TARGETS: MasteryTargetConfig[] = [
  // World I: The First Light (1-10, preserved verbatim)
  {
    levelId: 1,
    actionTarget: 2,
    timeTargetSeconds: 18,
    calibrationSource: 'playtested',
    calibrationNote: 'Optimal: latch switch (1) + restore crystal (1) = 2 ACT. Playtested clear ~11s.',
  },
  {
    levelId: 2,
    actionTarget: 5,
    timeTargetSeconds: 26,
    calibrationSource: 'playtested',
    calibrationNote: 'Optimal: rot1 (1) + sw2 (1) + lift1 (1) + rot2 (1) + crystal2 (1) = 5 ACT. Playtested clear ~17s.',
  },
  {
    levelId: 3,
    actionTarget: 10,
    timeTargetSeconds: 38,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal 9 ACT (prism1×2 + sw3 + prism2×2 + lift3 + prism3×3), +1 margin.',
  },
  {
    levelId: 4,
    actionTarget: 4,
    timeTargetSeconds: 28,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal: lift4a (1) + sw4 (1) + lift4b (1) + crystal4 (1) = 4 ACT.',
  },
  {
    levelId: 5,
    actionTarget: 6,
    timeTargetSeconds: 42,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal: sw5a + rot5a + sw5b on + rot5b + sw5b off + crystal5 = 6 ACT.',
  },
  {
    levelId: 6,
    actionTarget: 10,
    timeTargetSeconds: 40,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal 9 ACT across 4 beam prisms (2+2+2+3), +1 margin.',
  },
  {
    levelId: 7,
    actionTarget: 8,
    timeTargetSeconds: 48,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal 7 ACT across 4 islands, +1 margin.',
  },
  {
    levelId: 8,
    actionTarget: 6,
    timeTargetSeconds: 45,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal: rot8a + sw8a + lift8_manual + rot8b + sw8b + crystal8 = 6 ACT.',
  },
  {
    levelId: 9,
    actionTarget: 16,
    timeTargetSeconds: 56,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal 15 ACT across 4 prisms, rotating bridge, switch, and lift, +1 margin.',
  },
  {
    levelId: 10,
    actionTarget: 14,
    timeTargetSeconds: 65,
    calibrationSource: 'provisional',
    calibrationNote: 'Optimal 13 ACT uniting bridges, lifts, resonator & 4 prisms, +1 margin.',
  },

  // World II: Verdant Reach (11-20)
  { levelId: 11, actionTarget: 2, timeTargetSeconds: 20, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw11 (1) + crystal11 (1) = 2 ACT.' },
  { levelId: 12, actionTarget: 5, timeTargetSeconds: 30, calibrationSource: 'provisional', calibrationNote: 'Optimal: rot12a (1) + sw12 (1) + lift12 (1) + rot12b (1) + crystal12 (1) = 5 ACT.' },
  { levelId: 13, actionTarget: 10, timeTargetSeconds: 42, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw13 (1) + lift13 (1) + 3 prisms (2+2+3) = 9 ACT + 1 margin.' },
  { levelId: 14, actionTarget: 4, timeTargetSeconds: 30, calibrationSource: 'provisional', calibrationNote: 'Optimal: lift14a (1) + sw14 (1) + lift14b (1) + crystal14 (1) = 4 ACT.' },
  { levelId: 15, actionTarget: 6, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw15a + rot15a + sw15b on + rot15b + sw5b off + crystal15 = 6 ACT.' },
  { levelId: 16, actionTarget: 10, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across 4 canopy prisms, +1 margin.' },
  { levelId: 17, actionTarget: 4, timeTargetSeconds: 32, calibrationSource: 'provisional', calibrationNote: 'Optimal: lift17a (1) + sw17 (1) + lift17b (1) + crystal17 (1) = 4 ACT.' },
  { levelId: 18, actionTarget: 10, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal: rot18a (1) + sw18a (1) + lift18_manual (1) + rot18b (1) + sw18b (1) + prism18a (2) + prism18b (2) = 9 ACT + 1 margin.' },
  { levelId: 19, actionTarget: 11, timeTargetSeconds: 48, calibrationSource: 'provisional', calibrationNote: 'Optimal: 4 prisms (2+2+2+3) + lift19 (1) = 10 ACT + 1 margin.' },
  { levelId: 20, actionTarget: 15, timeTargetSeconds: 68, calibrationSource: 'provisional', calibrationNote: 'Optimal 14 ACT uniting 2 bridges, switch, lift, resonator & 4 prisms, +1 margin.' },

  // World III: Tidal Expanse (21-30)
  { levelId: 21, actionTarget: 2, timeTargetSeconds: 20, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw21 (1) + crystal21 (1) = 2 ACT.' },
  { levelId: 22, actionTarget: 5, timeTargetSeconds: 30, calibrationSource: 'provisional', calibrationNote: 'Optimal: rot22a + sw22 + lift22 + rot22b + crystal22 = 5 ACT.' },
  { levelId: 23, actionTarget: 10, timeTargetSeconds: 42, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw23 + lift23 + 3 prisms (2+2+3) = 9 ACT + 1 margin.' },
  { levelId: 24, actionTarget: 4, timeTargetSeconds: 30, calibrationSource: 'provisional', calibrationNote: 'Optimal: lift24a + sw24 + lift24b + crystal24 = 4 ACT.' },
  { levelId: 25, actionTarget: 6, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw25a + rot25a + sw25b on + rot25b + sw25b off + crystal25 = 6 ACT.' },
  { levelId: 26, actionTarget: 10, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across 4 lagoon prisms, +1 margin.' },
  { levelId: 27, actionTarget: 8, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal 7 ACT across 4 coral islands + 2 prisms, +1 margin.' },
  { levelId: 28, actionTarget: 10, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across hydro lifts, rotating piers & prisms, +1 margin.' },
  { levelId: 29, actionTarget: 11, timeTargetSeconds: 48, calibrationSource: 'provisional', calibrationNote: 'Optimal 10 ACT across 4 vault prisms + lift, +1 margin.' },
  { levelId: 30, actionTarget: 15, timeTargetSeconds: 68, calibrationSource: 'provisional', calibrationNote: 'Optimal 14 ACT World III finale, +1 margin.' },

  // World IV: Emberfall Dominion (31-40)
  { levelId: 31, actionTarget: 2, timeTargetSeconds: 20, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw31 (1) + crystal31 (1) = 2 ACT.' },
  { levelId: 32, actionTarget: 5, timeTargetSeconds: 30, calibrationSource: 'provisional', calibrationNote: 'Optimal 5 ACT across gear-bridges & lift.' },
  { levelId: 33, actionTarget: 10, timeTargetSeconds: 42, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across kiln prisms + lift, +1 margin.' },
  { levelId: 34, actionTarget: 4, timeTargetSeconds: 30, calibrationSource: 'provisional', calibrationNote: 'Optimal: lift34a + sw34 + lift34b + crystal34 = 4 ACT.' },
  { levelId: 35, actionTarget: 6, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 6 ACT across twin bellows toggle gates.' },
  { levelId: 36, actionTarget: 10, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across 4 forge prisms, +1 margin.' },
  { levelId: 37, actionTarget: 8, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal 7 ACT across 4 volcanic crags, +1 margin.' },
  { levelId: 38, actionTarget: 10, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across piston bridge & prisms, +1 margin.' },
  { levelId: 39, actionTarget: 11, timeTargetSeconds: 48, calibrationSource: 'provisional', calibrationNote: 'Optimal 10 ACT across 4 caldera prisms + lift, +1 margin.' },
  { levelId: 40, actionTarget: 15, timeTargetSeconds: 68, calibrationSource: 'provisional', calibrationNote: 'Optimal 14 ACT World IV finale, +1 margin.' },

  // World V: Celestial Frontier (41-50)
  { levelId: 41, actionTarget: 2, timeTargetSeconds: 22, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw41 (1) + crystal41 (1) = 2 ACT.' },
  { levelId: 42, actionTarget: 5, timeTargetSeconds: 32, calibrationSource: 'provisional', calibrationNote: 'Optimal 5 ACT across L-shaped zephyr bridge & lift.' },
  { levelId: 43, actionTarget: 9, timeTargetSeconds: 42, calibrationSource: 'provisional', calibrationNote: 'Optimal: sw43 (1) + 3 prisms (2+2+3) = 8 ACT + 1 margin.' },
  { levelId: 44, actionTarget: 4, timeTargetSeconds: 32, calibrationSource: 'provisional', calibrationNote: 'Optimal: lift44a + sw44 + lift44b + crystal44 = 4 ACT.' },
  { levelId: 45, actionTarget: 6, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 6 ACT across gale lock cloister.' },
  { levelId: 46, actionTarget: 10, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across 4 astral prisms, +1 margin.' },
  { levelId: 47, actionTarget: 8, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal 7 ACT across 4 cumulus islands, +1 margin.' },
  { levelId: 48, actionTarget: 10, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal 9 ACT across pneumatic sky-step & prisms, +1 margin.' },
  { levelId: 49, actionTarget: 11, timeTargetSeconds: 48, calibrationSource: 'provisional', calibrationNote: 'Optimal 10 ACT across 4 starveil prisms + lift, +1 margin.' },
  { levelId: 50, actionTarget: 15, timeTargetSeconds: 70, calibrationSource: 'provisional', calibrationNote: 'Optimal 14 ACT Grand Campaign Climax, +1 margin.' },

  // World VI: The Echo Trials (51-60 Bonus Challenges)
  { levelId: 51, actionTarget: 9, timeTargetSeconds: 42, calibrationSource: 'provisional', calibrationNote: 'Optimal: rot51 + sw51a + sw51b + prism51a×2 + prism51b×2 + sw51b off = 8 ACT + 1 margin.' },
  { levelId: 52, actionTarget: 6, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal: rot52a + sw52a + lift52a + rot52b + crystal52 + lift52b = 6 ACT.' },
  { levelId: 53, actionTarget: 8, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 7 ACT across reversed paradox prisms, +1 margin.' },
  { levelId: 54, actionTarget: 6, timeTargetSeconds: 38, calibrationSource: 'provisional', calibrationNote: 'Optimal: lift54a + sw54 + lift54b(down) + lift54b(up) + crystal54 = 5 ACT + 1 margin.' },
  { levelId: 55, actionTarget: 6, timeTargetSeconds: 44, calibrationSource: 'provisional', calibrationNote: 'Optimal 6 ACT across dual toggle crosswind locks.' },
  { levelId: 56, actionTarget: 12, timeTargetSeconds: 52, calibrationSource: 'provisional', calibrationNote: 'Optimal: rot56a + sw56 + lift56a + rot56b + prism56a×3 + prism56b×3 = 10-11 ACT + margin.' },
  { levelId: 57, actionTarget: 12, timeTargetSeconds: 52, calibrationSource: 'provisional', calibrationNote: 'Optimal 10-11 ACT across piston bridge & prism vault.' },
  { levelId: 58, actionTarget: 13, timeTargetSeconds: 50, calibrationSource: 'provisional', calibrationNote: 'Optimal: 4 off-axis prisms + lift58 = 12 ACT + 1 margin.' },
  { levelId: 59, actionTarget: 14, timeTargetSeconds: 68, calibrationSource: 'provisional', calibrationNote: 'Optimal 13 ACT across 4-island relay matrix, +1 margin.' },
  { levelId: 60, actionTarget: 14, timeTargetSeconds: 72, calibrationSource: 'provisional', calibrationNote: 'Optimal 13 ACT Ultimate Echo Finale, +1 margin.' },
];

const TARGET_MAP = new Map<number, MasteryTargetConfig>(
  MASTERY_TARGETS.map((cfg) => [cfg.levelId, cfg])
);

export function getMasteryTargetForLevel(levelId: number): MasteryTargetConfig {
  const found = TARGET_MAP.get(levelId);
  if (found) return found;
  const fallback = LEVELS.find((l) => l.id === levelId);
  return {
    levelId: fallback ? fallback.id : levelId,
    actionTarget: 6,
    timeTargetSeconds: 45,
    calibrationSource: 'provisional',
    calibrationNote: 'Default target configuration.',
  };
}
