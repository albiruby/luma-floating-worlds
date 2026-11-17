import { getTotalSessionHistoryCount } from './checkpoints';
import { getTotalStars } from './mastery';
import { computeRestoredWorlds } from './restoration';
import { SaveProgress, SaveStatus } from './types';

export const PRIMARY_SAVE_KEY = 'luma_floating_worlds_save_v1';
export const BACKUP_SAVE_KEY = 'luma_floating_worlds_save_backup_v1';
export const CURRENT_SAVE_SCHEMA_VERSION = 4;

export interface SaveExportEnvelope {
  app: 'LUMA: Floating Worlds';
  edition: 'Unbound — Play Beyond Worlds';
  schemaVersion: number;
  exportedAt: string;
  data: SaveProgress;
}

export interface ImportPreviewSummary {
  schemaVersion: number;
  exportedAt?: string;
  completedCount: number;
  totalStars: number;
  echoesCount: number;
  lumaShards: number;
  checkpointsCount: number;
  sessionHistoryCount: number;
  questsCompletedCount: number;
  restoredWorldsCount: number;
}

export type ImportParseResult =
  | {
      ok: true;
      progress: SaveProgress;
      summary: ImportPreviewSummary;
    }
  | {
      ok: false;
      error: string;
    };

export interface SaveReadResult {
  progress: SaveProgress;
  recoveredFromBackup: boolean;
  corruptPrimaryDetected: boolean;
  storageAvailable: boolean;
}

export interface SaveWriteResult {
  status: SaveStatus;
  bytesWritten: number;
  usedFallbackTrim: boolean;
  errorMessage?: string;
}

export interface LocalStorageDiagnostics {
  available: boolean;
  primaryBytes: number;
  backupBytes: number;
  totalBytes: number;
  hasBackup: boolean;
  persistedSupported: boolean;
  isPersisted: boolean | null;
}

export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probeKey = '__luma_ls_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function readSaveWithRecovery(
  validateFn: (raw: unknown) => SaveProgress
): SaveReadResult {
  if (!isLocalStorageAvailable()) {
    return {
      progress: validateFn(null),
      recoveredFromBackup: false,
      corruptPrimaryDetected: false,
      storageAvailable: false,
    };
  }

  let corruptPrimaryDetected = false;
  try {
    const rawPrimary = window.localStorage.getItem(PRIMARY_SAVE_KEY);
    if (rawPrimary) {
      const parsed = JSON.parse(rawPrimary);
      if (parsed && typeof parsed === 'object') {
        return {
          progress: validateFn(parsed),
          recoveredFromBackup: false,
          corruptPrimaryDetected: false,
          storageAvailable: true,
        };
      }
      corruptPrimaryDetected = true;
    }
  } catch {
    corruptPrimaryDetected = true;
  }

  // Attempt automatic backup recovery
  try {
    const rawBackup = window.localStorage.getItem(BACKUP_SAVE_KEY);
    if (rawBackup) {
      const parsedBackup = JSON.parse(rawBackup);
      if (parsedBackup && typeof parsedBackup === 'object') {
        const validated = validateFn(parsedBackup);
        try {
          window.localStorage.setItem(PRIMARY_SAVE_KEY, JSON.stringify(validated));
        } catch {
          // Ignore primary rewrite failure on recovery read
        }
        return {
          progress: validated,
          recoveredFromBackup: true,
          corruptPrimaryDetected,
          storageAvailable: true,
        };
      }
    }
  } catch {
    // Ignore corrupt backup
  }

  return {
    progress: validateFn(null),
    recoveredFromBackup: false,
    corruptPrimaryDetected,
    storageAvailable: true,
  };
}

function trimForQuotaRecovery(progress: SaveProgress, keepPerStage = 2): SaveProgress {
  let trimmedSession = progress.sessionHistory;
  if (progress.sessionHistory) {
    const out: NonNullable<SaveProgress['sessionHistory']> = {};
    for (const [k, list] of Object.entries(progress.sessionHistory)) {
      const id = Number(k);
      if (Array.isArray(list) && list.length > 0) {
        out[id] = list.slice(0, keepPerStage);
      }
    }
    trimmedSession = out;
  }

  return {
    ...progress,
    sessionHistory: trimmedSession,
    savedReplays: (progress.savedReplays ?? []).slice(0, 3),
    echoDuelsHistory: (progress.echoDuelsHistory ?? []).slice(0, 10),
  };
}

export function writeSaveAtomic(
  progress: SaveProgress,
  validateFn: (raw: unknown) => SaveProgress
): SaveWriteResult {
  if (!isLocalStorageAvailable()) {
    return {
      status: 'unavailable',
      bytesWritten: 0,
      usedFallbackTrim: false,
      errorMessage: 'Browser local storage is disabled or unavailable.',
    };
  }

  const validated = validateFn({
    ...progress,
    lastUpdatedAt: Date.now(),
  });
  const payload = JSON.stringify(validated);

  try {
    window.localStorage.setItem(PRIMARY_SAVE_KEY, payload);
    try {
      window.localStorage.setItem(BACKUP_SAVE_KEY, payload);
    } catch {
      // Backup key optional if storage is tight; primary succeeded
    }
    return {
      status: 'saved',
      bytesWritten: payload.length,
      usedFallbackTrim: false,
    };
  } catch (err) {
    // QuotaExceededError recovery: trim non-critical histories/replays & retry primary write
    try {
      const compacted = validateFn(trimForQuotaRecovery(validated, 1));
      const compactPayload = JSON.stringify(compacted);
      window.localStorage.setItem(PRIMARY_SAVE_KEY, compactPayload);
      return {
        status: 'saved',
        bytesWritten: compactPayload.length,
        usedFallbackTrim: true,
      };
    } catch {
      return {
        status: 'failed',
        bytesWritten: 0,
        usedFallbackTrim: true,
        errorMessage:
          err instanceof Error ? err.message : 'Unable to persist local progress (storage quota exceeded).',
      };
    }
  }
}

