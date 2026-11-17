import React, { useEffect, useMemo, useRef, useState } from 'react';
import { audioEngine } from '../audio/synth';
import { getCharacterById } from '../game/characters';
import { LEVELS } from '../game/levels';
import {
  formatDurationSeconds,
  getThreeStarLevelCount,
  getTotalStars,
  MAX_CAMPAIGN_STARS,
} from '../game/mastery';
import { getMasteryTargetForLevel } from '../game/masteryConfig';
import { validateSaveProgress } from '../game/progression';
import {
  exportSavePayload,
  getLocalStorageDiagnostics,
  ImportPreviewSummary,
  LocalStorageDiagnostics,
  parseAndValidateImport,
  requestBrowserPersistentStorage,
} from '../game/saveManager';
import { triggerTextDownload } from '../game/customFormats';
import { downloadDuelScorecardPng } from '../game/echoDuels';
import {
  CompletionSummary,
  CosmeticId,
  EchoDuelRecord,
  GameSettings,
  LevelDef,
  LumaReplayFile,
  SaveProgress,
  WorldId,
} from '../game/types';
import { getWorldForLevelId, WORLDS } from '../game/worlds';
import {
  CrystalIcon,
  EchoIcon,
  HeroBadgeIcon,
  RecordsIcon,
  ShardIcon,
  TrophyIcon,
  WardrobeIcon,
} from './LumaIcons';
import { RecordsView } from './RecordsView';
import { StarRating } from './StarRating';

