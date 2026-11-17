import React, { useCallback, useEffect, useState } from 'react';
import { refreshDerivedPuzzleState } from '../game/rules';
import {
  CharacterId,
  Direction,
  LevelDef,
  NpcId,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  SaveProgress,
} from '../game/types';
import { appendDevEvent, createDevEvent } from './DebugEvents';
import {
  forceCrystalState,
  forceGateOverride,
  forceSubCrystalLit,
  forceSwitchState,
  resetAllLightOverrides,
  resetElevationPlatform,
  resetPlayerToSpawn,
  resetPuzzleToInitial,
  resetRotatingPlatform,
  resetSwitchState,
  setElevationPlatformState,
  setEmitterEnabled,
  setPrismDirection,
  setRotatingPlatformStep,
  teleportPlayerToTile,
} from './debugAdapter';
import {
  DEFAULT_GOD_MODE,
  DEFAULT_RENDERING_DEBUG,
  DEFAULT_WORLD_OVERLAYS,
  DevEventCategory,
  DevEventEntry,
  DevRuntimeBridge,
  DevSessionSnapshot,
  DevTabId,
  GodModeSettings,
  QASuiteId,
  QASuiteReport,
  RenderDiagnosticsSnapshot,
  RenderingDebugSettings,
  WorldOverlayFlags,
} from './debugTypes';
import { DeveloperConsole } from './DeveloperConsole';
import { executeQASuite } from './qaRunner';

export interface DeveloperSuiteRootProps {
  active: boolean;
  level: LevelDef;
  isHubMode?: boolean;
  progress?: SaveProgress;
  activeCharacterId: CharacterId;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  playerRef: React.MutableRefObject<PlayerRuntimeState>;
  devBridgeRef: React.MutableRefObject<DevRuntimeBridge | null>;
  sessionSnapshot: DevSessionSnapshot | null;
  simulatedNotice: string | null;
  onDismissSimulatedNotice: () => void;
  onToggleDeveloperMode: (next: boolean) => void;
  onLoadLevelDev: (levelId: number) => void;
  onSetHeroDev: (heroId: CharacterId) => void;
  onTriggerAbilityDev: () => void;
  onApplyPuzzleStateDev: (next: PuzzleRuntimeState) => void;
  onApplyPlayerStateDev: (next: PlayerRuntimeState) => void;
  onForceObjectiveCompleteDev: () => void;
  onTriggerSimulatedWinNotice: (elapsedSeconds: number, interactionsCount: number) => void;
  onOpenNpcDialogueDev?: (npcId: NpcId) => void;
  onPreviewProgressPatchDev?: (next: SaveProgress) => void;
  onBumpDevRevision?: () => void;
}

