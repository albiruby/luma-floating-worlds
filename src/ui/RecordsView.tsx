import React, { useState } from 'react';
import { LEVELS } from '../game/levels';
import { formatDurationSeconds } from '../game/mastery';
import { getMasteryTargetForLevel } from '../game/masteryConfig';
import { computePlayerStatistics } from '../game/statistics';
import { SaveProgress, WorldId } from '../game/types';
import { WORLDS } from '../game/worlds';
import { EchoIcon } from './LumaIcons';
import { StarRating } from './StarRating';

interface RecordsViewProps {
  progress: SaveProgress;
}

export const RecordsView: React.FC<RecordsViewProps> = ({ progress }) => {
  const stats = computePlayerStatistics(progress);
  const [worldFilter, setWorldFilter] = useState<'all' | WorldId>('all');

  const collectedEchoIds = new Set(progress.collectedEchoFragments ?? []);

  const summaryCards = [
    {
      label: 'Total Stars',
      value: `${stats.totalStars} / ${stats.maxStars}`,
      accent: 'text-[#9b6a24]',
    },
    {
      label: 'Islands Restored',
      value: `${stats.completedLevelsCount} / ${stats.totalLevels}`,
      accent: 'text-[#178a80]',
    },
    {
      label: '3-Star Mastered',
      value: `${stats.threeStarLevelsCount} / ${stats.totalLevels}`,
      accent: 'text-[#9b6a24]',
    },
    {
      label: 'Echo Fragments',
      value: `${stats.collectedEchoesCount} / ${stats.totalEchoes}`,
      accent: 'text-[#7c3aed]',
    },
    {
      label: 'Heroes Unlocked',
      value: `${stats.unlockedHeroesCount} / ${stats.totalHeroes}`,
      accent: 'text-[#178a80]',
    },
    {
      label: 'Trophies Earned',
      value: `${stats.unlockedAchievementsCount} / ${stats.totalAchievements}`,
      accent: 'text-[#9b6a24]',
    },
    {
      label: 'Luma Shards',
      value: `${stats.lumaShards}`,
      accent: 'text-[#1f2d38]',
    },
    {
      label: 'Total Play Time',
      value: formatDurationSeconds(stats.totalPlayTimeSeconds),
      accent: 'text-[#1f2d38]',
    },
  ];

  const visibleLevels =
    worldFilter === 'all'
      ? LEVELS
      : LEVELS.filter((lvl) => lvl.worldId === worldFilter);

  return (
    <div data-testid="records-view" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {summaryCards.map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-[#efe6cf] border-2 border-[#253542] px-3 py-2"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5b6973]">
              {item.label}
            </div>
            <div className={`text-base font-extrabold tabular-nums mt-0.5 ${item.accent}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* World Filter Strip */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setWorldFilter('all')}
          className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border cursor-pointer ${
            worldFilter === 'all'
              ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
              : 'bg-[#e7dcc2] text-[#1f2d38] border-[#253542]'
          }`}
        >
          All (60)
        </button>
        {WORLDS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setWorldFilter(w.id)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border cursor-pointer ${
              worldFilter === w.id
                ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                : 'bg-[#e7dcc2] text-[#1f2d38] border-[#253542]'
            }`}
          >
            W{w.order}: {w.name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border-2 border-[#253542] bg-[#efe6cf] overflow-hidden">
        <div className="max-h-[42vh] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#e2d4b4] border-b-2 border-[#253542] text-[10px] uppercase tracking-wider text-[#43535e]">
              <tr>
                <th className="py-2 px-3">Island</th>
                <th className="py-2 px-2">Stars</th>
                <th className="py-2 px-2 text-center">Echo</th>
                <th className="py-2 px-2 text-right">Best Time</th>
                <th className="py-2 px-2 text-right">Best ACT</th>
                <th className="py-2 px-3 text-right">Clears</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3c5a3]">
              {visibleLevels.map((lvl) => {
                const rec = progress.masteryRecords[lvl.id];
                const target = getMasteryTargetForLevel(lvl.id);
                const completed = progress.completedLevels.includes(lvl.id);
                const bestTime = rec?.bestTime ?? progress.bestTimes[lvl.id];
                const bestActions = rec?.bestActions;
                const stars = rec?.bestStars ?? 0;
                const hasEcho = Boolean(lvl.echoFragment);
                const echoFound = hasEcho && collectedEchoIds.has(lvl.echoFragment!.id);

                return (
                  <tr key={lvl.id} className="hover:bg-[#f6eedb]/70">
                    <td className="py-1.5 px-3">
                      <span className="font-bold text-[#9b6a24] mr-1.5">
                        {String(lvl.id).padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-[#1f2d38]">{lvl.title}</span>
                    </td>
                    <td className="py-1.5 px-2">
                      <StarRating stars={stars} size="sm" />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {hasEcho ? (
                        <span className="inline-flex justify-center" title={lvl.echoFragment!.title}>
                          <EchoIcon collected={echoFound} className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-[#8a826f]">—</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums font-semibold">
                      {bestTime !== undefined ? (
                        <span
                          className={
                            bestTime <= target.timeTargetSeconds
                              ? 'text-[#178a80]'
                              : 'text-[#1f2d38]'
                          }
                        >
                          {formatDurationSeconds(bestTime)}
                        </span>
                      ) : (
                        <span className="text-[#8a826f]">—</span>
                      )}
                      <span className="text-[#78715f] text-[10px] ml-1">
                        /{formatDurationSeconds(target.timeTargetSeconds)}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums font-semibold">
                      {bestActions !== undefined ? (
                        <span
                          className={
                            bestActions <= target.actionTarget
                              ? 'text-[#178a80]'
                              : 'text-[#1f2d38]'
                          }
                        >
                          {bestActions}
                        </span>
                      ) : (
                        <span className="text-[#8a826f]">—</span>
                      )}
                      <span className="text-[#78715f] text-[10px] ml-1">
                        /{target.actionTarget}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-[#43535e]">
                      {completed ? rec?.completions ?? 0 : 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
