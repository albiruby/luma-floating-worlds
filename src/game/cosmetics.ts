import { getCharacterById } from './characters';
import {
  AuraVisualStyle,
  BackpackVisualStyle,
  CharacterId,
  CosmeticCategory,
  CosmeticId,
  CosmeticItemDef,
  CosmeticMilestoneDef,
  EquippedCosmetics,
  HeadwearVisualStyle,
  WayfinderAppearance,
  WorldId,
} from './types';

export const DEFAULT_EQUIPPED_COSMETICS: EquippedCosmetics = {
  cloakId: 'default_cloak',
  lanternId: 'default_lantern',
  headwearId: 'none_headwear',
  backpackId: 'none_backpack',
  auraId: 'none_aura',
  paletteId: 'palette_pilgrim_classic',
  setId: null,
};

export const COSMETIC_ITEMS: CosmeticItemDef[] = [
  // ================= CLOAKS & OUTFITS (11) =================
  {
    id: 'default_cloak',
    name: 'Saffron Pilgrim Cloak',
    category: 'cloak',
    unlockType: 'starter',
    requiredStars: 0,
    unlockLabel: 'Starter Outfit',
    description: 'Traditional warm saffron travel cloak and cream cowl worn across the floating archipelagos.',
    previewSwatchPrimary: '#e39b2b',
    previewSwatchSecondary: '#2f6d75',
  },
  {
    id: 'dawn_mantle',
    name: 'Dawnwind Mantle',
    category: 'cloak',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 15,
    unlockLabel: '15 Luma Shards',
    description: 'Apricot horizon-dyed travel mantle stitched with crisp cloudline seams.',
    previewSwatchPrimary: '#f28b50',
    previewSwatchSecondary: '#f7e6c4',
  },
  {
    id: 'mossweave_cloak',
    name: 'Mossweave Cloak',
    category: 'cloak',
    unlockType: 'stars',
    requiredStars: 6,
    unlockLabel: '6 Mastery Stars',
    description: 'Woven from living highland moss and deep forest wool, trimmed with woodland sage.',
    previewSwatchPrimary: '#4d8e44',
    previewSwatchSecondary: '#264d2f',
  },
  {
    id: 'verdant_canopy_shawl',
    name: 'Canopy Fern Shawl',
    category: 'cloak',
    unlockType: 'world_clear',
    requiredStars: 0,
    requiredWorldClear: 'world_2',
    unlockLabel: 'Clear World II (Stage 20)',
    description: 'Layered forest-jade cloak edged in sunlit fern embroidery.',
    previewSwatchPrimary: '#3f8f63',
    previewSwatchSecondary: '#c7e89b',
  },
  {
    id: 'briarwarden_cape',
    name: 'Briarwarden Cape',
    category: 'cloak',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 30,
    unlockLabel: '30 Luma Shards',
    description: 'Heavy olivebark cape worn by ancient canopy scouts.',
    previewSwatchPrimary: '#5d7d38',
    previewSwatchSecondary: '#3b4a2b',
  },
  {
    id: 'coral_shimmer_wrap',
    name: 'Coral Shimmer Wrap',
    category: 'cloak',
    unlockType: 'world_clear',
    requiredStars: 0,
    requiredWorldClear: 'world_3',
    unlockLabel: 'Clear World III (Stage 30)',
    description: 'Iridescent lagoon-turquoise mantle woven beside sunken aqueducts.',
    previewSwatchPrimary: '#24b2c9',
    previewSwatchSecondary: '#ff9c82',
  },
  {
    id: 'abyssal_mariner_coat',
    name: 'Mariner Tidecoat',
    category: 'cloak',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 40,
    unlockLabel: '40 Luma Shards',
    description: 'Storm-navy nautical cloak with silver spray-trimmed lapels.',
    previewSwatchPrimary: '#1d567a',
    previewSwatchSecondary: '#a8f2f0',
  },
  {
    id: 'ashforge_tabard',
    name: 'Ashforge Tabard',
    category: 'cloak',
    unlockType: 'world_clear',
    requiredStars: 0,
    requiredWorldClear: 'world_4',
    unlockLabel: 'Clear World IV (Stage 40)',
    description: 'Charcoal-crimson foundry tabard reinforced with bronze shoulder clasps.',
    previewSwatchPrimary: '#b84225',
    previewSwatchSecondary: '#4a434a',
  },
  {
    id: 'molten_cinder_mantle',
    name: 'Molten Cinder Mantle',
    category: 'cloak',
    unlockType: 'stars',
    requiredStars: 60,
    unlockLabel: '60 Mastery Stars',
    description: 'Smoldering obsidian weave lit along the hem by captive forge embers.',
    previewSwatchPrimary: '#d44c1e',
    previewSwatchSecondary: '#ffbe66',
  },
  {
    id: 'celestial_cloak',
    name: 'Celestial Cloak',
    category: 'cloak',
    unlockType: 'stars',
    requiredStars: 24,
    unlockLabel: '24 Mastery Stars',
    description: 'Midnight-blue observatory mantle adorned with starlight gold trim and a solar crest.',
    previewSwatchPrimary: '#1f355c',
    previewSwatchSecondary: '#ebb652',
  },
  {
    id: 'zephyr_silk_drape',
    name: 'Zephyr Silk Drape',
    category: 'cloak',
    unlockType: 'world_clear',
    requiredStars: 0,
    requiredWorldClear: 'world_5',
    unlockLabel: 'Clear World V (Stage 50)',
    description: 'Featherlight cerulean wind-mantle stitched from upper-cloud silk.',
    previewSwatchPrimary: '#5278e8',
    previewSwatchSecondary: '#f7efd2',
  },
  {
    id: 'echo_weaver_raiment',
    name: 'Echo-Weaver Raiment',
    category: 'cloak',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 40,
    unlockLabel: '40 Echo Fragments',
    description: 'Resonant jade-ivory vestments braided with starlight threads from forty Echo shrines.',
    previewSwatchPrimary: '#24998e',
    previewSwatchSecondary: '#f5e7c1',
  },

  // ================= LANTERNS & TOOLS (11) =================
  {
    id: 'default_lantern',
    name: 'Amber Brass Lantern',
    category: 'lantern',
    unlockType: 'starter',
    requiredStars: 0,
    unlockLabel: 'Starter Tool',
    description: 'Steadfast hand-forged brass lantern glowing with a gentle amber flame.',
    previewSwatchPrimary: '#ffb845',
    previewSwatchSecondary: '#d99f3b',
  },
  {
    id: 'sunshard_lantern',
    name: 'Sunshard Lantern',
    category: 'lantern',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 15,
    unlockLabel: '15 Luma Shards',
    description: 'Polished golden prism lantern focusing crisp noon-sun radiance.',
    previewSwatchPrimary: '#ffe36e',
    previewSwatchSecondary: '#d49d2a',
  },
  {
    id: 'tideglass_lantern',
    name: 'Tideglass Lantern',
    category: 'lantern',
    unlockType: 'stars',
    requiredStars: 12,
    unlockLabel: '12 Mastery Stars',
    description: 'Sea-glass prism housing filled with calm turquoise skyfire and cool aqua radiance.',
    previewSwatchPrimary: '#36ebd9',
    previewSwatchSecondary: '#73b3c4',
  },
  {
    id: 'emberglow_lantern',
    name: 'Emberglow Lantern',
    category: 'lantern',
    unlockType: 'stars',
    requiredStars: 18,
    unlockLabel: '18 Mastery Stars',
    description: 'Forged in the Skyforge hearth; radiates a warm molten-ember core within dark bronze.',
    previewSwatchPrimary: '#ff7d29',
    previewSwatchSecondary: '#8f5232',
  },
  {
    id: 'heartroot_staff',
    name: 'Heartroot Focus Rod',
    category: 'lantern',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 12,
    unlockLabel: '12 Echo Fragments',
    description: 'Living oaken focus cradling an emerald forest crystal.',
    previewSwatchPrimary: '#63eb7e',
    previewSwatchSecondary: '#78573b',
  },
  {
    id: 'canopy_censer',
    name: 'Canopy Censer',
    category: 'lantern',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 25,
    unlockLabel: '25 Luma Shards',
    description: 'Hanging leaf-bronze censer pulsing with bioluminescent moss light.',
    previewSwatchPrimary: '#a6ff7a',
    previewSwatchSecondary: '#587844',
  },
  {
    id: 'pearl_conch_vessel',
    name: 'Pearl Conch Vessel',
    category: 'lantern',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 35,
    unlockLabel: '35 Luma Shards',
    description: 'Spiral sea-shell lamp tuned to the Tidal Expanse aqueducts.',
    previewSwatchPrimary: '#94fff6',
    previewSwatchSecondary: '#e8d7c5',
  },
  {
    id: 'lagoon_astrolabe',
    name: 'Lagoon Astrolabe',
    category: 'lantern',
    unlockType: 'stars',
    requiredStars: 45,
    unlockLabel: '45 Mastery Stars',
    description: 'Spinning aquamarine brass rings housing a sapphire tide core.',
    previewSwatchPrimary: '#38c7ff',
    previewSwatchSecondary: '#6ba4b8',
  },
  {
    id: 'crucible_brazier_rod',
    name: 'Crucible Brazier Rod',
    category: 'lantern',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 45,
    unlockLabel: '45 Luma Shards',
    description: 'Heavy smith-iron brazier burning with white-gold furnace fire.',
    previewSwatchPrimary: '#ff9642',
    previewSwatchSecondary: '#5c4b47',
  },
  {
    id: 'pyre_prism_torch',
    name: 'Pyre Prism Torch',
    category: 'lantern',
    unlockType: 'stars',
    requiredStars: 90,
    unlockLabel: '90 Mastery Stars',
    description: 'Ruby-tempered crystal focus emitting steady solar-forge flames.',
    previewSwatchPrimary: '#ff5238',
    previewSwatchSecondary: '#9c6738',
  },
  {
    id: 'gale_chime_wand',
    name: 'Gale Chime Focus',
    category: 'lantern',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 55,
    unlockLabel: '55 Luma Shards',
    description: 'Twin-bell celestial chime emitting cool starlight-violet beams.',
    previewSwatchPrimary: '#99b8ff',
    previewSwatchSecondary: '#e8c16b',
  },
  {
    id: 'echo_prism_focus',
    name: 'Echo Prism Core',
    category: 'lantern',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 50,
    unlockLabel: '50 Echo Fragments',
    description: 'Faceted memory-prism harmonizing every light spectrum of LUMA.',
    previewSwatchPrimary: '#52fff0',
    previewSwatchSecondary: '#f0cf75',
  },

  // ================= HEADWEAR (6) =================
  {
    id: 'none_headwear',
    name: 'Signature Cowl / Bare',
    category: 'headwear',
    unlockType: 'starter',
    requiredStars: 0,
    unlockLabel: 'Starter Headwear',
    description: 'Wear each hero’s natural hood, silhouette, or signature crest.',
    previewSwatchPrimary: '#cfc4a8',
    previewSwatchSecondary: '#586873',
  },
  {
    id: 'pilgrim_brim_hat',
    name: 'Traveler Wide-Brim Hat',
    category: 'headwear',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 20,
    unlockLabel: '20 Luma Shards',
    description: 'Broad felt sky-wanderer hat with a brass pin band.',
    previewSwatchPrimary: '#9e6b43',
    previewSwatchSecondary: '#e8b652',
  },
  {
    id: 'sylvan_antler_circlet',
    name: 'Sylvan Antler Crown',
    category: 'headwear',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 18,
    unlockLabel: '18 Echo Fragments',
    description: 'Graceful wooden antlers crowned with glowing canopy buds.',
    previewSwatchPrimary: '#7d5638',
    previewSwatchSecondary: '#69e386',
  },
  {
    id: 'tidal_coral_crown',
    name: 'Coral Fin Diadem',
    category: 'headwear',
    unlockType: 'stars',
    requiredStars: 50,
    unlockLabel: '50 Mastery Stars',
    description: 'Sculpted sea-pearl and turquoise coral crests framing the brow.',
    previewSwatchPrimary: '#36ded9',
    previewSwatchSecondary: '#ff967d',
  },
  {
    id: 'forge_crest_visor',
    name: 'Forge Crest Circlet',
    category: 'headwear',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 50,
    unlockLabel: '50 Luma Shards',
    description: 'Riveted bronze brow-guard with twin ember-forged horns.',
    previewSwatchPrimary: '#8c5539',
    previewSwatchSecondary: '#ff7d29',
  },
  {
    id: 'celestial_halo_diadem',
    name: 'Astral Halo Diadem',
    category: 'headwear',
    unlockType: 'stars',
    requiredStars: 120,
    unlockLabel: '120 Mastery Stars',
    description: 'Levitating golden starlight ring hovering above a sapphire crown.',
    previewSwatchPrimary: '#ffd670',
    previewSwatchSecondary: '#6b94ff',
  },

  // ================= BACKPACKS (6) =================
  {
    id: 'none_backpack',
    name: 'Unburdened Back',
    category: 'backpack',
    unlockType: 'starter',
    requiredStars: 0,
    unlockLabel: 'Starter Gear',
    description: 'Travel light with an uncluttered cape silhouette.',
    previewSwatchPrimary: '#c7bca1',
    previewSwatchSecondary: '#4c5b66',
  },
  {
    id: 'leather_scroll_pack',
    name: 'Cartographer Scroll Pack',
    category: 'backpack',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 20,
    unlockLabel: '20 Luma Shards',
    description: 'Stitched leather field pack strapped with rolled sky-island charts.',
    previewSwatchPrimary: '#8f5d38',
    previewSwatchSecondary: '#f0dec0',
  },
  {
    id: 'botanist_seed_satchel',
    name: 'Botanist Seed Satchel',
    category: 'backpack',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 24,
    unlockLabel: '24 Echo Fragments',
    description: 'Woven wicker planter pack carrying sprouting sky-saplings.',
    previewSwatchPrimary: '#7d6242',
    previewSwatchSecondary: '#5dc25f',
  },
  {
    id: 'mariner_tank_pack',
    name: 'Aqua-Resonator Pack',
    category: 'backpack',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 45,
    unlockLabel: '45 Luma Shards',
    description: 'Twin glass-cylinder tide flasks glowing softly on brass straps.',
    previewSwatchPrimary: '#4be8eb',
    previewSwatchSecondary: '#658b9e',
  },
  {
    id: 'ember_anvil_pack',
    name: 'Bellows Forge Pack',
    category: 'backpack',
    unlockType: 'stars',
    requiredStars: 75,
    unlockLabel: '75 Mastery Stars',
    description: 'Compact bronze-plated forge bellows with glowing heat vents.',
    previewSwatchPrimary: '#634c46',
    previewSwatchSecondary: '#ff7024',
  },
  {
    id: 'wingframe_glider_pack',
    name: 'Skyweaver Pinions',
    category: 'backpack',
    unlockType: 'stars',
    requiredStars: 135,
    unlockLabel: '135 Mastery Stars',
    description: 'Articulated brass-and-silk glider wings folded gracefully behind the shoulders.',
    previewSwatchPrimary: '#f2e4c2',
    previewSwatchSecondary: '#739bff',
  },

  // ================= AURAS & TRAILS (6) =================
  {
    id: 'none_aura',
    name: 'Quiet Lantern Step',
    category: 'aura',
    unlockType: 'starter',
    requiredStars: 0,
    unlockLabel: 'Starter Aura',
    description: 'Standard calm presence without orbiting particles.',
    previewSwatchPrimary: '#d9cfb6',
    previewSwatchSecondary: '#697982',
  },
  {
    id: 'dawnfire_trail',
    name: 'Dawnfire Motes',
    category: 'aura',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 6,
    unlockLabel: '6 Echo Fragments',
    description: 'Warm golden motes drifting slowly around your lantern.',
    previewSwatchPrimary: '#ffd76b',
    previewSwatchSecondary: '#ff9c45',
  },
  {
    id: 'sporeleaf_drift',
    name: 'Sporeleaf Drift',
    category: 'aura',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 30,
    unlockLabel: '30 Luma Shards',
    description: 'Floating jade canopy spores orbiting like fireflies.',
    previewSwatchPrimary: '#78f58d',
    previewSwatchSecondary: '#3da862',
  },
  {
    id: 'foam_droplet_wake',
    name: 'Tidal Pearl Halo',
    category: 'aura',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 40,
    unlockLabel: '40 Luma Shards',
    description: 'Bubbling aqua droplets circling in a serene orbital ring.',
    previewSwatchPrimary: '#47f2eb',
    previewSwatchSecondary: '#a3fbff',
  },
  {
    id: 'cinder_spark_orbit',
    name: 'Cinder Spark Orbit',
    category: 'aura',
    unlockType: 'stars',
    requiredStars: 105,
    unlockLabel: '105 Mastery Stars',
    description: 'Rotating volcanic embers suspended in magnetic orbit.',
    previewSwatchPrimary: '#ff7024',
    previewSwatchSecondary: '#ffd166',
  },
  {
    id: 'starfall_halo_aura',
    name: 'Starfall Constellation',
    category: 'aura',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 55,
    unlockLabel: '55 Echo Fragments',
    description: 'Four celestial stars wheeling slowly around your hero.',
    previewSwatchPrimary: '#8eb3ff',
    previewSwatchSecondary: '#fff1b8',
  },

  // ================= COLOR PALETTES (6) =================
  {
    id: 'palette_pilgrim_classic',
    name: 'Default Harmony',
    category: 'palette',
    unlockType: 'starter',
    requiredStars: 0,
    unlockLabel: 'Starter Palette',
    description: 'Uses each hero’s natural signature dye or selected cloak colors.',
    previewSwatchPrimary: '#e39b2b',
    previewSwatchSecondary: '#2f6d75',
  },
  {
    id: 'palette_emerald_grove',
    name: 'Emerald Grove Dye',
    category: 'palette',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 20,
    unlockLabel: '20 Luma Shards',
    description: 'Deep forest emerald and sunlit fern accents applied across your outfit.',
    previewSwatchPrimary: '#3f8a4c',
    previewSwatchSecondary: '#b6e68a',
  },
  {
    id: 'palette_cerulean_tide',
    name: 'Cerulean Tide Dye',
    category: 'palette',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 25,
    unlockLabel: '25 Luma Shards',
    description: 'Crisp lagoon teal and sea-foam ivory accents.',
    previewSwatchPrimary: '#229bb8',
    previewSwatchSecondary: '#bdf7f7',
  },
  {
    id: 'palette_crimson_forge',
    name: 'Crimson Forge Dye',
    category: 'palette',
    unlockType: 'shards',
    requiredStars: 0,
    shardCost: 30,
    unlockLabel: '30 Luma Shards',
    description: 'Tempered vermilion and burnished bronze trim.',
    previewSwatchPrimary: '#c4452b',
    previewSwatchSecondary: '#f2b866',
  },
  {
    id: 'palette_starlight_indigo',
    name: 'Starlight Indigo Dye',
    category: 'palette',
    unlockType: 'stars',
    requiredStars: 36,
    unlockLabel: '36 Mastery Stars',
    description: 'Deep nocturnal sapphire glazed with gold observatory trim.',
    previewSwatchPrimary: '#27407a',
    previewSwatchSecondary: '#f5c767',
  },
  {
    id: 'palette_prismatic_ivory',
    name: 'Prismatic Ivory Dye',
    category: 'palette',
    unlockType: 'stars',
    requiredStars: 150,
    unlockLabel: '150 Mastery Stars',
    description: 'Radiant alabaster cloth gleaming with turquoise sky-crystal trim.',
    previewSwatchPrimary: '#f2ebda',
    previewSwatchSecondary: '#3debd9',
  },

  // ================= COMPLETE SETS (3) =================
  {
    id: 'eternal_wayfinder_set',
    name: 'Eternal Wayfinder Set',
    category: 'set',
    unlockType: 'stars',
    requiredStars: 30,
    unlockLabel: '30 Mastery Stars',
    description: 'Mastery regalia uniting royal ivory-gold robes, luminous sky-prism lantern, and orbiting motes.',
    previewSwatchPrimary: '#f3e5bf',
    previewSwatchSecondary: '#2adcc9',
  },
  {
    id: 'warden_of_echoes_set',
    name: 'Warden of Echoes Set',
    category: 'set',
    unlockType: 'echoes',
    requiredStars: 0,
    requiredEchoes: 60,
    unlockLabel: 'All 60 Echo Fragments',
    description: 'Ceremonial archive regalia celebrating the recovery of every Echo across all 60 islands.',
    previewSwatchPrimary: '#1d7373',
    previewSwatchSecondary: '#ffd978',
  },
  {
    id: 'astral_sovereign_set',
    name: 'Astral Sovereign Set',
    category: 'set',
    unlockType: 'stars',
    requiredStars: 180,
    unlockLabel: '180 Mastery Stars (Grand Perfection)',
    description: 'Supreme winged regalia crowned with a floating astral halo and prismatic starlight aura.',
    previewSwatchPrimary: '#30498f',
    previewSwatchSecondary: '#ffe285',
  },
];

