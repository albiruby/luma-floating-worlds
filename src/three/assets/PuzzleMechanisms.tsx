import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  CrystalDef,
  EchoFragmentDef,
  ELEVATION_STEP,
  ElevationPlatformDef,
  GateDef,
  HeroNodeDef,
  InteractionTarget,
  LevelDef,
  LightEmitterDef,
  LightPrismDef,
  PortalDef,
  PressureSwitchDef,
  PuzzleRuntimeState,
  RotatingPlatformDef,
  SubCrystalDef,
  TILE_SIZE,
} from '../../game/types';
import { getCharacterById } from '../../game/characters';
import { isGateOpen } from '../../game/rules';
import { LumaMaterialPalette } from '../materials';

interface PuzzleMechanismsProps {
  level: LevelDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  interactionTargetRef: React.MutableRefObject<InteractionTarget | null>;
  palette: LumaMaterialPalette;
  isSoftwareGl: boolean;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}

const RotatingBridgeNode: React.FC<{
  plat: RotatingPlatformDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ plat, puzzleStateRef, palette, onRegisterFrame }) => {
  const bridgeGroupRef = useRef<THREE.Group>(null);
  const crankWheelRef = useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const hubGeo = new THREE.CylinderGeometry(0.95, 0.72, 0.45, 8);
    const gearRingGeo = new THREE.TorusGeometry(0.92, 0.08, 6, 12);
    const plankGeo = new THREE.BoxGeometry(TILE_SIZE * 0.94, 0.22, TILE_SIZE * 0.76);
    const curbGeo = new THREE.BoxGeometry(TILE_SIZE * 0.94, 0.14, 0.12);
    const runeGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.04, 6);
    const crankPostGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.76, 6);
    const crankRimGeo = new THREE.TorusGeometry(0.28, 0.055, 6, 10);
    const crankSpokeGeo = new THREE.BoxGeometry(0.52, 0.06, 0.06);
    return {
      hubGeo,
      gearRingGeo,
      plankGeo,
      curbGeo,
      runeGeo,
      crankPostGeo,
      crankRimGeo,
      crankSpokeGeo,
    };
  }, []);

  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const baseY = plat.elevation * ELEVATION_STEP;

  React.useEffect(() => {
    return onRegisterFrame((dt) => {
      const step = puzzleStateRef.current.rotatingSteps[plat.id] ?? plat.initialStep;
      // Step 0 -> 0 rad, Step 1 -> -PI/2 (rotates +X toward +Z matching rotateOffset)
      const targetRot = -step * (Math.PI / 2);
      if (bridgeGroupRef.current) {
        bridgeGroupRef.current.rotation.y = THREE.MathUtils.damp(
          bridgeGroupRef.current.rotation.y,
          targetRot,
          9,
          dt
        );
      }
      if (crankWheelRef.current) {
        crankWheelRef.current.rotation.z = THREE.MathUtils.damp(
          crankWheelRef.current.rotation.z,
          -step * (Math.PI / 2),
          10,
          dt
        );
      }
    });
  }, [onRegisterFrame, plat.id, plat.initialStep, puzzleStateRef]);

  return (
    <group>
      {/* Central Rotating Platform Assembly */}
      <group
        ref={bridgeGroupRef}
        position={[plat.pivotX * TILE_SIZE, baseY, plat.pivotZ * TILE_SIZE]}
        rotation={[0, -plat.initialStep * (Math.PI / 2), 0]}
      >
        <mesh geometry={geos.hubGeo} material={palette.cliffRock} position={[0, -0.32, 0]} castShadow receiveShadow />
        <mesh geometry={geos.gearRingGeo} material={palette.brassAccent} position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]} />
        {plat.baseOffsets.map((off) => (
          <group
            key={`${off.dx}_${off.dz}`}
            position={[off.dx * TILE_SIZE, 0, off.dz * TILE_SIZE]}
          >
            <mesh
              geometry={geos.plankGeo}
              material={palette.stonePaver}
              position={[0, -0.11, 0]}
              castShadow
              receiveShadow
            />
            <mesh
              geometry={geos.curbGeo}
              material={palette.sandstoneRuin}
              position={[0, 0.04, 0.38]}
              castShadow
            />
            <mesh
              geometry={geos.curbGeo}
              material={palette.sandstoneRuin}
              position={[0, 0.04, -0.38]}
              castShadow
            />
          </group>
        ))}
        <mesh geometry={geos.runeGeo} material={palette.crystalActive} position={[0, 0.02, 0]} />
      </group>

      {/* Bank Brass Crank Pedestal */}
      {plat.crankPos && (
        <group
          position={[
            plat.crankPos.x * TILE_SIZE,
            baseY,
            plat.crankPos.z * TILE_SIZE,
          ]}
        >
          <mesh geometry={geos.crankPostGeo} material={palette.sandstoneRuin} position={[0, 0.38, 0]} castShadow />
          <group ref={crankWheelRef} position={[0, 0.88, 0]} rotation={[0, Math.PI / 4, 0]}>
            <mesh geometry={geos.crankRimGeo} material={palette.brassAccent} castShadow />
            <mesh geometry={geos.crankSpokeGeo} material={palette.bronzeDark} />
            <mesh geometry={geos.crankSpokeGeo} material={palette.bronzeDark} rotation={[0, 0, Math.PI / 2]} />
          </group>
        </group>
      )}
    </group>
  );
};

