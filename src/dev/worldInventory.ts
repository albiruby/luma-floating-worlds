import {
  getElevationPlatformHeight,
  getRotatingPlatformTiles,
  getSurfaceAtTile,
  isGateOpen,
} from '../game/rules';
import {
  ELEVATION_STEP,
  LevelDef,
  PuzzleRuntimeState,
  TILE_SIZE,
} from '../game/types';
import {
  InspectableObject,
  PuzzleConnectionLink,
  WorldTileWalkability,
} from './debugTypes';

export function buildLevelObjectInventory(
  level: LevelDef,
  state: PuzzleRuntimeState
): InspectableObject[] {
  const items: InspectableObject[] = [];

  const spawnSurface = getSurfaceAtTile(level, state, level.spawn.x, level.spawn.z);
  const spawnElev = spawnSurface?.elevation ?? 0;
  items.push({
    id: 'spawn',
    kind: 'spawn',
    name: 'Wayfinder Spawn',
    gx: level.spawn.x,
    gz: level.spawn.z,
    elevation: spawnElev,
    worldX: level.spawn.x * TILE_SIZE,
    worldY: spawnElev * ELEVATION_STEP,
    worldZ: level.spawn.z * TILE_SIZE,
    stateSummary: `Facing ${level.spawn.facingAngle.toFixed(2)} rad`,
    collisionStatus: 'walkable',
    interactive: false,
    linkedIds: [],
    configSummary: { facingAngle: level.spawn.facingAngle },
  });

  for (const sw of level.pressureSwitches) {
    const active = Boolean(state.switchStates[sw.id]);
    const linkedGates = level.gates
      .filter((g) => g.linkedSwitchId === sw.id)
      .map((g) => g.id);
    const linkedLifts = level.elevationPlatforms
      .filter((l) => l.linkedSwitchId === sw.id)
      .map((l) => l.id);
    items.push({
      id: sw.id,
      kind: 'switch',
      name: sw.label,
      gx: sw.x,
      gz: sw.z,
      elevation: sw.elevation,
      worldX: sw.x * TILE_SIZE,
      worldY: sw.elevation * ELEVATION_STEP,
      worldZ: sw.z * TILE_SIZE,
      stateSummary: `${active ? 'ON' : 'OFF'} · ${sw.latch ? 'Latch' : 'Toggle'}`,
      collisionStatus: 'walkable',
      interactive: true,
      linkedIds: [...linkedGates, ...linkedLifts],
      configSummary: { latch: sw.latch, active },
    });
  }

  for (const gate of level.gates) {
    const open = isGateOpen(level, state, gate.id);
    const override = state.debugGateOverrides?.[gate.id];
    const links: string[] = [];
    if (gate.linkedSwitchId) links.push(gate.linkedSwitchId);
    if (gate.linkedSubCrystalId) links.push(gate.linkedSubCrystalId);
    items.push({
      id: gate.id,
      kind: 'gate',
      name: `Gate (${gate.id})`,
      gx: gate.x,
      gz: gate.z,
      elevation: gate.elevation,
      worldX: gate.x * TILE_SIZE,
      worldY: gate.elevation * ELEVATION_STEP,
      worldZ: gate.z * TILE_SIZE,
      stateSummary: `${open ? 'OPEN' : 'CLOSED'}${override ? ` [Forced ${override.toUpperCase()}]` : ''}${
        gate.inverted ? ' · Inverted' : ''
      }`,
      collisionStatus: open ? 'walkable' : 'blocking',
      interactive: false,
      linkedIds: links,
      configSummary: {
        axis: gate.axis,
        inverted: Boolean(gate.inverted),
        blocksLight: Boolean(gate.blocksLight),
        override: override ?? 'none',
      },
    });
  }

  for (const plat of level.rotatingPlatforms) {
    const step = state.rotatingSteps[plat.id] ?? plat.initialStep;
    items.push({
      id: plat.id,
      kind: 'rotating',
      name: plat.label,
      gx: plat.pivotX,
      gz: plat.pivotZ,
      elevation: plat.elevation,
      worldX: plat.pivotX * TILE_SIZE,
      worldY: plat.elevation * ELEVATION_STEP,
      worldZ: plat.pivotZ * TILE_SIZE,
      stateSummary: `Step ${step} (${step * 90}°)`,
      collisionStatus: 'walkable',
      interactive: true,
      linkedIds: [],
      configSummary: {
        initialStep: plat.initialStep,
        currentStep: step,
        crankPos: plat.crankPos ?? null,
        tileCount: plat.baseOffsets.length,
      },
    });
  }

  for (const lift of level.elevationPlatforms) {
    const elev = getElevationPlatformHeight(level, state, lift.id);
    const isHigh = elev === lift.highElevation;
    items.push({
      id: lift.id,
      kind: 'elevation',
      name: lift.label,
      gx: lift.x,
      gz: lift.z,
      elevation: elev,
      worldX: lift.x * TILE_SIZE,
      worldY: elev * ELEVATION_STEP,
      worldZ: lift.z * TILE_SIZE,
      stateSummary: `${isHigh ? 'HIGH' : 'LOW'} (Elev ${elev} · range ${lift.lowElevation}..${lift.highElevation})`,
      collisionStatus: 'walkable',
      interactive: !lift.linkedSwitchId,
      linkedIds: lift.linkedSwitchId ? [lift.linkedSwitchId] : [],
      configSummary: {
        lowElevation: lift.lowElevation,
        highElevation: lift.highElevation,
        initialHigh: lift.initialHigh,
        linkedSwitchId: lift.linkedSwitchId ?? null,
      },
    });
  }

  for (const em of level.lightEmitters) {
    const disabled = Boolean(state.debugDisabledEmitters?.[em.id]);
    items.push({
      id: em.id,
      kind: 'emitter',
      name: `Light Emitter (${em.id})`,
      gx: em.x,
      gz: em.z,
      elevation: em.elevation,
      worldX: em.x * TILE_SIZE,
      worldY: em.elevation * ELEVATION_STEP,
      worldZ: em.z * TILE_SIZE,
      stateSummary: `${disabled ? 'DISABLED' : 'ACTIVE'} · Dir ${em.direction * 90}°`,
      collisionStatus: 'blocking',
      interactive: false,
      linkedIds: [],
      configSummary: { direction: em.direction, disabled },
    });
  }

  for (const prism of level.lightPrisms) {
    const dir = state.prismDirections[prism.id] ?? prism.initialDirection;
    const isLit = state.litPrismIds.includes(prism.id);
    items.push({
      id: prism.id,
      kind: 'prism',
      name: prism.label,
      gx: prism.x,
      gz: prism.z,
      elevation: prism.elevation,
      worldX: prism.x * TILE_SIZE,
      worldY: prism.elevation * ELEVATION_STEP,
      worldZ: prism.z * TILE_SIZE,
      stateSummary: `${isLit ? 'LIT' : 'UNLIT'} · Aim ${dir * 90}°`,
      collisionStatus: 'blocking',
      interactive: true,
      linkedIds: [],
      configSummary: { initialDirection: prism.initialDirection, currentDirection: dir, lit: isLit },
    });
  }

  for (const sub of level.subCrystals ?? []) {
    const lit = state.litSubCrystalIds.includes(sub.id);
    const linkedGates = level.gates
      .filter((g) => g.linkedSubCrystalId === sub.id)
      .map((g) => g.id);
    items.push({
      id: sub.id,
      kind: 'subcrystal',
      name: sub.label,
      gx: sub.x,
      gz: sub.z,
      elevation: sub.elevation,
      worldX: sub.x * TILE_SIZE,
      worldY: sub.elevation * ELEVATION_STEP,
      worldZ: sub.z * TILE_SIZE,
      stateSummary: lit ? 'ENERGIZED' : 'DORMANT',
      collisionStatus: 'blocking',
      interactive: false,
      linkedIds: linkedGates,
      configSummary: { lit },
    });
  }

  items.push({
    id: level.crystal.id,
    kind: 'crystal',
    name: level.crystal.label,
    gx: level.crystal.x,
    gz: level.crystal.z,
    elevation: level.crystal.elevation,
    worldX: level.crystal.x * TILE_SIZE,
    worldY: level.crystal.elevation * ELEVATION_STEP,
    worldZ: level.crystal.z * TILE_SIZE,
    stateSummary: `${state.crystalRestored ? 'RESTORED' : 'DORMANT'}${
      level.crystal.requiresLightBeam ? ' · Requires Beam' : ' · Direct Interact'
    }`,
    collisionStatus: 'blocking',
    interactive: !level.crystal.requiresLightBeam,
    linkedIds: [level.portal.id],
    configSummary: {
      requiresLightBeam: Boolean(level.crystal.requiresLightBeam),
      litByBeam: state.crystalLitByBeam,
      restored: state.crystalRestored,
    },
  });

  for (const hn of level.heroNodes ?? []) {
    const active = Boolean(state.heroNodesActive?.[hn.id]);
    items.push({
      id: hn.id,
      kind: 'hero_node',
      name: `${hn.label} (${hn.heroId})`,
      gx: hn.x,
      gz: hn.z,
      elevation: hn.elevation,
      worldX: hn.x * TILE_SIZE,
      worldY: hn.elevation * ELEVATION_STEP,
      worldZ: hn.z * TILE_SIZE,
      stateSummary: `${active ? 'AWAKENED' : 'DORMANT'} · Hero: ${hn.heroId}`,
      collisionStatus: 'walkable',
      interactive: !active && state.activeCharacterId === hn.heroId,
      linkedIds: hn.boostsLiftId ? [hn.boostsLiftId] : [],
      configSummary: {
        heroId: hn.heroId,
        bridgeTilesCount: hn.bridgeTiles?.length ?? 0,
        boostsLiftId: hn.boostsLiftId ?? null,
        bonusShards: hn.bonusShards ?? 0,
      },
    });
  }

  if (level.echoFragment) {
    const ef = level.echoFragment;
    items.push({
      id: ef.id,
      kind: 'echo',
      name: `Echo: ${ef.title}`,
      gx: ef.x,
      gz: ef.z,
      elevation: ef.elevation,
      worldX: ef.x * TILE_SIZE,
      worldY: ef.elevation * ELEVATION_STEP,
      worldZ: ef.z * TILE_SIZE,
      stateSummary: state.echoCollectedInRun ? 'COLLECTED IN RUN' : 'UNCOLLECTED',
      collisionStatus: 'walkable',
      interactive: !state.echoCollectedInRun,
      linkedIds: [],
      configSummary: { title: ef.title, loreText: ef.loreText },
    });
  }

  items.push({
    id: level.portal.id,
    kind: 'portal',
    name: 'Awakening Portal',
    gx: level.portal.x,
    gz: level.portal.z,
    elevation: level.portal.elevation,
    worldX: level.portal.x * TILE_SIZE,
    worldY: level.portal.elevation * ELEVATION_STEP,
    worldZ: level.portal.z * TILE_SIZE,
    stateSummary: state.portalAwakened ? 'AWAKENED' : 'SEALED',
    collisionStatus: 'walkable',
    interactive: state.portalAwakened,
    linkedIds: [level.crystal.id],
    configSummary: { facing: level.portal.facing, awakened: state.portalAwakened },
  });

  for (const tile of level.tiles) {
    if (!tile.decor) continue;
    items.push({
      id: `decor_${tile.x}_${tile.z}`,
      kind: 'decor',
      name: `${tile.decor} (${tile.x},${tile.z})`,
      gx: tile.x,
      gz: tile.z,
      elevation: tile.elevation,
      worldX: tile.x * TILE_SIZE,
      worldY: tile.elevation * ELEVATION_STEP,
      worldZ: tile.z * TILE_SIZE,
      stateSummary: tile.blocksMovement ? 'Solid Obstacle' : 'Non-blocking Prop',
      collisionStatus: tile.blocksMovement ? 'blocking' : 'non-solid',
      interactive: false,
      linkedIds: [],
      configSummary: {
        decor: tile.decor,
        blocksMovement: Boolean(tile.blocksMovement),
        blocksLight: Boolean(tile.blocksLight),
      },
    });
  }

  return items;
}

