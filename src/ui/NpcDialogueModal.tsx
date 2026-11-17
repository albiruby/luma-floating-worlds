import React, { useEffect, useMemo, useState } from 'react';
import { audioEngine } from '../audio/synth';
import { NpcDialogueChoice, NpcDefinition } from '../game/npcs';
import { SaveProgress } from '../game/types';

export type NpcChoiceAction = NpcDialogueChoice['action'];

interface NpcDialogueModalProps {
  npc: NpcDefinition;
  progress: SaveProgress;
  onTriggerAction: (action: NpcChoiceAction) => void;
  onSetFlag?: (flag: string) => void;
  onClose: () => void;
}

function hexToCss(hexNum: number): string {
  return `#${hexNum.toString(16).padStart(6, '0')}`;
}

export const NpcDialogueModal: React.FC<NpcDialogueModalProps> = ({
  npc,
  progress,
  onTriggerAction,
  onSetFlag,
  onClose,
}) => {
  const nodes = useMemo(() => npc.buildNodes(progress), [npc, progress]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [pageIdx, setPageIdx] = useState(0);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const node = nodes[currentNodeId] ?? nodes.root;
  const currentPageText = node.pages[pageIdx] ?? '';
  const hasMorePages = pageIdx < node.pages.length - 1;

  const [typedCount, setTypedCount] = useState<number>(
    prefersReducedMotion ? currentPageText.length : 0
  );

  useEffect(() => {
    setCurrentNodeId('root');
    setPageIdx(0);
  }, [npc.id]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedCount(currentPageText.length);
      return;
    }
    setTypedCount(0);
    const interval = window.setInterval(() => {
      setTypedCount((prev) => {
        if (prev >= currentPageText.length) {
          window.clearInterval(interval);
          return prev;
        }
        return Math.min(currentPageText.length, prev + 3);
      });
    }, 18);
    return () => window.clearInterval(interval);
  }, [currentPageText, prefersReducedMotion]);

  const isTyping = typedCount < currentPageText.length;

  const handleAdvancePage = () => {
    audioEngine.playUiClick();
    if (isTyping) {
      setTypedCount(currentPageText.length);
      return;
    }
    if (hasMorePages) {
      setPageIdx((p) => p + 1);
    }
  };

  const handleSelectChoice = (choice: NpcDialogueChoice) => {
    audioEngine.playUiClick();
    if (choice.setFlag && onSetFlag) {
      onSetFlag(choice.setFlag);
    }
    if (choice.action) {
      onClose();
      onTriggerAction(choice.action);
      return;
    }
    if (choice.nextNodeId === 'close') {
      onClose();
      return;
    }
    if (nodes[choice.nextNodeId]) {
      setCurrentNodeId(choice.nextNodeId);
      setPageIdx(0);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        if (isTyping || hasMorePages) {
          e.preventDefault();
          handleAdvancePage();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const robeCss = hexToCss(npc.visual.robeColor);
  const trimCss = hexToCss(npc.visual.trimColor);

  return (
    <div className="fixed inset-0 z-[60] bg-[#122029]/60 flex items-end sm:items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Dialogue with ${npc.name}`}
        data-testid={`npc-dialogue-${npc.id}`}
        className="w-full max-w-2xl rounded-xl bg-[#f6eedb] border-[3px] border-[#1f2d38] shadow-[0_10px_0_#1f2d38] p-5 sm:p-6 text-[#1f2d38]"
      >
        {/* Header: Portrait Crest + Bio */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-2 border-[#dfd2b4]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-12 h-12 rounded-xl border-2 border-[#1f2d38] flex items-center justify-center shrink-0 shadow-[0_3px_0_#1f2d38]"
              style={{ backgroundColor: robeCss }}
              aria-hidden="true"
            >
              <span
                className="font-display text-xl font-extrabold"
                style={{ color: trimCss }}
              >
                {npc.name.slice(0, 1)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b6a24]">
                {node.speakerTitle}
              </div>
              <h2 className="font-display text-xl font-bold leading-tight">{npc.name}</h2>
              <p className="text-xs text-[#4b5c68] truncate">{npc.bio}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioEngine.playUiClick();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#e7dcc2] hover:bg-[#efe6cf] font-bold text-xs uppercase border-2 border-[#253542] cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>

        {/* Speech Box */}
        <div
          onClick={isTyping || hasMorePages ? handleAdvancePage : undefined}
          className={`rounded-lg bg-[#fff8e8] border-2 border-[#253542] p-4 min-h-[104px] flex flex-col justify-between ${
            isTyping || hasMorePages ? 'cursor-pointer' : ''
          }`}
        >
          <p
            data-testid="npc-dialogue-text"
            className="text-sm sm:text-base leading-relaxed text-[#1f2d38] font-medium"
          >
            {currentPageText.slice(0, typedCount)}
            {isTyping && <span className="inline-block w-2 h-4 bg-[#1f2d38] ml-0.5 align-middle" />}
          </p>

          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#6e5c3e]">
            <span>
              Page {pageIdx + 1} / {node.pages.length}
            </span>
            {(isTyping || hasMorePages) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvancePage();
                }}
                className="px-2.5 py-1 rounded bg-[#e8a838] hover:bg-[#f0b74f] text-[#1f2d38] border border-[#1f2d38] uppercase tracking-wider cursor-pointer"
              >
                {isTyping ? 'Skip' : 'Next'}
              </button>
            )}
          </div>
        </div>

        {/* Dialogue Choices (visible once last page finishes typing) */}
        {!isTyping && !hasMorePages && (
          <div className="mt-4 flex flex-col gap-2" data-testid="npc-dialogue-choices">
            {node.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSelectChoice(choice)}
                className={`w-full px-4 py-2.5 rounded-lg border-2 text-left font-bold text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  choice.action
                    ? 'bg-[#24c9b8] hover:bg-[#35dbca] text-[#112329] border-[#1f2d38] shadow-[0_2px_0_#1f2d38]'
                    : choice.nextNodeId === 'close'
                    ? 'bg-[#e7dcc2] hover:bg-[#efe6cf] text-[#1f2d38] border-[#253542]'
                    : 'bg-[#efe6cf] hover:bg-[#f7f0dc] text-[#1f2d38] border-[#253542]'
                }`}
              >
                <span>{choice.label}</span>
                <span className="text-[11px] uppercase tracking-wider opacity-75">
                  {choice.action ? 'Open' : choice.nextNodeId === 'close' ? 'End' : 'Ask'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
