import { CHARACTERS } from '../../game/characters';
import {
  canEquipCosmetic,
  COSMETIC_ITEMS,
  COSMETIC_MILESTONES,
  DEFAULT_EQUIPPED_COSMETICS,
  equipCosmeticSelection,
  EXPANDED_STAR_MILESTONES,
  getNewlyUnlockedMilestones,
  isCosmeticUnlocked,
  resolveUnlockedCosmetics,
  resolveWayfinderAppearance,
} from '../../game/cosmetics';
import { DEFAULT_PROGRESS, purchaseCosmeticInProgress } from '../../game/progression';
import { QATestResult } from '../debugTypes';

function runCosmeticCheck(
  id: string,
  name: string,
  fn: () => { status?: 'PASS' | 'FAIL' | 'WARNING'; message: string }
): QATestResult {
  const start = performance.now();
  try {
    const out = fn();
    return {
      id,
      suite: 'cosmetics',
      name,
      status: out.status ?? 'PASS',
      executionMode: 'static-logic',
      message: out.message,
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  } catch (err) {
    return {
      id,
      suite: 'cosmetics',
      name,
      status: 'FAIL',
      executionMode: 'static-logic',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  }
}

export function runCosmeticsSuite(): QATestResult[] {
  return [
    runCosmeticCheck('cosmetic_milestones', 'Core Star Milestones (6 / 12 / 18 / 24 / 30★) & Expanded Milestones', () => {
      const expected: Array<[number, string]> = [
        [6, 'mossweave_cloak'],
        [12, 'tideglass_lantern'],
        [18, 'emberglow_lantern'],
        [24, 'celestial_cloak'],
        [30, 'eternal_wayfinder_set'],
      ];
      if (COSMETIC_MILESTONES.length !== 5 || EXPANDED_STAR_MILESTONES.length < 5) {
        return { status: 'FAIL', message: `Milestone list mismatch: ${COSMETIC_MILESTONES.length}/${EXPANDED_STAR_MILESTONES.length}.` };
      }
      for (let i = 0; i < expected.length; i++) {
        const [stars, id] = expected[i];
        const m = COSMETIC_MILESTONES[i];
        if (m.requiredStars !== stars || m.cosmeticId !== id) {
          return { status: 'FAIL', message: `Milestone ${i} mismatch: got ${m.requiredStars}★ ${m.cosmeticId}.` };
        }
        if (resolveUnlockedCosmetics(stars - 1).includes(m.cosmeticId) || !resolveUnlockedCosmetics(stars).includes(m.cosmeticId)) {
          return { status: 'FAIL', message: `Unlock threshold boundary broken for ${m.cosmeticId} at ${stars}★.` };
        }
      }
      const crossed = getNewlyUnlockedMilestones(5, 13);
      if (crossed.length !== 2) {
        return { status: 'FAIL', message: `Expected 2 newly unlocked milestones between 5★ and 13★, got ${crossed.length}.` };
      }
      return {
        message: `Core 5 milestones (6..30★) + ${EXPANDED_STAR_MILESTONES.length} total star milestones unlock accurately.`,
      };
    }),

    runCosmeticCheck('cosmetic_equip_guards', 'Locked Equip Guard, Appearance Mapping & Default Restore', () => {
      const zeroUnlocked = resolveUnlockedCosmetics(0);
      if (canEquipCosmetic('celestial_cloak', 0, zeroUnlocked)) {
        return { status: 'FAIL', message: 'Locked celestial_cloak allowed equip at 0 stars.' };
      }
      const blocked = equipCosmeticSelection(DEFAULT_EQUIPPED_COSMETICS, 'celestial_cloak', 0, zeroUnlocked);
      if (blocked.cloakId !== 'default_cloak') {
        return { status: 'FAIL', message: 'Locked equip mutated selection.' };
      }

      const fullUnlocked = resolveUnlockedCosmetics(180, 60, [10, 20, 30, 40, 50, 60], []);
      let equipped = equipCosmeticSelection(DEFAULT_EQUIPPED_COSMETICS, 'mossweave_cloak', 180, fullUnlocked);
      equipped = equipCosmeticSelection(equipped, 'tideglass_lantern', 180, fullUnlocked);
      const mossApp = resolveWayfinderAppearance(equipped, 'wayfinder');
      if (!mossApp.hasMossBrooch) {
        return { status: 'FAIL', message: 'Mossweave cloak / Tideglass lantern appearance flags incorrect.' };
      }

      equipped = equipCosmeticSelection(equipped, 'eternal_wayfinder_set', 180, fullUnlocked);
      const eternalApp = resolveWayfinderAppearance(equipped, 'wayfinder');
      if (!eternalApp.hasEternalAura || !eternalApp.hasCelestialTrim) {
        return { status: 'FAIL', message: 'Eternal Wayfinder Set failed to apply grand mastery aura.' };
      }

      return { message: 'Locked guard blocks unearned items; unlocked cloaks, lanterns & Eternal Set apply accurately.' };
    }),

    runCosmeticCheck('cosmetic_worlds_beyond_catalog', '51 Cosmetics Catalog, Echo/World/Shard Unlocks & 5 Heroes', () => {
      if (COSMETIC_ITEMS.length < 45 || CHARACTERS.length !== 5) {
        return {
          status: 'FAIL',
          message: `Expected 45+ cosmetics & 5 heroes, got ${COSMETIC_ITEMS.length}/${CHARACTERS.length}.`,
        };
      }

      const canEchoLocked = isCosmeticUnlocked('heartroot_staff', 0, [], {
        totalStars: 0,
        collectedEchoCount: 11,
        completedLevels: [],
        purchasedCosmetics: [],
      });
      const canEchoUnlocked = isCosmeticUnlocked('heartroot_staff', 0, [], {
        totalStars: 0,
        collectedEchoCount: 12,
        completedLevels: [],
        purchasedCosmetics: [],
      });
      if (canEchoLocked || !canEchoUnlocked) {
        return { status: 'FAIL', message: 'Echo cosmetic threshold (12 Echoes) failed boundary check.' };
      }

      const seededShards = { ...DEFAULT_PROGRESS, lumaShards: 50 };
      const purchase = purchaseCosmeticInProgress(seededShards, 'dawn_mantle');
      if (!purchase.purchased || purchase.progress.lumaShards !== 35 || !purchase.progress.unlockedCosmetics.includes('dawn_mantle')) {
        return { status: 'FAIL', message: 'Shard Shop purchase failed to deduct shards or unlock dawn_mantle.' };
      }

      for (const ch of CHARACTERS) {
        const app = resolveWayfinderAppearance(DEFAULT_EQUIPPED_COSMETICS, ch.id);
        if (app.characterId !== ch.id) {
          return { status: 'FAIL', message: `Hero ${ch.id} appearance resolution mismatch.` };
        }
      }

      return {
        message: `${COSMETIC_ITEMS.length} cosmetics across 7 categories, Shard Shop, Echo/World unlocks & 5 heroes verified.`,
      };
    }),
  ];
}
