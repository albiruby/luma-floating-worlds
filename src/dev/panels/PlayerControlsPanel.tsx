import React, { useState } from 'react';
import { CHARACTERS } from '../../game/characters';
import { CharacterId, LevelDef, PlayerRuntimeState, TILE_SIZE } from '../../game/types';
import { GodModeSettings, SpeedMultiplier } from '../debugTypes';

interface PlayerControlsPanelProps {
  level: LevelDef;
  activeCharacterId: CharacterId;
  playerState: PlayerRuntimeState;
  godMode: GodModeSettings;
  onSetHeroDev: (heroId: CharacterId) => void;
  onTriggerAbilityDev: () => void;
  onUpdateGodMode: (patch: Partial<GodModeSettings>) => void;
  onTeleportToTile: (gx: number, gz: number, elevation?: number) => void;
  onWarpToSpawn: () => void;
  onWarpToCrystal: () => void;
  onWarpToPortal: () => void;
  onPanFreeCamera: (dx: number, dz: number) => void;
  onResetFreeCamera: () => void;
  onForceObjectiveComplete: () => void;
}

const SPEEDS: SpeedMultiplier[] = [1, 2, 4, 8];

export const PlayerControlsPanel: React.FC<PlayerControlsPanelProps> = ({
  level,
  activeCharacterId,
  playerState,
  godMode,
  onSetHeroDev,
  onTriggerAbilityDev,
  onUpdateGodMode,
  onTeleportToTile,
  onWarpToSpawn,
  onWarpToCrystal,
  onWarpToPortal,
  onPanFreeCamera,
  onResetFreeCamera,
  onForceObjectiveComplete,
}) => {
  const [tpX, setTpX] = useState(String(level.spawn.x));
  const [tpZ, setTpZ] = useState(String(level.spawn.z));
  const [tpElev, setTpElev] = useState('');

  const curGx = Math.round(playerState.x / TILE_SIZE);
  const curGz = Math.round(playerState.z / TILE_SIZE);

  return (
    <div className="space-y-3 text-xs text-slate-200">
      {/* Live Position & Hero Override */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[11px]">
          <span className="text-slate-400">Pos: </span>
          <span className="text-teal-300">
            ({playerState.x.toFixed(2)}, {playerState.y.toFixed(2)}, {playerState.z.toFixed(2)})
          </span>
          <span className="text-slate-400"> · Tile </span>
          <span>
            ({curGx}, {curGz})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTriggerAbilityDev}
            className="px-2 py-1 rounded bg-teal-900/70 hover:bg-teal-800 border border-teal-500/60 text-teal-100 cursor-pointer"
          >
            Trigger [Q] Ability
          </button>
          <button
            type="button"
            onClick={onWarpToSpawn}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            Reset Position
          </button>
        </div>
      </div>

      {/* DEV Hero Switcher (Does NOT save) */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300">DEV Hero Override (Temp, No Save)</span>
          <span className="font-mono text-amber-300">{activeCharacterId}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CHARACTERS.map((hero) => {
            const active = hero.id === activeCharacterId;
            return (
              <button
                key={hero.id}
                type="button"
                onClick={() => onSetHeroDev(hero.id)}
                className={`px-2.5 py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                  active
                    ? 'bg-teal-800 border-teal-400 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                }`}
              >
                {hero.name} ({hero.abilityName})
              </button>
            );
          })}
        </div>
      </div>

      {/* God Mode Capabilities */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onUpdateGodMode({ noClip: !godMode.noClip })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            godMode.noClip
              ? 'bg-teal-900/70 border-teal-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">No Clip</div>
          <div className="text-[10px] opacity-80">{godMode.noClip ? 'ACTIVE — Pass obstacles' : 'Off'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateGodMode({ freeMovement: !godMode.freeMovement })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            godMode.freeMovement
              ? 'bg-teal-900/70 border-teal-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Free Movement</div>
          <div className="text-[10px] opacity-80">{godMode.freeMovement ? 'ACTIVE — Ignore void edges' : 'Off'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateGodMode({ flyMode: !godMode.flyMode })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            godMode.flyMode
              ? 'bg-sky-900/70 border-sky-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Fly Mode</div>
          <div className="text-[10px] opacity-80">
            {godMode.flyMode ? `ACTIVE (+${godMode.flyOffsetY.toFixed(1)}u)` : 'Off'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateGodMode({ freeCamera: !godMode.freeCamera })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            godMode.freeCamera
              ? 'bg-indigo-900/70 border-indigo-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Free Camera</div>
          <div className="text-[10px] opacity-80">{godMode.freeCamera ? 'Detached Pan' : 'Follow Wayfinder'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateGodMode({ freezeTimer: !godMode.freezeTimer })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            godMode.freezeTimer
              ? 'bg-amber-900/70 border-amber-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Freeze Timer</div>
          <div className="text-[10px] opacity-80">{godMode.freezeTimer ? 'PAUSED' : 'Running'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateGodMode({ freezeEnvironment: !godMode.freezeEnvironment })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            godMode.freezeEnvironment
              ? 'bg-amber-900/70 border-amber-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Freeze Environment</div>
          <div className="text-[10px] opacity-80">{godMode.freezeEnvironment ? 'FROZEN' : 'Animating'}</div>
        </button>
      </div>

      {/* Speed Multiplier & Fly Altitude */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-300">Speed Multiplier</div>
          <div className="flex gap-1.5">
            {SPEEDS.map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onUpdateGodMode({ speedMultiplier: spd })}
                className={`flex-1 py-1 rounded border font-mono cursor-pointer ${
                  godMode.speedMultiplier === spd
                    ? 'bg-teal-700 border-teal-400 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300'
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Fly Altitude Offset</span>
            <span className="font-mono text-sky-300">+{godMode.flyOffsetY.toFixed(1)}u</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onUpdateGodMode({
                  flyMode: true,
                  flyOffsetY: Math.max(0, Number((godMode.flyOffsetY - 0.65).toFixed(2))),
                })
              }
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
            >
              Descend
            </button>
            <input
              aria-label="Fly Altitude Offset"
              type="range"
              min={0}
              max={6}
              step={0.25}
              value={godMode.flyOffsetY}
              onChange={(e) =>
                onUpdateGodMode({ flyMode: true, flyOffsetY: Number(e.target.value) })
              }
              className="flex-1 accent-sky-400"
            />
            <button
              type="button"
              onClick={() =>
                onUpdateGodMode({
                  flyMode: true,
                  flyOffsetY: Math.min(6, Number((godMode.flyOffsetY + 0.65).toFixed(2))),
                })
              }
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
            >
              Ascend
            </button>
          </div>
        </div>
      </div>

      {/* Free Camera Panning Controls */}
      {godMode.freeCamera && (
        <div className="rounded-lg border border-indigo-500/40 bg-indigo-950/30 p-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-indigo-200">Free Camera Pan:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onPanFreeCamera(-2, 0)}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-600 cursor-pointer"
            >
              Pan -X
            </button>
            <button
              type="button"
              onClick={() => onPanFreeCamera(2, 0)}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-600 cursor-pointer"
            >
              Pan +X
            </button>
            <button
              type="button"
              onClick={() => onPanFreeCamera(0, -2)}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-600 cursor-pointer"
            >
              Pan -Z
            </button>
            <button
              type="button"
              onClick={() => onPanFreeCamera(0, 2)}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-600 cursor-pointer"
            >
              Pan +Z
            </button>
            <button
              type="button"
              onClick={onResetFreeCamera}
              className="px-2 py-1 rounded bg-indigo-800 border border-indigo-400 text-white cursor-pointer"
            >
              Recenter
            </button>
          </div>
        </div>
      )}

      {/* Teleportation */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
        <div className="font-semibold text-slate-200">Teleport Wayfinder</div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-[11px]">
            <span>Tile X</span>
            <input
              type="number"
              value={tpX}
              onChange={(e) => setTpX(e.target.value)}
              className="w-16 px-1.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
            />
          </label>
          <label className="flex items-center gap-1 text-[11px]">
            <span>Tile Z</span>
            <input
              type="number"
              value={tpZ}
              onChange={(e) => setTpZ(e.target.value)}
              className="w-16 px-1.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
            />
          </label>
          <label className="flex items-center gap-1 text-[11px]">
            <span>Elev (opt)</span>
            <input
              type="number"
              placeholder="auto"
              value={tpElev}
              onChange={(e) => setTpElev(e.target.value)}
              className="w-16 px-1.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const gx = Number(tpX);
              const gz = Number(tpZ);
              const elev = tpElev.trim() === '' ? undefined : Number(tpElev);
              if (Number.isFinite(gx) && Number.isFinite(gz)) {
                onTeleportToTile(Math.round(gx), Math.round(gz), elev);
              }
            }}
            className="px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-700 border border-teal-500 text-white cursor-pointer"
          >
            Teleport
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={onWarpToSpawn}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            To Spawn ({level.spawn.x},{level.spawn.z})
          </button>
          <button
            type="button"
            onClick={onWarpToCrystal}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            To Crystal ({level.crystal.x},{level.crystal.z})
          </button>
          <button
            type="button"
            onClick={onWarpToPortal}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
          >
            To Portal ({level.portal.x},{level.portal.z})
          </button>
          <button
            type="button"
            onClick={onForceObjectiveComplete}
            className="px-2 py-1 rounded bg-amber-900/70 hover:bg-amber-800 border border-amber-500/60 text-amber-100 cursor-pointer"
          >
            Force Complete (Test Only)
          </button>
        </div>
      </div>
    </div>
  );
};
