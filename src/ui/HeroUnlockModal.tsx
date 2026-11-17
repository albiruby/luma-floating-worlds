import React from 'react';
import { audioEngine } from '../audio/synth';
import { getCharacterById } from '../game/characters';
import { DEFAULT_EQUIPPED_COSMETICS } from '../game/cosmetics';
import { CharacterId } from '../game/types';
import { WardrobePreview3D } from '../three/WardrobePreview3D';

interface HeroUnlockModalProps {
  characterId: CharacterId;
  onSwitchHero: (heroId: CharacterId) => void;
  onClose: () => void;
}

export const HeroUnlockModal: React.FC<HeroUnlockModalProps> = ({
  characterId,
  onSwitchHero,
  onClose,
}) => {
  const hero = getCharacterById(characterId);

  return (
    <div className="fixed inset-0 z-50 bg-[#122029]/70 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`New Hero Joined: ${hero.name}`}
        className="w-full max-w-md rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#178a80]">
          New Companion Awakened
        </p>
        <h2 className="font-display text-2xl font-bold mt-0.5">{hero.name}</h2>
        <p className="text-xs font-semibold text-[#9b6a24] mb-3">{hero.title}</p>

        <WardrobePreview3D
          previewEquipped={DEFAULT_EQUIPPED_COSMETICS}
          characterId={characterId}
        />

        <div className="mt-3 rounded-lg bg-[#efe6cf] border-2 border-[#253542] p-3 text-xs space-y-1">
          <div className="font-bold text-[#1f2d38]">
            Signature Gift [Q]: {hero.abilityName}
          </div>
          <p className="text-[#43535e] leading-relaxed">{hero.abilityLongDesc}</p>
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              audioEngine.playHeroAbility(characterId);
              onSwitchHero(characterId);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-xs uppercase tracking-wider border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] cursor-pointer"
          >
            Play as {hero.name}
          </button>
          <button
            type="button"
            onClick={() => {
              audioEngine.playUiClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
