import React, { useMemo, useState } from 'react';
import { audioEngine } from '../audio/synth';
import { LEVELS } from '../game/levels';
import { getTrackedQuestBannerInfo } from '../game/questEvaluator';
import {
  countCompletedStagesInWorld,
  getWorldRestorationState,
} from '../game/restoration';
import { SaveProgress, WorldId } from '../game/types';
import { getWorldForLevelId, WORLDS } from '../game/worlds';
import { CrystalIcon, EchoIcon } from './LumaIcons';
import { StarRating } from './StarRating';

interface WorldMapModalProps {
  progress: SaveProgress;
  currentLevelId: number;
  isInHub: boolean;
  onEnterHub: () => void;
  onSelectStage: (levelId: number, useCheckpoint?: boolean) => void;
  onOpenAtlas: () => void;
  onClose: () => void;
}

const NODE_COORDS: Record<WorldId, { x: number; y: number }> = {
  world_1: { x: 11, y: 66 },
  world_2: { x: 29, y: 34 },
  world_3: { x: 48, y: 64 },
  world_4: { x: 66, y: 34 },
  world_5: { x: 84, y: 64 },
  world_6: { x: 89, y: 20 },
};

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  progress,
  currentLevelId,
  isInHub,
  onEnterHub,
  onSelectStage,
  onOpenAtlas,
  onClose,
}) => {
  const initialWorld = getWorldForLevelId(currentLevelId);
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>(initialWorld.id);

  const trackedBanner = useMemo(() => getTrackedQuestBannerInfo(progress), [progress]);
  const trackedStageId = trackedBanner?.quest
    ? progress.questProgress?.[trackedBanner.quest.id]
      ? (() => {
          const done = new Set(progress.questProgress?.[trackedBanner.quest.id]?.completedSteps ?? []);
          const next = trackedBanner.quest.steps.find((s) => !done.has(s.id));
          return next?.waypointStageId;
        })()
      : undefined
    : undefined;
  const waypointWorldId = trackedStageId ? getWorldForLevelId(trackedStageId).id : null;

  const collectedEchoIds = new Set(progress.collectedEchoFragments ?? []);
  const selectedWorld = WORLDS.find((w) => w.id === selectedWorldId) ?? WORLDS[0];
  const worldStages = useMemo(
    () => LEVELS.filter((l) => l.worldId === selectedWorld.id),
    [selectedWorld.id]
  );

  return (
    <div className="fixed inset-0 z-40 bg-[#122029]/60 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Interactive World Map"
        data-testid="world-map-modal"
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
              Living Archipelago Cartography · {(progress.restoredWorlds ?? []).length} / 6 Realms Restored
            </p>
            <h2 className="font-display text-2xl font-bold">Interactive World Map</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isInHub && (
              <button
                type="button"
                data-testid="worldmap-enter-hub-btn"
                onClick={() => {
                  audioEngine.playUiClick();
                  onClose();
                  onEnterHub();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] font-bold text-xs uppercase border-2 border-[#1f2d38] cursor-pointer"
              >
                Enter The Convergence
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                audioEngine.playUiClick();
                onClose();
                onOpenAtlas();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#efe6cf] hover:bg-[#fff8e6] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
            >
              Stage Atlas &amp; Records
            </button>
            <button
              type="button"
              onClick={() => {
                audioEngine.playUiClick();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Connected Sky-Bridge Node Canvas */}
        <div className="relative w-full h-52 sm:h-60 rounded-xl bg-[#1d2d37] border-2 border-[#1f2d38] overflow-hidden mb-3 shrink-0">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            {WORLDS.slice(0, WORLDS.length - 1).map((w, idx) => {
              const nextW = WORLDS[idx + 1];
              const a = NODE_COORDS[w.id];
              const b = NODE_COORDS[nextW.id];
              const nextUnlocked = progress.highestUnlockedLevel >= nextW.levelRange[0];
              return (
                <line
                  key={w.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={nextUnlocked ? '#ebb652' : '#4a6270'}
                  strokeWidth={nextUnlocked ? 1.4 : 0.9}
                  strokeDasharray={nextUnlocked ? undefined : '2.2 1.8'}
                />
              );
            })}
          </svg>

          {WORLDS.map((w) => {
            const pos = NODE_COORDS[w.id];
            const unlocked = progress.highestUnlockedLevel >= w.levelRange[0];
            const restored = getWorldRestorationState(progress, w.id) === 'restored';
            const selected = w.id === selectedWorldId;
            const hasWaypoint = waypointWorldId === w.id;
            const doneCount = countCompletedStagesInWorld(w.id, progress.completedLevels);

            return (
              <button
                key={w.id}
                type="button"
                data-testid={`worldmap-node-${w.id}`}
                onClick={() => {
                  audioEngine.playUiClick();
                  setSelectedWorldId(w.id);
                }}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute px-2.5 py-1.5 rounded-lg border-2 text-left transition-transform cursor-pointer min-w-[106px] sm:min-w-[126px] ${
                  selected
                    ? 'bg-[#fff8e6] text-[#1f2d38] border-[#e8a838] scale-105 z-10 shadow-[0_4px_0_#111b21]'
                    : restored
                    ? 'bg-[#e3f2ed] text-[#112329] border-[#24c9b8]'
                    : unlocked
                    ? 'bg-[#efe6cf] text-[#1f2d38] border-[#253542]'
                    : 'bg-[#2a3b47] text-[#9eb4bf] border-[#4b6270]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[9px] font-extrabold uppercase tracking-wider">
                  <span style={{ color: unlocked ? w.badgeColor : '#9eb4bf' }}>
                    World {w.order}
                  </span>
                  {hasWaypoint && (
                    <span className="px-1 rounded bg-[#e8a838] text-[#1f2d38]">Quest</span>
                  )}
                </div>
                <div className="font-display text-xs font-bold truncate">{w.name}</div>
                <div className="text-[10px] font-semibold opacity-80 tabular-nums">
                  {restored ? 'Restored' : unlocked ? `${doneCount}/10 Cleared` : 'Locked'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected World Drill-Down Grid */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#9b6a24]">
                W{selectedWorld.order} · {selectedWorld.subtitle}
              </span>
              <h3 className="font-display text-lg font-bold">{selectedWorld.name}</h3>
            </div>
            <div className="text-xs font-bold text-[#4b5c68]">
              {selectedWorld.unlockRuleLabel}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 overflow-y-auto pr-1 pb-1">
            {worldStages.map((lvl) => {
              const unlocked = lvl.id <= progress.highestUnlockedLevel;
              const completed = progress.completedLevels.includes(lvl.id);
              const rec = progress.masteryRecords[lvl.id];
              const checkpoint = progress.checkpoints?.[lvl.id];
              const echoFound =
                Boolean(lvl.echoFragment) &&
                collectedEchoIds.has(lvl.echoFragment!.id);
              const isQuestTarget = trackedStageId === lvl.id;

              return (
                <div
                  key={lvl.id}
                  className={`rounded-lg border-2 p-2.5 flex flex-col justify-between gap-2 ${
                    !unlocked
                      ? 'bg-[#dfd6c1]/65 border-[#8b877c] text-[#6d6d66]'
                      : isQuestTarget
                      ? 'bg-[#fff8e6] border-[#e8a838]'
                      : 'bg-[#efe6cf] border-[#253542]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                      <span>Stage {String(lvl.id).padStart(2, '0')}</span>
                      {lvl.echoFragment && (
                        <EchoIcon collected={echoFound} className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="font-display text-xs font-bold leading-snug mt-0.5 line-clamp-2">
                      {lvl.title}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <StarRating stars={rec?.bestStars ?? 0} size="sm" />
                      <CrystalIcon active={completed} className="w-4 h-4" />
                    </div>
                  </div>

                  {unlocked ? (
                    <div className="flex flex-col gap-1">
                      {checkpoint && (
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playUiClick();
                            onClose();
                            onSelectStage(lvl.id, true);
                          }}
                          className="w-full py-1 rounded bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-[10px] uppercase border border-[#1f2d38] cursor-pointer"
                        >
                          Resume Checkpoint
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playUiClick();
                          onClose();
                          onSelectStage(lvl.id, false);
                        }}
                        className="w-full py-1 rounded bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-[10px] uppercase border border-[#1f2d38] cursor-pointer"
                      >
                        {checkpoint ? 'Start Fresh' : 'Enter Stage'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold uppercase text-center py-1 opacity-75">
                      Locked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
