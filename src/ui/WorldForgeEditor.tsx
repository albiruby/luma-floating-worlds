import React, { useMemo, useState } from 'react';
import { audioEngine } from '../audio/synth';
import { triggerTextDownload } from '../game/customFormats';
import {
  countLevelObjects,
  FORGE_MAX_OBJECTS,
  FORGE_MAX_TILES,
  StageValidationResult,
  validateCustomLevel,
} from '../game/stageValidator';
import { SYNERGY_DEFINITIONS } from '../game/synergy';
import {
  DecorType,
  Direction,
  LumaCustomStageFile,
  SynergyKind,
  TerrainType,
  WorldId,
} from '../game/types';
import {
  applyForgeTileAction,
  copySelectedTile,
  createInitialForgeState,
  exportForgeToCustomStageFile,
  FORGE_PRESET_SIZES,
  ForgeSizePreset,
  ForgeTool,
  mutateForgeLevel,
  pasteClipboardTileAt,
  redoForge,
  undoForge,
  updateForgeMetadata,
  WorldForgeState,
} from '../game/worldForge';
import { WORLDS } from '../game/worlds';
import { WorldForgeCanvas } from '../three/WorldForgeCanvas';

interface WorldForgeEditorProps {
  initialState?: WorldForgeState;
  defaultAuthorAlias?: string;
  onSaveStage: (stage: LumaCustomStageFile, state: WorldForgeState) => void;
  onTestPlay: (state: WorldForgeState) => void;
  onExit: () => void;
}

const TERRAIN_OPTIONS: Array<{ id: TerrainType; label: string; color: string }> = [
  { id: 'grass', label: 'Grass', color: '#78b85a' },
  { id: 'stone', label: 'Stone', color: '#9ca8b0' },
  { id: 'ruin', label: 'Ruin', color: '#c4b08e' },
  { id: 'wood', label: 'Wood', color: '#a87144' },
  { id: 'water', label: 'Water', color: '#3ea8c4' },
  { id: 'moss', label: 'Moss', color: '#4d9c72' },
  { id: 'sand', label: 'Sand', color: '#dfb975' },
  { id: 'basalt', label: 'Basalt', color: '#586069' },
  { id: 'cloud', label: 'Cloud', color: '#e6eef5' },
];

const DECOR_OPTIONS: Array<{ id: DecorType; label: string }> = [
  { id: 'tree_pine', label: 'Pine Tree' },
  { id: 'tree_broad', label: 'Canopy Tree' },
  { id: 'rock_cluster', label: 'Rock Cluster' },
  { id: 'ruin_pillar', label: 'Ruin Pillar' },
  { id: 'ruin_arch', label: 'Ruin Arch' },
  { id: 'stone_lantern', label: 'Stone Lantern' },
  { id: 'echo_monolith', label: 'Echo Monolith' },
  { id: 'verdant_arch', label: 'Verdant Arch' },
  { id: 'tidal_fountain', label: 'Tidal Fountain' },
  { id: 'ember_brazier_prop', label: 'Ember Brazier' },
  { id: 'celestial_orrery', label: 'Orrery' },
  { id: 'sky_obelisk', label: 'Sky Obelisk' },
];

const TOOL_GROUPS: Array<{
  title: string;
  items: Array<{ id: ForgeTool; label: string }>;
}> = [
  {
    title: 'Inspect & Paint',
    items: [
      { id: 'select', label: 'Select' },
      { id: 'terrain_brush', label: 'Brush Tile' },
      { id: 'island_stamp', label: '3x3 Island' },
      { id: 'elevation_up', label: 'Raise +1' },
      { id: 'elevation_down', label: 'Lower -1' },
      { id: 'stair_toggle', label: 'Stair' },
      { id: 'decor', label: 'Decor' },
      { id: 'erase', label: 'Erase' },
    ],
  },
  {
    title: 'Anchors',
    items: [
      { id: 'spawn', label: 'Spawn' },
      { id: 'crystal', label: 'Crystal' },
      { id: 'portal', label: 'Portal' },
    ],
  },
  {
    title: 'Puzzles & Echoes',
    items: [
      { id: 'switch', label: 'Switch' },
      { id: 'echo_plate', label: 'Echo Plate' },
      { id: 'gate', label: 'Gate' },
      { id: 'lift', label: 'Lift' },
      { id: 'rotating', label: 'Bridge' },
      { id: 'emitter', label: 'Emitter' },
      { id: 'prism', label: 'Prism' },
      { id: 'sub_crystal', label: 'Sub-Cryst' },
      { id: 'synergy_node', label: 'Synergy' },
    ],
  },
];

