import React from 'react';
import { getCharacterById } from '../game/characters';
import { CharacterId, LevelDef, SaveStatus } from '../game/types';
import { getWorldForLevelId } from '../game/worlds';
import { HudSyncSnapshot } from '../three/GameScene';
import {
  CrystalIcon,
  EchoIcon,
  HeroBadgeIcon,
  PauseIcon,
  RestartIcon,
  ShardIcon,
  SoundIcon,
} from './LumaIcons';

interface GameHudProps {
  level: LevelDef;
  hud: HudSyncSnapshot;
  activeCharacterId: CharacterId;
  echoPreviouslyCollected: boolean;
  lumaShards: number;
  muted: boolean;
  hideBottomHints?: boolean;
  isHubMode?: boolean;
  hubAreaTitle?: string | null;
  hubTierLabel?: string;
  trackedQuest?: {
    title: string;
    stepText: string;
    waypointLabel?: string;
  } | null;
  saveStatus?: SaveStatus;
  activePlayerTitle?: string | null;
  onOpenJournal?: () => void;
  onOpenWorldMap?: () => void;
  onEnterHub?: () => void;
  onTriggerAbility: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onPause: () => void;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function formatSaveStatusText(status: SaveStatus): { label: string; colorClass: string } {
  switch (status) {
    case 'saving':
      return { label: 'Saving...', colorClass: 'text-[#ebb652]' };
    case 'saved':
      return { label: 'Saved locally', colorClass: 'text-[#66e6d5]' };
    case 'failed':
      return { label: 'Save failed', colorClass: 'text-[#fca5a5]' };
    case 'unavailable':
      return { label: 'Storage unavailable', colorClass: 'text-[#fcd34d]' };
    case 'idle':
    default:
      return { label: 'Local Save', colorClass: 'text-[#cbe5ea]' };
  }
}

export const GameHud: React.FC<GameHudProps> = ({
  level,
  hud,
  activeCharacterId,
  echoPreviouslyCollected,
  lumaShards,
  muted,
  hideBottomHints = false,
  isHubMode = false,
  hubAreaTitle,
  hubTierLabel = 'Dormant',
  trackedQuest,
  saveStatus = 'saved',
  activePlayerTitle,
  onOpenJournal,
  onOpenWorldMap,
  onEnterHub,
  onTriggerAbility,
  onToggleMute,
  onRestart,
  onPause,
}) => {
  const objective = isHubMode
    ? 'Explore The Convergence, converse with Keepers [E], or enter any Northern World Portal.'
    : hud.crystalRestored
    ? level.objectiveCrystalDone
    : level.objectiveDefault;
  const world = getWorldForLevelId(level.id);
  const hero = getCharacterById(activeCharacterId);
  const hasEcho = !isHubMode && Boolean(level.echoFragment);
  const echoFound = hud.echoCollectedInRun || echoPreviouslyCollected;
  const onCooldown = hud.abilityCooldown > 0.05;
  const abilityActive = hud.abilityActiveTimer > 0.05;
  const saveBadge = formatSaveStatusText(saveStatus);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      {/* Top Row: Left Objective Plaque (+ Tracked Quest) + Right Utility Buttons */}
      <div className="flex flex-col-reverse items-stretch sm:flex-row sm:items-start sm:justify-between gap-2.5 sm:gap-4">
        {/* Left Column: Main Plaque + Unobtrusive Tracked Quest Tracker */}
        <div className="pointer-events-auto w-full sm:max-w-[420px] flex flex-col gap-2">
          <div className="rounded-lg bg-[#1d2d37]/92 border-2 border-[#d8a13f]/80 px-4 py-3 shadow-[0_4px_14px_rgba(14,24,30,0.35)] text-[#f6eedb]">
            <div className="flex items-start justify-between gap-3 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ebb652] leading-snug">
                {isHubMode
                  ? `THE CONVERGENCE · ${hubTierLabel}`
                  : `W${world.order} · ${level.subtitle}`}
              </span>
              {!isHubMode && (
                <div className="flex items-center gap-2 text-xs font-bold tabular-nums text-[#cbe5ea] shrink-0">
                  <span data-testid="hud-timer">{formatTime(hud.elapsedSeconds)}</span>
                  <span className="text-[#698694]">·</span>
                  <span data-testid="hud-actions" title="Mechanism Interactions">
                    {Math.round(hud.interactionsCount)} ACT
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <CrystalIcon active={isHubMode || hud.crystalRestored} className="w-6 h-6 shrink-0" />
              <h2 className="font-display text-lg font-bold tracking-wide text-[#fbf5e6] leading-tight">
                {isHubMode ? hubAreaTitle || 'Central Sanctuary' : level.title}
              </h2>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-[#d7e5ea]">{objective}</p>

            {/* Compact Hero, Title, Echo & Shards Readout */}
            <div className="mt-2 pt-2 border-t border-[#324957] flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#cbe5ea]">
              <span className="inline-flex items-center gap-1" data-testid="hud-hero-badge">
                <HeroBadgeIcon color={hero.accentHex} className="w-3.5 h-3.5" />
                <span>{hero.name}</span>
              </span>
              {activePlayerTitle && (
                <span className="text-[10px] font-bold text-[#ebb652] truncate max-w-[150px]">
                  · {activePlayerTitle}
                </span>
              )}
              {hasEcho && (
                <span className="inline-flex items-center gap-1" data-testid="hud-echo-status">
                  <EchoIcon collected={echoFound} className="w-3.5 h-3.5" />
                  <span className={echoFound ? 'text-[#f3b6ff]' : 'text-[#9ab4bf]'}>
                    {echoFound ? 'Echo Found' : 'Echo Hidden'}
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 tabular-nums ml-auto" data-testid="hud-shards">
                <ShardIcon className="w-3.5 h-3.5" />
                <span>{lumaShards}</span>
              </span>
            </div>
          </div>

          {/* Unobtrusive Active Tracked Quest Banner */}
          {trackedQuest && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-quest-tracker"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenJournal?.();
              }}
              className="text-left rounded-lg bg-[#1d2d37]/88 hover:bg-[#243743] border border-[#d8a13f]/65 px-3.5 py-2 shadow-[0_3px_10px_rgba(14,24,30,0.3)] text-[#f6eedb] cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ebb652]">
                <span>Tracked Quest</span>
                {trackedQuest.waypointLabel && (
                  <span className="text-[#66e6d5] truncate">{trackedQuest.waypointLabel}</span>
                )}
              </div>
              <div className="font-display text-xs font-bold text-[#fbf5e6] mt-0.5 truncate">
                {trackedQuest.title}
              </div>
              <div className="text-[11px] text-[#d0e2e8] truncate">{trackedQuest.stepText}</div>
            </button>
          )}
        </div>

        {/* Top-Right Compact Utility Controls + Truthful Local Save Badge */}
        <div className="pointer-events-auto self-end sm:self-auto shrink-0 flex flex-wrap items-center justify-end gap-2">
          <span
            data-testid="hud-save-status"
            className={`px-2.5 py-1 rounded-lg bg-[#1d2d37]/92 border border-[#324957] text-[11px] font-bold tracking-wide ${saveBadge.colorClass}`}
          >
            {saveBadge.label}
          </span>

          {onOpenJournal && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-journal-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenJournal();
              }}
              className="h-10 px-3 rounded-lg bg-[#1d2d37]/92 hover:bg-[#273c49] border-2 border-[#d8a13f]/75 text-[#f6eedb] text-xs font-bold shadow-[0_3px_0_#111b21] active:translate-y-0.5 cursor-pointer"
            >
              Journal
            </button>
          )}

