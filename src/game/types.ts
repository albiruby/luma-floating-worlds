export const TILE_SIZE = 2.0;
export const ELEVATION_STEP = 0.65;
export const PLAYER_RADIUS = 0.34;
export const INTERACT_RANGE = 2.35;

export type Direction = 0 | 1 | 2 | 3; // 0: +X (East), 1: +Z (South), 2: -X (West), 3: -Z (North)

export type CharacterId = 'wayfinder' | 'sylvi' | 'neris' | 'kael' | 'zeph';

export type AbilityId =
  | 'lantern_focus'
  | 'rootcall'
  | 'tidal_pulse'
  | 'ember_spark'
  | 'windstep';

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  title: string;
  unlockRequirementLabel: string;
  unlockAfterStageId: number; // 0 = available from start
  abilityId: AbilityId;
  abilityName: string;
  abilityShortDesc: string;
  abilityLongDesc: string;
  homeWorldId: WorldId;
  accentHex: string;
  secondaryHex: string;
  silhouetteTag: string;
  loreSummary: string;
  defaultColors: {
    cloakColor: number;
    cloakTrimColor: number;
    tunicColor: number;
    skinColor: number;
    accentColor: number;
    toolCoreColor: number;
    toolEmissiveColor: number;
    toolLightColor: number;
    brassTintColor: number;
  };
}

export type WorldId =
  | 'world_1'
  | 'world_2'
  | 'world_3'
  | 'world_4'
  | 'world_5'
  | 'world_6';

export type WorldTheme =
  | 'first_light'
  | 'verdant_reach'
  | 'tidal_expanse'
  | 'emberfall'
  | 'celestial_frontier'
  | 'echo_trials';

export interface WorldBiomePalette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  fogColor: number;
  sunColor: number;
  ambientSky: number;
  ambientGround: number;
  grassTop: number;
  grassRim: number;
  stonePaver: number;
  sandstoneRuin: number;
  cliffRock: number;
  cliffDeep: number;
  waterPool: number;
  woodPlank: number;
  accentEmissive: number;
}

export interface WorldDefinition {
  id: WorldId;
  order: number;
  name: string;
  subtitle: string;
  theme: WorldTheme;
  levelRange: [number, number];
  isBonusWorld?: boolean;
  unlockRuleLabel: string;
  associatedHeroId: CharacterId;
  badgeColor: string;
  description: string;
  biome: WorldBiomePalette;
}

export type TerrainType =
  | 'grass'
  | 'stone'
  | 'ruin'
  | 'wood'
  | 'water'
  | 'moss'
  | 'sand'
  | 'basalt'
  | 'cloud';

export type DecorType =
  | 'tree_pine'
  | 'tree_broad'
  | 'rock_cluster'
  | 'ruin_pillar'
  | 'ruin_arch'
  | 'stone_lantern'
  | 'waterfall'
  | 'pond_lily'
  | 'forge_gear'
  | 'celestial_orrery'
  | 'verdant_arch'
  | 'ancient_root_tree'
  | 'tidal_fountain'
  | 'coral_spire'
  | 'ember_brazier_prop'
  | 'basalt_obelisk'
  | 'sky_obelisk'
  | 'wind_chime'
  | 'echo_monolith';

export interface TileDef {
  x: number;
  z: number;
  elevation: number;
  terrain: TerrainType;
  isStair?: boolean;
  decor?: DecorType;
  decorRotation?: number;
  blocksMovement?: boolean;
  blocksLight?: boolean;
}

export interface RotatingPlatformDef {
  id: string;
  pivotX: number;
  pivotZ: number;
  elevation: number;
  /** Tile offsets relative to pivot at step 0 */
  baseOffsets: Array<{ dx: number; dz: number }>;
  initialStep: Direction;
  /** Optional bank crank location; player can also interact near any platform tile */
  crankPos?: { x: number; z: number };
  label: string;
}

export interface PressureSwitchDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  latch: boolean;
  label: string;
}

export interface GateDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  axis: 'x' | 'z';
  linkedSwitchId?: string;
  linkedSubCrystalId?: string;
  linkedEchoPlateId?: string;
  linkedSynergyId?: string;
  inverted?: boolean;
  blocksLight?: boolean;
}

export interface ElevationPlatformDef {
  id: string;
  x: number;
  z: number;
  lowElevation: number;
  highElevation: number;
  initialHigh: boolean;
  linkedSwitchId?: string;
  label: string;
}

