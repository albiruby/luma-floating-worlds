import React, { useMemo, useState } from 'react';
import { audioEngine } from '../audio/synth';
import { CHARACTERS, getCharacterById, isCharacterUnlocked } from '../game/characters';
import {
  COSMETIC_ITEMS,
  CosmeticUnlockContext,
  DEFAULT_EQUIPPED_COSMETICS,
  getCosmeticById,
  getCosmeticsByCategory,
  isCosmeticUnlocked,
} from '../game/cosmetics';
import { getTotalStars, MAX_CAMPAIGN_STARS } from '../game/mastery';
import {
  CharacterId,
  CosmeticCategory,
  CosmeticId,
  CosmeticItemDef,
  EquippedCosmetics,
  SaveProgress,
} from '../game/types';
import { WardrobePreview3D } from '../three/WardrobePreview3D';
import { ShardIcon, StarIcon, WardrobeIcon } from './LumaIcons';

interface WardrobeModalProps {
  progress: SaveProgress;
  initialCosmeticId?: CosmeticId;
  initialHeroId?: CharacterId;
  onEquipCosmetic: (id: CosmeticId, heroId: CharacterId) => void;
  onPurchaseCosmetic: (id: CosmeticId) => void;
  onRestoreDefaults: (heroId: CharacterId) => void;
  onClose: () => void;
}

const CATEGORIES: Array<{ id: CosmeticCategory; label: string }> = [
  { id: 'cloak', label: 'Cloaks' },
  { id: 'lantern', label: 'Lanterns' },
  { id: 'headwear', label: 'Headwear' },
  { id: 'backpack', label: 'Backpacks' },
  { id: 'aura', label: 'Auras' },
  { id: 'palette', label: 'Palettes' },
  { id: 'set', label: 'Sets' },
];