export function exportSavePayload(
  progress: SaveProgress,
  validateFn: (raw: unknown) => SaveProgress
): string {
  const validated = validateFn(progress);
  const envelope: SaveExportEnvelope = {
    app: 'LUMA: Floating Worlds',
    edition: 'Unbound — Play Beyond Worlds',
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: validated,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseAndValidateImport(
  rawText: string,
  validateFn: (raw: unknown) => SaveProgress
): ImportParseResult {
  if (!rawText || rawText.trim().length === 0) {
    return { ok: false, error: 'The selected file is empty.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'Invalid JSON syntax. Please choose a valid LUMA save file.' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Save file root must be a JSON object.' };
  }

  const root = parsed as Record<string, unknown>;
  let candidateData: Record<string, unknown>;
  let exportedAt: string | undefined;
  let schemaVersion = 1;

  if ('data' in root && root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    if (typeof root.app === 'string' && !root.app.toLowerCase().includes('luma')) {
      return { ok: false, error: 'This JSON file does not belong to LUMA: Floating Worlds.' };
    }
    candidateData = root.data as Record<string, unknown>;
    exportedAt = typeof root.exportedAt === 'string' ? root.exportedAt : undefined;
    schemaVersion =
      typeof root.schemaVersion === 'number' && Number.isInteger(root.schemaVersion)
        ? root.schemaVersion
        : CURRENT_SAVE_SCHEMA_VERSION;
  } else {
    candidateData = root;
    schemaVersion =
      typeof root.saveVersion === 'number' && Number.isInteger(root.saveVersion)
        ? root.saveVersion
        : 1;
  }

  const hasRecognizedFields =
    Array.isArray(candidateData.completedLevels) ||
    typeof candidateData.highestUnlockedLevel === 'number' ||
    (candidateData.masteryRecords !== undefined && typeof candidateData.masteryRecords === 'object') ||
    (candidateData.settings !== undefined && typeof candidateData.settings === 'object');

  if (!hasRecognizedFields) {
    return {
      ok: false,
      error: 'Recognized LUMA progression fields were not found in this file.',
    };
  }

  const validated = validateFn(candidateData);
  const questsCompletedCount = Object.values(validated.questProgress ?? {}).filter(
    (q) => q.completed
  ).length;
  const checkpointsCount = Object.keys(validated.checkpoints ?? {}).length;
  const sessionHistoryCount = getTotalSessionHistoryCount(validated.sessionHistory);
  const restoredWorldsCount = computeRestoredWorlds(validated).length;

  return {
    ok: true,
    progress: validated,
    summary: {
      schemaVersion,
      exportedAt,
      completedCount: validated.completedLevels.length,
      totalStars: getTotalStars(validated.masteryRecords),
      echoesCount: (validated.collectedEchoFragments ?? []).length,
      lumaShards: validated.lumaShards ?? 0,
      checkpointsCount,
      sessionHistoryCount,
      questsCompletedCount,
      restoredWorldsCount,
    },
  };
}

export function restoreFromBackupStorage(
  validateFn: (raw: unknown) => SaveProgress
): { ok: boolean; progress?: SaveProgress; error?: string } {
  if (!isLocalStorageAvailable()) {
    return { ok: false, error: 'Browser local storage is unavailable.' };
  }
  try {
    const raw = window.localStorage.getItem(BACKUP_SAVE_KEY);
    if (!raw) {
      return { ok: false, error: 'No local backup snapshot has been recorded yet.' };
    }
    const parsed = JSON.parse(raw);
    const validated = validateFn(parsed);
    window.localStorage.setItem(PRIMARY_SAVE_KEY, JSON.stringify(validated));
    return { ok: true, progress: validated };
  } catch {
    return { ok: false, error: 'Local backup snapshot is corrupted and cannot be restored.' };
  }
}

export function deleteAllLocalSaveData(): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(PRIMARY_SAVE_KEY);
    window.localStorage.removeItem(BACKUP_SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function getLocalStorageDiagnostics(): Promise<LocalStorageDiagnostics> {
  const available = isLocalStorageAvailable();
  let primaryBytes = 0;
  let backupBytes = 0;
  let hasBackup = false;

  if (available) {
    try {
      const p = window.localStorage.getItem(PRIMARY_SAVE_KEY);
      const b = window.localStorage.getItem(BACKUP_SAVE_KEY);
      primaryBytes = p ? p.length : 0;
      backupBytes = b ? b.length : 0;
      hasBackup = Boolean(b);
    } catch {
      // Ignore read failure
    }
  }

  let persistedSupported = false;
  let isPersisted: boolean | null = null;
  if (typeof navigator !== 'undefined' && navigator.storage) {
    persistedSupported = typeof navigator.storage.persist === 'function';
    if (typeof navigator.storage.persisted === 'function') {
      try {
        isPersisted = await navigator.storage.persisted();
      } catch {
        isPersisted = null;
      }
    }
  }

  return {
    available,
    primaryBytes,
    backupBytes,
    totalBytes: primaryBytes + backupBytes,
    hasBackup,
    persistedSupported,
    isPersisted,
  };
}

export async function requestBrowserPersistentStorage(): Promise<{
  supported: boolean;
  granted: boolean | null;
}> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return { supported: false, granted: null };
  }
  try {
    const granted = await navigator.storage.persist();
    return { supported: true, granted };
  } catch {
    return { supported: true, granted: false };
  }
}
