import React from 'react';
import { LEVELS } from '../../game/levels';
import { LevelDef, PlayerRuntimeState, PuzzleRuntimeState, TILE_SIZE } from '../../game/types';
import { getWorldForLevelId, WORLDS } from '../../game/worlds';
import { countPuzzleOverrides } from '../debugAdapter';
import {
  DevTabId,
  QASuiteReport,
  RenderDiagnosticsSnapshot,
} from '../debugTypes';

interface OverviewPanelProps {
  level: LevelDef;
  puzzleState: PuzzleRuntimeState;
  playerState: PlayerRuntimeState;
  diagnostics: RenderDiagnosticsSnapshot | null;
  qaReport: QASuiteReport | null;
  onNavigateTab: (tab: DevTabId) => void;
  onRunQuickQA: () => void;
  onForceObjectiveComplete: () => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  level,
  puzzleState,
  playerState,
  diagnostics,
  qaReport,
  onNavigateTab,
  onRunQuickQA,
  onForceObjectiveComplete,
}) => {
  const gx = Math.round(playerState.x / TILE_SIZE);
  const gz = Math.round(playerState.z / TILE_SIZE);
  const elev = Math.round(playerState.y / 0.65);
  const overridesCount = countPuzzleOverrides(level, puzzleState);
  const world = getWorldForLevelId(level.id);

  return (
    <div className="space-y-3 text-xs text-slate-200">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Worlds &amp; Stages</div>
          <div className="mt-0.5 text-base font-bold text-teal-300">
            {WORLDS.length}W · {LEVELS.length}/60
          </div>
          <div className="text-[11px] text-slate-400">
            W{world.order} · S{String(level.id).padStart(2, '0')}
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Puzzle &amp; Hero Systems</div>
          <div className="mt-0.5 text-base font-bold text-amber-300">5</div>
          <div className="text-[11px] text-slate-400">{overridesCount} active states</div>
        </div>

        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">FPS Monitor</div>
          <div className="mt-0.5 text-base font-bold text-sky-300">
            {diagnostics ? `${diagnostics.fps.toFixed(1)} fps` : '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            {diagnostics ? `${diagnostics.drawCalls} draws` : 'Sampling...'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">QA Status</div>
          <div
            className={`mt-0.5 text-base font-bold ${
              !qaReport
                ? 'text-slate-300'
                : qaReport.failed > 0
                  ? 'text-rose-400'
                  : 'text-emerald-400'
            }`}
          >
            {qaReport ? `${qaReport.passed}/${qaReport.total}` : '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            {qaReport ? `${qaReport.failed} fail · ${qaReport.warnings} warn` : 'Not run'}
          </div>
        </div>
      </div>

      {/* Live Wayfinder Telemetry */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
          <span className="font-semibold text-slate-100">
            Level {String(level.id).padStart(2, '0')} — {level.title}
          </span>
          <span className="font-mono text-[11px] text-teal-300">
            {puzzleState.portalAwakened ? 'PORTAL AWAKENED' : puzzleState.crystalRestored ? 'CRYSTAL RESTORED' : 'IN PROGRESS'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-3 font-mono text-[11px]">
          <div>
            <span className="text-slate-400">World: </span>
            <span>
              ({playerState.x.toFixed(2)}, {playerState.y.toFixed(2)}, {playerState.z.toFixed(2)})
            </span>
          </div>
          <div>
            <span className="text-slate-400">Tile: </span>
            <span>
              ({gx}, {gz}) · Elev {elev}
            </span>
          </div>
          <div>
            <span className="text-slate-400">ACT / Timer: </span>
            <span>
              {puzzleState.interactionsCount} ACT · {puzzleState.elapsedSeconds.toFixed(1)}s
            </span>
          </div>
          <div>
            <span className="text-slate-400">Switches: </span>
            <span>{level.pressureSwitches.length}</span>
          </div>
          <div>
            <span className="text-slate-400">Gates / Lifts: </span>
            <span>
              {level.gates.length} / {level.elevationPlatforms.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Prisms / Beams: </span>
            <span>
              {level.lightPrisms.length} / {puzzleState.lightSegments.length} segs
            </span>
          </div>
        </div>
      </div>

      {/* Quick Developer Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onNavigateTab('levels')}
          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-medium cursor-pointer"
        >
          Jump Level
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('player')}
          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-medium cursor-pointer"
        >
          God Mode Controls
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('world')}
          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-medium cursor-pointer"
        >
          Map Overlays
        </button>
        <button
          type="button"
          onClick={onRunQuickQA}
          className="px-2.5 py-1.5 rounded bg-teal-800/80 hover:bg-teal-700 border border-teal-500/60 text-teal-100 font-medium cursor-pointer"
        >
          Run Current Level QA
        </button>
        <button
          type="button"
          onClick={onForceObjectiveComplete}
          className="px-2.5 py-1.5 rounded bg-amber-900/70 hover:bg-amber-800 border border-amber-500/50 text-amber-100 font-medium cursor-pointer"
        >
          Simulate Win (No Save)
        </button>
      </div>
    </div>
  );
};