const PressureSwitchNode: React.FC<{
  sw: PressureSwitchDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ sw, puzzleStateRef, palette, onRegisterFrame }) => {
  const plateRef = useRef<THREE.Mesh>(null);
  const rimRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.68, 0.78, 0.14, 8);
    const plate = new THREE.CylinderGeometry(0.5, 0.52, 0.12, 8);
    const rim = new THREE.TorusGeometry(0.54, 0.045, 6, 12);
    return { base, plate, rim };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const activeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x3ef2dd,
        emissive: 0x1fcab8,
        emissiveIntensity: 1.2,
        roughness: 0.25,
        flatShading: true,
      }),
    []
  );
  React.useEffect(() => () => activeMat.dispose(), [activeMat]);

  React.useEffect(() => {
    return onRegisterFrame((dt) => {
      const active = Boolean(puzzleStateRef.current.switchStates[sw.id]);
      if (plateRef.current) {
        const targetY = active ? 0.07 : 0.15;
        plateRef.current.position.y = THREE.MathUtils.damp(plateRef.current.position.y, targetY, 14, dt);
        plateRef.current.material = active ? activeMat : palette.brassAccent;
      }
      if (rimRef.current) {
        rimRef.current.material = active ? activeMat : palette.bronzeDark;
      }
    });
  }, [activeMat, onRegisterFrame, palette.brassAccent, palette.bronzeDark, puzzleStateRef, sw.id]);

  return (
    <group position={[sw.x * TILE_SIZE, sw.elevation * ELEVATION_STEP, sw.z * TILE_SIZE]}>
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.07, 0]} receiveShadow />
      <mesh ref={plateRef} geometry={geos.plate} material={palette.brassAccent} position={[0, 0.15, 0]} castShadow />
      <mesh ref={rimRef} geometry={geos.rim} material={palette.bronzeDark} position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

const GateNode: React.FC<{
  gate: GateDef;
  level: LevelDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ gate, level, puzzleStateRef, palette, onRegisterFrame }) => {
  const doorRef = useRef<THREE.Group>(null);
  const gemLeftRef = useRef<THREE.Mesh>(null);
  const gemRightRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const pillar = new THREE.BoxGeometry(0.32, 1.48, 0.36);
    const cap = new THREE.ConeGeometry(0.26, 0.26, 4);
    const doorSlab = new THREE.BoxGeometry(0.24, 1.24, 1.48);
    const bar = new THREE.BoxGeometry(0.3, 0.12, 1.5);
    const gem = new THREE.OctahedronGeometry(0.11, 0);
    return { pillar, cap, doorSlab, bar, gem };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((dt) => {
      const open = isGateOpen(level, puzzleStateRef.current, gate.id);
      if (doorRef.current) {
        const targetY = open ? -1.3 : 0;
        doorRef.current.position.y = THREE.MathUtils.damp(doorRef.current.position.y, targetY, 8, dt);
        doorRef.current.visible = doorRef.current.position.y > -1.22;
      }
      const gemMat = open ? palette.crystalActive : palette.crystalDormant;
      if (gemLeftRef.current) gemLeftRef.current.material = gemMat;
      if (gemRightRef.current) gemRightRef.current.material = gemMat;
    });
  }, [gate.id, level, onRegisterFrame, palette.crystalActive, palette.crystalDormant, puzzleStateRef]);

  const rotY = gate.axis === 'x' ? Math.PI / 2 : 0;

  return (
    <group
      position={[gate.x * TILE_SIZE, gate.elevation * ELEVATION_STEP, gate.z * TILE_SIZE]}
      rotation={[0, rotY, 0]}
    >
      {/* Left & Right Monolith Jambs */}
      <mesh geometry={geos.pillar} material={palette.sandstoneRuin} position={[0, 0.74, -0.84]} castShadow receiveShadow />
      <mesh geometry={geos.cap} material={palette.brassAccent} position={[0, 1.6, -0.84]} rotation={[0, Math.PI / 4, 0]} />
      <mesh ref={gemLeftRef} geometry={geos.gem} material={palette.crystalDormant} position={[0, 1.15, -0.84]} />

      <mesh geometry={geos.pillar} material={palette.sandstoneRuin} position={[0, 0.74, 0.84]} castShadow receiveShadow />
      <mesh geometry={geos.cap} material={palette.brassAccent} position={[0, 1.6, 0.84]} rotation={[0, Math.PI / 4, 0]} />
      <mesh ref={gemRightRef} geometry={geos.gem} material={palette.crystalDormant} position={[0, 1.15, 0.84]} />

      {/* Sliding Portcullis */}
      <group ref={doorRef}>
        <mesh geometry={geos.doorSlab} material={palette.cliffRock} position={[0, 0.62, 0]} castShadow receiveShadow />
        <mesh geometry={geos.bar} material={palette.bronzeDark} position={[0, 0.35, 0]} />
        <mesh geometry={geos.bar} material={palette.bronzeDark} position={[0, 0.92, 0]} />
      </group>
    </group>
  );
};

