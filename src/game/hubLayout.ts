import { HubAreaId, LevelDef, TileDef, WorldId } from './types';

export interface HubAreaZoneDef {
  id: HubAreaId;
  name: string;
  subtitle: string;
  description: string;
  centerX: number;
  centerZ: number;
  radius: number;
  interactiveStation?: {
    kind: 'central_crystal' | 'hero_sanctum' | 'wardrobe' | 'echo_archive' | 'reward_gallery' | 'quest_board' | 'world_map' | 'secret_shrine';
    x: number;
    z: number;
    elevation: number;
    prompt: string;
  };
}

export interface HubWorldPortalDef {
  worldId: WorldId;
  order: number;
  x: number;
  z: number;
  elevation: number;
  prompt: string;
}

export const HUB_SPAWN = { x: 0, z: 3, facingAngle: Math.PI };

export const HUB_WORLD_PORTALS: HubWorldPortalDef[] = [
  { worldId: 'world_1', order: 1, x: -4, z: -7, elevation: 1, prompt: 'Enter World I · The First Light' },
  { worldId: 'world_2', order: 2, x: -2, z: -8, elevation: 1, prompt: 'Enter World II · Verdant Reach' },
  { worldId: 'world_3', order: 3, x: 0, z: -8, elevation: 1, prompt: 'Enter World III · Tidal Expanse' },
  { worldId: 'world_4', order: 4, x: 2, z: -8, elevation: 1, prompt: 'Enter World IV · Emberfall Dominion' },
  { worldId: 'world_5', order: 5, x: 4, z: -7, elevation: 1, prompt: 'Enter World V · Celestial Frontier' },
  { worldId: 'world_6', order: 6, x: 0, z: -10, elevation: 2, prompt: 'Enter World VI · The Echo Trials' },
];

export const HUB_AREAS: HubAreaZoneDef[] = [
  {
    id: 'central_sanctuary',
    name: 'Central Sanctuary',
    subtitle: 'Heart of The Convergence',
    description: 'The resonant nexus anchored by the Giant Central Crystal and convergence rings.',
    centerX: 0,
    centerZ: 0,
    radius: 2.6,
    interactiveStation: {
      kind: 'central_crystal',
      x: 0,
      z: 0,
      elevation: 1,
      prompt: 'Commune with Central Crystal (World Map)',
    },
  },
  {
    id: 'world_portals',
    name: 'Sixfold Portal Arc',
    subtitle: 'Gateways to the Archipelagos',
    description: 'Six attuned sky-gates linking The Convergence to every floating world.',
    centerX: 0,
    centerZ: -7,
    radius: 4.5,
  },
  {
    id: 'hero_sanctum',
    name: 'Hero Sanctum',
    subtitle: 'Fellowship Hall',
    description: 'Switch between unlocked Wayfinder heroes and test their resonance abilities.',
    centerX: -6,
    centerZ: 0,
    radius: 2.3,
    interactiveStation: {
      kind: 'hero_sanctum',
      x: -6,
      z: 0,
      elevation: 1,
      prompt: 'Open Hero Sanctum (Switch Hero)',
    },
  },
  {
    id: 'wardrobe_station',
    name: 'Wardrobe Atelier',
    subtitle: 'Cloaks, Lanterns & Dyes',
    description: 'Equip unlocked star milestones, purchase relics with Shards, and customize heroes.',
    centerX: -5,
    centerZ: 5,
    radius: 2.3,
    interactiveStation: {
      kind: 'wardrobe',
      x: -5,
      z: 5,
      elevation: 0,
      prompt: 'Open Wardrobe Station',
    },
  },
  {
    id: 'echo_archive',
    name: 'Echo Archive',
    subtitle: 'Hall of Preserved Memories',
    description: 'Inspect gathered Echo Fragments and ancient sky-island chronicles.',
    centerX: -5,
    centerZ: -5,
    radius: 2.3,
    interactiveStation: {
      kind: 'echo_archive',
      x: -5,
      z: -5,
      elevation: 1,
      prompt: 'Open Echo Archive & Codex',
    },
  },
  {
    id: 'reward_gallery',
    name: 'Reward Gallery',
    subtitle: 'Trophies & Star Milestones',
    description: 'A sunlit overlook honoring world restorations, trophies, and star milestones.',
    centerX: 5,
    centerZ: -5,
    radius: 2.3,
    interactiveStation: {
      kind: 'reward_gallery',
      x: 5,
      z: -5,
      elevation: 1,
      prompt: 'Inspect Reward Gallery & Trophies',
    },
  },
  {
    id: 'quest_board',
    name: 'Cartographer Quest Board',
    subtitle: 'Chronicles & Commissions',
    description: 'Review all Main Story, World Restoration, Hero Story, and Side Quests.',
    centerX: 5,
    centerZ: 4,
    radius: 2.2,
    interactiveStation: {
      kind: 'quest_board',
      x: 5,
      z: 4,
      elevation: 0,
      prompt: 'Open Quest Journal & Commissions',
    },
  },
  {
    id: 'npc_district',
    name: 'Sanctuary Courtyard',
    subtitle: 'Pilgrim & Keeper Commons',
    description: 'Lantern-lit gardens where the keepers and travelers of the archipelago rest.',
    centerX: 0,
    centerZ: 5,
    radius: 3.0,
    interactiveStation: {
      kind: 'world_map',
      x: 3,
      z: 4,
      elevation: 0,
      prompt: 'Survey Interactive World Map',
    },
  },
  {
    id: 'hidden_alcove',
    name: 'Forgotten Eastern Alcove',
    subtitle: 'Quiet Whisper Stone',
    description: 'A moss-draped stone overlook past the eastern stepping bridge.',
    centerX: 9,
    centerZ: -1,
    radius: 1.6,
    interactiveStation: {
      kind: 'secret_shrine',
      x: 9,
      z: -1,
      elevation: 0,
      prompt: 'Inspect Whispering Pedestal',
    },
  },
];

