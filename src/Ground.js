import React, { useEffect, forwardRef  } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { LinearEncoding, RepeatWrapping, TextureLoader } from "three";

export const Ground = forwardRef((props, ref) => {
  // thanks to https://polyhaven.com/a/rough_plasterbrick_05 !
  const [roughness, normal] = useLoader(TextureLoader, [
    process.env.PUBLIC_URL + "textures/terrain-roughness.jpg",
    process.env.PUBLIC_URL + "textures/terrain-normal.jpg",
  ]);

  useEffect(() => {
    [normal, roughness].forEach((t) => {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.repeat.set(5, 5);
      t.offset.set(0, 0);
    });

    normal.encoding = LinearEncoding;
  }, [normal, roughness]);

  useFrame((state, delta) => {
    let t = -state.clock.getElapsedTime() * 0.128;
    roughness.offset.set(0, t % 1);
    normal.offset.set(0, t % 1);
  });

  return (
    <mesh ref={ref} rotation-x={-Math.PI * 0.5} position={[0, -0.51, 0]} castShadow receiveShadow transparent>
    <planeGeometry args={[30, 30]} />
    <MeshReflectorMaterial
     envMapIntensity={0}
     normalMap={normal}
      normalScale={[0.15, 0.15]}
      roughnessMap={roughness}
     color={[0, 0, 0]}
     roughness={0.7}
     blur={[0, 0]} // Désactive le flou
     mixBlur={0} // Désactive le mélange de flou
     mixStrength={0} // Réduit la force du mélange
     mixContrast={1}
     resolution={256} // Valeur plus basse pour améliorer les performances
     mirror={0} // Désactive les reflets
     depthScale={0}
     minDepthThreshold={0.9}
     maxDepthThreshold={1}
     depthToBlurRatioBias={0.25}
     reflectorOffset={0}
      opacity={1}  // ✅ On initialise à 1
      transparent={true}  // ✅ Active la transparence
      alphaTest={0.01}  // ✅ Forcer la transparence totale
    />
  </mesh>
  );
})
