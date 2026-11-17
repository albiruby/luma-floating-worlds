import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  HUB_AREAS,
  HUB_WORLD_PORTALS,
} from '../../game/hubLayout';
import {
  ELEVATION_STEP,
  HubRestorationTier,
  TILE_SIZE,
  WorldId,
} from '../../game/types';
import { getWorldById } from '../../game/worlds';
import { LumaMaterialPalette } from '../materials';

interface ConvergenceSceneProps {
  palette: LumaMaterialPalette;
  hubTier: HubRestorationTier;
  restoredWorlds: WorldId[];
  highestUnlockedLevel: number;
  highlightPos?: { x: number; z: number } | null;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}

export const ConvergenceScene: React.FC<ConvergenceSceneProps> = ({
  palette,
  hubTier,
  restoredWorlds,
  highestUnlockedLevel,
  highlightPos,
  onRegisterFrame,
}) => {
  const centralCrystalRef = useRef<THREE.Mesh>(null);
  const ringInnerRef = useRef<THREE.Mesh>(null);
  const ringOuterRef = useRef<THREE.Mesh>(null);
  const portalCoreRefs = useRef<Record<string, THREE.Mesh | null>>({});
  const highlightRingRef = useRef<THREE.Mesh>(null);

  const restoredSet = useMemo(() => new Set<WorldId>(restoredWorlds), [restoredWorlds]);

  const geos = useMemo(() => {
    const pedestalGeo = new THREE.CylinderGeometry(1.15, 1.38, 0.42, 8);
    const centralCrystalGeo = new THREE.OctahedronGeometry(0.68, 0);
    const ringInnerGeo = new THREE.TorusGeometry(1.15, 0.05, 6, 20);
    const ringOuterGeo = new THREE.TorusGeometry(1.6, 0.045, 6, 24);
    const pillarGeo = new THREE.BoxGeometry(0.24, 1.85, 0.24);
    const lintelGeo = new THREE.BoxGeometry(1.36, 0.22, 0.34);
    const portalVeilGeo = new THREE.CylinderGeometry(0.46, 0.46, 1.48, 8);
    const beaconOrbGeo = new THREE.OctahedronGeometry(0.16, 0);
    const plaqueGeo = new THREE.BoxGeometry(0.32, 0.42, 0.14);
    const tableTopGeo = new THREE.BoxGeometry(1.15, 0.12, 0.85);
    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.72, 6);
    const boardFrameGeo = new THREE.BoxGeometry(1.3, 0.95, 0.14);
    const paperGeo = new THREE.BoxGeometry(0.28, 0.34, 0.04);
    const mirrorFrameGeo = new THREE.TorusGeometry(0.54, 0.06, 6, 14);
    const highlightGeo = new THREE.RingGeometry(0.75, 0.95, 24);
    const bridgeArcGeo = new THREE.TorusGeometry(2.1, 0.055, 6, 18, Math.PI);
    return {
      pedestalGeo,
      centralCrystalGeo,
      ringInnerGeo,
      ringOuterGeo,
      pillarGeo,
      lintelGeo,
      portalVeilGeo,
      beaconOrbGeo,
      plaqueGeo,
      tableTopGeo,
      postGeo,
      boardFrameGeo,
      paperGeo,
      mirrorFrameGeo,
      highlightGeo,
      bridgeArcGeo,
    };
  }, []);

  const mats = useMemo(() => {
    const centralMat = new THREE.MeshStandardMaterial({
      color: 0x3bf2e0,
      emissive: 0x22d1be,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.1,
      flatShading: true,
    });
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0xffd76b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });
    const mirrorGlass = new THREE.MeshStandardMaterial({
      color: 0xaef7f2,
      emissive: 0x268c85,
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.4,
    });
    const portalMats: Record<string, THREE.MeshStandardMaterial> = {};
    for (const p of HUB_WORLD_PORTALS) {
      const w = getWorldById(p.worldId);
      portalMats[p.worldId] = new THREE.MeshStandardMaterial({
        color: w.biome.accentEmissive,
        emissive: w.biome.accentEmissive,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.78,
        roughness: 0.2,
      });
    }
    return { centralMat, highlightMat, mirrorGlass, portalMats };
  }, []);

  useEffect(() => {
    const isRestored = hubTier === 'restored';
    const isAwakening = hubTier === 'awakening';
    mats.centralMat.color.setHex(isRestored ? 0xffe680 : isAwakening ? 0x45f7e3 : 0x6ba2ad);
    mats.centralMat.emissive.setHex(isRestored ? 0xffb838 : isAwakening ? 0x1fd1bf : 0x1d4b57);
    mats.centralMat.emissiveIntensity = isRestored ? 1.55 : isAwakening ? 1.0 : 0.45;

    for (const p of HUB_WORLD_PORTALS) {
      const m = mats.portalMats[p.worldId];
      if (!m) continue;
      const w = getWorldById(p.worldId);
      const unlocked = highestUnlockedLevel >= w.levelRange[0];
      const worldDone = restoredSet.has(p.worldId);
      if (!unlocked) {
        m.color.setHex(0x5b6a73);
        m.emissive.setHex(0x1f2b33);
        m.emissiveIntensity = 0.2;
        m.opacity = 0.48;
      } else if (worldDone) {
        m.color.setHex(w.biome.accentEmissive);
        m.emissive.setHex(w.biome.accentEmissive);
        m.emissiveIntensity = 1.45;
        m.opacity = 0.92;
      } else {
        m.color.setHex(w.biome.accentEmissive);
        m.emissive.setHex(w.biome.accentEmissive);
        m.emissiveIntensity = 0.72;
        m.opacity = 0.78;
      }
    }
  }, [highestUnlockedLevel, hubTier, mats, restoredSet]);

  useEffect(() => {
    return () => {
      Object.values(geos).forEach((g) => g.dispose());
      mats.centralMat.dispose();
      mats.highlightMat.dispose();
      mats.mirrorGlass.dispose();
      Object.values(mats.portalMats).forEach((m) => m.dispose());
    };
  }, [geos, mats]);

  useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (centralCrystalRef.current) {
        centralCrystalRef.current.rotation.y = elapsed * (hubTier === 'restored' ? 0.95 : 0.45);
        centralCrystalRef.current.position.y = 1.45 + Math.sin(elapsed * 2.0) * 0.1;
      }
      if (ringInnerRef.current) {
        ringInnerRef.current.rotation.z = elapsed * 0.55;
        ringInnerRef.current.rotation.x = Math.sin(elapsed * 0.7) * 0.28 + Math.PI / 2;
      }
      if (ringOuterRef.current) {
        ringOuterRef.current.rotation.z = -elapsed * 0.35;
      }
      for (const p of HUB_WORLD_PORTALS) {
        const core = portalCoreRefs.current[p.worldId];
        if (core) {
          core.rotation.y = elapsed * 0.9 + p.order;
        }
      }
      if (highlightRingRef.current) {
        highlightRingRef.current.rotation.z = elapsed * 1.4;
        const s = 1 + Math.sin(elapsed * 4.0) * 0.08;
        highlightRingRef.current.scale.set(s, s, 1);
      }
    });
  }, [hubTier, onRegisterFrame]);

  const centralY = 1 * ELEVATION_STEP;

  return (
    <group name="ConvergenceHubProps">
      {/* 1. Central Sanctuary Giant Crystal & Restoration Rings */}
      <group position={[0, centralY, 0]}>
        <mesh geometry={geos.pedestalGeo} material={palette.sandstoneRuin} position={[0, 0.21, 0]} castShadow receiveShadow />
        <mesh
          ref={centralCrystalRef}
          geometry={geos.centralCrystalGeo}
          material={mats.centralMat}
          position={[0, 1.45, 0]}
          castShadow
        />
        <mesh
          ref={ringInnerRef}
          geometry={geos.ringInnerGeo}
          material={palette.brassAccent}
          position={[0, 1.45, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {hubTier !== 'dormant' && (
          <mesh
            ref={ringOuterRef}
            geometry={geos.ringOuterGeo}
            material={hubTier === 'restored' ? palette.lanternGlow : palette.crystalActive}
            position={[0, 1.45, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}
        {/* Awakening / Restored Light Arch Bridges framing Central Sanctuary */}
        {hubTier !== 'dormant' && (
          <>
            <mesh
              geometry={geos.bridgeArcGeo}
              material={hubTier === 'restored' ? palette.lanternGlow : palette.crystalActive}
              position={[0, 0.2, 0]}
            />
            <mesh
              geometry={geos.bridgeArcGeo}
              material={hubTier === 'restored' ? palette.lanternGlow : palette.crystalActive}
              position={[0, 0.2, 0]}
              rotation={[0, Math.PI / 2, 0]}
            />
          </>
        )}
      </group>

      {/* 2. Six Distinct World Portals along Northern Horizon Arc */}
      {HUB_WORLD_PORTALS.map((portal) => {
        const w = getWorldById(portal.worldId);
        const worldDone = restoredSet.has(portal.worldId);
        const wx = portal.x * TILE_SIZE;
        const wy = portal.elevation * ELEVATION_STEP;
        const wz = portal.z * TILE_SIZE;

        return (
          <group key={portal.worldId} position={[wx, wy, wz]} name={`HubPortal_${portal.worldId}`}>
            <mesh
              geometry={geos.pillarGeo}
              material={w.theme === 'emberfall' ? palette.basaltTop : palette.sandstoneRuin}
              position={[-0.64, 0.92, 0]}
              castShadow
            />
            <mesh
              geometry={geos.pillarGeo}
              material={w.theme === 'emberfall' ? palette.basaltTop : palette.sandstoneRuin}
              position={[0.64, 0.92, 0]}
              castShadow
            />
            <mesh
              geometry={geos.lintelGeo}
              material={worldDone ? palette.brassAccent : palette.stonePaver}
              position={[0, 1.9, 0]}
              castShadow
            />
            <mesh
              ref={(el) => {
                portalCoreRefs.current[portal.worldId] = el;
              }}
              geometry={geos.portalVeilGeo}
              material={mats.portalMats[portal.worldId]}
              position={[0, 0.96, 0]}
            />
            {/* Top Crest Gem indicating World Restoration */}
            <mesh
              geometry={geos.beaconOrbGeo}
              material={worldDone ? palette.lanternGlow : palette.crystalDormant}
              position={[0, 2.25, 0]}
            />
          </group>
        );
      })}

      {/* 3. Interactive Sanctuary Stations */}
      {/* Hero Sanctum Brazier (-6, 0) */}
      <group position={[-6 * TILE_SIZE, ELEVATION_STEP, 0]}>
        <mesh geometry={geos.pedestalGeo} material={palette.stonePaver} position={[0, 0.16, 0]} scale={[0.75, 0.8, 0.75]} castShadow />
        <mesh geometry={geos.beaconOrbGeo} material={palette.lanternGlow} position={[0, 0.88, 0]} scale={1.8} />
        <mesh geometry={geos.ringInnerGeo} material={palette.brassAccent} position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.55} />
      </group>

      {/* Wardrobe Station Mirror & Canopy (-5, 5) */}
      <group position={[-5 * TILE_SIZE, 0, 5 * TILE_SIZE]}>
        <mesh geometry={geos.tableTopGeo} material={palette.woodWarm} position={[0, 0.25, 0]} scale={[0.9, 0.5, 0.9]} castShadow />
        <mesh geometry={geos.mirrorFrameGeo} material={palette.brassAccent} position={[0, 1.05, -0.25]} />
        <mesh geometry={geos.portalVeilGeo} material={mats.mirrorGlass} position={[0, 1.02, -0.25]} scale={[0.9, 0.65, 0.08]} />
      </group>

      {/* Echo Archive Lectern (-5, -5) */}
      <group position={[-5 * TILE_SIZE, ELEVATION_STEP, -5 * TILE_SIZE]}>
        <mesh geometry={geos.postGeo} material={palette.sandstoneRuin} position={[0, 0.36, 0]} castShadow />
        <mesh geometry={geos.boardFrameGeo} material={palette.woodWarm} position={[0, 0.78, 0]} rotation={[-Math.PI / 3, 0, 0]} scale={[0.6, 0.5, 0.8]} />
        <mesh geometry={geos.beaconOrbGeo} material={palette.echoMat} position={[0, 1.15, 0]} scale={1.45} />
      </group>

      {/* Reward Gallery 6-World Plaque Overlook (5, -5) */}
      <group position={[5 * TILE_SIZE, ELEVATION_STEP, -5 * TILE_SIZE]}>
        <mesh geometry={geos.tableTopGeo} material={palette.sandstoneRuin} position={[0, 0.32, 0]} scale={[1.3, 1.4, 1.0]} castShadow />
        {HUB_WORLD_PORTALS.map((p, idx) => {
          const done = restoredSet.has(p.worldId);
          return (
            <mesh
              key={p.worldId}
              geometry={geos.plaqueGeo}
              material={done ? palette.lanternGlow : palette.cliffRock}
              position={[-0.48 + (idx % 3) * 0.48, 0.72, idx < 3 ? -0.18 : 0.18]}
            />
          );
        })}
      </group>

      {/* Quest Board (5, 4) */}
      <group position={[5 * TILE_SIZE, 0, 4 * TILE_SIZE]} rotation={[0, -Math.PI * 0.22, 0]}>
        <mesh geometry={geos.postGeo} material={palette.woodWarm} position={[-0.56, 0.48, 0]} scale={[1, 1.35, 1]} castShadow />
        <mesh geometry={geos.postGeo} material={palette.woodWarm} position={[0.56, 0.48, 0]} scale={[1, 1.35, 1]} castShadow />
        <mesh geometry={geos.boardFrameGeo} material={palette.woodWarm} position={[0, 0.95, 0]} castShadow />
        <mesh geometry={geos.paperGeo} material={palette.cloakTrim} position={[-0.32, 1.0, 0.08]} />
        <mesh geometry={geos.paperGeo} material={palette.cloakTrim} position={[0.04, 0.92, 0.08]} />
        <mesh geometry={geos.paperGeo} material={palette.lanternGlow} position={[0.36, 1.02, 0.08]} />
      </group>

      {/* Interactive World Map Table (3, 4) */}
      <group position={[3 * TILE_SIZE, 0, 4 * TILE_SIZE]}>
        <mesh geometry={geos.postGeo} material={palette.sandstoneRuin} position={[0, 0.32, 0]} castShadow />
        <mesh geometry={geos.tableTopGeo} material={palette.stonePaver} position={[0, 0.68, 0]} castShadow />
        <mesh geometry={geos.beaconOrbGeo} material={palette.crystalActive} position={[0, 0.92, 0]} scale={[1.8, 0.5, 1.8]} />
      </group>

      {/* Hidden Eastern Alcove Whispering Pedestal (9, -1) */}
      <group position={[9 * TILE_SIZE, 0, -1 * TILE_SIZE]}>
        <mesh geometry={geos.postGeo} material={palette.sandstoneRuin} position={[0, 0.36, 0]} castShadow />
        <mesh geometry={geos.beaconOrbGeo} material={palette.echoMat} position={[0, 0.95, 0]} scale={1.35} />
      </group>

      {/* Active Interaction Focus Ring */}
      {highlightPos && (
        <mesh
          ref={highlightRingRef}
          geometry={geos.highlightGeo}
          material={mats.highlightMat}
          position={[highlightPos.x, 0.14, highlightPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}

      {/* Subtle Hub Area Ground Anchor Labels/Markers handled via HUD prompt */}
      {HUB_AREAS.length === 0 && null}
    </group>
  );
};