export function computeWorldTileWalkability(
  level: LevelDef,
  state: PuzzleRuntimeState
): {
  tiles: WorldTileWalkability[];
  voidBorders: Array<{ gx: number; gz: number; elevation: number }>;
} {
  const tiles: WorldTileWalkability[] = [];
  const occupiedKeys = new Set<string>();

  for (const t of level.tiles) {
    occupiedKeys.add(`${t.x},${t.z}`);
    const gate = level.gates.find((g) => g.x === t.x && g.z === t.z);
    if (gate) {
      const open = isGateOpen(level, state, gate.id);
      tiles.push({
        gx: t.x,
        gz: t.z,
        elevation: t.elevation,
        kind: open ? 'walkable' : 'conditional',
        reason: open ? `Gate ${gate.id} open` : `Gate ${gate.id} closed`,
      });
      continue;
    }

    const lift = level.elevationPlatforms.find((l) => l.x === t.x && l.z === t.z);
    if (lift) {
      const elev = getElevationPlatformHeight(level, state, lift.id);
      tiles.push({
        gx: t.x,
        gz: t.z,
        elevation: elev,
        kind: 'conditional',
        reason: `Lift ${lift.id} (elev ${elev})`,
      });
      continue;
    }

    if (t.terrain === 'water') {
      tiles.push({
        gx: t.x,
        gz: t.z,
        elevation: t.elevation,
        kind: 'blocked',
        reason: 'Water pond',
      });
      continue;
    }

    if (t.blocksMovement) {
      tiles.push({
        gx: t.x,
        gz: t.z,
        elevation: t.elevation,
        kind: 'blocked',
        reason: t.decor ? `Obstacle: ${t.decor}` : 'blocksMovement',
      });
      continue;
    }

    tiles.push({
      gx: t.x,
      gz: t.z,
      elevation: t.elevation,
      kind: 'walkable',
      reason: t.isStair ? 'Stairway' : `${t.terrain} tile`,
    });
  }

  for (const rt of getRotatingPlatformTiles(level, state)) {
    const key = `${rt.x},${rt.z}`;
    occupiedKeys.add(key);
    tiles.push({
      gx: rt.x,
      gz: rt.z,
      elevation: rt.elevation,
      kind: 'conditional',
      reason: `Rotating platform ${rt.platformId}`,
    });
  }

  // Lifts placed over void tiles
  for (const lift of level.elevationPlatforms) {
    const key = `${lift.x},${lift.z}`;
    if (!occupiedKeys.has(key)) {
      occupiedKeys.add(key);
      const elev = getElevationPlatformHeight(level, state, lift.id);
      tiles.push({
        gx: lift.x,
        gz: lift.z,
        elevation: elev,
        kind: 'conditional',
        reason: `Lift ${lift.id} (elev ${elev})`,
      });
    }
  }

  // Hero-activated bridge tiles
  for (const hn of level.heroNodes ?? []) {
    const active = Boolean(state.heroNodesActive?.[hn.id]);
    for (const bt of hn.bridgeTiles ?? []) {
      const key = `${bt.x},${bt.z}`;
      if (!occupiedKeys.has(key)) {
        occupiedKeys.add(key);
        tiles.push({
          gx: bt.x,
          gz: bt.z,
          elevation: bt.elevation,
          kind: active ? 'walkable' : 'conditional',
          reason: `${hn.heroId} bridge (${hn.id})${active ? ' active' : ' dormant'}`,
        });
      }
    }
  }

  // Compute immediate 1-tile void boundary cells surrounding island tiles
  const voidSet = new Set<string>();
  const voidBorders: Array<{ gx: number; gz: number; elevation: number }> = [];
  const dirs: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const wt of tiles) {
    for (const [dx, dz] of dirs) {
      const nx = wt.gx + dx;
      const nz = wt.gz + dz;
      const nk = `${nx},${nz}`;
      if (!occupiedKeys.has(nk) && !voidSet.has(nk)) {
        voidSet.add(nk);
        voidBorders.push({ gx: nx, gz: nz, elevation: wt.elevation });
      }
    }
  }

  return { tiles, voidBorders };
}

