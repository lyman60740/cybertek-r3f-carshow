import React, { Suspense, useRef, useEffect   } from "react";
import { Canvas, useThree, useFrame   } from "@react-three/fiber";
import * as THREE from "three";
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CubeCamera,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import "./style.css";
import { Boxes } from "./Boxes";
import { Car } from "./Car";
import { Ground } from "./Ground";
import { FloatingGrid } from "./FloatingGrid";
import { Rings } from "./Rings";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);


// 🎥 **CAMERA RIG avec Interpolation**
// 🎥 **CAMERA RIG avec ScrollTrigger et useFrame**
function CameraRig({ groundRef, spotLightRef1, spotLightRef2, spotLightRef3 }) {
  const { camera } = useThree();
  const cameraTarget = useRef(new THREE.Vector3(0, 10, 5)); 
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0)); 
  const logoElements = document.querySelectorAll(".logo-cyb, .logo-alp, .sep")
  const blocTxtElements = document.querySelectorAll(".surTitre span, h2 span")
  const otherTxtElements = document.querySelectorAll(".bloc-txt__p p, .bloc-txt a ")
 
  useEffect(() => {
    console.log(logoElements)
    // ✅ Position initiale (évite la confusion)
    camera.position.set(0, 10, 5);
    
    // 🛠️ Appliquer un quaternion propre dès le début
    const matrix = new THREE.Matrix4().lookAt(camera.position, lookAtTarget.current, new THREE.Vector3(0, 1, 0));
    camera.quaternion.setFromRotationMatrix(matrix);
  }, []);

  useEffect(() => {

    gsap.set(blocTxtElements, {
      yPercent: 100,
    });

    const textAndOtherTl = gsap.timeline({ paused: true });

textAndOtherTl
  .to(blocTxtElements, {
    yPercent: 0,
    stagger: 0.3,
    duration: 0.4,
    ease: "cubic-bezier(.21,.65,.67,1)",
  })
  .to(otherTxtElements, {
    autoAlpha: 1,
    stagger: 0.2,
    duration: 1,
    ease: "cubic-bezier(.21,.65,.67,1)",
  }, "<80%"); // "<" signifie que cette animation démarre en même temps que la précédente
  

    // 📌 Timeline GSAP pour déplacer la caméra en douceur
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".container",
        start: "top top",
        end: "+=3000px", 
        scrub: 2,
        pin: true,
        // markers: true,
        onUpdate: (self) => {
          if (self.progress > 0.75) {
            textAndOtherTl.timeScale(1).play();  // 🔥 Lecture normale
          } else {
            textAndOtherTl.timeScale(1).reverse();  // ⏩ Retour 2x plus rapide
          }
        }      
      }
    });

    // 🔄 Animation fluide de la position
    // tl.to(cameraTarget.current, {
    //   x: -5,
    //   y: 5,
    //   z: 5, // On termine à Z = 5 pour garantir une orientation correcte
    //   ease: "power3.out"
    // });

    // 🔄 Animation fluide du lookAt
    // tl.to(lookAtTarget.current, {
    //   x: 0,
    //   y: 0, // Optionnel : on peut ajuster le focus
    //   z: 0,
    //   ease: "power3.out"
    // }); // 🔄 Lancer en même temps que la position

    if (spotLightRef1.current && spotLightRef2.current) {
      tl.to(
        [spotLightRef2.current, spotLightRef1.current],
        {
          intensity: 1.5, // Les lumières augmentent en intensité
          ease: "linear",
          stagger: 0.1,
        }
      );
    }

    if (logoElements) {
      tl.to(logoElements, {
        opacity: 0,
        y: -20,
        stagger: 0.1, 
        ease: "cubic-bezier(.21,.65,.67,1)",
      },"<80%"); // 🔄 Démarre en même temps que l’animation de la caméra
    }

    tl.to(cameraTarget.current, {
      x: -5,
      y: 0.5,
      z: -2.5, // On termine à Z = 5 pour garantir une orientation correcte
      ease: "linear"
    },"<");


    if (groundRef.current) {
      tl.to(groundRef.current.material, {
        opacity: 0, // ✅ Disparition progressive
        ease: "linear",
        onUpdate: () => {
          groundRef.current.material.needsUpdate = true; // ✅ Forcer le rendu du changement d’opacité
        },
      }, "<"); // 🔄 Démarre en même temps que l’animation de la caméra
    }

    

      if (spotLightRef1.current && spotLightRef2.current) {
        tl.to(
          [spotLightRef2.current, spotLightRef1.current],
          {
            intensity: 0, // Les lumières augmentent en intensité
            ease: "linear",
          },"<"
        );
      }
     
      if (spotLightRef3.current) {
        tl.to([spotLightRef3.current], {
          intensity: .5, // Les lumières augmentent en intensité
            ease: "linear",
        },"<30%");
  
      }
      tl.to({}, {});

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  // 📌 Applique progressivement la position et la rotation
  useFrame(() => {
    camera.position.lerp(cameraTarget.current, 0.1);

    // ✅ LookAt interpolé pour éviter les sauts
    const matrix = new THREE.Matrix4().lookAt(camera.position, lookAtTarget.current, new THREE.Vector3(0, 1, 0));
    camera.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(matrix), 0.1);
    
    // console.log(`📷 Camera Position: x=${camera.position.x.toFixed(3)}, y=${camera.position.y.toFixed(3)}, z=${camera.position.z.toFixed(3)}`);
    // console.log(`🔄 Camera Rotation: x=${camera.rotation.x.toFixed(3)}, y=${camera.rotation.y.toFixed(3)}, z=${camera.rotation.z.toFixed(3)}`);
  });

  return null;
}






