import * as THREE from 'three';
import { WORLDS } from '../game/worlds';
import { WorldDefinition } from '../game/types';

function createGrainCanvasTexture(
  baseGrey: number,
  variance: number,
  streakX: number,
  streakY: number,
  size = 128
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = `rgb(${baseGrey},${baseGrey},${baseGrey})`;
    ctx.fillRect(0, 0, size, size);

    // Deterministic pseudo-random speckles for tileable organic micro-relief
    let seed = 1337 + baseGrey * 17;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < 650; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const w = 1 + rand() * streakX;
      const h = 1 + rand() * streakY;
      const shade = Math.max(0, Math.min(255, Math.round(baseGrey + (rand() - 0.5) * variance * 2)));
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, w, h);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(18, 28, 34, 0.52)');
    grad.addColorStop(0.55, 'rgba(18, 28, 34, 0.22)');
    grad.addColorStop(1, 'rgba(18, 28, 34, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export interface LumaMaterialPalette {
  grassTop: THREE.MeshStandardMaterial;
  grassMoss: THREE.MeshStandardMaterial;
  stonePaver: THREE.MeshStandardMaterial;
  sandstoneRuin: THREE.MeshStandardMaterial;
  sandTop: THREE.MeshStandardMaterial;
  basaltTop: THREE.MeshStandardMaterial;
  cloudTop: THREE.MeshStandardMaterial;
  soilLayer: THREE.MeshStandardMaterial;
  cliffRock: THREE.MeshStandardMaterial;
  cliffDeep: THREE.MeshStandardMaterial;
  woodWarm: THREE.MeshStandardMaterial;
  brassAccent: THREE.MeshStandardMaterial;
  bronzeDark: THREE.MeshStandardMaterial;
  foliageLight: THREE.MeshStandardMaterial;
  foliageDeep: THREE.MeshStandardMaterial;
  cloakGold: THREE.MeshStandardMaterial;
  cloakTrim: THREE.MeshStandardMaterial;
  skinWarm: THREE.MeshStandardMaterial;
  tunicTeal: THREE.MeshStandardMaterial;
  crystalDormant: THREE.MeshStandardMaterial;
  crystalActive: THREE.MeshStandardMaterial;
  lanternGlow: THREE.MeshStandardMaterial;
  echoMat: THREE.MeshStandardMaterial;
  coralAccent: THREE.MeshStandardMaterial;
  beamCore: THREE.MeshBasicMaterial;
  waterRibbon: THREE.MeshStandardMaterial;
  contactShadowTex: THREE.CanvasTexture;
  dispose: () => void;
}

export function applyWorldBiomeToPalette(
  palette: LumaMaterialPalette,
  world: WorldDefinition,
  restored = false
): void {
  const b = world.biome;
  palette.grassTop.color.setHex(b.grassTop);
  palette.grassMoss.color.setHex(b.grassRim);
  palette.stonePaver.color.setHex(b.stonePaver);
  palette.sandstoneRuin.color.setHex(b.sandstoneRuin);
  palette.cliffRock.color.setHex(b.cliffRock);
  palette.cliffDeep.color.setHex(b.cliffDeep);
  palette.woodWarm.color.setHex(b.woodPlank);
  palette.foliageLight.color.setHex(b.grassTop);
  palette.foliageDeep.color.setHex(b.grassRim);

  palette.waterRibbon.color.setHex(b.waterPool);
  if (world.theme === 'emberfall') {
    palette.waterRibbon.emissive.setHex(0xd94816);
    palette.waterRibbon.emissiveIntensity = restored ? 1.15 : 0.85;
    palette.waterRibbon.opacity = 0.94;
  } else {
    palette.waterRibbon.emissive.setHex(0x166d85);
    palette.waterRibbon.emissiveIntensity = restored ? 0.52 : 0.25;
    palette.waterRibbon.opacity = restored ? 0.9 : 0.84;
  }

  palette.crystalActive.color.setHex(b.accentEmissive);
  palette.crystalActive.emissive.setHex(b.accentEmissive);
  palette.crystalActive.emissiveIntensity =
    (world.theme === 'echo_trials' ? 1.45 : 1.1) + (restored ? 0.25 : 0);
  palette.beamCore.color.setHex(b.accentEmissive);
}

