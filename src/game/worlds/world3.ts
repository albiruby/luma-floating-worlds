import { LevelDef, TileDef } from '../types';
import { addDecor, addRect, makeEcho, setTile } from './mapBuilder';

function buildLevel21(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, -1, -2, 2, 0, 'sand');
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -1, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: -2, elevation: 0, terrain: 'ruin' }); // sw21
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'sand' }); // echo21
  setTile(tiles, { x: -4, z: -1, elevation: 0, terrain: 'water', blocksMovement: true });
  addDecor(tiles, -4, -2, 0, 'sand', 'coral_spire');
  addDecor(tiles, -1, 2, 0, 'sand', 'tidal_fountain');

  // Coral Pier Bridge (x = 0, z = 0)
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin' }); // gate21

  // East Pearl Island
  addRect(tiles, 1, 4, -2, 2, 0, 'sand');
  setTile(tiles, { x: 1, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal21
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' }); // portal21
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  addDecor(tiles, 4, 2, 0, 'sand', 'coral_spire');
  addDecor(tiles, 1, -2, 0, 'sand', 'stone_lantern');

  return {
    id: 21,
    worldId: 'world_3',
    stageNumberInWorld: 1,
    slug: 'coral-shallows',
    title: 'Coral Shallows',
    subtitle: 'Stage 21 · Tidal Expanse',
    objectiveDefault: 'Trigger the tideplate to lower the sluice gate, then restore the Coral Crystal.',
    objectiveCrystalDone: 'Turquoise tides shimmer around the reef. Enter the awakened portal.',
    subareas: ['Lagoon Landing', 'Sluice Causeway', 'Pearl Reef'],
    spawn: { x: -3, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0, z: 0 },
    cameraZoom: 0.94,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw21', x: -2, z: -2, elevation: 0, latch: true, label: 'Open Reef Sluice' }],
    gates: [{ id: 'gate21', x: 0, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw21', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn21',
        kind: 'tide_channel',
        heroId: 'neris',
        x: -1,
        z: 2,
        elevation: 0,
        label: 'Tidal Pulse: Raise Reef Stepping Stone',
        bridgeTiles: [{ x: 0, z: 2, elevation: 0, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      21,
      -3,
      2,
      0,
      'Shellsong of the Shallows',
      'Lagoon Tidepool',
      'At dawn, pink coral spires chime in pitch with rising sky-tides across the archipelago.'
    ),
    crystal: { id: 'crystal21', x: 2, z: 0, elevation: 0, requiresLightBeam: false, label: 'Restore Coral Crystal' },
    portal: { id: 'portal21', x: 4, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel22(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -1, 2, 0, 'sand');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank22a
  addDecor(tiles, -5, -1, 0, 'sand', 'coral_spire');

  // Middle Reef Hub (elev 0 -> elev 1)
  addRect(tiles, 2, 4, 0, 2, 0, 'stone');
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' }); // sw22
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'sand' }); // echo22
  addDecor(tiles, 3, 2, 0, 'sand', 'tidal_fountain');

  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank22b
  addDecor(tiles, 2, -3, 1, 'sand', 'ruin_pillar');

  // East Pearl Terrace (elev 1)
  addRect(tiles, 7, 9, -3, 0, 1, 'sand');
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal22
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' }); // portal22
  addDecor(tiles, 9, -3, 1, 'sand', 'coral_spire');

  return {
    id: 22,
    worldId: 'world_3',
    stageNumberInWorld: 2,
    slug: 'sunken-causeway',
    title: 'Sunken Causeway',
    subtitle: 'Stage 22 · Tidal Expanse',
    objectiveDefault: 'Align both rotating driftwood piers, unlock the sluice gate, and ride the hydro-lift.',
    objectiveCrystalDone: 'Clear lagoon water floods the terrace. Enter the portal.',
    subareas: ['Driftwood Quay', 'Hydro Pier', 'Upper Pearl Bank'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: -0.6 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [
      { id: 'rot22a', pivotX: 0, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: 1 }, label: 'Rotate Driftwood Pier' },
      { id: 'rot22b', pivotX: 5, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: -3 }, label: 'Rotate High Causeway' },
    ],
    pressureSwitches: [{ id: 'sw22', x: 4, z: 1, elevation: 0, latch: true, label: 'Open Causeway Gate' }],
    gates: [{ id: 'gate22', x: 3, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw22', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift22', x: 2, z: -1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Hydro-Lift' }],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn22',
        kind: 'tide_channel',
        heroId: 'neris',
        x: 4,
        z: 0,
        elevation: 0,
        label: 'Tidal Pulse: Surge Canal Walkway',
        bridgeTiles: [
          { x: 5, z: 0, elevation: 0, terrain: 'wood' },
          { x: 6, z: 0, elevation: 1, terrain: 'wood' },
        ],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      22,
      2,
      2,
      0,
      'Driftwood Compass',
      'Midstream Eddy',
      'Navigators carved bearing notches into floating cedar piers so ships could dock regardless of tide height.'
    ),
    crystal: { id: 'crystal22', x: 8, z: -2, elevation: 1, requiresLightBeam: false, label: 'Restore Pearl Crystal' },
    portal: { id: 'portal22', x: 9, z: -1, elevation: 1, facing: 2 },
  };
}

function buildLevel23(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 1, -3, 3, 0, 'stone');
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'sand' }); // spawn
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // sw23
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter23
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism23a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism23b
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' }); // gate23
  setTile(tiles, { x: -4, z: -2, elevation: 0, terrain: 'sand' }); // echo23
  addDecor(tiles, -4, 3, 0, 'sand', 'tidal_fountain');
  addDecor(tiles, -4, -3, 0, 'sand', 'coral_spire');

  // East Reef Basin
  addRect(tiles, 3, 5, -3, -2, 0, 'stone');
  setTile(tiles, { x: 4, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism23c
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'stone', isStair: true });
  setTile(tiles, { x: 4, z: -1, elevation: 0, terrain: 'ruin' });
  addRect(tiles, 3, 5, 0, 2, 1, 'sand');
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal23
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' }); // portal23
  addDecor(tiles, 5, 2, 1, 'sand', 'coral_spire');

  return {
    id: 23,
    worldId: 'world_3',
    stageNumberInWorld: 3,
    slug: 'reef-prism-basin',
    title: 'Reef Prism Basin',
    subtitle: 'Stage 23 · Tidal Expanse',
    objectiveDefault: 'Lower the canal shutter and refract the sea-beam through three coral prisms.',
    objectiveCrystalDone: 'Sunbeams glitter across the reef basin. Ascend to the portal.',
    subareas: ['Sluice Plaza', 'Sea-Prism Walk', 'Upper Coral Pier'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.6, z: -0.3 },
    cameraZoom: 0.76,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw23', x: -2, z: 2, elevation: 0, latch: true, label: 'Drop Canal Shutter' }],
    gates: [{ id: 'gate23', x: 0, z: -1, elevation: 0, axis: 'x', linkedSwitchId: 'sw23', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift23', x: 2, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Pier Lift' }],
    lightEmitters: [{ id: 'emitter23', x: -3, z: 0, elevation: 0, direction: 0 }],
    lightPrisms: [
      { id: 'prism23a', x: 0, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Reef Prism I' },
      { id: 'prism23b', x: 0, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Reef Prism II' },
      { id: 'prism23c', x: 4, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Reef Prism III' },
    ],
    heroNodes: [
      {
        id: 'hn23',
        kind: 'tide_channel',
        heroId: 'neris',
        x: 1,
        z: 3,
        elevation: 0,
        label: 'Tidal Pulse: Raise Lagoon Pier',
        bridgeTiles: [{ x: 2, z: 2, elevation: 1, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      23,
      -4,
      -2,
      0,
      'Refraction in Foam',
      'Northwest Reef Corner',
      'Glassmakers tuned coral mirrors to bend daylight cleanly even through ocean spray.'
    ),
    crystal: { id: 'crystal23', x: 4, z: 0, elevation: 0, requiresLightBeam: true, label: 'Ignite Basin Crystal' },
    portal: { id: 'portal23', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel24(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -3, -1, 0, 2, 0, 'sand');
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  addDecor(tiles, -3, 2, 0, 'sand', 'tidal_fountain');

  // Mid Aqueduct (elev 1)
  addRect(tiles, 0, 2, -2, 1, 1, 'stone');
  setTile(tiles, { x: 0, z: 1, elevation: 1, terrain: 'ruin' }); // sw24
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'ruin' }); // gate24
  setTile(tiles, { x: 0, z: -2, elevation: 1, terrain: 'sand' }); // echo24
  addDecor(tiles, 2, 1, 1, 'sand', 'coral_spire');

  // High Reservoir Bridge (elev 2)
  setTile(tiles, { x: 2, z: -2, elevation: 2, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -1, elevation: 2, terrain: 'stone', isStair: true });

  // Summit Cistern (elev 3)
  addRect(tiles, 3, 5, 0, 2, 3, 'sand');
  setTile(tiles, { x: 4, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 1, elevation: 3, terrain: 'ruin', blocksMovement: true }); // crystal24
  setTile(tiles, { x: 4, z: 2, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 2, elevation: 3, terrain: 'ruin' }); // portal24
  addDecor(tiles, 3, 2, 3, 'sand', 'coral_spire');

  return {
    id: 24,
    worldId: 'world_3',
    stageNumberInWorld: 4,
    slug: 'aqueduct-terraces',
    title: 'Aqueduct Terraces',
    subtitle: 'Stage 24 · Tidal Expanse',
    objectiveDefault: 'Operate the hydro-lifts, open the mid-terrace floodgate, and climb to the reservoir.',
    objectiveCrystalDone: 'Fresh water cascades down all four tiers. Step into the portal.',
    subareas: ['Coastal Steps', 'Floodgate Terrace', 'Sky Aqueduct', 'Cistern Crown'],
    spawn: { x: -2, z: 2, facingAngle: Math.PI },
    cameraCenter: { x: 1.0, z: 0.0 },
    cameraZoom: 0.76,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw24', x: 0, z: 1, elevation: 1, latch: true, label: 'Open Aqueduct Floodgate' }],
    gates: [{ id: 'gate24', x: 1, z: -1, elevation: 1, axis: 'z', linkedSwitchId: 'sw24', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift24a', x: -1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Lower Tide Lift' },
      { id: 'lift24b', x: 2, z: -1, lowElevation: 1, highElevation: 2, initialHigh: false, label: 'Raise Aqueduct Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn24',
        kind: 'tide_channel',
        heroId: 'neris',
        x: 1,
        z: 1,
        elevation: 1,
        label: 'Tidal Pulse: Surge Terrace Step',
        bridgeTiles: [{ x: 3, z: 1, elevation: 2, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      24,
      0,
      -2,
      1,
      'Cistern Measure',
      'Terrace Alcove',
      'Aqueduct builders measured flow by counting heartbeats between each tiered spillstone.'
    ),
    crystal: { id: 'crystal24', x: 4, z: 1, elevation: 3, requiresLightBeam: false, label: 'Restore Cistern Crystal' },
    portal: { id: 'portal24', x: 5, z: 2, elevation: 3, facing: 2 },
  };
}

function buildLevel25(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -2, 2, 0, 'sand');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank25a
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // sw25a
  setTile(tiles, { x: -3, z: -1, elevation: 0, terrain: 'water', blocksMovement: true });
  setTile(tiles, { x: -3, z: 1, elevation: 0, terrain: 'water', blocksMovement: true });
  addDecor(tiles, -5, -2, 0, 'sand', 'coral_spire');

  // Mid Sluice Hub
  addRect(tiles, 2, 4, -2, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'ruin' }); // gate25a
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw25b (toggle)
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' }); // gate25c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' }); // gate25b
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank25b
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'water', decor: 'pond_lily', blocksMovement: true });
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'sand' }); // echo25
  addDecor(tiles, 4, -2, 0, 'sand', 'tidal_fountain');

  // East Pearl Shrine
  addRect(tiles, 8, 10, -2, 1, 0, 'sand');
  setTile(tiles, { x: 8, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal25
  setTile(tiles, { x: 10, z: 0, elevation: 0, terrain: 'ruin' }); // portal25
  addDecor(tiles, 10, -2, 0, 'sand', 'coral_spire');

  return {
    id: 25,
    worldId: 'world_3',
    stageNumberInWorld: 5,
    slug: 'pearl-floodgate',
    title: 'Pearl Floodgate',
    subtitle: 'Stage 25 · Tidal Expanse',
    objectiveDefault: 'Balance the opposing canal locks, swing both tidal bridges, and awaken the Pearl Crystal.',
    objectiveCrystalDone: 'Sea-gates stand balanced. Step into the harbor portal.',
    subareas: ['Outer Spit', 'Opposing Canal Lock', 'Pearl Harbor'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.5, z: 0 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot25a', pivotX: 0, pivotZ: -2, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: -1 }, label: 'Rotate North Canal Bridge' },
      { id: 'rot25b', pivotX: 6, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 4, z: 2 }, label: 'Rotate Pearl Pier' },
    ],
    pressureSwitches: [
      { id: 'sw25a', x: -2, z: 2, elevation: 0, latch: true, label: 'Open West Sluice' },
      { id: 'sw25b', x: 2, z: 2, elevation: 0, latch: false, label: 'Alternate Lock Gates' },
    ],
    gates: [
      { id: 'gate25a', x: 2, z: -2, elevation: 0, axis: 'z', linkedSwitchId: 'sw25a', blocksLight: true },
      { id: 'gate25b', x: 4, z: 1, elevation: 0, axis: 'z', linkedSwitchId: 'sw25b', inverted: false, blocksLight: true },
      { id: 'gate25c', x: 4, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw25b', inverted: true, blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn25',
        kind: 'tide_channel',
        heroId: 'neris',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Tidal Pulse: Link Lagoon Sandbar',
        bridgeTiles: [{ x: 1, z: 0, elevation: 0, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      25,
      3,
      2,
      0,
      'Chamberlain’s Lock Key',
      'Canal Sluice Bank',
      'Dual floodlocks keep the lagoon level even during tempest season.'
    ),
    crystal: { id: 'crystal25', x: 9, z: -1, elevation: 0, requiresLightBeam: false, label: 'Restore Pearl Shrine' },
    portal: { id: 'portal25', x: 10, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel26(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 4, -4, 2, 0, 'stone');
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'sand' }); // spawn
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter26a
  setTile(tiles, { x: 0, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter26b
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism26a
  setTile(tiles, { x: -1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism26b
  setTile(tiles, { x: 2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub26
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' }); // gate26
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism26c
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism26d
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal26
  setTile(tiles, { x: 4, z: -3, elevation: 0, terrain: 'sand' }); // echo26
  addDecor(tiles, -4, 2, 0, 'sand', 'coral_spire');
  addDecor(tiles, -4, -4, 0, 'sand', 'tidal_fountain');

  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 3, 5, 1, 2, 1, 'sand');
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' }); // portal26
  addDecor(tiles, 5, 2, 1, 'sand', 'coral_spire');

  return {
    id: 26,
    worldId: 'world_3',
    stageNumberInWorld: 6,
    slug: 'turquoise-cistern',
    title: 'Turquoise Cistern',
    subtitle: 'Stage 26 · Tidal Expanse',
    objectiveDefault: 'Energize the Lagoon Resonator to open the central gate, then ignite the Cistern Crystal.',
    objectiveCrystalDone: 'Twin sea-beams glow beneath the surface. Climb to the portal.',
    subareas: ['Lower Cistern', 'Resonator Niche', 'Sunlit Pier'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.5, z: -1.0 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate26', x: 0, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub26', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [
      { id: 'emitter26a', x: -4, z: 1, elevation: 0, direction: 0 },
      { id: 'emitter26b', x: 0, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism26a', x: -1, z: 1, elevation: 0, initialDirection: 1, label: 'Rotate Cistern Prism I' },
      { id: 'prism26b', x: -1, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Cistern Prism II' },
      { id: 'prism26c', x: 0, z: 0, elevation: 0, initialDirection: 2, label: 'Rotate Cistern Prism III' },
      { id: 'prism26d', x: 3, z: 0, elevation: 0, initialDirection: 0, label: 'Rotate Cistern Prism IV' },
    ],
    subCrystals: [{ id: 'sub26', x: 2, z: -3, elevation: 0, label: 'Lagoon Resonator' }],
    heroNodes: [
      { id: 'hn26', kind: 'tide_channel', heroId: 'neris', x: 1, z: 2, elevation: 0, label: 'Tidal Pulse: Cistern Cascade', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      26,
      4,
      -3,
      0,
      'Sunken Astrolabe',
      'Northeast Cistern Edge',
      'Starlight reflected from turquoise basins revealed trade winds long before compasses existed.'
    ),
    crystal: { id: 'crystal26', x: 3, z: -2, elevation: 0, requiresLightBeam: true, label: 'Ignite Cistern Crystal' },
    portal: { id: 'portal26', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel27(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'sand');
  setTile(tiles, { x: -5, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank27a
  addDecor(tiles, -6, -1, 0, 'sand', 'coral_spire');

  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 2, elevation: 0, terrain: 'ruin' }); // sw27
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank27b
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' }); // gate27
  addDecor(tiles, 0, -2, 1, 'sand', 'ruin_arch');

  addRect(tiles, 6, 8, -3, 2, 1, 'stone');
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter27
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism27a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism27b
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'sand' }); // echo27
  addDecor(tiles, 8, 2, 1, 'sand', 'tidal_fountain');

  addRect(tiles, 3, 4, 0, 2, 1, 'sand');
  setTile(tiles, { x: 4, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal27
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin' }); // portal27

  return {
    id: 27,
    worldId: 'world_3',
    stageNumberInWorld: 7,
    slug: 'archipelago-locks',
    title: 'Archipelago Locks',
    subtitle: 'Stage 27 · Tidal Expanse',
    objectiveDefault: 'Cross both tidal bridges, unlock the spire gate, and beam starlight to the south reef.',
    objectiveCrystalDone: 'Four reefs gleam as one constellation. Enter the portal.',
    subareas: ['West Quay', 'Tide Lock', 'Sea-Light Pier', 'South Atoll'],
    spawn: { x: -5, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.0, z: -0.3 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot27a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate West Ferry' },
      { id: 'rot27b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate High Atoll Span' },
    ],
    pressureSwitches: [{ id: 'sw27', x: 0, z: 2, elevation: 0, latch: true, label: 'Open Lock Gate' }],
    gates: [{ id: 'gate27', x: 2, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw27', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift27a', x: 1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Lock Lift' },
      { id: 'lift27b', x: 5, z: 2, lowElevation: 0, highElevation: 1, initialHigh: true, label: 'Reef Walk Lift' },
    ],
    lightEmitters: [{ id: 'emitter27', x: 8, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism27a', x: 6, z: -3, elevation: 1, initialDirection: 3, label: 'Rotate Atoll Prism I' },
      { id: 'prism27b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Atoll Prism II' },
    ],
    heroNodes: [
      { id: 'hn27', kind: 'tide_channel', heroId: 'neris', x: 3, z: 2, elevation: 1, label: 'Tidal Pulse: Atoll Blessing', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      27,
      8,
      1,
      1,
      'Four-Reef Chart',
      'East Sea-Light Pier',
      'Mariners bound four coral atolls together with light beams visible through any squall.'
    ),
    crystal: { id: 'crystal27', x: 4, z: 1, elevation: 1, requiresLightBeam: true, label: 'Light Atoll Crystal' },
    portal: { id: 'portal27', x: 3, z: 2, elevation: 1, facing: 0 },
  };
}

function buildLevel28(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'sand');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank28a
  addDecor(tiles, -6, -1, 0, 'sand', 'tidal_fountain');

  addRect(tiles, 0, 2, 0, 2, 0, 'stone');
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -1, elevation: 1, terrain: 'stone' }); // connects lift28_manual to lift28_bridge
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw28a
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'wood' });
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank28b

  addRect(tiles, 6, 9, -3, 2, 1, 'stone');
  setTile(tiles, { x: 9, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter28
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism28a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism28b
  setTile(tiles, { x: 7, z: 1, elevation: 1, terrain: 'ruin' }); // gate28
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal28
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' }); // sw28b
  setTile(tiles, { x: 9, z: 2, elevation: 1, terrain: 'ruin' }); // portal28
  setTile(tiles, { x: 6, z: 2, elevation: 1, terrain: 'sand' }); // echo28
  addDecor(tiles, 8, -3, 1, 'sand', 'coral_spire');

  return {
    id: 28,
    worldId: 'world_3',
    stageNumberInWorld: 8,
    slug: 'tidal-conduit',
    title: 'Tidal Conduit',
    subtitle: 'Stage 28 · Tidal Expanse',
    objectiveDefault: 'Raise the canal piston lift, cross the upper reef span, and align the conduit prisms.',
    objectiveCrystalDone: 'Ocean light pulses through the conduit. Enter the portal.',
    subareas: ['Breaker Dock', 'Conduit Lift', 'High Bridge', 'Prism Gallery'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: -0.4 },
    cameraZoom: 0.54,
    tiles,
    rotatingPlatforms: [
      { id: 'rot28a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Harbor Span' },
      { id: 'rot28b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Conduit Span' },
    ],
    pressureSwitches: [
      { id: 'sw28a', x: 2, z: 2, elevation: 0, latch: true, label: 'Raise Hydraulic Lock' },
      { id: 'sw28b', x: 9, z: -1, elevation: 1, latch: true, label: 'Open Gallery Shutter' },
    ],
    gates: [{ id: 'gate28', x: 7, z: 1, elevation: 1, axis: 'z', linkedSwitchId: 'sw28b', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift28_manual', x: 0, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Hydro-Lift' },
      { id: 'lift28_bridge', x: 0, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, linkedSwitchId: 'sw28a', label: 'Hydraulic Lock' },
    ],
    lightEmitters: [{ id: 'emitter28', x: 9, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism28a', x: 6, z: -3, elevation: 1, initialDirection: 2, label: 'Rotate Gallery Prism I' },
      { id: 'prism28b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Gallery Prism II' },
    ],
    heroNodes: [
      {
        id: 'hn28',
        kind: 'tide_channel',
        heroId: 'neris',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Tidal Pulse: Surge Sea-Span',
        bridgeTiles: [
          { x: 4, z: 0, elevation: 1, terrain: 'wood' },
          { x: 5, z: 0, elevation: 1, terrain: 'wood' },
        ],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      28,
      6,
      2,
      1,
      'Conduit Song',
      'Prism Gallery Balcony',
      'Sea-organ pipes beneath the bridge hummed whenever tidal locks rose in unison.'
    ),
    crystal: { id: 'crystal28', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Ignite Conduit Crystal' },
    portal: { id: 'portal28', x: 9, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel29(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, 4, -4, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'sand' }); // spawn
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter29a
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism29a
  setTile(tiles, { x: -2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism29b
  setTile(tiles, { x: 1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub29
  setTile(tiles, { x: 2, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter29b
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'ruin' }); // gate29
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism29c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism29d
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal29
  addDecor(tiles, -5, -4, 0, 'sand', 'tidal_fountain');
  addDecor(tiles, 0, 2, 0, 'sand', 'coral_spire');

  addRect(tiles, 6, 8, -2, 2, 1, 'sand');
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'ruin' }); // portal29
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' }); // echo29

  return {
    id: 29,
    worldId: 'world_3',
    stageNumberInWorld: 9,
    slug: 'brinevault-sanctuary',
    title: 'Brinevault Sanctuary',
    subtitle: 'Stage 29 · Tidal Expanse',
    objectiveDefault: 'Feed the Coral Resonator to lower the vault shutter and guide all four sea-prisms.',
    objectiveCrystalDone: 'Twin beams illuminate the Brinevault. Ride the crown lift to the portal.',
    subareas: ['Vault Atrium', 'Tide Resonator', 'Lighthouse Overlook'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: -0.6 },
    cameraZoom: 0.56,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate29', x: 2, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub29', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift29', x: 5, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Overlook Lift' }],
    lightEmitters: [
      { id: 'emitter29a', x: -5, z: 0, elevation: 0, direction: 0 },
      { id: 'emitter29b', x: 2, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism29a', x: -2, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Vault Prism I' },
      { id: 'prism29b', x: -2, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Vault Prism II' },
      { id: 'prism29c', x: 2, z: 1, elevation: 0, initialDirection: 3, label: 'Rotate Vault Prism III' },
      { id: 'prism29d', x: 4, z: 1, elevation: 0, initialDirection: 0, label: 'Rotate Vault Prism IV' },
    ],
    subCrystals: [{ id: 'sub29', x: 1, z: -3, elevation: 0, label: 'Coral Resonator' }],
    heroNodes: [
      { id: 'hn29', kind: 'tide_channel', heroId: 'neris', x: 4, z: 2, elevation: 0, label: 'Tidal Pulse: Overlook Current', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      29,
      7,
      -2,
      1,
      'Lighthouse Salt-Glass',
      'Sanctuary Overlook',
      'Salt-baked crystal lenses shone clear from Tidal Expanse down to the volcanic rim of Emberfall.'
    ),
    crystal: { id: 'crystal29', x: 4, z: -2, elevation: 0, requiresLightBeam: true, label: 'Awaken Vault Crystal' },
    portal: { id: 'portal29', x: 7, z: 0, elevation: 1, facing: 2 },
  };
}

function buildLevel30(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -7, -4, -1, 2, 0, 'sand');
  setTile(tiles, { x: -6, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank30a
  addDecor(tiles, -7, -1, 0, 'sand', 'tidal_fountain');

  addRect(tiles, 0, 3, -3, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw30a
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'ruin' }); // gate30a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter30a
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism30a
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism30b
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub30
  addDecor(tiles, 1, -3, 0, 'sand', 'coral_spire');

  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'ruin' }); // gate30b
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank30b

  addRect(tiles, 7, 10, -2, 2, 1, 'stone');
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter30b
  setTile(tiles, { x: 10, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism30c
  setTile(tiles, { x: 10, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism30d
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal30
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'stone', isStair: true });

  addRect(tiles, 7, 9, 3, 4, 2, 'sand');
  setTile(tiles, { x: 8, z: 4, elevation: 2, terrain: 'ruin' }); // portal30
  setTile(tiles, { x: 7, z: 3, elevation: 2, terrain: 'stone' }); // echo30
  addDecor(tiles, 9, 4, 2, 'sand', 'coral_spire');

  return {
    id: 30,
    worldId: 'world_3',
    stageNumberInWorld: 10,
    slug: 'trident-nexus',
    title: 'Trident Nexus',
    subtitle: 'Stage 30 · Tidal Expanse Finale',
    objectiveDefault: 'Unseal the Trident Resonator, cross the high lagoon span, and align all four sea-prisms.',
    objectiveCrystalDone: 'Tidal Expanse gleams beneath the horizon! Enter the Crown Portal to unlock Kael and Emberfall Dominion.',
    subareas: ['Harbor Pier', 'Trident Basin', 'Upper Tidal Span', 'Sovereign Atoll'],
    spawn: { x: -6, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: 0.4 },
    cameraZoom: 0.5,
    tiles,
    rotatingPlatforms: [
      { id: 'rot30a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -5, z: 2 }, label: 'Rotate Harbor Span' },
      { id: 'rot30b', pivotX: 5, pivotZ: 1, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: 2 }, label: 'Rotate Sovereign Span' },
    ],
    pressureSwitches: [{ id: 'sw30a', x: 2, z: 2, elevation: 0, latch: true, label: 'Open Basin Shutter' }],
    gates: [
      { id: 'gate30a', x: 1, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw30a', blocksLight: true },
      { id: 'gate30b', x: 2, z: 1, elevation: 1, axis: 'z', linkedSubCrystalId: 'sub30', blocksLight: true },
    ],
    elevationPlatforms: [{ id: 'lift30a', x: 1, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Nexus Lift' }],
    lightEmitters: [
      { id: 'emitter30a', x: 0, z: -3, elevation: 0, direction: 1 },
      { id: 'emitter30b', x: 7, z: -1, elevation: 1, direction: 0 },
    ],
    lightPrisms: [
      { id: 'prism30a', x: 0, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Basin Prism I' },
      { id: 'prism30b', x: 3, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Basin Prism II' },
      { id: 'prism30c', x: 10, z: -1, elevation: 1, initialDirection: 2, label: 'Rotate Atoll Prism III' },
      { id: 'prism30d', x: 10, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Atoll Prism IV' },
    ],
    subCrystals: [{ id: 'sub30', x: 3, z: -3, elevation: 0, label: 'Trident Resonator' }],
    heroNodes: [
      { id: 'hn30', kind: 'tide_channel', heroId: 'neris', x: 8, z: 2, elevation: 1, label: 'Tidal Pulse: Sovereign Crest', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      30,
      7,
      3,
      2,
      'Ash-Glow on the Horizon',
      'Trident Summit',
      'Southward across the open sky rises a basalt forge shrouded in warm amber smoke: Emberfall Dominion.'
    ),
    crystal: { id: 'crystal30', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Trident Crystal' },
    portal: { id: 'portal30', x: 8, z: 4, elevation: 2, facing: 3 },
  };
}

export const WORLD3_LEVELS: LevelDef[] = [
  buildLevel21(),
  buildLevel22(),
  buildLevel23(),
  buildLevel24(),
  buildLevel25(),
  buildLevel26(),
  buildLevel27(),
  buildLevel28(),
  buildLevel29(),
  buildLevel30(),
];
