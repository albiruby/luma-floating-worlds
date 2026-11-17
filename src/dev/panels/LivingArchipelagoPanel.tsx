import React, { useEffect, useMemo, useState } from 'react';
import {
  captureStageCheckpoint,
  getTotalSessionHistoryCount,
  restoreFromCheckpoint,
} from '../../game/checkpoints';
import { CONVERGENCE_HUB_LEVEL, HUB_AREAS } from '../../game/hubLayout';
import { getLevelById } from '../../game/levels';
import { NPCS } from '../../game/npcs';
import {
  clearStageCheckpointInProgress,
  recordHubAreaVisitedInProgress,
  recordNpcTalkedInProgress,
  saveStageCheckpointInProgress,
  setTrackedQuestInProgress,
  validateSaveProgress,
} from '../../game/progression';
import { QUESTS } from '../../game/quests';
import {
  computeRestoredWorlds,
  countCompletedStagesInWorld,
  getHubRestorationSummary,
  getHubRestorationTier,
  WORLD_RESTORATION_QUEST_IDS,
} from '../../game/restoration';
import {
  exportSavePayload,
  getLocalStorageDiagnostics,
  LocalStorageDiagnostics,
  parseAndValidateImport,
} from '../../game/saveManager';
import {
  HubAreaId,
  NpcId,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  QuestCategory,
  SaveProgress,
  WorldId,
} from '../../game/types';
import { WORLDS } from '../../game/worlds';

interface LivingArchipelagoPanelProps {
  progress: SaveProgress;
  isHubMode: boolean;
  currentLevelId: number;
  puzzleState: PuzzleRuntimeState;
  playerState: PlayerRuntimeState;
  onEnterHubDev: () => void;
  onTeleportToTile: (gx: number, gz: number, elevation?: number) => void;
  onOpenNpcDialogueDev: (npcId: NpcId) => void;
  onPreviewProgressPatchDev: (next: SaveProgress) => void;
  onApplyPuzzleStateDev: (next: PuzzleRuntimeState) => void;
  onApplyPlayerStateDev: (next: PlayerRuntimeState) => void;
  onLoadLevelDev: (levelId: number) => void;
  onEmitEvent?: (type: string, details: string) => void;
}

type ArchipelagoSection =
  | 'hub'
  | 'npcs'
  | 'quests'
  | 'restoration'
  | 'checkpoints'
  | 'history'
  | 'save';