// Preserved original 5 star milestones first + Worlds Beyond star milestones
export const COSMETIC_MILESTONES: CosmeticMilestoneDef[] = [
  {
    requiredStars: 6,
    cosmeticId: 'mossweave_cloak',
    title: 'Mossweave Cloak',
    subtitle: '6-Star Milestone Unlocked',
  },
  {
    requiredStars: 12,
    cosmeticId: 'tideglass_lantern',
    title: 'Tideglass Lantern',
    subtitle: '12-Star Milestone Unlocked',
  },
  {
    requiredStars: 18,
    cosmeticId: 'emberglow_lantern',
    title: 'Emberglow Lantern',
    subtitle: '18-Star Milestone Unlocked',
  },
  {
    requiredStars: 24,
    cosmeticId: 'celestial_cloak',
    title: 'Celestial Cloak',
    subtitle: '24-Star Milestone Unlocked',
  },
  {
    requiredStars: 30,
    cosmeticId: 'eternal_wayfinder_set',
    title: 'Eternal Wayfinder Set',
    subtitle: '30-Star Grand Mastery Unlocked',
  },
];

export const EXPANDED_STAR_MILESTONES: CosmeticMilestoneDef[] = [
  ...COSMETIC_MILESTONES,
  { requiredStars: 36, cosmeticId: 'palette_starlight_indigo', title: 'Starlight Indigo Dye', subtitle: '36-Star Milestone' },
  { requiredStars: 45, cosmeticId: 'lagoon_astrolabe', title: 'Lagoon Astrolabe', subtitle: '45-Star Milestone' },
  { requiredStars: 50, cosmeticId: 'tidal_coral_crown', title: 'Coral Fin Diadem', subtitle: '50-Star Milestone' },
  { requiredStars: 60, cosmeticId: 'molten_cinder_mantle', title: 'Molten Cinder Mantle', subtitle: '60-Star Milestone' },
  { requiredStars: 75, cosmeticId: 'ember_anvil_pack', title: 'Bellows Forge Pack', subtitle: '75-Star Milestone' },
  { requiredStars: 90, cosmeticId: 'pyre_prism_torch', title: 'Pyre Prism Torch', subtitle: '90-Star Milestone' },
  { requiredStars: 105, cosmeticId: 'cinder_spark_orbit', title: 'Cinder Spark Orbit', subtitle: '105-Star Milestone' },
  { requiredStars: 120, cosmeticId: 'celestial_halo_diadem', title: 'Astral Halo Diadem', subtitle: '120-Star Milestone' },
  { requiredStars: 135, cosmeticId: 'wingframe_glider_pack', title: 'Skyweaver Pinions', subtitle: '135-Star Milestone' },
  { requiredStars: 150, cosmeticId: 'palette_prismatic_ivory', title: 'Prismatic Ivory Dye', subtitle: '150-Star Milestone' },
  { requiredStars: 180, cosmeticId: 'astral_sovereign_set', title: 'Astral Sovereign Set', subtitle: '180-Star Perfection' },
];

