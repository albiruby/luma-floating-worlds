import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { audioEngine } from '../audio/synth';
import type { DevRuntimeBridge } from '../dev/debugTypes';
import { detectHubAreaAtPosition, HUB_AREAS, HUB_WORLD_PORTALS } from '../game/hubLayout';
import { NPCS } from '../game/npcs';
import { getWorldRestoredVisualBoost } from '../game/restoration';
import {
  activateHeroAbility,
  executeInteraction,
  findNearestInteraction,
  stepPlayerMovement,
} from '../game/rules';
import { resolveWayfinderAppearance } from '../game/cosmetics';
import { getWorldForLevelId } from '../game/worlds';
import {
  CharacterId,
  ELEVATION_STEP,
  EquippedCosmetics,
  GameScreenState,
  HubAreaId,
  HubRestorationTier,
  InteractionTarget,
  LevelDef,
  NpcId,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  TILE_SIZE,
  WorldId,
} from '../game/types';
import { EnvironmentPropsLayer } from './assets/EnvironmentProps';
import { HeroModel } from './assets/HeroModel';
import { IslandTerrain } from './assets/IslandTerrain';
import { PuzzleMechanisms } from './assets/PuzzleMechanisms';
import { ConvergenceScene } from './hub/ConvergenceScene';
import { NpcModels } from './hub/NpcModels';
import { applyWorldBiomeToPalette, createLumaPalette } from './materials';
import { SkyBackdrop } from './SkyBackdrop';

const LazyWorldInspectorOverlays = import.meta.env.DEV
  ? React.lazy(() =>
      import('../dev/overlays/WorldInspectorOverlays').then((m) => ({
        default: m.WorldInspectorOverlays,
      }))
    )
  : null;

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export type HubInteractionTarget =
  | {
      kind: 'npc';
      npcId: NpcId;
      prompt: string;
      worldX: number;
      worldZ: number;
    }
  | {
      kind: 'portal';
      worldId: WorldId;
      prompt: string;
      worldX: number;
      worldZ: number;
    }
  | {
      kind: 'station';
      stationKind:
        | 'central_crystal'
        | 'hero_sanctum'
        | 'wardrobe'
        | 'echo_archive'
        | 'reward_gallery'
        | 'quest_board'
        | 'world_map'
        | 'secret_shrine';
      areaId: HubAreaId;
      prompt: string;
      worldX: number;
      worldZ: number;
    };