function buildHubTiles(): TileDef[] {
  const map = new Map<string, TileDef>();
  const setTile = (tile: TileDef) => {
    map.set(`${tile.x},${tile.z}`, tile);
  };

  // 1. Main Lower Courtyard Plaza (elev 0): -3..+3 x 3..6, plus West & East wings
  for (let x = -3; x <= 3; x++) {
    for (let z = 3; z <= 6; z++) {
      setTile({
        x,
        z,
        elevation: 0,
        terrain: Math.abs(x) <= 1 ? 'stone' : 'grass',
      });
    }
  }
  // Courtyard decorative water basins & trees on corners
  setTile({ x: -3, z: 6, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile({ x: 3, z: 6, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile({ x: 0, z: 6, elevation: 0, terrain: 'grass', decor: 'pond_lily', blocksMovement: true });

  // 2. Wardrobe Station Wing (SW: -7..-4 x 3..6, elev 0)
  for (let x = -7; x <= -4; x++) {
    for (let z = 3; z <= 6; z++) {
      setTile({
        x,
        z,
        elevation: 0,
        terrain: x >= -6 && z >= 4 && z <= 5 ? 'wood' : 'grass',
      });
    }
  }
  setTile({ x: -7, z: 6, elevation: 0, terrain: 'grass', decor: 'tree_pine', blocksMovement: true });
  setTile({ x: -7, z: 3, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  // 3. Quest Board Promenade (SE: 4..6 x 2..6, elev 0)
  for (let x = 4; x <= 6; x++) {
    for (let z = 2; z <= 6; z++) {
      setTile({
        x,
        z,
        elevation: 0,
        terrain: x <= 5 && z >= 3 && z <= 5 ? 'stone' : 'grass',
      });
    }
  }
  setTile({ x: 6, z: 6, elevation: 0, terrain: 'grass', decor: 'tree_broad', blocksMovement: true });
  setTile({ x: 6, z: 2, elevation: 0, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  // 4. Central Sanctuary Stairways & Inner Ring (elev 1)
  // Stairs up from S courtyard & promenades
  setTile({ x: 0, z: 2, elevation: 0, terrain: 'stone', isStair: true });
  setTile({ x: -4, z: 2, elevation: 0, terrain: 'stone' });
  setTile({ x: 4, z: 1, elevation: 0, terrain: 'stone' });
  setTile({ x: 5, z: 1, elevation: 0, terrain: 'stone' });
  setTile({ x: 6, z: 1, elevation: 0, terrain: 'grass' });

  // Central Platform (-2..2 x -2..1 at elev 1)
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 1; z++) {
      setTile({
        x,
        z,
        elevation: 1,
        terrain: Math.abs(x) <= 1 && Math.abs(z) <= 1 ? 'ruin' : 'stone',
      });
    }
  }
  // North stairs/path from Central Sanctuary to Portal Promenade
  setTile({ x: 0, z: -3, elevation: 1, terrain: 'stone' });
  setTile({ x: -1, z: -3, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile({ x: 1, z: -3, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  // 5. Hero Sanctum West Terrace (-8..-3 x -2..2 at elev 1, bridge at x=-3)
  setTile({ x: -3, z: 0, elevation: 1, terrain: 'wood' });
  setTile({ x: -4, z: 0, elevation: 1, terrain: 'wood' });
  for (let x = -8; x <= -5; x++) {
    for (let z = -2; z <= 2; z++) {
      setTile({
        x,
        z,
        elevation: 1,
        terrain: x >= -7 && Math.abs(z) <= 1 ? 'ruin' : 'moss',
      });
    }
  }
  setTile({ x: -8, z: 2, elevation: 1, terrain: 'moss', decor: 'ruin_pillar', blocksMovement: true });
  setTile({ x: -8, z: -2, elevation: 1, terrain: 'moss', decor: 'ancient_root_tree', blocksMovement: true });

  // 6. Echo Archive NW Cloister (-7..-3 x -6..-3, elev 1)
  for (let x = -7; x <= -3; x++) {
    for (let z = -6; z <= -3; z++) {
      setTile({
        x,
        z,
        elevation: 1,
        terrain: x >= -6 && x <= -4 && z >= -5 && z <= -4 ? 'ruin' : 'stone',
      });
    }
  }
  setTile({ x: -3, z: -2, elevation: 1, terrain: 'stone' }); // link down from NW to Hero bridge
  setTile({ x: -7, z: -3, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });
  setTile({ x: -7, z: -6, elevation: 1, terrain: 'moss', decor: 'ruin_arch', blocksMovement: true });

  // 7. Reward Gallery NE Overlook (3..7 x -6..-3, elev 1)
  for (let x = 3; x <= 7; x++) {
    for (let z = -6; z <= -3; z++) {
      setTile({
        x,
        z,
        elevation: 1,
        terrain: x >= 4 && x <= 6 && z >= -5 && z <= -4 ? 'ruin' : 'stone',
      });
    }
  }
  setTile({ x: 3, z: -1, elevation: 1, terrain: 'stone' });
  setTile({ x: 3, z: -2, elevation: 1, terrain: 'stone' });
  setTile({ x: 7, z: -6, elevation: 1, terrain: 'grass', decor: 'celestial_orrery', blocksMovement: true });
  setTile({ x: 7, z: -3, elevation: 1, terrain: 'grass', decor: 'stone_lantern', blocksMovement: true });

  // East Bridge linking Forgekeeper Brann area (x=4..6, z=0) & Secret Eastern Alcove!
  setTile({ x: 3, z: 0, elevation: 1, terrain: 'stone' });
  setTile({ x: 4, z: 0, elevation: 0, terrain: 'stone', isStair: true });
  setTile({ x: 5, z: 0, elevation: 0, terrain: 'basalt' });
  setTile({ x: 6, z: 0, elevation: 0, terrain: 'basalt' });
  // Stepping-stone causeway to Hidden Alcove (9, -1)
  setTile({ x: 7, z: 0, elevation: 0, terrain: 'wood' });
  setTile({ x: 8, z: 0, elevation: 0, terrain: 'wood' });
  setTile({ x: 9, z: 0, elevation: 0, terrain: 'moss' });
  setTile({ x: 9, z: -1, elevation: 0, terrain: 'ruin' });
  setTile({ x: 10, z: -1, elevation: 0, terrain: 'moss', decor: 'stone_lantern', blocksMovement: true });

  // 8. World Portal Arc (North Promenade: -5..5 x -8..-4 at elev 1, plus Trial Pier (0, -9..-10) at elev 2)
  for (let x = -5; x <= 5; x++) {
    for (let z = -8; z <= -4; z++) {
      if (map.has(`${x},${z}`)) continue;
      setTile({
        x,
        z,
        elevation: 1,
        terrain: Math.abs(x) <= 2 && z <= -6 ? 'ruin' : 'stone',
      });
    }
  }
  // Decorative tidal pond / gardens inside North Promenade
  setTile({ x: -2, z: -5, elevation: 1, terrain: 'water', blocksMovement: true });
  setTile({ x: 2, z: -5, elevation: 1, terrain: 'water', blocksMovement: true });
  setTile({ x: -4, z: -8, elevation: 1, terrain: 'ruin' }); // W1 Portal
  setTile({ x: -2, z: -8, elevation: 1, terrain: 'ruin' }); // W2 Portal
  setTile({ x: 0, z: -8, elevation: 1, terrain: 'ruin' });  // W3 Portal
  setTile({ x: 2, z: -8, elevation: 1, terrain: 'ruin' });  // W4 Portal
  setTile({ x: 4, z: -8, elevation: 1, terrain: 'ruin' });  // W5 Portal
  // Ensure W1 & W5 portal tiles at (-4,-7) and (4,-7) match walkable ruin stone
  setTile({ x: -4, z: -7, elevation: 1, terrain: 'ruin' });
  setTile({ x: 4, z: -7, elevation: 1, terrain: 'ruin' });
  // Stairway & Ascended Pier to World 6 Echo Trials Portal
  setTile({ x: 0, z: -9, elevation: 1, terrain: 'stone', isStair: true });
  setTile({ x: 0, z: -10, elevation: 2, terrain: 'cloud' });
  setTile({ x: -1, z: -10, elevation: 2, terrain: 'cloud' });
  setTile({ x: 1, z: -10, elevation: 2, terrain: 'cloud' });

  return Array.from(map.values());
}

export const CONVERGENCE_HUB_TILES: TileDef[] = buildHubTiles();

export const CONVERGENCE_HUB_LEVEL: LevelDef = {
  id: 0,
  slug: 'the-convergence-hub',
  title: 'The Convergence',
  subtitle: 'Living Archipelago Sanctuary',
  objectiveDefault: 'Explore the Sanctuary, speak with the Keepers, or step through a World Portal.',
  objectiveCrystalDone: 'All realms of LUMA resonate in harmony across The Convergence.',
  spawn: HUB_SPAWN,
  cameraCenter: { x: 0, z: -1 },
  cameraZoom: 0.92,
  tiles: CONVERGENCE_HUB_TILES,
  rotatingPlatforms: [],
  pressureSwitches: [],
  gates: [],
  elevationPlatforms: [],
  lightEmitters: [],
  lightPrisms: [],
  crystal: {
    id: 'hub_central_crystal',
    x: 0,
    z: 0,
    elevation: 1,
    requiresLightBeam: false,
    label: 'Central Sanctuary Crystal',
  },
  portal: {
    id: 'hub_map_gate',
    x: 0,
    z: -8,
    elevation: 1,
    facing: 3,
  },
};

export function detectHubAreaAtPosition(x: number, z: number): HubAreaZoneDef | null {
  const gx = x / 2;
  const gz = z / 2;
  let closest: HubAreaZoneDef | null = null;
  let bestDist = Infinity;
  for (const area of HUB_AREAS) {
    const d = Math.hypot(gx - area.centerX, gz - area.centerZ);
    if (d <= area.radius && d < bestDist) {
      bestDist = d;
      closest = area;
    }
  }
  return closest;
}
