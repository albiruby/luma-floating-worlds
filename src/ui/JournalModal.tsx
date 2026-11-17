import React, { useMemo, useState } from 'react';
import { audioEngine } from '../audio/synth';
import { LEVELS } from '../game/levels';
import { getNpcById } from '../game/npcs';
import { getQuestStepProgressSummary } from '../game/questEvaluator';
import { QUESTS } from '../game/quests';
import {
  countCompletedStagesInWorld,
  getHubRestorationSummary,
  getHubRestorationTier,
  getWorldRestorationState,
} from '../game/restoration';
import { QuestCategory, QuestDef, SaveProgress } from '../game/types';
import { WORLDS } from '../game/worlds';
import { EchoIcon, ShardIcon } from './LumaIcons';

type JournalTabId = QuestCategory | 'world_lore';

interface JournalModalProps {
  progress: SaveProgress;
  onTrackQuest: (questId: string | null) => void;
  onSelectTitle: (title: string | null) => void;
  onJumpToStage?: (stageId: number) => void;
  onClose: () => void;
}

const TABS: Array<{ id: JournalTabId; label: string }> = [
  { id: 'main_story', label: 'Main Story' },
  { id: 'world_restoration', label: 'World Restoration' },
  { id: 'hero_story', label: 'Hero Stories' },
  { id: 'side_quest', label: 'Side Quests' },
  { id: 'hidden_secret', label: 'Hidden Secrets' },
  { id: 'world_lore', label: 'World Lore' },
];

