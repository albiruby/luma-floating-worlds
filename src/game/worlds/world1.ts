import { LevelDef, TileDef } from '../types';
import { addRect, makeEcho, setTile } from './mapBuilder';

function buildLevel1(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, -1, -2, 2, 0, 'grass');
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -1, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: -2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -4, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'grass', decor: 'rock_cluster', blocksMovement: true });
  setTile(tiles, { x: -1, z: 2, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: -1, z: -2, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin' });

  addRect(tiles, 1, 4, -2, 2, 0, 'grass');
  setTile(tiles, { x: 1, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' });

  setTile(tiles, { x: 1, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'grass', decor: 'rock_cluster', blocksMovement: true });
  setTile(tiles, { x: 1, z: 2, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  return {
    id: 1,
    worldId: 'world_1',
    stageNumberInWorld: 1,
    slug: 'the-awakening',
    title: 'The Awakening',
    subtitle: 'Stage 01 · Dawn Meadow',
    objectiveDefault: 'Activate the rune switch to open the bridge gate, then restore the Energy Crystal.',
    objectiveCrystalDone: 'The Energy Crystal shines anew. Enter the awakened portal.',
    subareas: ['West Meadow Landing', 'Rune Switch Spur', 'East Sanctum'],
    spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0, z: 0 },
    cameraZoom: 1.0,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [
      { id: 'sw1', x: -2, z: -2, elevation: 0, latch: true, label: 'Activate Rune Switch' },
    ],
    gates: [
      { id: 'gate1', x: 0, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw1', blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn1',
        kind: 'hidden_rune',
        heroId: 'wayfinder',
        x: -3,
        z: 1,
        elevation: 0,
        label: 'Focus Lantern Shrine',
        bonusShards: 3,
      },
    ],
    echoFragment: makeEcho(
      1,
      -3,
      2,
      0,
      'Ember of First Dawn',
      'Dawn Meadow Memory',
      'Before the islands fractured, pilgrims carried small brass flames from meadow to sanctum to keep the horizon roads lit.'
    ),
    crystal: { id: 'crystal1', x: 2, z: 0, elevation: 0, requiresLightBeam: false, label: 'Restore Energy Crystal' },
    portal: { id: 'portal1', x: 4, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel2(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -1, 2, 0, 'grass');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -5, z: -1, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'grass', decor: 'rock_cluster', blocksMovement: true });

  addRect(tiles, 2, 4, 0, 2, 0, 'grass');
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'grass', decor: 'waterfall', blocksMovement: true });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'grass', decor: 'ruin_arch', blocksMovement: true });

  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 2, z: -3, elevation: 1, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });
  setTile(tiles, { x: 3, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true });

  addRect(tiles, 7, 9, -3, 0, 1, 'grass');
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -2, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: 9, z: -3, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  return {
    id: 2,
    worldId: 'world_1',
    stageNumberInWorld: 2,
    slug: 'the-broken-bridge',
    title: 'The Broken Bridge',
    subtitle: 'Stage 02 · Shattered Causeway',
    objectiveDefault: 'Align the rotating bridges, unlock the ruin gate, and ride the lift to restore the crystal.',
    objectiveCrystalDone: 'Pathways united. Step into the awakened portal.',
    subareas: ['West Entry Isle', 'Waterfall Ruin Hub', 'Upper Sky Terrace', 'East Sanctum'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.2, z: -0.6 },
    cameraZoom: 0.74,
    tiles,
    rotatingPlatforms: [
      { id: 'rot1', pivotX: 0, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: 1 }, label: 'Rotate West Bridge' },
      { id: 'rot2', pivotX: 5, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: -3 }, label: 'Rotate Sky Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw2', x: 4, z: 1, elevation: 0, latch: true, label: 'Activate Ruin Switch' },
    ],
    gates: [
      { id: 'gate2', x: 3, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw2', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift1', x: 2, z: -1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Operate Stone Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      { id: 'hn2', kind: 'hidden_rune', heroId: 'wayfinder', x: 3, z: 1, elevation: 0, label: 'Read Causeway Seal', bonusShards: 3 },
    ],
    echoFragment: makeEcho(
      2,
      2,
      1,
      0,
      'Masonry of the Split',
      'Causeway Archive',
      'When the causeway snapped, engineers mounted gear-hubs into the cliffstone so scattered islands could still turn toward home.'
    ),
    crystal: { id: 'crystal2', x: 8, z: -2, elevation: 1, requiresLightBeam: false, label: 'Restore Energy Crystal' },
    portal: { id: 'portal2', x: 9, z: -1, elevation: 1, facing: 2 },
  };
}

