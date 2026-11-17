import React, { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ELEVATION_STEP,
  LevelDef,
  PuzzleRuntimeState,
  TILE_SIZE,
} from '../../game/types';
import { DevRuntimeBridge } from '../debugTypes';
import {
  buildLevelObjectInventory,
  buildPuzzleConnectionLinks,
  computeWorldTileWalkability,
} from '../worldInventory';

interface WorldInspectorOverlaysProps {
  level: LevelDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  devBridgeRef: React.MutableRefObject<DevRuntimeBridge | null>;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
  /** Bumped when overlays/selection/puzzle snapshot updates cleanly */
  overlaySyncKey: string;
}

function makeTextTexture(text: string, bg: string, fg: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(6, 6, 148, 52, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = fg;
    ctx.font = 'bold 24px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 80, 33);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const CoordLabelSprite: React.FC<{
  text: string;
  position: [number, number, number];
  bg: string;
  fg: string;
  scale?: [number, number, number];
}> = ({ text, position, bg, fg, scale = [1.05, 0.42, 1] }) => {
  const tex = useMemo(() => makeTextTexture(text, bg, fg), [text, bg, fg]);
  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <sprite position={position} scale={scale} renderOrder={25}>
      <spriteMaterial map={tex} transparent depthTest={false} />
    </sprite>
  );
};

