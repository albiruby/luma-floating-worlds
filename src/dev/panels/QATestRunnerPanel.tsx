import React, { useMemo, useState } from 'react';
import { QASuiteId, QASuiteReport, QAStatus } from '../debugTypes';

interface QATestRunnerPanelProps {
  report: QASuiteReport | null;
  onRunSuite: (suite: QASuiteId) => void;
}

const SUITE_BUTTONS: Array<{ id: QASuiteId; label: string; primary?: boolean }> = [
  { id: 'full', label: 'Run Full Suite', primary: true },
  { id: 'current-level', label: 'Current Stage' },
  { id: 'all-levels', label: 'All 60 Stages' },
  { id: 'puzzle-systems', label: 'Puzzle Systems' },
  { id: 'save-system', label: 'Save & Isolation' },
  { id: 'mastery', label: 'Mastery (180★)' },
  { id: 'cosmetics', label: 'Cosmetics (51)' },
  { id: 'rendering', label: 'Rendering Check' },
];

export const QATestRunnerPanel: React.FC<QATestRunnerPanelProps> = ({
  report,
  onRunSuite,
}) => {
  const [filter, setFilter] = useState<'ALL' | QAStatus>('ALL');

  const visibleResults = useMemo(() => {
    if (!report) return [];
    if (filter === 'ALL') return report.results;
    return report.results.filter((r) => r.status === filter);
  }, [filter, report]);

  return (
    <div className="space-y-3 text-xs text-slate-200">
      {/* Suite Triggers */}
      <div className="flex flex-wrap gap-1.5">
        {SUITE_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => onRunSuite(btn.id)}
            className={`px-2.5 py-1.5 rounded border font-medium cursor-pointer ${
              btn.primary
                ? 'bg-teal-800 hover:bg-teal-700 border-teal-400 text-white'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Summary Banner */}
      {report ? (
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/90 p-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-[11px] flex flex-wrap gap-3">
            <span className="text-slate-300">
              Suite: <strong>{report.suite}</strong>
            </span>
            <span className="text-emerald-400">PASS: {report.passed}</span>
            <span className={report.failed > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
              FAIL: {report.failed}
            </span>
            <span className={report.warnings > 0 ? 'text-amber-300' : 'text-slate-400'}>
              WARN: {report.warnings}
            </span>
            <span className="text-slate-400">{report.durationMs.toFixed(1)} ms</span>
          </div>

          <div className="flex gap-1">
            {(['ALL', 'PASS', 'FAIL', 'WARNING'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer ${
                  filter === status
                    ? 'bg-slate-700 border-slate-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-center text-slate-400">
          Select a QA suite above to run pure logic verification and live runtime diagnostics.
        </div>
      )}

      {/* Results List */}
      {report && (
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {visibleResults.map((res) => (
            <div
              key={res.id}
              className={`rounded border px-2.5 py-2 ${
                res.status === 'FAIL'
                  ? 'bg-rose-950/40 border-rose-500/50'
                  : res.status === 'WARNING'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                      res.status === 'FAIL'
                        ? 'bg-rose-900 text-rose-200'
                        : res.status === 'WARNING'
                          ? 'bg-amber-900 text-amber-200'
                          : 'bg-emerald-900 text-emerald-200'
                    }`}
                  >
                    {res.status}
                  </span>
                  <span className="font-semibold text-slate-100">{res.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {res.executionMode} · {res.durationMs.toFixed(2)} ms
                  {res.levelId ? ` · L${String(res.levelId).padStart(2, '0')}` : ''}
                  {res.objectId ? ` · ${res.objectId}` : ''}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">{res.message}</div>
              {res.suggestion && (
                <div className="mt-1 text-[11px] text-amber-300">Fix: {res.suggestion}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