export interface LightEmitterDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  direction: Direction;
}

export interface LightPrismDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  initialDirection: Direction;
  label: string;
}

export interface SubCrystalDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  label: string;
}

export interface CrystalDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  requiresLightBeam?: boolean;
  label: string;
}

export interface PortalDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  facing: Direction;
}

export type HeroNodeKind =
  | 'hidden_rune'
  | 'root_bridge'
  | 'tide_channel'
  | 'ember_brazier'
  | 'wind_vane';

export interface HeroNodeDef {
  id: string;
  kind: HeroNodeKind;
  heroId: CharacterId;
  x: number;
  z: number;
  elevation: number;
  label: string;
  /** Optional tiles created/bridged when this hero node is resonated */
  bridgeTiles?: Array<{ x: number; z: number; elevation: number; terrain?: TerrainType }>;
  /** Optional linked elevation platform boosted by resonance */
  boostsLiftId?: string;
  /** Optional bonus Luma Shards awarded on first resonance in run */
  bonusShards?: number;
}

export interface EchoFragmentDef {
  id: string; // e.g. 'echo_01' .. 'echo_60'
  levelId: number;
  x: number;
  z: number;
  elevation: number;
  title: string;
  subtitle: string;
  loreText: string;
  secretHint?: string;
}

export interface EchoPlateDef {
  id: string;
  x: number;
  z: number;
  elevation: number;
  /** If true, only a summoned Echo (not the live player) activates this plate */
  echoOnly?: boolean;
  /** Optional hold-duration ticks or linked gate/lift */
  label: string;
}

export type SynergyKind = 'root_waterway' | 'steam_forge_lift' | 'wind_rune_relay';

export interface SynergyNodeDef {
  id: string;
  kind: SynergyKind;
  heroA: CharacterId;
  heroB: CharacterId;
  x: number;
  z: number;
  elevation: number;
  label: string;
  bridgeTiles?: Array<{ x: number; z: number; elevation: number; terrain?: TerrainType }>;
  boostsLiftId?: string;
  opensGateId?: string;
}

export interface CustomStageMetadata {
  formatVersion: number;
  engineVersion: string;
  customId?: string;
  authorAlias?: string;
  difficulty?: 'gentle' | 'balanced' | 'master';
  tags?: string[];
  stageHash?: string;
  source?: 'campaign' | 'custom' | 'daily_rift' | 'community';
}

export interface LevelDef {
  id: number;
  worldId?: WorldId;
  stageNumberInWorld?: number;
  isBonusChallenge?: boolean;
  slug: string;
  title: string;
  subtitle: string;
  objectiveDefault: string;
  objectiveCrystalDone: string;
  subareas?: string[];
  spawn: { x: number; z: number; facingAngle: number };
  cameraCenter: { x: number; z: number };
  cameraZoom: number;
  tiles: TileDef[];
  rotatingPlatforms: RotatingPlatformDef[];
  pressureSwitches: PressureSwitchDef[];
  gates: GateDef[];
  elevationPlatforms: ElevationPlatformDef[];
  lightEmitters: LightEmitterDef[];
  lightPrisms: LightPrismDef[];
  subCrystals?: SubCrystalDef[];
  heroNodes?: HeroNodeDef[];
  echoPlates?: EchoPlateDef[];
  synergyNodes?: SynergyNodeDef[];
  echoEnabled?: boolean;
  maxEchoes?: number;
  maxEchoSeconds?: number;
  partyEnabled?: boolean;
  requiredCompanion?: CharacterId;
  customMeta?: CustomStageMetadata;
  echoFragment?: EchoFragmentDef;
  crystal: CrystalDef;
  portal: PortalDef;
}

export interface LightSegment {
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  elevation: number;
  hitType: 'prism' | 'crystal' | 'subcrystal' | 'gate' | 'wall' | 'void';
}