export const DeveloperSuiteRoot: React.FC<DeveloperSuiteRootProps> = ({
  active,
  level,
  isHubMode = false,
  progress,
  activeCharacterId,
  puzzleStateRef,
  playerRef,
  devBridgeRef,
  sessionSnapshot,
  simulatedNotice,
  onDismissSimulatedNotice,
  onToggleDeveloperMode,
  onLoadLevelDev,
  onSetHeroDev,
  onTriggerAbilityDev,
  onApplyPuzzleStateDev,
  onApplyPlayerStateDev,
  onForceObjectiveCompleteDev,
  onTriggerSimulatedWinNotice,
  onOpenNpcDialogueDev,
  onPreviewProgressPatchDev,
  onBumpDevRevision,
}) => {
  const [activeTab, setActiveTab] = useState<DevTabId>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [godMode, setGodMode] = useState<GodModeSettings>({ ...DEFAULT_GOD_MODE });
  const [overlays, setOverlays] = useState<WorldOverlayFlags>({ ...DEFAULT_WORLD_OVERLAYS });
  const [rendering, setRendering] = useState<RenderingDebugSettings>({ ...DEFAULT_RENDERING_DEBUG });
  const [freeCamPanDelta, setFreeCamPanDelta] = useState({ x: 0, y: 0, z: 0 });
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [pickObjectMode, setPickObjectMode] = useState(false);
  const [diagnostics, setDiagnostics] = useState<RenderDiagnosticsSnapshot | null>(null);
  const [qaReport, setQaReport] = useState<QASuiteReport | null>(null);
  const [events, setEvents] = useState<DevEventEntry[]>([]);
  const [, setUiRefreshTick] = useState(0);

  const pushEvent = useCallback(
    (category: DevEventCategory, type: string, details: string, objectId?: string) => {
      setEvents((prev) =>
        appendDevEvent(prev, createDevEvent(category, type, level.id, details, objectId))
      );
    },
    [level.id]
  );

  // Keyboard shortcut Ctrl + Shift + G (dev-only)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyG') {
        e.preventDefault();
        e.stopPropagation();
        onToggleDeveloperMode(!active);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [active, onToggleDeveloperMode]);

  // Log entry/exit transitions & reset transient debug overrides when exiting
  useEffect(() => {
    if (active) {
      pushEvent(
        'session',
        'DEV_SESSION_ENTERED',
        `Entered Developer Mode at Level ${level.id} (save isolation enabled)`
      );
    } else {
      setGodMode({ ...DEFAULT_GOD_MODE });
      setOverlays({ ...DEFAULT_WORLD_OVERLAYS });
      setRendering({ ...DEFAULT_RENDERING_DEBUG });
      setFreeCamPanDelta({ x: 0, y: 0, z: 0 });
      setPickObjectMode(false);
      setSelectedObjectId(null);
      setCollapsed(false);
    }
  }, [active]);

  // Keep live UI telemetry in sync at ~3Hz while console is expanded
  useEffect(() => {
    if (!active || collapsed) return;
    const id = window.setInterval(() => {
      setUiRefreshTick((t) => t + 1);
    }, 350);
    return () => window.clearInterval(id);
  }, [active, collapsed]);

  // Sync runtime bridge ref for GameScene
  useEffect(() => {
    devBridgeRef.current = {
      isActive: active,
      godMode,
      overlays,
      rendering,
      selectedObjectId,
      pickObjectMode,
      forcedObjectiveActive: false,
      freeCamPanDelta,
      onSelectObject: (objectId) => {
        setSelectedObjectId(objectId);
        if (devBridgeRef.current) {
          devBridgeRef.current = { ...devBridgeRef.current, selectedObjectId: objectId };
        }
        onBumpDevRevision?.();
        if (objectId) {
          pushEvent('world', 'OBJECT_PICKED', `Selected ${objectId} in 3D scene`, objectId);
        }
      },
      onDiagnosticsSample: (snap) => setDiagnostics(snap),
      onSimulatedComplete: (elapsedSeconds, interactionsCount) => {
        pushEvent(
          'level',
          'SIMULATED_COMPLETION',
          `Portal completed in Developer Mode (${elapsedSeconds.toFixed(1)}s, ${interactionsCount} ACT) — NOT saved`
        );
        onTriggerSimulatedWinNotice(elapsedSeconds, interactionsCount);
      },
      onEmitEvent: (cat, type, details, objId) => pushEvent(cat, type, details, objId),
    };
  }, [
    active,
    devBridgeRef,
    freeCamPanDelta,
    godMode,
    onBumpDevRevision,
    onTriggerSimulatedWinNotice,
    overlays,
    pickObjectMode,
    pushEvent,
    rendering,
    selectedObjectId,
  ]);

  const handleClearDebugSession = useCallback(() => {
    const nextGod = { ...DEFAULT_GOD_MODE };
    const nextOverlays = { ...DEFAULT_WORLD_OVERLAYS };
    const nextRendering = { ...DEFAULT_RENDERING_DEBUG };
    setGodMode(nextGod);
    setOverlays(nextOverlays);
    setRendering(nextRendering);
    setFreeCamPanDelta({ x: 0, y: 0, z: 0 });
    setPickObjectMode(false);
    setSelectedObjectId(null);
    if (devBridgeRef.current) {
      devBridgeRef.current = {
        ...devBridgeRef.current,
        godMode: nextGod,
        overlays: nextOverlays,
        rendering: nextRendering,
        pickObjectMode: false,
        selectedObjectId: null,
        freeCamPanDelta: { x: 0, y: 0, z: 0 },
      };
    }
    onApplyPuzzleStateDev(resetPuzzleToInitial(level));
    onApplyPlayerStateDev(resetPlayerToSpawn(level));
    onBumpDevRevision?.();
    pushEvent('session', 'DEBUG_SESSION_RESET', 'Reset all god mode, overlay, rendering, puzzle & player states');
  }, [devBridgeRef, level, onApplyPlayerStateDev, onApplyPuzzleStateDev, onBumpDevRevision, pushEvent]);

  const handleWarpToTile = useCallback(
    (gx: number, gz: number, elev?: number) => {
      const next = teleportPlayerToTile(level, puzzleStateRef.current, playerRef.current, gx, gz, elev);
      onApplyPlayerStateDev(next);
      pushEvent('player', 'TELEPORT', `Teleported Wayfinder to tile (${gx},${gz})`);
    },
    [level, onApplyPlayerStateDev, playerRef, pushEvent, puzzleStateRef]
  );

  const handleRunQA = useCallback(
    (suite: QASuiteId) => {
      const report = executeQASuite(suite, {
        currentLevelId: level.id,
        diagnostics,
        devActive: active,
        snapshot: sessionSnapshot,
      });
      setQaReport(report);
      pushEvent(
        'qa',
        'QA_SUITE_RUN',
        `Suite "${suite}" completed: ${report.passed}/${report.total} passed, ${report.failed} failed, ${report.warnings} warnings`
      );
    },
    [active, diagnostics, level.id, pushEvent, sessionSnapshot]
  );

  if (!active) {
    return (
      <button
        type="button"
        data-testid="dev-mode-trigger"
        onClick={() => onToggleDeveloperMode(true)}
        aria-label="Open LUMA Developer Console (Ctrl+Shift+G)"
        className="fixed bottom-3 right-3 z-40 rounded-lg border border-slate-600/80 bg-[#0d151c]/85 hover:bg-[#0d151c] px-2.5 py-1 font-mono text-[10px] font-semibold text-teal-300 shadow-lg cursor-pointer"
      >
        DEV · Ctrl+Shift+G
      </button>
    );
  }

  return (
    <DeveloperConsole
      activeTab={activeTab}
      collapsed={collapsed}
      level={level}
      isHubMode={isHubMode}
      progress={progress}
      activeCharacterId={activeCharacterId}
      puzzleState={puzzleStateRef.current}
      playerState={playerRef.current}
      godMode={godMode}
      overlays={overlays}
      rendering={rendering}
      diagnostics={diagnostics}
      qaReport={qaReport}
      events={events}
      selectedObjectId={selectedObjectId}
      pickObjectMode={pickObjectMode}
      simulatedNotice={simulatedNotice}
      onDismissSimulatedNotice={onDismissSimulatedNotice}
      onSelectTab={setActiveTab}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      onClearDebugSession={handleClearDebugSession}
      onExitDeveloperMode={() => onToggleDeveloperMode(false)}
      onLoadLevel={(id) => {
        setSelectedObjectId(null);
        setFreeCamPanDelta({ x: 0, y: 0, z: 0 });
        onLoadLevelDev(id);
        pushEvent('level', 'LEVEL_JUMP', `Loaded Stage ${String(id).padStart(2, '0')} in Developer Mode`);
      }}
      onSetHeroDev={(heroId) => {
        onSetHeroDev(heroId);
        pushEvent('player', 'HERO_OVERRIDE', `Switched DEV hero override to ${heroId}`);
      }}
      onTriggerAbilityDev={() => {
        onTriggerAbilityDev();
        pushEvent('player', 'HERO_ABILITY', `Triggered [Q] ability for ${activeCharacterId}`);
      }}
      onRestartLevel={() => {
        onLoadLevelDev(level.id);
        pushEvent('level', 'LEVEL_RELOAD', `Reloaded Stage ${level.id}`);
      }}
      onResetPuzzle={() => {
        onApplyPuzzleStateDev(resetPuzzleToInitial(level, activeCharacterId));
        pushEvent('puzzle', 'PUZZLE_RESET', `Reset all puzzles on Stage ${level.id}`);
      }}
      onResetPlayer={() => {
        onApplyPlayerStateDev(resetPlayerToSpawn(level));
        pushEvent('player', 'PLAYER_RESET', 'Reset Wayfinder to spawn');
      }}
      onWarpToSpawn={() => handleWarpToTile(level.spawn.x, level.spawn.z)}
      onWarpToCrystal={() =>
        handleWarpToTile(level.crystal.x, level.crystal.z, level.crystal.elevation)
      }
      onWarpToPortal={() =>
        handleWarpToTile(level.portal.x, level.portal.z, level.portal.elevation)
      }
      onTeleportToTile={handleWarpToTile}
      onUpdateGodMode={(patch) => {
        setGodMode((prev) => {
          const next = { ...prev, ...patch };
          if (devBridgeRef.current) {
            devBridgeRef.current = { ...devBridgeRef.current, godMode: next };
          }
          return next;
        });
        onBumpDevRevision?.();
        pushEvent('player', 'GOD_MODE_UPDATED', JSON.stringify(patch));
      }}
      onPanFreeCamera={(dx, dz) =>
        setFreeCamPanDelta((prev) => ({ ...prev, x: prev.x + dx, z: prev.z + dz }))
      }
      onResetFreeCamera={() => setFreeCamPanDelta({ x: 0, y: 0, z: 0 })}
      onForceObjectiveComplete={() => {
        onForceObjectiveCompleteDev();
        pushEvent('level', 'FORCE_COMPLETE', 'Simulated objective win without saving progress');
      }}
      onForceSwitch={(switchId, val) => {
        onApplyPuzzleStateDev(forceSwitchState(level, puzzleStateRef.current, switchId, val));
        pushEvent('puzzle', 'SWITCH_OVERRIDE', `Set ${switchId} = ${val ? 'ON' : 'OFF'}`, switchId);
      }}
      onResetSwitch={(switchId) => {
        onApplyPuzzleStateDev(resetSwitchState(level, puzzleStateRef.current, switchId));
        pushEvent('puzzle', 'SWITCH_RESET', `Reset ${switchId}`, switchId);
      }}
      onForceGate={(gateId, mode) => {
        onApplyPuzzleStateDev(forceGateOverride(level, puzzleStateRef.current, gateId, mode));
        pushEvent('puzzle', 'GATE_OVERRIDE', `Gate ${gateId} override = ${mode ?? 'normal'}`, gateId);
      }}
      onSetRotatingStep={(platformId, step: Direction) => {
        onApplyPuzzleStateDev(setRotatingPlatformStep(level, puzzleStateRef.current, platformId, step));
        pushEvent('puzzle', 'ROTATING_STEP', `Rotated ${platformId} to step ${step}`, platformId);
      }}
      onResetRotating={(platformId) => {
        onApplyPuzzleStateDev(resetRotatingPlatform(level, puzzleStateRef.current, platformId));
        pushEvent('puzzle', 'ROTATING_RESET', `Reset ${platformId}`, platformId);
      }}
      onSetElevationHigh={(liftId, high) => {
        onApplyPuzzleStateDev(setElevationPlatformState(level, puzzleStateRef.current, liftId, high));
        pushEvent('puzzle', 'LIFT_OVERRIDE', `Set ${liftId} = ${high ? 'HIGH' : 'LOW'}`, liftId);
      }}
      onResetElevation={(liftId) => {
        onApplyPuzzleStateDev(resetElevationPlatform(level, puzzleStateRef.current, liftId));
        pushEvent('puzzle', 'LIFT_RESET', `Reset ${liftId}`, liftId);
      }}
      onSetEmitterEnabled={(emitterId, enabled) => {
        onApplyPuzzleStateDev(setEmitterEnabled(level, puzzleStateRef.current, emitterId, enabled));
        pushEvent('puzzle', 'EMITTER_TOGGLE', `Emitter ${emitterId} = ${enabled ? 'ENABLED' : 'DISABLED'}`, emitterId);
      }}
      onSetPrismDirection={(prismId, dir: Direction) => {
        onApplyPuzzleStateDev(setPrismDirection(level, puzzleStateRef.current, prismId, dir));
        pushEvent('puzzle', 'PRISM_ROTATE', `Prism ${prismId} direction = ${dir * 90}°`, prismId);
      }}
      onForceSubCrystal={(subId, lit) => {
        onApplyPuzzleStateDev(forceSubCrystalLit(level, puzzleStateRef.current, subId, lit));
        pushEvent('puzzle', 'SUBCRYSTAL_OVERRIDE', `Sub-crystal ${subId} = ${lit ? 'LIT' : 'DORMANT'}`, subId);
      }}
      onForceCrystal={(restored) => {
        onApplyPuzzleStateDev(forceCrystalState(level, puzzleStateRef.current, restored));
        pushEvent('puzzle', 'CRYSTAL_OVERRIDE', `Crystal restored = ${restored}`, level.crystal.id);
      }}
      onRecalculateLight={() => {
        onApplyPuzzleStateDev(refreshDerivedPuzzleState(level, puzzleStateRef.current));
        pushEvent('puzzle', 'LIGHT_RECALC', 'Recalculated light propagation beams');
      }}
      onResetAllLight={() => {
        onApplyPuzzleStateDev(resetAllLightOverrides(level, puzzleStateRef.current));
        pushEvent('puzzle', 'LIGHT_RESET', 'Reset all light emitters and prism rotations');
      }}
      onToggleOverlay={(key) => {
        setOverlays((prev) => {
          const next = { ...prev, [key]: !prev[key] };
          if (devBridgeRef.current) {
            devBridgeRef.current = { ...devBridgeRef.current, overlays: next };
          }
          pushEvent('world', 'OVERLAY_TOGGLE', `${key} = ${next[key]}`);
          return next;
        });
        onBumpDevRevision?.();
      }}
      onTurnAllOverlaysOff={() => {
        const next = { ...DEFAULT_WORLD_OVERLAYS };
        setOverlays(next);
        if (devBridgeRef.current) {
          devBridgeRef.current = { ...devBridgeRef.current, overlays: next };
        }
        onBumpDevRevision?.();
        pushEvent('world', 'OVERLAYS_CLEARED', 'Turned all 3D world overlays off');
      }}
      onTogglePickMode={() => {
        setPickObjectMode((p) => {
          const next = !p;
          if (devBridgeRef.current) {
            devBridgeRef.current = { ...devBridgeRef.current, pickObjectMode: next };
          }
          pushEvent('world', 'PICK_MODE', `3D scene picking = ${next}`);
          return next;
        });
        onBumpDevRevision?.();
      }}
      onSelectObject={(id) => {
        setSelectedObjectId(id);
        if (devBridgeRef.current) {
          devBridgeRef.current = { ...devBridgeRef.current, selectedObjectId: id };
        }
        onBumpDevRevision?.();
        if (id) {
          pushEvent('world', 'OBJECT_SELECTED', `Inspecting ${id}`, id);
        }
      }}
      onUpdateRendering={(patch) => {
        setRendering((prev) => {
          const next = { ...prev, ...patch };
          if (devBridgeRef.current) {
            devBridgeRef.current = { ...devBridgeRef.current, rendering: next };
          }
          return next;
        });
        onBumpDevRevision?.();
        pushEvent('rendering', 'RENDER_OVERRIDE', JSON.stringify(patch));
      }}
      onRestoreRenderingDefaults={() => {
        const next = { ...DEFAULT_RENDERING_DEBUG };
        setRendering(next);
        if (devBridgeRef.current) {
          devBridgeRef.current = { ...devBridgeRef.current, rendering: next };
        }
        onBumpDevRevision?.();
        pushEvent('rendering', 'RENDER_DEFAULTS_RESTORED', 'Restored default rendering parameters');
      }}
      onRunQA={handleRunQA}
      onClearEvents={() => setEvents([])}
      onEnterHubDev={() => onLoadLevelDev(0)}
      onOpenNpcDialogueDev={onOpenNpcDialogueDev}
      onPreviewProgressPatchDev={onPreviewProgressPatchDev}
      onApplyPuzzleStateDev={onApplyPuzzleStateDev}
      onApplyPlayerStateDev={onApplyPlayerStateDev}
      onEmitArchipelagoEvent={(type, details) => pushEvent('save', type, details)}
    />
  );
};