const ElevationPlatformNode: React.FC<{
  lift: ElevationPlatformDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ lift, puzzleStateRef, palette, onRegisterFrame }) => {
  const padRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const lowY = lift.lowElevation * ELEVATION_STEP;
  const highY = lift.highElevation * ELEVATION_STEP;
  const spanY = Math.max(ELEVATION_STEP, highY - lowY);
  const postHeight = spanY + 0.55;

  const geos = useMemo(() => {
    const base = new THREE.BoxGeometry(TILE_SIZE * 0.96, 0.36, TILE_SIZE * 0.96);
    const pad = new THREE.BoxGeometry(TILE_SIZE * 0.9, 0.24, TILE_SIZE * 0.9);
    const cornerPost = new THREE.CylinderGeometry(0.06, 0.08, postHeight, 6);
    const core = new THREE.OctahedronGeometry(0.22, 0);
    return { base, pad, cornerPost, core };
  }, [postHeight]);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((dt, elapsed) => {
      const isHigh = lift.linkedSwitchId
        ? Boolean(puzzleStateRef.current.switchStates[lift.linkedSwitchId])
        : Boolean(puzzleStateRef.current.elevationHigh[lift.id]);
      const targetY = isHigh ? highY : lowY;
      if (padRef.current) {
        padRef.current.position.y = THREE.MathUtils.damp(padRef.current.position.y, targetY, 8, dt);
      }
      if (coreRef.current) {
        coreRef.current.rotation.y = elapsed * 1.4;
      }
    });
  }, [highY, lift.id, lift.linkedSwitchId, lowY, onRegisterFrame, puzzleStateRef]);

  return (
    <group position={[lift.x * TILE_SIZE, 0, lift.z * TILE_SIZE]}>
      {/* Base Housing */}
      <mesh geometry={geos.base} material={palette.cliffDeep} position={[0, lowY - 0.32, 0]} receiveShadow />
      {/* 4 Brass Guide Rails */}
      {[
        [-0.78, -0.78],
        [0.78, -0.78],
        [-0.78, 0.78],
        [0.78, 0.78],
      ].map(([cx, cz], i) => (
        <mesh
          key={i}
          geometry={geos.cornerPost}
          material={palette.brassAccent}
          position={[cx, lowY + postHeight * 0.5 - 0.18, cz]}
          castShadow
        />
      ))}
      {/* Moving Lift Pad */}
      <group ref={padRef} position={[0, lift.initialHigh ? highY : lowY, 0]}>
        <mesh geometry={geos.pad} material={palette.stonePaver} position={[0, -0.12, 0]} castShadow receiveShadow />
        <mesh ref={coreRef} geometry={geos.core} material={palette.crystalActive} position={[0, -0.26, 0]} />
      </group>
    </group>
  );
};

const LightEmitterNode: React.FC<{
  emitter: LightEmitterDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ emitter, puzzleStateRef, palette, onRegisterFrame }) => {
  const lensRef = useRef<THREE.Mesh>(null);
  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.45, 0.62, 0.72, 8);
    const lens = new THREE.OctahedronGeometry(0.28, 0);
    const collar = new THREE.TorusGeometry(0.32, 0.06, 6, 12);
    return { base, lens, collar };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame(() => {
      if (lensRef.current) {
        const disabled = Boolean(puzzleStateRef.current.debugDisabledEmitters?.[emitter.id]);
        lensRef.current.material = disabled ? palette.crystalDormant : palette.crystalActive;
      }
    });
  }, [emitter.id, onRegisterFrame, palette.crystalActive, palette.crystalDormant, puzzleStateRef]);

  const rotY = -emitter.direction * (Math.PI / 2);

  return (
    <group
      position={[emitter.x * TILE_SIZE, emitter.elevation * ELEVATION_STEP, emitter.z * TILE_SIZE]}
      rotation={[0, rotY, 0]}
    >
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.36, 0]} castShadow receiveShadow />
      <mesh ref={lensRef} geometry={geos.lens} material={palette.crystalActive} position={[0.16, 0.88, 0]} />
      <mesh geometry={geos.collar} material={palette.brassAccent} position={[0.24, 0.88, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

const LightPrismNode: React.FC<{
  prism: LightPrismDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ prism, puzzleStateRef, palette, onRegisterFrame }) => {
  const turretRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.48, 0.6, 0.56, 8);
    const ring = new THREE.TorusGeometry(0.44, 0.055, 6, 12);
    const crystal = new THREE.OctahedronGeometry(0.34, 0);
    const pointer = new THREE.ConeGeometry(0.14, 0.32, 4);
    return { base, ring, crystal, pointer };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((dt, elapsed) => {
      const dir = puzzleStateRef.current.prismDirections[prism.id] ?? prism.initialDirection;
      const targetRot = -dir * (Math.PI / 2);
      if (turretRef.current) {
        turretRef.current.rotation.y = THREE.MathUtils.damp(
          turretRef.current.rotation.y,
          targetRot,
          11,
          dt
        );
      }
      if (crystalRef.current) {
        const isLit = puzzleStateRef.current.litPrismIds.includes(prism.id);
        crystalRef.current.material = isLit ? palette.crystalActive : palette.crystalDormant;
        crystalRef.current.position.y = 0.92 + Math.sin(elapsed * 2.5) * 0.04;
      }
    });
  }, [onRegisterFrame, palette.crystalActive, palette.crystalDormant, prism.id, prism.initialDirection, puzzleStateRef]);

  return (
    <group position={[prism.x * TILE_SIZE, prism.elevation * ELEVATION_STEP, prism.z * TILE_SIZE]}>
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.28, 0]} castShadow receiveShadow />
      <group ref={turretRef} rotation={[0, -prism.initialDirection * (Math.PI / 2), 0]}>
        <mesh geometry={geos.ring} material={palette.brassAccent} position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh ref={crystalRef} geometry={geos.crystal} material={palette.crystalDormant} position={[0, 0.92, 0]} scale={[0.9, 1.35, 0.9]} />
        {/* Brass Directional Chevron pointing along +X local */}
        <mesh
          geometry={geos.pointer}
          material={palette.brassAccent}
          position={[0.48, 0.92, 0]}
          rotation={[0, 0, -Math.PI / 2]}
        />
      </group>
    </group>
  );
};

