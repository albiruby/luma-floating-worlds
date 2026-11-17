import { DevEventCategory, DevEventEntry } from './debugTypes';

const MAX_DEV_EVENTS = 300;
let eventSeq = 1;

export function createDevEvent(
  category: DevEventCategory,
  type: string,
  levelId: number,
  details: string,
  objectId?: string
): DevEventEntry {
  const now = new Date();
  const timestamp = now.toISOString().slice(11, 23);
  return {
    id: `evt_${Date.now()}_${eventSeq++}`,
    timestamp,
    category,
    type,
    levelId,
    objectId,
    details,
  };
}

export function appendDevEvent(
  list: DevEventEntry[],
  entry: DevEventEntry
): DevEventEntry[] {
  const next = [entry, ...list];
  return next.length > MAX_DEV_EVENTS ? next.slice(0, MAX_DEV_EVENTS) : next;
}

export function filterDevEvents(
  list: DevEventEntry[],
  search: string,
  category: DevEventCategory | 'all'
): DevEventEntry[] {
  const q = search.trim().toLowerCase();
  return list.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (!q) return true;
    return (
      item.type.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q) ||
      (item.objectId?.toLowerCase().includes(q) ?? false) ||
      `level ${item.levelId}`.includes(q)
    );
  });
}

export function serializeDevEventsJson(list: DevEventEntry[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalEvents: list.length,
      events: list,
    },
    null,
    2
  );
}