const COSMETIC_MAP = new Map<CosmeticId, CosmeticItemDef>(
  COSMETIC_ITEMS.map((item) => [item.id, item])
);

export function getCosmeticById(id: CosmeticId): CosmeticItemDef {
  return COSMETIC_MAP.get(id) ?? COSMETIC_ITEMS[0];
}

export function getCosmeticsByCategory(category: CosmeticCategory): CosmeticItemDef[] {
  return COSMETIC_ITEMS.filter((item) => item.category === category);
}

export interface CosmeticUnlockContext {
  totalStars: number;
  collectedEchoCount?: number;
  completedLevels?: number[];
  purchasedCosmetics?: CosmeticId[];
}

function isWorldCleared(worldId: WorldId, completedLevels: number[]): boolean {
  const endStage: Record<WorldId, number> = {
    world_1: 10,
    world_2: 20,
    world_3: 30,
    world_4: 40,
    world_5: 50,
    world_6: 60,
  };
  return completedLevels.includes(endStage[worldId]);
}

export function isCosmeticUnlocked(
  cosmeticId: CosmeticId,
  totalStars: number,
  unlockedList?: CosmeticId[],
  context?: CosmeticUnlockContext
): boolean {
  const item = COSMETIC_MAP.get(cosmeticId);
  if (!item) return false;
  if (item.unlockType === 'starter') return true;
  if (item.unlockType === 'stars') {
    if (totalStars >= item.requiredStars) return true;
    return false;
  }
  if (item.unlockType === 'echoes') {
    const echoCount = context?.collectedEchoCount ?? 0;
    if (echoCount >= (item.requiredEchoes ?? 999)) return true;
    return Array.isArray(unlockedList) ? unlockedList.includes(cosmeticId) && !context : false;
  }
  if (item.unlockType === 'world_clear' && item.requiredWorldClear) {
    const cleared = context?.completedLevels
      ? isWorldCleared(item.requiredWorldClear, context.completedLevels)
      : false;
    if (cleared) return true;
    return Array.isArray(unlockedList) ? unlockedList.includes(cosmeticId) && !context : false;
  }
  if (item.unlockType === 'shards') {
    if (context?.purchasedCosmetics?.includes(cosmeticId)) return true;
    return Array.isArray(unlockedList) ? unlockedList.includes(cosmeticId) && !context : false;
  }
  return false;
}

