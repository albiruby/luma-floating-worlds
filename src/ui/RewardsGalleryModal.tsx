import React, { useState } from 'react';
import { audioEngine } from '../audio/synth';
import { ACHIEVEMENTS } from '../game/achievements';
import { EXPANDED_STAR_MILESTONES } from '../game/cosmetics';
import { LEVELS } from '../game/levels';
import { getTotalStars, MAX_CAMPAIGN_STARS } from '../game/mastery';
import { SaveProgress, WorldId } from '../game/types';
import { WORLDS } from '../game/worlds';
import { EchoIcon, ShardIcon, StarIcon, TrophyIcon } from './LumaIcons';

interface RewardsGalleryModalProps {
  progress: SaveProgress;
  onClose: () => void;
}

export const RewardsGalleryModal: React.FC<RewardsGalleryModalProps> = ({
  progress,
  onClose,
}) => {
  const [tab, setTab] = useState<'achievements' | 'echoes' | 'milestones'>('achievements');
  const [echoWorldFilter, setEchoWorldFilter] = useState<'all' | WorldId>('all');

  const totalStars = getTotalStars(progress.masteryRecords);
  const unlockedAchIds = new Set(progress.unlockedAchievements ?? []);
  const collectedEchoIds = new Set(progress.collectedEchoFragments ?? []);

  const filteredEchoLevels = LEVELS.filter((lvl) => {
    if (!lvl.echoFragment) return false;
    if (echoWorldFilter === 'all') return true;
    return lvl.worldId === echoWorldFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#122029]/65 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Echo Codex and Trophies"
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#d9ccb0]">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b6a24]">
                {unlockedAchIds.size} / {ACHIEVEMENTS.length} Trophies · {collectedEchoIds.size} / {LEVELS.length} Echoes · {totalStars} / {MAX_CAMPAIGN_STARS} ★
              </p>
              <h2 className="font-display text-2xl font-bold leading-tight">
                Echo Codex &amp; Trophies
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#efe6cf] border border-[#253542] text-xs font-extrabold tabular-nums">
              <ShardIcon className="w-4 h-4" />
              <span>{progress.lumaShards ?? 0} Shards</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mb-4" role="tablist">
          {(
            [
              { id: 'achievements', label: `Trophies (${unlockedAchIds.size}/${ACHIEVEMENTS.length})` },
              { id: 'echoes', label: `Echo Codex (${collectedEchoIds.size}/${LEVELS.length})` },
              { id: 'milestones', label: `Star Milestones (${EXPANDED_STAR_MILESTONES.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                audioEngine.playUiClick();
                setTab(t.id);
              }}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border-2 cursor-pointer ${
                tab === t.id
                  ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                  : 'bg-[#e7dcc2] hover:bg-[#efe6cf] text-[#1f2d38] border-[#253542]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto pr-1 flex-1 min-h-0">
          {tab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2">
              {ACHIEVEMENTS.map((ach) => {
                const earned = unlockedAchIds.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-lg border-2 p-3 flex items-start justify-between gap-3 ${
                      earned
                        ? 'bg-[#e3f2ed] border-[#178a80]'
                        : 'bg-[#ebe2cc]/75 border-[#8c8472] opacity-85'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                        {ach.category} {earned ? '· Unlocked' : ''}
                      </div>
                      <div className="font-display font-bold text-sm mt-0.5">
                        {ach.title}
                      </div>
                      <p className="text-xs text-[#43535e] mt-0.5 leading-snug">
                        {ach.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#f6eedb] border border-[#253542] text-[11px] font-extrabold tabular-nums shrink-0">
                      <ShardIcon className="w-3.5 h-3.5" />
                      +{ach.shardReward}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'echoes' && (
            <div className="flex flex-col gap-3 pb-2">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setEchoWorldFilter('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border cursor-pointer ${
                    echoWorldFilter === 'all'
                      ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                      : 'bg-[#e7dcc2] text-[#1f2d38] border-[#253542]'
                  }`}
                >
                  All Worlds
                </button>
                {WORLDS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setEchoWorldFilter(w.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border cursor-pointer ${
                      echoWorldFilter === w.id
                        ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                        : 'bg-[#e7dcc2] text-[#1f2d38] border-[#253542]'
                    }`}
                  >
                    W{w.order}: {w.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredEchoLevels.map((lvl) => {
                  const echo = lvl.echoFragment!;
                  const collected = collectedEchoIds.has(echo.id);
                  return (
                    <div
                      key={echo.id}
                      className={`rounded-lg border-2 p-3 flex items-start gap-3 ${
                        collected
                          ? 'bg-[#f4ebfa] border-[#7c3aed]'
                          : 'bg-[#ebe2cc]/75 border-[#8c8472]'
                      }`}
                    >
                      <EchoIcon collected={collected} className="w-6 h-6 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                          Stage {String(lvl.id).padStart(2, '0')} · {lvl.title}
                        </div>
                        <div className="font-display font-bold text-sm">
                          {collected ? echo.title : 'Uncollected Echo Fragment'}
                        </div>
                        <p className="text-xs text-[#43535e] mt-0.5 leading-relaxed">
                          {collected
                            ? echo.loreText
                            : echo.secretHint ?? 'Explore side alcoves across this island to uncover its Echo.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'milestones' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2">
              {EXPANDED_STAR_MILESTONES.map((ms) => {
                const reached = totalStars >= ms.requiredStars;
                return (
                  <div
                    key={ms.cosmeticId}
                    className={`rounded-lg border-2 p-3 flex items-center justify-between gap-3 ${
                      reached
                        ? 'bg-[#fff8e6] border-[#ebb652]'
                        : 'bg-[#ebe2cc]/75 border-[#8c8472] opacity-85'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                        {ms.subtitle}
                      </div>
                      <div className="font-display font-bold text-sm truncate">{ms.title}</div>
                    </div>
                    <div className="flex items-center gap-1 font-extrabold text-xs tabular-nums shrink-0">
                      <StarIcon filled={reached} className="w-4 h-4" />
                      <span>{ms.requiredStars} ★</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
