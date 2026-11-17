import { LevelDef, TileDef } from '../types';
import { addDecor, addRect, makeEcho, setTile } from './mapBuilder';

function buildLevel11(): LevelDef {
  const tiles: TileDef[] = [];
  // Subarea 1: Arrival Glade (elev 0)
  addRect(tiles, -6, -2, -2, 2, 0, 'moss');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: -2, elevation: 0, terrain: 'ruin' }); // sw11
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin' }); // gate11
  addDecor(tiles, -6, -2, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, -6, 2, 0, 'moss', 'rock_cluster');
  addDecor(tiles, -2, -2, 0, 'moss', 'stone_lantern');
  addDecor(tiles, -2, 2, 0, 'moss', 'tree_broad');

  // Subarea 2: Mid Canopy Isle (elev 1) + South Echo Alcove
  addRect(tiles, 0, 3, -2, 2, 1, 'wood');
  setTile(tiles, { x: 0, z: 0, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: 0, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 0, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 0, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank11
  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 2, elevation: 1, terrain: 'stone', isStair: true });
  setTile(tiles, { x: 2, z: 3, elevation: 2, terrain: 'moss' }); // Echo alcove elev 2
  addDecor(tiles, 0, -2, 1, 'moss', 'verdant_arch');
  addDecor(tiles, 3, -2, 1, 'moss', 'waterfall');
  addDecor(tiles, 3, 2, 1, 'moss', 'tree_pine');

  // Subarea 3: East Mosshill Shrine (elev 1)
  addRect(tiles, 7, 10, -2, 2, 1, 'moss');
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: 0, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal11
  setTile(tiles, { x: 8, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 9, z: 0, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 10, z: 0, elevation: 1, terrain: 'ruin' }); // portal11
  addDecor(tiles, 7, -2, 1, 'moss', 'ancient_root_tree');
  addDecor(tiles, 10, -2, 1, 'moss', 'stone_lantern');
  addDecor(tiles, 10, 2, 1, 'moss', 'rock_cluster');
  addDecor(tiles, 7, 2, 1, 'moss', 'tree_broad');

  return {
    id: 11,
    worldId: 'world_2',
    stageNumberInWorld: 1,
    slug: 'canopy-threshold',
    title: 'Canopy Threshold',
    subtitle: 'Stage 11 · Verdant Reach',
    objectiveDefault: 'Unlock the moss gate, ride the canopy lift, and turn the timber bridge toward the shrine.',
    objectiveCrystalDone: 'Canopy roots stir awake. Enter the emerald portal.',
    subareas: ['Arrival Glade', 'Mid Canopy Isle', 'South Echo Loft', 'Mosshill Shrine'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: 0 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot11', pivotX: 5, pivotZ: 0, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: 1 }, label: 'Rotate Canopy Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw11', x: -3, z: -2, elevation: 0, latch: true, label: 'Wake Root Gate' },
    ],
    gates: [
      { id: 'gate11', x: -2, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw11', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift11', x: -1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Canopy Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn11',
        kind: 'root_bridge',
        heroId: 'sylvi',
        x: -3,
        z: 2,
        elevation: 0,
        label: 'Rootcall: Weave Moss Shortcut',
        bridgeTiles: [{ x: -1, z: 2, elevation: 1, terrain: 'wood' }],
        bonusShards: 4,
      },
    ],
    echoFragment: makeEcho(
      11,
      2,
      3,
      2,
      'Whisper of First Leaves',
      'South Echo Loft',
      'Sylvi’s people wove hanging timber ways so travelers could cross above flooded forest basins.'
    ),
    crystal: { id: 'crystal11', x: 8, z: 0, elevation: 1, requiresLightBeam: false, label: 'Restore Canopy Crystal' },
    portal: { id: 'portal11', x: 10, z: 0, elevation: 1, facing: 2 },
  };
}

