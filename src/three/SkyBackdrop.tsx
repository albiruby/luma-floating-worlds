import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WORLDS } from '../game/worlds';
import { WorldDefinition } from '../game/types';

interface SkyBackdropProps {
  world?: WorldDefinition;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}

const DISTANT_ISLANDS = [
  { x: -36, y: -12.5, z: -20, scale: 1.4, rot: 0.4 },
  { x: 34, y: -13.2, z: -22, scale: 1.65, rot: 1.2 },
  { x: -34, y: -11.0, z: 20, scale: 1.1, rot: 2.1 },
  { x: 32, y: -12.8, z: 22, scale: 1.25, rot: 0.9 },
];

const CLOUDS = [
  { x: -16, y: -6.2, z: -12, scale: 1.3, speed: 0.28 },
  { x: 14, y: -6.8, z: -15, scale: 1.6, speed: 0.22 },
  { x: -18, y: -5.4, z: 12, scale: 1.1, speed: 0.32 },
  { x: 18, y: -6.4, z: 10, scale: 1.4, speed: 0.25 },
  { x: 2, y: -7.8, z: -22, scale: 1.8, speed: 0.18 },
];

const MOTE_COUNT = 32;

export const SkyBackdrop: React.FC<SkyBackdropProps> = ({
  world = WORLDS[0],
  onRegisterFrame,
}) => {
  const cloudGroupRef = useRef<THREE.Group>(null);
  const motesRef = useRef<THREE.InstancedMesh>(null);

  const skyResources = useMemo(() => {
    const skyGeo = new THREE.SphereGeometry(85, 24, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(world.biome.skyTop) },
        midColor: { value: new THREE.Color(world.biome.skyMid) },
        bottomColor: { value: new THREE.Color(world.biome.skyBottom) },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPos;
        void main() {
          float h = normalize(vWorldPos).y;
          vec3 col = mix(bottomColor, midColor, smoothstep(-0.25, 0.15, h));
          col = mix(col, topColor, smoothstep(0.15, 0.72, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const islandTopGeo = new THREE.CylinderGeometry(2.4, 2.1, 0.45, 7);
    const islandRockGeo = new THREE.ConeGeometry(2.1, 3.8, 7);
    const islandTreeGeo = new THREE.ConeGeometry(0.55, 1.3, 6);
    const islandTopMat = new THREE.MeshStandardMaterial({
      color: world.biome.grassTop,
      roughness: 0.95,
      flatShading: true,
    });
    const islandRockMat = new THREE.MeshStandardMaterial({
      color: world.biome.cliffRock,
      roughness: 0.95,
      flatShading: true,
    });

    const cloudPuffGeo = new THREE.DodecahedronGeometry(1.0, 0);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf7f9fa,
      roughness: 0.92,
      metalness: 0.0,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });

    const moteGeo = new THREE.OctahedronGeometry(0.08, 0);
    const moteMat = new THREE.MeshBasicMaterial({
      color: world.biome.accentEmissive,
      transparent: true,
      opacity: 0.72,
    });

    return {
      skyGeo,
      skyMat,
      islandTopGeo,
      islandRockGeo,
      islandTreeGeo,
      islandTopMat,
      islandRockMat,
      cloudPuffGeo,
      cloudMat,
      moteGeo,
      moteMat,
    };
  }, []);

  // Update sky & silhouette colors dynamically when switching worlds
  useEffect(() => {
    skyResources.skyMat.uniforms.topColor.value.set(world.biome.skyTop);
    skyResources.skyMat.uniforms.midColor.value.set(world.biome.skyMid);
    skyResources.skyMat.uniforms.bottomColor.value.set(world.biome.skyBottom);
    skyResources.islandTopMat.color.setHex(world.biome.grassTop);
    skyResources.islandRockMat.color.setHex(world.biome.cliffRock);
    skyResources.moteMat.color.setHex(world.biome.accentEmissive);
    if (world.theme === 'emberfall') {
      skyResources.cloudMat.color.setHex(0xe3b9a8);
      skyResources.cloudMat.opacity = 0.65;
    } else if (world.theme === 'echo_trials') {
      skyResources.cloudMat.color.setHex(0xcbd5f5);
      skyResources.cloudMat.opacity = 0.55;
    } else {
      skyResources.cloudMat.color.setHex(0xf7f9fa);
      skyResources.cloudMat.opacity = 0.88;
    }
  }, [skyResources, world]);

  useEffect(() => {
    return () => {
      skyResources.skyGeo.dispose();
      skyResources.skyMat.dispose();
      skyResources.islandTopGeo.dispose();
      skyResources.islandRockGeo.dispose();
      skyResources.islandTreeGeo.dispose();
      skyResources.islandTopMat.dispose();
      skyResources.islandRockMat.dispose();
      skyResources.cloudPuffGeo.dispose();
      skyResources.cloudMat.dispose();
      skyResources.moteGeo.dispose();
      skyResources.moteMat.dispose();
    };
  }, [skyResources]);

  const moteSeeds = useMemo(
    () =>
      Array.from({ length: MOTE_COUNT }).map((_, i) => ({
        baseX: ((i * 73) % 24) - 12,
        baseY: 0.6 + ((i * 19) % 45) / 10,
        baseZ: ((i * 47) % 18) - 9,
        phase: i * 0.7,
        speed: 0.4 + (i % 5) * 0.14,
      })),
    []
  );

  // Pre-allocate scratch math helpers outside loop (zero GC)
  const scratchObj = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    return onRegisterFrame((_dt, elapsed) => {
      if (cloudGroupRef.current) {
        cloudGroupRef.current.children.forEach((cloud, idx) => {
          const cfg = CLOUDS[idx];
          if (!cfg) return;
          const span = 44;
          const x = (((cfg.x + elapsed * cfg.speed + span / 2) % span) + span) % span - span / 2;
          cloud.position.x = x;
          cloud.position.y = cfg.y + Math.sin(elapsed * 0.5 + idx) * 0.18;
        });
      }

      if (motesRef.current) {
        for (let i = 0; i < MOTE_COUNT; i++) {
          const s = moteSeeds[i];
          scratchObj.position.set(
            s.baseX + Math.sin(elapsed * s.speed + s.phase) * 0.6,
            s.baseY + Math.cos(elapsed * (s.speed * 1.2) + s.phase) * 0.35,
            s.baseZ + Math.cos(elapsed * s.speed + s.phase) * 0.5
          );
          scratchObj.rotation.set(0, elapsed * 1.2 + s.phase, 0);
          const sc = 0.65 + Math.sin(elapsed * 2 + s.phase) * 0.35;
          scratchObj.scale.setScalar(sc);
          scratchObj.updateMatrix();
          motesRef.current.setMatrixAt(i, scratchObj.matrix);
        }
        motesRef.current.instanceMatrix.needsUpdate = true;
      }
    });
  }, [moteSeeds, onRegisterFrame, scratchObj]);

  return (
    <group name="SkyBackdrop">
      <mesh geometry={skyResources.skyGeo} material={skyResources.skyMat} />

      {/* Distant Floating Silhouettes */}
      {DISTANT_ISLANDS.map((isl, idx) => (
        <group
          key={idx}
          position={[isl.x, isl.y, isl.z]}
          scale={isl.scale}
          rotation={[0, isl.rot, 0]}
        >
          <mesh geometry={skyResources.islandTopGeo} material={skyResources.islandTopMat} />
          <mesh
            geometry={skyResources.islandRockGeo}
            material={skyResources.islandRockMat}
            position={[0, -2.05, 0]}
            rotation={[Math.PI, 0, 0]}
          />
          <mesh
            geometry={skyResources.islandTreeGeo}
            material={skyResources.islandTopMat}
            position={[-0.6, 0.85, 0.4]}
          />
          <mesh
            geometry={skyResources.islandTreeGeo}
            material={skyResources.islandTopMat}
            position={[0.5, 0.72, -0.3]}
            scale={0.8}
          />
        </group>
      ))}

      {/* Drifting Stylized Low-Poly Clouds */}
      <group ref={cloudGroupRef}>
        {CLOUDS.map((c, idx) => (
          <group key={idx} position={[c.x, c.y, c.z]} scale={c.scale}>
            <mesh geometry={skyResources.cloudPuffGeo} material={skyResources.cloudMat} scale={[1.7, 0.58, 1.1]} />
            <mesh
              geometry={skyResources.cloudPuffGeo}
              material={skyResources.cloudMat}
              position={[1.1, -0.1, 0.2]}
              scale={[1.1, 0.48, 0.9]}
            />
            <mesh
              geometry={skyResources.cloudPuffGeo}
              material={skyResources.cloudMat}
              position={[-1.05, -0.08, -0.15]}
              scale={[1.05, 0.45, 0.85]}
            />
          </group>
        ))}
      </group>

      {/* Pooled Floating Sky Motes */}
      <instancedMesh
        ref={motesRef}
        args={[skyResources.moteGeo, skyResources.moteMat, MOTE_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
};
