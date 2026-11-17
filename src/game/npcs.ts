import { getCharacterById } from './characters';
import { getHubRestorationTier } from './restoration';
import { CharacterId, NpcId, SaveProgress } from './types';

export interface NpcDialogueChoice {
  id: string;
  label: string;
  nextNodeId: string | 'close';
  setFlag?: string;
  action?: 'open_atlas' | 'open_wardrobe' | 'open_heroes' | 'open_rewards' | 'open_journal' | 'open_world_map';
}

export interface NpcDialogueNode {
  id: string;
  speakerTitle: string;
  pages: string[];
  choices: NpcDialogueChoice[];
}

export interface NpcDefinition {
  id: NpcId;
  name: string;
  role: string;
  bio: string;
  hubX: number;
  hubZ: number;
  elevation: number;
  facingAngle: number;
  visual: {
    robeColor: number;
    trimColor: number;
    skinColor: number;
    hatStyle: 'hood' | 'scholar_cap' | 'brim' | 'leaf_crown' | 'sailor_band' | 'forge_goggles' | 'astro_hat' | 'none';
    accessory: 'scroll' | 'pack' | 'map_tube' | 'seed_staff' | 'tide_orb' | 'hammer' | 'spyglass' | 'echo_prism' | 'shard_bag' | 'lute';
    scale: number;
  };
  buildNodes: (progress: SaveProgress) => Record<string, NpcDialogueNode>;
}

function getActiveHeroId(progress: SaveProgress): CharacterId {
  return progress.selectedCharacterId ?? 'wayfinder';
}

