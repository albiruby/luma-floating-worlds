import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DecorType, ELEVATION_STEP, TILE_SIZE, TileDef } from '../../game/types';
import { LumaMaterialPalette } from '../materials';

interface EnvironmentPropsLayerProps {
  tiles: TileDef[];
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}

const PineTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, scale, rotY, palette }) => {
  const geos = useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.08, 0.16, 0.65, 6);
    const root = new THREE.CylinderGeometry(0.16, 0.25, 0.16, 5);
    const tier1 = new THREE.ConeGeometry(0.62, 0.85, 7);
    const tier2 = new THREE.ConeGeometry(0.48, 0.72, 7);
    const tier3 = new THREE.ConeGeometry(0.32, 0.58, 6);
    return { trunk, root, tier1, tier2, tier3 };
  }, []);

  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <mesh geometry={geos.root} material={palette.woodWarm} position={[0, 0.08, 0]} castShadow />
      <mesh geometry={geos.trunk} material={palette.woodWarm} position={[0, 0.35, 0]} castShadow />
      <mesh geometry={geos.tier1} material={palette.foliageDeep} position={[0, 0.92, 0]} castShadow receiveShadow />
      <mesh geometry={geos.tier2} material={palette.foliageLight} position={[0, 1.38, 0]} rotation={[0, 0.4, 0]} castShadow receiveShadow />
      <mesh geometry={geos.tier3} material={palette.foliageLight} position={[0, 1.78, 0]} rotation={[0, 0.8, 0]} castShadow />
    </group>
  );
};

const BroadTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, scale, rotY, palette }) => {
  const geos = useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.11, 0.21, 0.82, 7);
    const branch = new THREE.CylinderGeometry(0.06, 0.09, 0.46, 5);
    const canopyMain = new THREE.DodecahedronGeometry(0.56, 0);
    const canopySide = new THREE.DodecahedronGeometry(0.4, 0);
    return { trunk, branch, canopyMain, canopySide };
  }, []);

  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <mesh geometry={geos.trunk} material={palette.woodWarm} position={[0, 0.4, 0]} castShadow />
      <mesh
        geometry={geos.branch}
        material={palette.woodWarm}
        position={[0.18, 0.72, 0.06]}
        rotation={[0.2, 0, -0.65]}
        castShadow
      />
      <mesh
        geometry={geos.canopyMain}
        material={palette.foliageLight}
        position={[0, 1.25, 0]}
        scale={[1.15, 0.82, 1.1]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={geos.canopySide}
        material={palette.foliageDeep}
        position={[0.38, 1.05, 0.18]}
        scale={[1.05, 0.78, 1.0]}
        castShadow
      />
      <mesh
        geometry={geos.canopySide}
        material={palette.foliageLight}
        position={[-0.32, 1.12, -0.2]}
        scale={[0.95, 0.74, 0.95]}
        castShadow
      />
    </group>
  );
};

const RockCluster: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, rotY, palette }) => {
  const geos = useMemo(() => {
    const main = new THREE.DodecahedronGeometry(0.46, 0);
    const sub = new THREE.DodecahedronGeometry(0.3, 0);
    const moss = new THREE.DodecahedronGeometry(0.28, 0);
    return { main, sub, moss };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.main} material={palette.cliffRock} position={[0, 0.26, 0]} scale={[1.15, 0.9, 1]} castShadow receiveShadow />
      <mesh geometry={geos.sub} material={palette.cliffDeep} position={[0.36, 0.16, 0.2]} scale={[1.1, 0.75, 0.9]} castShadow />
      <mesh geometry={geos.moss} material={palette.grassMoss} position={[-0.14, 0.44, -0.05]} scale={[1.1, 0.35, 1.0]} />
    </group>
  );
};

