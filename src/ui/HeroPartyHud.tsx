import React from 'react';
import { getCharacterById } from '../game/characters';
import { getMatchingSynergiesForParty } from '../game/synergy';
import { CharacterId } from '../game/types';
import { HeroBadgeIcon } from './LumaIcons';

interface HeroPartyHudProps {
  activeHeroId: CharacterId;
  companionHeroId: CharacterId | null;
  companionHold: boolean;
  onSwapHero?: () => void;
  onToggleHold?: () => void;
  onOpenCompanionPicker?: () => void;
}

export const HeroPartyHud: React.FC<HeroPartyHudProps> = ({
  activeHeroId,
  companionHeroId,
  companionHold,
  onSwapHero,
  onToggleHold,
  onOpenCompanionPicker,
}) => {
  const activeHero = getCharacterById(activeHeroId);
  const companion = companionHeroId ? getCharacterById(companionHeroId) : null;
  const synergies = getMatchingSynergiesForParty(activeHeroId, companionHeroId);

  return (
    <div
      data-testid="hero-party-hud"
      className="pointer-events-auto rounded-lg bg-[#1d2d37]/94 border-2 border-[#ebb652]/80 px-3 py-2 text-[#f6eedb] shadow-[0_4px_14px_rgba(14,24,30,0.38)] flex flex-col gap-1.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <HeroBadgeIcon color={activeHero.accentHex} className="w-4 h-4 shrink-0" />
          <span className="text-[#fbf5e6]">{activeHero.name}</span>
          {companion ? (
            <>
              <span className="text-[#9ab4bf]">+</span>
              <HeroBadgeIcon color={companion.accentHex} className="w-4 h-4 shrink-0" />
              <span className="text-[#66e6d5]">{companion.name}</span>
            </>
          ) : (
            <span className="text-[11px] text-[#9ab4bf]">· Solo</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {companion && onSwapHero && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="party-swap-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onSwapHero();
              }}
              className="px-2 py-1 rounded bg-[#ebb652] hover:bg-[#f5c467] text-[#1a262e] font-extrabold text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              Tab · Swap
            </button>
          )}
          {companion && onToggleHold && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="party-hold-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleHold();
              }}
              className={`px-2 py-1 rounded font-extrabold text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer border ${
                companionHold
                  ? 'bg-[#24c9b8] text-[#0e2026] border-[#112329]'
                  : 'bg-[#263b47] text-[#cbe5ea] border-[#4c6b7c]'
              }`}
            >
              H · {companionHold ? 'Holding' : 'Follow'}
            </button>
          )}
          {onOpenCompanionPicker && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="party-picker-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenCompanionPicker();
              }}
              className="px-2 py-1 rounded bg-[#273c49] hover:bg-[#324d5e] border border-[#5a7c8f] text-[#f6eedb] font-bold text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              {companion ? 'Partner' : '+ Partner'}
            </button>
          )}
        </div>
      </div>

      {synergies.length > 0 && (
        <div className="text-[11px] font-semibold text-[#7ef5a2]">
          Synergy Ready · {synergies[0].name} ({synergies[0].effectLabel})
        </div>
      )}
    </div>
  );
};
