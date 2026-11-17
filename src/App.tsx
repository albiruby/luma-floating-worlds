import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { audioEngine } from './audio/synth';
import type { DevRuntimeBridge, DevSessionSnapshot } from './dev/debugTypes';
import { DEFAULT_EQUIPPED_COSMETICS } from './game/cosmetics';
import {
  captureStageCheckpoint,
  restoreFromCheckpoint,
} from './game/checkpoints';
import { DailyRiftSpec } from './game/dailyRift';
import {
  ActiveDuelSession,
  buildEchoDuelRecord,
  prepareDuelSession,
} from './game/echoDuels';
import {
  buildLumaReplayFile,
  ECHO_TICK_RATE,
  verifyReplayDeterministically,
} from './game/echoEngine';
import {
  CONVERGENCE_HUB_LEVEL,
  HUB_AREAS,
} from './game/hubLayout';
import { getLevelById, LEVELS } from './game/levels';
import { getTotalStars } from './game/mastery';
import { getNpcById } from './game/npcs';
import {
  clearStageCheckpointInProgress,
  collectEchoInProgress,
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  deleteCustomStageInProgress,
  equipCosmeticInProgress,
  getActiveEquippedCosmetics,
  loadProgressWithMeta,
  purchaseCosmeticInProgress,
  recordAbilityUsedInProgress,
  recordDailyRiftAttemptInProgress,
  recordEchoDuelResultInProgress,
  recordHubAreaVisitedInProgress,
  recordLevelAttempt,
  recordLevelCompletionDetailed,
  recordNpcTalkedInProgress,
  recordRecentlyPlayedCustomInProgress,
  recordSessionSnapshotInProgress,
  restoreDefaultCosmetics,
  saveCustomStageInProgress,
  saveImportedPackInProgress,
  saveProgressWithResult,
  saveReplayInProgress,
  saveStageCheckpointInProgress,
  selectCharacterInProgress,
  setActivePartyCompanionInProgress,
  setActiveTitleInProgress,
  setTrackedQuestInProgress,
  toggleFavoriteStageInProgress,
  validateSaveProgress,
} from './game/progression';
import { getTrackedQuestBannerInfo } from './game/questEvaluator';
import { QUESTS } from './game/quests';
import {
  computeRestoredWorlds,
  getHubRestorationSummary,
  getHubRestorationTier,
} from './game/restoration';
import { createInitialPlayerState, createInitialPuzzleState } from './game/rules';
import {
  deleteAllLocalSaveData,
  restoreFromBackupStorage,
} from './game/saveManager';
import {
  CharacterId,
  CompletionSummary,
  CosmeticId,
  EchoDuelRecord,
  EchoInputFrame,
  EchoKeyEvent,
  GameScreenState,
  GameSettings,
  HubAreaId,
  LevelDef,
  LumaCustomStageFile,
  LumaReplayFile,
  LumaStagePackFile,
  NpcId,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  SaveProgress,
  SaveStatus,
} from './game/types';
import { createInitialForgeState, WorldForgeState } from './game/worldForge';
import { WORLDS } from './game/worlds';
import { EchoControlRuntime, GameScene, HubInteractionTarget, HudSyncSnapshot } from './three/GameScene';
import { CommunityFoundryModal } from './ui/CommunityFoundryModal';
import { DailyRiftModal } from './ui/DailyRiftModal';
import { EchoDuelsModal } from './ui/EchoDuelsModal';
import { GameHud } from './ui/GameHud';
import {
  LevelSelectModal,
  PauseModal,
  SettingsModal,
  VictoryModal,
} from './ui/GameModals';
import { HeroSelectModal } from './ui/HeroSelectModal';
import { HeroUnlockModal } from './ui/HeroUnlockModal';
import { JournalModal } from './ui/JournalModal';
import { NpcChoiceAction, NpcDialogueModal } from './ui/NpcDialogueModal';
import { RewardsGalleryModal } from './ui/RewardsGalleryModal';
import { TitleScreen } from './ui/TitleScreen';
import { WardrobeModal } from './ui/WardrobeModal';
import { WorldForgeEditor } from './ui/WorldForgeEditor';
import { WorldMapModal } from './ui/WorldMapModal';

const LazyDeveloperSuiteRoot = import.meta.env.DEV
  ? React.lazy(() =>
      import('./dev/DeveloperSuiteRoot').then((m) => ({
        default: m.DeveloperSuiteRoot,
      }))
    )
  : null;

function clonePuzzleSnapshot(state: PuzzleRuntimeState): PuzzleRuntimeState {
  return {
    ...state,
    rotatingSteps: { ...state.rotatingSteps },
    switchStates: { ...state.switchStates },
    elevationHigh: { ...state.elevationHigh },
    prismDirections: { ...state.prismDirections },
    lightSegments: state.lightSegments.map((s) => ({ ...s })),
    litPrismIds: [...state.litPrismIds],
    litSubCrystalIds: [...state.litSubCrystalIds],
    heroNodesActive: { ...state.heroNodesActive },
    debugGateOverrides: undefined,
    debugDisabledEmitters: undefined,
  };
}

function getInitialScreenAndLevel(progress: SaveProgress): {
  initialScreen: GameScreenState;
  initialLevelId: number;
} {
  if (typeof window === 'undefined') {
    return { initialScreen: 'title', initialLevelId: 1 };
  }
  const params = new URLSearchParams(window.location.search);
  const autostartParam = params.get('autostart');
  const reqLevel = Number(params.get('level'));
  const validReqLevel =
    Number.isInteger(reqLevel) && reqLevel >= 1 && reqLevel <= LEVELS.length
      ? reqLevel
      : progress.highestUnlockedLevel;

  if (autostartParam === 'hub') {
    return {
      initialScreen: 'hub',
      initialLevelId: validReqLevel,
    };
  }

  return {
    initialScreen: autostartParam === '1' ? 'playing' : 'title',
    initialLevelId: autostartParam === '1' ? validReqLevel : progress.highestUnlockedLevel,
  };
}