function buildLevel12(): LevelDef {
  const tiles: TileDef[] = [];
  // West Birch Grove (elev 0)
  addRect(tiles, -6, -3, -2, 3, 0, 'moss');
  setTile(tiles, { x: -5, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: 1, elevation: 0, terrain: 'ruin' }); // gate12a
  setTile(tiles, { x: -5, z: -2, elevation: 0, terrain: 'ruin' }); // sw12a
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank12
  setTile(tiles, { x: -4, z: -1, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  addDecor(tiles, -6, -2, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, -6, 3, 0, 'moss', 'tree_broad');
  addDecor(tiles, -3, -2, 0, 'moss', 'waterfall');

  // Central Pond Atrium (elev 0)
  addRect(tiles, 1, 4, -2, 3, 0, 'moss');
  setTile(tiles, { x: 1, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'water', blocksMovement: true });
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'water', blocksMovement: true });
  setTile(tiles, { x: 3, z: 1, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  setTile(tiles, { x: 1, z: 3, elevation: 0, terrain: 'ruin' }); // sw12b
  setTile(tiles, { x: 4, z: -1, elevation: 0, terrain: 'ruin' }); // gate12b
  addDecor(tiles, 3, -2, 0, 'moss', 'tree_pine');
  setTile(tiles, { x: 1, z: -2, elevation: 0, terrain: 'moss', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'moss', decor: 'rock_cluster', blocksMovement: true });
  addDecor(tiles, 4, 3, 0, 'moss', 'verdant_arch');

  // Suspended Timber Walk (elev 1)
  addRect(tiles, 5, 7, -3, -1, 1, 'wood');
  setTile(tiles, { x: 5, z: -3, elevation: 1, terrain: 'moss' }); // Echo 12
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'stone', isStair: true });
  addDecor(tiles, 7, -3, 1, 'moss', 'waterfall');

  // East Canopy Crown (elev 2)
  addRect(tiles, 6, 9, 1, 3, 2, 'moss');
  setTile(tiles, { x: 7, z: 1, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 7, z: 2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 8, z: 2, elevation: 2, terrain: 'ruin', blocksMovement: true }); // crystal12
  setTile(tiles, { x: 8, z: 1, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 9, z: 1, elevation: 2, terrain: 'ruin' }); // portal12
  addDecor(tiles, 6, 3, 2, 'moss', 'ancient_root_tree');
  addDecor(tiles, 9, 3, 2, 'moss', 'stone_lantern');

  return {
    id: 12,
    worldId: 'world_2',
    stageNumberInWorld: 2,
    slug: 'living-timberway',
    title: 'Living Timberway',
    subtitle: 'Stage 12 · Verdant Reach',
    objectiveDefault: 'Open both grove gates, swing the causeway around the lily atrium, and climb to the canopy crown.',
    objectiveCrystalDone: 'The canopy heart blooms. Step through the awakened portal.',
    subareas: ['Birch Grove', 'Lily Atrium', 'Timber Walk', 'Canopy Crown'],
    spawn: { x: -5, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: 0.2 },
    cameraZoom: 0.56,
    tiles,
    rotatingPlatforms: [
      { id: 'rot12', pivotX: -1, pivotZ: 1, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -3, z: 2 }, label: 'Rotate Atrium Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw12a', x: -5, z: -2, elevation: 0, latch: true, label: 'Open Birch Gate' },
      { id: 'sw12b', x: 1, z: 3, elevation: 0, latch: true, label: 'Open Atrium Gate' },
    ],
    gates: [
      { id: 'gate12a', x: -3, z: 1, elevation: 0, axis: 'z', linkedSwitchId: 'sw12a', blocksLight: true },
      { id: 'gate12b', x: 4, z: -1, elevation: 0, axis: 'x', linkedSwitchId: 'sw12b', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift12a', x: 4, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Timber Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn12',
        kind: 'root_bridge',
        heroId: 'sylvi',
        x: 4,
        z: 1,
        elevation: 0,
        label: 'Rootcall: Grow Atrium Span',
        bridgeTiles: [{ x: 5, z: 1, elevation: 1, terrain: 'wood' }],
        bonusShards: 4,
      },
    ],
    echoFragment: makeEcho(
      12,
      5,
      -3,
      1,
      'Heartwood Span',
      'North Timber Terrace',
      'Living boughs anchor beneath carved planks, healing cracks whenever rain drifts across Verdant Reach.'
    ),
    crystal: { id: 'crystal12', x: 8, z: 2, elevation: 2, requiresLightBeam: false, label: 'Restore Canopy Heart' },
    portal: { id: 'portal12', x: 9, z: 1, elevation: 2, facing: 2 },
  };
}

