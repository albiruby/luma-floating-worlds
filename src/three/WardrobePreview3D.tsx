import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { resolveWayfinderAppearance } from '../game/cosmetics';
import { CharacterId, EquippedCosmetics, PlayerRuntimeState } from '../game/types';
import { HeroModel } from './assets/HeroModel';
import { detectSoftwareWebGL } from './GameScene';
import { createLumaPalette } from './materials';

interface WardrobePreview3DProps {
  previewEquipped: EquippedCosmetics;
  characterId?: CharacterId;
}

const PreviewContent: React.FC<{
  previewEquipped: EquippedCosmetics;
  characterId: CharacterId;
  isSoftwareGl: boolean;
  yawOffsetRef: React.MutableRefObject<number>;
  isDraggingRef: React.MutableRefObject<boolean>;
}> = ({ previewEquipped, characterId, isSoftwareGl, yawOffsetRef, isDraggingRef }) => {
  const { gl, scene, camera } = useThree();
  const palette = useMemo(() => createLumaPalette(), []);
  const appearance = useMemo(
    () => resolveWayfinderAppearance(previewEquipped, characterId),
    [characterId, previewEquipped]
  );

  const frameSubscribersRef = useRef<Set<(dt: number, elapsed: number) => void>>(
    new Set()
  );

  const playerRef = useRef<PlayerRuntimeState>({
    x: 0,
    y: 0.22,
    z: 0,
    vx: 0,
    vz: 0,
    facingAngle: 0.45,
    isMoving: false,
    walkCycle: 0,
    interactTimer: 0,
    lastStepTileKey: null,
  });

  const pedestalGeos = useMemo(() => {
    const stoneTop = new THREE.CylinderGeometry(0.92, 0.98, 0.22, 8);
    const stoneBase = new THREE.CylinderGeometry(0.74, 0.52, 0.34, 8);
    const mossCap = new THREE.CylinderGeometry(0.86, 0.92, 0.06, 8);
    return { stoneTop, stoneBase, mossCap };
  }, []);

  useEffect(() => {
    return () => {
      palette.dispose();
      pedestalGeos.stoneTop.dispose();
      pedestalGeos.stoneBase.dispose();
      pedestalGeos.mossCap.dispose();
    };
  }, [palette, pedestalGeos]);

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.02;

    if (isSoftwareGl) {
      return;
    }

    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      envTarget.dispose();
    };
  }, [gl, isSoftwareGl, scene]);

  const registerFrame = useMemo(() => {
    return (cb: (dt: number, elapsed: number) => void) => {
      frameSubscribersRef.current.add(cb);
      return () => {
        frameSubscribersRef.current.delete(cb);
      };
    };
  }, []);

  // Immediately repaint preview when selected hero or equipped cosmetics change
  useEffect(() => {
    camera.lookAt(0, 0.78, 0);
    frameSubscribersRef.current.forEach((cb) => cb(0.016, 0));
    gl.render(scene, camera);
  }, [appearance, camera, gl, scene]);

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
        const status = sync
          ? context.getSyncParameter(sync, context.SYNC_STATUS)
          : context.SIGNALED;
        if (status === context.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) context.deleteSync(sync);
          frameId = window.setTimeout(cb, 90);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (cancelled) return;
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      elapsed += dt;

      if (!isDraggingRef.current) {
        yawOffsetRef.current += dt * 0.45;
      }
      playerRef.current.facingAngle = 0.45 + yawOffsetRef.current;

      camera.lookAt(0, 0.78, 0);
      frameSubscribersRef.current.forEach((cb) => cb(dt, elapsed));
      gl.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 16);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
    };
  }, [camera, gl, isDraggingRef, isSoftwareGl, scene, yawOffsetRef]);

  return (
    <>
      <hemisphereLight args={[0xc9ebfa, 0x6b5c4d, 0.95]} />
      <directionalLight position={[3.5, 5.5, 4]} intensity={2.1} color={0xfff2d8} />
      <directionalLight position={[-3, 2.5, -2.5]} intensity={0.65} color={0x8ad6eb} />

      {/* Miniature Floating Stone Pedestal */}
      <group position={[0, 0, 0]}>
        <mesh
          geometry={pedestalGeos.mossCap}
          material={palette.grassTop}
          position={[0, 0.19, 0]}
        />
        <mesh
          geometry={pedestalGeos.stoneTop}
          material={palette.stonePaver}
          position={[0, 0.08, 0]}
        />
        <mesh
          geometry={pedestalGeos.stoneBase}
          material={palette.cliffRock}
          position={[0, -0.18, 0]}
        />
      </group>

      <HeroModel
        playerRef={playerRef}
        palette={palette}
        isSoftwareGl={isSoftwareGl}
        appearance={appearance}
        onRegisterFrame={registerFrame}
      />
    </>
  );
};

export const WardrobePreview3D: React.FC<WardrobePreview3DProps> = ({
  previewEquipped,
  characterId = 'wayfinder',
}) => {
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const yawOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);

  return (
    <div
      data-testid="wardrobe-preview-3d"
      onPointerDown={(e) => {
        isDraggingRef.current = true;
        lastXRef.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastXRef.current;
        lastXRef.current = e.clientX;
        yawOffsetRef.current += dx * 0.015;
      }}
      onPointerUp={(e) => {
        isDraggingRef.current = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => {
        isDraggingRef.current = false;
      }}
      className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border-2 border-[#1f2d38] bg-gradient-to-b from-[#9fd1e6] via-[#c7e3ec] to-[#87b5c8] cursor-grab active:cursor-grabbing touch-none"
    >
      <Canvas
        frameloop="never"
        dpr={isSoftwareGl ? 1 : [1, 2]}
        camera={{ position: [0.95, 1.48, 2.55], fov: 35, near: 0.1, far: 30 }}
        gl={{ antialias: !isSoftwareGl, alpha: true }}
      >
        <PreviewContent
          previewEquipped={previewEquipped}
          characterId={characterId}
          isSoftwareGl={isSoftwareGl}
          yawOffsetRef={yawOffsetRef}
          isDraggingRef={isDraggingRef}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 inset-x-0 text-center">
        <span className="text-[11px] font-semibold text-[#1b2b34]/80">
          Drag to rotate hero
        </span>
      </div>
    </div>
  );
};
