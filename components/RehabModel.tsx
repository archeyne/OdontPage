"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
    Group,
    Vector3,
    MeshStandardMaterial,
    CylinderGeometry,
    Color,
} from "three";
import * as THREE from "three";
import { gsap } from "gsap";

export default function RehabModel() {
    const groupRef = useRef<Group>(null);
    const teethRef = useRef<Group>(null);

    // Configuration
    const config = {
        wornColor: new Color(0xddccaa), // Yellowish/worn
        restoredColor: new Color(0xffffff), // White/restored
    };

    // Generate Dental Arch Positions (Front 6-8 teeth)
    const teethData = useMemo(() => {
        const count = 8;
        const radius = 5;
        const spread = Math.PI / 2.5;
        const data = [];

        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const angle = -spread / 2 + t * spread;

            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius + 1;
            const rotY = angle;

            // Vary size
            let width = 0.5;
            let height = 1.8;

            // Central Incisors
            if (i === 3 || i === 4) { width = 0.65; height = 2.0; }
            // Lateral Incisors
            else if (i === 2 || i === 5) { width = 0.5; height = 1.7; }
            // Canines
            else if (i === 1 || i === 6) { width = 0.55; height = 1.9; }
            // Premolars
            else { width = 0.5; height = 1.6; }

            data.push({
                position: new Vector3(x, 0, z),
                rotation: [0, rotY, 0],
                scale: [width, 1, width],
                height: height
            });
        }
        return data;
    }, []);

    // Material - Mutable for animation
    const toothMaterial = useMemo(
        () =>
            new MeshStandardMaterial({
                color: config.wornColor,
                roughness: 0.6, // Worn is rougher
                metalness: 0.0,
            }),
        []
    );

    // Geometry generator
    const getToothGeometry = (height: number) => {
        // Pivot point at the bottom so scaling Y grows upwards
        // Cylinder default pivot is center. We need to translate geometry or use a wrapper.
        // Easiest is to translate the geometry vertices up by height/2
        const geo = new CylinderGeometry(0.5, 0.4, height, 32);
        geo.translate(0, height / 2, 0); // Move pivot to bottom
        return geo;
    };

    // Animation Sequence
    useEffect(() => {
        if (!teethRef.current) return;

        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        const teethMeshes = teethRef.current.children.filter(c => (c as THREE.Mesh).isMesh).map(c => c as THREE.Mesh);

        // Initial State: Short and Worn
        // We animate scale.y of the meshes
        // Since we adjusted pivot to bottom, scaling Y works perfectly for "growth"

        // Set initial worn state
        gsap.set(teethMeshes.map(c => c.scale), { y: 0.5 }); // 50% height
        toothMaterial.color.set(config.wornColor);
        toothMaterial.roughness = 0.6;

        // 1. Pause briefly to show worn state
        tl.to({}, { duration: 0.5 });

        // 2. Grow Teeth (Restore Vertical Dimension)
        tl.to(teethMeshes.map(c => c.scale), {
            y: 1,
            duration: 2.5,
            ease: "power2.inOut",
            stagger: {
                from: "center",
                amount: 0.5
            }
        });

        // 3. Restore Material (Whiten and Smooth) - Concurrent with growth
        tl.to(toothMaterial.color, {
            r: config.restoredColor.r,
            g: config.restoredColor.g,
            b: config.restoredColor.b,
            duration: 2.5,
            ease: "power1.inOut"
        }, "<"); // Start with previous

        tl.to(toothMaterial, {
            roughness: 0.2, // Smooth
            duration: 2.5
        }, "<");

    }, [toothMaterial]);

    // Floating animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, -1, 0]}>
            {/* Teeth Group */}
            <group ref={teethRef}>
                {teethData.map((t, i) => (
                    <mesh
                        key={`tooth-${i}`}
                        geometry={getToothGeometry(t.height)}
                        material={toothMaterial}
                        position={t.position}
                        rotation={[t.rotation[0] as number, t.rotation[1] as number, t.rotation[2] as number]}
                        scale={[t.scale[0], 0.5, t.scale[2]]} // Initial scale set here too just in case
                        castShadow
                        receiveShadow
                    />
                ))}
            </group>
        </group>
    );
}