const LightBeamsLayer: React.FC<{
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ puzzleStateRef, palette, onRegisterFrame }) => {
  const MAX_SEGMENTS = 14;
  const segmentRefs = useRef<Array<THREE.Mesh | null>>([]);
  const flareRefs = useRef<Array<THREE.Mesh | null>>([]);

  const geos = useMemo(() => {
    const beam = new THREE.CylinderGeometry(0.075, 0.075, 1, 8);
    beam.rotateZ(Math.PI / 2); // Align along X
    const flare = new THREE.OctahedronGeometry(0.18, 0);
    return { beam, flare };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      const segs = puzzleStateRef.current.lightSegments;
      const pulse = 1 + Math.sin(elapsed * 8) * 0.14;
      for (let i = 0; i < MAX_SEGMENTS; i++) {
        const mesh = segmentRefs.current[i];
        const flare = flareRefs.current[i];
        if (!mesh || !flare) continue;
        if (i < segs.length) {
          const s = segs[i];
          const x1 = s.fromX * TILE_SIZE;
          const z1 = s.fromZ * TILE_SIZE;
          const x2 = s.toX * TILE_SIZE;
          const z2 = s.toZ * TILE_SIZE;
          const len = Math.hypot(x2 - x1, z2 - z1);
          if (len > 0.05) {
            mesh.visible = true;
            mesh.position.set((x1 + x2) / 2, s.elevation * ELEVATION_STEP + 0.92, (z1 + z2) / 2);
            mesh.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
            mesh.scale.set(len, pulse, pulse);

            flare.visible = true;
            flare.position.set(x2, s.elevation * ELEVATION_STEP + 0.92, z2);
            flare.rotation.y = elapsed * 3;
            flare.scale.setScalar(pulse);
          } else {
            mesh.visible = false;
            flare.visible = false;
          }
        } else {
          mesh.visible = false;
          flare.visible = false;
        }
      }
    });
  }, [onRegisterFrame, puzzleStateRef]);

  return (
    <group name="LightBeams">
      {Array.from({ length: MAX_SEGMENTS }).map((_, i) => (
        <React.Fragment key={i}>
          <mesh
            ref={(el) => {
              segmentRefs.current[i] = el;
            }}
            geometry={geos.beam}
            material={palette.beamCore}
            visible={false}
          />
          <mesh
            ref={(el) => {
              flareRefs.current[i] = el;
            }}
            geometry={geos.flare}
            material={palette.crystalActive}
            visible={false}
          />
        </React.Fragment>
      ))}
    </group>
  );
};

const SubCrystalNode: React.FC<{
  sub: SubCrystalDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ sub, puzzleStateRef, palette, onRegisterFrame }) => {
  const gemRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.48, 0.62, 0.36, 8);
    const cradle = new THREE.TorusGeometry(0.34, 0.045, 6, 12);
    const gem = new THREE.OctahedronGeometry(0.28, 0);
    return { base, cradle, gem };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      const isLit = puzzleStateRef.current.litSubCrystalIds.includes(sub.id);
      if (gemRef.current) {
        gemRef.current.material = isLit ? palette.crystalActive : palette.crystalDormant;
        gemRef.current.rotation.y = elapsed * (isLit ? 1.4 : 0.4);
        gemRef.current.position.y = (isLit ? 0.92 : 0.78) + Math.sin(elapsed * 2.6) * 0.05;
      }
      if (ringRef.current) {
        ringRef.current.visible = isLit;
        ringRef.current.rotation.x = elapsed * 1.1;
        ringRef.current.rotation.z = elapsed * 0.7;
      }
    });
  }, [onRegisterFrame, palette.crystalActive, palette.crystalDormant, puzzleStateRef, sub.id]);

  return (
    <group position={[sub.x * TILE_SIZE, sub.elevation * ELEVATION_STEP, sub.z * TILE_SIZE]}>
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.18, 0]} receiveShadow castShadow />
      <mesh geometry={geos.cradle} material={palette.brassAccent} position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh ref={gemRef} geometry={geos.gem} material={palette.crystalDormant} position={[0, 0.82, 0]} scale={[0.85, 1.4, 0.85]} />
      <mesh ref={ringRef} geometry={geos.cradle} material={palette.crystalActive} position={[0, 0.92, 0]} scale={1.15} visible={false} />
    </group>
  );
};

