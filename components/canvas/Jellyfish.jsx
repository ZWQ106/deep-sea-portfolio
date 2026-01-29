import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function Jellyfish({ depthY, scale = 1, color = "#00ffff" }) {
  const group = useRef();
  const jellyMesh = useRef();
  const { scene, animations } = useGLTF("/jellyfish.glb");
  const { actions } = useAnimations(animations, group);
  const clone = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh) {
        jellyMesh.current = child;
        child.material = new THREE.MeshStandardMaterial({
          map: child.material.map, color: new THREE.Color(color), transparent: true, opacity: 0.6, roughness: 0.4, metalness: 0.8, emissive: new THREE.Color(color), emissiveIntensity: 2.0, side: THREE.DoubleSide, toneMapped: false
        });
      }
    });
  }, [clone, color]);

  useEffect(() => { if (actions && Object.keys(actions).length > 0) actions[Object.keys(actions)[0]].reset().fadeIn(0.5).setEffectiveTimeScale(0.8).play(); }, [actions]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = depthY + Math.sin(t * 0.5) * 2; group.current.rotation.y += 0.005;
      const s = scale + Math.sin(t * 2.0) * 0.08 * scale; group.current.scale.set(s, s * 0.95, s);
    }
    if (jellyMesh.current) {
      const targetColor = new THREE.Color().setHSL((Math.floor(t * 2.0 / (Math.PI * 2)) * 0.25) % 1, 0.9, 0.6);
      jellyMesh.current.material.emissive.lerp(targetColor, 0.05); jellyMesh.current.material.color.lerp(targetColor, 0.05);
    }
  });

  return <primitive ref={group} object={clone} position={[0, depthY, 0]} scale={scale} />;
}