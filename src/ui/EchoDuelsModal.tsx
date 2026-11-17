import React, { useMemo, useRef, useState } from 'react';
import { audioEngine } from '../audio/synth';
import {
  buildSampleFeaturedDuelReplay,
  FEATURED_COMMUNITY_STAGES,
} from '../game/communityStages';
import {
  buildLumaStagePack,
  parseAndValidateLumaReplay,
  triggerTextDownload,
} from '../game/customFormats';
import { downloadDuelScorecardPng, prepareDuelSession } from '../game/echoDuels';
import { LumaCustomStageFile, LumaReplayFile, SaveProgress } from '../game/types';

interface EchoDuelsModalProps {
  progress: SaveProgress;
  onStartDuel: (stage: LumaCustomStageFile, replay: LumaReplayFile) => void;
  onImportReplay: (replay: LumaReplayFile) => void;
  onClose: () => void;
}

export const EchoDuelsModal: React.FC<EchoDuelsModalProps> = ({
  progress,
  onStartDuel,
  onImportReplay,
  onClose,
}) => {
  const sampleStage = FEATURED_COMMUNITY_STAGES[4];
  const sampleReplay = useMemo(() => buildSampleFeaturedDuelReplay(), []);
  const allStages = useMemo(
    () => [
      ...FEATURED_COMMUNITY_STAGES,
      ...(progress.customStages ?? []),
      ...(progress.importedPacks ?? []).flatMap((p) => p.stages),
    ],
    [progress.customStages, progress.importedPacks]
  );

  const allReplays = useMemo(
    () => [sampleReplay, ...(progress.savedReplays ?? [])],
    [progress.savedReplays, sampleReplay]
  );

  const [selectedReplayIdx, setSelectedReplayIdx] = useState(0);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeReplay = allReplays[selectedReplayIdx] ?? sampleReplay;
  const matchedStage = useMemo(
    () => allStages.find((s) => s.stageHash === activeReplay.stageHash) ?? sampleStage,
    [activeReplay.stageHash, allStages, sampleStage]
  );
  const previewSession = useMemo(
    () => prepareDuelSession(matchedStage.level, activeReplay),
    [activeReplay, matchedStage.level]
  );

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    const res = parseAndValidateLumaReplay(text);
    if (!res.ok) {
      setImportNotice(`Replay rejected: ${res.error}`);
      return;
    }
    onImportReplay(res.data);
    setImportNotice(`Imported replay "${res.data.stageTitle}" by ${res.data.challengerAlias}.`);
    setSelectedReplayIdx(allReplays.length);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#122029]/65 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Echo Duels"
        data-testid="echo-duels-modal"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
              Asynchronous Ghost Racing · Deterministic Verification
            </p>
            <h2 className="font-display text-2xl font-bold">Echo Duels</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".luma-replay,.json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-xs uppercase border-2 border-[#1f2d38] whitespace-nowrap cursor-pointer"
            >
              Import .luma-replay
            </button>
            <button
              type="button"
              data-testid="duels-close-btn"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] whitespace-nowrap cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {importNotice && (
          <div className="mb-3 rounded-lg bg-[#1d2d37] border border-[#ebb652] px-3 py-2 text-xs text-[#f6eedb]">
            {importNotice}
          </div>
        )}

        {/* Active Challenge Selection */}
        <div className="rounded-xl bg-[#efe6cf] border-2 border-[#1f2d38] p-4 mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b6a24]">
                {previewSession.verified
                  ? 'Deterministically Verified Replay'
                  : 'Unverified Visual Reference'}
              </span>
              <h3 className="font-display text-lg font-bold">{matchedStage.title}</h3>
              <p className="text-xs text-[#4b5c68]">{previewSession.verificationNote}</p>
            </div>

            <div className="text-right tabular-nums text-xs">
              <div className="font-bold text-[#9b6a24]">Rival: {previewSession.creatorAlias}</div>
              <div className="font-extrabold text-base">
                {previewSession.creatorTime.toFixed(1)}s · {previewSession.creatorActions} ACT
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4b5c68]">
              Choose Replay Ghost
            </span>
            <select
              value={selectedReplayIdx}
              onChange={(e) => setSelectedReplayIdx(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border-2 border-[#253542] bg-[#fff8e6] px-2.5 py-1.5 text-xs font-bold"
            >
              {allReplays.map((r, i) => (
                <option key={`${r.stageHash}_${i}`} value={i}>
                  {r.stageTitle} — {r.challengerAlias} ({r.clearSeconds.toFixed(1)}s,{' '}
                  {r.actionsUsed} ACT)
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="duels-start-race-btn"
              onClick={() => {
                audioEngine.playUiClick();
                onStartDuel(matchedStage, activeReplay);
              }}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-sm uppercase tracking-wider border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] whitespace-nowrap cursor-pointer"
            >
              Race Duel Ghost Now
            </button>
            <button
              type="button"
              onClick={() => {
                const pack = buildLumaStagePack({
                  title: `${matchedStage.title} Duel Pack`,
                  description: `Beat ${previewSession.creatorAlias}'s ghost time of ${previewSession.creatorTime.toFixed(1)}s.`,
                  authorAlias: previewSession.creatorAlias,
                  stages: [matchedStage],
                  challengeReplay: activeReplay,
                });
                triggerTextDownload(
                  `${matchedStage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.luma-pack`,
                  JSON.stringify(pack, null, 2)
                );
              }}
              className="py-2.5 px-3 rounded-lg bg-[#1d2d37] hover:bg-[#2a3f4c] text-[#f6eedb] font-bold text-xs uppercase border-2 border-[#141e25] whitespace-nowrap cursor-pointer"
            >
              Export .luma-pack
            </button>
          </div>
        </div>

        {/* Duel History & PNG Scorecards */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-2">
            Local Duel History &amp; Scorecards
          </h4>
          {(progress.echoDuelsHistory ?? []).length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-[#8b877c] p-5 text-center text-xs font-semibold text-[#5b6973]">
              Complete an Echo Duel race to record your comparison and generate a PNG Scorecard.
            </div>
          ) : (
            <div className="space-y-2">
              {(progress.echoDuelsHistory ?? []).slice(0, 8).map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-lg bg-[#efe6cf] border border-[#253542] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-display font-bold text-sm">
                      {rec.stageTitle} ·{' '}
                      <span className={rec.challengerWon ? 'text-[#178a80]' : 'text-[#9b6a24]'}>
                        {rec.challengerWon ? 'Victory' : 'Completed'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#4b5c68] tabular-nums">
                      You: {rec.challengerTime.toFixed(1)}s ({rec.challengerActions} ACT) vs{' '}
                      {rec.creatorAlias}: {rec.creatorTime.toFixed(1)}s ({rec.creatorActions} ACT) ·{' '}
                      {rec.verifiedReplay ? 'Verified' : 'Visual Reference'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadDuelScorecardPng(rec)}
                    className="px-2.5 py-1 rounded bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-bold text-[11px] uppercase border border-[#1f2d38] whitespace-nowrap cursor-pointer"
                  >
                    PNG Scorecard
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
