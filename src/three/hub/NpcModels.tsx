import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { NPCS, NpcDefinition } from '../../game/npcs';
import {
  ELEVATION_STEP,
  NpcId,
  PlayerRuntimeState,
  TILE_SIZE,
} from '../../game/types';
import { LumaMaterialPalette } from '../materials';

interface NpcModelsProps {
  playerRef: React.MutableRefObject<PlayerRuntimeState>;
  palette: LumaMaterialPalette;
  activeQuestNpcIds: Set<NpcId>;
  talkedNpcIds: Set<NpcId>;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}

const SingleNpcMesh: React.FC<{
  npc: NpcDefinition;
  playerRef: React.MutableRefObject<PlayerRuntimeState>;
  palette: LumaMaterialPalette;
  hasQuestCue: boolean;
  hasTalked: boolean;
  sharedGeos: {
    robeGeo: THREE.CylinderGeometry;
    headGeo: THREE.IcosahedronGeometry;
    collarGeo: THREE.TorusGeometry;
    brimGeo: THREE.CylinderGeometry;
    crownGeo: THREE.ConeGeometry;
    capGeo: THREE.BoxGeometry;
    haloGeo: THREE.TorusGeometry;
    gogglesGeo: THREE.BoxGeometry;
    propBoxGeo: THREE.BoxGeometry;
    propCylGeo: THREE.CylinderGeometry;
    propOrbGeo: THREE.OctahedronGeometry;
    markerGeo: THREE.OctahedronGeometry;
    shadowGeo: THREE.CircleGeometry;
  };
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({
  npc,
  playerRef,
  palette,
  hasQuestCue,
  hasTalked,
  sharedGeos,
  onRegisterFrame,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Mesh>(null);

  const mats = useMemo(() => {
    const robe = new THREE.MeshStandardMaterial({
      color: npc.visual.robeColor,
      roughness: 0.78,
      metalness: 0.05,
      flatShading: true,
    });
    const trim = new THREE.MeshStandardMaterial({
      color: npc.visual.trimColor,
      roughness: 0.6,
      metalness: 0.16,
      flatShading: true,
    });
    const skin = new THREE.MeshStandardMaterial({
      color: npc.visual.skinColor,
      roughness: 0.72,
      flatShading: true,
    });
    const shadow = new THREE.MeshBasicMaterial({
      map: palette.contactShadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    return { robe, trim, skin, shadow };
  }, [npc.visual.robeColor, npc.visual.skinColor, npc.visual.trimColor, palette.contactShadowTex]);

  useEffect(() => {
    return () => {
      mats.robe.dispose();
      mats.trim.dispose();
      mats.skin.dispose();
      mats.shadow.dispose();
    };
  }, [mats]);

  const wx = npc.hubX * TILE_SIZE;
  const wy = npc.elevation * ELEVATION_STEP;
  const wz = npc.hubZ * TILE_SIZE;

  useEffect(() => {
    return onRegisterFrame((dt, elapsed) => {
      const root = rootRef.current;
      const body = bodyRef.current;
      if (!root || !body) return;

      const phase = npc.hubX * 0.7 + npc.hubZ * 1.1;
      body.position.y = Math.sin(elapsed * 2.1 + phase) * 0.025;

      // Turn gently toward player when Wayfinder approaches within 4.8 units
      const dx = playerRef.current.x - wx;
      const dz = playerRef.current.z - wz;
      const dist = Math.hypot(dx, dz);
      const targetYaw = dist < 4.8 ? Math.atan2(dx, dz) : npc.facingAngle;

      let diff = targetYaw - root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      root.rotation.y += diff * (1 - Math.exp(-7 * dt));

      if (markerRef.current) {
        markerRef.current.position.y = 1.62 + Math.sin(elapsed * 3.1 + phase) * 0.08;
        markerRef.current.rotation.y = elapsed * 1.8;
      }
    });
  }, [npc.facingAngle, npc.hubX, npc.hubZ, onRegisterFrame, playerRef, wx, wz]);

  return (
    <group
      ref={rootRef}
      name={`NPC_${npc.id}`}
      position={[wx, wy, wz]}
      rotation={[0, npc.facingAngle, 0]}
    >
      <mesh
        geometry={sharedGeos.shadowGeo}
        material={mats.shadow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      />

      <group ref={bodyRef} scale={npc.visual.scale}>
        {/* Torso / Robe */}
        <mesh
          geometry={sharedGeos.robeGeo}
          material={mats.robe}
          position={[0, 0.42, 0]}
          castShadow
          receiveShadow
        />
        {/* Collar */}
        <mesh
          geometry={sharedGeos.collarGeo}
          material={mats.trim}
          position={[0, 0.8, 0.01]}
          rotation={[Math.PI / 2 - 0.12, 0, 0]}
        />
        {/* Head */}
        <mesh
          geometry={sharedGeos.headGeo}
          material={mats.skin}
          position={[0, 0.96, 0.02]}
          castShadow
        />

        {/* Distinct Headgear Silhouette */}
        {npc.visual.hatStyle === 'scholar_cap' && (
          <mesh
            geometry={sharedGeos.capGeo}
            material={mats.robe}
            position={[0, 1.12, 0.01]}
            rotation={[0, Math.PI / 4, 0]}
            castShadow
          />
        )}
        {npc.visual.hatStyle === 'brim' && (
          <group position={[0, 1.08, 0.02]}>
            <mesh geometry={sharedGeos.brimGeo} material={mats.robe} castShadow />
            <mesh geometry={sharedGeos.crownGeo} material={mats.trim} position={[0, 0.11, 0]} scale={[0.85, 0.7, 0.85]} />
          </group>
        )}
        {npc.visual.hatStyle === 'leaf_crown' && (
          <mesh
            geometry={sharedGeos.haloGeo}
            material={mats.trim}
            position={[0, 1.08, 0.02]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}
        {npc.visual.hatStyle === 'sailor_band' && (
          <mesh
            geometry={sharedGeos.haloGeo}
            material={mats.trim}
            position={[0, 1.02, 0.02]}
            rotation={[Math.PI / 2 + 0.12, 0, 0]}
          />
        )}
        {npc.visual.hatStyle === 'forge_goggles' && (
          <mesh
            geometry={sharedGeos.gogglesGeo}
            material={palette.brassAccent}
            position={[0, 1.05, 0.12]}
          />
        )}
        {npc.visual.hatStyle === 'astro_hat' && (
          <group position={[0, 1.1, 0.01]}>
            <mesh geometry={sharedGeos.brimGeo} material={mats.robe} scale={0.9} />
            <mesh geometry={sharedGeos.crownGeo} material={mats.robe} position={[0, 0.18, 0]} />
          </group>
        )}
        {npc.visual.hatStyle === 'hood' && (
          <mesh
            geometry={sharedGeos.crownGeo}
            material={mats.robe}
            position={[0, 1.05, -0.02]}
            scale={[1.15, 0.85, 1.15]}
          />
        )}

        {/* Distinct Handheld / Back Accessory */}
        {npc.visual.accessory === 'scroll' && (
          <mesh
            geometry={sharedGeos.propCylGeo}
            material={palette.cloakTrim}
            position={[0.25, 0.62, 0.14]}
            rotation={[0.4, 0, -0.3]}
          />
        )}
        {npc.visual.accessory === 'pack' && (
          <mesh
            geometry={sharedGeos.propBoxGeo}
            material={palette.woodWarm}
            position={[0, 0.56, -0.22]}
          />
        )}
        {npc.visual.accessory === 'map_tube' && (
          <mesh
            geometry={sharedGeos.propCylGeo}
            material={palette.brassAccent}
            position={[0.18, 0.58, -0.18]}
            rotation={[0.2, 0, 0.55]}
          />
        )}
        {npc.visual.accessory === 'seed_staff' && (
          <group position={[0.28, 0.58, 0.12]}>
            <mesh geometry={sharedGeos.propCylGeo} material={palette.woodWarm} scale={[0.7, 1.9, 0.7]} />
            <mesh geometry={sharedGeos.propOrbGeo} material={palette.foliageLight} position={[0, 0.48, 0]} />
          </group>
        )}
        {npc.visual.accessory === 'tide_orb' && (
          <mesh
            geometry={sharedGeos.propOrbGeo}
            material={palette.crystalActive}
            position={[0.24, 0.64, 0.16]}
            scale={1.2}
          />
        )}
        {npc.visual.accessory === 'hammer' && (
          <group position={[0.29, 0.54, 0.14]} rotation={[0.4, 0, -0.2]}>
            <mesh geometry={sharedGeos.propCylGeo} material={palette.woodWarm} scale={[0.7, 1.2, 0.7]} />
            <mesh geometry={sharedGeos.propBoxGeo} material={palette.bronzeDark} position={[0, 0.25, 0]} scale={[1.1, 0.65, 0.7]} />
          </group>
        )}
        {npc.visual.accessory === 'spyglass' && (
          <mesh
            geometry={sharedGeos.propCylGeo}
            material={palette.brassAccent}
            position={[0.22, 0.76, 0.16]}
            rotation={[1.1, 0, -0.2]}
            scale={[0.85, 0.9, 0.85]}
          />
        )}
        {npc.visual.accessory === 'echo_prism' && (
          <mesh
            geometry={sharedGeos.propOrbGeo}
            material={palette.echoMat}
            position={[0.24, 0.68, 0.14]}
            scale={1.25}
          />
        )}
        {npc.visual.accessory === 'shard_bag' && (
          <mesh
            geometry={sharedGeos.propOrbGeo}
            material={palette.lanternGlow}
            position={[-0.22, 0.42, 0.12]}
            scale={1.15}
          />
        )}
        {npc.visual.accessory === 'lute' && (
          <group position={[-0.18, 0.56, 0.18]} rotation={[0.15, 0.3, 0.5]}>
            <mesh geometry={sharedGeos.propBoxGeo} material={palette.woodWarm} scale={[0.85, 1.05, 0.4]} />
            <mesh geometry={sharedGeos.propCylGeo} material={palette.brassAccent} position={[0, 0.36, 0]} scale={[0.35, 0.8, 0.35]} />
          </group>
        )}
      </group>

      {/* Quest / Unmet Indicator Crystal above head */}
      {(hasQuestCue || !hasTalked) && (
        <mesh
          ref={markerRef}
          geometry={sharedGeos.markerGeo}
          material={hasQuestCue ? palette.lanternGlow : palette.crystalActive}
          position={[0, 1.62, 0]}
        />
      )}
    </group>
  );
};

export const NpcModels: React.FC<NpcModelsProps> = ({
  playerRef,
  palette,
  activeQuestNpcIds,
  talkedNpcIds,
  onRegisterFrame,
}) => {
  const sharedGeos = useMemo(() => {
    return {
      robeGeo: new THREE.CylinderGeometry(0.15, 0.27, 0.78, 8),
      headGeo: new THREE.IcosahedronGeometry(0.15, 1),
      collarGeo: new THREE.TorusGeometry(0.16, 0.04, 6, 10),
      brimGeo: new THREE.CylinderGeometry(0.28, 0.3, 0.03, 10),
      crownGeo: new THREE.ConeGeometry(0.15, 0.24, 6),
      capGeo: new THREE.BoxGeometry(0.28, 0.05, 0.28),
      haloGeo: new THREE.TorusGeometry(0.17, 0.024, 5, 12),
      gogglesGeo: new THREE.BoxGeometry(0.22, 0.07, 0.08),
      propBoxGeo: new THREE.BoxGeometry(0.22, 0.24, 0.14),
      propCylGeo: new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6),
      propOrbGeo: new THREE.OctahedronGeometry(0.085, 0),
      markerGeo: new THREE.OctahedronGeometry(0.11, 0),
      shadowGeo: new THREE.CircleGeometry(0.38, 16),
    };
  }, []);

  useEffect(() => {
    return () => Object.values(sharedGeos).forEach((g) => g.dispose());
  }, [sharedGeos]);

  return (
    <group name="HubNPCs">
      {NPCS.map((npc) => (
        <SingleNpcMesh
          key={npc.id}
          npc={npc}
          playerRef={playerRef}
          palette={palette}
          hasQuestCue={activeQuestNpcIds.has(npc.id)}
          hasTalked={talkedNpcIds.has(npc.id)}
          sharedGeos={sharedGeos}
          onRegisterFrame={onRegisterFrame}
        />
      ))}
    </group>
  );
};