export interface PuzzleRuntimeState {
  levelId: number;
  activeCharacterId: CharacterId;
  rotatingSteps: Record<string, Direction>;
  switchStates: Record<string, boolean>;
  elevationHigh: Record<string, boolean>;
  prismDirections: Record<string, Direction>;
  heroNodesActive: Record<string, boolean>;
  echoCollectedInRun: boolean;
  abilityCooldown: number;
  abilityActiveTimer: number;
  crystalRestored: boolean;
  portalAwakened: boolean;
  lightSegments: LightSegment[];
  litPrismIds: string[];
  litSubCrystalIds: string[];
  crystalLitByBeam: boolean;
  interactionsCount: number;
  elapsedSeconds: number;
  completed: boolean;
  /** Unbound: Echo Engine & Hero Synergy live state */
  echoPlateStates?: Record<string, boolean>;
  synergyNodesActive?: Record<string, boolean>;
  companionCharacterId?: CharacterId | null;
  companionPos?: { x: number; y: number; z: number; facingAngle: number; isMoving: boolean; walkCycle: number };
  companionHoldPosition?: boolean;
  activePartySlot?: 0 | 1;
  /** Internal developer-only overrides; always undefined in normal gameplay */
  debugGateOverrides?: Record<string, 'open' | 'closed'>;
  debugDisabledEmitters?: Record<string, boolean>;
}

export interface PlayerRuntimeState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  facingAngle: number;
  isMoving: boolean;
  walkCycle: number;
  interactTimer: number;
  lastStepTileKey: string | null;
}

export interface InteractionTarget {
  kind:
    | 'switch'
    | 'echo_plate'
    | 'rotating'
    | 'elevation'
    | 'prism'
    | 'crystal'
    | 'portal'
    | 'hero_node'
    | 'synergy_node'
    | 'echo';
  id: string;
  prompt: string;
  worldX: number;
  worldZ: number;
}

export type CalibrationSource = 'playtested' | 'provisional';

export interface MasteryTargetConfig {
  levelId: number;
  actionTarget: number;
  timeTargetSeconds: number;
  calibrationSource: CalibrationSource;
  calibrationNote: string;
}

export interface MasteryEvaluationInput {
  levelId: number;
  completed: boolean;
  clearSeconds: number;
  actionsUsed: number;
  target: MasteryTargetConfig;
}

export interface MasteryEvaluationResult {
  levelId: number;
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  metCompletion: boolean;
  metActionTarget: boolean;
  metTimeTarget: boolean;
  clearSeconds: number;
  actionsUsed: number;
  actionTarget: number;
  timeTargetSeconds: number;
}

export interface LevelMasteryRecord {
  levelId: number;
  completed: boolean;
  bestStars: 0 | 1 | 2 | 3;
  bestTime?: number;
  bestActions?: number;
  completions: number;
  perfectRuns: number;
}

export type CosmeticCategory =
  | 'cloak'
  | 'lantern'
  | 'headwear'
  | 'backpack'
  | 'aura'
  | 'palette'
  | 'set';

export type CosmeticId =
  // Original 7 (preserved identically for save compatibility)
  | 'default_cloak'
  | 'default_lantern'
  | 'mossweave_cloak'
  | 'tideglass_lantern'
  | 'emberglow_lantern'
  | 'celestial_cloak'
  | 'eternal_wayfinder_set'
  // Cloaks & Outfits (+9 = 12 cloaks)
  | 'dawn_mantle'
  | 'verdant_canopy_shawl'
  | 'briarwarden_cape'
  | 'coral_shimmer_wrap'
  | 'abyssal_mariner_coat'
  | 'ashforge_tabard'
  | 'molten_cinder_mantle'
  | 'zephyr_silk_drape'
  | 'echo_weaver_raiment'
  // Lanterns & Tools (+9 = 11 tools)
  | 'sunshard_lantern'
  | 'heartroot_staff'
  | 'canopy_censer'
  | 'pearl_conch_vessel'
  | 'lagoon_astrolabe'
  | 'crucible_brazier_rod'
  | 'pyre_prism_torch'
  | 'gale_chime_wand'
  | 'echo_prism_focus'
  // Headwear (6)
  | 'none_headwear'
  | 'pilgrim_brim_hat'
  | 'sylvan_antler_circlet'
  | 'tidal_coral_crown'
  | 'forge_crest_visor'
  | 'celestial_halo_diadem'
  // Backpacks (6)
  | 'none_backpack'
  | 'leather_scroll_pack'
  | 'botanist_seed_satchel'
  | 'mariner_tank_pack'
  | 'ember_anvil_pack'
  | 'wingframe_glider_pack'
  // Auras & Trails (6)
  | 'none_aura'
  | 'dawnfire_trail'
  | 'sporeleaf_drift'
  | 'foam_droplet_wake'
  | 'cinder_spark_orbit'
  | 'starfall_halo_aura'
  // Color Palettes (6)
  | 'palette_pilgrim_classic'
  | 'palette_emerald_grove'
  | 'palette_cerulean_tide'
  | 'palette_crimson_forge'
  | 'palette_starlight_indigo'
  | 'palette_prismatic_ivory'
  // Complete Sets (+2 = 3 sets)
  | 'warden_of_echoes_set'
  | 'astral_sovereign_set';