const CrystalAltarNode: React.FC<{
  crystal: CrystalDef;
  isEternal?: boolean;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  isSoftwareGl: boolean;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ crystal, isEternal = false, puzzleStateRef, palette, isSoftwareGl, onRegisterFrame }) => {
  const spireRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const step1 = new THREE.CylinderGeometry(0.86, 0.96, 0.18, 8);
    const step2 = new THREE.CylinderGeometry(0.62, 0.72, 0.2, 8);
    const mainShard = new THREE.OctahedronGeometry(0.42, 0);
    const sideShard = new THREE.OctahedronGeometry(0.2, 0);
    const halo = new THREE.TorusGeometry(0.66, 0.035, 6, 18);
    const beacon = new THREE.CylinderGeometry(0.14, 0.34, 9.5, 8);
    return { step1, step2, mainShard, sideShard, halo, beacon };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      const restored = puzzleStateRef.current.crystalRestored;
      const mat = restored ? palette.crystalActive : palette.crystalDormant;
      if (spireRef.current) {
        spireRef.current.position.y = (restored ? 1.18 : 0.98) + Math.sin(elapsed * 2.1) * (restored ? 0.11 : 0.03);
        spireRef.current.rotation.y = elapsed * (restored ? 0.85 : 0.25);
        spireRef.current.children.forEach((c) => {
          if ((c as THREE.Mesh).isMesh) {
            (c as THREE.Mesh).material = mat;
          }
        });
      }
      if (ring1Ref.current && ring2Ref.current) {
        ring1Ref.current.visible = restored;
        ring2Ref.current.visible = restored;
        ring1Ref.current.rotation.x = elapsed * 0.9;
        ring1Ref.current.rotation.y = elapsed * 0.6;
        ring2Ref.current.rotation.z = -elapsed * 0.8;
        ring2Ref.current.rotation.x = 0.6;
      }
      if (beaconRef.current) {
        beaconRef.current.visible = isEternal && restored;
        beaconRef.current.rotation.y = elapsed * 0.6;
        const pulse = 0.9 + Math.sin(elapsed * 4) * 0.15;
        beaconRef.current.scale.set(pulse, 1, pulse);
      }
    });
  }, [isEternal, onRegisterFrame, palette.crystalActive, palette.crystalDormant, puzzleStateRef]);

  return (
    <group
      position={[crystal.x * TILE_SIZE, crystal.elevation * ELEVATION_STEP, crystal.z * TILE_SIZE]}
      scale={isEternal ? 1.18 : 1}
    >
      <mesh geometry={geos.step1} material={palette.sandstoneRuin} position={[0, 0.09, 0]} receiveShadow castShadow />
      <mesh geometry={geos.step2} material={palette.stonePaver} position={[0, 0.28, 0]} receiveShadow castShadow />

      <group ref={spireRef} position={[0, 1.0, 0]}>
        <mesh geometry={geos.mainShard} material={palette.crystalDormant} scale={[0.72, 1.65, 0.72]} castShadow />
        <mesh geometry={geos.sideShard} material={palette.crystalDormant} position={[0.26, -0.15, 0.12]} rotation={[0.3, 0, -0.35]} scale={[0.7, 1.4, 0.7]} />
        <mesh geometry={geos.sideShard} material={palette.crystalDormant} position={[-0.24, -0.12, -0.14]} rotation={[-0.25, 0, 0.35]} scale={[0.7, 1.3, 0.7]} />
      </group>

      <mesh ref={ring1Ref} geometry={geos.halo} material={palette.brassAccent} position={[0, 1.18, 0]} visible={false} />
      <mesh ref={ring2Ref} geometry={geos.halo} material={palette.crystalActive} position={[0, 1.18, 0]} scale={0.78} visible={false} />
      <mesh ref={beaconRef} geometry={geos.beacon} material={palette.beamCore} position={[0, 5.4, 0]} visible={false} />
      {!isSoftwareGl && (
        <pointLight color={0x4ff5e2} intensity={isEternal ? 1.3 : 0.9} distance={6} decay={2} position={[0, 1.4, 0]} />
      )}
    </group>
  );
};

