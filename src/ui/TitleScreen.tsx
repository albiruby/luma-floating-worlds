import React, { useEffect } from 'react';
import { getCharacterById } from '../game/characters';
import { LEVELS } from '../game/levels';
import { MAX_CAMPAIGN_STARS } from '../game/mastery';
import { CharacterId, SaveStatus } from '../game/types';
import { LumaTitleEmblem } from './LumaIcons';

interface TitleScreenProps {
  hasSavedProgress: boolean;
  hasActiveCheckpoint?: boolean;
  totalStars: number;
  completedCount: number;
  collectedEchoesCount: number;
  lumaShards: number;
  restoredWorldsCount?: number;
  activeTitle?: string | null;
  saveStatus?: SaveStatus;
  activeCharacterId: CharacterId;
  onStart: () => void;
  onEnterHub: () => void;
  onOpenWorldMap: () => void;
  onOpenJournal: () => void;
  onOpenLevels: () => void;
  onOpenHeroes: () => void;
  onOpenWardrobe: () => void;
  onOpenRewards: () => void;
  onOpenSettings: () => void;
  onOpenWorldForge: () => void;
  onOpenFoundry: () => void;
  onOpenDailyRift: () => void;
  onOpenEchoDuels: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSavedProgress,
  hasActiveCheckpoint = false,
  totalStars,
  completedCount,
  collectedEchoesCount,
  lumaShards,
  restoredWorldsCount = 0,
  activeTitle,
  saveStatus = 'saved',
  activeCharacterId,
  onStart,
  onEnterHub,
  onOpenWorldMap,
  onOpenJournal,
  onOpenLevels,
  onOpenHeroes,
  onOpenWardrobe,
  onOpenRewards,
  onOpenSettings,
  onOpenWorldForge,
  onOpenFoundry,
  onOpenDailyRift,
  onOpenEchoDuels,
}) => {
  const activeHero = getCharacterById(activeCharacterId);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-5 sm:p-8">
      {/* Top-Left Negative Space Title Lockup & Primary Actions */}
      <div className="max-w-md pointer-events-auto flex flex-col items-start gap-2.5 pt-1 sm:pt-2 max-h-[84vh] overflow-y-auto pr-1">
        <LumaTitleEmblem />

        <div className="pl-2 flex flex-col gap-0.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#1c2b35] tabular-nums">
          <span>
            6 Worlds · {LEVELS.length} Islands · Active: {activeHero.name}
            {activeTitle ? ` · ${activeTitle}` : ''}
          </span>
          {(hasSavedProgress ||
            totalStars > 0 ||
            collectedEchoesCount > 0 ||
            lumaShards > 0 ||
            restoredWorldsCount > 0) && (
            <span className="text-[11px] text-[#223440]">
              {totalStars} / {MAX_CAMPAIGN_STARS} ★ · {completedCount} / {LEVELS.length} Cleared ·{' '}
              {restoredWorldsCount}/6 Worlds Restored · {collectedEchoesCount} Echoes · {lumaShards}{' '}
              Shards
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-84 max-w-full pl-2">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStart();
            }}
            className="w-full px-5 py-2.5 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] active:translate-y-0.5 text-[#1b2730] font-bold tracking-wider uppercase text-sm border-2 border-[#1f2d38] shadow-[0_4px_0_#1f2d38] transition-transform cursor-pointer text-left flex items-center justify-between"
          >
            <span>
              {hasActiveCheckpoint
                ? 'Resume Checkpoint'
                : hasSavedProgress
                ? 'Continue Journey'
                : 'Begin Journey'}
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#1f2d38] text-[#f9efd8]">
              ENTER
            </span>
          </button>

          <button
            type="button"
            data-testid="title-enter-hub-btn"
            onClick={(e) => {
              e.currentTarget.blur();
              onEnterHub();
            }}
            className="w-full px-5 py-2 rounded-lg bg-[#24c9b8] hover:bg-[#35dbca] active:translate-y-0.5 text-[#112329] font-extrabold tracking-wider uppercase text-xs border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] transition-transform cursor-pointer text-left flex items-center justify-between"
          >
            <span>Enter The Convergence (Hub)</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#112329] text-[#aef7f2]">
              SANCTUARY
            </span>
          </button>

          {/* Unbound Modes Row */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              data-testid="title-forge-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenWorldForge();
              }}
              className="px-2.5 py-2 rounded-lg bg-[#1d2d37] hover:bg-[#273d4a] text-[#ebb652] font-extrabold text-xs border-2 border-[#141e25] shadow-[0_3px_0_#111b21] transition-transform active:translate-y-0.5 whitespace-nowrap cursor-pointer"
            >
              World Forge
            </button>
            <button
              type="button"
              data-testid="title-foundry-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenFoundry();
              }}
              className="px-2.5 py-2 rounded-lg bg-[#1d2d37] hover:bg-[#273d4a] text-[#66e6d5] font-extrabold text-xs border-2 border-[#141e25] shadow-[0_3px_0_#111b21] transition-transform active:translate-y-0.5 whitespace-nowrap cursor-pointer"
            >
              Foundry
            </button>
            <button
              type="button"
              data-testid="title-daily-rift-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenDailyRift();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#178a80] font-bold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 whitespace-nowrap cursor-pointer"
            >
              Daily Rift
            </button>
            <button
              type="button"
              data-testid="title-echo-duels-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenEchoDuels();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#9b6a24] font-bold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 whitespace-nowrap cursor-pointer"
            >
              Echo Duels
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              data-testid="title-worldmap-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenWorldMap();
              }}
              className="px-2 py-2 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#1f2d38] font-semibold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              World Map
            </button>
            <button
              type="button"
              data-testid="title-journal-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenJournal();
              }}
              className="px-2 py-2 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#1f2d38] font-semibold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              Journal
            </button>
            <button
              type="button"
              data-testid="title-atlas-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenLevels();
              }}
              className="px-2 py-2 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#1f2d38] font-semibold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              Stage Atlas
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              data-testid="title-heroes-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenHeroes();
              }}
              className="px-2 py-2 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#1f2d38] font-semibold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              Heroes
            </button>
            <button
              type="button"
              data-testid="title-wardrobe-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenWardrobe();
              }}
              className="px-2 py-2 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#1f2d38] font-semibold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              Wardrobe
            </button>
            <button
              type="button"
              data-testid="title-rewards-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenRewards();
              }}
              className="px-2 py-2 rounded-lg bg-[#f6eedb]/95 hover:bg-[#fff8e8] text-[#1f2d38] font-semibold text-xs border-2 border-[#253542] shadow-[0_3px_0_#253542] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              Codex
            </button>
          </div>

          <button
            type="button"
            data-testid="title-settings-btn"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenSettings();
            }}
            className="w-full px-3 py-2 rounded-lg bg-[#223440]/95 hover:bg-[#2b404e] text-[#f5ecd7] font-semibold text-xs border-2 border-[#17232b] shadow-[0_3px_0_#141e25] transition-transform active:translate-y-0.5 cursor-pointer"
          >
            Settings &amp; Local Save Manager
          </button>
        </div>
      </div>

      {/* Flat Borderless Control & Local Privacy Hint in Bottom Safe Margin */}
      <div className="w-full text-center pb-1 space-y-0.5">
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#1a2933] drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
          WASD / Arrows Move · E / Space Interact · Q Hero Ability · Mouse Wheel Zoom · Esc Pause
        </p>
        <p className="text-[11px] font-bold tracking-wider uppercase text-[#20323d]/90">
          Zero Login · Zero Database · Local Browser Save ({saveStatus === 'unavailable' ? 'Storage Disabled' : 'Ready'})
        </p>
      </div>
    </div>
  );
};
