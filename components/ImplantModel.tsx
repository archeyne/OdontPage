"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  CylinderGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShadowMaterial,
  Color,
  BufferGeometry,
  BufferAttribute,
} from "three";
import * as THREE from "three";
import { gsap } from "gsap";

interface ImplantModelProps {
  isExploded: boolean;
  isXray: boolean;
  autoRotate: boolean;
}

export default function ImplantModel({
  isExploded,
  isXray,
  autoRotate,
}: ImplantModelProps) {
  const implantGroupRef = useRef<Group>(null);
  const fixtureGroupRef = useRef<Group>(null);
  const abutmentGroupRef = useRef<Group>(null);
  const crownGroupRef = useRef<Group>(null);
  const crownMeshRef = useRef<THREE.Mesh>(null);
  const gumGroupRef = useRef<Group>(null);

  // Configuration
  const config = {
    metalColor: 0xaaaaaa,
    metalRoughness: 0.4,
    metalMetalness: 0.8,
    crownColor: 0xffffff,
    crownRoughness: 0.15,
    crownTransmission: 0.1,
    abutmentColor: 0xffd700, // Gold
    gumColor: 0xdfaea7, // Pinkish gum color
  };

  // Dimensions
  const screwHeight = 8;
  const screwRadius = 1.2;
  const collarHeight = 1.5;
  const abBodyHeight = 2.5;
  const crownHeight = 5.5;
  const crownWidth = 3.2;

  // Materials
  const titaniumMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: config.metalColor,
        roughness: config.metalRoughness,
        metalness: config.metalMetalness,
      }),
    []
  );

  const goldMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: config.abutmentColor,
        roughness: 0.2,
        metalness: 1.0,
      }),
    []
  );

  const ceramicMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: config.crownColor,
        roughness: config.crownRoughness,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        transmission: config.crownTransmission,
        thickness: 1.0,
        side: THREE.DoubleSide,
      }),
    []
  );

  const xRayMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.8,
        opacity: 0.3,
        transparent: true,
        roughness: 0.1,
        side: THREE.DoubleSide,
      }),
    []
  );

  const gumMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: config.gumColor,
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.4, // Semi-transparent to see the screw inside
        thickness: 2.0,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Thread geometry creation
  const threadGeometry = useMemo(() => {
    const points: Vector3[] = [];
    const turns = 10;
    const height = screwHeight - 1;
    const radius = screwRadius;
    const res = 100;

    for (let i = 0; i <= res; i++) {
      const t = i / res;
      const angle = t * Math.PI * 2 * turns;
      const y = t * height + 0.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new Vector3(x, y, z));
    }

    const curve = new CatmullRomCurve3(points);
    return new TubeGeometry(curve, 200, 0.15, 5, false);
  }, []);

  // Crown geometry with procedural molar shape
  const crownGeometry = useMemo(() => {
    const geo = new CylinderGeometry(
      crownWidth * 0.85,
      crownWidth * 0.55,
      crownHeight,
      128,
      40,
      false
    );

    // Center geometry vertically
    geo.translate(0, crownHeight / 2, 0);

    const posAttribute = geo.attributes.position;
    const vertex = new Vector3();

    for (let i = 0; i < posAttribute.count; i++) {
      vertex.fromBufferAttribute(posAttribute, i);

      const angle = Math.atan2(vertex.z, vertex.x);
      const radiusXZ = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
      const yRatio = vertex.y / crownHeight;

      // Square profile (molars aren't perfect circles)
      const squareFactor = Math.cos(angle * 4);
      const squareMorph = 1.0 + squareFactor * 0.08 * yRatio;

      // Anatomical bulge (widest at contact point ~2/3 up)
      const bulge = Math.sin(yRatio * Math.PI * 0.8) * 0.35;
      const widthMultiplier = 1.0 + bulge;

      vertex.x *= widthMultiplier * squareMorph;
      vertex.z *= widthMultiplier * squareMorph;

      // Occlusal surface (chewing cusps)
      if (yRatio > 0.85) {
        const distRatio = radiusXZ / (crownWidth * 0.85);
        const cuspHeight = (Math.cos(angle * 4) + 1) * 0.5;
        const fossaProfile = Math.pow(distRatio, 2.5);
        const detailHeight =
          cuspHeight * 0.6 * distRatio - 0.4 * (1.0 - fossaProfile);

        vertex.y += detailHeight;
        vertex.x *= 0.95;
        vertex.z *= 0.95;
      }

      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const baseAbutmentY = screwHeight;
  const baseCrownY = screwHeight + collarHeight + 0.2;

  // Assembly Animation Sequence
  useEffect(() => {
    if (
      !fixtureGroupRef.current ||
      !abutmentGroupRef.current ||
      !crownGroupRef.current ||
      !gumGroupRef.current
    )
      return;

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // Initial states (Hidden/Exploded)
    // Gum: Scale 0 -> 1
    // Fixture: High up + Rotated
    // Abutment: Higher up
    // Crown: Highest up

    // Reset positions
    gsap.set(gumGroupRef.current.scale, { x: 0, y: 0, z: 0 });

    // Fixture starts high and rotated
    gsap.set(fixtureGroupRef.current.position, { y: 20 });
    gsap.set(fixtureGroupRef.current.rotation, { y: 0 });

    // Abutment starts high
    gsap.set(abutmentGroupRef.current.position, { y: 30 });

    // Crown starts high
    gsap.set(crownGroupRef.current.position, { y: 40 });

    // Animation Sequence

    // 1. Gum appears (pops in)
    tl.to(gumGroupRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });

    // 2. Fixture screws in
    tl.to(
      fixtureGroupRef.current.position,
      {
        y: 0,
        duration: 2,
        ease: "power2.out",
      },
      "-=0.5"
    ).to(
      fixtureGroupRef.current.rotation,
      {
        y: Math.PI * 4, // 2 full rotations
        duration: 2,
        ease: "power2.out",
      },
      "<" // Start with position
    );

    // 3. Abutment places down
    tl.to(
      abutmentGroupRef.current.position,
      {
        y: baseAbutmentY,
        duration: 1.5,
        ease: "bounce.out",
      },
      "-=0.2"
    );

    // 4. Crown places down
    tl.to(
      crownGroupRef.current.position,
      {
        y: baseCrownY,
        duration: 1.5,
        ease: "bounce.out",
      },
      "-=0.5"
    );

  }, [baseAbutmentY, baseCrownY]); // Run once on mount (or when deps change)

  // Explode animation (Overrides assembly if toggled)
  useEffect(() => {
    if (!abutmentGroupRef.current || !crownGroupRef.current) return;

    if (isExploded) {
      gsap.to(abutmentGroupRef.current.position, {
        y: baseAbutmentY + 3,
        duration: 1.5,
        ease: "cubic.inOut",
      });
      gsap.to(crownGroupRef.current.position, {
        y: baseCrownY + 6,
        duration: 1.5,
        ease: "cubic.inOut",
      });
    } else {
      // Return to assembled state (handled by timeline initially, but this ensures it goes back if exploded)
      // We only want to do this if the initial animation is done. 
      // For simplicity, we just tween back to base positions.
      gsap.to(abutmentGroupRef.current.position, {
        y: baseAbutmentY,
        duration: 1,
        ease: "cubic.inOut",
      });
      gsap.to(crownGroupRef.current.position, {
        y: baseCrownY,
        duration: 1,
        ease: "cubic.inOut",
      });
    }
  }, [isExploded, baseAbutmentY, baseCrownY]);

  // X-Ray material update
  useEffect(() => {
    if (crownMeshRef.current) {
      crownMeshRef.current.material = isXray ? xRayMaterial : ceramicMaterial;
    }
  }, [isXray, xRayMaterial, ceramicMaterial]);

  // Auto rotate and floating animation
  useFrame((state) => {
    if (!implantGroupRef.current) return;

    const time = state.clock.elapsedTime;

    // Auto rotate (handled by OrbitControls, but we can add extra rotation if needed)
    if (autoRotate && !isExploded) {
      // OrbitControls handles auto rotation, but we keep this as backup
    }

    // Subtle floating animation when not exploded
    if (!isExploded) {
      const baseY = 2;
      implantGroupRef.current.position.y = baseY + Math.sin(time) * 0.2;
    } else {
      // Keep position stable when exploded
      implantGroupRef.current.position.y = 2;
    }
  });

  return (
    <>
      <group ref={implantGroupRef} position={[0, -4, 0]}> {/* Lowered the whole group to center it vertically with the gum */}

        {/* Gum / Bone Structure */}
        <group ref={gumGroupRef}>
          {/* Main Gum Block */}
          <mesh position={[0, 3, 0]} receiveShadow>
            <cylinderGeometry args={[6, 6, 8, 32]} />
            <primitive object={gumMaterial} />
          </mesh>
          {/* Cutout for implant (visual only, using transparency) */}
        </group>

        {/* PART 1: The Fixture (Screw) */}
        <group ref={fixtureGroupRef}>
          {/* Core cylinder */}
          <mesh
            castShadow
            receiveShadow
            geometry={new CylinderGeometry(
              screwRadius,
              screwRadius * 0.8,
              screwHeight,
              32
            )}
            position={[0, screwHeight / 2, 0]}
            material={titaniumMaterial}
          />

          {/* Threads (spiral) */}
          <mesh
            castShadow
            receiveShadow
            geometry={threadGeometry}
            material={titaniumMaterial}
          />
        </group>

        {/* PART 2: The Abutment (Connector) */}
        <group ref={abutmentGroupRef} position={[0, baseAbutmentY, 0]}>
          {/* Collar (hex base, simplified to cylinder) */}
          <mesh
            castShadow
            geometry={new CylinderGeometry(
              screwRadius,
              screwRadius,
              collarHeight,
              32
            )}
            position={[0, collarHeight / 2, 0]}
            material={titaniumMaterial}
          />

          {/* Main Abutment Body (Tapered) */}
          <mesh
            castShadow
            geometry={new CylinderGeometry(0.8, screwRadius, abBodyHeight, 32)}
            position={[0, collarHeight + abBodyHeight / 2, 0]}
            material={goldMaterial}
          />
        </group>

        {/* PART 3: The Crown (Tooth) */}
        <group ref={crownGroupRef} position={[0, baseCrownY, 0]}>
          <mesh
            ref={crownMeshRef}
            castShadow
            receiveShadow
            geometry={crownGeometry}
            material={ceramicMaterial}
          />
        </group>
      </group>
    </>
  );
}
