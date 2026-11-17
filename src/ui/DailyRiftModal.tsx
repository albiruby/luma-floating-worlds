import React, { useMemo, useState } from 'react';
import { audioEngine } from '../audio/synth';
import {
  computeDailyRiftStreak,
  DailyRiftSpec,
  generateDailyRiftSpec,
  parseRiftChallengeCode,
  RiftCadence,
} from '../game/dailyRift';
import { formatDurationSeconds } from '../game/mastery';
import { SaveProgress } from '../game/types';

interface DailyRiftModalProps {
  progress: SaveProgress;
  onStartRift: (spec: DailyRiftSpec) => void;
  onClose: () => void;
}

export const DailyRiftModal: React.FC<DailyRiftModalProps> = ({
  progress,
  onStartRift,
  onClose,
}) => {
  const [cadence, setCadence] = useState<RiftCadence>('daily');
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  const spec = useMemo(() => generateDailyRiftSpec(cadence), [cadence]);
  const record = progress.dailyRiftRecords?.[spec.dateKey];
  const streak = useMemo(
    () => computeDailyRiftStreak(progress.dailyRiftRecords),
    [progress.dailyRiftRecords]
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard?.writeText(spec.challengeCode);
      setCodeMessage(`Copied ${spec.challengeCode} to clipboard.`);
    } catch {
      setCodeMessage(`Share Code: ${spec.challengeCode}`);
    }
  };

  const handleLoadChallengeCode = () => {
    const parsed = parseRiftChallengeCode(customCodeInput);
    if (!parsed) {
      setCodeMessage('Invalid format. Expected LUMA-RIFT-YYYYMMDD-SEED.');
      return;
    }
    const loadedSpec = generateDailyRiftSpec('daily', new Date(), parsed.seed);
    audioEngine.playUiClick();
    onStartRift({
      ...loadedSpec,
      challengeCode: customCodeInput.trim().toUpperCase(),
      dateKey: parsed.dateKey,
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#122029]/65 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Daily Rift Challenges"
        data-testid="daily-rift-modal"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#178a80]">
              Seeded Offline Rifts · Local Streak: {streak} Day(s)
            </p>
            <h2 className="font-display text-2xl font-bold">The Daily Rift</h2>
          </div>
          <button
            type="button"
            data-testid="daily-rift-close-btn"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Cadence Selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(
            [
              { id: 'daily', label: 'Daily Rift' },
              { id: 'weekly', label: 'Weekly Rift' },
              { id: 'monthly', label: 'Monthly Rift' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              type="button"
              data-testid={`rift-cadence-${c.id}`}
              onClick={() => {
                audioEngine.playUiClick();
                setCadence(c.id);
              }}
              className={`py-2 rounded-lg border-2 text-xs font-extrabold uppercase cursor-pointer ${
                cadence === c.id
                  ? 'bg-[#1d2d37] text-[#ebb652] border-[#1f2d38]'
                  : 'bg-[#efe6cf] hover:bg-[#fff8e6] text-[#1f2d38] border-[#253542]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Active Rift Details */}
        <div className="rounded-xl bg-[#efe6cf] border-2 border-[#1f2d38] p-4 mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
                {spec.dateKey} · {spec.challengeType.replace('_', ' ')} ·{' '}
                {spec.verifiedBySolver ? 'Solver Verified' : 'Unverified'}
              </div>
              <h3 className="font-display text-xl font-bold mt-0.5">{spec.challengeTitle}</h3>
            </div>
            <div className="text-right tabular-nums">
              <div className="text-[10px] font-bold uppercase text-[#5b6973]">Challenge Code</div>
              <div
                data-testid="rift-challenge-code"
                className="font-mono text-xs font-extrabold text-[#1d2d37]"
              >
                {spec.challengeCode}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#43535e]">{spec.constraintLabel}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-[#fff8e6] border border-[#253542] p-2">
              <div className="text-[10px] font-bold uppercase text-[#5b6973]">Status</div>
              <div className="font-extrabold text-[#178a80]">
                {record?.completed ? 'Completed' : 'Ready'}
              </div>
            </div>
            <div className="rounded-lg bg-[#fff8e6] border border-[#253542] p-2 tabular-nums">
              <div className="text-[10px] font-bold uppercase text-[#5b6973]">Best Time</div>
              <div className="font-extrabold">
                {record?.bestTime !== undefined ? formatDurationSeconds(record.bestTime) : '—'}
              </div>
            </div>
            <div className="rounded-lg bg-[#fff8e6] border border-[#253542] p-2 tabular-nums">
              <div className="text-[10px] font-bold uppercase text-[#5b6973]">Best Actions</div>
              <div className="font-extrabold">
                {record?.bestActions !== undefined ? `${record.bestActions} ACT` : '—'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              data-testid="rift-play-btn"
              onClick={() => {
                audioEngine.playUiClick();
                onStartRift(spec);
              }}
              className="flex-1 min-w-[160px] py-2.5 px-4 rounded-lg bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] font-extrabold text-sm uppercase tracking-wider border-2 border-[#1f2d38] shadow-[0_3px_0_#1f2d38] whitespace-nowrap cursor-pointer"
            >
              Enter Rift Island
            </button>
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2.5 px-3 rounded-lg bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] font-bold text-xs uppercase border-2 border-[#1f2d38] whitespace-nowrap cursor-pointer"
            >
              Copy Share Code
            </button>
          </div>
        </div>

        {/* Shareable Challenge Code Loader */}
        <div className="rounded-xl bg-[#e7dcc2] border-2 border-[#253542] p-3.5 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4b5c68]">
            Load Seeded Rift From Challenge Code
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="LUMA-RIFT-20261117-XXXXXX"
              value={customCodeInput}
              onChange={(e) => setCustomCodeInput(e.target.value)}
              className="flex-1 min-w-[200px] rounded-lg border-2 border-[#253542] bg-[#fff8e6] px-3 py-1.5 font-mono text-xs font-bold"
            />
            <button
              type="button"
              onClick={handleLoadChallengeCode}
              className="px-3 py-1.5 rounded-lg bg-[#1d2d37] hover:bg-[#2a3f4c] text-[#f6eedb] font-bold text-xs uppercase border-2 border-[#141e25] whitespace-nowrap cursor-pointer"
            >
              Load Code
            </button>
          </div>
          {codeMessage && (
            <p className="text-[11px] font-semibold text-[#178a80]">{codeMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};