export const WorldInspectorOverlays: React.FC<WorldInspectorOverlaysProps> = ({
  level,
  puzzleStateRef,
  devBridgeRef,
  onRegisterFrame,
}) => {
  const { gl, camera } = useThree();
  const pickGroupRef = useRef<THREE.Group>(null);
  const selectBoxRef = useRef<THREE.Mesh>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());

  const bridge = devBridgeRef.current;
  const overlays = bridge?.overlays;
  const selectedId = bridge?.selectedObjectId ?? null;
  const pickMode = Boolean(bridge?.pickObjectMode);
  const puzzleSnapshot = puzzleStateRef.current;

  // Shared geometries & materials with strict disposal
  const resources = useMemo(() => {
    const quadGeo = new THREE.PlaneGeometry(TILE_SIZE * 0.94, TILE_SIZE * 0.94);
    quadGeo.rotateX(-Math.PI / 2);

    const gridEdgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(TILE_SIZE * 0.96, 0.04, TILE_SIZE * 0.96));
    const voidBoxGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(TILE_SIZE * 0.92, 0.18, TILE_SIZE * 0.92));
    const collisionEdgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(TILE_SIZE * 0.84, 1.3, TILE_SIZE * 0.84));
    const interactRingGeo = new THREE.RingGeometry(0.55, 0.72, 16);
    interactRingGeo.rotateX(-Math.PI / 2);
    const markerSphereGeo = new THREE.OctahedronGeometry(0.22, 0);
    const boundsEdgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(TILE_SIZE * 0.88, 1.5, TILE_SIZE * 0.88));
    const pickBoxGeo = new THREE.BoxGeometry(TILE_SIZE * 0.9, 1.5, TILE_SIZE * 0.9);
    const selectGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(TILE_SIZE * 0.98, 1.8, TILE_SIZE * 0.98));

    const gridMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const voidMat = new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 });
    const collisionMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 });
    const boundsMat = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.75 });
    const selectMat = new THREE.LineBasicMaterial({ color: 0xfacc15 });

    const walkableMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.34,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const blockedMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.42,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const conditionalMat = new THREE.MeshBasicMaterial({
      color: 0xeab308,
      transparent: true,
      opacity: 0.38,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const interactMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const spawnMarkerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const crystalMarkerMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const portalMarkerMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const pickProxyMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const selectHighlightFill = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });

    return {
      quadGeo,
      gridEdgesGeo,
      voidBoxGeo,
      collisionEdgesGeo,
      interactRingGeo,
      markerSphereGeo,
      boundsEdgesGeo,
      pickBoxGeo,
      selectGeo,
      gridMat,
      voidMat,
      collisionMat,
      boundsMat,
      selectMat,
      walkableMat,
      blockedMat,
      conditionalMat,
      interactMat,
      spawnMarkerMat,
      crystalMarkerMat,
      portalMarkerMat,
      pickProxyMat,
      selectHighlightFill,
    };
  }, []);

  useEffect(() => {
    return () => {
      resources.quadGeo.dispose();
      resources.gridEdgesGeo.dispose();
      resources.voidBoxGeo.dispose();
      resources.collisionEdgesGeo.dispose();
      resources.interactRingGeo.dispose();
      resources.markerSphereGeo.dispose();
      resources.boundsEdgesGeo.dispose();
      resources.pickBoxGeo.dispose();
      resources.selectGeo.dispose();
      resources.gridMat.dispose();
      resources.voidMat.dispose();
      resources.collisionMat.dispose();
      resources.boundsMat.dispose();
      resources.selectMat.dispose();
      resources.walkableMat.dispose();
      resources.blockedMat.dispose();
      resources.conditionalMat.dispose();
      resources.interactMat.dispose();
      resources.spawnMarkerMat.dispose();
      resources.crystalMarkerMat.dispose();
      resources.portalMarkerMat.dispose();
      resources.pickProxyMat.dispose();
      resources.selectHighlightFill.dispose();
    };
  }, [resources]);

  const walkabilityData = useMemo(
    () => computeWorldTileWalkability(level, puzzleSnapshot),
    [level, puzzleSnapshot]
  );

  const inventory = useMemo(
    () => buildLevelObjectInventory(level, puzzleSnapshot),
    [level, puzzleSnapshot]
  );

  const connectionLinks = useMemo(
    () => buildPuzzleConnectionLinks(level, puzzleSnapshot),
    [level, puzzleSnapshot]
  );

  const selectedObj = useMemo(
    () => inventory.find((item) => item.id === selectedId) ?? null,
    [inventory, selectedId]
  );

  // Subtle highlight bob for selected object
  useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (selectBoxRef.current) {
        selectBoxRef.current.rotation.y = Math.sin(elapsed * 2) * 0.04;
      }
    });
  }, [onRegisterFrame]);

  // 3D Raycast click-to-pick handler (only active in pickObjectMode)
  useEffect(() => {
    if (!pickMode) return;
    const dom = gl.domElement;
    const handlePointerDown = (e: PointerEvent) => {
      if (!pickGroupRef.current || !devBridgeRef.current?.pickObjectMode) return;
      const rect = dom.getBoundingClientRect();
      ndcRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndcRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(ndcRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(pickGroupRef.current.children, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData?.inspectableId as string | undefined;
        if (hitId) {
          devBridgeRef.current?.onSelectObject?.(hitId);
        }
      }
    };
    dom.addEventListener('pointerdown', handlePointerDown);
    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [camera, devBridgeRef, gl.domElement, pickMode]);

  // Dynamic line geometry for Light Paths & Puzzle Connections
  const lightPathGeo = useMemo(() => {
    if (!overlays?.lightPaths || puzzleSnapshot.lightSegments.length === 0) return null;
    const pts: number[] = [];
    for (const seg of puzzleSnapshot.lightSegments) {
      const y = seg.elevation * ELEVATION_STEP + 1.05;
      pts.push(seg.fromX * TILE_SIZE, y, seg.fromZ * TILE_SIZE);
      pts.push(seg.toX * TILE_SIZE, y, seg.toZ * TILE_SIZE);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, [overlays?.lightPaths, puzzleSnapshot.lightSegments]);

  useEffect(() => () => lightPathGeo?.dispose(), [lightPathGeo]);

  const connectionsActiveGeo = useMemo(() => {
    if (!overlays?.puzzleConnections) return null;
    const pts: number[] = [];
    for (const link of connectionLinks) {
      if (!link.active) continue;
      pts.push(...link.fromPos, ...link.toPos);
    }
    if (pts.length === 0) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, [connectionLinks, overlays?.puzzleConnections]);

  const connectionsIdleGeo = useMemo(() => {
    if (!overlays?.puzzleConnections) return null;
    const pts: number[] = [];
    for (const link of connectionLinks) {
      if (link.active) continue;
      pts.push(...link.fromPos, ...link.toPos);
    }
    if (pts.length === 0) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, [connectionLinks, overlays?.puzzleConnections]);

  useEffect(() => () => connectionsActiveGeo?.dispose(), [connectionsActiveGeo]);
  useEffect(() => () => connectionsIdleGeo?.dispose(), [connectionsIdleGeo]);

  if (!bridge?.isActive || !overlays) return null;

  return (
    <group name="DevWorldOverlays">
      {/* Tile Grid Overlay */}
      {overlays.tileGrid &&
        walkabilityData.tiles.map((t) => (
          <lineSegments
            key={`grid_${t.gx}_${t.gz}`}
            geometry={resources.gridEdgesGeo}
            material={resources.gridMat}
            position={[t.gx * TILE_SIZE, t.elevation * ELEVATION_STEP + 0.03, t.gz * TILE_SIZE]}
          />
        ))}

      {/* Walkability Heat Overlay */}
      {overlays.walkability &&
        walkabilityData.tiles.map((t) => (
          <mesh
            key={`walk_${t.gx}_${t.gz}`}
            geometry={resources.quadGeo}
            material={
              t.kind === 'walkable'
                ? resources.walkableMat
                : t.kind === 'blocked'
                  ? resources.blockedMat
                  : resources.conditionalMat
            }
            position={[t.gx * TILE_SIZE, t.elevation * ELEVATION_STEP + 0.04, t.gz * TILE_SIZE]}
            renderOrder={10}
          />
        ))}

      {/* Void Boundary Cells */}
      {overlays.voidBounds &&
        walkabilityData.voidBorders.map((vb) => (
          <lineSegments
            key={`void_${vb.gx}_${vb.gz}`}
            geometry={resources.voidBoxGeo}
            material={resources.voidMat}
            position={[vb.gx * TILE_SIZE, vb.elevation * ELEVATION_STEP + 0.05, vb.gz * TILE_SIZE]}
          />
        ))}

      {/* Collision Wireframe Cages */}
      {overlays.collision &&
        inventory
          .filter((obj) => obj.collisionStatus === 'blocking')
          .map((obj) => (
            <lineSegments
              key={`col_${obj.id}`}
              geometry={resources.collisionEdgesGeo}
              material={resources.collisionMat}
              position={[obj.worldX, obj.worldY + 0.65, obj.worldZ]}
            />
          ))}

      {/* Interactable Rings */}
      {overlays.interactables &&
        inventory
          .filter((obj) => obj.interactive)
          .map((obj) => (
            <mesh
              key={`int_${obj.id}`}
              geometry={resources.interactRingGeo}
              material={resources.interactMat}
              position={[obj.worldX, obj.worldY + 0.08, obj.worldZ]}
              renderOrder={14}
            />
          ))}

      {/* Object Bounding Wireframes */}
      {overlays.objectBounds &&
        inventory.map((obj) => (
          <lineSegments
            key={`bnd_${obj.id}`}
            geometry={resources.boundsEdgesGeo}
            material={resources.boundsMat}
            position={[obj.worldX, obj.worldY + 0.75, obj.worldZ]}
          />
        ))}

      {/* Spawn, Crystal, Portal Markers */}
      {overlays.spawnAndObjectives && (
        <>
          <mesh
            geometry={resources.markerSphereGeo}
            material={resources.spawnMarkerMat}
            position={[level.spawn.x * TILE_SIZE, 1.5, level.spawn.z * TILE_SIZE]}
          />
          <mesh
            geometry={resources.markerSphereGeo}
            material={resources.crystalMarkerMat}
            position={[
              level.crystal.x * TILE_SIZE,
              level.crystal.elevation * ELEVATION_STEP + 2.2,
              level.crystal.z * TILE_SIZE,
            ]}
          />
          <mesh
            geometry={resources.markerSphereGeo}
            material={resources.portalMarkerMat}
            position={[
              level.portal.x * TILE_SIZE,
              level.portal.elevation * ELEVATION_STEP + 2.5,
              level.portal.z * TILE_SIZE,
            ]}
          />
        </>
      )}

      {/* Light Paths Debug Trajectory */}
      {lightPathGeo && (
        <lineSegments geometry={lightPathGeo} renderOrder={18}>
          <lineBasicMaterial color="#fde047" />
        </lineSegments>
      )}

      {/* Puzzle Connection Vectors */}
      {connectionsActiveGeo && (
        <lineSegments geometry={connectionsActiveGeo} renderOrder={17}>
          <lineBasicMaterial color="#34d399" />
        </lineSegments>
      )}
      {connectionsIdleGeo && (
        <lineSegments geometry={connectionsIdleGeo} renderOrder={17}>
          <lineBasicMaterial color="#f59e0b" />
        </lineSegments>
      )}

      {/* Coordinate Sprites */}
      {overlays.coordinates &&
        walkabilityData.tiles.map((t) => (
          <CoordLabelSprite
            key={`coord_${t.gx}_${t.gz}`}
            text={`${t.gx},${t.gz}`}
            position={[t.gx * TILE_SIZE, t.elevation * ELEVATION_STEP + 0.25, t.gz * TILE_SIZE]}
            bg="rgba(13, 21, 28, 0.84)"
            fg="#93c5fd"
          />
        ))}

      {/* Elevation Sprites */}
      {overlays.elevation &&
        walkabilityData.tiles.map((t) => (
          <CoordLabelSprite
            key={`elev_${t.gx}_${t.gz}`}
            text={`E${t.elevation}`}
            position={[
              t.gx * TILE_SIZE,
              t.elevation * ELEVATION_STEP + (overlays.coordinates ? 0.65 : 0.25),
              t.gz * TILE_SIZE,
            ]}
            bg="rgba(22, 34, 46, 0.86)"
            fg={t.elevation > 0 ? '#fde68a' : '#a7f3d0'}
            scale={[0.8, 0.36, 1]}
          />
        ))}

      {/* Selected Object Wireframe Highlight */}
      {selectedObj && (
        <group position={[selectedObj.worldX, selectedObj.worldY + 0.9, selectedObj.worldZ]}>
          <mesh
            ref={selectBoxRef}
            geometry={resources.pickBoxGeo}
            material={resources.selectHighlightFill}
          />
          <lineSegments geometry={resources.selectGeo} material={resources.selectMat} />
        </group>
      )}

      {/* Invisible Raycast Pick Colliders */}
      {pickMode && (
        <group ref={pickGroupRef}>
          {inventory.map((obj) => (
            <mesh
              key={`pick_${obj.id}`}
              geometry={resources.pickBoxGeo}
              material={resources.pickProxyMat}
              position={[obj.worldX, obj.worldY + 0.75, obj.worldZ]}
              userData={{ inspectableId: obj.id }}
            />
          ))}
        </group>
      )}
    </group>
  );
};