const PortalArchNode: React.FC<{
  portal: PortalDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ portal, puzzleStateRef, palette, onRegisterFrame }) => {
  const vortexRef = useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.88, 0.98, 0.14, 8);
    const pillar = new THREE.BoxGeometry(0.32, 1.6, 0.36);
    const arch = new THREE.TorusGeometry(0.7, 0.16, 6, 12, Math.PI);
    const keystone = new THREE.OctahedronGeometry(0.18, 0);
    const vortexOuter = new THREE.TorusGeometry(0.55, 0.05, 6, 18);
    const vortexDisc = new THREE.CircleGeometry(0.54, 16);
    return { base, pillar, arch, keystone, vortexOuter, vortexDisc };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const vortexMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x4df5e2,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      }),
    []
  );
  React.useEffect(() => () => vortexMat.dispose(), [vortexMat]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      const awake = puzzleStateRef.current.portalAwakened;
      if (vortexRef.current) {
        vortexRef.current.visible = awake;
        vortexRef.current.rotation.z = elapsed * 1.4;
        const pulse = 0.94 + Math.sin(elapsed * 3.5) * 0.06;
        vortexRef.current.scale.setScalar(pulse);
      }
    });
  }, [onRegisterFrame, puzzleStateRef]);

  const rotY = portal.facing === 0 || portal.facing === 2 ? Math.PI / 2 : 0;

  return (
    <group
      position={[portal.x * TILE_SIZE, portal.elevation * ELEVATION_STEP, portal.z * TILE_SIZE]}
      rotation={[0, rotY, 0]}
    >
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.07, 0]} receiveShadow />
      <mesh geometry={geos.pillar} material={palette.stonePaver} position={[-0.7, 0.85, 0]} castShadow />
      <mesh geometry={geos.pillar} material={palette.stonePaver} position={[0.7, 0.85, 0]} castShadow />
      <mesh geometry={geos.arch} material={palette.sandstoneRuin} position={[0, 1.56, 0]} castShadow />
      <mesh geometry={geos.keystone} material={palette.brassAccent} position={[0, 2.34, 0]} />

      <group ref={vortexRef} position={[0, 1.25, 0]} visible={false}>
        <mesh geometry={geos.vortexDisc} material={vortexMat} />
        <mesh geometry={geos.vortexOuter} material={palette.lanternGlow} />
      </group>
    </group>
  );
};

const RuneConduitNode: React.FC<{
  sw: PressureSwitchDef;
  gate: GateDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ sw, gate, puzzleStateRef, palette, onRegisterFrame }) => {
  const segARef = useRef<THREE.Mesh>(null);
  const segBRef = useRef<THREE.Mesh>(null);

  const x1 = sw.x * TILE_SIZE;
  const z1 = sw.z * TILE_SIZE;
  const x2 = gate.x * TILE_SIZE;
  const z2 = gate.z * TILE_SIZE;
  const y = sw.elevation * ELEVATION_STEP + 0.025;

  const dx = Math.abs(x2 - x1);
  const dz = Math.abs(z2 - z1);

  const geos = useMemo(() => {
    const gA = new THREE.BoxGeometry(Math.max(0.1, dx), 0.03, 0.09);
    const gB = new THREE.BoxGeometry(0.09, 0.03, Math.max(0.1, dz));
    return { gA, gB };
  }, [dx, dz]);

  React.useEffect(() => () => {
    geos.gA.dispose();
    geos.gB.dispose();
  }, [geos]);

  React.useEffect(() => {
    return onRegisterFrame(() => {
      const active = Boolean(puzzleStateRef.current.switchStates[sw.id]);
      const mat = active ? palette.crystalActive : palette.bronzeDark;
      if (segARef.current) segARef.current.material = mat;
      if (segBRef.current) segBRef.current.material = mat;
    });
  }, [onRegisterFrame, palette.bronzeDark, palette.crystalActive, puzzleStateRef, sw.id]);

  return (
    <group>
      {dx > 0.05 && (
        <mesh
          ref={segARef}
          geometry={geos.gA}
          material={palette.bronzeDark}
          position={[(x1 + x2) / 2, y, z2]}
        />
      )}
      {dz > 0.05 && (
        <mesh
          ref={segBRef}
          geometry={geos.gB}
          material={palette.bronzeDark}
          position={[x1, y, (z1 + z2) / 2]}
        />
      )}
    </group>
  );
};