function buildLevel13(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 5, -3, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'moss' });
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'ruin' }); // sw13
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter13
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism13a
  setTile(tiles, { x: -1, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism13b
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'ruin' }); // gate13
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism13c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal13
  addDecor(tiles, -4, -3, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, 0, 2, 0, 'moss', 'pond_lily');
  addDecor(tiles, 1, -3, 0, 'moss', 'verdant_arch');
  addDecor(tiles, 5, -3, 0, 'moss', 'stone_lantern');

  setTile(tiles, { x: 5, z: 0, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 6, 8, -2, 2, 1, 'moss');
  setTile(tiles, { x: 6, z: 0, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 7, z: 1, elevation: 1, terrain: 'ruin' }); // portal13
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' }); // echo13
  addDecor(tiles, 8, 2, 1, 'moss', 'tree_broad');
  addDecor(tiles, 8, -2, 1, 'moss', 'waterfall');

  return {
    id: 13,
    worldId: 'world_2',
    stageNumberInWorld: 3,
    slug: 'dewdrop-cloister',
    title: 'Dewdrop Cloister',
    subtitle: 'Stage 13 · Verdant Reach',
    objectiveDefault: 'Unlatch the cloister shutter and aim all three moss-rimmed prisms into the courtyard crystal.',
    objectiveCrystalDone: 'Sunbeams pierce the canopy mist. Climb the eastern stair to the portal.',
    subareas: ['Cloister Prism Court', 'East Waterfall Terrace'],
    spawn: { x: -4, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: -0.4 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [
      { id: 'sw13', x: -3, z: 2, elevation: 0, latch: true, label: 'Open Cloister Shutter' },
    ],
    gates: [
      { id: 'gate13', x: 2, z: -2, elevation: 0, axis: 'z', linkedSwitchId: 'sw13', blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [{ id: 'emitter13', x: -4, z: 1, elevation: 0, direction: 0 }],
    lightPrisms: [
      { id: 'prism13a', x: -1, z: 1, elevation: 0, initialDirection: 1, label: 'Rotate Prism I' },
      { id: 'prism13b', x: -1, z: -2, elevation: 0, initialDirection: 2, label: 'Rotate Prism II' },
      { id: 'prism13c', x: 4, z: -2, elevation: 0, initialDirection: 2, label: 'Rotate Prism III' },
    ],
    heroNodes: [
      { id: 'hn13', kind: 'root_bridge', heroId: 'sylvi', x: 2, z: 1, elevation: 0, label: 'Rootcall: Bloom Cloister Vines', bonusShards: 4 },
    ],
    echoFragment: makeEcho(
      13,
      7,
      -2,
      1,
      'Dew-Prism Refraction',
      'East Terrace Waterfall',
      'Mornings in Dewdrop Cloister split white skybeams into warm leaf-green and gold across the mist.'
    ),
    crystal: { id: 'crystal13', x: 4, z: 1, elevation: 0, requiresLightBeam: true, label: 'Light Cloister Crystal' },
    portal: { id: 'portal13', x: 7, z: 1, elevation: 1, facing: 2 },
  };
}

function buildLevel14(): LevelDef {
  const tiles: TileDef[] = [];
  // Tier 0: Base Root Hollow
  addRect(tiles, -4, -1, -2, 2, 0, 'moss');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  addDecor(tiles, -4, -2, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, -4, 2, 0, 'moss', 'rock_cluster');

  // Tier 1: Mossy Bough (elev 1)
  addRect(tiles, 0, 3, -2, 2, 1, 'moss');
  setTile(tiles, { x: 2, z: 2, elevation: 1, terrain: 'ruin' }); // sw14
  setTile(tiles, { x: 2, z: -1, elevation: 1, terrain: 'ruin' }); // gate14
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'moss', decor: 'tree_pine', blocksMovement: true });
  setTile(tiles, { x: 1, z: 0, elevation: 1, terrain: 'moss', decor: 'verdant_arch', blocksMovement: true });
  setTile(tiles, { x: 3, z: 0, elevation: 1, terrain: 'moss', decor: 'stone_lantern', blocksMovement: true });
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'moss', decor: 'rock_cluster', blocksMovement: true });

  // Tier 2: High Timber Ring (elev 2)
  addRect(tiles, 4, 6, -3, 0, 2, 'wood');
  setTile(tiles, { x: 4, z: -3, elevation: 2, terrain: 'ruin', blocksMovement: true }); // crank14
  setTile(tiles, { x: 4, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 5, z: -1, elevation: 2, terrain: 'stone' });
  addDecor(tiles, 6, -3, 2, 'moss', 'waterfall');

  // Stair at (5, 3) elev 2 -> Crown Altar elev 3
  setTile(tiles, { x: 5, z: 3, elevation: 2, terrain: 'stone', isStair: true });

  // Tier 3: Crown Altar (elev 3)
  addRect(tiles, 4, 7, 4, 6, 3, 'moss');
  setTile(tiles, { x: 5, z: 4, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 5, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 6, z: 5, elevation: 3, terrain: 'ruin', blocksMovement: true }); // crystal14
  setTile(tiles, { x: 7, z: 4, elevation: 3, terrain: 'ruin' }); // portal14
  setTile(tiles, { x: 4, z: 6, elevation: 3, terrain: 'stone' }); // echo14
  addDecor(tiles, 7, 6, 3, 'moss', 'ancient_root_tree');

  return {
    id: 14,
    worldId: 'world_2',
    stageNumberInWorld: 4,
    slug: 'hollow-trunk-ascent',
    title: 'Hollow Trunk Ascent',
    subtitle: 'Stage 14 · Verdant Reach',
    objectiveDefault: 'Ascend through all four canopy tiers using twin lifts and the high timber bridge.',
    objectiveCrystalDone: 'Light crowns the great trunk. Enter the summit portal.',
    subareas: ['Base Root Hollow', 'Mossy Bough', 'High Timber Ring', 'Crown Altar'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: 1.5 },
    cameraZoom: 0.56,
    tiles,
    rotatingPlatforms: [
      { id: 'rot14', pivotX: 5, pivotZ: 1, elevation: 2, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 0, crankPos: { x: 4, z: -3 }, label: 'Turn High Timber Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw14', x: 2, z: 2, elevation: 1, latch: true, label: 'Open Bough Gate' },
    ],
    gates: [
      { id: 'gate14', x: 2, z: -1, elevation: 1, axis: 'z', linkedSwitchId: 'sw14', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift14a', x: -1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Root Lift' },
      { id: 'lift14b', x: 3, z: -2, lowElevation: 1, highElevation: 2, initialHigh: false, label: 'Raise Timber Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn14',
        kind: 'root_bridge',
        heroId: 'sylvi',
        x: 3,
        z: 2,
        elevation: 1,
        label: 'Rootcall: Lift BoughShortcut',
        bridgeTiles: [
          { x: 4, z: 2, elevation: 2, terrain: 'wood' },
          { x: 4, z: 3, elevation: 2, terrain: 'wood' },
        ],
        bonusShards: 4,
      },
    ],
    echoFragment: makeEcho(
      14,
      4,
      6,
      3,
      'Rings of Four Ages',
      'Summit Canopy Rim',
      'Four concentric bark layers trace each century since the sky-grove lifted free of the sea.'
    ),
    crystal: { id: 'crystal14', x: 6, z: 5, elevation: 3, requiresLightBeam: false, label: 'Restore Crown Crystal' },
    portal: { id: 'portal14', x: 7, z: 4, elevation: 3, facing: 2 },
  };
}