export const WorldForgeEditor: React.FC<WorldForgeEditorProps> = ({
  initialState,
  defaultAuthorAlias = 'Wayfinder',
  onSaveStage,
  onTestPlay,
  onExit,
}) => {
  const [forge, setForge] = useState<WorldForgeState>(() => {
    if (initialState) return initialState;
    const base = createInitialForgeState(undefined, 'medium');
    return { ...base, authorAlias: defaultAuthorAlias };
  });
  const [pasteMode, setPasteMode] = useState(false);
  const [validation, setValidation] = useState<StageValidationResult | null>(() =>
    validateCustomLevel((initialState ?? createInitialForgeState()).level)
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const objCount = useMemo(() => countLevelObjects(forge.level), [forge.level]);
  const tileCount = forge.level.tiles.length;

  const handleTileClick = (gx: number, gz: number) => {
    audioEngine.playUiClick();
    if (pasteMode && forge.clipboardTile) {
      setForge((prev) => pasteClipboardTileAt(prev, gx, gz));
      setPasteMode(false);
      setValidation(null);
      return;
    }
    setForge((prev) => applyForgeTileAction(prev, gx, gz));
    setValidation(null);
  };

  const handleRunValidator = () => {
    audioEngine.playUiClick();
    const res = validateCustomLevel(forge.level);
    setValidation(res);
    setStatusNotice(res.summary);
    return res;
  };

  const handleSave = () => {
    const res = handleRunValidator();
    const stageFile = exportForgeToCustomStageFile(forge, Boolean(res.solvable));
    onSaveStage(stageFile, forge);
    setStatusNotice(`Saved "${stageFile.title}" to My Creations.`);
  };

  const handleExportLuma = () => {
    const res = handleRunValidator();
    const stageFile = exportForgeToCustomStageFile(forge, Boolean(res.solvable));
    const safeSlug = stageFile.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32) || 'stage';
    triggerTextDownload(`${safeSlug}.luma`, JSON.stringify(stageFile, null, 2));
    setStatusNotice(`Exported ${safeSlug}.luma`);
  };

  const handlePresetReset = (preset: ForgeSizePreset) => {
    audioEngine.playUiClick();
    const fresh = createInitialForgeState(undefined, preset);
    setForge((prev) => ({
      ...fresh,
      id: prev.id,
      title: prev.title,
      description: prev.description,
      authorAlias: prev.authorAlias,
      worldTheme: prev.worldTheme,
    }));
    setValidation(validateCustomLevel(fresh.level));
    setStatusNotice(`Reset canvas to ${FORGE_PRESET_SIZES[preset].label}`);
  };

  const selected = forge.selectedObject;
  const selectedGate =
    selected?.kind === 'gate'
      ? forge.level.gates.find((g) => g.id === selected.id)
      : undefined;
  const selectedSwitch =
    selected?.kind === 'switch'
      ? forge.level.pressureSwitches.find((s) => s.id === selected.id)
      : undefined;
  const selectedEchoPlate =
    selected?.kind === 'echo_plate'
      ? (forge.level.echoPlates ?? []).find((e) => e.id === selected.id)
      : undefined;
  const selectedLift =
    selected?.kind === 'lift'
      ? forge.level.elevationPlatforms.find((l) => l.id === selected.id)
      : undefined;
  const selectedRotating =
    selected?.kind === 'rotating'
      ? forge.level.rotatingPlatforms.find((r) => r.id === selected.id)
      : undefined;
  const selectedSynergy =
    selected?.kind === 'synergy_node'
      ? (forge.level.synergyNodes ?? []).find((s) => s.id === selected.id)
      : undefined;

  const valBadgeStyle =
    validation?.status === 'VALID'
      ? 'bg-[#e3f2ed] border-[#178a80] text-[#11645c]'
      : validation?.status === 'WARNING'
      ? 'bg-[#fef3c7] border-[#b45309] text-[#78350f]'
      : validation?.status === 'UNVERIFIED'
      ? 'bg-[#e2e8f0] border-[#475569] text-[#1e293b]'
      : validation?.status === 'INVALID'
      ? 'bg-[#fee2e2] border-[#b91c1c] text-[#7f1d1d]'
      : 'bg-[#efe6cf] border-[#253542] text-[#4b5c68]';

  return (
    <div
      data-testid="world-forge-editor"
      className="fixed inset-0 z-30 flex flex-col bg-[#14222b] text-[#1f2d38]"
    >
      {/* Top Action Bar */}
      <header className="shrink-0 bg-[#f6eedb] border-b-[3px] border-[#1f2d38] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#1f2d38] whitespace-nowrap">
            World Forge
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b6a24] whitespace-nowrap">
            · {tileCount}/{FORGE_MAX_TILES} Tiles · {objCount}/{FORGE_MAX_OBJECTS} Obj
          </span>
          <div className="hidden lg:flex items-center gap-1 ml-2">
            {(['small', 'medium', 'large', 'xl'] as ForgeSizePreset[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePresetReset(p)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase border cursor-pointer whitespace-nowrap ${
                  forge.preset === p
                    ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                    : 'bg-[#efe6cf] hover:bg-[#fff8e6] border-[#253542] text-[#1f2d38]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid="forge-undo-btn"
            disabled={forge.undoStack.length === 0}
            onClick={() => {
              audioEngine.playUiClick();
              setForge((prev) => undoForge(prev));
              setValidation(null);
            }}
            className="px-2.5 py-1.5 rounded bg-[#efe6cf] hover:bg-[#fff8e6] disabled:opacity-45 border-2 border-[#253542] text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            Undo ({forge.undoStack.length})
          </button>
          <button
            type="button"
            data-testid="forge-redo-btn"
            disabled={forge.redoStack.length === 0}
            onClick={() => {
              audioEngine.playUiClick();
              setForge((prev) => redoForge(prev));
              setValidation(null);
            }}
            className="px-2.5 py-1.5 rounded bg-[#efe6cf] hover:bg-[#fff8e6] disabled:opacity-45 border-2 border-[#253542] text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            Redo ({forge.redoStack.length})
          </button>

          {selected?.kind === 'tile' && (
            <button
              type="button"
              onClick={() => setForge((prev) => copySelectedTile(prev))}
              className="px-2.5 py-1.5 rounded bg-[#efe6cf] hover:bg-[#fff8e6] border-2 border-[#253542] text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Copy Tile
            </button>
          )}
          {forge.clipboardTile && (
            <button
              type="button"
              onClick={() => setPasteMode((v) => !v)}
              className={`px-2.5 py-1.5 rounded border-2 text-xs font-bold whitespace-nowrap cursor-pointer ${
                pasteMode
                  ? 'bg-[#24c9b8] text-[#112329] border-[#1f2d38]'
                  : 'bg-[#efe6cf] border-[#253542] text-[#1f2d38]'
              }`}
            >
              {pasteMode ? 'Click Tile to Paste' : 'Paste Tile'}
            </button>
          )}

          <button
            type="button"
            data-testid="forge-validate-btn"
            onClick={handleRunValidator}
            className={`px-2.5 py-1.5 rounded border-2 text-xs font-extrabold uppercase whitespace-nowrap cursor-pointer ${valBadgeStyle}`}
          >
            {validation ? `Check: ${validation.status}` : 'Validate Stage'}
          </button>

          <button
            type="button"
            data-testid="forge-test-play-btn"
            onClick={() => {
              audioEngine.playUiClick();
              onTestPlay(forge);
            }}
            className="px-3 py-1.5 rounded bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-xs uppercase border-2 border-[#1f2d38] whitespace-nowrap cursor-pointer"
          >
            Test Play
          </button>

          <button
            type="button"
            data-testid="forge-save-btn"
            onClick={handleSave}
            className="px-3 py-1.5 rounded bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-extrabold text-xs uppercase border-2 border-[#1f2d38] whitespace-nowrap cursor-pointer"
          >
            Save
          </button>

          <button
            type="button"
            data-testid="forge-export-btn"
            onClick={handleExportLuma}
            className="px-2.5 py-1.5 rounded bg-[#1d2d37] hover:bg-[#2a3f4c] text-[#f6eedb] font-bold text-xs uppercase border-2 border-[#141e25] whitespace-nowrap cursor-pointer"
          >
            Export .luma
          </button>

          <button
            type="button"
            data-testid="forge-exit-btn"
            onClick={() => {
              audioEngine.playUiClick();
              onExit();
            }}
            className="px-2.5 py-1.5 rounded bg-[#e7dcc2] hover:bg-[#efe6cf] text-[#1f2d38] font-bold text-xs uppercase border-2 border-[#253542] whitespace-nowrap cursor-pointer"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main 3-Column Editor Workspace */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* Left Tool Dock */}
        <aside className="md:w-56 shrink-0 bg-[#f6eedb] border-b-2 md:border-b-0 md:border-r-[3px] border-[#1f2d38] p-2.5 overflow-y-auto flex flex-col gap-3">
          {TOOL_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-1">
                {group.title}
              </div>
              <div className="grid grid-cols-4 md:grid-cols-2 gap-1">
                {group.items.map((tool) => {
                  const active = forge.activeTool === tool.id && !pasteMode;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      data-testid={`forge-tool-${tool.id}`}
                      onClick={() => {
                        setPasteMode(false);
                        setForge((prev) => ({ ...prev, activeTool: tool.id }));
                      }}
                      className={`px-2 py-1.5 rounded border text-[11px] font-bold text-left truncate cursor-pointer ${
                        active
                          ? 'bg-[#1d2d37] text-[#ebb652] border-[#1f2d38]'
                          : 'bg-[#efe6cf] hover:bg-[#fff8e6] text-[#1f2d38] border-[#253542]/60'
                      }`}
                    >
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sub-palette for active tool */}
          {(forge.activeTool === 'terrain_brush' || forge.activeTool === 'island_stamp') && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-1">
                Terrain Material
              </div>
              <div className="grid grid-cols-3 gap-1">
                {TERRAIN_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForge((prev) => ({ ...prev, activeTerrain: t.id }))}
                    className={`px-1.5 py-1 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                      forge.activeTerrain === t.id
                        ? 'bg-[#1d2d37] text-[#f6eedb] border-[#1f2d38]'
                        : 'bg-[#efe6cf] text-[#1f2d38] border-[#253542]/60'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm border border-[#1f2d38] shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {forge.activeTool === 'decor' && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-1">
                Decor Prop
              </div>
              <select
                value={forge.activeDecor}
                onChange={(e) =>
                  setForge((prev) => ({ ...prev, activeDecor: e.target.value as DecorType }))
                }
                className="w-full rounded border-2 border-[#253542] bg-[#fff8e6] px-2 py-1 text-xs font-semibold"
              >
                {DECOR_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {forge.activeTool === 'synergy_node' && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-1">
                Synergy Pair
              </div>
              <select
                value={forge.activeSynergyKind}
                onChange={(e) =>
                  setForge((prev) => ({
                    ...prev,
                    activeSynergyKind: e.target.value as SynergyKind,
                  }))
                }
                className="w-full rounded border-2 border-[#253542] bg-[#fff8e6] px-2 py-1 text-xs font-semibold"
              >
                {SYNERGY_DEFINITIONS.map((s) => (
                  <option key={s.kind} value={s.kind}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </aside>

        {/* Center 3D Viewport */}
        <main className="relative flex-1 min-w-0 min-h-[260px]">
          <WorldForgeCanvas
            level={forge.level}
            activeTool={forge.activeTool}
            selectedObject={forge.selectedObject}
            onTileClick={handleTileClick}
          />
          {statusNotice && (
            <div className="pointer-events-none absolute top-3 left-3 max-w-md rounded-md bg-[#112028]/92 border border-[#ebb652] px-3 py-1.5 text-xs font-semibold text-[#f6eedb] shadow">
              {statusNotice}
            </div>
          )}
        </main>

        {/* Right Inspector & Stage Properties */}
        <aside className="md:w-72 shrink-0 bg-[#f6eedb] border-t-2 md:border-t-0 md:border-l-[3px] border-[#1f2d38] p-3 overflow-y-auto flex flex-col gap-3 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a24] mb-1">
              Stage Details
            </div>
            <label className="block mb-1.5">
              <span className="text-[11px] font-bold text-[#4b5c68]">Title</span>
              <input
                type="text"
                maxLength={48}
                value={forge.title}
                onChange={(e) =>
                  setForge((prev) => updateForgeMetadata(prev, { title: e.target.value }))
                }
                className="mt-0.5 w-full rounded border-2 border-[#253542] bg-[#fff8e6] px-2 py-1 font-bold"
              />
            </label>
            <label className="block mb-1.5">
              <span className="text-[11px] font-bold text-[#4b5c68]">Author Alias</span>
              <input
                type="text"
                maxLength={32}
                value={forge.authorAlias}
                onChange={(e) =>
                  setForge((prev) => updateForgeMetadata(prev, { authorAlias: e.target.value }))
                }
                className="mt-0.5 w-full rounded border-2 border-[#253542] bg-[#fff8e6] px-2 py-1 font-semibold"
              />
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <label>
                <span className="text-[11px] font-bold text-[#4b5c68]">Biome</span>
                <select
                  value={forge.worldTheme}
                  onChange={(e) =>
                    setForge((prev) =>
                      updateForgeMetadata(prev, { worldTheme: e.target.value as WorldId })
                    )
                  }
                  className="mt-0.5 w-full rounded border-2 border-[#253542] bg-[#fff8e6] px-1.5 py-1 font-semibold"
                >
                  {WORLDS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] font-bold text-[#4b5c68]">Difficulty</span>
                <select
                  value={forge.difficulty}
                  onChange={(e) =>
                    setForge((prev) =>
                      updateForgeMetadata(prev, {
                        difficulty: e.target.value as WorldForgeState['difficulty'],
                      })
                    )
                  }
                  className="mt-0.5 w-full rounded border-2 border-[#253542] bg-[#fff8e6] px-1.5 py-1 font-semibold"
                >
                  <option value="gentle">Gentle</option>
                  <option value="balanced">Balanced</option>
                  <option value="master">Master</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] font-bold text-[#4b5c68]">Description</span>
              <textarea
                rows={2}
                maxLength={140}
                value={forge.description}
                onChange={(e) =>
                  setForge((prev) => updateForgeMetadata(prev, { description: e.target.value }))
                }
                className="mt-0.5 w-full rounded border-2 border-[#253542] bg-[#fff8e6] px-2 py-1 text-[11px]"
              />
            </label>
          </div>

          {/* Mechanics Rules */}
          <div className="rounded-lg bg-[#efe6cf] border border-[#253542] p-2.5 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a24]">
              Stage Systems
            </div>
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-semibold">Echo Engine Enabled</span>
              <input
                type="checkbox"
                checked={forge.level.echoEnabled !== false}
                onChange={(e) =>
                  setForge((prev) =>
                    mutateForgeLevel(prev, (draft) => {
                      draft.echoEnabled = e.target.checked;
                    })
                  )
                }
              />
            </label>
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-semibold">2-Hero Party Synergy</span>
              <input
                type="checkbox"
                checked={Boolean(forge.level.partyEnabled)}
                onChange={(e) =>
                  setForge((prev) =>
                    mutateForgeLevel(prev, (draft) => {
                      draft.partyEnabled = e.target.checked;
                    })
                  )
                }
              />
            </label>
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-semibold">Crystal Needs Light Beam</span>
              <input
                type="checkbox"
                checked={forge.level.crystal.requiresLightBeam}
                onChange={(e) =>
                  setForge((prev) =>
                    mutateForgeLevel(prev, (draft) => {
                      draft.crystal.requiresLightBeam = e.target.checked;
                    })
                  )
                }
              />
            </label>
          </div>

          {/* Selected Object Connection & Property Inspector */}
          {selected && (
            <div className="rounded-lg bg-[#fff8e6] border-2 border-[#1f2d38] p-2.5 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#178a80]">
                Selected: {selected.kind.replace('_', ' ')}
              </div>

              {selectedGate && (
                <div className="space-y-1.5">
                  <label className="block">
                    <span className="text-[11px] font-bold text-[#4b5c68]">Linked Switch</span>
                    <select
                      value={selectedGate.linkedSwitchId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        setForge((prev) =>
                          mutateForgeLevel(prev, (draft) => {
                            const g = draft.gates.find((x) => x.id === selectedGate.id);
                            if (g) g.linkedSwitchId = val;
                          })
                        );
                      }}
                      className="mt-0.5 w-full rounded border border-[#253542] bg-[#f6eedb] px-1.5 py-1"
                    >
                      <option value="">None</option>
                      {forge.level.pressureSwitches.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} ({s.x},{s.z})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-bold text-[#4b5c68]">Linked Echo Plate</span>
                    <select
                      value={selectedGate.linkedEchoPlateId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        setForge((prev) =>
                          mutateForgeLevel(prev, (draft) => {
                            const g = draft.gates.find((x) => x.id === selectedGate.id);
                            if (g) g.linkedEchoPlateId = val;
                          })
                        );
                      }}
                      className="mt-0.5 w-full rounded border border-[#253542] bg-[#f6eedb] px-1.5 py-1"
                    >
                      <option value="">None</option>
                      {(forge.level.echoPlates ?? []).map((ep) => (
                        <option key={ep.id} value={ep.id}>
                          {ep.id} ({ep.x},{ep.z})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-bold text-[#4b5c68]">Linked Sub-Crystal</span>
                    <select
                      value={selectedGate.linkedSubCrystalId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        setForge((prev) =>
                          mutateForgeLevel(prev, (draft) => {
                            const g = draft.gates.find((x) => x.id === selectedGate.id);
                            if (g) g.linkedSubCrystalId = val;
                          })
                        );
                      }}
                      className="mt-0.5 w-full rounded border border-[#253542] bg-[#f6eedb] px-1.5 py-1"
                    >
                      <option value="">None</option>
                      {(forge.level.subCrystals ?? []).map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.id} ({sc.x},{sc.z})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForge((prev) =>
                          mutateForgeLevel(prev, (draft) => {
                            const g = draft.gates.find((x) => x.id === selectedGate.id);
                            if (g) g.axis = g.axis === 'x' ? 'z' : 'x';
                          })
                        )
                      }
                      className="flex-1 py-1 rounded bg-[#efe6cf] border border-[#253542] font-bold cursor-pointer"
                    >
                      Axis: {selectedGate.axis.toUpperCase()}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForge((prev) =>
                          mutateForgeLevel(prev, (draft) => {
                            const g = draft.gates.find((x) => x.id === selectedGate.id);
                            if (g) g.inverted = !g.inverted;
                          })
                        )
                      }
                      className="flex-1 py-1 rounded bg-[#efe6cf] border border-[#253542] font-bold cursor-pointer"
                    >
                      {selectedGate.inverted ? 'Inverted' : 'Normal'}
                    </button>
                  </div>
                </div>
              )}

              {selectedEchoPlate && (
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="font-semibold">Echo-Only Plate</span>
                  <input
                    type="checkbox"
                    checked={selectedEchoPlate.echoOnly}
                    onChange={(e) =>
                      setForge((prev) =>
                        mutateForgeLevel(prev, (draft) => {
                          const ep = (draft.echoPlates ?? []).find(
                            (x) => x.id === selectedEchoPlate.id
                          );
                          if (ep) ep.echoOnly = e.target.checked;
                        })
                      )
                    }
                  />
                </label>
              )}

              {selectedSwitch && (
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="font-semibold">Latch Open Permanently</span>
                  <input
                    type="checkbox"
                    checked={selectedSwitch.latch}
                    onChange={(e) =>
                      setForge((prev) =>
                        mutateForgeLevel(prev, (draft) => {
                          const sw = draft.pressureSwitches.find((x) => x.id === selectedSwitch.id);
                          if (sw) sw.latch = e.target.checked;
                        })
                      )
                    }
                  />
                </label>
              )}

              {selectedLift && (
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="font-semibold">Start Elevated</span>
                  <input
                    type="checkbox"
                    checked={selectedLift.initialHigh}
                    onChange={(e) =>
                      setForge((prev) =>
                        mutateForgeLevel(prev, (draft) => {
                          const lf = draft.elevationPlatforms.find((x) => x.id === selectedLift.id);
                          if (lf) lf.initialHigh = e.target.checked;
                        })
                      )
                    }
                  />
                </label>
              )}

              {selectedRotating && (
                <button
                  type="button"
                  onClick={() =>
                    setForge((prev) =>
                      mutateForgeLevel(prev, (draft) => {
                        const rp = draft.rotatingPlatforms.find((x) => x.id === selectedRotating.id);
                        if (rp) rp.initialStep = ((rp.initialStep + 1) % 4) as Direction;
                      })
                    )
                  }
                  className="w-full py-1 rounded bg-[#efe6cf] border border-[#253542] font-bold cursor-pointer"
                >
                  Rotate Initial Step ({selectedRotating.initialStep * 90}°)
                </button>
              )}

              {selectedSynergy && (
                <div className="space-y-1.5">
                  <label className="block">
                    <span className="text-[11px] font-bold text-[#4b5c68]">Opens Gate</span>
                    <select
                      value={selectedSynergy.opensGateId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        setForge((prev) =>
                          mutateForgeLevel(prev, (draft) => {
                            const sn = (draft.synergyNodes ?? []).find(
                              (x) => x.id === selectedSynergy.id
                            );
                            if (sn) sn.opensGateId = val;
                          })
                        );
                      }}
                      className="mt-0.5 w-full rounded border border-[#253542] bg-[#f6eedb] px-1.5 py-1"
                    >
                      <option value="">None</option>
                      {forge.level.gates.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.id} ({g.x},{g.z})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Validator Result Report */}
          {validation && (
            <div
              data-testid="forge-validation-report"
              className={`rounded-lg border-2 p-2.5 ${valBadgeStyle}`}
            >
              <div className="font-extrabold uppercase tracking-wider text-[11px]">
                Validator · {validation.status}
              </div>
              <p className="mt-0.5 text-[11px] leading-snug">{validation.summary}</p>
              {validation.issues.length > 0 && (
                <ul className="mt-1.5 space-y-1 text-[10px] list-disc pl-4">
                  {validation.issues.slice(0, 4).map((iss, idx) => (
                    <li key={`${iss.code}_${idx}`}>{iss.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
