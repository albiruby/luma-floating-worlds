import { LevelDef, TileDef } from '../types';
import { addDecor, addRect, addSpan, makeEcho, setTile } from './mapBuilder';

function buildLevel41(): LevelDef {
  const tiles: TileDef[] = [];
  // North-South Cloud Promenade layout (fresh silhouette!)
  addRect(tiles, -2, 2, 2, 5, 0, 'cloud');
  setTile(tiles, { x: 0, z: 4, elevation: 0, terrain: 'stone' }); // spawn
  addSpan(tiles, 0, 2, 0, 4, 0, 'stone');
  setTile(tiles, { x: -2, z: 3, elevation: 0, terrain: 'ruin' }); // sw41
  setTile(tiles, { x: 2, z: 3, elevation: 0, terrain: 'cloud' }); // echo41
  addDecor(tiles, -2, 5, 0, 'cloud', 'sky_obelisk');
  addDecor(tiles, 2, 5, 0, 'cloud', 'wind_chime');

  // Central Star Causeway (z = 1)
  setTile(tiles, { x: 0, z: 1, elevation: 0, terrain: 'ruin' }); // gate41

  // North Astral Altar (z = -3..0)
  addRect(tiles, -2, 2, -3, 0, 0, 'cloud');
  addSpan(tiles, 0, -2, 0, 0, 0, 'stone');
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal41
  setTile(tiles, { x: -1, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin' }); // portal41
  addDecor(tiles, -2, -3, 0, 'cloud', 'celestial_orrery');
  addDecor(tiles, 2, -3, 0, 'cloud', 'sky_obelisk');

  return {
    id: 41,
    worldId: 'world_5',
    stageNumberInWorld: 1,
    slug: 'cloudline-promenade',
    title: 'Cloudline Promenade',
    subtitle: 'Stage 41 · Celestial Frontier',
    objectiveDefault: 'Press the wind-seal plate to open the northern star gate, then awaken the Astral Crystal.',
    objectiveCrystalDone: 'Stratospheric light rings clear. Enter the north portal.',
    subareas: ['South Cloud Wharf', 'Star Gate Span', 'Astral Altar'],
    spawn: { x: 0, z: 4, facingAngle: Math.PI },
    cameraCenter: { x: 0, z: 1.0 },
    cameraZoom: 0.9,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw41', x: -2, z: 3, elevation: 0, latch: true, label: 'Unseal Wind Gate' }],
    gates: [{ id: 'gate41', x: 0, z: 1, elevation: 0, axis: 'x', linkedSwitchId: 'sw41', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn41',
        kind: 'wind_vane',
        heroId: 'zeph',
        x: 2,
        z: 2,
        elevation: 0,
        label: 'Windstep: Spin East Gust Span',
        bridgeTiles: [{ x: 2, z: 1, elevation: 0, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      41,
      2,
      3,
      0,
      'Hymn of High Air',
      'Southeast Cloud Balcony',
      'Above the thunderhead belt, stone temples drift across currents quiet enough to carry whispered chimes.'
    ),
    crystal: { id: 'crystal41', x: 0, z: -1, elevation: 0, requiresLightBeam: false, label: 'Awaken Astral Crystal' },
    portal: { id: 'portal41', x: 0, z: -3, elevation: 0, facing: 1 },
  };
}

function buildLevel42(): LevelDef {
  const tiles: TileDef[] = [];
  // L-shaped sky temple with twin rotating bridges & elevation plaza
  addRect(tiles, -5, -3, 1, 3, 0, 'cloud');
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'ruin' });
  setTile(tiles, { x: -3, z: 3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank42a
  addDecor(tiles, -5, 1, 0, 'cloud', 'wind_chime');

  // Center Sky Plaza (elev 0 -> elev 1)
  addRect(tiles, 1, 3, 0, 3, 0, 'stone');
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'ruin' }); // sw42
  setTile(tiles, { x: 1, z: 3, elevation: 0, terrain: 'cloud' }); // echo42
  addDecor(tiles, 3, 3, 0, 'cloud', 'sky_obelisk');

  setTile(tiles, { x: 2, z: 0, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 2, z: -1, elevation: 1, terrain: 'ruin' }); // gate42
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank42b

  // Northeast Wind Spire (elev 1)
  addRect(tiles, 6, 8, -3, -1, 1, 'cloud');
  setTile(tiles, { x: 6, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal42
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 7, z: -3, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 8, z: -2, elevation: 1, terrain: 'ruin' }); // portal42
  addDecor(tiles, 8, -3, 1, 'cloud', 'celestial_orrery');

  return {
    id: 42,
    worldId: 'world_5',
    stageNumberInWorld: 2,
    slug: 'zephyr-span',
    title: 'Zephyr Span',
    subtitle: 'Stage 42 · Celestial Frontier',
    objectiveDefault: 'Rotate the wind-bridges, unlock the starlight shutter, and ride the cloud lift.',
    objectiveCrystalDone: 'Zephyr spires sing across the void. Step into the portal.',
    subareas: ['Cloud Wharf', 'Zephyr Plaza', 'Astral Spire'],
    spawn: { x: -4, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: 0.4 },
    cameraZoom: 0.7,
    tiles,
    rotatingPlatforms: [
      { id: 'rot42a', pivotX: -1, pivotZ: 2, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -3, z: 3 }, label: 'Rotate Zephyr Bridge' },
      { id: 'rot42b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -2 }, label: 'Rotate Spire Span' },
    ],
    pressureSwitches: [{ id: 'sw42', x: 3, z: 2, elevation: 0, latch: true, label: 'Unseal Spire Gate' }],
    gates: [{ id: 'gate42', x: 2, z: -1, elevation: 1, axis: 'x', linkedSwitchId: 'sw42', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift42', x: 2, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Cloud Lift' }],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn42',
        kind: 'wind_vane',
        heroId: 'zeph',
        x: 3,
        z: 0,
        elevation: 0,
        label: 'Windstep: Summon East Windway',
        bridgeTiles: [
          { x: 4, z: 0, elevation: 1, terrain: 'wood' },
          { x: 5, z: 0, elevation: 1, terrain: 'wood' },
          { x: 6, z: 0, elevation: 1, terrain: 'wood' },
        ],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      42,
      1,
      3,
      0,
      'Feather-Weight Counterbalance',
      'Southwest Plaza Rim',
      'Wind-spans turn without iron gears: silk sails tucked inside marble rings catch high updrafts.'
    ),
    crystal: { id: 'crystal42', x: 7, z: -2, elevation: 1, requiresLightBeam: false, label: 'Awaken Zephyr Crystal' },
    portal: { id: 'portal42', x: 8, z: -2, elevation: 1, facing: 2 },
  };
}

function buildLevel43(): LevelDef {
  const tiles: TileDef[] = [];
  // Diamond optical terrace
  addRect(tiles, -4, 4, -3, 3, 0, 'cloud');
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // sw43
  setTile(tiles, { x: -4, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter43
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism43a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism43b
  setTile(tiles, { x: 2, z: -3, elevation: 0, terrain: 'ruin' }); // gate43
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism43c
  setTile(tiles, { x: 3, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal43
  setTile(tiles, { x: -4, z: -3, elevation: 0, terrain: 'stone' }); // echo43
  addDecor(tiles, -4, 3, 0, 'cloud', 'sky_obelisk');
  addDecor(tiles, 4, -3, 0, 'cloud', 'wind_chime');

  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 3, 4, 2, 3, 1, 'cloud');
  setTile(tiles, { x: 4, z: 3, elevation: 1, terrain: 'ruin' }); // portal43
  addDecor(tiles, 4, 2, 1, 'cloud', 'celestial_orrery');

  return {
    id: 43,
    worldId: 'world_5',
    stageNumberInWorld: 3,
    slug: 'nimbus-refractor',
    title: 'Nimbus Refractor',
    subtitle: 'Stage 43 · Celestial Frontier',
    objectiveDefault: 'Lower the cloud-shutter and aim all three Nimbus prisms into the southern star crystal.',
    objectiveCrystalDone: 'Starlight beams arc cleanly over the clouds. Climb the stair to the portal.',
    subareas: ['Cloud Terrace', 'Refractor Gallery', 'Portal Crown'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0, z: 0 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw43', x: -2, z: 2, elevation: 0, latch: true, label: 'Drop Cloud Shutter' }],
    gates: [{ id: 'gate43', x: 2, z: -3, elevation: 0, axis: 'z', linkedSwitchId: 'sw43', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [{ id: 'emitter43', x: -4, z: -1, elevation: 0, direction: 0 }],
    lightPrisms: [
      { id: 'prism43a', x: 0, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Nimbus Prism I' },
      { id: 'prism43b', x: 0, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Nimbus Prism II' },
      { id: 'prism43c', x: 3, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Nimbus Prism III' },
    ],
    heroNodes: [
      { id: 'hn43', kind: 'wind_vane', heroId: 'zeph', x: 1, z: 3, elevation: 0, label: 'Windstep: Sky Terrace Gust', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      43,
      -4,
      -3,
      0,
      'Starlight Lens Formula',
      'Northwest Cloud Rim',
      'Triple-aligned quartz prisms gather faint starlight across thin air into a beam brighter than noon.'
    ),
    crystal: { id: 'crystal43', x: 3, z: 1, elevation: 0, requiresLightBeam: true, label: 'Awaken Nimbus Crystal' },
    portal: { id: 'portal43', x: 4, z: 3, elevation: 1, facing: 2 },
  };
}

function buildLevel44(): LevelDef {
  const tiles: TileDef[] = [];
  // Four-tier ascending spiral cloud tower
  addRect(tiles, -3, -1, 1, 3, 0, 'cloud');
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -1, z: 2, elevation: 0, terrain: 'stone' });
  addDecor(tiles, -3, 3, 0, 'cloud', 'sky_obelisk');

  // Tier 1 (x 0..3, z 0..2)
  addRect(tiles, 0, 3, 0, 2, 1, 'stone');
  setTile(tiles, { x: 2, z: 2, elevation: 1, terrain: 'ruin' }); // sw44
  setTile(tiles, { x: 1, z: 0, elevation: 1, terrain: 'ruin' }); // gate44
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'cloud' }); // echo44
  addDecor(tiles, 3, 0, 1, 'cloud', 'wind_chime');

  // Tier 2 (x -1..2, z -3..-1)
  addRect(tiles, -1, 2, -3, -1, 2, 'cloud');
  setTile(tiles, { x: 1, z: -1, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: -1, z: -2, elevation: 2, terrain: 'stone', isStair: true });

  // Tier 3 Summit (x -4..-2, z -3..-1)
  addRect(tiles, -4, -2, -3, -1, 3, 'cloud');
  setTile(tiles, { x: -3, z: -2, elevation: 3, terrain: 'ruin', blocksMovement: true }); // crystal44
  setTile(tiles, { x: -3, z: -1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: -3, z: -3, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: -4, z: -2, elevation: 3, terrain: 'ruin' }); // portal44
  addDecor(tiles, -4, -3, 3, 'cloud', 'celestial_orrery');

  return {
    id: 44,
    worldId: 'world_5',
    stageNumberInWorld: 4,
    slug: 'spire-of-winds',
    title: 'Spire of Winds',
    subtitle: 'Stage 44 · Celestial Frontier',
    objectiveDefault: 'Ascend the spiral wind lifts, lower the upper terrace gate, and awaken the Crown Crystal.',
    objectiveCrystalDone: 'Four wind tiers chime as one. Enter the summit portal.',
    subareas: ['Lower Cloud Base', 'East Terrace', 'High Cloud Deck', 'Spire Crown'],
    spawn: { x: -2, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: -0.3, z: 0 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw44', x: 2, z: 2, elevation: 1, latch: true, label: 'Unseal Upper Wind Gate' }],
    gates: [{ id: 'gate44', x: 1, z: 0, elevation: 1, axis: 'x', linkedSwitchId: 'sw44', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift44a', x: 0, z: 2, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Cloud Lift I' },
      { id: 'lift44b', x: 1, z: -1, lowElevation: 1, highElevation: 2, initialHigh: false, label: 'Raise Spire Lift II' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn44',
        kind: 'wind_vane',
        heroId: 'zeph',
        x: -1,
        z: 1,
        elevation: 0,
        label: 'Windstep: Air-Bridge to Tier 2',
        bridgeTiles: [{ x: -1, z: 0, elevation: 1, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      44,
      3,
      2,
      1,
      'Bell of the Four Winds',
      'East Terrace',
      'Pilgrims rang four wind-chimes climbing the spiral spire to calm squalls along the frontier.'
    ),
    crystal: { id: 'crystal44', x: -3, z: -2, elevation: 3, requiresLightBeam: false, label: 'Awaken Spire Crystal' },
    portal: { id: 'portal44', x: -4, z: -2, elevation: 3, facing: 0 },
  };
}

function buildLevel45(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -2, 2, 0, 'cloud');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank45a
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // sw45a
  addDecor(tiles, -5, -2, 0, 'cloud', 'sky_obelisk');

  addRect(tiles, 2, 4, -2, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'ruin' }); // gate45a
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw45b
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' }); // gate45c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' }); // gate45b
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank45b
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'cloud' }); // echo45
  addDecor(tiles, 4, -2, 0, 'cloud', 'wind_chime');

  addRect(tiles, 8, 10, -2, 1, 0, 'cloud');
  setTile(tiles, { x: 8, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal45
  setTile(tiles, { x: 10, z: 0, elevation: 0, terrain: 'ruin' }); // portal45
  addDecor(tiles, 10, -2, 0, 'cloud', 'celestial_orrery');

  return {
    id: 45,
    worldId: 'world_5',
    stageNumberInWorld: 5,
    slug: 'gale-lock-cloister',
    title: 'Gale Lock Cloister',
    subtitle: 'Stage 45 · Celestial Frontier',
    objectiveDefault: 'Balance the opposing gale shutters, align both cloud bridges, and restore the sanctuary crystal.',
    objectiveCrystalDone: 'Twin gales fall silent before the cloister. Step into the portal.',
    subareas: ['West Airlock', 'Gale Valve Cloister', 'East Star Chapel'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.5, z: 0 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot45a', pivotX: 0, pivotZ: -2, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: -1 }, label: 'Rotate North Gale Bridge' },
      { id: 'rot45b', pivotX: 6, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 4, z: 2 }, label: 'Rotate Chapel Bridge' },
    ],
    pressureSwitches: [
      { id: 'sw45a', x: -2, z: 2, elevation: 0, latch: true, label: 'Drop Cloister Gate' },
      { id: 'sw45b', x: 2, z: 2, elevation: 0, latch: false, label: 'Toggle Opposing Gale Locks' },
    ],
    gates: [
      { id: 'gate45a', x: 2, z: -2, elevation: 0, axis: 'z', linkedSwitchId: 'sw45a', blocksLight: true },
      { id: 'gate45b', x: 4, z: 1, elevation: 0, axis: 'z', linkedSwitchId: 'sw45b', inverted: false, blocksLight: true },
      { id: 'gate45c', x: 4, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw45b', inverted: true, blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn45',
        kind: 'wind_vane',
        heroId: 'zeph',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Windstep: Summon West Air-Span',
        bridgeTiles: [{ x: 1, z: 0, elevation: 0, terrain: 'wood' }],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      45,
      3,
      2,
      0,
      'Cloister Draft Notes',
      'Central Cloister',
      'Opposing airlocks preserved quiet meditation chambers even amid winter jet-streams.'
    ),
    crystal: { id: 'crystal45', x: 9, z: -1, elevation: 0, requiresLightBeam: false, label: 'Restore Chapel Crystal' },
    portal: { id: 'portal45', x: 10, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel46(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 4, -4, 2, 0, 'cloud');
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter46a
  setTile(tiles, { x: 0, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter46b
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism46a
  setTile(tiles, { x: -1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism46b
  setTile(tiles, { x: 2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub46
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' }); // gate46
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism46c
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism46d
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal46
  setTile(tiles, { x: 4, z: -3, elevation: 0, terrain: 'stone' }); // echo46
  addDecor(tiles, -4, 2, 0, 'cloud', 'sky_obelisk');

  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 3, 5, 1, 2, 1, 'cloud');
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' }); // portal46
  addDecor(tiles, 5, 2, 1, 'cloud', 'celestial_orrery');

  return {
    id: 46,
    worldId: 'world_5',
    stageNumberInWorld: 6,
    slug: 'astral-prism-vault',
    title: 'Astral Prism Vault',
    subtitle: 'Stage 46 · Celestial Frontier',
    objectiveDefault: 'Feed the Astral Resonator to drop the sky shutter and focus four celestial prisms.',
    objectiveCrystalDone: 'Starlight beams align in crystal harmony. Climb to the portal.',
    subareas: ['Astral Court', 'Star Resonator', 'Horizon Balcony'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.5, z: -1.0 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate46', x: 0, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub46', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [
      { id: 'emitter46a', x: -4, z: 1, elevation: 0, direction: 0 },
      { id: 'emitter46b', x: 0, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism46a', x: -1, z: 1, elevation: 0, initialDirection: 1, label: 'Rotate Astral Prism I' },
      { id: 'prism46b', x: -1, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Astral Prism II' },
      { id: 'prism46c', x: 0, z: 0, elevation: 0, initialDirection: 2, label: 'Rotate Astral Prism III' },
      { id: 'prism46d', x: 3, z: 0, elevation: 0, initialDirection: 0, label: 'Rotate Astral Prism IV' },
    ],
    subCrystals: [{ id: 'sub46', x: 2, z: -3, elevation: 0, label: 'Astral Resonator' }],
    heroNodes: [
      { id: 'hn46', kind: 'wind_vane', heroId: 'zeph', x: 1, z: 2, elevation: 0, label: 'Windstep: Vault Gust', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      46,
      4,
      -3,
      0,
      'Mirror of Constellations',
      'Northeast Astral Niche',
      'Astral Vaults kept midnight star-beams aligned year-round through rotating sapphire prisms.'
    ),
    crystal: { id: 'crystal46', x: 3, z: -2, elevation: 0, requiresLightBeam: true, label: 'Awaken Vault Crystal' },
    portal: { id: 'portal46', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel47(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'cloud');
  setTile(tiles, { x: -5, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank47a
  addDecor(tiles, -6, -1, 0, 'cloud', 'sky_obelisk');

  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 2, elevation: 0, terrain: 'ruin' }); // sw47
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank47b
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' }); // gate47
  addDecor(tiles, 0, -2, 1, 'cloud', 'wind_chime');

  addRect(tiles, 6, 8, -3, 2, 1, 'stone');
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter47
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism47a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism47b
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'cloud' }); // echo47
  addDecor(tiles, 8, 2, 1, 'cloud', 'celestial_orrery');

  addRect(tiles, 3, 4, 0, 2, 1, 'cloud');
  setTile(tiles, { x: 4, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal47
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin' }); // portal47

  return {
    id: 47,
    worldId: 'world_5',
    stageNumberInWorld: 7,
    slug: 'cumulus-archipelago',
    title: 'Cumulus Archipelago',
    subtitle: 'Stage 47 · Celestial Frontier',
    objectiveDefault: 'Link all four sky-islets with rotating spans and redirect the starbeam across the abyss.',
    objectiveCrystalDone: 'Four cumulus islands glow in unison. Enter the portal.',
    subareas: ['West Cloud Spur', 'Windgate Spire', 'East Star Tower', 'South Cumulus Altar'],
    spawn: { x: -5, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.0, z: -0.3 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot47a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate West Sky Span' },
      { id: 'rot47b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Cumulus Span' },
    ],
    pressureSwitches: [{ id: 'sw47', x: 0, z: 2, elevation: 0, latch: true, label: 'Open Windgate Spire' }],
    gates: [{ id: 'gate47', x: 2, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw47', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift47a', x: 1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Windgate Lift' },
      { id: 'lift47b', x: 5, z: 2, lowElevation: 0, highElevation: 1, initialHigh: true, label: 'Altar Bridge Lift' },
    ],
    lightEmitters: [{ id: 'emitter47', x: 8, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism47a', x: 6, z: -3, elevation: 1, initialDirection: 3, label: 'Rotate Tower Prism I' },
      { id: 'prism47b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Tower Prism II' },
    ],
    heroNodes: [
      { id: 'hn47', kind: 'wind_vane', heroId: 'zeph', x: 3, z: 2, elevation: 1, label: 'Windstep: Cumulus Blessing', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      47,
      8,
      1,
      1,
      'Stratosphere Log',
      'East Star Tower',
      'Four cumulus spires form the outer beacon ring welcoming travelers above the sea of clouds.'
    ),
    crystal: { id: 'crystal47', x: 4, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Altar Crystal' },
    portal: { id: 'portal47', x: 3, z: 2, elevation: 1, facing: 0 },
  };
}

function buildLevel48(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'cloud');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank48a
  addDecor(tiles, -6, -1, 0, 'cloud', 'sky_obelisk');

  addRect(tiles, 0, 2, 0, 2, 0, 'stone');
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw48a
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'wood' });
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank48b

  addRect(tiles, 6, 9, -3, 2, 1, 'cloud');
  setTile(tiles, { x: 9, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter48
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism48a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism48b
  setTile(tiles, { x: 7, z: 1, elevation: 1, terrain: 'ruin' }); // gate48
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal48
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' }); // sw48b
  setTile(tiles, { x: 9, z: 2, elevation: 1, terrain: 'ruin' }); // portal48
  setTile(tiles, { x: 6, z: 2, elevation: 1, terrain: 'stone' }); // echo48
  addDecor(tiles, 8, -3, 1, 'cloud', 'wind_chime');

  return {
    id: 48,
    worldId: 'world_5',
    stageNumberInWorld: 8,
    slug: 'windvane-relay',
    title: 'Windvane Relay',
    subtitle: 'Stage 48 · Celestial Frontier',
    objectiveDefault: 'Raise the pneumatic sky-step, traverse the high wind-bridge, and align the relay prisms.',
    objectiveCrystalDone: 'Starlight races across the Windvane Relay. Enter the portal.',
    subareas: ['Gale Pier', 'Pneumatic Hub', 'High Wind-Span', 'Star Relay Sanctum'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: -0.4 },
    cameraZoom: 0.54,
    tiles,
    rotatingPlatforms: [
      { id: 'rot48a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Gale Span' },
      { id: 'rot48b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Upper Wind Span' },
    ],
    pressureSwitches: [
      { id: 'sw48a', x: 2, z: 2, elevation: 0, latch: true, label: 'Raise Pneumatic Sky-Step' },
      { id: 'sw48b', x: 9, z: -1, elevation: 1, latch: true, label: 'Drop Relay Shutter' },
    ],
    gates: [{ id: 'gate48', x: 7, z: 1, elevation: 1, axis: 'z', linkedSwitchId: 'sw48b', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift48_manual', x: 0, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Cloud Lift' },
      { id: 'lift48_bridge', x: 0, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, linkedSwitchId: 'sw48a', label: 'Pneumatic Sky-Step' },
    ],
    lightEmitters: [{ id: 'emitter48', x: 9, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism48a', x: 6, z: -3, elevation: 1, initialDirection: 2, label: 'Rotate Sanctum Prism I' },
      { id: 'prism48b', x: 6, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Sanctum Prism II' },
    ],
    heroNodes: [
      {
        id: 'hn48',
        kind: 'wind_vane',
        heroId: 'zeph',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Windstep: Air-Bridge to Sanctum',
        bridgeTiles: [
          { x: 4, z: 0, elevation: 1, terrain: 'wood' },
          { x: 5, z: 0, elevation: 1, terrain: 'wood' },
        ],
        bonusShards: 5,
      },
    ],
    echoFragment: makeEcho(
      48,
      6,
      2,
      1,
      'Brass Windvane Journal',
      'Sanctum Overlook',
      'High-altitude stations synchronized beam relays whenever gale winds shifted west.'
    ),
    crystal: { id: 'crystal48', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Relay Crystal' },
    portal: { id: 'portal48', x: 9, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel49(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, 4, -4, 2, 0, 'cloud');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter49a
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism49a
  setTile(tiles, { x: -2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism49b
  setTile(tiles, { x: 1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub49
  setTile(tiles, { x: 2, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter49b
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'ruin' }); // gate49
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism49c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism49d
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal49
  addDecor(tiles, -5, -4, 0, 'cloud', 'celestial_orrery');
  addDecor(tiles, 0, 2, 0, 'cloud', 'sky_obelisk');

  addRect(tiles, 6, 8, -2, 2, 1, 'cloud');
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'ruin' }); // portal49
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'stone' }); // echo49
  addDecor(tiles, 8, 2, 1, 'cloud', 'wind_chime');

  return {
    id: 49,
    worldId: 'world_5',
    stageNumberInWorld: 9,
    slug: 'starveil-sanctum',
    title: 'Starveil Sanctum',
    subtitle: 'Stage 49 · Celestial Frontier',
    objectiveDefault: 'Awaken the Starveil Resonator to lower the barrier, then unite all four celestial prisms.',
    objectiveCrystalDone: 'Starveil Sanctum shines above the clouds. Ride the lift to the portal.',
    subareas: ['Starveil Hall', 'Chorus Resonator', 'Crown Balcony'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: -0.6 },
    cameraZoom: 0.56,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate49', x: 2, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub49', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift49', x: 5, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Crown Lift' }],
    lightEmitters: [
      { id: 'emitter49a', x: -5, z: 0, elevation: 0, direction: 0 },
      { id: 'emitter49b', x: 2, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism49a', x: -2, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Starveil Prism I' },
      { id: 'prism49b', x: -2, z: -3, elevation: 0, initialDirection: 2, label: 'Rotate Starveil Prism II' },
      { id: 'prism49c', x: 2, z: 1, elevation: 0, initialDirection: 3, label: 'Rotate Starveil Prism III' },
      { id: 'prism49d', x: 4, z: 1, elevation: 0, initialDirection: 0, label: 'Rotate Starveil Prism IV' },
    ],
    subCrystals: [{ id: 'sub49', x: 1, z: -3, elevation: 0, label: 'Starveil Resonator' }],
    heroNodes: [
      { id: 'hn49', kind: 'wind_vane', heroId: 'zeph', x: 4, z: 2, elevation: 0, label: 'Windstep: Sanctum Updraft', bonusShards: 5 },
    ],
    echoFragment: makeEcho(
      49,
      7,
      -2,
      1,
      'Prelude to the Chorus',
      'Starveil Balcony',
      'Beyond Starveil stands the Crown of the Skyward Chorus, where all five worlds once sang in harmony.'
    ),
    crystal: { id: 'crystal49', x: 4, z: -2, elevation: 0, requiresLightBeam: true, label: 'Awaken Starveil Crystal' },
    portal: { id: 'portal49', x: 7, z: 0, elevation: 1, facing: 2 },
  };
}

function buildLevel50(): LevelDef {
  const tiles: TileDef[] = [];
  // Grand Climax Multi-Subarea Temple
  addRect(tiles, -7, -4, -1, 2, 0, 'cloud');
  setTile(tiles, { x: -6, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank50a
  addDecor(tiles, -7, -1, 0, 'cloud', 'sky_obelisk');
  addDecor(tiles, -7, 2, 0, 'cloud', 'wind_chime');

  addRect(tiles, 0, 3, -3, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw50a
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'ruin' }); // gate50a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter50a
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism50a
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism50b
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub50
  addDecor(tiles, 1, -3, 0, 'cloud', 'celestial_orrery');

  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'ruin' }); // gate50b
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank50b

  addRect(tiles, 7, 10, -2, 2, 1, 'cloud');
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter50b
  setTile(tiles, { x: 10, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism50c
  setTile(tiles, { x: 10, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism50d
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal50
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'stone', isStair: true });

  addRect(tiles, 7, 9, 3, 4, 2, 'cloud');
  setTile(tiles, { x: 8, z: 4, elevation: 2, terrain: 'ruin' }); // portal50
  setTile(tiles, { x: 7, z: 3, elevation: 2, terrain: 'stone' }); // echo50
  addDecor(tiles, 9, 4, 2, 'cloud', 'celestial_orrery');
  addDecor(tiles, 7, 4, 2, 'cloud', 'sky_obelisk');

  return {
    id: 50,
    worldId: 'world_5',
    stageNumberInWorld: 10,
    slug: 'crown-of-skyward-chorus',
    title: 'Crown of the Skyward Chorus',
    subtitle: 'Stage 50 · Grand Campaign Climax',
    objectiveDefault: 'Ignite the Chorus Resonator, cross the celestial span, and unite the Twin Beams into the Skyward Crown.',
    objectiveCrystalDone: 'The Skyward Chorus resounds across every world! Step into the Horizon Portal to unlock The Echo Trials.',
    subareas: ['Horizon Threshold', 'Chorus Hall', 'Skyward Span', 'Eternal Crown'],
    spawn: { x: -6, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: 0.4 },
    cameraZoom: 0.5,
    tiles,
    rotatingPlatforms: [
      { id: 'rot50a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -5, z: 2 }, label: 'Rotate Horizon Span' },
      { id: 'rot50b', pivotX: 5, pivotZ: 1, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: 2 }, label: 'Rotate Crown Span' },
    ],
    pressureSwitches: [{ id: 'sw50a', x: 2, z: 2, elevation: 0, latch: true, label: 'Open Chorus Shutter' }],
    gates: [
      { id: 'gate50a', x: 1, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw50a', blocksLight: true },
      { id: 'gate50b', x: 2, z: 1, elevation: 1, axis: 'z', linkedSubCrystalId: 'sub50', blocksLight: true },
    ],
    elevationPlatforms: [{ id: 'lift50a', x: 1, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Chorus Lift' }],
    lightEmitters: [
      { id: 'emitter50a', x: 0, z: -3, elevation: 0, direction: 1 },
      { id: 'emitter50b', x: 7, z: -1, elevation: 1, direction: 0 },
    ],
    lightPrisms: [
      { id: 'prism50a', x: 0, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Chorus Prism I' },
      { id: 'prism50b', x: 3, z: -1, elevation: 0, initialDirection: 1, label: 'Rotate Chorus Prism II' },
      { id: 'prism50c', x: 10, z: -1, elevation: 1, initialDirection: 2, label: 'Rotate Crown Prism III' },
      { id: 'prism50d', x: 10, z: 1, elevation: 1, initialDirection: 1, label: 'Rotate Crown Prism IV' },
    ],
    subCrystals: [{ id: 'sub50', x: 3, z: -3, elevation: 0, label: 'Skyward Chorus Resonator' }],
    heroNodes: [
      { id: 'hn50', kind: 'wind_vane', heroId: 'zeph', x: 8, z: 2, elevation: 1, label: 'Windstep: Skyward Hymn', bonusShards: 8 },
    ],
    echoFragment: makeEcho(
      50,
      7,
      3,
      2,
      'Heart of Five Worlds',
      'Eternal Crown Summit',
      'When all five sanctuaries sang together, ten hidden Echo Trials opened beyond the zenith.'
    ),
    crystal: { id: 'crystal50', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Restore the Skyward Crown' },
    portal: { id: 'portal50', x: 8, z: 4, elevation: 2, facing: 3 },
  };
}

export const WORLD5_LEVELS: LevelDef[] = [
  buildLevel41(),
  buildLevel42(),
  buildLevel43(),
  buildLevel44(),
  buildLevel45(),
  buildLevel46(),
  buildLevel47(),
  buildLevel48(),
  buildLevel49(),
  buildLevel50(),
];