const RuinPillar: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, rotY, palette }) => {
  const geos = useMemo(() => {
    const base = new THREE.BoxGeometry(0.86, 0.22, 0.86);
    const shaft = new THREE.CylinderGeometry(0.28, 0.32, 1.35, 8);
    const cap = new THREE.BoxGeometry(0.76, 0.18, 0.76);
    const moss = new THREE.DodecahedronGeometry(0.22, 0);
    return { base, shaft, cap, moss };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.11, 0]} castShadow receiveShadow />
      <mesh geometry={geos.shaft} material={palette.stonePaver} position={[0, 0.85, 0]} castShadow receiveShadow />
      <mesh geometry={geos.cap} material={palette.sandstoneRuin} position={[0, 1.56, 0]} rotation={[0.06, 0.2, 0]} castShadow />
      <mesh geometry={geos.moss} material={palette.grassMoss} position={[0.22, 1.66, 0.15]} scale={[1.2, 0.45, 0.9]} />
    </group>
  );
};

const RuinArch: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, rotY, palette }) => {
  const geos = useMemo(() => {
    const plinth = new THREE.BoxGeometry(0.42, 0.2, 0.46);
    const col = new THREE.BoxGeometry(0.32, 1.45, 0.34);
    const lintel = new THREE.BoxGeometry(1.68, 0.28, 0.44);
    const keystone = new THREE.ConeGeometry(0.24, 0.34, 4);
    return { plinth, col, lintel, keystone };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.plinth} material={palette.cliffRock} position={[-0.56, 0.1, 0]} castShadow />
      <mesh geometry={geos.plinth} material={palette.cliffRock} position={[0.56, 0.1, 0]} castShadow />
      <mesh geometry={geos.col} material={palette.sandstoneRuin} position={[-0.56, 0.9, 0]} castShadow receiveShadow />
      <mesh geometry={geos.col} material={palette.sandstoneRuin} position={[0.56, 0.9, 0]} castShadow receiveShadow />
      <mesh geometry={geos.lintel} material={palette.stonePaver} position={[0, 1.72, 0]} castShadow receiveShadow />
      <mesh geometry={geos.keystone} material={palette.brassAccent} position={[0, 1.94, 0]} rotation={[0, Math.PI / 4, 0]} />
    </group>
  );
};

const StoneLantern: React.FC<{
  position: [number, number, number];
  palette: LumaMaterialPalette;
}> = ({ position, palette }) => {
  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.24, 0.32, 0.18, 6);
    const post = new THREE.CylinderGeometry(0.11, 0.14, 0.56, 6);
    const core = new THREE.OctahedronGeometry(0.13, 0);
    const roof = new THREE.ConeGeometry(0.32, 0.24, 6);
    return { base, post, core, roof };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  return (
    <group position={position}>
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.09, 0]} castShadow />
      <mesh geometry={geos.post} material={palette.stonePaver} position={[0, 0.45, 0]} castShadow />
      <mesh geometry={geos.core} material={palette.lanternGlow} position={[0, 0.82, 0]} />
      <mesh geometry={geos.roof} material={palette.cliffRock} position={[0, 1.04, 0]} castShadow />
    </group>
  );
};

const WaterfallProp: React.FC<{
  position: [number, number, number];
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, palette, onRegisterFrame }) => {
  const streamRef = React.useRef<THREE.Mesh>(null);
  const foamRef = React.useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const channel = new THREE.BoxGeometry(0.95, 0.08, 1.2);
    const fall = new THREE.BoxGeometry(0.86, 2.9, 0.16);
    const rock = new THREE.DodecahedronGeometry(0.32, 0);
    const foam = new THREE.DodecahedronGeometry(0.18, 0);
    return { channel, fall, rock, foam };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (streamRef.current) {
        streamRef.current.scale.x = 1 + Math.sin(elapsed * 5) * 0.04;
      }
      if (foamRef.current) {
        foamRef.current.position.y = -1.45 + Math.sin(elapsed * 4.2) * 0.08;
        foamRef.current.rotation.y = elapsed * 0.7;
      }
    });
  }, [onRegisterFrame]);

  return (
    <group position={position}>
      <mesh geometry={geos.channel} material={palette.waterRibbon} position={[0, 0.02, 0.4]} />
      <mesh geometry={geos.rock} material={palette.cliffRock} position={[-0.6, 0.18, 0.4]} castShadow />
      <mesh geometry={geos.rock} material={palette.cliffRock} position={[0.6, 0.18, 0.4]} castShadow />
      <mesh ref={streamRef} geometry={geos.fall} material={palette.waterRibbon} position={[0, -1.45, 0.96]} />
      <group ref={foamRef} position={[0, -1.45, 1.05]}>
        <mesh geometry={geos.foam} material={palette.cloakTrim} position={[-0.22, -1.2, 0]} />
        <mesh geometry={geos.foam} material={palette.cloakTrim} position={[0.18, -1.28, 0.1]} scale={1.2} />
      </group>
    </group>
  );
};

const PondLilyProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, rotY, palette, onRegisterFrame }) => {
  const clusterRef = React.useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const padLg = new THREE.CylinderGeometry(0.32, 0.32, 0.04, 7);
    const padSm = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 7);
    const petal = new THREE.ConeGeometry(0.09, 0.18, 5);
    const stamen = new THREE.OctahedronGeometry(0.07, 0);
    return { padLg, padSm, petal, stamen };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (clusterRef.current) {
        clusterRef.current.position.y = Math.sin(elapsed * 1.8 + position[0]) * 0.015;
        clusterRef.current.rotation.y = rotY + Math.sin(elapsed * 0.7 + position[2]) * 0.06;
      }
    });
  }, [onRegisterFrame, position, rotY]);

  return (
    <group position={position}>
      <group ref={clusterRef} rotation={[0, rotY, 0]}>
        <mesh geometry={geos.padLg} material={palette.foliageLight} position={[-0.16, 0.01, 0.12]} receiveShadow />
        <mesh geometry={geos.padSm} material={palette.grassMoss} position={[0.28, 0.01, -0.18]} receiveShadow />
        <group position={[-0.16, 0.04, 0.12]}>
          <mesh geometry={geos.petal} material={palette.cloakTrim} position={[0.07, 0.06, 0]} rotation={[0, 0, -0.45]} />
          <mesh geometry={geos.petal} material={palette.cloakTrim} position={[-0.07, 0.06, 0]} rotation={[0, 0, 0.45]} />
          <mesh geometry={geos.petal} material={palette.cloakTrim} position={[0, 0.06, 0.07]} rotation={[0.45, 0, 0]} />
          <mesh geometry={geos.petal} material={palette.cloakTrim} position={[0, 0.06, -0.07]} rotation={[-0.45, 0, 0]} />
          <mesh geometry={geos.stamen} material={palette.cloakGold} position={[0, 0.09, 0]} />
        </group>
      </group>
    </group>
  );
};

const ForgeGearProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, rotY, palette, onRegisterFrame }) => {
  const wheelRef = React.useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const base = new THREE.BoxGeometry(0.92, 0.24, 0.92);
    const pedestal = new THREE.CylinderGeometry(0.28, 0.38, 0.56, 6);
    const axle = new THREE.CylinderGeometry(0.11, 0.11, 0.36, 8);
    const rim = new THREE.TorusGeometry(0.42, 0.09, 6, 12);
    const spoke = new THREE.BoxGeometry(0.76, 0.08, 0.08);
    const tooth = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    return { base, pedestal, axle, rim, spoke, tooth };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (wheelRef.current) {
        wheelRef.current.rotation.z = elapsed * 0.9;
      }
    });
  }, [onRegisterFrame]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.base} material={palette.cliffRock} position={[0, 0.12, 0]} castShadow receiveShadow />
      <mesh geometry={geos.pedestal} material={palette.sandstoneRuin} position={[0, 0.5, 0]} castShadow receiveShadow />
      <mesh geometry={geos.axle} material={palette.bronzeDark} position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <group ref={wheelRef} position={[0, 0.88, 0]}>
        <mesh geometry={geos.rim} material={palette.brassAccent} castShadow />
        <mesh geometry={geos.spoke} material={palette.bronzeDark} />
        <mesh geometry={geos.spoke} material={palette.bronzeDark} rotation={[0, 0, Math.PI / 2]} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4;
          return (
            <mesh
              key={i}
              geometry={geos.tooth}
              material={palette.brassAccent}
              position={[Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0]}
              rotation={[0, 0, a]}
            />
          );
        })}
      </group>
    </group>
  );
};

const CelestialOrreryProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, rotY, palette, onRegisterFrame }) => {
  const outerRingRef = React.useRef<THREE.Mesh>(null);
  const innerRingRef = React.useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.56, 0.68, 0.22, 8);
    const pillar = new THREE.CylinderGeometry(0.18, 0.26, 0.54, 8);
    const outerRing = new THREE.TorusGeometry(0.54, 0.04, 6, 18);
    const innerRing = new THREE.TorusGeometry(0.36, 0.032, 6, 16);
    const sun = new THREE.OctahedronGeometry(0.16, 0);
    const planet = new THREE.IcosahedronGeometry(0.08, 0);
    return { base, pillar, outerRing, innerRing, sun, planet };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (outerRingRef.current) {
        outerRingRef.current.rotation.y = elapsed * 0.55;
        outerRingRef.current.rotation.x = 0.52 + Math.sin(elapsed * 0.5) * 0.12;
      }
      if (innerRingRef.current) {
        innerRingRef.current.rotation.y = -elapsed * 1.1;
        innerRingRef.current.rotation.z = 0.45;
      }
    });
  }, [onRegisterFrame]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.11, 0]} castShadow receiveShadow />
      <mesh geometry={geos.pillar} material={palette.stonePaver} position={[0, 0.48, 0]} castShadow receiveShadow />
      <mesh geometry={geos.sun} material={palette.lanternGlow} position={[0, 1.24, 0]} />
      <mesh ref={outerRingRef} geometry={geos.outerRing} material={palette.brassAccent} position={[0, 1.24, 0]} />
      <group ref={innerRingRef} position={[0, 1.24, 0]}>
        <mesh geometry={geos.innerRing} material={palette.bronzeDark} />
        <mesh geometry={geos.planet} material={palette.crystalActive} position={[0.36, 0, 0]} />
        <mesh geometry={geos.planet} material={palette.stonePaver} position={[-0.36, 0, 0]} scale={0.75} />
      </group>
    </group>
  );
};

// === WORLDS BEYOND REGIONAL DECORATIONS ===

const VerdantArchProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, rotY, palette }) => {
  const geos = useMemo(() => {
    const col = new THREE.CylinderGeometry(0.14, 0.2, 1.45, 7);
    const beam = new THREE.BoxGeometry(1.56, 0.2, 0.28);
    const canopy = new THREE.DodecahedronGeometry(0.32, 0);
    return { col, beam, canopy };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.col} material={palette.woodWarm} position={[-0.56, 0.72, 0]} castShadow />
      <mesh geometry={geos.col} material={palette.woodWarm} position={[0.56, 0.72, 0]} castShadow />
      <mesh geometry={geos.beam} material={palette.woodWarm} position={[0, 1.5, 0]} castShadow />
      <mesh geometry={geos.canopy} material={palette.foliageLight} position={[-0.45, 1.68, 0]} scale={[1.1, 0.65, 1]} />
      <mesh geometry={geos.canopy} material={palette.foliageDeep} position={[0.45, 1.66, 0.05]} scale={[1.0, 0.6, 1]} />
      <mesh geometry={geos.canopy} material={palette.grassMoss} position={[0, 1.72, -0.05]} scale={[1.2, 0.5, 0.9]} />
    </group>
  );
};