function buildLevel15(): LevelDef {
  const tiles: TileDef[] = [];
  // West Isle
  addRect(tiles, -6, -3, -2, 2, 0, 'moss');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin' }); // sw15a
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank15a
  addDecor(tiles, -6, -2, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, -6, 2, 0, 'moss', 'tree_pine');

  // Central Isle
  addRect(tiles, 1, 4, -2, 2, 0, 'moss');
  setTile(tiles, { x: 1, z: 0, elevation: 0, terrain: 'ruin' }); // gate15a
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw15b toggle
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'ruin' }); // gate15b
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank15b
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' }); // gate15c inverted
  addDecor(tiles, 3, -2, 0, 'moss', 'waterfall');
  addDecor(tiles, 3, 0, 0, 'moss', 'rock_cluster');
  addDecor(tiles, 1, 2, 0, 'moss', 'tree_broad');
  addDecor(tiles, 1, -2, 0, 'moss', 'stone_lantern');

  // East Seed Vault (elev 0 & Summit elev 1)
  addRect(tiles, 8, 10, -2, 2, 0, 'moss');
  setTile(tiles, { x: 8, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 10, z: -2, elevation: 0, terrain: 'stone' }); // echo15
  addRect(tiles, 9, 11, 1, 3, 1, 'stone');
  setTile(tiles, { x: 10, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal15
  setTile(tiles, { x: 11, z: 2, elevation: 1, terrain: 'ruin' }); // portal15
  addDecor(tiles, 9, 3, 1, 'moss', 'verdant_arch');

  return {
    id: 15,
    worldId: 'world_2',
    stageNumberInWorld: 5,
    slug: 'bramble-twin-locks',
    title: 'Bramble Twin-Locks',
    subtitle: 'Stage 15 · Verdant Reach',
    objectiveDefault: 'Balance the opposing toggle gates to rotate the shrine bridge, then reverse them to enter the Seed Vault.',
    objectiveCrystalDone: 'Twin locks yield to harmony. Ascend to the Seed Vault portal.',
    subareas: ['West Fern Landing', 'Twin-Gate Courtyard', 'East Seed Vault', 'Vault Summit'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.5, z: 0.2 },
    cameraZoom: 0.54,
    tiles,
    rotatingPlatforms: [
      { id: 'rot15a', pivotX: -1, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -3, z: -1 }, label: 'Rotate Fern Bridge' },
      { id: 'rot15b', pivotX: 6, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 4, z: -1 }, label: 'Rotate Vault Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw15a', x: -4, z: 2, elevation: 0, latch: true, label: 'Open Entry Gate' },
      { id: 'sw15b', x: 2, z: 2, elevation: 0, latch: false, label: 'Toggle Twin Bramble Gates' },
    ],
    gates: [
      { id: 'gate15a', x: 1, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw15a', blocksLight: true },
      { id: 'gate15b', x: 2, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw15b', inverted: false, blocksLight: true },
      { id: 'gate15c', x: 4, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw15b', inverted: true, blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift15', x: 8, z: 2, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Vault Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn15',
        kind: 'root_bridge',
        heroId: 'sylvi',
        x: 3,
        z: 1,
        elevation: 0,
        label: 'Rootcall: Grow South Overpass',
        bridgeTiles: [
          { x: 5, z: 1, elevation: 0, terrain: 'wood' },
          { x: 6, z: 1, elevation: 0, terrain: 'wood' },
          { x: 7, z: 1, elevation: 0, terrain: 'wood' },
        ],
        bonusShards: 4,
      },
    ],
    echoFragment: makeEcho(
      15,
      10,
      -2,
      0,
      'Opposing Boughs',
      'East Seed Vault Cove',
      'Like twin branches bending away from the sun, opposing gates test patience before generosity.'
    ),
    crystal: { id: 'crystal15', x: 10, z: 2, elevation: 1, requiresLightBeam: false, label: 'Restore Vault Crystal' },
    portal: { id: 'portal15', x: 11, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel16(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, 4, -4, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'moss' }); // spawn
  setTile(tiles, { x: -5, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter16a
  setTile(tiles, { x: 1, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter16b
  setTile(tiles, { x: -1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism16a
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism16b
  setTile(tiles, { x: 3, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub16
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'ruin' }); // gate16
  setTile(tiles, { x: 1, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism16c
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism16d
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal16
  addDecor(tiles, -5, 2, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, -4, -4, 0, 'moss', 'waterfall');
  addDecor(tiles, 0, 2, 0, 'moss', 'pond_lily');
  addDecor(tiles, 4, -4, 0, 'moss', 'stone_lantern');

  // East Overlook elev 1
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 5, 7, -2, 2, 1, 'moss');
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin' }); // portal16
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' }); // echo16
  addDecor(tiles, 7, 2, 1, 'moss', 'verdant_arch');

  return {
    id: 16,
    worldId: 'world_2',
    stageNumberInWorld: 6,
    slug: 'rootbound-aqueduct',
    title: 'Rootbound Aqueduct',
    subtitle: 'Stage 16 · Verdant Reach',
    objectiveDefault: 'Channel light into the Aqueduct Resonator to open the shutter, then align the second beam into the crystal.',
    objectiveCrystalDone: 'Both beams sing across the water channels. Ascend to the overlook portal.',
    subareas: ['Aqueduct Optics Floor', 'Resonator Niche', 'Sanctum Overlook'],
    spawn: { x: -4, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.0, z: -0.8 },
    cameraZoom: 0.6,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [
      { id: 'gate16', x: 2, z: -2, elevation: 0, axis: 'z', linkedSubCrystalId: 'sub16', blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [
      { id: 'emitter16a', x: -5, z: -3, elevation: 0, direction: 0 },
      { id: 'emitter16b', x: 1, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism16a', x: -1, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Aqueduct Prism I' },
      { id: 'prism16b', x: -1, z: 1, elevation: 0, initialDirection: 2, label: 'Rotate Aqueduct Prism II' },
      { id: 'prism16c', x: 1, z: -2, elevation: 0, initialDirection: 2, label: 'Rotate Gate Prism III' },
      { id: 'prism16d', x: 3, z: -2, elevation: 0, initialDirection: 0, label: 'Rotate Final Prism IV' },
    ],
    subCrystals: [{ id: 'sub16', x: 3, z: 1, elevation: 0, label: 'Aqueduct Resonator' }],
    heroNodes: [
      { id: 'hn16', kind: 'root_bridge', heroId: 'sylvi', x: 5, z: 0, elevation: 1, label: 'Rootcall: Awaken Overlook Ferns', bonusShards: 4 },
    ],
    echoFragment: makeEcho(
      16,
      7,
      -2,
      1,
      'Channel of Living Stone',
      'Sanctum Overlook',
      'Rootbound aqueducts feed both water and starlight through mossy channels toward the Tidal Expanse.'
    ),
    crystal: { id: 'crystal16', x: 3, z: 0, elevation: 0, requiresLightBeam: true, label: 'Ignite Aqueduct Crystal' },
    portal: { id: 'portal16', x: 6, z: 1, elevation: 1, facing: 2 },
  };
}

function buildLevel17(): LevelDef {
  const tiles: TileDef[] = [];
  // Tier 0: West Stage
  addRect(tiles, -5, -2, -1, 2, 0, 'moss');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  addDecor(tiles, -5, -1, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, -5, 2, 0, 'moss', 'waterfall');

  // Tier 1: Ivy Ring
  addRect(tiles, -1, 2, -2, 2, 1, 'moss');
  setTile(tiles, { x: 2, z: 2, elevation: 1, terrain: 'ruin' }); // sw17
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'ruin' }); // gate17
  addDecor(tiles, -1, -2, 1, 'moss', 'verdant_arch');
  addDecor(tiles, 1, 0, 1, 'moss', 'pond_lily');

  // Tier 2: Upper West Gallery & East Gallery
  addRect(tiles, -1, 2, -5, -3, 2, 'wood');
  setTile(tiles, { x: 2, z: -5, elevation: 2, terrain: 'ruin', blocksMovement: true }); // crank17
  addRect(tiles, 6, 8, -5, -2, 2, 'stone');
  setTile(tiles, { x: 7, z: -1, elevation: 2, terrain: 'stone', isStair: true });
  addDecor(tiles, 8, -5, 2, 'moss', 'stone_lantern');

  // Tier 3: Canopy Spire
  addRect(tiles, 6, 9, 0, 3, 3, 'moss');
  setTile(tiles, { x: 7, z: 1, elevation: 3, terrain: 'ruin', blocksMovement: true }); // crystal17
  setTile(tiles, { x: 9, z: 2, elevation: 3, terrain: 'ruin' }); // portal17
  setTile(tiles, { x: 6, z: 3, elevation: 3, terrain: 'stone' }); // echo17
  addDecor(tiles, 9, 0, 3, 'moss', 'ancient_root_tree');

  return {
    id: 17,
    worldId: 'world_2',
    stageNumberInWorld: 7,
    slug: 'verdant-amphitheater',
    title: 'Verdant Amphitheater',
    subtitle: 'Stage 17 · Verdant Reach',
    objectiveDefault: 'Climb the ivy tiers, unlock the gallery gate, and swing the upper span to the Canopy Spire.',
    objectiveCrystalDone: 'Chorus fills the amphitheater. Step into the summit portal.',
    subareas: ['Garden Stage', 'Ivy Ring', 'Upper Galleries', 'Canopy Spire'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: -0.6 },
    cameraZoom: 0.54,
    tiles,
    rotatingPlatforms: [
      { id: 'rot17', pivotX: 4, pivotZ: -4, elevation: 2, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 2, z: -5 }, label: 'Rotate Gallery Span' },
    ],
    pressureSwitches: [
      { id: 'sw17', x: 2, z: 2, elevation: 1, latch: true, label: 'Open Gallery Gate' },
    ],
    gates: [
      { id: 'gate17', x: 1, z: -2, elevation: 1, axis: 'x', linkedSwitchId: 'sw17', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift17a', x: -2, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Ivy Lift' },
      { id: 'lift17b', x: 0, z: -2, lowElevation: 1, highElevation: 2, initialHigh: false, label: 'Raise Gallery Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn17',
        kind: 'root_bridge',
        heroId: 'sylvi',
        x: 2,
        z: 0,
        elevation: 1,
        label: 'Rootcall: Grow East Vine Bridge',
        bridgeTiles: [
          { x: 3, z: 0, elevation: 1, terrain: 'wood' },
          { x: 4, z: 0, elevation: 2, terrain: 'wood' },
          { x: 5, z: 0, elevation: 2, terrain: 'wood' },
        ],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      17,
      6,
      3,
      3,
      'Chorus of Boughs',
      'Amphitheater Crest',
      'On solstice evenings, flutes carved from hollow roots carry melodies across four elevation tiers.'
    ),
    crystal: { id: 'crystal17', x: 7, z: 1, elevation: 3, requiresLightBeam: false, label: 'Restore Amphitheater Crystal' },
    portal: { id: 'portal17', x: 9, z: 2, elevation: 3, facing: 2 },
  };
}

function buildLevel18(): LevelDef {
  const tiles: TileDef[] = [];
  // Island A West Outpost
  addRect(tiles, -6, -4, -1, 2, 0, 'moss');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank18a
  addDecor(tiles, -6, -1, 0, 'moss', 'ancient_root_tree');

  // Island B Central Hub
  addRect(tiles, 0, 2, 0, 2, 0, 'stone');
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -1, elevation: 1, terrain: 'stone' }); // Upper approach connecting lift18_manual (0,0) to lift18_bridge (0,-2)
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw18a
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'wood' });
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank18b
  addDecor(tiles, 0, 2, 0, 'moss', 'waterfall');

  // Island C East Sanctum elev 1
  addRect(tiles, 6, 9, -3, 2, 1, 'stone');
  setTile(tiles, { x: 9, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter18
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism18a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism18b
  setTile(tiles, { x: 7, z: 1, elevation: 1, terrain: 'ruin' }); // gate18
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal18
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' }); // sw18b
  setTile(tiles, { x: 9, z: 2, elevation: 1, terrain: 'ruin' }); // portal18
  setTile(tiles, { x: 6, z: 2, elevation: 1, terrain: 'moss' }); // echo18
  addDecor(tiles, 8, -3, 1, 'moss', 'verdant_arch');

  return {
    id: 18,
    worldId: 'world_2',
    stageNumberInWorld: 8,
    slug: 'briar-gorge-relay',
    title: 'Briar Gorge Relay',
    subtitle: 'Stage 18 · Verdant Reach',
    objectiveDefault: 'Raise the hydraulic bridge, cross the upper gorge, and guide the beam past the shutter gate.',
    objectiveCrystalDone: 'Deepwood Sanctum glows with life. Enter the portal.',
    subareas: ['West Outpost', 'Hollow Pier', 'Gorge Bridgehead', 'Deepwood Sanctum'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: -0.4 },
    cameraZoom: 0.54,
    tiles,
    rotatingPlatforms: [
      { id: 'rot18a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Gorge Intake' },
      { id: 'rot18b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Deepwood Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw18a', x: 2, z: 2, elevation: 0, latch: true, label: 'Raise Hydraulic Step' },
      { id: 'sw18b', x: 9, z: -1, elevation: 1, latch: true, label: 'Open Deepwood Shutter' },
    ],
    gates: [
      { id: 'gate18', x: 7, z: 1, elevation: 1, axis: 'z', linkedSwitchId: 'sw18b', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift18_manual', x: 0, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Hollow Lift' },
      { id: 'lift18_bridge', x: 0, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, linkedSwitchId: 'sw18a', label: 'Hydraulic Step' },
    ],
    lightEmitters: [{ id: 'emitter18', x: 9, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism18a', x: 6, z: -3, elevation: 1, initialDirection: 2, label: 'Rotate Gorge Prism I' },
      { id: 'prism18b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Gorge Prism II' },
    ],
    heroNodes: [
      { id: 'hn18', kind: 'root_bridge', heroId: 'sylvi', x: 2, z: 0, elevation: 0, label: 'Rootcall: Span Gorge Chasm', bridgeTiles: [{ x: 4, z: 0, elevation: 1, terrain: 'wood' }, { x: 5, z: 0, elevation: 1, terrain: 'wood' }], bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      18,
      6,
      2,
      1,
      'Vines Over Iron',
      'Deepwood Balcony',
      'Old counterweight lifts still rise when pressure switches settle beneath thriving briar.'
    ),
    crystal: { id: 'crystal18', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Deepwood Crystal' },
    portal: { id: 'portal18', x: 9, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel19(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, 4, -4, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'moss' }); // spawn
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter19a
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism19a
  setTile(tiles, { x: -2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism19b
  setTile(tiles, { x: 1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub19
  setTile(tiles, { x: 2, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter19b
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'ruin' }); // gate19
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism19c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism19d
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal19
  addDecor(tiles, -5, -4, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, 0, 2, 0, 'moss', 'pond_lily');
  addDecor(tiles, 3, -4, 0, 'moss', 'waterfall');

  // Crown elev 1
  addRect(tiles, 6, 8, -2, 2, 1, 'moss');
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'ruin' }); // portal19
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' }); // echo19
  addDecor(tiles, 8, 2, 1, 'moss', 'verdant_arch');

  return {
    id: 19,
    worldId: 'world_2',
    stageNumberInWorld: 9,
    slug: 'sunlit-canopy-vault',
    title: 'Sunlit Canopy Vault',
    subtitle: 'Stage 19 · Verdant Reach',
    objectiveDefault: 'Energize the Sunwell Resonator to open the central shutter and unite all four prisms.',
    objectiveCrystalDone: 'Golden canopy rays align. Ride the eastern lift to the crown portal.',
    subareas: ['Sunwell Atrium', 'Resonator Niche', 'Canopy Portal Crown'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: -0.6 },
    cameraZoom: 0.56,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [
      { id: 'gate19', x: 2, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub19', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift19', x: 5, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Crown Lift' },
    ],
    lightEmitters: [
      { id: 'emitter19a', x: -5, z: 0, elevation: 0, direction: 0 },
      { id: 'emitter19b', x: 2, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism19a', x: -2, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Atrium Prism I' },
      { id: 'prism19b', x: -2, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Atrium Prism II' },
      { id: 'prism19c', x: 2, z: 1, elevation: 0, initialDirection: 3, label: 'Rotate Atrium Prism III' },
      { id: 'prism19d', x: 4, z: 1, elevation: 0, initialDirection: 0, label: 'Rotate Atrium Prism IV' },
    ],
    subCrystals: [{ id: 'sub19', x: 1, z: -3, elevation: 0, label: 'Sunwell Resonator' }],
    heroNodes: [
      { id: 'hn19', kind: 'root_bridge', heroId: 'sylvi', x: 4, z: 2, elevation: 0, label: 'Rootcall: Canopy Lift Roots', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      19,
      7,
      -2,
      1,
      'Seed-Light Pact',
      'Canopy Crown Terrace',
      'Beneath sunlit glass, forest keepers bred crystals that bloom like morning sunflowers.'
    ),
    crystal: { id: 'crystal19', x: 4, z: -2, elevation: 0, requiresLightBeam: true, label: 'Awaken Canopy Crystal' },
    portal: { id: 'portal19', x: 7, z: 0, elevation: 1, facing: 2 },
  };
}

function buildLevel20(): LevelDef {
  const tiles: TileDef[] = [];
  // West Gatehouse (elev 0)
  addRect(tiles, -7, -4, -1, 2, 0, 'moss');
  setTile(tiles, { x: -6, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank20a
  addDecor(tiles, -7, -1, 0, 'moss', 'ancient_root_tree');
  addDecor(tiles, -7, 2, 0, 'moss', 'waterfall');

  // Hollow Court (elev 0)
  addRect(tiles, 0, 3, -3, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw20a
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'ruin' }); // gate20a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter20a
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism20a
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism20b
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub20
  addDecor(tiles, 1, -3, 0, 'moss', 'tree_pine');
  addDecor(tiles, 0, 2, 0, 'moss', 'pond_lily');

  // Upper Lift Ring (elev 1)
  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'ruin' }); // gate20b
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank20b

  // Sanctuary Isle (elev 1 -> Crown elev 2)
  addRect(tiles, 7, 10, -2, 2, 1, 'stone');
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter20b
  setTile(tiles, { x: 10, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism20c
  setTile(tiles, { x: 10, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism20d
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal20
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'stone', isStair: true });
  addRect(tiles, 7, 9, 3, 4, 2, 'moss');
  setTile(tiles, { x: 8, z: 4, elevation: 2, terrain: 'ruin' }); // portal20
  setTile(tiles, { x: 7, z: 3, elevation: 2, terrain: 'stone' }); // echo20
  addDecor(tiles, 9, 4, 2, 'moss', 'ancient_root_tree');
  addDecor(tiles, 8, -2, 1, 'moss', 'verdant_arch');

  return {
    id: 20,
    worldId: 'world_2',
    stageNumberInWorld: 10,
    slug: 'heart-of-the-reach',
    title: 'Heart of the Reach',
    subtitle: 'Stage 20 · Verdant Reach Finale',
    objectiveDefault: 'Awaken the Hollow Resonator to unseal the upper span, then guide both starbeams into the Heart Crystal.',
    objectiveCrystalDone: 'Verdant Reach is reborn! Step into the Crown Portal to unlock Tidal Expanse and Neris.',
    subareas: ['Moss Gatehouse', 'Hollow Court', 'Upper Lift Ring', 'Grovewarden Crown'],
    spawn: { x: -6, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: 0.4 },
    cameraZoom: 0.5,
    tiles,
    rotatingPlatforms: [
      { id: 'rot20a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -5, z: 2 }, label: 'Rotate Gatehouse Span' },
      { id: 'rot20b', pivotX: 5, pivotZ: 1, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: 2 }, label: 'Rotate Crown Span' },
    ],
    pressureSwitches: [
      { id: 'sw20a', x: 2, z: 2, elevation: 0, latch: true, label: 'Open Hollow Shutter' },
    ],
    gates: [
      { id: 'gate20a', x: 1, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw20a', blocksLight: true },
      { id: 'gate20b', x: 2, z: 1, elevation: 1, axis: 'z', linkedSubCrystalId: 'sub20', blocksLight: true },
    ],
    elevationPlatforms: [
      { id: 'lift20a', x: 1, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Sanctuary Lift' },
    ],
    lightEmitters: [
      { id: 'emitter20a', x: 0, z: -3, elevation: 0, direction: 1 },
      { id: 'emitter20b', x: 7, z: -1, elevation: 1, direction: 0 },
    ],
    lightPrisms: [
      { id: 'prism20a', x: 0, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Hollow Prism I' },
      { id: 'prism20b', x: 3, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Hollow Prism II' },
      { id: 'prism20c', x: 10, z: -1, elevation: 1, initialDirection: 2, label: 'Rotate Crown Prism III' },
      { id: 'prism20d', x: 10, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Crown Prism IV' },
    ],
    subCrystals: [{ id: 'sub20', x: 3, z: -3, elevation: 0, label: 'Heartwood Resonator' }],
    heroNodes: [
      { id: 'hn20', kind: 'root_bridge', heroId: 'sylvi', x: 8, z: 2, elevation: 1, label: 'Rootcall: Canopy Blessing', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      20,
      7,
      3,
      2,
      'Voyage Beyond the Boughs',
      'Grovewarden Crown',
      'Beyond the highest canopy glitters an archipelago of coral and turquoise waterways: the Tidal Expanse.'
    ),
    crystal: { id: 'crystal20', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Heart of the Reach' },
    portal: { id: 'portal20', x: 8, z: 4, elevation: 2, facing: 3 },
  };
}

export const WORLD2_LEVELS: LevelDef[] = [
  buildLevel11(),
  buildLevel12(),
  buildLevel13(),
  buildLevel14(),
  buildLevel15(),
  buildLevel16(),
  buildLevel17(),
  buildLevel18(),
  buildLevel19(),
  buildLevel20(),
];
