import { QuestDef } from './types';

export const QUESTS: QuestDef[] = [
  // ================= MAIN STORY (6) =================
  {
    id: 'quest_main_1',
    title: 'Voices on the Wind',
    category: 'main_story',
    giverNpcId: 'orin',
    turnInNpcId: 'orin',
    summary:
      'Seek out Orin at the Echo Archive inside The Convergence and awaken the very first sky-island crystal.',
    completionNote:
      'Orin inscribes your name into the Living Ledger as the Sanctuary stirs awake.',
    steps: [
      {
        id: 'm1_talk_orin',
        description: 'Speak with Orin in the Echo Archive',
        kind: 'talk_npc',
        targetId: 'orin',
        waypointLabel: 'Speak with Orin (NW Cloister)',
        waypointHubArea: 'echo_archive',
      },
      {
        id: 'm1_clear_stage1',
        description: 'Complete Stage 01: The Awakening',
        kind: 'complete_stage',
        targetNumber: 1,
        waypointLabel: 'Complete Stage 01',
        waypointStageId: 1,
      },
    ],
    reward: {
      lumaShards: 12,
      titleUnlock: 'Pilgrim of First Light',
      loreEntry: 'Sanctuary Chronicle I: When the first beacon answered, the cloudways remembered their paths.',
    },
  },
  {
    id: 'quest_main_2',
    title: 'Crossing the Quiet Sky',
    category: 'main_story',
    giverNpcId: 'orin',
    turnInNpcId: 'tavi',
    prerequisiteQuestIds: ['quest_main_1'],
    summary:
      'Chart the outer dawn terraces through Stage 05 and confer with Tavi beside the Quest Board.',
    completionNote:
      'Tavi pins the eastern archipelago survey charts onto the living board.',
    steps: [
      {
        id: 'm2_clear_stage5',
        description: 'Complete Stage 05: Twin Gateways',
        kind: 'complete_stage',
        targetNumber: 5,
        waypointLabel: 'Complete Stage 05',
        waypointStageId: 5,
      },
      {
        id: 'm2_talk_tavi',
        description: 'Report back to Tavi the Cartographer',
        kind: 'talk_npc',
        targetId: 'tavi',
        waypointLabel: 'Speak with Tavi (Quest Board)',
        waypointHubArea: 'quest_board',
      },
    ],
    reward: {
      lumaShards: 18,
      loreEntry: 'Survey Note IV: Every island rotates around the Central Crystal like brass rings around a flame.',
    },
  },
  {
    id: 'quest_main_3',
    title: 'Kindred Companions',
    category: 'main_story',
    giverNpcId: 'orin',
    turnInNpcId: 'elda',
    prerequisiteQuestIds: ['quest_main_2'],
    summary:
      'Restore the crown of World I (Stage 10) to welcome Sylvi into the Fellowship and enter Verdant Reach.',
    completionNote:
      'Rootways unfurl between the islands as Sylvi joins your fellowship.',
    steps: [
      {
        id: 'm3_unlock_sylvi',
        description: 'Complete Stage 10 to unlock Sylvi, the Grovewarden',
        kind: 'unlock_hero',
        heroId: 'sylvi',
        waypointLabel: 'Complete Stage 10',
        waypointStageId: 10,
      },
      {
        id: 'm3_talk_elda',
        description: 'Greet Elda near the Verdant Reach portal',
        kind: 'talk_npc',
        targetId: 'elda',
        waypointLabel: 'Speak with Elda (North Arc)',
        waypointHubArea: 'world_portals',
      },
    ],
    reward: {
      lumaShards: 22,
      titleUnlock: 'Warden of Bridges',
      hubPlaqueId: 'plaque_fellowship_roots',
    },
  },
  {
    id: 'quest_main_4',
    title: 'Convergence of Waters and Fire',
    category: 'main_story',
    giverNpcId: 'tavi',
    turnInNpcId: 'brann',
    prerequisiteQuestIds: ['quest_main_3'],
    summary:
      'Unite the Tidal Expanse and Emberfall Dominion by liberating 30 floating islands across the sky.',
    completionNote:
      'Brann strikes the ceremonial forge bell as warm brass light floods the Hub.',
    steps: [
      {
        id: 'm4_stages_30',
        description: 'Complete at least 30 islands across the worlds',
        kind: 'complete_stages_count',
        targetNumber: 30,
        waypointLabel: 'Complete 30 Islands',
        waypointStageId: 30,
      },
      {
        id: 'm4_talk_brann',
        description: 'Speak with Brann at the Eastern Forge Overlook',
        kind: 'talk_npc',
        targetId: 'brann',
        waypointLabel: 'Speak with Brann (East Bridge)',
        waypointHubArea: 'central_sanctuary',
      },
    ],
    reward: {
      lumaShards: 30,
      titleUnlock: 'Tide & Forge Envoy',
      loreEntry: 'Crucible Accord: Water cools the bronze wheel while ember-fire lifts the stone spire.',
    },
  },
  {
    id: 'quest_main_5',
    title: 'Crown of the Stratosphere',
    category: 'main_story',
    giverNpcId: 'aster',
    turnInNpcId: 'aster',
    prerequisiteQuestIds: ['quest_main_4'],
    summary:
      'Ascend through Celestial Frontier (Stage 50) and unlock Zeph to bridge the highest wind temples.',
    completionNote:
      'Aster aligns the great brass orrery toward the prismatic Echo Trials.',
    steps: [
      {
        id: 'm5_unlock_zeph',
        description: 'Complete Stage 40 to awaken Zeph, the Skyweaver',
        kind: 'unlock_hero',
        heroId: 'zeph',
        waypointLabel: 'Unlock Zeph (Stage 40)',
        waypointStageId: 40,
      },
      {
        id: 'm5_clear_50',
        description: 'Complete Stage 50: Astral Crown',
        kind: 'complete_stage',
        targetNumber: 50,
        waypointLabel: 'Complete Stage 50',
        waypointStageId: 50,
      },
    ],
    reward: {
      lumaShards: 35,
      titleUnlock: 'Star-Chart Navigator',
      hubPlaqueId: 'plaque_celestial_crown',
    },
  },
  {
    id: 'quest_main_6',
    title: 'The Living Archipelago',
    category: 'main_story',
    giverNpcId: 'orin',
    turnInNpcId: 'orin',
    prerequisiteQuestIds: ['quest_main_5'],
    summary:
      'Conquer the Echo Trials (Stage 60) and return to Orin to witness The Convergence fully restored.',
    completionNote:
      'Every world resonates in golden harmony around the living Central Crystal.',
    steps: [
      {
        id: 'm6_clear_60',
        description: 'Complete Stage 60: The Final Harmony',
        kind: 'complete_stage',
        targetNumber: 60,
        waypointLabel: 'Complete Stage 60',
        waypointStageId: 60,
      },
      {
        id: 'm6_talk_orin',
        description: 'Converse with Orin beneath the restored Sanctuary Spire',
        kind: 'talk_npc',
        targetId: 'orin',
        waypointLabel: 'Return to Orin',
        waypointHubArea: 'echo_archive',
      },
    ],
    reward: {
      lumaShards: 60,
      titleUnlock: 'Keeper of the Living Archipelago',
      loreEntry: 'Final Testament: Nothing in the sky was ever truly lost—only waiting for a lantern bearer.',
      hubPlaqueId: 'plaque_living_archipelago',
    },
  },

  // ================= WORLD RESTORATION QUESTS (6) =================
  {
    id: 'quest_restore_w1',
    title: 'Dawnlight Restored',
    category: 'world_restoration',
    giverNpcId: 'orin',
    turnInNpcId: 'orin',
    worldId: 'world_1',
    summary:
      'Reignite every observatory prism across World I: The First Light to awaken the dawn biome.',
    completionNote:
      'Morning light clears the haze over World I and illuminates its portal in emerald gold.',
    steps: [
      {
        id: 'rw1_complete',
        description: 'Complete all 10 stages of World I: The First Light',
        kind: 'complete_world',
        worldId: 'world_1',
        waypointLabel: 'Clear World I (Stages 1–10)',
        waypointStageId: 10,
      },
    ],
    reward: {
      lumaShards: 25,
      titleUnlock: 'Restorer of First Light',
      hubPlaqueId: 'plaque_world_1',
    },
  },
  {
    id: 'quest_restore_w2',
    title: 'Canopy in Bloom',
    category: 'world_restoration',
    giverNpcId: 'elda',
    turnInNpcId: 'elda',
    worldId: 'world_2',
    summary:
      'Heal the ancient root bridges across World II: Verdant Reach so canopy flowers bloom anew.',
    completionNote:
      'Emerald mist and living blossom vines flourish around the World II portal.',
    steps: [
      {
        id: 'rw2_complete',
        description: 'Complete all 10 stages of World II: Verdant Reach',
        kind: 'complete_world',
        worldId: 'world_2',
        waypointLabel: 'Clear World II (Stages 11–20)',
        waypointStageId: 20,
      },
    ],
    reward: {
      lumaShards: 30,
      titleUnlock: 'Restorer of Verdant Reach',
      hubPlaqueId: 'plaque_world_2',
    },
  },
  {
    id: 'quest_restore_w3',
    title: 'Tides Unbound',
    category: 'world_restoration',
    giverNpcId: 'rill',
    turnInNpcId: 'rill',
    worldId: 'world_3',
    summary:
      'Unblock every aqueduct and coral sluice in World III: Tidal Expanse.',
    completionNote:
      'Pure azure waterfalls shimmer across Tidal Expanse and its Convergence basin.',
    steps: [
      {
        id: 'rw3_complete',
        description: 'Complete all 10 stages of World III: Tidal Expanse',
        kind: 'complete_world',
        worldId: 'world_3',
        waypointLabel: 'Clear World III (Stages 21–30)',
        waypointStageId: 30,
      },
    ],
    reward: {
      lumaShards: 35,
      titleUnlock: 'Restorer of Tidal Expanse',
      hubPlaqueId: 'plaque_world_3',
    },
  },
  {
    id: 'quest_restore_w4',
    title: 'Heart of the Forge',
    category: 'world_restoration',
    giverNpcId: 'brann',
    turnInNpcId: 'brann',
    worldId: 'world_4',
    summary:
      'Rekindle the molten conduits and bronze counterweights across World IV: Emberfall Dominion.',
    completionNote:
      'Warm furnace gears hum steadily across Emberfall and its crimson portal.',
    steps: [
      {
        id: 'rw4_complete',
        description: 'Complete all 10 stages of World IV: Emberfall Dominion',
        kind: 'complete_world',
        worldId: 'world_4',
        waypointLabel: 'Clear World IV (Stages 31–40)',
        waypointStageId: 40,
      },
    ],
    reward: {
      lumaShards: 40,
      titleUnlock: 'Restorer of Emberfall',
      hubPlaqueId: 'plaque_world_4',
    },
  },
  {
    id: 'quest_restore_w5',
    title: 'Starways Aligned',
    category: 'world_restoration',
    giverNpcId: 'aster',
    turnInNpcId: 'aster',
    worldId: 'world_5',
    summary:
      'Tune all celestial resonators and wind temples across World V: Celestial Frontier.',
    completionNote:
      'Astral starlight dances softly above the Celestial Frontier spires.',
    steps: [
      {
        id: 'rw5_complete',
        description: 'Complete all 10 stages of World V: Celestial Frontier',
        kind: 'complete_world',
        worldId: 'world_5',
        waypointLabel: 'Clear World V (Stages 41–50)',
        waypointStageId: 50,
      },
    ],
    reward: {
      lumaShards: 45,
      titleUnlock: 'Restorer of the Frontier',
      hubPlaqueId: 'plaque_world_5',
    },
  },
  {
    id: 'quest_restore_w6',
    title: 'Prismatic Accord',
    category: 'world_restoration',
    giverNpcId: 'sora',
    turnInNpcId: 'sora',
    worldId: 'world_6',
    summary:
      'Master all ten trials in World VI: The Echo Trials to complete the six-world restoration.',
    completionNote:
      'The Prismatic Crucible crowns The Convergence with a living rainbow halo.',
    steps: [
      {
        id: 'rw6_complete',
        description: 'Complete all 10 stages of World VI: The Echo Trials',
        kind: 'complete_world',
        worldId: 'world_6',
        waypointLabel: 'Clear World VI (Stages 51–60)',
        waypointStageId: 60,
      },
    ],
    reward: {
      lumaShards: 75,
      titleUnlock: 'Master of the Six Worlds',
      hubPlaqueId: 'plaque_world_6',
    },
  },

  // ================= HERO PERSONAL STORIES (5) =================
  {
    id: 'quest_hero_wayfinder',
    title: 'Wayfinder: The Lost Signal',
    category: 'hero_story',
    heroId: 'wayfinder',
    giverNpcId: 'orin',
    turnInNpcId: 'orin',
    summary:
      'Orin remembers the first beacon carried by the Wayfinder. Channel Lantern Focus [Q] and uncover ancient Dawn echoes.',
    completionNote:
      'The Wayfinder’s amber lantern answers the Archive’s forgotten signal.',
    steps: [
      {
        id: 'hw_ability',
        description: 'Channel a hero ability [Q] during an island run',
        kind: 'use_ability',
        targetNumber: 1,
        waypointLabel: 'Press [Q] in any island',
      },
      {
        id: 'hw_node',
        description: 'Resonate a Hidden Rune or Hero Node in the islands',
        kind: 'activate_hero_node',
        targetNumber: 1,
        waypointLabel: 'Resonate a Hero Node',
      },
      {
        id: 'hw_talk',
        description: 'Speak with Orin about the Dawn Signal',
        kind: 'talk_npc',
        targetId: 'orin',
        waypointLabel: 'Talk to Orin (Archive)',
        waypointHubArea: 'echo_archive',
      },
    ],
    reward: {
      lumaShards: 20,
      titleUnlock: 'Bearer of the First Flame',
      loreEntry: 'Wayfinder Memoir: Before maps existed, lanterns were promises hung between clouds.',
    },
  },
  {
    id: 'quest_hero_sylvi',
    title: 'Sylvi: Roots of Memory',
    category: 'hero_story',
    heroId: 'sylvi',
    giverNpcId: 'elda',
    turnInNpcId: 'elda',
    requiredUnlockedHeroId: 'sylvi',
    summary:
      'Elda asks Sylvi to reawaken the sleeping boughs of Verdant Reach and clear Stage 15.',
    completionNote:
      'Ancient saplings in Elda’s Sanctuary garden sprout golden leaves.',
    steps: [
      {
        id: 'hs_unlock',
        description: 'Unlock Sylvi in the Fellowship',
        kind: 'unlock_hero',
        heroId: 'sylvi',
        waypointLabel: 'Unlock Sylvi (Stage 10)',
        waypointStageId: 10,
      },
      {
        id: 'hs_stage15',
        description: 'Complete Stage 15 in Verdant Reach',
        kind: 'complete_stage',
        targetNumber: 15,
        waypointLabel: 'Complete Stage 15',
        waypointStageId: 15,
      },
      {
        id: 'hs_talk_elda',
        description: 'Share the memory with Elda the Grovekeeper',
        kind: 'talk_npc',
        targetId: 'elda',
        waypointLabel: 'Talk to Elda (North Arc)',
        waypointHubArea: 'world_portals',
      },
    ],
    reward: {
      lumaShards: 25,
      titleUnlock: 'Voice of Ancient Roots',
      loreEntry: 'Sylvi’s Journal: Every floating island still remembers the single tree from which it grew.',
    },
  },
  {
    id: 'quest_hero_neris',
    title: 'Neris: The Drowned Promise',
    category: 'hero_story',
    heroId: 'neris',
    giverNpcId: 'rill',
    turnInNpcId: 'rill',
    requiredUnlockedHeroId: 'neris',
    summary:
      'Rill entrusts Neris with the sunken aqueduct seals near Stage 25 and three hidden Echo memories.',
    completionNote:
      'Clear water rings chime along Rill’s basin as the drowned promise is fulfilled.',
    steps: [
      {
        id: 'hn_unlock',
        description: 'Unlock Neris in the Fellowship',
        kind: 'unlock_hero',
        heroId: 'neris',
        waypointLabel: 'Unlock Neris (Stage 20)',
        waypointStageId: 20,
      },
      {
        id: 'hn_stage25',
        description: 'Complete Stage 25 in Tidal Expanse',
        kind: 'complete_stage',
        targetNumber: 25,
        waypointLabel: 'Complete Stage 25',
        waypointStageId: 25,
      },
      {
        id: 'hn_talk_rill',
        description: 'Return to Rill beside the Sanctuary waters',
        kind: 'talk_npc',
        targetId: 'rill',
        waypointLabel: 'Talk to Rill (North Pond)',
        waypointHubArea: 'world_portals',
      },
    ],
    reward: {
      lumaShards: 30,
      titleUnlock: 'Keeper of Singing Tides',
      loreEntry: 'Neris’s Vow: The sea never forgets the channels carved by patient hands.',
    },
  },
  {
    id: 'quest_hero_kael',
    title: 'Kael: The Silent Forge',
    category: 'hero_story',
    heroId: 'kael',
    giverNpcId: 'brann',
    turnInNpcId: 'brann',
    requiredUnlockedHeroId: 'kael',
    summary:
      'Brann remembers when Kael’s crucible fell quiet. Conquer Stage 35 and bring Emberfall’s spark back to Brann.',
    completionNote:
      'Brann tempers a ceremonial brass insignia for the Fellowship anvil.',
    steps: [
      {
        id: 'hk_unlock',
        description: 'Unlock Kael in the Fellowship',
        kind: 'unlock_hero',
        heroId: 'kael',
        waypointLabel: 'Unlock Kael (Stage 30)',
        waypointStageId: 30,
      },
      {
        id: 'hk_stage35',
        description: 'Complete Stage 35 in Emberfall Dominion',
        kind: 'complete_stage',
        targetNumber: 35,
        waypointLabel: 'Complete Stage 35',
        waypointStageId: 35,
      },
      {
        id: 'hk_talk_brann',
        description: 'Speak with Brann at the Eastern Overlook',
        kind: 'talk_npc',
        targetId: 'brann',
        waypointLabel: 'Talk to Brann (East Bridge)',
        waypointHubArea: 'central_sanctuary',
      },
    ],
    reward: {
      lumaShards: 35,
      titleUnlock: 'Heir of the Crucible',
      loreEntry: 'Kael’s Blueprint: Strength is forged not to shatter stone, but to bear its weight.',
    },
  },
  {
    id: 'quest_hero_zeph',
    title: 'Zeph: Beyond the Clouds',
    category: 'hero_story',
    heroId: 'zeph',
    giverNpcId: 'aster',
    turnInNpcId: 'aster',
    requiredUnlockedHeroId: 'zeph',
    summary:
      'Aster traces Zeph’s star-chime trajectory above Stage 45 to prove the upper skyways are open once more.',
    completionNote:
      'Wind chimes across the Reward Gallery ring in triple harmony.',
    steps: [
      {
        id: 'hz_unlock',
        description: 'Unlock Zeph in the Fellowship',
        kind: 'unlock_hero',
        heroId: 'zeph',
        waypointLabel: 'Unlock Zeph (Stage 40)',
        waypointStageId: 40,
      },
      {
        id: 'hz_stage45',
        description: 'Complete Stage 45 in Celestial Frontier',
        kind: 'complete_stage',
        targetNumber: 45,
        waypointLabel: 'Complete Stage 45',
        waypointStageId: 45,
      },
      {
        id: 'hz_talk_aster',
        description: 'Speak with Aster at the Observatory Deck',
        kind: 'talk_npc',
        targetId: 'aster',
        waypointLabel: 'Talk to Aster (NE Overlook)',
        waypointHubArea: 'reward_gallery',
      },
    ],
    reward: {
      lumaShards: 40,
      titleUnlock: 'Wing of the Horizon',
      loreEntry: 'Zeph’s Song: Above the tallest storm lies a stillness where stars speak clearly.',
    },
  },

  // ================= EXPLORATION SIDE QUESTS (8) =================
  {
    id: 'quest_side_1',
    title: 'Walk the Sanctuary',
    category: 'side_quest',
    giverNpcId: 'mera',
    turnInNpcId: 'mera',
    summary:
      'Familiarize yourself with The Convergence by visiting the Hero Sanctum, Wardrobe Atelier, Echo Archive, and Quest Board.',
    completionNote:
      'Mera hands you a pouch of travel Shards for learning every wing of the Sanctuary.',
    steps: [
      {
        id: 's1_hero',
        description: 'Visit the Hero Sanctum (West Terrace)',
        kind: 'visit_hub_area',
        targetId: 'hero_sanctum',
        waypointLabel: 'Visit Hero Sanctum',
        waypointHubArea: 'hero_sanctum',
      },
      {
        id: 's1_wardrobe',
        description: 'Visit the Wardrobe Atelier (SW Pavilion)',
        kind: 'visit_hub_area',
        targetId: 'wardrobe_station',
        waypointLabel: 'Visit Wardrobe Atelier',
        waypointHubArea: 'wardrobe_station',
      },
      {
        id: 's1_archive',
        description: 'Visit the Echo Archive (NW Cloister)',
        kind: 'visit_hub_area',
        targetId: 'echo_archive',
        waypointLabel: 'Visit Echo Archive',
        waypointHubArea: 'echo_archive',
      },
      {
        id: 's1_quest',
        description: 'Visit the Cartographer Quest Board (SE Promenade)',
        kind: 'visit_hub_area',
        targetId: 'quest_board',
        waypointLabel: 'Visit Quest Board',
        waypointHubArea: 'quest_board',
      },
    ],
    reward: {
      lumaShards: 15,
      titleUnlock: 'Sanctuary Wanderer',
    },
  },
  {
    id: 'quest_side_2',
    title: 'Whispers in the Ruins',
    category: 'side_quest',
    giverNpcId: 'sora',
    turnInNpcId: 'sora',
    summary:
      'Gather 3 Echo Fragments hidden in island alcoves and bring their stories to Sora at the Echo Archive.',
    completionNote:
      'Sora catalogs the resonant crystals onto the Archive shelves.',
    steps: [
      {
        id: 's2_echoes3',
        description: 'Collect 3 Echo Fragments across any islands',
        kind: 'collect_echoes_count',
        targetNumber: 3,
        waypointLabel: 'Collect 3 Echoes',
      },
      {
        id: 's2_talk_sora',
        description: 'Return to Sora in the Echo Archive',
        kind: 'talk_npc',
        targetId: 'sora',
        waypointLabel: 'Talk to Sora (NW Cloister)',
        waypointHubArea: 'echo_archive',
      },
    ],
    reward: {
      lumaShards: 20,
      loreEntry: 'Archive Folio II: Echoes form wherever travelers paused to watch the sky heal.',
    },
  },
  {
    id: 'quest_side_3',
    title: 'A Pouch of Starlight',
    category: 'side_quest',
    giverNpcId: 'pip',
    turnInNpcId: 'pip',
    summary:
      'Pip is cataloging glowing Luma Shards in the Courtyard. Accumulate 50 total Luma Shards through runs or discoveries.',
    completionNote:
      'Pip cheers and adds your shard tally to his brass ledger.',
    steps: [
      {
        id: 's3_shards50',
        description: 'Gather 50 Luma Shards (current + spent counted)',
        kind: 'collect_shards_total',
        targetNumber: 50,
        waypointLabel: 'Collect 50 Shards',
      },
    ],
    reward: {
      lumaShards: 18,
      titleUnlock: 'Shard Gatherer',
    },
  },
  {
    id: 'quest_side_4',
    title: 'Hands on the Mechanisms',
    category: 'side_quest',
    giverNpcId: 'mera',
    turnInNpcId: 'mera',
    summary:
      'Operate switches, rotating platforms, stone lifts, and prisms 25 times across your puzzles.',
    completionNote:
      'Mera inspects your lantern brass and polishes its hinges.',
    steps: [
      {
        id: 's4_mech25',
        description: 'Activate 25 puzzle mechanisms in islands',
        kind: 'interact_mechanisms_count',
        targetNumber: 25,
        waypointLabel: 'Operate 25 Mechanisms',
      },
    ],
    reward: {
      lumaShards: 18,
    },
  },
  {
    id: 'quest_side_5',
    title: 'Ballad of Ten Islands',
    category: 'side_quest',
    giverNpcId: 'lyra',
    turnInNpcId: 'lyra',
    summary:
      'Lyra weaves a travelling song from tales of restored sanctuaries. Complete 10 distinct islands and visit her by the South Plaza.',
    completionNote:
      'Lyra plucks a gentle melody celebrating ten awakened sky crystals.',
    steps: [
      {
        id: 's5_stages10',
        description: 'Complete 10 islands',
        kind: 'complete_stages_count',
        targetNumber: 10,
        waypointLabel: 'Complete 10 Islands',
      },
      {
        id: 's5_talk_lyra',
        description: 'Listen to Lyra in the Sanctuary Courtyard',
        kind: 'talk_npc',
        targetId: 'lyra',
        waypointLabel: 'Talk to Lyra (Courtyard)',
        waypointHubArea: 'npc_district',
      },
    ],
    reward: {
      lumaShards: 22,
      loreEntry: 'Lyra’s Verse: Ten lanterns lit across the wind become a constellation for lost ships.',
    },
  },
  {
    id: 'quest_side_6',
    title: 'Archivist of Fifteen Echoes',
    category: 'side_quest',
    giverNpcId: 'sora',
    turnInNpcId: 'sora',
    prerequisiteQuestIds: ['quest_side_2'],
    summary:
      'Recover 15 hidden Echo Fragments scattered throughout the six worlds.',
    completionNote:
      'Half an age of forgotten sky-lore now shines inside Sora’s Archive.',
    steps: [
      {
        id: 's6_echoes15',
        description: 'Collect 15 Echo Fragments',
        kind: 'collect_echoes_count',
        targetNumber: 15,
        waypointLabel: 'Collect 15 Echoes',
      },
    ],
    reward: {
      lumaShards: 32,
      titleUnlock: 'Echo Chronicler',
    },
  },
  {
    id: 'quest_side_7',
    title: 'Resonance Master',
    category: 'side_quest',
    giverNpcId: 'tavi',
    turnInNpcId: 'tavi',
    summary:
      'Demonstrate mastery of all Hero Gifts by activating 5 Hero Resonance Nodes across the worlds.',
    completionNote:
      'Tavi marks each resonance node on the living sky chart.',
    steps: [
      {
        id: 's7_nodes5',
        description: 'Resonate 5 Hero Nodes using [E] or [Q]',
        kind: 'activate_hero_node',
        targetNumber: 5,
        waypointLabel: 'Resonate 5 Hero Nodes',
      },
    ],
    reward: {
      lumaShards: 28,
      titleUnlock: 'Resonance Tactician',
    },
  },
  {
    id: 'quest_side_8',
    title: 'Every Keeper’s Story',
    category: 'side_quest',
    giverNpcId: 'lyra',
    turnInNpcId: 'lyra',
    summary:
      'Introduce yourself to all 10 residents of The Convergence to unite the Hub fellowship.',
    completionNote:
      'Every lantern in the Sanctuary Courtyard burns brighter with shared fellowship.',
    steps: [
      { id: 's8_orin', description: 'Speak with Orin', kind: 'talk_npc', targetId: 'orin' },
      { id: 's8_mera', description: 'Speak with Mera', kind: 'talk_npc', targetId: 'mera' },
      { id: 's8_tavi', description: 'Speak with Tavi', kind: 'talk_npc', targetId: 'tavi' },
      { id: 's8_elda', description: 'Speak with Elda', kind: 'talk_npc', targetId: 'elda' },
      { id: 's8_rill', description: 'Speak with Rill', kind: 'talk_npc', targetId: 'rill' },
      { id: 's8_brann', description: 'Speak with Brann', kind: 'talk_npc', targetId: 'brann' },
      { id: 's8_aster', description: 'Speak with Aster', kind: 'talk_npc', targetId: 'aster' },
      { id: 's8_sora', description: 'Speak with Sora', kind: 'talk_npc', targetId: 'sora' },
      { id: 's8_pip', description: 'Speak with Pip', kind: 'talk_npc', targetId: 'pip' },
      { id: 's8_lyra', description: 'Speak with Lyra', kind: 'talk_npc', targetId: 'lyra' },
    ],
    reward: {
      lumaShards: 30,
      titleUnlock: 'Friend of The Convergence',
    },
  },

  // ================= HIDDEN SECRET QUESTS (5) =================
  {
    id: 'quest_secret_1',
    title: 'The Forgotten Eastern Bridge',
    category: 'hidden_secret',
    hiddenUntilDiscovered: true,
    summary:
      'Beyond Brann’s Eastern Overlook lies a narrow wooden bridge leading to a moss-wrapped whisper pedestal.',
    completionNote:
      'You uncovered the Forgotten Eastern Alcove and awakened its quiet pedestal.',
    steps: [
      {
        id: 'sec1_visit',
        description: 'Cross the eastern bridge to reach the Forgotten Eastern Alcove',
        kind: 'visit_hub_area',
        targetId: 'hidden_alcove',
        waypointLabel: 'Explore far-East Hub Bridge',
        waypointHubArea: 'hidden_alcove',
      },
    ],
    reward: {
      lumaShards: 25,
      titleUnlock: 'Seeker of Hidden Paths',
      loreEntry: 'Hidden Inscription: Even in stone sanctuaries, quiet corners remember the builders who rested there.',
    },
  },
  {
    id: 'quest_secret_2',
    title: 'Echoes Beneath the Dawn',
    category: 'hidden_secret',
    hiddenUntilDiscovered: true,
    summary:
      'Gather the secret Echo Fragment buried on Stage 03: The Lightkeeper and whisper its verse to Sora.',
    completionNote:
      'The Prism Keepers’ oldest verse returns to the Echo Archive.',
    steps: [
      {
        id: 'sec2_echo3',
        description: 'Collect the Echo Fragment on Stage 03',
        kind: 'collect_echo',
        targetId: 'echo_03',
      },
    ],
    reward: {
      lumaShards: 20,
      loreEntry: 'Secret Dawn Verse: Split one pale ray three ways, and darkness forgets where it stood.',
    },
  },
  {
    id: 'quest_secret_3',
    title: 'Halfway Constellation',
    category: 'hidden_secret',
    hiddenUntilDiscovered: true,
    summary:
      'Collect 30 Echo Fragments from across the floating archipelagos to reveal the hidden Star-Map cipher.',
    completionNote:
      'Half of all sky memories align into a glowing mosaic inside your Codex.',
    steps: [
      {
        id: 'sec3_echo30',
        description: 'Collect 30 Echo Fragments',
        kind: 'collect_echoes_count',
        targetNumber: 30,
      },
    ],
    reward: {
      lumaShards: 40,
      titleUnlock: 'Keeper of Thirty Echoes',
    },
  },
  {
    id: 'quest_secret_4',
    title: 'Master of Every Gift',
    category: 'hidden_secret',
    hiddenUntilDiscovered: true,
    summary:
      'Resonate 15 Hero Nodes using the Fellowship’s signature abilities.',
    completionNote:
      'All five elemental resonances harmonize across the floating islands.',
    steps: [
      {
        id: 'sec4_nodes15',
        description: 'Resonate 15 Hero Nodes across stages',
        kind: 'activate_hero_node',
        targetNumber: 15,
      },
    ],
    reward: {
      lumaShards: 45,
      titleUnlock: 'Paragon of Five Gifts',
    },
  },
  {
    id: 'quest_secret_5',
    title: 'Memory of Sixty Skies',
    category: 'hidden_secret',
    hiddenUntilDiscovered: true,
    summary:
      'Recover all 60 Echo Fragments across all six worlds to preserve every memory of LUMA.',
    completionNote:
      'Every Echo in the sky sings together in an unbroken chorus.',
    steps: [
      {
        id: 'sec5_echo60',
        description: 'Collect all 60 Echo Fragments',
        kind: 'collect_echoes_count',
        targetNumber: 60,
      },
    ],
    reward: {
      lumaShards: 90,
      titleUnlock: 'Eternal Archivist',
      loreEntry: 'Sixty-Sky Accord: Memory is the wind that lifts every island above the mist.',
    },
  },
];

export const QUEST_MAP = new Map<string, QuestDef>(QUESTS.map((q) => [q.id, q]));

export function getQuestById(id: string): QuestDef | undefined {
  return QUEST_MAP.get(id);
}
