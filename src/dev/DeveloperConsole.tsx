import React from 'react';
import {
  CharacterId,
  LevelDef,
  NpcId,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  SaveProgress,
} from '../game/types';
import {
  DevEventEntry,
  DevTabId,
  GodModeSettings,
  QASuiteId,
  QASuiteReport,
  RenderDiagnosticsSnapshot,
  RenderingDebugSettings,
  WorldOverlayFlags,
} from './debugTypes';
import { EventLogPanel } from './panels/EventLogPanel';
import { LevelManagerPanel } from './panels/LevelManagerPanel';
import { LivingArchipelagoPanel } from './panels/LivingArchipelagoPanel';
import { OverviewPanel } from './panels/OverviewPanel';
import { PlayerControlsPanel } from './panels/PlayerControlsPanel';
import { PuzzleInspectorPanel } from './panels/PuzzleInspectorPanel';
import { QATestRunnerPanel } from './panels/QATestRunnerPanel';
import { RenderingPanel } from './panels/RenderingPanel';
import { WorldInspectorPanel } from './panels/WorldInspectorPanel';

interface DeveloperConsoleProps {
  activeTab: DevTabId;
  collapsed: boolean;
  level: LevelDef;
  isHubMode?: boolean;
  progress?: SaveProgress;
  activeCharacterId: CharacterId;
  puzzleState: PuzzleRuntimeState;
  playerState: PlayerRuntimeState;
  godMode: GodModeSettings;
  overlays: WorldOverlayFlags;
  rendering: RenderingDebugSettings;
  diagnostics: RenderDiagnosticsSnapshot | null;
  qaReport: QASuiteReport | null;
  events: DevEventEntry[];
  selectedObjectId: string | null;
  pickObjectMode: boolean;
  simulatedNotice: string | null;
  onDismissSimulatedNotice: () => void;
  onSelectTab: (tab: DevTabId) => void;
  onToggleCollapsed: () => void;
  onClearDebugSession: () => void;
  onExitDeveloperMode: () => void;
  onLoadLevel: (levelId: number) => void;
  onSetHeroDev: (heroId: CharacterId) => void;
  onTriggerAbilityDev: () => void;
  onRestartLevel: () => void;
  onResetPuzzle: () => void;
  onResetPlayer: () => void;
  onWarpToSpawn: () => void;
  onWarpToCrystal: () => void;
  onWarpToPortal: () => void;
  onTeleportToTile: (gx: number, gz: number, elevation?: number) => void;
  onUpdateGodMode: (patch: Partial<GodModeSettings>) => void;
  onPanFreeCamera: (dx: number, dz: number) => void;
  onResetFreeCamera: () => void;
  onForceObjectiveComplete: () => void;
  onForceSwitch: (switchId: string, active: boolean) => void;
  onResetSwitch: (switchId: string) => void;
  onForceGate: (gateId: string, mode: 'open' | 'closed' | null) => void;
  onSetRotatingStep: (platformId: string, step: 0 | 1 | 2 | 3) => void;
  onResetRotating: (platformId: string) => void;
  onSetElevationHigh: (liftId: string, high: boolean) => void;
  onResetElevation: (liftId: string) => void;
  onSetEmitterEnabled: (emitterId: string, enabled: boolean) => void;
  onSetPrismDirection: (prismId: string, dir: 0 | 1 | 2 | 3) => void;
  onForceSubCrystal: (subId: string, lit: boolean) => void;
  onForceCrystal: (restored: boolean) => void;
  onRecalculateLight: () => void;
  onResetAllLight: () => void;
  onToggleOverlay: (key: keyof WorldOverlayFlags) => void;
  onTurnAllOverlaysOff: () => void;
  onTogglePickMode: () => void;
  onSelectObject: (objectId: string | null) => void;
  onUpdateRendering: (patch: Partial<RenderingDebugSettings>) => void;
  onRestoreRenderingDefaults: () => void;
  onRunQA: (suite: QASuiteId) => void;
  onClearEvents: () => void;
  onEnterHubDev?: () => void;
  onOpenNpcDialogueDev?: (npcId: NpcId) => void;
  onPreviewProgressPatchDev?: (next: SaveProgress) => void;
  onApplyPuzzleStateDev?: (next: PuzzleRuntimeState) => void;
  onApplyPlayerStateDev?: (next: PlayerRuntimeState) => void;
  onEmitArchipelagoEvent?: (type: string, details: string) => void;
}

