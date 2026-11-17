import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { DEFAULT_EQUIPPED_COSMETICS, resolveWayfinderAppearance } from '../../game/cosmetics';
import { getCharacterById } from '../../game/characters';
import { PlayerRuntimeState, PuzzleRuntimeState, WayfinderAppearance } from '../../game/types';
import { LumaMaterialPalette } from '../materials';

interface HeroModelProps {
  playerRef: React.MutableRefObject<PlayerRuntimeState>;
  puzzleStateRef?: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  isSoftwareGl: boolean;
  appearance?: WayfinderAppearance;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}

const DEFAULT_APPEARANCE = resolveWayfinderAppearance(DEFAULT_EQUIPPED_COSMETICS, 'wayfinder');
const AURA_MOTE_COUNT = 6;

export const HeroModel: React.FC<HeroModelProps> = ({
  playerRef,
  puzzleStateRef,
  palette,
  isSoftwareGl,
  appearance = DEFAULT_APPEARANCE,
  onRegisterFrame,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const lanternArmRef = useRef<THREE.Group>(null);
  const offArmRef = useRef<THREE.Mesh>(null);
  const cloakTailRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const lanternLightRef = useRef<THREE.PointLight>(null);
  const eternalAuraRef = useRef<THREE.Group>(null);
  const moteRefs = useRef<Array<THREE.Mesh | null>>([]);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  const heroDef = useMemo(() => getCharacterById(appearance.characterId), [appearance.characterId]);

  const geometries = useMemo(() => {
    const cloakPts = [
      new THREE.Vector2(0.32, 0.0),
      new THREE.Vector2(0.28, 0.28),
      new THREE.Vector2(0.21, 0.62),
      new THREE.Vector2(0.16, 0.74),
      new THREE.Vector2(0.0, 0.76),
    ];
    const cloakGeo = new THREE.LatheGeometry(cloakPts, 9);
    const tunicSlenderGeo = new THREE.CylinderGeometry(0.16, 0.25, 0.72, 8);
    const armorTorsoGeo = new THREE.BoxGeometry(0.38, 0.44, 0.26);
    const hoodGeo = new THREE.DodecahedronGeometry(0.22, 0);
    const headGeo = new THREE.IcosahedronGeometry(0.155, 1);
    const collarGeo = new THREE.TorusGeometry(0.165, 0.045, 6, 10);
    const packGeo = new THREE.BoxGeometry(0.22, 0.26, 0.14);
    const bedrollGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.26, 8);
    const bootGeo = new THREE.BoxGeometry(0.1, 0.16, 0.14);
    const lanternCapGeo = new THREE.ConeGeometry(0.085, 0.06, 6);
    const lanternCoreGeo = new THREE.OctahedronGeometry(0.055, 0);
    const staffGeo = new THREE.CylinderGeometry(0.025, 0.032, 0.92, 6);
    const armGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.24, 6);
    const shadowGeo = new THREE.CircleGeometry(0.42, 20);
    const crestGeo = new THREE.OctahedronGeometry(0.052, 0);
    const shoulderGeo = new THREE.BoxGeometry(0.13, 0.055, 0.14);
    const moteGeo = new THREE.OctahedronGeometry(0.038, 0);
    const brimGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.035, 10);
    const crownGeo = new THREE.ConeGeometry(0.14, 0.24, 5);
    const hornGeo = new THREE.ConeGeometry(0.035, 0.18, 5);
    const haloGeo = new THREE.TorusGeometry(0.21, 0.022, 6, 14);
    const wingGeo = new THREE.BoxGeometry(0.26, 0.05, 0.12);
    const tankGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.26, 8);
    const pulseRingGeo = new THREE.TorusGeometry(0.65, 0.045, 6, 24);

    return {
      cloakGeo,
      tunicSlenderGeo,
      armorTorsoGeo,
      hoodGeo,
      headGeo,
      collarGeo,
      packGeo,
      bedrollGeo,
      bootGeo,
      lanternCapGeo,
      lanternCoreGeo,
      staffGeo,
      armGeo,
      shadowGeo,
      crestGeo,
      shoulderGeo,
      moteGeo,
      brimGeo,
      crownGeo,
      hornGeo,
      haloGeo,
      wingGeo,
      tankGeo,
      pulseRingGeo,
    };
  }, []);

  const cosmeticMats = useMemo(() => {
    const cloak = new THREE.MeshStandardMaterial({
      color: DEFAULT_APPEARANCE.cloakColor,
      roughness: 0.76,
      metalness: 0.04,
      flatShading: true,
    });
    const trim = new THREE.MeshStandardMaterial({
      color: DEFAULT_APPEARANCE.cloakTrimColor,
      roughness: 0.78,
      metalness: 0.08,
      flatShading: true,
    });
    const tunic = new THREE.MeshStandardMaterial({
      color: DEFAULT_APPEARANCE.tunicColor,
      roughness: 0.78,
      metalness: 0.05,
      flatShading: true,
    });
    const skin = new THREE.MeshStandardMaterial({
      color: DEFAULT_APPEARANCE.skinColor,
      roughness: 0.72,
      metalness: 0.0,
      flatShading: true,
    });
    const lanternCore = new THREE.MeshStandardMaterial({
      color: DEFAULT_APPEARANCE.lanternCoreColor,
      emissive: DEFAULT_APPEARANCE.lanternEmissiveColor,
      emissiveIntensity: 1.85,
      roughness: 0.2,
      metalness: 0.0,
    });
    const lanternCage = new THREE.MeshStandardMaterial({
      color: DEFAULT_APPEARANCE.brassTintColor,
      roughness: 0.32,
      metalness: 0.78,
      flatShading: true,
    });
    const eternalMote = new THREE.MeshBasicMaterial({
      color: 0x7efcf0,
      transparent: true,
      opacity: 0.88,
    });
    const pulseRing = new THREE.MeshBasicMaterial({
      color: 0x64f7e6,
      transparent: true,
      opacity: 0.85,
    });
    const shadow = new THREE.MeshBasicMaterial({
      map: palette.contactShadowTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    return {
      cloak,
      trim,
      tunic,
      skin,
      lanternCore,
      lanternCage,
      eternalMote,
      pulseRing,
      shadow,
    };
  }, [palette.contactShadowTex]);

  useEffect(() => {
    cosmeticMats.cloak.color.setHex(appearance.cloakColor);
    cosmeticMats.trim.color.setHex(appearance.cloakTrimColor);
    cosmeticMats.trim.metalness = appearance.hasCelestialTrim ? 0.55 : 0.08;
    cosmeticMats.trim.roughness = appearance.hasCelestialTrim ? 0.38 : 0.76;
    cosmeticMats.tunic.color.setHex(appearance.tunicColor);
    cosmeticMats.skin.color.setHex(appearance.skinColor);
    cosmeticMats.lanternCore.color.setHex(appearance.lanternCoreColor);
    cosmeticMats.lanternCore.emissive.setHex(appearance.lanternEmissiveColor);
    cosmeticMats.lanternCage.color.setHex(appearance.brassTintColor);
    cosmeticMats.pulseRing.color.setHex(heroDef.defaultColors.toolEmissiveColor);

    const auraColors: Record<WayfinderAppearance['auraStyle'], number> = {
      none: 0x7efcf0,
      dawnfire: 0xffd76b,
      sporeleaf: 0x78f58d,
      tidal_droplet: 0x47f2eb,
      cinder_orbit: 0xff7024,
      starfall: 0x99baff,
      eternal: 0x7efcf0,
    };
    cosmeticMats.eternalMote.color.setHex(auraColors[appearance.auraStyle] ?? 0x7efcf0);

    if (lanternLightRef.current) {
      lanternLightRef.current.color.setHex(appearance.lanternLightColor);
    }
  }, [appearance, cosmeticMats, heroDef]);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(cosmeticMats).forEach((m) => m.dispose());
    };
  }, [cosmeticMats, geometries]);

  useEffect(() => {
    return onRegisterFrame((dt, elapsed) => {
      const p = playerRef.current;
      const root = rootRef.current;
      const body = bodyRef.current;
      if (!root || !body) return;

      root.position.set(p.x, p.y, p.z);

      // Smooth yaw interpolation
      let angleDiff = p.facingAngle - root.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      root.rotation.y += angleDiff * (1 - Math.exp(-14 * dt));

      const walkSin = Math.sin(p.walkCycle);
      const isZeph = appearance.characterId === 'zeph';
      const hoverBoost = isZeph ? 0.04 + Math.sin(elapsed * 3.0) * 0.025 : 0;
      const walkBob = p.isMoving
        ? Math.abs(walkSin) * 0.08 + hoverBoost
        : Math.sin(elapsed * 2.2) * 0.015 + hoverBoost;
      const interactBow =
        p.interactTimer > 0 ? Math.sin((p.interactTimer / 0.35) * Math.PI) * 0.25 : 0;

      body.position.y = walkBob;
      body.rotation.x = (p.isMoving ? 0.08 : 0) + interactBow;
      const stretchY = p.isMoving
        ? 1 + Math.sin(p.walkCycle * 2) * 0.035
        : 1 + Math.sin(elapsed * 2.2) * 0.015;
      const squashXZ = 1 / Math.sqrt(stretchY);
      const scaleHero = appearance.characterId === 'kael' ? 1.07 : appearance.characterId === 'zeph' ? 0.96 : 1;
      body.scale.set(squashXZ * scaleHero, stretchY * scaleHero, squashXZ * scaleHero);

      if (leftLegRef.current && rightLegRef.current) {
        const legSwing = p.isMoving ? walkSin * 0.42 : 0;
        leftLegRef.current.rotation.x = legSwing;
        rightLegRef.current.rotation.x = -legSwing;
      }

      if (lanternArmRef.current) {
        const armRaise = p.interactTimer > 0 ? -0.65 : 0;
        lanternArmRef.current.rotation.x =
          -0.45 + armRaise + (p.isMoving ? -walkSin * 0.16 : Math.sin(elapsed * 2.4) * 0.05);
      }

      if (offArmRef.current) {
        offArmRef.current.rotation.x = p.isMoving ? walkSin * 0.25 : Math.sin(elapsed * 2.0) * 0.04;
      }

      if (cloakTailRef.current) {
        cloakTailRef.current.rotation.x = p.isMoving ? 0.12 + Math.abs(walkSin) * 0.06 : 0.02;
      }

      if (shadowRef.current) {
        const s = 1 - walkBob * 1.1;
        shadowRef.current.scale.set(s, s, 1);
      }

      if (eternalAuraRef.current) {
        eternalAuraRef.current.rotation.y = elapsed * (appearance.auraStyle === 'starfall' ? 0.65 : 0.95);
        for (let i = 0; i < AURA_MOTE_COUNT; i++) {
          const mote = moteRefs.current[i];
          if (!mote) continue;
          const phase = (i / AURA_MOTE_COUNT) * Math.PI * 2;
          const radius = 0.52 + Math.sin(elapsed * 1.6 + phase) * 0.06;
          mote.position.set(
            Math.cos(phase) * radius,
            0.55 + Math.sin(elapsed * 2.2 + phase * 1.3) * 0.28,
            Math.sin(phase) * radius
          );
          mote.rotation.y = elapsed * 2 + phase;
          mote.rotation.x = elapsed * 1.4;
          const sc = 0.8 + Math.sin(elapsed * 3 + phase) * 0.22;
          mote.scale.setScalar(sc);
        }
      }

      if (pulseRingRef.current) {
        const timer = puzzleStateRef?.current.abilityActiveTimer ?? 0;
        if (timer > 0) {
          const progress = 1 - Math.min(1, timer / 1.5);
          pulseRingRef.current.visible = true;
          const scale = 0.4 + progress * 3.2;
          pulseRingRef.current.scale.set(scale, scale, 1);
          cosmeticMats.pulseRing.opacity = Math.max(0, 0.85 * (1 - progress));
        } else {
          pulseRingRef.current.visible = false;
        }
      }
    });
  }, [appearance.auraStyle, appearance.characterId, cosmeticMats.pulseRing, onRegisterFrame, playerRef, puzzleStateRef]);

  const cid = appearance.characterId;
  const isArmored = cid === 'kael';
  const isSlender = cid === 'neris' || cid === 'zeph';

  return (
    <group ref={rootRef} name={`Hero_${cid}`}>
      {/* Contact Shadow */}
      <mesh
        ref={shadowRef}
        geometry={geometries.shadowGeo}
        material={cosmeticMats.shadow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      />

      {/* [Q] Ability Expanding Radial Pulse Ring */}
      <mesh
        ref={pulseRingRef}
        geometry={geometries.pulseRingGeo}
        material={cosmeticMats.pulseRing}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16, 0]}
        visible={false}
      />

      <group ref={bodyRef}>
        {/* Boots */}
        <mesh
          ref={leftLegRef}
          geometry={geometries.bootGeo}
          material={palette.bronzeDark}
          position={[-0.1, 0.09, 0]}
          castShadow
        />
        <mesh
          ref={rightLegRef}
          geometry={geometries.bootGeo}
          material={palette.bronzeDark}
          position={[0.1, 0.09, 0]}
          castShadow
        />

        {/* Hero Silhouette Body Base */}
        {isArmored ? (
          <>
            <mesh
              geometry={geometries.tunicSlenderGeo}
              material={cosmeticMats.tunic}
              position={[0, 0.44, 0]}
              scale={[1.05, 0.85, 1.05]}
              castShadow
            />
            <mesh
              ref={cloakTailRef}
              geometry={geometries.armorTorsoGeo}
              material={cosmeticMats.cloak}
              position={[0, 0.64, 0]}
              castShadow
            />
            {/* Forge Pauldrons */}
            <mesh
              geometry={geometries.shoulderGeo}
              material={cosmeticMats.lanternCage}
              position={[-0.24, 0.84, 0]}
              rotation={[0, 0, 0.28]}
              castShadow
            />
            <mesh
              geometry={geometries.shoulderGeo}
              material={cosmeticMats.lanternCage}
              position={[0.24, 0.84, 0]}
              rotation={[0, 0, -0.28]}
              castShadow
            />
          </>
        ) : isSlender ? (
          <>
            <mesh
              geometry={geometries.tunicSlenderGeo}
              material={cosmeticMats.tunic}
              position={[0, 0.46, 0]}
              castShadow
            />
            <mesh
              ref={cloakTailRef}
              geometry={geometries.cloakGeo}
              material={cosmeticMats.cloak}
              position={[0, 0.24, -0.02]}
              scale={[0.82, 0.82, 0.86]}
              castShadow
            />
          </>
        ) : (
          <>
            <mesh
              geometry={geometries.cloakGeo}
              material={cosmeticMats.tunic}
              position={[0, 0.12, 0]}
              scale={[0.85, 0.85, 0.85]}
              castShadow
            />
            <mesh
              ref={cloakTailRef}
              geometry={geometries.cloakGeo}
              material={cosmeticMats.cloak}
              position={[0, 0.18, 0]}
              castShadow
              receiveShadow
            />
          </>
        )}

        {/* Scarf / Mantle Collar */}
        <mesh
          geometry={geometries.collarGeo}
          material={cosmeticMats.trim}
          position={[0, 0.86, 0.01]}
          rotation={[Math.PI / 2 - 0.15, 0, 0]}
          castShadow
        />

        {/* Mossweave Clasp Brooch */}
        {(appearance.hasMossBrooch || cid === 'sylvi') && (
          <mesh
            geometry={geometries.crestGeo}
            material={cosmeticMats.lanternCage}
            position={[0.04, 0.82, 0.18]}
            scale={[0.9, 1.25, 0.65]}
          />
        )}

        {/* Celestial Shoulders & Crest */}
        {appearance.hasCelestialTrim && (
          <>
            <mesh
              geometry={geometries.shoulderGeo}
              material={cosmeticMats.trim}
              position={[-0.19, 0.81, 0.01]}
              rotation={[0, 0, 0.35]}
              castShadow
            />
            <mesh
              geometry={geometries.shoulderGeo}
              material={cosmeticMats.trim}
              position={[0.19, 0.81, 0.01]}
              rotation={[0, 0, -0.35]}
              castShadow
            />
            <mesh
              geometry={geometries.crestGeo}
              material={cosmeticMats.trim}
              position={[0, 1.15, 0.18]}
              scale={[0.85, 1.2, 0.65]}
            />
          </>
        )}

        {/* Head & Modular Headwear */}
        <group position={[0, 1.0, 0.02]}>
          <mesh
            geometry={geometries.headGeo}
            material={cosmeticMats.skin}
            position={[0, 0, 0.04]}
            castShadow
          />

          {appearance.headwearStyle === 'hood' && (
            <>
              <mesh
                geometry={geometries.hoodGeo}
                material={cosmeticMats.cloak}
                position={[0, 0.04, -0.02]}
                scale={[1.05, 1.1, 1.12]}
                castShadow
              />
              <mesh
                geometry={geometries.collarGeo}
                material={cosmeticMats.trim}
                position={[0, 0.04, 0.07]}
                rotation={[0.25, 0, 0]}
                scale={[0.88, 0.88, 0.65]}
              />
            </>
          )}

          {appearance.headwearStyle === 'brim_hat' && (
            <group position={[0, 0.14, 0.01]}>
              <mesh geometry={geometries.brimGeo} material={cosmeticMats.cloak} castShadow />
              <mesh geometry={geometries.crownGeo} material={cosmeticMats.cloak} position={[0, 0.12, 0]} castShadow />
              <mesh geometry={geometries.collarGeo} material={cosmeticMats.trim} position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.92, 0.92, 0.5]} />
            </group>
          )}

          {appearance.headwearStyle === 'antlers' && (
            <group position={[0, 0.12, 0.01]}>
              <mesh geometry={geometries.collarGeo} material={cosmeticMats.trim} rotation={[Math.PI / 2, 0, 0]} scale={[0.92, 0.92, 0.45]} />
              <mesh geometry={geometries.hornGeo} material={palette.woodWarm} position={[-0.12, 0.1, 0]} rotation={[0, 0, 0.42]} />
              <mesh geometry={geometries.hornGeo} material={palette.woodWarm} position={[0.12, 0.1, 0]} rotation={[0, 0, -0.42]} />
            </group>
          )}

          {appearance.headwearStyle === 'coral_crown' && (
            <group position={[0, 0.13, 0.02]}>
              <mesh geometry={geometries.collarGeo} material={cosmeticMats.lanternCage} rotation={[Math.PI / 2, 0, 0]} scale={[0.92, 0.92, 0.45]} />
              <mesh geometry={geometries.hornGeo} material={cosmeticMats.trim} position={[0, 0.09, 0.12]} scale={0.9} />
              <mesh geometry={geometries.hornGeo} material={cosmeticMats.trim} position={[-0.1, 0.07, 0.04]} rotation={[0, 0, 0.25]} scale={0.75} />
              <mesh geometry={geometries.hornGeo} material={cosmeticMats.trim} position={[0.1, 0.07, 0.04]} rotation={[0, 0, -0.25]} scale={0.75} />
            </group>
          )}

          {appearance.headwearStyle === 'forge_visor' && (
            <group position={[0, 0.07, 0.02]}>
              <mesh geometry={geometries.hoodGeo} material={cosmeticMats.lanternCage} scale={[0.95, 0.72, 1.0]} position={[0, 0.04, -0.01]} />
              <mesh geometry={geometries.crestGeo} material={cosmeticMats.lanternCore} position={[0, 0.18, 0.08]} scale={[0.8, 1.2, 0.6]} />
            </group>
          )}

          {appearance.headwearStyle === 'halo_diadem' && (
            <mesh
              geometry={geometries.haloGeo}
              material={cosmeticMats.trim}
              position={[0, 0.24, -0.02]}
              rotation={[Math.PI / 2 - 0.22, 0, 0]}
            />
          )}

          {appearance.headwearStyle === 'none' && (
            <mesh
              geometry={geometries.hoodGeo}
              material={cosmeticMats.tunic}
              position={[0, 0.06, -0.04]}
              scale={[0.88, 0.78, 0.9]}
              castShadow
            />
          )}
        </group>

        {/* Modular Backpack Slot */}
        {appearance.backpackStyle !== 'none' && (
          <group position={[0, 0.62, -0.22]} rotation={[0.08, 0, 0]}>
            {appearance.backpackStyle === 'scroll_pack' && (
              <>
                <mesh geometry={geometries.packGeo} material={palette.woodWarm} castShadow />
                <mesh
                  geometry={geometries.bedrollGeo}
                  material={cosmeticMats.trim}
                  position={[0, 0.17, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                  castShadow
                />
                <mesh
                  geometry={geometries.bootGeo}
                  material={cosmeticMats.lanternCage}
                  position={[0, 0.02, -0.075]}
                  scale={[0.7, 0.35, 0.2]}
                />
              </>
            )}
            {appearance.backpackStyle === 'seed_satchel' && (
              <>
                <mesh geometry={geometries.packGeo} material={cosmeticMats.tunic} scale={[1.05, 0.9, 1.1]} castShadow />
                <mesh geometry={geometries.crestGeo} material={palette.foliageLight} position={[0, 0.18, -0.02]} scale={1.3} />
              </>
            )}
            {appearance.backpackStyle === 'mariner_pack' && (
              <>
                <mesh geometry={geometries.tankGeo} material={cosmeticMats.lanternCage} position={[-0.08, 0.02, 0]} castShadow />
                <mesh geometry={geometries.tankGeo} material={cosmeticMats.lanternCage} position={[0.08, 0.02, 0]} castShadow />
                <mesh geometry={geometries.crestGeo} material={cosmeticMats.lanternCore} position={[0, 0.16, 0]} />
              </>
            )}
            {appearance.backpackStyle === 'forge_pack' && (
              <>
                <mesh geometry={geometries.packGeo} material={palette.basaltTop} scale={[1.18, 1.05, 1.15]} castShadow />
                <mesh geometry={geometries.crestGeo} material={cosmeticMats.lanternCore} position={[0, 0.18, 0]} scale={[1.1, 1.3, 1.1]} />
              </>
            )}
            {appearance.backpackStyle === 'wing_glider' && (
              <>
                <mesh geometry={geometries.wingGeo} material={cosmeticMats.trim} position={[-0.24, 0.12, -0.04]} rotation={[0.15, -0.2, 0.42]} castShadow />
                <mesh geometry={geometries.wingGeo} material={cosmeticMats.trim} position={[0.24, 0.12, -0.04]} rotation={[0.15, 0.2, -0.42]} castShadow />
              </>
            )}
          </group>
        )}

        {/* Left Arm */}
        <mesh
          ref={offArmRef}
          geometry={geometries.armGeo}
          material={cosmeticMats.cloak}
          position={[-0.23, 0.65, 0.04]}
          rotation={[0.18, 0, 0.16]}
          castShadow
        />

        {/* Right Arm + Hero Signature Tool / Lantern */}
        <group ref={lanternArmRef} position={[0.24, 0.76, 0.08]}>
          <mesh
            geometry={geometries.armGeo}
            material={cosmeticMats.cloak}
            position={[0, -0.1, 0.06]}
            rotation={[0.4, 0, -0.18]}
            castShadow
          />

          {(cid === 'sylvi' || cid === 'kael') && (
            <mesh
              geometry={geometries.staffGeo}
              material={cid === 'sylvi' ? palette.woodWarm : cosmeticMats.lanternCage}
              position={[0.04, -0.02, 0.22]}
              rotation={[0.25, 0, 0]}
              castShadow
            />
          )}

          <group position={[0.04, cid === 'sylvi' || cid === 'kael' ? 0.38 : -0.22, cid === 'sylvi' || cid === 'kael' ? 0.32 : 0.22]}>
            <mesh
              geometry={geometries.lanternCapGeo}
              material={cosmeticMats.lanternCage}
              position={[0, 0.07, 0]}
            />
            <mesh geometry={geometries.lanternCoreGeo} material={cosmeticMats.lanternCore} />
            <mesh
              geometry={geometries.lanternCapGeo}
              material={cosmeticMats.lanternCage}
              position={[0, -0.07, 0]}
              rotation={[Math.PI, 0, 0]}
            />
            {!isSoftwareGl && (
              <pointLight
                ref={lanternLightRef}
                color={appearance.lanternLightColor}
                intensity={1.15}
                distance={4.5}
                decay={2}
              />
            )}
          </group>
        </group>
      </group>

      {/* Orbital Aura Motes */}
      {appearance.hasEternalAura && (
        <group ref={eternalAuraRef}>
          {Array.from({ length: AURA_MOTE_COUNT }).map((_, i) => (
            <mesh
              key={i}
              ref={(el) => {
                moteRefs.current[i] = el;
              }}
              geometry={geometries.moteGeo}
              material={cosmeticMats.eternalMote}
            />
          ))}
        </group>
      )}
    </group>
  );
};