export default function App() {
  const initialRead = useMemo(() => loadProgressWithMeta(), []);
  const [progress, setProgress] = useState<SaveProgress>(() => initialRead.progress);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(() =>
    initialRead.storageAvailable ? 'saved' : 'unavailable'
  );
  const boot = useMemo(() => getInitialScreenAndLevel(initialRead.progress), [initialRead.progress]);

  const [screenState, setScreenState] = useState<GameScreenState>(boot.initialScreen);
  const pausedFromScreenRef = useRef<'playing' | 'hub'>(
    boot.initialScreen === 'hub' ? 'hub' : 'playing'
  );
  const screenStateRef = useRef<GameScreenState>(screenState);
  screenStateRef.current = screenState;

  const [currentLevelId, setCurrentLevelId] = useState<number>(boot.initialLevelId);
  const currentLevelIdRef = useRef<number>(currentLevelId);
  currentLevelIdRef.current = currentLevelId;

  const [resetToken, setResetToken] = useState(0);
  const [abilityTriggerToken, setAbilityTriggerToken] = useState(0);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showHeroes, setShowHeroes] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showFoundry, setShowFoundry] = useState(false);
  const [showDailyRift, setShowDailyRift] = useState(false);
  const [showEchoDuels, setShowEchoDuels] = useState(false);
  const [activeNpcId, setActiveNpcId] = useState<NpcId | null>(null);
  const [hubAreaTitle, setHubAreaTitle] = useState<string | null>('Sanctuary Courtyard');

  // Unbound Active Mode State
  const [activeMode, setActiveMode] = useState<'campaign' | 'custom' | 'playtest' | 'daily_rift' | 'duel'>('campaign');
  const [activeCustomStage, setActiveCustomStage] = useState<LumaCustomStageFile | null>(null);
  const [activeRiftSpec, setActiveRiftSpec] = useState<DailyRiftSpec | null>(null);
  const [activeDuelSession, setActiveDuelSession] = useState<ActiveDuelSession | null>(null);
  const [lastDuelRecord, setLastDuelRecord] = useState<EchoDuelRecord | null>(null);
  const [lastRunReplay, setLastRunReplay] = useState<LumaReplayFile | null>(null);
  const [forgeDraftState, setForgeDraftState] = useState<WorldForgeState | undefined>(undefined);

  const [toastBanner, setToastBanner] = useState<string | null>(() =>
    initialRead.recoveredFromBackup
      ? 'Primary save was damaged — automatically restored from your local backup.'
      : null
  );

  const [wardrobeFocusCosmetic, setWardrobeFocusCosmetic] = useState<CosmeticId | undefined>(
    undefined
  );
  const [wardrobeFocusHero, setWardrobeFocusHero] = useState<CharacterId | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);
  const [pendingHeroUnlocks, setPendingHeroUnlocks] = useState<CharacterId[]>([]);

  const [devActive, setDevActive] = useState(false);
  const devActiveRef = useRef(false);
  devActiveRef.current = devActive;
  const [devHeroOverride, setDevHeroOverride] = useState<CharacterId | null>(null);
  const [devRevision, setDevRevision] = useState(0);
  const [devSimulatedNotice, setDevSimulatedNotice] = useState<string | null>(null);
  const devBridgeRef = useRef<DevRuntimeBridge | null>(null);
  const devSessionSnapshotRef = useRef<DevSessionSnapshot | null>(null);
  const bonusShardsInRunRef = useRef(0);

  const echoControlRef = useRef<EchoControlRuntime>({
    recordingSlot: null,
    recordingTicks: 0,
    maxRecordingTicks: 12 * ECHO_TICK_RATE,
    isPlayingBack: false,
    playbackTick: 0,
    slots: [null, null, null],
    slotOffsets: [0, 0, 0],
    anchorPlayer: null,
    anchorPuzzle: null,
    pendingCommand: null,
  });
  const replayFramesRef = useRef<EchoInputFrame[]>([]);
  const replayKeyEventsRef = useRef<EchoKeyEvent[]>([]);

  const showToast = useCallback((message: string) => {
    setToastBanner(message);
  }, []);

  useEffect(() => {
    if (!toastBanner) return;
    const id = window.setTimeout(() => setToastBanner(null), 5000);
    return () => window.clearTimeout(id);
  }, [toastBanner]);

  const effectiveCharacterId: CharacterId =
    devActive && devHeroOverride
      ? devHeroOverride
      : (progress.selectedCharacterId ?? 'wayfinder');

  const effectiveEquippedCosmetics = useMemo(() => {
    if (devActive && devHeroOverride) {
      return progress.equippedByCharacter?.[devHeroOverride] ?? DEFAULT_EQUIPPED_COSMETICS;
    }
    return getActiveEquippedCosmetics(progress);
  }, [devActive, devHeroOverride, progress]);

  const currentLevel = useMemo(() => getLevelById(currentLevelId), [currentLevelId]);
  const isHubMode =
    screenState === 'hub' ||
    (screenState === 'paused' && pausedFromScreenRef.current === 'hub');
  const sceneLevel: LevelDef = useMemo(() => {
    if (isHubMode) return CONVERGENCE_HUB_LEVEL;
    if (activeMode === 'playtest' && forgeDraftState) return forgeDraftState.level;
    if (activeMode === 'daily_rift' && activeRiftSpec) return activeRiftSpec.level;
    if ((activeMode === 'custom' || activeMode === 'duel') && activeCustomStage) {
      return activeCustomStage.level;
    }
    return currentLevel;
  }, [activeCustomStage, activeMode, activeRiftSpec, currentLevel, forgeDraftState, isHubMode]);

  const activeCompanionHeroId: CharacterId | null = useMemo(() => {
    if (isHubMode || activeMode === 'campaign') return null;
    const preferred =
      sceneLevel.requiredCompanion ?? progress.activePartyHero2 ?? null;
    if (!preferred || preferred === effectiveCharacterId) {
      return sceneLevel.partyEnabled
        ? effectiveCharacterId === 'neris'
          ? 'sylvi'
          : 'neris'
        : null;
    }
    return preferred;
  }, [
    activeMode,
    effectiveCharacterId,
    isHubMode,
    progress.activePartyHero2,
    sceneLevel.partyEnabled,
    sceneLevel.requiredCompanion,
  ]);

  const totalStars = useMemo(
    () => getTotalStars(progress.masteryRecords),
    [progress.masteryRecords]
  );

  const restoredWorlds = useMemo(
    () => progress.restoredWorlds ?? computeRestoredWorlds(progress),
    [progress]
  );
  const hubTier = useMemo(() => getHubRestorationTier(progress), [progress]);
  const hubSummary = useMemo(() => getHubRestorationSummary(hubTier), [hubTier]);

  const activeQuestNpcIds = useMemo(() => {
    const ids = new Set<NpcId>();
    const qMap = progress.questProgress ?? {};
    for (const q of QUESTS) {
      const rec = qMap[q.id];
      if (!rec || !rec.discovered || rec.completed) continue;
      const doneSet = new Set(rec.completedSteps);
      for (const step of q.steps) {
        if (!doneSet.has(step.id) && step.kind === 'talk_npc' && step.targetId) {
          ids.add(step.targetId as NpcId);
        }
      }
    }
    return ids;
  }, [progress.questProgress]);

  const trackedQuestBanner = useMemo(() => {
    const info = getTrackedQuestBannerInfo(progress);
    if (!info) return null;
    return {
      title: info.quest.title,
      stepText: info.stepText,
      waypointLabel: info.waypointLabel,
    };
  }, [progress]);

  const puzzleStateRef = useRef(
    createInitialPuzzleState(
      boot.initialScreen === 'hub' ? CONVERGENCE_HUB_LEVEL : currentLevel,
      initialRead.progress.selectedCharacterId ?? 'wayfinder'
    )
  );
  const playerRef = useRef(
    createInitialPlayerState(
      boot.initialScreen === 'hub' ? CONVERGENCE_HUB_LEVEL : currentLevel
    )
  );

  const [hud, setHud] = useState<HudSyncSnapshot>({
    interactPrompt: null,
    crystalRestored: false,
    portalAwakened: false,
    interactionsCount: 0,
    elapsedSeconds: 0,
    abilityCooldown: 0,
    abilityActiveTimer: 0,
    echoCollectedInRun: false,
    heroNodesActivatedCount: 0,
  });

  const commitProgress = useCallback(
    (updater: (prev: SaveProgress) => SaveProgress, persist = true) => {
      setProgress((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;

        if (persist) {
          const prevQuestDone = new Set(
            Object.entries(prev.questProgress ?? {})
              .filter(([, r]) => r.completed)
              .map(([id]) => id)
          );
          const newlyCompletedQuests = QUESTS.filter(
            (q) => next.questProgress?.[q.id]?.completed && !prevQuestDone.has(q.id)
          );
          if (newlyCompletedQuests.length > 0) {
            const first = newlyCompletedQuests[0];
            const bonus = first.reward.lumaShards ? ` (+${first.reward.lumaShards} Shards)` : '';
            setToastBanner(`Quest Complete: ${first.title}${bonus}`);
          }

          const writeRes = saveProgressWithResult(next);
          setSaveStatus(writeRes.status);
          if (writeRes.status === 'failed' && writeRes.errorMessage) {
            setToastBanner(writeRes.errorMessage);
          }
        }
        return next;
      });
    },
    []
  );

  // Sync audio configuration
  useEffect(() => {
    audioEngine.configure(progress.settings.soundEnabled, progress.settings.volume);
  }, [progress.settings.soundEnabled, progress.settings.volume]);

  // Mirror game state machine to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = screenState;
  }, [screenState]);

  // Initial autostart side-effects (stage attempt OR initial hub visit)
  useEffect(() => {
    if (boot.initialScreen === 'playing') {
      commitProgress((prev) => recordLevelAttempt(prev, boot.initialLevelId));
    } else if (boot.initialScreen === 'hub') {
      commitProgress((prev) => recordHubAreaVisitedInProgress(prev, 'npc_district'));
    }
  }, [boot.initialLevelId, boot.initialScreen, commitProgress]);

  const closeAllOverlays = useCallback(() => {
    setShowLevelSelect(false);
    setShowHeroes(false);
    setShowWardrobe(false);
    setShowRewards(false);
    setShowSettings(false);
    setShowJournal(false);
    setShowWorldMap(false);
    setShowFoundry(false);
    setShowDailyRift(false);
    setShowEchoDuels(false);
    setActiveNpcId(null);
  }, []);

  const resetUnboundBuffers = useCallback((lvl: LevelDef) => {
    replayFramesRef.current = [];
    replayKeyEventsRef.current = [];
    echoControlRef.current = {
      recordingSlot: null,
      recordingTicks: 0,
      maxRecordingTicks: (lvl.maxEchoSeconds ?? 12) * ECHO_TICK_RATE,
      isPlayingBack: false,
      playbackTick: 0,
      slots: [null, null, null],
      slotOffsets: [0, 0, 0],
      anchorPlayer: null,
      anchorPuzzle: null,
      pendingCommand: null,
    };
    setLastDuelRecord(null);
    setLastRunReplay(null);
  }, []);

  const resetLevelEntities = useCallback(
    (levelId: number, characterIdOverride?: CharacterId, customLevelOverride?: LevelDef) => {
      const lvl = customLevelOverride ?? (levelId === 0 ? CONVERGENCE_HUB_LEVEL : getLevelById(levelId));
      const charId = characterIdOverride ?? effectiveCharacterId;
      bonusShardsInRunRef.current = 0;
      puzzleStateRef.current = createInitialPuzzleState(lvl, charId);
      playerRef.current = createInitialPlayerState(lvl);
      resetUnboundBuffers(lvl);
      setHud({
        interactPrompt: null,
        crystalRestored: false,
        portalAwakened: false,
        interactionsCount: 0,
        elapsedSeconds: 0,
        abilityCooldown: 0,
        abilityActiveTimer: 0,
        echoCollectedInRun: false,
        heroNodesActivatedCount: 0,
      });
      setResetToken((t) => t + 1);
    },
    [effectiveCharacterId, resetUnboundBuffers]
  );

  const syncHudFromPuzzle = useCallback(() => {
    const ps = puzzleStateRef.current;
    setHud((prev) => ({
      ...prev,
      crystalRestored: ps.crystalRestored,
      portalAwakened: ps.portalAwakened,
      interactionsCount: ps.interactionsCount,
      elapsedSeconds: ps.elapsedSeconds,
      abilityCooldown: ps.abilityCooldown,
      abilityActiveTimer: ps.abilityActiveTimer,
      echoCollectedInRun: ps.echoCollectedInRun,
      heroNodesActivatedCount: Object.values(ps.heroNodesActive ?? {}).filter(Boolean).length,
    }));
  }, []);

  const persistActiveStageCheckpoint = useCallback(
    (recordHistoryOutcome?: 'checkpoint_saved' | 'abandoned') => {
      if (devActiveRef.current) return false;
      const inStage =
        screenStateRef.current === 'playing' ||
        (screenStateRef.current === 'paused' && pausedFromScreenRef.current === 'playing');
      const lvlId = currentLevelIdRef.current;
      const ps = puzzleStateRef.current;
      if (!inStage || lvlId < 1 || ps.completed) return false;

      const checkpoint = captureStageCheckpoint(
        lvlId,
        playerRef.current,
        ps,
        bonusShardsInRunRef.current
      );
      commitProgress((prev) => {
        let next = saveStageCheckpointInProgress(prev, checkpoint);
        if (recordHistoryOutcome) {
          next = recordSessionSnapshotInProgress(
            next,
            lvlId,
            ps.activeCharacterId,
            recordHistoryOutcome,
            ps.elapsedSeconds,
            ps.interactionsCount,
            ps.echoCollectedInRun
          );
        }
        return next;
      });
      return true;
    },
    [commitProgress]
  );

  // Silent mid-run checkpoint autosave on tab hide / page unload
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        persistActiveStageCheckpoint();
      }
    };
    const handlePageHide = () => {
      persistActiveStageCheckpoint();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [persistActiveStageCheckpoint]);

  const enterHub = useCallback(
    (saveStageFirst = true) => {
      audioEngine.playUiClick();
      if (saveStageFirst && activeMode === 'campaign') {
        persistActiveStageCheckpoint('checkpoint_saved');
      }
      closeAllOverlays();
      setActiveMode('campaign');
      setActiveCustomStage(null);
      setActiveRiftSpec(null);
      setActiveDuelSession(null);
      setCompletionSummary(null);
      resetLevelEntities(0);
      setHubAreaTitle('Sanctuary Courtyard');
      pausedFromScreenRef.current = 'hub';
      setScreenState('hub');
      if (!devActiveRef.current) {
        commitProgress((prev) => recordHubAreaVisitedInProgress(prev, 'npc_district'));
      }
    },
    [activeMode, closeAllOverlays, commitProgress, persistActiveStageCheckpoint, resetLevelEntities]
  );

  const startLevel = useCallback(
    (levelId: number, useCheckpoint = false) => {
      audioEngine.playUiClick();
      const lvl = getLevelById(levelId);
      const existingCheckpoint = progress.checkpoints?.[levelId];

      setActiveMode('campaign');
      setActiveCustomStage(null);
      setActiveRiftSpec(null);
      setActiveDuelSession(null);
      setCurrentLevelId(levelId);
      setCompletionSummary(null);
      closeAllOverlays();
      pausedFromScreenRef.current = 'playing';

      if (useCheckpoint && existingCheckpoint) {
        const restored = restoreFromCheckpoint(lvl, existingCheckpoint, effectiveCharacterId);
        puzzleStateRef.current = restored.puzzleState;
        playerRef.current = restored.playerState;
        bonusShardsInRunRef.current = restored.bonusShardsInRun;
        resetUnboundBuffers(lvl);
        syncHudFromPuzzle();
        setResetToken((t) => t + 1);
        showToast(
          `Resumed Stage ${String(levelId).padStart(2, '0')} from local checkpoint (${Math.floor(
            restored.puzzleState.elapsedSeconds
          )}s)`
        );
      } else {
        resetLevelEntities(levelId);
      }

      if (!devActiveRef.current) {
        commitProgress((prev) => {
          let next = prev;
          if (!useCheckpoint && next.checkpoints?.[levelId]) {
            next = clearStageCheckpointInProgress(next, levelId);
          }
          return recordLevelAttempt(next, levelId);
        });
      }
      setScreenState('playing');
    },
    [
      closeAllOverlays,
      commitProgress,
      effectiveCharacterId,
      progress.checkpoints,
      resetLevelEntities,
      resetUnboundBuffers,
      showToast,
      syncHudFromPuzzle,
    ]
  );

  const launchCustomStage = useCallback(
    (stage: LumaCustomStageFile, mode: 'custom' | 'duel' = 'custom', duelReplay?: LumaReplayFile) => {
      audioEngine.playUiClick();
      closeAllOverlays();
      setCompletionSummary(null);
      setActiveCustomStage(stage);
      setActiveRiftSpec(null);
      if (mode === 'duel' && duelReplay) {
        setActiveDuelSession(prepareDuelSession(stage.level, duelReplay));
      } else {
        setActiveDuelSession(null);
      }
      setActiveMode(mode);
      pausedFromScreenRef.current = 'playing';
      resetLevelEntities(stage.level.id, effectiveCharacterId, stage.level);
      if (!devActiveRef.current) {
        commitProgress((prev) => recordRecentlyPlayedCustomInProgress(prev, stage.id));
      }
      setScreenState('playing');
    },
    [closeAllOverlays, commitProgress, effectiveCharacterId, resetLevelEntities]
  );

  const launchDailyRift = useCallback(
    (spec: DailyRiftSpec) => {
      audioEngine.playUiClick();
      closeAllOverlays();
      setCompletionSummary(null);
      setActiveCustomStage(null);
      setActiveDuelSession(null);
      setActiveRiftSpec(spec);
      setActiveMode('daily_rift');
      pausedFromScreenRef.current = 'playing';
      resetLevelEntities(spec.level.id, effectiveCharacterId, spec.level);
      setScreenState('playing');
    },
    [closeAllOverlays, effectiveCharacterId, resetLevelEntities]
  );

  const launchForgePlaytest = useCallback(
    (draft: WorldForgeState) => {
      audioEngine.playUiClick();
      closeAllOverlays();
      setCompletionSummary(null);
      setForgeDraftState(draft);
      setActiveCustomStage(null);
      setActiveRiftSpec(null);
      setActiveDuelSession(null);
      setActiveMode('playtest');
      pausedFromScreenRef.current = 'playing';
      resetLevelEntities(draft.level.id, effectiveCharacterId, draft.level);
      setScreenState('playing');
    },
    [closeAllOverlays, effectiveCharacterId, resetLevelEntities]
  );

  const handleTitleStart = useCallback(() => {
    const targetId = progress.highestUnlockedLevel;
    const hasCp = Boolean(progress.checkpoints?.[targetId]);
    startLevel(targetId, hasCp);
  }, [progress.checkpoints, progress.highestUnlockedLevel, startLevel]);

  const handleQuickRestart = useCallback(() => {
    audioEngine.playUiClick();
    if (isHubMode) {
      resetLevelEntities(0);
      setScreenState('hub');
      return;
    }
    if (activeMode !== 'campaign') {
      resetLevelEntities(sceneLevel.id, effectiveCharacterId, sceneLevel);
      setCompletionSummary(null);
      setScreenState('playing');
      return;
    }
    resetLevelEntities(currentLevelId);
    setCompletionSummary(null);
    if (!devActiveRef.current) {
      commitProgress((prev) => {
        const cleared = clearStageCheckpointInProgress(prev, currentLevelId);
        return recordLevelAttempt(cleared, currentLevelId);
      });
    }
    setScreenState('playing');
  }, [activeMode, commitProgress, currentLevelId, effectiveCharacterId, isHubMode, resetLevelEntities, sceneLevel]);

  const handleTogglePause = useCallback(() => {
    audioEngine.playUiClick();
    closeAllOverlays();
    setScreenState((prev) => {
      if (prev === 'playing') {
        pausedFromScreenRef.current = 'playing';
        return 'paused';
      }
      if (prev === 'hub') {
        pausedFromScreenRef.current = 'hub';
        return 'paused';
      }
      if (prev === 'paused') {
        return pausedFromScreenRef.current;
      }
      return prev;
    });
  }, [closeAllOverlays]);

  const handleToggleMute = useCallback(() => {
    commitProgress((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: !prev.settings.soundEnabled,
      },
    }));
  }, [commitProgress]);

  const handleTriggerAbility = useCallback(() => {
    setAbilityTriggerToken((t) => t + 1);
  }, []);

  const handleHeroAbilityActivated = useCallback(
    (activatedNodeIds: string[], bonusShards: number) => {
      if (bonusShards > 0) {
        bonusShardsInRunRef.current += bonusShards;
      }
      if (!devActiveRef.current) {
        commitProgress((prev) =>
          recordAbilityUsedInProgress(prev, activatedNodeIds.length)
        );
      }
    },
    [commitProgress]
  );

  const handleEchoCollected = useCallback(
    (echoId: string) => {
      if (devActiveRef.current) return;
      commitProgress((prev) => collectEchoInProgress(prev, echoId));
    },
    [commitProgress]
  );

  const handleHubAreaChanged = useCallback(
    (areaId: HubAreaId) => {
      const area = HUB_AREAS.find((a) => a.id === areaId);
      if (area) {
        setHubAreaTitle(area.name);
      }
      if (!devActiveRef.current) {
        commitProgress((prev) => recordHubAreaVisitedInProgress(prev, areaId));
      }
    },
    [commitProgress]
  );

  const handleHubInteract = useCallback(
    (target: HubInteractionTarget) => {
      audioEngine.playUiClick();
      if (target.kind === 'npc') {
        if (!devActiveRef.current) {
          commitProgress((prev) => recordNpcTalkedInProgress(prev, target.npcId));
        }
        setActiveNpcId(target.npcId);
        return;
      }

      if (target.kind === 'portal') {
        const world = WORLDS.find((w) => w.id === target.worldId) ?? WORLDS[0];
        if (world.levelRange[0] > progress.highestUnlockedLevel) {
          showToast(
            `${world.name} opens after completing Stage ${String(world.levelRange[0] - 1).padStart(
              2,
              '0'
            )}. Opening World Map.`
          );
          setShowWorldMap(true);
          return;
        }
        // Pick first incomplete unlocked stage inside this world, or world start
        let targetStage = world.levelRange[0];
        const completedSet = new Set(progress.completedLevels);
        for (
          let s = world.levelRange[0];
          s <= Math.min(world.levelRange[1], progress.highestUnlockedLevel);
          s++
        ) {
          if (!completedSet.has(s)) {
            targetStage = s;
            break;
          }
        }
        startLevel(targetStage, Boolean(progress.checkpoints?.[targetStage]));
        return;
      }

      // Hub station interaction
      switch (target.stationKind) {
        case 'central_crystal':
        case 'world_map':
          setShowWorldMap(true);
          break;
        case 'hero_sanctum':
          setShowHeroes(true);
          break;
        case 'wardrobe':
          setWardrobeFocusCosmetic(undefined);
          setWardrobeFocusHero(effectiveCharacterId);
          setShowWardrobe(true);
          break;
        case 'echo_archive':
        case 'reward_gallery':
          setShowRewards(true);
          break;
        case 'quest_board':
          setShowJournal(true);
          break;
        case 'secret_shrine':
          if (!devActiveRef.current) {
            commitProgress((prev) => recordHubAreaVisitedInProgress(prev, 'hidden_alcove'));
          }
          showToast(
            'Ancient Inscription: "Every island remembers the lantern that kindled it."'
          );
          break;
      }
    },
    [
      commitProgress,
      effectiveCharacterId,
      progress.checkpoints,
      progress.completedLevels,
      progress.highestUnlockedLevel,
      showToast,
      startLevel,
    ]
  );

  const handleNpcDialogueAction = useCallback(
    (action: NpcChoiceAction) => {
      if (!action) return;
      audioEngine.playUiClick();
      setActiveNpcId(null);
      switch (action) {
        case 'open_atlas':
          setShowLevelSelect(true);
          break;
        case 'open_wardrobe':
          setWardrobeFocusCosmetic(undefined);
          setWardrobeFocusHero(effectiveCharacterId);
          setShowWardrobe(true);
          break;
        case 'open_heroes':
          setShowHeroes(true);
          break;
        case 'open_rewards':
          setShowRewards(true);
          break;
        case 'open_journal':
          setShowJournal(true);
          break;
        case 'open_world_map':
          setShowWorldMap(true);
          break;
      }
    },
    [effectiveCharacterId]
  );

  const handleSetNpcFlag = useCallback(
    (flag: string) => {
      if (!activeNpcId || devActiveRef.current) return;
      commitProgress((prev) =>
        recordNpcTalkedInProgress(prev, activeNpcId, { [flag]: true })
      );
    },
    [activeNpcId, commitProgress]
  );

  const handleLevelComplete = useCallback(
    (elapsedSeconds: number, interactionsCount: number) => {
      if (devActiveRef.current) {
        setDevSimulatedNotice(
          `Simulated victory on Stage ${String(currentLevelId).padStart(2, '0')} (${elapsedSeconds.toFixed(1)}s, ${interactionsCount} ACT) — NOT saved to player progression.`
        );
        return;
      }

      // Build & deterministically verify replay snapshot (honest verification!)
      const rawReplay = buildLumaReplayFile({
        level: sceneLevel,
        characterId: effectiveCharacterId,
        companionId: activeCompanionHeroId,
        clearSeconds: elapsedSeconds,
        actionsUsed: interactionsCount,
        stars: 0,
        frames: replayFramesRef.current,
        keyEvents: replayKeyEventsRef.current,
        challengerAlias: 'Wayfinder',
        verified: false,
      });
      const detCheck = verifyReplayDeterministically(sceneLevel, rawReplay);
      const finalReplay: LumaReplayFile = {
        ...rawReplay,
        verified: detCheck.verified,
      };
      setLastRunReplay(finalReplay.frames.length > 0 ? finalReplay : null);

      if (activeMode !== 'campaign') {
        const curStars = getTotalStars(progress.masteryRecords);
        const sandboxSummary: CompletionSummary = {
          levelId: sceneLevel.id,
          rating: {
            levelId: sceneLevel.id,
            completed: true,
            stars: 0,
            metCompletion: true,
            metActionTarget: true,
            metTimeTarget: true,
            clearSeconds: Number(elapsedSeconds.toFixed(2)),
            actionsUsed: interactionsCount,
            timeTargetSeconds: 60,
            actionTarget: 10,
          },
          isFirstCompletion: false,
          improvedStars: false,
          previousBestStars: 0,
          isNewBestTime: false,
          isNewBestActions: false,
          newlyUnlockedMilestones: [],
          newlyUnlockedCharacters: [],
          newlyUnlockedAchievements: [],
          echoCollectedInRun: false,
          lumaShardsEarned: 0,
          totalStarsBefore: curStars,
          totalStarsAfter: curStars,
        };

        if (activeMode === 'playtest') {
          setForgeDraftState((prev) => (prev ? { ...prev, verifiedByPlaytest: true } : prev));
        } else if (activeMode === 'duel' && activeDuelSession) {
          const duelRec = buildEchoDuelRecord({
            session: activeDuelSession,
            challengerTime: elapsedSeconds,
            challengerActions: interactionsCount,
          });
          setLastDuelRecord(duelRec);
          commitProgress((prev) => {
            let next = recordEchoDuelResultInProgress(prev, duelRec);
            if (finalReplay.verified) {
              next = saveReplayInProgress(next, finalReplay);
            }
            return next;
          });
        } else if (activeMode === 'daily_rift' && activeRiftSpec) {
          commitProgress((prev) => {
            let next = recordDailyRiftAttemptInProgress(prev, {
              dateKey: activeRiftSpec.dateKey,
              seed: activeRiftSpec.seed,
              generatorVersion: activeRiftSpec.generatorVersion,
              challengeType: activeRiftSpec.challengeType,
              completed: true,
              clearSeconds: elapsedSeconds,
              actionsUsed: interactionsCount,
            });
            if (finalReplay.verified) {
              next = saveReplayInProgress(next, finalReplay);
            }
            return next;
          });
        } else if (activeMode === 'custom') {
          if (finalReplay.verified) {
            commitProgress((prev) => saveReplayInProgress(prev, finalReplay));
          }
        }

        setCompletionSummary(sandboxSummary);
        setScreenState('gameover');
        return;
      }

      // Standard Campaign Completion (100% preserved)
      commitProgress((prev) => {
        const { progress: next, summary } = recordLevelCompletionDetailed(
          prev,
          currentLevelId,
          elapsedSeconds,
          interactionsCount,
          {
            echoCollectedInRun: puzzleStateRef.current.echoCollectedInRun,
            bonusShards: bonusShardsInRunRef.current,
          }
        );
        setCompletionSummary(summary);
        if (summary.newlyUnlockedCharacters.length > 0) {
          setPendingHeroUnlocks(summary.newlyUnlockedCharacters);
        }
        return next;
      });
      setScreenState('gameover');
    },
    [
      activeCompanionHeroId,
      activeDuelSession,
      activeMode,
      activeRiftSpec,
      commitProgress,
      currentLevelId,
      effectiveCharacterId,
      progress.masteryRecords,
      sceneLevel,
    ]
  );

  const handleVictoryContinue = useCallback(() => {
    if (activeMode === 'custom') {
      setShowFoundry(true);
      setScreenState('title');
      return;
    }
    if (activeMode === 'daily_rift') {
      setShowDailyRift(true);
      setScreenState('title');
      return;
    }
    if (activeMode === 'duel') {
      setShowEchoDuels(true);
      setScreenState('title');
      return;
    }
    const nextLevelId = currentLevelId < LEVELS.length ? currentLevelId + 1 : 1;
    startLevel(nextLevelId);
  }, [activeMode, currentLevelId, startLevel]);

  const handleOpenWardrobe = useCallback(
    (focusCosmeticId?: CosmeticId, focusHeroId?: CharacterId) => {
      audioEngine.playUiClick();
      setWardrobeFocusCosmetic(focusCosmeticId);
      setWardrobeFocusHero(focusHeroId ?? effectiveCharacterId);
      setShowHeroes(false);
      setShowWardrobe(true);
    },
    [effectiveCharacterId]
  );

  const handleSelectCharacter = useCallback(
    (heroId: CharacterId) => {
      commitProgress((prev) => selectCharacterInProgress(prev, heroId));
      puzzleStateRef.current = {
        ...puzzleStateRef.current,
        activeCharacterId: heroId,
      };
    },
    [commitProgress]
  );

  const handleEquipCosmetic = useCallback(
    (cosmeticId: CosmeticId, heroId: CharacterId) => {
      commitProgress((prev) => equipCosmeticInProgress(prev, cosmeticId, heroId));
    },
    [commitProgress]
  );

  const handlePurchaseCosmetic = useCallback(
    (cosmeticId: CosmeticId) => {
      commitProgress((prev) => {
        const { progress: next, purchased } = purchaseCosmeticInProgress(prev, cosmeticId);
        return purchased ? next : prev;
      });
    },
    [commitProgress]
  );

  const handleRestoreDefaultCosmetics = useCallback(
    (heroId: CharacterId) => {
      commitProgress((prev) => restoreDefaultCosmetics(prev, heroId));
    },
    [commitProgress]
  );

  const handleUpdateSettings = useCallback(
    (nextSettings: GameSettings) => {
      commitProgress((prev) => ({ ...prev, settings: nextSettings }));
    },
    [commitProgress]
  );

  const handleImportProgress = useCallback(
    (imported: SaveProgress) => {
      const validated = validateSaveProgress(imported);
      const writeRes = saveProgressWithResult(validated);
      setSaveStatus(writeRes.status);
      setProgress(validated);
      setCompletionSummary(null);
      setPendingHeroUnlocks([]);
      setCurrentLevelId(validated.highestUnlockedLevel);
      resetLevelEntities(
        screenStateRef.current === 'hub' ? 0 : validated.highestUnlockedLevel,
        validated.selectedCharacterId
      );
      showToast('Imported local save successfully.');
    },
    [resetLevelEntities, showToast]
  );

  const handleRestoreBackup = useCallback((): { ok: boolean; error?: string } => {
    const res = restoreFromBackupStorage(validateSaveProgress);
    if (!res.ok || !res.progress) {
      return { ok: false, error: res.error };
    }
    setSaveStatus('saved');
    setProgress(res.progress);
    setCompletionSummary(null);
    setPendingHeroUnlocks([]);
    setCurrentLevelId(res.progress.highestUnlockedLevel);
    resetLevelEntities(
      screenStateRef.current === 'hub' ? 0 : res.progress.highestUnlockedLevel,
      res.progress.selectedCharacterId
    );
    showToast('Restored local backup snapshot.');
    return { ok: true };
  }, [resetLevelEntities, showToast]);

  const handleResetProgress = useCallback(() => {
    const fresh = validateSaveProgress({
      ...DEFAULT_PROGRESS,
      settings: { ...DEFAULT_SETTINGS },
    });
    const writeRes = saveProgressWithResult(fresh);
    setSaveStatus(writeRes.status);
    setProgress(fresh);
    setCompletionSummary(null);
    setPendingHeroUnlocks([]);
    setCurrentLevelId(1);
    resetLevelEntities(1, 'wayfinder');
    closeAllOverlays();
    setScreenState('title');
  }, [closeAllOverlays, resetLevelEntities]);

  const handleDeleteAllLocalData = useCallback(() => {
    deleteAllLocalSaveData();
    const fresh = validateSaveProgress({
      ...DEFAULT_PROGRESS,
      settings: { ...DEFAULT_SETTINGS },
    });
    setSaveStatus('idle');
    setProgress(fresh);
    setCompletionSummary(null);
    setPendingHeroUnlocks([]);
    setCurrentLevelId(1);
    resetLevelEntities(1, 'wayfinder');
    closeAllOverlays();
    setScreenState('title');
    showToast('All local LUMA save keys erased from this browser.');
  }, [closeAllOverlays, resetLevelEntities, showToast]);

  // Developer Suite handlers
  const handleToggleDeveloperMode = useCallback(
    (nextActive: boolean) => {
      if (!import.meta.env.DEV) return;
      if (nextActive && !devActiveRef.current) {
        devSessionSnapshotRef.current = {
          capturedAt: Date.now(),
          screenState,
          levelId: isHubMode ? 0 : currentLevelId,
          puzzleState: clonePuzzleSnapshot(puzzleStateRef.current),
          playerState: { ...playerRef.current },
          progressSnapshot: progress,
        };
        setDevSimulatedNotice(null);
        closeAllOverlays();
        if (screenState === 'title' || screenState === 'gameover') {
          resetLevelEntities(currentLevelId);
          setScreenState('playing');
        }
        setDevActive(true);
        setDevRevision((r) => r + 1);
      } else if (!nextActive && devActiveRef.current) {
        const snap = devSessionSnapshotRef.current;
        if (devBridgeRef.current) {
          devBridgeRef.current.isActive = false;
        }
        setDevActive(false);
        setDevHeroOverride(null);
        setDevSimulatedNotice(null);
        if (snap) {
          if (snap.progressSnapshot) {
            setProgress(snap.progressSnapshot);
          }
          if (snap.levelId >= 1) {
            setCurrentLevelId(snap.levelId);
          }
          puzzleStateRef.current = clonePuzzleSnapshot(snap.puzzleState);
          playerRef.current = { ...snap.playerState };
          setScreenState(snap.screenState);
          syncHudFromPuzzle();
          setResetToken((t) => t + 1);
        }
        devSessionSnapshotRef.current = null;
        setDevRevision((r) => r + 1);
      }
    },
    [closeAllOverlays, currentLevelId, isHubMode, progress, resetLevelEntities, screenState, syncHudFromPuzzle]
  );

  const handleLoadLevelDev = useCallback(
    (levelId: number) => {
      if (levelId === 0) {
        enterHub(false);
        setDevRevision((r) => r + 1);
        return;
      }
      setCurrentLevelId(levelId);
      resetLevelEntities(levelId);
      setCompletionSummary(null);
      setDevSimulatedNotice(null);
      pausedFromScreenRef.current = 'playing';
      setScreenState('playing');
      setDevRevision((r) => r + 1);
    },
    [enterHub, resetLevelEntities]
  );

  const handleSetHeroDev = useCallback(
    (heroId: CharacterId) => {
      setDevHeroOverride(heroId);
      puzzleStateRef.current = {
        ...puzzleStateRef.current,
        activeCharacterId: heroId,
      };
      syncHudFromPuzzle();
      setDevRevision((r) => r + 1);
    },
    [syncHudFromPuzzle]
  );

  const handleApplyPuzzleStateDev = useCallback(
    (next: PuzzleRuntimeState) => {
      puzzleStateRef.current = next;
      syncHudFromPuzzle();
      setDevRevision((r) => r + 1);
    },
    [syncHudFromPuzzle]
  );

  const handleApplyPlayerStateDev = useCallback((next: PlayerRuntimeState) => {
    playerRef.current = next;
    setDevRevision((r) => r + 1);
  }, []);

  const handleForceObjectiveCompleteDev = useCallback(() => {
    const ps = puzzleStateRef.current;
    puzzleStateRef.current = {
      ...ps,
      crystalRestored: true,
      portalAwakened: true,
      completed: true,
    };
    syncHudFromPuzzle();
    setDevRevision((r) => r + 1);
    setDevSimulatedNotice(
      `Simulated completion on Stage ${String(currentLevelId).padStart(2, '0')} (${ps.elapsedSeconds.toFixed(1)}s, ${ps.interactionsCount} ACT) — NOT saved to player progression.`
    );
  }, [currentLevelId, syncHudFromPuzzle]);

  const anyModalOpen =
    showLevelSelect ||
    showHeroes ||
    showWardrobe ||
    showRewards ||
    showSettings ||
    showJournal ||
    showWorldMap ||
    showFoundry ||
    showDailyRift ||
    showEchoDuels ||
    Boolean(activeNpcId);

  useEffect(() => {
    if (!anyModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Escape') return;
      e.preventDefault();
      if (activeNpcId) setActiveNpcId(null);
      else if (showSettings) setShowSettings(false);
      else if (showFoundry) setShowFoundry(false);
      else if (showDailyRift) setShowDailyRift(false);
      else if (showEchoDuels) setShowEchoDuels(false);
      else if (showWardrobe) setShowWardrobe(false);
      else if (showHeroes) setShowHeroes(false);
      else if (showRewards) setShowRewards(false);
      else if (showJournal) setShowJournal(false);
      else if (showWorldMap) setShowWorldMap(false);
      else if (showLevelSelect) setShowLevelSelect(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeNpcId,
    anyModalOpen,
    showDailyRift,
    showEchoDuels,
    showFoundry,
    showHeroes,
    showJournal,
    showLevelSelect,
    showRewards,
    showSettings,
    showWardrobe,
    showWorldMap,
  ]);

  const activeEchoPreviouslyCollected = Boolean(
    !isHubMode &&
      activeMode === 'campaign' &&
      currentLevel.echoFragment &&
      (progress.collectedEchoFragments ?? []).includes(currentLevel.echoFragment.id)
  );
  const currentUnlockToShow =
    !anyModalOpen && screenState !== 'gameover' && pendingHeroUnlocks.length > 0
      ? pendingHeroUnlocks[0]
      : null;

  const activeNpc = useMemo(
    () => (activeNpcId ? getNpcById(activeNpcId) : null),
    [activeNpcId]
  );

  return (
    <main className="relative w-full h-full overflow-hidden">
      {/* Persistent 3D WebGL Diorama Viewport */}
      {screenState !== 'forge' && (
        <GameScene
          level={sceneLevel}
          screenState={screenState}
          cameraZoomOffset={progress.settings.cameraZoomOffset}
          equippedCosmetics={effectiveEquippedCosmetics}
          activeCharacterId={effectiveCharacterId}
          companionCharacterId={activeCompanionHeroId}
          abilityTriggerToken={abilityTriggerToken}
          resetToken={resetToken}
          puzzleStateRef={puzzleStateRef}
          playerRef={playerRef}
          echoControlRef={echoControlRef}
          replayFramesRef={replayFramesRef}
          replayKeyEventsRef={replayKeyEventsRef}
          activeDuelSession={activeDuelSession}
          devBridgeRef={import.meta.env.DEV ? devBridgeRef : undefined}
          devRevision={devRevision}
          pauseLoop={anyModalOpen}
          hubTier={hubTier}
          restoredWorlds={restoredWorlds}
          highestUnlockedLevel={progress.highestUnlockedLevel}
          activeQuestNpcIds={activeQuestNpcIds}
          talkedNpcIds={progress.npcTalkedIds ?? []}
          onHubAreaChanged={handleHubAreaChanged}
          onHubInteract={handleHubInteract}
          onHudSync={setHud}
          onLevelComplete={handleLevelComplete}
          onHeroAbilityActivated={handleHeroAbilityActivated}
          onEchoCollected={handleEchoCollected}
          onTogglePause={handleTogglePause}
          onQuickRestart={handleQuickRestart}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Ephemeral Notification Banner */}
      {toastBanner && (
        <div
          role="status"
          data-testid="luma-toast-banner"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md rounded-lg bg-[#112028] border-2 border-[#ebb652] px-4 py-2 text-xs font-semibold text-[#f6eedb] shadow-xl flex items-center gap-3"
        >
          <span>{toastBanner}</span>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            className="text-[#ebb652] hover:text-white font-bold cursor-pointer"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Title Screen */}
      {screenState === 'title' && !anyModalOpen && (
        <TitleScreen
          hasSavedProgress={progress.completedLevels.length > 0}
          hasActiveCheckpoint={Boolean(progress.checkpoints?.[progress.highestUnlockedLevel])}
          totalStars={totalStars}
          completedCount={progress.completedLevels.length}
          collectedEchoesCount={(progress.collectedEchoFragments ?? []).length}
          lumaShards={progress.lumaShards ?? 0}
          restoredWorldsCount={restoredWorlds.length}
          activeTitle={progress.activeTitle}
          saveStatus={saveStatus}
          activeCharacterId={effectiveCharacterId}
          onStart={handleTitleStart}
          onEnterHub={() => enterHub(false)}
          onOpenWorldMap={() => {
            audioEngine.playUiClick();
            setShowWorldMap(true);
          }}
          onOpenJournal={() => {
            audioEngine.playUiClick();
            setShowJournal(true);
          }}
          onOpenLevels={() => {
            audioEngine.playUiClick();
            setShowLevelSelect(true);
          }}
          onOpenHeroes={() => {
            audioEngine.playUiClick();
            setShowHeroes(true);
          }}
          onOpenWardrobe={() => handleOpenWardrobe()}
          onOpenRewards={() => {
            audioEngine.playUiClick();
            setShowRewards(true);
          }}
          onOpenSettings={() => {
            audioEngine.playUiClick();
            setShowSettings(true);
          }}
          onOpenWorldForge={() => {
            audioEngine.playUiClick();
            setForgeDraftState((prev) => prev ?? createInitialForgeState());
            setScreenState('forge');
          }}
          onOpenFoundry={() => {
            audioEngine.playUiClick();
            setShowFoundry(true);
          }}
          onOpenDailyRift={() => {
            audioEngine.playUiClick();
            setShowDailyRift(true);
          }}
          onOpenEchoDuels={() => {
            audioEngine.playUiClick();
            setShowEchoDuels(true);
          }}
        />
      )}

      {/* World Forge Full-Screen 3D Editor */}
      {screenState === 'forge' && (
        <WorldForgeEditor
          initialState={forgeDraftState}
          onSaveStage={(stage, nextState) => {
            setForgeDraftState(nextState);
            commitProgress((prev) => saveCustomStageInProgress(prev, stage));
            showToast(`Saved "${stage.title}" to Community Foundry.`);
          }}
          onTestPlay={(draft) => launchForgePlaytest(draft)}
          onExit={() => setScreenState('title')}
        />
      )}

      {/* Playing / Hub HUD */}
      {(screenState === 'playing' || screenState === 'hub') && (
        <GameHud
          level={sceneLevel}
          hud={hud}
          activeCharacterId={effectiveCharacterId}
          echoPreviouslyCollected={activeEchoPreviouslyCollected}
          lumaShards={progress.lumaShards ?? 0}
          muted={!progress.settings.soundEnabled}
          hideBottomHints={devActive}
          isHubMode={screenState === 'hub'}
          hubAreaTitle={hubAreaTitle}
          hubTierLabel={hubSummary.badge}
          trackedQuest={trackedQuestBanner}
          saveStatus={saveStatus}
          activePlayerTitle={progress.activeTitle}
          activeMode={activeMode}
          riftChallengeCode={activeRiftSpec?.challengeCode}
          duelCreatorAlias={activeDuelSession?.creatorAlias}
          duelCreatorTime={activeDuelSession?.creatorTime}
          echoControlRef={echoControlRef}
          companionHeroId={activeCompanionHeroId}
          onSelectCompanionHero={(hero2) => {
            commitProgress((prev) => setActivePartyCompanionInProgress(prev, hero2));
          }}
          onSwapPartyHero={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
          }}
          onToggleCompanionHold={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' }));
          }}
          onReturnToForge={() => {
            audioEngine.playUiClick();
            setScreenState('forge');
          }}
          onOpenJournal={() => {
            audioEngine.playUiClick();
            setShowJournal(true);
          }}
          onOpenWorldMap={() => {
            audioEngine.playUiClick();
            setShowWorldMap(true);
          }}
          onEnterHub={() => enterHub(true)}
          onTriggerAbility={handleTriggerAbility}
          onToggleMute={handleToggleMute}
          onRestart={handleQuickRestart}
          onPause={handleTogglePause}
        />
      )}

      {/* Pause Modal */}
      {screenState === 'paused' && !anyModalOpen && (
        <PauseModal
          level={sceneLevel}
          isHubMode={pausedFromScreenRef.current === 'hub'}
          activeMode={activeMode}
          onReturnToForge={() => {
            audioEngine.playUiClick();
            setScreenState('forge');
          }}
          onResume={() => {
            audioEngine.playUiClick();
            setScreenState(pausedFromScreenRef.current);
          }}
          onRestart={handleQuickRestart}
          onSaveCheckpointAndExitToHub={() => {
            persistActiveStageCheckpoint('checkpoint_saved');
            enterHub(false);
          }}
          onOpenWorldMap={() => {
            audioEngine.playUiClick();
            setShowWorldMap(true);
          }}
          onOpenJournal={() => {
            audioEngine.playUiClick();
            setShowJournal(true);
          }}
          onOpenLevels={() => {
            audioEngine.playUiClick();
            setShowLevelSelect(true);
          }}
          onOpenHeroes={() => {
            audioEngine.playUiClick();
            setShowHeroes(true);
          }}
          onOpenWardrobe={() => handleOpenWardrobe()}
          onOpenRewards={() => {
            audioEngine.playUiClick();
            setShowRewards(true);
          }}
          onOpenSettings={() => {
            audioEngine.playUiClick();
            setShowSettings(true);
          }}
          onReturnTitle={() => {
            audioEngine.playUiClick();
            if (pausedFromScreenRef.current === 'playing' && activeMode === 'campaign') {
              persistActiveStageCheckpoint('checkpoint_saved');
            }
            setActiveMode('campaign');
            resetLevelEntities(currentLevelId);
            setScreenState('title');
          }}
        />
      )}

      {/* Victory / Crystal Restored Modal */}
      {screenState === 'gameover' && completionSummary && !anyModalOpen && (
        <VictoryModal
          level={sceneLevel}
          summary={completionSummary}
          hasNextLevel={activeMode === 'campaign' && currentLevelId < LEVELS.length}
          activeMode={activeMode}
          duelResult={lastDuelRecord}
          lastRunReplay={lastRunReplay}
          onReturnToForge={() => {
            audioEngine.playUiClick();
            setScreenState('forge');
          }}
          onContinue={handleVictoryContinue}
          onReplay={handleQuickRestart}
          onOpenLevels={() => {
            audioEngine.playUiClick();
            setShowLevelSelect(true);
          }}
          onOpenWardrobe={(cosmeticId) => handleOpenWardrobe(cosmeticId)}
          onReturnTitle={() => {
            audioEngine.playUiClick();
            setActiveMode('campaign');
            resetLevelEntities(currentLevelId);
            setScreenState('title');
          }}
        />
      )}

      {/* Companion Hero Unlock Modal */}
      {currentUnlockToShow && (
        <HeroUnlockModal
          characterId={currentUnlockToShow}
          onSwitchHero={(heroId) => {
            handleSelectCharacter(heroId);
            setPendingHeroUnlocks((prev) => prev.slice(1));
          }}
          onClose={() => setPendingHeroUnlocks((prev) => prev.slice(1))}
        />
      )}

      {/* NPC Dialogue Modal */}
      {activeNpc && (
        <NpcDialogueModal
          npc={activeNpc}
          progress={progress}
          onTriggerAction={handleNpcDialogueAction}
          onSetFlag={handleSetNpcFlag}
          onClose={() => {
            audioEngine.playUiClick();
            setActiveNpcId(null);
          }}
        />
      )}

      {/* Living Archipelago 6-Tab Journal Modal */}
      {showJournal && (
        <JournalModal
          progress={progress}
          onTrackQuest={(questId) => {
            commitProgress((prev) => setTrackedQuestInProgress(prev, questId));
          }}
          onSelectTitle={(title) => {
            commitProgress((prev) => setActiveTitleInProgress(prev, title));
          }}
          onJumpToStage={(stageId) => {
            startLevel(stageId, Boolean(progress.checkpoints?.[stageId]));
          }}
          onClose={() => {
            audioEngine.playUiClick();
            setShowJournal(false);
          }}
        />
      )}

      {/* Connected Interactive World Map Modal */}
      {showWorldMap && (
        <WorldMapModal
          progress={progress}
          currentLevelId={currentLevelId}
          isInHub={isHubMode}
          onEnterHub={() => enterHub(true)}
          onSelectStage={(stageId, useCheckpoint) => startLevel(stageId, useCheckpoint)}
          onOpenAtlas={() => {
            setShowWorldMap(false);
            setShowLevelSelect(true);
          }}
          onClose={() => {
            audioEngine.playUiClick();
            setShowWorldMap(false);
          }}
        />
      )}

      {/* Level Selection / 6-World Atlas Modal */}
      {showLevelSelect && !showWardrobe && (
        <LevelSelectModal
          progress={progress}
          currentLevelId={currentLevelId}
          onSelectLevel={startLevel}
          onOpenWardrobe={() => handleOpenWardrobe()}
          onClose={() => {
            audioEngine.playUiClick();
            setShowLevelSelect(false);
          }}
        />
      )}

      {/* Heroes Roster & Ability Modal */}
      {showHeroes && (
        <HeroSelectModal
          progress={progress}
          onSelectCharacter={handleSelectCharacter}
          onOpenWardrobe={(heroId) => handleOpenWardrobe(undefined, heroId)}
          onClose={() => {
            audioEngine.playUiClick();
            setShowHeroes(false);
          }}
        />
      )}

      {/* Wayfinder Wardrobe & Shard Shop Modal */}
      {showWardrobe && (
        <WardrobeModal
          progress={progress}
          initialCosmeticId={wardrobeFocusCosmetic}
          initialHeroId={wardrobeFocusHero}
          onEquipCosmetic={handleEquipCosmetic}
          onPurchaseCosmetic={handlePurchaseCosmetic}
          onRestoreDefaults={handleRestoreDefaultCosmetics}
          onClose={() => {
            audioEngine.playUiClick();
            setShowWardrobe(false);
          }}
        />
      )}

      {/* Echo Codex & Trophies Modal */}
      {showRewards && (
        <RewardsGalleryModal
          progress={progress}
          onClose={() => {
            audioEngine.playUiClick();
            setShowRewards(false);
          }}
        />
      )}

      {/* Settings & Local Save Manager Modal */}
      {showSettings && (
        <SettingsModal
          settings={progress.settings}
          progress={progress}
          onUpdateSettings={handleUpdateSettings}
          onImportProgress={handleImportProgress}
          onRestoreBackup={handleRestoreBackup}
          onResetProgress={handleResetProgress}
          onDeleteAllLocalData={handleDeleteAllLocalData}
          onClose={() => {
            audioEngine.playUiClick();
            setShowSettings(false);
          }}
        />
      )}

      {/* Community Foundry Browser */}
      {showFoundry && (
        <CommunityFoundryModal
          progress={progress}
          onPlayCustomStage={(stage) => launchCustomStage(stage, 'custom')}
          onEditInForge={(stage) => {
            setShowFoundry(false);
            setForgeDraftState(createInitialForgeState(stage));
            setScreenState('forge');
          }}
          onOpenNewForge={() => {
            setShowFoundry(false);
            setForgeDraftState(createInitialForgeState());
            setScreenState('forge');
          }}
          onStartDuel={(stage, replay) => launchCustomStage(stage, 'duel', replay)}
          onToggleFavorite={(stageId) =>
            commitProgress((prev) => toggleFavoriteStageInProgress(prev, stageId))
          }
          onImportStage={(stage) =>
            commitProgress((prev) => saveCustomStageInProgress(prev, stage))
          }
          onImportPack={(pack: LumaStagePackFile) =>
            commitProgress((prev) => saveImportedPackInProgress(prev, pack))
          }
          onImportReplay={(replay) =>
            commitProgress((prev) => saveReplayInProgress(prev, replay))
          }
          onDeleteCustomStage={(stageId) =>
            commitProgress((prev) => deleteCustomStageInProgress(prev, stageId))
          }
          onClose={() => {
            audioEngine.playUiClick();
            setShowFoundry(false);
          }}
        />
      )}

      {/* Daily Rift Modal */}
      {showDailyRift && (
        <DailyRiftModal
          progress={progress}
          onStartRift={(spec) => launchDailyRift(spec)}
          onClose={() => {
            audioEngine.playUiClick();
            setShowDailyRift(false);
          }}
        />
      )}

      {/* Echo Duels Modal */}
      {showEchoDuels && (
        <EchoDuelsModal
          progress={progress}
          onStartDuel={(stage, replay) => launchCustomStage(stage, 'duel', replay)}
          onImportReplay={(replay) =>
            commitProgress((prev) => saveReplayInProgress(prev, replay))
          }
          onClose={() => {
            audioEngine.playUiClick();
            setShowEchoDuels(false);
          }}
        />
      )}

      {/* Internal Development-Only Developer Suite */}
      {import.meta.env.DEV && LazyDeveloperSuiteRoot && (
        <Suspense fallback={null}>
          <LazyDeveloperSuiteRoot
            active={devActive}
            level={sceneLevel}
            isHubMode={isHubMode}
            progress={progress}
            activeCharacterId={effectiveCharacterId}
            puzzleStateRef={puzzleStateRef}
            playerRef={playerRef}
            devBridgeRef={devBridgeRef}
            sessionSnapshot={devSessionSnapshotRef.current}
            simulatedNotice={devSimulatedNotice}
            onDismissSimulatedNotice={() => setDevSimulatedNotice(null)}
            onToggleDeveloperMode={handleToggleDeveloperMode}
            onLoadLevelDev={handleLoadLevelDev}
            onSetHeroDev={handleSetHeroDev}
            onTriggerAbilityDev={handleTriggerAbility}
            onApplyPuzzleStateDev={handleApplyPuzzleStateDev}
            onApplyPlayerStateDev={handleApplyPlayerStateDev}
            onForceObjectiveCompleteDev={handleForceObjectiveCompleteDev}
            onTriggerSimulatedWinNotice={(sec, act) =>
              setDevSimulatedNotice(
                `Simulated victory on Stage ${String(currentLevelId).padStart(2, '0')} (${sec.toFixed(1)}s, ${act} ACT) — NOT saved to player progression.`
              )
            }
            onOpenNpcDialogueDev={(npcId) => setActiveNpcId(npcId)}
            onPreviewProgressPatchDev={(next) => setProgress(next)}
            onBumpDevRevision={() => setDevRevision((r) => r + 1)}
          />
        </Suspense>
      )}
    </main>
  );
}
