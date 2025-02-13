import React, { forwardRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

// On définit des valeurs par défaut pour position, rotation et scale
export const Car = forwardRef(({ position = [], rotation = [0, 0, 0], scale = [1.5, 1.5, 1.5] }, ref) => {
  const gltf = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + "models/car/alpine/alpine-car2.glb"
  );

  useEffect(() => {
    // Taguer les roues pour l'animation
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (
          object.name === "wheel_FL" ||
          object.name === "wheel_FR" ||
          object.name === "wheel_RL" ||
          object.name === "wheel_RR"
        ) {
          object.userData.isWheel = true;
        }
      }
    });

    // Appliquer les props pour l'échelle, la position et la rotation
    gltf.scene.scale.set(scale[0], scale[1], scale[2]);
    gltf.scene.position.set(position[0], position[1], position[2]);
    gltf.scene.rotation.set(rotation[0], rotation[1], rotation[2]);
  }, [gltf, position, rotation, scale]);

  useFrame((state, delta) => {
    gltf.scene.traverse((object) => {
      if (object.userData.isWheel) {
        object.rotation.x += delta * 1.8; // Animation des roues
      }
    });
  });

  // Utiliser la ref passée en paramètre
  return <primitive ref={ref} object={gltf.scene} />;
});