const HeroNodeObject: React.FC<{
  node: HeroNodeDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ node, puzzleStateRef, palette, onRegisterFrame }) => {
  const sigilRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const bridgeGroupRef = useRef<THREE.Group>(null);

  const heroDef = useMemo(() => getCharacterById(node.heroId), [node.heroId]);

  const geos = useMemo(() => {
    const plinth = new THREE.CylinderGeometry(0.46, 0.58, 0.34, 8);
    const sigilCore = new THREE.OctahedronGeometry(0.24, 0);
    const haloRing = new THREE.TorusGeometry(0.42, 0.04, 6, 16);
    const vaneArm = new THREE.BoxGeometry(0.7, 0.08, 0.1);
    const bridgeSlab = new THREE.BoxGeometry(TILE_SIZE * 0.9, 0.24, TILE_SIZE * 0.9);
    const bridgeTrim = new THREE.BoxGeometry(TILE_SIZE * 0.72, 0.06, TILE_SIZE * 0.72);
    return { plinth, sigilCore, haloRing, vaneArm, bridgeSlab, bridgeTrim };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const heroAccentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: heroDef.defaultColors.accentColor,
        emissive: heroDef.defaultColors.toolEmissiveColor,
        emissiveIntensity: 0.95,
        roughness: 0.22,
        metalness: 0.15,
        flatShading: true,
      }),
    [heroDef.defaultColors.accentColor, heroDef.defaultColors.toolEmissiveColor]
  );

  const heroDormantMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: heroDef.defaultColors.cloakColor,
        emissive: heroDef.defaultColors.cloakColor,
        emissiveIntensity: 0.28,
        roughness: 0.45,
        metalness: 0.12,
        flatShading: true,
      }),
    [heroDef.defaultColors.cloakColor]
  );

  const bridgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: heroDef.defaultColors.cloakTrimColor,
        emissive: heroDef.defaultColors.toolEmissiveColor,
        emissiveIntensity: 0.36,
        roughness: 0.38,
        metalness: 0.1,
        transparent: true,
        opacity: 0.92,
        flatShading: true,
      }),
    [heroDef.defaultColors.cloakTrimColor, heroDef.defaultColors.toolEmissiveColor]
  );

  React.useEffect(() => {
    return () => {
      heroAccentMat.dispose();
      heroDormantMat.dispose();
      bridgeMat.dispose();
    };
  }, [bridgeMat, heroAccentMat, heroDormantMat]);

  const progressRef = useRef(0);

  React.useEffect(() => {
    return onRegisterFrame((dt, elapsed) => {
      const active = Boolean(puzzleStateRef.current.heroNodesActive?.[node.id]);
      const matchHero = puzzleStateRef.current.activeCharacterId === node.heroId;
      progressRef.current = THREE.MathUtils.damp(progressRef.current, active ? 1 : 0, 7, dt);

      if (sigilRef.current) {
        const bob = active ? Math.sin(elapsed * 3) * 0.08 + 0.88 : Math.sin(elapsed * 1.8) * 0.04 + 0.66;
        sigilRef.current.position.y = bob;
        sigilRef.current.rotation.y = elapsed * (active ? 1.8 : matchHero ? 0.9 : 0.3);
        const core = sigilRef.current.children[0] as THREE.Mesh | undefined;
        if (core) {
          core.material = active || matchHero ? heroAccentMat : heroDormantMat;
        }
      }

      if (ringRef.current) {
        ringRef.current.rotation.z = elapsed * (active ? 1.5 : 0.5);
        ringRef.current.scale.setScalar(active ? 1.15 : matchHero ? 0.98 + Math.sin(elapsed * 3.5) * 0.06 : 0.8);
        ringRef.current.material = active ? heroAccentMat : heroDormantMat;
      }

      if (bridgeGroupRef.current) {
        const p = progressRef.current;
        bridgeGroupRef.current.visible = p > 0.02;
        bridgeGroupRef.current.children.forEach((child, idx) => {
          const s = THREE.MathUtils.clamp(p * 1.15 - idx * 0.06, 0.001, 1);
          child.scale.set(s, s, s);
        });
      }
    });
  }, [heroAccentMat, heroDormantMat, node.heroId, node.id, onRegisterFrame, puzzleStateRef]);

  return (
    <group>
      <group position={[node.x * TILE_SIZE, node.elevation * ELEVATION_STEP, node.z * TILE_SIZE]}>
        <mesh geometry={geos.plinth} material={palette.sandstoneRuin} position={[0, 0.17, 0]} receiveShadow castShadow />
        <mesh ref={ringRef} geometry={geos.haloRing} material={heroDormantMat} position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <group ref={sigilRef} position={[0, 0.66, 0]}>
          <mesh geometry={geos.sigilCore} material={heroDormantMat} scale={[0.9, 1.35, 0.9]} />
          {node.kind === 'wind_vane' && (
            <mesh geometry={geos.vaneArm} material={palette.brassAccent} position={[0, 0.18, 0]} />
          )}
        </group>
      </group>

      {node.bridgeTiles && node.bridgeTiles.length > 0 && (
        <group ref={bridgeGroupRef} visible={false}>
          {node.bridgeTiles.map((bt) => (
            <group
              key={`${bt.x}_${bt.z}`}
              position={[bt.x * TILE_SIZE, bt.elevation * ELEVATION_STEP, bt.z * TILE_SIZE]}
            >
              <mesh geometry={geos.bridgeSlab} material={bridgeMat} position={[0, -0.12, 0]} receiveShadow castShadow />
              <mesh geometry={geos.bridgeTrim} material={heroAccentMat} position={[0, 0.01, 0]} />
            </group>
          ))}
        </group>
      )}
    </group>
  );
};

