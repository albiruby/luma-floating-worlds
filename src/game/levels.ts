import { LevelDef } from './types';
import { WORLD1_LEVELS } from './worlds/world1';
import { WORLD2_LEVELS } from './worlds/world2';
import { WORLD3_LEVELS } from './worlds/world3';
import { WORLD4_LEVELS } from './worlds/world4';
import { WORLD5_LEVELS } from './worlds/world5';
import { WORLD6_LEVELS } from './worlds/world6';

export const LEVELS: LevelDef[] = [
  ...WORLD1_LEVELS,
  ...WORLD2_LEVELS,
  ...WORLD3_LEVELS,
  ...WORLD4_LEVELS,
  ...WORLD5_LEVELS,
  ...WORLD6_LEVELS,
];

export function getLevelById(id: number): LevelDef {
  return LEVELS.find((lvl) => lvl.id === id) ?? LEVELS[0];
}
