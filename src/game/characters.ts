import { CharacterDefinition, CharacterId } from './types';

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'wayfinder',
    name: 'The Wayfinder',
    title: 'Bearer of the First Lantern',
    unlockRequirementLabel: 'Available from the start',
    unlockAfterStageId: 0,
    abilityId: 'lantern_focus',
    abilityName: 'Lantern Focus',
    abilityShortDesc: 'Reveals hidden runes & secret walkways.',
    abilityLongDesc:
      'Focuses radiant skyfire through the Pilgrim Lantern, unveiling concealed rune paths, light-sensitive Echo seals, and hidden shortcuts.',
    homeWorldId: 'world_1',
    accentHex: '#e39b2b',
    secondaryHex: '#2f6d75',
    silhouetteTag: 'Pointed Hood & Swing Lantern',
    loreSummary:
      'Sworn custodian of the shattered sky shrines, carrying an ember-core lantern lit before the Great Drift.',
    defaultColors: {
      cloakColor: 0xe39b2b,
      cloakTrimColor: 0xf4e4be,
      tunicColor: 0x2f6d75,
      skinColor: 0xf2d2b6,
      accentColor: 0xffb845,
      toolCoreColor: 0xffe596,
      toolEmissiveColor: 0xffb845,
      toolLightColor: 0xffc566,
      brassTintColor: 0xd99f3b,
    },
  },
  {
    id: 'sylvi',
    name: 'Sylvi',
    title: 'The Grovewarden',
    unlockRequirementLabel: 'Complete Stage 10 (The First Light)',
    unlockAfterStageId: 10,
    abilityId: 'rootcall',
    abilityName: 'Rootcall',
    abilityShortDesc: 'Weaves living root bridges & wakes botanical nodes.',
    abilityLongDesc:
      'Resonates with ancient canopy roots to grow walkable timber-vine spans across chasm shrines and reveal woodland Echo alcoves.',
    homeWorldId: 'world_2',
    accentHex: '#4f9c54',
    secondaryHex: '#284f37',
    silhouetteTag: 'Leaf-Mantle, Antler Crown & Living Staff',
    loreSummary:
      'Keeper of Verdant Reach who tended the hanging seed-vaults while the sky islands drifted apart.',
    defaultColors: {
      cloakColor: 0x4b8f48,
      cloakTrimColor: 0xcbe8a7,
      tunicColor: 0x264c35,
      skinColor: 0xeecbb2,
      accentColor: 0x8ef086,
      toolCoreColor: 0xa6ff9c,
      toolEmissiveColor: 0x4ce07b,
      toolLightColor: 0x7df5a2,
      brassTintColor: 0x7c5a3c,
    },
  },
  {
    id: 'neris',
    name: 'Neris',
    title: 'The Tidecaller',
    unlockRequirementLabel: 'Complete Stage 20 (Verdant Reach)',
    unlockAfterStageId: 20,
    abilityId: 'tidal_pulse',
    abilityName: 'Tidal Pulse',
    abilityShortDesc: 'Surges water channels & raises sunken tide slabs.',
    abilityLongDesc:
      'Channels tidal resonance into aqua hydro-nodes, raising flooded stepping stones and energizing lagoon conduits.',
    homeWorldId: 'world_3',
    accentHex: '#27b8d4',
    secondaryHex: '#1d4d6b',
    silhouetteTag: 'Wave-Shawl, Coral Fin Crest & Conch Vessel',
    loreSummary:
      'Navigator of the Tidal Expanse who maps currents suspended mid-air between turquoise lagoons.',
    defaultColors: {
      cloakColor: 0x249ab8,
      cloakTrimColor: 0xbef6ff,
      tunicColor: 0x1a4463,
      skinColor: 0xe6c8bd,
      accentColor: 0x4cf2eb,
      toolCoreColor: 0x9efff7,
      toolEmissiveColor: 0x25d9ca,
      toolLightColor: 0x57f7e6,
      brassTintColor: 0x7cb7c7,
    },
  },
  {
    id: 'kael',
    name: 'Kael',
    title: 'The Emberwright',
    unlockRequirementLabel: 'Complete Stage 30 (Tidal Expanse)',
    unlockAfterStageId: 30,
    abilityId: 'ember_spark',
    abilityName: 'Ember Spark',
    abilityShortDesc: 'Ignites ancient braziers & wakes forge conduits.',
    abilityLongDesc:
      'Strikes volcanic spark through heavy bronze conduits, kindling dormant obsidian braziers and unveiling vaulted furnace walkways.',
    homeWorldId: 'world_4',
    accentHex: '#e35d2b',
    secondaryHex: '#3f2c2b',
    silhouetteTag: 'Armored Shoulder Plates, Horned Visor & Forge Hammer-Torch',
    loreSummary:
      'Master smith of Emberfall Dominion whose ancestors cast the bronze gear-bridges holding the sky-forges aloft.',
    defaultColors: {
      cloakColor: 0xbf4726,
      cloakTrimColor: 0xffbf70,
      tunicColor: 0x3b2a2a,
      skinColor: 0xdcb498,
      accentColor: 0xff7a2e,
      toolCoreColor: 0xffd27a,
      toolEmissiveColor: 0xff621a,
      toolLightColor: 0xff8a3d,
      brassTintColor: 0x8d5738,
    },
  },
  {
    id: 'zeph',
    name: 'Zeph',
    title: 'The Skyweaver',
    unlockRequirementLabel: 'Complete Stage 40 (Emberfall Dominion)',
    unlockAfterStageId: 40,
    abilityId: 'windstep',
    abilityName: 'Windstep',
    abilityShortDesc: 'Awakens wind vanes & weaves aerial sky-bridges.',
    abilityLongDesc:
      'Commands high-altitude zephyrs to align wind vanes and spin mist-solid air currents across upper-frontier gaps.',
    homeWorldId: 'world_5',
    accentHex: '#6c8cff',
    secondaryHex: '#253463',
    silhouetteTag: 'Twin Streamer Scarf, Halo Diadem & Wind-Chime Astrolabe',
    loreSummary:
      'Stargazer sentinel from the highest cloud-spires, listening to celestial harmonics carried across the wind currents.',
    defaultColors: {
      cloakColor: 0x4c6fe0,
      cloakTrimColor: 0xfff0c2,
      tunicColor: 0x22305c,
      skinColor: 0xf4dac8,
      accentColor: 0x8fb8ff,
      toolCoreColor: 0xe3ecff,
      toolEmissiveColor: 0x6f9bff,
      toolLightColor: 0xa1c2ff,
      brassTintColor: 0xe8b64c,
    },
  },
];

