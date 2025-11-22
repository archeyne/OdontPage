"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
    Group,
    Vector3,
    MeshStandardMaterial,
    MeshPhysicalMaterial,
    CatmullRomCurve3,
    TubeGeometry,
    BoxGeometry,
    CylinderGeometry,
    Shape,
    ExtrudeGeometry,
} from "three";
import * as THREE from "three";
import { gsap } from "gsap";

export default function OrthoModel() {
    const groupRef = useRef<Group>(null);
    const teethGroupRef = useRef<Group>(null);
    const bracketsGroupRef = useRef<Group>(null);
    const wireRef = useRef<THREE.Mesh>(null);

    // Configuration
    const config = {
        toothColor: 0xffffff,
        bracketColor: 0xaaaaaa, // Metallic
        wireColor: 0xcccccc, // Silver
        gumColor: 0xdfaea7,
    };

    // Generate Dental Arch Positions
    const teethData = useMemo(() => {
        const count = 8; // 8 teeth (4 per side)
        const radius = 5;
        const spread = Math.PI / 2.5; // Arc spread
        const data = [];

        for (let i = 0; i < count; i++) {
            // Map i to angle centered around 0
            const t = i / (count - 1);
            const angle = -spread / 2 + t * spread;

            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius + 1; // Offset to center
            const rotY = angle;

            data.push({ position: new Vector3(x, 0, z), rotation: [0, rotY, 0] });
        }
        return data;
    }, []);

    // Materials
    const toothMaterial = useMemo(
        () =>
            new MeshPhysicalMaterial({
                color: config.toothColor,
                roughness: 0.2,
                metalness: 0.0,
                clearcoat: 0.5,
                transmission: 0.1,
                thickness: 1.0,
            }),
        []
    );

    const bracketMaterial = useMemo(
        () =>
            new MeshStandardMaterial({
                color: config.bracketColor,
                roughness: 0.3,
                metalness: 0.9,
            }),
        []
    );

    const wireMaterial = useMemo(
        () =>
            new MeshStandardMaterial({
                color: config.wireColor,
                roughness: 0.2,
                metalness: 0.8,
            }),
        []
    );

    // Geometries
    const toothGeometry = useMemo(() => {
        // Simple procedural tooth shape (box with rounded corners approx)
        // Using a cylinder for simplicity but scaled
        return new CylinderGeometry(0.6, 0.5, 1.8, 16);
    }, []);

    const bracketGeometry = useMemo(() => {
        return new BoxGeometry(0.3, 0.3, 0.2);
    }, []);

    const wireGeometry = useMemo(() => {
        // Create curve through bracket positions
        const points = teethData.map((t) => {
            // Offset for bracket thickness + tooth radius
            const pos = t.position.clone();
            // Move slightly forward relative to rotation to sit on bracket
            const forward = new Vector3(0, 0, 1).applyEuler(new THREE.Euler(0, t.rotation[1] as number, 0));
            pos.add(forward.multiplyScalar(0.7)); // Tooth radius (0.6) + bracket (0.1)
            return pos;
        });

        const curve = new CatmullRomCurve3(points);
        return new TubeGeometry(curve, 64, 0.04, 8, false);
    }, [teethData]);

    // Animation Sequence
    useEffect(() => {
        if (!teethGroupRef.current || !bracketsGroupRef.current || !wireRef.current) return;

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        // Initial State
        // Teeth: Scale 0
        // Brackets: Scale 0
        // Wire: Opacity 0 / Draw range 0 (if possible, but scale/opacity is easier for standard mesh)

        gsap.set(teethGroupRef.current.children.map(c => c.scale), { x: 0, y: 0, z: 0 });
        gsap.set(bracketsGroupRef.current.children.map(c => c.scale), { x: 0, y: 0, z: 0 });
        gsap.set(wireRef.current.scale, { x: 0, y: 0, z: 0 }); // Hide wire initially

        // 1. Teeth appear (staggered)
        tl.to(teethGroupRef.current.children.map(c => c.scale), {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
        });

        // 2. Brackets appear (staggered)
        tl.to(bracketsGroupRef.current.children.map(c => c.scale), {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "elastic.out(1, 0.5)",
        }, "-=0.2");

        // 3. Wire appears (scales up along path roughly)
        tl.to(wireRef.current.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "power2.inOut"
        });

    }, []);

    // Floating animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Teeth Group */}
            <group ref={teethGroupRef}>
                {teethData.map((t, i) => (
                    <mesh
                        key={`tooth-${i}`}
                        geometry={toothGeometry}
                        material={toothMaterial}
                        position={t.position}
                        rotation={[t.rotation[0] as number, t.rotation[1] as number, t.rotation[2] as number]}
                        castShadow
                        receiveShadow
                    />
                ))}
            </group>

            {/* Brackets Group */}
            <group ref={bracketsGroupRef}>
                {teethData.map((t, i) => {
                    // Calculate bracket position on the facial surface
                    const pos = t.position.clone();
                    const rot = new THREE.Euler(t.rotation[0] as number, t.rotation[1] as number, t.rotation[2] as number);
                    const forward = new Vector3(0, 0, 1).applyEuler(rot);
                    pos.add(forward.multiplyScalar(0.6)); // Move to surface

                    return (
                        <mesh
                            key={`bracket-${i}`}
                            geometry={bracketGeometry}
                            material={bracketMaterial}
                            position={pos}
                            rotation={[t.rotation[0] as number, t.rotation[1] as number, t.rotation[2] as number]}
                            castShadow
                        />
                    );
                })}
            </group>

            {/* Wire */}
            <mesh
                ref={wireRef}
                geometry={wireGeometry}
                material={wireMaterial}
                castShadow
            />
        </group>
    );
}
