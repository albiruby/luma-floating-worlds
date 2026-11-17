import React, { useMemo, useState } from 'react';
import { audioEngine } from '../audio/synth';
import { CHARACTERS, getCharacterById, isCharacterUnlocked } from '../game/characters';
import { DEFAULT_EQUIPPED_COSMETICS } from '../game/cosmetics';
import { CharacterId, SaveProgress } from '../game/types';
import { getWorldById } from '../game/worlds';
import { WardrobePreview3D } from '../three/WardrobePreview3D';
import { HeroBadgeIcon } from './LumaIcons';

interface HeroSelectModalProps {
  progress: SaveProgress;
  onSelectCharacter: (heroId: CharacterId) => void;
  onOpenWardrobe: (heroId?: CharacterId) => void;
  onClose: () => void;
}

export const HeroSelectModal: React.FC<HeroSelectModalProps> = ({
  progress,
  onSelectCharacter,
  onOpenWardrobe,
  onClose,
}) => {
  const activeHeroId: CharacterId = progress.selectedCharacterId ?? 'wayfinder';
  const [inspectHeroId, setInspectHeroId] = useState<CharacterId>(activeHeroId);

  const inspectedHero = useMemo(() => getCharacterById(inspectHeroId), [inspectHeroId]);
  const inspectedUnlocked = isCharacterUnlocked(inspectHeroId, progress.completedLevels);
  const inspectedEquipped = useMemo(
    () =>
      progress.equippedByCharacter?.[inspectHeroId] ??
      (inspectHeroId === activeHeroId ? progress.equippedCosmetics : DEFAULT_EQUIPPED_COSMETICS),
    [activeHeroId, inspectHeroId, progress.equippedByCharacter, progress.equippedCosmetics]
  );
  const homeWorld = getWorldById(inspectedHero.homeWorldId);
  const unlockedCount = CHARACTERS.filter((c) =>
    isCharacterUnlocked(c.id, progress.completedLevels)
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#122029]/65 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Wayfinder Fellowship — Select Hero"
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#d9ccb0]">
          <div className="flex items-center gap-3">
            <HeroBadgeIcon color={inspectedHero.accentHex} className="w-8 h-8 shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b6a24]">
                Fellowship · {unlockedCount} / {CHARACTERS.length} Heroes Unlocked
              </p>
              <h2 className="font-display text-2xl font-bold leading-tight">
                Playable Heroes
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[270px_1fr] gap-5">
          {/* Left: Live 3D Hero Preview */}
          <div className="flex flex-col gap-3">
            <WardrobePreview3D
              previewEquipped={inspectedEquipped}
              characterId={inspectHeroId}
            />

            <div className="rounded-lg bg-[#efe6cf] border-2 border-[#253542] p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                  {homeWorld.name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-[#f6eedb]"
                  style={{ backgroundColor: inspectedHero.accentHex }}
                >
                  {inspectedUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <div className="font-semibold text-[#1f2d38]">{inspectedHero.silhouetteTag}</div>
              <p className="text-[#43535e] leading-relaxed">{inspectedHero.loreSummary}</p>
            </div>
          </div>

          {/* Right: 5 Hero Cards + Selected Hero Ability & Actions */}
          <div className="flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              {CHARACTERS.map((hero) => {
                const unlocked = isCharacterUnlocked(hero.id, progress.completedLevels);
                const isSelected = inspectHeroId === hero.id;
                const isActive = activeHeroId === hero.id;

                return (
                  <button
                    key={hero.id}
                    type="button"
                    data-testid={`hero-card-${hero.id}`}
                    onClick={() => {
                      audioEngine.playUiClick();
                      setInspectHeroId(hero.id);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg border-2 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#fff8e6] border-[#1f2d38] shadow-[0_3px_0_#1f2d38]'
                        : unlocked
                        ? 'bg-[#efe6cf] hover:bg-[#f7f0dc] border-[#253542]'
                        : 'bg-[#e2d9c3]/80 hover:bg-[#ebe3cf] border-[#7f796b] text-[#4e4e47]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-8 h-8 rounded-lg border-2 border-[#1f2d38] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: hero.accentHex }}
                      >
                        <HeroBadgeIcon color={hero.secondaryHex} className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-sm truncate">
                          {hero.name} · <span className="font-sans text-xs font-semibold text-[#5b6973]">{hero.title}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#6b6252] truncate">
                          {unlocked
                            ? `[Q] ${hero.abilityName} — ${hero.abilityShortDesc}`
                            : `Locked · ${hero.unlockRequirementLabel}`}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-extrabold uppercase tracking-wider shrink-0">
                      {isActive ? (
                        <span className="text-[#178a80]">Active</span>
                      ) : unlocked ? (
                        <span className="text-[#9b6a24]">Ready</span>
                      ) : (
                        <span className="text-[#6d6a62]">Locked</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Hero Ability & Actions Footer */}
            <div className="rounded-lg bg-[#efe6cf] border-2 border-[#1f2d38] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h3 className="font-display text-lg font-bold">
                  {inspectedHero.name} — {inspectedHero.abilityName}
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#1d2d37] text-[#ebb652] text-[10px] font-extrabold uppercase tracking-wider">
                  Key [Q]
                </span>
              </div>
              <p className="text-xs text-[#43535e] leading-relaxed">
                {inspectedHero.abilityLongDesc}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenWardrobe(inspectHeroId)}
                  className="px-3.5 py-2 rounded-lg bg-[#e7dcc2] hover:bg-[#f2e8d0] text-[#1f2d38] font-bold text-xs uppercase tracking-wider border-2 border-[#253542] cursor-pointer"
                >
                  Open Wardrobe
                </button>

                <button
                  type="button"
                  data-testid="hero-select-confirm-btn"
                  disabled={!inspectedUnlocked || activeHeroId === inspectHeroId}
                  onClick={() => {
                    if (!inspectedUnlocked || activeHeroId === inspectHeroId) return;
                    audioEngine.playHeroAbility(inspectHeroId);
                    onSelectCharacter(inspectHeroId);
                  }}
                  className={`px-5 py-2 rounded-lg font-extrabold text-xs uppercase tracking-wider border-2 transition-transform ${
                    !inspectedUnlocked
                      ? 'bg-[#d5ccb8] text-[#6d6a62] border-[#8b877c] cursor-not-allowed'
                      : activeHeroId === inspectHeroId
                      ? 'bg-[#cfe8e3] text-[#146e66] border-[#178a80] cursor-default'
                      : 'bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] border-[#1f2d38] shadow-[0_3px_0_#1f2d38] active:translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {!inspectedUnlocked
                    ? inspectedHero.unlockRequirementLabel
                    : activeHeroId === inspectHeroId
                    ? 'Active Hero'
                    : `Select ${inspectedHero.name}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