export const NPCS: NpcDefinition[] = [
  {
    id: 'orin',
    name: 'Orin',
    role: 'Archive Keeper',
    bio: 'Steward of The Convergence who tends the ancient sky ledgers inside the Echo Archive.',
    hubX: -4,
    hubZ: -4,
    elevation: 1,
    facingAngle: Math.PI * 0.25,
    visual: {
      robeColor: 0x264d59,
      trimColor: 0xe8b652,
      skinColor: 0xeec4a0,
      hatStyle: 'scholar_cap',
      accessory: 'scroll',
      scale: 1.0,
    },
    buildNodes: (progress) => {
      const heroId = getActiveHeroId(progress);
      const tier = getHubRestorationTier(progress);
      const restoredCount = (progress.restoredWorlds ?? []).length;
      const isWayfinder = heroId === 'wayfinder';

      return {
        root: {
          id: 'root',
          speakerTitle: 'Orin · Archive Keeper',
          pages: [
            isWayfinder
              ? 'Ah—the golden cowl of the First Wayfinder returns! Your lantern still burns with the exact ember that once anchored these islands.'
              : `Welcome back to the Archive, ${getCharacterById(heroId).name}. The Convergence remembers every step you take across the clouds.`,
            tier === 'restored'
              ? `Look up at the Central Crystal—with ${restoredCount} world beacons shining, The Convergence sings as it did in ancient days.`
              : tier === 'awakening'
              ? 'Since you awakened the first islands, warm light bridges have begun re-forming around the Sanctuary.'
              : 'Most of the Sanctuary still slumbers. Light the island beacons beyond the northern portals and the Hub will awaken with you.',
          ],
          choices: [
            {
              id: 'orin_hero',
              label: isWayfinder
                ? 'Ask about the Wayfinder’s Lost Signal'
                : 'Ask about the Wayfinder Archives',
              nextNodeId: 'hero_lore',
            },
            {
              id: 'orin_hub',
              label: 'How does The Convergence restore?',
              nextNodeId: 'hub_explain',
            },
            {
              id: 'orin_journal',
              label: 'Review Chronicles (Open Journal)',
              nextNodeId: 'close',
              action: 'open_journal',
            },
            { id: 'orin_bye', label: 'Farewell for now', nextNodeId: 'close' },
          ],
        },
        hero_lore: {
          id: 'hero_lore',
          speakerTitle: 'Orin · Archive Keeper',
          pages: [
            isWayfinder
              ? 'Your Lantern Focus [Q] wasn’t forged for spectacle—it was tuned to wake dormant runes buried in stone. Try channeling it near hidden shrines.'
              : 'Each member of the Fellowship carries a distinct gift on [Q]: Wayfinder wakes hidden runes, Sylvi grows living bridges, Neris calms tides, Kael sparks braziers, and Zeph rides updrafts.',
          ],
          choices: [{ id: 'back', label: 'Back', nextNodeId: 'root' }],
        },
        hub_explain: {
          id: 'hub_explain',
          speakerTitle: 'Orin · Archive Keeper',
          pages: [
            'Every world you restore—all ten islands of a realm—rekindles its portal on the northern arc and deepens the Central Crystal’s light.',
            'Your progress, active checkpoints, and session history are stored quietly right inside your browser—no accounts, no servers watching.',
          ],
          choices: [{ id: 'back', label: 'Back', nextNodeId: 'root' }],
        },
      };
    },
  },
  {
    id: 'mera',
    name: 'Mera',
    role: 'Sanctuary Quartermaster',
    bio: 'Keeps cloaks, lanterns, and field packs organized at the Wardrobe Atelier.',
    hubX: -4,
    hubZ: 4,
    elevation: 0,
    facingAngle: Math.PI * 0.75,
    visual: {
      robeColor: 0x9c5533,
      trimColor: 0xf4e3be,
      skinColor: 0xe6b892,
      hatStyle: 'brim',
      accessory: 'pack',
      scale: 0.98,
    },
    buildNodes: (progress) => ({
      root: {
        id: 'root',
        speakerTitle: 'Mera · Quartermaster',
        pages: [
          `Need a sturdier cloak or a brighter lantern, ${getCharacterById(getActiveHeroId(progress)).name}? You currently hold ${progress.lumaShards ?? 0} Luma Shards.`,
          'Everything in the Wardrobe Atelier works for every hero you unlock—and each hero remembers their own signature loadout.',
        ],
        choices: [
          {
            id: 'mera_wardrobe',
            label: 'Open Wardrobe Atelier',
            nextNodeId: 'close',
            action: 'open_wardrobe',
          },
          {
            id: 'mera_tip',
            label: 'Any advice on earning Shards & Stars?',
            nextNodeId: 'tips',
          },
          { id: 'mera_bye', label: 'See you later', nextNodeId: 'close' },
        ],
      },
      tips: {
        id: 'tips',
        speakerTitle: 'Mera · Quartermaster',
        pages: [
          'Every island grants up to 3 Mastery Stars: 1 for completion, 1 for efficiency (low actions), and 1 for swift clearing. Check your session history in the Atlas anytime!',
        ],
        choices: [{ id: 'back', label: 'Thanks, Mera', nextNodeId: 'root' }],
      },
    }),
  },
  {
    id: 'tavi',
    name: 'Tavi',
    role: 'Sky Cartographer',
    bio: 'Charts wind currents, world portals, and commission notices beside the Quest Board.',
    hubX: 4,
    hubZ: 3,
    elevation: 0,
    facingAngle: -Math.PI * 0.35,
    visual: {
      robeColor: 0x3b6e8c,
      trimColor: 0xf2cb77,
      skinColor: 0xf0c7a4,
      hatStyle: 'brim',
      accessory: 'map_tube',
      scale: 0.96,
    },
    buildNodes: (progress) => ({
      root: {
        id: 'root',
        speakerTitle: 'Tavi · Cartographer',
        pages: [
          `Sixty islands spread across six realms—you have restored ${progress.completedLevels.length} so far!`,
          'My Interactive World Map shows restored biomes, locked passages, Echoes, and active quest waypoints at a glance.',
        ],
        choices: [
          {
            id: 'tavi_map',
            label: 'Survey Interactive World Map',
            nextNodeId: 'close',
            action: 'open_world_map',
          },
          {
            id: 'tavi_atlas',
            label: 'Open Stage Atlas & Session History',
            nextNodeId: 'close',
            action: 'open_atlas',
          },
          { id: 'tavi_secret', label: 'Any hidden landmarks nearby?', nextNodeId: 'secret' },
          { id: 'tavi_bye', label: 'Fair winds, Tavi', nextNodeId: 'close' },
        ],
      },
      secret: {
        id: 'secret',
        speakerTitle: 'Tavi · Cartographer',
        pages: [
          'Between you and me, look past Brann’s eastern anvil overlook. There is an old wooden footbridge leading to a quiet moss pedestal that never made it onto my formal survey!',
        ],
        choices: [{ id: 'back', label: 'I will look for it', nextNodeId: 'root' }],
      },
    }),
  },
  {
    id: 'elda',
    name: 'Elda',
    role: 'Grovekeeper',
    bio: 'Tends ancient rootways beside the Verdant Reach portal.',
    hubX: -3,
    hubZ: -6,
    elevation: 1,
    facingAngle: 0.15,
    visual: {
      robeColor: 0x3d7d47,
      trimColor: 0xc2eb98,
      skinColor: 0xe3b893,
      hatStyle: 'leaf_crown',
      accessory: 'seed_staff',
      scale: 1.0,
    },
    buildNodes: (progress) => {
      const heroId = getActiveHeroId(progress);
      const isSylvi = heroId === 'sylvi';
      const w2Done = (progress.restoredWorlds ?? []).includes('world_2');

      return {
        root: {
          id: 'root',
          speakerTitle: 'Elda · Grovekeeper',
          pages: [
            isSylvi
              ? 'Sylvi! Even the roots beneath the stone tiles tremble with joy when you walk past. Verdant Reach remembers your song.'
              : 'Soft footsteps, traveler. Even high above the clouds, living roots seek sunlight and water.',
            w2Done
              ? 'With Verdant Reach restored, its canopy blossoms spill clear over our portal stones!'
              : 'When World II is restored, its ancient boughs will green again—both out there and right here in the Sanctuary.',
          ],
          choices: [
            {
              id: 'elda_sylvi',
              label: isSylvi ? 'Ask about the Roots of Memory' : 'Ask about Verdant Reach',
              nextNodeId: 'roots',
            },
            { id: 'elda_bye', label: 'May the canopy shelter you', nextNodeId: 'close' },
          ],
        },
        roots: {
          id: 'roots',
          speakerTitle: 'Elda · Grovekeeper',
          pages: [
            isSylvi
              ? 'Channel Rootcall [Q] beside slumbering vine anchors across Stage 11 to Stage 20—and never pass Stage 15 without stopping to feel the old heartwood.'
              : 'Complete Stage 10 in First Light and Sylvi will join your Fellowship, opening living vine bridges across wide chasms.',
          ],
          choices: [{ id: 'back', label: 'Back', nextNodeId: 'root' }],
        },
      };
    },
  },
  {
    id: 'rill',
    name: 'Rill',
    role: 'Tidekeeper',
    bio: 'Listens to the aqueduct channels near the Tidal Expanse gateway.',
    hubX: 1,
    hubZ: -6,
    elevation: 1,
    facingAngle: -0.2,
    visual: {
      robeColor: 0x1e849c,
      trimColor: 0xaef7f2,
      skinColor: 0xebd1ba,
      hatStyle: 'sailor_band',
      accessory: 'tide_orb',
      scale: 0.98,
    },
    buildNodes: (progress) => {
      const heroId = getActiveHeroId(progress);
      const isNeris = heroId === 'neris';
      const w3Done = (progress.restoredWorlds ?? []).includes('world_3');

      return {
        root: {
          id: 'root',
          speakerTitle: 'Rill · Tidekeeper',
          pages: [
            isNeris
              ? 'Neris, sister of the current! Can you hear how clear the Sanctuary basins run today?'
              : 'Listen closely—water remembers every channel carved by ancient aqueduct builders.',
            w3Done
              ? 'Tidal Expanse flows freely once more! Turquoise mist cools the entire northern promenade.'
              : 'Beyond the third portal, sunken sluices await someone patient enough to align both water and light.',
          ],
          choices: [
            {
              id: 'rill_tide',
              label: isNeris ? 'Ask about The Drowned Promise' : 'Ask about Tidal Expanse',
              nextNodeId: 'tide_story',
            },
            { id: 'rill_bye', label: 'Calm waters to you', nextNodeId: 'close' },
          ],
        },
        tide_story: {
          id: 'tide_story',
          speakerTitle: 'Rill · Tidekeeper',
          pages: [
            isNeris
              ? 'Walk Stage 25 with Tidal Pulse [Q] ready. When its aqueduct gates chime together, our old promise will finally rest at peace.'
              : 'Once Stage 20 is cleared, Neris answers the call and can calm tide-channel locks throughout World III.',
          ],
          choices: [{ id: 'back', label: 'Back', nextNodeId: 'root' }],
        },
      };
    },
  },
  {
    id: 'brann',
    name: 'Brann',
    role: 'Forgekeeper',
    bio: 'Tends the eastern basalt overlook and keeps counterweight mechanisms calibrated.',
    hubX: 5,
    hubZ: 1,
    elevation: 0,
    facingAngle: -Math.PI * 0.5,
    visual: {
      robeColor: 0x7d3d29,
      trimColor: 0xd99f3b,
      skinColor: 0xdfb292,
      hatStyle: 'forge_goggles',
      accessory: 'hammer',
      scale: 1.08,
    },
    buildNodes: (progress) => {
      const heroId = getActiveHeroId(progress);
      const isKael = heroId === 'kael';
      const w4Done = (progress.restoredWorlds ?? []).includes('world_4');

      return {
        root: {
          id: 'root',
          speakerTitle: 'Brann · Forgekeeper',
          pages: [
            isKael
              ? 'Ha! Kael—seeing your crucible gauntlets back on these flagstones warms an old smith’s heart.'
              : 'Steady as hammered bronze, traveler. Good stonework and honest hinges keep floating islands from drifting apart.',
            w4Done
              ? 'Emberfall’s great furnaces are roaring clean again! Even the bronze gears here spin twice as smooth.'
              : 'In Emberfall Dominion, lifts and molten conduits rely on timing. Watch your step near the basalt sluices.',
          ],
          choices: [
            {
              id: 'brann_forge',
              label: isKael ? 'Ask about The Silent Forge' : 'Ask about Kael & Emberfall',
              nextNodeId: 'forge_lore',
            },
            { id: 'brann_bye', label: 'Strike true, Brann', nextNodeId: 'close' },
          ],
        },
        forge_lore: {
          id: 'forge_lore',
          speakerTitle: 'Brann · Forgekeeper',
          pages: [
            isKael
              ? 'Carry Ember Spark [Q] through Stage 35 and wake every sleeping brazier along the way. No forge stays silent forever.'
              : 'Clear Stage 30 to recruit Kael. Also—if you cross the wooden planks just east of my anvil, mind your footing!',
          ],
          choices: [{ id: 'back', label: 'Back', nextNodeId: 'root' }],
        },
      };
    },
  },
  {
    id: 'aster',
    name: 'Aster',
    role: 'Stargazer',
    bio: 'Reads constellations from the Northeast Observatory & Reward Gallery.',
    hubX: 6,
    hubZ: -5,
    elevation: 1,
    facingAngle: -Math.PI * 0.65,
    visual: {
      robeColor: 0x2f437d,
      trimColor: 0xf7d67e,
      skinColor: 0xf0cbb1,
      hatStyle: 'astro_hat',
      accessory: 'spyglass',
      scale: 0.97,
    },
    buildNodes: (progress) => {
      const heroId = getActiveHeroId(progress);
      const isZeph = heroId === 'zeph';

      return {
        root: {
          id: 'root',
          speakerTitle: 'Aster · Stargazer',
          pages: [
            isZeph
              ? 'Zeph! Even from down here I could spot your sky-cloak gliding past the upper spires.'
              : 'The stars above Celestial Frontier aren’t distant fires—they’re beacons from older eras of LUMA.',
            'Every Trophy and Star Milestone you earn leaves a permanent constellation etched into our Reward Gallery.',
          ],
          choices: [
            {
              id: 'aster_rewards',
              label: 'Inspect Codex & Trophies',
              nextNodeId: 'close',
              action: 'open_rewards',
            },
            {
              id: 'aster_zeph',
              label: isZeph ? 'Ask about Beyond the Clouds' : 'Ask about the Frontier Stars',
              nextNodeId: 'stars',
            },
            { id: 'aster_bye', label: 'Clear skies, Aster', nextNodeId: 'close' },
          ],
        },
        stars: {
          id: 'stars',
          speakerTitle: 'Aster · Stargazer',
          pages: [
            isZeph
              ? 'When your Windstep [Q] chimes atop Stage 45, come back here so I can log the high-altitude star reading.'
              : 'Unlock Zeph at Stage 40 to awaken Wind Vanes across Celestial Frontier’s upper cloudways.',
          ],
          choices: [{ id: 'back', label: 'Back', nextNodeId: 'root' }],
        },
      };
    },
  },
  {
    id: 'sora',
    name: 'Sora',
    role: 'Echo Curator',
    bio: 'Preserves whispered memories inside glowing Echo Fragments in the NW Cloister.',
    hubX: -6,
    hubZ: -5,
    elevation: 1,
    facingAngle: Math.PI * 0.35,
    visual: {
      robeColor: 0x5c3e7a,
      trimColor: 0xeeb6ff,
      skinColor: 0xedd0ba,
      hatStyle: 'hood',
      accessory: 'echo_prism',
      scale: 0.95,
    },
    buildNodes: (progress) => {
      const echoesCount = (progress.collectedEchoFragments ?? []).length;
      return {
        root: {
          id: 'root',
          speakerTitle: 'Sora · Echo Curator',
          pages: [
            `Every island guards one violet Echo Fragment—you have preserved ${echoesCount} of 60 so far.`,
            echoesCount >= 30
              ? 'Half the sky’s lost verses now shimmer in my Archive! Keep searching the hidden side terraces.'
              : 'Look carefully off the main crystal path—side cliffs, bridges, and lowered lifts often shelter an Echo.',
          ],
          choices: [
            {
              id: 'sora_codex',
              label: 'Open Echo Codex',
              nextNodeId: 'close',
              action: 'open_rewards',
            },
            { id: 'sora_bye', label: 'I will keep listening', nextNodeId: 'close' },
          ],
        },
      };
    },
  },
  {
    id: 'pip',
    name: 'Pip',
    role: 'Shard Collector',
    bio: 'Young apprentice keeping tally of every glowing Luma Shard across the Courtyard.',
    hubX: 2,
    hubZ: 5,
    elevation: 0,
    facingAngle: Math.PI * 0.85,
    visual: {
      robeColor: 0xd18a32,
      trimColor: 0xfff0c2,
      skinColor: 0xf2c9a6,
      hatStyle: 'none',
      accessory: 'shard_bag',
      scale: 0.84,
    },
    buildNodes: (progress) => ({
      root: {
        id: 'root',
        speakerTitle: 'Pip · Shard Collector',
        pages: [
          `Whoa, ${progress.lumaShards ?? 0} Shards! Did you know completing quests, improving your star rating, and finding Echoes all add to your pouch?`,
          'And because everything stays saved locally in your browser, you can even back up your journey file in Settings!',
        ],
        choices: [
          {
            id: 'pip_heroes',
            label: 'Inspect Fellowship Heroes',
            nextNodeId: 'close',
            action: 'open_heroes',
          },
          { id: 'pip_bye', label: 'Keep counting, Pip!', nextNodeId: 'close' },
        ],
      },
    }),
  },
  {
    id: 'lyra',
    name: 'Lyra',
    role: 'Wandering Storyteller',
    bio: 'Collects songs and traveler tales beside the Courtyard lily pond.',
    hubX: -1,
    hubZ: 5,
    elevation: 0,
    facingAngle: Math.PI,
    visual: {
      robeColor: 0x3b7d75,
      trimColor: 0xf5d47a,
      skinColor: 0xeac0a1,
      hatStyle: 'leaf_crown',
      accessory: 'lute',
      scale: 0.96,
    },
    buildNodes: (progress) => {
      const talkedCount = (progress.npcTalkedIds ?? []).length;
      return {
        root: {
          id: 'root',
          speakerTitle: 'Lyra · Wandering Storyteller',
          pages: [
            'Good stories travel faster than wind—yet every keeper here holds a verse of their own.',
            `You have spoken with ${talkedCount} of the 10 Sanctuary residents. When all ten voices gather, the courtyard lanterns shine brightest.`,
          ],
          choices: [
            {
              id: 'lyra_journal',
              label: 'Open Quest & Lore Journal',
              nextNodeId: 'close',
              action: 'open_journal',
            },
            { id: 'lyra_bye', label: 'Play on, Lyra', nextNodeId: 'close' },
          ],
        },
      };
    },
  },
];

export const NPC_MAP = new Map<NpcId, NpcDefinition>(NPCS.map((n) => [n.id, n]));

export function getNpcById(id: NpcId): NpcDefinition {
  return NPC_MAP.get(id) ?? NPCS[0];
}