export const JournalModal: React.FC<JournalModalProps> = ({
  progress,
  onTrackQuest,
  onSelectTitle,
  onJumpToStage,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<JournalTabId>('main_story');

  const questProgress = progress.questProgress ?? {};
  const totalQuests = QUESTS.length;
  const completedQuestsCount = useMemo(
    () => QUESTS.filter((q) => questProgress[q.id]?.completed).length,
    [questProgress]
  );

  const hubTier = getHubRestorationTier(progress);
  const hubSummary = getHubRestorationSummary(hubTier);
  const unlockedTitles = progress.unlockedTitles ?? [];
  const collectedEchoIds = new Set(progress.collectedEchoFragments ?? []);

  const filteredQuests = useMemo(
    () =>
      activeTab === 'world_lore'
        ? []
        : QUESTS.filter((q) => q.category === activeTab),
    [activeTab]
  );

  const unlockedQuestLore = useMemo(() => {
    return QUESTS.filter(
      (q) => questProgress[q.id]?.completed && Boolean(q.reward.loreEntry)
    );
  }, [questProgress]);

  const collectedEchoEntries = useMemo(() => {
    return LEVELS.filter(
      (l) => l.echoFragment && collectedEchoIds.has(l.echoFragment.id)
    ).map((l) => ({
      levelTitle: l.title,
      echo: l.echoFragment!,
    }));
  }, [collectedEchoIds]);

  const renderQuestCard = (quest: QuestDef) => {
    const rec = questProgress[quest.id];
    const isHiddenLocked = Boolean(quest.hiddenUntilDiscovered && !rec?.discovered);
    const isCompleted = Boolean(rec?.completed);
    const isDiscovered = Boolean(rec?.discovered);
    const isTracked = progress.trackedQuestId === quest.id;
    const { done, total, nextStep } = getQuestStepProgressSummary(quest, rec);
    const giver = quest.giverNpcId ? getNpcById(quest.giverNpcId) : null;
    const doneStepsSet = new Set(rec?.completedSteps ?? []);

    if (isHiddenLocked) {
      return (
        <div
          key={quest.id}
          className="rounded-lg border-2 border-dashed border-[#8b877c] bg-[#e5dcc5]/70 p-4 text-[#5b6973]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
              Undiscovered Secret
            </span>
            <span className="text-[11px] font-bold">???</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed">
            Explore forgotten walkways across The Convergence and seek hidden Echoes inside the islands to uncover this secret chronicle.
          </p>
        </div>
      );
    }

    return (
      <div
        key={quest.id}
        data-testid={`journal-quest-${quest.id}`}
        className={`rounded-lg border-2 p-4 transition-colors ${
          isCompleted
            ? 'bg-[#e3f2ed] border-[#178a80]'
            : isTracked
            ? 'bg-[#fff8e6] border-[#1f2d38] shadow-[0_3px_0_#1f2d38]'
            : isDiscovered
            ? 'bg-[#efe6cf] border-[#253542]'
            : 'bg-[#e3dac4]/75 border-[#8b877c] text-[#5e5c54]'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a24]">
              <span>
                {isCompleted
                  ? 'Completed'
                  : isDiscovered
                  ? `Active · ${done}/${total}`
                  : 'Locked Prerequisite'}
              </span>
              {giver && <span>· Keeper: {giver.name}</span>}
              {quest.heroId && <span className="text-[#178a80]">· Hero Story</span>}
            </div>
            <h3 className="font-display text-base font-bold text-[#1f2d38] mt-0.5">
              {quest.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isDiscovered && !isCompleted && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playUiClick();
                  onTrackQuest(isTracked ? null : quest.id);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-extrabold uppercase tracking-wider border cursor-pointer ${
                  isTracked
                    ? 'bg-[#1d2d37] text-[#ebb652] border-[#1f2d38]'
                    : 'bg-[#f7f0dc] hover:bg-[#fff8e6] text-[#1f2d38] border-[#253542]'
                }`}
              >
                {isTracked ? 'Tracking' : 'Track'}
              </button>
            )}
            {nextStep?.waypointStageId &&
              nextStep.waypointStageId <= progress.highestUnlockedLevel &&
              onJumpToStage &&
              !isCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playUiClick();
                    onClose();
                    onJumpToStage(nextStep.waypointStageId!);
                  }}
                  className="px-2.5 py-1 rounded bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] border border-[#1f2d38] text-[11px] font-extrabold uppercase cursor-pointer"
                >
                  Stage {String(nextStep.waypointStageId).padStart(2, '0')}
                </button>
              )}
          </div>
        </div>

        <p className="mt-1.5 text-xs text-[#43535e] leading-relaxed">
          {isCompleted ? quest.completionNote : quest.summary}
        </p>

        {/* Steps Checklist */}
        {isDiscovered && (
          <ul className="mt-2.5 space-y-1 text-xs">
            {quest.steps.map((step) => {
              const stepDone = doneStepsSet.has(step.id) || isCompleted;
              return (
                <li
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    stepDone ? 'text-[#13756c] font-semibold line-through opacity-85' : 'text-[#1f2d38] font-semibold'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                      stepDone
                        ? 'bg-[#178a80] text-[#f6eedb] border-[#13756c]'
                        : 'bg-[#fff8e6] text-[#4b5c68] border-[#253542]'
                    }`}
                  >
                    {stepDone ? '✓' : '·'}
                  </span>
                  <span>{step.description}</span>
                </li>
              );
            })}
          </ul>
        )}

        {/* Reward Strip */}
        <div className="mt-2.5 pt-2 border-t border-[#d8cbb0] flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#6e5a3b]">
          {quest.reward.lumaShards && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f8f1df] border border-[#253542]/40">
              <ShardIcon className="w-3 h-3" />+{quest.reward.lumaShards} Shards
            </span>
          )}
          {quest.reward.titleUnlock && (
            <span className="px-2 py-0.5 rounded bg-[#f8f1df] border border-[#253542]/40">
              Title: {quest.reward.titleUnlock}
            </span>
          )}
          {quest.reward.loreEntry && (
            <span className="px-2 py-0.5 rounded bg-[#f3e8ff] border border-[#7c3aed]/40 text-[#5b21b6]">
              Chronicle Entry
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#122029]/60 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quest & Lore Journal"
        data-testid="journal-modal"
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
              Living Archipelago Chronicles · {completedQuestsCount} / {totalQuests} Quests Complete
            </p>
            <h2 className="font-display text-2xl font-bold">Wayfinder Journal</h2>
          </div>

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

        {/* 6-Tab Navigation */}
        <div
          role="tablist"
          aria-label="Journal Categories"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 mb-3"
        >
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-testid={`journal-tab-${tab.id}`}
                onClick={() => {
                  audioEngine.playUiClick();
                  setActiveTab(tab.id);
                }}
                className={`px-2.5 py-2 rounded-lg border-2 text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                    : 'bg-[#efe6cf] hover:bg-[#f7f0dc] text-[#1f2d38] border-[#253542]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'world_lore' ? (
            <div className="space-y-4">
              {/* Hub Restoration State */}
              <div className="rounded-lg bg-[#1d2d37] border-2 border-[#d8a13f] p-4 text-[#f6eedb]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ebb652]">
                      {hubSummary.badge}
                    </span>
                    <h3 className="font-display text-lg font-bold">{hubSummary.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#2a3f4d] border border-[#d8a13f]/50 text-xs font-bold tabular-nums">
                    {(progress.visitedHubAreas ?? []).length} / 9 Sanctuary Zones Visited
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#d7e5ea]">{hubSummary.description}</p>
              </div>

              {/* 6-World Restoration Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-2">
                  Six-World Restoration Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {WORLDS.map((w) => {
                    const state = getWorldRestorationState(progress, w.id);
                    const doneCount = countCompletedStagesInWorld(w.id, progress.completedLevels);
                    return (
                      <div
                        key={w.id}
                        className={`rounded-lg border-2 p-3 text-xs ${
                          state === 'restored'
                            ? 'bg-[#e3f2ed] border-[#178a80]'
                            : 'bg-[#efe6cf] border-[#253542]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>
                            W{w.order} · {w.name}
                          </span>
                          <span
                            className={
                              state === 'restored' ? 'text-[#13756c]' : 'text-[#8c6428]'
                            }
                          >
                            {state === 'restored' ? 'Restored' : `${doneCount}/10`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4b5c68] mt-1">{w.subtitle}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Earned Wayfinder Titles */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-2">
                  Earned Titles ({unlockedTitles.length})
                </h3>
                {unlockedTitles.length === 0 ? (
                  <p className="text-xs text-[#5b6973] italic">
                    Complete Story, World Restoration, or Side Quests to earn equippable titles.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectTitle(null)}
                      className={`px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                        !progress.activeTitle
                          ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                          : 'bg-[#efe6cf] text-[#1f2d38] border-[#253542]'
                      }`}
                    >
                      No Title
                    </button>
                    {unlockedTitles.map((title) => {
                      const active = progress.activeTitle === title;
                      return (
                        <button
                          key={title}
                          type="button"
                          onClick={() => onSelectTitle(title)}
                          className={`px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                            active
                              ? 'bg-[#e8a838] text-[#1f2d38] border-[#1f2d38]'
                              : 'bg-[#efe6cf] hover:bg-[#fff8e6] text-[#1f2d38] border-[#253542]'
                          }`}
                        >
                          {title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chronicle & Echo Lore */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-2">
                  Unlocked Chronicles &amp; Preserved Echoes ({unlockedQuestLore.length + collectedEchoEntries.length})
                </h3>
                <div className="space-y-2">
                  {unlockedQuestLore.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-lg bg-[#fff8e6] border border-[#253542] p-3 text-xs"
                    >
                      <div className="font-bold text-[#9b6a24]">{q.title}</div>
                      <p className="mt-0.5 text-[#1f2d38] leading-relaxed">
                        {q.reward.loreEntry}
                      </p>
                    </div>
                  ))}
                  {collectedEchoEntries.map(({ levelTitle, echo }) => (
                    <div
                      key={echo.id}
                      className="rounded-lg bg-[#f3e8ff]/70 border border-[#7c3aed]/50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[#5b21b6]">
                        <EchoIcon collected className="w-3.5 h-3.5" />
                        <span>
                          {echo.title} · {levelTitle}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[#1f2d38] leading-relaxed">{echo.loreText}</p>
                    </div>
                  ))}
                  {unlockedQuestLore.length === 0 && collectedEchoEntries.length === 0 && (
                    <p className="text-xs text-[#5b6973] italic">
                      Lore entries will unlock here as you complete chronicles and recover Echo Fragments.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredQuests.map(renderQuestCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