export const LivingArchipelagoPanel: React.FC<LivingArchipelagoPanelProps> = ({
  progress,
  isHubMode,
  currentLevelId,
  puzzleState,
  playerState,
  onEnterHubDev,
  onTeleportToTile,
  onOpenNpcDialogueDev,
  onPreviewProgressPatchDev,
  onApplyPuzzleStateDev,
  onApplyPlayerStateDev,
  onLoadLevelDev,
  onEmitEvent,
}) => {
  const [section, setSection] = useState<ArchipelagoSection>('hub');
  const [questFilter, setQuestFilter] = useState<QuestCategory | 'all'>('all');
  const [diag, setDiag] = useState<LocalStorageDiagnostics | null>(null);
  const [diagMessage, setDiagMessage] = useState<string | null>(null);

  useEffect(() => {
    void getLocalStorageDiagnostics().then((d) => setDiag(d));
  }, [progress, section]);

  const hubTier = getHubRestorationTier(progress);
  const hubSummary = getHubRestorationSummary(hubTier);
  const restoredWorlds = computeRestoredWorlds(progress);
  const activeCheckpoints = useMemo(
    () =>
      Object.values(progress.checkpoints ?? {}).sort((a, b) => a.levelId - b.levelId),
    [progress.checkpoints]
  );

  const sessionEntries = useMemo(() => {
    const out: Array<{ stageId: number; items: NonNullable<SaveProgress['sessionHistory']>[number] }> = [];
    for (const [k, list] of Object.entries(progress.sessionHistory ?? {})) {
      if (Array.isArray(list) && list.length > 0) {
        out.push({ stageId: Number(k), items: list });
      }
    }
    return out.sort((a, b) => a.stageId - b.stageId);
  }, [progress.sessionHistory]);

  const filteredQuests = useMemo(
    () =>
      questFilter === 'all'
        ? QUESTS
        : QUESTS.filter((q) => q.category === questFilter),
    [questFilter]
  );

  const handleToggleWorldRestorationPreview = (worldId: WorldId) => {
    const currentSet = new Set(restoredWorlds);
    const qId = WORLD_RESTORATION_QUEST_IDS[worldId];
    const nextQuestMap = { ...(progress.questProgress ?? {}) };
    if (currentSet.has(worldId)) {
      currentSet.delete(worldId);
      if (nextQuestMap[qId]) {
        nextQuestMap[qId] = { ...nextQuestMap[qId], completed: false };
      }
    } else {
      currentSet.add(worldId);
      nextQuestMap[qId] = {
        questId: qId,
        discovered: true,
        started: true,
        completed: true,
        rewardClaimed: true,
        completedSteps: [],
      };
    }
    const next = validateSaveProgress({
      ...progress,
      restoredWorlds: Array.from(currentSet),
      questProgress: nextQuestMap,
    });
    onPreviewProgressPatchDev(next);
    onEmitEvent?.('DEV_RESTORATION_PREVIEW', `Toggled ${worldId} restoration preview (in-memory only)`);
  };

  const handleToggleQuestPreview = (questId: string) => {
    const existing = progress.questProgress?.[questId];
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) return;
    const nextCompleted = !existing?.completed;
    const next = validateSaveProgress({
      ...progress,
      questProgress: {
        ...(progress.questProgress ?? {}),
        [questId]: {
          questId,
          discovered: true,
          started: true,
          completed: nextCompleted,
          rewardClaimed: nextCompleted,
          completedSteps: nextCompleted ? quest.steps.map((s) => s.id) : [],
        },
      },
    });
    onPreviewProgressPatchDev(next);
    onEmitEvent?.('DEV_QUEST_PREVIEW', `${questId} -> ${nextCompleted ? 'completed' : 'reset'} (in-memory)`);
  };

  const handleCapturePreviewCheckpoint = () => {
    if (isHubMode || currentLevelId < 1) {
      setDiagMessage('Enter a Stage (01–60) before capturing a stage checkpoint.');
      return;
    }
    const cp = captureStageCheckpoint(currentLevelId, playerState, puzzleState, 0);
    const next = saveStageCheckpointInProgress(progress, cp);
    onPreviewProgressPatchDev(next);
    setDiagMessage(`Captured in-memory test checkpoint for Stage ${String(currentLevelId).padStart(2, '0')}.`);
    onEmitEvent?.('DEV_CHECKPOINT_CAPTURE', `Captured Stage ${currentLevelId} preview checkpoint`);
  };

  const handleLoadPreviewCheckpoint = (stageId: number) => {
    const cp = progress.checkpoints?.[stageId];
    if (!cp) return;
    const lvl = getLevelById(stageId);
    onLoadLevelDev(stageId);
    const restored = restoreFromCheckpoint(lvl, cp);
    onApplyPuzzleStateDev(restored.puzzleState);
    onApplyPlayerStateDev(restored.playerState);
    setDiagMessage(`Restored checkpoint preview into Stage ${String(stageId).padStart(2, '0')}.`);
    onEmitEvent?.('DEV_CHECKPOINT_RESTORE', `Loaded Stage ${stageId} checkpoint in DEV mode`);
  };

  const handleClearPreviewCheckpoint = (stageId: number) => {
    const next = clearStageCheckpointInProgress(progress, stageId);
    onPreviewProgressPatchDev(next);
    setDiagMessage(`Cleared Stage ${String(stageId).padStart(2, '0')} checkpoint from DEV preview.`);
  };

  const handleRunInMemoryRoundtripTest = () => {
    const exported = exportSavePayload(progress, validateSaveProgress);
    const parsed = parseAndValidateImport(exported, validateSaveProgress);
    if (!parsed.ok) {
      setDiagMessage(`Roundtrip validation FAILED: ${parsed.error}`);
      return;
    }
    const corrupt = parseAndValidateImport('{bad json', validateSaveProgress);
    setDiagMessage(
      `Export/Import OK (${exported.length} chars, v${parsed.summary.schemaVersion}, ${parsed.summary.questsCompletedCount} quests) · Corrupt guard=${!corrupt.ok ? 'PASS' : 'FAIL'}`
    );
    onEmitEvent?.('DEV_SAVE_ROUNDTRIP', `Verified export/import roundtrip (${exported.length}B)`);
  };

  const handleTeleportHubArea = (areaId: HubAreaId) => {
    const area = HUB_AREAS.find((a) => a.id === areaId);
    if (!area) return;
    if (!isHubMode) {
      onEnterHubDev();
    }
    const tile =
      CONVERGENCE_HUB_LEVEL.tiles.find((t) => t.x === area.centerX && t.z === area.centerZ) ??
      CONVERGENCE_HUB_LEVEL.tiles.find(
        (t) => Math.hypot(t.x - area.centerX, t.z - area.centerZ) <= 1.5 && !t.blocksMovement
      );
    if (tile) {
      onTeleportToTile(tile.x, tile.z, tile.elevation);
    } else {
      onTeleportToTile(area.centerX, area.centerZ, 0);
    }
    onPreviewProgressPatchDev(recordHubAreaVisitedInProgress(progress, areaId));
    onEmitEvent?.('DEV_HUB_WARP', `Warped to Hub area ${area.name}`);
  };

  const SECTIONS: Array<{ id: ArchipelagoSection; label: string }> = [
    { id: 'hub', label: 'Hub' },
    { id: 'npcs', label: `NPCs (${NPCS.length})` },
    { id: 'quests', label: `Quests (${QUESTS.length})` },
    { id: 'restoration', label: `Restoration (${restoredWorlds.length}/6)` },
    { id: 'checkpoints', label: `Checkpoints (${activeCheckpoints.length})` },
    { id: 'history', label: `History (${getTotalSessionHistoryCount(progress.sessionHistory)})` },
    { id: 'save', label: 'Save & Backup' },
  ];

  return (
    <div className="space-y-3 text-xs text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-[11px] text-amber-200">
        <span>
          Living Archipelago Inspector — previews modify session memory only until exited (`Ctrl+Shift+G` restores real state).
        </span>
        <button
          type="button"
          onClick={() => {
            onEnterHubDev();
            onEmitEvent?.('DEV_ENTER_HUB', 'Jumped to The Convergence Hub');
          }}
          className="px-2.5 py-1 rounded bg-teal-800/80 hover:bg-teal-700 border border-teal-500/60 text-teal-100 font-semibold cursor-pointer"
        >
          {isHubMode ? 'Re-center in Hub' : 'Jump to The Convergence Hub'}
        </button>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
              section === s.id
                ? 'bg-teal-900/80 border-teal-400 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {diagMessage && (
        <div className="rounded border border-teal-500/50 bg-teal-950/60 px-2.5 py-1.5 text-[11px] text-teal-200 flex items-center justify-between gap-2">
          <span>{diagMessage}</span>
          <button
            type="button"
            onClick={() => setDiagMessage(null)}
            className="text-teal-300 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Hub Inspector */}
      {section === 'hub' && (
        <div className="space-y-2.5">
          <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-teal-300">
                {hubSummary.title} ({hubSummary.badge})
              </div>
              <div className="text-[11px] text-slate-400">
                Visited Hub Areas: {(progress.visitedHubAreas ?? []).length}/{HUB_AREAS.length} · In Hub: {isHubMode ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {HUB_AREAS.map((area) => {
              const visited = (progress.visitedHubAreas ?? []).includes(area.id);
              return (
                <div
                  key={area.id}
                  className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2 flex flex-col justify-between gap-1.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-100">{area.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          visited
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {visited ? 'Visited' : 'New'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ({area.centerX}, {area.centerZ}) r={area.radius}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTeleportHubArea(area.id)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] cursor-pointer"
                  >
                    Warp Here
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. NPC Inspector */}
      {section === 'npcs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {NPCS.map((npc) => {
            const talked = (progress.npcTalkedIds ?? []).includes(npc.id);
            return (
              <div
                key={npc.id}
                className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-100">{npc.name}</span>
                    <span className="text-[10px] text-amber-300">{npc.role}</span>
                    {talked && (
                      <span className="text-[10px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        Talked
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Tile ({npc.hubX}, {npc.hubZ}) · Elev {npc.elevation}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isHubMode) onEnterHubDev();
                      onTeleportToTile(npc.hubX, npc.hubZ + 1, npc.elevation);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] cursor-pointer"
                  >
                    Warp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPreviewProgressPatchDev(recordNpcTalkedInProgress(progress, npc.id));
                      onOpenNpcDialogueDev(npc.id);
                    }}
                    className="px-2 py-1 rounded bg-teal-900/80 hover:bg-teal-800 border border-teal-500/50 text-[10px] text-teal-100 cursor-pointer"
                  >
                    Dialogue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Quest Inspector */}
      {section === 'quests' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {(['all', 'main_story', 'world_restoration', 'hero_story', 'side_quest', 'hidden_secret'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setQuestFilter(cat)}
                  className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer ${
                    questFilter === cat
                      ? 'bg-amber-900/70 border-amber-400 text-amber-100'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredQuests.map((q) => {
              const rec = progress.questProgress?.[q.id];
              const isTracked = progress.trackedQuestId === q.id;
              return (
                <div
                  key={q.id}
                  className="rounded border border-slate-700/80 bg-slate-900/90 p-2 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{q.id}</span>
                      <span className="font-semibold text-slate-100">{q.title}</span>
                      {rec?.completed && (
                        <span className="px-1 rounded bg-emerald-950 text-emerald-300 text-[10px]">
                          DONE
                        </span>
                      )}
                      {!rec?.discovered && (
                        <span className="px-1 rounded bg-slate-800 text-slate-400 text-[10px]">
                          UNDISCOVERED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Steps {rec?.completedSteps.length ?? 0}/{q.steps.length} · Category {q.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onPreviewProgressPatchDev(setTrackedQuestInProgress(progress, q.id))
                      }
                      className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer ${
                        isTracked
                          ? 'bg-amber-700 border-amber-400 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-200'
                      }`}
                    >
                      {isTracked ? 'Tracked' : 'Track'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleQuestPreview(q.id)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] cursor-pointer"
                    >
                      {rec?.completed ? 'Reset' : 'Complete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. World Restoration Inspector */}
      {section === 'restoration' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {WORLDS.map((w) => {
            const isRestored = restoredWorlds.includes(w.id);
            const doneCount = countCompletedStagesInWorld(w.id, progress.completedLevels);
            return (
              <div
                key={w.id}
                className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-slate-100">
                    W{w.order} · {w.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {doneCount}/10 stages · {isRestored ? 'RESTORED' : 'UNRESTORED'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleWorldRestorationPreview(w.id)}
                  className={`px-2.5 py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                    isRestored
                      ? 'bg-emerald-900/80 border-emerald-500 text-emerald-100'
                      : 'bg-slate-800 border-slate-600 text-slate-200'
                  }`}
                >
                  {isRestored ? 'Revert Preview' : 'Preview Restored'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Checkpoints Inspector */}
      {section === 'checkpoints' && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-700/80 bg-slate-900/90 p-2">
            <span>
              Active Stage Checkpoints: {activeCheckpoints.length} / 60 stages
            </span>
            <button
              type="button"
              onClick={handleCapturePreviewCheckpoint}
              className="px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-700 border border-teal-500/60 text-teal-100 text-[11px] cursor-pointer"
            >
              Capture Test Checkpoint (Current Stage)
            </button>
          </div>
          {activeCheckpoints.length === 0 ? (
            <div className="rounded border border-slate-800 bg-slate-950/60 p-3 text-slate-400">
              No active mid-run checkpoints recorded yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeCheckpoints.map((cp) => (
                <div
                  key={cp.levelId}
                  className="rounded border border-slate-700/80 bg-slate-900/90 p-2 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-slate-100">
                      Stage {String(cp.levelId).padStart(2, '0')} · Hero {cp.characterId}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ({cp.playerX.toFixed(1)}, {cp.playerZ.toFixed(1)}) · {cp.elapsedSeconds.toFixed(1)}s · {cp.interactionsCount} ACT · Crystal {cp.crystalRestored ? 'ON' : 'OFF'}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleLoadPreviewCheckpoint(cp.levelId)}
                      className="px-2 py-0.5 rounded bg-teal-900 border border-teal-500/50 text-[10px] text-teal-100 cursor-pointer"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearPreviewCheckpoint(cp.levelId)}
                      className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-[10px] text-rose-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Session History Inspector */}
      {section === 'history' && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {sessionEntries.length === 0 ? (
            <div className="rounded border border-slate-800 bg-slate-950/60 p-3 text-slate-400">
              No stage sessions recorded yet. Complete or checkpoint-save any stage to record history (capped at 5/stage).
            </div>
          ) : (
            sessionEntries.map(({ stageId, items }) => (
              <div
                key={stageId}
                className="rounded border border-slate-700/80 bg-slate-900/90 p-2 space-y-1"
              >
                <div className="font-semibold text-teal-300">
                  Stage {String(stageId).padStart(2, '0')} ({items.length}/5 runs)
                </div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between font-mono text-[10px] text-slate-300"
                  >
                    <span>
                      {item.outcome} · {item.characterId} · {item.starsEarned}★
                    </span>
                    <span>
                      {item.clearSeconds.toFixed(1)}s · {item.actionsUsed} ACT
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* 7. Save & Backup Diagnostics */}
      {section === 'save' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded border border-slate-700/80 bg-slate-900/90 p-2">
              <div className="text-[10px] text-slate-400">Schema Version</div>
              <div className="font-bold text-teal-300">v{progress.saveVersion ?? 3}</div>
            </div>
            <div className="rounded border border-slate-700/80 bg-slate-900/90 p-2">
              <div className="text-[10px] text-slate-400">Primary Key</div>
              <div className="font-bold text-slate-100">{diag ? `${diag.primaryBytes} B` : '—'}</div>
            </div>
            <div className="rounded border border-slate-700/80 bg-slate-900/90 p-2">
              <div className="text-[10px] text-slate-400">Backup Key</div>
              <div className="font-bold text-slate-100">
                {diag ? (diag.hasBackup ? `${diag.backupBytes} B` : 'None') : '—'}
              </div>
            </div>
            <div className="rounded border border-slate-700/80 bg-slate-900/90 p-2">
              <div className="text-[10px] text-slate-400">Active Title</div>
              <div className="font-bold text-amber-300 truncate">
                {progress.activeTitle ?? 'None'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRunInMemoryRoundtripTest}
              className="px-3 py-1.5 rounded bg-teal-900/80 hover:bg-teal-800 border border-teal-500/60 text-teal-100 font-semibold cursor-pointer"
            >
              Verify Export/Import + Corrupt Guard (In-Memory)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