const EchoFragmentNode: React.FC<{
  echo: EchoFragmentDef;
  puzzleStateRef: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ echo, puzzleStateRef, palette, onRegisterFrame }) => {
  const rootRef = useRef<THREE.Group>(null);
  const shardRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const pedestal = new THREE.CylinderGeometry(0.32, 0.44, 0.16, 6);
    const shard = new THREE.OctahedronGeometry(0.28, 0);
    const ring = new THREE.TorusGeometry(0.42, 0.032, 6, 16);
    return { pedestal, shard, ring };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      const collected = Boolean(puzzleStateRef.current.echoCollectedInRun);
      if (rootRef.current) {
        rootRef.current.visible = !collected;
      }
      if (!collected) {
        if (shardRef.current) {
          shardRef.current.position.y = 0.72 + Math.sin(elapsed * 2.8) * 0.1;
          shardRef.current.rotation.y = elapsed * 1.7;
          shardRef.current.rotation.z = Math.sin(elapsed * 1.4) * 0.14;
        }
        if (ringRef.current) {
          ringRef.current.rotation.x = elapsed * 1.3;
          ringRef.current.rotation.y = -elapsed * 0.9;
        }
      }
    });
  }, [onRegisterFrame, puzzleStateRef]);

  return (
    <group
      ref={rootRef}
      position={[echo.x * TILE_SIZE, echo.elevation * ELEVATION_STEP, echo.z * TILE_SIZE]}
    >
      <mesh geometry={geos.pedestal} material={palette.sandstoneRuin} position={[0, 0.08, 0]} receiveShadow />
      <mesh ref={shardRef} geometry={geos.shard} material={palette.echoMat} position={[0, 0.72, 0]} scale={[0.78, 1.45, 0.78]} castShadow />
      <mesh ref={ringRef} geometry={geos.ring} material={palette.lanternGlow} position={[0, 0.72, 0]} />
    </group>
  );
};

export const PuzzleMechanisms: React.FC<PuzzleMechanismsProps> = ({
  level,
  puzzleStateRef,
  interactionTargetRef,
  palette,
  isSoftwareGl,
  onRegisterFrame,
}) => {
  const markerRef = useRef<THREE.Group>(null);

  const markerGeo = useMemo(() => {
    const diamond = new THREE.OctahedronGeometry(0.22, 0);
    const ring = new THREE.TorusGeometry(0.46, 0.04, 6, 16);
    return { diamond, ring };
  }, []);
  React.useEffect(() => () => Object.values(markerGeo).forEach((g) => g.dispose()), [markerGeo]);

  React.useEffect(() => {
    return onRegisterFrame((dt, elapsed) => {
      const target = interactionTargetRef.current;
      const marker = markerRef.current;
      if (!marker) return;
      if (!target) {
        marker.visible = false;
        return;
      }
      marker.visible = true;
      marker.position.x = THREE.MathUtils.damp(marker.position.x, target.worldX, 16, dt);
      marker.position.z = THREE.MathUtils.damp(marker.position.z, target.worldZ, 16, dt);
      marker.position.y = 1.9 + Math.sin(elapsed * 4) * 0.12;
      marker.rotation.y = elapsed * 2.2;
    });
  }, [interactionTargetRef, onRegisterFrame]);

  return (
    <group name="PuzzleMechanisms">
      {level.rotatingPlatforms.map((plat) => (
        <RotatingBridgeNode
          key={plat.id}
          plat={plat}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      {level.pressureSwitches.map((sw) => (
        <PressureSwitchNode
          key={sw.id}
          sw={sw}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      {level.gates.map((gate) => (
        <GateNode
          key={gate.id}
          gate={gate}
          level={level}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      {level.elevationPlatforms.map((lift) => (
        <ElevationPlatformNode
          key={lift.id}
          lift={lift}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      {level.lightEmitters.map((emitter) => (
        <LightEmitterNode
          key={emitter.id}
          emitter={emitter}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      {level.lightPrisms.map((prism) => (
        <LightPrismNode
          key={prism.id}
          prism={prism}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      <LightBeamsLayer
        puzzleStateRef={puzzleStateRef}
        palette={palette}
        onRegisterFrame={onRegisterFrame}
      />

      {(level.subCrystals ?? []).map((sub) => (
        <SubCrystalNode
          key={sub.id}
          sub={sub}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      <CrystalAltarNode
        crystal={level.crystal}
        isEternal={level.id === 10 || level.id === 50 || level.id === 60}
        puzzleStateRef={puzzleStateRef}
        palette={palette}
        isSoftwareGl={isSoftwareGl}
        onRegisterFrame={onRegisterFrame}
      />

      {(level.heroNodes ?? []).map((node) => (
        <HeroNodeObject
          key={node.id}
          node={node}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      ))}

      {level.echoFragment && (
        <EchoFragmentNode
          echo={level.echoFragment}
          puzzleStateRef={puzzleStateRef}
          palette={palette}
          onRegisterFrame={onRegisterFrame}
        />
      )}

      <PortalArchNode
        portal={level.portal}
        puzzleStateRef={puzzleStateRef}
        palette={palette}
        onRegisterFrame={onRegisterFrame}
      />

      {/* Inlaid Rune Conduit Indicators connecting same-elevation switches to gates */}
      {level.gates.map((gate) => {
        const sw = level.pressureSwitches.find((s) => s.id === gate.linkedSwitchId);
        if (!sw || sw.elevation !== gate.elevation) return null;
        return (
          <RuneConduitNode
            key={`conduit_${gate.id}`}
            sw={sw}
            gate={gate}
            puzzleStateRef={puzzleStateRef}
            palette={palette}
            onRegisterFrame={onRegisterFrame}
          />
        );
      })}

      {/* Diegetic Floating Target Prompt Marker */}
      <group ref={markerRef} visible={false}>
        <mesh geometry={markerGeo.diamond} material={palette.lanternGlow} />
        <mesh
          geometry={markerGeo.ring}
          material={palette.crystalActive}
          position={[0, -1.65, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    </group>
  );
};
