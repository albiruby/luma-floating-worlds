import React from 'react';
import { getElevationPlatformHeight, isGateOpen } from '../../game/rules';
import { Direction, LevelDef, PuzzleRuntimeState } from '../../game/types';

interface PuzzleInspectorPanelProps {
  level: LevelDef;
  puzzleState: PuzzleRuntimeState;
  onForceSwitch: (switchId: string, active: boolean) => void;
  onResetSwitch: (switchId: string) => void;
  onForceGate: (gateId: string, mode: 'open' | 'closed' | null) => void;
  onSetRotatingStep: (platformId: string, step: Direction) => void;
  onResetRotating: (platformId: string) => void;
  onSetElevationHigh: (liftId: string, high: boolean) => void;
  onResetElevation: (liftId: string) => void;
  onSetEmitterEnabled: (emitterId: string, enabled: boolean) => void;
  onSetPrismDirection: (prismId: string, dir: Direction) => void;
  onForceSubCrystal: (subId: string, lit: boolean) => void;
  onForceCrystal: (restored: boolean) => void;
  onRecalculateLight: () => void;
  onResetAllLight: () => void;
  onResetAllPuzzles: () => void;
}

export const PuzzleInspectorPanel: React.FC<PuzzleInspectorPanelProps> = ({
  level,
  puzzleState,
  onForceSwitch,
  onResetSwitch,
  onForceGate,
  onSetRotatingStep,
  onResetRotating,
  onSetElevationHigh,
  onResetElevation,
  onSetEmitterEnabled,
  onSetPrismDirection,
  onForceSubCrystal,
  onForceCrystal,
  onRecalculateLight,
  onResetAllLight,
  onResetAllPuzzles,
}) => {
  return (
    <div className="space-y-3 text-xs text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5">
        <div className="font-mono text-[11px]">
          Crystal:{' '}
          <span className={puzzleState.crystalRestored ? 'text-teal-300 font-semibold' : 'text-slate-300'}>
            {puzzleState.crystalRestored ? 'RESTORED' : 'DORMANT'}
          </span>{' '}
          · Portal:{' '}
          <span className={puzzleState.portalAwakened ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
            {puzzleState.portalAwakened ? 'AWAKENED' : 'SEALED'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onForceCrystal(true)}
            className="px-2 py-1 rounded bg-teal-900/70 hover:bg-teal-800 border border-teal-500/60 cursor-pointer"
          >
            Force Crystal + Portal
          </button>
          <button
            type="button"
            onClick={() => onForceCrystal(false)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            Reset Crystal
          </button>
          <button
            type="button"
            onClick={onResetAllPuzzles}
            className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 border border-rose-500/50 cursor-pointer"
          >
            Reset All Puzzles
          </button>
        </div>
      </div>

      {/* Pressure Switches */}
      {level.pressureSwitches.length > 0 && (
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
          <div className="font-semibold text-teal-300">
            Pressure Switches ({level.pressureSwitches.length})
          </div>
          {level.pressureSwitches.map((sw) => {
            const active = Boolean(puzzleState.switchStates[sw.id]);
            return (
              <div key={sw.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-1.5">
                <div className="font-mono text-[11px]">
                  <span className="font-semibold text-slate-100">{sw.id}</span> ({sw.x},{sw.z}) ·{' '}
                  {sw.latch ? 'Latch' : 'Toggle'} ·{' '}
                  <span className={active ? 'text-emerald-300' : 'text-slate-400'}>
                    {active ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onForceSwitch(sw.id, true)}
                    className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/50 cursor-pointer"
                  >
                    Force ON
                  </button>
                  <button
                    type="button"
                    onClick={() => onForceSwitch(sw.id, false)}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                  >
                    Force OFF
                  </button>
                  <button
                    type="button"
                    onClick={() => onForceSwitch(sw.id, !active)}
                    className="px-2 py-0.5 rounded bg-sky-900/60 border border-sky-500/50 cursor-pointer"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    onClick={() => onResetSwitch(sw.id)}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gates */}
      {level.gates.length > 0 && (
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
          <div className="font-semibold text-teal-300">Gates ({level.gates.length})</div>
          {level.gates.map((gate) => {
            const open = isGateOpen(level, puzzleState, gate.id);
            const override = puzzleState.debugGateOverrides?.[gate.id];
            return (
              <div key={gate.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-1.5">
                <div className="font-mono text-[11px]">
                  <span className="font-semibold text-slate-100">{gate.id}</span> ({gate.x},{gate.z}) ·{' '}
                  <span className={open ? 'text-emerald-300' : 'text-rose-300'}>
                    {open ? 'OPEN' : 'CLOSED'}
                  </span>
                  {gate.inverted ? ' · INV' : ''}
                  {gate.blocksLight ? ' · BlocksLight' : ''}
                  {override ? ` · [FORCED ${override.toUpperCase()}]` : ''}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onForceGate(gate.id, 'open')}
                    className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/50 cursor-pointer"
                  >
                    Force Open
                  </button>
                  <button
                    type="button"
                    onClick={() => onForceGate(gate.id, 'closed')}
                    className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/50 cursor-pointer"
                  >
                    Force Closed
                  </button>
                  <button
                    type="button"
                    onClick={() => onForceGate(gate.id, null)}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                  >
                    Restore Normal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rotating Platforms */}
      {level.rotatingPlatforms.length > 0 && (
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
          <div className="font-semibold text-teal-300">
            Rotating Platforms ({level.rotatingPlatforms.length})
          </div>
          {level.rotatingPlatforms.map((plat) => {
            const step = puzzleState.rotatingSteps[plat.id] ?? plat.initialStep;
            return (
              <div key={plat.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-1.5">
                <div className="font-mono text-[11px]">
                  <span className="font-semibold text-slate-100">{plat.id}</span> pivot ({plat.pivotX},{plat.pivotZ}) · Step {step} ({step * 90}°)
                </div>
                <div className="flex gap-1">
                  {([0, 1, 2, 3] as Direction[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => onSetRotatingStep(plat.id, d)}
                      className={`px-2 py-0.5 rounded border font-mono cursor-pointer ${
                        step === d
                          ? 'bg-teal-800 border-teal-400 text-white'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                    >
                      {d * 90}°
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onResetRotating(plat.id)}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Elevation Platforms */}
      {level.elevationPlatforms.length > 0 && (
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
          <div className="font-semibold text-teal-300">
            Elevation Platforms ({level.elevationPlatforms.length})
          </div>
          {level.elevationPlatforms.map((lift) => {
            const elev = getElevationPlatformHeight(level, puzzleState, lift.id);
            const isHigh = elev === lift.highElevation;
            return (
              <div key={lift.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-1.5">
                <div className="font-mono text-[11px]">
                  <span className="font-semibold text-slate-100">{lift.id}</span> ({lift.x},{lift.z}) · Elev {elev}{' '}
                  ({isHigh ? 'HIGH' : 'LOW'})
                  {lift.linkedSwitchId ? ` · Linked: ${lift.linkedSwitchId}` : ''}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onSetElevationHigh(lift.id, false)}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                  >
                    Force Low ({lift.lowElevation})
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetElevationHigh(lift.id, true)}
                    className="px-2 py-0.5 rounded bg-sky-900/60 border border-sky-500/50 cursor-pointer"
                  >
                    Force High ({lift.highElevation})
                  </button>
                  <button
                    type="button"
                    onClick={() => onResetElevation(lift.id)}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Light System */}
      {(level.lightEmitters.length > 0 || level.lightPrisms.length > 0) && (
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-amber-300">
              Light & Prism System ({puzzleState.lightSegments.length} segments)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onRecalculateLight}
                className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
              >
                Recalculate Beams
              </button>
              <button
                type="button"
                onClick={onResetAllLight}
                className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
              >
                Reset Light Overrides
              </button>
            </div>
          </div>

          {level.lightEmitters.map((em) => {
            const disabled = Boolean(puzzleState.debugDisabledEmitters?.[em.id]);
            return (
              <div key={em.id} className="flex items-center justify-between border-t border-slate-800 pt-1.5 font-mono text-[11px]">
                <span>
                  Emitter <strong className="text-slate-100">{em.id}</strong> ({em.x},{em.z}) ·{' '}
                  {disabled ? 'DISABLED' : 'ACTIVE'}
                </span>
                <button
                  type="button"
                  onClick={() => onSetEmitterEnabled(em.id, disabled)}
                  className={`px-2 py-0.5 rounded border cursor-pointer ${
                    disabled
                      ? 'bg-emerald-900/60 border-emerald-500/50'
                      : 'bg-rose-900/60 border-rose-500/50'
                  }`}
                >
                  {disabled ? 'Enable Emitter' : 'Disable Emitter'}
                </button>
              </div>
            );
          })}

          {level.lightPrisms.map((prism) => {
            const dir = puzzleState.prismDirections[prism.id] ?? prism.initialDirection;
            const lit = puzzleState.litPrismIds.includes(prism.id);
            return (
              <div key={prism.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-1.5 font-mono text-[11px]">
                <span>
                  Prism <strong className="text-slate-100">{prism.id}</strong> ({prism.x},{prism.z}) ·{' '}
                  <span className={lit ? 'text-teal-300' : 'text-slate-400'}>{lit ? 'LIT' : 'UNLIT'}</span>
                </span>
                <div className="flex gap-1">
                  {([0, 1, 2, 3] as Direction[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => onSetPrismDirection(prism.id, d)}
                      className={`px-2 py-0.5 rounded border cursor-pointer ${
                        dir === d
                          ? 'bg-amber-800 border-amber-400 text-white'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                    >
                      {d * 90}°
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {(level.subCrystals ?? []).map((sub) => {
            const lit = puzzleState.litSubCrystalIds.includes(sub.id);
            return (
              <div key={sub.id} className="flex items-center justify-between border-t border-slate-800 pt-1.5 font-mono text-[11px]">
                <span>
                  Sub-Crystal <strong className="text-slate-100">{sub.id}</strong> ({sub.x},{sub.z}) ·{' '}
                  {lit ? 'ENERGIZED' : 'DORMANT'}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onForceSubCrystal(sub.id, true)}
                    className="px-2 py-0.5 rounded bg-teal-900/60 border border-teal-500/50 cursor-pointer"
                  >
                    Force Energized
                  </button>
                  <button
                    type="button"
                    onClick={() => onForceSubCrystal(sub.id, false)}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
