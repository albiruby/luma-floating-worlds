import React, { useMemo, useRef, useState } from 'react';
import { audioEngine } from '../audio/synth';
import {
  buildSampleFeaturedDuelReplay,
  FEATURED_COMMUNITY_STAGES,
} from '../game/communityStages';
import {
  buildLumaStagePack,
  parseAndValidateLumaPack,
  parseAndValidateLumaReplay,
  parseAndValidateLumaStage,
  triggerTextDownload,
} from '../game/customFormats';
import { verifyReplayDeterministically } from '../game/echoEngine';
import {
  LumaCustomStageFile,
  LumaReplayFile,
  LumaStagePackFile,
  SaveProgress,
} from '../game/types';

type FoundryTab =
  | 'featured'
  | 'my_creations'
  | 'imported'
  | 'packs'
  | 'replays'
  | 'favorites'
  | 'recent';

interface CommunityFoundryModalProps {
  progress: SaveProgress;
  onPlayCustomStage: (stage: LumaCustomStageFile) => void;
  onEditInForge: (stage: LumaCustomStageFile) => void;
  onOpenNewForge: () => void;
  onStartDuel: (stage: LumaCustomStageFile, replay: LumaReplayFile) => void;
  onToggleFavorite: (stageId: string) => void;
  onImportStage: (stage: LumaCustomStageFile) => void;
  onImportPack: (pack: LumaStagePackFile) => void;
  onImportReplay: (replay: LumaReplayFile) => void;
  onDeleteCustomStage: (stageId: string) => void;
  onClose: () => void;
}