const CHARACTER_MAP = new Map<CharacterId, CharacterDefinition>(
  CHARACTERS.map((c) => [c.id, c])
);

export function getCharacterById(id: CharacterId | string | undefined): CharacterDefinition {
  if (id && CHARACTER_MAP.has(id as CharacterId)) {
    return CHARACTER_MAP.get(id as CharacterId)!;
  }
  return CHARACTERS[0];
}

export function isCharacterUnlocked(
  characterId: CharacterId,
  completedLevels: number[]
): boolean {
  const def = getCharacterById(characterId);
  if (def.unlockAfterStageId <= 0) return true;
  return completedLevels.includes(def.unlockAfterStageId);
}

export function resolveUnlockedCharacters(completedLevels: number[]): CharacterId[] {
  return CHARACTERS.filter((c) => isCharacterUnlocked(c.id, completedLevels)).map((c) => c.id);
}

export function getNewlyUnlockedCharacters(
  prevCompleted: number[],
  nextCompleted: number[]
): CharacterId[] {
  const prevSet = new Set(prevCompleted);
  return CHARACTERS.filter(
    (c) =>
      c.unlockAfterStageId > 0 &&
      !prevSet.has(c.unlockAfterStageId) &&
      nextCompleted.includes(c.unlockAfterStageId)
  ).map((c) => c.id);
}