const TABS: Array<{ id: DevTabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'levels', label: 'Level Manager' },
  { id: 'player', label: 'Player Controls' },
  { id: 'puzzles', label: 'Puzzle Inspector' },
  { id: 'world', label: 'World Inspector' },
  { id: 'archipelago', label: 'Archipelago' },
  { id: 'rendering', label: 'Rendering' },
  { id: 'qa', label: 'QA Test Runner' },
  { id: 'events', label: 'Event Log' },
];

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = (props) => {
  const {
    activeTab,
    collapsed,
    level,
    puzzleState,
    playerState,
    godMode,
    overlays,
    rendering,
    diagnostics,
    qaReport,
    events,
    selectedObjectId,
    pickObjectMode,
    simulatedNotice,
    onDismissSimulatedNotice,
    onSelectTab,
    onToggleCollapsed,
    onClearDebugSession,
    onExitDeveloperMode,
  } = props;

  if (collapsed) {
    return (
      <div
        data-testid="dev-console-collapsed"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border border-amber-400/50 bg-[#0d151c]/95 px-3 py-1.5 text-xs text-slate-100 shadow-xl"
      >
        <span className="font-mono font-bold text-teal-300">LUMA DEV</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-900/70 border border-amber-500/40 text-amber-200 font-mono text-[10px]">
          PROGRESS NOT SAVED
        </span>
        <span className="font-mono text-[11px] text-slate-300">
          L{String(level.id).padStart(2, '0')} · {diagnostics ? `${diagnostics.fps.toFixed(0)} fps` : '—'}
        </span>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
        >
          Expand Console
        </button>
        <button
          type="button"
          onClick={onExitDeveloperMode}
          className="px-2 py-0.5 rounded bg-rose-900/70 hover:bg-rose-800 border border-rose-500/60 text-rose-100 cursor-pointer"
        >
          Exit & Restore
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="LUMA Developer Console"
      data-testid="dev-console"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,960px)] max-h-[62vh] flex flex-col rounded-xl border border-slate-600 bg-[#0d151c] text-slate-100 shadow-2xl overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/90 bg-slate-950/90 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold tracking-wider text-xs text-slate-100">
            LUMA DEVELOPER CONSOLE
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-900/70 border border-emerald-500/50 font-mono text-[10px] font-semibold text-emerald-200">
            ACTIVE
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 font-mono text-[10px] font-semibold text-amber-200">
            DEVELOPER MODE — PROGRESS NOT SAVED
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer"
          >
            Minimize
          </button>
          <button
            type="button"
            onClick={onClearDebugSession}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer"
          >
            Reset Debug Session
          </button>
          <button
            type="button"
            onClick={onExitDeveloperMode}
            className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 border border-rose-500/60 text-rose-100 font-semibold cursor-pointer"
          >
            Exit & Restore (Ctrl+Shift+G)
          </button>
        </div>
      </div>

      {/* Simulated Completion Notice */}
      {simulatedNotice && (
        <div className="flex items-center justify-between gap-2 bg-teal-950/90 border-b border-teal-500/50 px-3 py-1.5 text-xs text-teal-100">
          <span>{simulatedNotice}</span>
          <button
            type="button"
            onClick={onDismissSimulatedNotice}
            className="px-2 py-0.5 rounded bg-teal-900 border border-teal-500/50 text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <nav
        aria-label="Developer Console Tabs"
        className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900/90 px-2 py-1.5"
      >
        {TABS.map((tab) => {
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap border cursor-pointer transition ${
                isCurrent
                  ? 'bg-teal-900/80 border-teal-400 text-white'
                  : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.id === 'events' && events.length > 0 ? ` (${events.length})` : ''}
            </button>
          );
        })}
      </nav>

      {/* Active Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'overview' && (
          <OverviewPanel
            level={level}
            puzzleState={puzzleState}
            playerState={playerState}
            diagnostics={diagnostics}
            qaReport={qaReport}
            onNavigateTab={onSelectTab}
            onRunQuickQA={() => {
              props.onRunQA('current-level');
              onSelectTab('qa');
            }}
            onForceObjectiveComplete={props.onForceObjectiveComplete}
          />
        )}

        {activeTab === 'levels' && (
          <LevelManagerPanel
            currentLevel={level}
            showDecorProps={godMode.showDecorProps}
            onLoadLevel={props.onLoadLevel}
            onRestartLevel={props.onRestartLevel}
            onResetPuzzle={props.onResetPuzzle}
            onResetPlayer={props.onResetPlayer}
            onWarpToSpawn={props.onWarpToSpawn}
            onWarpToCrystal={props.onWarpToCrystal}
            onWarpToPortal={props.onWarpToPortal}
            onToggleDecorProps={() =>
              props.onUpdateGodMode({ showDecorProps: !godMode.showDecorProps })
            }
          />
        )}

        {activeTab === 'player' && (
          <PlayerControlsPanel
            level={level}
            activeCharacterId={props.activeCharacterId}
            playerState={playerState}
            godMode={godMode}
            onSetHeroDev={props.onSetHeroDev}
            onTriggerAbilityDev={props.onTriggerAbilityDev}
            onUpdateGodMode={props.onUpdateGodMode}
            onTeleportToTile={props.onTeleportToTile}
            onWarpToSpawn={props.onWarpToSpawn}
            onWarpToCrystal={props.onWarpToCrystal}
            onWarpToPortal={props.onWarpToPortal}
            onPanFreeCamera={props.onPanFreeCamera}
            onResetFreeCamera={props.onResetFreeCamera}
            onForceObjectiveComplete={props.onForceObjectiveComplete}
          />
        )}

        {activeTab === 'puzzles' && (
          <PuzzleInspectorPanel
            level={level}
            puzzleState={puzzleState}
            onForceSwitch={props.onForceSwitch}
            onResetSwitch={props.onResetSwitch}
            onForceGate={props.onForceGate}
            onSetRotatingStep={props.onSetRotatingStep}
            onResetRotating={props.onResetRotating}
            onSetElevationHigh={props.onSetElevationHigh}
            onResetElevation={props.onResetElevation}
            onSetEmitterEnabled={props.onSetEmitterEnabled}
            onSetPrismDirection={props.onSetPrismDirection}
            onForceSubCrystal={props.onForceSubCrystal}
            onForceCrystal={props.onForceCrystal}
            onRecalculateLight={props.onRecalculateLight}
            onResetAllLight={props.onResetAllLight}
            onResetAllPuzzles={props.onResetPuzzle}
          />
        )}

        {activeTab === 'world' && (
          <WorldInspectorPanel
            level={level}
            puzzleState={puzzleState}
            overlays={overlays}
            selectedObjectId={selectedObjectId}
            pickObjectMode={pickObjectMode}
            onToggleOverlay={props.onToggleOverlay}
            onTurnAllOverlaysOff={props.onTurnAllOverlaysOff}
            onTogglePickMode={props.onTogglePickMode}
            onSelectObject={props.onSelectObject}
            onTeleportToTile={props.onTeleportToTile}
          />
        )}

        {activeTab === 'archipelago' && props.progress && (
          <LivingArchipelagoPanel
            progress={props.progress}
            isHubMode={Boolean(props.isHubMode)}
            currentLevelId={level.id}
            puzzleState={puzzleState}
            playerState={playerState}
            onEnterHubDev={() => props.onEnterHubDev?.()}
            onTeleportToTile={props.onTeleportToTile}
            onOpenNpcDialogueDev={(npcId) => props.onOpenNpcDialogueDev?.(npcId)}
            onPreviewProgressPatchDev={(next) => props.onPreviewProgressPatchDev?.(next)}
            onApplyPuzzleStateDev={(next) => props.onApplyPuzzleStateDev?.(next)}
            onApplyPlayerStateDev={(next) => props.onApplyPlayerStateDev?.(next)}
            onLoadLevelDev={props.onLoadLevel}
            onEmitEvent={props.onEmitArchipelagoEvent}
          />
        )}

        {activeTab === 'rendering' && (
          <RenderingPanel
            rendering={rendering}
            diagnostics={diagnostics}
            onUpdateRendering={props.onUpdateRendering}
            onRestoreDefaults={props.onRestoreRenderingDefaults}
          />
        )}

        {activeTab === 'qa' && (
          <QATestRunnerPanel report={qaReport} onRunSuite={props.onRunQA} />
        )}

        {activeTab === 'events' && (
          <EventLogPanel events={events} onClearEvents={props.onClearEvents} />
        )}
      </div>
    </section>
  );
};
