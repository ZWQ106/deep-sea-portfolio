"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Bubbles({ count = 100 }) {
  const mesh = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({ t: Math.random() * 100, factor: 20 + Math.random() * 100, speed: 0.01 + Math.random() / 200, xFactor: -5 + Math.random() * 10, yFactor: -5 + Math.random() * 10, zFactor: -10 + Math.random() * 20, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if(!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const s = Math.cos(t) * 0.5 + 0.5; 
      const dummy = new THREE.Object3D();
      dummy.position.set(
        (particle.mx += (state.mouse.x * 5 - particle.mx) * 0.02) + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my += (state.mouse.y * 5 - particle.my) * 0.02) + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10 - (state.camera.position.y),
        zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.4} />
    </instancedMesh>
  );
}