export function buildPuzzleConnectionLinks(
  level: LevelDef,
  state: PuzzleRuntimeState
): PuzzleConnectionLink[] {
  const links: PuzzleConnectionLink[] = [];

  for (const gate of level.gates) {
    if (gate.linkedSwitchId) {
      const sw = level.pressureSwitches.find((s) => s.id === gate.linkedSwitchId);
      if (sw) {
        links.push({
          id: `link_${sw.id}_${gate.id}`,
          fromKind: 'switch',
          fromId: sw.id,
          fromPos: [sw.x * TILE_SIZE, sw.elevation * ELEVATION_STEP + 0.4, sw.z * TILE_SIZE],
          toKind: 'gate',
          toId: gate.id,
          toPos: [gate.x * TILE_SIZE, gate.elevation * ELEVATION_STEP + 0.9, gate.z * TILE_SIZE],
          active: Boolean(state.switchStates[sw.id]),
          label: `${sw.id} → ${gate.id}${gate.inverted ? ' (INV)' : ''}`,
        });
      }
    }
    if (gate.linkedSubCrystalId) {
      const sub = level.subCrystals?.find((sc) => sc.id === gate.linkedSubCrystalId);
      if (sub) {
        links.push({
          id: `link_${sub.id}_${gate.id}`,
          fromKind: 'subcrystal',
          fromId: sub.id,
          fromPos: [sub.x * TILE_SIZE, sub.elevation * ELEVATION_STEP + 0.9, sub.z * TILE_SIZE],
          toKind: 'gate',
          toId: gate.id,
          toPos: [gate.x * TILE_SIZE, gate.elevation * ELEVATION_STEP + 0.9, gate.z * TILE_SIZE],
          active: state.litSubCrystalIds.includes(sub.id),
          label: `${sub.id} → ${gate.id}`,
        });
      }
    }
  }

  for (const lift of level.elevationPlatforms) {
    if (lift.linkedSwitchId) {
      const sw = level.pressureSwitches.find((s) => s.id === lift.linkedSwitchId);
      if (sw) {
        links.push({
          id: `link_${sw.id}_${lift.id}`,
          fromKind: 'switch',
          fromId: sw.id,
          fromPos: [sw.x * TILE_SIZE, sw.elevation * ELEVATION_STEP + 0.4, sw.z * TILE_SIZE],
          toKind: 'elevation',
          toId: lift.id,
          toPos: [
            lift.x * TILE_SIZE,
            getElevationPlatformHeight(level, state, lift.id) * ELEVATION_STEP + 0.4,
            lift.z * TILE_SIZE,
          ],
          active: Boolean(state.switchStates[sw.id]),
          label: `${sw.id} → ${lift.id}`,
        });
      }
    }
  }

  for (const hn of level.heroNodes ?? []) {
    if (hn.boostsLiftId) {
      const lift = level.elevationPlatforms.find((l) => l.id === hn.boostsLiftId);
      if (lift) {
        links.push({
          id: `link_${hn.id}_${lift.id}`,
          fromKind: 'hero_node',
          fromId: hn.id,
          fromPos: [hn.x * TILE_SIZE, hn.elevation * ELEVATION_STEP + 0.5, hn.z * TILE_SIZE],
          toKind: 'elevation',
          toId: lift.id,
          toPos: [
            lift.x * TILE_SIZE,
            getElevationPlatformHeight(level, state, lift.id) * ELEVATION_STEP + 0.4,
            lift.z * TILE_SIZE,
          ],
          active: Boolean(state.heroNodesActive?.[hn.id]),
          label: `${hn.id} (${hn.heroId}) → ${lift.id}`,
        });
      }
    }
  }

  // Crystal -> Portal link
  links.push({
    id: `link_${level.crystal.id}_${level.portal.id}`,
    fromKind: 'crystal',
    fromId: level.crystal.id,
    fromPos: [
      level.crystal.x * TILE_SIZE,
      level.crystal.elevation * ELEVATION_STEP + 1.1,
      level.crystal.z * TILE_SIZE,
    ],
    toKind: 'portal',
    toId: level.portal.id,
    toPos: [
      level.portal.x * TILE_SIZE,
      level.portal.elevation * ELEVATION_STEP + 1.1,
      level.portal.z * TILE_SIZE,
    ],
    active: state.portalAwakened,
    label: `${level.crystal.id} → ${level.portal.id}`,
  });

  return links;
}