function CarShow() {
  const targetRef = useRef();
  const spotLightRef1 = useRef();
  const spotLightRef2 = useRef();
  const spotLightRef3 = useRef();
  const textRef = gsap.utils.toArray('.container img');
  const groundRef = useRef();

  return (
    <>
    

<CameraRig groundRef={groundRef} spotLightRef1={spotLightRef1} 
        spotLightRef2={spotLightRef2}  spotLightRef3={spotLightRef3}/>

      <PerspectiveCamera makeDefault fov={50} position={[0, 10, 1]} />

      <color args={[0, 0, 0]} attach="background" />

      <Car ref={targetRef} position={[0, 0, -5]} rotation={[0, 0, 0]} scale={[1.5, 1.5, 1.5]} />
    

      <spotLight
      ref={spotLightRef1}
         color={[0.09, 0.078, 0.761]} 
        intensity={0}
        angle={0.6}
        penumbra={0.5}
        position={[3, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
      />

<spotLight  
ref={spotLightRef2}
        color={[1, 0.811, 0]}
        intensity={0}
        angle={0.6}
        penumbra={0.5}
        position={[-3, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
/>
<spotLight  
        ref={spotLightRef3}
        color={[1, 1, 1]}
        intensity={0}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, -2]} // Position de la lumière
        castShadow
        shadow-bias={-0.0001}
        target={targetRef.current} // Définit la cible
      />
<object3D  position={[0, 2, 5]} />
<Ground ref={groundRef} />

  {/* <OrbitControls 
        target={[0, 0.35, 0]}
        maxPolarAngle={3.45}
      /> */}
  {/* <CubeCamera resolution={256} frames={Infinity}>
        {(texture) => (
          <>
            <Environment map={texture} />
          </>
        )}
      </CubeCamera> */}

      {/* <FloatingGrid /> */}
      {/* <Boxes /> */}
      {/* <Rings /> */}


    </>
  );
}

function App() {

  useEffect(() => {
    // ✅ Initialisation de Lenis (smooth scroll)
    const lenis = new Lenis({
      duration: 1.5, // ⏳ Ajuste la vitesse du smooth scroll
      smoothWheel: true, // Active le scroll fluide avec la molette
      smoothTouch: true, // Active le scroll fluide sur mobile
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Courbe d'accélération
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ✅ Synchronisation avec ScrollTrigger
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length ? lenis.scrollTo(value, { immediate: true }) : lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    // 📌 Rafraîchir ScrollTrigger après setup
    ScrollTrigger.addEventListener("refresh", () => lenis.scrollTo(lenis.scroll));
    ScrollTrigger.refresh();

    // 🛠️ Supprimer Lenis et les ScrollTriggers à la destruction
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
  
  return (
    <Suspense fallback={null}>
      <Canvas shadows>
        <CarShow />
      </Canvas>
    </Suspense>
  );
}

export default App;
