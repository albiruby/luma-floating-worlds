import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createInitialPlayerState, createInitialPuzzleState } from '../game/rules';
import {
  ELEVATION_STEP,
  LevelDef,
  PlayerRuntimeState,
  PuzzleRuntimeState,
  TILE_SIZE,
} from '../game/types';
import { ForgeSelectedObject, ForgeTool } from '../game/worldForge';
import { getWorldById } from '../game/worlds';
import { EnvironmentPropsLayer } from './assets/EnvironmentProps';
import { HeroModel } from './assets/HeroModel';
import { IslandTerrain } from './assets/IslandTerrain';
import { PuzzleMechanisms } from './assets/PuzzleMechanisms';
import { detectSoftwareWebGL } from './GameScene';
import { applyWorldBiomeToPalette, createLumaPalette } from './materials';
import { SkyBackdrop } from './SkyBackdrop';

interface WorldForgeCanvasProps {
  level: LevelDef;
  activeTool: ForgeTool;
  selectedObject: ForgeSelectedObject | null;
  onTileClick: (gx: number, gz: number) => void;
  onHoverCoordChange?: (coord: { x: number; z: number } | null) => void;
}

const ForgeViewportContent: React.FC<
  WorldForgeCanvasProps & { isSoftwareGl: boolean }