export const CommunityFoundryModal: React.FC<CommunityFoundryModalProps> = ({
  progress,
  onPlayCustomStage,
  onEditInForge,
  onOpenNewForge,
  onStartDuel,
  onToggleFavorite,
  onImportStage,
  onImportPack,
  onImportReplay,
  onDeleteCustomStage,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<FoundryTab>('featured');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'gentle' | 'balanced' | 'master'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'verified'>('newest');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const favSet = useMemo(() => new Set(progress.favoriteStageIds ?? []), [progress.favoriteStageIds]);
  const myStages = progress.customStages ?? [];
  const importedStages = useMemo(
    () => (progress.importedPacks ?? []).flatMap((p) => p.stages),
    [progress.importedPacks]
  );
  const allKnownStages = useMemo(
    () => [...FEATURED_COMMUNITY_STAGES, ...myStages, ...importedStages],
    [importedStages, myStages]
  );

  const sampleReplay = useMemo(() => buildSampleFeaturedDuelReplay(), []);
  const allReplays = useMemo(
    () => [sampleReplay, ...(progress.savedReplays ?? [])],
    [progress.savedReplays, sampleReplay]
  );

  const displayedStages = useMemo(() => {
    let base: LumaCustomStageFile[] = [];
    if (activeTab === 'featured') base = FEATURED_COMMUNITY_STAGES;
    else if (activeTab === 'my_creations') base = myStages;
    else if (activeTab === 'imported') base = importedStages;
    else if (activeTab === 'favorites') {
      base = allKnownStages.filter((s) => favSet.has(s.id));
    } else if (activeTab === 'recent') {
      const map = new Map(allKnownStages.map((s) => [s.id, s]));
      base = (progress.recentlyPlayedCustomIds ?? [])
        .map((id) => map.get(id))
        .filter((s): s is LumaCustomStageFile => Boolean(s));
    }

    const q = search.trim().toLowerCase();
    const filtered = base.filter((s) => {
      if (difficultyFilter !== 'all' && s.difficulty !== difficultyFilter) return false;
      if (q) {
        const hay = `${s.title} ${s.authorAlias} ${s.description} ${(s.tags ?? []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'verified') {
      sorted.sort((a, b) => Number(b.verifiedSolvable) - Number(a.verifiedSolvable));
    } else if (activeTab !== 'recent') {
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return sorted;
  }, [
    activeTab,
    allKnownStages,
    difficultyFilter,
    favSet,
    importedStages,
    myStages,
    progress.recentlyPlayedCustomIds,
    search,
    sortBy,
  ]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setImportFeedback('File exceeds the 2 MB local import safety cap.');
      return;
    }
    const text = await file.text();
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.luma-pack')) {
      const res = parseAndValidateLumaPack(text);
      if (!res.ok) {
        setImportFeedback(`Pack rejected: ${res.error}`);
        return;
      }
      onImportPack(res.data);
      setImportFeedback(`Imported Pack "${res.data.title}" (${res.data.stages.length} stages).`);
      setActiveTab('packs');
      return;
    }

    if (lowerName.endsWith('.luma-replay')) {
      const res = parseAndValidateLumaReplay(text);
      if (!res.ok) {
        setImportFeedback(`Replay rejected: ${res.error}`);
        return;
      }
      const matchStage = allKnownStages.find((s) => s.stageHash === res.data.stageHash);
      const checked = matchStage ? verifyReplayDeterministically(matchStage.level, res.data) : null;
      const finalReplay: LumaReplayFile = {
        ...res.data,
        verified: Boolean(checked?.verified),
      };
      onImportReplay(finalReplay);
      setImportFeedback(
        checked?.verified
          ? `Imported Verified Replay for "${finalReplay.stageTitle}".`
          : `Imported Replay "${finalReplay.stageTitle}" (Unverified Visual Reference).`
      );
      setActiveTab('replays');
      return;
    }

    // Default try .luma stage first, then pack/replay fallback if .json
    const stageRes = parseAndValidateLumaStage(text);
    if (stageRes.ok) {
      onImportStage(stageRes.data);
      setImportFeedback(`Imported Stage "${stageRes.data.title}" cleanly.`);
      setActiveTab('imported');
      return;
    }
    const packRes = parseAndValidateLumaPack(text);
    if (packRes.ok) {
      onImportPack(packRes.data);
      setImportFeedback(`Imported Pack "${packRes.data.title}".`);
      setActiveTab('packs');
      return;
    }
    const repRes = parseAndValidateLumaReplay(text);
    if (repRes.ok) {
      onImportReplay(repRes.data);
      setImportFeedback(`Imported Replay "${repRes.data.stageTitle}".`);
      setActiveTab('replays');
      return;
    }
    setImportFeedback(`Import rejected: ${stageRes.error}`);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#122029]/65 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Community Foundry"
        data-testid="community-foundry-modal"
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
              Local-First Showcase · Zero Login · Portable .luma Files
            </p>
            <h2 className="font-display text-2xl font-bold">Community Foundry</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".luma,.luma-pack,.luma-replay,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              data-testid="foundry-import-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-xs uppercase border-2 border-[#1f2d38] whitespace-nowrap cursor-pointer"
            >
              Import .luma / Pack / Replay
            </button>
            <button
              type="button"
              data-testid="foundry-open-forge-btn"
              onClick={() => {
                audioEngine.playUiClick();
                onOpenNewForge();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-xs uppercase border-2 border-[#1f2d38] whitespace-nowrap cursor-pointer"
            >
              + New World Forge
            </button>
            <button
              type="button"
              data-testid="foundry-close-btn"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] whitespace-nowrap cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {importFeedback && (
          <div
            data-testid="foundry-import-feedback"
            className="mb-3 rounded-lg bg-[#1d2d37] border border-[#ebb652] px-3 py-2 text-xs font-semibold text-[#f6eedb] flex items-center justify-between gap-2"
          >
            <span>{importFeedback}</span>
            <button
              type="button"
              onClick={() => setImportFeedback(null)}
              className="text-[#ebb652] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {(
            [
              { id: 'featured', label: `Featured (${FEATURED_COMMUNITY_STAGES.length})` },
              { id: 'my_creations', label: `My Creations (${myStages.length})` },
              { id: 'imported', label: `Imported (${importedStages.length})` },
              { id: 'packs', label: `Packs (${(progress.importedPacks ?? []).length})` },
              { id: 'replays', label: `Replays (${allReplays.length})` },
              { id: 'favorites', label: `Favorites (${favSet.size})` },
              { id: 'recent', label: 'Recent' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`foundry-tab-${t.id}`}
              onClick={() => {
                audioEngine.playUiClick();
                setActiveTab(t.id);
              }}
              className={`px-2.5 py-1.5 rounded-lg border-2 text-xs font-bold whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#1d2d37] text-[#ebb652] border-[#1f2d38]'
                  : 'bg-[#efe6cf] hover:bg-[#fff8e6] text-[#1f2d38] border-[#253542]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Row for Stage Tabs */}
        {activeTab !== 'packs' && activeTab !== 'replays' && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Search stages, creators, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] rounded-lg border-2 border-[#253542] bg-[#fff8e6] px-3 py-1.5 text-xs font-semibold"
            />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="rounded-lg border-2 border-[#253542] bg-[#fff8e6] px-2.5 py-1.5 text-xs font-bold"
            >
              <option value="all">All Difficulties</option>
              <option value="gentle">Gentle</option>
              <option value="balanced">Balanced</option>
              <option value="master">Master</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border-2 border-[#253542] bg-[#fff8e6] px-2.5 py-1.5 text-xs font-bold"
            >
              <option value="newest">Sort: Newest</option>
              <option value="title">Sort: Title</option>
              <option value="verified">Sort: Verified</option>
            </select>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5">
          {activeTab === 'packs' ? (
            (progress.importedPacks ?? []).length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-[#8b877c] p-8 text-center text-xs font-semibold text-[#5b6973]">
                No .luma-pack bundles imported yet. Export a Challenge Pack from Echo Duels or import one above.
              </div>
            ) : (
              (progress.importedPacks ?? []).map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-lg bg-[#efe6cf] border-2 border-[#253542] p-3.5 flex flex-col gap-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                        Challenge Pack · {pack.stages.length} Stages · By {pack.authorAlias}
                      </div>
                      <h3 className="font-display text-base font-bold">{pack.title}</h3>
                      <p className="text-xs text-[#4b5c68]">{pack.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayCustomStage(pack.stages[0])}
                      className="px-3 py-1.5 rounded bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-xs uppercase border border-[#1f2d38] whitespace-nowrap cursor-pointer"
                    >
                      Play First Stage
                    </button>
                  </div>
                </div>
              ))
            )
          ) : activeTab === 'replays' ? (
            allReplays.map((rep, idx) => {
              const matchStage = allKnownStages.find((s) => s.stageHash === rep.stageHash);
              return (
                <div
                  key={`${rep.stageHash}_${rep.createdAt}_${idx}`}
                  className="rounded-lg bg-[#efe6cf] border-2 border-[#253542] p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                      {rep.verified ? 'Deterministically Verified' : 'Unverified Visual Reference'} ·{' '}
                      {rep.challengerAlias} · Hash {rep.stageHash}
                    </div>
                    <div className="font-display text-sm font-bold">{rep.stageTitle}</div>
                    <div className="text-xs text-[#4b5c68] tabular-nums">
                      {rep.clearSeconds.toFixed(1)}s · {rep.actionsUsed} Actions · {rep.frames.length} ticks
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {matchStage && (
                      <button
                        type="button"
                        onClick={() => onStartDuel(matchStage, rep)}
                        className="px-2.5 py-1.5 rounded bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-xs uppercase border border-[#1f2d38] whitespace-nowrap cursor-pointer"
                      >
                        Race Duel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        triggerTextDownload(
                          `${rep.stageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.luma-replay`,
                          JSON.stringify(rep, null, 2)
                        )
                      }
                      className="px-2.5 py-1.5 rounded bg-[#1d2d37] text-[#f6eedb] font-bold text-xs uppercase border border-[#141e25] whitespace-nowrap cursor-pointer"
                    >
                      Export Replay
                    </button>
                  </div>
                </div>
              );
            })
          ) : displayedStages.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-[#8b877c] p-8 text-center text-xs font-semibold text-[#5b6973]">
              No stages in this Foundry view yet. Build one in World Forge or import a .luma file.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedStages.map((stage) => {
                const isFav = favSet.has(stage.id);
                const isMine = myStages.some((s) => s.id === stage.id);
                const isImported = importedStages.some((s) => s.id === stage.id);
                const matchingReplay = allReplays.find((r) => r.stageHash === stage.stageHash);

                return (
                  <div
                    key={stage.id}
                    data-testid={`foundry-stage-card-${stage.id}`}
                    className="rounded-lg bg-[#efe6cf] border-2 border-[#253542] p-3.5 flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                        <span>
                          {stage.difficulty} · By {stage.authorAlias} ·{' '}
                          {stage.verifiedSolvable ? 'Verified Solvable' : 'Unverified'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(stage.id)}
                          className="text-xs font-extrabold text-[#1f2d38] cursor-pointer"
                          title={isFav ? 'Remove Favorite' : 'Favorite Stage'}
                        >
                          {isFav ? '★ Fav' : '☆ Fav'}
                        </button>
                      </div>
                      <h3 className="font-display text-base font-bold mt-0.5">{stage.title}</h3>
                      <p className="text-xs text-[#4b5c68] mt-0.5 line-clamp-2">
                        {stage.description}
                      </p>
                      <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5b6973]">
                        {stage.level.echoEnabled !== false ? 'Echo Engine' : 'Classic'} ·{' '}
                        {stage.level.partyEnabled ? '2-Hero Synergy' : 'Solo'} · Hash {stage.stageHash}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#d3c5a3]">
                      <button
                        type="button"
                        data-testid={`foundry-play-${stage.id}`}
                        onClick={() => onPlayCustomStage(stage)}
                        className="px-3 py-1.5 rounded bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-xs uppercase border border-[#1f2d38] whitespace-nowrap cursor-pointer"
                      >
                        Play
                      </button>

                      {matchingReplay && (
                        <button
                          type="button"
                          onClick={() => onStartDuel(stage, matchingReplay)}
                          className="px-2.5 py-1.5 rounded bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-xs uppercase border border-[#1f2d38] whitespace-nowrap cursor-pointer"
                        >
                          Echo Duel
                        </button>
                      )}

                      {isMine && (
                        <button
                          type="button"
                          onClick={() => onEditInForge(stage)}
                          className="px-2.5 py-1.5 rounded bg-[#fff8e6] hover:bg-white text-[#1f2d38] font-bold text-xs uppercase border border-[#253542] whitespace-nowrap cursor-pointer"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          triggerTextDownload(
                            `${stage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.luma`,
                            JSON.stringify(stage, null, 2)
                          )
                        }
                        className="px-2.5 py-1.5 rounded bg-[#1d2d37] text-[#f6eedb] font-bold text-xs uppercase border border-[#141e25] whitespace-nowrap cursor-pointer"
                      >
                        .luma
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const pack = buildLumaStagePack({
                            title: `${stage.title} Challenge`,
                            description: stage.description,
                            authorAlias: stage.authorAlias,
                            stages: [stage],
                            challengeReplay: matchingReplay,
                          });
                          triggerTextDownload(
                            `${stage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.luma-pack`,
                            JSON.stringify(pack, null, 2)
                          );
                        }}
                        className="px-2 py-1.5 rounded bg-[#efe6cf] hover:bg-[#fff8e6] text-[#1f2d38] font-bold text-[11px] uppercase border border-[#253542] whitespace-nowrap cursor-pointer"
                      >
                        Pack
                      </button>

                      {(isMine || isImported) && (
                        <button
                          type="button"
                          onClick={() => onDeleteCustomStage(stage.id)}
                          className="ml-auto px-2 py-1.5 rounded bg-[#fee2e2] hover:bg-[#fecaca] text-[#7f1d1d] font-bold text-[11px] uppercase border border-[#b91c1c] whitespace-nowrap cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
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
