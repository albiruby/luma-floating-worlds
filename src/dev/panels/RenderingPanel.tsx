import React from 'react';
import { RenderDiagnosticsSnapshot, RenderingDebugSettings } from '../debugTypes';

interface RenderingPanelProps {
  rendering: RenderingDebugSettings;
  diagnostics: RenderDiagnosticsSnapshot | null;
  onUpdateRendering: (patch: Partial<RenderingDebugSettings>) => void;
  onRestoreDefaults: () => void;
}

export const RenderingPanel: React.FC<RenderingPanelProps> = ({
  rendering,
  diagnostics,
  onUpdateRendering,
  onRestoreDefaults,
}) => {
  return (
    <div className="space-y-3 text-xs text-slate-200">
      {/* Live WebGL Telemetry */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-semibold text-sky-300">Live WebGL & Scene Telemetry</span>
          <button
            type="button"
            onClick={onRestoreDefaults}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] cursor-pointer"
          >
            Restore Rendering Defaults
          </button>
        </div>

        {diagnostics ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>
              <div className="text-slate-400 text-[10px]">FPS / Frame Time</div>
              <div className="text-sky-300 font-semibold">
                {diagnostics.fps.toFixed(1)} fps ({diagnostics.avgFrameTimeMs.toFixed(1)} ms)
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Draw Calls / Tris</div>
              <div>
                {diagnostics.drawCalls} draws · {diagnostics.triangles.toLocaleString()} tris
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Geometries / Textures</div>
              <div>
                {diagnostics.geometries} geos · {diagnostics.textures} tex
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Viewport / Zoom</div>
              <div>
                {diagnostics.viewportWidth}×{diagnostics.viewportHeight} · {diagnostics.cameraZoom.toFixed(2)}×
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Camera Pos</div>
              <div>
                ({diagnostics.cameraPos.x.toFixed(1)}, {diagnostics.cameraPos.y.toFixed(1)},{' '}
                {diagnostics.cameraPos.z.toFixed(1)})
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Camera Target</div>
              <div>
                ({diagnostics.cameraTarget.x.toFixed(1)}, {diagnostics.cameraTarget.y.toFixed(1)},{' '}
                {diagnostics.cameraTarget.z.toFixed(1)})
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Level Tiles / Decor</div>
              <div>
                {diagnostics.tileCount} tiles · {diagnostics.decorCount} decor
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Mechanisms</div>
              <div>{diagnostics.mechanismCount} nodes</div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 py-2">Sampling WebGL renderer info...</div>
        )}
      </div>

      {/* Reversible Shader / Material / Pass Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onUpdateRendering({ wireframe: !rendering.wireframe })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            rendering.wireframe
              ? 'bg-sky-900/70 border-sky-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Wireframe Mode</div>
          <div className="text-[10px] opacity-80">{rendering.wireframe ? 'ON' : 'Off'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateRendering({ showNormals: !rendering.showNormals })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            rendering.showNormals
              ? 'bg-violet-900/70 border-violet-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Mesh Normals Debug</div>
          <div className="text-[10px] opacity-80">{rendering.showNormals ? 'ON (Reversible)' : 'Off'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateRendering({ disableShadows: !rendering.disableShadows })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            rendering.disableShadows
              ? 'bg-amber-900/70 border-amber-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Shadows Override</div>
          <div className="text-[10px] opacity-80">{rendering.disableShadows ? 'DISABLED' : 'Default'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateRendering({ hideSkyBackdrop: !rendering.hideSkyBackdrop })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            rendering.hideSkyBackdrop
              ? 'bg-rose-900/60 border-rose-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Sky & Horizon</div>
          <div className="text-[10px] opacity-80">{rendering.hideSkyBackdrop ? 'Hidden' : 'Visible'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateRendering({ hideParticles: !rendering.hideParticles })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            rendering.hideParticles
              ? 'bg-rose-900/60 border-rose-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Burst Particles</div>
          <div className="text-[10px] opacity-80">{rendering.hideParticles ? 'Hidden' : 'Visible'}</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateRendering({ hideEnvEffects: !rendering.hideEnvEffects })}
          className={`px-2.5 py-2 rounded border text-left cursor-pointer ${
            rendering.hideEnvEffects
              ? 'bg-rose-900/60 border-rose-400 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-semibold">Environment Layer</div>
          <div className="text-[10px] opacity-80">{rendering.hideEnvEffects ? 'Hidden' : 'Visible'}</div>
        </button>
      </div>

      {/* Camera Zoom Override */}
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-slate-200">Camera Zoom Override:</span>
        <input
          aria-label="Camera Zoom Override"
          type="range"
          min={0.5}
          max={2.2}
          step={0.05}
          value={rendering.cameraZoomOverride ?? diagnostics?.cameraZoom ?? 1}
          onChange={(e) => onUpdateRendering({ cameraZoomOverride: Number(e.target.value) })}
          className="flex-1 min-w-36 accent-teal-400"
        />
        <span className="font-mono text-[11px] text-teal-300 w-14 text-right">
          {rendering.cameraZoomOverride !== null
            ? `${rendering.cameraZoomOverride.toFixed(2)}×`
            : 'Auto'}
        </span>
        <button
          type="button"
          onClick={() => onUpdateRendering({ cameraZoomOverride: null })}
          className="px-2 py-1 rounded bg-slate-800 border border-slate-600 cursor-pointer"
        >
          Auto
        </button>
      </div>
    </div>
  );
};