export type CosmeticUnlockType = 'starter' | 'stars' | 'echoes' | 'shards' | 'world_clear';

export interface CosmeticItemDef {
  id: CosmeticId;
  name: string;
  category: CosmeticCategory;
  unlockType: CosmeticUnlockType;
  requiredStars: number;
  requiredEchoes?: number;
  shardCost?: number;
  requiredWorldClear?: WorldId;
  unlockLabel: string;
  description: string;
  previewSwatchPrimary: string;
  previewSwatchSecondary: string;
  compatibleCharacters?: CharacterId[]; // undefined = all heroes
}

export interface CosmeticMilestoneDef {
  requiredStars: number;
  cosmeticId: CosmeticId;
  title: string;
  subtitle: string;
}

export interface EquippedCosmetics {
  cloakId: CosmeticId;
  lanternId: CosmeticId;
  headwearId?: CosmeticId;
  backpackId?: CosmeticId;
  auraId?: CosmeticId;
  paletteId?: CosmeticId;
  setId: CosmeticId | null;
}

export type HeadwearVisualStyle = 'none' | 'hood' | 'brim_hat' | 'antlers' | 'coral_crown' | 'forge_visor' | 'halo_diadem';
export type BackpackVisualStyle = 'none' | 'scroll_pack' | 'seed_satchel' | 'mariner_pack' | 'forge_pack' | 'wing_glider';
export type AuraVisualStyle = 'none' | 'dawnfire' | 'sporeleaf' | 'tidal_droplet' | 'cinder_orbit' | 'starfall' | 'eternal';

export interface WayfinderAppearance {
  characterId: CharacterId;
  cloakColor: number;
  cloakTrimColor: number;
  tunicColor: number;
  skinColor: number;
  lanternCoreColor: number;
  lanternEmissiveColor: number;
  lanternLightColor: number;
  brassTintColor: number;
  headwearStyle: HeadwearVisualStyle;
  backpackStyle: BackpackVisualStyle;
  auraStyle: AuraVisualStyle;
  hasCelestialTrim: boolean;
  hasMossBrooch: boolean;
  hasEternalAura: boolean;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: 'journey' | 'mastery' | 'exploration' | 'heroes' | 'collection';
  shardReward: number;
  evaluate: (progress: SaveProgress) => boolean;
}

export interface PersistentStatistics {
  totalPlayTimeSeconds: number;
  totalCompletions: number;
  totalAttempts: number;
  totalPerfectRuns: number;
}

export interface PlayerStatistics {
  totalStars: number;
  maxStars: number;
  completedLevelsCount: number;
  totalLevels: number;
  threeStarLevelsCount: number;
  remainingStars: number;
  remainingThreeStarLevels: number;
  collectedEchoesCount: number;
  totalEchoes: number;
  unlockedHeroesCount: number;
  totalHeroes: number;
  unlockedAchievementsCount: number;
  totalAchievements: number;
  lumaShards: number;
  totalPlayTimeSeconds: number;
  totalCompletions: number;
  totalAttempts: number;
  totalPerfectRuns: number;
}

