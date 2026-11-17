import {
  Direction,
  GameScreenState,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  SaveProgress,
} from '../game/types';

export type DevTabId =
  | 'overview'
  | 'levels'
  | 'player'
  | 'puzzles'
  | 'world'
  | 'archipelago'
  | 'unbound'
  | 'rendering'
  | 'qa'
  | 'events';

export type SpeedMultiplier = 1 | 2 | 4 | 8;

export interface GodModeSettings {
  noClip: boolean;
  freeMovement: boolean;
  flyMode: boolean;
  flyOffsetY: number;
  speedMultiplier: SpeedMultiplier;
  freeCamera: boolean;
  freezeTimer: boolean;
  freezeEnvironment: boolean;
  showDecorProps: boolean;
}

export interface WorldOverlayFlags {
  tileGrid: boolean;
  coordinates: boolean;
  elevation: boolean;
  walkability: boolean;
  collision: boolean;
  voidBounds: boolean;
  interactables: boolean;
  lightPaths: boolean;
  puzzleConnections: boolean;
  spawnAndObjectives: boolean;
  objectBounds: boolean;
}

export interface RenderingDebugSettings {
  wireframe: boolean;
  showNormals: boolean;
  disableShadows: boolean;
  hideSkyBackdrop: boolean;
  hideParticles: boolean;
  hideEnvEffects: boolean;
  cameraZoomOverride: number | null;
}

export interface RenderDiagnosticsSnapshot {
  fps: number;
  avgFrameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  viewportWidth: number;
  viewportHeight: number;
  cameraPos: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  cameraZoom: number;
  tileCount: number;
  decorCount: number;
  mechanismCount: number;
}

export type DevEventCategory =
  | 'session'
  | 'level'
  | 'player'
  | 'puzzle'
  | 'world'
  | 'rendering'
  | 'qa'
  | 'save';

export interface DevEventEntry {
  id: string;
  timestamp: string;
  category: DevEventCategory;
  type: string;
  levelId: number;
  objectId?: string;
  details: string;
}

export type QAStatus = 'PASS' | 'FAIL' | 'WARNING';

export type QAExecutionMode = 'static-logic' | 'runtime-check';

export type QASuiteId =
  | 'current-level'
  | 'all-levels'
  | 'puzzle-systems'
  | 'save-system'
  | 'mastery'
  | 'cosmetics'
  | 'unbound'
  | 'rendering'
  | 'full';

export interface QATestResult {
  id: string;
  suite: QASuiteId;
  name: string;
  status: QAStatus;
  executionMode: QAExecutionMode;
  levelId?: number;
  objectId?: string;
  message: string;
  suggestion?: string;
  durationMs: number;
}

export interface QASuiteReport {
  suite: QASuiteId;
  startedAt: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  durationMs: number;
  results: QATestResult[];
}

export type InspectableObjectKind =
  | 'spawn'
  | 'switch'
  | 'gate'
  | 'rotating'
  | 'elevation'
  | 'emitter'
  | 'prism'
  | 'subcrystal'
  | 'hero_node'
  | 'echo'
  | 'crystal'
  | 'portal'
  | 'decor';

export interface InspectableObject {
  id: string;
  kind: InspectableObjectKind;
  name: string;
  gx: number;
  gz: number;
  elevation: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  stateSummary: string;
  collisionStatus: 'blocking' | 'walkable' | 'conditional' | 'non-solid';
  interactive: boolean;
  linkedIds: string[];
  configSummary: Record<string, unknown>;
}

export interface DevSessionSnapshot {
  capturedAt: number;
  screenState: GameScreenState;
  levelId: number;
  puzzleState: PuzzleRuntimeState;
  playerState: PlayerRuntimeState;
  progressSnapshot?: SaveProgress;
}

export interface DevRuntimeBridge {
  isActive: boolean;
  godMode: GodModeSettings;
  overlays: WorldOverlayFlags;
  rendering: RenderingDebugSettings;
  selectedObjectId: string | null;
  pickObjectMode: boolean;
  forcedObjectiveActive: boolean;
  freeCamPanDelta: { x: number; y: number; z: number };
  onSelectObject?: (objectId: string | null) => void;
  onDiagnosticsSample?: (snapshot: RenderDiagnosticsSnapshot) => void;
  onSimulatedComplete?: (elapsedSeconds: number, interactionsCount: number) => void;
  onEmitEvent?: (
    category: DevEventCategory,
    type: string,
    details: string,
    objectId?: string
  ) => void;
}

export type TileWalkabilityKind = 'walkable' | 'blocked' | 'conditional' | 'void';

export interface WorldTileWalkability {
  gx: number;
  gz: number;
  elevation: number;
  kind: TileWalkabilityKind;
  reason: string;
}

export interface PuzzleConnectionLink {
  id: string;
  fromKind: string;
  fromId: string;
  fromPos: [number, number, number];
  toKind: string;
  toId: string;
  toPos: [number, number, number];
  active: boolean;
  label: string;
}

export interface PrismDirectionControl {
  id: string;
  direction: Direction;
}

export const DEFAULT_GOD_MODE: GodModeSettings = {
  noClip: false,
  freeMovement: false,
  flyMode: false,
  flyOffsetY: 0,
  speedMultiplier: 1,
  freeCamera: false,
  freezeTimer: false,
  freezeEnvironment: false,
  showDecorProps: true,
};

export const DEFAULT_WORLD_OVERLAYS: WorldOverlayFlags = {
  tileGrid: false,
  coordinates: false,
  elevation: false,
  walkability: false,
  collision: false,
  voidBounds: false,
  interactables: false,
  lightPaths: false,
  puzzleConnections: false,
  spawnAndObjectives: false,
  objectBounds: false,
};

export const DEFAULT_RENDERING_DEBUG: RenderingDebugSettings = {
  wireframe: false,
  showNormals: false,
  disableShadows: false,
  hideSkyBackdrop: false,
  hideParticles: false,
  hideEnvEffects: false,
  cameraZoomOverride: null,
};
