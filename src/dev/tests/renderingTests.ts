import { QATestResult, RenderDiagnosticsSnapshot } from '../debugTypes';

export function runRenderingDiagnosticsSuite(
  diagnostics: RenderDiagnosticsSnapshot | null
): QATestResult[] {
  const start = performance.now();
  const duration = () => Math.max(0.01, Number((performance.now() - start).toFixed(2)));

  if (!diagnostics) {
    return [
      {
        id: 'render_snapshot_missing',
        suite: 'rendering',
        name: 'WebGL Live Diagnostics Availability',
        status: 'WARNING',
        executionMode: 'runtime-check',
        message: 'No live WebGL diagnostics snapshot available (headless/non-mounted check).',
        suggestion: 'Open the live 3D viewport in Developer Mode to sample draw calls, triangles, and FPS.',
        durationMs: duration(),
      },
    ];
  }

  const results: QATestResult[] = [];

  results.push({
    id: 'render_viewport',
    suite: 'rendering',
    name: 'Active Canvas Viewport Dimensions',
    status: diagnostics.viewportWidth > 0 && diagnostics.viewportHeight > 0 ? 'PASS' : 'FAIL',
    executionMode: 'runtime-check',
    message: `Canvas rendering at ${diagnostics.viewportWidth}×${diagnostics.viewportHeight} (zoom ${diagnostics.cameraZoom.toFixed(2)}).`,
    durationMs: duration(),
  });

  results.push({
    id: 'render_drawcalls',
    suite: 'rendering',
    name: 'WebGL Draw Call & Geometry Budget',
    status:
      diagnostics.drawCalls <= 0
        ? 'FAIL'
        : diagnostics.drawCalls > 450
          ? 'WARNING'
          : 'PASS',
    executionMode: 'runtime-check',
    message: `${diagnostics.drawCalls} draw calls · ${diagnostics.triangles.toLocaleString()} triangles · ${diagnostics.geometries} geometries · ${diagnostics.textures} textures.`,
    suggestion:
      diagnostics.drawCalls > 450
        ? 'Consider instancing or reducing non-essential decor if FPS drops on target hardware.'
        : undefined,
    durationMs: duration(),
  });

  results.push({
    id: 'render_fps',
    suite: 'rendering',
    name: 'Rolling Frame Pacing Snapshot',
    status: diagnostics.fps > 0 ? 'PASS' : 'WARNING',
    executionMode: 'runtime-check',
    message: `${diagnostics.fps.toFixed(1)} FPS (${diagnostics.avgFrameTimeMs.toFixed(1)} ms avg frame time). Note: Software WebGL headless environments cap pacing intentionally.`,
    durationMs: duration(),
  });

  return results;
}