          {onOpenWorldMap && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-worldmap-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenWorldMap();
              }}
              className="h-10 px-3 rounded-lg bg-[#1d2d37]/92 hover:bg-[#273c49] border-2 border-[#d8a13f]/75 text-[#f6eedb] text-xs font-bold shadow-[0_3px_0_#111b21] active:translate-y-0.5 cursor-pointer"
            >
              Map
            </button>
          )}

          {!isHubMode && onEnterHub && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-hub-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onEnterHub();
              }}
              className="hidden md:inline-flex items-center h-10 px-3 rounded-lg bg-[#1d2d37]/92 hover:bg-[#273c49] border-2 border-[#24c9b8]/80 text-[#66e6d5] text-xs font-bold shadow-[0_3px_0_#111b21] active:translate-y-0.5 cursor-pointer"
            >
              Hub
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            aria-label={muted ? 'Unmute Sound [M]' : 'Mute Sound [M]'}
            title={muted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-10 h-10 rounded-lg bg-[#1d2d37]/92 hover:bg-[#273c49] border-2 border-[#d8a13f]/75 flex items-center justify-center shadow-[0_3px_0_#111b21] active:translate-y-0.5 cursor-pointer"
          >
            <SoundIcon muted={muted} />
          </button>

          {!isHubMode && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Restart Island [R]"
              title="Restart Island (R)"
              onClick={(e) => {
                e.currentTarget.blur();
                onRestart();
              }}
              className="w-10 h-10 rounded-lg bg-[#1d2d37]/92 hover:bg-[#273c49] border-2 border-[#d8a13f]/75 flex items-center justify-center shadow-[0_3px_0_#111b21] active:translate-y-0.5 cursor-pointer"
            >
              <RestartIcon />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            aria-label="Pause Game [Esc]"
            title="Pause (Esc)"
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            className="w-10 h-10 rounded-lg bg-[#1d2d37]/92 hover:bg-[#273c49] border-2 border-[#d8a13f]/75 flex items-center justify-center shadow-[0_3px_0_#111b21] active:translate-y-0.5 cursor-pointer"
          >
            <PauseIcon />
          </button>
        </div>
      </div>

      {/* Bottom Safe Margin: Contextual Prompt, Ability Button, and Flat Control Line */}
      {!hideBottomHints && (
        <div className="flex flex-col items-center gap-2 pb-1">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {hud.interactPrompt && (
              <div
                data-testid="interact-prompt"
                className="px-4 py-2 rounded-lg bg-[#f6eedb]/95 border-2 border-[#1f2d38] shadow-[0_4px_0_#1f2d38] flex items-center gap-2.5 text-[#1b2730]"
              >
                <span className="px-2 py-0.5 rounded bg-[#e8a838] border border-[#1f2d38] text-xs font-extrabold tracking-wider">
                  E / SPACE
                </span>
                <span className="text-sm font-bold tracking-normal">{hud.interactPrompt}</span>
              </div>
            )}

            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-ability-btn"
              disabled={onCooldown}
              onClick={(e) => {
                e.currentTarget.blur();
                onTriggerAbility();
              }}
              className={`pointer-events-auto px-3.5 py-2 rounded-lg border-2 flex items-center gap-2 text-xs font-bold shadow-[0_3px_0_#141e25] transition-transform active:translate-y-0.5 ${
                abilityActive
                  ? 'bg-[#24c9b8] border-[#1f2d38] text-[#112329] cursor-pointer'
                  : onCooldown
                  ? 'bg-[#253642]/90 border-[#516875] text-[#9eb4bf] cursor-not-allowed'
                  : 'bg-[#1d2d37]/92 hover:bg-[#283e4c] border-[#ebb652] text-[#f6eedb] cursor-pointer'
              }`}
            >
              <span className="px-1.5 py-0.5 rounded bg-[#ebb652] text-[#1a262e] font-extrabold text-[11px]">
                Q
              </span>
              <span>{hero.abilityName}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-85 tabular-nums">
                {abilityActive
                  ? 'Active'
                  : onCooldown
                  ? `${hud.abilityCooldown.toFixed(1)}s`
                  : 'Ready'}
              </span>
            </button>
          </div>

          <p className="hidden sm:block text-xs font-semibold tracking-wide text-[#1a2933] drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
            {isHubMode
              ? 'WASD / Arrows Walk · E / Space Talk or Enter Portal · Q Resonance · M Mute · Esc Pause'
              : 'WASD / Arrows Move · E / Space Interact · Q Ability · R Restart · M Mute · Esc Pause'}
          </p>
        </div>
      )}
    </div>
  );
};
