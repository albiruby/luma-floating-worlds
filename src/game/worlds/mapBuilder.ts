import {
  DecorType,
  EchoFragmentDef,
  LevelDef,
  TerrainType,
  TileDef,
  WorldId,
} from '../types';

export function setTile(tiles: TileDef[], patch: TileDef): void {
  const idx = tiles.findIndex((t) => t.x === patch.x && t.z === patch.z);
  if (idx >= 0) {
    tiles[idx] = { ...tiles[idx], ...patch };
  } else {
    tiles.push(patch);
  }
}

export function addRect(
  tiles: TileDef[],
  x1: number,
  x2: number,
  z1: number,
  z2: number,
  elevation: number,
  terrain: TerrainType
): void {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minZ = Math.min(z1, z2);
  const maxZ = Math.max(z1, z2);
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      setTile(tiles, { x, z, elevation, terrain });
    }
  }
}

export function addSpan(
  tiles: TileDef[],
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  elevation: number,
  terrain: TerrainType = 'stone'
): void {
  if (x1 === x2) {
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);
    for (let z = minZ; z <= maxZ; z++) {
      setTile(tiles, { x: x1, z, elevation, terrain });
    }
  } else if (z1 === z2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      setTile(tiles, { x, z: z1, elevation, terrain });
    }
  }
}

export function addDecor(
  tiles: TileDef[],
  x: number,
  z: number,
  elevation: number,
  terrain: TerrainType,
  decor: DecorType,
  blocksMovement = true,
  blocksLight = false
): void {
  setTile(tiles, {
    x,
    z,
    elevation,
    terrain,
    decor,
    blocksMovement,
    blocksLight,
  });
}

export function echoIdForLevel(levelId: number): string {
  return `echo_${String(levelId).padStart(2, '0')}`;
}

export function makeEcho(
  levelId: number,
  x: number,
  z: number,
  elevation: number,
  title: string,
  subtitle: string,
  loreText: string,
  secretHint?: string
): EchoFragmentDef {
  return {
    id: echoIdForLevel(levelId),
    levelId,
    x,
    z,
    elevation,
    title,
    subtitle,
    loreText,
    secretHint,
  };
}

export function makeWorldLevelBase(params: {
  id: number;
  worldId: WorldId;
  stageNumberInWorld: number;
  slug: string;
  title: string;
  subtitle: string;
  objectiveDefault: string;
  objectiveCrystalDone: string;
  subareas: string[];
  isBonusChallenge?: boolean;
}): Pick<
  LevelDef,
  | 'id'
  | 'worldId'
  | 'stageNumberInWorld'
  | 'slug'
  | 'title'
  | 'subtitle'
  | 'objectiveDefault'
  | 'objectiveCrystalDone'
  | 'subareas'
  | 'isBonusChallenge'
> {
  return params;
}
