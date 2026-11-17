import React, { useMemo, useState } from 'react';
import { computeStageHash } from '../../game/echoEngine';
import { StageValidationResult, validateCustomLevel } from '../../game/stageValidator';
import { getMatchingSynergiesForParty } from '../../game/synergy';
import { LevelDef, PuzzleRuntimeState } from '../../game/types';
import { forceEchoPlateState, forceSynergyNodeState } from '../debugAdapter';

interface UnboundInspectorPanelProps {
  level: LevelDef;
  puzzleState: PuzzleRuntimeState;
  onApplyPuzzleStateDev?: (next: PuzzleRuntimeState) => void;
  onEmitEvent?: (type: string, details: string, objectId?: string) => void;
}

export const UnboundInspectorPanel: React.FC<UnboundInspectorPanelProps> = ({
  level,
  puzzleState,
  onApplyPuzzleStateDev,
  onEmitEvent,
}) => {
  const [validation, setValidation] = useState<StageValidationResult | null>(null);

  const stageHash = useMemo(() => computeStageHash(level), [level]);
  const echoPlates = level.echoPlates ?? [];
  const synergyNodes = level.synergyNodes ?? [];
  const synergyPair = getMatchingSynergiesForParty(
    puzzleState.activeCharacterId,
    puzzleState.companionCharacterId ?? null
  )[0];

  const handleTogglePlate = (plateId: string) => {
    if (!onApplyPuzzleStateDev) return;
    const current = Boolean(puzzleState.echoPlateStates?.[plateId]);
    const next = forceEchoPlateState(level, puzzleState, plateId, !current);
    onApplyPuzzleStateDev(next);
    onEmitEvent?.('DEV_ECHO_PLATE', `Echo Plate ${plateId} -> ${!current ? 'ACTIVE' : 'IDLE'}`, plateId);
  };

  const handleToggleSynergy = (nodeId: string) => {
    if (!onApplyPuzzleStateDev) return;
    const current = Boolean(puzzleState.synergyNodesActive?.[nodeId]);
    const next = forceSynergyNodeState(level, puzzleState, nodeId, !current);
    onApplyPuzzleStateDev(next);
    onEmitEvent?.('DEV_SYNERGY_NODE', `Synergy Node ${nodeId} -> ${!current ? 'ACTIVE' : 'IDLE'}`, nodeId);
  };

  const handleRunValidator = () => {
    const res = validateCustomLevel(level);
    setValidation(res);
    onEmitEvent?.('DEV_STAGE_VALIDATE', `BFS Validator: ${res.status} (${res.exploredStates} states)`);
  };

  return (
    <div className="space-y-3 text-xs text-slate-200">
      {/* Stage Hash & Metadata */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-teal-300">
            Unbound Engine Telemetry (Dev Only)
          </div>
          <div className="font-mono text-[11px] text-slate-300">
            Stage: <span className="text-white">{level.title}</span> · Hash:{' '}
            <span className="text-amber-300">{stageHash}</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Source: {level.customMeta?.source ?? 'campaign'} · Echoes:{' '}
            {level.echoEnabled ? `Enabled (max ${level.maxEchoes ?? 3})` : 'Disabled'} · Party:{' '}
            {level.partyEnabled ? 'Enabled' : 'Solo'}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunValidator}
          className="px-2.5 py-1.5 rounded bg-teal-800 hover:bg-teal-700 border border-teal-400/70 text-white font-semibold cursor-pointer"
        >
          Run Stage BFS Validator
        </button>
      </div>

      {/* BFS Validator Result */}
      {validation && (
        <div
          className={`rounded-lg border p-2.5 space-y-1 ${
            validation.status === 'VALID'
              ? 'border-emerald-500/50 bg-emerald-950/40'
              : validation.status === 'INVALID'
                ? 'border-rose-500/50 bg-rose-950/40'
                : 'border-amber-500/50 bg-amber-950/35'
          }`}
        >
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="font-bold">STATUS: {validation.status}</span>
            <span>
              Explored: {validation.exploredStates} states
              {validation.shortestActions !== null ? ` · Min actions: ${validation.shortestActions}` : ''}
            </span>
          </div>
          <div className="text-[11px] text-slate-200">{validation.summary}</div>
          {validation.issues.length > 0 && (
            <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-0.5">
              {validation.issues.map((issue, idx) => (
                <li key={`${issue.code}-${idx}`}>
                  [{issue.severity.toUpperCase()}] {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 2-Hero Party & Synergy Status */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/80 p-2.5 space-y-1">
        <div className="font-semibold text-[11px] text-slate-300 uppercase tracking-wider">
          2-Hero Party & Synergy State
        </div>
        <div className="font-mono text-[11px] text-slate-200 flex flex-wrap gap-3">
          <span>Lead: {puzzleState.activeCharacterId}</span>
          <span>Partner: {puzzleState.companionCharacterId ?? 'None'}</span>
          <span>
            Mode: {puzzleState.companionHoldPosition ? 'Hold Position' : 'Follow'}
          </span>
          <span>Slot: {puzzleState.activePartySlot ?? 0}</span>
        </div>
        {synergyPair && (
          <div className="text-[11px] text-amber-300">
            Active Pair Synergy: <strong>{synergyPair.name}</strong> — {synergyPair.shortDesc}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Echo Plates */}
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/80 p-2.5 space-y-2">
          <div className="font-semibold text-[11px] text-cyan-300 uppercase tracking-wider">
            Echo Plates ({echoPlates.length})
          </div>
          {echoPlates.length === 0 ? (
            <div className="text-slate-400 text-[11px]">No Echo Plates in this stage.</div>
          ) : (
            <div className="space-y-1.5">
              {echoPlates.map((plate) => {
                const active = Boolean(puzzleState.echoPlateStates?.[plate.id]);
                return (
                  <div
                    key={plate.id}
                    className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-950/70 px-2 py-1.5"
                  >
                    <div>
                      <div className="font-mono text-[11px] text-white">
                        {plate.id} ({plate.x}, {plate.z})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {plate.label} {plate.echoOnly ? '· ECHO-ONLY' : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePlate(plate.id)}
                      className={`px-2 py-1 rounded border text-[10px] font-mono cursor-pointer ${
                        active
                          ? 'bg-cyan-800/80 border-cyan-400 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-300'
                      }`}
                    >
                      {active ? 'ACTIVE' : 'IDLE'} (Toggle)
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Synergy Nodes */}
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/80 p-2.5 space-y-2">
          <div className="font-semibold text-[11px] text-amber-300 uppercase tracking-wider">
            Synergy Nodes ({synergyNodes.length})
          </div>
          {synergyNodes.length === 0 ? (
            <div className="text-slate-400 text-[11px]">No Synergy Nodes in this stage.</div>
          ) : (
            <div className="space-y-1.5">
              {synergyNodes.map((node) => {
                const active = Boolean(puzzleState.synergyNodesActive?.[node.id]);
                return (
                  <div
                    key={node.id}
                    className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-950/70 px-2 py-1.5"
                  >
                    <div>
                      <div className="font-mono text-[11px] text-white">
                        {node.id} · {node.heroA} + {node.heroB}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {node.label} ({node.x}, {node.z})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSynergy(node.id)}
                      className={`px-2 py-1 rounded border text-[10px] font-mono cursor-pointer ${
                        active
                          ? 'bg-amber-700/80 border-amber-400 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-300'
                      }`}
                    >
                      {active ? 'ACTIVE' : 'IDLE'} (Toggle)
                    </button>
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