> = ({
  level,
  activeTool,
  selectedObject,
  onTileClick,
  onHoverCoordChange,
  isSoftwareGl,
}) => {
  const { gl, scene, camera, size } = useThree();
  const world = useMemo(() => getWorldById(level.worldId), [level.worldId]);
  const palette = useMemo(() => createLumaPalette(world), []);

  const puzzleStateRef = useRef<PuzzleRuntimeState>(createInitialPuzzleState(level, 'wayfinder'));
  const playerRef = useRef<PlayerRuntimeState>(createInitialPlayerState(level));
  const interactionTargetRef = useRef(null);

  useEffect(() => {
    puzzleStateRef.current = createInitialPuzzleState(level, 'wayfinder');
    playerRef.current = createInitialPlayerState(level);
  }, [level]);

  useEffect(() => {
    applyWorldBiomeToPalette(palette, world, false);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.setHex(world.biome.fogColor);
    }
  }, [palette, scene, world]);

  const frameSubscribersRef = useRef<Set<(dt: number, elapsed: number) => void>>(new Set());
  const registerFrame = useMemo(
    () => (cb: (dt: number, elapsed: number) => void) => {
      frameSubscribersRef.current.add(cb);
      return () => {
        frameSubscribersRef.current.delete(cb);
      };
    },
    []
  );

  // Subtle floor grid helper & cursor meshes
  const cursorGroupRef = useRef<THREE.Group>(null);
  const selectedRingRef = useRef<THREE.Mesh>(null);
  const hoverGridRef = useRef<{ x: number; z: number } | null>(null);
  const camTargetRef = useRef(
    new THREE.Vector3(level.cameraCenter.x * TILE_SIZE, 0.3, level.cameraCenter.z * TILE_SIZE)
  );
  const wheelZoomRef = useRef(0);
  const heldKeysRef = useRef<Set<string>>(new Set());
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const callbacksRef = useRef({ onTileClick, onHoverCoordChange });
  callbacksRef.current = { onTileClick, onHoverCoordChange };
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;
  const levelRef = useRef(level);
  levelRef.current = level;

  const cursorGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE * 0.96, 0.08, TILE_SIZE * 0.96), []);
  const cursorMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x24c9b8,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    []
  );
  const cursorEdgeGeo = useMemo(() => new THREE.EdgesGeometry(cursorGeo), [cursorGeo]);
  const cursorEdgeMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
    []
  );

  const selectRingGeo = useMemo(
    () => new THREE.RingGeometry(TILE_SIZE * 0.44, TILE_SIZE * 0.56, 24),
    []
  );
  const selectRingMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xebb652,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      }),
    []
  );

  const gridHelper = useMemo(() => {
    const gh = new THREE.GridHelper(24 * TILE_SIZE, 24, 0x3b5868, 0x243742);
    gh.position.y = -0.18;
    const mats = Array.isArray(gh.material) ? gh.material : [gh.material];
    mats.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.25;
    });
    return gh;
  }, []);

  useEffect(() => {
    return () => {
      palette.dispose();
      cursorGeo.dispose();
      cursorMat.dispose();
      cursorEdgeGeo.dispose();
      cursorEdgeMat.dispose();
      selectRingGeo.dispose();
      selectRingMat.dispose();
      gridHelper.geometry.dispose();
      const mats = Array.isArray(gridHelper.material)
        ? gridHelper.material
        : [gridHelper.material];
      mats.forEach((m) => m.dispose());
    };
  }, [
    cursorEdgeGeo,
    cursorEdgeMat,
    cursorGeo,
    cursorMat,
    gridHelper,
    palette,
    selectRingGeo,
    selectRingMat,
  ]);

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

    scene.fog = new THREE.Fog(world.biome.fogColor, 48, 105);

    return () => {
      scene.environment = null;
      envTarget.dispose();
    };
  }, [gl, scene, world.biome.fogColor]);

  // Keyboard pan & zoom + pointer raycasting onto horizontal grid plane
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    let isPainting = false;
    let isRightPanning = false;
    let lastPanX = 0;
    let lastPanY = 0;
    let lastPaintedKey = '';

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const raycastGrid = (clientX: number, clientY: number): { x: number; z: number } | null => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
      const gx = Math.round(hitPoint.x / TILE_SIZE);
      const gz = Math.round(hitPoint.z / TILE_SIZE);
      if (gx < -11 || gx > 11 || gz < -11 || gz > 11) return null;
      return { x: gx, z: gz };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isRightPanning) {
        const dx = e.clientX - lastPanX;
        const dy = e.clientY - lastPanY;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        // Screen-space pan mapped to isometric axes
        const panScale = 0.032;
        camTargetRef.current.x -= (dx - dy) * panScale;
        camTargetRef.current.z -= (-dx - dy) * panScale;
        return;
      }
      const coord = raycastGrid(e.clientX, e.clientY);
      hoverGridRef.current = coord;
      callbacksRef.current.onHoverCoordChange?.(coord);

      if (
        isPainting &&
        coord &&
        (activeToolRef.current === 'terrain_brush' || activeToolRef.current === 'erase')
      ) {
        const key = `${coord.x},${coord.z}`;
        if (key !== lastPaintedKey) {
          lastPaintedKey = key;
          callbacksRef.current.onTileClick(coord.x, coord.z);
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 2 || e.shiftKey) {
        isRightPanning = true;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        return;
      }
      if (e.button !== 0) return;
      const coord = raycastGrid(e.clientX, e.clientY);
      if (!coord) return;
      isPainting = true;
      lastPaintedKey = `${coord.x},${coord.z}`;
      callbacksRef.current.onTileClick(coord.x, coord.z);
    };

    const onPointerUp = () => {
      isPainting = false;
      isRightPanning = false;
      lastPaintedKey = '';
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelZoomRef.current = THREE.MathUtils.clamp(
        wheelZoomRef.current - e.deltaY * 0.0008,
        -0.35,
        0.55
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      heldKeysRef.current.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      heldKeysRef.current.delete(e.code);
    };

    const dom = gl.domElement;
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('contextmenu', onContextMenu);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('contextmenu', onContextMenu);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [camera, gl]);

  // Selection ring world coordinates
  const selectedWorldPos = useMemo(() => {
    if (!selectedObject) return null;
    const findElev = (gx: number, gz: number) =>
      level.tiles.find((t) => t.x === gx && t.z === gz)?.elevation ?? 0;

    let gx: number | null = null;
    let gz: number | null = null;
    if (selectedObject.kind === 'tile') {
      gx = selectedObject.x;
      gz = selectedObject.z;
    } else if (selectedObject.kind === 'spawn') {
      gx = level.spawn.x;
      gz = level.spawn.z;
    } else if (selectedObject.kind === 'crystal') {
      gx = level.crystal.x;
      gz = level.crystal.z;
    } else if (selectedObject.kind === 'portal') {
      gx = level.portal.x;
      gz = level.portal.z;
    } else if (selectedObject.kind === 'switch') {
      const o = level.pressureSwitches.find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    } else if (selectedObject.kind === 'echo_plate') {
      const o = (level.echoPlates ?? []).find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    } else if (selectedObject.kind === 'gate') {
      const o = level.gates.find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    } else if (selectedObject.kind === 'lift') {
      const o = level.elevationPlatforms.find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    } else if (selectedObject.kind === 'rotating') {
      const o = level.rotatingPlatforms.find((i) => i.id === selectedObject.id);
      if (o) { gx = o.pivotX; gz = o.pivotZ; }
    } else if (selectedObject.kind === 'emitter') {
      const o = level.lightEmitters.find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    } else if (selectedObject.kind === 'prism') {
      const o = level.lightPrisms.find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    } else if (selectedObject.kind === 'sub_crystal') {
      const o = (level.subCrystals ?? []).find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    } else if (selectedObject.kind === 'synergy_node') {
      const o = (level.synergyNodes ?? []).find((i) => i.id === selectedObject.id);
      if (o) { gx = o.x; gz = o.z; }
    }

    if (gx === null || gz === null) return null;
    const elev = findElev(gx, gz);
    return {
      x: gx * TILE_SIZE,
      y: elev * ELEVATION_STEP + 0.14,
      z: gz * TILE_SIZE,
    };
  }, [level, selectedObject]);

  // Render loop with Software GL afterDraw pacing
  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

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
          frameId = window.setTimeout(cb, 85);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (cancelled) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsed += dt;

      // Keyboard camera pan
      const held = heldKeysRef.current;
      let screenUp = 0;
      let screenRight = 0;
      if (held.has('KeyW') || held.has('ArrowUp')) screenUp += 1;
      if (held.has('KeyS') || held.has('ArrowDown')) screenUp -= 1;
      if (held.has('KeyD') || held.has('ArrowRight')) screenRight += 1;
      if (held.has('KeyA') || held.has('ArrowLeft')) screenRight -= 1;
      if (screenUp !== 0 || screenRight !== 0) {
        const panSpeed = 9 * dt;
        camTargetRef.current.x += (screenRight - screenUp) * panSpeed;
        camTargetRef.current.z += (-screenRight - screenUp) * panSpeed;
      }

      // Camera frustum
      const orthoCam = camera as THREE.OrthographicCamera;
      const curSize = sizeRef.current;
      if (orthoCam.isOrthographicCamera) {
        const aspect = Math.max(0.35, curSize.width / Math.max(1, curSize.height));
        const zoom = Math.max(0.45, levelRef.current.cameraZoom * (1 + wheelZoomRef.current));
        const baseFrustum = 16.5 / zoom;
        const halfH = baseFrustum * 0.5;
        const halfW = halfH * aspect;
        orthoCam.left = -halfW;
        orthoCam.right = halfW;
        orthoCam.top = halfH;
        orthoCam.bottom = -halfH;
        orthoCam.updateProjectionMatrix();
        orthoCam.position.set(
          camTargetRef.current.x + 18,
          camTargetRef.current.y + 15.5,
          camTargetRef.current.z + 18
        );
        orthoCam.lookAt(camTargetRef.current);
      }

      // Cursor visualization
      if (cursorGroupRef.current) {
        const hover = hoverGridRef.current;
        if (hover) {
          const tile = levelRef.current.tiles.find((t) => t.x === hover.x && t.z === hover.z);
          const elev = tile ? tile.elevation : 0;
          cursorGroupRef.current.visible = true;
          cursorGroupRef.current.position.set(
            hover.x * TILE_SIZE,
            elev * ELEVATION_STEP + 0.08,
            hover.z * TILE_SIZE
          );
          cursorMat.color.setHex(
            activeToolRef.current === 'erase' ? 0xf87171 : 0x24c9b8
          );
        } else {
          cursorGroupRef.current.visible = false;
        }
      }

      if (selectedRingRef.current) {
        selectedRingRef.current.rotation.z = elapsed * 1.4;
      }

      frameSubscribersRef.current.forEach((cb) => cb(dt, elapsed));
      gl.render(scene, camera);

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
    };
  }, [camera, cursorMat, gl, isSoftwareGl, scene]);

  return (
    <>
      <hemisphereLight args={[world.biome.ambientSky, world.biome.ambientGround, 0.92]} />
      <directionalLight
        position={[18, 28, 14]}
        intensity={2.0}
        color={world.biome.sunColor}
        castShadow={!isSoftwareGl}
      />
      <directionalLight position={[-14, 12, -16]} intensity={0.45} color={world.biome.ambientSky} />

      <SkyBackdrop world={world} onRegisterFrame={registerFrame} />
      <primitive object={gridHelper} />
      <IslandTerrain tiles={level.tiles} palette={palette} worldTheme={world.theme} />
      <EnvironmentPropsLayer tiles={level.tiles} palette={palette} onRegisterFrame={registerFrame} />
      <PuzzleMechanisms
        level={level}
        puzzleStateRef={puzzleStateRef}
        interactionTargetRef={interactionTargetRef}
        palette={palette}
        isSoftwareGl={isSoftwareGl}
        onRegisterFrame={registerFrame}
      />
      <HeroModel
        playerRef={playerRef}
        palette={palette}
        isSoftwareGl={isSoftwareGl}
        onRegisterFrame={registerFrame}
      />

      {/* Interactive Placement Cursor */}
      <group ref={cursorGroupRef} visible={false}>
        <mesh geometry={cursorGeo} material={cursorMat} />
        <lineSegments geometry={cursorEdgeGeo} material={cursorEdgeMat} />
      </group>

      {/* Selected Object Highlight Ring */}
      {selectedWorldPos && (
        <mesh
          ref={selectedRingRef}
          position={[selectedWorldPos.x, selectedWorldPos.y, selectedWorldPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={selectRingGeo}
          material={selectRingMat}
        />
      )}
    </>
  );
};

export const WorldForgeCanvas: React.FC<WorldForgeCanvasProps> = (props) => {
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const world = useMemo(() => getWorldById(props.level.worldId), [props.level.worldId]);
  const [hovered, setHovered] = useState<{ x: number; z: number } | null>(null);

  return (
    <div
      data-testid="world-forge-canvas-container"
      style={{ backgroundColor: world.biome.skyMid }}
      className="relative w-full h-full overflow-hidden"
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
        <ForgeViewportContent
          {...props}
          isSoftwareGl={isSoftwareGl}
          onHoverCoordChange={(c) => {
            setHovered(c);
            props.onHoverCoordChange?.(c);
          }}
        />
      </Canvas>

      {/* Live Grid Coordinate Readout */}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-[#112028]/90 border border-[#d8a13f]/65 px-2.5 py-1 text-[11px] font-bold text-[#f6eedb] tabular-nums">
        {hovered ? `Tile (${hovered.x}, ${hovered.z})` : 'Hover grid to build'} · Click Paint · WASD/Right-Drag Pan · Wheel Zoom
      </div>
    </div>
  );
};