export interface CompletionSummary {
  levelId: number;
  rating: MasteryEvaluationResult;
  previousBestStars: 0 | 1 | 2 | 3;
  previousBestTime?: number;
  previousBestActions?: number;
  improvedStars: boolean;
  isFirstCompletion: boolean;
  isNewBestTime: boolean;
  isNewBestActions: boolean;
  totalStarsBefore: number;
  totalStarsAfter: number;
  newlyUnlockedMilestones: CosmeticMilestoneDef[];
  echoCollectedInRun: boolean;
  lumaShardsEarned: number;
  newlyUnlockedCharacters: CharacterId[];
  newlyUnlockedAchievements: AchievementDef[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed' | 'unavailable';

export type HubAreaId =
  | 'central_sanctuary'
  | 'world_portals'
  | 'hero_sanctum'
  | 'wardrobe_station'
  | 'echo_archive'
  | 'reward_gallery'
  | 'quest_board'
  | 'npc_district'
  | 'hidden_alcove';

export type HubRestorationTier = 'dormant' | 'awakening' | 'restored';

export type WorldRestorationState = 'unrestored' | 'restored';

export type NpcId =
  | 'orin'
  | 'mera'
  | 'tavi'
  | 'elda'
  | 'rill'
  | 'brann'
  | 'aster'
  | 'sora'
  | 'pip'
  | 'lyra';

export interface StageCheckpoint {
  levelId: number;
  characterId: CharacterId;
  playerX: number;
  playerY: number;
  playerZ: number;
  facingAngle: number;
  rotatingSteps: Record<string, Direction>;
  switchStates: Record<string, boolean>;
  elevationHigh: Record<string, boolean>;
  prismDirections: Record<string, Direction>;
  heroNodesActive: Record<string, boolean>;
  crystalRestored: boolean;
  portalAwakened: boolean;
  echoCollectedInRun: boolean;
  elapsedSeconds: number;
  interactionsCount: number;
  bonusShardsInRun: number;
  timestamp: number;
  version: number;
}

export interface SessionHistoryRecord {
  id: string;
  levelId: number;
  characterId: CharacterId;
  outcome: 'completed' | 'checkpoint_saved' | 'abandoned';
  clearSeconds: number;
  actionsUsed: number;
  starsEarned: 0 | 1 | 2 | 3;
  echoCollected: boolean;
  timestamp: number;
}

export type QuestCategory =
  | 'main_story'
  | 'world_restoration'
  | 'hero_story'
  | 'side_quest'
  | 'hidden_secret';

export type QuestStepKind =
  | 'talk_npc'
  | 'visit_hub_area'
  | 'complete_stage'
  | 'complete_stages_count'
  | 'collect_echo'
  | 'collect_echoes_count'
  | 'collect_shards_total'
  | 'use_ability'
  | 'activate_hero_node'
  | 'interact_mechanisms_count'
  | 'restore_world'
  | 'unlock_hero'
  | 'complete_world';

export interface QuestStepDef {
  id: string;
  description: string;
  kind: QuestStepKind;
  targetId?: string;
  targetNumber?: number;
  worldId?: WorldId;
  heroId?: CharacterId;
  waypointLabel?: string;
  waypointStageId?: number;
  waypointHubArea?: HubAreaId;
}

export interface QuestRewardDef {
  lumaShards?: number;
  titleUnlock?: string;
  loreEntry?: string;
  hubPlaqueId?: string;
  cosmeticId?: CosmeticId;
}

export interface QuestDef {
  id: string;
  title: string;
  category: QuestCategory;
  giverNpcId?: NpcId;
  turnInNpcId?: NpcId;
  heroId?: CharacterId;
  worldId?: WorldId;
  hiddenUntilDiscovered?: boolean;
  summary: string;
  completionNote: string;
  steps: QuestStepDef[];
  reward: QuestRewardDef;
  prerequisiteQuestIds?: string[];
  requiredCompletedStages?: number;
  requiredUnlockedHeroId?: CharacterId;
}

export interface QuestProgressRecord {
  questId: string;
  discovered: boolean;
  started: boolean;
  completed: boolean;
  rewardClaimed: boolean;
  completedSteps: string[];
  claimedAt?: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number;
  cameraZoomOffset: number;
}

export type DailyChallengeType =
  | 'standard'
  | 'limited_action'
  | 'time_attack'
  | 'no_echo'
  | 'hero_ability'
  | 'minimal_movement'
  | 'no_hint';

export interface EchoInputFrame {
  tick: number;
  moveX: -1 | 0 | 1;
  moveZ: -1 | 0 | 1;
  interact?: boolean;
  ability?: boolean;
  switchHero?: boolean;
}

export interface EchoKeyEvent {
  tick: number;
  kind:
    | 'switch'
    | 'echo_plate'
    | 'rotating'
    | 'elevation'
    | 'prism'
    | 'crystal'
    | 'hero_node'
    | 'synergy_node'
    | 'ability';
  targetId: string;
}

export interface EchoRecording {
  id: string;
  slotIndex: number;
  label: string;
  characterId: CharacterId;
  durationTicks: number;
  timeOffsetTicks: number;
  frames: EchoInputFrame[];
  keyEvents: EchoKeyEvent[];
  recordedAt: number;
}

export interface LumaReplayFile {
  format: 'luma-replay';
  formatVersion: 1;
  engineVersion: string;
  stageHash: string;
  stageTitle: string;
  characterId: CharacterId;
  companionId?: CharacterId | null;
  clearSeconds: number;
  actionsUsed: number;
  stars: 0 | 1 | 2 | 3;
  tickRate: 30;
  frames: EchoInputFrame[];
  keyEvents: EchoKeyEvent[];
  createdAt: number;
  challengerAlias?: string;
  verified: boolean;
}

export interface LumaCustomStageFile {
  format: 'luma';
  formatVersion: 1;
  engineVersion: string;
  id: string;
  title: string;
  description: string;
  difficulty: 'gentle' | 'balanced' | 'master';
  authorAlias: string;
  worldTheme: WorldId;
  createdAt: number;
  updatedAt: number;
  stageHash: string;
  level: LevelDef;
  verifiedSolvable: boolean;
  bestClearSeconds?: number;
  bestActions?: number;
  localRating?: number;
  tags?: string[];
}

export interface LumaStagePackFile {
  format: 'luma-pack';
  formatVersion: 1;
  engineVersion: string;
  id: string;
  title: string;
  description: string;
  authorAlias: string;
  stages: LumaCustomStageFile[];
  challengeReplay?: LumaReplayFile;
  createdAt: number;
}

export interface DailyRiftRecord {
  dateKey: string;
  seed: number;
  generatorVersion: string;
  challengeType: DailyChallengeType;
  completed: boolean;
  bestTime?: number;
  bestActions?: number;
  bestStars: 0 | 1 | 2 | 3;
  attempts: number;
  lastPlayedAt?: number;
}

export interface EchoDuelRecord {
  id: string;
  stageHash: string;
  stageTitle: string;
  creatorAlias: string;
  creatorTime: number;
  creatorActions: number;
  challengerTime: number;
  challengerActions: number;
  challengerWon: boolean;
  verifiedReplay: boolean;
  playedAt: number;
}

export interface SaveProgress {
  saveVersion?: number;
  completedLevels: number[];
  highestUnlockedLevel: number;
  bestTimes: Record<number, number>;
  masteryRecords: Record<number, LevelMasteryRecord>;
  unlockedCosmetics: CosmeticId[];
  purchasedCosmetics?: CosmeticId[];
  equippedCosmetics: EquippedCosmetics;
  selectedCharacterId?: CharacterId;
  unlockedCharacters?: CharacterId[];
  equippedByCharacter?: Partial<Record<CharacterId, EquippedCosmetics>>;
  collectedEchoFragments?: string[];
  lumaShards?: number;
  spentLumaShards?: number;
  unlockedAchievements?: string[];
  statistics: PersistentStatistics;
  settings: GameSettings;
  // Living Archipelago (v3) Local-First Persistence
  checkpoints?: Record<number, StageCheckpoint>;
  sessionHistory?: Record<number, SessionHistoryRecord[]>;
  questProgress?: Record<string, QuestProgressRecord>;
  trackedQuestId?: string | null;
  npcTalkedIds?: NpcId[];
  npcFlags?: Record<string, boolean>;
  visitedHubAreas?: HubAreaId[];
  restoredWorlds?: WorldId[];
  unlockedTitles?: string[];
  activeTitle?: string | null;
  abilityUsageCount?: number;
  heroNodesResonatedCount?: number;
  mechanismsActivatedCount?: number;
  unlockedQuestCosmetics?: CosmeticId[];
  lastUpdatedAt?: number;
  // Unbound (v4) Local-First Creator & Challenge State
  customStages?: LumaCustomStageFile[];
  importedPacks?: LumaStagePackFile[];
  savedReplays?: LumaReplayFile[];
  favoriteStageIds?: string[];
  recentlyPlayedCustomIds?: string[];
  dailyRiftRecords?: Record<string, DailyRiftRecord>;
  dailyRiftStreak?: number;
  echoDuelsHistory?: EchoDuelRecord[];
  activePartyHero2?: CharacterId | null;
}

export type GameScreenState = 'title' | 'hub' | 'playing' | 'paused' | 'gameover' | 'forge';