function findNearestHubInteraction(player: PlayerRuntimeState): HubInteractionTarget | null {
  const candidates: Array<HubInteractionTarget & { dist: number }> = [];

  for (const npc of NPCS) {
    const wx = npc.hubX * TILE_SIZE;
    const wz = npc.hubZ * TILE_SIZE;
    const dist = Math.hypot(player.x - wx, player.z - wz);
    if (dist <= 2.45) {
      candidates.push({
        kind: 'npc',
        npcId: npc.id,
        prompt: `Speak with ${npc.name} (${npc.role})`,
        worldX: wx,
        worldZ: wz,
        dist,
      });
    }
  }

  for (const portal of HUB_WORLD_PORTALS) {
    const wx = portal.x * TILE_SIZE;
    const wz = portal.z * TILE_SIZE;
    const dist = Math.hypot(player.x - wx, player.z - wz);
    if (dist <= 2.45) {
      candidates.push({
        kind: 'portal',
        worldId: portal.worldId,
        prompt: portal.prompt,
        worldX: wx,
        worldZ: wz,
        dist,
      });
    }
  }

  for (const area of HUB_AREAS) {
    const st = area.interactiveStation;
    if (!st) continue;
    const wx = st.x * TILE_SIZE;
    const wz = st.z * TILE_SIZE;
    const dist = Math.hypot(player.x - wx, player.z - wz);
    if (dist <= 2.4) {
      candidates.push({
        kind: 'station',
        stationKind: st.kind,
        areaId: area.id,
        prompt: st.prompt,
        worldX: wx,
        worldZ: wz,
        dist,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.dist - b.dist);
  const { dist: _d, ...best } = candidates[0];
  return best;
}

export interface HudSyncSnapshot {
  interactPrompt: string | null;
  crystalRestored: boolean;
  portalAwakened: boolean;
  interactionsCount: number;
  elapsedSeconds: number;
  abilityCooldown: number;
  abilityActiveTimer: number;
  echoCollectedInRun: boolean;
  heroNodesActivatedCount: number;
}

interface GameSceneProps {
  level: LevelDef;
  screenState: GameScreenState;
  cameraZoomOffset: number;
  equippedCosmetics: EquippedCosmetics;
  activeCharacterId?: CharacterId;
  abilityTriggerToken?: number;
  resetToken: number;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  playerRef: React.MutableRefObject<PlayerRuntimeState>;
  devBridgeRef?: React.MutableRefObject<DevRuntimeBridge | null>;
  devRevision?: number;
  pauseLoop?: boolean;
  hubTier?: HubRestorationTier;
  restoredWorlds?: WorldId[];
  highestUnlockedLevel?: number;
  activeQuestNpcIds?: Set<NpcId>;
  talkedNpcIds?: NpcId[];
  onHubAreaChanged?: (areaId: HubAreaId) => void;
  onHubInteract?: (target: HubInteractionTarget) => void;
  onHudSync: (snapshot: HudSyncSnapshot) => void;
  onLevelComplete: (elapsedSeconds: number, interactionsCount: number) => void;
  onHeroAbilityActivated?: (activatedNodeIds: string[], bonusShards: number) => void;
  onEchoCollected?: (echoId: string) => void;
  onTogglePause: () => void;
  onQuickRestart: () => void;
  onToggleMute: () => void;
}

interface BurstParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

const BURST_POOL_SIZE = 40;

const SceneContent: React.FC<
  GameSceneProps & { isSoftwareGl: boolean }
> = ({
  level,
  screenState,
  cameraZoomOffset,
  equippedCosmetics,
  activeCharacterId = 'wayfinder',
  abilityTriggerToken = 0,
  puzzleStateRef,
  playerRef,
  devBridgeRef,
  devRevision = 0,
  pauseLoop = false,
  hubTier = 'dormant',
  restoredWorlds = [],
  highestUnlockedLevel = 1,
  activeQuestNpcIds,
  talkedNpcIds = [],
  onHubAreaChanged,
  onHubInteract,
  onHudSync,
  onLevelComplete,
  onHeroAbilityActivated,
  onEchoCollected,
  onTogglePause,
  onQuickRestart,
  onToggleMute,
  isSoftwareGl,
}) => {
  const { gl, scene, camera, size } = useThree();
  const isHubMode = screenState === 'hub' || level.id === 0;
  const world = useMemo(() => getWorldForLevelId(level.id), [level.id]);
  const restoredSet = useMemo(() => new Set<WorldId>(restoredWorlds), [restoredWorlds]);
  const isCurrentWorldRestored = isHubMode
    ? hubTier === 'restored'
    : restoredSet.has(world.id);
  const visualBoost = useMemo(
    () => getWorldRestoredVisualBoost(world.id, isCurrentWorldRestored),
    [isCurrentWorldRestored, world.id]
  );

  const palette = useMemo(() => createLumaPalette(world), []);
  const heroAppearance = useMemo(
    () => resolveWayfinderAppearance(equippedCosmetics, activeCharacterId),
    [activeCharacterId, equippedCosmetics]
  );
  const interactionTargetRef = useRef<InteractionTarget | null>(null);
  const [hubHighlightPos, setHubHighlightPos] = React.useState<{ x: number; z: number } | null>(null);
  const lastHubHighlightKeyRef = useRef<string>('');
  const lastHubAreaRef = useRef<HubAreaId | null>(null);
  const frameSubscribersRef = useRef<Set<(dt: number, elapsed: number) => void>>(new Set());
  const envFrameSubscribersRef = useRef<Set<(dt: number, elapsed: number) => void>>(new Set());
  const mainSunRef = useRef<THREE.DirectionalLight>(null);

  const emptyNpcSet = useMemo(() => new Set<NpcId>(), []);
  const talkedNpcSet = useMemo(() => new Set<NpcId>(talkedNpcIds), [talkedNpcIds]);

  // Latest props in refs so loop never restarts on HUD/state transitions
  const screenStateRef = useRef(screenState);
  screenStateRef.current = screenState;
  const pauseLoopRef = useRef(pauseLoop);
  pauseLoopRef.current = pauseLoop;
  const levelRef = useRef(level);
  levelRef.current = level;
  const zoomOffsetRef = useRef(cameraZoomOffset);
  zoomOffsetRef.current = cameraZoomOffset;
  const abilityTriggerTokenRef = useRef(abilityTriggerToken);
  const pendingAbilityFromHudRef = useRef(false);
  if (abilityTriggerToken !== abilityTriggerTokenRef.current) {
    abilityTriggerTokenRef.current = abilityTriggerToken;
    pendingAbilityFromHudRef.current = true;
  }
  const callbacksRef = useRef({
    onHudSync,
    onLevelComplete,
    onHeroAbilityActivated,
    onEchoCollected,
    onTogglePause,
    onQuickRestart,
    onToggleMute,
    onHubAreaChanged,
    onHubInteract,
  });
  callbacksRef.current = {
    onHudSync,
    onLevelComplete,
    onHeroAbilityActivated,
    onEchoCollected,
    onTogglePause,
    onQuickRestart,
    onToggleMute,
    onHubAreaChanged,
    onHubInteract,
  };

  const heldKeysRef = useRef<Set<string>>(new Set());
  const justPressedRef = useRef<Set<string>>(new Set());
  const footstepTimerRef = useRef(0);
  const camTargetRef = useRef(new THREE.Vector3(level.cameraCenter.x * TILE_SIZE, 0, level.cameraCenter.z * TILE_SIZE));
  const camOffsetRef = useRef(new THREE.Vector3(18, 15.5, 18));
  const lastHudSentRef = useRef<string>('');
  const wheelZoomDeltaRef = useRef(0);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  // Pooled burst particles (zero GC)
  const burstMeshRef = useRef<THREE.InstancedMesh>(null);
  const burstPoolRef = useRef<BurstParticle[]>(
    Array.from({ length: BURST_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.6,
    }))
  );
  const burstGeo = useMemo(() => new THREE.OctahedronGeometry(0.11, 0), []);
  const burstMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x62fff0,
        transparent: true,
        opacity: 0.9,
      }),
    []
  );
  const scratchObj = useMemo(() => new THREE.Object3D(), []);

  const spawnBurst = useMemo(() => {
    let cursor = 0;
    return (wx: number, wy: number, wz: number, count = 14) => {
      const pool = burstPoolRef.current;
      for (let i = 0; i < count; i++) {
        const p = pool[cursor];
        cursor = (cursor + 1) % BURST_POOL_SIZE;
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 1.4 + Math.random() * 2.2;
        p.active = true;
        p.x = wx;
        p.y = wy;
        p.z = wz;
        p.vx = Math.cos(angle) * speed;
        p.vy = 1.8 + Math.random() * 2.2;
        p.vz = Math.sin(angle) * speed;
        p.life = 0;
        p.maxLife = 0.45 + Math.random() * 0.25;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      palette.dispose();
      burstGeo.dispose();
      burstMat.dispose();
    };
  }, [burstGeo, burstMat, palette]);

  // Configure renderer, RoomEnvironment, and Fog once
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.96;

    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    scene.fog = new THREE.Fog(world.biome.fogColor, 42, 95);

    if (!isSoftwareGl) {
      gl.compile(scene, camera);
    }

    return () => {
      scene.environment = null;
      envTarget.dispose();
    };
  }, [camera, gl, isSoftwareGl, scene]);

  // Update biome palette and fog color/distance smoothly when world or restoration changes
  useEffect(() => {
    applyWorldBiomeToPalette(palette, world, isCurrentWorldRestored);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.setHex(world.biome.fogColor);
      scene.fog.near = 42 + visualBoost.fogNearOffset;
      scene.fog.far = 95 + visualBoost.fogFarOffset;
    }
  }, [isCurrentWorldRestored, palette, scene, visualBoost.fogFarOffset, visualBoost.fogNearOffset, world]);

  // Recenter camera target when switching levels
  useEffect(() => {
    camTargetRef.current.set(
      level.cameraCenter.x * TILE_SIZE,
      0.5,
      level.cameraCenter.z * TILE_SIZE
    );
    wheelZoomDeltaRef.current = 0;
  }, [level]);

  // Window keyboard & blur listeners
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyG') {
        return;
      }
      if (isTypingTarget(e.target)) {
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (!heldKeysRef.current.has(e.code)) {
        justPressedRef.current.add(e.code);
      }
      heldKeysRef.current.add(e.code);

      if (pauseLoopRef.current) {
        return;
      }

      if (screenStateRef.current === 'playing' || screenStateRef.current === 'hub') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          callbacksRef.current.onTogglePause();
        } else if (e.code === 'KeyR' && screenStateRef.current === 'playing') {
          callbacksRef.current.onQuickRestart();
        } else if (e.code === 'KeyM') {
          callbacksRef.current.onToggleMute();
        }
      } else if (screenStateRef.current === 'paused') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          callbacksRef.current.onTogglePause();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeysRef.current.delete(e.code);
    };

    const clearHeld = () => {
      heldKeysRef.current.clear();
      justPressedRef.current.clear();
    };

    const onWheel = (e: WheelEvent) => {
      if (screenStateRef.current !== 'playing' && screenStateRef.current !== 'hub') return;
      wheelZoomDeltaRef.current = THREE.MathUtils.clamp(
        wheelZoomDeltaRef.current - e.deltaY * 0.0008,
        -0.25,
        0.35
      );
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('visibilitychange', clearHeld);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('visibilitychange', clearHeld);
    };
  }, []);

  const registerFrame = useMemo(() => {
    return (cb: (dt: number, elapsed: number) => void) => {
      frameSubscribersRef.current.add(cb);
      return () => {
        frameSubscribersRef.current.delete(cb);
      };
    };
  }, []);

  const registerEnvFrame = useMemo(() => {
    return (cb: (dt: number, elapsed: number) => void) => {
      envFrameSubscribersRef.current.add(cb);
      return () => {
        envFrameSubscribersRef.current.delete(cb);
      };
    };
  }, []);

  // Main render + simulation loop with Software WebGL afterDraw() pacing
  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let envElapsed = 0;
    let lastDiagTime = 0;
    let emaFrameMs = isSoftwareGl ? 90 : 16.7;
    let hasRenderedInitialFrame = false;

    // Reversible material/render override state (dev only)
    const normalMat = import.meta.env.DEV ? new THREE.MeshNormalMaterial({ flatShading: true }) : null;
    const origMatMap = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();
    const origWireMap = new WeakMap<THREE.Material, boolean>();
    let prevWireframe = false;
    let prevShowNormals = false;

    const isDebugOrSkyAncestor = (obj: THREE.Object3D): boolean => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (cur.name === 'DevWorldOverlays' || cur.name === 'SkyBackdrop') return true;
        cur = cur.parent;
      }
      return false;
    };

    const applyDebugMaterialOverrides = (wantWire: boolean, wantNormals: boolean) => {
      if (!import.meta.env.DEV || !normalMat) return;
      if (wantWire === prevWireframe && wantNormals === prevShowNormals && !wantWire && !wantNormals) {
        return;
      }
      scene.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh || isDebugOrSkyAncestor(obj)) return;
        const mesh = obj as THREE.Mesh;

        if (wantNormals) {
          if (!origMatMap.has(mesh) && mesh.material !== normalMat) {
            origMatMap.set(mesh, mesh.material);
          }
          mesh.material = normalMat;
        } else if (origMatMap.has(mesh)) {
          mesh.material = origMatMap.get(mesh)!;
          origMatMap.delete(mesh);
        }

        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          if (m && 'wireframe' in m) {
            const wm = m as THREE.MeshStandardMaterial;
            if (wantWire) {
              if (!origWireMap.has(wm)) {
                origWireMap.set(wm, wm.wireframe);
              }
              wm.wireframe = true;
            } else if (origWireMap.has(wm)) {
              wm.wireframe = origWireMap.get(wm)!;
              origWireMap.delete(wm);
            }
          }
        }
      });
      prevWireframe = wantWire;
      prevShowNormals = wantNormals;
    };

    function afterDraw(cb: () => void) {
      const context = gl.getContext() as WebGL2RenderingContext;
      const sync = context.fenceSync?.(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
      context.flush();
      const poll = () => {
        if (cancelled) {
          if (sync) context.deleteSync(sync);
          return;
        }
        const status = sync ? context.getSyncParameter(sync, context.SYNC_STATUS) : context.SIGNALED;
        if (status === context.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) context.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (cancelled) return;
      const now = performance.now();
      const rawMs = Math.max(1, now - lastTime);
      const rawDt = rawMs / 1000;
      lastTime = now;
      if (pauseLoopRef.current && hasRenderedInitialFrame) {
        frameId = window.setTimeout(tick, 180);
        return;
      }
      emaFrameMs = emaFrameMs * 0.85 + rawMs * 0.15;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      elapsed += dt;

      const curLevel = levelRef.current;
      const mode = screenStateRef.current;
      const bridge = import.meta.env.DEV ? devBridgeRef?.current ?? null : null;
      const devActive = Boolean(bridge?.isActive);
      const god = devActive && bridge ? bridge.godMode : null;
      const ren = devActive && bridge ? bridge.rendering : null;

      if (!god?.freezeEnvironment) {
        envElapsed += dt;
      }

      // 1. Update simulation when playing or exploring Hub
      if (mode === 'hub') {
        const held = heldKeysRef.current;
        let screenUp = 0;
        let screenRight = 0;
        if (held.has('KeyW') || held.has('ArrowUp')) screenUp += 1;
        if (held.has('KeyS') || held.has('ArrowDown')) screenUp -= 1;
        if (held.has('KeyD') || held.has('ArrowRight')) screenRight += 1;
        if (held.has('KeyA') || held.has('ArrowLeft')) screenRight -= 1;

        const inputX = screenRight - screenUp;
        const inputZ = -screenRight - screenUp;

        const moveRes = stepPlayerMovement(
          curLevel,
          puzzleStateRef.current,
          playerRef.current,
          inputX,
          inputZ,
          dt,
          god
            ? {
                noClip: god.noClip,
                freeMovement: god.freeMovement,
                flyMode: god.flyMode,
                flyOffsetY: god.flyOffsetY,
                speedMultiplier: god.speedMultiplier,
              }
            : undefined
        );
        playerRef.current = moveRes.player;
        puzzleStateRef.current = moveRes.puzzleState;

        if (moveRes.player.isMoving) {
          footstepTimerRef.current -= dt;
          if (footstepTimerRef.current <= 0) {
            footstepTimerRef.current = 0.28;
            audioEngine.playFootstep();
          }
        } else {
          footstepTimerRef.current = 0.05;
        }

        // Hub Zone Detection
        const area = detectHubAreaAtPosition(playerRef.current.x, playerRef.current.z);
        if (area && area.id !== lastHubAreaRef.current) {
          lastHubAreaRef.current = area.id;
          callbacksRef.current.onHubAreaChanged?.(area.id);
        }

        // Visual hero resonance pulse in Hub (no puzzle effects)
        const abilityRequested =
          justPressedRef.current.has('KeyQ') || pendingAbilityFromHudRef.current;
        if (abilityRequested) {
          pendingAbilityFromHudRef.current = false;
          const abilityRes = activateHeroAbility(curLevel, puzzleStateRef.current, playerRef.current);
          if (abilityRes.pulsed) {
            puzzleStateRef.current = abilityRes.puzzleState;
            audioEngine.playHeroAbility(puzzleStateRef.current.activeCharacterId);
            spawnBurst(playerRef.current.x, playerRef.current.y + 0.75, playerRef.current.z, 18);
          }
        }

        const hubTarget = findNearestHubInteraction(playerRef.current);
        interactionTargetRef.current = null;

        const highlightKey = hubTarget ? `${hubTarget.worldX},${hubTarget.worldZ}` : '';
        if (highlightKey !== lastHubHighlightKeyRef.current) {
          lastHubHighlightKeyRef.current = highlightKey;
          setHubHighlightPos(
            hubTarget ? { x: hubTarget.worldX, z: hubTarget.worldZ } : null
          );
        }

        const interactPressed =
          justPressedRef.current.has('KeyE') || justPressedRef.current.has('Space');
        if (interactPressed && hubTarget) {
          audioEngine.playUiClick();
          spawnBurst(hubTarget.worldX, playerRef.current.y + 0.7, hubTarget.worldZ, 12);
          playerRef.current = { ...playerRef.current, interactTimer: 0.3 };
          callbacksRef.current.onHubInteract?.(hubTarget);
        }

        const ps = puzzleStateRef.current;
        const nextHudKey = `hub|${hubTarget?.prompt ?? ''}|${area?.id ?? ''}|${Math.ceil(ps.abilityCooldown * 4)}|${ps.abilityActiveTimer > 0.05}`;
        if (nextHudKey !== lastHudSentRef.current) {
          lastHudSentRef.current = nextHudKey;
          callbacksRef.current.onHudSync({
            interactPrompt: hubTarget ? hubTarget.prompt : null,
            crystalRestored: true,
            portalAwakened: false,
            interactionsCount: 0,
            elapsedSeconds: 0,
            abilityCooldown: ps.abilityCooldown,
            abilityActiveTimer: ps.abilityActiveTimer,
            echoCollectedInRun: false,
            heroNodesActivatedCount: 0,
          });
        }
      } else if (mode === 'playing' && !puzzleStateRef.current.completed) {
        if (lastHubHighlightKeyRef.current !== '') {
          lastHubHighlightKeyRef.current = '';
          setHubHighlightPos(null);
        }
        const wasCompleted = puzzleStateRef.current.completed;
        if (!god?.freezeTimer) {
          puzzleStateRef.current = {
            ...puzzleStateRef.current,
            elapsedSeconds: puzzleStateRef.current.elapsedSeconds + dt,
          };
        }

        const held = heldKeysRef.current;
        let screenUp = 0;
        let screenRight = 0;
        if (held.has('KeyW') || held.has('ArrowUp')) screenUp += 1;
        if (held.has('KeyS') || held.has('ArrowDown')) screenUp -= 1;
        if (held.has('KeyD') || held.has('ArrowRight')) screenRight += 1;
        if (held.has('KeyA') || held.has('ArrowLeft')) screenRight -= 1;

        const inputX = screenRight - screenUp;
        const inputZ = -screenRight - screenUp;

        const moveRes = stepPlayerMovement(
          curLevel,
          puzzleStateRef.current,
          playerRef.current,
          inputX,
          inputZ,
          dt,
          god
            ? {
                noClip: god.noClip,
                freeMovement: god.freeMovement,
                flyMode: god.flyMode,
                flyOffsetY: god.flyOffsetY,
                speedMultiplier: god.speedMultiplier,
              }
            : undefined
        );

        playerRef.current = moveRes.player;
        puzzleStateRef.current = moveRes.puzzleState;

        if (moveRes.player.isMoving) {
          footstepTimerRef.current -= dt;
          if (footstepTimerRef.current <= 0) {
            footstepTimerRef.current = 0.28;
            audioEngine.playFootstep();
          }
        } else {
          footstepTimerRef.current = 0.05;
        }

        if (moveRes.triggeredSwitchId) {
          audioEngine.playSwitch();
          const sw = curLevel.pressureSwitches.find((s) => s.id === moveRes.triggeredSwitchId);
          if (sw) {
            spawnBurst(sw.x * TILE_SIZE, sw.elevation * ELEVATION_STEP + 0.35, sw.z * TILE_SIZE, 14);
          }
        }

        if (moveRes.collectedEchoId) {
          audioEngine.playEchoCollect();
          spawnBurst(playerRef.current.x, playerRef.current.y + 0.8, playerRef.current.z, 20);
          callbacksRef.current.onEchoCollected?.(moveRes.collectedEchoId);
        }

        const abilityRequested =
          justPressedRef.current.has('KeyQ') || pendingAbilityFromHudRef.current;
        if (abilityRequested) {
          pendingAbilityFromHudRef.current = false;
          const abilityRes = activateHeroAbility(curLevel, puzzleStateRef.current, playerRef.current);
          if (abilityRes.pulsed) {
            puzzleStateRef.current = abilityRes.puzzleState;
            audioEngine.playHeroAbility(puzzleStateRef.current.activeCharacterId);
            spawnBurst(playerRef.current.x, playerRef.current.y + 0.75, playerRef.current.z, 18);
            const bonusShards = (curLevel.heroNodes ?? [])
              .filter((hn) => abilityRes.activatedNodeIds.includes(hn.id))
              .reduce((acc, hn) => acc + (hn.bonusShards ?? 0), 0);
            callbacksRef.current.onHeroAbilityActivated?.(abilityRes.activatedNodeIds, bonusShards);
          }
        }

        const target = findNearestInteraction(curLevel, puzzleStateRef.current, playerRef.current);
        interactionTargetRef.current = target;

        const interactPressed =
          justPressedRef.current.has('KeyE') || justPressedRef.current.has('Space');
        if (interactPressed && target) {
          const prevCrystal = puzzleStateRef.current.crystalRestored;
          const prevHeroActive = Boolean(puzzleStateRef.current.heroNodesActive?.[target.id]);
          const prevEcho = puzzleStateRef.current.echoCollectedInRun;
          const nextPuzzle = executeInteraction(curLevel, puzzleStateRef.current, target);
          puzzleStateRef.current = nextPuzzle;
          playerRef.current = { ...playerRef.current, interactTimer: 0.35 };

          if (target.kind === 'switch') audioEngine.playSwitch();
          else if (target.kind === 'rotating') audioEngine.playRotate();
          else if (target.kind === 'elevation') audioEngine.playLift();
          else if (target.kind === 'prism') audioEngine.playPrism();
          else if (target.kind === 'crystal') audioEngine.playCrystalRestore();
          else if (target.kind === 'hero_node' && !prevHeroActive) {
            audioEngine.playHeroAbility(puzzleStateRef.current.activeCharacterId);
            const hn = (curLevel.heroNodes ?? []).find((n) => n.id === target.id);
            callbacksRef.current.onHeroAbilityActivated?.([target.id], hn?.bonusShards ?? 0);
          } else if (target.kind === 'echo' && !prevEcho) {
            audioEngine.playEchoCollect();
            callbacksRef.current.onEchoCollected?.(target.id);
          }

          if (!prevCrystal && nextPuzzle.crystalRestored && target.kind !== 'crystal') {
            audioEngine.playCrystalRestore();
            spawnBurst(
              curLevel.crystal.x * TILE_SIZE,
              curLevel.crystal.elevation * ELEVATION_STEP + 1.2,
              curLevel.crystal.z * TILE_SIZE,
              22
            );
          } else {
            spawnBurst(target.worldX, playerRef.current.y + 0.7, target.worldZ, 12);
          }
        }

        if (!wasCompleted && (moveRes.enteredPortal || puzzleStateRef.current.completed)) {
          puzzleStateRef.current = { ...puzzleStateRef.current, completed: true };
          audioEngine.playPortalComplete();
          spawnBurst(
            curLevel.portal.x * TILE_SIZE,
            curLevel.portal.elevation * ELEVATION_STEP + 1.2,
            curLevel.portal.z * TILE_SIZE,
            26
          );
          if (devActive && bridge) {
            bridge.onSimulatedComplete?.(
              puzzleStateRef.current.elapsedSeconds,
              puzzleStateRef.current.interactionsCount
            );
          } else {
            callbacksRef.current.onLevelComplete(
              puzzleStateRef.current.elapsedSeconds,
              puzzleStateRef.current.interactionsCount
            );
          }
        }

        const ps = puzzleStateRef.current;
        const heroNodesActivatedCount = Object.values(ps.heroNodesActive ?? {}).filter(Boolean).length;
        const nextHudKey = `${target?.prompt ?? ''}|${ps.crystalRestored}|${ps.portalAwakened}|${ps.interactionsCount}|${Math.floor(ps.elapsedSeconds)}|${Math.ceil(ps.abilityCooldown * 4)}|${ps.abilityActiveTimer > 0.05}|${ps.echoCollectedInRun}|${heroNodesActivatedCount}`;
        if (nextHudKey !== lastHudSentRef.current) {
          lastHudSentRef.current = nextHudKey;
          callbacksRef.current.onHudSync({
            interactPrompt: target ? target.prompt : null,
            crystalRestored: ps.crystalRestored,
            portalAwakened: ps.portalAwakened,
            interactionsCount: ps.interactionsCount,
            elapsedSeconds: ps.elapsedSeconds,
            abilityCooldown: ps.abilityCooldown,
            abilityActiveTimer: ps.abilityActiveTimer,
            echoCollectedInRun: ps.echoCollectedInRun,
            heroNodesActivatedCount,
          });
        }
      } else {
        interactionTargetRef.current = null;
        pendingAbilityFromHudRef.current = false;
      }

      justPressedRef.current.clear();

      // 2. Update Orthographic Isometric Camera
      const orthoCam = camera as THREE.OrthographicCamera;
      const curSize = sizeRef.current;
      const effectiveZoom =
        ren?.cameraZoomOverride ??
        curLevel.cameraZoom * (1 + zoomOffsetRef.current + wheelZoomDeltaRef.current);

      if (orthoCam.isOrthographicCamera) {
        const aspect = Math.max(0.35, curSize.width / Math.max(1, curSize.height));
        const portraitCompensation = aspect < 1 ? Math.min(1.5, 1 / Math.max(0.62, aspect)) : 1;
        const baseFrustum = (14.8 * portraitCompensation) / Math.max(0.35, effectiveZoom);
        const halfH = baseFrustum * 0.5;
        const halfW = halfH * aspect;
        orthoCam.left = -halfW;
        orthoCam.right = halfW;
        orthoCam.top = halfH;
        orthoCam.bottom = -halfH;
        orthoCam.updateProjectionMatrix();

        const centerWorldX = curLevel.cameraCenter.x * TILE_SIZE;
        const centerWorldZ = curLevel.cameraCenter.z * TILE_SIZE;

        if (god?.freeCamera && bridge) {
          const desiredX = centerWorldX + bridge.freeCamPanDelta.x;
          const desiredZ = centerWorldZ + bridge.freeCamPanDelta.z;
          camTargetRef.current.x = THREE.MathUtils.damp(camTargetRef.current.x, desiredX, 7, dt);
          camTargetRef.current.y = THREE.MathUtils.damp(camTargetRef.current.y, 0.6, 7, dt);
          camTargetRef.current.z = THREE.MathUtils.damp(camTargetRef.current.z, desiredZ, 7, dt);
        } else if (mode === 'title') {
          const orbitAngle = Math.sin(elapsed * 0.22) * 0.28 + Math.PI / 4;
          const dist = 24;
          camOffsetRef.current.set(
            Math.cos(orbitAngle) * dist,
            15.5,
            Math.sin(orbitAngle) * dist
          );
          camTargetRef.current.x = THREE.MathUtils.damp(camTargetRef.current.x, centerWorldX - 1.4, 4, dt);
          camTargetRef.current.y = THREE.MathUtils.damp(camTargetRef.current.y, 0.9, 4, dt);
          camTargetRef.current.z = THREE.MathUtils.damp(camTargetRef.current.z, centerWorldZ + 0.6, 4, dt);
        } else {
          camOffsetRef.current.x = THREE.MathUtils.damp(camOffsetRef.current.x, 18, 6, dt);
          camOffsetRef.current.y = THREE.MathUtils.damp(camOffsetRef.current.y, 15.5, 6, dt);
          camOffsetRef.current.z = THREE.MathUtils.damp(camOffsetRef.current.z, 18, 6, dt);

          const p = playerRef.current;
          const desiredX = p.x * 0.58 + centerWorldX * 0.42;
          const desiredY = p.y * 0.55 + 0.4;
          const desiredZ = p.z * 0.58 + centerWorldZ * 0.42;
          camTargetRef.current.x = THREE.MathUtils.damp(camTargetRef.current.x, desiredX, 6.5, dt);
          camTargetRef.current.y = THREE.MathUtils.damp(camTargetRef.current.y, desiredY, 6.5, dt);
          camTargetRef.current.z = THREE.MathUtils.damp(camTargetRef.current.z, desiredZ, 6.5, dt);
        }

        orthoCam.position.copy(camTargetRef.current).add(camOffsetRef.current);
        orthoCam.lookAt(camTargetRef.current);
      }

      // 3. Advance pooled burst particles
      if (burstMeshRef.current) {
        burstMeshRef.current.visible = !(ren?.hideParticles);
        const pool = burstPoolRef.current;
        for (let i = 0; i < BURST_POOL_SIZE; i++) {
          const p = pool[i];
          if (p.active) {
            p.life += dt;
            if (p.life >= p.maxLife) {
              p.active = false;
              scratchObj.scale.setScalar(0);
            } else {
              p.vy -= 5.2 * dt;
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.z += p.vz * dt;
              const t = 1 - p.life / p.maxLife;
              scratchObj.position.set(p.x, p.y, p.z);
              scratchObj.rotation.set(p.life * 4, p.life * 5, 0);
              scratchObj.scale.setScalar(t * 1.15);
            }
          } else {
            scratchObj.scale.setScalar(0);
            scratchObj.position.set(0, -50, 0);
          }
          scratchObj.updateMatrix();
          burstMeshRef.current.setMatrixAt(i, scratchObj.matrix);
        }
        burstMeshRef.current.instanceMatrix.needsUpdate = true;
      }

      // 4. Advance all 3D visual animation subscribers
      frameSubscribersRef.current.forEach((cb) => cb(dt, elapsed));
      if (!god?.freezeEnvironment) {
        envFrameSubscribersRef.current.forEach((cb) => cb(dt, envElapsed));
      }

      // 5. Apply reversible dev rendering overrides before render
      if (mainSunRef.current) {
        mainSunRef.current.castShadow = !isSoftwareGl && !(ren?.disableShadows);
      }
      const skyObj = scene.getObjectByName('SkyBackdrop');
      if (skyObj) {
        skyObj.visible = !(ren?.hideSkyBackdrop);
      }
      const envObj = scene.getObjectByName('EnvironmentProps');
      if (envObj) {
        envObj.visible = !(ren?.hideEnvEffects) && (god ? god.showDecorProps : true);
      }
      applyDebugMaterialOverrides(Boolean(ren?.wireframe), Boolean(ren?.showNormals));

      // 6. Render frame
      gl.render(scene, camera);
      hasRenderedInitialFrame = true;

      // 7. Throttled Render Diagnostics (~3Hz when Dev Mode is open)
      if (devActive && bridge?.onDiagnosticsSample && now - lastDiagTime >= 320) {
        lastDiagTime = now;
        const decorCount = curLevel.tiles.filter((t) => Boolean(t.decor)).length;
        const mechanismCount =
          curLevel.pressureSwitches.length +
          curLevel.gates.length +
          curLevel.rotatingPlatforms.length +
          curLevel.elevationPlatforms.length +
          curLevel.lightEmitters.length +
          curLevel.lightPrisms.length +
          (curLevel.subCrystals?.length ?? 0) +
          2;
        bridge.onDiagnosticsSample({
          fps: Math.min(240, 1000 / Math.max(1, emaFrameMs)),
          avgFrameTimeMs: emaFrameMs,
          drawCalls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
          viewportWidth: curSize.width,
          viewportHeight: curSize.height,
          cameraPos: {
            x: orthoCam.position.x,
            y: orthoCam.position.y,
            z: orthoCam.position.z,
          },
          cameraTarget: {
            x: camTargetRef.current.x,
            y: camTargetRef.current.y,
            z: camTargetRef.current.z,
          },
          cameraZoom: effectiveZoom,
          tileCount: curLevel.tiles.length,
          decorCount,
          mechanismCount,
        });
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 0);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      applyDebugMaterialOverrides(false, false);
      normalMat?.dispose();
    };
  }, [camera, devBridgeRef, gl, isSoftwareGl, playerRef, puzzleStateRef, scene, scratchObj, spawnBurst]);

  useEffect(() => {
    const orthoCam = camera as THREE.OrthographicCamera;
    if (orthoCam.isOrthographicCamera) {
      const aspect = Math.max(0.35, size.width / Math.max(1, size.height));
      const portraitCompensation = aspect < 1 ? Math.min(1.5, 1 / Math.max(0.62, aspect)) : 1;
      const effZoom =
        levelRef.current.cameraZoom * (1 + zoomOffsetRef.current + wheelZoomDeltaRef.current);
      const baseFrustum = (14.8 * portraitCompensation) / Math.max(0.35, effZoom);
      const halfH = baseFrustum * 0.5;
      const halfW = halfH * aspect;
      orthoCam.left = -halfW;
      orthoCam.right = halfW;
      orthoCam.top = halfH;
      orthoCam.bottom = -halfH;
      orthoCam.updateProjectionMatrix();
    }
    gl.render(scene, camera);
  }, [camera, gl, scene, size.height, size.width]);

  const showDevOverlays =
    import.meta.env.DEV &&
    Boolean(devBridgeRef?.current?.isActive) &&
    LazyWorldInspectorOverlays !== null;

  return (
    <>
      <hemisphereLight
        args={[
          world.biome.ambientSky,
          world.biome.ambientGround,
          0.88 * visualBoost.ambientIntensityMult,
        ]}
      />
      <directionalLight
        ref={mainSunRef}
        position={[18, 28, 14]}
        intensity={2.05 * visualBoost.sunIntensityMult}
        color={world.biome.sunColor}
        castShadow={!isSoftwareGl}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={72}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-14, 12, -16]} intensity={0.45} color={world.biome.ambientSky} />

      <SkyBackdrop world={world} onRegisterFrame={registerEnvFrame} />
      <IslandTerrain tiles={level.tiles} palette={palette} worldTheme={world.theme} />
      <EnvironmentPropsLayer
        tiles={level.tiles}
        palette={palette}
        onRegisterFrame={registerEnvFrame}
      />
      {isHubMode ? (
        <>
          <ConvergenceScene
            palette={palette}
            hubTier={hubTier}
            restoredWorlds={restoredWorlds}
            highestUnlockedLevel={highestUnlockedLevel}
            highlightPos={hubHighlightPos}
            onRegisterFrame={registerFrame}
          />
          <NpcModels
            playerRef={playerRef}
            palette={palette}
            activeQuestNpcIds={activeQuestNpcIds ?? emptyNpcSet}
            talkedNpcIds={talkedNpcSet}
            onRegisterFrame={registerFrame}
          />
        </>
      ) : (
        <PuzzleMechanisms
          level={level}
          puzzleStateRef={puzzleStateRef}
          interactionTargetRef={interactionTargetRef}
          palette={palette}
          isSoftwareGl={isSoftwareGl}
          onRegisterFrame={registerFrame}
        />
      )}
      <HeroModel
        playerRef={playerRef}
        puzzleStateRef={puzzleStateRef}
        palette={palette}
        isSoftwareGl={isSoftwareGl}
        appearance={heroAppearance}
        onRegisterFrame={registerFrame}
      />

      <instancedMesh
        ref={burstMeshRef}
        args={[burstGeo, burstMat, BURST_POOL_SIZE]}
        frustumCulled={false}
      />

      {showDevOverlays && LazyWorldInspectorOverlays && devBridgeRef && (
        <Suspense fallback={null}>
          <LazyWorldInspectorOverlays
            level={level}
            puzzleStateRef={puzzleStateRef}
            devBridgeRef={devBridgeRef}
            onRegisterFrame={registerFrame}
            overlaySyncKey={`${level.id}_${devRevision}`}
          />
        </Suspense>
      )}
    </>
  );
};

export const GameScene: React.FC<GameSceneProps> = (props) => {
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const world = useMemo(() => getWorldForLevelId(props.level.id), [props.level.id]);

  return (
    <div
      data-testid="game-viewport"
      style={{ backgroundColor: world.biome.skyMid }}
      className="fixed inset-0 w-full h-full overflow-hidden"
    >
      <Canvas
        frameloop="never"
        orthographic
        camera={{
          position: [18, 15.5, 18],
          near: 0.1,
          far: 200,
          zoom: 1,
        }}
        dpr={isSoftwareGl ? 1 : [1, 2]}
        shadows={!isSoftwareGl}
        gl={{
          antialias: !isSoftwareGl,
          preserveDrawingBuffer: isSoftwareGl,
          powerPreference: 'high-performance',
        }}
      >
        <SceneContent {...props} isSoftwareGl={isSoftwareGl} />
      </Canvas>
    </div>
  );
};