export function createLumaPalette(world: WorldDefinition = WORLDS[0]): LumaMaterialPalette {
  const stoneBump = createGrainCanvasTexture(128, 42, 4, 4);
  const grassBump = createGrainCanvasTexture(128, 34, 2, 6);
  const woodBump = createGrainCanvasTexture(128, 45, 14, 2);
  const contactShadowTex = createContactShadowTexture();

  const grassTop = new THREE.MeshStandardMaterial({
    color: world.biome.grassTop,
    roughness: 0.88,
    metalness: 0.02,
    bumpMap: grassBump,
    bumpScale: 0.03,
    flatShading: true,
  });

  const grassMoss = new THREE.MeshStandardMaterial({
    color: world.biome.grassRim,
    roughness: 0.9,
    metalness: 0.02,
    flatShading: true,
  });

  const stonePaver = new THREE.MeshStandardMaterial({
    color: world.biome.stonePaver,
    roughness: 0.82,
    metalness: 0.04,
    bumpMap: stoneBump,
    bumpScale: 0.035,
    flatShading: true,
  });

  const sandstoneRuin = new THREE.MeshStandardMaterial({
    color: world.biome.sandstoneRuin,
    roughness: 0.85,
    metalness: 0.05,
    bumpMap: stoneBump,
    bumpScale: 0.04,
    flatShading: true,
  });

  const sandTop = new THREE.MeshStandardMaterial({
    color: 0xdfcb96,
    roughness: 0.9,
    metalness: 0.01,
    bumpMap: stoneBump,
    bumpScale: 0.025,
    flatShading: true,
  });

  const basaltTop = new THREE.MeshStandardMaterial({
    color: 0x413942,
    roughness: 0.88,
    metalness: 0.08,
    bumpMap: stoneBump,
    bumpScale: 0.045,
    flatShading: true,
  });

  const cloudTop = new THREE.MeshStandardMaterial({
    color: 0xeef3fb,
    emissive: 0x1b2740,
    emissiveIntensity: 0.14,
    roughness: 0.72,
    metalness: 0.04,
    flatShading: true,
  });

  const soilLayer = new THREE.MeshStandardMaterial({
    color: 0x875c3c,
    roughness: 0.92,
    metalness: 0.0,
    flatShading: true,
  });

  const cliffRock = new THREE.MeshStandardMaterial({
    color: world.biome.cliffRock,
    roughness: 0.9,
    metalness: 0.04,
    bumpMap: stoneBump,
    bumpScale: 0.05,
    flatShading: true,
  });

  const cliffDeep = new THREE.MeshStandardMaterial({
    color: world.biome.cliffDeep,
    roughness: 0.93,
    metalness: 0.05,
    flatShading: true,
  });

  const woodWarm = new THREE.MeshStandardMaterial({
    color: world.biome.woodPlank,
    roughness: 0.78,
    metalness: 0.05,
    bumpMap: woodBump,
    bumpScale: 0.03,
    flatShading: true,
  });

  const brassAccent = new THREE.MeshStandardMaterial({
    color: 0xd99f3b,
    roughness: 0.32,
    metalness: 0.78,
    flatShading: true,
  });

  const bronzeDark = new THREE.MeshStandardMaterial({
    color: 0x594633,
    roughness: 0.48,
    metalness: 0.62,
    flatShading: true,
  });

  const foliageLight = new THREE.MeshStandardMaterial({
    color: world.biome.grassTop,
    roughness: 0.84,
    metalness: 0.02,
    flatShading: true,
  });

  const foliageDeep = new THREE.MeshStandardMaterial({
    color: world.biome.grassRim,
    roughness: 0.86,
    metalness: 0.02,
    flatShading: true,
  });

  const cloakGold = new THREE.MeshStandardMaterial({
    color: 0xe39b2b,
    roughness: 0.76,
    metalness: 0.04,
    flatShading: true,
  });

  const cloakTrim = new THREE.MeshStandardMaterial({
    color: 0xf4e4be,
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });

  const skinWarm = new THREE.MeshStandardMaterial({
    color: 0xf0c7a4,
    roughness: 0.72,
    metalness: 0.0,
    flatShading: true,
  });

  const tunicTeal = new THREE.MeshStandardMaterial({
    color: 0x2f6d75,
    roughness: 0.78,
    metalness: 0.05,
    flatShading: true,
  });

  const crystalDormant = new THREE.MeshStandardMaterial({
    color: 0x7ba5ad,
    emissive: 0x183c47,
    emissiveIntensity: 0.35,
    roughness: 0.28,
    metalness: 0.15,
    flatShading: true,
  });

  const crystalActive = new THREE.MeshStandardMaterial({
    color: world.biome.accentEmissive,
    emissive: world.biome.accentEmissive,
    emissiveIntensity: 1.15,
    roughness: 0.14,
    metalness: 0.12,
    flatShading: true,
  });

  const lanternGlow = new THREE.MeshStandardMaterial({
    color: 0xffe596,
    emissive: 0xffb845,
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.0,
  });

  const echoMat = new THREE.MeshStandardMaterial({
    color: 0xf0abfc,
    emissive: 0xa855f7,
    emissiveIntensity: 1.45,
    roughness: 0.16,
    metalness: 0.18,
    flatShading: true,
  });

  const coralAccent = new THREE.MeshStandardMaterial({
    color: 0xf47272,
    emissive: 0x5c1824,
    emissiveIntensity: 0.22,
    roughness: 0.65,
    metalness: 0.04,
    flatShading: true,
  });

  const beamCore = new THREE.MeshBasicMaterial({
    color: world.biome.accentEmissive,
    transparent: true,
    opacity: 0.88,
  });

  const waterRibbon = new THREE.MeshStandardMaterial({
    color: world.biome.waterPool,
    emissive: 0x166d85,
    emissiveIntensity: 0.25,
    roughness: 0.22,
    metalness: 0.08,
    transparent: true,
    opacity: 0.84,
    flatShading: true,
  });

  const allMaterials = [
    grassTop,
    grassMoss,
    stonePaver,
    sandstoneRuin,
    sandTop,
    basaltTop,
    cloudTop,
    soilLayer,
    cliffRock,
    cliffDeep,
    woodWarm,
    brassAccent,
    bronzeDark,
    foliageLight,
    foliageDeep,
    cloakGold,
    cloakTrim,
    skinWarm,
    tunicTeal,
    crystalDormant,
    crystalActive,
    lanternGlow,
    echoMat,
    coralAccent,
    beamCore,
    waterRibbon,
  ];
  const allTextures = [stoneBump, grassBump, woodBump, contactShadowTex];

  const palette: LumaMaterialPalette = {
    grassTop,
    grassMoss,
    stonePaver,
    sandstoneRuin,
    sandTop,
    basaltTop,
    cloudTop,
    soilLayer,
    cliffRock,
    cliffDeep,
    woodWarm,
    brassAccent,
    bronzeDark,
    foliageLight,
    foliageDeep,
    cloakGold,
    cloakTrim,
    skinWarm,
    tunicTeal,
    crystalDormant,
    crystalActive,
    lanternGlow,
    echoMat,
    coralAccent,
    beamCore,
    waterRibbon,
    contactShadowTex,
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
      allTextures.forEach((t) => t.dispose());
    },
  };

  applyWorldBiomeToPalette(palette, world);
  return palette;
}