function buildLevel3(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 1, -3, 3, 0, 'stone');
  setTile(tiles, { x: -4, z: 3, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: -4, z: -3, elevation: 0, terrain: 'grass', decor: 'rock_cluster', blocksMovement: true });
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'grass' });
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: 3, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: -1, z: -3, elevation: 0, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' });

  addRect(tiles, 3, 5, -3, -2, 0, 'stone');
  setTile(tiles, { x: 4, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 5, z: -3, elevation: 0, terrain: 'grass', decor: 'ruin_arch', blocksMovement: true });
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'stone', isStair: true });
  setTile(tiles, { x: 4, z: -1, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 5, z: -1, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  addRect(tiles, 3, 5, 0, 2, 1, 'stone');
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 5, z: 2, elevation: 1, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'grass' });

  return {
    id: 3,
    worldId: 'world_1',
    stageNumberInWorld: 3,
    slug: 'the-lightkeeper',
    title: 'The Lightkeeper',
    subtitle: 'Stage 03 · Sky Observatory',
    objectiveDefault: 'Lower the shutter gate and align all three prisms to channel light into the observatory crystal.',
    objectiveCrystalDone: 'The Observatory shines with starlight. Step into the final portal.',
    subareas: ['West Prism Court', 'East Beam Spire', 'Observatory Balcony'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.6, z: -0.3 },
    cameraZoom: 0.78,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [
      { id: 'sw3', x: -2, z: 2, elevation: 0, latch: true, label: 'Open Shutter Gate' },
    ],
    gates: [
      { id: 'gate3', x: 0, z: -1, elevation: 0, axis: 'x', linkedSwitchId: 'sw3', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift3', x: 2, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Operate Observatory Lift' },
    ],
    lightEmitters: [{ id: 'emitter1', x: -3, z: 0, elevation: 0, direction: 0 }],
    lightPrisms: [
      { id: 'prism1', x: 0, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Prism I' },
      { id: 'prism2', x: 0, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Prism II' },
      { id: 'prism3', x: 4, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Prism III' },
    ],
    echoFragment: makeEcho(
      3,
      3,
      2,
      1,
      'Prism-Maker’s Oath',
      'Observatory Balcony',
      'A single beam of truth can travel across broken valleys if the prisms remember the angle of morning light.'
    ),
    crystal: { id: 'crystal3', x: 4, z: 0, elevation: 0, requiresLightBeam: true, label: 'Channel Light into Crystal' },
    portal: { id: 'portal3', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel4(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -3, -1, 0, 2, 0, 'grass');
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'grass', decor: 'waterfall', blocksMovement: true });
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: -1, z: 2, elevation: 0, terrain: 'grass', decor: 'rock_cluster', blocksMovement: true });

  addRect(tiles, 0, 2, -2, 1, 1, 'stone');
  setTile(tiles, { x: 0, z: 1, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });
  setTile(tiles, { x: 1, z: 0, elevation: 1, terrain: 'grass', decor: 'ruin_arch', blocksMovement: true });
  setTile(tiles, { x: 2, z: 0, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: 0, z: -2, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  setTile(tiles, { x: 2, z: -2, elevation: 2, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -1, elevation: 2, terrain: 'stone', isStair: true });

  addRect(tiles, 3, 5, 0, 2, 3, 'grass');
  setTile(tiles, { x: 4, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 1, elevation: 3, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 4, z: 2, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 2, elevation: 3, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: 2, elevation: 3, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });

  return {
    id: 4,
    worldId: 'world_1',
    stageNumberInWorld: 4,
    slug: 'the-ascension',
    title: 'The Ascension',
    subtitle: 'Stage 04 · Vertical Ruins',
    objectiveDefault: 'Ride the stone lifts, unlock the mid-terrace gate, and climb to the summit crystal.',
    objectiveCrystalDone: 'Summit crystal restored. Enter the portal above the clouds.',
    subareas: ['Lower Courtyard', 'Mid Terrace', 'Suspended Sky Bridge', 'Summit Sanctum'],
    spawn: { x: -2, z: 2, facingAngle: Math.PI },
    cameraCenter: { x: 1.0, z: 0.0 },
    cameraZoom: 0.78,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [
      { id: 'sw4', x: 0, z: 1, elevation: 1, latch: true, label: 'Activate Terrace Switch' },
    ],
    gates: [
      { id: 'gate4', x: 1, z: -1, elevation: 1, axis: 'z', linkedSwitchId: 'sw4', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift4a', x: -1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Operate Lower Lift' },
      { id: 'lift4b', x: 2, z: -1, lowElevation: 1, highElevation: 2, initialHigh: false, label: 'Operate Spire Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    echoFragment: makeEcho(
      4,
      3,
      0,
      3,
      'Cloudline Stairways',
      'Summit Terrace',
      'Four tiers above the basin, ancient stonemasons carved lifts powered purely by balanced crystal counterweights.'
    ),
    crystal: { id: 'crystal4', x: 4, z: 1, elevation: 3, requiresLightBeam: false, label: 'Restore Summit Crystal' },
    portal: { id: 'portal4', x: 5, z: 2, elevation: 3, facing: 2 },
  };
}

function buildLevel5(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -2, 2, 0, 'grass');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -4, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -4, z: -2, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: -2, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: -2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -3, z: -1, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  setTile(tiles, { x: -3, z: 1, elevation: 0, terrain: 'water', blocksMovement: true });
  setTile(tiles, { x: -5, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'grass', decor: 'ruin_arch', blocksMovement: true });

  addRect(tiles, 2, 4, -2, 2, 0, 'grass');
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'grass', decor: 'rock_cluster', blocksMovement: true });
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  addRect(tiles, 8, 10, -2, 1, 0, 'grass');
  setTile(tiles, { x: 8, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 9, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 10, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 8, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: 10, z: -2, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: 9, z: 1, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  return {
    id: 5,
    worldId: 'world_1',
    stageNumberInWorld: 5,
    slug: 'the-forgotten-garden',
    title: 'The Forgotten Garden',
    subtitle: 'Stage 05 · Overgrown Sanctuary',
    objectiveDefault: 'Unlock the garden gates, balance the twin toggle gates, and align both bridges to the shrine.',
    objectiveCrystalDone: 'Life returns to the forgotten garden. Step into the portal.',
    subareas: ['West Lily Grove', 'Twin-Gate Courtyard', 'East Garden Shrine'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.5, z: 0 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot5a', pivotX: 0, pivotZ: -2, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: -1 }, label: 'Rotate North Garden Bridge' },
      { id: 'rot5b', pivotX: 6, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 4, z: 2 }, label: 'Rotate Shrine Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw5a', x: -2, z: 2, elevation: 0, latch: true, label: 'Unlock Entry Gate' },
      { id: 'sw5b', x: 2, z: 2, elevation: 0, latch: false, label: 'Toggle Twin Garden Gates' },
    ],
    gates: [
      { id: 'gate5a', x: 2, z: -2, elevation: 0, axis: 'z', linkedSwitchId: 'sw5a', blocksLight: true },
      { id: 'gate5b', x: 4, z: 1, elevation: 0, axis: 'z', linkedSwitchId: 'sw5b', inverted: false, blocksLight: true },
      { id: 'gate5c', x: 4, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw5b', inverted: true, blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    echoFragment: makeEcho(
      5,
      8,
      1,
      0,
      'Lotus of Still Ponds',
      'Shrine Reflecting Edge',
      'Every pond on the Forgotten Garden feeds roots planted before Sylvi crossed over from Verdant Reach.'
    ),
    crystal: { id: 'crystal5', x: 9, z: -1, elevation: 0, requiresLightBeam: false, label: 'Restore Garden Heart' },
    portal: { id: 'portal5', x: 10, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel6(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 4, -4, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: -4, z: -4, elevation: 0, terrain: 'grass', decor: 'rock_cluster', blocksMovement: true });
  setTile(tiles, { x: 4, z: -4, elevation: 0, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'grass' });
  setTile(tiles, { x: 1, z: 2, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: 0, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 3, 5, 1, 2, 1, 'stone');
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 5, z: 1, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 5, z: 2, elevation: 1, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'grass' });

  return {
    id: 6,
    worldId: 'world_1',
    stageNumberInWorld: 6,
    slug: 'the-crystal-maze',
    title: 'The Crystal Maze',
    subtitle: 'Stage 06 · Prismatic Nexus',
    objectiveDefault: 'Channel the first beam into the Resonator Crystal to unlock the cross-beam, then ignite the Central Crystal.',
    objectiveCrystalDone: 'Twin beams harmonized. Ascend the crystal stairs to the portal.',
    subareas: ['North Beam Gallery', 'Central Resonator', 'Upper Balcony'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.5, z: -1.0 },
    cameraZoom: 0.74,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [
      { id: 'gate6', x: 0, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub1', blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [
      { id: 'emitter6a', x: -4, z: 1, elevation: 0, direction: 0 },
      { id: 'emitter6b', x: 0, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism6a', x: -1, z: 1, elevation: 0, initialDirection: 1, label: 'Rotate Prism I' },
      { id: 'prism6b', x: -1, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Prism II' },
      { id: 'prism6c', x: 0, z: 0, elevation: 0, initialDirection: 2, label: 'Rotate Prism III' },
      { id: 'prism6d', x: 3, z: 0, elevation: 0, initialDirection: 0, label: 'Rotate Prism IV' },
    ],
    subCrystals: [{ id: 'sub1', x: 2, z: -3, elevation: 0, label: 'Resonator Crystal' }],
    echoFragment: makeEcho(
      6,
      3,
      2,
      1,
      'Resonator Harmonics',
      'Nexus Balcony',
      'Secondary resonator crystals store excess skyfire and answer only when primary prisms hum in unison.'
    ),
    crystal: { id: 'crystal6', x: 3, z: -2, elevation: 0, requiresLightBeam: true, label: 'Ignite Central Crystal' },
    portal: { id: 'portal6', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel7(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'grass');
  setTile(tiles, { x: -5, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'grass', decor: 'waterfall', blocksMovement: true });
  setTile(tiles, { x: -6, z: -1, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });

  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 0, z: -2, elevation: 1, terrain: 'grass', decor: 'ruin_arch', blocksMovement: true });
  setTile(tiles, { x: 2, z: -3, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  addRect(tiles, 6, 8, -3, 2, 1, 'stone');
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: 8, z: 0, elevation: 1, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });

  addRect(tiles, 3, 4, 0, 2, 1, 'grass');
  setTile(tiles, { x: 4, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: 0, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  return {
    id: 7,
    worldId: 'world_1',
    stageNumberInWorld: 7,
    slug: 'the-shattered-realm',
    title: 'The Shattered Realm',
    subtitle: 'Stage 07 · Four-Isle Convergence',
    objectiveDefault: 'Bridge the shattered archipelago, unlock the central spire, and beam light across the sky chasm.',
    objectiveCrystalDone: 'All four islands resonate in harmony. Enter the sanctuary portal.',
    subareas: ['West Cliff', 'Central Hub', 'East Light Spire', 'South Sanctuary'],
    spawn: { x: -5, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.0, z: -0.3 },
    cameraZoom: 0.64,
    tiles,
    rotatingPlatforms: [
      { id: 'rot7a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate West Chasm Bridge' },
      { id: 'rot7b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Upper Sky Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw7', x: 0, z: 2, elevation: 0, latch: true, label: 'Unlock Central Spire Gate' },
    ],
    gates: [
      { id: 'gate7', x: 2, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw7', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift7a', x: 1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Operate Hub Lift' },
      { id: 'lift7b', x: 5, z: 2, lowElevation: 0, highElevation: 1, initialHigh: true, label: 'Operate Sanctuary Bridge Lift' },
    ],
    lightEmitters: [{ id: 'emitter7', x: 8, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism7a', x: 6, z: -3, elevation: 1, initialDirection: 3, label: 'Rotate Spire Prism I' },
      { id: 'prism7b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Spire Prism II' },
    ],
    echoFragment: makeEcho(
      7,
      7,
      2,
      1,
      'Four-Isle Pact',
      'Spire South Overlook',
      'When the realm split into four drifting plates, watchkeepers cast synchronized bridges from east to south.'
    ),
    crystal: { id: 'crystal7', x: 4, z: 1, elevation: 1, requiresLightBeam: true, label: 'Channel Light to Sanctuary Crystal' },
    portal: { id: 'portal7', x: 3, z: 2, elevation: 1, facing: 0 },
  };
}

function buildLevel8(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -3, -1, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -3, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'grass', decor: 'forge_gear', blocksMovement: true });
  setTile(tiles, { x: -5, z: -1, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  addRect(tiles, 0, 2, 0, 2, 0, 'stone');
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 1, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'grass', decor: 'forge_gear', blocksMovement: true });
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  setTile(tiles, { x: -1, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: -1, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 2, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'grass', decor: 'forge_gear', blocksMovement: true });

  addRect(tiles, 6, 8, -3, 2, 1, 'stone');
  setTile(tiles, { x: 6, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 8, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 7, z: 2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 6, z: 2, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'grass', decor: 'forge_gear', blocksMovement: true });

  return {
    id: 8,
    worldId: 'world_1',
    stageNumberInWorld: 8,
    slug: 'the-skyforge',
    title: 'The Skyforge',
    subtitle: 'Stage 08 · Celestial Foundry',
    objectiveDefault: 'Power the Skyforge hydraulic bridge, coordinate the gear walkways, and unlock the anvil core.',
    objectiveCrystalDone: 'The Skyforge burns bright once more. Enter the awakened portal.',
    subareas: ['West Forge Dock', 'Lower Crucible', 'Upper Catwalk', 'Anvil Island'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: -0.3 },
    cameraZoom: 0.64,
    tiles,
    rotatingPlatforms: [
      { id: 'rot8a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -3, z: 1 }, label: 'Rotate Foundry Intake Bridge' },
      { id: 'rot8b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 2, z: -3 }, label: 'Rotate Anvil Gear Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw8a', x: 1, z: 2, elevation: 0, latch: true, label: 'Raise Crucible Lift-Bridge' },
      { id: 'sw8b', x: 8, z: -2, elevation: 1, latch: true, label: 'Unlock Anvil Core Gate' },
    ],
    gates: [
      { id: 'gate8b', x: 7, z: -1, elevation: 1, axis: 'x', linkedSwitchId: 'sw8b', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift8_manual', x: -1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Operate Crucible Lift' },
      { id: 'lift8_bridge', x: 0, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, linkedSwitchId: 'sw8a', label: 'Crucible Lift-Bridge' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    echoFragment: makeEcho(
      8,
      -4,
      2,
      0,
      'Blueprint of Bronze Gears',
      'Foundry Intake Corner',
      'The Skyforge stamped brass gear-rings for every rotating causeway from The First Light to Emberfall.'
    ),
    crystal: { id: 'crystal8', x: 7, z: 0, elevation: 1, requiresLightBeam: false, label: 'Ignite Skyforge Core' },
    portal: { id: 'portal8', x: 7, z: 2, elevation: 1, facing: 3 },
  };
}

function buildLevel9(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -1, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -5, z: -1, elevation: 0, terrain: 'grass', decor: 'celestial_orrery', blocksMovement: true });
  setTile(tiles, { x: -4, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });

  addRect(tiles, 2, 5, -2, 2, 0, 'stone');
  setTile(tiles, { x: 6, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 6, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 6, z: 2, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 4, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 5, z: -2, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'grass', decor: 'ruin_pillar', blocksMovement: true });

  addRect(tiles, 2, 6, -4, -3, 1, 'stone');
  setTile(tiles, { x: 4, z: -4, elevation: 1, terrain: 'grass', decor: 'celestial_orrery', blocksMovement: true });
  setTile(tiles, { x: 2, z: -4, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 6, z: -4, elevation: 1, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });

  return {
    id: 9,
    worldId: 'world_1',
    stageNumberInWorld: 9,
    slug: 'the-celestial-observatory',
    title: 'The Celestial Observatory',
    subtitle: 'Stage 09 · Starlight Lens',
    objectiveDefault: 'Bridge the chasm, align all four celestial prisms through the shutter gate, and ascend to the telescope gallery.',
    objectiveCrystalDone: 'Starlight fills the observatory. Ascend via the northern lift to the portal.',
    subareas: ['West Star Deck', 'Orrery Plaza', 'Telescope Gallery'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.8, z: -0.8 },
    cameraZoom: 0.66,
    tiles,
    rotatingPlatforms: [
      { id: 'rot9', pivotX: 0, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: 1 }, label: 'Rotate Starlight Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw9', x: 2, z: 2, elevation: 0, latch: true, label: 'Open Observatory Shutter' },
    ],
    gates: [
      { id: 'gate9', x: 3, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw9', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift9', x: 2, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Operate Telescope Lift' },
    ],
    lightEmitters: [{ id: 'emitter9', x: -4, z: -1, elevation: 0, direction: 0 }],
    lightPrisms: [
      { id: 'prism9a', x: -2, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Deck Prism I' },
      { id: 'prism9b', x: 2, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Plaza Prism II' },
      { id: 'prism9c', x: 4, z: -1, elevation: 0, initialDirection: 2, label: 'Rotate Plaza Prism III' },
      { id: 'prism9d', x: 4, z: 1, elevation: 0, initialDirection: 1, label: 'Rotate Plaza Prism IV' },
    ],
    echoFragment: makeEcho(
      9,
      5,
      -4,
      1,
      'Chart of the Beyond',
      'Telescope Gallery Rim',
      'Through this celestial lens, astronomers first spotted five distant horizons lying far past the Dawn Archipelago.'
    ),
    crystal: { id: 'crystal9', x: 6, z: 1, elevation: 0, requiresLightBeam: true, label: 'Channel Starlight into Crystal' },
    portal: { id: 'portal9', x: 6, z: -3, elevation: 1, facing: 2 },
  };
}

function buildLevel10(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'grass');
  setTile(tiles, { x: -5, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: -6, z: 2, elevation: 0, terrain: 'grass', decor: 'waterfall', blocksMovement: true });
  setTile(tiles, { x: -6, z: -1, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });

  addRect(tiles, 0, 3, -3, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 0, z: 2, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  setTile(tiles, { x: 1, z: -3, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });

  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true });

  addRect(tiles, 7, 9, -2, 3, 1, 'stone');
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true });
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 9, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true });
  setTile(tiles, { x: 8, z: 3, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 7, z: 3, elevation: 1, terrain: 'grass', decor: 'waterfall', blocksMovement: true });
  setTile(tiles, { x: 9, z: 3, elevation: 1, terrain: 'grass', decor: 'waterfall', blocksMovement: true });
  setTile(tiles, { x: 8, z: -2, elevation: 1, terrain: 'grass', decor: 'celestial_orrery', blocksMovement: true });
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 9, z: -2, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  return {
    id: 10,
    worldId: 'world_1',
    stageNumberInWorld: 10,
    slug: 'the-eternal-light',
    title: 'The Eternal Light',
    subtitle: 'Stage 10 · Central Sanctuary',
    objectiveDefault: 'Unite all four disciplines: bridge the courtyard, awaken the Resonator Crystal to unlock the upper sanctuary, and channel the Eternal Light.',
    objectiveCrystalDone: 'The Eternal Crystal blazes! Step into the portal to unlock Verdant Reach and meet Sylvi.',
    subareas: ['West Approach', 'Resonator Courtyard', 'Upper Lift Ring', 'Eternal Sanctuary'],
    spawn: { x: -5, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: 0.2 },
    cameraZoom: 0.58,
    tiles,
    rotatingPlatforms: [
      { id: 'rot10a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Approach Bridge' },
      { id: 'rot10b', pivotX: 5, pivotZ: 1, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: 2 }, label: 'Rotate Sanctuary Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw10a', x: 2, z: 2, elevation: 0, latch: true, label: 'Open Courtyard Shutter' },
    ],
    gates: [
      { id: 'gate10a', x: 1, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw10a', blocksLight: true },
      { id: 'gate10b', x: 2, z: 1, elevation: 1, axis: 'z', linkedSubCrystalId: 'sub10', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift10', x: 1, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Operate Sanctuary Lift' },
    ],
    lightEmitters: [
      { id: 'emitter10a', x: 0, z: -3, elevation: 0, direction: 1 },
      { id: 'emitter10b', x: 7, z: -1, elevation: 1, direction: 0 },
    ],
    lightPrisms: [
      { id: 'prism10a', x: 0, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Courtyard Prism I' },
      { id: 'prism10b', x: 3, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Courtyard Prism II' },
      { id: 'prism10c', x: 9, z: -1, elevation: 1, initialDirection: 2, label: 'Rotate Sanctuary Prism III' },
      { id: 'prism10d', x: 9, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Sanctuary Prism IV' },
    ],
    subCrystals: [{ id: 'sub10', x: 3, z: -3, elevation: 0, label: 'Sanctuary Resonator' }],
    echoFragment: makeEcho(
      10,
      7,
      2,
      1,
      'Gate to Verdant Reach',
      'Eternal Sanctuary Terrace',
      'As the First Light relit, wind carried maple spores and root-song from the canopy islands of Verdant Reach.'
    ),
    crystal: { id: 'crystal10', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken the Eternal Crystal' },
    portal: { id: 'portal10', x: 8, z: 3, elevation: 1, facing: 3 },
  };
}

export const WORLD1_LEVELS: LevelDef[] = [
  buildLevel1(),
  buildLevel2(),
  buildLevel3(),
  buildLevel4(),
  buildLevel5(),
  buildLevel6(),
  buildLevel7(),
  buildLevel8(),
  buildLevel9(),
  buildLevel10(),
];
