import { LevelDef, TileDef } from '../types';
import { addDecor, addRect, makeEcho, setTile } from './mapBuilder';

function buildLevel51(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -2, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'ruin' }); // spawn
  setTile(tiles, { x: -3, z: -2, elevation: 0, terrain: 'ruin' }); // sw51a
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'ruin' }); // sw51b (toggle)
  setTile(tiles, { x: -3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter51
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank51
  addDecor(tiles, -5, -2, 0, 'stone', 'echo_monolith');

  // East Crucible Ring
  addRect(tiles, 2, 5, -2, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: 0, elevation: 0, terrain: 'ruin' }); // gate51a
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism51a
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism51b
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'ruin' }); // gate51b
  setTile(tiles, { x: 5, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal51
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'ruin' }); // gate51c (inverted)
  setTile(tiles, { x: 5, z: 2, elevation: 0, terrain: 'ruin' }); // portal51
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'moss' }); // echo51
  addDecor(tiles, 5, 0, 0, 'stone', 'celestial_orrery');

  return {
    id: 51,
    worldId: 'world_6',
    stageNumberInWorld: 1,
    isBonusChallenge: true,
    slug: 'trial-echo-thresholds',
    title: 'Trial I: Echo of Thresholds',
    subtitle: 'Stage 51 · The Echo Trials',
    objectiveDefault: 'Balance the opposing shutters so the beam strikes the Crystal first, then flip the toggle to reach the Portal.',
    objectiveCrystalDone: 'Threshold Trial mastered. Toggle the shutter if needed and enter the portal.',
    subareas: ['Echo Gatehouse', 'Balanced Beam Vault'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.2, z: 0 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [
      { id: 'rot51', pivotX: 0, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: -1 }, label: 'Rotate Threshold Span' },
    ],
    pressureSwitches: [
      { id: 'sw51a', x: -3, z: -2, elevation: 0, latch: true, label: 'Drop Entry Gate' },
      { id: 'sw51b', x: -3, z: 2, elevation: 0, latch: false, label: 'Alternate Trial Shutters' },
    ],
    gates: [
      { id: 'gate51a', x: 2, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw51a', blocksLight: true },
      { id: 'gate51b', x: 4, z: -2, elevation: 0, axis: 'z', linkedSwitchId: 'sw51b', inverted: false, blocksLight: true },
      { id: 'gate51c', x: 4, z: 2, elevation: 0, axis: 'z', linkedSwitchId: 'sw51b', inverted: true, blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [{ id: 'emitter51', x: -3, z: 0, elevation: 0, direction: 0 }],
    lightPrisms: [
      { id: 'prism51a', x: 3, z: 0, elevation: 0, initialDirection: 1, label: 'Rotate Trial Prism I' },
      { id: 'prism51b', x: 3, z: -2, elevation: 0, initialDirection: 2, label: 'Rotate Trial Prism II' },
    ],
    heroNodes: [
      {
        id: 'hn51',
        kind: 'hidden_rune',
        heroId: 'wayfinder',
        x: -2,
        z: 2,
        elevation: 0,
        label: 'Lantern Focus: Reveal Echo Span',
        bridgeTiles: [{ x: 0, z: 2, elevation: 0, terrain: 'wood' }],
        bonusShards: 6,
      },
    ],
    echoFragment: makeEcho(
      51,
      2,
      2,
      0,
      'First Echo Seal',
      'Southeast Trial Rim',
      'Echo Trials reward forethought: plan which gate opens before returning for the toggle.'
    ),
    crystal: { id: 'crystal51', x: 5, z: -2, elevation: 0, requiresLightBeam: true, label: 'Awaken Echo Crystal I' },
    portal: { id: 'portal51', x: 5, z: 2, elevation: 0, facing: 2 },
  };
}

function buildLevel52(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 1, 0, 'stone');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'ruin' }); // spawn
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank52a
  addDecor(tiles, -6, -1, 0, 'stone', 'echo_monolith');

  // Middle Island (elev 0 -> elev 1)
  addRect(tiles, -1, 1, 0, 2, 0, 'stone');
  setTile(tiles, { x: 1, z: 2, elevation: 0, terrain: 'ruin' }); // sw52a
  setTile(tiles, { x: -1, z: 2, elevation: 0, terrain: 'moss' }); // echo52
  setTile(tiles, { x: 0, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank52b

  // East Dual-Lift Spire (elev 1 -> elev 2)
  addRect(tiles, 5, 7, -3, 0, 1, 'stone');
  setTile(tiles, { x: 5, z: -2, elevation: 1, terrain: 'ruin' }); // gate52
  setTile(tiles, { x: 6, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal52? wait lift52b at (6,0) goes 1->2
  addRect(tiles, 6, 8, 1, 2, 2, 'cloud');
  setTile(tiles, { x: 7, z: 2, elevation: 2, terrain: 'ruin' }); // portal52
  addDecor(tiles, 7, -3, 1, 'stone', 'echo_monolith');

  return {
    id: 52,
    worldId: 'world_6',
    stageNumberInWorld: 2,
    isBonusChallenge: true,
    slug: 'trial-twin-pivot',
    title: 'Trial II: Twin Pivot Gauntlet',
    subtitle: 'Stage 52 · The Echo Trials',
    objectiveDefault: 'Align both rotating spans, raise the hydraulic bridge-step, and ascend to the Summit Crystal.',
    objectiveCrystalDone: 'Twin pivots aligned. Ride the summit lift to the portal.',
    subareas: ['West Pivot Pier', 'Middle Lift Deck', 'Summit Crown'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.0, z: -0.3 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot52a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 1 }, label: 'Rotate Pivot Span I' },
      { id: 'rot52b', pivotX: 3, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Pivot Span II' },
    ],
    pressureSwitches: [{ id: 'sw52a', x: 1, z: 2, elevation: 0, latch: true, label: 'Unlock & Raise Bridge Step' }],
    gates: [{ id: 'gate52', x: 5, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw52a', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift52a', x: 0, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Middle Lift' },
      { id: 'lift52b', x: 6, z: 0, lowElevation: 1, highElevation: 2, initialHigh: false, label: 'Raise Summit Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      { id: 'hn52', kind: 'root_bridge', heroId: 'sylvi', x: 1, z: 0, elevation: 0, label: 'Rootcall: Grow East Chasm Vine', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      52,
      -1,
      2,
      0,
      'Second Echo Seal',
      'Lower Lift Rim',
      'Precision rotation bridges demand deliberate sequencing before stepping onto the hydraulic lift.'
    ),
    crystal: { id: 'crystal52', x: 6, z: -1, elevation: 1, requiresLightBeam: false, label: 'Restore Echo Crystal II' },
    portal: { id: 'portal52', x: 7, z: 2, elevation: 2, facing: 2 },
  };
}

function buildLevel53(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -4, 4, -4, 2, 0, 'basalt');
  setTile(tiles, { x: -3, z: 2, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter53a
  setTile(tiles, { x: 0, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter53b
  setTile(tiles, { x: -1, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism53a
  setTile(tiles, { x: -1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism53b
  setTile(tiles, { x: 2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub53
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin' }); // gate53
  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism53c
  setTile(tiles, { x: 3, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism53d
  setTile(tiles, { x: 3, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal53
  setTile(tiles, { x: 4, z: -3, elevation: 0, terrain: 'stone' }); // echo53
  addDecor(tiles, -4, 2, 0, 'basalt', 'echo_monolith');

  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'stone', isStair: true });
  addRect(tiles, 3, 5, 1, 2, 1, 'stone');
  setTile(tiles, { x: 4, z: 2, elevation: 1, terrain: 'ruin' }); // portal53

  return {
    id: 53,
    worldId: 'world_6',
    stageNumberInWorld: 3,
    isBonusChallenge: true,
    slug: 'trial-prismatic-paradox',
    title: 'Trial III: Prismatic Paradox',
    subtitle: 'Stage 53 · The Echo Trials',
    objectiveDefault: 'Channel beam I into the Echo Resonator to unlock beam II, then unite all four prisms.',
    objectiveCrystalDone: 'Paradox resolved in pure radiance. Ascend to the portal.',
    subareas: ['Optical Crucible', 'Resonator Niche', 'High Portal Deck'],
    spawn: { x: -3, z: 2, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 0.5, z: -1.0 },
    cameraZoom: 0.72,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate53', x: 0, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub53', blocksLight: true }],
    elevationPlatforms: [],
    lightEmitters: [
      { id: 'emitter53a', x: -4, z: 1, elevation: 0, direction: 0 },
      { id: 'emitter53b', x: 0, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism53a', x: -1, z: 1, elevation: 0, initialDirection: 2, label: 'Rotate Paradox Prism I' },
      { id: 'prism53b', x: -1, z: -3, elevation: 0, initialDirection: 3, label: 'Rotate Paradox Prism II' },
      { id: 'prism53c', x: 0, z: 0, elevation: 0, initialDirection: 3, label: 'Rotate Paradox Prism III' },
      { id: 'prism53d', x: 3, z: 0, elevation: 0, initialDirection: 2, label: 'Rotate Paradox Prism IV' },
    ],
    subCrystals: [{ id: 'sub53', x: 2, z: -3, elevation: 0, label: 'Echo Paradox Resonator' }],
    heroNodes: [
      { id: 'hn53', kind: 'ember_brazier', heroId: 'kael', x: 1, z: 2, elevation: 0, label: 'Ember Spark: Trial Hearth', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      53,
      4,
      -3,
      0,
      'Third Echo Seal',
      'Northeast Paradox Niche',
      'Every mirror begins off-axis in the Trials, daring travelers to read the full optical circuit first.'
    ),
    crystal: { id: 'crystal53', x: 3, z: -2, elevation: 0, requiresLightBeam: true, label: 'Awaken Echo Crystal III' },
    portal: { id: 'portal53', x: 4, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel54(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -3, -1, 0, 2, 0, 'stone');
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // spawn
  setTile(tiles, { x: -2, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'stone' });
  addDecor(tiles, -3, 2, 0, 'stone', 'echo_monolith');

  addRect(tiles, 0, 2, -2, 1, 1, 'stone');
  setTile(tiles, { x: 0, z: 1, elevation: 1, terrain: 'ruin' }); // sw54
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'ruin' }); // gate54
  setTile(tiles, { x: 0, z: -2, elevation: 1, terrain: 'cloud' }); // echo54

  setTile(tiles, { x: 2, z: -2, elevation: 2, terrain: 'ruin' });
  setTile(tiles, { x: 3, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -2, elevation: 2, terrain: 'stone' });
  setTile(tiles, { x: 4, z: -1, elevation: 2, terrain: 'stone', isStair: true });

  addRect(tiles, 3, 5, 0, 2, 3, 'cloud');
  setTile(tiles, { x: 4, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 0, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 1, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 4, z: 1, elevation: 3, terrain: 'ruin', blocksMovement: true }); // crystal54
  setTile(tiles, { x: 4, z: 2, elevation: 3, terrain: 'stone' });
  setTile(tiles, { x: 5, z: 2, elevation: 3, terrain: 'ruin' }); // portal54
  addDecor(tiles, 3, 2, 3, 'cloud', 'celestial_orrery');

  return {
    id: 54,
    worldId: 'world_6',
    stageNumberInWorld: 4,
    isBonusChallenge: true,
    slug: 'trial-vertical-labyrinth',
    title: 'Trial IV: Vertical Labyrinth',
    subtitle: 'Stage 54 · The Echo Trials',
    objectiveDefault: 'Synchronize both elevation lifts, open the upper sky-lock, and restore the Summit Crystal.',
    objectiveCrystalDone: 'Labyrinth ascended. Step into the fourth trial portal.',
    subareas: ['Base Terrace', 'Lock Deck', 'Sky Bridge', 'Zenith Altar'],
    spawn: { x: -2, z: 2, facingAngle: Math.PI },
    cameraCenter: { x: 1.0, z: 0.0 },
    cameraZoom: 0.76,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [{ id: 'sw54', x: 0, z: 1, elevation: 1, latch: true, label: 'Open Zenith Sky-Lock' }],
    gates: [{ id: 'gate54', x: 1, z: -1, elevation: 1, axis: 'z', linkedSwitchId: 'sw54', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift54a', x: -1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Lower Trial Lift' },
      { id: 'lift54b', x: 2, z: -1, lowElevation: 1, highElevation: 2, initialHigh: true, label: 'Align Upper Trial Lift' },
    ],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn54',
        kind: 'wind_vane',
        heroId: 'zeph',
        x: 1,
        z: 1,
        elevation: 1,
        label: 'Windstep: Summon Zenith Step',
        bridgeTiles: [{ x: 3, z: 1, elevation: 2, terrain: 'wood' }],
        bonusShards: 6,
      },
    ],
    echoFragment: makeEcho(
      54,
      0,
      -2,
      1,
      'Fourth Echo Seal',
      'North Lock Ledge',
      'Notice the upper lift begins elevated—lower it first to step aboard without wasted motion.'
    ),
    crystal: { id: 'crystal54', x: 4, z: 1, elevation: 3, requiresLightBeam: false, label: 'Awaken Echo Crystal IV' },
    portal: { id: 'portal54', x: 5, z: 2, elevation: 3, facing: 2 },
  };
}

function buildLevel55(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, -2, -2, 2, 0, 'stone');
  setTile(tiles, { x: -4, z: 0, elevation: 0, terrain: 'ruin' }); // spawn
  setTile(tiles, { x: -2, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank55a
  setTile(tiles, { x: -2, z: 2, elevation: 0, terrain: 'ruin' }); // sw55a
  addDecor(tiles, -5, -2, 0, 'stone', 'echo_monolith');

  addRect(tiles, 2, 4, -2, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: -2, elevation: 0, terrain: 'ruin' }); // gate55a
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw55b (toggle)
  setTile(tiles, { x: 4, z: 0, elevation: 0, terrain: 'ruin' }); // gate55c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin' }); // gate55b
  setTile(tiles, { x: 4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank55b
  setTile(tiles, { x: 3, z: 2, elevation: 0, terrain: 'sand' }); // echo55

  addRect(tiles, 8, 10, -2, 1, 0, 'stone');
  setTile(tiles, { x: 8, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 9, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal55
  setTile(tiles, { x: 10, z: 0, elevation: 0, terrain: 'ruin' }); // portal55
  addDecor(tiles, 10, -2, 0, 'stone', 'echo_monolith');

  return {
    id: 55,
    worldId: 'world_6',
    stageNumberInWorld: 5,
    isBonusChallenge: true,
    slug: 'trial-crosswind-toggle',
    title: 'Trial V: Crosswind Toggle',
    subtitle: 'Stage 55 · The Echo Trials',
    objectiveDefault: 'Navigate the dual toggle locks and swing both crosswind bridges in minimal turns.',
    objectiveCrystalDone: 'Crosswind gates mastered. Step into the fifth trial portal.',
    subareas: ['West Approach', 'Toggle Crossroads', 'East Echo Shrine'],
    spawn: { x: -4, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.5, z: 0 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot55a', pivotX: 0, pivotZ: -2, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -2, z: -1 }, label: 'Rotate Crosswind Span I' },
      { id: 'rot55b', pivotX: 6, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 4, z: 2 }, label: 'Rotate Crosswind Span II' },
    ],
    pressureSwitches: [
      { id: 'sw55a', x: -2, z: 2, elevation: 0, latch: true, label: 'Drop Entry Seal' },
      { id: 'sw55b', x: 2, z: 2, elevation: 0, latch: false, label: 'Alternate Crosswind Locks' },
    ],
    gates: [
      { id: 'gate55a', x: 2, z: -2, elevation: 0, axis: 'z', linkedSwitchId: 'sw55a', blocksLight: true },
      { id: 'gate55b', x: 4, z: 1, elevation: 0, axis: 'z', linkedSwitchId: 'sw55b', inverted: false, blocksLight: true },
      { id: 'gate55c', x: 4, z: 0, elevation: 0, axis: 'z', linkedSwitchId: 'sw55b', inverted: true, blocksLight: true },
    ],
    elevationPlatforms: [],
    lightEmitters: [],
    lightPrisms: [],
    heroNodes: [
      {
        id: 'hn55',
        kind: 'tide_channel',
        heroId: 'neris',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Tidal Pulse: Link Center Pier',
        bridgeTiles: [{ x: 1, z: 0, elevation: 0, terrain: 'wood' }],
        bonusShards: 6,
      },
    ],
    echoFragment: makeEcho(
      55,
      3,
      2,
      0,
      'Fifth Echo Seal',
      'Toggle Courtyard',
      'Even a single toggle plate becomes a rhythm instrument when paired with dual rotating spans.'
    ),
    crystal: { id: 'crystal55', x: 9, z: -1, elevation: 0, requiresLightBeam: false, label: 'Awaken Echo Crystal V' },
    portal: { id: 'portal55', x: 10, z: 0, elevation: 0, facing: 2 },
  };
}

function buildLevel56(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'stone');
  setTile(tiles, { x: -5, z: 1, elevation: 0, terrain: 'ruin' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank56a
  addDecor(tiles, -6, -1, 0, 'stone', 'echo_monolith');

  setTile(tiles, { x: 0, z: 0, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: 2, elevation: 0, terrain: 'ruin' }); // sw56
  setTile(tiles, { x: 1, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank56b
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' }); // gate56

  addRect(tiles, 6, 8, -3, 2, 1, 'stone');
  setTile(tiles, { x: 8, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter56
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism56a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism56b
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'cloud' }); // echo56
  addDecor(tiles, 8, 2, 1, 'stone', 'echo_monolith');

  addRect(tiles, 3, 4, 0, 2, 1, 'stone');
  setTile(tiles, { x: 4, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal56
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin' }); // portal56

  return {
    id: 56,
    worldId: 'world_6',
    stageNumberInWorld: 6,
    isBonusChallenge: true,
    slug: 'trial-chasm-optics',
    title: 'Trial VI: Chasm Optics',
    subtitle: 'Stage 56 · The Echo Trials',
    objectiveDefault: 'Cross all four sky-islets and direct the chasm starbeam cleanly into the west sanctuary crystal.',
    objectiveCrystalDone: 'Chasm optics perfected. Step into the sixth trial portal.',
    subareas: ['West Brink', 'Central Lock', 'East Prism Spire', 'South Crystal Isle'],
    spawn: { x: -5, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.0, z: -0.3 },
    cameraZoom: 0.62,
    tiles,
    rotatingPlatforms: [
      { id: 'rot56a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Brink Bridge' },
      { id: 'rot56b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Chasm Bridge' },
    ],
    pressureSwitches: [{ id: 'sw56', x: 0, z: 2, elevation: 0, latch: true, label: 'Drop Central Sky-Lock' }],
    gates: [{ id: 'gate56', x: 2, z: -2, elevation: 1, axis: 'z', linkedSwitchId: 'sw56', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift56a', x: 1, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Lock Lift' },
      { id: 'lift56b', x: 5, z: 2, lowElevation: 0, highElevation: 1, initialHigh: true, label: 'Sanctuary Lift' },
    ],
    lightEmitters: [{ id: 'emitter56', x: 8, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism56a', x: 6, z: -3, elevation: 1, initialDirection: 0, label: 'Rotate Spire Prism I' },
      { id: 'prism56b', x: 6, z: 1, elevation: 1, initialDirection: 3, label: 'Rotate Spire Prism II' },
    ],
    heroNodes: [
      { id: 'hn56', kind: 'hidden_rune', heroId: 'wayfinder', x: 3, z: 2, elevation: 1, label: 'Lantern Focus: Chasm Seal', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      56,
      8,
      1,
      1,
      'Sixth Echo Seal',
      'East Prism Spire',
      'Four small isles form a living circuit when bridges, lifts, and light beams align as one.'
    ),
    crystal: { id: 'crystal56', x: 4, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Echo Crystal VI' },
    portal: { id: 'portal56', x: 3, z: 2, elevation: 1, facing: 0 },
  };
}

function buildLevel57(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -6, -4, -1, 2, 0, 'stone');
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'ruin' }); // spawn
  setTile(tiles, { x: -4, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank57a
  addDecor(tiles, -6, -1, 0, 'stone', 'echo_monolith');

  addRect(tiles, 0, 2, 0, 2, 0, 'stone');
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'stone' });
  setTile(tiles, { x: 0, z: -1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw57a
  setTile(tiles, { x: 1, z: -2, elevation: 1, terrain: 'wood' });
  setTile(tiles, { x: 2, z: -2, elevation: 1, terrain: 'ruin' });
  setTile(tiles, { x: 1, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank57b

  addRect(tiles, 6, 9, -3, 2, 1, 'basalt');
  setTile(tiles, { x: 9, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter57
  setTile(tiles, { x: 6, z: -3, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism57a
  setTile(tiles, { x: 6, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism57b
  setTile(tiles, { x: 7, z: 1, elevation: 1, terrain: 'ruin' }); // gate57
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal57
  setTile(tiles, { x: 9, z: -1, elevation: 1, terrain: 'ruin' }); // sw57b
  setTile(tiles, { x: 9, z: 2, elevation: 1, terrain: 'ruin' }); // portal57
  setTile(tiles, { x: 6, z: 2, elevation: 1, terrain: 'stone' }); // echo57
  addDecor(tiles, 8, -3, 1, 'basalt', 'echo_monolith');

  return {
    id: 57,
    worldId: 'world_6',
    stageNumberInWorld: 7,
    isBonusChallenge: true,
    slug: 'trial-echo-crucible',
    title: 'Trial VII: Echo Crucible',
    subtitle: 'Stage 57 · The Echo Trials',
    objectiveDefault: 'Raise the hydraulic piston bridge, cross the upper forge span, and guide the beam past the shutter.',
    objectiveCrystalDone: 'Crucible Trial conquered. Step into the seventh trial portal.',
    subareas: ['Entry Quay', 'Piston Hub', 'High Catwalk', 'Echo Anvil'],
    spawn: { x: -5, z: 0, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.8, z: -0.4 },
    cameraZoom: 0.54,
    tiles,
    rotatingPlatforms: [
      { id: 'rot57a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -4, z: 2 }, label: 'Rotate Forge Span I' },
      { id: 'rot57b', pivotX: 4, pivotZ: -2, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 1, z: -3 }, label: 'Rotate Catwalk Span II' },
    ],
    pressureSwitches: [
      { id: 'sw57a', x: 2, z: 2, elevation: 0, latch: true, label: 'Raise Hydraulic Piston' },
      { id: 'sw57b', x: 9, z: -1, elevation: 1, latch: true, label: 'Drop Anvil Shutter' },
    ],
    gates: [{ id: 'gate57', x: 7, z: 1, elevation: 1, axis: 'z', linkedSwitchId: 'sw57b', blocksLight: true }],
    elevationPlatforms: [
      { id: 'lift57_manual', x: 0, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Piston Lift' },
      { id: 'lift57_bridge', x: 0, z: -2, lowElevation: 0, highElevation: 1, initialHigh: false, linkedSwitchId: 'sw57a', label: 'Hydraulic Piston' },
    ],
    lightEmitters: [{ id: 'emitter57', x: 9, z: -3, elevation: 1, direction: 2 }],
    lightPrisms: [
      { id: 'prism57a', x: 6, z: -3, elevation: 1, initialDirection: 0, label: 'Rotate Anvil Prism I' },
      { id: 'prism57b', x: 6, z: 1, elevation: 1, initialDirection: 2, label: 'Rotate Anvil Prism II' },
    ],
    heroNodes: [
      {
        id: 'hn57',
        kind: 'ember_brazier',
        heroId: 'kael',
        x: 2,
        z: 0,
        elevation: 0,
        label: 'Ember Spark: Forge Bridge Shortcut',
        bridgeTiles: [
          { x: 4, z: 0, elevation: 1, terrain: 'wood' },
          { x: 5, z: 0, elevation: 1, terrain: 'wood' },
        ],
        bonusShards: 6,
      },
    ],
    echoFragment: makeEcho(
      57,
      6,
      2,
      1,
      'Seventh Echo Seal',
      'Anvil Balcony',
      'Every gear, piston, and prism in the Trials echoes lessons mastered across the first five worlds.'
    ),
    crystal: { id: 'crystal57', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Echo Crystal VII' },
    portal: { id: 'portal57', x: 9, z: 2, elevation: 1, facing: 2 },
  };
}

function buildLevel58(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -5, 4, -4, 2, 0, 'cloud');
  setTile(tiles, { x: -4, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -5, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter58a
  setTile(tiles, { x: -2, z: 0, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism58a
  setTile(tiles, { x: -2, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism58b
  setTile(tiles, { x: 1, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub58
  setTile(tiles, { x: 2, z: -4, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter58b
  setTile(tiles, { x: 2, z: -1, elevation: 0, terrain: 'ruin' }); // gate58
  setTile(tiles, { x: 2, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism58c
  setTile(tiles, { x: 4, z: 1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism58d
  setTile(tiles, { x: 4, z: -2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crystal58
  addDecor(tiles, -5, -4, 0, 'cloud', 'echo_monolith');

  addRect(tiles, 6, 8, -2, 2, 1, 'stone');
  setTile(tiles, { x: 7, z: 0, elevation: 1, terrain: 'ruin' }); // portal58
  setTile(tiles, { x: 7, z: -2, elevation: 1, terrain: 'cloud' }); // echo58

  return {
    id: 58,
    worldId: 'world_6',
    stageNumberInWorld: 8,
    isBonusChallenge: true,
    slug: 'trial-mirror-four-winds',
    title: 'Trial VIII: Mirror of Four Winds',
    subtitle: 'Stage 58 · The Echo Trials',
    objectiveDefault: 'Feed the Four-Winds Resonator, unlock the mirror shutter, and focus every star-prism.',
    objectiveCrystalDone: 'Four winds sing in pure starlight. Ride the lift to the portal.',
    subareas: ['Mirror Courtyard', 'Resonator Altar', 'High Portal Deck'],
    spawn: { x: -4, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 1.5, z: -0.6 },
    cameraZoom: 0.56,
    tiles,
    rotatingPlatforms: [],
    pressureSwitches: [],
    gates: [{ id: 'gate58', x: 2, z: -1, elevation: 0, axis: 'x', linkedSubCrystalId: 'sub58', blocksLight: true }],
    elevationPlatforms: [{ id: 'lift58', x: 5, z: 0, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Wind Crown Lift' }],
    lightEmitters: [
      { id: 'emitter58a', x: -5, z: 0, elevation: 0, direction: 0 },
      { id: 'emitter58b', x: 2, z: -4, elevation: 0, direction: 1 },
    ],
    lightPrisms: [
      { id: 'prism58a', x: -2, z: 0, elevation: 0, initialDirection: 2, label: 'Rotate Mirror Prism I' },
      { id: 'prism58b', x: -2, z: -3, elevation: 0, initialDirection: 3, label: 'Rotate Mirror Prism II' },
      { id: 'prism58c', x: 2, z: 1, elevation: 0, initialDirection: 0, label: 'Rotate Mirror Prism III' },
      { id: 'prism58d', x: 4, z: 1, elevation: 0, initialDirection: 2, label: 'Rotate Mirror Prism IV' },
    ],
    subCrystals: [{ id: 'sub58', x: 1, z: -3, elevation: 0, label: 'Four-Winds Resonator' }],
    heroNodes: [
      { id: 'hn58', kind: 'wind_vane', heroId: 'zeph', x: 4, z: 2, elevation: 0, label: 'Windstep: Mirror Gust', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      58,
      7,
      -2,
      1,
      'Eighth Echo Seal',
      'Wind Crown Terrace',
      'Four prisms form two crossing chords of light: one unlocks the gate, the second awakens the shrine.'
    ),
    crystal: { id: 'crystal58', x: 4, z: -2, elevation: 0, requiresLightBeam: true, label: 'Awaken Echo Crystal VIII' },
    portal: { id: 'portal58', x: 7, z: 0, elevation: 1, facing: 2 },
  };
}

function buildLevel59(): LevelDef {
  const tiles: TileDef[] = [];
  addRect(tiles, -7, -4, -1, 2, 0, 'stone');
  setTile(tiles, { x: -6, z: 1, elevation: 0, terrain: 'ruin' }); // spawn
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank59a
  addDecor(tiles, -7, -1, 0, 'stone', 'echo_monolith');

  addRect(tiles, 0, 3, -3, 2, 0, 'stone');
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw59a
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'ruin' }); // gate59a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter59a
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism59a
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism59b
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub59

  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'ruin' }); // gate59b
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank59b

  addRect(tiles, 7, 10, -2, 2, 1, 'basalt');
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter59b
  setTile(tiles, { x: 10, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism59c
  setTile(tiles, { x: 10, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism59d
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal59
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'stone', isStair: true });

  addRect(tiles, 7, 9, 3, 4, 2, 'cloud');
  setTile(tiles, { x: 8, z: 4, elevation: 2, terrain: 'ruin' }); // portal59
  setTile(tiles, { x: 7, z: 3, elevation: 2, terrain: 'stone' }); // echo59
  addDecor(tiles, 9, 4, 2, 'cloud', 'echo_monolith');

  return {
    id: 59,
    worldId: 'world_6',
    stageNumberInWorld: 9,
    isBonusChallenge: true,
    slug: 'trial-grand-relay',
    title: 'Trial IX: Grand Relay Matrix',
    subtitle: 'Stage 59 · The Echo Trials',
    objectiveDefault: 'Unseal the Grand Relay Matrix across three islands, ignite the Resonator, and align four star-prisms.',
    objectiveCrystalDone: 'Matrix illuminated. Ascend the crown stair to the penultimate portal.',
    subareas: ['Relay Wharf', 'Matrix Hall', 'Upper Bridge', 'Echo Crown'],
    spawn: { x: -6, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: 0.4 },
    cameraZoom: 0.5,
    tiles,
    rotatingPlatforms: [
      { id: 'rot59a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -5, z: 2 }, label: 'Rotate Matrix Span I' },
      { id: 'rot59b', pivotX: 5, pivotZ: 1, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: 2 }, label: 'Rotate Matrix Span II' },
    ],
    pressureSwitches: [{ id: 'sw59a', x: 2, z: 2, elevation: 0, latch: true, label: 'Drop Matrix Shutter' }],
    gates: [
      { id: 'gate59a', x: 1, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw59a', blocksLight: true },
      { id: 'gate59b', x: 2, z: 1, elevation: 1, axis: 'z', linkedSubCrystalId: 'sub59', blocksLight: true },
    ],
    elevationPlatforms: [{ id: 'lift59a', x: 1, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Matrix Lift' }],
    lightEmitters: [
      { id: 'emitter59a', x: 0, z: -3, elevation: 0, direction: 1 },
      { id: 'emitter59b', x: 7, z: -1, elevation: 1, direction: 0 },
    ],
    lightPrisms: [
      { id: 'prism59a', x: 0, z: -1, elevation: 0, initialDirection: 2, label: 'Rotate Matrix Prism I' },
      { id: 'prism59b', x: 3, z: -1, elevation: 0, initialDirection: 2, label: 'Rotate Matrix Prism II' },
      { id: 'prism59c', x: 10, z: -1, elevation: 1, initialDirection: 0, label: 'Rotate Matrix Prism III' },
      { id: 'prism59d', x: 10, z: 1, elevation: 1, initialDirection: 2, label: 'Rotate Matrix Prism IV' },
    ],
    subCrystals: [{ id: 'sub59', x: 3, z: -3, elevation: 0, label: 'Grand Matrix Resonator' }],
    heroNodes: [
      { id: 'hn59', kind: 'root_bridge', heroId: 'sylvi', x: 8, z: 2, elevation: 1, label: 'Rootcall: Matrix Vine', bonusShards: 6 },
    ],
    echoFragment: makeEcho(
      59,
      7,
      3,
      2,
      'Ninth Echo Seal',
      'Penultimate Summit',
      'Only one Trial remains beyond this crest: the Heart of the Wayfinder.'
    ),
    crystal: { id: 'crystal59', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken Echo Crystal IX' },
    portal: { id: 'portal59', x: 8, z: 4, elevation: 2, facing: 3 },
  };
}

function buildLevel60(): LevelDef {
  const tiles: TileDef[] = [];
  // Ultimate Crown Gauntlet: 4 interconnected sub-realms (Meadow -> Moss -> Basalt -> Cloud Crown)
  addRect(tiles, -7, -4, -1, 2, 0, 'grass');
  setTile(tiles, { x: -6, z: 1, elevation: 0, terrain: 'stone' }); // spawn
  setTile(tiles, { x: -5, z: 2, elevation: 0, terrain: 'ruin', blocksMovement: true }); // crank60a
  addDecor(tiles, -7, -1, 0, 'grass', 'ancient_root_tree');
  addDecor(tiles, -7, 2, 0, 'grass', 'stone_lantern');

  // Plaza II (Moss & Sand)
  addRect(tiles, 0, 3, -3, 2, 0, 'moss');
  setTile(tiles, { x: 2, z: 2, elevation: 0, terrain: 'ruin' }); // sw60a
  setTile(tiles, { x: 1, z: -1, elevation: 0, terrain: 'ruin' }); // gate60a
  setTile(tiles, { x: 0, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter60a
  setTile(tiles, { x: 0, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism60a
  setTile(tiles, { x: 3, z: -1, elevation: 0, terrain: 'ruin', blocksMovement: true }); // prism60b
  setTile(tiles, { x: 3, z: -3, elevation: 0, terrain: 'ruin', blocksMovement: true }); // sub60
  addDecor(tiles, 1, -3, 0, 'moss', 'coral_spire');

  setTile(tiles, { x: 2, z: 1, elevation: 1, terrain: 'ruin' }); // gate60b
  setTile(tiles, { x: 3, z: 1, elevation: 1, terrain: 'stone' });
  setTile(tiles, { x: 3, z: 2, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crank60b

  // Plaza III (Basalt & Light Vault)
  addRect(tiles, 7, 10, -2, 2, 1, 'basalt');
  setTile(tiles, { x: 7, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true, blocksLight: true }); // emitter60b
  setTile(tiles, { x: 10, z: -1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism60c
  setTile(tiles, { x: 10, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // prism60d
  setTile(tiles, { x: 8, z: 1, elevation: 1, terrain: 'ruin', blocksMovement: true }); // crystal60
  setTile(tiles, { x: 8, z: 2, elevation: 1, terrain: 'stone', isStair: true });
  addDecor(tiles, 9, -2, 1, 'basalt', 'ember_brazier_prop');

  // Crown IV (Cloud Eternal Portal)
  addRect(tiles, 7, 9, 3, 4, 2, 'cloud');
  setTile(tiles, { x: 8, z: 4, elevation: 2, terrain: 'ruin' }); // portal60
  setTile(tiles, { x: 7, z: 3, elevation: 2, terrain: 'stone' }); // echo60
  addDecor(tiles, 9, 4, 2, 'cloud', 'celestial_orrery');
  addDecor(tiles, 7, 4, 2, 'cloud', 'echo_monolith');

  return {
    id: 60,
    worldId: 'world_6',
    stageNumberInWorld: 10,
    isBonusChallenge: true,
    slug: 'trial-heart-wayfinder',
    title: 'Trial X: Heart of the Wayfinder',
    subtitle: 'Stage 60 · Ultimate Echo Finale',
    objectiveDefault: 'Master every discipline—bridges, switches, lifts, resonator, and four prisms—to awaken the Eternal Heart.',
    objectiveCrystalDone: 'All sixty islands resonate in timeless harmony! Step into the Eternal Portal.',
    subareas: ['Dawn Bastion', 'Verdant Lock', 'Ember Refractory', 'Eternal Horizon'],
    spawn: { x: -6, z: 1, facingAngle: Math.PI / 2 },
    cameraCenter: { x: 2.0, z: 0.4 },
    cameraZoom: 0.5,
    tiles,
    rotatingPlatforms: [
      { id: 'rot60a', pivotX: -2, pivotZ: 0, elevation: 0, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: -5, z: 2 }, label: 'Rotate Dawn Bridge' },
      { id: 'rot60b', pivotX: 5, pivotZ: 1, elevation: 1, baseOffsets: [{ dx: -1, dz: 0 }, { dx: 0, dz: 0 }, { dx: 1, dz: 0 }], initialStep: 1, crankPos: { x: 3, z: 2 }, label: 'Rotate Eternal Bridge' },
    ],
    pressureSwitches: [{ id: 'sw60a', x: 2, z: 2, elevation: 0, latch: true, label: 'Drop Echo Shutter' }],
    gates: [
      { id: 'gate60a', x: 1, z: -1, elevation: 0, axis: 'z', linkedSwitchId: 'sw60a', blocksLight: true },
      { id: 'gate60b', x: 2, z: 1, elevation: 1, axis: 'z', linkedSubCrystalId: 'sub60', blocksLight: true },
    ],
    elevationPlatforms: [{ id: 'lift60a', x: 1, z: 1, lowElevation: 0, highElevation: 1, initialHigh: false, label: 'Raise Trial Crown Lift' }],
    lightEmitters: [
      { id: 'emitter60a', x: 0, z: -3, elevation: 0, direction: 1 },
      { id: 'emitter60b', x: 7, z: -1, elevation: 1, direction: 0 },
    ],
    lightPrisms: [
      { id: 'prism60a', x: 0, z: -1, elevation: 0, initialDirection: 2, label: 'Rotate Echo Prism I' },
      { id: 'prism60b', x: 3, z: -1, elevation: 0, initialDirection: 3, label: 'Rotate Echo Prism II' },
      { id: 'prism60c', x: 10, z: -1, elevation: 1, initialDirection: 0, label: 'Rotate Eternal Prism III' },
      { id: 'prism60d', x: 10, z: 1, elevation: 1, initialDirection: 3, label: 'Rotate Eternal Prism IV' },
    ],
    subCrystals: [{ id: 'sub60', x: 3, z: -3, elevation: 0, label: 'Wayfinder Heart Resonator' }],
    heroNodes: [
      { id: 'hn60', kind: 'hidden_rune', heroId: 'wayfinder', x: 8, z: 2, elevation: 1, label: 'Lantern Focus: Eternal Echo', bonusShards: 10 },
    ],
    echoFragment: makeEcho(
      60,
      7,
      3,
      2,
      'Final Echo: The Whole Sky',
      'Eternal Horizon Crown',
      'Sixty islands, five Wayfinders, and one unbroken constellation of light suspended forever in clear morning air.'
    ),
    crystal: { id: 'crystal60', x: 8, z: 1, elevation: 1, requiresLightBeam: true, label: 'Awaken the Eternal Heart' },
    portal: { id: 'portal60', x: 8, z: 4, elevation: 2, facing: 3 },
  };
}

export const WORLD6_LEVELS: LevelDef[] = [
  buildLevel51(),
  buildLevel52(),
  buildLevel53(),
  buildLevel54(),
  buildLevel55(),
  buildLevel56(),
  buildLevel57(),
  buildLevel58(),
  buildLevel59(),
  buildLevel60(),
];