export function resolveUnlockedCosmetics(
  totalStars: number,
  collectedEchoCount = 0,
  completedLevels: number[] = [],
  purchasedCosmetics: CosmeticId[] = []
): CosmeticId[] {
  const safeStars = Math.max(0, Math.min(180, Math.trunc(totalStars)));
  const ctx: CosmeticUnlockContext = {
    totalStars: safeStars,
    collectedEchoCount,
    completedLevels,
    purchasedCosmetics,
  };
  return COSMETIC_ITEMS.filter((item) =>
    isCosmeticUnlocked(item.id, safeStars, purchasedCosmetics, ctx)
  ).map((item) => item.id);
}

export function getNewlyUnlockedMilestones(
  prevTotalStars: number,
  nextTotalStars: number
): CosmeticMilestoneDef[] {
  if (nextTotalStars <= prevTotalStars) return [];
  return EXPANDED_STAR_MILESTONES.filter(
    (m) => prevTotalStars < m.requiredStars && nextTotalStars >= m.requiredStars
  );
}

export function canEquipCosmetic(
  cosmeticId: CosmeticId,
  totalStars: number,
  unlockedCosmetics: CosmeticId[]
): boolean {
  const item = COSMETIC_MAP.get(cosmeticId);
  if (!item) return false;
  if (item.unlockType === 'starter') return true;
  if (item.unlockType === 'stars') {
    return totalStars >= item.requiredStars && unlockedCosmetics.includes(cosmeticId);
  }
  return unlockedCosmetics.includes(cosmeticId);
}

