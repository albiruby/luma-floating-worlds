import React, { useMemo, useState } from 'react';
import { LevelDef, PuzzleRuntimeState } from '../../game/types';
import { WorldOverlayFlags } from '../debugTypes';
import { buildLevelObjectInventory, buildPuzzleConnectionLinks } from '../worldInventory';

interface WorldInspectorPanelProps {
  level: LevelDef;
  puzzleState: PuzzleRuntimeState;
  overlays: WorldOverlayFlags;
  selectedObjectId: string | null;
  pickObjectMode: boolean;
  onToggleOverlay: (key: keyof WorldOverlayFlags) => void;
  onTurnAllOverlaysOff: () => void;
  onTogglePickMode: () => void;
  onSelectObject: (objectId: string | null) => void;
  onTeleportToTile: (gx: number, gz: number, elevation?: number) => void;
}

const OVERLAY_LABELS: Array<{ key: keyof WorldOverlayFlags; label: string; color: string }> = [
  { key: 'tileGrid', label: 'Tile Grid', color: 'border-sky-500/60' },
  { key: 'coordinates', label: 'Coordinates (x,z)', color: 'border-blue-500/60' },
  { key: 'elevation', label: 'Elevation Markers', color: 'border-amber-500/60' },
  { key: 'walkability', label: 'Walkable / Blocked', color: 'border-emerald-500/60' },
  { key: 'collision', label: 'Collision Bounds', color: 'border-rose-500/60' },
  { key: 'voidBounds', label: 'Void Boundaries', color: 'border-orange-500/60' },
  { key: 'interactables', label: 'Interactable Markers', color: 'border-cyan-500/60' },
  { key: 'lightPaths', label: 'Light Paths', color: 'border-yellow-500/60' },
  { key: 'puzzleConnections', label: 'Puzzle Links', color: 'border-emerald-400/60' },
  { key: 'spawnAndObjectives', label: 'Spawn / Crystal / Portal', color: 'border-teal-400/60' },
  { key: 'objectBounds', label: 'Object Bounds', color: 'border-violet-400/60' },
];

export const WorldInspectorPanel: React.FC<WorldInspectorPanelProps> = ({
  level,
  puzzleState,
  overlays,
  selectedObjectId,
  pickObjectMode,
  onToggleOverlay,
  onTurnAllOverlaysOff,
  onTogglePickMode,
  onSelectObject,
  onTeleportToTile,
}) => {
  const [search, setSearch] = useState('');

  const inventory = useMemo(
    () => buildLevelObjectInventory(level, puzzleState),
    [level, puzzleState]
  );

  const links = useMemo(
    () => buildPuzzleConnectionLinks(level, puzzleState),
    [level, puzzleState]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q)
    );
  }, [inventory, search]);

  const selected = useMemo(
    () => inventory.find((i) => i.id === selectedObjectId) ?? null,
    [inventory, selectedObjectId]
  );

  return (
    <div className="space-y-3 text-xs text-slate-200">
      {/* 3D Overlay Toggles */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sky-300">3D Map & Debug Overlays</span>
          <button
            type="button"
            onClick={onTurnAllOverlaysOff}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] cursor-pointer"
          >
            Turn All Overlays Off
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {OVERLAY_LABELS.map((item) => {
            const on = overlays[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onToggleOverlay(item.key)}
                className={`px-2 py-1.5 rounded border text-left text-[11px] cursor-pointer ${
                  on
                    ? `bg-slate-800 ${item.color} text-white font-semibold`
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {on ? '● ' : '○ '}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Object Inspector Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-amber-300">
              Object Inspector ({inventory.length})
            </span>
            <button
              type="button"
              onClick={onTogglePickMode}
              className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                pickObjectMode
                  ? 'bg-amber-800 border-amber-400 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300'
              }`}
            >
              {pickObjectMode ? 'Picking in 3D (ON)' : 'Pick in 3D Scene'}
            </button>
          </div>

          <input
            aria-label="Filter world objects"
            type="text"
            placeholder="Filter by ID, type, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-100 text-[11px]"
          />

          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {filtered.map((obj) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => onSelectObject(obj.id)}
                className={`w-full text-left px-2 py-1 rounded border text-[11px] cursor-pointer flex items-center justify-between ${
                  selectedObjectId === obj.id
                    ? 'bg-teal-900/70 border-teal-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="truncate font-mono">
                  [{obj.kind}] {obj.id}
                </span>
                <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                  ({obj.gx},{obj.gz})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Object Details */}
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 space-y-2">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-1.5">
                <div>
                  <div className="font-semibold text-slate-100">{selected.name}</div>
                  <div className="font-mono text-[10px] text-teal-300">
                    ID: {selected.id} · {selected.kind.toUpperCase()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onTeleportToTile(selected.gx, selected.gz, selected.elevation)}
                  className="px-2 py-1 rounded bg-sky-900/70 hover:bg-sky-800 border border-sky-500/60 text-[11px] cursor-pointer shrink-0"
                >
                  Teleport Here
                </button>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400">Grid / Elev: </span>({selected.gx}, {selected.gz}) · E
                  {selected.elevation}
                </div>
                <div>
                  <span className="text-slate-400">World: </span>({selected.worldX.toFixed(2)},{' '}
                  {selected.worldY.toFixed(2)}, {selected.worldZ.toFixed(2)})
                </div>
                <div>
                  <span className="text-slate-400">State: </span>
                  <span className="text-amber-300">{selected.stateSummary}</span>
                </div>
                <div>
                  <span className="text-slate-400">Collision / Interact: </span>
                  {selected.collisionStatus} · {selected.interactive ? 'Interactive' : 'Passive'}
                </div>
                {selected.linkedIds.length > 0 && (
                  <div>
                    <span className="text-slate-400">Links: </span>
                    {selected.linkedIds.join(', ')}
                  </div>
                )}
                <pre className="mt-1 rounded bg-slate-950 p-1.5 text-[10px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(selected.configSummary, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-6">
              <div>Select an object from the list or enable &ldquo;Pick in 3D Scene&rdquo; and click an object.</div>
            </div>
          )}
        </div>
      </div>

      {/* Puzzle Connection Summary */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2">
        <div className="font-semibold text-[11px] text-slate-300 mb-1">
          Connection Graph ({links.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <span
              key={l.id}
              className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                l.active
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}
            >
              {l.label} [{l.active ? 'ACTIVE' : 'IDLE'}]
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