function isItemEquippedOnOutfit(
  outfit: EquippedCosmetics,
  item: CosmeticItemDef
): boolean {
  if (item.category === 'set') return outfit.setId === item.id;
  if (outfit.setId) return false;
  switch (item.category) {
    case 'cloak':
      return outfit.cloakId === item.id;
    case 'lantern':
      return outfit.lanternId === item.id;
    case 'headwear':
      return (outfit.headwearId ?? 'none_headwear') === item.id;
    case 'backpack':
      return (outfit.backpackId ?? 'none_backpack') === item.id;
    case 'aura':
      return (outfit.auraId ?? 'none_aura') === item.id;
    case 'palette':
      return (outfit.paletteId ?? 'palette_pilgrim_classic') === item.id;
  }
  return false;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  progress,
  initialCosmeticId,
  initialHeroId,
  onEquipCosmetic,
  onPurchaseCosmetic,
  onRestoreDefaults,
  onClose,
}) => {
  const totalStars = getTotalStars(progress.masteryRecords);
  const collectedEchoCount = progress.collectedEchoFragments?.length ?? 0;
  const lumaShards = progress.lumaShards ?? 0;

  const unlockCtx: CosmeticUnlockContext = useMemo(
    () => ({
      totalStars,
      collectedEchoCount,
      completedLevels: progress.completedLevels,
      purchasedCosmetics: progress.purchasedCosmetics ?? [],
    }),
    [collectedEchoCount, progress.completedLevels, progress.purchasedCosmetics, totalStars]
  );

  const [inspectHeroId, setInspectHeroId] = useState<CharacterId>(
    initialHeroId ?? progress.selectedCharacterId ?? 'wayfinder'
  );
  const inspectHero = getCharacterById(inspectHeroId);
  const inspectHeroUnlocked = isCharacterUnlocked(inspectHeroId, progress.completedLevels);

  const heroEquipped: EquippedCosmetics = useMemo(
    () =>
      progress.equippedByCharacter?.[inspectHeroId] ??
      (inspectHeroId === (progress.selectedCharacterId ?? 'wayfinder')
        ? progress.equippedCosmetics
        : DEFAULT_EQUIPPED_COSMETICS),
    [inspectHeroId, progress.equippedByCharacter, progress.equippedCosmetics, progress.selectedCharacterId]
  );

  const initialItem = useMemo(() => {
    if (initialCosmeticId) return getCosmeticById(initialCosmeticId);
    if (heroEquipped.setId) return getCosmeticById(heroEquipped.setId);
    return getCosmeticById(heroEquipped.cloakId);
  }, [heroEquipped.cloakId, heroEquipped.setId, initialCosmeticId]);

  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>(
    initialItem.category
  );
  const [selectedId, setSelectedId] = useState<CosmeticId>(initialItem.id);

  const itemsInCategory = useMemo(
    () => getCosmeticsByCategory(activeCategory),
    [activeCategory]
  );

  const selectedItem = useMemo(() => getCosmeticById(selectedId), [selectedId]);
  const selectedUnlocked = isCosmeticUnlocked(
    selectedItem.id,
    totalStars,
    progress.unlockedCosmetics,
    unlockCtx
  );
  const isSelectedEquipped = isItemEquippedOnOutfit(heroEquipped, selectedItem);

  const canBuySelected =
    selectedItem.unlockType === 'shards' &&
    !selectedUnlocked &&
    lumaShards >= (selectedItem.shardCost ?? 0);

  // Live 3D preview reflects whichever item the player is currently inspecting
  const previewEquipped: EquippedCosmetics = useMemo(() => {
    if (selectedItem.category === 'set') {
      return { ...heroEquipped, setId: selectedItem.id };
    }
    const base: EquippedCosmetics = { ...heroEquipped, setId: null };
    if (selectedItem.category === 'cloak') base.cloakId = selectedItem.id;
    else if (selectedItem.category === 'lantern') base.lanternId = selectedItem.id;
    else if (selectedItem.category === 'headwear') base.headwearId = selectedItem.id;
    else if (selectedItem.category === 'backpack') base.backpackId = selectedItem.id;
    else if (selectedItem.category === 'aura') base.auraId = selectedItem.id;
    else if (selectedItem.category === 'palette') base.paletteId = selectedItem.id;
    return base;
  }, [heroEquipped, selectedItem]);

  const totalUnlockedCount = COSMETIC_ITEMS.filter((item) =>
    isCosmeticUnlocked(item.id, totalStars, progress.unlockedCosmetics, unlockCtx)
  ).length;

  const handleSelectCategory = (cat: CosmeticCategory) => {
    audioEngine.playUiClick();
    setActiveCategory(cat);
    const list = getCosmeticsByCategory(cat);
    if (list.length > 0 && selectedItem.category !== cat) {
      const equippedInCat = list.find((it) => isItemEquippedOnOutfit(heroEquipped, it));
      setSelectedId((equippedInCat ?? list[0]).id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#122029]/65 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Wayfinder Wardrobe"
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b-2 border-[#d9ccb0]">
          <div className="flex items-center gap-3">
            <WardrobeIcon className="w-8 h-8 shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b6a24]">
                Cosmetic Regalia · {totalUnlockedCount} / {COSMETIC_ITEMS.length} Unlocked
              </p>
              <h2 className="font-display text-2xl font-bold leading-tight">
                Wayfinder Wardrobe
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              data-testid="wardrobe-shards-balance"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#efe6cf] border border-[#253542] text-xs font-extrabold tabular-nums"
            >
              <ShardIcon className="w-4 h-4" />
              <span>{lumaShards} Shards</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-[#1f2d38]">
              <StarIcon filled className="w-4 h-4" />
              <span data-testid="wardrobe-total-stars">
                {totalStars} / {MAX_CAMPAIGN_STARS}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Hero Switcher Strip */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b6973] mr-1">
            Outfit For:
          </span>
          {CHARACTERS.map((hero) => {
            const active = inspectHeroId === hero.id;
            const unlocked = isCharacterUnlocked(hero.id, progress.completedLevels);
            return (
              <button
                key={hero.id}
                type="button"
                onClick={() => {
                  audioEngine.playUiClick();
                  setInspectHeroId(hero.id);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                    : unlocked
                    ? 'bg-[#efe6cf] hover:bg-[#f7f0dc] text-[#1f2d38] border-[#253542]'
                    : 'bg-[#e2d9c3]/75 text-[#6b6559] border-[#8b877c]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#1f2d38]"
                  style={{ backgroundColor: hero.accentHex }}
                />
                <span>{hero.name}</span>
                {!unlocked && <span className="text-[9px] uppercase opacity-75">(Locked)</span>}
              </button>
            );
          })}
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 md:grid-cols-[265px_1fr] gap-5">
          {/* Left: 3D Preview + Active Outfit Readout */}
          <div className="flex flex-col gap-3">
            <WardrobePreview3D
              previewEquipped={previewEquipped}
              characterId={inspectHeroId}
            />

            <div className="rounded-lg bg-[#efe6cf] border-2 border-[#253542] p-3 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                Equipped on {inspectHero.name}
              </div>
              {heroEquipped.setId ? (
                <div className="font-bold text-[#1f2d38] mt-0.5">
                  {getCosmeticById(heroEquipped.setId).name}
                </div>
              ) : (
                <div className="mt-1 space-y-0.5 text-[#364752]">
                  <div>
                    <span className="font-semibold">Cloak:</span>{' '}
                    {getCosmeticById(heroEquipped.cloakId).name}
                  </div>
                  <div>
                    <span className="font-semibold">Focus:</span>{' '}
                    {getCosmeticById(heroEquipped.lanternId).name}
                  </div>
                  <div>
                    <span className="font-semibold">Headwear:</span>{' '}
                    {getCosmeticById(heroEquipped.headwearId ?? 'none_headwear').name}
                  </div>
                  <div>
                    <span className="font-semibold">Pack:</span>{' '}
                    {getCosmeticById(heroEquipped.backpackId ?? 'none_backpack').name}
                  </div>
                  <div>
                    <span className="font-semibold">Aura:</span>{' '}
                    {getCosmeticById(heroEquipped.auraId ?? 'none_aura').name}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!inspectHeroUnlocked}
                onClick={() => {
                  audioEngine.playCosmeticEquip();
                  onRestoreDefaults(inspectHeroId);
                }}
                className={`mt-2.5 w-full py-1.5 rounded font-bold text-[11px] uppercase tracking-wider border border-[#253542] ${
                  inspectHeroUnlocked
                    ? 'bg-[#e3d6b8] hover:bg-[#ece1c8] cursor-pointer'
                    : 'bg-[#d5ccb8] text-[#787266] cursor-not-allowed'
                }`}
              >
                Restore Defaults
              </button>
            </div>
          </div>

          {/* Right: 7 Category Tabs, Item List, Details & Equip / Purchase */}
          <div className="flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-3">
              {/* 7 Category Tabs */}
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Cosmetic Categories">
                {CATEGORIES.map((cat) => {
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      data-testid={`wardrobe-tab-${cat.id}`}
                      aria-selected={active}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`py-1.5 px-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider border-2 cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                          : 'bg-[#e7dcc2] hover:bg-[#efe6cf] text-[#1f2d38] border-[#253542]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Items List */}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {itemsInCategory.map((item) => {
                  const unlocked = isCosmeticUnlocked(
                    item.id,
                    totalStars,
                    progress.unlockedCosmetics,
                    unlockCtx
                  );
                  const selected = selectedId === item.id;
                  const equipped = isItemEquippedOnOutfit(heroEquipped, item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`wardrobe-item-${item.id}`}
                      onClick={() => {
                        audioEngine.playUiClick();
                        setSelectedId(item.id);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-lg border-2 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        selected
                          ? 'bg-[#fff8e6] border-[#1f2d38] shadow-[0_2px_0_#1f2d38]'
                          : unlocked
                          ? 'bg-[#efe6cf] hover:bg-[#f7f0dc] border-[#253542]'
                          : 'bg-[#e2d9c3]/80 hover:bg-[#ebe3cf] border-[#7f796b] text-[#4e4e47]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-7 h-7 rounded-md border-2 border-[#1f2d38] shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${item.previewSwatchPrimary} 55%, ${item.previewSwatchSecondary} 55%)`,
                          }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="font-display font-bold text-sm truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-semibold text-[#6b6252]">
                            {item.unlockLabel}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-extrabold uppercase tracking-wider shrink-0">
                        {equipped ? (
                          <span className="text-[#178a80]">Equipped</span>
                        ) : unlocked ? (
                          <span className="text-[#9b6a24]">Owned</span>
                        ) : item.unlockType === 'shards' ? (
                          <span className="text-[#9b6a24] tabular-nums">
                            {item.shardCost} Shards
                          </span>
                        ) : item.unlockType === 'stars' ? (
                          <span className="text-[#6d6a62] tabular-nums">
                            {item.requiredStars} ★
                          </span>
                        ) : (
                          <span className="text-[#6d6a62]">Locked</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Cosmetic Detail & Equip / Purchase Footer */}
            <div className="rounded-lg bg-[#efe6cf] border-2 border-[#1f2d38] p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h3 className="font-display text-lg font-bold leading-snug">
                    {selectedItem.name}
                  </h3>
                  <p className="text-xs text-[#43535e] mt-0.5 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#5b6973]">
                  {!inspectHeroUnlocked
                    ? `Unlock ${inspectHero.name} (${inspectHero.unlockRequirementLabel}) to equip`
                    : selectedUnlocked
                    ? isSelectedEquipped
                      ? `Equipped on ${inspectHero.name}`
                      : `Ready to equip on ${inspectHero.name}`
                    : `Requires: ${selectedItem.unlockLabel}`}
                </span>

                {selectedItem.unlockType === 'shards' && !selectedUnlocked ? (
                  <button
                    type="button"
                    data-testid="wardrobe-purchase-btn"
                    disabled={!canBuySelected}
                    onClick={() => {
                      if (!canBuySelected) return;
                      audioEngine.playPurchaseCosmetic();
                      onPurchaseCosmetic(selectedItem.id);
                    }}
                    className={`px-4 py-2 rounded-lg font-extrabold text-xs uppercase tracking-wider border-2 flex items-center gap-1.5 ${
                      canBuySelected
                        ? 'bg-[#24c9b8] hover:bg-[#33d9c8] text-[#112329] border-[#1f2d38] shadow-[0_3px_0_#1f2d38] cursor-pointer'
                        : 'bg-[#d5ccb8] text-[#6d6a62] border-[#8b877c] cursor-not-allowed'
                    }`}
                  >
                    <ShardIcon className="w-3.5 h-3.5" />
                    <span>Unlock ({selectedItem.shardCost} Shards)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="wardrobe-equip-btn"
                    disabled={!inspectHeroUnlocked || !selectedUnlocked || isSelectedEquipped}
                    onClick={() => {
                      if (!inspectHeroUnlocked || !selectedUnlocked || isSelectedEquipped) return;
                      audioEngine.playCosmeticEquip();
                      onEquipCosmetic(selectedItem.id, inspectHeroId);
                    }}
                    className={`px-5 py-2 rounded-lg font-extrabold text-xs uppercase tracking-wider border-2 transition-transform ${
                      !inspectHeroUnlocked || !selectedUnlocked
                        ? 'bg-[#d5ccb8] text-[#6d6a62] border-[#8b877c] cursor-not-allowed'
                        : isSelectedEquipped
                        ? 'bg-[#cfe8e3] text-[#146e66] border-[#178a80] cursor-default'
                        : 'bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] border-[#1f2d38] shadow-[0_3px_0_#1f2d38] active:translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {!selectedUnlocked
                      ? 'Locked'
                      : isSelectedEquipped
                      ? 'Equipped'
                      : 'Equip'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