const AncientRootTreeProp: React.FC<{
  position: [number, number, number];
  scale: number;
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, scale, rotY, palette }) => {
  const geos = useMemo(() => {
    const buttress = new THREE.ConeGeometry(0.45, 0.7, 5);
    const trunk = new THREE.CylinderGeometry(0.18, 0.34, 1.15, 7);
    const crown1 = new THREE.DodecahedronGeometry(0.75, 0);
    const crown2 = new THREE.DodecahedronGeometry(0.52, 0);
    return { buttress, trunk, crown1, crown2 };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <mesh geometry={geos.buttress} material={palette.woodWarm} position={[0, 0.35, 0]} castShadow />
      <mesh geometry={geos.trunk} material={palette.woodWarm} position={[0, 0.68, 0]} castShadow />
      <mesh geometry={geos.crown1} material={palette.foliageDeep} position={[0, 1.52, 0]} scale={[1.25, 0.75, 1.2]} castShadow />
      <mesh geometry={geos.crown2} material={palette.foliageLight} position={[0.38, 1.72, 0.2]} scale={[1.05, 0.7, 1]} castShadow />
      <mesh geometry={geos.crown2} material={palette.foliageLight} position={[-0.35, 1.66, -0.18]} scale={[0.95, 0.68, 0.95]} />
    </group>
  );
};

const TidalFountainProp: React.FC<{
  position: [number, number, number];
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, palette, onRegisterFrame }) => {
  const orbRef = React.useRef<THREE.Mesh>(null);
  const geos = useMemo(() => {
    const basin = new THREE.CylinderGeometry(0.68, 0.54, 0.32, 8);
    const pool = new THREE.CylinderGeometry(0.56, 0.56, 0.06, 8);
    const spire = new THREE.CylinderGeometry(0.14, 0.22, 0.68, 6);
    const orb = new THREE.OctahedronGeometry(0.18, 0);
    return { basin, pool, spire, orb };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (orbRef.current) {
        orbRef.current.position.y = 1.05 + Math.sin(elapsed * 2.4) * 0.07;
        orbRef.current.rotation.y = elapsed * 1.4;
      }
    });
  }, [onRegisterFrame]);
  return (
    <group position={position}>
      <mesh geometry={geos.basin} material={palette.stonePaver} position={[0, 0.16, 0]} castShadow receiveShadow />
      <mesh geometry={geos.pool} material={palette.waterRibbon} position={[0, 0.33, 0]} />
      <mesh geometry={geos.spire} material={palette.sandstoneRuin} position={[0, 0.55, 0]} castShadow />
      <mesh ref={orbRef} geometry={geos.orb} material={palette.crystalActive} position={[0, 1.05, 0]} />
    </group>
  );
};

const CoralSpireProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, rotY, palette }) => {
  const geos = useMemo(() => {
    const base = new THREE.DodecahedronGeometry(0.32, 0);
    const branch = new THREE.CylinderGeometry(0.08, 0.14, 0.92, 6);
    const tip = new THREE.DodecahedronGeometry(0.14, 0);
    return { base, branch, tip };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.base} material={palette.sandstoneRuin} position={[0, 0.16, 0]} scale={[1.2, 0.55, 1.2]} />
      <mesh geometry={geos.branch} material={palette.coralAccent} position={[0, 0.55, 0]} castShadow />
      <mesh geometry={geos.branch} material={palette.coralAccent} position={[0.2, 0.45, 0.08]} rotation={[0.15, 0, -0.45]} scale={0.75} castShadow />
      <mesh geometry={geos.branch} material={palette.coralAccent} position={[-0.18, 0.48, -0.06]} rotation={[-0.1, 0, 0.4]} scale={0.8} castShadow />
      <mesh geometry={geos.tip} material={palette.lanternGlow} position={[0, 1.04, 0]} />
    </group>
  );
};

const EmberBrazierProp: React.FC<{
  position: [number, number, number];
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, palette, onRegisterFrame }) => {
  const flameRef = React.useRef<THREE.Mesh>(null);
  const geos = useMemo(() => {
    const pedestal = new THREE.CylinderGeometry(0.38, 0.5, 0.48, 6);
    const bowl = new THREE.CylinderGeometry(0.48, 0.3, 0.26, 6);
    const flame = new THREE.OctahedronGeometry(0.22, 0);
    return { pedestal, bowl, flame };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (flameRef.current) {
        const sc = 0.92 + Math.sin(elapsed * 6.5 + position[0]) * 0.14;
        flameRef.current.scale.set(sc, sc * 1.4, sc);
        flameRef.current.rotation.y = elapsed * 2.2;
      }
    });
  }, [onRegisterFrame, position]);
  return (
    <group position={position}>
      <mesh geometry={geos.pedestal} material={palette.basaltTop} position={[0, 0.24, 0]} castShadow />
      <mesh geometry={geos.bowl} material={palette.bronzeDark} position={[0, 0.58, 0]} castShadow />
      <mesh ref={flameRef} geometry={geos.flame} material={palette.lanternGlow} position={[0, 0.88, 0]} />
    </group>
  );
};

const BasaltObeliskProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
}> = ({ position, rotY, palette }) => {
  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.48, 0.58, 0.24, 6);
    const spire = new THREE.CylinderGeometry(0.22, 0.36, 1.55, 6);
    const band = new THREE.TorusGeometry(0.32, 0.04, 6, 12);
    return { base, spire, band };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.base} material={palette.cliffDeep} position={[0, 0.12, 0]} castShadow />
      <mesh geometry={geos.spire} material={palette.basaltTop} position={[0, 0.98, 0]} castShadow />
      <mesh geometry={geos.band} material={palette.lanternGlow} position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

const SkyObeliskProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, rotY, palette, onRegisterFrame }) => {
  const ringRef = React.useRef<THREE.Mesh>(null);
  const geos = useMemo(() => {
    const base = new THREE.CylinderGeometry(0.45, 0.56, 0.28, 8);
    const shaft = new THREE.ConeGeometry(0.26, 1.45, 6);
    const ring = new THREE.TorusGeometry(0.42, 0.04, 6, 16);
    return { base, shaft, ring };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (ringRef.current) {
        ringRef.current.rotation.y = elapsed * 1.1;
        ringRef.current.rotation.x = 0.4 + Math.sin(elapsed * 0.9) * 0.15;
      }
    });
  }, [onRegisterFrame]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.base} material={palette.cloudTop} position={[0, 0.14, 0]} castShadow />
      <mesh geometry={geos.shaft} material={palette.stonePaver} position={[0, 0.96, 0]} castShadow />
      <mesh ref={ringRef} geometry={geos.ring} material={palette.brassAccent} position={[0, 1.38, 0]} />
    </group>
  );
};

const WindChimeProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, rotY, palette, onRegisterFrame }) => {
  const chimesRef = React.useRef<THREE.Group>(null);
  const geos = useMemo(() => {
    const post = new THREE.CylinderGeometry(0.08, 0.12, 1.65, 6);
    const arm = new THREE.BoxGeometry(0.75, 0.09, 0.1);
    const pipe = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 6);
    return { post, arm, pipe };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (chimesRef.current) {
        chimesRef.current.rotation.z = Math.sin(elapsed * 2.2 + position[0]) * 0.08;
      }
    });
  }, [onRegisterFrame, position]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.post} material={palette.woodWarm} position={[-0.28, 0.82, 0]} castShadow />
      <mesh geometry={geos.arm} material={palette.brassAccent} position={[0, 1.6, 0]} castShadow />
      <group ref={chimesRef} position={[0.12, 1.54, 0]}>
        <mesh geometry={geos.pipe} material={palette.crystalActive} position={[-0.14, -0.26, 0]} />
        <mesh geometry={geos.pipe} material={palette.brassAccent} position={[0, -0.32, 0]} scale={[1, 1.15, 1]} />
        <mesh geometry={geos.pipe} material={palette.crystalActive} position={[0.14, -0.24, 0]} scale={[1, 0.85, 1]} />
      </group>
    </group>
  );
};

const EchoMonolithProp: React.FC<{
  position: [number, number, number];
  rotY: number;
  palette: LumaMaterialPalette;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}> = ({ position, rotY, palette, onRegisterFrame }) => {
  const shardRef = React.useRef<THREE.Mesh>(null);
  const geos = useMemo(() => {
    const plinth = new THREE.BoxGeometry(0.84, 0.2, 0.84);
    const wing = new THREE.BoxGeometry(0.22, 1.4, 0.36);
    const shard = new THREE.OctahedronGeometry(0.2, 0);
    return { plinth, wing, shard };
  }, []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  React.useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (shardRef.current) {
        shardRef.current.position.y = 1.08 + Math.sin(elapsed * 2.3) * 0.08;
        shardRef.current.rotation.y = elapsed * 1.4;
      }
    });
  }, [onRegisterFrame]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={geos.plinth} material={palette.basaltTop} position={[0, 0.1, 0]} castShadow />
      <mesh geometry={geos.wing} material={palette.cliffDeep} position={[-0.28, 0.82, 0]} rotation={[0, 0, 0.08]} castShadow />
      <mesh geometry={geos.wing} material={palette.cliffDeep} position={[0.28, 0.82, 0]} rotation={[0, 0, -0.08]} castShadow />
      <mesh ref={shardRef} geometry={geos.shard} material={palette.echoMat} position={[0, 1.08, 0]} scale={[0.85, 1.35, 0.85]} />
    </group>
  );
};