export function equipCosmeticSelection(
  current: EquippedCosmetics,
  cosmeticId: CosmeticId,
  totalStars: number,
  unlockedCosmetics: CosmeticId[]
): EquippedCosmetics {
  if (!canEquipCosmetic(cosmeticId, totalStars, unlockedCosmetics)) {
    return current;
  }
  const item = getCosmeticById(cosmeticId);
  if (item.category === 'set') {
    return {
      ...current,
      setId: item.id,
    };
  }
  if (item.category === 'cloak') {
    return {
      ...current,
      cloakId: item.id,
      setId: null,
    };
  }
  if (item.category === 'lantern') {
    return {
      ...current,
      lanternId: item.id,
      setId: null,
    };
  }
  if (item.category === 'headwear') {
    return {
      ...current,
      headwearId: item.id,
      setId: null,
    };
  }
  if (item.category === 'backpack') {
    return {
      ...current,
      backpackId: item.id,
      setId: null,
    };
  }
  if (item.category === 'aura') {
    return {
      ...current,
      auraId: item.id,
      setId: null,
    };
  }
  if (item.category === 'palette') {
    return {
      ...current,
      paletteId: item.id,
      setId: null,
    };
  }
  return current;
}

export function resolveWayfinderAppearance(
  equipped: EquippedCosmetics,
  characterId: CharacterId = 'wayfinder'
): WayfinderAppearance {
  const hero = getCharacterById(characterId);
  const dc = hero.defaultColors;

  if (equipped.setId === 'eternal_wayfinder_set') {
    return {
      characterId,
      cloakColor: 0xf1e3bf,
      cloakTrimColor: 0xe8b243,
      tunicColor: 0x1b7a75,
      skinColor: dc.skinColor,
      lanternCoreColor: 0xaafff3,
      lanternEmissiveColor: 0x2de3d1,
      lanternLightColor: 0x57f7e6,
      brassTintColor: 0xe8b64c,
      headwearStyle: characterId === 'wayfinder' ? 'hood' : 'halo_diadem',
      backpackStyle: 'wing_glider',
      auraStyle: 'eternal',
      hasCelestialTrim: true,
      hasMossBrooch: false,
      hasEternalAura: true,
    };
  }

  if (equipped.setId === 'warden_of_echoes_set') {
    return {
      characterId,
      cloakColor: 0x1d7373,
      cloakTrimColor: 0xffd978,
      tunicColor: 0x24474e,
      skinColor: dc.skinColor,
      lanternCoreColor: 0xa8fff6,
      lanternEmissiveColor: 0x45f2df,
      lanternLightColor: 0x73fff0,
      brassTintColor: 0xe6b856,
      headwearStyle: 'antlers',
      backpackStyle: 'scroll_pack',
      auraStyle: 'starfall',
      hasCelestialTrim: true,
      hasMossBrooch: false,
      hasEternalAura: true,
    };
  }

  if (equipped.setId === 'astral_sovereign_set') {
    return {
      characterId,
      cloakColor: 0x30498f,
      cloakTrimColor: 0xffe285,
      tunicColor: 0x1c2854,
      skinColor: dc.skinColor,
      lanternCoreColor: 0xfff5c4,
      lanternEmissiveColor: 0x7da4ff,
      lanternLightColor: 0xadc6ff,
      brassTintColor: 0xf5cb62,
      headwearStyle: 'halo_diadem',
      backpackStyle: 'wing_glider',
      auraStyle: 'starfall',
      hasCelestialTrim: true,
      hasMossBrooch: false,
      hasEternalAura: true,
    };
  }

  // Cloak / Outfit colors
  let cloakColor = dc.cloakColor;
  let cloakTrimColor = dc.cloakTrimColor;
  let tunicColor = dc.tunicColor;
  let hasCelestialTrim = false;
  let hasMossBrooch = false;

  switch (equipped.cloakId) {
    case 'default_cloak':
      if (characterId === 'wayfinder') {
        cloakColor = 0xe39b2b;
        cloakTrimColor = 0xf4e4be;
        tunicColor = 0x2f6d75;
      }
      break;
    case 'dawn_mantle':
      cloakColor = 0xf28b50;
      cloakTrimColor = 0xf7e6c4;
      tunicColor = 0x5c4b5c;
      break;
    case 'mossweave_cloak':
      cloakColor = 0x4b8a42;
      cloakTrimColor = 0x274e30;
      tunicColor = 0x385e47;
      hasMossBrooch = true;
      break;
    case 'verdant_canopy_shawl':
      cloakColor = 0x3f8f63;
      cloakTrimColor = 0xc7e89b;
      tunicColor = 0x25543e;
      hasMossBrooch = true;
      break;
    case 'briarwarden_cape':
      cloakColor = 0x5d7d38;
      cloakTrimColor = 0x3b4a2b;
      tunicColor = 0x3a472e;
      hasMossBrooch = true;
      break;
    case 'coral_shimmer_wrap':
      cloakColor = 0x24b2c9;
      cloakTrimColor = 0xff9c82;
      tunicColor = 0x1a5870;
      break;
    case 'abyssal_mariner_coat':
      cloakColor = 0x1d567a;
      cloakTrimColor = 0xa8f2f0;
      tunicColor = 0x163854;
      break;
    case 'ashforge_tabard':
      cloakColor = 0xb84225;
      cloakTrimColor = 0x4a434a;
      tunicColor = 0x362d33;
      break;
    case 'molten_cinder_mantle':
      cloakColor = 0xd44c1e;
      cloakTrimColor = 0xffbe66;
      tunicColor = 0x382422;
      break;
    case 'celestial_cloak':
      cloakColor = 0x1f355c;
      cloakTrimColor = 0xebb652;
      tunicColor = 0x2a4878;
      hasCelestialTrim = true;
      break;
    case 'zephyr_silk_drape':
      cloakColor = 0x5278e8;
      cloakTrimColor = 0xf7efd2;
      tunicColor = 0x284082;
      hasCelestialTrim = true;
      break;
    case 'echo_weaver_raiment':
      cloakColor = 0x24998e;
      cloakTrimColor = 0xf5e7c1;
      tunicColor = 0x1d4d52;
      hasCelestialTrim = true;
      break;
  }

  // Color Palette overrides
  switch (equipped.paletteId) {
    case 'palette_emerald_grove':
      cloakColor = 0x3f8a4c;
      cloakTrimColor = 0xb6e68a;
      tunicColor = 0x254d32;
      break;
    case 'palette_cerulean_tide':
      cloakColor = 0x229bb8;
      cloakTrimColor = 0xbdf7f7;
      tunicColor = 0x194761;
      break;
    case 'palette_crimson_forge':
      cloakColor = 0xc4452b;
      cloakTrimColor = 0xf2b866;
      tunicColor = 0x3d2424;
      break;
    case 'palette_starlight_indigo':
      cloakColor = 0x27407a;
      cloakTrimColor = 0xf5c767;
      tunicColor = 0x19254a;
      hasCelestialTrim = true;
      break;
    case 'palette_prismatic_ivory':
      cloakColor = 0xf2ebda;
      cloakTrimColor = 0x3debd9;
      tunicColor = 0x2f6c78;
      hasCelestialTrim = true;
      break;
  }

  // Lantern / Tool styling
  let lanternCoreColor = dc.toolCoreColor;
  let lanternEmissiveColor = dc.toolEmissiveColor;
  let lanternLightColor = dc.toolLightColor;
  let brassTintColor = dc.brassTintColor;

  switch (equipped.lanternId) {
    case 'sunshard_lantern':
      lanternCoreColor = 0xfff094;
      lanternEmissiveColor = 0xffcc33;
      lanternLightColor = 0xffe066;
      brassTintColor = 0xe3ad39;
      break;
    case 'tideglass_lantern':
      lanternCoreColor = 0xa8fff6;
      lanternEmissiveColor = 0x25d9ca;
      lanternLightColor = 0x4ef5e3;
      brassTintColor = 0x7cb7c7;
      break;
    case 'emberglow_lantern':
      lanternCoreColor = 0xffcf7a;
      lanternEmissiveColor = 0xff6e1a;
      lanternLightColor = 0xff8a3d;
      brassTintColor = 0x8d5738;
      break;
    case 'heartroot_staff':
      lanternCoreColor = 0xa6ffad;
      lanternEmissiveColor = 0x46e06f;
      lanternLightColor = 0x75f596;
      brassTintColor = 0x78573b;
      break;
    case 'canopy_censer':
      lanternCoreColor = 0xc9ff8a;
      lanternEmissiveColor = 0x7be038;
      lanternLightColor = 0xa7f562;
      brassTintColor = 0x627a48;
      break;
    case 'pearl_conch_vessel':
      lanternCoreColor = 0xc7fff9;
      lanternEmissiveColor = 0x4be3d8;
      lanternLightColor = 0x7ef7ed;
      brassTintColor = 0xe8d7c5;
      break;
    case 'lagoon_astrolabe':
      lanternCoreColor = 0x9ee8ff;
      lanternEmissiveColor = 0x2bb8ff;
      lanternLightColor = 0x5ccbff;
      brassTintColor = 0x6ba4b8;
      break;
    case 'crucible_brazier_rod':
      lanternCoreColor = 0xffd78c;
      lanternEmissiveColor = 0xff7b29;
      lanternLightColor = 0xff9a52;
      brassTintColor = 0x5c4b47;
      break;
    case 'pyre_prism_torch':
      lanternCoreColor = 0xffad8c;
      lanternEmissiveColor = 0xff3b1f;
      lanternLightColor = 0xff6247;
      brassTintColor = 0x9c6738;
      break;
    case 'gale_chime_wand':
      lanternCoreColor = 0xdbe6ff;
      lanternEmissiveColor = 0x6f9bff;
      lanternLightColor = 0x9ebdff;
      brassTintColor = 0xe8c16b;
      break;
    case 'echo_prism_focus':
      lanternCoreColor = 0xd4fff9;
      lanternEmissiveColor = 0x45ffea;
      lanternLightColor = 0x7afff0;
      brassTintColor = 0xf0cf75;
      break;
  }

  // Headwear visual
  let headwearStyle: HeadwearVisualStyle = characterId === 'wayfinder' ? 'hood' : 'none';
  switch (equipped.headwearId) {
    case 'pilgrim_brim_hat':
      headwearStyle = 'brim_hat';
      break;
    case 'sylvan_antler_circlet':
      headwearStyle = 'antlers';
      break;
    case 'tidal_coral_crown':
      headwearStyle = 'coral_crown';
      break;
    case 'forge_crest_visor':
      headwearStyle = 'forge_visor';
      break;
    case 'celestial_halo_diadem':
      headwearStyle = 'halo_diadem';
      break;
  }

  // Backpack visual
  let backpackStyle: BackpackVisualStyle = 'none';
  switch (equipped.backpackId) {
    case 'leather_scroll_pack':
      backpackStyle = 'scroll_pack';
      break;
    case 'botanist_seed_satchel':
      backpackStyle = 'seed_satchel';
      break;
    case 'mariner_tank_pack':
      backpackStyle = 'mariner_pack';
      break;
    case 'ember_anvil_pack':
      backpackStyle = 'forge_pack';
      break;
    case 'wingframe_glider_pack':
      backpackStyle = 'wing_glider';
      break;
  }

  // Aura visual
  let auraStyle: AuraVisualStyle = 'none';
  switch (equipped.auraId) {
    case 'dawnfire_trail':
      auraStyle = 'dawnfire';
      break;
    case 'sporeleaf_drift':
      auraStyle = 'sporeleaf';
      break;
    case 'foam_droplet_wake':
      auraStyle = 'tidal_droplet';
      break;
    case 'cinder_spark_orbit':
      auraStyle = 'cinder_orbit';
      break;
    case 'starfall_halo_aura':
      auraStyle = 'starfall';
      break;
  }

  return {
    characterId,
    cloakColor,
    cloakTrimColor,
    tunicColor,
    skinColor: dc.skinColor,
    lanternCoreColor,
    lanternEmissiveColor,
    lanternLightColor,
    brassTintColor,
    headwearStyle,
    backpackStyle,
    auraStyle,
    hasCelestialTrim,
    hasMossBrooch,
    hasEternalAura: auraStyle !== 'none',
  };
}
