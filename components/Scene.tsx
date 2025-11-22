"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, IcosahedronGeometry, CylinderGeometry, TorusGeometry, BoxGeometry, Color } from "three";
import * as THREE from "three";
import { gsap } from "gsap";
import ImplantModel from "./ImplantModel";
import OrthoModel from "./OrthoModel";
import RehabModel from "./RehabModel";

interface SceneProps {
  currentSection: "home" | "implant" | "ortho" | "rehab" | "profile";
  implantExploded?: boolean;
  implantXray?: boolean;
  implantAutoRotate?: boolean;
}

export default function Scene({
  currentSection,
  implantExploded = false,
  implantXray = false,
  implantAutoRotate = false,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const enamelMeshRef = useRef<THREE.Mesh>(null);
  const enamelMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const implantGroupRef = useRef<Group>(null);
  const orthoGroupRef = useRef<Group>(null);

  const { scene } = useThree();

  // Mouse interaction state
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX - window.innerWidth / 2) * 0.001;
      mouseRef.current.y = (event.clientY - window.innerHeight / 2) * 0.001;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Lighting setup
  useEffect(() => {
    // Clear existing lights first
    const lightsToRemove: THREE.Light[] = [];
    scene.children.forEach((child) => {
      if (child instanceof THREE.Light) {
        lightsToRemove.push(child);
      }
    });
    lightsToRemove.forEach((light) => scene.remove(light));

    if (currentSection === "implant") {
      // Dark lighting for implant section (like implant.html)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 2);
      mainLight.position.set(5, 10, 7);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.bias = -0.001;
      scene.add(mainLight);

      const rimLight = new THREE.SpotLight(0x4455ff, 5);
      rimLight.position.set(-10, 5, -5);
      rimLight.lookAt(0, 0, 0);
      scene.add(rimLight);

      const fillLight = new THREE.PointLight(0xffaa00, 0.5);
      fillLight.position.set(-5, 0, 5);
      scene.add(fillLight);

      // Dark fog for implant
      scene.fog = new THREE.FogExp2(0x050505, 0.02);

      return () => {
        scene.remove(ambientLight);
        scene.remove(mainLight);
        scene.remove(rimLight);
        scene.remove(fillLight);
        scene.fog = null;
      };
    } else {
      // Light lighting for other sections
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const spotLight = new THREE.SpotLight(0xffffff, 1);
      spotLight.position.set(10, 20, 10);
      spotLight.angle = Math.PI / 6;
      spotLight.penumbra = 0.5;
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      scene.add(spotLight);

      const rimLight = new THREE.DirectionalLight(0xd4af37, 1.5);
      rimLight.position.set(-5, 0, -5);
      scene.add(rimLight);

      const fillLight = new THREE.PointLight(0xe0f2f1, 0.8);
      fillLight.position.set(-10, 0, 5);
      scene.add(fillLight);

      scene.fog = new THREE.FogExp2(0xffffff, 0.03);

      return () => {
        scene.remove(ambientLight);
        scene.remove(spotLight);
        scene.remove(rimLight);
        scene.remove(fillLight);
        scene.fog = null;
      };
    }
  }, [scene, currentSection]);

  // Section transitions
  useEffect(() => {
    // We only strictly need the groups to be present to animate them.
    // enamelMat might be null if we are in ortho section (where enamel mesh is removed).
    if (!implantGroupRef.current || !orthoGroupRef.current || !groupRef.current) return;

    const enamelMat = enamelMatRef.current;
    const implantGroup = implantGroupRef.current;
    const orthoGroup = orthoGroupRef.current;
    const group = groupRef.current;

    if (currentSection === "implant") {
      // Hide the simple abstract shapes and show detailed implant
      if (enamelMeshRef.current) {
        enamelMeshRef.current.visible = false;
      }
      if (implantGroup) {
        implantGroup.visible = false;
      }

      // Hide Ortho
      gsap.to(orthoGroup.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        onComplete: () => {
          orthoGroup.visible = false;
        },
      });

      // Rotate Camera
      gsap.to(group.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: "power2.inOut",
      });
    } else if (currentSection === "ortho") {
      // Reveal Ortho: Hide enamel, show ortho model
      if (enamelMeshRef.current) {
        enamelMeshRef.current.visible = false;
      }
      orthoGroup.visible = true;

      // Hide Implant
      gsap.to(implantGroup.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        onComplete: () => {
          implantGroup.visible = false;
        },
      });

      // Show Ortho
      gsap.fromTo(
        orthoGroup.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        }
      );

      // Rotate Camera (Face front)
      gsap.to(group.rotation, {
        y: 0,
        duration: 2,
        ease: "power2.inOut",
      });
    } else if (currentSection === "rehab") {
      // Reveal Rehab: Hide enamel (handled by JSX), show RehabModel (handled by JSX)
      if (enamelMeshRef.current) {
        enamelMeshRef.current.visible = false;
      }

      // Hide others
      gsap.to(implantGroup.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        onComplete: () => {
          implantGroup.visible = false;
        },
      });
      gsap.to(orthoGroup.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        onComplete: () => {
          orthoGroup.visible = false;
        },
      });

      // Rotate (Face front)
      gsap.to(group.rotation, {
        y: 0,
        duration: 2,
        ease: "power2.inOut",
      });
    } else {
      // Home OR Profile section logic
      // Reveal Enamel
      if (enamelMat) {
        enamelMat.opacity = 0.3;
        enamelMat.transparent = true;
        if (enamelMeshRef.current) enamelMeshRef.current.visible = true;
      }

      // Hide others
      gsap.to(implantGroup.scale, {
        x: 0, y: 0, z: 0, duration: 0.5,
        onComplete: () => { implantGroup.visible = false; }
      });
      gsap.to(orthoGroup.scale, {
        x: 0, y: 0, z: 0, duration: 0.5,
        onComplete: () => { orthoGroup.visible = false; }
      });

      // Rotate (Face front)
      gsap.to(group.rotation, {
        y: 0,
        duration: 2,
        ease: "power2.inOut",
      });
    }
  }, [currentSection]);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Mouse rotation (smooth interpolation)
    const targetRotationX = mouseRef.current.y * 0.5;
    groupRef.current.rotation.x += 0.05 * (targetRotationX - groupRef.current.rotation.x);

    // Floating effect
    groupRef.current.position.y = Math.sin(time * 0.8) * 0.2;

    // Animate specific parts (only for non-implant sections)
    if (currentSection !== "implant") {
      if (implantGroupRef.current?.visible) {
        implantGroupRef.current.rotation.y += 0.005;
      }
      if (orthoGroupRef.current?.visible) {
        orthoGroupRef.current.rotation.z += 0.002;
        orthoGroupRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Detailed Implant Model (for implant section) */}
      {currentSection === "implant" && (
        <ImplantModel
          isExploded={implantExploded}
          isXray={implantXray}
          autoRotate={implantAutoRotate}
        />
      )}

      {/* The "Enamel" (Abstract Tooth Form) - for home only */}
      {currentSection !== "implant" && currentSection !== "ortho" && currentSection !== "rehab" && (
        <mesh
          ref={enamelMeshRef}
          castShadow
          receiveShadow
          geometry={new IcosahedronGeometry(2.5, 2)}
        >
          <meshPhysicalMaterial
            ref={(ref) => {
              // @ts-ignore
              enamelMatRef.current = ref;
            }}
            color={0xffffff}
            metalness={0.1}
            roughness={0.1}
            transmission={0.1}
            thickness={2.0}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transparent={true}
            opacity={1}
          />
        </mesh>
      )}

      {/* The "Implant" (Internal Structure) - for ortho/rehab transitions */}
      <group ref={implantGroupRef} visible={false} scale={[0, 0, 0]}>
        {/* The post */}
        <mesh castShadow receiveShadow geometry={new CylinderGeometry(0.6, 0.4, 3.5, 32)}>
          <meshStandardMaterial
            color={0xaaaaaa}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>

        {/* The threads */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh
            key={`thread-${i}`}
            castShadow
            geometry={new TorusGeometry(0.5, 0.05, 16, 50)}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, -1 + i * 0.4, 0]}
            scale={[1 - i * 0.1, 1 - i * 0.1, 1]}
          >
            <meshStandardMaterial
              color={0xd4af37}
              metalness={1}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* The "Ortho" (External Structure) */}
      <group ref={orthoGroupRef} visible={false} scale={[0, 0, 0]}>
        <OrthoModel />
      </group>

      {/* The "Rehab" (Veneers) */}
      {currentSection === "rehab" && (
        <group>
          <RehabModel />
        </group>
      )}
    </group>
  );
}
