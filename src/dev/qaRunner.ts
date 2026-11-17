import { DevSessionSnapshot, QASuiteId, QASuiteReport, QATestResult, RenderDiagnosticsSnapshot } from './debugTypes';
import { runCosmeticsSuite } from './tests/cosmeticTests';
import { runAllLevelsSuite, runCurrentLevelSuite } from './tests/levelIntegrityTests';
import { runMasterySuite } from './tests/masteryTests';
import { runPuzzleSystemsSuite } from './tests/puzzleTests';
import { runRenderingDiagnosticsSuite } from './tests/renderingTests';
import { runSaveSystemSuite } from './tests/saveTests';
import { runUnboundSuite } from './tests/unboundTests';

export interface RunQASuiteOptions {
  currentLevelId: number;
  diagnostics: RenderDiagnosticsSnapshot | null;
  devActive?: boolean;
  snapshot?: DevSessionSnapshot | null;
}

export function executeQASuite(
  suite: QASuiteId,
  options: RunQASuiteOptions
): QASuiteReport {
  const startedAt = new Date().toISOString();
  const start = performance.now();
  let results: QATestResult[] = [];

  switch (suite) {
    case 'current-level':
      results = runCurrentLevelSuite(options.currentLevelId);
      break;
    case 'all-levels':
      results = runAllLevelsSuite();
      break;
    case 'puzzle-systems':
      results = runPuzzleSystemsSuite();
      break;
    case 'save-system':
      results = runSaveSystemSuite({
        devActive: options.devActive,
        snapshot: options.snapshot,
      });
      break;
    case 'mastery':
      results = runMasterySuite();
      break;
    case 'cosmetics':
      results = runCosmeticsSuite();
      break;
    case 'unbound':
      results = runUnboundSuite();
      break;
    case 'rendering':
      results = runRenderingDiagnosticsSuite(options.diagnostics);
      break;
    case 'full':
      results = [
        ...runAllLevelsSuite(),
        ...runPuzzleSystemsSuite(),
        ...runSaveSystemSuite({ devActive: options.devActive, snapshot: options.snapshot }),
        ...runMasterySuite(),
        ...runCosmeticsSuite(),
        ...runUnboundSuite(),
        ...runRenderingDiagnosticsSuite(options.diagnostics),
      ];
      break;
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warnings = results.filter((r) => r.status === 'WARNING').length;

  return {
    suite,
    startedAt,
    total: results.length,
    passed,
    failed,
    warnings,
    durationMs: Math.max(0.05, Number((performance.now() - start).toFixed(2))),
    results,
  };
}
