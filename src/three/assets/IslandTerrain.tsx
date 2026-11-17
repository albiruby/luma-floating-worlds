import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ELEVATION_STEP, TILE_SIZE, TileDef, WorldTheme } from '../../game/types';
import { LumaMaterialPalette } from '../materials';

interface IslandTerrainProps {
  tiles: TileDef[];
  palette: LumaMaterialPalette;
  worldTheme?: WorldTheme;
}

export const IslandTerrain: React.FC<IslandTerrainProps> = ({
  tiles,
  palette,
  worldTheme = 'first_light',
}) => {
  const grassTuftsRef = useRef<THREE.InstancedMesh>(null);

  const geos = useMemo(() => {
    const capGeo = new THREE.BoxGeometry(TILE_SIZE, 0.2, TILE_SIZE);
    const paverGeo = new THREE.BoxGeometry(TILE_SIZE * 0.88, 0.08, TILE_SIZE * 0.88);
    const waterSurfaceGeo = new THREE.BoxGeometry(TILE_SIZE * 0.84, 0.08, TILE_SIZE * 0.84);
    const waterRimNSGeo = new THREE.BoxGeometry(TILE_SIZE, 0.14, 0.16);
    const waterRimEWGeo = new THREE.BoxGeometry(0.16, 0.14, TILE_SIZE * 0.84);
    const stairStepGeo = new THREE.BoxGeometry(TILE_SIZE * 0.88, 0.22, TILE_SIZE * 0.45);
    const soilGeo = new THREE.BoxGeometry(TILE_SIZE * 0.99, 0.52, TILE_SIZE * 0.99);
    const cliffUpperGeo = new THREE.CylinderGeometry(TILE_SIZE * 0.68, TILE_SIZE * 0.45, 1.55, 7);
    const cliffLowerGeo = new THREE.DodecahedronGeometry(TILE_SIZE * 0.48, 0);
    const cliffSpireGeo = new THREE.ConeGeometry(TILE_SIZE * 0.42, 2.1, 6);
    const tuftGeo = new THREE.ConeGeometry(0.065, 0.28, 4);
    return {
      capGeo,
      paverGeo,
      waterSurfaceGeo,
      waterRimNSGeo,
      waterRimEWGeo,
      stairStepGeo,
      soilGeo,
      cliffUpperGeo,
      cliffLowerGeo,
      cliffSpireGeo,
      tuftGeo,
    };
  }, []);

  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const tileLookup = useMemo(() => {
    const map = new Map<string, TileDef>();
    tiles.forEach((t) => map.set(`${t.x},${t.z}`, t));
    return map;
  }, [tiles]);

  // Organic multi-blade grass/moss/flower tufts tuned by world theme
  const tuftEntries = useMemo(() => {
    const items: Array<{
      x: number;
      y: number;
      z: number;
      sx: number;
      sy: number;
      rotY: number;
      tiltX: number;
      color: number;
    }> = [];

    const themeColors: Record<WorldTheme, [number, number, number, number]> = {
      first_light: [0x76c252, 0x4f943f, 0xf2dc74, 0xfaf5df],
      verdant_reach: [0x58b85a, 0x327d48, 0xbef573, 0xfff3b8],
      tidal_expanse: [0x67bda8, 0x3d8c80, 0xf7b2a6, 0xfff5e0],
      emberfall: [0x8c7056, 0x5c4738, 0xff9347, 0xffcc66],
      celestial_frontier: [0x7a9de6, 0x4e70bd, 0xffe48f, 0x99f6ff],
      echo_trials: [0x798ce0, 0x4f5fa8, 0xe9a3ff, 0x93f5ff],
    };
    const colors = themeColors[worldTheme] ?? themeColors.first_light;

    tiles.forEach((tile) => {
      if ((tile.terrain !== 'grass' && tile.terrain !== 'moss') || tile.decor) return;
      const baseY = tile.elevation * ELEVATION_STEP;
      const hashBase = Math.abs((tile.x * 73856093) ^ (tile.z * 19349663));
      const clusterCount = 1 + (hashBase % 3);
      for (let c = 0; c < clusterCount; c++) {
        const ch = (hashBase + c * 4999) % 1000;
        const cx = ((ch % 100) / 100 - 0.5) * 1.3;
        const cz = ((Math.floor(ch / 10) % 100) / 100 - 0.5) * 1.3;
        const blades = 2 + (ch % 2);
        for (let b = 0; b < blades; b++) {
          const bh = (ch + b * 313) % 100;
          const isFlower = c === 0 && b === 0 && ch % 5 === 0;
          items.push({
            x: tile.x * TILE_SIZE + cx + (b - 0.5) * 0.08,
            y: baseY + 0.1,
            z: tile.z * TILE_SIZE + cz + ((b % 2) - 0.5) * 0.08,
            sx: isFlower ? 1.3 : 0.75 + (bh % 35) / 100,
            sy: isFlower ? 0.85 : 0.7 + (bh % 50) / 100,
            rotY: (bh % 628) / 100,
            tiltX: ((bh % 20) - 10) * 0.025,
            color: isFlower ? colors[2 + (ch % 2)] : colors[bh % 2],
          });
        }
      }
    });
    return items;
  }, [tiles, worldTheme]);

  React.useLayoutEffect(() => {
    const mesh = grassTuftsRef.current;
    if (!mesh || tuftEntries.length === 0) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    tuftEntries.forEach((item, idx) => {
      dummy.position.set(item.x, item.y, item.z);
      dummy.rotation.set(item.tiltX, item.rotY, 0);
      dummy.scale.set(item.sx, item.sy, item.sx);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
      color.setHex(item.color);
      mesh.setColorAt(idx, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [tuftEntries]);

  return (
    <group name="IslandTerrain">
      {tiles.map((tile) => {
        const wx = tile.x * TILE_SIZE;
        const wz = tile.z * TILE_SIZE;
        const topY = tile.elevation * ELEVATION_STEP;
        const hash = Math.abs((tile.x * 31 + tile.z * 17) % 13);
        const jitterX = ((hash % 5) - 2) * 0.06;
        const jitterZ = (((hash + 3) % 5) - 2) * 0.06;

        const neighborCount =
          (tileLookup.has(`${tile.x + 1},${tile.z}`) ? 1 : 0) +
          (tileLookup.has(`${tile.x - 1},${tile.z}`) ? 1 : 0) +
          (tileLookup.has(`${tile.x},${tile.z + 1}`) ? 1 : 0) +
          (tileLookup.has(`${tile.x},${tile.z - 1}`) ? 1 : 0);

        const isWater = tile.terrain === 'water';
        const capMaterial =
          tile.terrain === 'grass'
            ? palette.grassTop
            : tile.terrain === 'moss'
              ? palette.grassMoss
              : tile.terrain === 'stone'
                ? palette.stonePaver
                : tile.terrain === 'wood'
                  ? palette.woodWarm
                  : tile.terrain === 'sand'
                    ? palette.sandTop
                    : tile.terrain === 'basalt'
                      ? palette.basaltTop
                      : tile.terrain === 'cloud'
                        ? palette.cloudTop
                        : isWater
                          ? palette.cliffRock
                          : palette.sandstoneRuin;

        const hasPaverSlab =
          tile.terrain === 'stone' ||
          tile.terrain === 'ruin' ||
          tile.terrain === 'wood' ||
          tile.terrain === 'basalt' ||
          tile.terrain === 'cloud';

        const paverMat =
          tile.terrain === 'ruin'
            ? palette.sandstoneRuin
            : tile.terrain === 'wood'
              ? palette.woodWarm
              : tile.terrain === 'basalt'
                ? palette.basaltTop
                : tile.terrain === 'cloud'
                  ? palette.cloudTop
                  : palette.stonePaver;

        let stairRotY = 0;
        if (tile.isStair) {
          const n = tileLookup.get(`${tile.x},${tile.z - 1}`);
          const s = tileLookup.get(`${tile.x},${tile.z + 1}`);
          const e = tileLookup.get(`${tile.x + 1},${tile.z}`);
          const w = tileLookup.get(`${tile.x - 1},${tile.z}`);
          if (n && n.elevation > tile.elevation) stairRotY = 0;
          else if (s && s.elevation > tile.elevation) stairRotY = Math.PI;
          else if (e && e.elevation > tile.elevation) stairRotY = -Math.PI / 2;
          else if (w && w.elevation > tile.elevation) stairRotY = Math.PI / 2;
        }

        return (
          <group key={`${tile.x}_${tile.z}`} position={[wx, topY, wz]}>
            {/* Surface Cap */}
            <mesh
              geometry={geos.capGeo}
              material={capMaterial}
              position={[0, isWater ? -0.17 : -0.1, 0]}
              castShadow
              receiveShadow
            />

            {/* Recessed Pond / Lava Basin & Curb */}
            {isWater && (
              <group>
                <mesh
                  geometry={geos.waterSurfaceGeo}
                  material={palette.waterRibbon}
                  position={[0, -0.05, 0]}
                  receiveShadow
                />
                <mesh geometry={geos.waterRimNSGeo} material={palette.sandstoneRuin} position={[0, -0.03, 0.92]} receiveShadow />
                <mesh geometry={geos.waterRimNSGeo} material={palette.sandstoneRuin} position={[0, -0.03, -0.92]} receiveShadow />
                <mesh geometry={geos.waterRimEWGeo} material={palette.sandstoneRuin} position={[0.92, -0.03, 0]} receiveShadow />
                <mesh geometry={geos.waterRimEWGeo} material={palette.sandstoneRuin} position={[-0.92, -0.03, 0]} receiveShadow />
              </group>
            )}

            {/* Beveled paver slab */}
            {hasPaverSlab && (
              <mesh
                geometry={geos.paverGeo}
                material={paverMat}
                position={[0, -0.02, 0]}
                receiveShadow
              />
            )}

            {/* Stepped stair risers */}
            {tile.isStair && (
              <group rotation={[0, stairRotY, 0]}>
                <mesh
                  geometry={geos.stairStepGeo}
                  material={palette.sandstoneRuin}
                  position={[0, 0.11, -0.05]}
                  castShadow
                  receiveShadow
                />
                <mesh
                  geometry={geos.stairStepGeo}
                  material={palette.stonePaver}
                  position={[0, 0.33, -0.45]}
                  castShadow
                  receiveShadow
                />
              </group>
            )}

            {/* Stratified earth & sculpted rock underside */}
            <mesh
              geometry={geos.soilGeo}
              material={palette.soilLayer}
              position={[0, -0.46, 0]}
              receiveShadow
            />
            <mesh
              geometry={geos.cliffUpperGeo}
              material={palette.cliffRock}
              position={[jitterX, -1.44, jitterZ]}
              rotation={[0, (hash * 0.65) % Math.PI, 0]}
              scale={[1 + (hash % 3) * 0.08, 0.9 + neighborCount * 0.12, 1 + ((hash + 1) % 3) * 0.08]}
              receiveShadow
            />
            <mesh
              geometry={geos.cliffLowerGeo}
              material={palette.cliffDeep}
              position={[jitterX * 1.4, -2.1 - neighborCount * 0.18, jitterZ * 1.4]}
              rotation={[hash * 0.3, hash * 0.7, 0]}
              scale={[1.05, 1.15 + neighborCount * 0.14, 1.05]}
            />
            {neighborCount >= 3 && hash % 2 === 0 && (
              <mesh
                geometry={geos.cliffSpireGeo}
                material={palette.cliffDeep}
                position={[jitterX * 0.8, -3.1, jitterZ * 0.8]}
                rotation={[Math.PI, hash * 0.9, 0]}
                scale={[0.9 + (hash % 3) * 0.15, 0.85 + (hash % 4) * 0.15, 0.9 + (hash % 3) * 0.15]}
              />
            )}
          </group>
        );
      })}

      {tuftEntries.length > 0 && (
        <instancedMesh
          ref={grassTuftsRef}
          args={[geos.tuftGeo, palette.grassTop, tuftEntries.length]}
          frustumCulled={false}
        />
      )}
    </group>
  );
};
