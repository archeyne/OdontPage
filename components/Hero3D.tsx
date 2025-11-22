"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { gsap } from "gsap";
import Scene from "./Scene";

interface Hero3DProps {
  currentSection: "home" | "implant" | "ortho" | "rehab" | "profile";
  implantExploded?: boolean;
  implantXray?: boolean;
  implantAutoRotate?: boolean;
}

function LoadingFallback() {
  return null; // No loading spinner needed, loader is in page
}

// Camera controller component
function CameraController({
  currentSection,
}: {
  currentSection: "home" | "implant" | "ortho" | "rehab" | "profile";
}) {
  const { camera } = useThree();

  useEffect(() => {
    const targetPosition: { x: number; y: number; z: number } =
      currentSection === "implant"
        ? { x: 20, y: 10, z: 20 } // Further out to see the whole assembly
        : currentSection === "ortho"
          ? { x: 0, y: 5, z: 15 } // Centered and slightly elevated for ortho
          : currentSection === "rehab"
            ? { x: 0, y: 2, z: 10 } // Close up for veneers
            : currentSection === "profile"
              ? { x: -5, y: 2, z: 12 } // Offset for profile
              : { x: 0, y: 0, z: 12 }; // Centered for others

    // Animate position
    gsap.to(camera.position, {
      duration: 2,
      ease: "power2.inOut",
      ...targetPosition,
      onUpdate: () => {
        // Ensure we keep looking at the center during transition
        if (currentSection !== "implant") {
          camera.lookAt(0, 0, 0);
        }
      }
    });

    // If switching away from implant, ensure we reset the lookAt
    if (currentSection !== "implant") {
      // We can tween the controls target if it exists, or just the camera rotation
      // But since OrbitControls might be unmounting, we just rely on camera.lookAt in the tween update
      // or a separate rotation tween if needed. 
      // Simple lookAt(0,0,0) is usually enough if we are at 0,0,12.
    }

  }, [currentSection, camera]);

  return null;
}

export default function Hero3D({
  currentSection,
  implantExploded = false,
  implantXray = false,
  implantAutoRotate = false,
}: Hero3DProps) {
  const backgroundStyle = "radial-gradient(circle at center, #ffffff 0%, #f3f4f6 100%)";

  const cameraPosition: [number, number, number] =
    currentSection === "implant"
      ? [20, 10, 20]
      : currentSection === "ortho"
        ? [0, 5, 15]
        : currentSection === "rehab"
          ? [0, 2, 10]
          : currentSection === "profile"
            ? [-5, 2, 12]
            : [0, 0, 12];

  return (
    <div
      className="fixed inset-0 w-full h-full"
      style={{
        background: backgroundStyle,
      }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <PerspectiveCamera
            makeDefault
            position={cameraPosition}
            fov={45}
            near={0.1}
            far={1000}
          />
          <CameraController currentSection={currentSection} />
          {currentSection === "implant" && (
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={5}
              maxDistance={30}
              target={[0, 2, 0]}
              autoRotate={implantAutoRotate}
              autoRotateSpeed={1}
            />
          )}
          <Scene
            currentSection={currentSection}
            implantExploded={implantExploded}
            implantXray={implantXray}
            implantAutoRotate={implantAutoRotate}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
