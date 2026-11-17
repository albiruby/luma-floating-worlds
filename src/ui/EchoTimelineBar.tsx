import React from 'react';
import { ECHO_TICK_RATE } from '../game/echoEngine';
import { EchoControlRuntime, HudSyncSnapshot } from '../three/GameScene';

interface EchoTimelineBarProps {
  hud: HudSyncSnapshot;
  maxEchoes: number;
  maxEchoSeconds: number;
  echoControlRef: React.MutableRefObject<EchoControlRuntime>;
  onForceRefresh?: () => void;
}

export const EchoTimelineBar: React.FC<EchoTimelineBarProps> = ({
  hud,
  maxEchoes,
  maxEchoSeconds,
  echoControlRef,
  onForceRefresh,
}) => {
  const slots = hud.echoSlotSummaries ?? [
    { slotIndex: 0, recorded: false, durationSeconds: 0, offsetSeconds: 0, activeNow: false },
    { slotIndex: 1, recorded: false, durationSeconds: 0, offsetSeconds: 0, activeNow: false },
    { slotIndex: 2, recorded: false, durationSeconds: 0, offsetSeconds: 0, activeNow: false },
  ];
  const visibleSlots = slots.slice(0, Math.max(1, Math.min(3, maxEchoes)));
  const recordingSlot = hud.echoRecordingSlot ?? null;
  const hasAnyRecorded = visibleSlots.some((s) => s.recorded);

  const sendCommand = (cmd: NonNullable<EchoControlRuntime['pendingCommand']>) => {
    echoControlRef.current.pendingCommand = cmd;
    onForceRefresh?.();
  };

  return (
    <div
      data-testid="echo-timeline-bar"
      className="pointer-events-auto rounded-lg bg-[#1d2d37]/94 border-2 border-[#38d9f5]/80 px-3 py-2 text-[#f6eedb] shadow-[0_4px_14px_rgba(14,24,30,0.4)] flex flex-col gap-1.5 max-w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-[#38d9f5] text-[#0c2028] font-extrabold text-[10px] tracking-wider uppercase">
            F
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7be9ff]">
            Echo Engine
          </span>
          <span className="text-[11px] text-[#cbe5ea] tabular-nums">
            {recordingSlot !== null
              ? `Recording Slot ${recordingSlot + 1} (${Math.round(
                  (hud.echoRecordingProgress ?? 0) * maxEchoSeconds
                )}s / ${maxEchoSeconds}s)`
              : hud.echoPlayingBack
              ? `Playback ${(hud.echoPlaybackSeconds ?? 0).toFixed(1)}s`
              : hasAnyRecorded
              ? 'Anchor Ready'
              : `Tap F or Record (${maxEchoes} max)`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasAnyRecorded && recordingSlot === null && (
            <>
              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-play-pause-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  sendCommand({ type: 'toggle_playback' });
                }}
                className="px-2 py-1 rounded bg-[#24c9b8] hover:bg-[#36dbca] text-[#0e2026] font-extrabold text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer"
              >
                {hud.echoPlayingBack ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-rewind-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  sendCommand({ type: 'rewind_playback' });
                }}
                className="px-2 py-1 rounded bg-[#2a404d] hover:bg-[#365160] border border-[#5e8599] text-[#f6eedb] font-bold text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer"
              >
                Rewind Anchor
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recording Progress Bar */}
      {recordingSlot !== null && (
        <div className="w-full h-1.5 rounded bg-[#111d24] overflow-hidden">
          <div
            className="h-full bg-[#38d9f5] transition-all duration-100"
            style={{ width: `${Math.min(100, Math.round((hud.echoRecordingProgress ?? 0) * 100))}%` }}
          />
        </div>
      )}

      {/* Individual Echo Slots */}
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleSlots.map((slot) => {
          const isRec = recordingSlot === slot.slotIndex;
          return (
            <div
              key={slot.slotIndex}
              className={`rounded border px-2 py-1 flex items-center gap-1.5 text-[10px] ${
                isRec
                  ? 'bg-[#163846] border-[#38d9f5]'
                  : slot.activeNow
                  ? 'bg-[#193340] border-[#24c9b8]'
                  : 'bg-[#14222b] border-[#324957]'
              }`}
            >
              <button
                type="button"
                tabIndex={-1}
                data-testid={`echo-slot-rec-${slot.slotIndex}`}
                onClick={(e) => {
                  e.currentTarget.blur();
                  sendCommand({ type: 'toggle_record', slotIndex: slot.slotIndex });
                }}
                className={`px-1.5 py-0.5 rounded font-extrabold uppercase whitespace-nowrap cursor-pointer ${
                  isRec
                    ? 'bg-[#f87171] text-[#1a0b0b]'
                    : 'bg-[#38d9f5] hover:bg-[#6ee7ff] text-[#0d2028]'
                }`}
              >
                {isRec ? 'Stop' : `Rec ${slot.slotIndex + 1}`}
              </button>

              <span className="tabular-nums text-[#cbe5ea] font-semibold whitespace-nowrap">
                {slot.recorded ? `${slot.durationSeconds.toFixed(1)}s` : 'Empty'}
              </span>

              {slot.recorded && !isRec && (
                <>
                  <button
                    type="button"
                    tabIndex={-1}
                    title="Cycle Echo Time Offset (0s, +1s, +2s, +3s)"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      const nextSec = (Math.round(slot.offsetSeconds) + 1) % 4;
                      sendCommand({
                        type: 'set_offset',
                        slotIndex: slot.slotIndex,
                        offsetTicks: nextSec * ECHO_TICK_RATE,
                      });
                    }}
                    className="px-1.5 py-0.5 rounded bg-[#243743] hover:bg-[#314a59] text-[#ebb652] font-bold tabular-nums whitespace-nowrap cursor-pointer"
                  >
                    +{Math.round(slot.offsetSeconds)}s
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    title="Clear Echo Slot"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      sendCommand({ type: 'clear_slot', slotIndex: slot.slotIndex });
                    }}
                    className="px-1 py-0.5 rounded text-[#fca5a5] hover:bg-[#3a2024] font-bold cursor-pointer"
                    aria-label={`Clear Echo Slot ${slot.slotIndex + 1}`}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
