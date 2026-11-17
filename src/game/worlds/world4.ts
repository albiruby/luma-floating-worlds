import { LevelDef, TileDef } from '../types';
import { addDecor, addRect, makeEcho, setTile } from './mapBuilder';

function buildLevel31(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, -1, -2, 2, 0, 'basalt');
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -1, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: -2, elevation: 0, terrain: 'ruin' }); // sw31
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'basalt' }); // echo31
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'water', blocksMovement: true }); // lava moat
  addDecor(tiles, -4, -2, 0, 'basalt', 'basalt_obelisk');
  addDecor(tiles, -1, 2, 0, 'basalt', 'ember_brazier_prop');

  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin' }); // gate31

  addRect(tiles, 1, 4, -2, 2, 0, 'basalt');
  setTile(tiles, { x: 1, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal31
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' }); // portal31
  addDecor(tiles, 4, -2, 0, 'basalt', 'forge_gear');
  addDecor(tiles, 4, 2, 0, 'basalt', 'basalt_obelisk');

  return {
    id: 31,
    worldId: 'world_4',
    stageNumberInWorld: 1,
    slug: 'basalt-threshold',
    title: 'Basalt Threshold',
    subtitle: 'Stage 31 · Emberfall Dominion',
    objectiveDefault: 'Press the iron floorplate to drop the forge gate, then ignite the Obsidian Crystal.',
    objectiveCrystalDone: 'Warm forge light arcs across the basalt causeway. Step into the portal.',
    subareas: ['Cinder Landing', 'Iron Drawbridge', 'Crucible Shrine'],
    spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0, z: 0 },
    cameraZoom: 0.94,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw31', x: -2, z: -2, elevation: 0, latch: true, label: 'Drop Blast Gate' }],
    gates: [{ id: 'gate31', x: 0, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw31', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn31',
        kind: 'ember_brazier',
        heroId: 'kael',
        x: -1,
        z: 2,
        elevation: 0,
        label: 'Ember Spark: Forge Iron Bridge',
        bridgeTiles: [{ x: 0, z: 2, elevation: 0, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      31,
      -4,
      2,
      0,
      'Ash-Forged Pledge',
      'Southwest Magma Rim',
      'First smiths cooled volcanic glass around radiant star-shards so sky-bridges never rusted.'
    ),
    crystal: { id: 'crystal31', x: 2, z: 0, elevation: 0, requiresLightBeam: false, label: 'Ignite Obsidian Crystal' },
    portal: { id: 'portal31', x: 4, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel32(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -1, 2, 0, 'basalt');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank32a
  addDecor(tiles, -5, -1, 0, 'basalt', 'ember_brazier_prop');

  addRect(tiles, 2, 4, 0, 2, 0, 'stone');
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' }); // sw32
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'basalt' }); // echo32
  addDecor(tiles, 3, 2, 0, 'basalt', 'forge_gear');

  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank32b
  addDecor(tiles, 2, -3, 1, 'basalt', 'basalt_obelisk');

  addRect(tiles, 7, 9, -3, 0, 1, 'basalt');
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal32
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' }); // portal32
  addDecor(tiles, 9, -3, 1, 'basalt', 'ember_brazier_prop');

  return {
    id: 32,
    worldId: 'world_4',
    stageNumberInWorld: 2,
    slug: 'slag-gearworks',
    title: 'Slag Gearworks',
    subtitle: 'Stage 32 · Emberfall Dominion',
    objectiveDefault: 'Turn the bronze gear-bridges, unlock the foundry lock, and ride the piston lift.',
    objectiveCrystalDone: 'Gear-trains click into harmony. Enter the crucible portal.',
    subareas: ['Foundry Quay', 'Gear Hub', 'Slag Balcony'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: -0.6 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [
      { id: 'rot32a', pivotX: 0, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: 1 }, label: 'Rotate Gear Span I' },
      { id: 'rot32b', pivotX: 5, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: -3 }, label: 'Rotate Foundry Span II' },
    ],
    pressureSwitches: [{ id: 'sw32', x: 4, z: 1, elevation: 0, latch: true, label: 'Unseal Foundry Gate' }],
    gates: [{ id: 'gate32', x: 3, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw32', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift32', x: 2, z: -1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Piston Lift' }],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn32',
        kind: 'ember_brazier',
        heroId: 'kael',
        x: 4,
        z: 0,
        elevation: 0,
        label: 'Ember Spark: Forge Slag Catwalk',
        bridgeTiles: [
          { x: 5, z: 0, elevation: 0, terrain: 'wood' },
          { x: 6, z: 0, elevation: 1, terrain: 'wood' },
        ],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      32,
      2,
      2,
      0,
      'Bronze Tooth & Hammer',
      'Lower Gear Bay',
      'Every gear tooth in Emberfall weighs as much as a boulder, balanced by hollow magma floats.'
    ),
    crystal: { id: 'crystal32', x: 8, z: -2, elevation: 1, requiresLightBeam: false, label: 'Ignite Slag Crystal' },
    portal: { id: 'portal32', x: 9, z: -1, elevation: 1, facing: 2 },
  };
}

function buildLevel33(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 1, -3, 3, 0, 'basalt');
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // sw33
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter33
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism33a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism33b
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' }); // gate33
  setTile(tiles, { x: -4, z: -2, elevation: 0, terrain: 'stone' }); // echo33
  addDecor(tiles, -4, 3, 0, 'basalt', 'ember_brazier_prop');
  addDecor(tiles, -4, -3, 0, 'basalt', 'basalt_obelisk');

  addRect(tiles, 3, 5, -3, -2, 0, 'stone');
  setTile(tiles, { x: 4, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism33c
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'stone', isStair: true });
  setTile(tiles, { x: 4, z: -1, elevation: 0, terrain: 'ruin' });
  addRect(tiles, 3, 5, 0, 2, 1, 'basalt');
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal33
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' }); // portal33
  addDecor(tiles, 5, 2, 1, 'basalt', 'ember_brazier_prop');

  return {
    id: 33,
    worldId: 'world_4',
    stageNumberInWorld: 3,
    slug: 'kiln-lens-hall',
    title: 'Kiln Lens Hall',
    subtitle: 'Stage 33 · Emberfall Dominion',
    objectiveDefault: 'Drop the kiln shutter and align all three heat-prisms into the Furnace Crystal.',
    objectiveCrystalDone: 'Golden light illuminates the kiln vault. Ascend to the portal.',
    subareas: ['Kiln Apron', 'Slag Mirror Court', 'Upper Anvil Deck'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.6, z: -0.3 },
    cameraZoom: 0.76,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw33', x: -2, z: 2, elevation: 0, latch: true, label: 'Drop Kiln Shutter' }],
    gates: [{ id: 'gate33', x: 0, z: -1, elevation: 0, axis: 'x', linkedSwitchId: 'sw33', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift33', x: 2, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Kiln Lift' }],
    lightEmitters: [{ id: 'emitter33', x: -3, z: 0, elevation: 0, direction: 0 }],
    lightPrisms: [
      { id: 'prism33a', x: 0, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Kiln Prism I' },
      { id: 'prism33b', x: 0, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Kiln Prism II' },
      { id: 'prism33c', x: 4, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Kiln Prism III' },
    ],
    heroNodes: [
      {
        id: 'hn33',
        kind: 'ember_brazier',
        heroId: 'kael',
        x: 1,
        z: 3,
        elevation: 0,
        label: 'Ember Spark: Raise Side Walkway',
        bridgeTiles: [{ x: 2, z: 2, elevation: 1, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      33,
      -4,
      -2,
      0,
      'Smelted Quartz',
      'Northwest Kiln Wall',
      'Furnace masters fired desert sand into amber lenses capable of melting basalt seams.'
    ),
    crystal: { id: 'crystal33', x: 4, z: 0, elevation: 0, requiresLightBeam: true, label: 'Ignite Kiln Crystal' },
    portal: { id: 'portal33', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel34(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -3, -1, 0, 2, 0, 'basalt');
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  addDecor(tiles, -3, 2, 0, 'basalt', 'ember_brazier_prop');

  addRect(tiles, 0, 2, -2, 1, 1, 'stone');
  setTile(tiles, { x: 0, z: 1, elevation: 1, terrain: 'ruin' }); // sw34
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'ruin' }); // gate34
  setTile(tiles, { x: 0, z: -2, elevation: 1, terrain: 'basalt' }); // echo34
  addDecor(tiles, 2, 1, 1, 'basalt', 'forge_gear');

  setTile(tiles, { x: 2, z: -2, elevation: 2, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -1, elevation: 2, terrain: 'stone', isStair: true });

  addRect(tiles, 3, 5, 0, 2, 3, 'basalt');
  setTile(tiles, { x: 4, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 1, elevation: 3, terrain: 'ruin', blocksMovement: true }); // crystal34
  setTile(tiles, { x: 4, z: 2, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 2, elevation: 3, terrain: 'ruin' }); // portal34
  addDecor(tiles, 3, 2, 3, 'basalt', 'basalt_obelisk');

  return {
    id: 34,
    worldId: 'world_4',
    stageNumberInWorld: 4,
    slug: 'crucible-steps',
    title: 'Crucible Steps',
    subtitle: 'Stage 34 · Emberfall Dominion',
    objectiveDefault: 'Ride both counterweight lifts, unlock the terrace iron gate, and climb the caldera spire.',
    objectiveCrystalDone: 'Summit brazier burns bright. Enter the high portal.',
    subareas: ['Lower Ash Court', 'Counterweight Deck', 'Iron Catwalk', 'Caldera Crest'],
    spawn: { x: -2, z: 2, facingAngle: Math.PI },
    cameraCenter: { x: 1.0, z: 0.0 },
    cameraZoom: 0.76,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw34', x: 0, z: 1, elevation: 1, latch: true, label: 'Open Crucible Gate' }],
    gates: [{ id: 'gate34', x: 1, z: -1, elevation: 1, axis: 'z', linkedSwitchId: 'sw34', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift34a', x: -1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Lower Counterweight' },
      { id: 'lift34b', x: 2, z: -1, lowElevation: 1, highElevation: 2, initialHigh: false, label: 'Raise Caldera Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn34',
        kind: 'ember_brazier',
        heroId: 'kael',
        x: 1,
        z: 1,
        elevation: 1,
        label: 'Ember Spark: Forge Iron Step',
        bridgeTiles: [{ x: 3, z: 1, elevation: 2, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      34,
      0,
      -2,
      1,
      'Tongs of the First Smith',
      'North Terrace Ledge',
      'Ascending four tiers of the Crucible was once an apprentice smith’s trial of endurance.'
    ),
    crystal: { id: 'crystal34', x: 4, z: 1, elevation: 3, requiresLightBeam: false, label: 'Ignite Caldera Crystal' },
    portal: { id: 'portal34', x: 5, z: 2, elevation: 3, facing: 2 },
  };
}

function buildLevel35(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -2, 2, 0, 'basalt');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank35a
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // sw35a
  setTile(tiles, { x: -3, z: -1, elevation: 0, terrain: 'water', blocksMovement: true });
  setTile(tiles, { x: -3, z: 1, elevation: 0, terrain: 'water', blocksMovement: true });
  addDecor(tiles, -5, -2, 0, 'basalt', 'basalt_obelisk');

  addRect(tiles, 2, 4, -2, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'ruin' }); // gate35a
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw35b
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' }); // gate35c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' }); // gate35b
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank35b
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'water', blocksMovement: true });
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'basalt' }); // echo35
  addDecor(tiles, 4, -2, 0, 'basalt', 'ember_brazier_prop');

  addRect(tiles, 8, 10, -2, 1, 0, 'basalt');
  setTile(tiles, { x: 8, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal35
  setTile(tiles, { x: 10, z: 0, elevation: 0, terrain: 'ruin' }); // portal35
  addDecor(tiles, 10, -2, 0, 'basalt', 'forge_gear');

  return {
    id: 35,
    worldId: 'world_4',
    stageNumberInWorld: 5,
    slug: 'twin-bellows-lock',
    title: 'Twin-Bellows Lock',
    subtitle: 'Stage 35 · Emberfall Dominion',
    objectiveDefault: 'Alternate the twin bellows shutters, swing both foundry spans, and ignite the eastern altar.',
    objectiveCrystalDone: 'Twin bellows sigh in peace. Enter the portal.',
    subareas: ['Magma Quay', 'Bellows Valve', 'East Smelter'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.5, z: 0 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot35a', pivotX: 0, pivotZ: -2, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: -1 }, label: 'Rotate North Smelter Span' },
      { id: 'rot35b', pivotX: 6, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 4, z: 2 }, label: 'Rotate Anvil Span' },
    ],
    pressureSwitches: [
      { id: 'sw35a', x: -2, z: 2, elevation: 0, latch: true, label: 'Unseal Entry Shutter' },
      { id: 'sw35b', x: 2, z: 2, elevation: 0, latch: false, label: 'Toggle Bellows Gates' },
    ],
    gates: [
      { id: 'gate35a', x: 2, z: -2, elevation: 0, axis: 'z', linkedSwitchId: 'sw35a', blocksLight: true },
      { id: 'gate35b', x: 4, z: 1, elevation: 0, axis: 'z', linkedSwitchId: 'sw35b', inverted: false, blocksLight: true },
      { id: 'gate35c', x: 4, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw35b', inverted: true, blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn35',
        kind: 'ember_brazier',
        heroId: 'kael',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Ember Spark: Forge Lava Bridge',
        bridgeTiles: [{ x: 1, z: 0, elevation: 0, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      35,
      3,
      2,
      0,
      'Bellows Ledger',
      'Valve Terrace',
      'Opposing blast shutters prevented backdrafts whenever molten ore poured into the east mold.'
    ),
    crystal: { id: 'crystal35', x: 9, z: -1, elevation: 0, requiresLightBeam: false, label: 'Ignite Smelter Crystal' },
    portal: { id: 'portal35', x: 10, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel36(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 4, -4, 2, 0, 'basalt');
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter36a
  setTile(tiles, { x: 0, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter36b
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism36a
  setTile(tiles, { x: -1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism36b
  setTile(tiles, { x: 2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub36
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' }); // gate36
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism36c
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism36d
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal36
  setTile(tiles, { x: 4, z: -3, elevation: 0, terrain: 'stone' }); // echo36
  addDecor(tiles, -4, 2, 0, 'basalt', 'ember_brazier_prop');
  addDecor(tiles, -4, -4, 0, 'basalt', 'basalt_obelisk');

  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 3, 5, 1, 2, 1, 'basalt');
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' }); // portal36
  addDecor(tiles, 5, 2, 1, 'basalt', 'forge_gear');

  return {
    id: 36,
    worldId: 'world_4',
    stageNumberInWorld: 6,
    slug: 'ember-prism-conduit',
    title: 'Ember Prism Conduit',
    subtitle: 'Stage 36 · Emberfall Dominion',
    objectiveDefault: 'Light the Kiln Resonator to open the central baffle, then focus all four prisms.',
    objectiveCrystalDone: 'Molten rays burn steady. Climb the anvil stairs to the portal.',
    subareas: ['Heat Floor', 'Resonator Hearth', 'Anvil Balcony'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.5, z: -1.0 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate36', x: 0, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub36', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [
      { id: 'emitter36a', x: -4, z: 1, elevation: 0, direction: 0 },
      { id: 'emitter36b', x: 0, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism36a', x: -1, z: 1, elevation: 0, initialDirection: 1, label: 'Rotate Conduit Prism I' },
      { id: 'prism36b', x: -1, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Conduit Prism II' },
      { id: 'prism36c', x: 0, z: 0, elevation: 0, initialDirection: 2, label: 'Rotate Conduit Prism III' },
      { id: 'prism36d', x: 3, z: 0, elevation: 0, initialDirection: 0, label: 'Rotate Conduit Prism IV' },
    ],
    subCrystals: [{ id: 'sub36', x: 2, z: -3, elevation: 0, label: 'Kiln Resonator' }],
    heroNodes: [
      { id: 'hn36', kind: 'ember_brazier', heroId: 'kael', x: 1, z: 2, elevation: 0, label: 'Ember Spark: Hearth Blessing', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      36,
      4,
      -3,
      0,
      'Cinder Refractor Blueprint',
      'Northeast Kiln Niche',
      'Emberfall’s optical mirrors channel pure starfire without warming the stone around them.'
    ),
    crystal: { id: 'crystal36', x: 3, z: -2, elevation: 0, requiresLightBeam: true, label: 'Ignite Conduit Crystal' },
    portal: { id: 'portal36', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel37(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'basalt');
  setTile(tiles, { x: -5, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank37a
  addDecor(tiles, -6, -1, 0, 'basalt', 'ember_brazier_prop');

  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 2, elevation: 0, terrain: 'ruin' }); // sw37
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank37b
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' }); // gate37
  addDecor(tiles, 0, -2, 1, 'basalt', 'ruin_arch');

  addRect(tiles, 6, 8, -3, 2, 1, 'stone');
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter37
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism37a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism37b
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'basalt' }); // echo37
  addDecor(tiles, 8, 2, 1, 'basalt', 'basalt_obelisk');

  addRect(tiles, 3, 4, 0, 2, 1, 'basalt');
  setTile(tiles, { x: 4, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal37
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin' }); // portal37

  return {
    id: 37,
    worldId: 'world_4',
    stageNumberInWorld: 7,
    slug: 'obsidian-causeway',
    title: 'Obsidian Causeway',
    subtitle: 'Stage 37 · Emberfall Dominion',
    objectiveDefault: 'Span the volcanic chasms, unlock the ironspire gate, and beam firelight to the south crag.',
    objectiveCrystalDone: 'Obsidian spires shimmer crimson-gold. Enter the portal.',
    subareas: ['West Crag', 'Ironspire Lock', 'Furnace Spire', 'South Hearth'],
    spawn: { x: -5, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.0, z: -0.3 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot37a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Magma Span I' },
      { id: 'rot37b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Spire Span II' },
    ],
    pressureSwitches: [{ id: 'sw37', x: 0, z: 2, elevation: 0, latch: true, label: 'Drop Ironspire Gate' }],
    gates: [{ id: 'gate37', x: 2, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw37', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift37a', x: 1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Ironspire Lift' },
      { id: 'lift37b', x: 5, z: 2, lowElevation: 0, highElevation: 1, initialHigh: true, label: 'Hearth Span Lift' },
    ],
    lightEmitters: [{ id: 'emitter37', x: 8, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism37a', x: 6, z: -3, elevation: 1, initialDirection: 3, label: 'Rotate Spire Prism I' },
      { id: 'prism37b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Spire Prism II' },
    ],
    heroNodes: [
      { id: 'hn37', kind: 'ember_brazier', heroId: 'kael', x: 3, z: 2, elevation: 1, label: 'Ember Spark: Hearth Blessing', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      37,
      8,
      1,
      1,
      'Magma-Forged Compass',
      'Furnace Spire',
      'Even across four drifting basalt crags, smiths kept all bridge bearings true to north.'
    ),
    crystal: { id: 'crystal37', x: 4, z: 1, elevation: 1, requiresLightBeam: true, label: 'Ignite Hearth Crystal' },
    portal: { id: 'portal37', x: 3, z: 2, elevation: 1, facing: 0 },
  };
}

function buildLevel38(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'basalt');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank38a
  addDecor(tiles, -6, -1, 0, 'basalt', 'ember_brazier_prop');

  addRect(tiles, 0, 2, 0, 2, 0, 'stone');
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw38a
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'wood' });
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank38b

  addRect(tiles, 6, 9, -3, 2, 1, 'basalt');
  setTile(tiles, { x: 9, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter38
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism38a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism38b
  setTile(tiles, { x: 7, z: 1, elevation: 1, terrain: 'ruin' }); // gate38
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal38
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' }); // sw38b
  setTile(tiles, { x: 9, z: 2, elevation: 1, terrain: 'ruin' }); // portal38
  setTile(tiles, { x: 6, z: 2, elevation: 1, terrain: 'stone' }); // echo38
  addDecor(tiles, 8, -3, 1, 'basalt', 'forge_gear');

  return {
    id: 38,
    worldId: 'world_4',
    stageNumberInWorld: 8,
    slug: 'anvil-piston-bridge',
    title: 'Anvil Piston Bridge',
    subtitle: 'Stage 38 · Emberfall Dominion',
    objectiveDefault: 'Raise the hydraulic piston bridge, cross the upper anvil span, and ignite the eastern core.',
    objectiveCrystalDone: 'Anvil pistons settle in molten glory. Enter the portal.',
    subareas: ['West Slag Quay', 'Piston Hub', 'Anvil Catwalk', 'Core Vault'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: -0.4 },
    cameraZoom: 0.54,
    tiles,
    rotatingPlatforms: [
      { id: 'rot38a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Slag Intake' },
      { id: 'rot38b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Anvil Span' },
    ],
    pressureSwitches: [
      { id: 'sw38a', x: 2, z: 2, elevation: 0, latch: true, label: 'Raise Piston Step' },
      { id: 'sw38b', x: 9, z: -1, elevation: 1, latch: true, label: 'Drop Core Shutter' },
    ],
    gates: [{ id: 'gate38', x: 7, z: 1, elevation: 1, axis: 'z', linkedSwitchId: 'sw38b', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift38_manual', x: 0, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Crucible Lift' },
      { id: 'lift38_bridge', x: 0, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, linkedSwitchId: 'sw38a', label: 'Piston Step' },
    ],
    lightEmitters: [{ id: 'emitter38', x: 9, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism38a', x: 6, z: -3, elevation: 1, initialDirection: 2, label: 'Rotate Vault Prism I' },
      { id: 'prism38b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Vault Prism II' },
    ],
    heroNodes: [
      {
        id: 'hn38',
        kind: 'ember_brazier',
        heroId: 'kael',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Ember Spark: Forge Iron Bypass',
        bridgeTiles: [
          { x: 4, z: 0, elevation: 1, terrain: 'wood' },
          { x: 5, z: 0, elevation: 1, terrain: 'wood' },
        ],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      38,
      6,
      2,
      1,
      'Anvil Counterweight',
      'Core Vault Balcony',
      'Dual-piston bridges could lift ten tons of solid bronze using nothing more than trapped steam.'
    ),
    crystal: { id: 'crystal38', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Ignite Core Crystal' },
    portal: { id: 'portal38', x: 9, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel39(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, 4, -4, 2, 0, 'basalt');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter39a
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism39a
  setTile(tiles, { x: -2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism39b
  setTile(tiles, { x: 1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub39
  setTile(tiles, { x: 2, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter39b
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'ruin' }); // gate39
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism39c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism39d
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal39
  addDecor(tiles, -5, -4, 0, 'basalt', 'ember_brazier_prop');
  addDecor(tiles, 0, 2, 0, 'basalt', 'basalt_obelisk');

  addRect(tiles, 6, 8, -2, 2, 1, 'basalt');
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'ruin' }); // portal39
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' }); // echo39

  return {
    id: 39,
    worldId: 'world_4',
    stageNumberInWorld: 9,
    slug: 'caldera-mirror-vault',
    title: 'Caldera Mirror Vault',
    subtitle: 'Stage 39 · Emberfall Dominion',
    objectiveDefault: 'Power the Caldera Resonator to lower the baffle shutter and unite four prisms.',
    objectiveCrystalDone: 'Emberlight floods the mirror vault. Ride the lift to the caldera crown.',
    subareas: ['Caldera Chamber', 'Ignition Resonator', 'Obsidian Balcony'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: -0.6 },
    cameraZoom: 0.56,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate39', x: 2, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub39', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift39', x: 5, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Caldera Lift' }],
    lightEmitters: [
      { id: 'emitter39a', x: -5, z: 0, elevation: 0, direction: 0 },
      { id: 'emitter39b', x: 2, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism39a', x: -2, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Mirror Prism I' },
      { id: 'prism39b', x: -2, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Mirror Prism II' },
      { id: 'prism39c', x: 2, z: 1, elevation: 0, initialDirection: 3, label: 'Rotate Mirror Prism III' },
      { id: 'prism39d', x: 4, z: 1, elevation: 0, initialDirection: 0, label: 'Rotate Mirror Prism IV' },
    ],
    subCrystals: [{ id: 'sub39', x: 1, z: -3, elevation: 0, label: 'Caldera Resonator' }],
    heroNodes: [
      { id: 'hn39', kind: 'ember_brazier', heroId: 'kael', x: 4, z: 2, elevation: 0, label: 'Ember Spark: Caldera Blessing', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      39,
      7,
      -2,
      1,
      'Ash-Sealed Star Chart',
      'Caldera Crown',
      'Above the highest caldera chimneys shine the pale cloud-spires of Celestial Frontier.'
    ),
    crystal: { id: 'crystal39', x: 4, z: -2, elevation: 0, requiresLightBeam: true, label: 'Ignite Caldera Crystal' },
    portal: { id: 'portal39', x: 7, z: 0, elevation: 1, facing: 2 },
  };
}

function buildLevel40(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -7, -4, -1, 2, 0, 'basalt');
  setTile(tiles, { x: -6, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank40a
  addDecor(tiles, -7, -1, 0, 'basalt', 'ember_brazier_prop');

  addRect(tiles, 0, 3, -3, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw40a
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'ruin' }); // gate40a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter40a
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism40a
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism40b
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub40
  addDecor(tiles, 1, -3, 0, 'basalt', 'basalt_obelisk');

  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'ruin' }); // gate40b
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank40b

  addRect(tiles, 7, 10, -2, 2, 1, 'basalt');
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter40b
  setTile(tiles, { x: 10, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism40c
  setTile(tiles, { x: 10, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism40d
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal40
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'stone', isStair: true });

  addRect(tiles, 7, 9, 3, 4, 2, 'basalt');
  setTile(tiles, { x: 8, z: 4, elevation: 2, terrain: 'ruin' }); // portal40
  setTile(tiles, { x: 7, z: 3, elevation: 2, terrain: 'stone' }); // echo40
  addDecor(tiles, 9, 4, 2, 'basalt', 'forge_gear');

  return {
    id: 40,
    worldId: 'world_4',
    stageNumberInWorld: 10,
    slug: 'sovereigns-crucible',
    title: 'Sovereign’s Crucible',
    subtitle: 'Stage 40 · Emberfall Dominion Finale',
    objectiveDefault: 'Ignite the Sovereign Resonator, cross the forge span, and align all four prisms into the Core.',
    objectiveCrystalDone: 'Emberfall burns eternal! Enter the portal to unlock Zeph and Celestial Frontier.',
    subareas: ['Obsidian Gate', 'Great Crucible', 'High Forge Span', 'Sovereign Anvil'],
    spawn: { x: -6, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: 0.4 },
    cameraZoom: 0.5,
    tiles,
    rotatingPlatforms: [
      { id: 'rot40a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -5, z: 2 }, label: 'Rotate Obsidian Span' },
      { id: 'rot40b', pivotX: 5, pivotZ: 1, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: 2 }, label: 'Rotate Sovereign Bridge' },
    ],
    pressureSwitches: [{ id: 'sw40a', x: 2, z: 2, elevation: 0, latch: true, label: 'Drop Great Shutter' }],
    gates: [
      { id: 'gate40a', x: 1, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw40a', blocksLight: true },
      { id: 'gate40b', x: 2, z: 1, elevation: 1, axis: 'z', linkedSubCrystalId: 'sub40', blocksLight: true },
    ],
    elevationPlatforms: [{ id: 'lift40a', x: 1, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Forge Lift' }],
    lightEmitters: [
      { id: 'emitter40a', x: 0, z: -3, elevation: 0, direction: 1 },
      { id: 'emitter40b', x: 7, z: -1, elevation: 1, direction: 0 },
    ],
    lightPrisms: [
      { id: 'prism40a', x: 0, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Crucible Prism I' },
      { id: 'prism40b', x: 3, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Crucible Prism II' },
      { id: 'prism40c', x: 10, z: -1, elevation: 1, initialDirection: 2, label: 'Rotate Sovereign Prism III' },
      { id: 'prism40d', x: 10, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Sovereign Prism IV' },
    ],
    subCrystals: [{ id: 'sub40', x: 3, z: -3, elevation: 0, label: 'Sovereign Resonator' }],
    heroNodes: [
      { id: 'hn40', kind: 'ember_brazier', heroId: 'kael', x: 8, z: 2, elevation: 1, label: 'Ember Spark: Crucible Crest', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      40,
      7,
      3,
      2,
      'Gate of the Upper Winds',
      'Sovereign Anvil Crown',
      'Far above Emberfall’s warm clouds hover the marble observatories of Celestial Frontier.'
    ),
    crystal: { id: 'crystal40', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Sovereign Crystal' },
    portal: { id: 'portal40', x: 8, z: 4, elevation: 2, facing: 3 },
  };
}

export const WORLD4_LEVELS: LevelDef[] = [
  buildLevel31(),
  buildLevel32(),
  buildLevel33(),
  buildLevel34(),
  buildLevel35(),
  buildLevel36(),
  buildLevel37(),
  buildLevel38(),
  buildLevel39(),
  buildLevel40(),
];