interface PauseModalProps {
  level: LevelDef;
  isHubMode?: boolean;
  activeMode?: 'campaign' | 'custom' | 'playtest' | 'daily_rift' | 'duel';
  onReturnToForge?: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSaveCheckpointAndExitToHub?: () => void;
  onOpenWorldMap?: () => void;
  onOpenJournal?: () => void;
  onOpenLevels: () => void;
  onOpenHeroes: () => void;
  onOpenWardrobe: () => void;
  onOpenRewards: () => void;
  onOpenSettings: () => void;
  onReturnTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  isHubMode = false,
  activeMode = 'campaign',
  onReturnToForge,
  onResume,
  onRestart,
  onSaveCheckpointAndExitToHub,
  onOpenWorldMap,
  onOpenJournal,
  onOpenLevels,
  onOpenHeroes,
  onOpenWardrobe,
  onOpenRewards,
  onOpenSettings,
  onReturnTitle,
}) => {
  const world = getWorldForLevelId(level.id);

  return (
    <div className="fixed inset-0 z-30 bg-[#122029]/55 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game Paused"
        className="w-full max-w-sm rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-6 text-[#1f2d38]"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b6a24]">
          {isHubMode ? 'Paused · Sanctuary Hub' : `Paused · W${world.order} ${world.name}`}
        </p>
        <h2 className="font-display text-2xl font-bold mt-1">
          {isHubMode ? 'The Convergence' : level.title}
        </h2>
        <p className="text-xs text-[#4b5c68] mb-5">{level.subtitle}</p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] font-bold text-sm uppercase tracking-wider border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] cursor-pointer"
          >
            {isHubMode ? 'Resume Exploring' : 'Resume Journey'}
          </button>
          {activeMode === 'playtest' && onReturnToForge && (
            <button
              type="button"
              data-testid="pause-return-forge-btn"
              onClick={onReturnToForge}
              className="w-full py-2.5 rounded-lg bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-xs uppercase tracking-wider border-2 border-[#1f2d38] cursor-pointer"
            >
              Return to World Forge
            </button>
          )}
          {!isHubMode && activeMode === 'campaign' && onSaveCheckpointAndExitToHub && (
            <button
              type="button"
              data-testid="pause-save-hub-btn"
              onClick={onSaveCheckpointAndExitToHub}
              className="w-full py-2.5 rounded-lg bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-xs uppercase tracking-wider border-2 border-[#1f2d38] cursor-pointer"
            >
              Save Checkpoint &amp; Enter Hub
            </button>
          )}
          {!isHubMode && (
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-sm border-2 border-[#253542] cursor-pointer"
            >
              Restart Island
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {onOpenJournal && (
              <button
                type="button"
                onClick={onOpenJournal}
                className="py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-xs border-2 border-[#253542] cursor-pointer"
              >
                Journal
              </button>
            )}
            {onOpenWorldMap && (
              <button
                type="button"
                onClick={onOpenWorldMap}
                className="py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-xs border-2 border-[#253542] cursor-pointer"
              >
                World Map
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onOpenLevels}
              className="py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-xs border-2 border-[#253542] cursor-pointer"
            >
              Atlas
            </button>
            <button
              type="button"
              onClick={onOpenHeroes}
              className="py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-xs border-2 border-[#253542] cursor-pointer"
            >
              Heroes
            </button>
            <button
              type="button"
              onClick={onOpenWardrobe}
              className="py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-xs border-2 border-[#253542] cursor-pointer"
            >
              Wardrobe
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenRewards}
              className="py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-xs border-2 border-[#253542] cursor-pointer"
            >
              Codex &amp; Trophies
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-xs border-2 border-[#253542] cursor-pointer"
            >
              Settings
            </button>
          </div>
          <button
            type="button"
            onClick={onReturnTitle}
            className="w-full py-2.5 rounded-lg bg-[#223440] hover:bg-[#2d4352] text-[#f6eedb] font-semibold text-sm border-2 border-[#141e25] cursor-pointer"
          >
            Return to Title
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  level: LevelDef;
  summary: CompletionSummary;
  hasNextLevel: boolean;
  activeMode?: 'campaign' | 'custom' | 'playtest' | 'daily_rift' | 'duel';
  duelResult?: EchoDuelRecord | null;
  lastRunReplay?: LumaReplayFile | null;
  onReturnToForge?: () => void;
  onContinue: () => void;
  onReplay: () => void;
  onOpenLevels?: () => void;
  onOpenWardrobe?: (cosmeticId?: CosmeticId) => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  summary,
  hasNextLevel,
  activeMode = 'campaign',
  duelResult = null,
  lastRunReplay = null,
  onReturnToForge,
  onContinue,
  onReplay,
  onOpenLevels,
  onOpenWardrobe,
  onReturnTitle,
}) => {
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const [revealStep, setRevealStep] = useState<number>(prefersReducedMotion ? 4 : 1);
  const { rating } = summary;
  const world = getWorldForLevelId(level.id);

  useEffect(() => {
    if (prefersReducedMotion) {
      setRevealStep(4);
      if (rating.stars === 3) {
        audioEngine.playMasteryThreeStar();
      } else {
        audioEngine.playStarEarned(rating.stars > 0 ? (rating.stars as 1 | 2 | 3) : 1);
      }
      if (summary.newlyUnlockedMilestones.length > 0) {
        audioEngine.playCosmeticUnlock();
      }
      if (summary.newlyUnlockedAchievements.length > 0) {
        audioEngine.playAchievementUnlock();
      }
      return;
    }

    setRevealStep(1);
    audioEngine.playStarEarned(1);

    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setRevealStep(2);
        if (rating.metActionTarget) {
          audioEngine.playStarEarned(2);
        }
      }, 240)
    );
    timers.push(
      window.setTimeout(() => {
        setRevealStep(3);
        if (rating.metTimeTarget) {
          audioEngine.playStarEarned(rating.stars === 3 ? 3 : 2);
        }
      }, 480)
    );
    timers.push(
      window.setTimeout(() => {
        setRevealStep(4);
        if (rating.stars === 3) {
          audioEngine.playMasteryThreeStar();
        } else if (
          !summary.isFirstCompletion &&
          (summary.isNewBestTime || summary.isNewBestActions || summary.improvedStars)
        ) {
          audioEngine.playNewRecord();
        }
        if (summary.newlyUnlockedMilestones.length > 0) {
          audioEngine.playCosmeticUnlock();
        }
        if (summary.newlyUnlockedAchievements.length > 0) {
          audioEngine.playAchievementUnlock();
        }
      }, 740)
    );

    return () => {
      timers.forEach((id) => clearTimeout(id));
    };
  }, [prefersReducedMotion, rating, summary]);

  const revealedStars = useMemo(() => {
    if (revealStep >= 4) return rating.stars;
    let count = 1;
    if (revealStep >= 2 && rating.metActionTarget) count += 1;
    if (revealStep >= 3 && rating.metTimeTarget) count += 1;
    return Math.min(rating.stars, count) as 0 | 1 | 2 | 3;
  }, [rating.metActionTarget, rating.metTimeTarget, rating.stars, revealStep]);

  const formattedTime = formatDurationSeconds(rating.clearSeconds);
  const formattedTargetTime = formatDurationSeconds(rating.timeTargetSeconds);
  const firstMilestone = summary.newlyUnlockedMilestones[0];
  const firstAchievement = summary.newlyUnlockedAchievements[0];
  const firstHero = summary.newlyUnlockedCharacters[0]
    ? getCharacterById(summary.newlyUnlockedCharacters[0])
    : null;

  const statusHeadline =
    activeMode === 'playtest'
      ? 'Playtest Verified · Zero Campaign Rewards'
      : activeMode === 'duel' && duelResult
      ? duelResult.challengerWon
        ? 'Echo Duel Won · Record Surpassed'
        : 'Echo Duel Complete'
      : activeMode === 'daily_rift'
      ? 'Daily Rift Cleared'
      : activeMode === 'custom'
      ? 'Custom Sanctum Cleared'
      : rating.stars === 3
      ? 'Island Mastered · 3 / 3 Stars'
      : summary.improvedStars && summary.previousBestStars > 0
      ? `Star Rating Improved (${summary.previousBestStars}★ → ${rating.stars}★)`
      : summary.isFirstCompletion
      ? `First Clear · ${rating.stars} / 3 Stars`
      : `Completed · ${rating.stars} / 3 Stars`;

  return (
    <div className="fixed inset-0 z-30 bg-[#122029]/60 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Island Restored"
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <CrystalIcon active className="w-9 h-9 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#178a80]">
                {activeMode === 'playtest'
                  ? 'World Forge · Playtest'
                  : activeMode === 'duel'
                  ? 'Echo Duel · Async Ghost Race'
                  : activeMode === 'daily_rift'
                  ? 'Daily Rift · Seeded Run'
                  : activeMode === 'custom'
                  ? 'Community Foundry · Clear'
                  : `W${world.order} · ${hasNextLevel ? 'Crystal Restored' : 'Echo Trials Conquered'}`}
              </p>
              <h2 className="font-display text-2xl font-bold leading-tight">{level.title}</h2>
            </div>
          </div>
          {activeMode === 'campaign' && (
            <div className="text-right shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                Campaign Stars
              </div>
              <div className="text-sm font-extrabold tabular-nums text-[#1f2d38]">
                {summary.totalStarsAfter} / {MAX_CAMPAIGN_STARS} ★
              </div>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[#43535e] mb-3.5">
          {activeMode === 'playtest'
            ? 'Playtest completed! Your stage works cleanly and has been marked Playtest Verified.'
            : activeMode !== 'campaign'
            ? 'Sanctum restored! Export a Replay Ghost to challenge friends offline or continue exploring.'
            : hasNextLevel
            ? 'Ancient energy flows through the sanctum once more. Review your mastery challenges below.'
            : `All ${LEVELS.length} floating sanctuaries across the six worlds now blaze with harmony.`}
        </p>

        {/* Star Reveal Card + Rewards Strip */}
        <div className="rounded-lg bg-[#efe6cf] border-2 border-[#1f2d38] p-4 mb-3 flex flex-col items-center text-center">
          {activeMode === 'campaign' && (
            <StarRating
              stars={rating.stars}
              revealedUpTo={revealedStars}
              size="lg"
              className="gap-2.5"
            />
          )}
          <div
            data-testid="victory-status-headline"
            className="mt-1 font-display text-base font-bold text-[#1f2d38]"
          >
            {statusHeadline}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            {activeMode === 'campaign' ? (
              <span
                data-testid="victory-shards-earned"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#f8f1df] border border-[#253542] text-[#9b6a24] tabular-nums"
              >
                <ShardIcon className="w-3.5 h-3.5" />+{summary.lumaShardsEarned} Luma Shards
              </span>
            ) : (
              <span
                data-testid="victory-shards-earned"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#f8f1df] border border-[#253542] text-[#4b5c68] tabular-nums"
              >
                0 Campaign Shards (Sandbox / Unbound Mode)
              </span>
            )}
            {summary.echoCollectedInRun && (
              <span
                data-testid="victory-echo-collected"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#f3e8ff] border border-[#7c3aed] text-[#5b21b6]"
              >
                <EchoIcon collected className="w-3.5 h-3.5" />
                Echo Fragment Secured
              </span>
            )}
          </div>
        </div>

        {/* Echo Duel Comparison & PNG Scorecard */}
        {activeMode === 'duel' && duelResult && (
          <div
            data-testid="victory-duel-comparison"
            className="rounded-lg bg-[#1d2d37] border-2 border-[#ebb652] p-3.5 mb-3 text-[#f6eedb] space-y-2"
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#ebb652]">
              <span>Echo Duel Comparison</span>
              <span>{duelResult.verifiedReplay ? 'Deterministic Verified' : 'Visual Reference'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
              <div className="rounded bg-[#132028] p-2 border border-[#324957]">
                <div className="text-[10px] uppercase text-[#9ab4bf]">Rival ({duelResult.creatorAlias})</div>
                <div className="font-extrabold text-base">{duelResult.creatorTime.toFixed(1)}s</div>
                <div className="text-[11px] text-[#cbe5ea]">{duelResult.creatorActions} Actions</div>
              </div>
              <div className="rounded bg-[#132028] p-2 border border-[#24c9b8]">
                <div className="text-[10px] uppercase text-[#66e6d5]">Your Run</div>
                <div className="font-extrabold text-base">{duelResult.challengerTime.toFixed(1)}s</div>
                <div className="text-[11px] text-[#cbe5ea]">{duelResult.challengerActions} Actions</div>
              </div>
            </div>
            <button
              type="button"
              data-testid="victory-download-scorecard-btn"
              onClick={() => downloadDuelScorecardPng(duelResult)}
              className="w-full py-2 rounded bg-[#ebb652] hover:bg-[#f5c467] text-[#1a262e] font-extrabold text-xs uppercase tracking-wider cursor-pointer"
            >
              Download PNG Scorecard
            </button>
          </div>
        )}

        {/* Challenge Breakdown: Action + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <div
            className={`rounded-lg border-2 p-3 transition-opacity duration-300 ${
              revealStep >= 2 ? 'opacity-100' : 'opacity-40'
            } ${
              rating.metActionTarget
                ? 'bg-[#e3f2ed] border-[#178a80]'
                : 'bg-[#e9dec4] border-[#253542]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#4b5c68]">
              <span>Action Challenge</span>
              <span className={rating.metActionTarget ? 'text-[#13756c]' : 'text-[#7c5824]'}>
                {rating.metActionTarget ? '★ Earned' : 'Missed'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-extrabold tabular-nums text-[#1f2d38]">
                {rating.actionsUsed} ACT
              </span>
              <span className="text-xs font-bold tabular-nums text-[#5b6973]">
                Target ≤ {rating.actionTarget}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#5b6973] tabular-nums">
              {!summary.isFirstCompletion &&
              summary.isNewBestActions &&
              summary.previousBestActions !== undefined
                ? `New Best! (Prev: ${summary.previousBestActions})`
                : summary.previousBestActions !== undefined
                ? `Personal Best: ${Math.min(summary.previousBestActions, rating.actionsUsed)} ACT`
                : 'First Record Set'}
            </div>
          </div>

          <div
            className={`rounded-lg border-2 p-3 transition-opacity duration-300 ${
              revealStep >= 3 ? 'opacity-100' : 'opacity-40'
            } ${
              rating.metTimeTarget
                ? 'bg-[#e3f2ed] border-[#178a80]'
                : 'bg-[#e9dec4] border-[#253542]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#4b5c68]">
              <span>Time Challenge</span>
              <span className={rating.metTimeTarget ? 'text-[#13756c]' : 'text-[#7c5824]'}>
                {rating.metTimeTarget ? '★ Earned' : 'Missed'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-extrabold tabular-nums text-[#1f2d38]">
                {formattedTime}
              </span>
              <span className="text-xs font-bold tabular-nums text-[#5b6973]">
                Target ≤ {formattedTargetTime}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#5b6973] tabular-nums">
              {!summary.isFirstCompletion &&
              summary.isNewBestTime &&
              summary.previousBestTime !== undefined
                ? `New Best! (Prev: ${formatDurationSeconds(summary.previousBestTime)})`
                : summary.previousBestTime !== undefined
                ? `Personal Best: ${formatDurationSeconds(
                    Math.min(summary.previousBestTime, rating.clearSeconds)
                  )}`
                : 'First Record Set'}
            </div>
          </div>
        </div>

        {/* Newly Unlocked Hero Banner */}
        {firstHero && revealStep >= 4 && (
          <div className="mb-2.5 rounded-lg bg-[#1d2d37] border-2 border-[#4ce07b] p-3 text-[#f6eedb] flex items-center gap-3">
            <HeroBadgeIcon color={firstHero.accentHex} className="w-7 h-7 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7ef5a2]">
                New Companion Unlocked
              </div>
              <div className="font-display text-sm font-bold truncate">
                {firstHero.name} · {firstHero.abilityName}
              </div>
            </div>
          </div>
        )}

        {/* Newly Unlocked Achievement Banner */}
        {firstAchievement && revealStep >= 4 && (
          <div className="mb-2.5 rounded-lg bg-[#243642] border-2 border-[#24c9b8] p-3 text-[#f6eedb] flex items-center gap-3">
            <TrophyIcon className="w-6 h-6 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#53f0de]">
                Trophy Unlocked
                {summary.newlyUnlockedAchievements.length > 1
                  ? ` (+${summary.newlyUnlockedAchievements.length - 1} more)`
                  : ''}
              </div>
              <div className="font-display text-sm font-bold truncate">
                {firstAchievement.title}
              </div>
            </div>
          </div>
        )}

        {/* Newly Unlocked Cosmetic Milestone Notification */}
        {firstMilestone && revealStep >= 4 && (
          <div
            data-testid="victory-milestone-banner"
            className="mb-3 rounded-lg bg-[#1d2d37] border-2 border-[#ebb652] p-3 text-[#f6eedb] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <WardrobeIcon className="w-7 h-7 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ebb652]">
                  {firstMilestone.subtitle}
                </div>
                <div className="font-display text-sm font-bold truncate">
                  {firstMilestone.title}
                  {summary.newlyUnlockedMilestones.length > 1
                    ? ` (+${summary.newlyUnlockedMilestones.length - 1} more)`
                    : ''}
                </div>
              </div>
            </div>
            {onOpenWardrobe && (
              <button
                type="button"
                onClick={() => onOpenWardrobe(firstMilestone.cosmeticId)}
                className="px-3 py-1.5 rounded-md bg-[#ebb652] hover:bg-[#f5c467] text-[#1a262e] font-extrabold text-xs uppercase tracking-wider border border-[#141e25] shrink-0 cursor-pointer"
              >
                Open Wardrobe
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {activeMode === 'playtest' && onReturnToForge ? (
            <button
              type="button"
              data-start="true"
              onClick={onReturnToForge}
              className="w-full py-3 rounded-lg bg-[#24c9b8] hover:bg-[#33d9c8] text-[#112329] font-extrabold text-sm uppercase tracking-wider border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] cursor-pointer"
            >
              Return to World Forge
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onContinue}
              className="w-full py-3 rounded-lg bg-[#24c9b8] hover:bg-[#33d9c8] text-[#112329] font-extrabold text-sm uppercase tracking-wider border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] cursor-pointer"
            >
              {activeMode !== 'campaign'
                ? 'Back to Showcase'
                : hasNextLevel
                ? 'Continue to Next Island'
                : 'Play From Beginning'}
            </button>
          )}
          {lastRunReplay && (
            <button
              type="button"
              data-testid="victory-export-replay-btn"
              onClick={() =>
                triggerTextDownload(
                  `${level.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.luma-replay`,
                  JSON.stringify(lastRunReplay, null, 2)
                )
              }
              className="w-full py-2 rounded-lg bg-[#1d2d37] hover:bg-[#2a3f4c] text-[#f6eedb] font-bold text-xs uppercase tracking-wider border-2 border-[#141e25] cursor-pointer"
            >
              Export {lastRunReplay.verified ? 'Verified ' : ''}.luma-replay (
              {lastRunReplay.frames.length} ticks)
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="flex-1 py-2.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-sm border-2 border-[#253542] cursor-pointer"
            >
              Replay
            </button>
            {onOpenLevels && activeMode === 'campaign' && (
              <button
                type="button"
                onClick={onOpenLevels}
                className="flex-1 py-2.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-semibold text-sm border-2 border-[#253542] cursor-pointer"
              >
                Atlas
              </button>
            )}
            <button
              type="button"
              onClick={onReturnTitle}
              className="flex-1 py-2.5 rounded-lg bg-[#223440] hover:bg-[#2d4352] text-[#f6eedb] font-semibold text-sm border-2 border-[#141e25] cursor-pointer"
            >
              Title
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LevelSelectModalProps {
  progress: SaveProgress;
  currentLevelId: number;
  onSelectLevel: (levelId: number, useCheckpoint?: boolean) => void;
  onOpenWardrobe: () => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  currentLevelId,
  onSelectLevel,
  onOpenWardrobe,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'atlas' | 'records'>('atlas');
  const initialWorld = getWorldForLevelId(currentLevelId);
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>(initialWorld.id);
  const [selectedLevelId, setSelectedLevelId] = useState<number>(currentLevelId);
  const [filterMode, setFilterMode] = useState<'all' | 'stars_missing' | 'echo_missing'>('all');

  const totalStars = getTotalStars(progress.masteryRecords);
  const threeStarCount = getThreeStarLevelCount(progress.masteryRecords);
  const collectedEchoIds = new Set(progress.collectedEchoFragments ?? []);

  const selectedWorld = WORLDS.find((w) => w.id === selectedWorldId) ?? WORLDS[0];
  const worldLevels = useMemo(
    () =>
      LEVELS.filter((l) => {
        if (l.worldId !== selectedWorld.id) return false;
        if (filterMode === 'stars_missing') {
          return (progress.masteryRecords[l.id]?.bestStars ?? 0) < 3;
        }
        if (filterMode === 'echo_missing') {
          return Boolean(l.echoFragment) && !collectedEchoIds.has(l.echoFragment!.id);
        }
        return true;
      }),
    [collectedEchoIds, filterMode, progress.masteryRecords, selectedWorld.id]
  );

  const selectedLevel = LEVELS.find((l) => l.id === selectedLevelId) ?? LEVELS[0];
  const selectedUnlocked = selectedLevel.id <= progress.highestUnlockedLevel;
  const selectedCompleted = progress.completedLevels.includes(selectedLevel.id);
  const selectedRecord = progress.masteryRecords[selectedLevel.id];
  const selectedTarget = getMasteryTargetForLevel(selectedLevel.id);
  const selectedBestTime = selectedRecord?.bestTime ?? progress.bestTimes[selectedLevel.id];
  const selectedCheckpoint = progress.checkpoints?.[selectedLevel.id];
  const selectedSessions = progress.sessionHistory?.[selectedLevel.id] ?? [];
  const selectedEchoFound =
    Boolean(selectedLevel.echoFragment) &&
    collectedEchoIds.has(selectedLevel.echoFragment!.id);

  const handleSelectWorld = (worldId: WorldId) => {
    audioEngine.playUiClick();
    setSelectedWorldId(worldId);
    const w = WORLDS.find((item) => item.id === worldId);
    if (w) {
      setSelectedLevelId(w.levelRange[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#122029]/60 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="World Atlas — Select Floating Island"
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
              World Atlas · {progress.completedLevels.length} / {LEVELS.length} Restored ·{' '}
              <span data-testid="atlas-total-stars">
                {totalStars} / {MAX_CAMPAIGN_STARS} ★
              </span>
            </p>
            <h2 className="font-display text-2xl font-bold">Floating Worlds</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border-2 border-[#253542] overflow-hidden bg-[#e7dcc2]">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playUiClick();
                  setActiveTab('atlas');
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase cursor-pointer ${
                  activeTab === 'atlas'
                    ? 'bg-[#1d2d37] text-[#f6eedb]'
                    : 'text-[#1f2d38] hover:bg-[#efe6cf]'
                }`}
              >
                Worlds &amp; Stages
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playUiClick();
                  setActiveTab('records');
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-[#1d2d37] text-[#f6eedb]'
                    : 'text-[#1f2d38] hover:bg-[#efe6cf]'
                }`}
              >
                <RecordsIcon className="w-3.5 h-3.5" />
                <span>Records</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenWardrobe}
              className="px-3 py-1.5 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] font-bold text-xs uppercase border-2 border-[#1f2d38] flex items-center gap-1.5 cursor-pointer"
            >
              <WardrobeIcon className="w-3.5 h-3.5" />
              <span>Wardrobe</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'records' ? (
          <RecordsView progress={progress} />
        ) : (
          <div className="flex flex-col gap-3 min-h-0 flex-1">
            {/* 6-World Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="tablist">
              {WORLDS.map((w) => {
                const worldUnlocked = progress.highestUnlockedLevel >= w.levelRange[0];
                const isSelected = w.id === selectedWorldId;
                const wLevels = LEVELS.filter((l) => l.worldId === w.id);
                const wStars = wLevels.reduce(
                  (acc, l) => acc + (progress.masteryRecords[l.id]?.bestStars ?? 0),
                  0
                );
                const wEchoes = wLevels.filter(
                  (l) => l.echoFragment && collectedEchoIds.has(l.echoFragment.id)
                ).length;

                return (
                  <button
                    key={w.id}
                    type="button"
                    role="tab"
                    data-testid={`atlas-world-tab-${w.id}`}
                    aria-selected={isSelected}
                    onClick={() => handleSelectWorld(w.id)}
                    className={`rounded-lg border-2 p-2 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38] shadow-[0_2px_0_#111b21]'
                        : worldUnlocked
                        ? 'bg-[#efe6cf] hover:bg-[#f7f0dc] text-[#1f2d38] border-[#253542]'
                        : 'bg-[#e0d7c1]/75 hover:bg-[#eae1cc] text-[#5e5c54] border-[#8b877c]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider">
                      <span style={{ color: isSelected ? '#ebb652' : w.badgeColor }}>
                        World {w.order}
                      </span>
                      <span className="tabular-nums opacity-85">{wStars}/30 ★</span>
                    </div>
                    <div className="font-display text-xs font-bold truncate mt-0.5">{w.name}</div>
                    <div className="text-[10px] opacity-75 tabular-nums mt-0.5">
                      {worldUnlocked ? `Echo ${wEchoes}/10` : 'Locked'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* World Subtitle + Filter Bar */}
            <div className="rounded-lg bg-[#efe6cf] border-2 border-[#253542] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-display font-bold text-[#1f2d38] mr-2">
                  {selectedWorld.name}
                </span>
                <span className="text-[#4b5c68]">{selectedWorld.description}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-[#9b6a24] tabular-nums mr-1">
                  {threeStarCount} / {LEVELS.length} · 3★
                </span>
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'stars_missing', label: 'Missing ★' },
                    { id: 'echo_missing', label: 'Echo Missing' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterMode(f.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase border cursor-pointer ${
                      filterMode === f.id
                        ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                        : 'bg-[#f7f0dd] text-[#1f2d38] border-[#253542]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage List + Right Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_295px] gap-4 min-h-0 flex-1">
              <div className="flex flex-col gap-2 max-h-[44vh] overflow-y-auto pr-1 pb-1">
                {worldLevels.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-[#8b877c] p-6 text-center text-xs font-semibold text-[#5b6973]">
                    Every stage in {selectedWorld.name} satisfies this filter.
                  </div>
                ) : (
                  worldLevels.map((lvl) => {
                    const unlocked = lvl.id <= progress.highestUnlockedLevel;
                    const completed = progress.completedLevels.includes(lvl.id);
                    const rec = progress.masteryRecords[lvl.id];
                    const stars = rec?.bestStars ?? 0;
                    const bestTime = rec?.bestTime ?? progress.bestTimes[lvl.id];
                    const bestActions = rec?.bestActions;
                    const isSelected = lvl.id === selectedLevelId;
                    const isCurrent = lvl.id === currentLevelId;
                    const echoFound =
                      Boolean(lvl.echoFragment) &&
                      collectedEchoIds.has(lvl.echoFragment!.id);

                    return (
                      <div
                        key={lvl.id}
                        className={`rounded-lg border-2 transition-colors flex items-center justify-between gap-2 px-3 py-2 ${
                          !unlocked
                            ? 'bg-[#dfd6c1]/70 border-[#8b877c] text-[#6d6d66] opacity-80'
                            : isSelected
                            ? 'bg-[#fff8e6] border-[#1f2d38] shadow-[0_3px_0_#1f2d38]'
                            : 'bg-[#efe6cf] hover:bg-[#f7f0dc] border-[#253542]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playUiClick();
                            setSelectedLevelId(lvl.id);
                          }}
                          className="flex-1 min-w-0 text-left flex items-center gap-3 cursor-pointer"
                        >
                          <CrystalIcon active={completed} className="w-6 h-6 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24] flex items-center gap-1.5">
                              <span>
                                {lvl.subtitle} {isCurrent ? '· Active' : ''}
                              </span>
                              {lvl.echoFragment && (
                                <EchoIcon collected={echoFound} className="w-3.5 h-3.5 inline" />
                              )}
                            </div>
                            <div className="font-display text-sm font-bold leading-snug truncate">
                              {lvl.title}
                            </div>
                            {completed && (
                              <div className="text-[11px] font-semibold text-[#4b5c68] tabular-nums mt-0.5">
                                {bestTime !== undefined
                                  ? `Best ${formatDurationSeconds(bestTime)}`
                                  : 'Cleared'}
                                {bestActions !== undefined
                                  ? ` · ${bestActions} ACT`
                                  : stars === 0
                                  ? ' · Unrated'
                                  : ''}
                              </div>
                            )}
                          </div>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          {unlocked ? (
                            <>
                              <StarRating stars={stars} size="sm" />
                              <button
                                type="button"
                                onClick={() => onSelectLevel(lvl.id)}
                                aria-label={`Play ${lvl.title}`}
                                className="px-2.5 py-1.5 rounded bg-[#24c9b8] hover:bg-[#33d9c8] text-[#112329] font-extrabold text-[11px] uppercase tracking-wider border border-[#1f2d38] cursor-pointer"
                              >
                                Play
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right: Selected Island Challenge & Echo Panel */}
              <aside
                data-testid="atlas-challenge-panel"
                className="rounded-xl bg-[#efe6cf] border-2 border-[#1f2d38] p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
                      {selectedLevel.subtitle}
                    </span>
                    <StarRating stars={selectedRecord?.bestStars ?? 0} size="sm" />
                  </div>
                  <h3 className="font-display text-lg font-bold leading-tight">
                    {selectedLevel.title}
                  </h3>

                  <div className="mt-2.5 space-y-1.5 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5b6973]">
                      Mastery Challenges
                    </div>
                    <div className="rounded-md bg-[#f7f0dd] border border-[#253542] px-2.5 py-1.5 flex justify-between items-center">
                      <span className="font-semibold">Complete Island</span>
                      <span className="font-bold text-[#178a80]">
                        {selectedCompleted ? 'Cleared' : '1 ★'}
                      </span>
                    </div>
                    <div className="rounded-md bg-[#f7f0dd] border border-[#253542] px-2.5 py-1.5 flex justify-between items-center tabular-nums">
                      <span className="font-semibold">Action Target</span>
                      <span className="font-extrabold">≤ {selectedTarget.actionTarget} ACT</span>
                    </div>
                    <div className="rounded-md bg-[#f7f0dd] border border-[#253542] px-2.5 py-1.5 flex justify-between items-center tabular-nums">
                      <span className="font-semibold">Time Target</span>
                      <span className="font-extrabold">
                        ≤ {formatDurationSeconds(selectedTarget.timeTargetSeconds)}
                      </span>
                    </div>

                    {selectedLevel.echoFragment && (
                      <div className="rounded-md bg-[#f7f0dd] border border-[#253542] px-2.5 py-1.5 flex justify-between items-center">
                        <span className="font-semibold flex items-center gap-1.5">
                          <EchoIcon collected={selectedEchoFound} className="w-3.5 h-3.5" />
                          <span>Echo Fragment</span>
                        </span>
                        <span
                          className={`font-bold ${
                            selectedEchoFound ? 'text-[#7c3aed]' : 'text-[#6b6252]'
                          }`}
                        >
                          {selectedEchoFound ? 'Found' : 'Hidden'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-[#d3c5a3] text-xs space-y-1 tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-[#4b5c68]">Best Time</span>
                      <span className="font-bold">
                        {selectedBestTime !== undefined
                          ? formatDurationSeconds(selectedBestTime)
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4b5c68]">Best Actions</span>
                      <span className="font-bold">
                        {selectedRecord?.bestActions !== undefined
                          ? `${selectedRecord.bestActions} ACT`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Resumable Checkpoint Badge */}
                  {selectedUnlocked && selectedCheckpoint && (
                    <div
                      data-testid="atlas-checkpoint-box"
                      className="mt-2.5 rounded-lg bg-[#fff8e6] border border-[#e8a838] px-2.5 py-2 text-[11px]"
                    >
                      <div className="font-extrabold uppercase tracking-wider text-[#9b6a24]">
                        Saved Checkpoint Ready
                      </div>
                      <div className="text-[#43535e] tabular-nums mt-0.5">
                        {formatDurationSeconds(selectedCheckpoint.elapsedSeconds)} ·{' '}
                        {selectedCheckpoint.interactionsCount} ACT ·{' '}
                        {getCharacterById(selectedCheckpoint.characterId).name}
                      </div>
                    </div>
                  )}

                  {/* Compact Session History (Max 5 per stage) */}
                  {selectedSessions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#d3c5a3]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5b6973] mb-1">
                        Recent Sessions ({selectedSessions.length})
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5 text-[10px]">
                        {selectedSessions.map((sess) => (
                          <div
                            key={sess.id}
                            className="flex items-center justify-between gap-1.5 rounded bg-[#f7f0dd] px-2 py-1 tabular-nums"
                          >
                            <span className="font-bold text-[#1f2d38] truncate">
                              {sess.outcome === 'completed'
                                ? `${sess.starsEarned}★ Clear`
                                : sess.outcome === 'checkpoint_saved'
                                ? 'Checkpoint'
                                : 'Left Run'}
                            </span>
                            <span className="text-[#4b5c68] shrink-0">
                              {formatDurationSeconds(sess.clearSeconds)} · {sess.actionsUsed} ACT
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedUnlocked && selectedCheckpoint ? (
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      data-testid="atlas-resume-checkpoint-btn"
                      onClick={() => onSelectLevel(selectedLevel.id, true)}
                      className="w-full py-2.5 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-xs uppercase tracking-wider border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] cursor-pointer"
                    >
                      Resume Checkpoint
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectLevel(selectedLevel.id, false)}
                      className="w-full py-2 rounded-lg bg-[#f7f0dd] hover:bg-[#fff8e6] text-[#1f2d38] font-bold text-[11px] uppercase tracking-wider border-2 border-[#253542] cursor-pointer"
                    >
                      Start Fresh
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!selectedUnlocked}
                    onClick={() => onSelectLevel(selectedLevel.id, false)}
                    className={`w-full py-2.5 rounded-lg font-extrabold text-xs uppercase tracking-wider border-2 ${
                      selectedUnlocked
                        ? 'bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] border-[#1f2d38] shadow-[0_3px_0_#1f2d38] cursor-pointer'
                        : 'bg-[#d5ccb8] text-[#6d6a62] border-[#8b877c] cursor-not-allowed'
                    }`}
                  >
                    {selectedUnlocked ? 'Enter Island' : 'Island Locked'}
                  </button>
                )}
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SettingsModalProps {
  settings: GameSettings;
  progress: SaveProgress;
  onUpdateSettings: (next: GameSettings) => void;
  onImportProgress: (imported: SaveProgress) => void;
  onRestoreBackup: () => { ok: boolean; error?: string };
  onResetProgress: () => void;
  onDeleteAllLocalData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  progress,
  onUpdateSettings,
  onImportProgress,
  onRestoreBackup,
  onResetProgress,
  onDeleteAllLocalData,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [diag, setDiag] = useState<LocalStorageDiagnostics | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    kind: 'info' | 'error';
    text: string;
  } | null>(null);
  const [importPreview, setImportPreview] = useState<{
    progress: SaveProgress;
    summary: ImportPreviewSummary;
  } | null>(null);
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);

  const refreshDiagnostics = () => {
    void getLocalStorageDiagnostics().then((d) => setDiag(d));
  };

  useEffect(() => {
    refreshDiagnostics();
  }, [progress]);

  const handleExport = () => {
    audioEngine.playUiClick();
    const jsonText = exportSavePayload(progress, validateSaveProgress);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luma-save-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatusMessage({ kind: 'info', text: 'Save file exported as JSON.' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const result = parseAndValidateImport(content, validateSaveProgress);
      if (result.ok === false) {
        setImportPreview(null);
        setStatusMessage({ kind: 'error', text: result.error });
        return;
      }
      setStatusMessage(null);
      setImportPreview({ progress: result.progress, summary: result.summary });
    };
    reader.readAsText(file);
  };

  const handleRequestPersist = async () => {
    audioEngine.playUiClick();
    const res = await requestBrowserPersistentStorage();
    if (!res.supported) {
      setStatusMessage({
        kind: 'info',
        text: 'Persistent Storage API is not supported by this browser; standard localStorage remains active.',
      });
    } else if (res.granted) {
      setStatusMessage({
        kind: 'info',
        text: 'Browser persistent storage granted — local save is protected from automatic eviction.',
      });
    } else {
      setStatusMessage({
        kind: 'info',
        text: 'Browser declined persistent storage lock; export periodic JSON backups for safekeeping.',
      });
    }
    refreshDiagnostics();
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#122029]/60 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game Settings & Local Save Manager"
        data-testid="settings-modal"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-6 text-[#1f2d38]"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b6a24]">
              Preferences &amp; Local Privacy
            </p>
            <h2 className="font-display text-2xl font-bold">Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
          >
            Done
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="flex items-center justify-between p-3 rounded-lg bg-[#efe6cf] border-2 border-[#253542] cursor-pointer">
            <span className="font-semibold text-sm">Sound Effects</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
              }
              className="w-5 h-5 accent-[#1f2d38]"
            />
          </label>

          <label className="flex flex-col gap-1.5 p-3 rounded-lg bg-[#efe6cf] border-2 border-[#253542]">
            <div className="flex justify-between text-sm font-semibold">
              <span>Volume</span>
              <span className="tabular-nums">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, volume: Number(e.target.value) })
              }
              className="accent-[#1f2d38]"
            />
          </label>

          <label className="flex flex-col gap-1.5 p-3 rounded-lg bg-[#efe6cf] border-2 border-[#253542]">
            <div className="flex justify-between text-sm font-semibold">
              <span>Camera Zoom</span>
              <span className="tabular-nums">{Math.round((1 + settings.cameraZoomOffset) * 100)}%</span>
            </div>
            <input
              type="range"
              min={-0.2}
              max={0.3}
              step={0.05}
              value={settings.cameraZoomOffset}
              onChange={(e) =>
                onUpdateSettings({ ...settings, cameraZoomOffset: Number(e.target.value) })
              }
              className="accent-[#1f2d38]"
            />
          </label>

          {/* Local-First Save Manager */}
          <div className="rounded-xl bg-[#efe6cf] border-2 border-[#1f2d38] p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
                Zero Login · Zero Server · Local Browser Only
              </p>
              <h3 className="font-display text-base font-bold">Local Save Manager</h3>
            </div>

            {diag && (
              <div className="rounded-lg bg-[#f7f0dd] border border-[#253542]/40 px-3 py-2 text-[11px] space-y-0.5 tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#4b5c68]">Storage Status</span>
                  <span className="font-bold text-[#13756c]">
                    {diag.available ? 'Browser LocalStorage Active' : 'Unavailable (Incognito/Blocked)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4b5c68]">Primary / Backup Footprint</span>
                  <span className="font-bold">
                    {(diag.primaryBytes / 1024).toFixed(1)} KB / {(diag.backupBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4b5c68]">Persistent Storage Lock</span>
                  <span className="font-bold">
                    {diag.isPersisted === true
                      ? 'Granted'
                      : diag.persistedSupported
                      ? 'Not Locked'
                      : 'Unsupported'}
                  </span>
                </div>
              </div>
            )}

            {statusMessage && (
              <div
                data-testid="settings-save-status-msg"
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  statusMessage.kind === 'error'
                    ? 'bg-[#f8dedc] border-[#9e2a24] text-[#7c221d]'
                    : 'bg-[#e3f2ed] border-[#178a80] text-[#114f49]'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Import Preview Box */}
            {importPreview && (
              <div
                data-testid="settings-import-preview"
                className="rounded-lg bg-[#fff8e6] border-2 border-[#e8a838] p-3 text-xs space-y-2"
              >
                <div className="font-extrabold uppercase tracking-wider text-[#9b6a24]">
                  Save Import Preview (Schema v{importPreview.summary.schemaVersion})
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] tabular-nums">
                  <span>Stages Cleared: <b>{importPreview.summary.completedCount}</b></span>
                  <span>Stars: <b>{importPreview.summary.totalStars}</b></span>
                  <span>Echoes: <b>{importPreview.summary.echoesCount}</b></span>
                  <span>Shards: <b>{importPreview.summary.lumaShards}</b></span>
                  <span>Checkpoints: <b>{importPreview.summary.checkpointsCount}</b></span>
                  <span>Restored Realms: <b>{importPreview.summary.restoredWorldsCount}/6</b></span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-testid="settings-confirm-import-btn"
                    onClick={() => {
                      audioEngine.playUiClick();
                      onImportProgress(importPreview.progress);
                      setImportPreview(null);
                      setStatusMessage({
                        kind: 'info',
                        text: 'Imported save data applied and persisted locally.',
                      });
                    }}
                    className="flex-1 py-1.5 rounded bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-[11px] uppercase border border-[#1f2d38] cursor-pointer"
                  >
                    Apply Import
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportPreview(null)}
                    className="px-3 py-1.5 rounded bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-[11px] uppercase border border-[#253542] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="settings-export-save-btn"
                onClick={handleExport}
                className="py-2 rounded-lg bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-xs uppercase border-2 border-[#1f2d38] cursor-pointer"
              >
                Export Save (.json)
              </button>
              <button
                type="button"
                data-testid="settings-import-save-btn"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 rounded-lg bg-[#f7f0dd] hover:bg-[#fff8e6] text-[#1f2d38] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
              >
                Import Save (.json)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Import LUMA save JSON file"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="settings-restore-backup-btn"
                onClick={() => {
                  audioEngine.playUiClick();
                  const res = onRestoreBackup();
                  if (res.ok) {
                    setStatusMessage({ kind: 'info', text: 'Restored latest local backup snapshot.' });
                    refreshDiagnostics();
                  } else {
                    setStatusMessage({ kind: 'error', text: res.error ?? 'Backup restore failed.' });
                  }
                }}
                className="py-2 rounded-lg bg-[#f7f0dd] hover:bg-[#fff8e6] text-[#1f2d38] font-bold text-[11px] uppercase border border-[#253542] cursor-pointer"
              >
                Restore Backup
              </button>
              <button
                type="button"
                data-testid="settings-persist-storage-btn"
                onClick={handleRequestPersist}
                className="py-2 rounded-lg bg-[#f7f0dd] hover:bg-[#fff8e6] text-[#1f2d38] font-bold text-[11px] uppercase border border-[#253542] cursor-pointer"
              >
                Request Persistence
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onResetProgress();
                setStatusMessage({ kind: 'info', text: 'Progression reset to Stage 01.' });
              }}
              className="py-2.5 rounded-lg bg-[#e6d5cd] hover:bg-[#ebd0c5] text-[#7c2c24] font-bold text-xs uppercase tracking-wider border-2 border-[#7c2c24] cursor-pointer"
            >
              Reset Progress
            </button>

            {!confirmDeleteStep ? (
              <button
                type="button"
                data-testid="settings-delete-local-btn"
                onClick={() => setConfirmDeleteStep(true)}
                className="py-2.5 rounded-lg bg-[#f3d4d2] hover:bg-[#eec2bf] text-[#7c221d] font-bold text-xs uppercase tracking-wider border-2 border-[#7c221d] cursor-pointer"
              >
                Delete All Local Data
              </button>
            ) : (
              <button
                type="button"
                data-testid="settings-confirm-delete-local-btn"
                onClick={() => {
                  onDeleteAllLocalData();
                  setConfirmDeleteStep(false);
                  setStatusMessage({ kind: 'info', text: 'All local browser save keys erased.' });
                }}
                className="py-2.5 rounded-lg bg-[#9e2a24] hover:bg-[#b5322b] text-[#fff5f5] font-extrabold text-xs uppercase tracking-wider border-2 border-[#591511] cursor-pointer"
              >
                Confirm Erase Everything
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
