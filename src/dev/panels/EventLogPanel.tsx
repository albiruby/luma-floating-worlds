import React, { useMemo, useState } from 'react';
import { filterDevEvents, serializeDevEventsJson } from '../DebugEvents';
import { DevEventCategory, DevEventEntry } from '../debugTypes';

interface EventLogPanelProps {
  events: DevEventEntry[];
  onClearEvents: () => void;
}

const CATEGORIES: Array<DevEventCategory | 'all'> = [
  'all',
  'session',
  'level',
  'player',
  'puzzle',
  'world',
  'rendering',
  'qa',
  'save',
];

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  events,
  onClearEvents,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DevEventCategory | 'all'>('all');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterDevEvents(events, search, category),
    [category, events, search]
  );

  const handleExportJson = () => {
    const json = serializeDevEventsJson(filtered);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luma-dev-events-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus(`Exported ${filtered.length} events`);
    } catch {
      setExportStatus('Export prepared');
    }
  };

  return (
    <div className="space-y-2.5 text-xs text-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Search developer events"
          type="text"
          placeholder="Search event type, level, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-44 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-100 text-[11px]"
        />
        <select
          aria-label="Filter event category"
          value={category}
          onChange={(e) => setCategory(e.target.value as DevEventCategory | 'all')}
          className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-100 text-[11px]"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExportJson}
          className="px-2.5 py-1 rounded bg-sky-900/70 hover:bg-sky-800 border border-sky-500/60 cursor-pointer"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={onClearEvents}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer"
        >
          Clear Log
        </button>
      </div>

      {exportStatus && (
        <div className="text-[11px] text-teal-300 font-mono">{exportStatus}</div>
      )}

      <div className="max-h-56 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-slate-400">
            No recorded events match current filter.
          </div>
        ) : (
          filtered.map((evt) => (
            <div
              key={evt.id}
              className="rounded border border-slate-800 bg-slate-950/75 px-2.5 py-1.5 flex flex-wrap items-baseline justify-between gap-2"
            >
              <div>
                <span className="text-slate-500 mr-2">{evt.timestamp}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 text-[10px] mr-2">
                  {evt.category}
                </span>
                <span className="text-amber-200 font-semibold mr-2">{evt.type}</span>
                <span className="text-slate-300">{evt.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                L{String(evt.levelId).padStart(2, '0')}
                {evt.objectId ? ` · ${evt.objectId}` : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