export const EnvironmentPropsLayer: React.FC<EnvironmentPropsLayerProps> = ({
  tiles,
  palette,
  onRegisterFrame,
}) => {
  const decorTiles = useMemo(() => tiles.filter((t) => Boolean(t.decor)), [tiles]);

  return (
    <group name="EnvironmentProps">
      {decorTiles.map((tile) => {
        const pos: [number, number, number] = [
          tile.x * TILE_SIZE,
          tile.elevation * ELEVATION_STEP,
          tile.z * TILE_SIZE,
        ];
        const rotY = tile.decorRotation ?? ((tile.x * 37 + tile.z * 73) % 6) * 0.55;
        const scale = 0.92 + ((Math.abs(tile.x * 13 + tile.z * 7) % 5) * 0.05);
        const key = `${tile.x}_${tile.z}_${tile.decor}`;
        const kind: DecorType = tile.decor!;

        switch (kind) {
          case 'tree_pine':
            return <PineTree key={key} position={pos} scale={scale} rotY={rotY} palette={palette} />;
          case 'tree_broad':
            return <BroadTree key={key} position={pos} scale={scale} rotY={rotY} palette={palette} />;
          case 'rock_cluster':
            return <RockCluster key={key} position={pos} rotY={rotY} palette={palette} />;
          case 'ruin_pillar':
            return <RuinPillar key={key} position={pos} rotY={rotY} palette={palette} />;
          case 'ruin_arch':
            return <RuinArch key={key} position={pos} rotY={rotY} palette={palette} />;
          case 'stone_lantern':
            return <StoneLantern key={key} position={pos} palette={palette} />;
          case 'waterfall':
            return (
              <WaterfallProp
                key={key}
                position={pos}
                palette={palette}
                onRegisterFrame={onRegisterFrame}
              />
            );
          case 'pond_lily':
            return (
              <PondLilyProp
                key={key}
                position={pos}
                rotY={rotY}
                palette={palette}
                onRegisterFrame={onRegisterFrame}
              />
            );
          case 'forge_gear':
            return (
              <ForgeGearProp
                key={key}
                position={pos}
                rotY={rotY}
                palette={palette}
                onRegisterFrame={onRegisterFrame}
              />
            );
          case 'celestial_orrery':
            return (
              <CelestialOrreryProp
                key={key}
                position={pos}
                rotY={rotY}
                palette={palette}
                onRegisterFrame={onRegisterFrame}
              />
            );
          case 'verdant_arch':
            return <VerdantArchProp key={key} position={pos} rotY={rotY} palette={palette} />;
          case 'ancient_root_tree':
            return <AncientRootTreeProp key={key} position={pos} scale={scale} rotY={rotY} palette={palette} />;
          case 'tidal_fountain':
            return <TidalFountainProp key={key} position={pos} palette={palette} onRegisterFrame={onRegisterFrame} />;
          case 'coral_spire':
            return <CoralSpireProp key={key} position={pos} rotY={rotY} palette={palette} />;
          case 'ember_brazier_prop':
            return <EmberBrazierProp key={key} position={pos} palette={palette} onRegisterFrame={onRegisterFrame} />;
          case 'basalt_obelisk':
            return <BasaltObeliskProp key={key} position={pos} rotY={rotY} palette={palette} />;
          case 'sky_obelisk':
            return <SkyObeliskProp key={key} position={pos} rotY={rotY} palette={palette} onRegisterFrame={onRegisterFrame} />;
          case 'wind_chime':
            return <WindChimeProp key={key} position={pos} rotY={rotY} palette={palette} onRegisterFrame={onRegisterFrame} />;
          case 'echo_monolith':
            return <EchoMonolithProp key={key} position={pos} rotY={rotY} palette={palette} onRegisterFrame={onRegisterFrame} />;
        }
      })}
    </group>
  );
};
