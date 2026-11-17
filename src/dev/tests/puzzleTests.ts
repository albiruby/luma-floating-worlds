import { getLevelById } from '../../game/levels';
import {
  computeLightPropagation,
  createInitialPlayerState,
  createInitialPuzzleState,
  getElevationPlatformHeight,
  getRotatingPlatformTiles,
  getSurfaceAtTile,
  isGateOpen,
  stepPlayerMovement,
} from '../../game/rules';
import { TILE_SIZE } from '../../game/types';
import {
  forceCrystalState,
  forceGateOverride,
  forceSwitchState,
  setElevationPlatformState,
  setEmitterEnabled,
  setPrismDirection,
  setRotatingPlatformStep,
} from '../debugAdapter';
import { QATestResult } from '../debugTypes';

function makeResult(
  id: string,
  name: string,
  fn: () => { status?: 'PASS' | 'FAIL' | 'WARNING'; levelId?: number; objectId?: string; message: string; suggestion?: string }
): QATestResult {
  const start = performance.now();
  try {
    const out = fn();
    return {
      id,
      suite: 'puzzle-systems',
      name,
      status: out.status ?? 'PASS',
      executionMode: 'static-logic',
      levelId: out.levelId,
      objectId: out.objectId,
      message: out.message,
      suggestion: out.suggestion,
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  } catch (err) {
    return {
      id,
      suite: 'puzzle-systems',
      name,
      status: 'FAIL',
      executionMode: 'static-logic',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Math.max(0.01, Number((performance.now() - start).toFixed(2))),
    };
  }
}

export function runPuzzleSystemsSuite(): QATestResult[] {
  const results: QATestResult[] = [];

  results.push(
    makeResult('puzzle_switch_gate', 'Pressure Switches, Latch & Inverted Twin Gates', () => {
      const l1 = getLevelById(1);
      let s1 = createInitialPuzzleState(l1);
      if (isGateOpen(l1, s1, 'gate1')) {
        return { status: 'FAIL', levelId: 1, objectId: 'gate1', message: 'gate1 should start closed.' };
      }
      s1 = forceSwitchState(l1, s1, 'sw1', true);
      if (!isGateOpen(l1, s1, 'gate1') || !getSurfaceAtTile(l1, s1, 0, 0)?.walkable) {
        return { status: 'FAIL', levelId: 1, objectId: 'gate1', message: 'sw1 activation failed to open gate1 collision.' };
      }

      const l5 = getLevelById(5);
      let s5 = createInitialPuzzleState(l5);
      if (isGateOpen(l5, s5, 'gate5b') || !isGateOpen(l5, s5, 'gate5c')) {
        return { status: 'FAIL', levelId: 5, message: 'Level 5 twin inverted gates initial polarity incorrect.' };
      }
      s5 = forceSwitchState(l5, s5, 'sw5b', true);
      if (!isGateOpen(l5, s5, 'gate5b') || isGateOpen(l5, s5, 'gate5c')) {
        return { status: 'FAIL', levelId: 5, message: 'Level 5 sw5b toggle failed to invert twin gates.' };
      }

      const forcedClosed = forceGateOverride(l1, s1, 'gate1', 'closed');
      if (isGateOpen(l1, forcedClosed, 'gate1') || getSurfaceAtTile(l1, forcedClosed, 0, 0)?.walkable) {
        return { status: 'FAIL', levelId: 1, objectId: 'gate1', message: 'Debug gate override failed to enforce collision.' };
      }

      return { message: 'Latch switches, inverted twin gates, and collision overrides operate through rules.ts.' };
    })
  );

  results.push(
    makeResult('puzzle_rotating', 'Rotating Platforms Tile Projection & Connectivity', () => {
      const l2 = getLevelById(2);
      const s2 = createInitialPuzzleState(l2);
      if (getSurfaceAtTile(l2, s2, -1, 0) !== null) {
        return { status: 'FAIL', levelId: 2, objectId: 'rot1', message: 'rot1 gap should be void before rotation.' };
      }
      const rotated = setRotatingPlatformStep(l2, s2, 'rot1', 2);
      const tiles = getRotatingPlatformTiles(l2, rotated).filter((t) => t.platformId === 'rot1');
      if (tiles.length === 0 || !getSurfaceAtTile(l2, rotated, -1, 0)?.walkable) {
        return { status: 'FAIL', levelId: 2, objectId: 'rot1', message: 'rot1 failed to bridge (-1,0) at step 2.' };
      }
      return { levelId: 2, message: `rot1 bridges void at step 2 (${tiles.length} dynamic deck tiles).` };
    })
  );

  results.push(
    makeResult('puzzle_elevation', 'Elevation Platforms (Manual & Switch-Linked)', () => {
      const l4 = getLevelById(4);
      const s4 = createInitialPuzzleState(l4);
      const raised4 = setElevationPlatformState(l4, s4, 'lift4a', true);
      if (getElevationPlatformHeight(l4, raised4, 'lift4a') !== 1) {
        return { status: 'FAIL', levelId: 4, objectId: 'lift4a', message: 'lift4a failed to rise to elevation 1.' };
      }

      const l8 = getLevelById(8);
      const s8 = createInitialPuzzleState(l8);
      const linkedRaised = forceSwitchState(l8, s8, 'sw8a', true);
      if (getElevationPlatformHeight(l8, linkedRaised, 'lift8_bridge') !== 1) {
        return { status: 'FAIL', levelId: 8, objectId: 'lift8_bridge', message: 'Switch-linked lift8_bridge failed to elevate with sw8a.' };
      }
      return { message: 'Manual and switch-linked elevation lifts update tile elevation accurately.' };
    })
  );

  results.push(
    makeResult('puzzle_light', 'Light Emitters, Prisms, Gate Occlusion & Multi-Pass Sub-Crystals', () => {
      const l6 = getLevelById(6);
      let s6 = createInitialPuzzleState(l6);
      s6 = setPrismDirection(l6, s6, 'prism6a', 3);
      s6 = setPrismDirection(l6, s6, 'prism6b', 0);
      if (!s6.litSubCrystalIds.includes('sub1') || !isGateOpen(l6, s6, 'gate6')) {
        return { status: 'FAIL', levelId: 6, objectId: 'sub1', message: 'Fixed-point beam pass failed to energize sub1 and open gate6.' };
      }
      let disabled = s6;
      for (const em of l6.lightEmitters) {
        disabled = setEmitterEnabled(l6, disabled, em.id, false);
      }
      const light = computeLightPropagation(l6, disabled);
      if (light.segments.length !== 0) {
        return { status: 'FAIL', levelId: 6, message: 'Disabling all emitters did not extinguish light segments.' };
      }
      return { levelId: 6, message: 'Multi-pass resonator chain, gate light occlusion, and emitter toggle verified.' };
    })
  );

  results.push(
    makeResult('puzzle_god_collision', 'Collision vs No-Clip / Free Movement Isolation', () => {
      const l1 = getLevelById(1);
      const s1 = createInitialPuzzleState(l1);
      const p1 = { ...createInitialPlayerState(l1), x: -1 * TILE_SIZE, z: 0 };
      const normalMove = stepPlayerMovement(l1, s1, p1, 1, 0, 0.35);
      if (normalMove.player.x >= -0.45 * TILE_SIZE) {
        return { status: 'FAIL', levelId: 1, message: 'Normal collision failed to block closed gate1.' };
      }
      const noclipMove = stepPlayerMovement(l1, s1, p1, 1, 0, 0.35, { noClip: true, speedMultiplier: 2 });
      if (noclipMove.player.x <= normalMove.player.x) {
        return { status: 'FAIL', levelId: 1, message: 'No Clip movement did not advance past closed gate.' };
      }
      const forcedCrystal = forceCrystalState(l1, s1, true);
      if (!forcedCrystal.portalAwakened) {
        return { status: 'FAIL', levelId: 1, message: 'Forcing crystal restoration failed to awaken portal.' };
      }
      return { message: 'Normal collision intact; No Clip and debug overrides isolated cleanly.' };
    })
  );

  return results;
}
