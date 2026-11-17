import React, { useEffect, useState } from 'react';
import { LEVELS } from '../../game/levels';
import { getMasteryTargetForLevel } from '../../game/masteryConfig';
import { LevelDef, WorldId } from '../../game/types';
import { getWorldForLevelId, WORLDS } from '../../game/worlds';

interface LevelManagerPanelProps {
  currentLevel: LevelDef;
  showDecorProps: boolean;
  onLoadLevel: (levelId: number) => void;
  onRestartLevel: () => void;
  onResetPuzzle: () => void;
  onResetPlayer: () => void;
  onWarpToSpawn: () => void;
  onWarpToCrystal: () => void;
  onWarpToPortal: () => void;
  onToggleDecorProps: () => void;
}

export const LevelManagerPanel: React.FC<LevelManagerPanelProps> = ({
  currentLevel,
  showDecorProps,
  onLoadLevel,
  onRestartLevel,
  onResetPuzzle,
  onResetPlayer,
  onWarpToSpawn,
  onWarpToCrystal,
  onWarpToPortal,
  onToggleDecorProps,
}) => {
  const activeWorld = getWorldForLevelId(currentLevel.id);
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>(activeWorld.id);

  useEffect(() => {
    setSelectedWorldId(activeWorld.id);
  }, [activeWorld.id]);

  const target = getMasteryTargetForLevel(currentLevel.id);
  const visibleLevels = LEVELS.filter((l) => l.worldId === selectedWorldId);

  return (
    <div className="space-y-3 text-xs text-slate-200">
      <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-2.5 py-1.5 text-[11px] text-amber-200">
        Direct Stage Loading bypasses world &amp; campaign locks temporarily inside Developer Mode without saving.
      </div>

      {/* 6 Worlds Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {WORLDS.map((w) => {
          const active = w.id === selectedWorldId;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWorldId(w.id)}
              className={`px-2.5 py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                active
                  ? 'bg-teal-900/80 border-teal-400 text-white'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              W{w.order}: {w.name} ({w.levelRange[0]}–{w.levelRange[1]})
            </button>
          );
        })}
      </div>

      {/* Filtered 10 Stages in Selected World */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {visibleLevels.map((lvl) => {
          const active = lvl.id === currentLevel.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onLoadLevel(lvl.id)}
              className={`text-left px-2.5 py-2 rounded border transition cursor-pointer ${
                active
                  ? 'bg-teal-900/70 border-teal-400 text-white'
                  : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200'
              }`}
            >
              <div className="font-mono text-[10px] text-teal-300">
                S{String(lvl.id).padStart(2, '0')}
              </div>
              <div className="font-semibold truncate text-[11px]">{lvl.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Level Controls */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-100">
              W{activeWorld.order} · Stage {String(currentLevel.id).padStart(2, '0')} — {currentLevel.title}
            </div>
            <div className="text-[11px] text-slate-400">{currentLevel.subtitle}</div>
          </div>
          <div className="font-mono text-[11px] text-slate-300">
            Target: {target.actionTarget} ACT · {target.timeTargetSeconds}s ({target.calibrationSource})
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={onRestartLevel}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            Reload Stage
          </button>
          <button
            type="button"
            onClick={onResetPuzzle}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            Reset Puzzle States
          </button>
          <button
            type="button"
            onClick={onResetPlayer}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            Reset Player Pos
          </button>
          <button
            type="button"
            onClick={onWarpToSpawn}
            className="px-2.5 py-1 rounded bg-sky-900/60 hover:bg-sky-800 border border-sky-600/50 cursor-pointer"
          >
            Warp Spawn
          </button>
          <button
            type="button"
            onClick={onWarpToCrystal}
            className="px-2.5 py-1 rounded bg-teal-900/60 hover:bg-teal-800 border border-teal-500/50 cursor-pointer"
          >
            Warp Crystal
          </button>
          <button
            type="button"
            onClick={onWarpToPortal}
            className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 border border-amber-500/50 cursor-pointer"
          >
            Warp Portal
          </button>
          <button
            type="button"
            onClick={onToggleDecorProps}
            className={`px-2.5 py-1 rounded border cursor-pointer ${
              showDecorProps
                ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-900/50 border-rose-500/50 text-rose-200'
            }`}
          >
            Decor Props: {showDecorProps ? 'Visible' : 'Hidden'}
          </button>
        </div>

        {/* Metadata Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-300">
          <div>Tiles: {currentLevel.tiles.length}</div>
          <div>Switches: {currentLevel.pressureSwitches.length}</div>
          <div>Gates: {currentLevel.gates.length}</div>
          <div>Rot Bridges: {currentLevel.rotatingPlatforms.length}</div>
          <div>Lifts: {currentLevel.elevationPlatforms.length}</div>
          <div>Emitters: {currentLevel.lightEmitters.length}</div>
          <div>Prisms: {currentLevel.lightPrisms.length}</div>
          <div>Sub-Crystals: {(currentLevel.subCrystals ?? []).length}</div>
          <div>Hero Nodes: {(currentLevel.heroNodes ?? []).length}</div>
          <div>
            Echo:{' '}
            {currentLevel.echoFragment
              ? `(${currentLevel.echoFragment.x},${currentLevel.echoFragment.z})`
              : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};
